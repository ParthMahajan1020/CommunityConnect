const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);

router.put("/me", authMiddleware, updateProfile);

module.exports = router;