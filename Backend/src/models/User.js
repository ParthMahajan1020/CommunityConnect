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
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);