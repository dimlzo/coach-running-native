---
name: Mon Coach Running
description: Personal running coach for Android, dark Material 3, one own orange.
colors:
  ground: "#121212"
  surface: "#1E1E1E"
  surface-high: "#2A2A2A"
  nav-surface: "#232323"
  outline: "rgba(255,255,255,0.12)"
  text: "#FFFFFF"
  text-secondary: "#B3B3B3"
  text-faint: "#9E9E9E"
  run-orange: "#FF6A2B"
  run-orange-tonal: "rgba(255,106,43,0.16)"
  on-orange: "#1A0E08"
  bar-empty: "#3A3A3A"
typography:
  headline:
    fontFamily: "Roboto"
    fontSize: "24px"
    fontWeight: 700
  title:
    fontFamily: "Roboto"
    fontSize: "16px"
    fontWeight: 700
  title-medium:
    fontFamily: "Roboto"
    fontSize: "16px"
    fontWeight: 500
  body:
    fontFamily: "Roboto"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-secondary:
    fontFamily: "Roboto"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Roboto"
    fontSize: "12px"
    fontWeight: 500
  figure:
    fontFamily: "Roboto"
    fontSize: "22px"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  bar: "4px"
  chip: "8px"
  card: "16px"
  pill: "20px"
  field: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px"
  button-tonal:
    backgroundColor: "{colors.run-orange-tonal}"
    textColor: "{colors.run-orange}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  fab:
    backgroundColor: "{colors.run-orange}"
    textColor: "{colors.on-orange}"
    rounded: "{rounded.card}"
    size: "56px"
  chip-outlined:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.chip}"
    padding: "5px 10px"
  nav-bar:
    backgroundColor: "{colors.nav-surface}"
    textColor: "{colors.text-secondary}"
  nav-indicator-active:
    backgroundColor: "{colors.run-orange-tonal}"
    textColor: "{colors.run-orange}"
    rounded: "{rounded.card}"
    width: "64px"
    height: "32px"
  chat-input:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "13px 18px"
    height: "48px"
  send-button:
    backgroundColor: "{colors.run-orange}"
    textColor: "{colors.on-orange}"
    rounded: "{rounded.field}"
    size: "48px"
  send-button-disabled:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text-faint}"
  bubble-user:
    backgroundColor: "{colors.run-orange}"
    textColor: "{colors.on-orange}"
    padding: "10px 14px"
  bubble-coach:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.text}"
    padding: "10px 14px"
---

# Design System: Mon Coach Running

## Overview

**Creative North Star: "The Category Standard, Played Straight"**

A Material 3 dark running app at Strava's craft level, nothing themed. Tonal dark surfaces step up from the ground with no borders; one own orange marks what you act on, what is active, and the km you ran. Numbers are the content: stat labels sit above large tabular figures.

Density is calm: one 16px screen margin, cards separated by 12px, 16px inside. The visual rejection is confirmed by the owner: no "AI premium" template (violet accent, gradient card, sparkles, tracked uppercase micro-labels, glowing FAB).

**Key Characteristics:**
- Dark tonal layering (ground, surface, surface-high), borderless cards.
- One accent, orange, used for actions, active state and run data only.
- Roboto system face; tabular figures for every number.
- Stock M3 shapes: 16px cards and FAB, pill buttons and fields, nav indicator pill.
- Ionicons outline at rest, filled when active.

## Colors

Neutral dark greys in tonal steps plus a single warm orange.

### Primary
- **Run Orange** (run-orange): primary action fill (FAB, send button, user chat bubble), active nav icon, today's day label, filled week bars, pull-to-refresh spinner, text cursor. Deliberately not Strava's brand hex.
- **Orange Tonal** (run-orange-tonal): 16% orange wash behind the tonal button, the active nav indicator, icon discs and text selection.
- **On Orange** (on-orange): near-black brown for text and icons sitting on Run Orange.

### Neutral
- **Ground** (ground): app background.
- **Surface** (surface): cards and the next-session row.
- **Surface High** (surface-high): coach bubbles, chat field, disabled send, refresh spinner backdrop.
- **Nav Surface** (nav-surface): bottom navigation bar.
- **Outline** (outline): 12% white; only the outlined chip and list dividers inside a card.
- **Text / Secondary / Faint**: primary copy; labels, units, dates, supporting lines; placeholders, chevrons, empty values, inactive day letters.
- **Empty Bar** (bar-empty): week bars for days without a run.

**The One Orange Rule.** Orange means "act here", "you are here" or "you ran". Never decorative, never a second accent, never a gradient.

**The Tonal Step Rule.** Depth comes from ground → surface → surface-high, not from borders. Hairline outline is reserved for chips and in-card dividers.

## Typography

**Display Font:** Roboto (Android system face)
**Body Font:** Roboto

**Character:** Plain, native, legible outdoors after a run. Weight and size carry hierarchy; no tracking, no uppercase.

