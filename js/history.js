/* =========================================================
   Historie
   ========================================================= */
// Sortierung: "desc" = neueste zuerst, "asc" = älteste zuerst (wird gemerkt)
let historyOrder = read(STORAGE.historyOrder, "desc") === "asc" ? "asc" : "desc";

// Pfeil + Linien: Richtung der Sortierung (desc = neueste oben)
const SORT_ICONS = {
  desc: '<svg class="mini-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M13 6h8M13 12h6M13 18h4"/></svg>',
  asc: '<svg class="mini-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20V4M3.5 7.5 7 4l3.5 3.5M13 6h4M13 12h6M13 18h8"/></svg>'
};

const HISTORY_ORDERS = {
  desc: { short: "Neueste", label: "Neueste zuerst" },
  asc: { short: "Älteste", label: "Älteste zuerst" }
};

function openHistorySort() {
  const sorted = [...sessions].sort(sessionsDesc);
  // Konkret zeigen, womit die Liste dann beginnt
  const firstOf = { desc: sorted[0], asc: sorted.at(-1) };

  openSheet(`
    <h3>Historie sortieren</h3>
    <p class="muted" style="margin-top:-4px">${sessions.length} Workouts</p>
    ${Object.entries(HISTORY_ORDERS).map(([key, o]) => {
      const first = firstOf[key];
      const on = historyOrder === key;
      return `
        <button class="sort-option${on ? " on" : ""}" onclick="setHistoryOrder('${key}')" aria-pressed="${on}">
          <span class="sort-icon">${SORT_ICONS[key]}</span>
          <span class="grow">
            <strong>${o.label}</strong>
            <span class="muted small-text">Beginnt mit ${safe(first.name)} · ${fmtDateFriendly(first.date)}</span>
          </span>
          <span class="sort-check" aria-hidden="true">${on ? "✓" : ""}</span>
        </button>`;
    }).join("")}`);
}

function setHistoryOrder(order) {
  historyOrder = order;
  try {
    localStorage.setItem(STORAGE.historyOrder, JSON.stringify(order));
  } catch {}
  closeSheet();
  renderHistory();
  window.scrollTo({ top: 0, behavior: "smooth" }); // Liste von vorne zeigen
  toast(HISTORY_ORDERS[order].label);
}

function renderHistory() {
  const list = [...sessions].sort(historyOrder === "asc" ? sessionsAsc : sessionsDesc);

  const sortBtn = $("historySortBtn");
  sortBtn.hidden = list.length < 2;
  sortBtn.innerHTML = `${SORT_ICONS[historyOrder]}<span>${HISTORY_ORDERS[historyOrder].short}</span>`;
  sortBtn.setAttribute("aria-label", `Sortierung: ${HISTORY_ORDERS[historyOrder].label}. Ändern`);

  if (!list.length) {
    $("historyList").innerHTML = '<div class="card empty">Noch keine Workouts gespeichert.</div>';
    return;
  }

  const prMarks = computePRMarks();

  $("historyList").innerHTML = list.map((s) => {
    const hasPR = s.exercises.some((_, i) => prMarks.has(`${s.id}|${i}`));
    return `
      <div class="card" onclick="openSession(${s.id})" style="cursor:pointer">
        <div class="card-head">
          <div class="hist-title">
            ${sessionIconHTML(s, "sm")}
            <strong>${safe(s.name)}</strong>${hasPR ? '<span class="pr-badge">PR</span>' : ""}
          </div>
          <span class="chevron"></span>
        </div>
        <div class="muted">${fmtDateFriendly(s.date)} · ${s.exercises.length} Übungen · ${fmtNum(sessionVolume(s))} kg${s.duration > 0 ? ` · ${fmtDuration(s.duration)}` : ""}</div>
        ${sessionDetailHTML(s, prMarks)}
      </div>`;
  }).join("");
}
