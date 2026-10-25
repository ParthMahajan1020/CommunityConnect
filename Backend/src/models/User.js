const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            unique: true
        },

        location: {
            type: String,
            required: true
        },

        password: {
            type: String,
            required: true
        },

        profileImage: {
            type: String,
            default: ''
        },

        // ================================
        // ROLE & ACCESS MANAGEMENT
        // ================================

        role: {
            type: String,
            enum: ['PUBLIC_USER', 'BLOOD_BANK', 'HOSPITAL', 'SERVICE_PROVIDER', 'ADMIN'],
            default: 'PUBLIC_USER'
        },

        accountStatus: {
            type: String,
            enum: ['ACTIVE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
            default: 'ACTIVE'
        },

        // ================================
        // PRIVATE ORGANIZATION DETAILS
        // ================================

        organizationStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
            default: 'PENDING'
        },

        organizationName: {
            type: String,
            trim: true,
            default: ''
        },

        registrationNumber: {
            type: String,
            trim: true,
            default: ''
        },

        licenseDocument: {
            type: String,
            default: ''
        },

        address: {
            type: String,
            trim: true,
            default: ''
        },

        bio: {
            type: String,
            default: ''
        },

        // ================================
        // EMAIL VERIFICATION
        // ================================

        emailVerified: {
            type: Boolean,
            default: false
        },

        emailOTP: {
            type: String,
            default: null
        },

        emailOTPExpires: {
            type: Date,
            default: null
        },

        emailOTPAttempts: {
            type: Number,
            default: 0
        },

        emailOTPResendAt: {
            type: Date,
            default: null
        },

        // ================================
        // PASSWORD RESET
        // ================================

        passwordResetOTP: {
            type: String,
            default: null
        },

        passwordResetOTPExpires: {
            type: Date,
            default: null
        },

        passwordResetOTPAttempts: {
            type: Number,
            default: 0
        },

        passwordResetOTPResendAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ organizationStatus: 1 });

module.exports = mongoose.model('User', userSchema);
