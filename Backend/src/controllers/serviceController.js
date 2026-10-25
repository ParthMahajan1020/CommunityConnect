const ServiceProvider = require("../models/ServiceProvider");
const User = require("../models/User");

const registerServiceProvider = async (req, res) => {
    try {
        const {
            serviceType,
            location,
            availability = true,
            rateType = "Hourly",
            description = ""
        } = req.body;
        const userId = req.userId;

        if (!serviceType?.trim() || !location?.trim()) {
            return res.status(400).json({
                message: "Service type and location are required."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let existingProvider = await ServiceProvider.findOne({
            userId
        });

        const validRateTypes = ["Hourly", "Daily", "Monthly"];
        const sanitizedRateType = validRateTypes.includes(rateType) ? rateType : "Hourly";

        if (existingProvider) {
            // Update existing provider registration
            existingProvider.serviceType = serviceType.trim();
            existingProvider.location = location.trim();
            existingProvider.availability = Boolean(availability);
            existingProvider.rateType = sanitizedRateType;
            existingProvider.description = description ? description.trim() : "";
            existingProvider.contact = user.phone;

            await existingProvider.save();

            return res.status(200).json({
                message: "Community service provider profile updated successfully.",
                provider: existingProvider
            });
        }

        const provider = await ServiceProvider.create({
            userId,
            serviceType: serviceType.trim(),
            location: location.trim(),
            availability: Boolean(availability),
            contact: user.phone,
            rateType: sanitizedRateType,
            description: description ? description.trim() : "",
            status: "ACTIVE"
        });

        res.status(201).json({
            message: "Service provider registered successfully",
            provider
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to register as service provider",
            error: error.message
        });
    }
};

const getMyServiceProviderProfile = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ userId: req.userId });
        return res.status(200).json({ provider });
    } catch (error) {
        return res.status(500).json({ message: "Failed to load provider profile.", error: error.message });
    }
};

const toggleProviderAvailability = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ userId: req.userId });
        if (!provider) {
            return res.status(404).json({ message: "No service provider profile found." });
        }

        provider.availability = !provider.availability;
        await provider.save();

        return res.status(200).json({
            message: `Service provider availability updated to ${provider.availability ? 'Active' : 'Paused'}.`,
            provider
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to toggle availability.", error: error.message });
    }
};

module.exports = {
    registerServiceProvider,
    getMyServiceProviderProfile,
    toggleProviderAvailability
};
