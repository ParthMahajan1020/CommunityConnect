const EmailActionToken = require("../models/EmailActionToken");
const ConnectionRequest = require("../models/ConnectionRequest");
const { hashToken, createActionUrls, invalidateActionTokens } = require("../services/emailActionTokenService");
const { sendProviderStatusEmail, sendRequestAcceptedEmail, sendRequestRejectedEmail, sendRequesterFinalStatusEmail } = require("../services/emailService");

const simplePage = (title, message, isError = false) => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | CommunityConnect</title></head><body style="margin:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#1e293b"><main style="max-width:430px;margin:15vh auto;padding:0 18px"><section style="background:#fff;border-radius:18px;padding:32px;text-align:center;box-shadow:0 10px 30px rgba(15,23,42,.1)"><div style="font-size:36px">${isError ? "!" : "✓"}</div><p style="color:#2563eb;font-weight:700">CommunityConnect</p><h1 style="font-size:24px">${title}</h1><p style="color:#475569;line-height:1.6">${message}</p></section></main></body></html>`;

const sendNotifications = async (action, request) => {
    if (action === "accept") {
        const urls = await createActionUrls({ requestId: request._id, actorId: request.requesterId._id, actions: ["complete", "incomplete"] });
        await Promise.all([
            sendProviderStatusEmail({ providerEmail: request.providerId.email, requesterName: request.requesterId.name, type: request.type, description: request.description, location: request.location, status: "ACCEPTED" }),
            sendRequestAcceptedEmail({ requesterEmail: request.requesterId.email, providerName: request.providerId.name, type: request.type, description: request.description, location: request.location, completeUrl: urls.complete, incompleteUrl: urls.incomplete })
        ]);
    }
    if (action === "reject") {
        await Promise.all([
            sendProviderStatusEmail({ providerEmail: request.providerId.email, requesterName: request.requesterId.name, type: request.type, description: request.description, location: request.location, status: "REJECTED" }),
            sendRequestRejectedEmail({ requesterEmail: request.requesterId.email, providerName: request.providerId.name, type: request.type, description: request.description, location: request.location })
        ]);
    }
    if (["complete", "incomplete"].includes(action)) {
        await sendRequesterFinalStatusEmail({ requesterEmail: request.requesterId.email, providerName: request.providerId.name, type: request.type, description: request.description, location: request.location, status: action === "complete" ? "COMPLETED" : "INCOMPLETED" });
    }
};

const handleRequestAction = async (req, res) => {
    const rawToken = req.params.token;
    if (!/^[a-f0-9]{64}$/i.test(rawToken || "")) return res.status(400).send(simplePage("Invalid link", "This action link is invalid or unknown.", true));
    try {
        const token = await EmailActionToken.findOneAndUpdate(
            { tokenHash: hashToken(rawToken), usedAt: null, expiresAt: { $gt: new Date() } },
            { $set: { usedAt: new Date() } },
            { new: true }
        );
        if (!token) {
            const known = await EmailActionToken.exists({ tokenHash: hashToken(rawToken) });
            return res.status(400).send(simplePage(known ? "Already processed" : "Invalid link", known ? "This secure link has expired or was already used. You can close this window." : "This action link is invalid or unknown.", true));
        }

        const providerAction = ["accept", "reject"].includes(token.action);
        const expectedStatus = providerAction ? "PENDING" : "ACCEPTED";
        const targetStatus = { accept: "ACCEPTED", reject: "REJECTED", complete: "COMPLETED", incomplete: "INCOMPLETED" }[token.action];
        const actorField = providerAction ? "providerId" : "requesterId";
        const request = await ConnectionRequest.findOneAndUpdate(
            { _id: token.requestId, [actorField]: token.actorId, status: expectedStatus },
            { $set: { status: targetStatus } },
            { new: true }
        ).populate("requesterId", "name email").populate("providerId", "name email");

        if (!request) return res.status(409).send(simplePage("Already processed", "This action is no longer available because the request status has changed. You can close this window.", true));

        const competingAction = { accept: "reject", reject: "accept", complete: "incomplete", incomplete: "complete" }[token.action];
        try {
            await invalidateActionTokens({ requestId: request._id, actorId: token.actorId, actions: [competingAction] });
        } catch (error) {
            console.error("Email token invalidation failed:", error.message);
        }

        // The status update is intentionally complete before email is attempted.
        // A notification failure must never undo a successful user action.
        try {
            await sendNotifications(token.action, request);
        } catch (error) {
            console.error("Request status email failed:", error.message);
        }

        return res.send(simplePage("Done", "Your request has been updated. A status email has been sent when delivery is available. You can close this window."));
    } catch (error) {
        console.error("Email action error:", error.message);
        return res.status(500).send(simplePage("Unable to update request", "Please try again later.", true));
    }
};

module.exports = { handleRequestAction };
