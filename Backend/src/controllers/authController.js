const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePhone = (value) =>
    /^\+?\d[\d\s()-]{6,19}$/.test(value);

const generateOtp = () =>
    crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) =>
    crypto.createHash('sha256').update(otp).digest('hex');

const getOtpExpiry = () =>
    new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

const getRemainingCooldown = (lastSentAt) => {
    if (!lastSentAt) return 0;

    const elapsedSeconds = Math.floor(
        (Date.now() - new Date(lastSentAt).getTime()) / 1000
    );

    return Math.max(
        0,
        OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds
    );
};

// REGISTER NEW USER
const registerUser = async (req, res) => {
    let createdUser = null;

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

        const otp = generateOtp();
        const otpHash = hashOtp(otp);

        const hashedPassword = await bcrypt.hash(cleanedPassword, 12);

        createdUser = await User.create({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            location: cleanedLocation,
            password: hashedPassword,

            emailVerified: false,
            emailOtpHash: otpHash,
            emailOtpExpiresAt: getOtpExpiry(),
            emailOtpLastSentAt: new Date()
        });

        try {
            await sendVerificationEmail(cleanedEmail, otp);
        } catch (emailError) {
            // Avoid leaving a new, unusable account if delivery fails.
            await User.deleteOne({
                _id: createdUser._id,
                emailVerified: false
            });

            console.error(
                'Registration email delivery failed:',
                emailError.message
            );

            return res.status(502).json({
                message:
                    'We could not send the verification email. Please check your email address or try again later.'
            });
        }

        return res.status(201).json({
            success: true,
            requiresEmailVerification: true,
            email: cleanedEmail,
            message:
                'Account created. Please check your email for the verification code.'
        });
    } catch (error) {
        console.error('Registration error:', error.message);

        // Handle duplicate-key race conditions.
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'This email or phone number is already registered.'
            });
        }

        return res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }
};

// VERIFY EMAIL OTP
const verifyEmailOtp = async (req, res) => {
    try {
        const email =
            typeof req.body?.email === 'string'
                ? req.body.email.trim().toLowerCase()
                : '';

        const otp =
            typeof req.body?.otp === 'string'
                ? req.body.otp.trim()
                : '';

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and verification code are required.'
            });
        }

        if (!validateEmail(email) || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: 'Please enter a valid email and six-digit code.'
            });
        }

        const user = await User.findOne({ email })
            .select('+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts');

        if (!user) {
            return res.status(404).json({
                message: 'Account not found. Please register again.'
            });
        }

        if (user.emailVerified === true) {
            return res.status(200).json({
                success: true,
                message: 'Your email is already verified.'
            });
        }

        if (
            !user.emailOtpHash ||
            !user.emailOtpExpiresAt ||
            user.emailOtpExpiresAt.getTime() <= Date.now()
        ) {
            return res.status(400).json({
                message: 'Your verification code has expired. Please request a new one.'
            });
        }

        const submittedHash = hashOtp(otp);

        const hashesMatch = crypto.timingSafeEqual(
            Buffer.from(submittedHash, 'hex'),
            Buffer.from(user.emailOtpHash, 'hex')
        );

        if (!hashesMatch) {
            user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;

            if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
                user.emailOtpHash = undefined;
                user.emailOtpExpiresAt = undefined;
                user.emailOtpLastSentAt = undefined;
                user.emailOtpAttempts = 0;
            }

            await user.save();

            return res.status(400).json({
                message:
                    user.emailOtpHash
                        ? 'Incorrect verification code. Please try again.'
                        : 'Too many incorrect attempts. Please request a new code.'
            });
        }

        user.emailVerified = true;
        user.emailOtpHash = undefined;
        user.emailOtpExpiresAt = undefined;
        user.emailOtpLastSentAt = undefined;
        user.emailOtpAttempts = 0;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });
    } catch (error) {
        console.error('Email verification error:', error.message);

        return res.status(500).json({
            message: 'Email verification failed. Please try again.'
        });
    }
};

// RESEND EMAIL OTP
const resendEmailOtp = async (req, res) => {
    try {
        const email =
            typeof req.body?.email === 'string'
                ? req.body.email.trim().toLowerCase()
                : '';

        if (!email || !validateEmail(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.'
            });
        }

        const user = await User.findOne({ email })
            .select(
                '+emailOtpHash +emailOtpExpiresAt +emailOtpLastSentAt +emailOtpAttempts'
            );

        if (!user) {
            return res.status(404).json({
                message: 'Account not found. Please register again.'
            });
        }

        if (user.emailVerified === true) {
            return res.status(400).json({
                message: 'This email address is already verified.'
            });
        }

        const remainingSeconds = getRemainingCooldown(
            user.emailOtpLastSentAt
        );

        if (remainingSeconds > 0) {
            return res.status(429).json({
                message: `Please wait ${remainingSeconds} seconds before requesting another code.`,
                retryAfterSeconds: remainingSeconds
            });
        }

        const otp = generateOtp();

        user.emailOtpHash = hashOtp(otp);
        user.emailOtpExpiresAt = getOtpExpiry();
        user.emailOtpLastSentAt = new Date();
        user.emailOtpAttempts = 0;

        await user.save();

        try {
            await sendVerificationEmail(email, otp);
        } catch (emailError) {
            console.error(
                'Resend OTP delivery failed:',
                emailError.message
            );

            // Invalidate the code because delivery was unsuccessful.
            user.emailOtpHash = undefined;
            user.emailOtpExpiresAt = undefined;
            user.emailOtpLastSentAt = undefined;

            await user.save();

            return res.status(502).json({
                message: 'Unable to send the verification code. Please try again later.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'A new verification code has been sent.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error.message);

        return res.status(500).json({
            message: 'Unable to resend the verification code.'
        });
    }
};

// LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        const normalizedEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({
            email: normalizedEmail
        }).select('+emailVerified');

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        /*
         * Backward compatibility:
         * Legacy accounts without an explicitly stored emailVerified
         * field can continue logging in.
         *
         * New accounts are created with emailVerified: false and
         * must complete OTP verification before logging in.
         */
        const storedUser = await User.collection.findOne(
            { _id: user._id },
            { projection: { emailVerified: 1 } }
        );

        if (
            storedUser &&
            storedUser.emailVerified === false
        ) {
            return res.status(403).json({
                success: false,
                requiresEmailVerification: true,
                email: user.email,
                message: 'Please verify your email before logging in.'
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
            message: 'Login successful',
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
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'Login failed. Please try again.'
        });
    }
};

module.exports = {
    registerUser,
    verifyEmailOtp,
    resendEmailOtp,
    loginUser
};