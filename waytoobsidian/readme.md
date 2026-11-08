# WayToObsidian – Armwrestling & Krafttraining

| | |
|---|---|
| **Version** | 1.9 |
| **Plattform** | iPhone / iOS (läuft auch in jedem modernen Browser) |
| **Technologie** | Progressive Web App (PWA) |
| **Hosting** | Netlify (kostenloser Tarif) |
| **Sprache** | Deutsch |
| **Design** | Ruhiger Dark Mode in sanftem Lila, Flieder als Akzent, weiches Gold für Bestleistungen |

---

## 1. Projektbeschreibung

WayToObsidian ist eine persönliche Fitness- und Trainings-App für das iPhone.

Der Schwerpunkt liegt auf **Armwrestling-Training**. Zusätzlich gibt es eine Bibliothek für klassisches Krafttraining.

Mit WayToObsidian zeichnest du komplette Workouts auf, legst Routinen an, verfolgst deine Kraftsteigerung und hältst deine persönlichen Rekorde (PRs) fest.

Die App ist als **Offline-First-PWA** gebaut: Alle Trainingsdaten bleiben lokal auf deinem Gerät.

---

## 2. Bedienung auf einen Blick

| Tab | Wofür |
|---|---|
| **Home** | Workout starten, Routinen, letzte Workouts |
| **Training** | laufendes Workout, Routine starten, neue Routine erstellen |
| **Historie** | alle Workouts mit allen Übungen |
| **Stats** | Kraftverlauf pro Übung und alle Rekorde |
| **Übungen** | Übungsbibliothek mit Suche |

So ist die App aufgebaut:

- **Ein Tipp, ein Ziel**: Routinen, Workouts und Übungen sind direkt antippbar und öffnen ihre Details.
- **Bottom-Sheets statt Popups**: Übungsauswahl, Workout-Details und Sicherheitsabfragen gleiten von unten ins Bild. Zum Schließen tippst du auf den abgedunkelten Bereich.
- **Leiste „Workout läuft“**: Solange ein Workout läuft, bleibt über der Navigation eine Leiste mit Name und Laufzeit sichtbar. Ein Tipp bringt dich zurück ins Workout.
- **Zurück-Buttons** auf allen Unterseiten (Routine-Details, Routinen-Editor).
- **Spürbare Reaktionen**: Am Computer heben sich Buttons, Karten und Listeneinträge beim Darüberfahren leicht an bzw. werden hervorgehoben. Pfeile wandern mit, und Löschen-Buttons färben sich ein. Auf dem iPhone gibt es beim Antippen ein kurzes Druck-Feedback. Mit der Tastatur zeigt ein blauer Rahmen, welches Element ausgewählt ist.
- **Daten-Symbol** oben rechts: Export und Import deiner Daten (siehe „Daten & Backup“).
- **Rückmeldungen** als kurze Hinweise am unteren Rand, z. B. „Workout gespeichert“ oder „Neuer PR“.

---

## 3. Hauptfunktionen

### Startseite

- **Begrüßung** mit großem Button **Workout starten**. Läuft schon ein Workout, steht dort **Workout fortsetzen**.
- **Kennzahlen**: Workouts gesamt, Workouts der letzten 7 Tage und Anzahl aufgestellter PRs.
- **Routinen** mit ihren Übungen und einem runden Play-Button zum direkten Starten. Ein Tipp auf die Routine öffnet die Detailansicht mit dem Fortschrittsgraphen.
- **Historie**: deine letzten Workouts, sehr kompakt mit Name, Datum („Heute“, „Gestern“, „Do., 5. Nov.“) und den Übungen darunter. Es werden drei Übungen gezeigt, der Rest wird mit „…“ abgekürzt, z. B. *Pronation, Cupping, Rising, …* Ein Tipp öffnet alle Details des Workouts.

### Training: Workouts aufzeichnen

Ein Workout ist eine Trainingseinheit mit beliebig vielen Übungen.

1. **Workout starten**: leer starten oder eine Routine wählen. Beim leeren Workout öffnet sich sofort die Übungsauswahl.
2. **Übungen hinzufügen**: jederzeit über „+ Übung hinzufügen“. Die Auswahl ist nach Kategorien sortiert und durchsuchbar. Gibt es eine Übung noch nicht, legst du sie direkt aus der Suche heraus an.
3. **Sätze eintragen**: pro Satz **kg + Wiederholungen** oder **kg + Sekunden**, je nach Zähleinheit der Übung. Leere Sätze werden ignoriert.
   - **Noch nie gemacht:** die Übung startet mit **einem Satz**.
   - **Schon mal gemacht:** so viele Sätze wie beim letzten Mal. Die damaligen kg- und Wiederholungs- bzw. Sekundenwerte stehen als graue Anhaltspunkte in den Feldern.
