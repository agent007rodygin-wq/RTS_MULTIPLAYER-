# Known Bugs

This file is a living bug log and memory aid.

Use it for:

- recurring failure modes
- issues that were already debugged once
- things that are fixed but worth remembering
- problems that need an index, query, or architecture change later

## Quick Index

| ID | Area | Status | Short Note |
|---|---|---|---|
| BUG-001 | PocketBase / leaderboard | Fixed | Queue wait time used to count as active request time |
| BUG-002 | PocketBase / buildings | Fixed | `buildings_my` could time out on first open during heavy world sync |
| BUG-003 | PocketBase / leaderboard | Fixed | Leaderboard could blank while retrying |
| BUG-004 | PocketBase / realtime | Mitigated | Startup fetch could fail on transient network pressure |
| BUG-005 | Schema / queries | Monitor | Missing indexes can make sorted/filtered queries slow |
| BUG-006 | `buildings` | Monitor | World loading can fan out into multiple reads |
| BUG-007 | Inventory | Prevented | Snapshot merging can drop preserved state if too aggressive |
| BUG-008 | Chat | Monitor | Mixed top-level and `data`-field patterns are fragile |
| BUG-009 | Inventory / tree-hit | Fixed | PocketBase hook once returned JSON inventory as a byte array |
| BUG-010 | Leaderboard / users rules | Fixed | `users.listRule` exposed only the current user to the leaderboard |
| BUG-011 | Chat schema mapping | Fixed | Chat fields were stored in `data` instead of top-level fields |
| BUG-012 | Trees / mixed authority | Fixed | Client and server both changed tree HP and lifecycle |
| BUG-013 | Buildings / destruction merge | Fixed | Expired `destructionEndTime` kept records combat-protected |

## Detailed Records

### BUG-001

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | PocketBase / leaderboard |
| Symptoms | Initial leaderboard load could time out under load |
| Root Cause | Queue wait time was counted as active request time, and repeated startup reads could stack up |
| Fix | Timeout handling moved to active request execution; retry keeps last good data visible |
| Files | `src/pocketbase.ts`, `App.tsx` |
| Regression Tests | Leaderboard, Chat, Inventory, `src/pocketbase.ts` quick smoke |
| Status | Fixed |

### BUG-002

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | PocketBase / buildings |
| Symptoms | `buildings_my` could time out on first open during heavy world sync |
| Root Cause | Owner query was competing with other startup reads in the same queue |
| Fix | Query path preserved; wrapper now avoids queue-induced false timeouts |
| Files | `src/pocketbase.ts`, `App.tsx` |
| Regression Tests | World load, buildings, construction, `src/pocketbase.ts` quick smoke |
| Status | Fixed |

### BUG-003

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | PocketBase / leaderboard |
| Symptoms | Leaderboard could blank while retrying |
| Root Cause | UI cleared previous data before the next request finished |
| Fix | Loading state now keeps the last successful leaderboard visible |
| Files | `App.tsx` |
| Regression Tests | Leaderboard tabs, retries, loading states |
| Status | Fixed |

### BUG-004

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | PocketBase / realtime |
| Symptoms | Startup fetch could fail on transient network pressure |
| Root Cause | Realtime and snapshot fetches can collide on slow or busy clients |
| Fix | One automatic retry exists; do not add infinite retries |
| Files | `src/pocketbase.ts` |
| Regression Tests | Realtime startup, zone load, leaderboard, chat |
| Status | Mitigated |

### BUG-005

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Schema / queries |
| Symptoms | Slow queries can appear when target fields are not indexed |
| Root Cause | PocketBase may scan more rows than expected |
| Fix | Check indexes when adding sort/filter clauses on large collections |
| Files | PocketBase schema, `src/pocketbase.ts` |
| Regression Tests | Collection-specific query smoke |
| Status | Monitor |

### BUG-006

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | `buildings` |
| Symptoms | Realtime world loading can fan out into multiple reads |
| Root Cause | Zone-based loading, collision checks, and ownership checks all touch the same collection |
| Fix | Keep the reads targeted and avoid adding broad duplicate scans |
| Files | `App.tsx`, `src/pocketbase.ts` |
| Regression Tests | World load, zone switching, construction, collisions |
| Status | Monitor |

