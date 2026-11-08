/* =========================================================
   Laufendes Workout
   ========================================================= */
const emptySet = () => ({ kg: "", reps: "", hold: "" });

// Neue Übung im Workout:
// - noch nie gemacht -> 1 Satz
// - schon gemacht    -> so viele Sätze wie beim letzten Mal (Werte als Anhaltspunkte)
function makeWorkoutExercise(name) {
  const meta = exerciseMeta(name);
  const lastAny = lastEntryFor(name);
  const arm = meta.sided
    ? (["Rechts", "Links"].includes(lastAny?.arm) ? lastAny.arm : "Rechts")
    : "Beide";
  const last = lastEntryFor(name, meta.sided ? arm : null);
  const setCount = last ? Math.max(1, last.sets.length) : 1;

  return {
    name,
    category: meta.category,
    mode: meta.mode,
    sided: meta.sided,
    arm,
    sets: Array.from({ length: setCount }, emptySet)
  };
}

// Einstellungen einer Übung im Workout (ältere Workouts haben sie noch nicht gespeichert)
function workoutExerciseMeta(ex) {
  const meta = exerciseMeta(ex.name);
  return { mode: ex.mode ?? meta.mode, sided: ex.sided ?? meta.sided };
}

async function startWorkout(routineId) {
  if (active) {
    const ok = await ask({
      title: "Es läuft bereits ein Workout",
      text: `„${active.name}“ verwerfen und ein neues Workout starten?`,
      confirmText: "Neu starten",
      danger: true
    });
    if (!ok) {
      show("train");
      return;
    }
  }

  const routine = routines.find((r) => r.id === routineId);
  active = {
    id: Date.now(),
    startedAt: Date.now(),
    name: routine ? routine.name : "Freies Training",
    routineId: routine ? routine.id : null,
    date: today(),
    exercises: routine ? routine.exercises.map(makeWorkoutExercise) : []
  };
  saveActive();
  show("train");
  if (!routine) addExerciseToWorkout();
}

async function addExerciseToWorkout() {
  if (!active) return;
  const name = await pickExercise({ marked: active.exercises.map((e) => e.name) });
  if (!name || !active) return;
  active.exercises.push(makeWorkoutExercise(name));
  saveActive();
  renderActive();
  $("activeExercises").lastElementChild?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exerciseBlockHTML(ex, i) {
  const { mode, sided } = workoutExerciseMeta(ex);
  const unit = MODES[mode];
  const arm = sided ? ex.arm : null;
  const last = lastEntryFor(ex.name, arm);
  const pr = personalBest(entriesFor(ex.name, arm));
  // Notiz aus der Routine, mit der das Workout gestartet wurde
  const note = routineNote(routines.find((r) => r.id === active?.routineId), ex.name);

  const info = last
    ? `<div class="muted small-text">Letztes Mal · ${fmtDateFriendly(last.date)}</div>
       <div class="muted">${last.sets.map(formatSet).join(" · ")}</div>
       <div class="muted">Bestwerte: ${formatPRLabeled(pr)}</div>
       <button class="link" data-action="copy" data-ex="${i}">Werte übernehmen</button>`
    : `<div class="muted">Erstes Training${sided ? ` (${ex.arm})` : ""}. Dein Ergebnis wird zum ersten Bestwert.</div>`;

  const rows = ex.sets.map((s, j) => {
    // Anhaltspunkt: gleicher Satz vom letzten Mal, sonst letzter Satz von damals
    const hint = last?.sets[j] ?? last?.sets.at(-1) ?? {};
    return `
      <div class="setrow">
        <span class="num">${j + 1}</span>
        <input type="number" inputmode="decimal" min="0" step=".5" data-ex="${i}" data-set="${j}" data-field="kg"
               value="${safe(s.kg)}" placeholder="${hint.kg || "kg"}" aria-label="Gewicht Satz ${j + 1}">
        <input type="number" inputmode="numeric" min="0" step="1" data-ex="${i}" data-set="${j}" data-field="${unit.field}"
               value="${safe(s[unit.field])}" placeholder="${hint[unit.field] || unit.short}" aria-label="${unit.label} Satz ${j + 1}">
        <button type="button" data-action="remove-set" data-ex="${i}" data-set="${j}" aria-label="Satz entfernen">✕</button>
      </div>`;
  }).join("");

  const armToggle = sided
    ? `<div class="seg">
         ${["Rechts", "Links"].map((a) => `<button class="${a === ex.arm ? "on" : ""}" data-action="arm" data-arm="${a}" data-ex="${i}">${a}</button>`).join("")}
       </div>`
    : "";

  return `
    <div class="card">
      <div class="ex-head">
        <div>
          <strong>${safe(ex.name)}</strong>
          <div class="muted small-text">${safe(ex.category)} · kg + ${unit.label}</div>
        </div>
        <button class="icon-btn" data-action="remove-ex" data-ex="${i}" aria-label="Übung entfernen">✕</button>
      </div>

      ${note ? `<div class="ex-note in-workout">${safe(note)}</div>` : ""}

      ${armToggle}

      <div class="info">${info}</div>

      <div class="sethead"><span>Satz</span><span>kg</span><span>${unit.short}</span><span></span></div>
      ${rows}
      <button class="secondary small full" data-action="add-set" data-ex="${i}">+ Satz</button>
    </div>`;
}

function renderActive() {
  $("activeName").value = active.name;
  $("activeExercises").innerHTML = active.exercises.length
    ? active.exercises.map(exerciseBlockHTML).join("")
    : '<div class="card empty">Noch keine Übungen.<br>Tippe unten auf „+ Übung hinzufügen“.</div>';
  updateElapsed();
}

function renderTrain() {
  $("trainIdle").hidden = !!active;
  $("trainActive").hidden = !active;

  if (active) {
    renderActive();
  } else {
    $("trainRoutines").innerHTML = routines.length
      ? routines.map(routineItemHTML).join("")
      : '<div class="empty">Noch keine Routinen.</div>';
  }
}

// Eingaben in den Sätzen direkt ins laufende Workout übernehmen
$("activeExercises").addEventListener("input", (event) => {
  const { ex, set, field } = event.target.dataset;
  if (!active || set === undefined || !field) return;
  active.exercises[Number(ex)].sets[Number(set)][field] = event.target.value;
  saveActiveSoon();
});

$("activeExercises").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || !active) return;

  const exIndex = Number(button.dataset.ex);
  const ex = active.exercises[exIndex];

  switch (button.dataset.action) {
    case "arm":
      ex.arm = button.dataset.arm;
      break;
    case "add-set":
      ex.sets.push(emptySet());
      break;
    case "remove-set":
      ex.sets.splice(Number(button.dataset.set), 1);
      break;
    case "remove-ex": {
      const ok = await ask({
        title: `${ex.name} entfernen?`,
        text: "Die eingetragenen Sätze dieser Übung gehen verloren.",
        confirmText: "Entfernen",
        danger: true
      });
      if (!ok || !active) return;
      active.exercises.splice(exIndex, 1);
      break;
    }
    case "copy": {
      const last = lastEntryFor(ex.name, workoutExerciseMeta(ex).sided ? ex.arm : null);
      if (!last) return;
      ex.sets = last.sets.map((s) => ({ kg: s.kg || "", reps: s.reps || "", hold: s.hold || "" }));
      toast("Werte übernommen");
      break;
    }
    default:
      return;
  }

  saveActive();
  renderActive();
});

