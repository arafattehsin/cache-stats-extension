---
name: Cache Stats
description: A one-bit utility stack for live cache decisions and session proof.
colors:
  ink: "#111"
  paper: "#fbfbf7"
  paper-muted: "#f0f0eb"
  screen: "#d7d7d2"
  gray: "#757570"
  gray-light: "#b9b9b4"
typography:
  display:
    fontFamily: 'Chicago, Charcoal, Fixedsys, "MS Sans Serif", Tahoma, sans-serif'
    fontSize: "clamp(20px, 4vw, 28px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: 'Geneva, "MS Sans Serif", Tahoma, sans-serif'
    fontSize: "13px"
    lineHeight: 1.4
  data:
    fontFamily: '"Courier New", Courier, monospace'
    fontSize: "11px"
    fontWeight: 700
  clock:
    fontFamily: '"Courier New", Courier, monospace'
    fontSize: "clamp(54px, 13vw, 98px)"
    fontWeight: 700
    lineHeight: 0.86
    letterSpacing: "-0.08em"
rounded:
  square: "0px"
spacing:
  tight: "4px"
  compact: "8px"
  control: "12px"
  section: "22px"
components:
  button-painted:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.square}"
  button-painted-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.data}"
    rounded: "{rounded.square}"
  navigation-tab:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "7px 12px"
  navigation-tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "7px 12px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  state-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.display}"
    rounded: "{rounded.square}"
    padding: "7px 10px"
  status-stamp:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.square}"
    padding: "4px 7px"
  composition-strip:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.square}"
    height: "72px"
---

# Design System: Cache Stats

## Overview

**Creative North Star: "HyperCard Shoebox Stack"**

Cache Stats is a one-bit utility stack: black ink on white card stock, stipple grays, hard rules, painted controls, and offset layers. It borrows the directness of classic HyperCard without turning the product into nostalgia or a conventional rounded analytics dashboard.

The system stages dense operational evidence as a three-card stack. Decisive text and patterned materials carry status, while data typography and hard geometry keep live decisions, cost proof, and forensic records legible.

**Key Characteristics:**
- One-bit black-and-white hierarchy with stipple gray materials
- Square, hard-bordered controls and offset card layers
- Chicago-like display labels, Geneva-like body text, and Courier data
- Text-and-pattern status treatment with a single stepped card transition

## Colors

The palette is one-bit black and off-white, with warm utility grays used only for substrate, stipple, secondary text, and disabled states.

### Primary
- **Black Ink:** Defines text, structural rules, selected controls, charts, and decisive status bands.

### Neutral
- **White Card Stock:** Carries the foreground cards and reversed text.
- **Muted Paper:** Separates stacked layers without introducing color.
- **Desktop Gray:** Forms the stippled host surface behind the stack.
- **Utility Gray:** Supports secondary text and disabled controls.
- **Stipple Gray:** Supplies light dither marks and current-row texture.

### Named Rules

**The One-Bit Rule.** Meaning comes from black/white inversion, labels, borders, and pattern; do not introduce semantic color.

**The Pattern Means State Rule.** Status distinction must pair explicit text with solid, stippled, striped, or double-rule treatment so it never depends on tone alone.

## Typography

**Display Font:** Chicago-like system stack with Charcoal, Fixedsys, MS Sans Serif, and Tahoma fallbacks

**Body Font:** Geneva-like system stack with MS Sans Serif and Tahoma fallbacks

**Label/Mono Font:** Courier New with Courier fallback

**Character:** Heavy display labels make decisions abrupt and legible; compact body text carries explanations; monospaced numerals make clocks, tokens, costs, positions, and status records scan as instrumentation.

### Hierarchy
- **Clock:** The largest type in the system; reserved for the live expiry decision.
- **Display:** Card titles, proof totals, and section emphasis use the heavy display face.
- **Body:** Dense explanatory copy and table notes use the compact body face.
- **Data:** Navigation counts, values, timestamps, labels, and status stamps use the monospaced face with tabular numerals.

### Named Rules

**The Three-Face Rule.** Use display type for decisions, body type for explanation, and monospaced type for measured or addressable information.

