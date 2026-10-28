const express = require('express');
const { getPublicPlatformStats } = require('../controllers/publicController');

const router = express.Router();

// GET /api/public/stats - Open public summary for landing experience
router.get('/stats', getPublicPlatformStats);

module.exports = router;
