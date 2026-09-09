const mongoose = require("mongoose");

const emailActionTokenSchema = new mongoose.Schema(
    {
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ConnectionRequest", required: true, index: true },
        actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        action: { type: String, enum: ["accept", "reject", "complete", "incomplete"], required: true },
        tokenHash: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true, index: true },
        usedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model("EmailActionToken", emailActionTokenSchema);
