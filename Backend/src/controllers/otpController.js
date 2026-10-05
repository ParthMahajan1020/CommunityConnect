const sendEmailOTP = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: "Email OTP verification is temporarily disabled for the current MVP."
    });
};

const verifyEmailOTP = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: "Email OTP verification is temporarily disabled for the current MVP."
    });
};

const sendPhoneOTP = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: "Phone OTP verification is temporarily disabled for the current MVP."
    });
};

const verifyPhoneOTP = async (req, res) => {
    return res.status(410).json({
        success: false,
        message: "Phone OTP verification is temporarily disabled for the current MVP."
    });
};

module.exports = {
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP
};
