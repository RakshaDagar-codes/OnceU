const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    branch: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    coins: {
      type: Number,
      default: 500,
    },

    rating: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["mentor", "mentee"],
      default: "mentee",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);