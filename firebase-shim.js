// Soft Plans — adaptateur Firebase.
// Fournit à l'appli la même interface que dans Claude (window.claude.use("db" | "user")),
// mais branchée sur Firebase Auth (connexion Google) et Firestore.
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeFirestore, doc as fdoc, collection as fcol, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const resolve = window.__resolveClaude || (() => {});
const configured = firebaseConfig && firebaseConfig.apiKey && !/COLLE_ICI/.test(firebaseConfig.apiKey);

function fail(reason) {
  window.__claudeProblem = reason;
  window.claude = null;
  resolve();
}

if (!configured) {
  fail("config");
} else {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const fs = initializeFirestore(app, { ignoreUndefinedProperties: true });

    window.__signIn = async () => {
      const p = new GoogleAuthProvider();
      p.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, p);
    };
    window.__signOut = () => signOut(auth);

    const wrapDoc = (ref) => ({
      id: ref.id,
      path: ref.path,
      collection: (name) => wrapCol(fcol(fs, ref.path, name)),
      async get() { const s = await getDoc(ref); return snapDoc(s); },
      async set(d) { await setDoc(ref, d); },
      async update(d) { await updateDoc(ref, d); },
      async delete() { await deleteDoc(ref); },
      onSnapshot(next, err) { return onSnapshot(ref, (s) => next(snapDoc(s)), err); },
      // Verrou court (utilisé pour que deux personnes n'entrent pas en même temps).
      async acquire({ holder, ttlMs }) {
        return runTransaction(fs, async (tx) => {
          const s = await tx.get(ref);
          const cur = s.exists() ? s.data() : null;
          const now = Date.now();
          if (cur && cur.exp > now && cur.holder !== holder) return { acquired: false };
          tx.set(ref, { holder, exp: now + (ttlMs || 5000) });
          return { acquired: true };
        });
      },
    });
    const snapDoc = (s) => ({ id: s.id, exists: s.exists(), data: () => (s.exists() ? s.data() : undefined) });
    const wrapCol = (ref) => ({
      path: ref.path,
      doc: (id) => wrapDoc(id ? fdoc(ref, id) : fdoc(ref)),
      onSnapshot(next, err) {
        return onSnapshot(ref, (s) => next({ docs: s.docs.map((d) => ({ id: d.id, data: () => d.data() })) }), err);
      },
    });
    const db = {
      doc: (path) => wrapDoc(fdoc(fs, path)),
      collection: (path) => wrapCol(fcol(fs, path)),
    };

    onAuthStateChanged(auth, async (u) => {
      if (!u) { window.claude = { use: async () => null }; resolve(); return; }
      const me = { id: u.uid, name: u.displayName || (u.email || "").split("@")[0], email: u.email || "", avatarUrl: u.photoURL || "", color: "#B84A39" };
      const profiles = fdoc(fs, "profiles", u.uid);
      try { await setDoc(profiles, { name: me.name }); } catch (e) { /* hors liste autorisée : l'appli l'indiquera */ }
      const user = {
        id: async () => u.uid,
        me: async () => me,
        can: async () => true,
        profiles: async (ids) => {
          const out = {};
          await Promise.all(ids.map(async (id) => {
            if (id === u.uid) { out[id] = me; return; }
            try { const s = await getDoc(fdoc(fs, "profiles", id)); if (s.exists()) out[id] = { id, name: s.data().name }; } catch (e) {}
          }));
          return out;
        },
      };
      window.claude = { use: async (n) => (n === "db" ? db : n === "user" ? user : null) };
      resolve();
    });
  } catch (e) {
    console.error(e);
    fail("init");
  }
}
