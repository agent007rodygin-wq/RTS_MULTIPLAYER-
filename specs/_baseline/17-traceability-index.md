# 17. Traceability Index

## Legend

- `CONFIRMED_BY_SOURCE` - the relationship is directly visible in the current source code.
- `INFERRED_BY_GRAPH` - Graphify suggests the relationship, but source verification is still pending.
- `UNCONFIRMED` - there is not enough evidence yet for a factual statement.

## Source-Backed Index

| Area | File / symbol | Approx. lines | Status | Caller / entry point | Reads | Writes | Effects / network |
| --- | --- | --- | --- | --- | --- | --- | --- |
| App shell / orchestration | `App.tsx` / `const App` | `2875-23138` | `CONFIRMED_BY_SOURCE` | React runtime mount | auth state, refs, derived world data, UI state | local state, refs, queued writes, canvas output | Owns the main gameplay shell and all React effects |
| Global reload listener | `App.tsx` / `useEffect` | `4450-4477` | `CONFIRMED_BY_SOURCE` | Auth-ready effect | `map_state/status.forceReloadAt`, `lastForceReloadAt.current` | `lastForceReloadAt.current` | `onSnapshot(doc(db, 'map_state', 'status'))`, `window.location.reload()` |
| Map generation sync | `App.tsx` / `useEffect` | `4480-4509` | `CONFIRMED_BY_SOURCE` | Auth-ready effect | `map_state/status`, `buildings` collection snapshot | generated buildings/resources, `map_state/status` | `getDoc`, `getDocs`, `setDoc` |
| Zone-scoped resource sync | `App.tsx` / `useEffect` | `4794-4805` | `CONFIRMED_BY_SOURCE` | Zone change effect | `currentZones`, resource snapshots | `mapResources` state | `onSnapshot(query(collection(db, 'map_resources'), where('zoneId', 'in', currentZones)))` |
| Zone / collision loading | `App.tsx` / helper effects | `4850-4900`, `4967-5138` | `CONFIRMED_BY_SOURCE` | Zone refresh and validation passes | resources, buildings, occupied coordinates | local occupancy maps, collision fixes | `getDocs`, state refresh, validation logs |
| Tree click and server hit | `App.tsx` / click handler | `5411-5545` | `CONFIRMED_BY_SOURCE` | Canvas click handler | clicked resource, player energy, `resourceId` | local selection state, reward state, follow-up local updates | `requestTreeHit(resourceId)`, audio, conditional local apply |
| Local resource finalization | `App.tsx` / resource update branch | `5570-5592` | `CONFIRMED_BY_SOURCE` | Result path after tree/resource interaction | `resource.hp`, `TREE_HP` | `mapResources` local state | `deleteDoc` or `updateDoc` against `map_resources` |
| Building placement / persistence | `App.tsx` / placement flow | `5850-6180` | `CONFIRMED_BY_SOURCE` | Placement confirmation and click handlers | inventory, tile occupancy, requirements | building placement state, persisted docs | `setDoc`, `updateDoc`, `deleteDoc` |
| Offline timer reconciliation | `App.tsx` / `processOfflineTimers` | `627-860+` | `CONFIRMED_BY_SOURCE` | `gameLoop` and sync passes | buildings, resources, world-wrap state, `buildingData`, current time | updated buildings array, timer update payloads | timer traces, queued `updateDoc` writes |
| Auth bootstrap / profile save | `App.tsx` / auth and save effects | `6296-6795` | `CONFIRMED_BY_SOURCE` | Login / restore flow | auth state, cached profile data, form values | local user/profile state, cache writes | `getDoc`, `setDoc`, `updateDoc` |
| User sync and leaderboard | `App.tsx` / sync effects | `6848-7708` | `CONFIRMED_BY_SOURCE` | Auth-ready sync chain | `users`, `leaderboard_profiles`, cached stats | `allUsers`, leaderboard state, recovery refs | `onSnapshot`, `getDocs`, `setDoc` |
| Presence and online users | `App.tsx` / presence effect | `7755-7840` | `CONFIRMED_BY_SOURCE` | Auth-ready sync chain | `presence` snapshot, clan membership data | online-user state, presence patches | realtime snapshot processing |
| Chat, clans, market, elections | `App.tsx` / social-system effects | `7340-8878` | `CONFIRMED_BY_SOURCE` | Phase-based loading and tab effects | `clans`, `market`, `elections` collections | social state, settings, UI tabs | `getDocs`, `onSnapshot`, `setDoc`, `updateDoc` |
| Private messages | `App.tsx` / `useEffect` | `9347-9365` | `CONFIRMED_BY_SOURCE` | Private chat subscription | private-message snapshots | private chat state | realtime subscription |
| Canvas drawing | `App.tsx` / `draw` | `9764-11463` | `CONFIRMED_BY_SOURCE` | `drawRef` and game loop render pass | canvas context, zoom, camera, images, world entities | canvas pixels only | rendering, no direct network side effect |
| Main game loop | `App.tsx` / `useEffect` + `gameLoop` | `11469-12752` | `CONFIRMED_BY_SOURCE` | `requestAnimationFrame` loop | refs, timers, entity lists, interaction guards | refs, queued writes, reconciliation state | frame loop, `requestAnimationFrame`, server writes, cleanup |
| PocketBase client bootstrap | `src/pocketbase.ts` / module init | `1-19` | `CONFIRMED_BY_SOURCE` | Module import time | env vars, `pb.baseUrl` | runtime audit flags | creates PocketBase client, disables auto-cancellation |
| Request queue helpers | `src/pocketbase.ts` / `queuedGetFullList`, `queuedGetOne`, `queuedGetList` | `161-178` | `CONFIRMED_BY_SOURCE` | `getDoc`, `getDocs`, `setDoc`, `updateDoc` | collection names, options | queue state and serialized request execution | request throttling / serialization |
| `setDoc` write path | `src/pocketbase.ts` / `setDoc` | `1037-1185` | `CONFIRMED_BY_SOURCE` | `App.tsx` and other callers | current record, raw data, level checks | merged payload, auth cleanup on stale tokens | create/update requests via PocketBase |
| `updateDoc` write path | `src/pocketbase.ts` / `updateDoc` | `1204-1450` | `CONFIRMED_BY_SOURCE` | `App.tsx` and other callers | current record, existing fields, deleted-record caches | merged partial payload, dead-record caches | partial update requests via PocketBase |
| Realtime wrapper | `src/pocketbase.ts` / `onSnapshot` | `1853-2219+` | `CONFIRMED_BY_SOURCE` | `App.tsx` and other callers | query descriptor, auth/realtime state, previous docs | snapshot objects and retry state | `pb.collection(...).subscribe(...)`, initial fetch, throttled refetch |
| Tree-hit server endpoint | `src/pocketbase.ts` / `requestTreeHit` | `2392-2418` | `CONFIRMED_BY_SOURCE` | Tree click handler in `App.tsx` | auth token, `resourceId` | no local state writes, returns payload or throws | `fetch POST /api/basingse/tree-hit` |

