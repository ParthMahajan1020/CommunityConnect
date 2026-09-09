const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
    registerBloodDonor
} = require("../controllers/bloodController");

const router = express.Router();

router.post("/register", authMiddleware, registerBloodDonor);

module.exports = router;
