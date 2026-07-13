# 12. Invariants, Risk Register, and Target Architecture

## Scope

This document describes the target architecture direction for the current codebase without creating a migration roadmap, detailed test plan, feature spec, or implementation plan. Graphify was used only as a navigation aid. Every factual statement about the current system is backed by direct source reading or by the already created baseline documents with source anchors.

Primary sources and anchors used for this stage:

- `App.tsx:627-860`, `App.tsx:2875-3446`, `App.tsx:4450-4477`, `App.tsx:4794-4897`, `App.tsx:5246-5285`, `App.tsx:5862-6234`, `App.tsx:6367-7051`, `App.tsx:7318-7840`, `App.tsx:7954-8560`, `App.tsx:8719-8906`, `App.tsx:13777-17252`, `App.tsx:17845-18191`
- `src/pocketbase.ts:44-193`, `src/pocketbase.ts:832-1034`, `src/pocketbase.ts:1037-1460`, `src/pocketbase.ts:1853-2354`, `src/pocketbase.ts:2392-2418`
- `LoadingScreen.tsx:46-47`
- `types.ts:42-206`
- `data/buildings.ts` and `data/destructionWeapons.ts` for timer-bearing configuration fields
- `pb_hooks/main.pb.js:3-55` and `pb_hooks/tree_server_utils.js:6-700`
- baseline docs `03-state-ownership.md`, `04-pocketbase-contracts.md`, `05-timers-and-processes.md`, `06-building-system.md`, `07-production-system.md`, `08-upgrade-system.md`, `09-realtime-sync.md`, `10-optimistic-ui.md`, `11-error-handling.md`

## Target Architecture Principles

