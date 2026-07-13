# 05. Timers and Processes

## Scope And Evidence

This document records confirmed time-dependent runtime behavior in the active source snapshot.
Graphify was used only as a navigation aid. Every factual statement below is backed by the current source code.

Primary sources:

- `App.tsx`
- `src/pocketbase.ts`
- `types.ts`
- `data/buildings.ts`
- `data/destructionWeapons.ts`
- `src/game/ui/actionOptions.ts`
- `pb_hooks/main.pb.js`
- `pb_hooks/tree_server_utils.js`

## Gameplay Process Families

The count below is a count of confirmed process families, not a count of every individual `setInterval` / `setTimeout` call.

| # | Family | Source | Approx. lines | Time field(s) / unit | Authority | What it does | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Offline timer reconciliation | `App.tsx / processOfflineTimers`, `App.tsx / building-state loop` | `624-760`, `7988-7999`, `11491-11512`, `15252-15280` | `constructionEndTime`, `workEndTime`, `destructionExpiresAt`, `lastAttackTime` in ms | Client-first with freshness guard; server writes only when the source snapshot is fresh | Reconciles overdue construction, production, destruction, and offline combat catch-up. `_offlineTimersSynced` prevents duplicate DB writes. | `CONFIRMED_BY_SOURCE` |
| 2 | Construction / upgrade lifecycle | `App.tsx / placeBuildingAtTile`, `handleBuildOilRig`, `handleBuildWildQuarry`, `handleUpgrade`, `handleSpeedUp` | `5862-6250`, `14068-14184`, `14461-14610`, `16123-16213` | `constructionEndTime` in ms; `constructionStartTime` is trace-only | Client-authoritative start, then PocketBase persistence | Starts construction, starts upgrade as a construction phase, and supports speed-up. Optimistic state is written immediately. | `CONFIRMED_BY_SOURCE` |
| 3 | Production lifecycle | `App.tsx / handleStartProductionFromWorld`, `handleStartProduction`, `handleCollectProductionFromWorld`, `handleCollectProduction`, manual production loop | `14618-15280` | `workEndTime` in ms; `workStartTime` is trace-only | Client-first start, client and server completion paths | Starts production, marks completion, and collects rewards. Direct-interaction factories and selected-building buttons use different entry points but the same underlying lifecycle. | `CONFIRMED_BY_SOURCE` |
| 4 | Destruction / combat lifecycle | `App.tsx / handleExplode`, `handleApplyProtection`, combat and destruction loop | `15944-16050`, `11469-12752` | `destructionStartedAt`, `destructionEndTime`, `destructionExpiresAt`, `destructionDurationMs`, `destructionMaxLifetimeMs`, `protectionEndTime` in ms | Client-first damage model with server reconciliation | Applies combat damage, active destruction windows, fatal-hit delays, and protection windows. | `CONFIRMED_BY_SOURCE` |
| 5 | Monster attack cooldown | `App.tsx / offline combat + world sweep` | `803-806`, `12444-12470`, `13098-13222` | `lastAttackTime` in ms; `MONSTER_ATTACK_INTERVAL_MS` | Client loop with server writes | Limits monster attacks to the configured cooldown. | `CONFIRMED_BY_SOURCE` |
| 6 | Cannon defense cooldown | `App.tsx / combat loop` | `1200-1207`, `12444-12470` | `lastAttackTime` in ms; `CANNON_ATTACK_INTERVAL_MS` | Client loop with server writes | Limits tower / cannon counter-attacks to the configured cooldown. | `CONFIRMED_BY_SOURCE` |
| 7 | Monster AI / movement batch cadence | `App.tsx / main game loop, monster host updates, movement batches` | `11583-12190`, `1200-1207` | `lastMoveTime` in ms; `MONSTER_AI_TICK_INTERVAL_MS`, `MONSTER_MOVE_BATCH_INTERVAL_MS`, `MONSTER_WRITE_MIN_INTERVAL_MS` | Client loop with throttled writes | Drives monster movement, host claims, and write throttling. | `CONFIRMED_BY_SOURCE` |
| 8 | Resource spawn cycle | `App.tsx / oil, quarry, chest spawners` | `12822-12916` | Interval-only; no persisted TTL field | Client-only spawn loop | Spawns or refreshes oil, quarry, and chest resources on a timer. | `CONFIRMED_BY_SOURCE` |
| 9 | Tree respawn cron | `pb_hooks/main.pb.js / cronAdd`, `pb_hooks/tree_server_utils.js / processTreeHit, processDueTreeRespawns` | `55-57`, `369-372`, `640-680` | `respawnAt`, `createdAt` in ms | Server authority | Schedules tree respawn jobs and processes due respawns on the server. | `CONFIRMED_BY_SOURCE` |
| 10 | Monster spawn cycle | `App.tsx / monsterSpawnIntervalRef` | `13690-13693` | Interval + initial timeout only | Client loop | Runs the world monster spawn cycle every minute, with one initial delayed pass. | `CONFIRMED_BY_SOURCE` |
| 11 | Energy regen interval | `App.tsx / energyTimer` | `13720-13726` | `ENERGY_REGEN_PER_MINUTE` | Client loop | Regenerates player energy every minute. | `CONFIRMED_BY_SOURCE` |
| 12 | Ban / currentTime heartbeat | `App.tsx / currentTime state, isBanned, ban handlers` | `2907-2909`, `3021-3027`, `3658-3660`, `6985-6986`, `7258-7261`, `22793-22793` | `banEndTime`, `currentTime` in ms | Client clock | Keeps ban checks and the ban-tab countdown in sync with the local clock. | `CONFIRMED_BY_SOURCE` |
| 13 | Curse cleanup interval | `App.tsx / cleanupExpiredCurses` | `7318-7333` | Nested `activeCurse.endTime` in ms | Client loop | Clears expired curses from user state and writes the cleaned state back. | `CONFIRMED_BY_SOURCE` |
| 14 | Election checks | `App.tsx / checkWarnings`, `checkRoyalElection` | `8716-8906` | `policeElectionEndTime`, `royalElectionEndTime`, `electionEndTime` in ms | Client loop | Runs election countdown warnings and winner selection. | `CONFIRMED_BY_SOURCE` |
| 15 | System chat cleanup interval | `App.tsx / cleanupExpiredSystemMessages` | `466-469`, `7467-7497` | `timestamp` in ms; `SYSTEM_CHAT_MESSAGE_TTL_MS` | Client loop | Removes expired system messages from chat. | `CONFIRMED_BY_SOURCE` |
| 16 | Presence heartbeat | `App.tsx / updatePresence` | `7531-7572`, `16332-16735`, `17669-17691` | `lastSeen` in ms | Client heartbeat with PocketBase writes | Refreshes presence and online-user visibility. | `CONFIRMED_BY_SOURCE` |
| 17 | User persistence heartbeat | `App.tsx / saveUserData`, `persistLastPlayerPosition` | `6581-6588`, `6837-6845`, `6399-6402`, `6561-6562` | `lastSaveTime`, `lastPositionUpdatedAt`, `lastX`, `lastY` in ms | Client persistence loop | Periodically saves profile state and last position. | `CONFIRMED_BY_SOURCE` |
| 18 | Network resilience / reload gate / retry backoff | `App.tsx / map reload listener, zone sync retry` | `3424-3429`, `4458-4474`, `4857-4865`, `8538-8546` | `forceReloadAt` in ms; `ZONE_SYNC_RETRY_DELAY_MS` | Server-triggered reload gate plus client retry timers | Reloads the client when the server reload marker changes and retries zone sync with backoff. | `CONFIRMED_BY_SOURCE` |
| 19 | Spatial maintenance / ghost cleanup / collision repair | `App.tsx / detectAndResolveCollisions, cleanupGhostBuildingsForCurrentUser` | `5146-5159`, `16459-16605` | `COLLISION_CHECK_INTERVAL_MS`, `DELETION_PROTECTION_MS`, `MISSING_OWNER_TTL_MS`, `PERSISTENT_ENTITY_GRACE_MS` | Client maintenance loops | Resolves overlapping buildings and removes stale ghost buildings over time. | `CONFIRMED_BY_SOURCE` |

