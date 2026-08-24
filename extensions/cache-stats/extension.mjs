// Extension: cache-stats
// Prompt-cache and token usage stats for GitHub Copilot sessions.
//
// One surface: the `cache-stats` canvas renders a self-refreshing dashboard
// of cache reuse, token composition and AIU cost for the current session.

import { joinSession, createCanvas } from "@github/copilot-sdk/extension";
import { getStats } from "./stats.mjs";
import { openCanvasServer, closeCanvasServer } from "./canvas.mjs";
import { setCacheState } from "./cache-state.mjs";

const session = await joinSession({
    canvases: [
        createCanvas({
            id: "cache-stats",
            displayName: "Cache Stats",
            description:
                "Live dashboard of prompt-cache usage, token breakdown and AIU cost for the current Copilot session. Open when the user wants to watch cache efficiency as they work.",
            inputSchema: { type: "object", properties: {} },
            actions: [
                {
                    name: "refresh",
                    description: "Return the latest cache statistics for the current session.",
                    inputSchema: { type: "object", properties: {} },
                    handler: async () => getStats(session.sessionId),
                },
            ],
            open: async (ctx) => {
                const entry = await openCanvasServer(ctx.instanceId, () => session.sessionId);
                return { title: "Cache Stats", url: entry.url };
            },
            onClose: async (ctx) => closeCanvasServer(ctx.instanceId),
        }),
    ],
});

// The app reports its own end-of-turn usage here, including when the prompt
// cache is due to expire. That is the only forward-looking cache signal, and
// the dashboard's health card counts down against it.
session.on("session.usage_checkpoint", (event) => {
    setCacheState(event?.data?.modelCacheState);
});
