// Live cache-stats dashboard. One tiny loopback HTTP server per canvas
// instance; the page polls /api/stats so it keeps updating on its own without
// the agent having to push anything.

import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getStats } from "./stats.mjs";

const UI_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "ui.html");
const servers = new Map();

function sendJson(res, payload) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(payload));
}

export async function openCanvasServer(instanceId, getSessionId) {
    const existing = servers.get(instanceId);
    if (existing) return existing;

    const server = createServer((req, res) => {
        if (req.url && req.url.startsWith("/api/stats")) {
            try {
                sendJson(res, getStats(getSessionId()));
            } catch (err) {
                sendJson(res, { error: err?.message || String(err) });
            }
            return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        // Read per request so editing ui.html only needs a canvas refresh.
        try {
            res.end(fs.readFileSync(UI_PATH, "utf8"));
        } catch (err) {
            res.statusCode = 500;
            res.end(`<pre>cache-stats UI missing: ${err?.message || err}</pre>`);
        }
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    const entry = { server, url: `http://127.0.0.1:${port}/` };
    servers.set(instanceId, entry);
    return entry;
}

export async function closeCanvasServer(instanceId) {
    const entry = servers.get(instanceId);
    if (!entry) return;
    servers.delete(instanceId);
    await new Promise((resolve) => entry.server.close(() => resolve()));
}
