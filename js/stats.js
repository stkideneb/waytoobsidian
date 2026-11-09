/* =========================================================
   Auswertung: Übungseinträge, PRs, Gesamtgewicht
   ========================================================= */
const sessionsDesc = (a, b) => b.date.localeCompare(a.date) || b.id - a.id;
const sessionsAsc = (a, b) => a.date.localeCompare(b.date) || a.id - b.id;
const entriesAsc = (a, b) =>
  a.date.localeCompare(b.date) || a.sessionId - b.sessionId || a.order - b.order;

// Alle Übungen aus allen Workouts als flache Liste
function allEntries() {
  const out = [];
  for (const s of sessions) {
    s.exercises.forEach((e, order) => out.push({ ...e, date: s.date, sessionId: s.id, order }));
  }
  return out;
}

// arm = null -> alle Arme
function entriesFor(name, arm = null) {
  return allEntries().filter((e) => e.name === name && (arm === null || e.arm === arm));
}

function lastEntryFor(name, arm = null) {
  return entriesFor(name, arm).sort(entriesAsc).at(-1);
}

// Bestwerte (Gewicht, Wiederholungen, Haltezeit) über eine Liste von Übungseinträgen
function personalBest(list) {
  const pr = { kg: 0, reps: 0, hold: 0 };
  for (const entry of list) {
    for (const s of entry.sets) {
      for (const key of PR_KEYS) pr[key] = Math.max(pr[key], Number(s[key]) || 0);
    }
  }
  return pr;
}

function setVolume(s) {
  return s.kg ? s.kg * (s.reps || 1) : 0;
}

function sessionVolume(session) {
  return session.exercises.reduce(
    (sum, e) => sum + e.sets.reduce((n, s) => n + setVolume(s), 0),
    0
  );
}

function formatSet(s) {
  const parts = [];
  if (s.kg) parts.push(`${fmtNum(s.kg)} kg`);
  if (s.reps) parts.push(`${s.reps} Wdh.`);
  if (s.hold) parts.push(`${s.hold} Sek.`);
  return parts.join(" × ") || "–";
}

function formatPR(pr, keys = PR_KEYS) {
  const labels = { kg: (v) => `${fmtNum(v)} kg`, reps: (v) => `${v} Wdh.`, hold: (v) => `${v} Sek.` };
  return keys.filter((k) => pr[k] > 0).map((k) => labels[k](pr[k])).join(" · ");
}

// Kurzform für Listen: Gewicht, sonst Wiederholungen, sonst Haltezeit
function formatPRShort(pr) {
  const key = PR_KEYS.find((k) => pr[k] > 0);
  return key ? formatPR(pr, [key]) : "";
}

// Welche Übungseinträge haben einen neuen PR aufgestellt?
// Schlüssel: "sessionId|order". Der erste Eintrag einer Übung/Arm zählt nicht als PR.
function computePRMarks() {
  const marks = new Map();
  const best = {};

  for (const e of allEntries().sort(entriesAsc)) {
    const key = prKey(e);
    const current = personalBest([e]);

    if (best[key]) {
      const beaten = PR_KEYS.filter((k) => current[k] > best[key][k]);
      if (beaten.length) marks.set(`${e.sessionId}|${e.order}`, formatPR(current, beaten));
      for (const k of PR_KEYS) best[key][k] = Math.max(best[key][k], current[k]);
    } else {
      best[key] = current;
    }
  }
  return marks;
}

// Map "Übung|Arm" -> { name, arm, kg, reps, hold }
function recordMap() {
  const map = new Map();
  for (const e of allEntries()) {
    const key = prKey(e);
    const arm = key.split("|")[1];
    const pr = map.get(key) || { name: e.name, arm, kg: 0, reps: 0, hold: 0 };
    const current = personalBest([e]);
    for (const k of PR_KEYS) pr[k] = Math.max(pr[k], current[k]);
    map.set(key, pr);
  }
  return map;
}

function getRecords() {
  return [...recordMap().values()]
    .filter((r) => PR_KEYS.some((k) => r[k] > 0))
    .sort((a, b) => b.kg - a.kg || b.reps - a.reps || b.hold - a.hold);
}
