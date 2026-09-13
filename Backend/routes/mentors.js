const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" });

    res.json(mentors);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch mentors",
      error: error.message,
    });
  }
});

module.exports = router;