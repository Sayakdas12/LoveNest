/**
 * churnJob.js — Nightly churn prediction cron job (Feature 5)
 * Runs at 2:00 AM every night via node-cron.
 * Aggregates user behavioral signals → calls Python ML → writes churnRisk to DB.
 * Also sends Firebase push notifications to at-risk users.
 */
const cron = require("node-cron");
const User = require("../models/user");
const Message = require("../models/message");
const ConnectionRequest = require("../models/connectionRequest");
const { callML } = require("../utils/mlClient");

// Lazy-load Firebase to avoid breaking server if Firebase is not configured
function getFirebaseAdmin() {
  try {
    const { getAdminApp } = require("../utils/firebase-admin");
    return getAdminApp();
  } catch {
    return null;
  }
}

async function computeUserFeatures(user) {
  const userId = user._id;
  const now = new Date();

  // Days since last login (use updatedAt as proxy or lastSeen)
  const lastActive = user.lastSeen || user.updatedAt || user.createdAt;
  const daysSinceLastLogin = (now - lastActive) / (1000 * 60 * 60 * 24);

  // Messages sent in last 7 days
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const messagesLast7Days = await Message.countDocuments({
    senderId: userId,
    createdAt: { $gte: sevenDaysAgo },
  });

  // Like ratio from connection requests
  const [likes, ignores] = await Promise.all([
    ConnectionRequest.countDocuments({ fromUserId: userId, status: "interested" }),
    ConnectionRequest.countDocuments({ fromUserId: userId, status: "ignored" }),
  ]);
  const totalSwipes = likes + ignores;
  const likeRatio = totalSwipes > 0 ? likes / totalSwipes : 0.5;

  // Connection count
  const connectionCount = await ConnectionRequest.countDocuments({
    status: "accepted",
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  });

  // Account age in days
  const accountAgeDays = (now - user.createdAt) / (1000 * 60 * 60 * 24);

  // Profile completeness (reuse simple scoring)
  let completeness = 0;
  if (user.photoUrl && !user.photoUrl.includes("bbdu.ac.in")) completeness += 20;
  if (user.About && user.About.length >= 50) completeness += 20;
  if (user.age) completeness += 15;
  if (user.gender) completeness += 10;
  if (user.Skills && user.Skills.length >= 3) completeness += 15;
  if (user.isPremium) completeness += 20;

  return {
    userId: userId.toString(),
    daysSinceLastLogin: Math.round(daysSinceLastLogin),
    messagesLast7Days,
    likeRatio: Math.round(likeRatio * 100) / 100,
    profileCompleteness: completeness,
    connectionCount,
    isPremium: user.isPremium || false,
    accountAgeDays: Math.round(accountAgeDays),
  };
}

async function runChurnJob() {
  console.log("[ChurnJob] Starting nightly churn prediction...");
  try {
    // Fetch all active users (not suspended)
    const users = await User.find({
      isSuspended: { $ne: true },
    })
      .select("_id firstName emailId photoUrl About age gender Skills isPremium lastSeen createdAt updatedAt")
      .lean();

    console.log(`[ChurnJob] Processing ${users.length} users...`);

    // Build features for each user
    const featurePromises = users.map((u) => computeUserFeatures(u));
    const userFeatures = await Promise.all(featurePromises);

    // Call Python ML in batches of 100 to avoid huge payloads
    const BATCH_SIZE = 100;
    const atRiskUserIds = [];

    for (let i = 0; i < userFeatures.length; i += BATCH_SIZE) {
      const batch = userFeatures.slice(i, i + BATCH_SIZE);
      const result = await callML("/ml/predict-churn", { users: batch }, 30000);

      if (!result?.predictions) continue;

      // Write churnRisk back to MongoDB
      for (const pred of result.predictions) {
        await User.findByIdAndUpdate(pred.userId, {
          churnRisk: pred.risk,
          churnScore: pred.score,
        });
        if (pred.risk === "at-risk") {
          atRiskUserIds.push(pred.userId);
        }
      }
    }

    console.log(
      `[ChurnJob] Done. At-risk users: ${atRiskUserIds.length}/${users.length}`
    );

    // Send push notifications to at-risk users (if Firebase configured)
    const firebaseApp = getFirebaseAdmin();
    if (firebaseApp && atRiskUserIds.length > 0) {
      const { createNotification } = require("../routes/notificationRouter");
      for (const userId of atRiskUserIds.slice(0, 50)) { // Limit to 50 per run
        await createNotification({
          userId,
          type: "re_engagement",
          data: { message: "New matches are waiting for you! 💕" },
        }).catch(() => {});
      }
      console.log(`[ChurnJob] Push notifications sent to ${Math.min(atRiskUserIds.length, 50)} at-risk users.`);
    }
  } catch (err) {
    console.error("[ChurnJob] Error:", err.message);
  }
}

/**
 * Start the nightly churn cron job.
 * Called from app.js after server starts.
 */
function startChurnJob() {
  // Run every night at 2:00 AM
  cron.schedule("0 2 * * *", () => {
    runChurnJob();
  });
  console.log("  ⏰  Churn Job  Scheduled nightly at 2:00 AM");
}

module.exports = { startChurnJob, runChurnJob };