| Principle | Current problem | Target rule | Why it matters | Migration constraints | Evidence |
| --- | --- | --- | --- | --- | --- |
| Single authoritative persistence boundary | `App.tsx` still writes directly in many handlers, while the PocketBase adapter also owns request queueing and retry policy. | All persistent writes and reads should pass through one narrow adapter boundary, with domain code calling command functions rather than raw persistence primitives. | Prevents scattered persistence rules, makes retries and rollback semantics uniform, and keeps save-safety logic centralized. | No backend or schema changes in this stage; preserve existing collections and field names. | `04-pocketbase-contracts.md`, `09-realtime-sync.md`, `11-error-handling.md`; `src/pocketbase.ts:44-193, 832-1460, 1853-2354` |
| Explicit state ownership | Multiple active sources exist for `placedBuildings`, `allUsers`, profile mirrors, chat, and other aggregates. | Every persistent slice must name one server source of truth and one client reconciliation policy. | Reduces stale-snapshot ambiguity and makes multi-source merges auditable. | Do not promote client mirrors or caches into new sources of truth. | `03-state-ownership.md`; `App.tsx:7954-8560, 6848-7840, 6367-7051` |
| Stable process identity | Process state is distributed across ids, temp ids, and timer fields. | A process must have a stable identity that survives reloads, reconnects, and optimistic creates. | Prevents duplicate completion, duplicate rewards, and state resurrection. | Preserve legacy temp-id mapping until a separate migration exists. | `05-timers-and-processes.md`, `10-optimistic-ui.md`; `App.tsx:5862-6234, 7954-8028, 16123-16189` |
| Centralized time conversion | Time math is spread across timer loops, handlers, and helper branches. | Absolute timestamps and canonical end-time conversion should live in a dedicated time/process module. | Keeps countdowns, catch-up, and completion logic consistent across reloads and reconnects. | Local countdowns remain display-only. | `05-timers-and-processes.md`, `11-error-handling.md`; `App.tsx:627-860, 14461-16189` |
| Pure domain functions | Validation, mutation, and persistence are often interleaved in the same handler. | Cost, eligibility, end-time, merge, and reconciliation logic should be pure where possible. | Pure functions are easier to test and much safer to extract from a monolith. | Preserve balance and record shapes while extracting. | `06-building-system.md`, `07-production-system.md`, `08-upgrade-system.md`; `App.tsx:5862-6234, 14461-16189` |
| React UI separated from persistence | `App.tsx` currently owns orchestration, state, timers, and many mutations. | `App.tsx` should become an orchestration shell that wires providers, top-level screens, and high-level dependencies. | Shrinks the blast radius of UI changes and makes runtime behavior easier to reason about. | No mass rewrite; extraction must stay incremental. | Constitution v1.0.0; `01-current-architecture.md`, `11-error-handling.md` |
| Realtime reconciliation isolated from rendering | Snapshot merge logic is mixed into the runtime monolith. | Realtime merge policy should live in a dedicated service or domain helper that returns normalized view state. | Prevents rendering code from having to understand freshness, tombstones, and fallback merges. | Keep existing realtime semantics and compatibility fallbacks. | `03-state-ownership.md`, `09-realtime-sync.md`; `App.tsx:7954-8560`, `src/pocketbase.ts:1853-2219` |
| Optimistic commands with explicit rollback | Some commands have full rollback, some partial rollback, and some rely on later reconciliation. | Every optimistic command must declare its success path, rollback path, and compensation boundary. | Reduces resource loss, duplicate writes, and hidden inconsistency. | Do not alter resource values or reward amounts while improving the contract. | `10-optimistic-ui.md`, `11-error-handling.md`; `App.tsx:5246-5285, 5862-6234, 14068-14186, 16123-16189` |
| Idempotent completion | Several paths can reach the same building or timer completion from different triggers. | Completion should be safe to repeat and should never double-apply a reward. | Prevents double rewards after reconnects, stale snapshots, or repeated ticks. | Preserve canonical reward totals. | `05-timers-and-processes.md`, `10-optimistic-ui.md`, `11-error-handling.md`; `App.tsx:627-860, 14618-15280, 15944-16189` |
| Backward-compatible adapters | Existing records, raw JSON fields, and legacy fallbacks are still active. | Adapters should preserve existing records until a deliberate migration spec retires them. | Protects player saves and keeps older data readable. | No schema renames or destructive migration in this stage. | `04-pocketbase-contracts.md`, `11-error-handling.md`; `src/pocketbase.ts:1037-1460, 1853-2354` |
| Incremental extraction from `App.tsx` | The main file still mixes shell, world simulation, social systems, and persistence. | Extract focused helpers and modules one boundary at a time. | Avoids a risky rewrite and keeps review slices small. | Do not move directly to a broad architecture rewrite. | Constitution v1.0.0; `01-current-architecture.md`, `03-state-ownership.md`, `12-target-architecture.md` |
| Observable and testable boundaries | Important behaviors rely on runtime guards, silent catches, and snapshot interactions. | Boundaries should expose clear return values, logs, or state transitions that can be tested in isolation. | Makes regressions visible before they reach players. | Use existing project scripts and documented checks only. | `11-error-handling.md`, `17-traceability-index.md` |
| Gameplay preservation | Balance and identity fields are part of the current contract surface. | Structural extraction must not change balance, item identities, durations, costs, or reward values. | Prevents save corruption and player-facing fairness regressions. | No balance changes without explicit migration approval. | Constitution v1.0.0; `05-timers-and-processes.md`, `06-building-system.md`, `07-production-system.md`, `08-upgrade-system.md` |

## Domain Boundaries

