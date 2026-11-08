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
  $("homeHero").innerHTML = active
    ? `<div class="greeting">${greeting()}</div>
       <h2>${safe(active.name)} läuft</h2>
       <button class="full" onclick="show('train')">Workout fortsetzen</button>`
    : `<div class="greeting">${greeting()}</div>
       <h2>Bereit fürs Training?</h2>
       <button class="full" onclick="startWorkout()">Workout starten</button>`;

  const weekStart = today(-6);
  $("statTotal").textContent = sessions.length;
  $("statWeek").textContent = sessions.filter((s) => s.date >= weekStart).length;
  $("statPRs").textContent = computePRMarks().size;

  $("homeRoutines").innerHTML = routines.length
    ? routines.map(routineItemHTML).join("")
    : '<div class="empty">Noch keine Routinen.<br>Tippe auf „+ Neu“, um eine anzulegen.</div>';

  const recent = [...sessions].sort(sessionsDesc).slice(0, 6);
  $("homeHistory").innerHTML = recent.length
    ? recent.map((s) => `
        <div class="list-item chevron" onclick="openSession(${s.id})">
          <div class="grow">
            <div><span class="title">${safe(s.name)}</span> <span class="muted">· ${fmtDateFriendly(s.date)}</span></div>
            <div class="muted">${safe(summarize(s.exercises.map((e) => e.name)))}</div>
          </div>
        </div>`).join("")
    : '<div class="empty">Noch keine Workouts.<br>Starte dein erstes Training!</div>';
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
  if (s.duration) parts.push(`${Math.round(s.duration / 60)} min`);
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
