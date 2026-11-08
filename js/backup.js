/* =========================================================
   Daten: Export & Import (Backup)
   ========================================================= */
const BACKUP_FORMAT = "waytoobsidian-backup";
const BACKUP_FORMATS = [BACKUP_FORMAT, "ironarm-backup"]; // ältere Backups weiter importierbar
const BACKUP_VERSION = 1;

function openDataSheet() {
  const lastExport = read(STORAGE.lastExport, null);
  openSheet(`
    <h3>Daten &amp; Backup</h3>
    <div class="data-stats">
      <div><strong>${sessions.length}</strong><span class="muted small-text">Workouts</span></div>
      <div><strong>${routines.length}</strong><span class="muted small-text">Routinen</span></div>
      <div><strong>${exercises.length}</strong><span class="muted small-text">Übungen</span></div>
    </div>

    <div class="backup-box">
      <strong>Automatisches Online-Backup</strong>
      <p class="muted small-text">${backupStatusText()}</p>
      <div class="backup-code">${formatCode(backupCode())}</div>
      <p class="muted small-text">
        Notiere dir diesen Code (z. B. im Passwort-Manager). Damit holst du deine Daten
        nach dem Löschen der Browserdaten oder auf einem neuen iPhone zurück.
      </p>
      <div class="row">
        <button class="secondary" onclick="copyBackupCode()">Code kopieren</button>
        <button class="secondary" onclick="backupNow(this)">Jetzt sichern</button>
      </div>
    </div>

    <button class="full spaced" onclick="openRestoreSheet()">Mit Backup-Code wiederherstellen</button>
    <button class="secondary full spaced" onclick="exportData()">Als Datei exportieren</button>
    <button class="secondary full spaced" onclick="$('importFile').click()">Datei importieren</button>

    <p class="muted small-text" style="margin:0">
      ${lastExport ? `Letzter Datei-Export: ${fmtDate(lastExport)}.` : "Noch kein Datei-Export erstellt."}
      Die App arbeitet offline mit den Daten auf diesem Gerät. Nach jeder Änderung wird
      zusätzlich ein Online-Backup gesichert, sobald Internet da ist.
    </p>`);
}

/* ---------- Online-Backup (Netlify Function unter /api/backup) ---------- */
const BACKUP_ENDPOINT = "/api/backup";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne 0/O und 1/I
const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{20}$/;

let backupTimer;
let backupRunning = false;
let backupFailed = false;
let dataRevision = 0;

// Backup-Code dieses Geräts (wird beim ersten Bedarf zufällig erzeugt)
function backupCode() {
  let code = read(STORAGE.backupCode, null);
  if (!code) {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    code = [...bytes].map((b) => CODE_ALPHABET[b & 31]).join("");
    try {
      localStorage.setItem(STORAGE.backupCode, JSON.stringify(code));
    } catch {}
  }
  return code;
}

const normalizeCode = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const formatCode = (code) => code.match(/.{1,5}/g).join("-");

function backupStatusText() {
  const last = read(STORAGE.lastBackup, null);
  const pending = read(STORAGE.backupPending, false);
  const when = last
    ? new Date(last).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    : null;

  if (backupFailed) return `Online-Backup gerade nicht erreichbar.${when ? ` Letztes Backup: ${when}.` : ""} Es wird später erneut versucht.`;
  if (pending && !navigator.onLine) return "Offline – Änderungen werden gesichert, sobald Internet da ist.";
  if (pending) return when ? `Zuletzt gesichert: ${when}. Neue Änderungen werden gerade gesichert.` : "Wird gerade gesichert …";
  return when ? `Zuletzt gesichert: ${when}.` : "Noch kein Online-Backup. Es startet nach deiner nächsten Änderung.";
}

// Nach jeder Datenänderung: kurz warten, dann im Hintergrund hochladen
function scheduleBackup(delay = 2000) {
  dataRevision++;
  try {
    localStorage.setItem(STORAGE.backupPending, "true");
  } catch {}
  clearTimeout(backupTimer);
  backupTimer = setTimeout(runBackup, delay);
}

