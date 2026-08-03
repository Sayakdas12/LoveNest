/**
 * ModerationLog.js — MongoDB model for flagged messages (Feature 2)
 * Stores toxicity-blocked messages for admin review.
 */
const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    text: {
      type: String,
      required: true,
    },
    scores: {
      type: Object,
      default: {},
    },
    maxLabel: {
      type: String,
      default: "toxic",
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    action: {
      type: String,
      enum: ["blocked", "warned"],
      default: "blocked",
    },
    reviewedByAdmin: {
      type: Boolean,
      default: false,
    },
    adminNote: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for admin queries
moderationLogSchema.index({ userId: 1, createdAt: -1 });
moderationLogSchema.index({ reviewedByAdmin: 1 });

module.exports = mongoose.model("ModerationLog", moderationLogSchema);
