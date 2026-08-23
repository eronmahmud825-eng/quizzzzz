// ═══════════════════════════════════════════════════════
//  SHARED FIREBASE CONFIG + HELPERS
//  Loaded by both index.html and admin.html — keep this the
//  single source of truth for the Firebase project connection.
// ═══════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyDI-6wN-2yGjUJftd4oj8GHJlC4nlAcGdY",
  authDomain: "quizgame2-cd4d5.firebaseapp.com",
  databaseURL: "https://quizgame2-cd4d5-default-rtdb.firebaseio.com",
  projectId: "quizgame2-cd4d5",
  storageBucket: "quizgame2-cd4d5.firebasestorage.app",
  messagingSenderId: "809610517302",
  appId: "1:809610517302:web:1544c2cf19ff24a5127197",
  measurementId: "G-7KB3JQCY36"
};
firebase.initializeApp(firebaseConfig);
const rtdb = firebase.database();
const SRV_TS = firebase.database.ServerValue.TIMESTAMP;

// Clock offset between this device and Firebase's servers, so every
// connected client computes the exact same "time remaining" during a
// live match regardless of the visitor's own device clock.
let serverOffset = 0;
rtdb.ref(".info/serverTimeOffset").on("value", snap => { serverOffset = snap.val() || 0; });
function serverNow() { return Date.now() + serverOffset; }

// Plain REST helpers — used for simple one-off reads/writes (admin CRUD,
// user records) where we don't need a live listener.
const FB = "https://quizgame2-cd4d5-default-rtdb.firebaseio.com";
async function fbGet(path) {
  const r = await fetch(FB + path + ".json");
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
async function fbPut(path, data) {
  const r = await fetch(FB + path + ".json", {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
async function fbDelete(path) {
  const r = await fetch(FB + path + ".json", { method: "DELETE" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

function safeKey(phone) { return String(phone).replace(/[^0-9a-zA-Z]/g, ""); }
function normPhone(p) { return (p || "").replace(/[^0-9]/g, ""); }
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}
