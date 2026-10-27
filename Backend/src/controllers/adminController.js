const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const ProfessionalService = require('../models/ProfessionalService');
const ConnectionRequest = require('../models/ConnectionRequest');
const BloodDonor = require('../models/BloodDonor');
const ServiceProvider = require('../models/ServiceProvider');
const Feedback = require('../models/Feedback');
const AuditLog = require('../models/AuditLog');
const { sendOrganizationStatusUpdateEmail } = require('../services/emailService');

const isValidId = (id) => mongoose.isValidObjectId(id);

// Safe audit logger helper
const logAdminAction = async ({ adminId, adminEmail, action, targetId = null, targetType = 'SYSTEM', details = {} }) => {
    try {
        await AuditLog.create({
            adminId,
            adminEmail,
            action,
            targetId,
            targetType,
            details
        });
    } catch (err) {
        console.error('Audit log failed:', err.message);
    }
};

// ============================================
// 1. OVERVIEW & PLATFORM METRICS
// ============================================

const getOverview = async (req, res) => {
    try {
        const [
            totalPublicUsers,
            totalBloodBanks,
            totalHospitals,
            totalServiceProviders,
            pendingOrganizations,
            approvedOrganizations,
            suspendedOrganizations,
            rejectedOrganizations,
            totalBloodDonors,
            availableBloodDonors,
            totalCommunityProviders,
            activeCommunityProviders,
            totalProfessionalServices,
            totalRequests,
            pendingRequests,
            acceptedRequests,
            completedRequests,
            rejectedRequests,
            incompletedRequests,
            recentLogs,
            pendingOrgsList,
            recentRequestsList,
            inventories
        ] = await Promise.all([
            User.countDocuments({ $or: [{ role: 'PUBLIC_USER' }, { role: null }, { role: { $exists: false } }] }),
            User.countDocuments({ role: 'BLOOD_BANK' }),
            User.countDocuments({ role: 'HOSPITAL' }),
            User.countDocuments({ role: 'SERVICE_PROVIDER' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'PENDING' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'APPROVED' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'SUSPENDED' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'REJECTED' }),
            BloodDonor.countDocuments(),
            BloodDonor.countDocuments({ availability: true }),
            ServiceProvider.countDocuments(),
            ServiceProvider.countDocuments({ availability: true }),
            ProfessionalService.countDocuments({ isActive: true }),
            ConnectionRequest.countDocuments(),
            ConnectionRequest.countDocuments({ status: 'PENDING' }),
            ConnectionRequest.countDocuments({ status: 'ACCEPTED' }),
            ConnectionRequest.countDocuments({ status: 'COMPLETED' }),
            ConnectionRequest.countDocuments({ status: 'REJECTED' }),
            ConnectionRequest.countDocuments({ status: 'INCOMPLETED' }),
            AuditLog.find().sort({ createdAt: -1 }).limit(10),
            User.find({
                role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] },
                organizationStatus: 'PENDING'
            }).select('name organizationName role email phone location registrationNumber createdAt').sort({ createdAt: -1 }).limit(5),
            ConnectionRequest.find()
                .populate('requesterId', 'name email location')
                .populate('providerId', 'name organizationName role location')
                .sort({ createdAt: -1 })
                .limit(6),
            BloodInventory.find()
        ]);

        const totalPrivateOrganizations = totalBloodBanks + totalHospitals + totalServiceProviders;

        // Sum blood inventory units by blood group
        const bloodInventoryByGroup = {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        };
        let totalInventoryUnits = 0;

        for (const inv of inventories) {
            if (inv.units) {
                for (const [grp, count] of Object.entries(inv.units)) {
                    if (bloodInventoryByGroup[grp] !== undefined) {
                        const num = Number(count) || 0;
                        bloodInventoryByGroup[grp] += num;
                        totalInventoryUnits += num;
                    }
                }
            }
        }

        // Monthly registration aggregation for the past 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const registrationTrends = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    publicUsers: {
                        $sum: { $cond: [{ $eq: ["$role", "PUBLIC_USER"] }, 1, 0] }
                    },
                    organizations: {
                        $sum: { $cond: [{ $in: ["$role", ["BLOOD_BANK", "HOSPITAL", "SERVICE_PROVIDER"]] }, 1, 0] }
                    },
                    total: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return res.status(200).json({
            metrics: {
                totalPublicUsers,
                totalPrivateOrganizations,
                totalBloodBanks,
                totalHospitals,
                totalServiceProviders,
                pendingOrganizationApprovals: pendingOrganizations,
                approvedOrganizations,
                suspendedOrganizations,
                rejectedOrganizations,
                totalBloodDonors,
                availableBloodDonors,
                totalCommunityProviders,
                activeCommunityProviders,
                totalProfessionalServices,
                totalRequests,
                pendingRequests,
                activeRequests: pendingRequests + acceptedRequests,
                acceptedRequests,
                completedRequests,
                rejectedRequests,
                incompletedRequests,
                totalInventoryUnits,
                bloodInventoryByGroup
            },
            analytics: {
                registrationTrends,
                requestStatusBreakdown: {
                    PENDING: pendingRequests,
                    ACCEPTED: acceptedRequests,
                    COMPLETED: completedRequests,
                    REJECTED: rejectedRequests,
                    INCOMPLETED: incompletedRequests
                }
            },
            pendingOrgsList,
            recentRequestsList,
            recentLogs
        });
    } catch (error) {
        console.error('getOverview error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch administrator metrics.' });
    }
};

