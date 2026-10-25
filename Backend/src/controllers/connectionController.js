const mongoose = require("mongoose");
const { findMatches } = require("../services/matchingService");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const {
    sendRequestNotificationEmail,
    sendRequestStatusUpdateEmail
} = require("../services/emailService");

const isValidId = (value) => mongoose.isValidObjectId(value);

const getMatches = async (req, res) => {
    try {
        const { type, requirement, location } = req.query;
        if (!type || !requirement || !location || !location.trim()) {
            return res.status(400).json({ message: "Type, requirement and location are required." });
        }
        const normalizedType = type.toUpperCase();
        if (!["BLOOD", "SERVICE"].includes(normalizedType)) {
            return res.status(400).json({ message: "Invalid match type." });
        }
        const matches = await findMatches(normalizedType, requirement, location);
        res.json({ count: matches.length, matches });
    } catch (err) {
        console.error("getMatches error:", err.message);
        res.status(500).json({ message: "Unable to find matches right now." });
    }
};

const createConnectionRequest = async (req, res) => {
    try {
        let { providerId, type, description, location } = req.body;
        const requesterId = req.userId;

        // If providerId was prefixed like 'org_12345', sanitize it
        if (typeof providerId === 'string' && providerId.startsWith('org_')) {
            providerId = providerId.replace('org_', '');
        }

        if (
            !isValidId(providerId) ||
            !type ||
            !description?.trim() ||
            !location?.trim()
        ) {
            return res.status(400).json({
                message: "Provide a valid provider, type, description and location."
            });
        }

        const normalizedType = type.toUpperCase();
        if (!["BLOOD", "SERVICE"].includes(normalizedType)) {
            return res.status(400).json({
                message: "Invalid request type."
            });
        }

        if (
            description.trim().length < 8 ||
            description.trim().length > 1000
        ) {
            return res.status(400).json({
                message: "Description must be between 8 and 1000 characters."
            });
        }

        if (requesterId.toString() === providerId.toString()) {
            return res.status(400).json({
                message: "You cannot send a request to yourself."
            });
        }

        const [requester, provider] = await Promise.all([
            User.findById(requesterId),
            User.findById(providerId)
        ]);

        if (!requester || !provider) {
            return res.status(404).json({
                message: "Requester or provider not found."
            });
        }

        const existing = await ConnectionRequest.findOne({
            requesterId,
            providerId,
            type: normalizedType,
            status: { $in: ["PENDING", "ACCEPTED"] }
        });

        if (existing) {
            return res.status(409).json({
                message: "You already have an active pending or accepted request with this person."
            });
        }

        const request = await ConnectionRequest.create({
            requesterId,
            providerId,
            type: normalizedType,
            description: description.trim(),
            location: location.trim(),
            status: "PENDING"
        });

        // Trigger safe email notification
        if (provider.email) {
            sendRequestNotificationEmail({
                to: provider.email,
                receiverName: provider.organizationName || provider.name,
                requesterName: requester.name,
                requestType: normalizedType,
                location: location.trim(),
                description: description.trim()
            }).catch(err => console.error("Request notification email failed:", err.message));
        }

        return res.status(201).json({
            message: "Connection request sent successfully.",
            request
        });

    } catch (error) {
        console.error("Create connection request error:", error.message);
        return res.status(500).json({
            message: "Unable to send the request right now."
        });
    }
};

const getProviderRequests = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ providerId: req.userId })
            .populate("requesterId", "name phone email location")
            .populate("providerId", "name phone email location organizationName role")
            .sort({ createdAt: -1 });

        res.json({ count: requests.length, requests });
    } catch {
        res.status(500).json({ message: "Unable to load received requests." });
    }
};

const getRequesterRequests = async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({ requesterId: req.userId })
            .populate("requesterId", "name phone email location")
            .populate("providerId", "name phone email location organizationName role")
            .sort({ createdAt: -1 });

        res.json({ count: requests.length, requests });
    } catch {
        res.status(500).json({ message: "Unable to load sent requests." });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        if (!isValidId(requestId) || !["ACCEPTED", "REJECTED", "COMPLETED", "INCOMPLETED"].includes(status)) {
            return res.status(400).json({ message: "Invalid request or status." });
        }

        const providerAction = ["ACCEPTED", "REJECTED"].includes(status);
        const filter = providerAction
            ? { _id: requestId, providerId: req.userId, status: "PENDING" }
            : { _id: requestId, requesterId: req.userId, status: "ACCEPTED" };

        const request = await ConnectionRequest.findOneAndUpdate(
            filter,
            { $set: { status } },
            { new: true }
        ).populate("requesterId", "name email phone").populate("providerId", "name organizationName email phone");

        if (!request) {
            return res.status(403).json({ message: "This action is not available for this request." });
        }

        // Email notification on state transition
        if (providerAction && request.requesterId?.email) {
            sendRequestStatusUpdateEmail({
                to: request.requesterId.email,
                requesterName: request.requesterId.name,
                providerName: request.providerId?.organizationName || request.providerId?.name || "Provider",
                requestType: request.type,
                status
            }).catch(err => console.error("Email update failed:", err.message));
        }

        res.json({ message: `Request ${status.toLowerCase()} successfully.`, request });
    } catch (err) {
        console.error("updateRequestStatus error:", err.message);
        res.status(500).json({ message: "Unable to update the request." });
    }
};

module.exports = {
    getMatches,
    createConnectionRequest,
    getProviderRequests,
    getRequesterRequests,
    updateRequestStatus
};
