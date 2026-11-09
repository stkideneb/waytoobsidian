/* =========================================================
   Startseite
   ========================================================= */
function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Hallo";
  return "Guten Abend";
}

function routineItemHTML(r) {
  return `
    <div class="list-item" onclick="openRoutine(${r.id})">
      ${routineIconHTML(r.icon)}
      <div class="grow">
        <div class="title">${safe(r.name)}</div>
        <div class="muted">${safe(summarize(r.exercises)) || "Keine Übungen"}</div>
      </div>
      <button class="round" onclick="event.stopPropagation(); startWorkout(${r.id})" aria-label="${safe(r.name)} starten">${ICON_PLAY}</button>
    </div>`;
}

function renderHome() {
  const top = `<div class="hero-top"><div class="greeting">${greeting()}</div>${streakBadgeHTML()}</div>`;
  $("homeHero").innerHTML = active
    ? `${top}
       <h2>${safe(active.name)} läuft</h2>
       <button class="full" onclick="show('train')">Workout fortsetzen</button>`
    : `${top}
       <h2>Bereit fürs Training?</h2>`;

  const prMarks = computePRMarks();
  renderWeekPRs(prMarks);
  renderHeatmap(prMarks);

  $("homeRoutines").innerHTML = routines.length
    ? routines.map(routineItemHTML).join("")
    : '<div class="empty">Noch keine Routinen.<br>Tippe auf „+ Neu“, um eine anzulegen.</div>';

  const recent = [...sessions].sort(sessionsDesc).slice(0, 6);
  $("homeHistory").innerHTML = recent.length
    ? recent.map((s) => `
        <div class="list-item chevron" onclick="openSession(${s.id})">
          ${sessionIconHTML(s)}
          <div class="grow">
            <div><span class="title">${safe(s.name)}</span> <span class="muted">· ${fmtDateFriendly(s.date)}${s.duration > 0 ? ` · ${fmtDuration(s.duration)}` : ""}</span></div>
            <div class="muted">${safe(summarize(s.exercises.map((e) => e.name)))}</div>
          </div>
        </div>`).join("")
    : '<div class="empty">Noch keine Workouts.<br>Starte dein erstes Training!</div>';
}

/* ---------- Kalender-Hilfen (Wochen beginnen am Montag) ---------- */
const HEATMAP_WEEKS = 18;
const DAY_MS = 86400000;

// Lokales Datum als "JJJJ-MM-TT"
function isoOf(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Montag der Woche, in der isoDate liegt
function mondayOf(isoDate) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return isoOf(d);
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return isoOf(d);
}

