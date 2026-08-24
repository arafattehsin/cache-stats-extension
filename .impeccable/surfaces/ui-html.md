---
version: 1
slug: "ui-html"
primary_target: "ui.html"
related_targets: ["extension.mjs","canvas.mjs"]
---

# Cache Stats canvas

## Scope and mode

Redesign `ui.html` as an Operate surface. Preserve calculations, data, polling, and canvas behavior.

## Audience and job

Power users optimizing AI spend need to decide whether to act now to preserve the prompt cache, then inspect the evidence behind that decision.

## Task and information order

1. Read the live cache state and remaining expiry window.
2. Understand the immediate financial consequence of expiry or reuse.
3. Compare last-turn and session summaries.
4. Inspect prompt composition, cost avoidance, and individual turns.

## Chosen direction

HyperCard Shoebox Stack: one-bit black on white, stipple-dither grays, hard rectangular borders, Geneva-like body text, Chicago-like heavy labels, and painted controls. Browse and inspect are two modes of the same addressable card stack.

## Memorable moment

The foremost card opens on a huge live cache clock with a black decision band. The card visibly steps backward into Composition and Turns; the stack remains present behind it so depth and history are spatial, not decorative.

## Constraints

- Keep every current datum available.
- No rounded SaaS cards, gradients, neon, glass, gauges, decorative color, or generic KPI tiles.
- Status must not depend on color.
- Support keyboard navigation, reduced motion, and narrow side panels.
- Remain dependency-free and use semantic HTML/CSS/JavaScript.

## Implementation inventory

| Ingredient | Medium | Commitment |
| --- | --- | --- |
| Macintosh-like menu strip | Semantic HTML/CSS | Product title, live status, and Last turn/Session controls |
| Shoebox card stack | Semantic HTML/CSS | Three offset hard-edged layers; foreground card changes by navigation |
| Live cache card | Semantic HTML/CSS | Large countdown or checkpoint state, decision band, savings/cost proof |
| Composition card | Semantic HTML/CSS | One-bit dither strip, token ledger, direct model statistics |
| Turns card | Semantic HTML/CSS | Cost strip plot plus full turn rows and rebuild stamps |
| Card navigation | Buttons + History API | Previous, index, next, and direct card buttons; keyboard arrows |
| Dither textures | CSS repeating patterns | Four grayscale fills; no raster assets |
| State marks | Text and patterns | LIVE, ACT NOW, EXPIRED, REBUILT, INVESTED, SAVED |
| Motion | CSS | One card dissolve/slide when changing cards; instant under reduced motion |

## Unresolved decisions

None.
