# WayToObsidian – Armwrestling & Strength Training

| | |
|---|---|
| **Version** | 1.9 |
| **Platform** | iPhone / iOS (also runs in any modern browser) |
| **Technology** | Progressive Web App (PWA) |
| **Hosting** | Netlify (free tier) |
| **App language** | German (UI labels in this document are translated) |
| **Design** | Calm dark mode in soft purple, lilac as accent, soft gold for personal bests |

---

## 1. Project Description

WayToObsidian is a personal fitness and training app for the iPhone.

The focus is on **armwrestling training**. In addition, there is a library for classic strength training.

With WayToObsidian you log complete workouts, create routines, track your strength progress and record your personal records (PRs).

The app is built as an **offline-first PWA**: all training data stays locally on your device.

---

## 2. Usage at a Glance

| Tab | Purpose |
|---|---|
| **Home** | Start a workout, routines, recent workouts |
| **Training** | Current workout, start a routine, create a new routine |
| **History** | All workouts with all exercises |
| **Stats** | Strength progress per exercise and all records |
| **Exercises** | Exercise library with search |

How the app is structured:

- **One tap, one target**: Routines, workouts and exercises can be tapped directly and open their details.
- **Bottom sheets instead of popups**: Exercise picker, workout details and confirmation prompts slide in from the bottom. Tap the dimmed area to close them.
- **"Workout in progress" bar**: While a workout is running, a bar with its name and elapsed time stays visible above the navigation. Tapping it takes you back to the workout.
- **Back buttons** on all subpages (routine details, routine editor).
- **Noticeable feedback**: On a computer, buttons, cards and list items lift slightly or highlight on hover. Arrows move along, and delete buttons change color. On the iPhone, tapping gives a short press feedback. With the keyboard, a blue outline shows which element is focused.
- **Data icon** in the top right: export and import your data (see "Data & Backup").
- **Notifications** as short toasts at the bottom, e.g. "Workout saved" or "New PR".

---

## 3. Main Features

### Home Screen

- **Greeting** with a large **Start workout** button. If a workout is already running, it says **Resume workout** instead.
- **Key figures**: total workouts, workouts in the last 7 days and number of PRs set.
- **Routines** with their exercises and a round play button to start them directly. Tapping a routine opens its detail view with the progress chart.
- **History**: your most recent workouts, very compact with name, date ("Today", "Yesterday", "Thu, Nov 5") and the exercises below. Three exercises are shown, the rest is abbreviated with "…", e.g. *Pronation, Cupping, Rising, …* Tapping opens all workout details.

### Training: Logging Workouts

A workout is a training session with any number of exercises.

1. **Start a workout**: start empty or pick a routine. For an empty workout, the exercise picker opens immediately.
2. **Add exercises**: at any time via "+ Add exercise". The picker is sorted by category and searchable. If an exercise doesn't exist yet, you can create it directly from the search.
3. **Enter sets**: per set **kg + reps** or **kg + seconds**, depending on the exercise's counting unit. Empty sets are ignored.
   - **Never done before:** the exercise starts with **one set**.
   - **Done before:** as many sets as last time. The previous kg and rep/second values appear as grey hints in the fields.
4. **Save the workout** using the button at the bottom. To discard it, tap the red trash can at the top of the workout.

WayToObsidian automatically sets the date to the day you start the workout.

The **elapsed time** is shown at the top of the workout. It is stored as the training duration when saving.

For each exercise in the workout you see:

- your **last session** of this exercise with all sets
- your **PRs** for this exercise
- the values from last time as **grey placeholders** in the input fields
- **"Apply values"**: fills in the sets from last time directly

**Arm selection:** Only exercises set to *Right / Left* show a toggle for the right and left arm. WayToObsidian remembers the arm trained last. Bilateral exercises such as bench press or squats have no arm selection.

The running workout is saved automatically in the background, so it isn't lost if you close the app or lock the iPhone.

### Routines

A routine is a saved list of exercises, e.g. "Arm Day A": Pronation, Cupping, Rising, Back Pressure.

- **Create**: in the *Training* tab via "+ Create new routine" or on the home screen via "+ New". The routine editor opens as its own page.
- **Reorder** exercises with the up and down arrows
- **Start**: on the home screen or in the Training tab. All exercises are then already in the workout, including set count, arm and values from last time.
- **Icon**: Each routine gets an icon with a color or a custom image/logo. There are 13 simple icons to choose from (arm, dumbbell, barbell, kettlebell, grip, lightning, flame, target, trophy, heart, timer, mountain, star) and 6 muted colors. Custom images are automatically cropped to a square and scaled down to 128 × 128 px (a few KB) so storage doesn't fill up.
- **Detail view** (tap a routine):
  - **Chart of total volume** per session over days and months. The time axis is to scale, so longer breaks show up as larger gaps.
  - Best value and last value
  - List of all sessions of this routine with total volume
  - Edit and delete

