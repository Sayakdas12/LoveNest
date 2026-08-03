/**
 * test_ml_features.js
 * End-to-end integration test runner for all 12 LoveNest ML Features using REAL data from MongoDB.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { callML, isMLHealthy } = require("./src/utils/mlClient");
const User = require("./src/models/user");
const Message = require("./src/models/message");
const ConnectionRequest = require("./src/models/connectionRequest");

async function runTests() {
  console.log("\n🧪 ─────────────────────────────────────────────────────────");
  console.log("   LoveNest ML Integration — End-to-End Real Data Test Suite");
  console.log("   ─────────────────────────────────────────────────────────\n");

  // 1. Database Connection
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    console.error("❌ MONGODB_URI missing in .env");
    process.exit(1);
  }
  await mongoose.connect(dbUri);
  console.log("✅ 1. MongoDB Connected successfully.");

  // 2. ML Service Health
  const healthy = await isMLHealthy();
  if (!healthy) {
    console.error("❌ 2. ML Service Health Check FAILED. Is Python running on port 8000?");
    process.exit(1);
  }
  console.log("✅ 2. Python ML Service Health Check PASSED (port 8000 online).");

  // 3. Fetch Real Users from Database
  const realUsers = await User.find({}).limit(10).lean();
  if (realUsers.length === 0) {
    console.error("❌ No real users found in database.");
    process.exit(1);
  }
  console.log(`✅ 3. Loaded ${realUsers.length} real users from MongoDB.`);

  const primaryUser = realUsers[0];
  const candidateUsers = realUsers.slice(1);
  console.log(`   Primary test user: ${primaryUser.firstName} ${primaryUser.lastName || ''} (ID: ${primaryUser._id})`);

  let successCount = 0;
  let failCount = 0;

  function report(featureName, success, details) {
    if (success) {
      successCount++;
      console.log(`  [PASS] ${featureName}`);
      if (details) console.log(`         -> ${details}`);
    } else {
      failCount++;
      console.log(`  [FAIL] ${featureName}`);
      if (details) console.log(`         -> ${details}`);
    }
  }

  console.log("\n── Testing 12 ML Features ──────────────────────────────────\n");

  // Feature 1: Smart Match Scoring
  try {
    const res1 = await callML("/ml/match-score", {
      user: {
        _id: primaryUser._id.toString(),
        firstName: primaryUser.firstName,
        Skills: primaryUser.Skills || [],
        age: primaryUser.age,
        About: primaryUser.About || "",
      },
      candidates: candidateUsers,
    });
    const ok1 = Array.isArray(res1?.ranked) && res1.ranked.length > 0 && typeof res1.ranked[0].matchScore === "number";
    report("Feature 1: Smart Match Scoring", ok1, ok1 ? `Top match: ${res1.ranked[0].firstName} (${res1.ranked[0].matchScore}% match score)` : JSON.stringify(res1));
  } catch (e) {
    report("Feature 1: Smart Match Scoring", false, e.message);
  }

  // Feature 2: Message Toxicity Moderation
  try {
    const cleanText = "Hey! Great to connect with you, hope you're having a wonderful day!";
    const toxicText = "You are so stupid and ugly, shut up";

    const res2Clean = await callML("/ml/moderate-text", { text: cleanText });
    const res2Toxic = await callML("/ml/moderate-text", { text: toxicText });

    const ok2 = res2Clean && !res2Clean.is_toxic && res2Toxic && res2Toxic.is_toxic;
    report("Feature 2: Message Toxicity Moderation", ok2, ok2 ? `Clean msg toxic=false (${res2Clean.max_score}), Toxic msg toxic=true (${res2Toxic.max_score}, label: ${res2Toxic.max_label})` : `Clean: ${JSON.stringify(res2Clean)}, Toxic: ${JSON.stringify(res2Toxic)}`);
  } catch (e) {
    report("Feature 2: Message Toxicity Moderation", false, e.message);
  }

  // Feature 3: Photo Quality Analyzer
  try {
    const photoUrl = primaryUser.photoUrl || "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const res3 = await callML("/ml/analyze-photo", { image_url: photoUrl });
    const ok3 = res3 && typeof res3.quality_score === "number" && Array.isArray(res3.suggestions);
    report("Feature 3: Photo Quality Analyzer", ok3, ok3 ? `Photo score: ${res3.quality_score}/100, Grade: ${res3.grade}, Faces: ${res3.face_count}` : JSON.stringify(res3));
  } catch (e) {
    report("Feature 3: Photo Quality Analyzer", false, e.message);
  }

  // Feature 4: Conversation Starters (Groq AI)
  try {
    const secondUser = candidateUsers[0] || primaryUser;
    const res4 = await callML("/ml/conversation-starters", {
      myProfile: { firstName: primaryUser.firstName, About: primaryUser.About, Skills: primaryUser.Skills, age: primaryUser.age },
      theirProfile: { firstName: secondUser.firstName, About: secondUser.About, Skills: secondUser.Skills, age: secondUser.age },
    });
    const ok4 = res4 && Array.isArray(res4.starters) && res4.starters.length >= 1;
    report("Feature 4: AI Conversation Starters", ok4, ok4 ? `Generated ${res4.starters.length} starters. Sample: "${res4.starters[0]}"` : JSON.stringify(res4));
  } catch (e) {
    report("Feature 4: AI Conversation Starters", false, e.message);
  }

  // Feature 5: Churn Prediction
  try {
    const sampleBatch = realUsers.map((u) => ({
      userId: u._id.toString(),
      daysSinceLastLogin: 5,
      messagesLast7Days: 12,
      likeRatio: 0.7,
      profileCompleteness: 85,
      connectionCount: 3,
      isPremium: u.isPremium || false,
      accountAgeDays: 30,
    }));

    const res5 = await callML("/ml/predict-churn", { users: sampleBatch });
    const ok5 = res5 && Array.isArray(res5.predictions) && res5.predictions.length === sampleBatch.length;
    report("Feature 5: Churn Prediction", ok5, ok5 ? `Evaluated ${res5.predictions.length} users. Risk sample: ${res5.predictions[0].risk} (score: ${res5.predictions[0].score})` : JSON.stringify(res5));
  } catch (e) {
    report("Feature 5: Churn Prediction", false, e.message);
  }

  // Feature 6: Profile Completion Advisor
  try {
    const res6 = await callML("/ml/profile-score", {
      profile: {
        photoUrl: primaryUser.photoUrl,
        About: primaryUser.About,
        age: primaryUser.age,
        gender: primaryUser.gender,
        Skills: primaryUser.Skills,
        isPremium: primaryUser.isPremium,
      },
    });
    const ok6 = res6 && typeof res6.score === "number" && Array.isArray(res6.tips);
    report("Feature 6: Profile Completion Advisor", ok6, ok6 ? `Profile score: ${res6.score}/100 (Grade ${res6.grade}), Tips: ${res6.tips.length}` : JSON.stringify(res6));
  } catch (e) {
    report("Feature 6: Profile Completion Advisor", false, e.message);
  }

  // Feature 7: Chat Sentiment Analysis
  try {
    const realMessages = await Message.find({ type: "text" }).limit(10).lean();
    const payload = realMessages.length > 0
      ? realMessages.map((m) => ({ text: m.text, senderId: m.senderId.toString() === primaryUser._id.toString() ? "me" : "them" }))
      : [
          { text: "Hey! Happy to meet you!", senderId: "me" },
          { text: "Me too! Really enjoying our conversation ❤️", senderId: "them" },
        ];

    const res7 = await callML("/ml/chat-sentiment", { messages: payload });
    const ok7 = res7 && typeof res7.score === "number" && typeof res7.mood === "string";
    report("Feature 7: Chat Sentiment Analysis", ok7, ok7 ? `Mood: ${res7.mood}, Score: ${res7.score}, Trend: ${res7.trend}` : JSON.stringify(res7));
  } catch (e) {
    report("Feature 7: Chat Sentiment Analysis", false, e.message);
  }

  // Feature 8: Fake / Bot Profile Detection
  try {
    const res8 = await callML("/ml/detect-fake", {
      user: {
        _id: primaryUser._id.toString(),
        photoUrl: primaryUser.photoUrl,
        About: primaryUser.About,
        age: primaryUser.age,
        createdAt: primaryUser.createdAt,
        Skills: primaryUser.Skills || [],
      },
      requestCount: 2,
      messageCount: 5,
      accountAgeHours: 48,
    });
    const ok8 = res8 && typeof res8.confidence === "number" && typeof res8.is_suspicious === "boolean";
    report("Feature 8: Fake Profile Detection", ok8, ok8 ? `Is Suspicious: ${res8.is_suspicious}, Confidence: ${res8.confidence}, Risk: ${res8.risk_level}` : JSON.stringify(res8));
  } catch (e) {
    report("Feature 8: Fake Profile Detection", false, e.message);
  }

  // Feature 9: Voice Message Emotion Analysis
  try {
    const res9 = await callML("/ml/voice-emotion", { audio_url: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg" });
    const ok9 = res9 && typeof res9.emotion === "string";
    report("Feature 9: Voice Message Emotion Analysis", ok9, ok9 ? `Emotion: ${res9.emotion}, Energy: ${res9.energy_level}, Pitch trend: ${res9.pitch_trend}` : JSON.stringify(res9));
  } catch (e) {
    report("Feature 9: Voice Message Emotion Analysis", false, e.message);
  }

  // Feature 10: Compatibility DNA Report
  try {
    const secondUser = candidateUsers[0] || primaryUser;
    const res10 = await callML("/ml/compatibility-report", {
      user1: { firstName: primaryUser.firstName, About: primaryUser.About, Skills: primaryUser.Skills, age: primaryUser.age },
      user2: { firstName: secondUser.firstName, About: secondUser.About, Skills: secondUser.Skills, age: secondUser.age },
    });
    const ok10 = res10 && typeof res10.overall_score === "number" && res10.axes;
    report("Feature 10: Compatibility DNA Report", ok10, ok10 ? `Overall compatibility: ${res10.overall_score}/100, Strengths count: ${res10.strengths.length}` : JSON.stringify(res10));
  } catch (e) {
    report("Feature 10: Compatibility DNA Report", false, e.message);
  }

  // Feature 11: Smart Reply Suggestions
  try {
    const res11 = await callML("/ml/smart-reply", {
      conversation: [
        { role: "them", text: "Hey! I saw you love traveling, where was your last trip?" },
        { role: "me", text: "I went to Himachal last month! The mountains were breathtaking." },
        { role: "them", text: "That sounds amazing! Which towns did you visit?" },
      ],
      myProfile: { firstName: primaryUser.firstName, Skills: primaryUser.Skills },
    });
    const ok11 = res11 && Array.isArray(res11.replies) && res11.replies.length >= 1;
    report("Feature 11: Smart Reply Suggestions", ok11, ok11 ? `Generated ${res11.replies.length} replies. Sample: "${res11.replies[0]}"` : JSON.stringify(res11));
  } catch (e) {
    report("Feature 11: Smart Reply Suggestions", false, e.message);
  }

  // Feature 12: Real-Time Call Quality & Coaching
  try {
    const secondUser = candidateUsers[0] || primaryUser;
    const res12 = await callML("/ml/call-debrief", {
      callDuration: 240,
      callType: "video",
      callerProfile: { firstName: primaryUser.firstName, Skills: primaryUser.Skills },
      receiverProfile: { firstName: secondUser.firstName, Skills: secondUser.Skills },
      priorMessageCount: 15,
      callOutcome: "completed",
    });
    const ok12 = res12 && typeof res12.coaching_tip === "string" && typeof res12.encouragement === "string";
    report("Feature 12: Call Debrief & Coaching", ok12, ok12 ? `Tip: "${res12.coaching_tip}" | Next step: "${res12.next_step}"` : JSON.stringify(res12));
  } catch (e) {
    report("Feature 12: Call Debrief & Coaching", false, e.message);
  }

  console.log("\n───────────────────────────────────────────────────────────");
  console.log(`RESULTS: ${successCount}/12 PASSED, ${failCount}/12 FAILED.`);
  console.log("───────────────────────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(failCount === 0 ? 0 : 1);
}

runTests();
