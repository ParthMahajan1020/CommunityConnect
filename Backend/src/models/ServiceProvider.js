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
        }
    },
    {
        timestamps: true
    }
);

serviceProviderSchema.index({ serviceType: 1, location: 1, availability: 1 });

module.exports = mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
);