Minor cosmetic delays such as casino spin, permit toast cleanup, and button-press feedback are grouped into the UI section below and are not counted as gameplay families.

### Timers Not Confirmed In Active Source

- `market` expiration: not confirmed. The active code uses transaction-based buy / sell / cancel paths, but no runtime TTL cleanup loop was confirmed.
- dropped-item expiration: not confirmed. The active code shows pickup / delete flows and cleanup logic, but no runtime expiration timer was confirmed.
- weapon-upgrade timer: not confirmed. `data/destructionWeapons.ts` provides destruction options, but no separate upgrade mutation path was found in `App.tsx`.
- resource respawn as an item-expiry path: not confirmed. Tree respawn is confirmed on the server, while oil / quarry / chest use spawn intervals.

## UI-Only Families

| # | Family | Source | Approx. lines | What it does | Confidence |
| --- | --- | --- | --- | --- | --- |
| 1 | ConstructionTimer rerender | `App.tsx / ConstructionTimer` | `2496-2503`, `18360-18548` | Forces the construction countdown component to refresh every second. | `CONFIRMED_BY_SOURCE` |
| 2 | Real-time timer tick | `App.tsx / setTimerTick` | `3236`, `8908-8914` | Refreshes UI timer labels every second. | `CONFIRMED_BY_SOURCE` |
| 3 | Camera throttle | `App.tsx / throttledCameraOffset` | `4329-4334` | Delays camera updates by 80 ms to reduce load. | `CONFIRMED_BY_SOURCE` |
| 4 | Loading progress bar | `App.tsx / loading progress effect` | `17915-17933` | Animates loading progress while data is still arriving. | `CONFIRMED_BY_SOURCE` |
| 5 | Loading readiness gate | `App.tsx / loadTimerDone, loadStartTime` | `17935-17948`, `8439-8456` | Delays the loading-screen exit until critical data is ready or the max wait elapses. | `CONFIRMED_BY_SOURCE` |
| 6 | Zone load ring expansion | `App.tsx / zoneLoadRing` | `4565-4572` | Expands the loaded ring from center to the surrounding zones. | `CONFIRMED_BY_SOURCE` |
| 7 | Zone gate debug heartbeat | `App.tsx / updateDebug` | `4735-4787` | Rebuilds debug snapshots every second while the debug panel is open. | `CONFIRMED_BY_SOURCE` |
| 8 | Fallback redraw heartbeat | `App.tsx / draw fallback` | `12755-12768` | Redraws the scene if `requestAnimationFrame` is throttled or paused. | `CONFIRMED_BY_SOURCE` |
| 9 | Cosmetic feedback timers | `App.tsx / permitPurchaseToastTimerRef`, casino spin, resource-shop press feedback | `14306-14312`, `14386-14387`, `18108-18111`, `18158-18161` | Clears short-lived UI feedback after a short delay. | `CONFIRMED_BY_SOURCE` |