## Graph-Only Follow-Ups

These links came from Graphify and still need source verification before they can be used as architecture facts:

| Link | Status | Why it stays inferred |
| --- | --- | --- |
| `App()` -> `createVisualEffect()` | `INFERRED_BY_GRAPH` | Graphify reported an inferred edge, but the source still needs a direct call-site check |
| `App()` -> `getPriorityAnimationUrlsForBuilding()` | `INFERRED_BY_GRAPH` | Graphify reported an inferred edge, but source verification is still required |
| `App()` -> `src/pocketbase` snapshot helpers | `INFERRED_BY_GRAPH` | Graphify sees the dataflow, but execution order and call path still need source-level confirmation |
| `pb_hooks/tree_server_utils.js` -> `processTreeHit()` / `processDueTreeRespawns()` | `INFERRED_BY_GRAPH` | Backend hook participation is visible in the graph, but the hook source was not audited in this stage |
| `src/pocketbase.ts` transaction helpers -> ref/data helpers | `INFERRED_BY_GRAPH` | The graph suggests helper coupling, but source proof is still needed for the exact chain |

## Unconfirmed Runtime Questions

The current baseline does not yet prove:

- exact ordering between optimistic local writes and later realtime snapshots
- whether every stale-state guard covers all edge cases
- whether every timer completion or rollback path is race-safe
- whether every legacy backup file is truly excluded from the active build
- whether the backend hook cluster behaves exactly as Graphify suggests

## Notes For The Next Stage

This index is sufficient to choose the next direct-reading targets, but it is not sufficient to replace the next source audit. The most important verified anchor points are:

