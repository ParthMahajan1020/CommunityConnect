const nodemailer = require("nodemailer");

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD } });
const button = (url, label, color) => `<a href="${url}" style="display:inline-block;margin:8px;padding:13px 20px;border-radius:9px;background:${color};color:#fff;text-decoration:none;font-weight:700">${label}</a>`;
const layout = (title, body) => `<div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033"><div style="max-width:600px;margin:auto;background:#fff;border-radius:18px;padding:32px;box-shadow:0 8px 28px rgba(15,23,42,.08)"><h1 style="margin:0;color:#1d4ed8">CommunityConnect</h1><p style="color:#64748b;margin:6px 0 26px">Help is closer than you think.</p><h2>${escapeHtml(title)}</h2>${body}<hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px"><p style="font-size:12px;color:#94a3b8">This message was sent by CommunityConnect. If you did not expect it, you can ignore it.</p></div></div>`;
const details = ({ type, description, location, status }) => `<div style="padding:18px;background:#f8fafc;border-radius:12px"><p><strong>Request type:</strong> ${escapeHtml(type)}</p><p><strong>Location:</strong> ${escapeHtml(location)}</p>${description ? `<p><strong>Details:</strong> ${escapeHtml(description)}</p>` : ""}<p><strong>Current status:</strong> ${escapeHtml(status)}</p></div>`;
const sendMail = (to, subject, html) => transporter.sendMail({ from: `"CommunityConnect" <${process.env.EMAIL_USER}>`, to, subject, html });

const sendOTPEmail = (email, otp) => sendMail(email, "Your CommunityConnect verification code", layout("Verify your email", `<p>Use this one-time code to continue:</p><p style="font-size:30px;letter-spacing:6px;font-weight:700">${escapeHtml(otp)}</p><p>The code expires in 10 minutes.</p>`));

const sendConnectionRequestEmail = ({ providerEmail, requesterName, type, description, location, acceptUrl, rejectUrl }) => sendMail(providerEmail, `New ${type} request on CommunityConnect`, layout("New request", `<p><strong>${escapeHtml(requesterName)}</strong> has asked for your help.</p>${details({ type, description, location, status: "PENDING" })}<p>Please choose one action. These secure links expire in 24 hours.</p><p>${button(acceptUrl, "Accept request", "#16a34a")}${button(rejectUrl, "Reject request", "#dc2626")}</p>`));

const sendProviderStatusEmail = ({ providerEmail, requesterName, type, description, location, status }) => {
    const accepted = status === "ACCEPTED";
    return sendMail(providerEmail, `Request ${accepted ? "accepted" : "rejected"} | CommunityConnect`, layout(accepted ? "✓ Request Accepted" : "Request Rejected", `<p>You have successfully ${accepted ? "accepted" : "rejected"} this request.</p><p><strong>Requester:</strong> ${escapeHtml(requesterName)}</p>${details({ type, description, location, status })}${accepted ? "<p>The requester has been notified.</p>" : "<p>The requester has been notified.</p>"}`));
};

const sendRequestAcceptedEmail = ({ requesterEmail, providerName, type, description, location, completeUrl, incompleteUrl }) => sendMail(requesterEmail, "Your CommunityConnect request was accepted", layout("Request Accepted", `<p><strong>Provider:</strong> ${escapeHtml(providerName)}</p><p>Your provider has accepted the request.</p>${details({ type, description, location, status: "ACCEPTED" })}<p>After help has been provided, please confirm the result. These secure links expire in 24 hours.</p><p>${button(completeUrl, "Mark completed", "#16a34a")}${button(incompleteUrl, "Report incomplete", "#dc2626")}</p>`));

const sendRequestRejectedEmail = ({ requesterEmail, providerName, type, description, location }) => sendMail(requesterEmail, "Your CommunityConnect request was declined", layout("Request Rejected", `<p><strong>Provider:</strong> ${escapeHtml(providerName)}</p><p>The provider is unable to help with this request.</p>${details({ type, description, location, status: "REJECTED" })}<p>You can search CommunityConnect for another available helper.</p>`));

const sendRequesterFinalStatusEmail = ({ requesterEmail, providerName, type, description, location, status }) => {
    const completed = status === "COMPLETED";
    return sendMail(requesterEmail, `Request ${completed ? "completed" : "marked incomplete"} | CommunityConnect`, layout(completed ? "✓ Request Completed" : "Request Marked Incomplete", `<p>${completed ? "Your request has been marked as completed." : "You have marked this request as incomplete."}</p><p><strong>Provider:</strong> ${escapeHtml(providerName)}</p>${details({ type, description, location, status })}<p>Thank you for using CommunityConnect.</p>`));
};

module.exports = { sendOTPEmail, sendConnectionRequestEmail, sendProviderStatusEmail, sendRequestAcceptedEmail, sendRequestRejectedEmail, sendRequesterFinalStatusEmail };
