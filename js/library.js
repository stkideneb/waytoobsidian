/* =========================================================
   Übungsbibliothek
   ========================================================= */
// Sheet zum Anlegen (index = null) oder Bearbeiten einer Übung
let exerciseForm = null;

function openExerciseSheet(index = null) {
  const e = index === null ? null : exercises[index];
  exerciseForm = e
    ? { index, category: e.category, mode: e.mode, sided: e.sided }
    : { index: null, category: "Pronation", mode: "reps", sided: true };

  openSheet(`
    <h3>${e ? safe(e.name) : "Eigene Übung"}</h3>
    ${e ? "" : `
      <label for="exName">Name</label>
      <input id="exName" placeholder="z. B. Belt Pronation" autocomplete="off">`}

    <label for="exCategory">Kategorie</label>
    <select id="exCategory" onchange="onExerciseCategory(this.value)">
      ${[...new Set([...CATEGORIES, exerciseForm.category])].map((c) => `<option${c === exerciseForm.category ? " selected" : ""}>${safe(c)}</option>`).join("")}
    </select>

    <label>Zähleinheit</label>
    <div class="seg" id="exModeSeg"></div>

    <label>Seiten</label>
    <div class="seg" id="exSidedSeg"></div>

    <p class="muted small-text" id="exHint"></p>

    ${e
      ? `<div class="row spaced">
           <button class="secondary" onclick="closeSheet(); openExerciseStats(${index})">Statistik</button>
           <button onclick="saveExerciseForm()">Speichern</button>
         </div>
         <button class="danger full" onclick="removeExercise(${index})">Übung löschen</button>`
      : `<div class="row">
           <button class="secondary" onclick="closeSheet()">Abbrechen</button>
           <button onclick="saveExerciseForm()">Hinzufügen</button>
         </div>`}`);

  renderExerciseFormSegs();
}

function setExerciseForm(key, value) {
  exerciseForm[key] = value;
  renderExerciseFormSegs();
}

function renderExerciseFormSegs() {
  $("exModeSeg").innerHTML = Object.entries(MODES)
    .map(([key, m]) => `<button class="${exerciseForm.mode === key ? "on" : ""}" onclick="setExerciseForm('mode', '${key}')">${m.label}</button>`)
    .join("");

  $("exSidedSeg").innerHTML = [[false, "Beidseitig"], [true, "Rechts / Links"]]
    .map(([value, label]) => `<button class="${exerciseForm.sided === value ? "on" : ""}" onclick="setExerciseForm('sided', ${value})">${label}</button>`)
    .join("");

  $("exHint").textContent =
    `Erfasst wird pro Satz: kg + ${MODES[exerciseForm.mode].label}` +
    (exerciseForm.sided ? ", getrennt für rechten und linken Arm." : ".");
}

// Neue Übung: Seiten-Standard je nach Kategorie (Armwrestling = rechts/links)
function onExerciseCategory(category) {
  exerciseForm.category = category;
  if (exerciseForm.index === null) {
    exerciseForm.sided = ARM_CATEGORIES.includes(category);
    renderExerciseFormSegs();
  }
}

function saveExerciseForm() {
  const { index, category, mode, sided } = exerciseForm;

  if (index === null) {
    const name = $("exName").value.trim();
    if (!name) {
      $("exName").focus();
      return;
    }
    if (exercises.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
      toast("Diese Übung gibt es schon", { error: true });
      return;
    }
    exercises.push({ name, category, mode, sided });
    toast("Übung hinzugefügt");
  } else {
    Object.assign(exercises[index], { category, mode, sided });
    toast("Übung gespeichert");
  }

  store();
  refreshSelects();
  closeSheet();
  render();
}

async function removeExercise(index) {
  const ok = await ask({
    title: `${exercises[index].name} löschen?`,
    text: "Gespeicherte Workouts und Routinen bleiben erhalten.",
    confirmText: "Löschen",
    danger: true
  });
  if (!ok) return;
  exercises.splice(index, 1);
  store();
  refreshSelects();
  render();
  toast("Übung gelöscht");
}

function openExerciseStats(index) {
  $("progressExercise").value = exercises[index].name;
  progressArm = "Alle";
  show("progress");
}

function renderLibrary() {
  const q = $("librarySearch").value.trim().toLowerCase();
  const records = [...recordMap().values()];

  const groups = new Map();
  exercises.forEach((e, i) => {
    if (q && !e.name.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) return;
    if (!groups.has(e.category)) groups.set(e.category, []);
    groups.get(e.category).push([e, i]);
  });

  $("exerciseList").innerHTML = groups.size
    ? [...groups].sort((a, b) => categoryRank(a[0]) - categoryRank(b[0])).map(([category, list]) => `
        <div class="group-title">${safe(category)}</div>
        ${list.map(([e, i]) => {
          const prs = records
            .filter((r) => r.name === e.name && formatPRShort(r))
            .map((r) => (r.arm === "Beide" ? "" : `${r.arm[0]}: `) + formatPRShort(r))
            .join(" · ");
          return `
            <div class="list-item chevron" onclick="openExerciseSheet(${i})">
              <div class="grow">
                <div class="title">${safe(e.name)}</div>
                <div class="meta-line">kg + ${MODES[e.mode].short}${e.sided ? " · Rechts / Links" : ""}</div>
                ${prs ? `<div class="muted small-text"><span class="pr">PR</span> ${prs}</div>` : ""}
              </div>
            </div>`;
        }).join("")}`).join("")
    : '<div class="empty">Keine Übung gefunden.</div>';
}
