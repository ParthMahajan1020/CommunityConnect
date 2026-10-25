const BloodDonor = require("../models/BloodDonor");
const User = require("../models/User");

const registerBloodDonor = async (req, res) => {
    try {
        const {
            bloodGroup,
            location,
            availability = true,
            reportDocument = '',
            hasReportLater = false
        } = req.body;
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

        const normalizedBloodGroup = bloodGroup.toUpperCase();
        if (!["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(normalizedBloodGroup)) {
            return res.status(400).json({ message: "Invalid blood group." });
        }

        let existingDonor = await BloodDonor.findOne({ userId });

        const verificationStatus = (reportDocument && reportDocument.trim().length > 0) ? 'VERIFIED' : 'UNVERIFIED';

        if (existingDonor) {
            // Update existing donor registration
            existingDonor.bloodGroup = normalizedBloodGroup;
            existingDonor.location = location.trim();
            existingDonor.availability = Boolean(availability);
            existingDonor.contact = user.phone;
            if (reportDocument) existingDonor.reportDocument = reportDocument.trim();
            existingDonor.hasReportLater = Boolean(hasReportLater);
            existingDonor.verificationStatus = verificationStatus;

            await existingDonor.save();

            return res.status(200).json({
                message: "Blood donor profile updated successfully.",
                donor: existingDonor
            });
        }

        const donor = await BloodDonor.create({
            userId,
            bloodGroup: normalizedBloodGroup,
            location: location.trim(),
            availability: Boolean(availability),
            contact: user.phone,
            reportDocument: reportDocument ? reportDocument.trim() : '',
            hasReportLater: Boolean(hasReportLater),
            verificationStatus
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

const getMyDonorProfile = async (req, res) => {
    try {
        const donor = await BloodDonor.findOne({ userId: req.userId });
        return res.status(200).json({ donor });
    } catch (error) {
        return res.status(500).json({ message: "Failed to load donor profile.", error: error.message });
    }
};

const toggleDonorAvailability = async (req, res) => {
    try {
        const donor = await BloodDonor.findOne({ userId: req.userId });
        if (!donor) {
            return res.status(404).json({ message: "No blood donor profile found for this user." });
        }

        donor.availability = !donor.availability;
        await donor.save();

        return res.status(200).json({
            message: `Donor availability updated to ${donor.availability ? 'Available' : 'Paused'}.`,
            donor
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to toggle donor availability.", error: error.message });
    }
};

module.exports = {
    registerBloodDonor,
    getMyDonorProfile,
    toggleDonorAvailability
};
