const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const ProfessionalService = require('../models/ProfessionalService');
const ConnectionRequest = require('../models/ConnectionRequest');
const { sendRequestStatusUpdateEmail } = require('../services/emailService');

const isValidId = (id) => mongoose.isValidObjectId(id);

// ============================================
// PROFILE
// ============================================

const getOrganizationProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Organization profile not found.' });
        }

        return res.status(200).json({
            organization: {
                id: user._id,
                name: user.name,
                organizationName: user.organizationName,
                role: user.role,
                organizationStatus: user.organizationStatus,
                registrationNumber: user.registrationNumber,
                email: user.email,
                phone: user.phone,
                location: user.location,
                address: user.address,
                licenseDocument: user.licenseDocument,
                bio: user.bio,
                accountStatus: user.accountStatus,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('getOrganizationProfile error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch organization profile.' });
    }
};

const updateOrganizationProfile = async (req, res) => {
    try {
        const { name, phone, location, address, bio, licenseDocument } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Organization not found.' });
        }

        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (location) user.location = location.trim();
        if (address) user.address = address.trim();
        if (bio !== undefined) user.bio = bio.trim();
        if (licenseDocument !== undefined) user.licenseDocument = licenseDocument;

        await user.save();

        return res.status(200).json({
            message: 'Organization profile updated successfully.',
            organization: {
                id: user._id,
                name: user.name,
                organizationName: user.organizationName,
                role: user.role,
                organizationStatus: user.organizationStatus,
                email: user.email,
                phone: user.phone,
                location: user.location,
                address: user.address,
                bio: user.bio
            }
        });
    } catch (error) {
        console.error('updateOrganizationProfile error:', error.message);
        return res.status(500).json({ message: 'Failed to update organization profile.' });
    }
};

// ============================================
// BLOOD INVENTORY (BLOOD_BANK & HOSPITAL)
// ============================================

const getInventory = async (req, res) => {
    try {
        let inventory = await BloodInventory.findOne({ organizationId: req.userId });
        if (!inventory) {
            inventory = await BloodInventory.create({
                organizationId: req.userId,
                units: {
                    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
                    'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
                }
            });
        }

        return res.status(200).json({
            inventory: inventory.units,
            lastUpdated: inventory.lastUpdated,
            disclaimer: 'Blood inventory units reflect reporting by registered organizations. Compatibility decisions remain medical professional responsibility.'
        });
    } catch (error) {
        console.error('getInventory error:', error.message);
        return res.status(500).json({ message: 'Failed to load blood inventory.' });
    }
};

const updateInventory = async (req, res) => {
    try {
        const { units } = req.body;
        if (!units || typeof units !== 'object') {
            return res.status(400).json({ message: 'Invalid inventory units payload.' });
        }

        const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const sanitizedUnits = {};

        for (const group of validGroups) {
            const rawVal = units[group];
            const num = Number(rawVal !== undefined ? rawVal : 0);

            if (isNaN(num) || num < 0) {
                return res.status(400).json({
                    message: `Inventory units for ${group} cannot be negative or invalid.`
                });
            }
            sanitizedUnits[group] = Math.floor(num);
        }

        let inventory = await BloodInventory.findOne({ organizationId: req.userId });
        if (!inventory) {
            inventory = new BloodInventory({ organizationId: req.userId });
        }

        inventory.units = sanitizedUnits;
        inventory.lastUpdated = new Date();
        await inventory.save();

        return res.status(200).json({
            message: 'Blood inventory updated successfully.',
            inventory: inventory.units,
            lastUpdated: inventory.lastUpdated
        });
    } catch (error) {
        console.error('updateInventory error:', error.message);
        return res.status(500).json({ message: 'Failed to update inventory.' });
    }
};

// ============================================
// PROFESSIONAL SERVICES (SERVICE_PROVIDER)
// ============================================

const getServices = async (req, res) => {
    try {
        const services = await ProfessionalService.find({
            organizationId: req.userId,
            isActive: true
        }).sort({ createdAt: -1 });

        return res.status(200).json({ count: services.length, services });
    } catch (error) {
        console.error('getServices error:', error.message);
        return res.status(500).json({ message: 'Failed to load services.' });
    }
};

const addService = async (req, res) => {
    try {
        const { title, category, description, pricing, pricingType, location, availability } = req.body;

        if (!title?.trim() || !category?.trim() || !description?.trim() || !location?.trim()) {
            return res.status(400).json({ message: 'Title, category, description, and location are required.' });
        }

        const service = await ProfessionalService.create({
            organizationId: req.userId,
            title: title.trim(),
            category: category.trim(),
            description: description.trim(),
            pricing: Math.max(0, Number(pricing) || 0),
            pricingType: ['Hourly', 'Daily', 'Monthly', 'Fixed'].includes(pricingType) ? pricingType : 'Hourly',
            location: location.trim(),
            availability: availability !== undefined ? Boolean(availability) : true,
            isActive: true
        });

        return res.status(201).json({
            message: 'Professional service listing created.',
            service
        });
    } catch (error) {
        console.error('addService error:', error.message);
        return res.status(500).json({ message: 'Failed to create service listing.' });
    }
};

const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        if (!isValidId(serviceId)) {
            return res.status(400).json({ message: 'Invalid service identifier.' });
        }

        const service = await ProfessionalService.findOne({
            _id: serviceId,
            organizationId: req.userId
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found or unauthorized.' });
        }

        const { title, category, description, pricing, pricingType, location, availability } = req.body;

        if (title !== undefined) service.title = title.trim();
        if (category !== undefined) service.category = category.trim();
        if (description !== undefined) service.description = description.trim();
        if (pricing !== undefined) service.pricing = Math.max(0, Number(pricing) || 0);
        if (pricingType && ['Hourly', 'Daily', 'Monthly', 'Fixed'].includes(pricingType)) {
            service.pricingType = pricingType;
        }
        if (location !== undefined) service.location = location.trim();
        if (availability !== undefined) service.availability = Boolean(availability);

        await service.save();

        return res.status(200).json({
            message: 'Service listing updated successfully.',
            service
        });
    } catch (error) {
        console.error('updateService error:', error.message);
        return res.status(500).json({ message: 'Failed to update service.' });
    }
};

