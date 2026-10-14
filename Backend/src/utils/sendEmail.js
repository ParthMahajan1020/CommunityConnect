const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({
    to,
    subject,
    html,
}) => {
    try {
        const response = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: process.env.BREVO_SENDER_NAME || "CommunityConnect",
            },

            to: [
                {
                    email: to,
                },
            ],

            subject,

            htmlContent: html,
        });

        console.log("Email sent:", response.messageId);

        return response;
    } catch (error) {
        console.error(
            "Brevo email error:",
            error?.message || error
        );

        throw new Error("Failed to send email");
    }
};


const sendOTPEmail = async (email, otp) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <body style="
            margin: 0;
            padding: 40px 20px;
            background: #f5f7f6;
            font-family: Arial, sans-serif;
        ">

            <div style="
                max-width: 500px;
                margin: auto;
                background: white;
                padding: 35px;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            ">

                <h2 style="
                    margin-top: 0;
                    color: #111827;
                ">
                    CommunityConnect
                </h2>

                <p style="color: #4b5563;">
                    Use the following OTP to verify your email address:
                </p>

                <div style="
                    margin: 30px 0;
                    padding: 18px;
                    text-align: center;
                    background: #f3f4f6;
                    border-radius: 10px;
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #111827;
                ">
                    ${otp}
                </div>

                <p style="color: #6b7280; font-size: 14px;">
                    This OTP is valid for 10 minutes.
                </p>

                <p style="color: #9ca3af; font-size: 13px;">
                    If you did not request this OTP, you can safely ignore this email.
                </p>

            </div>

        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: "CommunityConnect - Email Verification OTP",
        html,
    });
};


module.exports = {
    sendEmail,
    sendOTPEmail,
};