## Time Field Dictionary

| Field or group | Type and unit | Written in | Read in | Fallback or alias | Confidence |
| --- | --- | --- | --- | --- | --- |
| Building lifecycle timestamps | Numeric milliseconds | `App.tsx` construction, production, upgrade, combat, protection flows | `App.tsx`, `src/pocketbase.ts`, `types.ts` | `constructionStartTime` and `workStartTime` are trace-only derived values | `CONFIRMED_BY_SOURCE` |
| `constructionEndTime` | Number, ms | `placeBuildingAtTile`, `handleBuildOilRig`, `handleBuildWildQuarry`, `handleUpgrade`, `handleSpeedUp`, `processOfflineTimers` | `ConstructionTimer`, `processOfflineTimers`, `gameLoop`, `recordBuildingTimerTrace`, `src/pocketbase.ts` payload summaries | `constructionStartTime` inferred in audit traces | `CONFIRMED_BY_SOURCE` |
| `workEndTime` | Number, ms | `handleStartProductionFromWorld`, `handleStartProduction`, `processOfflineTimers`, `manual production loop`, `handleCollectProduction*` clearing paths | `gameLoop`, `processOfflineTimers`, `getPriorityAnimationUrlsForBuilding`, UI collect buttons | `workStartTime` inferred in audit traces | `CONFIRMED_BY_SOURCE` |
| `destructionStartedAt`, `destructionEndTime`, `destructionExpiresAt`, `destructionDurationMs`, `destructionMaxLifetimeMs`, `protectionEndTime` | Numbers, ms | `handleExplode`, `handleApplyProtection`, combat loop, `processOfflineTimers` | `processOfflineTimers`, `gameLoop`, combat traces, UI destruction panel | `getEffectiveDestructionExpiresAt` chooses the earlier of explicit and max-lifetime expiry | `CONFIRMED_BY_SOURCE` |
| `lastAttackTime`, `lastMoveTime` | Numbers, ms | Monster and defense combat / movement loops | Game loop, replay / anti-stale guards, `src/pocketbase.ts` known-field summaries | None confirmed | `CONFIRMED_BY_SOURCE` |
| User and social timestamps | Numbers, ms | Ban, curse, presence, auto-save, chat, profile sync | UI badges, presence state, cleanup effects, `src/pocketbase.ts` adapters | `timestamp` is used as a legacy alias on some records | `CONFIRMED_BY_SOURCE` |
| `banEndTime` | Number, ms | Ban actions in `App.tsx` | `isBanned`, ban-tab forcing, user roster sync | Stored in PocketBase `users.data` | `CONFIRMED_BY_SOURCE` |
| `activeCurse.endTime` | Number, ms | Curse application paths in `App.tsx` | `cleanupExpiredCurses` | Nested inside `activeCurse` object | `CONFIRMED_BY_SOURCE` |
| `lastSeen` | Number, ms | Presence update paths in `App.tsx` | Online status, profile display, presence sync | None confirmed | `CONFIRMED_BY_SOURCE` |
| `lastSaveTime` | Number, ms | `saveUserData`, user creation / restoration | Profile restore and sync paths | None confirmed | `CONFIRMED_BY_SOURCE` |
| `timestamp` | Number, ms | Chat messages, market rows, user records, traces | Sorting, online display, audit helpers | `src/pocketbase.ts` maps PocketBase `created` to `timestamp` when missing | `CONFIRMED_BY_SOURCE` |
| `electionEndTime` | Number, ms | Election write paths in `App.tsx` | Election warning / winner selection loops | None confirmed | `CONFIRMED_BY_SOURCE` |
| `respawnAt`, `createdAt` | Numbers, ms | `pb_hooks/tree_server_utils.js` | Server cron and respawn processing | No client alias confirmed | `CONFIRMED_BY_SOURCE` |
| PocketBase `created`, `updated` | ISO strings | PocketBase system fields | `src/pocketbase.ts / unwrapData` | `created` becomes `timestamp` if that field is missing; `updated` is not used as a timer source in the audited paths | `CONFIRMED_BY_SOURCE` |
| Visual effect timestamps | Numbers, ms | `createVisualEffect` | `isVisualEffectAlive`, render code | `duration` is kept as the original effect duration, while `durationMs` and `maxLifetimeMs` are derived | `CONFIRMED_BY_SOURCE` |