const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        if (!isValidId(serviceId)) {
            return res.status(400).json({ message: 'Invalid service identifier.' });
        }

        const service = await ProfessionalService.findOneAndUpdate(
            { _id: serviceId, organizationId: req.userId },
            { $set: { isActive: false } },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found or unauthorized.' });
        }

        return res.status(200).json({ message: 'Service listing deactivated successfully.' });
    } catch (error) {
        console.error('deleteService error:', error.message);
        return res.status(500).json({ message: 'Failed to deactivate service.' });
    }
};

// ============================================
// INCOMING REQUESTS & STATUS MANAGEMENT
// ============================================

const getOrganizationRequests = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 15 } = req.query;
        const query = { providerId: req.userId };

        if (status && status !== 'ALL' && ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'INCOMPLETED'].includes(status.toUpperCase())) {
            query.status = status.toUpperCase();
        }

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            const matchedRequesters = await User.find({
                $or: [{ name: regex }, { email: regex }, { phone: regex }]
            }).select('_id');
            const requesterIds = matchedRequesters.map(u => u._id);

            query.$or = [
                { description: regex },
                { location: regex },
                { requesterId: { $in: requesterIds } }
            ];
        }

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
        const skip = (pageNum - 1) * limitNum;

        const [requests, total, totalAll, pendingCount, acceptedCount, completedCount, rejectedCount] = await Promise.all([
            ConnectionRequest.find(query)
                .populate('requesterId', 'name email phone location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            ConnectionRequest.countDocuments(query),
            ConnectionRequest.countDocuments({ providerId: req.userId }),
            ConnectionRequest.countDocuments({ providerId: req.userId, status: 'PENDING' }),
            ConnectionRequest.countDocuments({ providerId: req.userId, status: 'ACCEPTED' }),
            ConnectionRequest.countDocuments({ providerId: req.userId, status: 'COMPLETED' }),
            ConnectionRequest.countDocuments({ providerId: req.userId, status: 'REJECTED' })
        ]);

        return res.status(200).json({
            count: requests.length,
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
                rejected: rejectedCount
            }
        });
    } catch (error) {
        console.error('getOrganizationRequests error:', error.message);
        return res.status(500).json({ message: 'Failed to load organization requests.' });
    }
};

const updateOrganizationRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        const allowed = ['ACCEPTED', 'REJECTED', 'COMPLETED'];
        if (!isValidId(requestId) || !allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid request ID or status (must be ACCEPTED, REJECTED, or COMPLETED).' });
        }

        // Action condition: ACCEPT/REJECT requires PENDING; COMPLETE requires ACCEPTED
        const allowedCurrentStatus = status === 'COMPLETED' ? 'ACCEPTED' : 'PENDING';

        const request = await ConnectionRequest.findOne({
            _id: requestId,
            providerId: req.userId,
            status: allowedCurrentStatus
        }).populate('requesterId', 'name email phone');

        if (!request) {
            return res.status(404).json({
                message: `Request not eligible for transition to ${status}. Current status must be ${allowedCurrentStatus}.`
            });
        }

        request.status = status;
        await request.save();

        // Trigger safe email notification
        if (request.requesterId?.email) {
            sendRequestStatusUpdateEmail({
                to: request.requesterId.email,
                requesterName: request.requesterId.name,
                providerName: req.user.organizationName || req.user.name,
                requestType: request.type,
                status
            }).catch(err => console.error('Status email failed:', err.message));
        }

        return res.status(200).json({
            message: `Request marked as ${status.toLowerCase()} successfully.`,
            request
        });
    } catch (error) {
        console.error('updateOrganizationRequestStatus error:', error.message);
        return res.status(500).json({ message: 'Failed to update request status.' });
    }
};

// ============================================
// DASHBOARD STATS
// ============================================

const getOrganizationStats = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ providerId: req.userId });

        const stats = {
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status === 'PENDING').length,
            acceptedRequests: requests.filter(r => r.status === 'ACCEPTED').length,
            completedRequests: requests.filter(r => r.status === 'COMPLETED').length,
            rejectedRequests: requests.filter(r => r.status === 'REJECTED').length
        };

        if (['BLOOD_BANK', 'HOSPITAL'].includes(req.user.role)) {
            const inventory = await BloodInventory.findOne({ organizationId: req.userId });
            let totalUnits = 0;
            if (inventory?.units) {
                for (const count of Object.values(inventory.units)) {
                    totalUnits += Number(count) || 0;
                }
            }
            stats.totalInventoryUnits = totalUnits;
            stats.inventory = inventory ? inventory.units : {};
        }

        if (req.user.role === 'SERVICE_PROVIDER') {
            const activeServicesCount = await ProfessionalService.countDocuments({
                organizationId: req.userId,
                isActive: true
            });
            stats.activeServicesCount = activeServicesCount;
        }

        return res.status(200).json({ stats });
    } catch (error) {
        console.error('getOrganizationStats error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch organization dashboard stats.' });
    }
};

module.exports = {
    getOrganizationProfile,
    updateOrganizationProfile,
    getInventory,
    updateInventory,
    getServices,
    addService,
    updateService,
    deleteService,
    getOrganizationRequests,
    updateOrganizationRequestStatus,
    getOrganizationStats
};