### BUG-007

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Inventory |
| Symptoms | Inventory can be lost if snapshot merging is too aggressive |
| Root Cause | A stale snapshot or overwrite path can replace preserved local state |
| Fix | Keep inventory merge behavior conservative |
| Files | `App.tsx`, `src/pocketbase.ts` |
| Regression Tests | Trees, market, gifts, construction, re-login |
| Status | Prevented |

### BUG-008

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Chat |
| Symptoms | Messages can disappear if cleanup or snapshot sync is wrong |
| Root Cause | Mixed top-level and `data`-field storage patterns are fragile |
| Fix | Always verify normal chat, shout, and cleanup together |
| Files | `App.tsx`, `src/pocketbase.ts` |
| Regression Tests | Chat, shout, clan chat, police chat, private messages |
| Status | Monitor |

### BUG-009

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Inventory / tree-hit |
| Symptoms | PocketBase hook returned JSON inventory as a byte array, and inventory collapsed to `{}` |
| Root Cause | The normalizer treated the decoded payload as an invalid array instead of the existing JSON inventory |
| Fix | Decode the PB byte-array payload before merging and preserve the full inventory snapshot |
| Files | `src/pocketbase.ts`, `pb_hooks/tree_server_utils.js`, `App.tsx` |
| Regression Tests | Trees, Inventory, Respawn |
| Status | Fixed |

### BUG-010

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Leaderboard / users rules |
| Symptoms | Ordinary users could see only their own record in the leaderboard |
| Root Cause | `users.listRule` exposed only the current user, so the client query saw one row |
| Fix | Move public leaderboard reads to `leaderboard_profiles` |
| Files | `App.tsx`, `src/pocketbase.ts` |
| Regression Tests | Leaderboard tabs, auth, re-login |
| Status | Fixed |

### BUG-011

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Chat schema mapping |
| Symptoms | Chat rows sorted poorly and some messages looked empty at the top level |
| Root Cause | `sender`, `text`, `type`, `tab`, and `timestamp` were stored inside `data` JSON instead of top-level fields |
| Fix | Correct `KNOWN_FIELDS` and migrate existing messages to top-level sortable fields |
| Files | `App.tsx`, `src/pocketbase.ts`, `repair_live_pocketbase_schema.mjs` |
| Regression Tests | Chat, Shout, Cleanup, Private Messages |
| Status | Fixed |

### BUG-012

| Field | Value |
|---|---|
| Date | 2026-07-11 |
| Area | Trees / mixed authority |
| Symptoms | Repeated hits, `PATCH 404`, and instant respawn behavior |
| Root Cause | Client and server both changed tree HP and lifecycle |
| Fix | Make tree hits server-authoritative through `requestTreeHit` |
| Files | `App.tsx`, `pb_hooks/tree_server_utils.js` |
| Regression Tests | Trees, Inventory, Respawn, World |
| Status | Fixed |

### BUG-013

| Field | Value |
|---|---|
| Date | 2026-07-12 |
| Area | Buildings / destruction merge |
| Symptoms | Expired `destructionEndTime` kept records in `keep_local_protected` and repeated the same snapshot merge decision |
| Root Cause | Any finite `destructionEndTime` was treated as an active combat window, even after the timestamp had already expired |
| Fix | Combat protection now requires `destructionEndTime > Date.now()` via `hasActiveDestructionWindow` |
| Files | `App.tsx` |
| Regression Tests | `vite build`, live runtime check for `m70003s1z2_1`, pendingDamage/deleting/tombstone sanity checks |
| Status | Fixed |
| Remaining Debt | 39 stale PB records still contain expired `destructionEndTime`, but they no longer affect merge behavior |

## How To Use This File

- Add a new record when a bug is found
- Update the `Status` when it is fixed or confirmed
- Keep the note short but specific
- Prefer a durable root cause over a one-line symptom

## Suggested Status Values

- `Open`
- `Fixed`
- `Mitigated`
- `Monitor`
- `Won't Fix`