- `App.tsx` as the runtime monolith
- `src/pocketbase.ts` as the data/realtime layer
- the tree-hit path
- offline timer reconciliation
- zone-scoped loading and realtime sync

## 2B PocketBase Traceability Addendum

This addendum ties the source-backed index to the 2B baseline documents:

- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/09-realtime-sync.md`

The rows below stay within the current source audit boundary. Rows marked `PARTIALLY_CONFIRMED` intentionally stop short of runtime-order proof.

| System | Source-backed path | PocketBase surface | Sync shape | Baseline doc anchor | Confidence |
| --- | --- | --- | --- | --- | --- |
| Map reload gate | `App.tsx:4450-4477` | `map_state/status` | single-doc realtime reload | `04`, `09` | CONFIRMED_BY_SOURCE |
| Map generation bootstrap | `App.tsx:4480-4509` | `map_state/status`, `buildings`, `map_resources` | mixed read/write bootstrap | `04`, `09` | CONFIRMED_BY_SOURCE |
| Zone resources | `App.tsx:4794-4805` | `map_resources` | zone-scoped realtime | `04`, `09` | CONFIRMED_BY_SOURCE |
| Dropped items | `App.tsx:4880-4897` | `dropped_items` | zone-scoped realtime | `04`, `09` | CONFIRMED_BY_SOURCE |
| Tree interaction | `App.tsx:5411-5592`, `src/pocketbase.ts:2392-2418` | `/api/basingse/tree-hit`, `map_resources` | local action plus server-side POST | `04`, `09` | CONFIRMED_BY_SOURCE |
| Current-user state | `App.tsx:7247-7311` | `users/<uid>`, `users` | doc sync plus broader user state | `04`, `09` | CONFIRMED_BY_SOURCE |
| User roster and leaderboard | `App.tsx:6848-7708` | `users`, `leaderboard_profiles` | realtime roster and materialized leaderboard | `04`, `09` | CONFIRMED_BY_SOURCE |
| Presence | `App.tsx:7501-7840` | `presence` | realtime presence feed | `04`, `09` | CONFIRMED_BY_SOURCE |
| Buildings owner snapshot | `App.tsx:8389-8468` | `buildings` | owner-scoped realtime | `04`, `09` | CONFIRMED_BY_SOURCE |
| Buildings zone snapshot | `App.tsx:8470-8560` | `buildings` | zone-scoped realtime | `04`, `09` | CONFIRMED_BY_SOURCE |
| Elections | `App.tsx:8599-8642` | `elections/police`, `elections/royal` | two single-doc subscriptions | `04`, `09` | CONFIRMED_BY_SOURCE |
| Chat and private messages | `App.tsx:7340-7496`, `App.tsx:9347-9365` | `chat_messages`, `private_messages` | live social feeds | `04`, `09` | CONFIRMED_BY_SOURCE |
| Offline timer reconciliation | `App.tsx:627-860`, `App.tsx:11469-12752` | `buildings` timer fields | local catch-up plus later writes | `04`, `09` | PARTIALLY_CONFIRMED |
| Query queue and timeout layer | `src/pocketbase.ts:161-193`, `src/pocketbase.ts:1669-1809`, `src/pocketbase.ts:1853-2227` | all active read paths | queued reads, timeout, refetch, realtime | `04`, `09` | CONFIRMED_BY_SOURCE |
| Load-on-demand social data | `App.tsx:7340-8878` | `clans`, `market` | reads without dedicated long-lived subscription | `04` | CONFIRMED_BY_SOURCE |

## 2B Addendum Notes

- Confirmed source-backed rows added in this stage: 15
- Rows that remain partially confirmed until the timer/runtime stage: 1
- The active baseline now has direct traceability for the main realtime surfaces, the PocketBase adapter, and the server-side tree-hit boundary.

## 2C Timers / Construction / Production / Upgrade Addendum

This addendum ties the source-backed index to the 2C baseline documents:

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/08-upgrade-system.md`

The rows below stay within the current source audit boundary. Rows marked `PARTIALLY_CONFIRMED` intentionally stop short of full runtime-order proof.

