const BloodDonor = require("../models/BloodDonor");
const ServiceProvider = require("../models/ServiceProvider");
const Job = require("../models/Job");
const { getNearbyLocations } = require("../utils/locationHelper");

const findMatches = async (type, requirement, location) => {

    const searchLocation = location.trim();

    if (type === "BLOOD") {

        const bloodGroup = requirement.trim().toUpperCase();

        let donors = await BloodDonor.find({
            bloodGroup,
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone");

        if (donors.length > 0) {
            return donors;
        }

        const nearby = getNearbyLocations(searchLocation);

        donors = await BloodDonor.find({
            bloodGroup,
            availability: true,
            location: { $in: nearby }
        }).populate("userId", "name email phone");

        if (donors.length > 0) {
            return donors;
        }

        donors = await BloodDonor.find({
            bloodGroup,
            availability: true
        }).populate("userId", "name email phone");

        return donors;
    }

    if (type === "SERVICE") {

        const serviceType = requirement.trim();

        let providers = await ServiceProvider.find({
            serviceType: {
                $regex: `^${serviceType}$`,
                $options: "i"
            },
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone");

        if (providers.length > 0) {
            return providers;
        }

        const nearby = getNearbyLocations(searchLocation);

        providers = await ServiceProvider.find({
            serviceType: {
                $regex: `^${serviceType}$`,
                $options: "i"
            },
            availability: true,
            location: {
                $in: nearby
            }
        }).populate("userId", "name email phone");

        return providers;
    }

    if (type === "JOB") {

        const jobType = requirement.trim();

        let jobs = await Job.find({
            jobType: {
                $regex: `^${jobType}$`,
                $options: "i"
            },
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone");

        if (jobs.length > 0) {
            return jobs;
        }

        const nearby = getNearbyLocations(searchLocation);

        jobs = await Job.find({
            jobType: {
                $regex: `^${jobType}$`,
                $options: "i"
            },
            availability: true,
            location: {
                $in: nearby
            }
        }).populate("userId", "name email phone");

        return jobs;
    }

    throw new Error("Invalid connection type");
};

module.exports = {
    findMatches
};