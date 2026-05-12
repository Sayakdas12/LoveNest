require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

const BASE = "http://localhost:3000";

// ─── tiny HTTP helper ────────────────────────────────────────────────
function req(method, path, body, cookieJar) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const payload = body ? JSON.stringify(body) : null;
    const headers = { "Content-Type": "application/json" };
    if (cookieJar.length) headers["Cookie"] = cookieJar.join("; ");
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);

    const r = http.request({ hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        // collect Set-Cookie
        const sc = res.headers["set-cookie"];
        if (sc) sc.forEach(c => {
          const kv = c.split(";")[0];
          const name = kv.split("=")[0];
          const idx = cookieJar.findIndex(x => x.startsWith(name + "="));
          if (idx >= 0) cookieJar.splice(idx, 1, kv); else cookieJar.push(kv);
        });
        resolve({ status: res.statusCode, body: data });
      });
    });
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}

function parse(r) { try { return JSON.parse(r.body); } catch { return r.body; } }

let pass = 0, fail = 0;
function check(name, status, got, expected, note) {
  const ok = got === expected;
  if (ok) { pass++; console.log(`  ✅ PASS [${got}] ${name}`); }
  else     { fail++; console.log(`  ❌ FAIL [${got}] ${name} (expected ${expected})`); }
  if (note) console.log(`       ${note}`);
}

