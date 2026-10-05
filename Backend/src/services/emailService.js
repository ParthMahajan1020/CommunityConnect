const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },

    // Force IPv4 DNS resolution
    family: 4,

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
});

const sendMail = async (to, subject, html) => {
    try {
        console.log("Sending email to:", to);

        const info = await transporter.sendMail({
            from: `"CommunityConnect" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Email sent successfully:", info.messageId);

        return info;
    } catch (error) {
        console.error("EMAIL SEND ERROR:", error);
        console.error("ERROR MESSAGE:", error.message);
        console.error("ERROR CODE:", error.code);
        console.error("ERROR COMMAND:", error.command);

        throw error;
    }
};