| Boundary | Current code locations | Owned state | Server contracts | Target public API | Allowed dependencies | Forbidden dependencies | Extraction risk | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| App shell / bootstrap | `App.tsx:2875-3111, 17845-18191` | loading gate, top-level UI state, providers | auth bootstrapping, loading readiness, screen switching | `AppShell` / provider wiring | UI composition, hooks, feature facades | domain persistence logic, timer completion, PocketBase query construction | low-medium | CONFIRMED_BY_SOURCE |
| Authentication / profile | `App.tsx:6367-7051, 7247-7311` | `user`, player mirrors, ban/curse profile state | `users/<uid>`, `leaderboard_profiles` | `profileService` / `authState` facade | PocketBase adapter, cache helpers | canvas, monster loop, market internals | medium | CONFIRMED_BY_SOURCE |
| Player economy / inventory | `App.tsx:6590-6624, 13777-14358, 17957-18168` | gold, rubies, energy, inventory, permits | `users/<uid>` resource fields | `economyService` | pocketbase adapter, pure cost calculators | canvas renderer, realtime merge internals | medium | CONFIRMED_BY_SOURCE |
| World / map / zones | `App.tsx:4450-4897, 7954-8560, 12822-12942` | map state, zones, resources, dropped items | `map_state/status`, `map_resources`, `dropped_items`, zone queries | `worldStateService` | realtime adapter, time helpers | chat, market, social mutations | medium | CONFIRMED_BY_SOURCE |
| Buildings | `App.tsx:5246-5285, 5862-6234, 7954-8560` | `placedBuildings`, tombstones, optimistic ids, selection state | `buildings` collection | `buildingService` | time helpers, adapter, pure validation | chat, presence, loading gate internals | high | CONFIRMED_BY_SOURCE |
| Construction | `App.tsx:5862-6250, 14068-14186, 14461-14610, 16123-16189` | construction timers, construction flags, build traces | `buildings` timer fields | `constructionService` | building service, time module | raw UI state, chat, market | high | CONFIRMED_BY_SOURCE |
| Production | `App.tsx:14618-15280` | work state, work end times, reward calculations | `buildings` work fields, inventory deltas | `productionService` | economy service, time module | monster loop, canvas rendering | high | CONFIRMED_BY_SOURCE |
| Upgrades | `App.tsx:14461-14610, 16123-16189` | upgrade timers, upgraded building fields, visual effects | `buildings` update payloads | `upgradeService` | time helpers, building service | market internals, presence, chat | high | CONFIRMED_BY_SOURCE |
| Combat / destruction | `App.tsx:15944-16121, 11469-12752` | destruction fields, shields, pending damage | `buildings`, `users/<uid>` debits | `combatService` | time module, adapter, effects helper | market, chat, loading gate | high | CONFIRMED_BY_SOURCE |
| Monsters | `App.tsx:11566-12663, 13119-13439` | monster motion state, cooldown refs, spawn cursors | building and user updates from combat loop | `monsterSimulationService` | time module, world state | pocketbase raw API, UI-only modals | high | PARTIALLY_CONFIRMED |
| Trees / harvested resources | `App.tsx:5411-5592`, `src/pocketbase.ts:2392-2418`, `pb_hooks/main.pb.js:3-55` | resource hp and removal state | `/api/basingse/tree-hit`, `map_resources`, tree respawn hooks | `resourceHarvestService` | adapter, pb_hooks contract | market, chat, clan state | medium | CONFIRMED_BY_SOURCE |
| Market | `App.tsx:13777-14004` | listings, sell form, processing flag | `market` collection | `marketService` | economy service, adapter | canvas, monster loop, loading gate | medium | CONFIRMED_BY_SOURCE |
| Chat / private messages | `App.tsx:7340-7498, 16535-16783` | chat history, private messages, input state | `chat_messages`, `private_messages` | `chatService` | adapter, cleanup helpers, profile state | monster loop, production internals | medium | CONFIRMED_BY_SOURCE |
| Presence / leaderboard | `App.tsx:7501-7840` | presence heartbeats, online user lists, leaderboard mirrors | `presence`, `leaderboard_profiles` | `presenceService` | profile service, adapter | combat math, map bootstrap | medium | CONFIRMED_BY_SOURCE |
| Clans / elections | `App.tsx:7318-7350, 17111-17252, 8719-8906` | clans, membership mirrors, election state | `clans`, election docs, user clan fields | `clanService` / `electionService` | profile service, realtime adapter | canvas renderer, build placement internals | medium-high | CONFIRMED_BY_SOURCE |
| Timers / processes | `App.tsx:627-860, 732-860, 7988-8028, 11469-12752` | offline catch-up, timer guards, completion flags | persisted timer fields in `buildings` | `processClockService` | building/production/combat services | direct UI-only components | high | CONFIRMED_BY_SOURCE |
| PocketBase adapter | `src/pocketbase.ts:44-2354` | request queue, dead-record caches, retry state, normalization | PocketBase collections, auth, realtime | `pocketbaseService` | no React UI imports | canvas, game loop, feature command internals | medium | CONFIRMED_BY_SOURCE |
| Realtime synchronization | `src/pocketbase.ts:1853-2219`, `App.tsx:4450-8560` | subscription state, initial fetch caches, zone retry state | realtime channels, fetch fallbacks | `realtimeSyncService` | pocketbase adapter, merge helpers | UI rendering, action handlers | high | CONFIRMED_BY_SOURCE |
| Optimistic commands | `App.tsx:5246-5285, 5862-6234, 14068-16189, 17111-17252` | optimistic ids, in-flight refs, rollback state | building / user / resource writes | `commandService` | domain modules, adapter, time helpers | raw canvas drawing, UI-only components | high | CONFIRMED_BY_SOURCE |
| Error / reporting | `App.tsx:2976-2991, 6367-6376, 6949-7051, 7318-7564`; `src/pocketbase.ts:2325-2354` | debug events, warning paths, silent catch policies | logging only, no schema changes | `errorBoundaryService` | adapter, domain services | gameplay state mutation | medium | CONFIRMED_BY_SOURCE |
| Assets / rendering | `App.tsx:9764-11463`, `LoadingScreen.tsx:1-220` | canvas draw state, loading visuals, music selection | none | `renderingShell` | React, asset imports, state selectors | PocketBase query construction, offline completion | medium | CONFIRMED_BY_SOURCE |

