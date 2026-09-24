import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 1. Your Vite configuration mapping
const firebaseConfig = {
  apiKey: "AIzaSyAzHUnU5tMBhkqnJ5p0nGwX05ejacj_TQU",
  authDomain: "vibes-21d2a.firebaseapp.com",
  projectId: "vibes-21d2a",
  storageBucket: "vibes-21d2a.firebasestorage.app",
  messagingSenderId: "198658072464",
  appId: "1:198658072464:web:cad371ae5a0b2fdf761d15",
  measurementId: "G-RQZB0254NV"
};

// 2. Single initialization instance
const app = initializeApp(firebaseConfig);

// 3. Exports (names must match what src/api/base44Client.js imports)
// Some networks, VPNs and browser extensions break Firestore's default streaming
// connection, which makes reads hang or fail. Auto-detect and fall back if needed.
let firestore;
try {
  firestore = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
} catch (_) {
  firestore = getFirestore(app); // already initialised (e.g. after a hot reload)
}
export const db = firestore;
export const firebaseAuth = getAuth(app);
export const auth = firebaseAuth; // alias, in case anything imports `auth`
export const storage = getStorage(app);

// Analytics can throw in unsupported environments (blocked cookies, some
// browsers/extensions) - never let that take down the whole app.
export let analytics = null;
try {
  if (typeof window !== "undefined") analytics = getAnalytics(app);
} catch (err) {
  console.warn("Firebase Analytics unavailable:", err?.message || err);
}

export default app;
