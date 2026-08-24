// Live cache state shared between the extension process's event listeners and
// the canvas HTTP server (same process, so a module-level store is enough).
//
// `session.usage_checkpoint` is the app's own end-of-turn usage event. Its
// modelCacheState carries `cacheExpiresAt` / `cacheTtlSeconds`, which is the
// only forward-looking signal available: it says when the prompt cache will be
// dropped, so we can warn *before* the next turn pays to rebuild it.

let cacheState = null;

export function setCacheState(models) {
    if (!Array.isArray(models) || models.length === 0) return;
    const primary = models[0] || {};
    cacheState = {
        modelId: primary.modelId ?? null,
        cacheExpiresAt: primary.cacheExpiresAt ?? null,
        cacheTtlSeconds: primary.cacheTtlSeconds ?? null,
        observedAt: new Date().toISOString(),
    };
}

export function getCacheState() {
    if (!cacheState) return { cacheExpiresAt: null, cacheTtlSeconds: null };
    const expiresIn = cacheState.cacheExpiresAt
        ? (Date.parse(cacheState.cacheExpiresAt) - Date.now()) / 1000
        : null;
    return {
        ...cacheState,
        expiresInSeconds: Number.isFinite(expiresIn) ? Math.round(expiresIn) : null,
    };
}
