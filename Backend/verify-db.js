require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user");
const ConnectionRequest = require("./src/models/connectionRequest");

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB\n");

  // 1. Users collection
  const users = await User.find({}, "firstName lastName emailId age gender About Skills photoUrl isPremium");
  console.log("=== USERS COLLECTION (" + users.length + " docs) ===");
  users.forEach(u => {
    console.log(`  [${u._id}]`);
    console.log(`    Name   : ${u.firstName} ${u.lastName}`);
    console.log(`    Email  : ${u.emailId}`);
    console.log(`    Age    : ${u.age} | Gender: ${u.gender}`);
    console.log(`    About  : ${u.About || "(none)"}`);
    console.log(`    Skills : ${(u.Skills || []).join(", ") || "(none)"}`);
    console.log(`    Photo  : ${u.photoUrl ? "YES" : "NO (using default)"}`);
    console.log(`    Premium: ${u.isPremium}`);
  });

  // 2. ConnectionRequests collection
  const reqs = await ConnectionRequest.find({})
    .populate("fromUserId", "firstName lastName")
    .populate("toUserId", "firstName lastName");
  console.log("\n=== CONNECTION_REQUESTS COLLECTION (" + reqs.length + " docs) ===");
  if (reqs.length === 0) {
    console.log("  (empty — no requests sent yet)");
  } else {
    reqs.forEach(r => {
      const from = r.fromUserId ? r.fromUserId.firstName : r.fromUserId;
      const to   = r.toUserId   ? r.toUserId.firstName   : r.toUserId;
      console.log(`  [${r._id}] ${from} --[${r.status}]--> ${to}`);
    });
  }

  // 3. Payments collection
  const db = mongoose.connection.db;
  const payments = await db.collection("payments").find({}).toArray();
  console.log("\n=== PAYMENTS COLLECTION (" + payments.length + " docs) ===");
  if (payments.length === 0) {
    console.log("  (empty — no payments made yet)");
  } else {
    payments.forEach(p => console.log("  ", JSON.stringify(p)));
  }

  // 4. Summary
  console.log("\n=== SUMMARY ===");
  console.log("  Users           :", users.length);
  console.log("  Connection Reqs :", reqs.length);
  console.log("  Payments        :", payments.length);
  
  const accepted = reqs.filter(r => r.status === "accepted").length;
  const pending  = reqs.filter(r => r.status === "interested").length;
  const ignored  = reqs.filter(r => r.status === "ignored").length;
  console.log("    Requests breakdown: interested=" + pending + " accepted=" + accepted + " ignored=" + ignored);

  process.exit(0);
}

verify().catch(e => { console.error(e.message); process.exit(1); });