4. **Workout speichern** über den Button unten. Zum Verwerfen tippst du oben im Workout auf den roten Mülleimer.

Das Datum setzt WayToObsidian automatisch auf den Tag, an dem du das Workout startest.

Oben im Workout siehst du die **Laufzeit**. Sie wird beim Speichern als Trainingsdauer übernommen.

Pro Übung im Workout siehst du:

- dein **letztes Training** dieser Übung mit allen Sätzen
- deine **PRs** für diese Übung
- die Werte vom letzten Mal als **graue Platzhalter** in den Eingabefeldern
- **„Werte übernehmen“**: trägt die Sätze vom letzten Mal direkt ein

**Arm-Auswahl:** Nur Übungen, die auf *Rechts / Links* eingestellt sind, zeigen einen Umschalter für den rechten und linken Arm. WayToObsidian merkt sich den zuletzt trainierten Arm. Beidseitige Übungen wie Bankdrücken oder Kniebeugen haben keine Arm-Auswahl.

Das laufende Workout wird automatisch zwischengespeichert. Es geht also nicht verloren, wenn du die App schließt oder das iPhone sperrst.

### Routinen

Eine Routine ist eine gespeicherte Liste von Übungen, z. B. „Arm Tag A“: Pronation, Cupping, Rising, Back Pressure.

- **Anlegen**: im Tab *Training* über „+ Neue Routine erstellen“ oder auf der Startseite über „+ Neu“. Es öffnet sich der Routinen-Editor als eigene Seite.
- **Reihenfolge** der Übungen mit den Pfeilen nach oben und unten ändern
- **Starten**: auf der Startseite oder im Training-Tab. Alle Übungen sind dann schon im Workout, inklusive Satzanzahl, Arm und Werten vom letzten Mal.
- **Symbol**: Jede Routine bekommt ein Symbol mit Farbe oder ein eigenes Bild bzw. Logo. Zur Auswahl stehen 13 schlichte Symbole (Arm, Hantel, Langhantel, Kettlebell, Griff, Blitz, Flamme, Ziel, Pokal, Herz, Timer, Berg, Stern) und 6 gedämpfte Farben. Eigene Bilder werden automatisch quadratisch zugeschnitten und auf 128 × 128 px verkleinert (wenige KB), damit der Speicher nicht vollläuft.
- **Detailansicht** (Routine antippen):
  - **Graph des Gesamtgewichts** pro Training über Tage und Monate. Die Zeitachse ist maßstabsgetreu, längere Pausen sind also als größere Abstände sichtbar.
  - Bestwert und letzter Wert
  - Liste aller Trainings dieser Routine mit Gesamtgewicht
  - Bearbeiten und Löschen

**Gesamtgewicht** = Summe aus *Gewicht × Wiederholungen* aller Sätze eines Workouts. Sätze mit Gewicht ohne Wiederholungen (z. B. statisches Halten) zählen einfach mit ihrem Gewicht.

### PR-System (persönliche Rekorde)

WayToObsidian führt für jede Übung **getrennt pro Arm-Einstellung** drei Rekorde:

| Rekord | Bedeutung |
|---|---|
| Gewicht | schwerster Satz in kg |
| Wiederholungen | meiste Wiederholungen in einem Satz |
| Haltezeit | längste Haltezeit in Sekunden |

Jeder Wert ist ein eigener Rekord. „45 kg · 8 Wdh.“ bedeutet also: 45 kg als schwerstes Gewicht und 8 als höchste Wiederholungszahl, nicht zwingend im selben Satz.

- Wenn du beim Speichern einen Rekord brichst, erscheint **„Neuer PR“**.
- In der **Historie** sind Workouts mit PR mit einem goldenen **PR**-Badge markiert, die betroffene Übung zeigt den neuen Wert.
- Das erste Training einer Übung setzt nur den Startwert und zählt noch nicht als PR.
- PRs werden immer aus den gespeicherten Workouts berechnet. Löschst du ein Workout, passen sie sich automatisch an.

PRs findest du im laufenden Workout, unter **Stats** und in der **Übungsbibliothek**.

### Daten & Backup

Über das Daten-Symbol oben rechts in der Kopfzeile:

