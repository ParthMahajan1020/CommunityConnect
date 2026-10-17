const express = require('express');

const {
    registerUser,
    loginUser,
    verifyEmailOTP,
    resendEmailOTP,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Registration
router.post('/register', registerUser);

// Email verification
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/resend-email-otp', resendEmailOTP);

// Login
router.post('/login', loginUser);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;