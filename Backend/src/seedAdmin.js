const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");

const seedAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("MONGO_URI is required in environment to seed admin.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const adminEmail = process.env.ADMIN_SEED_EMAIL;
        const adminPassword = process.env.ADMIN_SEED_PASSWORD;
        const adminName = process.env.ADMIN_SEED_NAME;
        const adminPhone = process.env.ADMIN_SEED_PHONE;

        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase().trim() });

        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        if (existingAdmin) {
            existingAdmin.role = "ADMIN";
            existingAdmin.accountStatus = "ACTIVE";
            existingAdmin.emailVerified = true;
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log(`Admin user [${adminEmail}] successfully updated.`);
        } else {
            await User.create({
                name: adminName,
                email: adminEmail.toLowerCase().trim(),
                phone: adminPhone,
                location: "Central Administration",
                password: hashedPassword,
                role: "ADMIN",
                accountStatus: "ACTIVE",
                emailVerified: true
            });
            console.log(`Admin user [${adminEmail}] successfully created.`);
        }

        await mongoose.connection.close();
        console.log("Admin seed completed successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Admin seed error:", error.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

seedAdmin();