- **Daten exportieren**: speichert alle Workouts, Routinen (inklusive Symbole und Bilder) und Übungen in einer Datei `waytoobsidian-backup-JJJJ-MM-TT.json`. Auf dem iPhone öffnet sich das Teilen-Menü, z. B. „In Dateien sichern“ oder iCloud Drive. Am Computer wird die Datei heruntergeladen.
- **Daten importieren**: Backup-Datei auswählen (auch ältere Backups aus der Zeit als „IronArm“). WayToObsidian prüft die Datei und zeigt, wie viele Workouts, Routinen und Übungen sie enthält. Danach wählst du:
  - **Zusammenführen**: ergänzt nur, was auf dem Gerät fehlt. Vorhandene Daten bleiben unverändert.
  - **Alles ersetzen**: ersetzt alle Daten auf dem Gerät durch das Backup, nach einer Sicherheitsabfrage.
- Angezeigt wird außerdem das Datum des letzten Exports.

Damit kannst du Daten sichern, auf ein neues Gerät umziehen oder bei einem Wechsel des Hostings bzw. Servers mitnehmen. Die Daten liegen weiterhin nur lokal. Ohne Export gibt es kein Backup.

### Trainingshistorie

- Alle Workouts mit allen Übungen, neuestes Datum zuerst
- Pro Workout: Datum, Anzahl der Übungen und Gesamtgewicht
- Pro Übung: Arm (falls einseitig), alle Sätze und ggf. der neue PR
- Ein Tipp öffnet die Details. Dort lässt sich das Workout auch löschen (mit Sicherheitsabfrage).

### Fortschritt (Stats)

- Kraftverlauf pro Übung als Diagramm (schwerster Satz je Training)
- Arm-Umschalter (Alle, Rechts, Links) nur bei Rechts/Links-Übungen
- Bei Halte-Übungen ohne Gewicht zeigt das Diagramm die Haltezeit
- PR-Gewicht und letztes Gewicht
- Liste aller persönlichen Rekorde

### Übungseinstellungen

Jede Übung hat zwei Einstellungen. Du legst sie beim Erstellen fest und änderst sie jederzeit in der Übungsbibliothek (Übung antippen):

| Einstellung | Optionen | Standard |
|---|---|---|
| Zähleinheit | *Wiederholungen* (kg + Wdh.) oder *Sekunden halten* (kg + Sek.) | Wiederholungen (Planks: Sekunden) |
| Seiten | *Beidseitig* oder *Rechts / Links* | Armwrestling-Kategorien: Rechts / Links, alle anderen: Beidseitig |

Bei beidseitigen Übungen werden PRs ohne Arm-Unterscheidung geführt, bei Rechts/Links-Übungen getrennt pro Arm.

### Übungsbibliothek

- Über 100 vordefinierte Übungen, darunter viele **Kabelzug-Varianten** (Suche nach „Kabel“):

| Kategorie | Beispiele |
|---|---|
| Armwrestling | Pronation, Supination, Cupping, Rising, Back/Side Pressure – jeweils auch am Kabel; Wrist Curls, Reverse Wrist Curls, Finger Curls, Pinch Grip, Wrist Roller, Dead Hang |
| Brust | Bankdrücken (flach, schräg, negativ), Kurzhantel-Varianten, Brustpresse, Butterfly, Kurzhantel-Fliegende, Cable Flys, Kabel-Crossover, Kabel-Fliegende von oben/unten, Dips, Liegestütze |
| Rücken | Kreuzheben, Klimmzüge, Latzug (breit/eng), Rudern (Langhantel, Kurzhantel, T-Bar, Maschine, Kabel), Kabel-Pullover, **Hyperextensions**, Shrugs |
| Schultern | Schulterdrücken, Arnold Press, Schulterpresse, Seitheben (auch am Kabel), Frontheben, Reverse Flys (auch am Kabel), Face Pulls, Aufrechtes Rudern |
| Bizeps | Langhantel-, SZ-, Kurzhantel-, Hammer-, Schrägbank-, Scott-, Konzentrations-, Spider- und Reverse Curls, Kabel-Curls, Kabel-Hammer Curls, Bayesian Curls, Bizepsmaschine |
| Trizeps | Trizepsdrücken am Kabel (Seil/Stange), Overhead-Trizepsdrücken (Kabel/Kurzhantel), French Press, Skull Crusher, Kickbacks (auch am Kabel), Enges Bankdrücken, Dips |
| Beine | Kniebeugen, Frontkniebeugen, Beinpresse, Hackenschmidt, Ausfallschritte, Bulgarian Split Squats, Rumänisches Kreuzheben, Hip Thrusts, Beinstrecker/-beuger, Ab-/Adduktoren, Kabel-Glute-Kickbacks, Wadenheben |
| Bauch | Crunches, Kabel-Crunches, Beinheben hängend, Russian Twists, Ab-Roller, Planks, Seitstütz |