| System | Source-backed path | Baseline doc anchor | Confidence | Notes |
| --- | --- | --- | --- | --- |
| UI construction countdowns | `App.tsx:2496-2520`, `App.tsx:2909-3027` | `05`, `06`, `08` | `CONFIRMED_BY_SOURCE` | Client-side countdown rendering and timer ticks |
| Construction placement and upgrade | `App.tsx:5862-6180`, `App.tsx:14461-14610`, `App.tsx:627-860` | `05`, `06`, `08` | `CONFIRMED_BY_SOURCE` | Shared `isConstructing` / `constructionEndTime` lifecycle |
| Special resource construction | `App.tsx:14068-14184` | `05`, `06` | `CONFIRMED_BY_SOURCE` | Oil rig and quarry creation with rollback on create failure |
| Production start, collection, and completion | `App.tsx:14618-15590`, `App.tsx:15252-15280`, `App.tsx:627-860` | `05`, `07` | `CONFIRMED_BY_SOURCE` | Start, collect, and offline catch-up for working buildings |
| Destruction and combat timers | `App.tsx:15944-16040`, `App.tsx:627-860` | `05` | `CONFIRMED_BY_SOURCE` | Destruction windows, pending damage, and offline completion |
| Speed-up safety guard | `App.tsx:16123-16185` | `05`, `08` | `CONFIRMED_BY_SOURCE` | Duplicate-click protection and not-found rollback |
| Timer-backed maintenance loops | `App.tsx:13690-13726`, `App.tsx:7318-7470`, `App.tsx:7470-7496`, `App.tsx:7531-7840`, `App.tsx:8719-8837` | `05` | `CONFIRMED_BY_SOURCE` | Spawns, cleanup loops, presence heartbeat, warnings |
| PocketBase timer field persistence | `src/pocketbase.ts:409-556`, `src/pocketbase.ts:1853-2227` | `04`, `09` | `CONFIRMED_BY_SOURCE` | Timer fields are preserved, normalized, and synced through realtime wrappers |
| Server-side tree respawn | `pb_hooks/main.pb.js:55-58`, `pb_hooks/tree_server_utils.js:369-680` | `05` | `CONFIRMED_BY_SOURCE` | Cron-driven respawn boundary on the backend |
| Offline timer reconciliation | `App.tsx:627-860`, `App.tsx:11469-12752` | `05`, `07`, `08` | `PARTIALLY_CONFIRMED` | Local catch-up is confirmed; exact cross-snapshot ordering remains runtime-sensitive |
| Weapon upgrade path | Not located in the audited current source | `08` | `UNCONFIRMED` | No dedicated handler was confirmed in the active source snapshot |

## 2C Addendum Notes

- Confirmed source-backed rows added in this stage: 10
- Rows that remain partially confirmed until additional runtime proof: 1
- The active baseline now links the timer, construction, production, destruction, and upgrade surfaces to the runtime monolith and the PocketBase adapter without claiming more than the source can prove.

## 2D State Ownership / Optimistic UI / Error Handling Addendum

This addendum ties the source-backed index to the 2D baseline documents:

- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`

The rows below stay within the current source audit boundary. Rows marked `PARTIALLY_CONFIRMED` intentionally stop short of full runtime-order proof.

| Area | Source-backed path | Baseline doc anchor | Confidence | Notes |
| --- | --- | --- | --- | --- |
| Loading gate and splash screen | `App.tsx:3109-3111, 8442-8451, 17912-17941`; `LoadingScreen.tsx:46-47` | `03`, `10`, `11` | `CONFIRMED_BY_SOURCE` | `forceReloadAt` is only a reload gate; the splash screen exit is governed by `loadingReady && user`. |
| Persistent profile and resource mirrors | `App.tsx:6367-7051, 6590-6802` | `03`, `10`, `11` | `CONFIRMED_BY_SOURCE` | `updatePlayerResources()` and `persistLastPlayerPosition()` own the client/server mirror boundary. |
| Building ownership and optimistic reconciliation | `App.tsx:5862-6234, 7954-8560` | `03`, `10`, `11` | `PARTIALLY_CONFIRMED` | Mixes optimistic writes, tombstones, zone merges, and offline timer catch-up. |
| Construction, production, upgrade, protection, destruction | `App.tsx:14461-16189, 5862-6234, 627-860` | `05`, `06`, `07`, `08`, `10`, `11` | `CONFIRMED_BY_SOURCE` | Core local-first gameplay flows with timer-backed persistence. |
| Move, repair, bank withdrawal, active toggle | `App.tsx:5246-5285, 15603-16456` | `10`, `11` | `CONFIRMED_BY_SOURCE` | Local-first state changes with mixed rollback completeness. |
| Map resources, dropped items, tree-hit boundary | `App.tsx:4794-5592, 12822-14186`; `src/pocketbase.ts:2392-2418` | `03`, `04`, `09`, `10`, `11` | `CONFIRMED_BY_SOURCE` | World-state ownership plus the server-side tree-hit endpoint. |
| Chat, private messages, presence, leaderboard mirrors | `App.tsx:6848-7840, 7340-16783` | `03`, `04`, `09`, `11` | `CONFIRMED_BY_SOURCE` | Mixed realtime and best-effort sync; not all of it is classic optimistic UI. |
| Clans and social state | `App.tsx:7350-7353, 17111-17252`; `types.ts:189-200` | `03`, `10`, `11` | `PARTIALLY_CONFIRMED` | Some membership changes are local-first, while settings/member-permission writes are server-first or transactional; the clan settings shape is now explicit in `types.ts`. |
| Realtime retry / fail-open / cleanup | `src/pocketbase.ts:80-99, 1863-1928, 2325-2354`; `App.tsx:7318-7564, 8526-8560, 8637` | `04`, `09`, `11` | `CONFIRMED_BY_SOURCE` | Retry backoff, fail-open zone sync, and silent cleanup paths are all active. |
| Error and recovery gaps | `App.tsx:2976-2991, 1012-1070, 6949-7051` | `11` | `UNCONFIRMED` | Window error hooks only log, and JSON parse / invalid timestamp / raw 409 behavior is still not fully proven. |

## 2D Addendum Notes

- Confirmed source-backed rows added in this stage: 10
- Rows that remain partially confirmed until further runtime proof: 2
- The baseline now has direct traceability for state ownership, optimistic UI, and error recovery without reusing Graphify as proof.

## 2E Invariants / Risk / Target Architecture Addendum

This addendum links the highest-priority 2E invariants and risks to the target architecture and to the newly added risk register.

| Risk / invariant anchor | Affected system | Source evidence | Current baseline docs | Target module | Required ADR | Future test | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `INV-TIME-05` / `RISK-TIME-01` / `RISK-CLOCK-01` | `domain/processes` | `App.tsx:4450-4477, 627-860, 7954-8560, 14461-16189`; `src/pocketbase.ts:832-1460`; `types.ts:122-163` | `05`, `09`, `12`, `15`, `16` | `domain/processes` | `Canonical process time source` | Reload persistence plus clock-skew roundtrip | HIGH |
| `INV-TIME-08` / `INV-TIME-09` / `RISK-REWARD-01` / `RISK-OFFLINE-01` | `domain/processes`, `domain/production` | `App.tsx:627-860, 14618-16189, 7954-8560` | `05`, `07`, `08`, `10`, `12`, `15`, `16` | `domain/processes` | `Completion authority` | Duplicate-completion replay with offline catch-up | MEDIUM-HIGH |
| `INV-OPT-01` / `RISK-RESOURCE-01` / `RISK-PWRITE-01` | `domain/economy`, `domain/buildings`, `services/pocketbase` | `App.tsx:5246-5285, 5862-6234, 14068-16189`; `src/pocketbase.ts:1037-1460` | `10`, `11`, `12`, `15`, `16` | `commandService` and `services/pocketbase` | `Optimistic command contract` and `Rollback contract` | Rollback matrix plus atomicity smoke test | HIGH |
| `INV-STATE-05` / `INV-STATE-06` / `RISK-SNAPSHOT-01` / `RISK-DELETE-01` | `realtimeSyncService`, `domain/world`, `domain/buildings` | `App.tsx:7954-8560, 5300-5592, 15810-16520`; `src/pocketbase.ts:1853-2219, 1213-1496` | `03`, `04`, `09`, `10`, `11`, `12`, `15`, `16` | `realtimeSyncService` | `Realtime merge policy` | Out-of-order snapshot plus resurrection suppression | HIGH |
| `INV-RT-03` / `INV-RT-04` / `RISK-RESPONSE-01` / `RISK-RT-01` / `RISK-PB-01` | `services/pocketbase` | `src/pocketbase.ts:161-193, 953-1028, 1853-2219, 2325-2354` | `04`, `09`, `11`, `12`, `15`, `16` | `services/pocketbase` | `PocketBase adapter boundary` and `Error classification` | Late response and timeout replay | HIGH |
| `INV-OPT-03` / `INV-OPT-04` / `INV-OPT-05` / `INV-OPT-08` / `RISK-ROLLBACK-01` / `RISK-DWRITE-01` | `commandService`, `domain/social`, `domain/buildings` | `App.tsx:5246-5285, 5862-6234, 13777-17252` | `10`, `11`, `12`, `15`, `16` | `commandService` | `Rollback contract` | Duplicate-submit matrix with explicit rollback classification | HIGH |
| `INV-GAME-03` / `RISK-LOAD-01` / `RISK-MONO-01` | `app/bootstrap` | `App.tsx:2875-3446, 4450-4477, 17912-17941`; `LoadingScreen.tsx:46-47` | `01`, `03`, `10`, `11`, `12`, `15`, `16` | `app/bootstrap` | `Startup readiness gate` | Bootstrap hang and delayed-auth gate | HIGH |
| `INV-STATE-01` / `INV-STATE-03` / `RISK-MULTI-01` | `domain/world`, `domain/social`, `domain/economy` | `App.tsx:6367-8560, 6848-7840, 7340-7498, 7954-8560` | `03`, `04`, `09`, `10`, `12`, `15`, `16` | `domain/world` and `domain/social` | `State ownership matrix` | Owner-map assertion per slice | HIGH |
| `INV-PB-01` / `INV-PB-02` / `INV-PB-03` / `RISK-CACHE-01` / `RISK-LEGACY-01` | `services/pocketbase` | `src/pocketbase.ts:832-1460, 1853-2354` | `04`, `11`, `12`, `15`, `16` | `services/pocketbase` | `Legacy compatibility policy` | Older-record roundtrip plus cache-eviction test | HIGH |
| `INV-GAME-02` / `INV-TIME-08` / `RISK-COMBAT-01` | `domain/combat` | `App.tsx:11469-12752, 15944-16189` | `05`, `11`, `12`, `15`, `16` | `domain/combat` | `Combat transition ordering` | Concurrent attack and destruction race | MEDIUM-HIGH |
| `INV-PB-04` / `RISK-SCHEMA-01` / `RISK-HOOK-01` | `services/pocketbase`, `pb_hooks` | `src/pocketbase.ts:2392-2418, 1853-2354`; `pb_hooks/main.pb.js:3-55`; `pb_hooks/tree_server_utils.js:6-700` | `04`, `05`, `12`, `15`, `16` | `services/pocketbase` plus backend hook boundary | `PocketBase schema contract` and `Backend hook contract` | Schema snapshot diff plus hook smoke test | MEDIUM-HIGH |
| `INV-PB-05` / `RISK-GIT-01` / `RISK-TEST-01` | `tooling/verification` | `filesystem timestamps, source diff checks, and current shell verification from this stage` | `12`, `15`, `16`, `17` | `tooling/verification` | `Verification workflow` | Reproducible Git status plus invariant coverage review | MEDIUM |

## 2F Migration / Test Traceability Addendum

This addendum maps the migration roadmap and test strategy to the current baseline, with the carried-forward corrections from 2F treated as prerequisites for later cleanup.

| Migration phase | Risks | Invariants | Source baseline | Tests | Acceptance gate | Future feature-spec | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `1. Verification and repository health` | `RISK-GIT-01`, `RISK-TEST-01`, `RISK-LOAD-01` | `INV-GAME-03`, `INV-PB-03`, `INV-PB-05` | `12`, `15`, `16`, `17`; `package.json`; `tsconfig.json`; `graphify-out/GRAPH_REPORT.md`; `SDD_BASELINE_GRAPHIFY.md` | Repo-health checks, build, typecheck, schema snapshot, startup smoke | Baseline reviewed, Git root healthy, build green | `verification-workflow-and-repository-health` | HIGH |
| `2. Characterization test foundation` | `RISK-TIME-01`, `RISK-REWARD-01`, `RISK-SNAPSHOT-01`, `RISK-RESPONSE-01` | `INV-TIME-04`, `INV-TIME-07`, `INV-TIME-08`, `INV-TIME-09`, `INV-OPT-04`, `INV-RT-03`, `INV-RT-05` | `12`, `13`, `14`, `15`, `16`, `17`; `App.test*.tsx`; `test_*.mjs`; `test_*.js` | Timer/process characterization, optimistic rollback matrix, realtime replay | Test runner available, characterization coverage for target subsystem | `characterization-tests-and-time-contracts` | HIGH |
| `3-6. Time/process contracts, pure helpers, and explicit types` | `RISK-TIME-01`, `RISK-REWARD-01`, `RISK-OFFLINE-01`, `RISK-CLOCK-01`, `RISK-DATA-01` | `INV-TIME-01` to `INV-TIME-10`, `INV-PB-01`, `INV-PB-02`, `INV-STATE-01`, `INV-STATE-03` | `05`, `06`, `07`, `08`, `10`, `11`, `12`, `15`, `16` | Timer roundtrip, clock-skew, merge policy, typecheck, pure helper unit checks | Characterization coverage, rollback tested, no schema diff | `time-process-and-contract-extraction` | HIGH |
| `7-9. PocketBase adapter, error policy, optimistic contracts` | `RISK-PB-01`, `RISK-RESPONSE-01`, `RISK-DWRITE-01`, `RISK-PWRITE-01`, `RISK-CACHE-01`, `RISK-LEGACY-01`, `RISK-SCHEMA-01`, `RISK-HOOK-01` | `INV-PB-01` to `INV-PB-05`, `INV-RT-01` to `INV-RT-07`, `INV-OPT-01` to `INV-OPT-08` | `04`, `09`, `10`, `11`, `12`, `15`, `16` | Adapter contract tests, schema snapshot, backend smoke, rollback matrix | No schema diff, rollback tested, legacy fixture green | `pocketbase-contracts-and-error-policy` | HIGH |
| `10-12. Building, production, and upgrade extraction` | `RISK-RESOURCE-01`, `RISK-TIME-01`, `RISK-REWARD-01`, `RISK-ROLLBACK-01` | `INV-TIME-02`, `INV-TIME-03`, `INV-TIME-05`, `INV-TIME-08`, `INV-TIME-09`, `INV-OPT-02`, `INV-OPT-05`, `INV-GAME-01` | `05`, `06`, `07`, `08`, `10`, `11`, `12`, `15`, `16` | Building rollback, production reload, upgrade/speed-up, duplicate-reward tests | Build green, rollback tested, no balance/config changes | `building-production-upgrade-extraction` | HIGH |
| `13-16. Realtime, combat, world, and social extraction` | `RISK-SNAPSHOT-01`, `RISK-DELETE-01`, `RISK-COMBAT-01`, `RISK-MULTI-01`, `RISK-LEGACY-01` | `INV-STATE-01`, `INV-STATE-03`, `INV-STATE-05`, `INV-STATE-06`, `INV-RT-01` to `INV-RT-07`, `INV-GAME-02` | `03`, `04`, `09`, `10`, `11`, `12`, `15`, `16` | Realtime replay, concurrent attack/destruction, world/resource smoke, social rollback, multiplayer smoke | Realtime tests green, multiplayer smoke passed, no schema diff | `realtime-combat-world-social-extraction` | HIGH |
| `17-18. App shell reduction and final compatibility audit` | `RISK-MONO-01`, `RISK-GIT-01`, `RISK-TEST-01`, `RISK-SCHEMA-01` | `INV-GAME-03`, `INV-PB-03`, `INV-PB-05` | `01`, `03`, `10`, `11`, `12`, `15`, `16`, `17` | Shell smoke, build, legacy fixture, schema snapshot, Git status/diff | Build green, baseline reviewed, legacy fixture green, multiplayer smoke passed | `app-shell-reduction-and-regression-audit` | HIGH |

### 2F carried-forward prerequisites

- `INV-TIME-04` stays `PARTIALLY_CONFIRMED` until a cross-process runtime test exists;
- `INV-TIME-07` stays `PARTIALLY_CONFIRMED` until repeated reload/reconnect coverage exists;
- `forceReloadAt` is a reload gate only and not proof of persistence;
- exact-once reward stays `PARTIALLY_CONFIRMED`;
- the weapon-upgrade runtime path stays `UNCONFIRMED`.
- `verify_repository_health.ps1` now resolves the TypeScript lint entrypoint from either `node_modules/typescript/lib/tsc.js` or `node_modules/.ignored/typescript/lib/tsc.js`, so the offline lint check matches the actual workspace layout.
