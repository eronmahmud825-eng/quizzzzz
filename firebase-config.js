// ═══════════════════════════════════════════════════════
//  SHARED FIREBASE CONFIG + HELPERS
//  Loaded by both index.html and admin.html
// ═══════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "AIzaSyDI-6wN-2yGjUJftd4oj8GHJlC4nlAcGdY",
  authDomain:        "quizgame2-cd4d5.firebaseapp.com",
  databaseURL:       "https://quizgame2-cd4d5-default-rtdb.firebaseio.com",
  projectId:         "quizgame2-cd4d5",
  storageBucket:     "quizgame2-cd4d5.firebasestorage.app",
  messagingSenderId: "809610517302",
  appId:             "1:809610517302:web:1544c2cf19ff24a5127197",
  measurementId:     "G-7KB3JQCY36"
};
firebase.initializeApp(firebaseConfig);
const rtdb   = firebase.database();
const SRV_TS = firebase.database.ServerValue.TIMESTAMP;

// ── Server clock offset ──
let serverOffset = 0;
rtdb.ref(".info/serverTimeOffset").on("value", snap => {
  serverOffset = snap.val() || 0;
});
function serverNow() { return Date.now() + serverOffset; }

// ── REST helpers ──
const FB = "https://quizgame2-cd4d5-default-rtdb.firebaseio.com";
async function fbGet(path) {
  const r = await fetch(FB + path + ".json");
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
async function fbPut(path, data) {
  const r = await fetch(FB + path + ".json", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
async function fbDelete(path) {
  const r = await fetch(FB + path + ".json", { method: "DELETE" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
async function fbPatch(path, data) {
  const r = await fetch(FB + path + ".json", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

// ── Utilities ──
function safeKey(phone) { return String(phone).replace(/[^0-9a-zA-Z]/g, ""); }
function normPhone(p)   { return (p || "").replace(/[^0-9]/g, ""); }
function pad(n)         { return String(n).padStart(2, "0"); }

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Session (token in localStorage, record in Firebase) ──
const TOKEN_KEY = "qg_token";
let SESSION = null;

function genToken() {
  return "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 14);
}
async function sessionSave(user) {
  const token = genToken();
  await fbPut("/sessions/" + token, {
    phone: user.phone, username: user.username, createdAt: Date.now()
  });
  localStorage.setItem(TOKEN_KEY, token);
  SESSION = { phone: user.phone, username: user.username, token };
}
async function sessionClear() {
  const t = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  SESSION = null;
  if (t) try { await fbDelete("/sessions/" + t); } catch(e) {}
}
async function sessionBoot() {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t) return null;
  try {
    const rec = await fbGet("/sessions/" + t);
    if (rec && rec.phone) {
      SESSION = { phone: rec.phone, username: rec.username, token: t };
    } else {
      localStorage.removeItem(TOKEN_KEY);
      SESSION = null;
    }
  } catch(e) { SESSION = null; }
  return SESSION;
}

// ── Presence (real-time online count) ──
function clientId() {
  let id = localStorage.getItem("qg_cid");
  if (!id) {
    id = "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem("qg_cid", id);
  }
  return id;
}

let _presenceInited = false;
function initPresence(onCount) {
  if (_presenceInited) return;
  _presenceInited = true;
  const myRef = rtdb.ref("presence/" + clientId());
  rtdb.ref(".info/connected").on("value", snap => {
    if (snap.val()) {
      myRef.onDisconnect().remove();
      myRef.set({ t: SRV_TS });
    }
  });
  rtdb.ref("presence").on("value", snap => {
    const n = Object.keys(snap.val() || {}).length;
    if (onCount) onCount(n);
  });
}

// ── Tournament constants ──
const GAME_HOUR  = 21;   // 9 PM
const OFF_DAY    = 5;    // Friday (0=Sun … 6=Sat in JS)
const MAX_PLAYERS = 32;
const ROUND_SEQ  = ["32", "16", "8", "4", "2"];
const DAY_NAMES  = ["یەکشەممە","دووشەممە","سێشەممە","چوارشەممە","پێنجشەممە","هەینی","شەممە"];

function nextGameTime(from) {
  for (let add = 0; add <= 8; add++) {
    const c = new Date(from);
    c.setDate(c.getDate() + add);
    c.setHours(GAME_HOUR, 0, 0, 0);
    if (c.getDay() === OFF_DAY) continue;
    if (add === 0 && c <= from) continue;
    return c;
  }
  return null;
}
function isLiveNow() {
  const now = new Date();
  if (now.getDay() === OFF_DAY) return false;
  const s = new Date(now); s.setHours(GAME_HOUR, 0, 0, 0);
  const e = new Date(s);   e.setHours(GAME_HOUR + 1, 0, 0, 0);
  return now >= s && now < e;
}
function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate());
}
