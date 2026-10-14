const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const response = await brevo.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.EMAIL_FROM,
                name: process.env.EMAIL_FROM_NAME || 'CommunityConnect'
            },

            to: [
                {
                    email: to
                }
            ],

            subject,
            htmlContent: html
        });

        console.log(`Email sent successfully to ${to}`);

        return response;
    } catch (error) {
        console.error(
            'Brevo email error:',
            error?.message || error
        );

        throw new Error('Failed to send email');
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

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f5f7f6;
            font-family: Arial, Helvetica, sans-serif;
        ">

            <div style="
                max-width: 520px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 14px;
                padding: 35px;
                border: 1px solid #e5e7eb;
            ">

                <h1 style="
                    margin: 0 0 10px;
                    color: #111827;
                    font-size: 26px;
                ">
                    CommunityConnect
                </h1>

                <p style="
                    color: #4b5563;
                    font-size: 15px;
                    line-height: 1.6;
                ">
                    Welcome to CommunityConnect.
                    Use the OTP below to verify your email address.
                </p>

                <div style="
                    margin: 30px 0;
                    padding: 20px;
                    background-color: #f3f4f6;
                    border-radius: 12px;
                    text-align: center;
                ">

                    <div style="
                        font-size: 34px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #111827;
                    ">
                        ${otp}
                    </div>

                </div>

                <p style="
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.5;
                ">
                    This OTP is valid for 10 minutes.
                </p>

                <p style="
                    color: #9ca3af;
                    font-size: 13px;
                    line-height: 1.5;
                ">
                    If you did not create a CommunityConnect account,
                    you can safely ignore this email.
                </p>

                <hr style="
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 25px 0;
                ">

                <p style="
                    color: #9ca3af;
                    font-size: 12px;
                    margin: 0;
                ">
                    CommunityConnect · Connecting people who can help.
                </p>

            </div>

        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: 'CommunityConnect - Email Verification OTP',
        html
    });
};

module.exports = {
    sendEmail,
    sendOTPEmail
};