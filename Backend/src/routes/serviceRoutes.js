const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    registerServiceProvider
} = require("../controllers/serviceController");

const router = express.Router();

router.post("/register", authMiddleware, registerServiceProvider);

module.exports = router;
