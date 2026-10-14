const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');

const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePhone = (value) =>
    /^\+?\d[\d\s()-]{6,19}$/.test(value);


// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// REGISTER NEW USER
const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            location,
            password
        } = req.body || {};

        const cleanedName =
            typeof name === 'string' ? name.trim() : '';

        const cleanedEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : '';

        const cleanedPhone =
            typeof phone === 'string' ? phone.trim() : '';

        const cleanedLocation =
            typeof location === 'string' ? location.trim() : '';

        const cleanedPassword =
            typeof password === 'string' ? password : '';

        if (
            !cleanedName ||
            !cleanedEmail ||
            !cleanedPhone ||
            !cleanedLocation ||
            !cleanedPassword
        ) {
            return res.status(400).json({
                message: 'All fields are required.'
            });
        }

        if (!validateEmail(cleanedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.'
            });
        }

        if (!validatePhone(cleanedPhone)) {
            return res.status(400).json({
                message: 'Please enter a valid phone number.'
            });
        }

        if (cleanedPassword.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long.'
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: cleanedEmail },
                { phone: cleanedPhone }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'This email or phone number is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(
            cleanedPassword,
            12
        );

        const emailOTP = generateOTP();

        const emailOTPExpires = new Date(
            Date.now() + 10 * 60 * 1000
        );

        const hashedOTP = await bcrypt.hash(
            emailOTP,
            10
        );

        const user = await User.create({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            location: cleanedLocation,
            password: hashedPassword,

            emailVerified: false,

            emailOTP: hashedOTP,
            emailOTPExpires,

            emailOTPAttempts: 0,

            emailOTPResendAt: new Date(
                Date.now() + 30 * 1000
            )
        });

        try {
            await sendOTPEmail(
                user.email,
                emailOTP
            );
        } catch (emailError) {
            await User.findByIdAndDelete(user._id);

            return res.status(500).json({
                message:
                    'Account could not be created because the verification email could not be sent. Please try again.'
            });
        }

        return res.status(201).json({
            success: true,
            email: cleanedEmail,
            requiresEmailVerification: true,
            message:
                'Account created successfully. Please check your email for the verification OTP.'
        });

    } catch (error) {
        console.error(
            'Registration error:',
            error.message
        );

        if (error.code === 11000) {
            return res.status(409).json({
                message:
                    'This email or phone number is already registered.'
            });
        }

        return res.status(500).json({
            message:
                'Registration failed. Please try again.'
        });
    }
};


// VERIFY EMAIL OTP
const verifyEmailOTP = async (req, res) => {
    try {
        const {
            email,
            otp
        } = req.body || {};

        const cleanedEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : '';

        const cleanedOTP =
            typeof otp === 'string'
                ? otp.trim()
                : '';

        if (!cleanedEmail || !cleanedOTP) {
            return res.status(400).json({
                message:
                    'Email and OTP are required.'
            });
        }

        if (!/^\d{6}$/.test(cleanedOTP)) {
            return res.status(400).json({
                message:
                    'OTP must contain exactly 6 digits.'
            });
        }

        const user = await User.findOne({
            email: cleanedEmail
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message:
                    'Email is already verified.'
            });
        }

        if (!user.emailOTP || !user.emailOTPExpires) {
            return res.status(400).json({
                message:
                    'No active OTP found. Please request a new OTP.'
            });
        }

        if (new Date() > user.emailOTPExpires) {
            user.emailOTP = null;
            user.emailOTPExpires = null;
            user.emailOTPAttempts = 0;

            await user.save();

            return res.status(400).json({
                message:
                    'OTP has expired. Please request a new OTP.'
            });
        }

        if (user.emailOTPAttempts >= 5) {
            return res.status(429).json({
                message:
                    'Too many incorrect attempts. Please request a new OTP.'
            });
        }

        const isOTPValid = await bcrypt.compare(
            cleanedOTP,
            user.emailOTP
        );

        if (!isOTPValid) {
            user.emailOTPAttempts += 1;

            await user.save();

            const remainingAttempts =
                Math.max(
                    0,
                    5 - user.emailOTPAttempts
                );

            return res.status(400).json({
                message:
                    remainingAttempts > 0
                        ? `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
                        : 'Invalid OTP. Please request a new OTP.'
            });
        }

        user.emailVerified = true;
        user.emailOTP = null;
        user.emailOTPExpires = null;
        user.emailOTPAttempts = 0;
        user.emailOTPResendAt = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                'Email verified successfully.'
        });

    } catch (error) {
        console.error(
            'Email verification error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Email verification failed. Please try again.'
        });
    }
};


// RESEND EMAIL OTP
const resendEmailOTP = async (req, res) => {
    try {
        const {
            email
        } = req.body || {};

        const cleanedEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : '';

        if (!cleanedEmail) {
            return res.status(400).json({
                message:
                    'Email is required.'
            });
        }

        const user = await User.findOne({
            email: cleanedEmail
        });

        if (!user) {
            return res.status(404).json({
                message:
                    'User not found.'
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                message:
                    'Email is already verified.'
            });
        }

        if (
            user.emailOTPResendAt &&
            new Date() < user.emailOTPResendAt
        ) {
            const remainingSeconds = Math.ceil(
                (user.emailOTPResendAt.getTime() -
                    Date.now()) / 1000
            );

            return res.status(429).json({
                message:
                    `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            });
        }

        const emailOTP = generateOTP();

        const hashedOTP = await bcrypt.hash(
            emailOTP,
            10
        );

        user.emailOTP = hashedOTP;

        user.emailOTPExpires = new Date(
            Date.now() + 10 * 60 * 1000
        );

        user.emailOTPAttempts = 0;

        user.emailOTPResendAt = new Date(
            Date.now() + 30 * 1000
        );

        await user.save();

        try {
            await sendOTPEmail(
                user.email,
                emailOTP
            );
        } catch (emailError) {
            return res.status(500).json({
                message:
                    'Failed to send verification email. Please try again.'
            });
        }

        return res.status(200).json({
            success: true,
            message:
                'A new verification OTP has been sent to your email.',
            expiresIn: 600,
            resendAfter: 30
        });

    } catch (error) {
        console.error(
            'Resend OTP error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Failed to resend OTP. Please try again.'
        });
    }
};


// LOGIN
const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body || {};

        const normalizedEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message:
                    'Email and password are required.'
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message:
                    'Invalid email or password.'
            });
        }

        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message:
                    'Invalid email or password.'
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                message:
                    'Please verify your email before logging in.',
                requiresEmailVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        return res.status(200).json({
            message:
                'Login successful',

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location
            }
        });

    } catch (error) {
        console.error(
            'Login error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Login failed. Please try again.'
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    verifyEmailOTP,
    resendEmailOTP
};