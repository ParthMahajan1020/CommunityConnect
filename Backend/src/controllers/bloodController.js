const BloodDonor = require("../models/BloodDonor");
const User = require("../models/User");

const registerBloodDonor = async (req, res) => {
    try {
        const { bloodGroup, location, availability = true } = req.body;
        const userId = req.userId;

        if (!bloodGroup || !location?.trim()) {
            return res.status(400).json({
                message: "Blood group and location are required."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existingDonor = await BloodDonor.findOne({ userId });

        if (existingDonor) {
            return res.status(409).json({
                message: "You are already registered as a blood donor",
                donor: existingDonor
            });
        }

        const normalizedBloodGroup = bloodGroup.toUpperCase();
        if (!["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(normalizedBloodGroup)) {
            return res.status(400).json({ message: "Invalid blood group." });
        }

        const donor = await BloodDonor.create({
            userId,
            bloodGroup: normalizedBloodGroup,
            location: location.trim(),
            availability,
            contact: user.phone
        });

        res.status(201).json({
            message: "Blood donor registered successfully",
            donor
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register blood donor",
            error: error.message
        });
    }
};

module.exports = {
    registerBloodDonor
};