**Total volume** = sum of *weight × reps* across all sets of a workout. Sets with weight but no reps (e.g. static holds) simply count with their weight.

### PR System (Personal Records)

For every exercise, WayToObsidian keeps three records **separately per arm setting**:

| Record | Meaning |
|---|---|
| Weight | heaviest set in kg |
| Reps | most reps in a single set |
| Hold time | longest hold time in seconds |

Each value is its own record. "45 kg · 8 reps" therefore means: 45 kg as the heaviest weight and 8 as the highest rep count, not necessarily in the same set.

- If you break a record when saving, **"New PR"** appears.
- In the **History**, workouts with a PR are marked with a gold **PR** badge, and the affected exercise shows the new value.
- The first session of an exercise only sets the baseline and does not count as a PR yet.
- PRs are always calculated from the saved workouts. If you delete a workout, they adjust automatically.

You can find PRs in the running workout, under **Stats** and in the **Exercise library**.

### Data & Backup

Via the data icon in the top right of the header:

**Automatic online backup**

- After every change (saved workout, edited routine, new exercise …), WayToObsidian uploads a backup in the background to your own Netlify site (`/api/backup`, stored in Netlify Blobs).
- The app keeps working fully offline. Changes made without internet are uploaded as soon as a connection is available (also when opening or leaving the app).
- Each device gets a random **backup code** (20 characters, e.g. `ABCDE-FGH23-JKLMN-PQRS4`), shown in the data sheet with a "Copy code" button. **Write it down**, e.g. in a password manager. Without the code, the backup cannot be found.
- **Restore with backup code**: enter the code, then choose *Merge* or *Replace all* (same as importing a file). The device then continues backing up to that code. This works after clearing website data and on a new iPhone.
- The server only stores a SHA-256 hash of the code, never the code itself. Besides the latest state, one copy per day is kept as a safety net (not yet restorable from the app).
- The status line shows when the last online backup succeeded, or whether it is currently unreachable.

**Backup as a file**

- **Export as file**: saves all workouts, routines (including icons and images) and exercises to a file `waytoobsidian-backup-YYYY-MM-DD.json`. On the iPhone, the share sheet opens, e.g. "Save to Files" or iCloud Drive. On a computer, the file is downloaded.
- **Import file**: choose a backup file (including older backups from the "IronArm" days). WayToObsidian checks the file and shows how many workouts, routines and exercises it contains. Then you choose:
  - **Merge**: only adds what is missing on the device. Existing data stays unchanged.
  - **Replace all**: replaces all data on the device with the backup, after a confirmation prompt.
- The date of the last export is also shown.

The file export is still useful as an extra copy that is completely independent of Netlify, e.g. when switching hosting.

### Training History

- All workouts with all exercises, newest first
- Per workout: date, number of exercises and total volume
- Per exercise: arm (if unilateral), all sets and the new PR if any
- Tapping opens the details. The workout can also be deleted there (with a confirmation prompt).

### Progress (Stats)

- Strength progress per exercise as a chart (heaviest set per session)
- Arm toggle (All, Right, Left) only for right/left exercises
- For hold exercises without weight, the chart shows the hold time
- PR weight and last weight
- List of all personal records

### Exercise Settings

Each exercise has two settings. You set them when creating the exercise and can change them at any time in the exercise library (tap the exercise):

| Setting | Options | Default |
|---|---|---|
| Counting unit | *Reps* (kg + reps) or *Hold seconds* (kg + sec) | Reps (planks: seconds) |
| Sides | *Bilateral* or *Right / Left* | Armwrestling categories: Right / Left, all others: Bilateral |

For bilateral exercises, PRs are tracked without arm distinction; for right/left exercises, separately per arm.

### Exercise Library

- Over 100 predefined exercises, including many **cable variations** (search for "Kabel", German for cable):

