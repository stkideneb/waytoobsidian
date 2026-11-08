/* =========================================================
   Speicher
   ========================================================= */
const STORAGE = {
  exercises: "it_exercises",
  sessions: "it_sessions",
  routines: "it_routines",
  active: "it_active",
  legacy: "it_workouts", // altes Format (v1.0/v1.1), bleibt als Backup erhalten
  defaultsVersion: "it_defaults_version",
  lastExport: "it_last_export",
  backupCode: "it_backup_code", // Schlüssel für das Online-Backup
  lastBackup: "it_last_backup", // Zeitpunkt des letzten Online-Backups
  backupPending: "it_backup_pending" // Änderungen, die noch hochgeladen werden müssen
};

const $ = (id) => document.getElementById(id);

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

// Alte Einträge (je eine Übung pro Eintrag) zu Workouts pro Tag zusammenfassen
function migrateLegacy() {
  const legacy = read(STORAGE.legacy, []);
  if (!Array.isArray(legacy) || !legacy.length) return [];

  const byDate = new Map();
  for (const w of [...legacy].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)) {
    if (!byDate.has(w.date)) {
      byDate.set(w.date, { id: w.id, name: "Training", routineId: null, date: w.date, exercises: [] });
    }
    byDate.get(w.date).exercises.push({
      name: w.name,
      category: w.category,
      arm: w.arm || "Beide",
      sets: w.sets
    });
  }

  const migrated = [...byDate.values()];
  try {
    localStorage.setItem(STORAGE.sessions, JSON.stringify(migrated));
  } catch {}
  return migrated;
}

function withDefaults(e) {
  return {
    name: e.name,
    category: e.category ?? "Other",
    mode: e.mode ?? (DEFAULT_HOLD.includes(e.name) ? "hold" : "reps"),
    sided: e.sided ?? ARM_CATEGORIES.includes(e.category)
  };
}

const defaultExercise = ([name, category, options = {}]) => withDefaults({ name, category, ...options });

let exercises = read(STORAGE.exercises, DEFAULT_EXERCISES.map(defaultExercise)).map(withDefaults);

// Neue Standard-Übungen in bestehende Bibliotheken übernehmen (einmal pro Listen-Version).
// Eigene Übungen und geänderte Einstellungen bleiben unangetastet.
function syncDefaultExercises() {
  if (read(STORAGE.defaultsVersion, 1) >= DEFAULTS_VERSION) return;

  let added = 0;
  for (const def of DEFAULT_EXERCISES) {
    const [name, category] = def;
    const existing = exercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
      exercises.push(defaultExercise(def));
      added++;
    } else if (existing.category === "Arme" && ["Bizeps", "Trizeps"].includes(category)) {
      existing.category = category; // alte Sammelkategorie "Arme" aufteilen
    }
  }

  try {
    localStorage.setItem(STORAGE.exercises, JSON.stringify(exercises));
    localStorage.setItem(STORAGE.defaultsVersion, JSON.stringify(DEFAULTS_VERSION));
  } catch {}
  return added;
}

const newDefaultCount = syncDefaultExercises();
let sessions = read(STORAGE.sessions, null) ?? migrateLegacy();
let routines = read(STORAGE.routines, []);
let active = read(STORAGE.active, null); // laufendes Workout (übersteht App-Neustart)

let currentPage = "home";
let currentRoutineId = null;
let routineReturnPage = "home";
let editorReturnPage = "train";
let progressArm = "Alle";
let routineDraft = { id: null, name: "", exercises: [], icon: null };

function store() {
  try {
    localStorage.setItem(STORAGE.exercises, JSON.stringify(exercises));
    localStorage.setItem(STORAGE.sessions, JSON.stringify(sessions));
    localStorage.setItem(STORAGE.routines, JSON.stringify(routines));
    scheduleBackup();
    return true;
  } catch {
    toast("Speichern fehlgeschlagen – Speicher voll?", { error: true });
    return false;
  }
}

function saveActive() {
  try {
    if (active) localStorage.setItem(STORAGE.active, JSON.stringify(active));
    else localStorage.removeItem(STORAGE.active);
  } catch {}
}

let saveTimer;

function saveActiveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveActive, 300);
}
