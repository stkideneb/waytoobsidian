/* =========================================================
   Fortschritt & Rekorde
   ========================================================= */
function recordsHTML(records) {
  return records.map((r) => `
    <div class="record">
      <span>${safe(r.name)}<span class="muted">${safe(armSuffix(r.arm))}</span></span>
      <strong class="pr record-value">${formatPR(r)}</strong>
    </div>`).join("");
}

function setProgressArm(arm) {
  progressArm = arm;
  renderProgress();
}

function renderProgress() {
  const name = $("progressExercise").value;
  if (!name) {
    $("progressArm").hidden = true;
    $("progressStats").textContent = "Keine Übungen vorhanden.";
    drawChart($("chart"), [], "kg");
    return;
  }

  const meta = exerciseMeta(name);

  // Arm-Umschalter nur bei rechts/links-Übungen
  $("progressArm").hidden = !meta.sided;
  if (!meta.sided) progressArm = "Alle";
  $("progressArm").innerHTML = ["Alle", "Rechts", "Links"]
    .map((a) => `<button class="${a === progressArm ? "on" : ""}" onclick="setProgressArm('${a}')">${a}</button>`)
    .join("");

  const entries = entriesFor(name, progressArm === "Alle" ? null : progressArm).sort(entriesAsc);

  // Gewicht zeigen; bei Halte-Übungen ohne Gewicht die Haltezeit
  const useHold = meta.mode === "hold" && entries.every((e) => e.sets.every((s) => !s.kg));
  const field = useHold ? "hold" : "kg";
  const unit = useHold ? "Sek." : "kg";

  const values = entries.map((e) => ({
    date: e.date,
    value: Math.max(0, ...e.sets.map((s) => s[field] || 0))
  }));

  if (values.length) {
    const best = Math.max(...values.map((v) => v.value));
    const last = values.at(-1);
    $("progressStats").innerHTML =
      `${values.length} Einträge · PR <strong class="pr">${fmtNum(best)} ${unit}</strong>` +
      ` · Zuletzt <strong>${fmtNum(last.value)} ${unit}</strong>`;
  } else {
    $("progressStats").textContent = "Noch keine Einträge für diese Auswahl.";
  }

  drawChart($("chart"), values, unit);
}

function renderStats() {
  renderProgress();
  const records = getRecords();
  $("allRecords").innerHTML = records.length
    ? recordsHTML(records)
    : '<div class="empty">Noch keine Rekorde vorhanden.</div>';
}

// Liniendiagramm mit Zeitachse. values: [{ date, value }]
function drawChart(canvas, values, unit) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return; // Seite ist ausgeblendet

  // In Display-Auflösung zeichnen, damit das Diagramm auf Retina-Bildschirmen scharf ist
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (!values.length) {
    ctx.fillStyle = "#6f6880";
    ctx.font = "14px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Noch keine Trainingsdaten", width / 2, height / 2);
    return;
  }

  const nums = values.map((v) => v.value);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const padX = 16;
  const padY = 26;

  // x-Position nach Datum, damit Abstände Tage/Monate widerspiegeln
  const times = values.map((v) => new Date(v.date + "T12:00:00").getTime());
  const t0 = Math.min(...times);
  const span = Math.max(...times) - t0;

  const points = values.map((v, i) => {
    let x;
    if (values.length === 1) x = width / 2;
    else if (span) x = padX + ((times[i] - t0) / span) * (width - 2 * padX);
    else x = padX + (i * (width - 2 * padX)) / (values.length - 1);

    const y = max === min
      ? height / 2
      : height - padY - ((v.value - min) / range) * (height - 2 * padY);
    return [x, y];
  });

  // Hilfslinien
  ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
  ctx.lineWidth = 1;
  for (const y of [padY, height / 2, height - padY]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Fläche unter der Linie
  const gradient = ctx.createLinearGradient(0, padY, 0, height);
  gradient.addColorStop(0, "rgba(185, 165, 230, 0.22)");
  gradient.addColorStop(1, "rgba(185, 165, 230, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(points[0][0], height - padY + 6);
  points.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(points.at(-1)[0], height - padY + 6);
  ctx.closePath();
  ctx.fill();

  // Linie
  ctx.strokeStyle = "#b9a5e6";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();

  // Punkte
  for (const [x, y] of points) {
    ctx.fillStyle = "#1a1722";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b9a5e6";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Beschriftung
  ctx.fillStyle = "#9a93a8";
  ctx.font = "11px -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`max. ${fmtNum(max)} ${unit}`, padX, 12);
  ctx.fillText(fmtDate(values[0].date), padX, height - 6);
  if (values.length > 1) {
    ctx.textAlign = "right";
    ctx.fillText(fmtDate(values.at(-1).date), width - padX, height - 6);
  }
}
