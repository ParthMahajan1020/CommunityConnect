const mongoose = require("mongoose");
const { findMatches } = require("../services/matchingService");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/User");
const { createActionUrls } = require("../services/emailActionTokenService");
const { sendConnectionRequestEmail } = require("../services/emailService");

const isValidId = (value) => mongoose.isValidObjectId(value);

const getMatches = async (req, res) => {
    try {
        const { type, requirement, location } = req.query;
        if (!type || !requirement || !location || !location.trim()) return res.status(400).json({ message: "Type, requirement and location are required." });
        const normalizedType = type.toUpperCase();
        if (!["BLOOD", "SERVICE"].includes(normalizedType)) return res.status(400).json({ message: "Invalid match type." });
        const matches = await findMatches(normalizedType, requirement, location);
        res.json({ count: matches.length, matches });
    } catch { res.status(500).json({ message: "Unable to find matches right now." }); }
};

const createConnectionRequest = async (req, res) => {
    try {
        const { providerId, type, description, location } = req.body;
        const requesterId = req.userId;
        if (!isValidId(providerId) || !type || !description?.trim() || !location?.trim()) return res.status(400).json({ message: "Provide a valid provider, type, description and location." });
        if (!["BLOOD", "SERVICE"].includes(type.toUpperCase())) return res.status(400).json({ message: "Invalid request type." });
        if (description.trim().length < 8 || description.trim().length > 1000) return res.status(400).json({ message: "Description must be between 8 and 1000 characters." });
        if (requesterId === providerId) return res.status(400).json({ message: "You cannot send a request to yourself." });
        const [requester, provider] = await Promise.all([User.findById(requesterId), User.findById(providerId)]);
        if (!requester || !provider) return res.status(404).json({ message: "Requester or provider not found." });
        const existing = await ConnectionRequest.findOne({ requesterId, providerId, type: type.toUpperCase(), status: { $in: ["PENDING", "ACCEPTED"] } });
        if (existing) return res.status(409).json({ message: "You already have an active request with this person." });
        const request = await ConnectionRequest.create({ requesterId, providerId, type: type.toUpperCase(), description: description.trim(), location: location.trim() });
        const urls = await createActionUrls({ requestId: request._id, actorId: provider._id, actions: ["accept", "reject"] });
        await sendConnectionRequestEmail({ providerEmail: provider.email, requesterName: requester.name, type: request.type, description: request.description, location: request.location, acceptUrl: urls.accept, rejectUrl: urls.reject });
        res.status(201).json({ message: "Connection request sent successfully.", request });
    } catch (error) { console.error("Create connection request error:", error.message); res.status(500).json({ message: "Unable to send the request right now." }); }
};

const getProviderRequests = async (req, res) => {
    try { const requests = await ConnectionRequest.find({ providerId: req.userId }).populate("requesterId", "name phone").populate("providerId", "name phone").sort({ createdAt: -1 }); res.json({ count: requests.length, requests }); }
    catch { res.status(500).json({ message: "Unable to load received requests." }); }
};
const getRequesterRequests = async (req, res) => {
    try { const requests = await ConnectionRequest.find({ requesterId: req.userId }).populate("requesterId", "name phone").populate("providerId", "name phone").sort({ createdAt: -1 }); res.json({ count: requests.length, requests }); }
    catch { res.status(500).json({ message: "Unable to load sent requests." }); }
};
const updateRequestStatus = async (req, res) => {
    try {
        const { requestId } = req.params; const { status } = req.body;
        if (!isValidId(requestId) || !["ACCEPTED", "REJECTED", "COMPLETED", "INCOMPLETED"].includes(status)) return res.status(400).json({ message: "Invalid request or status." });
        const providerAction = ["ACCEPTED", "REJECTED"].includes(status);
        const filter = providerAction ? { _id: requestId, providerId: req.userId, status: "PENDING" } : { _id: requestId, requesterId: req.userId, status: "ACCEPTED" };
        const request = await ConnectionRequest.findOneAndUpdate(filter, { $set: { status } }, { new: true });
        if (!request) return res.status(403).json({ message: "This action is not available for this request." });
        res.json({ message: `Request ${status.toLowerCase()} successfully.`, request });
    } catch { res.status(500).json({ message: "Unable to update the request." }); }
};
module.exports = { getMatches, createConnectionRequest, getProviderRequests, getRequesterRequests, updateRequestStatus };
