import {
  browserLocalPersistence,
  setPersistence,
  createUserWithEmailAndPassword,
  confirmPasswordReset,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firebaseAuth, db, storage } from "@/lib/firebase";

setPersistence(firebaseAuth, browserLocalPersistence).catch(() => {});

// Firestore's permission error doesn't say WHICH call was denied. Label it, so the
// on-screen message and the console show e.g. "[users.write]" or "[posts.list]".
const tagged = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (err?.code === "permission-denied") {
      console.error(
        `[Firestore permission denied] ${label} - signed in as ${firebaseAuth.currentUser?.uid || "nobody"}`,
        err
      );
      err.message = `${err.message} [${label}]`;
    }
    throw err;
  }
};

const normalizeUser = async (user) => {
  if (!user) return null;
  const profileSnap = await tagged("users.read", () => getDoc(doc(db, "users", user.uid)));
  const profile = profileSnap.exists() ? profileSnap.data() : {};
  return {
    id: user.uid,
    uid: user.uid,
    email: user.email || profile.email || "",
    full_name: profile.full_name || user.displayName || user.email || "",
    created_date: profile.created_date || user.metadata?.creationTime || new Date().toISOString(),
    ...profile,
  };
};

// Every account needs a profile document, or it never shows up in Search /
// "People to follow". Create it at sign-up / sign-in instead of waiting for the
// feed to do it. Safe to call repeatedly: it does nothing if one already exists.
const ensureProfile = async (user) => {
  try {
    const existing = await getDocs(
      query(collection(db, "profiles"), where("user_id", "==", user.uid), limit(1))
    );
    if (!existing.empty) return;
    const now = new Date().toISOString();
    await addDoc(collection(db, "profiles"), {
      user_id: user.uid,
      full_name: user.displayName || user.email || "",
      email: user.email || "",
      created_by_id: user.uid,
      created_by: user.email || null,
      created_date: now,
      updated_date: now,
    });
  } catch (err) {
    console.warn("Could not create profile:", err);
  }
};

const serialize = (snap) => ({ id: snap.id, ...snap.data() });

// Sort already-fetched docs in memory. Sorting server-side on a different field
// than the filters would need a hand-made composite index for every query.
const sortDocs = (docs, sort) => {
  if (!sort) return docs;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [...docs].sort((a, b) => {
    const x = a[field] ?? "";
    const y = b[field] ?? "";
    if (x === y) return 0;
    return (x > y ? 1 : -1) * (desc ? -1 : 1);
  });
};

const whereAll = (filters = {}) =>
  Object.entries(filters).map(([field, value]) => where(field, "==", value));

function makeEntity(name, overrides = {}) {
  const refFor = (id) => doc(db, name, id);
  const collectionRef = () => collection(db, name);

  const entity = {
    async list(sort = "-created_date", max = 100) {
      const field = sort?.startsWith("-") ? sort.slice(1) : sort || "created_date";
      const direction = sort?.startsWith("-") ? "desc" : "asc";
      const q = query(collectionRef(), orderBy(field, direction), limit(max));
      const snap = await getDocs(q);
      return snap.docs.map(serialize);
    },

    async filter(filters = {}, sort = "created_date", max = 100) {
      const constraints = whereAll(filters);
      if (constraints.length === 0) return this.list(sort, max);
      const snap = await getDocs(query(collectionRef(), ...constraints));
      return sortDocs(snap.docs.map(serialize), sort).slice(0, max);
    },

    async get(id) {
      const snap = await getDoc(refFor(id));
      if (!snap.exists()) throw new Error(`${name} not found`);
      return serialize(snap);
    },

    async create(data) {
      const now = new Date().toISOString();
      const user = firebaseAuth.currentUser;
      const payload = {
        ...data,
        // The UI and the security rules rely on these (Base44 used to add them).
        created_by_id: user?.uid || null,
        created_by: user?.email || null,
        created_date: data.created_date || now,
        updated_date: data.updated_date || now,
      };
      const created = await addDoc(collectionRef(), payload);
      return { id: created.id, ...payload };
    },

    async update(id, data) {
      await updateDoc(refFor(id), { ...data, updated_date: new Date().toISOString() });
      const snap = await getDoc(refFor(id));
      return serialize(snap);
    },

    async delete(id) {
      await deleteDoc(refFor(id));
    },

    // Pass filters (e.g. { conversation_id }) so the listener only asks for
    // documents the security rules allow this user to read.
    subscribe(callback, filters = {}) {
      return onSnapshot(
        query(collectionRef(), ...whereAll(filters)),
        (snap) => {
          snap.docChanges().forEach((change) => {
            callback({ type: change.type, data: serialize(change.doc) });
          });
        },
        (err) => console.error(`Realtime listener for "${name}" failed:`, err)
      );
    },

    ...overrides,
  };

  return Object.fromEntries(
    Object.entries(entity).map(([op, fn]) =>
      op === "subscribe"
        ? [op, fn]
        : [op, (...args) => tagged(`${name}.${op}`, () => fn.apply(entity, args))]
    )
  );
}

