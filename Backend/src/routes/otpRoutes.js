const express = require("express");

const {
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP
} = require("../controllers/otpController");

const router = express.Router();

router.post("/send-email", sendEmailOTP);
router.post("/verify-email", verifyEmailOTP);

router.post("/send-phone", sendPhoneOTP);
router.post("/verify-phone", verifyPhoneOTP);

module.exports = router;