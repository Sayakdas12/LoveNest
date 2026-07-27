/**
 * redis-test.js
 * Run: node redis-test.js
 * Tests all Redis features implemented in LoveNest backend:
 *   1. Connection
 *   2. User profile cache (GET/SET/DEL)
 *   3. Feed cache
 *   4. Connections cache
 *   5. Online presence (Sets)
 *   6. Active calls (Hashes)
 *   7. Rate limiting (INCR/EXPIRE)
 */

require("dotenv").config();
const getRedisClient = require("./src/config/redis");

// ─── Color helpers ───────────────────────────────────────────────────────────
const G  = "\x1b[32m";   // green
const R  = "\x1b[31m";   // red
const Y  = "\x1b[33m";   // yellow
const C  = "\x1b[36m";   // cyan
const B  = "\x1b[1m";    // bold
const D  = "\x1b[2m";    // dim
const RS = "\x1b[0m";    // reset

let passed = 0;
let failed = 0;

function ok(label)  { console.log(`  ${G}✔${RS}  ${label}`); passed++; }
function fail(label, err) { console.log(`  ${R}✖${RS}  ${label} — ${err}`); failed++; }
function section(title) { console.log(`\n${C}${B}  ── ${title} ${"─".repeat(40 - title.length)}${RS}`); }

// ─── Wait for ready ───────────────────────────────────────────────────────────
function waitReady(client, timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (client.status === "ready") return resolve();
    const t = setTimeout(() => reject(new Error("Connection timeout")), timeout);
    client.once("ready", () => { clearTimeout(t); resolve(); });
    client.once("error", (e) => { clearTimeout(t); reject(e); });
  });
}

