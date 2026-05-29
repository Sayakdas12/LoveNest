let _adminApp = null;

/**
 * Lazily initialise the Firebase Admin SDK.
 * Only requires GCP_SERVICE_ACCOUNT_JSON — FIREBASE_DATABASE_URL is optional
 * (needed for Realtime DB presence but not for Auth token verification).
 */
function getAdminApp() {
    if (_adminApp) return _adminApp;

    const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
        console.warn("[firebase-admin] GCP_SERVICE_ACCOUNT_JSON not set — skipping Firebase Admin init");
        return null;
    }

    try {
        const admin = require("firebase-admin");
        if (admin.apps.length > 0) {
            _adminApp = admin.apps[0];
            return _adminApp;
        }
        const serviceAccount = JSON.parse(serviceAccountJson);
        const initOptions = { credential: admin.credential.cert(serviceAccount) };
        const databaseURL = process.env.FIREBASE_DATABASE_URL;
        if (databaseURL) initOptions.databaseURL = databaseURL;

        _adminApp = admin.initializeApp(initOptions);
    } catch (err) {
        console.error("[firebase-admin] Init error:", err.message);
        return null;
    }

    return _adminApp;
}

/**
 * Write user online/offline status to Firebase RTDB.
 * Non-critical — errors are swallowed.
 */
async function syncPresence(userId, isOnline) {
    // Presence sync requires Realtime Database — skip if URL not configured
    if (!process.env.FIREBASE_DATABASE_URL) return;
    try {
        const app = getAdminApp();
        if (!app) return;
        const admin = require("firebase-admin");
        const db = admin.database();
        await db.ref(`presence/${userId}`).set({
            online: isOnline,
            lastSeen: isOnline ? null : Date.now(),
        });
    } catch (err) {
        // non-critical
    }
}

module.exports = { getAdminApp, syncPresence };
