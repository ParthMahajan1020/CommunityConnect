const nodemailer = require("nodemailer");

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    tls: {
        rejectUnauthorized: true
    },
    pool: true,
    maxConnections: 2
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

const sendEmailOTPEmail = async ({ to, otp, expiryMinutes = 10 }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; padding: 24px 20px; border-radius: 18px 18px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">CommunityConnect</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Email Verification</p>
        </div>
        <div style="background: white; padding: 28px 20px; border-radius: 0 0 18px 18px;">
          <h2 style="margin: 0 0 12px; font-size: 24px;">Your verification code</h2>
          <p style="margin: 0 0 20px; color: #475569; line-height: 1.6;">Use the 6-digit code below to verify your email and complete registration.</p>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px; text-align: center; letter-spacing: 8px; font-size: 34px; font-weight: 700; color: #1d4ed8;">${otp}</div>
          <p style="margin: 18px 0 0; color: #475569; font-size: 14px; line-height: 1.7;">This code expires in ${expiryMinutes} minutes. Never share this code with anyone. If you did not request this, you can ignore this email.</p>
        </div>
      </div>
    `;

    return sendMail(to, "CommunityConnect Email Verification", html);
};

const sendConnectionRequestEmail = async ({ providerEmail, requesterName, type, description, location, acceptUrl, rejectUrl }) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 24px; color: #0f172a;">
        <div style="background: linear-gradient(135deg, #0f172a, #1d4ed8); color: white; padding: 20px; border-radius: 18px 18px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">CommunityConnect</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">New Connection Request</p>
        </div>
        <div style="background: white; padding: 28px 20px; border-radius: 0 0 18px 18px;">
          <h2 style="margin: 0 0 12px; font-size: 24px;">${requesterName} sent a ${type.toLowerCase()} request</h2>
          <p style="margin: 0 0 16px; color: #475569; line-height: 1.6;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 0 0 22px; color: #475569; line-height: 1.7;"><strong>Details:</strong> ${description}</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px;">
            <a href="${acceptUrl}" style="display:inline-block; background:#16a34a; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:700;">Accept Request</a>
            <a href="${rejectUrl}" style="display:inline-block; background:#dc2626; color:#fff; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:700;">Reject Request</a>
          </div>
          <p style="margin-top: 20px; color: #64748b; font-size: 13px; line-height: 1.6;">This secure action link expires after a short period and can only be used once. Please do not share it.</p>
        </div>
      </div>
    `;

    return sendMail(providerEmail, "New CommunityConnect Connection Request", html);
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
    sendEmailOTPEmail,
    sendConnectionRequestEmail,
    sendProviderStatusEmail,
    sendRequestAcceptedEmail,
    sendRequestRejectedEmail,
    sendRequesterFinalStatusEmail,
};