- **Neue Standard-Übungen werden bei Updates automatisch ergänzt.** Eigene Übungen und geänderte Einstellungen bleiben dabei erhalten. Übungen aus der früheren Sammelkategorie „Arme“ werden dabei auf „Bizeps“ und „Trizeps“ verteilt.
- Nach Kategorien gruppiert und mit **Suchfeld**
- **Übung antippen** öffnet ihre Einstellungen (Kategorie, Zähleinheit, Seiten), den Weg zur Statistik und das Löschen. Workouts und Routinen bleiben beim Löschen erhalten.
- Eigene Übungen über den runden **+**-Button anlegen
- PR pro Übung direkt in der Liste, bei einseitigen Übungen getrennt nach rechts (R) und links (L)

---

## 4. Technologie

| Technik | Zweck |
|---|---|
| HTML5 | Struktur der Anwendung |
| CSS3 | Gestaltung, responsives Layout, Safe-Area-Unterstützung für iPhones mit Notch |
| JavaScript | Logik und Interaktion (ohne Frameworks) |
| LocalStorage | Lokale Speicherung der Trainingsdaten |
| Service Worker | Offline-Betrieb und automatische Updates |
| Web App Manifest | Installation auf dem Home-Bildschirm |

Es werden **keine externen Bibliotheken** benötigt.

### Gespeicherte Daten (LocalStorage)

| Schlüssel | Inhalt |
|---|---|
| `it_sessions` | gespeicherte Workouts mit allen Übungen und Sätzen |
| `it_routines` | Routinen |
| `it_exercises` | Übungsbibliothek |
| `it_active` | das gerade laufende Workout (Zwischenspeicher) |
| `it_workouts` | Daten aus Version 1.0/1.1 (nur noch als Backup) |
| `it_defaults_version` | Version der Standard-Übungsliste |
| `it_last_export` | Datum des letzten Exports |

Beim ersten Start ab Version 1.2 werden die alten Einträge aus `it_workouts` automatisch übernommen und pro Trainingstag zu einem Workout „Training“ zusammengefasst. Die alten Daten bleiben unverändert als Backup erhalten.

### Farbkonzept

Die App soll angenehm für die Augen sein, schön aussehen und nicht überreizen: dunkle Flächen mit leichtem Aubergine-Ton, ein sanftes Flieder als einziger Akzent und weiche Signalfarben.

| Rolle | Farbe | Einsatz |
|---|---|---|
| Hintergrund | `#121018` | Karten in `#1A1722`, Eingabefelder `#231F2D` |
| Akzent | `#B9A5E6` (Flieder) | Buttons (mit dunkler Schrift), aktive Tabs, Diagramme |
| Bestleistung | `#E6C88F` (weiches Gold) | PRs und Rekorde |
| Warnung | `#E2878F` (gedämpftes Rosé) | Löschen und Verwerfen |
| Text | `#ECE8F4` | gedämpft `#9A93A8` |

Routinen-Symbole gibt es in Flieder, Rosé, Blau, Salbei, Gold und Grau.

Alle Farben sind als CSS-Variablen am Anfang von `index.html` definiert (`--accent`, `--gold`, `--danger` …). Das App-Symbol (`icon.svg` und die PNGs) nutzt dieselben Farben und muss bei Farbänderungen mit angepasst werden. Die App verwendet bewusst keine Emojis, sondern schlichte Icons.

### Optimierungen für das iPhone

- Kein automatisches Hineinzoomen beim Antippen von Eingabefeldern
- Passende Zifferntastatur für Gewicht (mit Komma), Wiederholungen und Sekunden
- Scharfe Diagramme auf Retina-Displays
- Abstand zu Notch und Home-Leiste
- PNG-Symbol (`apple-touch-icon.png`) für den Home-Bildschirm, da iOS keine SVG-Symbole nutzt
- Es wird nur die gerade sichtbare Seite neu aufgebaut

---

## 5. Projektstruktur

