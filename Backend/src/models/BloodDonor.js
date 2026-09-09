const mongoose = require("mongoose");

const bloodDonorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        bloodGroup: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
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

bloodDonorSchema.index({ bloodGroup: 1, location: 1, availability: 1 });

module.exports = mongoose.model("BloodDonor", bloodDonorSchema);
