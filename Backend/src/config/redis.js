const Redis = require("ioredis");

let redis = null;

function getRedisClient() {
  if (redis) return redis;

  const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

  // Detect if TLS is needed (Upstash uses rediss:// with TLS on port 6379)
  const isTLS = REDIS_URL.startsWith("rediss://");

  // Mask password for safe logging
  const maskedUrl = REDIS_URL.replace(/:[^:@]+@/, ":****@");

  redis = new Redis(REDIS_URL, {
    // ── TLS for Upstash cloud Redis ───────────────────────────────────────
    ...(isTLS && {
      tls: {
        rejectUnauthorized: false, // Required for Upstash TLS
      },
    }),

    // ── Reconnect strategy ────────────────────────────────────────────────
    // Upstash closes idle connections — we need aggressive reconnects.
    // ENOTFOUND is a transient DNS hiccup, not a permanent failure.
    retryStrategy(times) {
      if (times > 20) {
        // After 20 failed retries, stop — something is seriously wrong
        console.warn("  ⚠️  Redis: max reconnect attempts (20) reached. Running without Redis cache.");
        return null;
      }
      // Exponential backoff: 200ms, 400ms, 800ms ... capped at 5s
      const delay = Math.min(times * 200, 5000);
      if (times <= 3) {
        // Only log the first few retries to avoid noise
        console.warn(`  ⚠️  Redis: reconnecting (attempt ${times}) in ${delay}ms...`);
      }
      return delay;
    },

    // ── Reconnect on transient network errors (ENOTFOUND, ECONNRESET) ────
    // Without this, ioredis treats DNS failures as permanent and stops.
    reconnectOnError(err) {
      const transient = ["ENOTFOUND", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"];
      if (transient.includes(err.code)) {
        return true; // force reconnect attempt
      }
      return false;
    },

    // ── Connection settings ───────────────────────────────────────────────
    enableOfflineQueue: false,  // Don't queue commands when disconnected
    lazyConnect: true,
    connectTimeout: 15000,      // 15 seconds for cloud connections
    keepAlive: 10000,           // Send TCP keepalive every 10s to prevent idle timeout
    family: 4,                  // Force IPv4 — avoids IPv6 DNS lookup failures on Windows
  });

  // ── Event handlers ────────────────────────────────────────────────────────
  redis.on("connect", () => {
    console.log("  ✅  Redis     Connected →", maskedUrl);
  });

  redis.on("ready", () => {
    console.log("  🔴  Redis     Ready — caching & presence active");
  });

  redis.on("error", (err) => {
    // Suppress transient DNS / network errors — these trigger reconnect automatically
    const suppress = ["ECONNREFUSED", "ENOTFOUND", "ECONNRESET", "ETIMEDOUT"];
    if (!suppress.includes(err.code)) {
      console.error("  ❌  Redis error:", err.message);
    }
    // For ENOTFOUND specifically, emit a quiet warning once
    if (err.code === "ENOTFOUND") {
      console.warn("  ⚠️  Redis: DNS lookup failed — retrying connection...");
    }
  });

  redis.on("close", () => {
    // Only log when truly ended (not during normal reconnect cycling)
    if (redis.status === "end") {
      console.warn("  ⚠️  Redis     Connection permanently closed");
    }
  });

  redis.on("reconnecting", (delay) => {
    // Silent — retryStrategy already logs the important ones
  });

  // ── Initial connection attempt ─────────────────────────────────────────────
  redis.connect().catch((err) => {
    console.warn("  ⚠️  Redis     Initial connect failed:", err.message, "— Cache disabled, app runs via MongoDB.");
  });

  return redis;
}

module.exports = getRedisClient;
