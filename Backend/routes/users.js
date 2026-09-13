const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      branch,
      year,
      skills,
      role,
    } = req.body;

    // Check that email is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check IGDTUW email domain
    const collegeDomain = process.env.COLLEGE_EMAIL_DOMAIN;

    if (!normalizedEmail.endsWith(`@${collegeDomain}`)) {
      return res.status(403).json({
        message: "Only IGDTUW email addresses are allowed",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      branch,
      year,
      skills,
      role,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

module.exports = router;