| Category | Examples |
|---|---|
| Armwrestling | Pronation, Supination, Cupping, Rising, Back/Side Pressure – each also on the cable; Wrist Curls, Reverse Wrist Curls, Finger Curls, Pinch Grip, Wrist Roller, Dead Hang |
| Chest | Bench press (flat, incline, decline), dumbbell variations, chest press, pec deck, dumbbell flys, cable flys, cable crossover, high/low cable flys, dips, push-ups |
| Back | Deadlift, pull-ups, lat pulldown (wide/close), rows (barbell, dumbbell, T-bar, machine, cable), cable pullover, **hyperextensions**, shrugs |
| Shoulders | Overhead press, Arnold press, shoulder press machine, lateral raises (also on the cable), front raises, reverse flys (also on the cable), face pulls, upright rows |
| Biceps | Barbell, EZ-bar, dumbbell, hammer, incline, preacher, concentration, spider and reverse curls, cable curls, cable hammer curls, Bayesian curls, biceps machine |
| Triceps | Cable triceps pushdown (rope/bar), overhead triceps extension (cable/dumbbell), French press, skull crushers, kickbacks (also on the cable), close-grip bench press, dips |
| Legs | Squats, front squats, leg press, hack squat, lunges, Bulgarian split squats, Romanian deadlift, hip thrusts, leg extension/curl, abductors/adductors, cable glute kickbacks, calf raises |
| Abs | Crunches, cable crunches, hanging leg raises, Russian twists, ab roller, planks, side planks |

- **New default exercises are added automatically on updates.** Your own exercises and changed settings are preserved. Exercises from the former combined category "Arms" are split into "Biceps" and "Triceps".
- Grouped by category and with a **search field**
- **Tapping an exercise** opens its settings (category, counting unit, sides), a link to its stats and the delete option. Workouts and routines are kept when an exercise is deleted.
- Create your own exercises via the round **+** button
- PR per exercise directly in the list, for unilateral exercises separated into right (R) and left (L)

---

## 4. Technology

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling, responsive layout, safe-area support for iPhones with a notch |
| JavaScript | Logic and interaction (no frameworks) |
| LocalStorage | Local storage of training data |
| Service Worker | Offline operation and automatic updates |
| Netlify Functions + Blobs | Automatic online backup (`/api/backup`) |
| Web App Manifest | Installation on the home screen |

**No external libraries** are required in the app. The backup function only uses `@netlify/blobs`, which Netlify installs automatically from `package.json`.

### Stored Data (LocalStorage)

| Key | Content |
|---|---|
| `it_sessions` | saved workouts with all exercises and sets |
| `it_routines` | routines |
| `it_exercises` | exercise library |
| `it_active` | the currently running workout (temporary storage) |
| `it_workouts` | data from version 1.0/1.1 (kept only as a backup) |
| `it_defaults_version` | version of the default exercise list |
| `it_last_export` | date of the last file export |
| `it_backup_code` | backup code of this device |
| `it_last_backup` | time of the last successful online backup |
| `it_backup_pending` | set while changes still need to be uploaded |

On the first launch of version 1.2 or later, the old entries from `it_workouts` are migrated automatically and grouped per training day into a workout named "Training". The old data is kept unchanged as a backup.

### Color Concept

The app should be easy on the eyes, look good and not be overstimulating: dark surfaces with a slight aubergine tint, a soft lilac as the only accent, and gentle signal colors.

| Role | Color | Usage |
|---|---|---|
| Background | `#121018` | Cards in `#1A1722`, input fields `#231F2D` |
| Accent | `#B9A5E6` (lilac) | Buttons (with dark text), active tabs, charts |
| Personal best | `#E6C88F` (soft gold) | PRs and records |
| Warning | `#E2878F` (muted rose) | Delete and discard |
| Text | `#ECE8F4` | muted `#9A93A8` |

Routine icons are available in lilac, rose, blue, sage, gold and grey.

All colors are defined as CSS variables at the top of `css/app.css` (`--accent`, `--gold`, `--danger` …). The app icon (`icon.svg` and the PNGs) uses the same colors and must be updated along with any color changes. The app deliberately uses no emojis, only simple icons.

### iPhone Optimizations

- No automatic zoom when tapping input fields
- Appropriate numeric keyboard for weight (with decimal comma), reps and seconds
- Sharp charts on Retina displays
- Spacing for the notch and home indicator
- PNG icon (`apple-touch-icon.png`) for the home screen, since iOS doesn't use SVG icons
- Only the currently visible page is re-rendered

---

## 5. Project Structure

```text
waytoobsidian/
├── index.html              Page structure (HTML only), loads CSS and scripts
├── css/
│   └── app.css             All styles (colors as CSS variables at the top)
├── js/                     App logic, loaded in this order:
│   ├── exercises-data.js   Default exercise list
│   ├── storage.js          LocalStorage, loading and saving data
│   ├── helpers.js          Date formatting and small helpers
│   ├── sheet.js            Bottom sheets, confirmations, exercise picker
│   ├── stats.js            Evaluation: PRs, total volume
│   ├── navigation.js       Tabs and page switching
│   ├── home.js             Home screen and workout details
│   ├── routines.js         Routines, routine icons, routine editor
│   ├── workout.js          Running workout
│   ├── history.js          Training history
│   ├── progress.js         Stats and records
│   ├── library.js          Exercise library and exercise settings
│   ├── backup.js           File export/import and automatic online backup
│   └── app.js              Rendering and app start (must be last)
├── netlify/functions/
│   └── backup.mjs          Online backup endpoint (/api/backup)
├── netlify.toml            Netlify configuration (publish folder, functions)
├── package.json            Dependency for the backup function (@netlify/blobs)
├── manifest.json           PWA configuration
├── sw.js                   Service worker (offline caching & updates)
├── icon.svg                App icon (vector)
├── apple-touch-icon.png    App icon for the iPhone home screen (180×180)
├── icon-192.png            App icon for the manifest (192×192)
├── icon-512.png            App icon for the manifest (512×512)
├── favicon.ico             Browser icon (32×32, for all browsers)
├── favicon-32.png          Browser icon as PNG
├── robots.txt              Block search engines
├── _headers                Netlify headers (noindex for all files)
└── README.md               Project documentation
```

