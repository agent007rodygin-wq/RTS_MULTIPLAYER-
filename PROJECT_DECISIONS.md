# Project Decisions

This file records durable architecture and implementation decisions.

It is not a bug log.
It is not a checklist.
It is the "why" behind the shape of the project.

## Format

| ID | Date | Area | Decision | Why | Consequences |
|---|---|---|---|---|---|

## Decisions

### DEC-001

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Leaderboard |
| Decision | Keep leaderboard data in `leaderboard_profiles` instead of `users` |
| Why | `users` is private and auth-oriented, so it should not be treated as a public ranking table |
| Consequences | Leaderboard queries stay isolated from auth and profile logic |

### DEC-002

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Trees / respawn |
| Decision | Keep tree respawn server-authoritative |
| Why | The client is not a trustworthy source for respawn timing |
| Consequences | Realtime and server logic must preserve the canonical respawn state |

### DEC-003

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Inventory |
| Decision | Inventory updates must merge, not overwrite, and PB byte-array payloads must be decoded before merge |
| Why | Empty, partial, or byte-array snapshots previously caused data loss |
| Consequences | Any snapshot or retry path must preserve older items unless the change is explicit |

### DEC-004

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Chat / PocketBase |
| Decision | Use top-level fields for sortable chat metadata such as timestamp |
| Why | Sorting and filtering are more reliable when the query field is top-level |
| Consequences | Chat schema and write paths must stay aligned with query behavior |

### DEC-005

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Realtime |
| Decision | Realtime retries must preserve the last good state |
| Why | Blank UI during a transient failure is worse than showing slightly stale data |
| Consequences | Retry logic should be bounded and state-preserving |

### DEC-006

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | PocketBase wrapper |
| Decision | Keep request queueing and in-flight deduplication in `src/pocketbase.ts` |
| Why | Startup bursts can overload the browser or PB if every component fires independently |
| Consequences | New data paths should reuse the wrapper instead of bypassing it |

### DEC-007

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Refactors |
| Decision | Do not perform mass encoding rewrites of `App.tsx` |
| Why | Large encoding or formatting rewrites add noise and can obscure the actual gameplay changes |
| Consequences | Keep encoding fixes targeted and incremental |

### DEC-008

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Risk management |
| Decision | Backup and commit before risky changes |
| Why | MMO fixes can cross many systems and need a stable rollback point |
| Consequences | Treat dangerous refactors as checkpoints, not ad hoc edits |

### DEC-009

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Trees / rewards |
| Decision | The client may optimistically render, but it must not authoritatively award currency or resources |
| Why | Rewards must come from the server to avoid duplication, desync, and spoofing |
| Consequences | Tree-hit and similar reward flows must remain server-authoritative |

### DEC-010

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Refactors / App.tsx |
| Decision | Treat the monster animation config extraction into `src/game/monsters/monsterAnimationConfig.ts` as the first successful `App.tsx` refactor baseline |
| Why | The change separated static animation data from runtime logic without touching render branches, preload behavior, or gameplay calculations |
| Consequences | Future `App.tsx` extractions should start with pure data/config blocks, preserve imported frame names, and keep the first baseline commit/tag as the rollback point |

### DEC-011

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Refactors / App.tsx |
| Decision | Large `App.tsx` refactors must be split into a series of small independent extraction patches |
| Why | Small patches make it much easier to verify behavior, isolate regressions, and keep the rollback surface narrow |
| Consequences | Each patch should move only one logical block, pass build/smoke checks before the next step, and avoid bundling unrelated data or logic changes |

## How To Use This File

- Add a new decision when a rule becomes stable enough to outlive one bug fix
- Record the date and the reason, not just the conclusion
- Prefer short, durable statements
- Link to `KNOWN_BUGS.md` and `DEVELOPMENT_RULES.md` when a decision is related