async function runBackup({ force = false } = {}) {
  clearTimeout(backupTimer);
  if (backupRunning) return false;
  if (!force && !read(STORAGE.backupPending, false)) return true;
  if (!navigator.onLine) return false;

  backupRunning = true;
  const revision = dataRevision;
  try {
    const response = await fetch(BACKUP_ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Backup-Code": backupCode() },
      body: JSON.stringify(buildBackup()),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const first = !read(STORAGE.lastBackup, null);
    localStorage.setItem(STORAGE.lastBackup, JSON.stringify(new Date().toISOString()));
    if (revision === dataRevision) localStorage.removeItem(STORAGE.backupPending);
    backupFailed = false;
    if (first) toast("Online-Backup aktiv – deinen Backup-Code findest du unter „Daten“", { duration: 5000 });
    return true;
  } catch {
    backupFailed = true;
    return false;
  } finally {
    backupRunning = false;
    // Während des Uploads neu geänderte Daten gleich hinterherschicken
    if (!backupFailed && read(STORAGE.backupPending, false)) scheduleBackupRetry();
  }
}

function scheduleBackupRetry() {
  clearTimeout(backupTimer);
  backupTimer = setTimeout(runBackup, 2000);
}

async function backupNow(button) {
  button.disabled = true;
  button.textContent = "Sichere …";
  const ok = await runBackup({ force: true });
  toast(ok ? "Online-Backup gespeichert" : "Online-Backup nicht erreichbar", { error: !ok });
  openDataSheet();
}

async function copyBackupCode() {
  try {
    await navigator.clipboard.writeText(formatCode(backupCode()));
    toast("Backup-Code kopiert");
  } catch {
    toast("Kopieren nicht möglich – Code bitte abschreiben", { error: true });
  }
}

function openRestoreSheet() {
  openSheet(`
    <h3>Backup wiederherstellen</h3>
    <p class="muted">Gib den Backup-Code ein, den du dir notiert hast. Danach wählst du, ob das Backup ergänzt oder alles ersetzt wird.</p>
    <input id="restoreCode" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
      autocomplete="off" autocapitalize="characters" spellcheck="false">
    <button class="full spaced" style="margin-top:14px" onclick="restoreFromCode(this)">Backup laden</button>
    <button class="secondary full" onclick="openDataSheet()">Zurück</button>`);
}

async function restoreFromCode(button) {
  const code = normalizeCode($("restoreCode").value);
  if (!CODE_PATTERN.test(code)) {
    toast("Der Code muss 20 Zeichen haben (ohne 0, O, 1, I)", { error: true });
    return;
  }
  if (!navigator.onLine) {
    toast("Zum Wiederherstellen brauchst du Internet", { error: true });
    return;
  }

  button.disabled = true;
  button.textContent = "Lade …";
  try {
    const response = await fetch(BACKUP_ENDPOINT, { headers: { "X-Backup-Code": code }, cache: "no-store" });
    if (response.status === 404) throw new Error("Zu diesem Code gibt es kein Backup.");
    if (!response.ok) throw new Error("Online-Backup gerade nicht erreichbar.");
    pendingImport = { ...parseBackup(await response.text()), code };
    showImportSheet();
  } catch (error) {
    toast(error.message, { error: true });
    button.disabled = false;
    button.textContent = "Backup laden";
  }
}

// Nach einem Wiederherstellen weiter in dasselbe Online-Backup sichern
function adoptBackupCode(code) {
  if (!code) return;
  try {
    localStorage.setItem(STORAGE.backupCode, JSON.stringify(code));
    localStorage.setItem(STORAGE.lastBackup, JSON.stringify(new Date().toISOString()));
  } catch {}
}

function buildBackup() {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      exercises,
      sessions,
      routines,
      defaultsVersion: read(STORAGE.defaultsVersion, DEFAULTS_VERSION)
    }
  };
}

async function exportData() {
  const json = JSON.stringify(buildBackup(), null, 2);
  const filename = `waytoobsidian-backup-${today()}.json`;
  const blob = new Blob([json], { type: "application/json" });

  // Auf dem Smartphone: Teilen-Menü (z. B. "In Dateien sichern"), sonst normaler Download
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const file = typeof File === "function" ? new File([blob], filename, { type: "application/json" }) : null;

  let saved = false;
  if (isMobile && file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "WayToObsidian Backup" });
      saved = true;
    } catch (error) {
      if (error.name === "AbortError") return; // vom Nutzer abgebrochen
    }
  }

  if (!saved) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  try {
    localStorage.setItem(STORAGE.lastExport, JSON.stringify(today()));
  } catch {}
  closeSheet();
  toast("Backup exportiert");
}

