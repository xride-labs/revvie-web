---
name: Revvie
description: The social platform built for motorcycle riders — ride, track, connect.
colors:
  canvas: "#0d0d0f"
  surface: "#1c1c1e"
  border: "#3a3a3c"
  accent-red: "#ff1d2d"
  accent-red-deep: "#b3151f"
  accent-red-bright: "#ff4d57"
  text-primary: "#ffffff"
  text-secondary: "#aaaaaa"
  text-muted: "#8e8e93"
typography:
  display:
    fontFamily: "Josefin Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Josefin Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Josefin Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.16em"
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent-red}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "24px 40px"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "24px 40px"
---

# Design System: Revvie

## Overview

**Creative North Star: "One Red Light in a Black Garage"**

<!-- Superseded 2026-08-31. The first pass of this file described a
four-color "sticker wall" system (red/violet/green/yellow) with a bento-grid
feature layout. Both were explicitly rejected: "over saturated," "not
interesting," "remove the bento garage." This is the replacement world, built
directly from the confirmed logo asset (black square, red speedmark "R") and
its color palette (#FF1D2D / #0D0D0F / #1C1C1E / #3A3A3C / #FFFFFF). -->

Revvie's marketing site is a dark garage with exactly one light on: near-black canvas and surfaces, white type, and a single red accent doing every job color does on this site — urgency, action, "this is live," "this matters." Nothing else gets a hue. Where the first pass rotated a different accent color per feature card, this system asks every element to earn red by being the most important thing in its own view, not by category. Built for a rider glancing at a phone mid-ride: high contrast, short declarative copy, no delicate gradients.

Key Characteristics:
- Canvas and surface are near-black, not pure black — `#0d0d0f` / `#1c1c1e`, distinct enough from true `#000000` to read as intentional, not a default
- **Exactly one saturated color exists in this system: `#ff1d2d`.** Every other "accent" is white, or a step of grey (`#3a3a3c` border, `#8e8e93` muted, `#aaaaaa` secondary text)
- Red is reserved for: the primary CTA, the launch countdown, "live" status indicators, and at most one emphasis span per headline — never decorative, never one-of-several
- Hard, zero-blur offset shadows (`box-shadow: Npx Npx 0px <grey-or-red>`) still carry the sticker/decal depth language from the first pass — that part of the system held up and was kept
- Josefin Sans, uppercase, wide tracking on every label/badge/nav element — also kept from the first pass

## Colors

**Restrained** strategy: neutrals carry the page, one accent is spent deliberately. This is a hard reversal from the first pass's Committed four-color rotation — do not reintroduce a second hue anywhere in this file's scope.

### Primary
- **Signal Red** (`#ff1d2d`): the only accent. Primary CTA fill, countdown rail/nodes, "live" pulse dots, launch badges, one emphasis span per major headline, hover states on outlined buttons and icons.
- **Deep Red** (`#b3151f`): the dark end of any red gradient pairing; also the primary button's resting shadow color.

### Neutral
- **OLED-Adjacent Black** (`#0d0d0f`, `canvas`): page background.
- **Elevated Black** (`#1c1c1e`, `surface`): card and panel backgrounds, one step off canvas.
- **Steel Border** (`#3a3a3c`, `border`): all card/button borders, and the neutral shadow color anywhere a shadow isn't red.
- **Muted Grey** (`#8e8e93`): decorative icons, secondary dots, anything that used to be a second brand color (green/violet/yellow) and is now deliberately colorless.
- **Pure White** (`#ffffff`): all headline and primary text; also stands in for "the other accent" wherever the composition needs a second visual weight without spending a second hue (e.g. one mockup card's data line, one status dot beside a red one).
- **Warm Grey** (`#aaaaaa`, `text-secondary`): body copy.

### Named Rules
**The One Red Rule.** If a second saturated color would help, the answer is to spend white or grey instead, never a second hue. This is the rule the first pass of this system broke by giving each feature category (Money, Garage, Comms, Events…) its own accent; it is now the system's central discipline.

**The Legacy Token Rule.** CSS custom properties named `--color-neon-green`, `--color-brand-teal`, `--color-brand-violet`, `--color-brand-yellow`, etc. still exist in `globals.css` for back-compat with older call sites, but every one of them now resolves to a neutral grey (`#8e8e93`) or `#3a3a3c`. Never read the name as license to reintroduce that hue — the name is legacy, the value is neutral, on purpose.

## Typography

Unchanged from the first pass — this held up under the redesign.

**Display & Body Font:** Josefin Sans (`--font-josefin`), weights 300–700, no secondary display face.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 6vw, 4.5rem)`, tight leading): hero and section headlines, one word or short phrase in red.
- **Title** (700, 1.25–1.75rem, tight, uppercase): card/row titles.
- **Body** (400, 1rem, 1.6 line-height): paragraph copy.
- **Label** (600, 0.7–0.8rem, ≥0.14em tracking, uppercase): badges, nav, metric tags, button text.

### Named Rules
**The Uppercase Label Rule.** Every badge, nav item, button, and metric tag is uppercase with wide tracking. Body paragraphs are never uppercase.

## Layout

Single-column marketing page, `landing-container` capping width with generous horizontal padding. Two layout devices now coexist for list-shaped content, deliberately different from each other:

1. **The bento grid is retired.** It is not used anywhere on this site anymore — not for features, not for anything else. Do not reach for a same-size-card grid as the default "list of things" pattern here again.
2. **The spec rail** (see Components) is the replacement for feature/capability lists: a single continuous vertical line down the left edge with a red node per row, each row growing to fit its own content — no shared fixed row height, no truncation risk.
3. Two-path comparisons (the "Choose Your Ride" rider-vs-portal section) stay as a simple two-column card pair — this is a genuine binary choice, not a feature list, and a 2-up layout still reads clearly without becoming "the bento grid" the redesign rejected.

## Elevation & Depth

Unchanged: flat surfaces + hard offset shadows, not soft ambient elevation. The only change under the new palette is that a shadow is now either **red** (reserved for the primary CTA and countdown, signaling "the important thing") or **steel grey `#3a3a3c`** (everything else) — never violet, teal, or green as it was in the first pass.

### Shadow Vocabulary
- **Sticker-primary-red** (`box-shadow: 6px 6px 0px #b3151f` or `#850000`-family darks): the main CTA's resting shadow.
- **Sticker-neutral** (`box-shadow: 4px 4px 0px #3a3a3c`): every other sticker-shadowed element — secondary buttons, decorative mockup frames, outlined CTAs.

### Named Rules
**The Press-In Rule** (unchanged): every sticker-shadowed button loses its shadow and translates toward the shadow's origin on hover/press.

## Shapes

Unchanged: `rounded-3xl` (24px) cards, fully pill-shaped (`rounded-full`) buttons/badges/nav pills, 1–2px borders. Icons in the new spec rail are **not** boxed in a tinted rounded-square tile the way the retired bento cards did it — they sit bare, white/grey, turning red only on row hover. This is a deliberate change: the tinted-icon-tile was part of what made every card need its own color; removing the tile removes that need.

## Components

### Buttons
- **Shape:** fully pill-shaped, 2px border.
- **Primary:** solid `#ff1d2d` fill, white text, red-family sticker shadow, uppercase bold.
- **Secondary/outlined:** `canvas` fill, white text, `white/25` border (not a second accent color), neutral grey sticker shadow, border brightens to `white/50` on hover.
- **Mobile:** primary nav CTA shortens its label and tightens padding below `sm:` so it never compresses the logo wordmark — verify at 375–390px whenever either changes.

### Spec Rail (signature component, replaces the bento feature grid)
- A single `1px` vertical line (`bg-border`) runs the full height of the list, positioned at a fixed left offset.
- Each feature is one row: a red-ringed node sits on the rail (a 6×6 circle inside a 24×24 red-bordered ring, ring fills solid red on row hover), then a two-column layout — icon + label + title on the left (fixed width on `sm:` and up), description filling the right.
- Rows are separated by a `border-b border-border/60` hairline, last row has none. No card background, no fixed height — each row is exactly as tall as its own content, so there is no truncation risk the way the retired bento cards had.
- Below `sm:`, the left column stacks above the description instead of sitting beside it; the rail and its nodes keep their fixed left position throughout.
- Entrance: each row fades and slides in from the left (`x: -20 → 0`) on scroll-into-view, staggered in groups of 5 by a small per-index delay — deliberately not the same fade-up-from-below every other section on this page uses, so the rail reads as its own distinct rhythm.

### Cards (marketplace grid, two-path comparison, investor cards)
- **Corner style:** `rounded-3xl`.
- **Background:** `surface`, `border-2 border-border` at rest; border/shadow shift to red only for the single most important card in a set (e.g. "Series A — Open Now" among three investor cards), everything else stays neutral.
- **No per-card accent rotation.** This is the change from the first pass: a set of sibling cards no longer each gets its own color to "tell them apart" — differentiate through icon, label, and copy, and spend red only on the one card that should visually lead.

### Navigation
- Fixed top bar, `bg-canvas`, bottom border.
- Logo: icon mark (`logo-mark.png` — black rounded-square, red speedmark "R", **not** the earlier white-on-black v4 mark) + uppercase wordmark.
- Center section pills render `lg:` and above only; no mobile menu exists yet (known, accepted gap).

### Countdown
- Full-bleed dark section, checkered-flag repeating-gradient top border (the one place a literal motorsport motif appears).
- Four digit tiles, `font-mono tabular-nums`, neutral `border-2 border-border` — the red pulse lives in the badge/headline/CTA around the tiles, not the tiles themselves.
- Backed by `hooks/use-countdown.ts`, shared with `/launch`.

## Do's and Don'ts

### Do:
- **Do** ask, before adding any color literal, "could this be white or grey instead?" — that question is the whole system now.
- **Do** use the spec-rail pattern (rail + node + grow-to-fit row) for any future list of features, steps, or capabilities on this site.
- **Do** reuse `hooks/use-countdown.ts` for any date-driven UI instead of re-deriving countdown math inline.
- **Do** verify new copy in the spec rail at both `sm:`-stacked and desktop-two-column widths — rows have no fixed height, so overflow isn't a *risk* here the way it was in the bento grid, but very long copy can still crowd the row.

### Don't:
- **Don't** reintroduce a second accent hue anywhere — no green, violet, yellow, or teal, literal or via a legacy-named token. If the legacy `--color-neon-green`/`--color-brand-teal`/etc. tokens are ever repointed away from neutral grey, that is a deliberate, explicit design decision to re-confirm with the user, not a default to fall back into.
- **Don't** rebuild a same-size-card grid as a feature list — that's the bento garage this redesign explicitly removed.
- **Don't** give sibling cards in a set their own rotating accent color to differentiate them; use icon, label, and copy instead, and reserve red for the one card that should lead.
- **Don't** use soft, blurred, or colored-glow shadows on cards or buttons — every shadow is a hard zero-blur offset block, red or grey only.
- **Don't** fabricate traction numbers (user counts, club counts, testimonials). The product is pre-launch (November 12); no real number exists yet for these.
