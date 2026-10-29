---
name: VidAI
description: AI wedding planner for Pakistan — marble ground, rose-stone inlay, jali lattice
colors:
  marble: "#faf9f7"
  panel: "#ffffff"
  stone: "#f3efe9"
  stone-deep: "#e8e1d6"
  rose: "#d7385e"
  rose-deep: "#a92747"
  rose-ink: "#8e1f3b"
  rose-soft: "#f9e9ed"
  gold: "#b98a2f"
  gold-deep: "#8a6420"
  ink: "#1f2937"
  ink-soft: "#4b5563"
  muted: "#6b7280"
  line: "#e7e2d9"
  ok: "#15803d"
  warn: "#b45309"
  bad: "#b91c1c"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.1rem, 4.5vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.18
  title:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 600
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  pill: "999px"
  arch: "160px 160px 12px 12px"
spacing:
  xs: "0.4rem"
  sm: "0.75rem"
  md: "1.1rem"
  lg: "1.6rem"
  xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.rose-deep}"
    textColor: "#ffffff"
    rounded: "9px"
    padding: "0.62rem 1.2rem"
  button-primary-hover:
    backgroundColor: "{colors.rose-ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "9px"
    padding: "0.62rem 1.2rem"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "1.3rem"
  badge-rose:
    backgroundColor: "{colors.rose-soft}"
    textColor: "{colors.rose-ink}"
    rounded: "{rounded.pill}"
    padding: "0.14rem 0.62rem"
---

# Design System: VidAI

## Overview

**Creative North Star: "Marble & Rose Inlay"**

VidAI's interface is carved like Mughal pietra dura: a calm ivory-marble ground, panels inlaid with rose stone, jali lattice screens as section dividers, and gold hairlines drawing the borders. Headlines are set in Playfair Display like engraved cartouches; everything operational is Outfit — quiet, precise, tabular where numbers mean money. The rose accent is the inlay: it marks every primary action and every number a couple cares about, and its rarity is what keeps it precious. PKR amounts always render with the ₨ sign and tabular numerals.

Demonstration data is labeled synthetic in place; the palette, not photography, carries the luxury. **Key Characteristics:**
- Jali lattice (authored 8-point-star SVG) as divider strips and quiet panel texture — never behind body text
- Arch-topped frames (`border-radius: 160px 160px 12px 12px`) for the product's signature surfaces
- Gold hairline rules with a diamond center between sections
- Rose `#d7385e` reserved for inlay accents; interactive rose is the darker `#a92747` for AA contrast
- One authored motion: the hero assistant types its own exchange; everything else is 0.15–0.9s ease-out state transitions

## Colors

The palette pairs a warm marble neutral family with one saturated rose accent and a metallic gold reserved for rules and secondary outlines.

