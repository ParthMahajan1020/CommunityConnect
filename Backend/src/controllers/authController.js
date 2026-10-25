const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const {
    sendOTPEmail,
    sendOrganizationRegisteredEmail
} = require('../services/emailService');

// ============================================
// VALIDATION HELPERS
// ============================================

const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validatePhone = (value) =>
    /^\+?\d[\d\s()-]{6,19}$/.test(value);

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
};

// ============================================
// PUBLIC USER REGISTRATION
// ============================================

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            location,
            password
        } = req.body || {};

        const cleanedName = typeof name === 'string' ? name.trim() : '';
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const cleanedPhone = typeof phone === 'string' ? phone.trim() : '';
        const cleanedLocation = typeof location === 'string' ? location.trim() : '';
        const cleanedPassword = typeof password === 'string' ? password : '';

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

        const hashedPassword = await bcrypt.hash(cleanedPassword, 12);
        const emailOTP = generateOTP();
        const emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        const hashedOTP = await bcrypt.hash(emailOTP, 10);

        // ALWAYS explicitly set PUBLIC_USER role. Cannot self-promote.
        const user = await User.create({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            location: cleanedLocation,
            password: hashedPassword,
            role: 'PUBLIC_USER',
            accountStatus: 'ACTIVE',
            emailVerified: false,
            emailOTP: hashedOTP,
            emailOTPExpires,
            emailOTPAttempts: 0,
            emailOTPResendAt: new Date(Date.now() + 30 * 1000)
        });

        try {
            await sendOTPEmail(user.email, emailOTP);
        } catch (emailError) {
            console.error('Registration email error:', emailError.message);
            await User.findByIdAndDelete(user._id);

            return res.status(500).json({
                message: 'Account could not be created because the verification email could not be sent. Please try again.'
            });
        }

        return res.status(201).json({
            success: true,
            email: cleanedEmail,
            requiresEmailVerification: true,
            message: 'Account created successfully. Please check your email for the verification OTP.'
        });

    } catch (error) {
        console.error('Registration error:', error.message);
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

// ============================================
// VERIFY EMAIL OTP
// ============================================

const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body || {};
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const cleanedOTP = typeof otp === 'string' ? otp.trim() : '';

        if (!cleanedEmail || !cleanedOTP) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        if (!/^\d{6}$/.test(cleanedOTP)) {
            return res.status(400).json({ message: 'OTP must contain exactly 6 digits.' });
        }

        const user = await User.findOne({ email: cleanedEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        if (!user.emailOTP || !user.emailOTPExpires) {
            return res.status(400).json({ message: 'No active OTP found. Please request a new OTP.' });
        }

        if (new Date() > user.emailOTPExpires) {
            user.emailOTP = null;
            user.emailOTPExpires = null;
            user.emailOTPAttempts = 0;
            await user.save();
            return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
        }

        if (user.emailOTPAttempts >= 5) {
            return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        const isOTPValid = await bcrypt.compare(cleanedOTP, user.emailOTP);
        if (!isOTPValid) {
            user.emailOTPAttempts += 1;
            await user.save();
            const remainingAttempts = Math.max(0, 5 - user.emailOTPAttempts);
            return res.status(400).json({
                message: remainingAttempts > 0
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
            message: 'Email verified successfully.'
        });

    } catch (error) {
        console.error('Email verification error:', error.message);
        return res.status(500).json({ message: 'Email verification failed. Please try again.' });
    }
};

// ============================================
// RESEND EMAIL OTP
// ============================================

const resendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body || {};
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!cleanedEmail) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email: cleanedEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        if (user.emailOTPResendAt && new Date() < user.emailOTPResendAt) {
            const remainingSeconds = Math.ceil((user.emailOTPResendAt.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            });
        }

        const emailOTP = generateOTP();
        const hashedOTP = await bcrypt.hash(emailOTP, 10);

        user.emailOTP = hashedOTP;
        user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.emailOTPAttempts = 0;
        user.emailOTPResendAt = new Date(Date.now() + 30 * 1000);
        await user.save();

        try {
            await sendOTPEmail(user.email, emailOTP);
        } catch (emailError) {
            console.error('Resend email error:', emailError.message);
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        return res.status(200).json({
            success: true,
            message: 'A new verification OTP has been sent to your email.',
            expiresIn: 600,
            resendAfter: 30
        });

    } catch (error) {
        console.error('Resend OTP error:', error.message);
        return res.status(500).json({ message: 'Failed to resend OTP. Please try again.' });
    }
};

// ============================================
// FORGOT & RESET PASSWORD
// ============================================

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!cleanedEmail || !validateEmail(cleanedEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const user = await User.findOne({ email: cleanedEmail });
        if (!user) {
            return res.status(404).json({ message: 'This email is not registered.' });
        }

        if (user.passwordResetOTPResendAt && new Date() < user.passwordResetOTPResendAt) {
            const remainingSeconds = Math.ceil((user.passwordResetOTPResendAt.getTime() - Date.now()) / 1000);
            return res.status(429).json({
                message: `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            });
        }

        const resetOTP = generateOTP();
        const hashedResetOTP = await bcrypt.hash(resetOTP, 10);

        user.passwordResetOTP = hashedResetOTP;
        user.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.passwordResetOTPAttempts = 0;
        user.passwordResetOTPResendAt = new Date(Date.now() + 30 * 1000);
        await user.save();

        try {
            await sendOTPEmail(user.email, resetOTP);
        } catch (emailError) {
            console.error('Password reset email error:', emailError.message);
            user.passwordResetOTP = null;
            user.passwordResetOTPExpires = null;
            user.passwordResetOTPAttempts = 0;
            user.passwordResetOTPResendAt = null;
            await user.save();
            return res.status(500).json({ message: 'Unable to send password reset OTP. Please try again.' });
        }

        return res.status(200).json({
            success: true,
            email: user.email,
            message: 'Password reset OTP has been sent to your registered email.',
            expiresIn: 600,
            resendAfter: 30
        });

    } catch (error) {
        console.error('Forgot password error:', error.message);
        return res.status(500).json({ message: 'Unable to process password reset. Please try again.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body || {};
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const cleanedOTP = typeof otp === 'string' ? otp.trim() : '';
        const cleanedPassword = typeof newPassword === 'string' ? newPassword : '';

        if (!cleanedEmail || !cleanedOTP || !cleanedPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
        }

        if (!validateEmail(cleanedEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        if (!/^\d{6}$/.test(cleanedOTP)) {
            return res.status(400).json({ message: 'OTP must contain exactly 6 digits.' });
        }

        if (cleanedPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
        }

        const user = await User.findOne({ email: cleanedEmail });
        if (!user) {
            return res.status(404).json({ message: 'This email is not registered.' });
        }

        if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
            return res.status(400).json({ message: 'No active password reset OTP found. Please request a new OTP.' });
        }

        if (new Date() > user.passwordResetOTPExpires) {
            user.passwordResetOTP = null;
            user.passwordResetOTPExpires = null;
            user.passwordResetOTPAttempts = 0;
            user.passwordResetOTPResendAt = null;
            await user.save();
            return res.status(400).json({ message: 'Password reset OTP has expired. Please request a new OTP.' });
        }

        if (user.passwordResetOTPAttempts >= 5) {
            return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        const isOTPValid = await bcrypt.compare(cleanedOTP, user.passwordResetOTP);
        if (!isOTPValid) {
            user.passwordResetOTPAttempts += 1;
            await user.save();
            const remainingAttempts = Math.max(0, 5 - user.passwordResetOTPAttempts);
            return res.status(400).json({
                message: remainingAttempts > 0
                    ? `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
                    : 'Invalid OTP. Please request a new OTP.'
            });
        }

        const hashedPassword = await bcrypt.hash(cleanedPassword, 12);
        user.password = hashedPassword;
        user.passwordResetOTP = null;
        user.passwordResetOTPExpires = null;
        user.passwordResetOTPAttempts = 0;
        user.passwordResetOTPResendAt = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error.message);
        return res.status(500).json({ message: 'Unable to reset password. Please try again.' });
    }
};

