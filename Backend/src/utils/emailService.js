const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, otp) => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured.');
    }

    const from =
        process.env.EMAIL_FROM ||
        'CommunityConnect <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
        from,
        to: [email],
        subject: 'Verify your CommunityConnect account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; color: #24342E;">
                <h2 style="color: #427A65;">Welcome to CommunityConnect</h2>

                <p>Thank you for creating your CommunityConnect account.</p>

                <p>Use the verification code below to verify your email address:</p>

                <div style="background: #E5F1EA; padding: 18px; text-align: center; border-radius: 10px; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #24342E;">
                        ${otp}
                    </span>
                </div>

                <p>This code expires in <strong>10 minutes</strong>.</p>

                <p>If you did not request this code, you can safely ignore this email.</p>

                <hr style="border: none; border-top: 1px solid #E2E9E4; margin: 24px 0;">

                <p style="font-size: 12px; color: #6F7D76;">
                    CommunityConnect — Connecting people, strengthening communities.
                </p>
            </div>
        `
    });

    if (error) {
        console.error('Resend email error:', error.message);
        throw new Error('Unable to send verification email.');
    }

    return data;
};

module.exports = {
    sendVerificationEmail
};