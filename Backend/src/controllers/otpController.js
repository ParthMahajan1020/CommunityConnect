const crypto = require("crypto");
const PhoneOTP = require("../models/PhoneOTP");

const OTP = require("../models/OTP");
const { sendOTPEmail } = require("../services/emailService");

const sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp,
            expiresAt
        });

        await sendOTPEmail(email, otp);

        res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("OTP Error:", error);

        res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }
};


const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const otpRecord = await OTP.findOne({
            email,
            otp
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ _id: otpRecord._id });

            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        await OTP.deleteOne({
            _id: otpRecord._id
        });

        res.status(200).json({
            message: "Email verified successfully",
            verified: true
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to verify OTP",
            error: error.message
        });
    }
};


const sendPhoneOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                message: "Phone number is required"
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );

        await PhoneOTP.deleteMany({ phone });

        await PhoneOTP.create({
            phone,
            otp,
            expiresAt
        });

        // Development-only placeholder until an SMS provider is configured.
        if (process.env.NODE_ENV !== "production") {
            console.log(`Phone OTP generated for ${phone}.`);
        }

        res.status(200).json({
            message: "Phone OTP generated successfully"
        });

    } catch (error) {
        console.error("Phone OTP Error:", error);

        res.status(500).json({
            message: "Failed to generate phone OTP",
            error: error.message
        });
    }
};


const verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                message: "Phone number and OTP are required"
            });
        }

        const otpRecord = await PhoneOTP.findOne({
            phone,
            otp
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            await PhoneOTP.deleteOne({
                _id: otpRecord._id
            });

            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        await PhoneOTP.deleteOne({
            _id: otpRecord._id
        });

        res.status(200).json({
            message: "Phone verified successfully",
            verified: true
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to verify phone OTP",
            error: error.message
        });
    }
};

module.exports = {
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP
};
