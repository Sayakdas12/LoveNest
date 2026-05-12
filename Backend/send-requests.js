require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

const BASE = "http://localhost:3000";

function req(method, path, body, jar) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (jar.length) headers["Cookie"] = jar.join("; ");
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);
    const url = new URL(BASE + path);
    const r = http.request({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        const sc = res.headers["set-cookie"];
        if (sc) sc.forEach(c => {
          const kv = c.split(";")[0], name = kv.split("=")[0];
          const i = jar.findIndex(x => x.startsWith(name + "="));
          if (i >= 0) jar.splice(i, 1, kv); else jar.push(kv);
        });
        resolve({ status: res.statusCode, body: data });
      });
    });
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}
const parse = r => { try { return JSON.parse(r.body); } catch { return r.body; } };

// Login helper — returns { jar, user }
async function login(email, pass) {
  const jar = [];
  const r = await req("POST", "/login", { emailId: email, password: pass }, jar);
  const user = parse(r);
  return { jar, user, id: user._id, name: user.firstName };
}

(async () => {
  // ── Load all seeded users from DB ──────────────────────────────────
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require("./src/models/user");
  const ConnectionRequest = require("./src/models/connectionRequest");

  const allUsers = await User.find(
    { emailId: { $regex: "@example.com$" } },
    "firstName lastName emailId _id"
  ).limit(16);

  console.log(`\nFound ${allUsers.length} seeded users in DB`);
  await mongoose.disconnect();

  const pass = "Love@1234Ab";

  // ── Login as each user ─────────────────────────────────────────────
  console.log("\n── Logging in all users ──────────────────────────────");
  const sessions = {};
  for (const u of allUsers) {
    const s = await login(u.emailId, pass);
    sessions[u.emailId] = { jar: s.jar, id: s.id, name: s.name };
    console.log(`  ✅ ${s.name} logged in (id=${s.id})`);
  }

  const users = Object.values(sessions);

  // ── Define who sends requests to whom ─────────────────────────────
  // Format: [fromIndex, toIndex, status]
  const plan = [
    [0, 1, "interested"],   // Priya → Arjun
    [0, 2, "interested"],   // Priya → Sneha
    [1, 0, "interested"],   // Arjun → Priya
    [2, 3, "interested"],   // Sneha → Rahul
    [3, 4, "interested"],   // Rahul → Ananya
    [4, 5, "interested"],   // Ananya → Vikram
    [5, 6, "interested"],   // Vikram → Kavya
    [6, 7, "interested"],   // Kavya → Aditya
    [7, 8, "interested"],   // Aditya → Riya
    [8, 9, "interested"],   // Riya → Karan
    [9, 10, "interested"],  // Karan → Nisha
    [10, 11, "interested"], // Nisha → Rohan
    [11, 12, "interested"], // Rohan → Meera
    [12, 0, "interested"],  // Meera → Priya
    [1, 3, "ignored"],      // Arjun ignored Rahul
    [5, 7, "ignored"],      // Vikram ignored Aditya
    [13, 0, "interested"],  // Sameer → Priya
    [14, 1, "interested"],  // Pooja → Arjun
    [15, 2, "interested"],  // Nikhil → Sneha
  ];

  console.log("\n── Sending connection requests ───────────────────────");
  const requestIds = {};
  let sent = 0, skipped = 0;
  for (const [fi, ti, status] of plan) {
    if (fi >= users.length || ti >= users.length) continue;
    const from = users[fi], to = users[ti];
    const r = await req("POST", `/request/send/${status}/${to.id}`, null, from.jar);
    const d = parse(r);
    if (r.status === 201) {
      console.log(`  ✅ [${status}] ${from.name} → ${to.name}`);
      if (status === "interested") requestIds[`${fi}-${ti}`] = d.data?._id;
      sent++;
    } else {
      console.log(`  ⚠️  SKIP [${r.status}] ${from.name} → ${to.name}: ${d.message || d}`);
      skipped++;
    }
  }

  // ── Review (accept/reject) some received requests ─────────────────
  console.log("\n── Reviewing requests (accept / reject) ──────────────");
  const reviews = [
    ["0-1", users[1], "accepted"],  // Arjun accepts Priya
    ["2-3", users[3], "accepted"],  // Rahul accepts Sneha
    ["3-4", users[4], "accepted"],  // Ananya accepts Rahul
    ["4-5", users[5], "accepted"],  // Vikram accepts Ananya
    ["6-7", users[7], "accepted"],  // Aditya accepts Kavya
    ["7-8", users[8], "accepted"],  // Riya accepts Aditya
    ["8-9", users[9], "accepted"],  // Karan accepts Riya
    ["9-10", users[10], "accepted"],// Nisha accepts Karan
    ["10-11", users[11], "rejected"],// Rohan rejects Nisha
    ["11-12", users[12], "accepted"],// Meera accepts Rohan
  ];

  for (const [key, reviewer, action] of reviews) {
    const rid = requestIds[key];
    if (!rid) { console.log(`  ⚠️  No request id for key ${key}`); continue; }
    const r = await req("POST", `/request/review/${action}/${rid}`, null, reviewer.jar);
    const d = parse(r);
    if (r.status === 200) {
      console.log(`  ✅ [${action}] ${reviewer.name} reviewed request`);
    } else {
      console.log(`  ❌ [${r.status}] ${reviewer.name}: ${d.message || d}`);
    }
  }

  // ── Final DB snapshot ─────────────────────────────────────────────
  await mongoose.connect(process.env.MONGODB_URI);
  const ConnectionRequestModel = require("./src/models/connectionRequest");
  const allReqs = await ConnectionRequestModel.find({})
    .populate("fromUserId", "firstName")
    .populate("toUserId", "firstName");

  const byStatus = { interested: [], accepted: [], rejected: [], ignored: [] };
  allReqs.forEach(r => (byStatus[r.status] = byStatus[r.status] || []).push(
    `${r.fromUserId?.firstName} → ${r.toUserId?.firstName}`
  ));

  console.log("\n══════════════════════════════════════════");
  console.log(" DATABASE — connectionrequests collection");
  console.log("══════════════════════════════════════════");
  for (const [status, list] of Object.entries(byStatus)) {
    if (!list.length) continue;
    console.log(`\n  [${status.toUpperCase()}] (${list.length})`);
    list.forEach(l => console.log(`    ${l}`));
  }

  console.log(`\n  TOTAL documents: ${allReqs.length}`);
  console.log(`  Requests sent  : ${sent}  skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
})();
