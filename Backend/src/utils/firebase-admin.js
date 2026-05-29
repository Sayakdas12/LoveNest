let _adminApp = null;

/**
 * Lazily initialise the Firebase Admin SDK.
 * Returns null if GCP_SERVICE_ACCOUNT_JSON is not set (graceful degradation).
 */
function getAdminApp() {
    if (_adminApp) return _adminApp;

    const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT_JSON;
    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!serviceAccountJson || !databaseURL) {
        console.warn("[firebase-admin] GCP_SERVICE_ACCOUNT_JSON or FIREBASE_DATABASE_URL not set — skipping Firebase Admin init");
        return null;
    }

    try {
        const admin = require("firebase-admin");
        if (admin.apps.length > 0) {
            _adminApp = admin.apps[0];
            return _adminApp;
        }
        const serviceAccount = JSON.parse(serviceAccountJson);
        _adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL,
        });
        console.log("[firebase-admin] Initialised successfully");
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
