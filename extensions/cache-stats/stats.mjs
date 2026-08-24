// Reads prompt-cache / token usage out of the Copilot CLI local session store.
//
// Schema notes (assistant_usage_events):
//   input_tokens      = the FULL prompt for that model call
//                       (= fresh + cache_read_tokens + cache_write_tokens)
//   cache_read_tokens = prefix reused from the prompt cache (billed ~10x cheaper)
//   cache_write_tokens= prefix newly written into the cache (billed ~1.25x input)
//   total_nano_aiu    = actual billed cost in nano-AIU, raw rates, no request multiplier
//   token_details_json= per-token-type billing rates for that exact call, which is
//                       what lets us compute "what would this have cost uncached".
//   initiator         = 'user' on the first model call of a turn, 'agent' afterwards.

import { DatabaseSync } from "node:sqlite";
import { homedir } from "node:os";
import path from "node:path";
import fs from "node:fs";
import { getCacheState } from "./cache-state.mjs";

const NANO_PER_AIU = 1_000_000_000;

export function resolveDbPath() {
    if (process.env.COPILOT_CACHE_STATS_DB) {
        return process.env.COPILOT_CACHE_STATS_DB;
    }
    const home = process.env.COPILOT_HOME || path.join(homedir(), ".copilot");
    return path.join(home, "session-store.db");
}

const ROW_QUERY = `
SELECT id, session_id, turn_index, agent_id, parent_tool_call_id, model,
       input_tokens, output_tokens, cache_read_tokens, cache_write_tokens,
       reasoning_tokens, total_nano_aiu, request_multiplier, duration_ms,
       time_to_first_token_ms, initiator, reasoning_effort, finish_reason,
       token_details_json, created_at
FROM assistant_usage_events
WHERE session_id = ?
ORDER BY id
`;

function readRows(sessionId) {
    const dbPath = resolveDbPath();
    if (!fs.existsSync(dbPath)) {
        throw new Error(`Copilot session store not found at ${dbPath}`);
    }
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
        return db.prepare(ROW_QUERY).all(sessionId);
    } finally {
        db.close();
    }
}

// Pull per-token-type billing rates out of the row so cost math follows whatever
// model actually served the call instead of hard-coded pricing.
function ratesFor(row) {
    const rates = {};
    if (!row.token_details_json) return rates;
    try {
        for (const d of JSON.parse(row.token_details_json)) {
            if (d && d.tokenType && d.batchSize > 0) {
                rates[d.tokenType] = d.costPerBatch / d.batchSize;
            }
        }
    } catch {
        /* malformed details are non-fatal; cost comparison degrades to 0 */
    }
    return rates;
}

// The columns and token_details_json usually agree, but on `compaction` rows the
// cache_write_tokens column is left at 0 while the details carry the real figure.
// The details are what billing used, so they win wherever they exist.
function splitTokens(row) {
    const prompt = Number(row.input_tokens) || 0;
    let cacheRead = Number(row.cache_read_tokens) || 0;
    let cacheWrite = Number(row.cache_write_tokens) || 0;
    let output = Number(row.output_tokens) || 0;

    try {
        for (const d of JSON.parse(row.token_details_json || "[]")) {
            const n = Number(d?.tokenCount);
            if (!Number.isFinite(n)) continue;
            if (d.tokenType === "cache_read") cacheRead = n;
            else if (d.tokenType === "cache_write") cacheWrite = n;
            else if (d.tokenType === "output") output = n;
        }
    } catch {
        /* fall back to the columns */
    }

    return { prompt, cacheRead, cacheWrite, output, fresh: Math.max(0, prompt - cacheRead - cacheWrite) };
}
function emptyTotals() {
    return {
        calls: 0,
        subAgentCalls: 0,
        compactions: 0,
        promptTokens: 0,
        freshInput: 0,
        cacheRead: 0,
        cacheWrite: 0,
        output: 0,
        reasoning: 0,
        actualNano: 0,
        baselineNano: 0,
        durationMs: 0,
        ttftMs: 0,
        ttftSamples: 0,
        models: new Set(),
        effort: null,
        finishReason: null,
        startedAt: null,
        endedAt: null,
    };
}

function addRow(t, row) {
    const { prompt, cacheRead, cacheWrite, output, fresh } = splitTokens(row);
    const rates = ratesFor(row);
    const inputRate = rates.input ?? 0;
    const outputRate = rates.output ?? 0;

    t.calls += 1;
    if (row.agent_id || row.parent_tool_call_id || row.initiator === "sub-agent") t.subAgentCalls += 1;
    if (row.initiator === "compaction") t.compactions += 1;
    t.promptTokens += prompt;
    t.freshInput += fresh;
    t.cacheRead += cacheRead;
    t.cacheWrite += cacheWrite;
    t.output += output;
    t.reasoning += Number(row.reasoning_tokens) || 0;
    t.actualNano += Number(row.total_nano_aiu) || 0;
    // Counterfactual: every prompt token billed at the plain input rate.
    t.baselineNano += prompt * inputRate + output * outputRate;
    t.durationMs += Number(row.duration_ms) || 0;
    if (row.time_to_first_token_ms) {
        t.ttftMs += Number(row.time_to_first_token_ms);
        t.ttftSamples += 1;
    }
    if (row.model) t.models.add(row.model);
    if (row.reasoning_effort) t.effort = row.reasoning_effort;
    if (row.finish_reason) t.finishReason = row.finish_reason;
    if (!t.startedAt) t.startedAt = row.created_at;
    t.endedAt = row.created_at;
}

