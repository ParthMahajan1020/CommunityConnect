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

        // Email verification
        emailVerified: {
            type: Boolean,
            default: false
        },

        // Hashed OTP, never store the actual OTP
        emailOtpHash: {
            type: String,
            default: undefined,
            select: false
        },

        // OTP expiration time
        emailOtpExpiresAt: {
            type: Date,
            default: undefined,
            select: false
        },

        // Prevent excessive OTP resend requests
        emailOtpLastSentAt: {
            type: Date,
            default: undefined,
            select: false
        },

        emailOtpAttempts: {
            type: Number,
            default: 0,
            select: false
        },
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('User', userSchema);