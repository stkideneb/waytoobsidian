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

/* ---------- Sheet nach unten wegziehen ---------- */
// Ziehen startet überall im Sheet, aber nur wenn der Inhalt darunter ganz oben ist
// (sonst wird normal gescrollt, z. B. in der Übungsliste).
const sheetDrag = { startY: 0, startTime: 0, dy: 0, active: false, blocked: false };

function scrolledAncestor(el, sheet) {
  for (let node = el; node && node !== sheet.parentNode; node = node.parentNode) {
    if (node.nodeType === 1 && node.scrollTop > 0 && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

function resetSheetDrag(sheet, backdrop) {
  sheet.style.transition = "";
  sheet.style.transform = "";
  sheet.style.userSelect = "";
  backdrop.style.transition = "";
  backdrop.style.opacity = "";
}

(() => {
  const sheet = $("sheet");
  const backdrop = $("sheetBackdrop");
  let mouseDown = false;
  let suppressClick = false;

  const start = (y, target) => {
    if (!sheet.classList.contains("open")) return false;
    sheetDrag.startY = y;
    sheetDrag.startTime = Date.now();
    sheetDrag.dy = 0;
    sheetDrag.active = false;
    sheetDrag.blocked = !!scrolledAncestor(target, sheet);
    return true;
  };

  // true = Sheet wird gezogen (Standardverhalten unterdrücken)
  const move = (y) => {
    if (sheetDrag.blocked) return false;
    const dy = y - sheetDrag.startY;

    if (!sheetDrag.active) {
      if (dy < -4) { sheetDrag.blocked = true; return false; } // nach oben = normal scrollen
      if (dy < 8) return false;
      sheetDrag.active = true;
      sheet.style.transition = "none";
      backdrop.style.transition = "none";
      sheet.style.userSelect = "none"; // kein Text-Markieren beim Ziehen mit der Maus
      window.getSelection()?.removeAllRanges();
      document.activeElement?.blur?.(); // Tastatur einklappen
    }

    sheetDrag.dy = Math.max(0, dy);
    sheet.style.transform = `translateY(${sheetDrag.dy}px)`;
    backdrop.style.opacity = String(Math.max(0.15, 1 - sheetDrag.dy / (sheet.offsetHeight || 400)));
    return true;
  };

  const end = () => {
    if (!sheetDrag.active) return false;
    sheetDrag.active = false;
    const speed = sheetDrag.dy / Math.max(1, Date.now() - sheetDrag.startTime); // px/ms
    const close = sheetDrag.dy > Math.min(140, sheet.offsetHeight * 0.3) || (speed > 0.6 && sheetDrag.dy > 30);
    resetSheetDrag(sheet, backdrop); // Übergang wieder an: animiert zurück oder raus
    if (close) closeSheet(null);
    return true;
  };

  // Finger
  sheet.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) start(e.touches[0].clientY, e.target);
  }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && move(e.touches[0].clientY)) e.preventDefault();
  }, { passive: false });
  sheet.addEventListener("touchend", end);
  sheet.addEventListener("touchcancel", end);

  // Maus (in Textfeldern bleibt Markieren möglich)
  sheet.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest("input, textarea, select")) return;
    mouseDown = start(e.clientY, e.target);
  });
  window.addEventListener("mousemove", (e) => {
    if (mouseDown && move(e.clientY)) e.preventDefault();
  });
  window.addEventListener("mouseup", () => {
    if (!mouseDown) return;
    mouseDown = false;
    if (end()) suppressClick = true; // kein Klick auf eine Übung nach dem Ziehen
  });
  sheet.addEventListener("click", (e) => {
    if (!suppressClick) return;
    suppressClick = false;
    e.stopPropagation();
    e.preventDefault();
  }, true);
  window.addEventListener("mousedown", () => { suppressClick = false; }, true);
})();

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
