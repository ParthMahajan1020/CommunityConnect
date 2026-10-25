const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        serviceType: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        availability: {
            type: Boolean,
            default: true
        },

        contact: {
            type: String,
            required: true
        },

        rateType: {
            type: String,
            enum: ["Hourly", "Daily", "Monthly"],
            default: "Hourly"
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: ["ACTIVE", "PAUSED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

serviceProviderSchema.index({ serviceType: 1, location: 1, availability: 1 });
serviceProviderSchema.index({ userId: 1 });

module.exports = mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
);