async function finishWorkout() {
  const done = active.exercises
    .map((ex) => {
      const { mode, sided } = workoutExerciseMeta(ex);
      return {
        name: ex.name,
        category: ex.category,
        arm: sided ? ex.arm : "Beide",
        sets: ex.sets
          .map((s) => ({
            kg: Number(s.kg) || 0,
            reps: mode === "reps" ? Number(s.reps) || 0 : 0,
            hold: mode === "hold" ? Number(s.hold) || 0 : 0
          }))
          .filter((s) => s.kg || s.reps || s.hold)
      };
    })
    .filter((ex) => ex.sets.length);

  if (!done.length) {
    toast("Trage mindestens einen Satz ein", { error: true });
    return;
  }

  // Neue PRs ermitteln (vor dem Speichern, gegen alle bisherigen Workouts)
  const newPRs = [];
  for (const ex of done) {
    const previous = entriesFor(ex.name, armFilter(ex.name, ex.arm));
    if (!previous.length) continue;
    const oldPR = personalBest(previous);
    const current = personalBest([ex]);
    const beaten = PR_KEYS.filter((k) => current[k] > oldPR[k]);
    if (beaten.length) newPRs.push(`${ex.name} ${formatPR(current, beaten)}`);
  }

  const session = {
    id: active.id,
    name: active.name.trim() || "Workout",
    routineId: active.routineId,
    date: active.date || today(),
    duration: active.startedAt ? Math.round((Date.now() - active.startedAt) / 1000) : undefined,
    exercises: done
  };

  sessions.push(session);
  if (!store()) {
    sessions.pop();
    return;
  }

  active = null;
  saveActive();

  if (newPRs.length) toast(`Neuer PR: ${newPRs.join(", ")}`, { duration: 4500 });
  else toast("Workout gespeichert");
  show("home");
}

async function discardWorkout() {
  const ok = await ask({
    title: "Workout verwerfen?",
    text: "Alle eingetragenen Sätze gehen verloren.",
    confirmText: "Verwerfen",
    danger: true
  });
  if (!ok) return;
  active = null;
  saveActive();
  toast("Workout verworfen");
  show("home");
}

// Laufzeit-Anzeige und Leiste "Workout läuft"
function updateElapsed() {
  if (!active) return;
  const text = fmtDuration((Date.now() - (active.startedAt ?? active.id)) / 1000);
  document.querySelectorAll(".elapsed").forEach((el) => (el.textContent = text));
}

function renderWorkoutBar() {
  const visible = !!active && currentPage !== "train";
  $("workoutBar").hidden = !visible;
  document.body.classList.toggle("has-bar", visible);
  if (!visible) return;
  $("workoutBarTitle").textContent = active.name || "Workout";
  $("workoutBarSub").textContent = active.exercises.length
    ? summarize(active.exercises.map((e) => e.name))
    : "Tippen zum Fortsetzen";
  updateElapsed();
}

setInterval(updateElapsed, 1000);
