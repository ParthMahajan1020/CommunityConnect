const mongoose = require("mongoose");

const bloodInventorySchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        units: {
            "A+": { type: Number, default: 0, min: 0 },
            "A-": { type: Number, default: 0, min: 0 },
            "B+": { type: Number, default: 0, min: 0 },
            "B-": { type: Number, default: 0, min: 0 },
            "AB+": { type: Number, default: 0, min: 0 },
            "AB-": { type: Number, default: 0, min: 0 },
            "O+": { type: Number, default: 0, min: 0 },
            "O-": { type: Number, default: 0, min: 0 }
        },

        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("BloodInventory", bloodInventorySchema);
