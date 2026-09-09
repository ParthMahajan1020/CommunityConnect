const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const BloodDonor = require("./models/BloodDonor");
const ServiceProvider = require("./models/ServiceProvider");
const Job = require("./models/Job");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        await BloodDonor.deleteMany({});
        await ServiceProvider.deleteMany({});
        await Job.deleteMany({});

        await User.deleteMany({
            email: {
                $in: [
                    "parth@test.com",
                    "pranav@test.com",
                    "yogesh@test.com"
                ]
            }
        });

        const users = await User.insertMany([
            {
                name: "Parth Mahajan",
                email: "parth@test.com",
                phone: "9876543210",
                location: "Akurdi"
            },
            {
                name: "Pranav Limbole",
                email: "pranav@test.com",
                phone: "9876543212",
                location: "Akurdi"
            },
            {
                name: "Yogesh Patil",
                email: "yogesh@test.com",
                phone: "9876543213",
                location: "Pimpri"
            }
        ]);

        console.log("Users created");

        await BloodDonor.create({
            userId: users[0]._id,
            bloodGroup: "O+",
            location: "Akurdi",
            availability: true,
            contact: users[0].phone
        });

        await ServiceProvider.create({
            userId: users[1]._id,
            serviceType: "Plumber",
            location: "Akurdi",
            availability: true,
            contact: users[1].phone
        });

        await Job.create({
            userId: users[2]._id,
            jobType: "Plumber",
            location: "Pimpri",
            availability: true,
            contact: users[2].phone
        });

        console.log("Test data created successfully");

        await mongoose.connection.close();

    } catch (error) {
        console.error("Seed error:", error.message);
        await mongoose.connection.close();
    }
};

seedDatabase();