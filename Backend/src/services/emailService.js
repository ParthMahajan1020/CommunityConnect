const { BrevoClient } = require('@getbrevo/brevo');

let brevoClient = null;

const getClient = () => {
    if (!brevoClient && process.env.BREVO_API_KEY) {
        brevoClient = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY
        });
    }
    return brevoClient;
};

const sendEmail = async ({ to, subject, html }) => {
    try {
        const client = getClient();
        if (!client || !process.env.BREVO_API_KEY) {
            console.warn(`[EMAIL SKIPPED] Brevo API key not configured. Mock sending to ${to}: ${subject}`);
            return { messageId: 'mock-id' };
        }

        const senderEmail = process.env.EMAIL_FROM || process.env.SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || 'communityconnect.team5@gmail.com';
        const senderName = process.env.EMAIL_FROM_NAME || process.env.BREVO_SENDER_NAME || 'CommunityConnect';

        const response = await client.transactionalEmails.sendTransacEmail({
            sender: {
                email: senderEmail,
                name: senderName
            },
            to: [
                {
                    email: to
                }
            ],
            subject,
            htmlContent: html
        });

        console.log(`Email sent successfully to ${to} (${subject})`);
        return response;
    } catch (error) {
        console.error('Brevo email delivery error:', error?.message || error);
        // Do not throw here if called as a background notification
        return null;
    }
};

const sendOTPEmail = async (email, otp) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CommunityConnect Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f7f6; font-family: Arial, Helvetica, sans-serif;">
            <div style="max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 14px; padding: 35px; border: 1px solid #e5e7eb;">
                <h1 style="margin: 0 0 10px; color: #111827; font-size: 26px;">CommunityConnect</h1>
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                    Welcome to CommunityConnect. Use the OTP below to complete your verification:
                </p>
                <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px; text-align: center;">
                    <div style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #111827;">${otp}</div>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">This OTP is valid for 10 minutes.</p>
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">If you did not make this request, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">CommunityConnect · Connecting people who can help.</p>
            </div>
        </body>
        </html>
    `;

    const res = await sendEmail({
        to: email,
        subject: 'CommunityConnect - Verification Code',
        html
    });

    if (!res && process.env.BREVO_API_KEY) {
        throw new Error('Failed to send verification email');
    }
    return res;
};

const sendOrganizationRegisteredEmail = async ({ to, organizationName, organizationType }) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; background-color: #f5f7f6; font-family: Arial, sans-serif;">
            <div style="max-width: 520px; margin: 20px auto; background-color: #ffffff; border-radius: 14px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #24342E; margin-top: 0;">Organization Registration Received</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Hello <strong>${organizationName || 'Partner'}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Thank you for applying to join CommunityConnect as a <strong>${organizationType}</strong>.
                </p>
                <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 600;">Status: Pending Administrator Approval</p>
                    <p style="margin: 8px 0 0; color: #B45309; font-size: 12px;">Our administrative team will review your organization details and credentials shortly. You will receive an email once approved.</p>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 25px;">CommunityConnect · Dedicated Portal Support</p>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to,
        subject: 'CommunityConnect - Organization Registration Received',
        html
    });
};

const sendOrganizationStatusUpdateEmail = async ({ to, organizationName, status, notes = '' }) => {
    const isApproved = status === 'APPROVED';
    const accentColor = isApproved ? '#059669' : '#DC2626';
    const bgColor = isApproved ? '#ECFDF5' : '#FEF2F2';
    const borderColor = isApproved ? '#A7F3D0' : '#FECACA';

    const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; background-color: #f5f7f6; font-family: Arial, sans-serif;">
            <div style="max-width: 520px; margin: 20px auto; background-color: #ffffff; border-radius: 14px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #24342E; margin-top: 0;">Organization Account Status Update</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Hello <strong>${organizationName || 'Partner'}</strong>,
                </p>
                <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 10px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: ${accentColor}; font-size: 14px; font-weight: bold;">Status: ${status}</p>
                    <p style="margin: 8px 0 0; color: #4b5563; font-size: 13px;">
                        ${isApproved 
                            ? 'Congratulations! Your organization has been approved. You now have full operational access to manage inventory, services, and incoming community requests.'
                            : `Your organization status has been updated to ${status}. ${notes ? `Note: ${notes}` : 'Please reach out to our administration team for further details.'}`
                        }
                    </p>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 25px;">CommunityConnect Administration Team</p>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to,
        subject: `CommunityConnect - Organization Account Status: ${status}`,
        html
    });
};

const sendRequestNotificationEmail = async ({ to, receiverName, requesterName, requestType, location, description }) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; background-color: #f5f7f6; font-family: Arial, sans-serif;">
            <div style="max-width: 520px; margin: 20px auto; background-color: #ffffff; border-radius: 14px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #24342E; margin-top: 0;">New Connection Request</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Hello <strong>${receiverName || 'Neighbor'}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    You have received a new <strong>${requestType}</strong> request from <strong>${requesterName}</strong>.
                </p>
                <div style="background-color: #F8FAF9; border: 1px solid #E2E9E4; border-radius: 10px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 6px; font-size: 13px; color: #24342E;"><strong>Location:</strong> ${location}</p>
                    <p style="margin: 0; font-size: 13px; color: #4b5563;"><strong>Details:</strong> ${description}</p>
                </div>
                <p style="color: #4b5563; font-size: 13px;">
                    Please log in to your CommunityConnect dashboard to review and respond to this request.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 25px;">CommunityConnect Peer Network</p>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to,
        subject: `CommunityConnect - New ${requestType} Request from ${requesterName}`,
        html
    });
};

const sendRequestStatusUpdateEmail = async ({ to, requesterName, providerName, requestType, status }) => {
    const isAccepted = status === 'ACCEPTED';
    const statusLabel = isAccepted ? 'Accepted' : status;

    const html = `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 20px; background-color: #f5f7f6; font-family: Arial, sans-serif;">
            <div style="max-width: 520px; margin: 20px auto; background-color: #ffffff; border-radius: 14px; padding: 30px; border: 1px solid #e5e7eb;">
                <h2 style="color: #24342E; margin-top: 0;">Request Status Update</h2>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Hello <strong>${requesterName || 'Neighbor'}</strong>,
                </p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
                    Your <strong>${requestType}</strong> request has been marked as <strong>${statusLabel}</strong> by <strong>${providerName}</strong>.
                </p>
                <p style="color: #4b5563; font-size: 13px;">
                    Log into CommunityConnect to see contact details and request progress.
                </p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 25px;">CommunityConnect Peer Network</p>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to,
        subject: `CommunityConnect - Your ${requestType} request was ${statusLabel.toLowerCase()}`,
        html
    });
};

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendOrganizationRegisteredEmail,
    sendOrganizationStatusUpdateEmail,
    sendRequestNotificationEmail,
    sendRequestStatusUpdateEmail
};
