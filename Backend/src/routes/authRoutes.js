const express = require('express');

const {
    registerUser,
    loginUser,
    verifyEmailOTP,
    resendEmailOTP,
    forgotPassword,
    resetPassword,
    registerPrivate,
    loginPrivate,
    loginAdmin
} = require('../controllers/authController');

const router = express.Router();

// ============================================
// PUBLIC PORTAL AUTH ROUTES
// ============================================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/resend-email-otp', resendEmailOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ============================================
// PRIVATE PORTAL AUTH ROUTES
// ============================================
router.post('/private/register', registerPrivate);
router.post('/private/login', loginPrivate);

// ============================================
// ADMIN PORTAL AUTH ROUTES (NO PUBLIC REGISTER!)
// ============================================
router.post('/admin/login', loginAdmin);

module.exports = router;
