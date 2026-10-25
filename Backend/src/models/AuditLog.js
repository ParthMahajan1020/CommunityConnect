const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        adminEmail: {
            type: String,
            required: true
        },

        action: {
            type: String,
            required: true
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        targetType: {
            type: String,
            enum: ["USER", "ORGANIZATION", "REQUEST", "SERVICE", "INVENTORY", "SYSTEM"],
            default: "SYSTEM"
        },

        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
