const mongoose = require("mongoose");

const professionalServiceSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        pricing: {
            type: Number,
            default: 0,
            min: 0
        },

        pricingType: {
            type: String,
            enum: ["Hourly", "Daily", "Monthly", "Fixed"],
            default: "Hourly"
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

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

professionalServiceSchema.index({ organizationId: 1 });
professionalServiceSchema.index({ category: 1, location: 1, availability: 1, isActive: 1 });

module.exports = mongoose.model("ProfessionalService", professionalServiceSchema);