// Conversations are private: rules only allow reading ones you take part in, so
// the query itself must be limited to your own conversations.
const conversations = makeEntity("conversations", {
  async list(sort = "-updated_date", max = 100) {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return [];
    const snap = await getDocs(
      query(collection(db, "conversations"), where("participants", "array-contains", uid))
    );
    return sortDocs(snap.docs.map(serialize), sort).slice(0, max);
  },
});

export const base44 = {
  auth: {
    async me() {
      const user = firebaseAuth.currentUser;
      if (!user) throw Object.assign(new Error("Authentication required"), { status: 401 });
      return normalizeUser(user);
    },

    async loginViaEmailPassword(email, password) {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await ensureProfile(result.user);
      return normalizeUser(result.user);
    },

    async register({ email, password }) {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await tagged("users.write", () => setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        full_name: result.user.displayName || result.user.email,
        created_date: new Date().toISOString(),
      }, { merge: true }));
      await ensureProfile(result.user);
      try { await sendEmailVerification(result.user); } catch (_) {}
      return normalizeUser(result.user);
    },

    async loginWithProvider(provider = "google") {
      if (provider !== "google") throw new Error("Only Google sign-in is configured.");
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      await tagged("users.write", () => setDoc(doc(db, "users", result.user.uid), {
        email: result.user.email,
        full_name: result.user.displayName || result.user.email,
        created_date: result.user.metadata?.creationTime || new Date().toISOString(),
      }, { merge: true }));
      await ensureProfile(result.user);
      return normalizeUser(result.user);
    },

    async logout() {
      await signOut(firebaseAuth);
      window.location.href = "/login";
    },

    async resetPasswordRequest(email) {
      return sendPasswordResetEmail(firebaseAuth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      });
    },

    async resetPassword({ resetToken, newPassword }) {
      if (!resetToken) throw new Error("This password reset link is invalid or expired.");
      return confirmPasswordReset(firebaseAuth, resetToken, newPassword);
    },

    async updateMe(data) {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("Authentication required");
      await tagged("users.write", () => setDoc(doc(db, "users", user.uid), data, { merge: true }));
      if (data.full_name) await updateProfile(user, { displayName: data.full_name });
      return normalizeUser(user);
    },

    async deleteAccount() {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("Authentication required");
      await deleteDoc(doc(db, "users", user.uid)).catch(() => {});
      await deleteUser(user);
    },

    async isAuthenticated() {
      return Boolean(firebaseAuth.currentUser);
    },

    // Callers pass only a callback; Firebase needs the auth instance first.
    onAuthStateChanged: (callback) => onAuthStateChanged(firebaseAuth, callback),
  },

  entities: {
    Comment: makeEntity("comments"),
    Conversation: conversations,
    Message: makeEntity("messages"),
    Post: makeEntity("posts"),
    Profile: makeEntity("profiles"),
    User: { delete: async (id) => deleteDoc(doc(db, "users", id)) },
  },

  app: {
    async getPublicSettings() {
      const snap = await tagged("app/public.read", () => getDoc(doc(db, "app", "public")));
      return snap.exists() ? serialize(snap) : { id: "public", public_settings: {} };
    },
  },

  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        const storageRef = ref(storage, `uploads/${firebaseAuth.currentUser?.uid || "public"}/${Date.now()}-${file.name}`);
        const result = await uploadBytes(storageRef, file);
        return { file_url: await getDownloadURL(result.ref) };
      },
    },
  },
};