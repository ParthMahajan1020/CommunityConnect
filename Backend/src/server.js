const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User");
const connectionRoutes = require("./routes/connectionRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const bloodRoutes = require("./routes/bloodRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const emailActionRoutes = require("./routes/emailActionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
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
app.use("/api/blood", bloodRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/email-actions", emailActionRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use((error, req, res, next) => {
    console.error("Unhandled API error:", error.message);
    res.status(500).json({ message: "Something went wrong. Please try again." });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
