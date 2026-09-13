const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    topic: {
      type: String,
      required: true,
    },

    communicationType: {
      type: String,
      enum: ["chat", "voice", "video"],
      required: true,
    },

    duration: {
      type: Number,
      default: 10,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled", "expired"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Session", sessionSchema);