/**
 * redis.js — Helper functions for all Redis operations in LoveNest
 *
 * Sections:
 *  1. User profile cache
 *  2. Feed cache
 *  3. Connections list cache
 *  4. Online presence tracking (replaces in-memory Map)
 *  5. Active calls tracking (replaces in-memory Map)
 *  6. Rate limiting helpers
 */

const getRedisClient = require("../config/redis");

// ─── TTLs (seconds) ──────────────────────────────────────────────────────────
const TTL_USER        = parseInt(process.env.REDIS_TTL_USER)        || 3600;  // 1 hour
const TTL_FEED        = parseInt(process.env.REDIS_TTL_FEED)        || 300;   // 5 min
const TTL_CONNECTIONS = parseInt(process.env.REDIS_TTL_CONNECTIONS) || 600;   // 10 min
const TTL_CALL        = 3600;   // 1 hour (auto-cleanup if call hangs)
const TTL_ONLINE      = 86400;  // 24 hours (auto-cleanup for crashed sockets)

// ─── Safe Redis wrapper ───────────────────────────────────────────────────────
// Returns null instead of throwing if Redis is disconnected
async function safeGet(key) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return null;
    return await client.get(key);
  } catch {
    return null;
  }
}

async function safeSet(key, value, ttl) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return;
    await client.setex(key, ttl, value);
  } catch {}
}

async function safeDel(...keys) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return;
    await client.del(...keys);
  } catch {}
}

async function safeSadd(key, ...members) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return;
    await client.sadd(key, ...members);
    await client.expire(key, TTL_ONLINE);
  } catch {}
}

async function safeSrem(key, ...members) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return;
    await client.srem(key, ...members);
  } catch {}
}

async function safeScard(key) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return 0;
    return await client.scard(key);
  } catch {
    return 0;
  }
}

async function safeSmembers(key) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return [];
    return await client.smembers(key);
  } catch {
    return [];
  }
}

// ─── 1. User Profile Cache ────────────────────────────────────────────────────

async function getCachedUser(userId) {
  const raw = await safeGet(`user:${userId}`);
  return raw ? JSON.parse(raw) : null;
}

async function setCachedUser(userId, userData) {
  // Don't cache sensitive fields
  const safeData = { ...userData };
  delete safeData.password;
  delete safeData.faceDescriptor;
  delete safeData.chatLockPassword;
  await safeSet(`user:${userId}`, JSON.stringify(safeData), TTL_USER);
}

async function invalidateUser(userId) {
  await safeDel(`user:${userId}`);
}

// ─── 2. Feed Cache ────────────────────────────────────────────────────────────

function feedKey(userId, pageNo, filters = {}) {
  const f = JSON.stringify(filters);
  return `feed:${userId}:p${pageNo}:${f}`;
}

async function getCachedFeed(userId, pageNo, filters) {
  const raw = await safeGet(feedKey(userId, pageNo, filters));
  return raw ? JSON.parse(raw) : null;
}

async function setCachedFeed(userId, pageNo, filters, data) {
  await safeSet(feedKey(userId, pageNo, filters), JSON.stringify(data), TTL_FEED);
}

async function invalidateFeed(userId) {
  // Delete all feed pages for this user via scan pattern
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return;
    const pattern = `feed:${userId}:*`;
    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length) await client.del(...keys);
    } while (cursor !== "0");
  } catch {}
}

// ─── 3. Connections List Cache ────────────────────────────────────────────────

async function getCachedConnections(userId) {
  const raw = await safeGet(`connections:${userId}`);
  return raw ? JSON.parse(raw) : null;
}

async function setCachedConnections(userId, data) {
  await safeSet(`connections:${userId}`, JSON.stringify(data), TTL_CONNECTIONS);
}

async function invalidateConnections(userId) {
  await safeDel(`connections:${userId}`);
}

// ─── 4. Online Presence ───────────────────────────────────────────────────────
// Each online user has: Redis Set `online:<userId>` → Set of socket IDs
// Global Set `online_users_set` → Set of userIds that are currently online

async function addOnlineUser(userId, socketId) {
  await safeSadd(`online:${userId}`, socketId);
  await safeSadd("online_users_set", userId);
}

async function removeOnlineSocket(userId, socketId) {
  await safeSrem(`online:${userId}`, socketId);
  const remaining = await safeScard(`online:${userId}`);
  if (remaining === 0) {
    await safeSrem("online_users_set", userId);
    await safeDel(`online:${userId}`);
  }
  return remaining;
}

async function getOnlineSocketCount(userId) {
  return safeScard(`online:${userId}`);
}

async function getOnlineUserIds() {
  return safeSmembers("online_users_set");
}

async function isUserOnline(userId) {
  const count = await safeScard(`online:${userId}`);
  return count > 0;
}

// ─── 5. Active Calls ──────────────────────────────────────────────────────────

async function setActiveCall(callId, callerId, receiverId) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return;
    await client.hset(`call:${callId}`, { callerId, receiverId });
    await client.expire(`call:${callId}`, TTL_CALL);
  } catch {}
}

async function getActiveCall(callId) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return null;
    const data = await client.hgetall(`call:${callId}`);
    return data && data.callerId ? data : null;
  } catch {
    return null;
  }
}

async function deleteActiveCall(callId) {
  await safeDel(`call:${callId}`);
}

async function getActiveCallsForUser(userId) {
  // Find all calls where user is caller or receiver (scan-based)
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return [];
    const results = [];
    let cursor = "0";
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", "call:*", "COUNT", 100);
      cursor = nextCursor;
      for (const key of keys) {
        const data = await client.hgetall(key);
        if (data && (data.callerId === userId || data.receiverId === userId)) {
          results.push({ callId: key.replace("call:", ""), ...data });
        }
      }
    } while (cursor !== "0");
    return results;
  } catch {
    return [];
  }
}

// ─── 6. Rate Limiting ─────────────────────────────────────────────────────────

/**
 * Increments a rate-limit counter for a given key.
 * Returns { count, allowed } where allowed=false means limit exceeded.
 *
 * @param {string} key      - Unique key e.g. `ratelimit:login:192.168.1.1`
 * @param {number} max      - Max requests allowed
 * @param {number} windowSec - Window in seconds
 */
async function checkRateLimit(key, max, windowSec) {
  try {
    const client = getRedisClient();
    if (client.status !== "ready") return { count: 0, allowed: true }; // fail open if Redis down

    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, windowSec); // only set TTL on first increment
    }
    return { count, allowed: count <= max };
  } catch {
    return { count: 0, allowed: true }; // fail open
  }
}

module.exports = {
  // User cache
  getCachedUser,
  setCachedUser,
  invalidateUser,
  // Feed cache
  getCachedFeed,
  setCachedFeed,
  invalidateFeed,
  // Connections cache
  getCachedConnections,
  setCachedConnections,
  invalidateConnections,
  // Online presence
  addOnlineUser,
  removeOnlineSocket,
  getOnlineSocketCount,
  getOnlineUserIds,
  isUserOnline,
  // Active calls
  setActiveCall,
  getActiveCall,
  deleteActiveCall,
  getActiveCallsForUser,
  // Rate limiting
  checkRateLimit,
};