## Proposed Module Map

| Module | Responsibility | Candidate functions from `App.tsx` | Candidate types | Public API target | Prohibited imports | Server boundary | Testing boundary | Extraction difficulty |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `app/bootstrap` | Wire providers, screens, and loading gate | auth bootstrap, loading screen logic, top-level screen switches | `user`, loading flags, top-level UI state | `mountAppShell()` / `useAppBootstrap()` | raw PocketBase write logic, monster simulation internals | none directly; it consumes services | screen-gate and readiness tests | medium |
| `services/pocketbase` | Canonical data-access layer | current direct adapter calls are already here | `DocRef`, `Query`, `DocSnapshot`, `CollectionSnapshot` | `getDoc`, `getDocs`, `setDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `handleFirestoreError`, `requestTreeHit` | React state, canvas, game loop | PocketBase and `/api/basingse/tree-hit` | adapter unit tests and mocks | medium |
| `domain/processes` | Canonical time and idempotency helpers | `processOfflineTimers`, timer normalization branches, completion checks | `PlacedBuilding`, `VisualEffect` | `computeEndTime`, `applyCatchUp`, `finalizeProcess` | JSX, DOM, network calls | none directly | pure function tests | medium-high |
| `domain/buildings` | Construction, move, repair, protection, upgrade, destroy commands | `placeBuildingAtTile`, `handleBuildOilRig`, `handleBuildWildQuarry`, `handleUpgrade`, `handleSpeedUp`, `handleMoveClick`, `handleRepair`, `handleApplyProtection`, `handleExplode` | `Building`, `PlacedBuilding` | command functions returning success/rollback data | `LoadingScreen`, market, chat, presence | `buildings`, `users`, `map_resources` | command matrix tests | high |
| `domain/production` | Work-state start, collect, and completion | `handleStartProductionFromWorld`, `handleStartProduction`, `handleCollectProductionFromWorld`, `handleCollectProduction` | `Building`, `PlacedBuilding` | `startProduction`, `collectProduction`, `finishOverdueProduction` | chat, presence, rendering | `buildings`, `users` inventory fields | timer and reward tests | high |
| `domain/combat` | Damage, shields, destruction, monster-facing rules | `handleExplode`, combat loop branches, protection reset paths | `DestructionInfo`, `PlacedBuilding`, `VisualEffect` | `applyDamage`, `applyProtection`, `finalizeDestruction` | market, loading, bootstrap | `buildings`, `users` | race / idempotency tests | high |
| `domain/economy` | Currency, inventory, permits, market money flow | `updatePlayerResources`, `handleBuyMarketItem`, `handleCreateMarketListing`, `handleCancelListing`, `handleBuyBuildingPermit`, `handleBuyEnergyPack` | `MarketListing`, inventory maps, resource payloads | `applyResourceDelta`, `buyListing`, `createListing`, `cancelListing` | canvas, monster loop | `users`, `market` | transaction and rollback tests | medium-high |
| `domain/social` | Chat, private messages, clans, bans, curses, presence | `handleSendMessage`, `handleSendPrivateMessage`, `handleJoinClan`, `handleConfirmLeaveClan`, `handleSaveClanSettings`, `handleUpdateMemberPermissions`, presence update branches | `ChatMessage`, `PrivateMessage`, `Clan`, `activeCurses` | `sendChat`, `sendPrivateMessage`, `joinClan`, `leaveClan`, `syncPresence` | monster loop, building placement internals | `chat_messages`, `private_messages`, `clans`, `presence`, `users` | realtime and duplicate-message tests | medium-high |
| `domain/world` | Map resources, dropped items, trees, and world-recognition helpers | tree-hit path, resource pickup, dropped-item pickup, map generation bootstrap, zone loaders | `MapResource`, `DroppedItem`, zone data | `loadWorld`, `pickUpDrop`, `hitTree`, `syncZones` | chat, market, leaderboards | `map_state/status`, `map_resources`, `dropped_items`, `/api/basingse/tree-hit` | snapshot and fallback tests | medium-high |
| `ui/canvas-shell` | Rendering and pointer routing | `draw`, pointer handlers, selection helpers, loading visuals | render-only slices, selection state | `renderWorld`, `renderOverlay`, `routePointer` | PocketBase writes, process completion | none directly | visual / interaction tests | medium |

## App.tsx Target Role

### What should remain in `App.tsx`

- provider wiring and bootstrap
- top-level auth and loading gate integration
- screen composition and dependency passing
- high-level state orchestration across major features
- event routing from UI shell to domain services

### What should move out earlier

- pure timer math and normalization
- merge policy for snapshot reconciliation
- resource and reward calculators
- rollback bookkeeping and idempotency helpers
- adapter-facing payload construction

### What should move later

- mutation-heavy command handlers that still need characterization
- canvas drawing branches tied to render timing
- world-simulation internals that depend on many refs
- social flows that mix local UI state with realtime writes

### What should not be moved into characterization tests

- canonical timestamp rules
- reward and cost formulas
- rollback semantics
- persistence compatibility rules
- PocketBase contract behavior

### Safest first extraction

- pure time helpers
- merge helpers that return new state without side effects
- adapter wrappers that already have narrow inputs and outputs

## Current-to-Target Gap Matrix

| Area | Current state | Target state | Gap | Risk | Prerequisite | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| Timer fields | Stored on buildings and normalized in multiple loops | One canonical time module with explicit conversions | timer math is still scattered | double-apply or drift | domain/processes module | CONFIRMED_BY_SOURCE |
| Process completion | Completion may happen through loops, handlers, and reload catch-up | one idempotent finalize path per process | completion logic is split | duplicate reward or stale completion | process identity ADR | CONFIRMED_BY_SOURCE |
| State ownership | multiple active source slices (`placedBuildings`, `allUsers`, mirrors) | one owner per slice plus explicit reconciliation | multi-source merges are implicit in several places | stale overwrites | state ownership matrix | CONFIRMED_BY_SOURCE |
| PocketBase wrapper | canonical adapter exists, but App.tsx still knows many query shapes | adapter boundary only, with domain commands above it | adapter responsibilities are already broad | bypasses or duplicate rules | adapter boundary ADR | CONFIRMED_BY_SOURCE |
| Realtime merge | merge and fallback logic live in adapter + App.tsx | isolated merge policy with normalized output | freshness policy is embedded in multiple places | stale snapshot resurrection | realtime merge ADR | CONFIRMED_BY_SOURCE |
| Optimistic rollback | some commands have full rollback, some partial, some none | every optimistic command has explicit rollback contract | rollback semantics are inconsistent | resource loss or silent mismatch | rollback ADR | CONFIRMED_BY_SOURCE |
| Error handling | logs, warns, silent catches, and fail-open fallbacks coexist | classification-driven recovery and bounded silent-fail paths | error policy is uneven | silent inconsistency | error classification ADR | CONFIRMED_BY_SOURCE |
| Loading gate | splash exits on `loadingReady && user`, with readiness timers | explicit startup readiness state machine | readiness is spread across timer and effect logic | loading hang | startup gate ADR | CONFIRMED_BY_SOURCE |
| Market | transaction-heavy logic still sits in App.tsx | market service with stable contract | transaction logic is embedded in UI handler code | partial write or stale list | economy module | CONFIRMED_BY_SOURCE |
| Chat | realtime chat plus local notices are merged in UI state | social service with dedupe and cleanup policy | visible list is assembled in multiple places | duplicate or missing notices | social module | CONFIRMED_BY_SOURCE |
| Combat | destruction and protection logic live inside App.tsx | combat service with pure damage math | multiple branches mutate the same record | race and duplicate reward | combat module | CONFIRMED_BY_SOURCE |
| Monster AI | simulation and persistence are still in the monolith | isolated simulation service | many refs and timers are shared | stale closure / timing bugs | monster domain extraction | PARTIALLY_CONFIRMED |
| User profile mirrors | profile and leaderboard mirrors are merged from several feeds | profile service with named source order | sources are not centrally documented in code | profile drift | state ownership ADR | CONFIRMED_BY_SOURCE |
| App.tsx composition | monolith remains the orchestration root | shell-only composition layer | many domain details are still embedded | extraction risk | no mass rewrite constraint | CONFIRMED_BY_SOURCE |
| Tests | baseline docs exist, but invariant-focused tests are not yet defined as code | narrow, isolated checks around high-risk invariants | no dedicated test architecture has been defined here | regressions remain easy | owner-approved test approach | CONFIRMED_BY_SOURCE |
| Git | graph and source freshness were checked, but shell git invocation was inconsistent in this session | stable verification workflow with reproducible status checks | toolchain invocation was flaky in the current shell | audit drift / false confidence | repo-root verification command | PARTIALLY_CONFIRMED |

## Architectural Decision Records Needed

| ADR | Question | Variants | Known constraints | Decision urgency | Owner approval required |
| --- | --- | --- | --- | --- | --- |
| Canonical process time source | What owns the authoritative end timestamp for each process family? | server timestamp only; client timestamp only; hybrid with server reread | must support reload, offline catch-up, and idempotency | high | yes |
| Process identity | What is the stable key for a process across optimistic create and later reconciliation? | server doc id; temp-id mapping; composite key | must preserve existing save data and legacy local IDs | high | yes |
| Completion authority | Who finalizes a process when both reload catch-up and realtime updates can observe it? | client-first; server-first; split by domain | must not double-apply rewards | high | yes |
| Optimistic command contract | What guarantees must every optimistic command provide? | explicit rollback; snapshot repair only; server ack only | must protect saved currency and inventory | high | yes |
| Rollback contract | What counts as a valid rollback for a failed command? | full local revert; partial compensation; later reconciliation only | must not lose player resources | high | yes |
| Realtime merge policy | Which source wins when snapshot and local state conflict? | last interaction wins; latest server wins; tombstone-first merge | must prevent stale resurrection and stale overwrites | high | yes |
| Building state model | Should building lifecycle stay in one record shape or be split into sub-models? | monolithic record; split timers; split combat/protection sub-records | must keep current records readable | medium-high | yes |
| PocketBase adapter boundary | How strict should the adapter boundary be for reads/writes and retries? | strict-only; mixed allowed for legacy; adapter plus domain facades | must preserve current retry and timeout guarantees | medium | yes |
| Error classification | Which errors should fail open, retry, warn, or halt? | permissive logging; strict taxonomy; hybrid per domain | must not hide data loss behind empty snapshots | high | yes |
| Legacy compatibility policy | When can fallback reads/writes be retired? | keep indefinitely; retire per migration; retire now | must not break current saves or active collections | high | yes |
| Startup readiness gate | What exactly releases the loading screen and startup flow? | auth only; auth plus data readiness; staged readiness | must preserve `loadingReady && user` and the reload gate semantics already in source | high | yes |
| State ownership matrix | Which slice owns each persistent aggregate and which slices are views only? | single owner; owner plus read model; multi-owner | must keep PocketBase as source of truth and preserve current realtime merges | high | yes |
| Combat transition ordering | Which event finalizes damage, destruction, and reward when multiple triggers arrive together? | loop order; server time order; hybrid | must avoid duplicate damage and duplicate reward while preserving timer-backed destruction | high | yes |
| PocketBase schema contract | Which schema changes are allowed without an explicit migration spec? | additive only; versioned migration; strict freeze | must preserve current read and write compatibility, including raw JSON fields | high | yes |
| Backend hook contract | What guarantees must backend hooks preserve for tree-hit and respawn logic? | documented endpoints only; hook baseline per route; no contract | must preserve `/api/basingse/tree-hit` and tree respawn cron semantics | medium-high | yes |
| Verification workflow | What is the minimum reproducible verification gate for high-risk baseline changes? | doc-only review; doc plus source plus runtime checks; full test suite | must preserve the non-implementation boundary while still making regressions visible | medium | yes |

## Explicit Non-Goals

- do not rewrite `App.tsx` in one pass
- do not change the backend stack
- do not change PocketBase schema in this stage
- do not change balance, item IDs, or saved data formats
- do not replace the canvas renderer wholesale
- do not create microservices
- do not introduce Redux just for architectural fashion
- do not auto-migrate all processes to server cron
- do not turn Graphify into proof of runtime behavior
- do not create a migration roadmap or detailed test plan yet
