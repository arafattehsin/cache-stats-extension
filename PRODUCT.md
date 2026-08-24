# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Power users optimizing AI spend during active GitHub Copilot sessions.

## Product Purpose

Cache Stats helps users decide whether to act now to preserve the prompt cache. Success means the user can understand the remaining reuse window and the cost consequence of missing it without first interpreting raw token or AIU telemetry.

## Positioning

The extension combines a live cache-expiry signal with billing-aware, per-turn usage data. It distinguishes tokens actually reused from tokens merely written to cache and translates cache loss into avoidable AIU cost.

## Operating Context

The dashboard runs beside an active Copilot conversation and refreshes continuously. Users consult it during long, expensive sessions where an expired prompt cache can force a large prefix rebuild.

## Capabilities and Constraints

- The live expiry window and cost of missing it are the primary product truth.
- The dashboard supports last-turn and session views.
- It reports cache reuse, cache writes, fresh input, model calls, timing, output, cost avoided, cache rebuilds, and turn history.
- It reads the local Copilot session store and cache checkpoint state.
- It does not write to the session store or send dashboard data through a model.
- Existing billing and cache calculations must remain accurate.

## Evidence on Hand

- Real session usage and cache data are available from the local session store.
- The AIU calculations reproduce recorded billing values.
- No customer claims, benchmarks, or external proof assets are available and none should be fabricated.

## Product Principles

- Lead with the decision, not the telemetry.
- Make expiry and financial consequence legible at a glance.
- Preserve forensic depth without forcing it into the first reading layer.
- Explain unusual cache economics honestly, especially cold-turn investment.
- Stay local, lightweight, and continuously current.

## Accessibility & Inclusion

Status and meaning must not rely on color alone. The dashboard should support keyboard interaction, reduced motion, narrow side-panel widths, and both light and dark host themes.