## Source Of Current Time

| Time source | Where it is used | Gameplay or UI | Clock-change risk | Confidence |
| --- | --- | --- | --- | --- |
| `Date.now()` | Construction, production, destruction, respawn, presence, chat cleanup, retries, reward timestamps, trace payloads | Both | High enough to matter if the system clock jumps; no monotonic replacement was confirmed | `CONFIRMED_BY_SOURCE` |
| `currentTime` React state, updated every second | Ban checks and online status display | Both | Inherits local-clock drift through `Date.now()` | `CONFIRMED_BY_SOURCE` |
| `loadStartTime.current` | Loading-screen timing | UI | Local clock only; affects the loading gate, not game state | `CONFIRMED_BY_SOURCE` |
| `record.created` from PocketBase, mapped with `Date.parse` | Legacy timestamp fallback in `src/pocketbase.ts` | Gameplay data normalization | Depends on PocketBase ISO formatting, not the browser clock | `CONFIRMED_BY_SOURCE` |
| `requestAnimationFrame` cadence | Render loop only | UI | Not used as the authoritative completion clock in the audited paths | `CONFIRMED_BY_SOURCE` |

No server-synced monotonic offset was confirmed in the audited paths.

## Offline Catch-Up Audit

`processOfflineTimers` is the central offline reconciliation function. It runs over buildings and checks three lifecycle branches independently:

