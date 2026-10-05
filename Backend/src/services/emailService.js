const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    secure: true,
});

const sendMail = async (to, subject, html) => {
    if (!emailUser || !emailPass) {
        throw new Error("Gmail SMTP credentials are not configured. Set EMAIL_USER and EMAIL_PASS.");
    }

    console.log("Sending email to:", to);

    const info = await transporter.sendMail({
        from: `"CommunityConnect" <${emailUser}>`,
        to,
        subject,
        html,
    });

    console.log("Email sent successfully. Message ID:", info.messageId);

    return info;
};

const sendConnectionRequestEmail = async ({ providerEmail, requesterName, type, description, location, acceptUrl, rejectUrl }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">New CommunityConnect request</h2>
            <p><strong>${requesterName}</strong> has sent a ${type.toLowerCase()} request.</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Message:</strong> ${description}</p>
            <div style="margin-top: 24px;">
                <a href="${acceptUrl}" style="display:inline-block; background:#16a34a; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px; margin-right:12px;">Accept</a>
                <a href="${rejectUrl}" style="display:inline-block; background:#dc2626; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px;">Reject</a>
            </div>
        </div>
    `;

    return sendMail(providerEmail, "CommunityConnect request notification", html);
};

const sendProviderStatusEmail = async ({ providerEmail, requesterName, type, description, location, status }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">Request status updated</h2>
            <p>Your action for <strong>${requesterName}</strong>'s ${type.toLowerCase()} request has been recorded.</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Message:</strong> ${description}</p>
        </div>
    `;

    return sendMail(providerEmail, "CommunityConnect request status", html);
};

const sendRequestAcceptedEmail = async ({ requesterEmail, providerName, type, description, location, completeUrl, incompleteUrl }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">Your request was accepted</h2>
            <p><strong>${providerName}</strong> has accepted your ${type.toLowerCase()} request.</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Message:</strong> ${description}</p>
            <div style="margin-top: 24px;">
                <a href="${completeUrl}" style="display:inline-block; background:#2563eb; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px; margin-right:12px;">Mark completed</a>
                <a href="${incompleteUrl}" style="display:inline-block; background:#7c2d12; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px;">Mark incomplete</a>
            </div>
        </div>
    `;

    return sendMail(requesterEmail, "CommunityConnect request accepted", html);
};

const sendRequestRejectedEmail = async ({ requesterEmail, providerName, type, description, location }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">Your request was not accepted</h2>
            <p><strong>${providerName}</strong> could not accept your ${type.toLowerCase()} request this time.</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Message:</strong> ${description}</p>
        </div>
    `;

    return sendMail(requesterEmail, "CommunityConnect request update", html);
};

const sendRequesterFinalStatusEmail = async ({ requesterEmail, providerName, type, description, location, status }) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #0f172a;">
            <h2 style="margin-bottom: 12px;">Request status update</h2>
            <p><strong>${providerName}</strong> has marked your ${type.toLowerCase()} request as <strong>${status}</strong>.</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Message:</strong> ${description}</p>
        </div>
    `;

    return sendMail(requesterEmail, "CommunityConnect request status update", html);
};

module.exports = {
    sendMail,
    sendConnectionRequestEmail,
    sendProviderStatusEmail,
    sendRequestAcceptedEmail,
    sendRequestRejectedEmail,
    sendRequesterFinalStatusEmail,
};