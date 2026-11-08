/* =========================================================
   Standard-Übungen
   ========================================================= */
// Optionale Einstellungen je Übung (sonst: kg + Wdh., Seiten nach Kategorie)
const HOLD = { mode: "hold" };
const BOTH = { sided: false };
const HOLD_BOTH = { mode: "hold", sided: false };

// [Name, Kategorie, Einstellungen?]
const DEFAULT_EXERCISES = [
  // ---------- Armwrestling (rechts/links getrennt) ----------
  ["Pronation", "Pronation"],
  ["Belt Pronation", "Pronation"],
  ["Kabel-Pronation", "Pronation"],
  ["Supination", "Supination"],
  ["Kabel-Supination", "Supination"],
  ["Cupping", "Cupping"],
  ["Wrist Curls", "Cupping"],
  ["Kabel-Cupping", "Cupping"],
  ["Rising", "Rising"],
  ["Reverse Wrist Curls", "Rising"],
  ["Kabel-Rising", "Rising"],
  ["Back Pressure", "Back Pressure"],
  ["Drag Back Pressure", "Back Pressure"],
  ["Kabel-Back Pressure", "Back Pressure"],
  ["Side Pressure", "Side Pressure"],
  ["Kabel-Side Pressure", "Side Pressure"],
  ["Finger Containment", "Finger Strength"],
  ["Finger Curls", "Finger Strength"],
  ["Pinch Grip", "Finger Strength", HOLD],
  ["Grip Training", "Grip Strength"],
  ["Wrist Roller", "Grip Strength", BOTH],
  ["Dead Hang", "Grip Strength", HOLD_BOTH],

  // ---------- Brust ----------
  ["Bankdrücken", "Brust"],
  ["Schrägbankdrücken", "Brust"],
  ["Negativ-Bankdrücken", "Brust"],
  ["Kurzhantel-Bankdrücken", "Brust"],
  ["Kurzhantel-Schrägbankdrücken", "Brust"],
  ["Brustpresse (Maschine)", "Brust"],
  ["Butterfly (Maschine)", "Brust"],
  ["Kurzhantel-Fliegende", "Brust"],
  ["Cable Flys", "Brust"],
  ["Kabel-Crossover", "Brust"],
  ["Kabel-Fliegende von oben", "Brust"],
  ["Kabel-Fliegende von unten", "Brust"],
  ["Dips (Brust)", "Brust"],
  ["Liegestütze", "Brust"],

  // ---------- Rücken ----------
  ["Kreuzheben", "Rücken"],
  ["Klimmzüge", "Rücken"],
  ["Latzug", "Rücken"],
  ["Latzug eng", "Rücken"],
  ["Langhantelrudern", "Rücken"],
  ["Kurzhantelrudern einarmig", "Rücken"],
  ["T-Bar-Rudern", "Rücken"],
  ["Rudern (Maschine)", "Rücken"],
  ["Kabelrudern sitzend", "Rücken"],
  ["Kabel-Pullover (Straight-Arm Pulldown)", "Rücken"],
  ["Hyperextensions", "Rücken"],
  ["Shrugs", "Rücken"],

  // ---------- Schultern ----------
  ["Schulterdrücken", "Schultern"],
  ["Kurzhantel-Schulterdrücken", "Schultern"],
  ["Arnold Press", "Schultern"],
  ["Schulterpresse (Maschine)", "Schultern"],
  ["Seitheben", "Schultern"],
  ["Kabel-Seitheben", "Schultern"],
  ["Frontheben", "Schultern"],
  ["Reverse Flys", "Schultern"],
  ["Kabel-Reverse Flys", "Schultern"],
  ["Face Pulls", "Schultern"],
  ["Aufrechtes Rudern", "Schultern"],

  // ---------- Bizeps ----------
  ["Bizepscurls", "Bizeps"],
  ["SZ-Curls", "Bizeps"],
  ["Kurzhantel-Curls", "Bizeps"],
  ["Hammer Curls", "Bizeps"],
  ["Schrägbank-Curls", "Bizeps"],
  ["Scottcurls (Preacher Curls)", "Bizeps"],
  ["Konzentrationscurls", "Bizeps"],
  ["Spider Curls", "Bizeps"],
  ["Reverse Curls", "Bizeps"],
  ["Kabel-Curls", "Bizeps"],
  ["Kabel-Hammer Curls (Seil)", "Bizeps"],
  ["Bayesian Curls (Kabel)", "Bizeps"],
  ["Bizepsmaschine", "Bizeps"],

  // ---------- Trizeps ----------
  ["Trizepsdrücken", "Trizeps"],
  ["Trizepsdrücken am Kabel (Seil)", "Trizeps"],
  ["Trizepsdrücken am Kabel (Stange)", "Trizeps"],
  ["Overhead-Trizepsdrücken (Kabel)", "Trizeps"],
  ["Overhead-Trizepsdrücken (Kurzhantel)", "Trizeps"],
  ["French Press", "Trizeps"],
  ["Skull Crusher", "Trizeps"],
  ["Kickbacks", "Trizeps"],
  ["Kabel-Kickbacks", "Trizeps"],
  ["Enges Bankdrücken", "Trizeps"],
  ["Dips (Trizeps)", "Trizeps"],

  // ---------- Beine & Gesäß ----------
  ["Kniebeugen", "Beine"],
  ["Frontkniebeugen", "Beine"],
  ["Beinpresse", "Beine"],
  ["Hackenschmidt", "Beine"],
  ["Ausfallschritte", "Beine"],
  ["Bulgarian Split Squats", "Beine"],
  ["Rumänisches Kreuzheben", "Beine"],
  ["Hip Thrusts", "Beine"],
  ["Beinstrecker", "Beine"],
  ["Beinbeuger", "Beine"],
  ["Beinbeuger sitzend", "Beine"],
  ["Abduktoren (Maschine)", "Beine"],
  ["Adduktoren (Maschine)", "Beine"],
  ["Kabel-Glute-Kickbacks", "Beine"],
  ["Wadenheben", "Beine"],
  ["Wadenheben sitzend", "Beine"],

  // ---------- Bauch ----------
  ["Bauch-Crunches", "Bauch"],
  ["Kabel-Crunches", "Bauch"],
  ["Beinheben hängend", "Bauch"],
  ["Russian Twists", "Bauch"],
  ["Ab-Roller", "Bauch"],
  ["Planks", "Bauch", HOLD],
  ["Seitstütz", "Bauch", HOLD]
];