// ─── main ─────────────────────────────────────────────────────────────
(async () => {
  const rand = Date.now();
  const u1 = { firstName:"Alice", lastName:"Test", emailId:`alice${rand}@test.com`, password:"Test@1234Ab", age:25, gender:"female" };
  const u2 = { firstName:"Bob",   lastName:"Test", emailId:`bob${rand}@test.com`,   password:"Test@1234Ab", age:27, gender:"male"   };
  const j1 = [], j2 = [];  // cookie jars

  console.log("\n========================================");
  console.log(" LoveNest — Full API Test (all routes)");
  console.log("========================================\n");

  // ── AUTH ────────────────────────────────────────────────────────────
  console.log("── AUTH ──────────────────────────────────");

  let r = await req("POST", "/signup", u1, j1);
  check("POST /signup (Alice)", r.status, r.status, 201, parse(r).message);

  r = await req("POST", "/signup", u2, j2);
  check("POST /signup (Bob)", r.status, r.status, 201, parse(r).message);

  r = await req("POST", "/signup", u1, []);   // duplicate
  check("POST /signup duplicate → 400", r.status, r.status, 400);

  r = await req("POST", "/login", { emailId: u1.emailId, password: u1.password }, j1);
  const alice = parse(r);
  check("POST /login (Alice)", r.status, r.status, 200, `id=${alice._id}`);
  const aliceId = alice._id;

  r = await req("POST", "/login", { emailId: u2.emailId, password: u2.password }, j2);
  const bob = parse(r);
  check("POST /login (Bob)", r.status, r.status, 200, `id=${bob._id}`);
  const bobId = bob._id;

  r = await req("POST", "/login", { emailId: u1.emailId, password: "wrongpass" }, []);
  check("POST /login wrong password → 400", r.status, r.status, 400);

  // ── PROFILE ─────────────────────────────────────────────────────────
  console.log("\n── PROFILE ───────────────────────────────");

  r = await req("GET", "/profile/view", null, j1);
  check("GET /profile/view (Alice)", r.status, r.status, 200, `email=${parse(r).emailId}`);

  r = await req("PATCH", "/profile/edit", { firstName:"AliceEdited", About:"Hello world", Skills:["Yoga","Travel"] }, j1);
  check("PATCH /profile/edit (About+Skills)", r.status, r.status, 200, parse(r).Message);

  r = await req("PATCH", "/profile/edit", { emailId:"hack@evil.com" }, j1);  // not allowed field
  check("PATCH /profile/edit invalid field → 400", r.status, r.status, 400);

  r = await req("PATCH", "/profile/password", { password: u1.password, newPassword:"NewTest@9999Zz" }, j1);
  check("PATCH /profile/password", r.status, r.status, 200, r.body.trim());

  r = await req("PATCH", "/profile/password", { password:"wrongOld", newPassword:"NewTest@9999Zz" }, j1);
  check("PATCH /profile/password wrong current → 401", r.status, r.status, 401);

  r = await req("GET", "/profile/view", null, []);   // no cookie
  check("GET /profile/view unauthenticated → 401", r.status, r.status, 401);

  // ── FEED ─────────────────────────────────────────────────────────────
  console.log("\n── FEED ──────────────────────────────────");

  r = await req("GET", "/feed", null, j1);
  const feed = parse(r);
  check("GET /feed (Alice)", r.status, r.status, 200, `${feed.results} users returned`);

  r = await req("GET", "/feed?pageNo=1&limit=3", null, j1);
  check("GET /feed?limit=3", r.status, r.status, 200, `${parse(r).results} users (limit=3)`);

  // ── REQUESTS ─────────────────────────────────────────────────────────
  console.log("\n── CONNECTION REQUESTS ───────────────────");

  // Alice → interested in Bob
  r = await req("POST", `/request/send/interested/${bobId}`, null, j1);
  check("POST /request/send/interested (Alice→Bob)", r.status, r.status, 201, parse(r).message);
  const reqId = parse(r).data?._id;

  // duplicate request
  r = await req("POST", `/request/send/interested/${bobId}`, null, j1);
  check("POST /request/send duplicate → 400", r.status, r.status, 400);

  // invalid status
  r = await req("POST", `/request/send/liked/${bobId}`, null, j1);
  check("POST /request/send invalid status → 400", r.status, r.status, 400);

  // non-existent user
  r = await req("POST", "/request/send/interested/000000000000000000000001", null, j1);
  check("POST /request/send non-existent user → 404", r.status, r.status, 404);

  // Bob sees received requests
  r = await req("GET", "/user/requests/received", null, j2);
  const received = parse(r);
  check("GET /user/requests/received (Bob)", r.status, r.status, 200, `${received.data.length} request(s) pending`);

  // Bob accepts Alice's request
  r = await req("POST", `/request/review/accepted/${reqId}`, null, j2);
  check("POST /request/review/accepted (Bob)", r.status, r.status, 200, parse(r).message);

  // try to review same request again
  r = await req("POST", `/request/review/accepted/${reqId}`, null, j2);
  check("POST /request/review already reviewed → 404", r.status, r.status, 404);

  // invalid review status
  r = await req("POST", `/request/review/maybe/${reqId}`, null, j2);
  check("POST /request/review invalid status → 400", r.status, r.status, 400);

  // Alice ignores Bob (new user) 
  const feedUsers = feed.data || [];
  const ignoreTarget = feedUsers.find(u => u._id !== bobId);
  if (ignoreTarget) {
    r = await req("POST", `/request/send/ignored/${ignoreTarget._id}`, null, j1);
    check("POST /request/send/ignored", r.status, r.status, 201, parse(r).message);
  }

  // ── CONNECTIONS ───────────────────────────────────────────────────────
  console.log("\n── CONNECTIONS ───────────────────────────");

  r = await req("GET", "/user/connections", null, j1);
  const conns = parse(r);
  check("GET /user/connections (Alice — should have Bob)", r.status, r.status, 200, `${conns.data.length} connection(s)`);

  r = await req("GET", "/user/connections", null, j2);
  check("GET /user/connections (Bob — should have Alice)", r.status, r.status, 200, `${parse(r).data.length} connection(s)`);

  // ── PAYMENT ───────────────────────────────────────────────────────────
  console.log("\n── PAYMENT ───────────────────────────────");

  r = await req("GET", "/payment/varify", null, j1);
  check("GET /payment/varify (Alice — not premium)", r.status, r.status, 200, `isPremium=${parse(r).isPremium}`);

  // ── LOGOUT ────────────────────────────────────────────────────────────
  console.log("\n── LOGOUT ────────────────────────────────");

  r = await req("POST", "/logout", null, j1);
  check("POST /logout (Alice)", r.status, r.status, 200);

  r = await req("GET", "/profile/view", null, j1);   // cookie cleared
  check("GET /profile/view after logout → 401", r.status, r.status, 401);

  // ── DB VERIFY ─────────────────────────────────────────────────────────
  console.log("\n── DATABASE VERIFICATION ─────────────────");
  const User = require("./src/models/user");
  const ConnectionRequest = require("./src/models/connectionRequest");
  await mongoose.connect(process.env.MONGODB_URI);

  const dbAlice = await User.findById(aliceId, "firstName About Skills");
  console.log(`  Alice in DB : firstName=${dbAlice.firstName} About="${dbAlice.About}" Skills=[${(dbAlice.Skills||[]).join(",")}]`);
  check("Alice profile/edit saved to DB", 200, dbAlice.firstName === "AliceEdited" ? 200 : 500, 200);

  const allReqs = await ConnectionRequest.find({ $or:[{fromUserId:aliceId},{toUserId:aliceId}] });
  console.log(`  ConnectionRequests for Alice: ${allReqs.length}`);
  const accepted = allReqs.filter(r => r.status === "accepted");
  const ignored  = allReqs.filter(r => r.status === "ignored");
  const pending  = allReqs.filter(r => r.status === "interested");
  console.log(`    accepted=${accepted.length}  ignored=${ignored.length}  pending=${pending.length}`);
  check("accepted request saved to DB", 200, accepted.length >= 1 ? 200 : 500, 200, `Alice-Bob accepted`);

  await mongoose.disconnect();

  // ── SUMMARY ───────────────────────────────────────────────────────────
  console.log("\n========================================");
  console.log(` RESULTS:  ✅ ${pass} passed   ❌ ${fail} failed`);
  console.log("========================================\n");
  process.exit(fail > 0 ? 1 : 0);
})();
