const express = require("express");
const Request = require("../models/Request");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const request = await Request.create(req.body);

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create request",
      error: error.message,
    });
  }
});

module.exports = router;
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected",
      });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update request",
      error: error.message,
    });
  }
});