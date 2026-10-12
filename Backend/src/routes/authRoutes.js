const express = require('express');

const {
    registerUser,
    verifyEmailOtp,
    resendEmailOtp,
    loginUser
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-otp', resendEmailOtp);
router.post('/login', loginUser);

module.exports = router;