// ============================================
// 2. USER MANAGEMENT (ALL ELIGIBLE USERS + PROFILES)
// ============================================

const getUsers = async (req, res) => {
    try {
        const { search, status, role, page = 1, limit = 15, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const query = {};

        // Role filter
        if (role && role !== 'ALL') {
            if (role === 'DONOR') {
                const donors = await BloodDonor.find().select('userId');
                const donorUserIds = donors.map(d => d.userId);
                query._id = { $in: donorUserIds };
            } else if (role === 'PROVIDER') {
                const providers = await ServiceProvider.find().select('userId');
                const providerUserIds = providers.map(p => p.userId);
                query._id = { $in: providerUserIds };
            } else if (role.toUpperCase() === 'PUBLIC_USER') {
                const publicCondition = [{ role: 'PUBLIC_USER' }, { role: null }, { role: { $exists: false } }];
                if (query.$or) {
                    query.$and = [{ $or: query.$or }, { $or: publicCondition }];
                    delete query.$or;
                } else {
                    query.$or = publicCondition;
                }
            } else if (['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER', 'ADMIN'].includes(role.toUpperCase())) {
                query.role = role.toUpperCase();
            }
        }

        // Status filter
        if (status && status !== 'ALL' && ['ACTIVE', 'SUSPENDED'].includes(status.toUpperCase())) {
            query.accountStatus = status.toUpperCase();
        }

        // Search across name, email, phone, location
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            const searchCondition = [
                { name: regex },
                { email: regex },
                { phone: regex },
                { location: regex }
            ];

            if (query.$or) {
                query.$and = [{ $or: query.$or }, { $or: searchCondition }];
                delete query.$or;
            } else {
                query.$or = searchCondition;
            }
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const [users, total, totalAllUsers, totalPublicUsers, totalDonors, totalProviders, totalOrganizations, totalSuspended] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            User.countDocuments(query),
            User.countDocuments(),
            User.countDocuments({ $or: [{ role: 'PUBLIC_USER' }, { role: null }, { role: { $exists: false } }] }),
            BloodDonor.countDocuments(),
            ServiceProvider.countDocuments(),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] } }),
            User.countDocuments({ accountStatus: 'SUSPENDED' })
        ]);

        // Attach donor and provider profiles if they exist
        const userIds = users.map(u => u._id);
        const [donorProfiles, providerProfiles] = await Promise.all([
            BloodDonor.find({ userId: { $in: userIds } }).lean(),
            ServiceProvider.find({ userId: { $in: userIds } }).lean()
        ]);

        const donorMap = new Map();
        donorProfiles.forEach(d => donorMap.set(d.userId.toString(), d));

        const providerMap = new Map();
        providerProfiles.forEach(p => providerMap.set(p.userId.toString(), p));

        const enrichedUsers = users.map(u => {
            const donor = donorMap.get(u._id.toString());
            const provider = providerMap.get(u._id.toString());
            return {
                ...u,
                role: u.role || 'PUBLIC_USER',
                accountStatus: u.accountStatus || 'ACTIVE',
                donorProfile: donor ? {
                    bloodGroup: donor.bloodGroup,
                    availability: donor.availability,
                    verificationStatus: donor.verificationStatus,
                    hasReportLater: donor.hasReportLater,
                    reportDocument: donor.reportDocument
                } : null,
                providerProfile: provider ? {
                    serviceType: provider.serviceType,
                    rateType: provider.rateType,
                    availability: provider.availability,
                    status: provider.status
                } : null
            };
        });

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            users: enrichedUsers,
            summary: {
                totalAllUsers,
                totalPublicUsers,
                totalDonors,
                totalProviders,
                totalOrganizations,
                totalSuspended
            }
        });
    } catch (error) {
        console.error('getUsers error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch users.' });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { accountStatus } = req.body;

        if (!isValidId(userId) || !['ACTIVE', 'SUSPENDED'].includes(accountStatus)) {
            return res.status(400).json({ message: 'Invalid user ID or status (must be ACTIVE or SUSPENDED).' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'Cannot modify administrator account status through this endpoint.' });
        }

        user.accountStatus = accountStatus;
        await user.save();

        await logAdminAction({
            adminId: req.userId,
            adminEmail: req.user.email,
            action: accountStatus === 'SUSPENDED' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
            targetId: user._id,
            targetType: 'USER',
            details: { userName: user.name, userEmail: user.email, status: accountStatus }
        });

        return res.status(200).json({
            message: `User status successfully updated to ${accountStatus}.`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                accountStatus: user.accountStatus
            }
        });
    } catch (error) {
        console.error('updateUserStatus error:', error.message);
        return res.status(500).json({ message: 'Failed to update user status.' });
    }
};

