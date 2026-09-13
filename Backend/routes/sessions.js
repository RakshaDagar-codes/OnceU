const express = require("express");
const Session = require("../models/Session");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Create a new session
router.post("/", async (req, res) => {
  try {
    const {
      mentee,
      mentor,
      request,
      topic,
      communicationType,
      scheduledAt,
    } = req.body;

    // Validate communication type
    if (!["chat", "voice", "video"].includes(communicationType)) {
      return res.status(400).json({
        message: "Communication type must be chat, voice, or video",
      });
    }

    // Create session with default 10-minute duration
    const session = await Session.create({
      mentee,
      mentor,
      request,
      topic,
      communicationType,
      duration: 10,
      scheduledAt,
      status: "scheduled",
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create session",
      error: error.message,
    });
  }
});

// Start a session
router.put("/:id/start", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: "Only scheduled sessions can be started",
      });
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 10 * 60 * 1000);

    session.startedAt = startedAt;
    session.expiresAt = expiresAt;
    session.status = "active";

    await session.save();

    res.json({
      message: "Session started successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to start session",
      error: error.message,
    });
  }
});

// Check whether a session is still active
router.get("/:id/status", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    // If the 10-minute limit has passed
    if (
      session.status === "active" &&
      session.expiresAt &&
      new Date() >= session.expiresAt
    ) {
      session.status = "expired";
      await session.save();
    }

    res.json({
      sessionId: session._id,
      status: session.status,
      communicationType: session.communicationType,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      duration: session.duration,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to check session status",
      error: error.message,
    });
  }
});

// Update session status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Status must be completed or cancelled",
      });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        message: "Session is already completed",
      });
    }

    if (session.status === "cancelled") {
      return res.status(400).json({
        message: "Session is already cancelled",
      });
    }

    session.status = status;
    await session.save();

    // Reward mentor when session is completed
    if (status === "completed") {
      const rewardAmount = 50;

      const mentee = await User.findById(session.mentee);
      const mentor = await User.findById(session.mentor);

      if (!mentee || !mentor) {
        return res.status(404).json({
          message: "Mentee or mentor not found",
        });
      }

      if (mentee.coins < rewardAmount) {
        return res.status(400).json({
          message: "Mentee does not have enough coins for the session reward",
        });
      }

      mentee.coins -= rewardAmount;
      mentor.coins += rewardAmount;

      await mentee.save();
      await mentor.save();

      const transaction = await Transaction.create({
        fromUser: mentee._id,
        toUser: mentor._id,
        amount: rewardAmount,
        session: session._id,
        type: "session_reward",
      });

      return res.json({
        message: "Session completed and mentor rewarded successfully",
        session,
        transaction,
        menteeBalance: mentee.coins,
        mentorBalance: mentor.coins,
      });
    }

    res.json({
      message: "Session status updated successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update session",
      error: error.message,
    });
  }
});

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate("mentee", "name email")
      .populate("mentor", "name email");

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
});

module.exports = router;