/**
 * mlClient.js — Node.js → Python ML Service bridge
 * Wraps all HTTP calls to the FastAPI ML microservice.
 * SAFE: Returns null on any error — never breaks the main app.
 */
const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT = 5000; // 5 seconds

/**
 * Call a Python ML endpoint.
 * @param {string} endpoint  - e.g. '/ml/match-score'
 * @param {object} data      - request body (JSON)
 * @param {number} timeout   - milliseconds (default 5000)
 * @returns {object|null}    - response data, or null if unavailable
 */
async function callML(endpoint, data = {}, timeout = DEFAULT_TIMEOUT) {
  try {
    const res = await axios.post(`${ML_URL}${endpoint}`, data, {
      timeout,
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    // Log as warning — never throw
    const status = err.response?.status || "no-response";
    console.warn(`[ML] ${endpoint} unavailable (${status}): ${err.message}`);
    return null;
  }
}

/**
 * Check if the Python ML service is healthy.
 * @returns {boolean}
 */
async function isMLHealthy() {
  try {
    const res = await axios.get(`${ML_URL}/health`, { timeout: 2000 });
    return res.data?.status === "ok";
  } catch {
    return false;
  }
}

module.exports = { callML, isMLHealthy };