function finalize(t, index, entry) {
    const savedNano = Math.max(0, t.baselineNano - t.actualNano);

    // The turn-entry call is the one that reveals whether the prompt cache
    // survived since the last turn. If it reused nothing but wrote the whole
    // prefix, the cache had gone and was rebuilt from scratch.
    const entryRates = entry ? ratesFor(entry) : {};
    const readRate = entryRates.cache_read ?? 0;
    const writeRate = entryRates.cache_write ?? 0;
    const entryTokens = entry ? splitTokens(entry) : null;
    const entryCacheRead = entryTokens ? entryTokens.cacheRead : 0;
    const entryCacheWrite = entryTokens ? entryTokens.cacheWrite : 0;
    const reusableEntryTokens = entryCacheRead + entryCacheWrite;
    const rebuilt = index > 1 && entryCacheRead === 0 && entryCacheWrite > 0;
    // What the break actually cost: re-writing the prefix instead of reading it.
    const wastedNano = rebuilt ? entryCacheWrite * Math.max(0, writeRate - readRate) : 0;
    // Forward-looking exposure: if the reusable entry prefix expires, the next
    // turn pays the write-vs-read rate difference to establish it again.
    const rebuildExposureNano = reusableEntryTokens * Math.max(0, writeRate - readRate);

    return {
        index,
        calls: t.calls,
        subAgentCalls: t.subAgentCalls,
        compactions: t.compactions,
        promptTokens: t.promptTokens,
        freshInput: t.freshInput,
        cacheRead: t.cacheRead,
        cacheWrite: t.cacheWrite,
        output: t.output,
        reasoning: t.reasoning,
        hitRate: t.promptTokens > 0 ? t.cacheRead / t.promptTokens : 0,
        aiu: t.actualNano / NANO_PER_AIU,
        baselineAiu: t.baselineNano / NANO_PER_AIU,
        savedAiu: savedNano / NANO_PER_AIU,
        savedPct: t.baselineNano > 0 ? savedNano / t.baselineNano : 0,
        rebuilt,
        rebuiltTokens: rebuilt ? entryCacheWrite : 0,
        wastedAiu: wastedNano / NANO_PER_AIU,
        rebuildExposureAiu: rebuildExposureNano / NANO_PER_AIU,
        gapSeconds: null,
        durationMs: t.durationMs,
        avgTtftMs: t.ttftSamples > 0 ? t.ttftMs / t.ttftSamples : 0,
        models: [...t.models],
        model: [...t.models][0] || "unknown model",
        effort: t.effort,
        finishReason: t.finishReason,
        startedAt: t.startedAt,
        endedAt: t.endedAt,
    };
}

const NO_INDEX = Symbol("no-index");

// Where a turn starts.
//
// Two session shapes exist in the same store:
//   * CLI sessions populate `initiator` ('user' | 'agent' | 'sub-agent' |
//     'compaction'), and a user-initiated call is an exact turn boundary.
//   * App sessions leave `initiator` NULL, and `turn_index` is the only
//     signal — it increments once per user message.
// `initiator` is preferred where present because it agrees with `turn_index`
// almost everywhere and is exact where the two disagree.
function makeBoundaryTest(rows) {
    if (rows.some((r) => r.initiator === "user")) {
        return (row) => row.initiator === "user";
    }
    let previous = NO_INDEX;
    return (row) => {
        // A sub-agent call is never a user message, whatever index it carries.
        if (row.agent_id || row.parent_tool_call_id) return false;
        const index = row.turn_index;
        const changed = previous === NO_INDEX || index !== previous;
        previous = index;
        return changed;
    };
}

// A turn = one user message plus every follow-up model call until the next one.
export function getStats(sessionId) {
    const rows = readRows(sessionId);
    const isTurnStart = makeBoundaryTest(rows);
    const turns = [];
    const session = emptyTotals();
    let current = null;
    let entry = null;

    for (const row of rows) {
        // Evaluated for every row: the app-session test is stateful.
        const startsTurn = isTurnStart(row);
        if (current === null || startsTurn) {
            if (current) turns.push(finalize(current, turns.length + 1, entry));
            current = emptyTotals();
            entry = row;
        }
        addRow(current, row);
        addRow(session, row);
    }
    if (current) turns.push(finalize(current, turns.length + 1, entry));

    // Idle time between turns is the thing that kills the cache, so surface it.
    for (let i = 1; i < turns.length; i++) {
        const gap = (Date.parse(turns[i].startedAt) - Date.parse(turns[i - 1].endedAt)) / 1000;
        turns[i].gapSeconds = Number.isFinite(gap) ? Math.max(0, Math.round(gap)) : null;
    }

    const breaks = turns.filter((t) => t.rebuilt);
    const totals = turns.length ? finalize(session, 0, null) : null;
    if (totals) {
        totals.rebuilt = breaks.length > 0;
        totals.rebuiltTokens = breaks.reduce((n, t) => n + t.rebuiltTokens, 0);
        totals.wastedAiu = breaks.reduce((n, t) => n + t.wastedAiu, 0);
    }

    return {
        sessionId,
        dbPath: resolveDbPath(),
        generatedAt: new Date().toISOString(),
        turns,
        lastTurn: turns.length ? turns[turns.length - 1] : null,
        previousTurn: turns.length > 1 ? turns[turns.length - 2] : null,
        session: totals,
        cacheHealth: {
            breaks: breaks.length,
            wastedAiu: breaks.reduce((n, t) => n + t.wastedAiu, 0),
            rebuiltTokens: breaks.reduce((n, t) => n + t.rebuiltTokens, 0),
            ...getCacheState(),
        },
    };
}
