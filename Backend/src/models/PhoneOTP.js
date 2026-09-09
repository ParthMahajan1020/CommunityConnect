const mongoose = require("mongoose");

const phoneOTPSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            trim: true
        },

        otp: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("PhoneOTP", phoneOTPSchema);