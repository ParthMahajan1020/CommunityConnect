const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const {
    registerServiceProvider,
    getMyServiceProviderProfile,
    toggleProviderAvailability
} = require("../controllers/serviceController");

const router = express.Router();

router.get("/me", authMiddleware, getMyServiceProviderProfile);
router.post("/register", authMiddleware, registerServiceProvider);
router.patch("/availability", authMiddleware, toggleProviderAvailability);

module.exports = router;
