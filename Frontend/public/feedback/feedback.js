const API_BASE_URL =
    window.__APP_CONFIG__?.API_BASE_URL ||
    (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://communityconnect-backend-2vy1.onrender.com/api");

const feedbackForm = document.getElementById("feedbackForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");
const buttonText = document.getElementById("buttonText");
const buttonLoader = document.getElementById("buttonLoader");
const additionalFeedback = document.getElementById("additionalFeedback");
const characterCount = document.getElementById("characterCount");

additionalFeedback.addEventListener("input", () => {
    characterCount.textContent = additionalFeedback.value.length;
});

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function setLoading(isLoading) {
    submitButton.disabled = isLoading;

    if (isLoading) {
        buttonText.textContent = "Submitting...";
        buttonLoader.classList.remove("hidden");
    } else {
        buttonText.textContent = "Submit Feedback";
        buttonLoader.classList.add("hidden");
    }
}

function getRadioValue(name) {
    const selected = document.querySelector(
        `input[name="${name}"]:checked`
    );

    return selected ? selected.value : null;
}

feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    showMessage("", "");

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    if (!token) {
        showMessage(
            "Please log in before submitting feedback.",
            "error"
        );
        return;
    }

    const feedbackData = {
        userType: getRadioValue("userType"),
        easeOfUse: getRadioValue("easeOfUse"),
        websiteUnderstanding: getRadioValue("websiteUnderstanding"),
        usefulness: getRadioValue("usefulness"),
        findingOption: getRadioValue("findingOption"),
        designRating: getRadioValue("designRating"),
        overallExperience: Number(
            getRadioValue("overallExperience")
        ),
        communityUsefulness: getRadioValue("communityUsefulness"),
        useAgain: getRadioValue("useAgain"),
        recommend: getRadioValue("recommend"),
        additionalFeedback: additionalFeedback.value.trim()
    };

    const requiredFields = [
        feedbackData.userType,
        feedbackData.easeOfUse,
        feedbackData.websiteUnderstanding,
        feedbackData.usefulness,
        feedbackData.findingOption,
        feedbackData.designRating,
        feedbackData.overallExperience,
        feedbackData.communityUsefulness,
        feedbackData.useAgain,
        feedbackData.recommend
    ];

    if (
        requiredFields.some(
            (value) =>
                value === null ||
                value === undefined ||
                value === ""
        )
    ) {
        showMessage(
            "Please answer all required questions.",
            "error"
        );
        return;
    }

    try {
        setLoading(true);

        const response = await fetch(
            `${API_BASE_URL}/feedback`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(feedbackData)
            }
        );

        const responseText = await response.text();

        let data = {};

        if (responseText.trim()) {
            try {
                data = JSON.parse(responseText);
            } catch {
                console.error(
                    "Server returned invalid JSON:",
                    responseText
                );
            }
        }

        console.log("Feedback response:", {
            status: response.status,
            url: response.url,
            data
        });

        if (!response.ok) {
            throw new Error(
                data.message ||
                `Feedback submission failed. Server returned ${response.status}.`
            );
        }

        showMessage(
            "Thank you! Your feedback has been submitted successfully.",
            "success"
        );

        feedbackForm.reset();
        characterCount.textContent = "0";

    } catch (error) {
        console.error(
            "Feedback submission error:",
            error
        );

        showMessage(
            error.message ||
            "Something went wrong. Please try again.",
            "error"
        );
    } finally {
        setLoading(false);
    }
});