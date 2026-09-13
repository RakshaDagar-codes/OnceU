const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fromUser, toUser, amount, session, type } = req.body;

    // Find both users
    const sender = await User.findById(fromUser);
    const receiver = await User.findById(toUser);

    if (!sender || !receiver) {
      return res.status(404).json({
        message: "Sender or receiver not found",
      });
    }

    // Check coin balance
    if (sender.coins < amount) {
      return res.status(400).json({
        message: "Insufficient coins",
      });
    }

    // Transfer coins
    sender.coins -= amount;
    receiver.coins += amount;

    await sender.save();
    await receiver.save();

    // Record transaction
    const transaction = await Transaction.create({
      fromUser,
      toUser,
      amount,
      session,
      type: type || "session_reward",
    });

    res.status(201).json({
      message: "Coins transferred successfully",
      transaction,
      senderBalance: sender.coins,
      receiverBalance: receiver.coins,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to transfer coins",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("fromUser", "name email")
      .populate("toUser", "name email");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
});

module.exports = router;