const express = require("express");
const { handleRequestAction } = require("../controllers/emailActionController");
const router = express.Router();
router.get("/:token", handleRequestAction);
module.exports = router;
