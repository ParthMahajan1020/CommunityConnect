const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const ProfessionalService = require('../models/ProfessionalService');
const ConnectionRequest = require('../models/ConnectionRequest');
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
            totalRequests,
            activeRequests,
            completedRequests,
            rejectedRequests,
            recentLogs
        ] = await Promise.all([
            User.countDocuments({ role: 'PUBLIC_USER' }),
            User.countDocuments({ role: 'BLOOD_BANK' }),
            User.countDocuments({ role: 'HOSPITAL' }),
            User.countDocuments({ role: 'SERVICE_PROVIDER' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'PENDING' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'APPROVED' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'SUSPENDED' }),
            User.countDocuments({ role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] }, organizationStatus: 'REJECTED' }),
            ConnectionRequest.countDocuments(),
            ConnectionRequest.countDocuments({ status: { $in: ['PENDING', 'ACCEPTED'] } }),
            ConnectionRequest.countDocuments({ status: 'COMPLETED' }),
            ConnectionRequest.countDocuments({ status: 'REJECTED' }),
            AuditLog.find().sort({ createdAt: -1 }).limit(8)
        ]);

        const totalPrivateOrganizations = totalBloodBanks + totalHospitals + totalServiceProviders;

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
                totalRequests,
                activeRequests,
                completedRequests,
                rejectedRequests
            },
            recentLogs
        });
    } catch (error) {
        console.error('getOverview error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch administrator metrics.' });
    }
};

// ============================================
// 2. USER MANAGEMENT
// ============================================

const getUsers = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 25 } = req.query;
        const query = { role: 'PUBLIC_USER' };

        if (status && ['ACTIVE', 'SUSPENDED'].includes(status.toUpperCase())) {
            query.accountStatus = status.toUpperCase();
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ name: regex }, { email: regex }, { phone: regex }, { location: regex }];
        }

        const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const [users, total] = await Promise.all([
            User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
            User.countDocuments(query)
        ]);

        return res.status(200).json({
            total,
            page: parseInt(page, 10),
            totalPages: Math.ceil(total / parseInt(limit, 10)),
            users
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
        const { status, type, search } = req.query;
        const query = { role: { $in: ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'] } };

        if (status && ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status.toUpperCase())) {
            query.organizationStatus = status.toUpperCase();
        }

        if (type && ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'].includes(type.toUpperCase())) {
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

        const organizations = await User.find(query).select('-password').sort({ createdAt: -1 });

        return res.status(200).json({
            count: organizations.length,
            organizations
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
        }).select('-password').sort({ organizationStatus: 1, createdAt: -1 });

        const orgIds = organizations.map(o => o._id);
        const inventories = await BloodInventory.find({ organizationId: { $in: orgIds } });
        const inventoryMap = {};
        for (const inv of inventories) {
            inventoryMap[inv.organizationId.toString()] = {
                units: inv.units,
                lastUpdated: inv.lastUpdated
            };
        }

        const combined = organizations.map(org => ({
            ...org.toObject(),
            inventory: inventoryMap[org._id.toString()]?.units || {},
            inventoryLastUpdated: inventoryMap[org._id.toString()]?.lastUpdated || null
        }));

        return res.status(200).json({ count: combined.length, bloodOrganizations: combined });
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
        const services = await ProfessionalService.find()
            .populate('organizationId', 'name organizationName email phone location organizationStatus')
            .sort({ createdAt: -1 });

        return res.status(200).json({ count: services.length, services });
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
// 6. REQUEST ECOSYSTEM
// ============================================

const getPlatformRequests = async (req, res) => {
    try {
        const { type, status } = req.query;
        const query = {};

        if (type && ['BLOOD', 'SERVICE', 'JOB'].includes(type.toUpperCase())) {
            query.type = type.toUpperCase();
        }

        if (status && ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'INCOMPLETED'].includes(status.toUpperCase())) {
            query.status = status.toUpperCase();
        }

        const requests = await ConnectionRequest.find(query)
            .populate('requesterId', 'name email phone location')
            .populate('providerId', 'name organizationName email phone location role')
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({ count: requests.length, requests });
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
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

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
        const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(150);
        return res.status(200).json({ count: logs.length, logs });
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
