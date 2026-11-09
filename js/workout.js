/* =========================================================
   Laufendes Workout
   ========================================================= */
const emptySet = () => ({ kg: "", reps: "", hold: "" });

const SIDES = ["Rechts", "Links"];

// Leere Sätze für eine Seite: so viele wie beim letzten Mal (mind. 1)
function emptySetsFor(name, arm) {
  const last = lastEntryFor(name, arm);
  return Array.from({ length: last ? Math.max(1, last.sets.length) : 1 }, emptySet);
}

// Rechts/Links-Übungen: ein Satz = rechter + linker Arm, darum gleich viele Sätze je Seite
function evenSides(ex) {
  const count = Math.max(1, ...ex.sides.map((side) => side.sets.length));
  for (const side of ex.sides) {
    while (side.sets.length < count) side.sets.push(emptySet());
  }
  return ex;
}

// Neue Übung im Workout. Werte werden je Seite getrennt erfasst:
// - Rechts/Links-Übungen: Seiten "Rechts" und "Links", gleich viele Sätze
// - beidseitige Übungen:  eine Seite "Beide"
function makeWorkoutExercise(name) {
  const meta = exerciseMeta(name);
  return evenSides({
    name,
    category: meta.category,
    mode: meta.mode,
    sided: meta.sided,
    sides: meta.sided
      ? SIDES.map((arm) => ({ arm, sets: emptySetsFor(name, arm) }))
      : [{ arm: "Beide", sets: emptySetsFor(name, null) }]
  });
}

// Laufende Workouts aus der alten Version (eine Satzliste + Arm-Umschalter) umwandeln
function upgradeWorkoutExercise(ex) {
  if (Array.isArray(ex.sides)) return evenSides(ex);
  const { sided } = workoutExerciseMeta(ex);
  const sets = Array.isArray(ex.sets) && ex.sets.length ? ex.sets : [emptySet()];
  const usedArm = ex.arm === "Links" ? "Links" : "Rechts";
  ex.sides = sided
    ? SIDES.map((arm) => ({ arm, sets: arm === usedArm ? sets : emptySetsFor(ex.name, arm) }))
    : [{ arm: "Beide", sets }];
  delete ex.sets;
  delete ex.arm;
  return evenSides(ex);
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

// Eingabefelder (kg + Wdh./Sek.) für einen Satz einer Seite
function setInputsHTML(ex, i, k, j, unit, hint, label) {
  const s = ex.sides[k].sets[j];
  return `
    <input type="number" inputmode="decimal" min="0" step=".5" data-ex="${i}" data-side="${k}" data-set="${j}" data-field="kg"
           value="${safe(s.kg)}" placeholder="${hint.kg || "kg"}" aria-label="Gewicht ${label}">
    <input type="number" inputmode="numeric" min="0" step="1" data-ex="${i}" data-side="${k}" data-set="${j}" data-field="${unit.field}"
           value="${safe(s[unit.field])}" placeholder="${hint[unit.field] || unit.short}" aria-label="${unit.label} ${label}">`;
}

// Anhaltspunkt: gleicher Satz vom letzten Mal, sonst letzter Satz von damals
const hintFor = (last, j) => last?.sets[j] ?? last?.sets.at(-1) ?? {};

function setRowsHTML(ex, i, unit) {
  const count = ex.sides[0].sets.length;
  const removeBtn = (j) =>
    `<button type="button" class="set-remove" data-action="remove-set" data-ex="${i}" data-set="${j}" aria-label="Satz ${j + 1} entfernen">✕</button>`;

  // Beidseitig: eine Zeile pro Satz
  if (ex.sides.length === 1) {
    const last = lastEntryFor(ex.name, null);
    return `
      <div class="sethead"><span>Satz</span><span>kg</span><span>${unit.short}</span><span></span></div>
      ${Array.from({ length: count }, (_, j) => `
        <div class="setrow">
          <span class="num">${j + 1}</span>
          ${setInputsHTML(ex, i, 0, j, unit, hintFor(last, j), `Satz ${j + 1}`)}
          ${removeBtn(j)}
        </div>`).join("")}`;
  }

  // Rechts/Links: pro Satz eine Zeile R und eine Zeile L, Werte getrennt
  const lasts = ex.sides.map((side) => lastEntryFor(ex.name, side.arm));
  return `
    <div class="sethead paired"><span>Satz</span><span></span><span>kg</span><span>${unit.short}</span><span></span></div>
    ${Array.from({ length: count }, (_, j) => `
      <div class="set-pair">
        <span class="num">${j + 1}</span>
        ${ex.sides.map((side, k) => `
          <span class="side-tag side-${side.arm === "Rechts" ? "r" : "l"}" title="${side.arm}" aria-hidden="true">${side.arm[0]}</span>
          ${setInputsHTML(ex, i, k, j, unit, hintFor(lasts[k], j), `Satz ${j + 1} ${side.arm.toLowerCase()}`)}`).join("")}
        ${removeBtn(j)}
      </div>`).join("")}`;
}

function exerciseBlockHTML(ex, i) {
  upgradeWorkoutExercise(ex);
  const { mode } = workoutExerciseMeta(ex);
  const unit = MODES[mode];
  // Notiz aus der Routine, mit der das Workout gestartet wurde
  const note = routineNote(routines.find((r) => r.id === active?.routineId), ex.name);

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

      ${setRowsHTML(ex, i, unit)}
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
  const { ex, side, set, field } = event.target.dataset;
  if (!active || set === undefined || !field) return;
  active.exercises[Number(ex)].sides[Number(side)].sets[Number(set)][field] = event.target.value;
  saveActiveSoon();
});

$("activeExercises").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || !active) return;

  const exIndex = Number(button.dataset.ex);
  const ex = active.exercises[exIndex];

  switch (button.dataset.action) {
    case "add-set": // bei Rechts/Links für beide Arme
      ex.sides.forEach((side) => side.sets.push(emptySet()));
      break;
    case "remove-set":
      ex.sides.forEach((side) => side.sets.splice(Number(button.dataset.set), 1));
      evenSides(ex); // mindestens ein Satz bleibt
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
    default:
      return;
  }

  saveActive();
  renderActive();
});

async function finishWorkout() {
  // Jede Seite wird ein eigener Eintrag (Rechts / Links / Beide), wie bisher gespeichert,
  // damit Verlauf, PRs und Statistik pro Arm getrennt bleiben. Leere Seiten fallen weg.
  const done = active.exercises
    .flatMap((ex) => {
      upgradeWorkoutExercise(ex);
      const { mode } = workoutExerciseMeta(ex);
      return ex.sides.map((side) => ({
        name: ex.name,
        category: ex.category,
        arm: side.arm,
        sets: side.sets
          .map((s) => ({
            kg: Number(s.kg) || 0,
            reps: mode === "reps" ? Number(s.reps) || 0 : 0,
            hold: mode === "hold" ? Number(s.hold) || 0 : 0
          }))
          .filter((s) => s.kg || s.reps || s.hold)
      }));
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
    if (beaten.length) newPRs.push(`${ex.name}${ex.arm === "Beide" ? "" : ` ${ex.arm.toLowerCase()}`} ${formatPR(current, beaten)}`);
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