1. construction completion when `isConstructing` is true and `now >= constructionEndTime`
2. production completion when `workState === 'working'` and `now >= workEndTime`
3. destruction completion when `isDestroying` is true and `now >= getEffectiveDestructionExpiresAt(building)`

Runtime chain:

`snapshot load / game loop`
`-> processOfflineTimers(allBuildings, options)`
`-> construction / work / destruction branches`
`-> updateData / queued writes`
`-> _offlineTimersSynced guard`
`-> later realtime snapshot merge`

Confirmed idempotency / safety details:

- `_offlineTimersSynced` prevents the same building from being written twice during offline reconciliation.
- `canApplyDestructionTimer` lets the caller restrict destruction finalization, for example for monster-owned buildings.
- `updateBuildingDocSafe` skips writes while a building is in the deletion tombstone window.
- `lastServerSyncRef` and `STICKY_INTERACTION_MS` reduce the chance that a stale snapshot overwrites a fresh local completion.

Partially confirmed behavior:

- exact ordering between local offline completion, later realtime snapshots, and the local game loop is not fully proven without runtime logs or tests
- market expiration and dropped-item expiration remain unconfirmed in the active source

## Process Identity Audit

| Process | Primary identity key | Secondary key / guard | Notes |
| --- | --- | --- | --- |
| Construction | `building.id` and `gameId` | `clientBuildTraceId`, temp optimistic id | Optimistic create uses a temp id before the server returns the final doc id. |
| Production | `building.id` | `workEndTime`, `lastInteractionRef`, `selectedBuilding` | Same building can be started and collected through two entry points, but the record id remains the stable identity. |
| Upgrade | `building.id` | `upgradeStartedAt`, `constructionEndTime` | Upgrade reuses construction semantics instead of introducing a separate upgrade record type. |
| Destruction | `building.id` | `initiatorId`, `destructionStartedAt`, `destructionEndTime` | The destruction window is the real process identity, not just `hp`. |
| Monster attack | `monster.id` / `building.id` | `lastAttackTime`, `hostId` | The same record can be host-managed or owner-managed, so host id matters. |
| Tree respawn | respawn job id | `sectorId`, `respawnAt` | Server cron uses a respawn job record rather than the tree record alone. |
| Presence | `user.uid` | `lastSeen`, `activeTab` | Presence is tied to the auth uid. |
| Chat cleanup | message id / `timestamp` | `type === 'system'` | Only system messages are eligible for cleanup in the audited path. |

Likely confusion points:

