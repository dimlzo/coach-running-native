# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users
One user: Dim, an amateur runner preparing a half-marathon on 8 November 2026. Not a developer. Uses an Android phone. Opens the app mostly **after a run** (to see the session that came in from Strava and ask the coach for a read on it) and **to talk with the coach**. Checking the plan before a run and following overall progress are secondary.

## Product Purpose
A personal running coach: it reads Dim's real Strava data, talks with him in a chat (same brain as the Telegram bot), keeps the thread of the conversation, and generates a weekly plan he can correct by hand. Success = Dim reaches the start line of the half-marathon well prepared, with a coach that knows his actual runs.

## Positioning
Not a generic training app: the coach answers from Dim's own fresh Strava activities every time, and the weekly plan lives in a Google Sheet he can edit himself.

## Operating Context
- Data comes from n8n webhooks: `coach-data` (sessions, records, plan) and `coach-chat` (chat, `/programme` command).
- Typical moment: just back from a run, phone in hand, possibly tired / sweaty, outdoors or at home.
- Chat history is kept locally on the phone only (decided 2026-10-18).

## Capabilities and Constraints
- Screens: Home (latest session + quick analysis, this week's km / sessions / countdown, next planned session), Plan, Sessions, Records, Chat (floating chat button everywhere except chat).
- `ressenti` (feel) is currently inferred from average heart rate on a 5-step scale: Plaisir / Bien / Normal / Dur / Horrible. Tap-to-set feel is a planned feature.
- Records are approximations by distance band, not Strava best efforts (v2 planned).
- Expo SDK 57, React Native, single `App.js` with inline styles. Built as an APK via EAS; tested in Expo Go.
- Language: French.

## Brand Commitments
- **Dark background is binding** (user choice). Everything else visual may change.
- Explicit goal of the 2026 redesign: look **less "AI-generated"** (current look: violet single accent, gradient card, sparkles icon, generic dark-premium template).
- **Standing preference (2026-10-18): the category standard, played straight.** After two direction rounds, Dim chose the familiar running-app convention over a themed world. Quality bar: **Strava** (named reference). Own orange, not Strava's brand hex.

## Evidence on Hand
Real data only (sessions, paces, records from Strava). No testimonials, no other users. Do not fabricate stats.

## Product Principles
1. The latest real run comes first: after a run, what happened today is the first thing seen.
2. The coach is a conversation, not a feature: reaching and reading the chat must be effortless.
3. Numbers are the content: paces, distances, times must be instantly legible.
4. Honest data: show estimates as estimates (feel from heart rate, approximate records).