// ============================================
// PORTAL 1: PUBLIC USER LOGIN (/api/auth/login)
// ============================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // PORTAL ISOLATION: Public login is ONLY for PUBLIC_USER
        if (user.role && user.role !== 'PUBLIC_USER') {
            if (user.role === 'ADMIN') {
                return res.status(403).json({
                    message: 'Administrator accounts must log in via the Admin Portal at /admin/login.'
                });
            }
            return res.status(403).json({
                message: 'Organization accounts must log in via the Organization Portal at /private/login.'
            });
        }

        // Account status check
        if (user.accountStatus === 'SUSPENDED') {
            return res.status(403).json({
                message: 'Your account has been suspended by an administrator.'
            });
        }

        if (!user.emailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                requiresEmailVerification: true,
                email: user.email
            });
        }

        const token = createToken(user);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                role: user.role || 'PUBLIC_USER',
                accountStatus: user.accountStatus || 'ACTIVE'
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// ============================================
// PORTAL 2: PRIVATE ORGANIZATION REGISTRATION
// ============================================

const registerPrivate = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            location,
            password,
            organizationType,
            organizationName,
            registrationNumber,
            address,
            licenseDocument,
            bio
        } = req.body || {};

        const cleanedName = typeof name === 'string' ? name.trim() : '';
        const cleanedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const cleanedPhone = typeof phone === 'string' ? phone.trim() : '';
        const cleanedLocation = typeof location === 'string' ? location.trim() : '';
        const cleanedOrgName = typeof organizationName === 'string' ? organizationName.trim() : '';
        const cleanedRegNum = typeof registrationNumber === 'string' ? registrationNumber.trim() : '';
        const cleanedAddress = typeof address === 'string' ? address.trim() : '';
        const cleanedPassword = typeof password === 'string' ? password : '';

        const allowedOrgTypes = ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'];
        if (!allowedOrgTypes.includes(organizationType)) {
            return res.status(400).json({
                message: 'Invalid organization type. Must be BLOOD_BANK, HOSPITAL, or SERVICE_PROVIDER.'
            });
        }

        if (
            !cleanedName ||
            !cleanedEmail ||
            !cleanedPhone ||
            !cleanedLocation ||
            !cleanedOrgName ||
            !cleanedRegNum ||
            !cleanedAddress ||
            !cleanedPassword
        ) {
            return res.status(400).json({
                message: 'All organization fields (Contact Name, Org Name, Email, Phone, Location, Address, Reg Number, Password) are required.'
            });
        }

        if (!validateEmail(cleanedEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        if (!validatePhone(cleanedPhone)) {
            return res.status(400).json({ message: 'Please enter a valid phone number.' });
        }

        if (cleanedPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        }

        const existing = await User.findOne({
            $or: [{ email: cleanedEmail }, { phone: cleanedPhone }]
        });

        if (existing) {
            return res.status(409).json({ message: 'This email or phone number is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(cleanedPassword, 12);

        const newOrg = await User.create({
            name: cleanedName,
            email: cleanedEmail,
            phone: cleanedPhone,
            location: cleanedLocation,
            password: hashedPassword,
            role: organizationType,
            organizationName: cleanedOrgName,
            registrationNumber: cleanedRegNum,
            address: cleanedAddress,
            licenseDocument: licenseDocument || '',
            bio: bio || '',
            organizationStatus: 'PENDING',
            accountStatus: 'ACTIVE',
            emailVerified: true // organizations verify via admin workflow
        });

        // Initialize inventory for blood bank or hospital
        if (['BLOOD_BANK', 'HOSPITAL'].includes(organizationType)) {
            await BloodInventory.create({
                organizationId: newOrg._id,
                units: {
                    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
                    'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
                }
            });
        }

        // Send registration receipt email
        try {
            await sendOrganizationRegisteredEmail({
                to: newOrg.email,
                organizationName: cleanedOrgName,
                organizationType
            });
        } catch (err) {
            console.error('Failed to send org welcome email:', err.message);
        }

        return res.status(201).json({
            success: true,
            message: 'Organization registered successfully! Your account is currently pending administrator verification before operational features are unlocked.',
            organization: {
                id: newOrg._id,
                name: newOrg.name,
                organizationName: newOrg.organizationName,
                role: newOrg.role,
                organizationStatus: newOrg.organizationStatus
            }
        });

    } catch (error) {
        console.error('Private org registration error:', error.message);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This email or phone number is already registered.' });
        }
        return res.status(500).json({ message: 'Organization registration failed. Please try again.' });
    }
};

// ============================================
// PORTAL 2: PRIVATE ORGANIZATION LOGIN (/api/auth/private/login)
// ============================================

const loginPrivate = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // PORTAL ISOLATION
        const allowedOrgRoles = ['BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER'];
        if (!allowedOrgRoles.includes(user.role)) {
            if (user.role === 'ADMIN') {
                return res.status(403).json({
                    message: 'Administrator accounts must log in via the Admin Portal at /admin/login.'
                });
            }
            return res.status(403).json({
                message: 'Access denied. Public community members must log in via the Public Portal at /login.'
            });
        }

        if (user.accountStatus === 'SUSPENDED') {
            return res.status(403).json({
                message: 'Your organization account has been suspended by an administrator.'
            });
        }

        const token = createToken(user);

        return res.status(200).json({
            message: 'Organization login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                role: user.role,
                organizationName: user.organizationName,
                organizationStatus: user.organizationStatus,
                registrationNumber: user.registrationNumber,
                address: user.address,
                accountStatus: user.accountStatus
            }
        });

    } catch (error) {
        console.error('Private login error:', error.message);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// ============================================
// PORTAL 3: ADMIN LOGIN (/api/auth/admin/login)
// ============================================

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: 'Admin email and password are required.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid administrator credentials.' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid administrator credentials.' });
        }

        // PORTAL ISOLATION: Strict check for ADMIN role
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Access denied. Administrator privileges required.'
            });
        }

        if (user.accountStatus === 'SUSPENDED') {
            return res.status(403).json({
                message: 'This administrator account is suspended.'
            });
        }

        const token = createToken(user);

        return res.status(200).json({
            message: 'Admin authorization successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: 'ADMIN',
                accountStatus: user.accountStatus
            }
        });

    } catch (error) {
        console.error('Admin login error:', error.message);
        return res.status(500).json({ message: 'Admin authentication failed.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmailOTP,
    resendEmailOTP,
    forgotPassword,
    resetPassword,
    registerPrivate,
    loginPrivate,
    loginAdmin
};