### Hierarchy
- **Headline** (700, 24px): screen title ("Salut Dim", "Programme"). Chat top bar uses the title style at 20px.
- **Title** (700, 16px): card titles ("Cette semaine", "Dernière sortie").
- **Title Medium** (500, 16px): session type, list row primary text, plan target pace.
- **Body** (400, 16px / 24px): chat messages.
- **Body Secondary** (400, 14px / 20px, text-secondary): dates, subtitles, details, status line.
- **Label** (500, 12px, text-secondary): stat labels above figures, nav labels, plan day column.
- **Figure** (700, 22px, tabular): stat values; records use 24px. Units trail at 14px/500 in text-secondary.

**The Label-Above-Value Rule.** Every stat is a sentence-case 12px label above a tabular figure, unit in smaller secondary type.

**The Tabular Figures Rule.** Any number that can sit beside another (km, pace, time, countdown, bar values) uses tabular-nums.

## Layout

Single-column phone layout. Screen content padding 16px; bottom padding 120px to clear the FAB and nav bar. Cards stack with 12px gaps. Rhythm: 4 / 8 / 12 / 16px. Stats share a row in equal flex columns (3 for an activity, 2 for the week). Records use a two-column grid (48.5% each). Screen header: 16px padding, headline then 4px then secondary subtitle. Safe-area insets are always added to the top, nav bar and chat composer.

## Elevation & Depth

Flat tonal layering. Cards have no shadow and no border. The only shadow is the FAB's neutral M3 elevation (Android elevation 6, 2 when pressed; black, no colored glow). Touch feedback is Android ripple: white at 8-16% on dark surfaces, black 16% on orange.

**The No-Glow Rule.** Elevation is neutral black and only on the FAB. No colored shadows, no glows, no gradients.

## Shapes

Stock Material 3 corners. Cards, FAB and nav indicator 16px; tonal button 20px pill; chat field and send button 24px (fully round); outlined chip 8px; week bars 4px. Chat bubbles 18px with the tail corner at 6px (bottom-right for the user, bottom-left for the coach). Icon discs are 40px circles.

## Components

### Buttons
- **Tonal ("Analyse du coach"):** pill, Orange Tonal fill, Run Orange 14px/600 text with an 18px leading outline icon, min height 40px, 16px side padding.
- **Send:** 48px circle; Run Orange with On Orange icon when enabled, Surface High with faint icon when disabled.
- **Icon button (back):** 48px hit area, 24px icon, no fill.

### FAB (BoutonCoach)
56px, 16px radius, Run Orange, 24px filled chat icon in On Orange; bottom-right, 16px from edge, 96px above the safe-area bottom. Hidden on the chat screen.

### Chips (Puce)
Outlined: 1px outline, 8px radius, 5px/10px padding, 13px secondary text, tabular; emphasis inline in text/700 (the J-countdown).

### Cards (Carte, CarteActivite)
- **Corner Style:** 16px. **Background:** Surface. **Border/Shadow:** none. **Padding:** 16px, 12px below.
- **CarteActivite:** optional title, session type, date, then a 3-up Stat row (Distance / Durée / Allure); feel line in secondary text, explicitly suffixed "(estimé via la FC)".
- **Row card (next session):** pressable Surface card: 40px Orange Tonal icon disc, title + type + secondary detail, trailing faint chevron.
- **List card (Programme):** rows 14px vertical padding separated by outline dividers; past sessions and rest days at 65% opacity; next session's day label in Run Orange.

### Week Bars
7 bars Mon→Sun, 18px wide, 4px radius, max 52px tall in a 76px track. Run days Run Orange with an 11px tabular km value above; empty days a 3px Empty Bar stub; today always orange (stub included) with an orange bold day letter.

### Inputs / Fields
Chat field: Surface High, 24px radius, min 48px, grows to 120px (multiline), Run Orange cursor, faint placeholder. No border, no focus ring beyond the cursor.

### Navigation (BarreOnglets)
M3 navigation bar on Nav Surface, 4 tabs, 12px vertical padding plus inset. Active: 64x32 Orange Tonal indicator pill, filled Run Orange icon, label text/700. Inactive: outline icon and label in secondary, 500. Icons 22px, labels 12px.

### Chat Bubbles
Max 82% width, 10/14px padding, 8px apart. User: Run Orange with On Orange body text, right-aligned. Coach: Surface High with white text, left. Typing state: "Le coach écrit…" in secondary text.

### Data Status (EtatDonnees)
Shown only when data is not fresh: 16px offline icon or small spinner in secondary, plus a 14px secondary line. Silent when connected.

## Do's and Don'ts

### Do:
- **Do** keep orange to actions, active state and run data (The One Orange Rule).
- **Do** separate surfaces by tone (#121212 → #1E1E1E → #2A2A2A), not borders.
- **Do** put a 12px label above every figure and set numbers in tabular-nums.
- **Do** label estimates as estimates ("estimé via la FC", "Estimés d'après tes sorties Strava") and show "—" rather than invented values.
- **Do** use Ionicons outline at rest and filled for the active/primary state.

### Don't:
- **Don't** use violet, gradient cards, sparkle icons or a glowing FAB (owner-confirmed rejection of the previous look).
- **Don't** add tracked uppercase micro-labels or kickers above titles.
- **Don't** add borders or shadows to cards; the FAB is the only elevated element.
- **Don't** introduce a second accent colour or Strava's brand orange.