// ============================================
// 3. ORGANIZATION MANAGEMENT
// ============================================

const getOrganizations = async (req, res) => {
    try {
        const { status, type, search, page = 1, limit = 15, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const orgRoles = ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'];
        const query = { role: { $in: orgRoles } };

        if (status && status !== 'ALL' && ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status.toUpperCase())) {
            query.organizationStatus = status.toUpperCase();
        }

        if (type && type !== 'ALL' && orgRoles.includes(type.toUpperCase())) {
            query.role = type.toUpperCase();
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { organizationName: regex },
                { name: regex },
                { email: regex },
                { registrationNumber: regex },
                { location: regex }
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const [organizations, total, totalOrgs, pendingCount, approvedCount, rejectedCount, suspendedCount, bloodBanksCount, hospitalsCount, serviceProvidersCount] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ [sortBy]: sortDirection })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            User.countDocuments(query),
            User.countDocuments({ role: { $in: orgRoles } }),
            User.countDocuments({ role: { $in: orgRoles }, organizationStatus: 'PENDING' }),
            User.countDocuments({ role: { $in: orgRoles }, organizationStatus: 'APPROVED' }),
            User.countDocuments({ role: { $in: orgRoles }, organizationStatus: 'REJECTED' }),
            User.countDocuments({ role: { $in: orgRoles }, organizationStatus: 'SUSPENDED' }),
            User.countDocuments({ role: 'BLOOD_BANK' }),
            User.countDocuments({ role: 'HOSPITAL' }),
            User.countDocuments({ role: 'SERVICE_PROVIDER' })
        ]);

        // Attach operational counts for organizations
        const orgIds = organizations.map(o => o._id);
        const [inventories, services] = await Promise.all([
            BloodInventory.find({ organizationId: { $in: orgIds } }).lean(),
            ProfessionalService.find({ organizationId: { $in: orgIds } }).lean()
        ]);

        const inventoryMap = new Map();
        inventories.forEach(inv => {
            let totalUnits = 0;
            if (inv.units) {
                for (const u of Object.values(inv.units)) totalUnits += Number(u) || 0;
            }
            inventoryMap.set(inv.organizationId.toString(), { units: inv.units, totalUnits, lastUpdated: inv.lastUpdated });
        });

        const serviceCountMap = new Map();
        services.forEach(s => {
            const key = s.organizationId.toString();
            serviceCountMap.set(key, (serviceCountMap.get(key) || 0) + 1);
        });

        const enrichedOrgs = organizations.map(org => {
            const inv = inventoryMap.get(org._id.toString());
            const srvCount = serviceCountMap.get(org._id.toString()) || 0;
            return {
                ...org,
                inventory: inv ? inv.units : null,
                totalInventoryUnits: inv ? inv.totalUnits : 0,
                inventoryLastUpdated: inv ? inv.lastUpdated : null,
                totalServicesCount: srvCount
            };
        });

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            organizations: enrichedOrgs,
            summary: {
                total: totalOrgs,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                suspended: suspendedCount,
                bloodBanks: bloodBanksCount,
                hospitals: hospitalsCount,
                serviceProviders: serviceProvidersCount
            }
        });
    } catch (error) {
        console.error('getOrganizations error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch organizations.' });
    }
};