## Layout

The interface centers a single stack in a 760px maximum shell. A three-column menu becomes a two-row control strip below 610px; the live decision and proof collapse from two columns to one at the same threshold. Below 430px, secondary table detail is selectively hidden while the clock, decision, primary cost evidence, and card navigation remain.

Spacing is compact and functional. Repeated 4px, 8px, 12px, and 22px intervals handle marks, cells, controls, and section separation. The foreground card keeps Composition and Turn History visibly offset behind it rather than replacing the stack with unrelated pages.

**The Stack-Presence Rule.** Even while one card owns focus, the remaining cards stay spatially present as offset layers.

## Elevation & Depth

Depth is structural rather than soft: white and black offset copies establish the shoebox stack, with one restrained ambient shadow separating it from the stippled desktop. Buttons use a 2px black offset and physically lose that offset when pressed.

### Shadow Vocabulary
- **Card Stack:** `5px 5px 0 var(--paper), 7px 7px 0 var(--ink), 12px 14px 18px rgba(0, 0, 0, .2)` combines hard registration with restrained lift.
- **Painted Control:** `2px 2px 0 var(--ink)` gives buttons a mechanical press state.
- **Menu Strip:** `3px 3px 8px rgba(0, 0, 0, .16)` separates the utility bar without competing with the card stack.

### Named Rules

**The Offset, Then Air Rule.** Establish depth with registered hard offsets first; ambient blur is secondary and reserved for the outer shell.

## Shapes

Cards, controls, plots, tables, and marks are rectangular with zero corner radius. One-pixel dividers organize dense records, two-pixel rules define primary structures, and three-pixel double outlines identify keyboard focus, current plot position, or stamped results.

**The Hard Edge Rule.** Keep controls, cards, and data regions square; distinguish them with 1px dividers, 2px structural borders, and occasional 3px double outlines.

## Components

### Buttons
- **Shape:** Square painted rectangle with a hard 2px border and 2px offset shadow.
- **Primary:** Paper fill with ink text; hover and active states invert to ink with paper text.
- **Active / Focus:** Pressing shifts the control by its offset and removes the shadow; keyboard focus uses a 3px double outline outside the border.
- **Disabled:** Utility-gray text and border, no offset shadow, and no pointer cue.

### Navigation
- The menu strip contains three direct card buttons and, where applicable, a Last/Session scope pair.
- Current cards and pressed scopes use black/white inversion; unselected hover uses stipple.
- Left and right arrow keys move through cards, and focus returns to the selected card control after rerender.

### Cards / Containers
- Foreground cards use white stock, a hard 2px border, patterned title bar, and registered stack shadow.
- Three addressable cards are canonical: Live Cache, Composition, and Turn History.
- Card changes use one 180ms, three-step translate-and-fade transition; reduced-motion preferences disable it.

### Status Marks
- Status bands use explicit labels such as CACHE LIVE, ACT NOW, and CACHE EXPIRED with solid or striped material.
- SAVED, INVESTED, and REBUILT appear as bordered or double-bordered monospaced stamps, never as color-only badges.

### Composition Strips
- Token and cost composition use hard-bordered horizontal segments filled with solid black, stipple densities, or diagonal lines.
- Every patterned graphic is paired with text, values, or an accessible label.

**The Decision-First Rule.** On operational cards, lead with the live expiry decision and cost-at-expiry proof; place composition and turn forensics deeper in the stack.

## Do's and Don'ts

### Do:
- **Do** use ink/paper inversion for active controls and decisive status bands.
- **Do** use stipple, stripes, labels, and borders together so state survives without color.
- **Do** keep the three-card stack addressable and restore focus after navigation.
- **Do** disable the stepped card transition under reduced-motion preferences.

### Don't:
- **Don't** introduce semantic colors, gradients, glass effects, rounded cards, or gauge-like chrome.
- **Don't** flatten the cards into generic KPI tiles or hide the stack behind a single-panel shell.
- **Don't** apply the Last/Session scope control to Turn History; it is always the session record.
- **Don't** promote isolated measurements or copy treatments into shared tokens.
