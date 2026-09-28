const BloodDonor = require("../models/BloodDonor");
const ServiceProvider = require("../models/ServiceProvider");
const Job = require("../models/Job");
const { getNearbyLocations } = require("../utils/locationHelper");

const compatibleDonorGroups = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],

    "A-": ["A-", "O-"],
    "A+": ["A-", "A+", "O-", "O+"],

    "B-": ["B-", "O-"],
    "B+": ["B-", "B+", "O-", "O+"],

    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": [
        "AB-",
        "AB+",
        "A-",
        "A+",
        "B-",
        "B+",
        "O-",
        "O+"
    ]
};

const findMatches = async (type, requirement, location) => {

    const searchLocation = location.trim();

    // BLOOD MATCHING

    if (type === "BLOOD") {

        const bloodGroup = requirement.trim().toUpperCase();

        const compatibleGroups = compatibleDonorGroups[bloodGroup];

        if (!compatibleGroups) {
            throw new Error("Invalid blood group");
        }

        // 1. Exact location
        let donors = await BloodDonor.find({
            bloodGroup: { $in: compatibleGroups },
            availability: true,
            location: {
                $regex: `^${searchLocation}$`,
                $options: "i"
            }
        }).populate("userId", "name email phone");

        if (donors.length > 0) {
            return donors;
        }

        // 2. Nearby locations
        const nearby = getNearbyLocations(searchLocation);

        donors = await BloodDonor.find({
            bloodGroup: { $in: compatibleGroups },
            availability: true,
            location: { $in: nearby }
        }).populate("userId", "name email phone");

        if (donors.length > 0) {
            return donors;
        }

        // 3. All available compatible donors
        donors = await BloodDonor.find({
            bloodGroup: { $in: compatibleGroups },
            availability: true
        }).populate("userId", "name email phone");

        return donors;
    }

    // SERVICE MATCHING

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

    // JOB MATCHING

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