The scripts are plain `<script>` files (no modules, no build step) that share global functions, so the `onclick` handlers in the HTML keep working. Their order in `index.html` matters: data and helpers first, `app.js` last.

**Adding a new CSS or JS file:** include it in `index.html` **and** add it to the `FILES` list in `sw.js`, otherwise it is missing offline.

---

## 6. Installation

### Hosting on Netlify

The online backup needs a Netlify Function. **Netlify Drop (drag & drop upload) does not support functions**, so the site is deployed from the GitHub repository:

1. In Netlify: **Add new site** → **Import an existing project** → GitHub → choose the `waytoobsidian` repository.
   (For an existing site: *Site configuration* → *Build & deploy* → *Link repository*.)
2. Leave the build command empty. Publish directory and functions folder come from `netlify.toml`.
3. Deploy. Netlify installs `@netlify/blobs` automatically and publishes the function under `/api/backup`.
4. Open the website address on the iPhone in **Safari**.
5. Select **Share** → **Add to Home Screen**.

After that, you launch WayToObsidian via its own app icon.

Without the function (e.g. uploaded via Netlify Drop or opened locally), the app still works completely; only the online backup shows as unreachable.

> **Important:** The site must be **publicly accessible** (Netlify → *Site configuration* → *Access & security* → *Visitor access / Site protection* → public). If password or team protection is active, the browser and iPhone load the icons and manifest without logging in and only receive the login page. In that case only the letter "I" appears instead of the icon, and offline mode and installation won't work reliably either.

### Publishing Updates

1. When changing app files, increase the version number in `sw.js` (currently `waytoobsidian-v18`).
2. Commit and push to GitHub. Netlify deploys automatically.
3. The app loads the new version automatically on the next launch with an internet connection.

If the app icon changes, regenerate all PNG sizes (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) from `icon.svg`. The manifest deliberately lists only PNG icons, because iOS doesn't use SVG icons for the home screen. The home screen icon and the favicon are also embedded directly in the `<head>` of `index.html` as Base64 data (this works even on access-protected sites) and must be replaced there as well when the icon changes. Otherwise the iPhone only shows the initial letter "I".

iOS only picks up a changed app icon after you remove the app from the home screen and add it again. Your training data is preserved.

---

## 7. Offline Functionality

The service worker caches all app files (HTML, CSS, all scripts, icons). HTML, CSS and JS are loaded network-first, so an update always arrives complete; offline they come from the cache. The following works offline:

- Launching the app
- Logging workouts and starting routines
- Creating routines and exercises
- Viewing history, progress and PRs
- Saving data locally

When an internet connection is available, WayToObsidian automatically loads the latest version. Without a connection, the cached version starts.

The initial setup requires an internet connection.

> **Important:** Training data is stored in Safari's LocalStorage. If you clear website data in Safari, your training data on the device is removed as well. With the automatic online backup and your backup code, you can restore it. Without the code, the data is lost.

---

## 8. Privacy

- **Not in search engines:** `noindex` in the page head, `robots.txt` and an `X-Robots-Tag` header (`_headers`) prevent Google & co. from indexing the site. Only people who know the link can find the app.

- No user account required
- Training data is sent **only** to the backup function of your own Netlify site, stored under a hash of your backup code. Anyone who knows the code can read the backup, so keep it private.
- No other servers, trackers or analytics

---

## 9. Planned Features

- Sync between several devices
- Restoring older daily backup copies from the app
- Body weight tracking
- Rest timer between sets
- Training notes
- Categories and filters for exercises
- Estimated 1RM (one-rep max) as an additional PR

---

## 10. Project Goal

In the long term, WayToObsidian is meant to become a personal, clear training system for armwrestling and classic strength training.

The focus is on simple operation, reliable data storage and traceable strength development.

**WAYTOOBSIDIAN – TRACK YOUR STRENGTH.**
