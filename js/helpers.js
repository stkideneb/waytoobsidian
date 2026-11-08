/* =========================================================
   Hilfsfunktionen
   ========================================================= */
// Lokales Datum (toISOString() wäre UTC und zeigt kurz nach Mitternacht den Vortag)
function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function fmtDate(isoDate) {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("de-DE");
}

// "Heute", "Gestern" oder "Mo., 3. Nov."
function fmtDateFriendly(isoDate) {
  if (isoDate === today()) return "Heute";
  if (isoDate === today(-1)) return "Gestern";
  return new Date(isoDate + "T12:00:00").toLocaleDateString("de-DE", {
    weekday: "short", day: "numeric", month: "short"
  });
}

function fmtNum(n) {
  return Number(n).toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function safe(value) {
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// "Pronation, Cupping, Rising, …"
function summarize(names) {
  const unique = [...new Set(names)];
  return unique.slice(0, 3).join(", ") + (unique.length > 3 ? ", …" : "");
}

function categoryOf(name) {
  return exercises.find((e) => e.name === name)?.category ?? "";
}

// Einstellungen einer Übung (Zähleinheit, rechts/links)
function exerciseMeta(name) {
  return exercises.find((e) => e.name === name) ?? withDefaults({ name, category: "Other" });
}

// Für beidseitige Übungen spielt der Arm keine Rolle
function armFilter(name, arm) {
  return exerciseMeta(name).sided ? arm : null;
}

function prKey(e) {
  return exerciseMeta(e.name).sided ? e.name + "|" + e.arm : e.name + "|Beide";
}

function armSuffix(arm) {
  return arm && arm !== "Beide" ? ` · ${arm}` : "";
}

let toastTimer;

function toast(message, { duration = 2400, error = false } = {}) {
  const el = $("toast");
  el.textContent = message;
  el.classList.toggle("error", error);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), duration);
}
