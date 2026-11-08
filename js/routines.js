/* =========================================================
   Routinen-Symbole
   ========================================================= */
// Linien-Icons (24er Raster); "filled" = flächig gefüllt
const ROUTINE_SYMBOLS = {
  arm: {
    filled: true,
    viewBox: "60 88 340 344",
    svg: '<g transform="translate(-14 -24)"><path d="M296 200 L364 200 C372 262 402 324 402 372 C402 418 370 446 330 446 L134 446 C100 446 82 422 84 392 C86 356 112 330 146 324 C168 246 268 236 298 290 C300 262 296 236 296 200 Z"/><rect x="282" y="122" width="96" height="88" rx="26"/></g>'
  },
  dumbbell: { svg: '<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>' },
  barbell: { svg: '<path d="M2 12h20M5.5 8v8M8.5 6v12M15.5 6v12M18.5 8v8"/>' },
  kettlebell: { svg: '<path d="M9 9V7a3 3 0 0 1 6 0v2"/><path d="M7.5 9h9l1 4a6 6 0 0 1-11 0z"/><path d="M7 18.5h10"/>' },
  grip: { svg: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5M11 10.5V5a1.5 1.5 0 0 1 3 0v5.5M14 10.5V6.5a1.5 1.5 0 0 1 3 0V14c0 3.9-2.6 7-6 7-2.4 0-3.9-1.4-5.3-3.4L4.2 15a1.5 1.5 0 0 1 2.5-1.7L8 15"/>' },
  bolt: { svg: '<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>' },
  flame: { svg: '<path d="M12 21.5a6.5 6.5 0 0 0 6.5-6.5c0-4.5-4-6.5-4.5-11.5-3 1.8-4.5 4.5-4.5 7-1-.7-1.6-1.8-1.8-3C6.4 9.2 5.5 11.3 5.5 15a6.5 6.5 0 0 0 6.5 6.5z"/>' },
  target: { svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>' },
  trophy: { svg: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5.5a2.5 2.5 0 0 0 2.6 4M16 6h2.5a2.5 2.5 0 0 1-2.6 4M12 13v4M9 20.5h6M10 17h4"/>' },
  heart: { svg: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>' },
  timer: { svg: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2.5M10 2.5h4"/>' },
  mountain: { svg: '<path d="M2.5 20 9.5 7.5l4 6.5 2.2-3.2L21.5 20z"/>' },
  star: { svg: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>' }
};

// Gedämpfte Farbtöne passend zum App-Design
const ROUTINE_COLORS = {
  lilac: "#b9a5e6",
  rose: "#e2a4c0",
  blue: "#8fb0dc",
  sage: "#9cc3a8",
  gold: "#e6c88f",
  grey: "#9a93a8"
};

const DEFAULT_ICON = { symbol: "dumbbell", color: "lilac", image: null };

function normalizeIcon(icon) {
  const image = typeof icon?.image === "string" && icon.image.startsWith("data:image/") ? icon.image : null;
  return {
    symbol: ROUTINE_SYMBOLS[icon?.symbol] ? icon.symbol : DEFAULT_ICON.symbol,
    color: ROUTINE_COLORS[icon?.color] ? icon.color : DEFAULT_ICON.color,
    image
  };
}

function symbolSVG(key) {
  const symbol = ROUTINE_SYMBOLS[key] ?? ROUTINE_SYMBOLS[DEFAULT_ICON.symbol];
  return `<svg class="sym${symbol.filled ? " filled" : ""}" viewBox="${symbol.viewBox ?? "0 0 24 24"}" aria-hidden="true">${symbol.svg}</svg>`;
}

function routineIconHTML(icon, size = "") {
  const ic = normalizeIcon(icon);
  if (ic.image) {
    return `<span class="r-icon ${size}"><img src="${safe(ic.image)}" alt=""></span>`;
  }
  const color = ROUTINE_COLORS[ic.color];
  return `<span class="r-icon ${size}" style="background:${color}26;color:${color}">${symbolSVG(ic.symbol)}</span>`;
}

function setRoutineIcon(key, value) {
  routineDraft.icon = { ...normalizeIcon(routineDraft.icon), [key]: value };
  if (key === "symbol" || key === "color") routineDraft.icon.image = null; // Symbol statt Bild
  renderIconEditor();
}

function removeRoutineImage() {
  routineDraft.icon = { ...normalizeIcon(routineDraft.icon), image: null };
  renderIconEditor();
}

// Eigenes Bild: mittig quadratisch zuschneiden und auf 128 px verkleinern
async function handleRoutineImage(input) {
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const size = 128;
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1722"; // Hintergrund für transparente Logos
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(
      img,
      (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side,
      0, 0, size, size
    );

    routineDraft.icon = { ...normalizeIcon(routineDraft.icon), image: canvas.toDataURL("image/jpeg", 0.85) };
    renderIconEditor();
  } catch {
    toast("Das Bild konnte nicht geladen werden", { error: true });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renderIconEditor() {
  const ic = normalizeIcon(routineDraft.icon);
  $("iconPreview").innerHTML = routineIconHTML(ic, "lg");
  $("removeImageBtn").hidden = !ic.image;

  $("symbolGrid").innerHTML = Object.keys(ROUTINE_SYMBOLS)
    .map((key) => `<button class="${!ic.image && ic.symbol === key ? "on" : ""}" onclick="setRoutineIcon('symbol', '${key}')" aria-label="Symbol ${key}">${symbolSVG(key)}</button>`)
    .join("");

  $("colorRow").innerHTML = Object.entries(ROUTINE_COLORS)
    .map(([key, color]) => `<button class="${!ic.image && ic.color === key ? "on" : ""}" style="background:${color}" onclick="setRoutineIcon('color', '${key}')" aria-label="Farbe ${key}"></button>`)
    .join("");
}

/* =========================================================
   Routinen
   ========================================================= */
function newRoutine() {
  routineDraft = { id: null, name: "", exercises: [], icon: { ...DEFAULT_ICON } };
  editorReturnPage = currentPage === "routine" ? "routine" : currentPage === "home" ? "home" : "train";
  show("editor");
}

function editRoutine(id) {
  const r = routines.find((r) => r.id === id);
  if (!r) return;
  routineDraft = { id: r.id, name: r.name, exercises: [...r.exercises], icon: normalizeIcon(r.icon) };
  editorReturnPage = "routine";
  show("editor");
}

function closeEditor() {
  show(editorReturnPage);
}

function openRoutine(id) {
  currentRoutineId = id;
  routineReturnPage = currentPage === "train" ? "train" : "home";
  show("routine");
}

function routineBack() {
  show(routineReturnPage);
}

async function addRoutineExercise() {
  const name = await pickExercise({ title: "Übung zur Routine", marked: routineDraft.exercises });
  if (!name) return;
  if (routineDraft.exercises.includes(name)) {
    toast("Übung ist bereits in der Routine");
    return;
  }
  routineDraft.exercises.push(name);
  renderEditor();
}

function removeRoutineExercise(index) {
  routineDraft.exercises.splice(index, 1);
  renderEditor();
}

function moveRoutineExercise(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= routineDraft.exercises.length) return;
  const list = routineDraft.exercises;
  [list[index], list[target]] = [list[target], list[index]];
  renderEditor();
}

function renderEditor() {
  $("editorTitle").textContent = routineDraft.id ? "Routine bearbeiten" : "Neue Routine";
  $("routineName").value = routineDraft.name;
  $("editorCount").textContent = routineDraft.exercises.length ? `${routineDraft.exercises.length}` : "";
  renderIconEditor();

  $("routineExercises").innerHTML = routineDraft.exercises.length
    ? routineDraft.exercises.map((name, i) => `
        <div class="list-item" style="cursor:default">
          <span class="grow">${i + 1}. ${safe(name)}</span>
          <button class="icon-btn" onclick="moveRoutineExercise(${i}, -1)" aria-label="Nach oben"${i === 0 ? " disabled" : ""}>${ICON_UP}</button>
          <button class="icon-btn" onclick="moveRoutineExercise(${i}, 1)" aria-label="Nach unten"${i === routineDraft.exercises.length - 1 ? " disabled" : ""}>${ICON_DOWN}</button>
          <button class="icon-btn" onclick="removeRoutineExercise(${i})" aria-label="Entfernen">✕</button>
        </div>`).join("")
    : '<div class="empty">Noch keine Übungen ausgewählt.</div>';
}

function saveRoutine() {
  const name = routineDraft.name.trim();
  if (!name) {
    toast("Bitte gib der Routine einen Namen", { error: true });
    $("routineName").focus();
    return;
  }
  if (!routineDraft.exercises.length) {
    toast("Bitte füge mindestens eine Übung hinzu", { error: true });
    return;
  }

  const existing = routines.find((r) => r.id === routineDraft.id);
  if (existing) {
    existing.name = name;
    existing.exercises = [...routineDraft.exercises];
    existing.icon = normalizeIcon(routineDraft.icon);
    currentRoutineId = existing.id;
  } else {
    const routine = {
      id: Date.now(),
      name,
      exercises: [...routineDraft.exercises],
      icon: normalizeIcon(routineDraft.icon)
    };
    routines.push(routine);
    currentRoutineId = routine.id;
  }

  store();
  toast(existing ? "Routine aktualisiert" : "Routine gespeichert");
  routineDraft = { id: null, name: "", exercises: [], icon: { ...DEFAULT_ICON } };
  show(existing ? "routine" : editorReturnPage === "routine" ? "home" : editorReturnPage);
}

async function deleteRoutine(id) {
  const ok = await ask({
    title: "Routine löschen?",
    text: "Deine gespeicherten Workouts bleiben erhalten.",
    confirmText: "Löschen",
    danger: true
  });
  if (!ok) return;
  routines = routines.filter((r) => r.id !== id);
  store();
  toast("Routine gelöscht");
  show(routineReturnPage);
}

function renderRoutinePage() {
  const r = routines.find((r) => r.id === currentRoutineId);
  if (!r) {
    show("home");
    return;
  }

  $("routineTitle").textContent = r.name;
  $("routineIcon").innerHTML = routineIconHTML(r.icon, "lg");
  $("routineSummary").textContent = r.exercises.join(", ");

  const done = sessions.filter((s) => s.routineId === r.id).sort(sessionsAsc);
  const values = done.map((s) => ({ date: s.date, value: sessionVolume(s) }));

  if (values.length) {
    const best = Math.max(...values.map((v) => v.value));
    const last = values.at(-1);
    $("routineStats").innerHTML =
      `${values.length} Trainings · Bestwert <strong class="pr">${fmtNum(best)} kg</strong>` +
      ` · Zuletzt <strong>${fmtNum(last.value)} kg</strong>`;
  } else {
    $("routineStats").textContent = "Starte die Routine, um deinen Verlauf aufzuzeichnen.";
  }

  drawChart($("routineChart"), values, "kg");

  $("routineSessions").innerHTML = done.length
    ? [...done].reverse().map((s) => `
        <div class="list-item chevron" onclick="openSession(${s.id})">
          <span class="grow">${fmtDateFriendly(s.date)}</span>
          <strong>${fmtNum(sessionVolume(s))} kg</strong>
        </div>`).join("")
    : '<div class="empty">Noch keine Trainings mit dieser Routine.</div>';
}
