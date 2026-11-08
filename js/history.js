/* =========================================================
   Historie
   ========================================================= */
function renderHistory() {
  const list = [...sessions].sort(sessionsDesc);

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
          <div>
            <strong>${safe(s.name)}</strong>${hasPR ? '<span class="pr-badge">PR</span>' : ""}
          </div>
          <span class="chevron"></span>
        </div>
        <div class="muted">${fmtDateFriendly(s.date)} · ${s.exercises.length} Übungen · ${fmtNum(sessionVolume(s))} kg</div>
        ${sessionDetailHTML(s, prMarks)}
      </div>`;
  }).join("");
}