- shared `selectedBuilding` state can point at an old record if the UI keeps a stale reference
- array reordering is not a stable process identity by itself
- sanitized ids are used in PocketBase adapter paths, but the game still relies on the logical `building.id`
- several maintenance paths use the same `Date.now()` source, so the identity must come from the process key, not from the timestamp alone

## Completion And Reward Idempotency

| Guard | Where it appears | What it prevents | Confidence |
| --- | --- | --- | --- |
| `_offlineTimersSynced` | `processOfflineTimers` | Duplicate offline completion writes | `CONFIRMED_BY_SOURCE` |
| `speedUpInFlightRef` | `handleSpeedUp` | Double speed-up clicks on the same building | `CONFIRMED_BY_SOURCE` |
| `inFlightDeleteRequests` | `src/pocketbase.ts` | Duplicate delete requests for the same record | `CONFIRMED_BY_SOURCE` |
| `deletedRecordKeys` / `deadBuildingIds` / `deadResourceIds` / `deadDroppedItemIds` | `src/pocketbase.ts` | Repeated 404 retries and resurrection of deleted records | `CONFIRMED_BY_SOURCE` |
| `lastServerSyncRef` + `SERVER_FRESHNESS_MS` | `App.tsx / game loop` | Stale snapshot completion after a long reconnect | `CONFIRMED_BY_SOURCE` |
| `lastInteractionRef` + `STICKY_INTERACTION_MS` | `App.tsx / local optimistic flow` | Early snapshot overwrite of a recently started local action | `CONFIRMED_BY_SOURCE` |
| `monsterWriteCooldownRef` | `App.tsx / monster loop` | Burst writes from the same monster in one tick window | `CONFIRMED_BY_SOURCE` |
| `deletingBuildingsRef` + `confirmedDeletedRef` | `App.tsx / deletion safety` | Resurrection of a recently deleted building | `CONFIRMED_BY_SOURCE` |
| `zoneSyncRetryCountsRef` + `zoneSyncRetryTimeoutsRef` | `App.tsx / zone sync retry` | Retry storms | `CONFIRMED_BY_SOURCE` |

Exact-once reward delivery is only partially confirmed in the audited source. The current code uses clear state transitions and write guards, but no end-to-end runtime proof was found for every possible retry / reload / reconnect sequence.

## Parallel Process Matrix

| Process A | Process B | Same building can overlap? | Shared state / ref | Shared server fields | Risk | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| Construction | Production | No, the audited start path blocks production while a building is constructing | `placedBuildingsRef`, `selectedBuilding` | `isConstructing`, `workState`, `constructionEndTime`, `workEndTime` | Stale UI reference if the selected building changes between clicks | `CONFIRMED_BY_SOURCE` |
| Construction | Upgrade | No, upgrade is implemented as a construction phase and the button is disabled while constructing | `selectedBuilding`, `lastInteractionRef` | `buildingId`, `isConstructing`, `constructionEndTime` | No dedicated upgrade-only state machine was confirmed | `CONFIRMED_BY_SOURCE` |
| Production | Weapon upgrade | Unknown | None confirmed | None confirmed | There is no separate weapon-upgrade mutation path in the audited source | `UNCONFIRMED` |
| Production in building A | Production in building B | Yes | `placedBuildingsRef` only as a shared container | Separate record ids | Independent records, but the same timer loop can process both in one pass | `CONFIRMED_BY_SOURCE` |
| Upgrade in building A | Upgrade in building B | Yes | `speedUpInFlightRef` is keyed by building id | Separate record ids | Independent records, but the in-flight guard is per building | `CONFIRMED_BY_SOURCE` |
| Destruction | Production | Not fully proven | `processOfflineTimers`, `gameLoop`, `lastInteractionRef` | `workState`, `workEndTime`, destruction fields | Production start does not explicitly prove an `isDestroying` guard in the inspected path | `PARTIALLY_CONFIRMED` |
| Monster attack | Destruction | Yes | `monsterAttackTimeRef`, `monsterLastActionRef` | `lastAttackTime`, destruction fields | Both systems write to the same building record but through separate branches | `CONFIRMED_BY_SOURCE` |
| Offline catch-up | Realtime snapshot | Can overlap | `lastServerSyncRef`, `_offlineTimersSynced`, tombstone caches | Construction / work / destruction fields | Snapshot order after reconnect is not fully proven without runtime logs | `PARTIALLY_CONFIRMED` |
| Speed-up | Natural completion | The same building can experience both, but the guard should keep only one write path active | `speedUpInFlightRef`, `lastInteractionRef` | `constructionEndTime`, `isConstructing` | The not-found rollback is confirmed; all other failure paths are not fully proven | `PARTIALLY_CONFIRMED` |
| Reload | Completion | Yes | `lastServerSyncRef`, `DELETION_PROTECTION_MS` | All timer fields | Reload / reconnect ordering is mitigated, but not fully runtime-proven | `PARTIALLY_CONFIRMED` |

