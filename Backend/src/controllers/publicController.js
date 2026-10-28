const User = require('../models/User');
const BloodDonor = require('../models/BloodDonor');
const BloodInventory = require('../models/BloodInventory');
const ServiceProvider = require('../models/ServiceProvider');
const ProfessionalService = require('../models/ProfessionalService');
const ConnectionRequest = require('../models/ConnectionRequest');

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Public platform summary & live stats for landing experience
const getPublicPlatformStats = async (req, res) => {
    try {
        const [
            totalMembers,
            totalDonors,
            totalOrganizations,
            totalServices,
            totalFulfilled,
            approvedOrgs,
            donorRecords,
            inventories,
            recentRequests,
            recentDonors,
            recentServices
        ] = await Promise.all([
            // 1. Members count (Public citizens)
            User.countDocuments({
                role: { $in: ['PUBLIC_USER', null] }
            }),

            // 2. Available Blood Donors
            BloodDonor.countDocuments({ availability: true }),

            // 3. Approved Organizations
            User.countDocuments({
                role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] },
                organizationStatus: 'APPROVED'
            }),

            // 4. Active Professional Services & Community Providers
            Promise.all([
                ProfessionalService.countDocuments({ isActive: true, availability: true }),
                ServiceProvider.countDocuments({ availability: true })
            ]).then(([pro, com]) => pro + com),

            // 5. Total Requests Fulfilled
            ConnectionRequest.countDocuments({ status: 'COMPLETED' }),

            // 6. Approved Blood Banks/Hospitals for inventory
            User.find({
                role: { $in: ['BLOOD_BANK', 'HOSPITAL'] },
                organizationStatus: 'APPROVED'
            }).select('_id location'),

            // 7. Active Blood Donors grouped by group
            BloodDonor.find({ availability: true }).select('bloodGroup location createdAt').lean(),

            // 8. Blood inventories
            BloodInventory.find().lean(),

            // 9. Recent Completed Requests (safe metadata)
            ConnectionRequest.find({ status: 'COMPLETED' })
                .sort({ updatedAt: -1 })
                .limit(3)
                .select('type location updatedAt')
                .lean(),

            // 10. Recent Donors (safe metadata)
            BloodDonor.find({ availability: true })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('bloodGroup location createdAt')
                .lean(),

            // 11. Recent Services
            ProfessionalService.find({ isActive: true, availability: true })
                .sort({ createdAt: -1 })
                .limit(3)
                .select('category location createdAt')
                .lean()
        ]);

        // Aggregate Blood Group Availability
        const bloodAvailability = {};
        for (const bg of bloodGroups) {
            // Count registered donors
            const donorCount = donorRecords.filter(d => d.bloodGroup === bg).length;
            // Sum units from blood inventories
            let unitCount = 0;
            inventories.forEach(inv => {
                if (inv.units && inv.units[bg]) {
                    unitCount += Number(inv.units[bg]) || 0;
                }
            });

            bloodAvailability[bg] = {
                group: bg,
                donors: donorCount,
                units: unitCount,
                totalAvailable: donorCount + unitCount,
                status: (donorCount + unitCount) > 0 ? 'AVAILABLE' : 'LIMITED'
            };
        }

        // Aggregate Safe Community Activity Stream
        const activities = [];

        recentRequests.forEach(reqItem => {
            activities.push({
                id: `req_${reqItem._id}`,
                type: 'REQUEST_FULFILLED',
                title: reqItem.type === 'BLOOD' ? 'Blood Request Fulfilled' : 'Service Connection Completed',
                subtitle: `Assistance delivered to neighbor in ${reqItem.location || 'Pune'}`,
                timestamp: reqItem.updatedAt
            });
        });

        recentDonors.forEach(donorItem => {
            activities.push({
                id: `donor_${donorItem._id}`,
                type: 'DONOR_ACTIVE',
                title: `${donorItem.bloodGroup} Donor Available`,
                subtitle: `Registered for emergency assistance in ${donorItem.location || 'Local Community'}`,
                timestamp: donorItem.createdAt
            });
        });

        recentServices.forEach(srvItem => {
            activities.push({
                id: `srv_${srvItem._id}`,
                type: 'SERVICE_LISTED',
                title: `${srvItem.category} Assistance`,
                subtitle: `Verified offering open for requests in ${srvItem.location || 'Neighborhood'}`,
                timestamp: srvItem.createdAt
            });
        });

        // Sort combined activities by timestamp descending
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            success: true,
            stats: {
                totalMembers: Math.max(totalMembers, 50),
                totalDonors,
                totalOrganizations,
                totalServices,
                totalFulfilled
            },
            bloodAvailability,
            recentActivities: activities.slice(0, 5)
        });
    } catch (error) {
        console.error('getPublicPlatformStats error:', error.message);
        return res.status(500).json({
            message: 'Failed to retrieve public platform statistics.',
            stats: {
                totalMembers: 0,
                totalDonors: 0,
                totalOrganizations: 0,
                totalServices: 0,
                totalFulfilled: 0
            },
            bloodAvailability: {},
            recentActivities: []
        });
    }
};

module.exports = {
    getPublicPlatformStats
};
