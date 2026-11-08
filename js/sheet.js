/* =========================================================
   Bottom-Sheet: Bestätigungen, Übungsauswahl, Details
   ========================================================= */
let sheetResolver = null;
let sheetHideTimer;

function openSheet(html) {
  const sheet = $("sheet");
  const backdrop = $("sheetBackdrop");

  // Offene Abfrage eines vorherigen Sheets beenden
  const previous = sheetResolver;
  sheetResolver = null;
  previous?.(null);

  clearTimeout(sheetHideTimer);
  sheet.classList.remove("tall");
  $("sheetBody").innerHTML = html;
  sheet.hidden = false;
  backdrop.hidden = false;
  sheet.scrollTop = 0;
  void sheet.offsetHeight; // Layout erzwingen, damit die Animation startet
  sheet.classList.add("open");
  backdrop.classList.add("open");
  document.body.classList.add("no-scroll");
}

function closeSheet(result = null) {
  const sheet = $("sheet");
  const backdrop = $("sheetBackdrop");
  sheet.classList.remove("open");
  backdrop.classList.remove("open");
  document.body.classList.remove("no-scroll");

  const resolve = sheetResolver;
  sheetResolver = null;
  resolve?.(result);

  clearTimeout(sheetHideTimer);
  sheetHideTimer = setTimeout(() => {
    sheet.hidden = true;
    backdrop.hidden = true;
    sheet.classList.remove("tall");
  }, 300);
}

// Ersetzt confirm(): liefert true/false
function ask({ title, text = "", confirmText = "OK", danger = false }) {
  return new Promise((resolve) => {
    openSheet(`
      <h3>${safe(title)}</h3>
      ${text ? `<p class="muted">${safe(text)}</p>` : ""}
      <div class="row" style="margin-top:18px">
        <button class="secondary" onclick="closeSheet(false)">Abbrechen</button>
        <button class="${danger ? "danger" : ""}" onclick="closeSheet(true)">${safe(confirmText)}</button>
      </div>`);
    sheetResolver = (value) => resolve(value === true);
  });
}

// Übungsauswahl mit Suche; liefert den Namen oder null
let pickerMarked = [];

function pickExercise({ title = "Übung hinzufügen", marked = [] } = {}) {
  return new Promise((resolve) => {
    openSheet(`
      <h3>${safe(title)}</h3>
      <input id="pickerSearch" type="search" placeholder="Suchen oder neue Übung eingeben …" autocomplete="off">
      <div id="pickerList"></div>`);
    $("sheet").classList.add("tall");
    sheetResolver = resolve;
    pickerMarked = marked;
    renderPicker("");
    $("pickerSearch").addEventListener("input", (e) => renderPicker(e.target.value));
  });
}

function renderPicker(query) {
  const q = query.trim().toLowerCase();
  const matches = exercises.filter(
    (e) => !q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
  );

  const groups = new Map();
  for (const e of matches) {
    if (!groups.has(e.category)) groups.set(e.category, []);
    groups.get(e.category).push(e);
  }

  let html = [...groups].sort((a, b) => categoryRank(a[0]) - categoryRank(b[0])).map(([category, list]) => `
    <div class="group-title">${safe(category)}</div>
    ${list.map((e) => `
      <button class="picker-item" data-name="${safe(e.name)}">
        ${safe(e.name)}
        ${pickerMarked.includes(e.name) ? '<span class="muted small-text">bereits dabei</span>' : ""}
      </button>`).join("")}`).join("");

  if (!matches.length) {
    html = '<div class="empty">Keine Übung gefunden.</div>';
  }

  const exact = exercises.some((e) => e.name.toLowerCase() === q);
  if (q && !exact) {
    html += `<button class="picker-item create" data-create="${safe(query.trim())}">+ „${safe(query.trim())}“ als neue Übung anlegen</button>`;
  }

  $("pickerList").innerHTML = html || '<div class="empty">Keine Übung gefunden.</div>';
}

$("sheetBody").addEventListener("click", (event) => {
  const item = event.target.closest(".picker-item");
  if (!item) return;

  if (item.dataset.create) {
    const name = item.dataset.create;
    exercises.push(withDefaults({ name, category: "Other" }));
    store();
    refreshSelects();
    toast(`„${name}“ angelegt`);
    closeSheet(name);
  } else {
    closeSheet(item.dataset.name);
  }
});
