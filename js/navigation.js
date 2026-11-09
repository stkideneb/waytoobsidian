/* =========================================================
   Navigation
   ========================================================= */
function navTabFor(page) {
  if (page === "routine") return routineReturnPage;
  if (page === "editor") return editorReturnPage === "routine" ? routineReturnPage : "train";
  return page;
}

function show(id) {
  currentPage = id;
  const tab = navTabFor(id);
  document.querySelectorAll(".page").forEach((p) => p.classList.toggle("active", p.id === id));
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b.dataset.page === tab));
  window.scrollTo(0, 0);
  render();
}

// Übungen, für die es mindestens einen eingetragenen Wert gibt – zuletzt trainierte zuerst
function trainedExerciseNames() {
  const lastDate = new Map();
  for (const e of allEntries()) {
    const hasValue = e.sets.some((s) => PR_KEYS.some((k) => Number(s[k]) > 0));
    if (hasValue && (lastDate.get(e.name) ?? "") < e.date) lastDate.set(e.name, e.date);
  }
  return [...lastDate].sort((a, b) => b[1].localeCompare(a[1]) || a[0].localeCompare(b[0], "de")).map(([name]) => name);
}

// Fortschritt-Auswahl: nur Übungen mit Werten. Auswahl bleibt erhalten,
// sonst wird die zuletzt trainierte Übung gewählt.
function fillExerciseSelect(select) {
  const previous = select.value;
  const names = trainedExerciseNames();
  select.innerHTML = names.length
    ? names.map((name) => `<option value="${safe(name)}">${safe(name)}</option>`).join("")
    : '<option value="">Noch keine Trainingsdaten</option>';
  select.disabled = !names.length;
  select.value = names.includes(previous) ? previous : (names[0] ?? "");
}

function refreshSelects() {
  fillExerciseSelect($("progressExercise"));
}