const updateOrganizationStatus = async (req, res) => {
    try {
        const { orgId } = req.params;
        const { organizationStatus, notes } = req.body;

        const allowed = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
        if (!isValidId(orgId) || !allowed.includes(organizationStatus)) {
            return res.status(400).json({ message: `Invalid organization ID or status (must be one of: ${allowed.join(', ')}).` });
        }

        const org = await User.findOne({
            _id: orgId,
            role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }
        });

        if (!org) {
            return res.status(404).json({ message: 'Organization account not found.' });
        }

        const previousStatus = org.organizationStatus;
        org.organizationStatus = organizationStatus;
        if (organizationStatus === 'SUSPENDED') {
            org.accountStatus = 'SUSPENDED';
        } else if (organizationStatus === 'APPROVED' && org.accountStatus === 'SUSPENDED') {
            org.accountStatus = 'ACTIVE';
        }
        await org.save();

        // Safe status email notification
        sendOrganizationStatusUpdateEmail({
            to: org.email,
            organizationName: org.organizationName || org.name,
            status: organizationStatus,
            notes
        }).catch(err => console.error('Org status email error:', err.message));

        await logAdminAction({
            adminId: req.userId,
            adminEmail: req.user.email,
            action: `ORGANIZATION_${organizationStatus}`,
            targetId: org._id,
            targetType: 'ORGANIZATION',
            details: {
                organizationName: org.organizationName,
                previousStatus,
                newStatus: organizationStatus,
                notes: notes || ''
            }
        });

        return res.status(200).json({
            message: `Organization status successfully updated to ${organizationStatus}.`,
            organization: {
                id: org._id,
                organizationName: org.organizationName,
                role: org.role,
                organizationStatus: org.organizationStatus
            }
        });
    } catch (error) {
        console.error('updateOrganizationStatus error:', error.message);
        return res.status(500).json({ message: 'Failed to update organization status.' });
    }
};

// ============================================
// 4. BLOOD ORGANIZATIONS & INVENTORIES
// ============================================

const getBloodOrganizations = async (req, res) => {
    try {
        const organizations = await User.find({
            role: { $in: ['BLOOD_BANK', 'HOSPITAL'] }
        }).select('-password').sort({ organizationStatus: 1, createdAt: -1 }).lean();

        const orgIds = organizations.map(o => o._id);
        const inventories = await BloodInventory.find({ organizationId: { $in: orgIds } }).lean();

        const inventoryMap = {};
        const aggregateInventory = {
            'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
            'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
            totalUnits: 0
        };

        for (const inv of inventories) {
            let facilityTotal = 0;
            if (inv.units) {
                for (const [grp, count] of Object.entries(inv.units)) {
                    const num = Number(count) || 0;
                    if (aggregateInventory[grp] !== undefined) {
                        aggregateInventory[grp] += num;
                        aggregateInventory.totalUnits += num;
                    }
                    facilityTotal += num;
                }
            }
            inventoryMap[inv.organizationId.toString()] = {
                units: inv.units,
                totalUnits: facilityTotal,
                lastUpdated: inv.lastUpdated
            };
        }

        const combined = organizations.map(org => ({
            ...org,
            inventory: inventoryMap[org._id.toString()]?.units || {},
            totalUnits: inventoryMap[org._id.toString()]?.totalUnits || 0,
            inventoryLastUpdated: inventoryMap[org._id.toString()]?.lastUpdated || null
        }));

        return res.status(200).json({
            count: combined.length,
            bloodOrganizations: combined,
            aggregateInventory
        });
    } catch (error) {
        console.error('getBloodOrganizations error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch blood organizations.' });
    }
};

// ============================================
// 5. SERVICE MANAGEMENT
// ============================================

const getServiceListings = async (req, res) => {
    try {
        const { category, isActive, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (category && category !== 'ALL') {
            query.category = new RegExp(`^${category.trim()}$`, 'i');
        }

        if (isActive !== undefined && isActive !== 'ALL') {
            query.isActive = isActive === 'true' || isActive === true;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ title: regex }, { description: regex }, { location: regex }, { category: regex }];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const [services, total, totalActive, totalInactive] = await Promise.all([
            ProfessionalService.find(query)
                .populate('organizationId', 'name organizationName email phone location organizationStatus')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            ProfessionalService.countDocuments(query),
            ProfessionalService.countDocuments({ isActive: true }),
            ProfessionalService.countDocuments({ isActive: false })
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            services,
            summary: {
                totalActive,
                totalInactive
            }
        });
    } catch (error) {
        console.error('getServiceListings error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch service listings.' });
    }
};