## Known Symptom Trace

Observed symptom to keep tracking:

> A longer process can appear to finish before a shorter weapon upgrade.

Current status: `UNCONFIRMED`

What the current source confirms:

- building upgrades are implemented as construction-phase work on the existing building record
- `handleUpgrade` uses `newBuildingInfo.stats.constructionTimeSeconds`
- production completion is driven by `workEndTime`
- the construction countdown shown in the UI is local and uses `Date.now()`
- `data/destructionWeapons.ts` provides destruction options, but no separate weapon-upgrade mutation path was confirmed

What is still missing:

- a direct runtime proof that the observed symptom involves weapon upgrading rather than building upgrading
- a full runtime proof that a seconds / milliseconds mismatch exists in the affected path
- a direct proof that the wrong process id is being reused

## Preliminary Timer Invariant Status

| Invariant | Status | Why |
| --- | --- | --- |
| Canonical end timestamp per process | `CONFIRMED` | Construction, production, destruction, and respawn all have explicit end fields in the current source. |
| Earlier end completes first | `PARTIALLY_CONFIRMED` | Each process uses its own end timestamp, but cross-process ordering is not fully proven. |
| Reload persistence | `CONFIRMED` | `forceReloadAt` and `lastForceReloadAt` are read and compared before reload. |
| Background persistence | `CONFIRMED` | Auto-save and last-position persistence are both time-driven. |
| Local countdown UI-only | `CONFIRMED` | Construction timer, loading bar, zone debug, and similar timers are purely visual. |
| Exactly-once reward | `PARTIALLY_CONFIRMED` | Guards exist, but every retry / reconnect edge case is not fully proven. |
| Duplicate realtime safety | `PARTIALLY_CONFIRMED` | Tombstones and freshness guards are present, but full runtime proof is still missing. |
| Process isolation | `PARTIALLY_CONFIRMED` | Most processes use separate ids or separate loops, but some share the same building record. |
| No shared unsafe timer | `UNCONFIRMED` | Several independent flows still rely on the same local clock source. |
| Server authority where it matters | `PARTIALLY_CONFIRMED` | Tree respawn and PocketBase writes are server-side, but many gameplay timers still start client-side. |
| Explicit time units | `CONFIRMED` | The audited paths show explicit ms conversions and `* 1000` conversions from seconds. |
| Offline catch-up once | `PARTIALLY_CONFIRMED` | `_offlineTimersSynced` is present, but a full reconnect proof is still missing. |
| Idempotent completion | `PARTIALLY_CONFIRMED` | Several completion paths are guarded, but not every failure / retry edge case is fully proven. |

## Summary Notes

- The active source contains confirmed timers for construction, production, destruction, combat, respawn, presence, cleanup, retries, and several UI-only flows.
- The active source does not confirm market expiration or dropped-item expiration timers.
- The active source does not confirm a standalone weapon-upgrade runtime path.
- The main runtime clock is `Date.now()`; no monotonic offset source was confirmed in the audited paths.
