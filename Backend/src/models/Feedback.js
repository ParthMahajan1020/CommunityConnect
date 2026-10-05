const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        userType: {
            type: String,
            enum: [
                "Blood Donor",
                "Blood Seeker",
                "Local Service Provider",
                "Local Service Seeker",
            ],
            required: true,
        },

        easeOfUse: {
            type: String,
            enum: [
                "Very Easy",
                "Easy",
                "Average",
                "Difficult",
                "Very Difficult",
            ],
            required: true,
        },

        websiteUnderstanding: {
            type: String,
            enum: [
                "Very Easy",
                "Easy",
                "Average",
                "Difficult",
                "Very Difficult",
            ],
            required: true,
        },

        usefulness: {
            type: String,
            enum: [
                "Very Useful",
                "Useful",
                "Average",
                "Not Very Useful",
                "Not Useful",
            ],
            required: true,
        },

        findingOption: {
            type: String,
            enum: [
                "Very Easy",
                "Easy",
                "Average",
                "Difficult",
                "Very Difficult",
                "Not Applicable",
            ],
            required: true,
        },

        designRating: {
            type: String,
            enum: [
                "Excellent",
                "Good",
                "Average",
                "Poor",
                "Very Poor",
            ],
            required: true,
        },

        overallExperience: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },

        communityUsefulness: {
            type: String,
            enum: [
                "Definitely Yes",
                "Probably Yes",
                "Not Sure",
                "Probably No",
                "Definitely No",
            ],
            required: true,
        },

        useAgain: {
            type: String,
            enum: [
                "Yes",
                "Maybe",
                "No",
            ],
            required: true,
        },

        recommend: {
            type: String,
            enum: [
                "Definitely Yes",
                "Probably Yes",
                "Not Sure",
                "Probably No",
                "Definitely No",
            ],
            required: true,
        },

        additionalFeedback: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Feedback", feedbackSchema);