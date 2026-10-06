const express = require('express');
const {
    registerUser,
    loginUser
} = require('../controllers/authController');
const {
    sendEmailOTP,
    verifyEmailOTP,
    resendEmailOTP
} = require('../controllers/otpController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/resend-email-otp', resendEmailOTP);

module.exports = router;