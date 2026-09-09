const ServiceProvider = require("../models/ServiceProvider");
const User = require("../models/User");

const registerServiceProvider = async (req, res) => {
    try {
        const {
            serviceType,
            location,
            availability = true
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

        const existingProvider = await ServiceProvider.findOne({
            userId
        });

        if (existingProvider) {
            return res.status(409).json({
                message:
                    "You are already registered as a service provider",
                provider: existingProvider
            });
        }

        const provider = await ServiceProvider.create({
            userId,
            serviceType: serviceType.trim(),
            location: location.trim(),
            availability,
            contact: user.phone
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

module.exports = {
    registerServiceProvider
};
