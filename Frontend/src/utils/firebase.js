import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, onValue, onDisconnect } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(firebaseApp);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };

/**
 * Set Firebase Realtime Database presence for a user.
 * Automatically registers onDisconnect cleanup.
 */
export async function setPresence(userId, online) {
  if (!userId) return;
  try {
    const presenceRef = ref(database, `presence/${userId}`);
    if (online) {
      await set(presenceRef, { online: true, lastSeen: Date.now() });
      onDisconnect(presenceRef).set({ online: false, lastSeen: Date.now() });
    } else {
      await set(presenceRef, { online: false, lastSeen: Date.now() });
    }
  } catch (err) {
    // Firebase optional — non-fatal
    console.warn("Firebase presence error:", err.message);
  }
}

/**
 * Subscribe to a user's online presence.
 * Returns unsubscribe function.
 */
export function watchPresence(userId, callback) {
  if (!userId) return () => {};
  const presenceRef = ref(database, `presence/${userId}`);
  return onValue(presenceRef, (snap) => {
    const data = snap.val();
    callback(data?.online ?? false, data?.lastSeen ?? null);
  });
}
