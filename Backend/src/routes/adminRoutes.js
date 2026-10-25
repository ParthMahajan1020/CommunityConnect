const express = require('express');
const {
    authMiddleware,
    requireAdmin
} = require('../middleware/authMiddleware');

const {
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
} = require('../controllers/adminController');

const router = express.Router();

// Strict authorization: JWT required + ADMIN role required
router.use(authMiddleware);
router.use(requireAdmin);

// 1. Overview
router.get('/overview', getOverview);

// 2. User management
router.get('/users', getUsers);
router.patch('/users/:userId/status', updateUserStatus);

// 3. Organization management
router.get('/organizations', getOrganizations);
router.patch('/organizations/:orgId/status', updateOrganizationStatus);

// 4. Blood organizations & inventories
router.get('/blood-organizations', getBloodOrganizations);

// 5. Service listings
router.get('/services', getServiceListings);
router.patch('/services/:serviceId/status', toggleServiceStatus);

// 6. Platform requests
router.get('/requests', getPlatformRequests);

// 7. Feedback & reports
router.get('/feedbacks', getFeedbacks);

// 8. Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