### Primary
- **Rose Inlay** (#d7385e): the brand rose — large display accents, italic headline emphasis, inlay graphics. Never body-size text on white (fails AA); hand off to Rose Deep below.
- **Rose Deep** (#a92747): every interactive surface — primary buttons, links, active nav, stat numerals. White text on it passes AA at body sizes.
- **Rose Ink** (#8e1f3b): hover state of the primary action; the deepest voice of the accent.

### Secondary
- **Inlay Gold** (#b98a2f): hairline rules, focus-visible outlines, gold-outline buttons. Text in gold uses **Gold Deep** (#8a6420) for contrast.

### Tertiary
- **Rose Blush** (#f9e9ed): active nav fill, badge backgrounds, selection tint.

### Neutral
- **Marble** (#faf9f7): the page ground everywhere.
- **Panel** (#ffffff): cards, chat surfaces, forms.
- **Stone** (#f3efe9) / **Stone Deep** (#e8e1d6): tinted panels (empty states, jali panels) and input borders / scrollbar.
- **Ink** (#1f2937), **Ink Soft** (#4b5563), **Muted** (#6b7280): text hierarchy.
- **Line** (#e7e2d9): hairline borders on cards and table rows.
- Status: **Verdigris** (#15803d), **Amber** (#b45309), **Crimson** (#b91c1c) — only ever as state, with their soft backgrounds.

### Named Rules
**The Inlay Rule.** The bright rose #d7385e never renders as body text or a fill under white body text; interactive rose is always Rose Deep #a92747.
**The PKR Rule.** Money is always `₨` + `toLocaleString('en-PK')` with tabular numerals; never a bare number.
**The Lattice Rule.** Jali patterns sit behind headings, empty states and side panels — never behind paragraphs a user reads.

## Typography

**Display Font:** Playfair Display (with Georgia serif fallback)
**Body Font:** Outfit (with system-ui fallback)

**Character:** An engraved serif speaking to tradition over a precise geometric sans doing the work — the wedding card and the spreadsheet, married.

### Hierarchy
- **Display** (600, clamp(2.1rem–3.4rem), 1.18): hero headlines only, with the second line in italic rose.
- **Headline** (600, clamp(1.5rem–2rem)): page and section titles.
- **Title** (600, 1.12rem): card headings.
- **Body** (400, 15.5px, 1.6): UI text, prose capped at 68ch.
- **Label** (500, 0.78rem, +0.05em, uppercase): table headers; badges at 0.78rem sentence case.

### Named Rules
**The Cartouche Rule.** Playfair Display never sets UI controls, labels, or table body text — it announces; Outfit operates.

## Layout

Single centered column, max-width 1140px with 1.5rem gutters for public pages; dashboards use a 242px sidebar + max-1180px main pane. Sections breathe at 4rem vertical padding; the jali divider strip (34px, bordered top and bottom) marks section breaks on public pages. Grid utilities: `.grid-2` (auto-fill, min 300px), `.grid-3` (auto-fill, min 230px), `.stack` (1.1rem vertical rhythm). Breakpoints: 640px (public nav collapses to brand + CTA), 880px (auth split stacks, shell sidebar becomes a horizontal scroll rail), 960px (hero becomes single column).

## Elevation & Depth

Layered, quiet. Two shadows only: resting (`0 1px 2px … 0.06, 0 10px 30px … 0.07`) and raised for hover/overlays (`0 2px 4px … 0.08, 0 18px 50px … 0.14`). Depth is otherwise carried by the tint ladder (marble → panel → stone) and hairline borders — never by heavy drop shadows. Modals and the chat preview are the only raised-at-rest surfaces.

### Shadow Vocabulary
- **Resting** (`var(--shadow)`): cards, tables, chat windows at rest.
- **Raised** (`var(--shadow-lg)`): hover lift, modal, hero chat preview.

### Named Rules
**The Tint Ladder Rule.** Reach for a stone-tinted panel before a shadow; shadows respond to state, they don't fake hierarchy.

## Shapes

Rounded 12px cards with 1px line borders; 9px controls; pill badges (999px). The signature silhouette is the **arch**: top corners swept to 160px (or full 999px semicircle) over square bottom corners, used for the assistant preview, brand crest, and invitation moments. Inputs keep 9px radius and 1px stone-deep borders that shift to rose with a 3px rose-soft glow ring on focus; `:focus-visible` everywhere else is a 2px gold outline offset 2px.

## Components

### Buttons
- **Shape:** 9px radius, inline-flex, 0.62rem × 1.2rem padding (sm 0.35rem × 0.72rem, lg 0.85rem × 1.7rem)
- **Primary:** Rose Deep fill, white text; hover Rose Ink; active translateY(1px); disabled 55% opacity
- **Secondary:** outline on stone-deep, ink text; hover panel background with gold border/text
- **Gold:** gold border, gold-deep text — used only for vendor-facing CTAs
- **Danger:** transparent, crimson text, soft crimson border; hover crimson-soft fill

### Chips
- **Style:** pill, panel background, 1px stone-deep border, ink-soft text; hover rose border/text
- **State:** selected = rose-soft fill, rose-ink text (category toggles on the vendor profile)

### Cards / Containers
- **Corner Style:** 12px; hover variant lifts 2px with Raised shadow and rose-tinted border
- **Background:** panel white; the jali-panel variant is stone-filled with the gold lattice at 22% opacity
- **Border:** 1px Line; **Internal padding:** 1.3rem
- **Named:** **The No-Nesting Rule.** Content sits directly on tinted panels — never a white card inside a tinted card.

### Inputs / Fields
- **Style:** 1px stone-deep stroke, panel fill, 9px radius, 0.62rem × 0.85rem padding; placeholders #92867b
- **Focus:** rose border + `0 0 0 3px rgba(215,56,94,0.13)` glow
- **Error:** crimson-soft block above the form; disabled 55% opacity

### Navigation
- Public: sticky marble bar with blur, brand crest + wordmark left, links and one filled CTA right; under 640px only brand + CTA survive.
- App shell: 242px sidebar, 9px-radius links; active = rose-soft fill + rose-ink text; icon 18px stroke 1.8; logout pinned to the bottom.
- Tables: uppercase 0.78rem muted headers over stone-deep rule; rows divided by Line, hover #fbf8f4.

### Assistant Chat (signature)
- The arch-framed preview demonstrates the product: user bubble in Rose Deep (white text), AI bubble in Stone, both 13px radius with a 4px corner notch toward the speaker; typing caret in Rose Deep. The full chat page reuses the same bubbles inside a chat-window with sticky input bar.

### Budget Allocation Bars (signature)
- Hand-inked chart language: 26px stone tracks, Rose Deep fills animating width (0.9s ease-out, 70ms stagger), tabular PKR amounts right-aligned, Playfair total beneath a hairline rule. Never a progress ring or sparkline.

## Do's and Don'ts

### Do:
- **Do** use Rose Deep (#a92747) for every interactive rose and Rose (#d7385e) only for display accents and fills carrying no body text.
- **Do** set money as `₨` + tabular numerals, always.
- **Do** mark section breaks on public pages with the jali divider; give empty states a stone + jali-gold panel with copy directly on it.
- **Do** keep one authored motion per surface; state transitions at 0.15–0.9s with `cubic-bezier(0.16,1,0.3,1)`.

### Don't:
- **Don't** nest a white card inside a tinted/jali panel.
- **Don't** put jali texture behind paragraphs, or Playfair on controls and labels.
- **Don't** use progress rings, sparklines, gradient text, or icon-card grids as page structure — features are editorial rows with varied visual treatments.
- **Don't** reach for glass/blur outside the public navbar's backdrop, or shadows heavier than the two-token vocabulary.
