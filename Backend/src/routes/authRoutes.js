const express = require('express');

const {
    registerUser,
    loginUser,
    verifyEmailOTP,
    resendEmailOTP
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/verify-email-otp', verifyEmailOTP);

router.post('/resend-email-otp', resendEmailOTP);

module.exports = router;