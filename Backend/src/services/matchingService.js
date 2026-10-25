const BloodDonor = require("../models/BloodDonor");
const ServiceProvider = require("../models/ServiceProvider");
const ProfessionalService = require("../models/ProfessionalService");
const BloodInventory = require("../models/BloodInventory");
const User = require("../models/User");
const Job = require("../models/Job");
const { getNearbyLocations } = require("../utils/locationHelper");

const compatibleDonorGroups = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],

    "A-": ["A-", "O-"],
    "A+": ["A-", "A+", "O-", "O+"],

    "B-": ["B-", "O-"],
    "B+": ["B-", "B+", "O-", "O+"],

    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": [
        "AB-",
        "AB+",
        "A-",
        "A+",
        "B-",
        "B+",
        "O-",
        "O+"
    ]
};

const findMatches = async (type, requirement, location) => {
    const searchLocation = location.trim();

    // ============================================
    // 1. BLOOD MATCHING (Community Donors + Approved Blood Banks/Hospitals)
    // ============================================
    if (type === "BLOOD") {
        const bloodGroup = requirement.trim().toUpperCase();
        const compatibleGroups = compatibleDonorGroups[bloodGroup];

        if (!compatibleGroups) {
            throw new Error("Invalid blood group");
        }

        // Find community donors
        let donors = await BloodDonor.find({
            bloodGroup: { $in: compatibleGroups },
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone location");

        if (donors.length === 0) {
            const nearby = getNearbyLocations(searchLocation);
            donors = await BloodDonor.find({
                bloodGroup: { $in: compatibleGroups },
                availability: true,
                location: { $in: nearby }
            }).populate("userId", "name email phone location");
        }

        if (donors.length === 0) {
            donors = await BloodDonor.find({
                bloodGroup: { $in: compatibleGroups },
                availability: true
            }).populate("userId", "name email phone location");
        }

        // Also search approved Blood Banks and Hospitals
        const orgQuery = {
            role: { $in: ['BLOOD_BANK', 'HOSPITAL'] },
            organizationStatus: 'APPROVED',
            accountStatus: 'ACTIVE'
        };

        const orgs = await User.find(orgQuery).select('name organizationName phone email location address role');
        const orgMatches = [];

        if (orgs.length > 0) {
            const orgIds = orgs.map(o => o._id);
            const inventories = await BloodInventory.find({ organizationId: { $in: orgIds } });

            for (const org of orgs) {
                const inv = inventories.find(i => i.organizationId.toString() === org._id.toString());
                const availableUnits = inv?.units?.[bloodGroup] || 0;

                // Include organization if it has units or reports availability
                if (availableUnits > 0 || (org.location && org.location.toLowerCase().includes(searchLocation.toLowerCase()))) {
                    orgMatches.push({
                        _id: `org_${org._id}`,
                        userId: org,
                        bloodGroup,
                        location: org.location || org.address,
                        availability: availableUnits > 0,
                        contact: org.phone,
                        isOrganization: true,
                        organizationType: org.role,
                        organizationName: org.organizationName || org.name,
                        availableUnits,
                        verificationStatus: 'VERIFIED'
                    });
                }
            }
        }

        // Combine community donors and organizations
        return [...orgMatches, ...donors];
    }

    // ============================================
    // 2. SERVICE MATCHING (Community Providers + Approved Professional Providers)
    // ============================================
    if (type === "SERVICE") {
        const serviceType = requirement.trim();

        // 1. Community providers
        let providers = await ServiceProvider.find({
            serviceType: {
                $regex: `^${serviceType}$`,
                $options: "i"
            },
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone location");

        if (providers.length === 0) {
            const nearby = getNearbyLocations(searchLocation);
            providers = await ServiceProvider.find({
                serviceType: {
                    $regex: `^${serviceType}$`,
                    $options: "i"
                },
                availability: true,
                location: {
                    $in: nearby
                }
            }).populate("userId", "name email phone location");
        }

        if (providers.length === 0) {
            providers = await ServiceProvider.find({
                serviceType: {
                    $regex: `^${serviceType}$`,
                    $options: "i"
                },
                availability: true
            }).populate("userId", "name email phone location");
        }

        // 2. Approved professional service listings
        const proServices = await ProfessionalService.find({
            category: {
                $regex: `^${serviceType}$`,
                $options: "i"
            },
            availability: true,
            isActive: true
        }).populate({
            path: 'organizationId',
            match: { organizationStatus: 'APPROVED', accountStatus: 'ACTIVE' },
            select: 'name organizationName phone email location role'
        });

        const validProServices = proServices
            .filter(ps => ps.organizationId !== null)
            .map(ps => ({
                _id: ps._id,
                userId: ps.organizationId,
                serviceType: ps.category,
                title: ps.title,
                description: ps.description,
                pricing: ps.pricing,
                pricingType: ps.pricingType,
                location: ps.location,
                availability: ps.availability,
                contact: ps.organizationId.phone,
                isProfessional: true,
                organizationName: ps.organizationId.organizationName || ps.organizationId.name,
                verificationStatus: 'VERIFIED'
            }));

        return [...validProServices, ...providers];
    }

    // ============================================
    // 3. JOB MATCHING (Legacy support)
    // ============================================
    if (type === "JOB") {
        const jobType = requirement.trim();

        let jobs = await Job.find({
            jobType: {
                $regex: `^${jobType}$`,
                $options: "i"
            },
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone location");

        if (jobs.length > 0) return jobs;

        const nearby = getNearbyLocations(searchLocation);
        jobs = await Job.find({
            jobType: {
                $regex: `^${jobType}$`,
                $options: "i"
            },
            availability: true,
            location: { $in: nearby }
        }).populate("userId", "name email phone location");

        return jobs;
    }

    throw new Error("Invalid connection type");
};

module.exports = {
    findMatches
};
