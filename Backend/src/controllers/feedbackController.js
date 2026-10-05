const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
    try {
        const {
            userType,
            easeOfUse,
            websiteUnderstanding,
            usefulness,
            findingOption,
            designRating,
            overallExperience,
            communityUsefulness,
            useAgain,
            recommend,
            additionalFeedback,
        } = req.body;

        // Validate required fields
        if (
            !userType ||
            !easeOfUse ||
            !websiteUnderstanding ||
            !usefulness ||
            !findingOption ||
            !designRating ||
            !overallExperience ||
            !communityUsefulness ||
            !useAgain ||
            !recommend
        ) {
            return res.status(400).json({
                success: false,
                message: "Please answer all required questions.",
            });
        }

        // Prevent duplicate feedback
        const existingFeedback = await Feedback.findOne({
            userId: req.userId,
        });

        if (existingFeedback) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted your feedback.",
            });
        }

        // Create feedback
        const feedback = await Feedback.create({
            userId: req.userId,

            userType,
            easeOfUse,
            websiteUnderstanding,
            usefulness,
            findingOption,
            designRating,

            overallExperience: Number(overallExperience),

            communityUsefulness,
            useAgain,
            recommend,

            additionalFeedback:
                additionalFeedback || "",
        });

        return res.status(201).json({
            success: true,
            message:
                "Thank you! Your feedback has been submitted successfully.",
            feedbackId: feedback._id,
        });

    } catch (error) {
        console.error(
            "Feedback submission error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit feedback.",
        });
    }
};

module.exports = {
    submitFeedback,
};