/* ---------- Tages-Streak ---------- */
// Tage in Folge mit mindestens einem Workout. Heute zählt mit, sobald trainiert wurde;
// ohne Training heute läuft der Streak bis gestern weiter (der Tag ist ja noch nicht vorbei).
function dayStreak() {
  const days = new Set(sessions.map((s) => s.date));
  let day = days.has(today()) ? today() : today(-1);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

// Flammen-Stufen: Farben von oben (Spitze) nach unten (Basis)
const STREAK_FLAMES = [
  { from: 365, name: "schwarz", stops: ["#2a2630", "#0b0a0e"], outline: true },
  { from: 182, name: "dunkellila", stops: ["#7a4bb0", "#3a1a5e"] },
  { from: 60, name: "dunkelrot", stops: ["#b0262c", "#5e0f14"] },
  { from: 30, name: "gelb-orange-rot", stops: ["#ffd84d", "#ff8a1f", "#e0302a"] },
  { from: 7, name: "gelb-orange", stops: ["#ffd84d", "#ff8a1f"] },
  { from: 1, name: "gelb", stops: ["#ffe27a", "#f5c542"] }
];

function streakBadgeHTML() {
  const streak = dayStreak();
  if (!streak) return "";
  const flame = STREAK_FLAMES.find((f) => streak >= f.from);
  const stops = flame.stops
    .map((color, i) => `<stop offset="${(i / (flame.stops.length - 1)) * 100}%" stop-color="${color}"/>`)
    .join("");
  const label = `${streak} ${streak === 1 ? "Tag" : "Tage"} Streak`;
  return `
    <div class="streak${flame.outline ? " outline" : ""}" title="${label}" aria-label="${label}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <defs><linearGradient id="streakFlame" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient></defs>
        <path fill="url(#streakFlame)" d="M12 21.5a6.5 6.5 0 0 0 6.5-6.5c0-4.5-4-6.5-4.5-11.5-3 1.8-4.5 4.5-4.5 7-1-.7-1.6-1.8-1.8-3C6.4 9.2 5.5 11.3 5.5 15a6.5 6.5 0 0 0 6.5 6.5z"/>
      </svg>
      <span>${streak}</span>
    </div>`;
}

/* ---------- PRs dieser Woche ---------- */
function renderWeekPRs(prMarks) {
  const monday = mondayOf(today());
  const dateOf = new Map(sessions.map((s) => [s.id, s.date]));
  let count = 0;
  for (const key of prMarks.keys()) {
    const date = dateOf.get(Number(key.split("|")[0]));
    if (date && date >= monday) count++;
  }
  $("statWeekPRs").textContent = count;
  $("statWeekPRs").classList.toggle("gold", count > 0);
}

/* ---------- Heatmap ---------- */
function renderHeatmap(prMarks) {
  const todayIso = today();
  const start = addDays(mondayOf(todayIso), -7 * (HEATMAP_WEEKS - 1));

  const byDay = new Map();
  for (const s of sessions) {
    if (s.date < start || s.date > todayIso) continue;
    if (!byDay.has(s.date)) byDay.set(s.date, []);
    byDay.get(s.date).push(s);
  }
  const prSessions = new Set([...prMarks.keys()].map((k) => Number(k.split("|")[0])));

  const cells = [];
  const months = [];
  let lastMonth = null;
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const monday = addDays(start, w * 7);
    // Monatsname über der Woche, in der ein neuer Monat beginnt
    const month = addDays(monday, 6).slice(0, 7);
    if (month !== lastMonth) {
      const label = new Date(month + "-15T12:00:00").toLocaleDateString("de-DE", { month: "short" });
      months.push(`<span style="grid-column:${w + 1}">${safe(label.replace(".", ""))}</span>`);
      lastMonth = month;
    }

    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);
      if (date > todayIso) {
        cells.push('<span class="hm-cell future"></span>');
        continue;
      }
      const list = byDay.get(date) || [];
      const level = Math.min(list.length, 3);
      const pr = list.some((s) => prSessions.has(s.id));
      const label = `${fmtDateFriendly(date)}: ${list.length ? list.map((s) => s.name).join(", ") : "kein Workout"}`;
      cells.push(`<button class="hm-cell l${level}${pr ? " pr" : ""}${date === todayIso ? " today" : ""}"
        ${list.length ? `onclick="openHeatmapDay('${date}')"` : "disabled"}
        title="${safe(label)}" aria-label="${safe(label)}"></button>`);
    }
  }

  const total = [...byDay.values()].reduce((n, list) => n + list.length, 0);
  $("heatmapSummary").textContent = `${total} ${total === 1 ? "Workout" : "Workouts"} in ${HEATMAP_WEEKS} Wochen`;
  $("heatmap").innerHTML = `
    <div class="hm-months" style="--weeks:${HEATMAP_WEEKS}">${months.join("")}</div>
    <div class="hm-grid" style="--weeks:${HEATMAP_WEEKS}">${cells.join("")}</div>
    <div class="hm-legend">
      <span>Weniger</span>
      <span class="hm-cell l0"></span><span class="hm-cell l1"></span><span class="hm-cell l2"></span><span class="hm-cell l3"></span>
      <span>Mehr</span>
      <span class="hm-cell l1 pr" style="margin-left:10px"></span><span>PR</span>
    </div>`;
}

function openHeatmapDay(date) {
  const list = sessions.filter((s) => s.date === date);
  if (list.length === 1) openSession(list[0].id);
  else if (list.length) toast(`${fmtDateFriendly(date)}: ${list.map((s) => s.name).join(", ")}`, { duration: 3500 });
}

/* =========================================================
   Workout-Details (Sheet)
   ========================================================= */
function sessionDetailHTML(s, prMarks) {
  return s.exercises.map((e, i) => {
    const pr = prMarks.get(`${s.id}|${i}`);
    return `
      <div class="hist-ex">
        ${safe(e.name)}<span class="muted">${safe(armSuffix(e.arm))}</span>
        ${pr ? `<span class="pr"> · PR ${pr}</span>` : ""}
        <div class="muted">${e.sets.map(formatSet).join(" · ")}</div>
      </div>`;
  }).join("");
}

function sessionMeta(s) {
  const parts = [fmtDate(s.date), `${s.exercises.length} Übungen`, `${fmtNum(sessionVolume(s))} kg`];
  if (s.duration) parts.push(fmtDuration(s.duration));
  return parts.join(" · ");
}

function openSession(id) {
  const s = sessions.find((s) => s.id === id);
  if (!s) return;
  openSheet(`
    <h3>${safe(s.name)}</h3>
    <div class="muted">${sessionMeta(s)}</div>
    ${sessionDetailHTML(s, computePRMarks())}
    <div class="row" style="margin-top:22px">
      <button class="danger" onclick="deleteSession(${s.id})">Löschen</button>
      <button class="secondary" onclick="closeSheet()">Schließen</button>
    </div>`);
}

async function deleteSession(id) {
  const ok = await ask({
    title: "Workout löschen?",
    text: "Das Workout wird dauerhaft entfernt.",
    confirmText: "Löschen",
    danger: true
  });
  if (!ok) return;
  sessions = sessions.filter((s) => s.id !== id);
  store();
  toast("Workout gelöscht");
  render();
}
