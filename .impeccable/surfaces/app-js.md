---
version: 1
slug: "app-js"
primary_target: "App.js"
related_targets: []
---

# Surface brief: app shell (Accueil, Programme, Séances, Records, Chat)

Scope: whole Android app (single App.js). Mode: Operate. Build path: code-led.
Audience/job: Dim, after a run, checks the session that came from Strava and asks the coach; chats with the coach.
Constraints: dark theme binding; French; real data from n8n; estimates labelled as estimates.

## Direction contract

THESIS: The category standard played straight, at Strava's craft level: a clean Material 3 dark running app. Refuses the incumbent "AI premium" template (violet accent, gradient card, sparkles, tracked uppercase micro-labels, glowing FAB).

OWN-WORLD: Material 3 dark surfaces (#121212 ground, #1E1E1E / #2A2A2A containers, no borders), one own orange #FF6A2B for primary actions, active nav and run bars; Roboto system face, tabular figures; 16px card radius, pill buttons, M3 navigation bar with indicator pill, M3 FAB (16px radius, neutral elevation, no glow).

STORY: Open the app after a run, see that run first with its numbers, tap "Analyse du coach", talk; glance at the week and the next session.

FIRST VIEWPORT: Top bar "Salut Dim" + outlined chip "Semi 8 nov. · J-21". Card 1 = latest activity (title, date, Distance / Durée / Allure with labels above values, feel marked "estimé", tonal "Analyse du coach" button). Card 2 = Cette semaine (km, sorties, 7 bars Mon→Sun, today emphasised). Card 3 = Prochaine séance row with chevron. FAB chat bottom-right above the 4-item navigation bar.

FORM: canon (category standard), chosen by the user after two rounds; quality bar named: Strava. seed:6e54690ef01ba668

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
