const express = require("express");
const Rating = require("../models/Rating");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { session, mentee, mentor, rating, feedback } = req.body;

    const newRating = await Rating.create({
      session,
      mentee,
      mentor,
      rating,
      feedback,
    });

    // Get all ratings for this mentor
    const mentorRatings = await Rating.find({ mentor });

    // Calculate average rating
    const totalRating = mentorRatings.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating = totalRating / mentorRatings.length;

    // Update mentor's rating
    await User.findByIdAndUpdate(mentor, {
      rating: Number(averageRating.toFixed(2)),
    });

    res.status(201).json({
      message: "Rating added successfully",
      rating: newRating,
      mentorRating: Number(averageRating.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create rating",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("mentee", "name email")
      .populate("mentor", "name email");

    res.json(ratings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch ratings",
      error: error.message,
    });
  }
});

module.exports = router;