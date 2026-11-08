/* =========================================================
   Rendering (nur die sichtbare Seite)
   ========================================================= */
const RENDERERS = {
  home: renderHome,
  train: renderTrain,
  routine: renderRoutinePage,
  editor: renderEditor,
  history: renderHistory,
  progress: renderStats,
  library: renderLibrary
};

function render() {
  RENDERERS[currentPage]?.();
  renderWorkoutBar();
}

/* =========================================================
   Start
   ========================================================= */
refreshSelects();
render();
if (newDefaultCount) toast(`${newDefaultCount} neue Übungen in der Bibliothek`, { duration: 3500 });

// Diagramme bei Größenänderung (z. B. Drehen des iPhones) neu zeichnen
// Tastatur auf dem iPhone: Sie überdeckt das Layout, statt es zu verkleinern.
// Deshalb Höhe und Abstand des sichtbaren Bereichs messen und dem Sheet mitgeben.
function syncViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const root = document.documentElement.style;
  const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  root.setProperty("--vv-height", `${vv.height}px`);
  root.setProperty("--kb-offset", `${kb}px`);
  $("sheet").classList.toggle("kb-open", kb > 0);
}
window.visualViewport?.addEventListener("resize", syncViewport);
window.visualViewport?.addEventListener("scroll", syncViewport);
syncViewport();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (currentPage === "progress") renderProgress();
    if (currentPage === "routine") renderRoutinePage();
  }, 150);
});

// Laufendes Workout sichern, wenn die App in den Hintergrund geht
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveActive();
  runBackup(); // offene Änderungen beim Öffnen oder Verlassen der App sichern
});

// Offline gemachte Änderungen hochladen, sobald wieder Internet da ist
window.addEventListener("online", () => runBackup());
runBackup();

// Browser bitten, die lokalen Trainingsdaten nicht automatisch zu löschen
navigator.storage?.persist?.().catch(() => {});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  });
}
