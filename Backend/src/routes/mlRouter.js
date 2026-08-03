/**
 * mlRouter.js — Node.js routes that proxy to Python ML service
 * Handles: conversation starters, smart reply, compatibility report
 */
const express = require("express");
const mlRouter = express.Router();
const { userauth } = require("../middlewares/auth");
const { callML } = require("../utils/mlClient");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

// ── GET /ml/starters/:userId — Feature 4: Conversation Starters ──────────────
mlRouter.get("/ml/starters/:userId", userauth, async (req, res) => {
  try {
    const [myProfile, theirProfile] = await Promise.all([
      User.findById(req.user._id).select("firstName About Skills age").lean(),
      User.findById(req.params.userId).select("firstName About Skills age").lean(),
    ]);

    if (!theirProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await callML("/ml/conversation-starters", {
      myProfile,
      theirProfile,
    }, 8000);

    res.json({
      success: true,
      starters: result?.starters || [],
      shared_interests: result?.shared_interests || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get starters", error: err.message });
  }
});

// ── POST /ml/smart-reply — Feature 11: Smart Reply ───────────────────────────
mlRouter.post("/ml/smart-reply", userauth, async (req, res) => {
  try {
    const { conversation } = req.body;
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ message: "conversation array is required" });
    }

    const myProfile = await User.findById(req.user._id)
      .select("firstName Skills About")
      .lean();

    const result = await callML("/ml/smart-reply", {
      conversation,
      myProfile,
    }, 6000);

    res.json({
      success: true,
      replies: result?.replies || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get smart replies", error: err.message });
  }
});

// ── GET /ml/compatibility/:userId — Feature 10: Compatibility DNA ─────────────
mlRouter.get("/ml/compatibility/:userId", userauth, async (req, res) => {
  try {
    // Verify they are connected
    const conn = await ConnectionRequest.findOne({
      status: "accepted",
      $or: [
        { fromUserId: req.user._id, toUserId: req.params.userId },
        { fromUserId: req.params.userId, toUserId: req.user._id },
      ],
    });

    if (!conn) {
      return res.status(403).json({ message: "You are not connected with this user" });
    }

    const [user1, user2] = await Promise.all([
      User.findById(req.user._id).select("firstName About Skills age gender").lean(),
      User.findById(req.params.userId).select("firstName About Skills age gender").lean(),
    ]);

    if (!user2) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await callML("/ml/compatibility-report", {
      user1,
      user2,
    }, 10000);

    if (!result) {
      return res.json({ success: false, message: "ML service unavailable" });
    }

    res.json({ success: true, report: result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get compatibility report", error: err.message });
  }
});

// ── GET /profile/completeness — Feature 6: Profile Completion Score ───────────
mlRouter.get("/profile/completeness", userauth, async (req, res) => {
  try {
    const user = req.user;
    const result = await callML("/ml/profile-score", {
      profile: {
        photoUrl: user.photoUrl,
        About: user.About,
        age: user.age,
        gender: user.gender,
        Skills: user.Skills,
        isPremium: user.isPremium,
      },
    }, 5000);

    if (!result) {
      return res.json({ success: false, score: null, tips: [] });
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ message: "Failed to get profile score", error: err.message });
  }
});

// ── GET /ml/health — Check Python ML service status ──────────────────────────
mlRouter.get("/ml/health", userauth, async (req, res) => {
  try {
    const { isMLHealthy } = require("../utils/mlClient");
    const healthy = await isMLHealthy();
    res.json({ success: true, mlServiceOnline: healthy });
  } catch (err) {
    res.json({ success: false, mlServiceOnline: false });
  }
});

module.exports = mlRouter;
