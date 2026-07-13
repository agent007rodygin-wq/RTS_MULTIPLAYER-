# Postmortems

Use this file for incidents, root causes, and the lessons that should never be forgotten.

## Template

| Field | Content |
|---|---|
| Date | YYYY-MM-DD |
| Incident | Short title |
| Area | Subsystem or collection |
| Symptoms | What players saw |
| Root Cause | Why it happened |
| Why It Was Missed | What the review missed |
| Fix | What changed |
| Prevention | What rule or test now prevents it |
| Status | Open / Fixed / Monitoring |

## 2026-07-11 Inventory Reset

| Field | Content |
|---|---|
| Date | 2026-07-11 |
| Incident | Inventory reset after snapshot / merge confusion |
| Area | `users.inventory` |
| Symptoms | Old items disappeared or inventory looked empty after refresh. |
| Root Cause | Inventory state was treated as replaceable instead of merge-only. |
| Why It Was Missed | The payload shape changed between PB export and client expectations. |
| Fix | Preserve and merge inventory, including byte-array decoding paths. |
| Prevention | `DEVELOPMENT_RULES.md`, `GAME_CHECKLIST.md`, `KNOWN_BUGS.md` |
| Status | Fixed |

## 2026-07-11 Leaderboard Only Showed Current Player

| Field | Content |
|---|---|
| Date | 2026-07-11 |
| Incident | Public leaderboard temporarily looked like only the active user existed. |
| Area | `leaderboard_profiles` |
| Symptoms | Switching tabs or reloading changed the visible ranking set. |
| Root Cause | The leaderboard should not have been sourced from `users`. |
| Why It Was Missed | Private auth records and public ranking records had been conflated. |
| Fix | Use a dedicated `leaderboard_profiles` collection. |
| Prevention | `DATABASE_SCHEMA.md`, `DEVELOPMENT_RULES.md`, `GAME_CHECKLIST.md` |
| Status | Fixed |

## 2026-07-11 Chat Field Mapping

| Field | Content |
|---|---|
| Date | 2026-07-11 |
| Incident | Chat items were stored or read through the wrong field shape. |
| Area | `chat_messages` |
| Symptoms | Messages or system notes failed to appear consistently. |
| Root Cause | The client and persisted record shape drifted. |
| Why It Was Missed | The listener and write path were not documented together. |
| Fix | Keep chat writes and reads aligned with the collection schema. |
| Prevention | `DATABASE_SCHEMA.md`, `NETWORK_FLOW.md`, `GAME_CHECKLIST.md` |
| Status | Fixed |

## 2026-07-11 Tree Authority And Respawn

| Field | Content |
|---|---|
| Date | 2026-07-11 |
| Incident | Tree lifecycle needed a single authoritative path. |
| Area | `map_resources` and tree hook |
| Symptoms | Tree hits, respawn timing, or deletion could drift between client and server. |
| Root Cause | The client could not safely own reward distribution and respawn timing. |
| Why It Was Missed | The tree path crossed both UI and server logic. |
| Fix | Server handles tree hit resolution and respawn jobs. |
| Prevention | `NETWORK_FLOW.md`, `DEVELOPMENT_RULES.md`, `GAME_CHECKLIST.md` |
| Status | Fixed |

## New Incident Entry

Copy this block when a new regression happens:

| Field | Content |
|---|---|
| Date |  |
| Incident |  |
| Area |  |
| Symptoms |  |
| Root Cause |  |
| Why It Was Missed |  |
| Fix |  |
| Prevention |  |
| Status |  |
