const crypto = require("crypto");
const EmailActionToken = require("../models/EmailActionToken");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const createActionUrl = async ({ requestId, actorId, action }) => {
    const rawToken = crypto.randomBytes(32).toString("hex");
    await EmailActionToken.create({
        requestId,
        actorId,
        action,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const baseUrl = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
    return `${baseUrl}/api/email-actions/${rawToken}`;
};

const createActionUrls = async ({ requestId, actorId, actions }) => {
    const entries = await Promise.all(actions.map(async (action) => [
        action,
        await createActionUrl({ requestId, actorId, action })
    ]));
    return Object.fromEntries(entries);
};

const invalidateActionTokens = async ({ requestId, actorId, actions }) => {
    await EmailActionToken.updateMany(
        {
            requestId,
            actorId,
            action: { $in: actions },
            usedAt: null
        },
        { $set: { usedAt: new Date() } }
    );
};

module.exports = { hashToken, createActionUrls, invalidateActionTokens };