// Version der Standardliste: bei Erweiterungen erhöhen, dann werden neue Übungen ergänzt
const DEFAULTS_VERSION = 2;

const CATEGORIES = [
  "Pronation", "Supination", "Cupping", "Rising", "Back Pressure", "Side Pressure",
  "Finger Strength", "Grip Strength",
  "Brust", "Rücken", "Schultern", "Bizeps", "Trizeps", "Beine", "Bauch", "Other"
];

// Reihenfolge der Kategorien in Listen (unbekannte Kategorien ans Ende)
function categoryRank(category) {
  const index = CATEGORIES.indexOf(category);
  return index === -1 ? CATEGORIES.length : index;
}

const ARMS = ["Beide", "Rechts", "Links"];
const ARM_SHORT = { Beide: "Beidseitig", Rechts: "Rechts", Links: "Links" };

// Armwrestling-Kategorien: standardmäßig rechts/links getrennt
const ARM_CATEGORIES = [
  "Pronation", "Supination", "Cupping", "Rising", "Back Pressure", "Side Pressure",
  "Finger Strength", "Grip Strength"
];

// Standard-Übungen, die auf Zeit statt Wiederholungen gezählt werden
const DEFAULT_HOLD = ["Planks"];

// Zähleinheit einer Übung: kg + Wiederholungen ODER kg + Sekunden
const MODES = {
  reps: { field: "reps", label: "Wiederholungen", short: "Wdh." },
  hold: { field: "hold", label: "Sekunden halten", short: "Sek." }
};
const PR_KEYS = ["kg", "reps", "hold"];

const ICON_UP = '<svg class="mini-icon" viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg>';
const ICON_DOWN = '<svg class="mini-icon" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
const ICON_PLAY = '<svg class="mini-icon fill" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
