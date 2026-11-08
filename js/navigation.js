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

// Auswahlfeld mit allen Übungen füllen, Auswahl bleibt erhalten
function fillExerciseSelect(select) {
  const previous = select.value;
  select.innerHTML = exercises
    .map((e) => `<option value="${safe(e.name)}">${safe(e.name)}</option>`)
    .join("");
  if (exercises.some((e) => e.name === previous)) select.value = previous;
}

function refreshSelects() {
  fillExerciseSelect($("progressExercise"));
}
