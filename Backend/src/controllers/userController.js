const User = require("../models/User");
const BloodDonor = require("../models/BloodDonor");
const ServiceProvider = require("../models/ServiceProvider");

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Fetch donor & service provider statuses if available
        const [donor, provider] = await Promise.all([
            BloodDonor.findOne({ userId: req.userId }),
            ServiceProvider.findOne({ userId: req.userId })
        ]);

        res.status(200).json({
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage,
                role: user.role || 'PUBLIC_USER',
                accountStatus: user.accountStatus || 'ACTIVE',
                organizationStatus: user.organizationStatus,
                organizationName: user.organizationName,
                address: user.address,
                bio: user.bio,
                donorInfo: donor ? {
                    isDonor: true,
                    bloodGroup: donor.bloodGroup,
                    availability: donor.availability,
                    verificationStatus: donor.verificationStatus,
                    reportDocument: donor.reportDocument,
                    hasReportLater: donor.hasReportLater
                } : { isDonor: false },
                providerInfo: provider ? {
                    isProvider: true,
                    serviceType: provider.serviceType,
                    availability: provider.availability,
                    rateType: provider.rateType,
                    description: provider.description
                } : { isProvider: false }
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
            error: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, location, profileImage, bio, address } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (location) user.location = location.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio.trim();
        if (address !== undefined) user.address = address.trim();

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                profileImage: user.profileImage,
                role: user.role,
                accountStatus: user.accountStatus,
                organizationStatus: user.organizationStatus,
                bio: user.bio,
                address: user.address
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
