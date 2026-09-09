const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User");
const connectionRoutes = require("./routes/connectionRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const otpRoutes = require("./routes/otpRoutes");
const bloodRoutes = require("./routes/bloodRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const emailActionRoutes = require("./routes/emailActionRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "CommunityConnect API is running"
    });
});

app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});

app.use("/api/connections", connectionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/email-actions", emailActionRoutes);

app.use((error, req, res, next) => {
    console.error("Unhandled API error:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
