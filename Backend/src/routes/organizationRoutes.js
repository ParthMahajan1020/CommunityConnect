const express = require('express');
const {
    authMiddleware,
    requireRole,
    requireApprovedOrg
} = require('../middleware/authMiddleware');

const {
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
} = require('../controllers/organizationController');

const router = express.Router();

// All organization routes require authentication and an organization role
router.use(authMiddleware);
router.use(requireRole('BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'));

// Profile endpoints (available even if PENDING so org can review/update details)
router.get('/profile', getOrganizationProfile);
router.put('/profile', updateOrganizationProfile);
router.get('/stats', getOrganizationStats);

// Operational inventory endpoints (BLOOD_BANK / HOSPITAL only, must be APPROVED)
router.get('/inventory', requireRole('BLOOD_BANK', 'HOSPITAL'), requireApprovedOrg, getInventory);
router.put('/inventory', requireRole('BLOOD_BANK', 'HOSPITAL'), requireApprovedOrg, updateInventory);

// Operational service endpoints (SERVICE_PROVIDER only, must be APPROVED)
router.get('/services', requireRole('SERVICE_PROVIDER'), requireApprovedOrg, getServices);
router.post('/services', requireRole('SERVICE_PROVIDER'), requireApprovedOrg, addService);
router.put('/services/:serviceId', requireRole('SERVICE_PROVIDER'), requireApprovedOrg, updateService);
router.delete('/services/:serviceId', requireRole('SERVICE_PROVIDER'), requireApprovedOrg, deleteService);

// Operational requests endpoints (must be APPROVED)
router.get('/requests', requireApprovedOrg, getOrganizationRequests);
router.patch('/requests/:requestId/status', requireApprovedOrg, updateOrganizationRequestStatus);

module.exports = router;
