const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Get all messages for a session
router.get("/:sessionId", async (req, res) => {
  try {
    const messages = await Message.find({
      session: req.params.sessionId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

module.exports = router;