// Prüft eine Backup-Datei und liefert bereinigte Daten (oder wirft einen Fehler)
function parseBackup(text) {
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error("Die Datei ist kein gültiges Backup.");
  }

  const data = backup?.data;
  if (!BACKUP_FORMATS.includes(backup?.format) || !data) {
    throw new Error("Die Datei ist kein WayToObsidian-Backup.");
  }
  if (backup.version > BACKUP_VERSION) {
    throw new Error("Das Backup stammt aus einer neueren App-Version.");
  }

  const isSet = (s) => s && typeof s === "object";
  const sessionsIn = (Array.isArray(data.sessions) ? data.sessions : []).filter(
    (s) => s && typeof s.id === "number" && typeof s.date === "string" &&
      Array.isArray(s.exercises) &&
      s.exercises.every((e) => e && typeof e.name === "string" && Array.isArray(e.sets) && e.sets.every(isSet))
  );
  const routinesIn = (Array.isArray(data.routines) ? data.routines : [])
    .filter((r) => r && typeof r.id === "number" && typeof r.name === "string" && Array.isArray(r.exercises))
    .map((r) => ({ ...r, icon: normalizeIcon(r.icon) }));
  const exercisesIn = (Array.isArray(data.exercises) ? data.exercises : [])
    .filter((e) => e && typeof e.name === "string" && e.name.trim())
    .map(withDefaults);

  return {
    exportedAt: backup.exportedAt,
    sessions: sessionsIn,
    routines: routinesIn,
    exercises: exercisesIn,
    defaultsVersion: Number(data.defaultsVersion) || 1
  };
}

let pendingImport = null;

async function handleImportFile(input) {
  const file = input.files?.[0];
  input.value = ""; // gleiche Datei erneut auswählbar machen
  if (!file) return;

  try {
    pendingImport = parseBackup(await file.text());
  } catch (error) {
    closeSheet();
    toast(error.message, { error: true });
    return;
  }

  showImportSheet();
}

function showImportSheet() {
  const p = pendingImport;
  openSheet(`
    <h3>Backup importieren</h3>
    <p class="muted">
      ${p.exportedAt ? `Erstellt am ${fmtDate(p.exportedAt.slice(0, 10))}. ` : ""}Enthält:
    </p>
    <div class="data-stats">
      <div><strong>${p.sessions.length}</strong><span class="muted small-text">Workouts</span></div>
      <div><strong>${p.routines.length}</strong><span class="muted small-text">Routinen</span></div>
      <div><strong>${p.exercises.length}</strong><span class="muted small-text">Übungen</span></div>
    </div>

    <button class="full spaced" onclick="applyImport('merge')">Zusammenführen</button>
    <p class="muted small-text">Ergänzt nur, was auf diesem Gerät fehlt. Vorhandene Daten bleiben unverändert.</p>

    <button class="danger full spaced" onclick="applyImport('replace')">Alles ersetzen</button>
    <p class="muted small-text">Löscht alle Workouts, Routinen und Übungen auf diesem Gerät und übernimmt das Backup.</p>

    <button class="secondary full" onclick="closeSheet()">Abbrechen</button>`);
}

async function applyImport(mode) {
  const p = pendingImport;
  if (!p) return;

  if (mode === "replace") {
    const ok = await ask({
      title: "Alle Daten ersetzen?",
      text: `Deine aktuellen ${sessions.length} Workouts, ${routines.length} Routinen und ${exercises.length} Übungen werden durch das Backup ersetzt.`,
      confirmText: "Ersetzen",
      danger: true
    });
    if (!ok) return;

    sessions = p.sessions;
    routines = p.routines;
    exercises = p.exercises.length ? p.exercises : exercises;
    try {
      localStorage.setItem(STORAGE.defaultsVersion, JSON.stringify(p.defaultsVersion));
    } catch {}
    syncDefaultExercises(); // falls das Backup eine ältere Standardliste hat
    adoptBackupCode(p.code);
    if (!store()) return;
    toast("Backup übernommen");
  } else {
    const sessionIds = new Set(sessions.map((s) => s.id));
    const routineIds = new Set(routines.map((r) => r.id));
    const exerciseNames = new Set(exercises.map((e) => e.name.toLowerCase()));

    const newSessions = p.sessions.filter((s) => !sessionIds.has(s.id));
    const newRoutines = p.routines.filter((r) => !routineIds.has(r.id));
    const newExercises = p.exercises.filter((e) => !exerciseNames.has(e.name.toLowerCase()));

    sessions.push(...newSessions);
    routines.push(...newRoutines);
    exercises.push(...newExercises);
    adoptBackupCode(p.code);
    if (!store()) return;

    const added = newSessions.length + newRoutines.length + newExercises.length;
    toast(added
      ? `Ergänzt: ${newSessions.length} Workouts, ${newRoutines.length} Routinen, ${newExercises.length} Übungen`
      : "Alles war schon vorhanden", { duration: 3500 });
  }

  pendingImport = null;
  closeSheet();
  refreshSelects();
  render();
}