const toggleServiceStatus = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { isActive } = req.body;

        if (!isValidId(serviceId)) {
            return res.status(400).json({ message: 'Invalid service identifier.' });
        }

        const service = await ProfessionalService.findById(serviceId).populate('organizationId', 'organizationName email');
        if (!service) {
            return res.status(404).json({ message: 'Service not found.' });
        }

        service.isActive = Boolean(isActive);
        await service.save();

        await logAdminAction({
            adminId: req.userId,
            adminEmail: req.user.email,
            action: service.isActive ? 'SERVICE_ACTIVATED' : 'SERVICE_SUSPENDED',
            targetId: service._id,
            targetType: 'SERVICE',
            details: { title: service.title, provider: service.organizationId?.organizationName }
        });

        return res.status(200).json({
            message: `Service listing ${service.isActive ? 'activated' : 'suspended'} successfully.`,
            service
        });
    } catch (error) {
        console.error('toggleServiceStatus error:', error.message);
        return res.status(500).json({ message: 'Failed to update service listing.' });
    }
};

// ============================================
// 6. REQUEST ECOSYSTEM (ACROSS ENTIRE PLATFORM)
// ============================================

const getPlatformRequests = async (req, res) => {
    try {
        const { type, status, search, page = 1, limit = 15, dateFrom, dateTo } = req.query;
        const query = {};

        if (type && type !== 'ALL' && ['BLOOD', 'SERVICE', 'JOB'].includes(type.toUpperCase())) {
            query.type = type.toUpperCase();
        }

        if (status && status !== 'ALL' && ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'INCOMPLETED'].includes(status.toUpperCase())) {
            query.status = status.toUpperCase();
        }

        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            // Find users matching search first to match requester or provider
            const matchedUsers = await User.find({
                $or: [{ name: regex }, { email: regex }, { organizationName: regex }]
            }).select('_id');
            const matchedUserIds = matchedUsers.map(u => u._id);

            query.$or = [
                { description: regex },
                { location: regex },
                { requesterId: { $in: matchedUserIds } },
                { providerId: { $in: matchedUserIds } }
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;

        const [requests, total, totalAll, pendingCount, acceptedCount, completedCount, rejectedCount, incompletedCount, bloodCount, serviceCount] = await Promise.all([
            ConnectionRequest.find(query)
                .populate('requesterId', 'name email phone location role')
                .populate('providerId', 'name organizationName email phone location role address')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            ConnectionRequest.countDocuments(query),
            ConnectionRequest.countDocuments(),
            ConnectionRequest.countDocuments({ status: 'PENDING' }),
            ConnectionRequest.countDocuments({ status: 'ACCEPTED' }),
            ConnectionRequest.countDocuments({ status: 'COMPLETED' }),
            ConnectionRequest.countDocuments({ status: 'REJECTED' }),
            ConnectionRequest.countDocuments({ status: 'INCOMPLETED' }),
            ConnectionRequest.countDocuments({ type: 'BLOOD' }),
            ConnectionRequest.countDocuments({ type: 'SERVICE' })
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            requests,
            summary: {
                total: totalAll,
                pending: pendingCount,
                accepted: acceptedCount,
                completed: completedCount,
                rejected: rejectedCount,
                incompleted: incompletedCount,
                bloodRequests: bloodCount,
                serviceRequests: serviceCount
            }
        });
    } catch (error) {
        console.error('getPlatformRequests error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch platform requests.' });
    }
};

// ============================================
// 7. FEEDBACK & REPORTS
// ============================================

const getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('userId', 'name email phone location')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ count: feedbacks.length, feedbacks });
    } catch (error) {
        console.error('getFeedbacks error:', error.message);
        return res.status(500).json({ message: 'Failed to load feedback records.' });
    }
};

// ============================================
// 8. AUDIT LOGS
// ============================================

const getAuditLogs = async (req, res) => {
    try {
        const { action, targetType, search, page = 1, limit = 20 } = req.query;
        const query = {};

        if (action && action !== 'ALL') {
            query.action = action;
        }

        if (targetType && targetType !== 'ALL') {
            query.targetType = targetType;
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ adminEmail: regex }, { action: regex }];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        const [logs, total] = await Promise.all([
            AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
            AuditLog.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            logs
        });
    } catch (error) {
        console.error('getAuditLogs error:', error.message);
        return res.status(500).json({ message: 'Failed to load audit logs.' });
    }
};

module.exports = {
    getOverview,
    getUsers,
    updateUserStatus,
    getOrganizations,
    updateOrganizationStatus,
    getBloodOrganizations,
    getServiceListings,
    toggleServiceStatus,
    getPlatformRequests,
    getFeedbacks,
    getAuditLogs
};