// ─── Main test runner ─────────────────────────────────────────────────────────
async function runTests() {
  console.log(`\n${C}${B}  ╔${"─".repeat(46)}╗`);
  console.log(`  |     LoveNest — Redis Functionality Tests     |`);
  console.log(`  ╚${"─".repeat(46)}╝${RS}\n`);

  const redis = getRedisClient();

  // ── 1. Connection ────────────────────────────────────────────────────────
  section("1. Redis Connection");
  try {
    await waitReady(redis);
    const ping = await redis.ping();
    if (ping === "PONG") ok("PING → PONG (connected to Upstash)");
    else fail("PING", `Unexpected response: ${ping}`);
  } catch (e) {
    fail("Connection failed", e.message);
    console.log(`\n  ${R}Cannot proceed — Redis not reachable.${RS}\n`);
    process.exit(1);
  }

  // ── 2. User Profile Cache ────────────────────────────────────────────────
  section("2. User Profile Cache");
  const userId = "test_user_" + Date.now();
  const fakeUser = { _id: userId, firstName: "Sayak", lastName: "Das", age: 25, Skills: ["React", "Node"] };

  try {
    await redis.setex(`user:${userId}`, 60, JSON.stringify(fakeUser));
    ok(`SET user:${userId} (TTL 60s)`);
  } catch (e) { fail("SET user cache", e.message); }

  try {
    const raw = await redis.get(`user:${userId}`);
    const parsed = JSON.parse(raw);
    if (parsed.firstName === "Sayak") ok(`GET user:${userId} → firstName="${parsed.firstName}"`);
    else fail("GET user cache", "Data mismatch");
  } catch (e) { fail("GET user cache", e.message); }

  try {
    const ttl = await redis.ttl(`user:${userId}`);
    if (ttl > 0 && ttl <= 60) ok(`TTL user:${userId} = ${ttl}s (correct)`);
    else fail("TTL check", `Got ${ttl}`);
  } catch (e) { fail("TTL check", e.message); }

  try {
    await redis.del(`user:${userId}`);
    const gone = await redis.get(`user:${userId}`);
    if (gone === null) ok(`DEL user:${userId} → confirmed deleted`);
    else fail("DEL user cache", "Key still exists");
  } catch (e) { fail("DEL user cache", e.message); }

  // ── 3. Feed Cache ────────────────────────────────────────────────────────
  section("3. Feed Cache");
  const feedKey = `feed:${userId}:p1:{}`;
  const fakeFeed = { message: "Feed OK", page: 1, results: 3, data: ["u1","u2","u3"] };

  try {
    await redis.setex(feedKey, 300, JSON.stringify(fakeFeed));
    ok(`SET ${feedKey} (TTL 300s)`);
  } catch (e) { fail("SET feed cache", e.message); }

  try {
    const raw = await redis.get(feedKey);
    const parsed = JSON.parse(raw);
    if (parsed.results === 3) ok(`GET ${feedKey} → results=${parsed.results}`);
    else fail("GET feed cache", "Data mismatch");
  } catch (e) { fail("GET feed cache", e.message); }

  try {
    await redis.del(feedKey);
    ok(`DEL ${feedKey} → cleaned up`);
  } catch (e) { fail("DEL feed cache", e.message); }

  // ── 4. Connections Cache ──────────────────────────────────────────────────
  section("4. Connections List Cache");
  const connKey = `connections:${userId}`;
  const fakeConns = [{ _id: "c1", firstName: "Riya" }, { _id: "c2", firstName: "Priya" }];

  try {
    await redis.setex(connKey, 600, JSON.stringify(fakeConns));
    ok(`SET ${connKey} (TTL 600s)`);
  } catch (e) { fail("SET connections cache", e.message); }

  try {
    const raw = await redis.get(connKey);
    const parsed = JSON.parse(raw);
    if (parsed.length === 2) ok(`GET ${connKey} → ${parsed.length} connections cached`);
    else fail("GET connections cache", "Count mismatch");
  } catch (e) { fail("GET connections cache", e.message); }

  try {
    await redis.del(connKey);
    ok(`DEL ${connKey} → cleaned up`);
  } catch (e) { fail("DEL connections cache", e.message); }

  // ── 5. Online Presence (Redis Sets) ─────────────────────────────────────
  section("5. Online Presence (Redis Sets)");
  const onlineKey = `online:${userId}`;
  const socketId1 = "socket_abc123";
  const socketId2 = "socket_def456";

  try {
    await redis.sadd(onlineKey, socketId1, socketId2);
    await redis.expire(onlineKey, 300);
    ok(`SADD ${onlineKey} with 2 socket IDs`);
  } catch (e) { fail("SADD online presence", e.message); }

  try {
    const count = await redis.scard(onlineKey);
    if (count === 2) ok(`SCARD ${onlineKey} = ${count} (correct)`);
    else fail("SCARD", `Got ${count}`);
  } catch (e) { fail("SCARD", e.message); }

  try {
    const members = await redis.smembers(onlineKey);
    if (members.includes(socketId1) && members.includes(socketId2)) ok(`SMEMBERS → contains both socket IDs`);
    else fail("SMEMBERS", `Got: ${members}`);
  } catch (e) { fail("SMEMBERS", e.message); }

  try {
    // Add to global online_users_set
    await redis.sadd("online_users_set", userId);
    const allOnline = await redis.smembers("online_users_set");
    if (allOnline.includes(userId)) ok(`online_users_set → contains ${userId}`);
    else fail("online_users_set", "userId not found");
  } catch (e) { fail("online_users_set", e.message); }

  try {
    // Simulate disconnect: remove one socket
    await redis.srem(onlineKey, socketId1);
    const remaining = await redis.scard(onlineKey);
    if (remaining === 1) ok(`SREM socket1 → ${remaining} socket remaining`);
    else fail("SREM", `Got ${remaining}`);
  } catch (e) { fail("SREM", e.message); }

  try {
    // Remove last socket → remove from global set
    await redis.srem(onlineKey, socketId2);
    await redis.srem("online_users_set", userId);
    await redis.del(onlineKey);
    ok(`All online keys cleaned up`);
  } catch (e) { fail("Cleanup online keys", e.message); }

  // ── 6. Active Calls (Redis Hashes) ──────────────────────────────────────
  section("6. Active Calls (Redis Hashes)");
  const callId = "call_" + Date.now();
  const callKey = `call:${callId}`;

  try {
    await redis.hset(callKey, { callerId: "user_A", receiverId: "user_B" });
    await redis.expire(callKey, 3600);
    ok(`HSET ${callKey} with callerId + receiverId`);
  } catch (e) { fail("HSET active call", e.message); }

  try {
    const data = await redis.hgetall(callKey);
    if (data.callerId === "user_A" && data.receiverId === "user_B") {
      ok(`HGETALL ${callKey} → callerId=${data.callerId}, receiverId=${data.receiverId}`);
    } else {
      fail("HGETALL active call", JSON.stringify(data));
    }
  } catch (e) { fail("HGETALL active call", e.message); }

  try {
    await redis.del(callKey);
    const gone = await redis.hgetall(callKey);
    if (Object.keys(gone).length === 0) ok(`DEL ${callKey} → confirmed deleted`);
    else fail("DEL call", "Key still exists");
  } catch (e) { fail("DEL call", e.message); }

  // ── 7. Rate Limiting (INCR + EXPIRE) ────────────────────────────────────
  section("7. Rate Limiting (INCR / EXPIRE)");
  const rlKey = `ratelimit:login:test_ip_${Date.now()}`;

  try {
    const c1 = await redis.incr(rlKey);
    await redis.expire(rlKey, 60);
    const c2 = await redis.incr(rlKey);
    const c3 = await redis.incr(rlKey);
    if (c1 === 1 && c2 === 2 && c3 === 3) ok(`INCR counter: ${c1} → ${c2} → ${c3} (correct sequence)`);
    else fail("INCR counter", `Got ${c1}, ${c2}, ${c3}`);
  } catch (e) { fail("INCR rate limit", e.message); }

  try {
    const ttl = await redis.ttl(rlKey);
    if (ttl > 0) ok(`TTL rate limit key = ${ttl}s`);
    else fail("TTL rate limit", `Got ${ttl}`);
  } catch (e) { fail("TTL rate limit", e.message); }

  try {
    await redis.del(rlKey);
    ok(`Rate limit key cleaned up`);
  } catch (e) { fail("DEL rate limit", e.message); }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n${C}${B}  ── Results ${"─".repeat(34)}${RS}`);
  console.log(`  ${G}${B}Passed: ${passed}${RS}   ${failed > 0 ? R : G}${B}Failed: ${failed}${RS}`);
  if (failed === 0) {
    console.log(`\n  ${G}${B}🎉 All Redis features are working correctly!${RS}`);
    console.log(`  ${D}Your caching, presence, calls & rate-limiting are live on Upstash.${RS}\n`);
  } else {
    console.log(`\n  ${Y}⚠  ${failed} test(s) failed — check the errors above.${RS}\n`);
  }

  redis.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(`\n  \x1b[31m✖  Unhandled error:\x1b[0m`, err.message);
  process.exit(1);
});
