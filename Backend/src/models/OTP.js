const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        purpose: {
            type: String,
            enum: ["registration"],
            default: "registration",
            required: true,
            index: true
        },
        otpHash: {
            type: String,
            required: true
        },
        pendingUser: {
            name: { type: String, required: true },
            email: { type: String, required: true, lowercase: true, trim: true },
            phone: { type: String, required: true },
            location: { type: String, required: true },
            password: { type: String, required: true }
        },
        attempts: {
            type: Number,
            default: 0
        },
        maxAttempts: {
            type: Number,
            default: 5
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        usedAt: {
            type: Date,
            default: null
        },
        revokedAt: {
            type: Date,
            default: null
        },
        verifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("OTP", otpSchema);