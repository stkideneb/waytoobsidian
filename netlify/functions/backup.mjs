// Online-Backup für WayToObsidian (Netlify Function + Netlify Blobs)
//
// PUT /api/backup  – speichert ein Backup   (Header: X-Backup-Code)
// GET /api/backup  – liefert das letzte Backup (Header: X-Backup-Code)
//
// Gespeichert wird nur unter einem SHA-256-Hash des Codes; der Code selbst
// liegt nie auf dem Server. Neben dem aktuellen Stand wird pro Tag eine
// Kopie behalten, falls einmal ein fehlerhafter Stand hochgeladen wird.

import { getStore } from "@netlify/blobs";

const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{20}$/;
const MAX_CHARS = 5 * 1024 * 1024;
const BACKUP_FORMAT = "waytoobsidian-backup";

const HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow"
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...HEADERS, "Content-Type": "application/json" }
  });

async function keyFor(code) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default async (req) => {
  const code = (req.headers.get("x-backup-code") || "").toUpperCase();
  if (!CODE_PATTERN.test(code)) return json(400, { error: "Ungültiger Backup-Code." });

  const key = await keyFor(code);
  const store = getStore({ name: "backups", consistency: "strong" });

  if (req.method === "GET") {
    const text = await store.get(`${key}/latest`);
    if (text === null) return json(404, { error: "Zu diesem Code gibt es kein Backup." });
    return new Response(text, { headers: { ...HEADERS, "Content-Type": "application/json" } });
  }

  if (req.method === "PUT") {
    const text = await req.text();
    if (text.length > MAX_CHARS) return json(413, { error: "Backup ist zu groß." });

    let backup;
    try {
      backup = JSON.parse(text);
    } catch {
      return json(400, { error: "Backup ist kein gültiges JSON." });
    }
    if (backup?.format !== BACKUP_FORMAT || !backup.data) {
      return json(400, { error: "Das ist kein WayToObsidian-Backup." });
    }

    const savedAt = new Date().toISOString();
    await Promise.all([
      store.set(`${key}/latest`, text),
      store.set(`${key}/days/${savedAt.slice(0, 10)}`, text)
    ]);
    return json(200, { savedAt });
  }

  return json(405, { error: "Methode nicht erlaubt." });
};

export const config = { path: "/api/backup" };