```text
waytoobsidian/
├── index.html            Hauptanwendung (HTML, CSS und JavaScript)
├── manifest.json         PWA-Konfiguration
├── sw.js                 Service Worker (Offline-Caching & Updates)
├── icon.svg              App-Symbol (Vektor)
├── apple-touch-icon.png  App-Symbol für den iPhone-Home-Bildschirm (180×180)
├── icon-192.png          App-Symbol für das Manifest (192×192)
├── icon-512.png          App-Symbol für das Manifest (512×512)
├── favicon.ico           Browser-Symbol (32×32, für alle Browser)
├── favicon-32.png        Browser-Symbol als PNG
├── robots.txt            Suchmaschinen aussperren
├── _headers              Netlify-Header (noindex für alle Dateien)
└── readme.md             Projektdokumentation
```

---

## 6. Installation

### Hosting über Netlify

1. Alle Projektdateien in einem gemeinsamen Ordner speichern.
2. <https://app.netlify.com/drop> öffnen.
3. Den Projektordner hochladen.
4. Die erzeugte Website-Adresse auf dem iPhone in **Safari** öffnen.
5. **Teilen** → **Zum Home-Bildschirm** auswählen.

Danach startest du WayToObsidian über das eigene App-Symbol.

> **Wichtig:** Die Seite muss **öffentlich erreichbar** sein (Netlify → *Site configuration* → *Access & security* → *Visitor access / Site protection* → öffentlich). Ist ein Passwort- oder Team-Schutz aktiv, laden Browser und iPhone die Icons und das Manifest ohne Login und bekommen nur die Login-Seite. Dann erscheint statt des Symbols nur der Buchstabe „I“, und auch Offline-Betrieb und Installation funktionieren nicht zuverlässig.

### Updates veröffentlichen

1. Bei Änderungen an den App-Dateien die Versionsnummer in `sw.js` erhöhen (aktuell `waytoobsidian-v15`).
2. Den Ordner erneut bei Netlify hochladen.
3. Die App lädt die neue Version automatisch beim nächsten Start mit Internetverbindung.

Bei einem geänderten App-Symbol alle PNG-Größen (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) neu aus `icon.svg` erzeugen. Im Manifest stehen bewusst nur PNG-Icons, weil iOS keine SVG-Icons für den Home-Bildschirm verwendet. Das Home-Bildschirm-Icon und das Favicon sind zusätzlich als Base64-Daten direkt in `index.html` eingebettet (funktioniert auch bei zugriffsgeschützten Seiten) und müssen bei Icon-Änderungen dort ebenfalls neu eingesetzt werden. Sonst zeigt das iPhone nur den Anfangsbuchstaben „I“.

Ein geändertes App-Symbol übernimmt iOS erst, wenn du die App vom Home-Bildschirm entfernst und neu hinzufügst. Deine Trainingsdaten bleiben dabei erhalten.

---

## 7. Offline-Funktionalität

Der Service Worker speichert alle App-Dateien zwischen. Offline funktioniert:

- App starten
- Workouts aufzeichnen und Routinen starten
- Routinen und Übungen anlegen
- Historie, Fortschritt und PRs ansehen
- Daten lokal speichern

Ist eine Internetverbindung vorhanden, lädt WayToObsidian automatisch die neueste Version. Ohne Verbindung startet die zwischengespeicherte Version.

Die erste Einrichtung braucht eine Internetverbindung.

> **Wichtig:** Die Trainingsdaten liegen im LocalStorage von Safari. Wenn du die Website-Daten in Safari löschst, werden auch deine Trainingsdaten entfernt. WayToObsidian bittet den Browser zwar, die Daten dauerhaft aufzubewahren, eine Cloud-Synchronisierung gibt es aber nicht.

---

## 8. Datenschutz

- **Nicht in Suchmaschinen:** `noindex` im Seitenkopf, `robots.txt` und ein `X-Robots-Tag`-Header (`_headers`) verhindern, dass Google & Co. die Seite aufnehmen. Nur wer den Link kennt, findet die App.

- Kein Benutzerkonto nötig
- Keine Übertragung von Trainingsdaten an einen Server
- Netlify stellt nur die App-Dateien bereit

---

## 9. Geplante Erweiterungen

- Automatische Datensicherung / Cloud-Synchronisierung
- Körpergewicht dokumentieren
- Rest-Timer zwischen den Sätzen
- Trainingsnotizen
- Kategorien und Filter für Übungen
- Geschätztes 1RM (One-Rep-Max) als zusätzlicher PR

---

## 10. Projektziel

WayToObsidian soll langfristig ein persönliches und übersichtliches Trainingssystem für Armwrestling und klassisches Krafttraining werden.

Im Fokus stehen einfache Bedienung, zuverlässige Datenspeicherung und nachvollziehbare Kraftentwicklung.

**WAYTOOBSIDIAN – TRACK YOUR STRENGTH.**
