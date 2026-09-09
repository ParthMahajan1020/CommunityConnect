const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        providerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            required: true,
            enum: ["BLOOD", "SERVICE", "JOB"]
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "COMPLETED",
                "INCOMPLETED"
            ],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

connectionRequestSchema.index({ requesterId: 1, providerId: 1, type: 1, status: 1 });
connectionRequestSchema.index({ providerId: 1, status: 1, createdAt: -1 });
connectionRequestSchema.index({ requesterId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);
