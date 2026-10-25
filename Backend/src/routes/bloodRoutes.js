const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const {
    registerBloodDonor,
    getMyDonorProfile,
    toggleDonorAvailability
} = require("../controllers/bloodController");

const router = express.Router();

router.get("/me", authMiddleware, getMyDonorProfile);
router.post("/register", authMiddleware, registerBloodDonor);
router.patch("/availability", authMiddleware, toggleDonorAvailability);

module.exports = router;
