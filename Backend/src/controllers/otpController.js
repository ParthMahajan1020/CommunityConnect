const crypto = require("crypto");
const OTP = require("../models/OTP");
const User = require("../models/User");
const { sendEmailOTPEmail } = require("../services/emailService");

const normalizeEmail = (value) => {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim().toLowerCase();
};

const generateNumericOTP = () => crypto.randomInt(0, 1000000).toString().padStart(6, "0");
const hashOTP = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const OTP_RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN || 60);

const createRegistrationOTP = async ({ email, pendingUser }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
        throw new Error("Email is required for OTP generation.");
    }

    const otp = generateNumericOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await OTP.deleteMany({
        email: normalizedEmail,
        purpose: "registration",
        usedAt: null,
        revokedAt: null
    });

    const otpRecord = await OTP.create({
        email: normalizedEmail,
        purpose: "registration",
        otpHash: hashOTP(otp),
        pendingUser,
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        expiresAt,
        usedAt: null,
        revokedAt: null
    });

    return {
        otp,
        otpRecord,
        expiresAt,
        expiresInMinutes: OTP_EXPIRY_MINUTES
    };
};

const sendEmailOTP = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email || req.body.emailAddress);
        const pendingUser = req.body.pendingUser;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        if (!pendingUser || !pendingUser.name || !pendingUser.phone || !pendingUser.location || !pendingUser.password) {
            return res.status(400).json({ message: "Registration details are required to send a verification code." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "This email is already registered." });
        }

        const recentOtp = await OTP.findOne({ email, purpose: "registration" }).sort({ createdAt: -1 });
        if (recentOtp && !recentOtp.usedAt && !recentOtp.revokedAt) {
            const cooldownMs = OTP_RESEND_COOLDOWN_SECONDS * 1000;
            const remaining = Math.ceil((new Date(recentOtp.createdAt).getTime() + cooldownMs - Date.now()) / 1000);
            if (remaining > 0) {
                return res.status(429).json({
                    message: `Please wait ${remaining} seconds before requesting a new verification code.`
                });
            }
        }

        const { otp } = await createRegistrationOTP({ email, pendingUser });
        await sendEmailOTPEmail({
            to: email,
            otp,
            expiryMinutes: OTP_EXPIRY_MINUTES
        });

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email.",
            email,
            expiresInMinutes: OTP_EXPIRY_MINUTES
        });
    } catch (error) {
        console.error("Send email OTP error:", error.message);
        return res.status(500).json({
            message: "Unable to send the verification code right now."
        });
    }
};

const resendEmailOTP = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email || req.body.emailAddress);
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const recentOtp = await OTP.findOne({ email, purpose: "registration" }).sort({ createdAt: -1 });
        if (recentOtp && !recentOtp.usedAt && !recentOtp.revokedAt) {
            const latestCreatedAt = new Date(recentOtp.createdAt).getTime();
            const remainingSeconds = Math.ceil((latestCreatedAt + OTP_RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
            if (remainingSeconds > 0) {
                return res.status(429).json({
                    message: `Please wait ${remainingSeconds} seconds before requesting a new verification code.`
                });
            }
        }

        if (!recentOtp || !recentOtp.pendingUser) {
            return res.status(404).json({
                message: "No active registration requires a new verification code. Please register again."
            });
        }

        const { otp } = await createRegistrationOTP({
            email,
            pendingUser: recentOtp.pendingUser
        });

        await sendEmailOTPEmail({
            to: email,
            otp,
            expiryMinutes: OTP_EXPIRY_MINUTES
        });

        return res.status(200).json({
            success: true,
            message: "A new verification code has been sent.",
            email,
            expiresInMinutes: OTP_EXPIRY_MINUTES
        });
    } catch (error) {
        console.error("Resend email OTP error:", error.message);
        return res.status(500).json({
            message: "Unable to resend the verification code right now."
        });
    }
};

const verifyEmailOTP = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email || req.body.emailAddress);
        const otpInput = String(req.body.otp || "").trim();

        if (!email || !otpInput) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const otpRecord = await OTP.findOne({ email, purpose: "registration" }).sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(404).json({ message: "No verification request was found for this email." });
        }

        if (otpRecord.usedAt || otpRecord.revokedAt) {
            return res.status(410).json({ message: "This verification code is no longer valid. Request a new one." });
        }

        if (new Date(otpRecord.expiresAt) < new Date()) {
            otpRecord.revokedAt = new Date();
            await otpRecord.save();
            return res.status(410).json({ message: "This verification code has expired. Request a new one." });
        }

        if (otpRecord.attempts >= otpRecord.maxAttempts) {
            otpRecord.revokedAt = new Date();
            await otpRecord.save();
            return res.status(429).json({ message: "Too many failed attempts. Please request a new verification code." });
        }

        const hashedInput = hashOTP(otpInput);
        if (hashedInput !== otpRecord.otpHash) {
            otpRecord.attempts += 1;
            const remainingAttempts = Math.max(otpRecord.maxAttempts - otpRecord.attempts, 0);
            if (otpRecord.attempts >= otpRecord.maxAttempts) {
                otpRecord.revokedAt = new Date();
            }
            await otpRecord.save();
            return res.status(401).json({
                message: remainingAttempts > 0
                    ? `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
                    : "Too many failed attempts. Please request a new verification code."
            });
        }

        const pendingUser = otpRecord.pendingUser;
        if (!pendingUser || !pendingUser.name || !pendingUser.password || !pendingUser.location || !pendingUser.phone) {
            return res.status(500).json({ message: "Unable to complete registration. Please try again." });
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: pendingUser.name,
                email: pendingUser.email || email,
                phone: pendingUser.phone,
                location: pendingUser.location,
                password: pendingUser.password,
                emailVerified: true
            });
        } else {
            user.emailVerified = true;
            if (!user.password) {
                user.password = pendingUser.password;
            }
            await user.save();
        }

        otpRecord.usedAt = new Date();
        otpRecord.verifiedAt = new Date();
        otpRecord.revokedAt = otpRecord.revokedAt || new Date();
        await otpRecord.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        console.error("Verify email OTP error:", error.message);
        return res.status(500).json({
            message: "Unable to verify the OTP right now."
        });
    }
};

const sendPhoneOTP = async (req, res) => {
    return res.status(400).json({
        success: false,
        message: "Phone OTP is not supported in this project. Please use email verification during registration."
    });
};

const verifyPhoneOTP = async (req, res) => {
    return res.status(400).json({
        success: false,
        message: "Phone OTP is not supported in this project. Please use email verification during registration."
    });
};

module.exports = {
    createRegistrationOTP,
    sendEmailOTP,
    resendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP
};
