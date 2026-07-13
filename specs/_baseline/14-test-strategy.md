# 14. Test Strategy

## Scope

This document records the current test and verification state of the repository and proposes the minimum testing strategy needed to make the migration roadmap safe. It does not create tests, change scripts, or install tooling.

## Test Infrastructure Audit

Current state: the repository has build/typecheck support and several ad hoc diagnostic scripts, but no configured unit/integration/e2e test runner.

Test-runner setup is intentionally deferred until the repository-health gate in Feature 001 (`verification-workflow-and-repository-health`) passes.

| Capability | Exists now | Configured | Used | Reliable | Missing | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| TypeScript compile check (`npm run lint` -> `tsc --noEmit`) | Yes | Yes | Yes | Medium-high | No separate typecheck script | High |
| Production build (`npm run build`) | Yes | Yes | Yes | High | None | High |
| Repo regression diagnostics (`npm run diag:regressions`) | Yes | Yes | Yes | Medium | Broader coverage | High |
| Overlap cleanup helper (`npm run cleanup:overlaps`) | Yes | Yes | Occasional | Medium | Not a test harness | High |
| PocketBase tree-server setup (`npm run pb:setup:tree-server`) | Yes | Yes | Occasional | Medium | Not a smoke test on its own | Medium-high |
| PocketBase tree-hook deployment (`npm run pb:deploy:tree-hooks`) | Yes | Yes | Occasional | Medium | Not a test harness | Medium-high |
| Dedicated unit test runner | No | No | No | Low | Yes | High |
| Dedicated integration test runner | No | No | No | Low | Yes | High |
| Dedicated e2e test runner | No | No | No | Low | Yes | High |
| Vitest/Jest config | No | No | No | Low | Yes | High |
| React Testing Library | No | No | No | Low | Yes | High |
| Playwright/Cypress | No | No | No | Low | Yes | High |
| Node test runner suite | No | No | Ad hoc only | Low | Yes | High |
| Backend hook smoke harness | No | No | Ad hoc only | Low-medium | Yes | High |
| Mock/fake infra for deterministic tests | Partial, script-level only | Partial | Ad hoc only | Low-medium | Yes | Medium-high |
| Browser/network simulation tools | No repo-level harness | No | Ad hoc only | Low | Yes | High |
| Orphaned test-like files (`App.test2.tsx`, `App.test3.tsx`, `App.test_restore.tsx`, `test_*.mjs`, `test_*.js`) | Yes | No | Reference-only | Low | Dedicated runner | Medium-high |

### Current tooling notes

- `package.json` has `build`, `lint`, `diag:regressions`, `cleanup:overlaps`, `pb:setup:tree-server`, and `pb:deploy:tree-hooks`.
- `lint` is TypeScript-only checking, not a dedicated style linter.
- There is no repo-local test script yet.
- The repository contains ad hoc diagnostics and PocketBase helper scripts that can seed future characterization coverage, but they are not yet a repeatable test layer.

## Verification Command Matrix

| Check | Real command | Exists now | Purpose | Required for which phase | Failure meaning | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| Typecheck | `npm run lint` | Yes | Type safety and compile-level contract check | 1-18 | Type drift or contract mismatch | High |
| Unit tests | `MISSING` | No | Repeatable pure-function coverage | 2-18 | No stable unit harness | High |
| Characterization tests | `MISSING` | No | Capture current behavior before extraction | 2-18 | Behavior is not locked down | High |
| Integration tests | `MISSING` | No | Multi-module behavior and adapter flow coverage | 7-18 | Cross-module regressions may slip through | High |
| Production build | `npm run build` | Yes | Bundle sanity and compile/runtime surfacing | 1-18 | The app does not build cleanly | High |
| Lint | `MISSING` | No | Style and code-quality pass beyond TypeScript checks | 1-18 | Style regressions are unchecked | Medium-high |
| Git status / diff | `git status --short && git diff --name-only` | No in this shell | Tree hygiene and auditability | 1-18 | Repo root is not reliable for verification | High |
| Graphify refresh | `MISSING` in this shell | No | Refresh navigation map after structural changes | 1-18 when source structure changes | The map may be stale | Medium |
| PocketBase schema snapshot | `node check_schema.mjs` | Yes | Inspect live collection schema | 1, 6-18 | Unknown schema drift or field semantics | High |
| Backend hook smoke test | `MISSING` | No | Dedicated smoke of hook behavior and deployment health | 7, 15-18 | Hook contract is unverified | High |
| PocketBase smoke / health | `node smoke_pocketbase_startup.mjs` | Yes | Health, realtime, and basic collection access | 1, 7, 13-18 | Backend access or realtime health is broken | High |
| World snapshot / sanity | `node verify_world.mjs` | Yes | Quick world-state sample and content sanity | 1, 15-18 | World data shape or sample state is off | Medium-high |

## Characterization Test Strategy

The highest-risk behaviors must be locked down before extraction. The current repository does not yet have a formal runner, so the strategy below describes the required test content and the behaviors each test must prove.

### Timer and process

- two timers with different `endsAt` values;
- earlier `endsAt` completes first;
- reload during construction;
- reload during production;
- reload during upgrade;
- offline catch-up;
- reconnect after completion;
- client clock forward;
- client clock backward;
- duplicate completion;
- duplicate reward;
- speed-up versus natural completion;
- stale snapshot after completion;
- old snapshot restores timer;
- process A must not complete process B.

Source anchors:

- `App.tsx:627-860, 14461-16189, 17912-17945`;
- `types.ts`;
- `data/buildings.ts`;
- `data/destructionWeapons.ts`.

### Optimistic commands

- full rollback building create;
- full rollback building move;
- oil/quarry rollback;
- production start failure;
- production collect failure;
- upgrade failure;
- speed-up generic failure;
- dropped-item pickup delete failure;
- repair failure;
- protection failure;
- explosion partial failure;
- clan join/leave partial rollback.

Source anchors:

- `App.tsx:5246-5285, 5862-6234, 14068-16189, 17111-17252`;
- `10`, `11`, `16`.

### Realtime

- initial fetch before event;
- event before fetch completes;
- out-of-order events;
- duplicate event;
- delete followed by stale update;
- reconnect;
- fetch-only fallback;
- retry cap;
- duplicate subscription cleanup;
- zone switch with old response arriving late.

Source anchors:

- `src/pocketbase.ts:1853-2219, 2325-2354`;
- `App.tsx:4798-4891, 7391-7766, 8395-8534, 9355-9365, 15797-15810`.

### PocketBase adapter

- 404 versus network error;
- timeout;
- late success after timeout;
- duplicate create;
- raw JSON preservation;
- legacy lookup;
- idempotent delete;
- `getDocs()` empty-on-error behavior;
- hook contract for tree hit;
- tree respawn hook.

Source anchors:

- `src/pocketbase.ts:48-193, 832-1460, 1853-2418`;
- `pb_hooks/main.pb.js`;
- `pb_hooks/tree_server_utils.js`.

### Startup and loading

- auth delayed;
- profile delayed;
- map delayed;
- missing readiness signal;
- max loading timeout;
- reload gate;
- loading overlay closes only when allowed.

Source anchors:

- `App.tsx:3110-3111, 8442-8451, 17850-17945, 18178-18178`;
- `LoadingScreen.tsx:46-47`.

## Test Layering

| Layer | Purpose | What to mock | What must not be mocked | Speed | Reliability | Suitable risks | Required before which migration phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pure unit tests | Prove pure helpers and invariant math. | Pure data inputs and time values. | Core formula outputs and invariants. | Fast | High | Timer math, merge helpers, type-level contracts. | 3-6 |
| State transition tests | Prove command handlers and reducer-like flows. | Adapter calls, UI shell, external network. | Local success/rollback state transitions. | Fast-medium | High | Optimistic commands, building/production logic. | 2-12 |
| Adapter contract tests | Prove PB reads/writes/realtime wrapper semantics. | Network and PocketBase server responses. | Adapter normalization and error policy. | Medium | High | 404 vs network, timeout, legacy lookup, raw JSON preservation. | 7-9 |
| Integration tests | Prove multiple modules behave together. | External servers only if needed. | Domain/module boundaries under test. | Medium | Medium-high | Time/process plus adapter, building plus realtime, social flows. | 7-17 |
| Realtime simulation tests | Prove event ordering, replay, and stale snapshot handling. | Realtime event source. | Merge policy and tombstone behavior. | Medium | Medium-high | Out-of-order events, reconnect, stale update after delete. | 5-16 |
| Browser / UI tests | Prove loading, input routing, and visible state. | Backend network only when using a test server. | UI event handling and render state. | Slow-medium | Medium | Loading gate, overlay closure, pointer routing. | 1-17 |
| Backend hook smoke tests | Prove deployed hooks still answer the expected routes/jobs. | Network and remote PB state. | Hook response semantics and cron contract. | Medium | Medium | Tree-hit, tree respawn, schema drift. | 7, 15-18 |
| Manual multiplayer checks | Prove live shared-state behavior under real latency. | Almost nothing except safety scaffolding. | Realtime, timer, and rollback behavior. | Slow | Medium | Duplicate reward, stale resurrection, multi-player visibility. | 13-18 |

## Fake Timers Policy

Fake timers are allowed for:

- UI countdowns;
- debounce behavior;
- retry backoff;
- loading delay;
- cleanup intervals;
- local timer tick behavior.

Fake timers are not sufficient as the only proof for:

- persisted end timestamps;
- offline catch-up;
- reconnect behavior;
- realtime ordering;
- PocketBase write completion;
- backend cron;
- client clock skew.

When fake timers are used, they must be paired with one of:

- a real time source in integration tests;
- a live PocketBase or hook smoke check;
- a runtime reproduction with logs;
- a persisted snapshot roundtrip.

## Test Data and Fixtures

| Fixture | Required fields | Legacy fields | Invalid variants | Why needed | Source baseline anchor |
| --- | --- | --- | --- | --- | --- |
| Legacy building record | `id`, `buildingId`, `data`, legacy top-level fields | Old `data.hp` / `data.maxHp` and older timer shapes | Missing `data`, stale top-level fields, zeroed timers | Proves backward compatibility and field preservation | `04`, `11`, `src/pocketbase.ts:381-508, 724-725` |
| Current building record | Current timer and status fields | Optional legacy mirrors | Missing `constructionEndTime`, missing `workState` | Baseline current-state fixture | `05`, `06`, `07`, `08`, `types.ts` |
| Constructing building | `isConstructing`, `constructionEndTime` | Old countdown-only state | Negative end time, missing owner | Proves reload and catch-up | `05`, `06`, `App.tsx:627-860, 5862-6234` |
| Working building | `workState`, `workEndTime` | Legacy work-state mirrors | Missing `workEndTime` | Proves production start/collect | `05`, `07`, `App.tsx:14618-15590` |
| Finished production | Completed work fields and reward payload | Older reward mirrors | Stale `workEndTime` in the past | Proves collection and exact-once reward | `05`, `07`, `10` |
| Destroying building | `isDestroying`, `destructionEndTime` | Legacy destruction mirrors | Missing `destructionStartedAt` | Proves destruction window and rollback | `05`, `11`, `types.ts`, `data/destructionWeapons.ts` |
| Completed destruction | Dead/tombstoned shape | Legacy active record | Stale active snapshot resurrecting the record | Proves resurrection suppression | `03`, `04`, `09`, `11`, `App.tsx:15797-16520` |
| Deleted / tombstoned record | Dead ID cache entry | Previous live record ID | Late snapshot with old shape | Proves delete suppression | `src/pocketbase.ts:658-699, 1213-1496` |
| Optimistic temp building | Temporary ID plus server reconciliation fields | Client-only temp state | Missing `serverId` or `ownerId` | Proves optimistic create and rollback | `10`, `App.tsx:5862-6234` |
| Stale snapshot | Older server snapshot plus current local state | Prior local merge state | Snapshot without expected timer fields | Proves replay and stale-write rejection | `09`, `10`, `11`, `App.tsx:7954-8560` |
| New snapshot | Fresh server snapshot with updated timestamp | Prior snapshot state | Snapshot with lower freshness than current | Proves freshness handling | `09`, `10`, `App.tsx:7954-8560` |
| User record with inventory | `gold`, `rubies`, `inventory`, `lastX`, `lastY` | Cached profile mirror | Missing inventory entries | Proves economy sync and movement persistence | `03`, `04`, `App.tsx:6367-7051, 6590-6802` |
| User record with ban / curse | `ban`, `curse`, or equivalent moderation fields | Cached moderation mirrors | Missing moderation fields | Proves social-state handling | `03`, `10`, `11`, `App.tsx:17111-17252` |
| Market listing | Listing id, price, seller, item fields | Legacy listing mirrors | Missing seller or price | Proves market transaction flow | `07`, `10`, `App.tsx:13777-14004` |
| Chat message | Message id, sender, text, timestamp | Legacy system-message mirrors | Duplicate timestamps or missing sender | Proves chat sync and dedupe | `09`, `11`, `App.tsx:7340-7498` |
| Presence record | User id, zone, online state | Cached online-user mirrors | Missing zone or stale heartbeat | Proves presence updates | `09`, `App.tsx:7501-7840` |
| Tree respawn job | `respawnAt`, `createdAt`, tree state | Legacy respawn timestamps | Missing `respawnAt` or invalid delay | Proves tree hook contract and respawn timing | `05`, `pb_hooks/tree_server_utils.js` |

## Runtime Reproduction Plan

For any behavior that static analysis cannot prove, use a runtime reproduction with logs and a cleanup step. The required logs should come from:

- `App.tsx` startup logs and `logStartupStep`;
- `App.tsx` timer traces and `recordBuildTiming` / `recordRuntimeTraceStage` calls;
- `src/pocketbase.ts` audit logs when `VITE_DEBUG=1` or `VITE_VERBOSE_DEBUG=1`;
- the tree-hit hook logs in `pb_hooks/main.pb.js` and `pb_hooks/tree_server_utils.js`.

| Scenario | Setup | Action sequence | Required logs | Expected result | Failure signature | Cleanup | Safety restrictions |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Offline catch-up vs realtime | Start a building timer, then disconnect or sleep long enough for it to expire. | Reload, then wait for realtime to reconnect. | `processOfflineTimers`, `snapshot_received`, `updateDoc`, `loading_waiting_for_critical_snapshot`. | The building completes once and only once. | Double completion or timer reset. | Revert the test building or restore the fixture. | Use a non-production account or a sandbox world. |
| Timeout after server success | Force a slow write or temporary network stall. | Retry after the client timeout fires. | `[PB Timeout]`, `queue-start`, late ack logs, result logs. | The write is not double-applied. | Late success creates a duplicate write or duplicate reward. | Delete the test record and confirm the final state. | Only in a controlled environment. |
| Stale snapshot resurrection | Delete or complete a record, then inject an older snapshot. | Reconnect and allow the stale snapshot to arrive. | Snapshot merge logs, tombstone logs, delete logs. | The deleted or completed state does not resurrect. | Older snapshot re-creates the record. | Reapply the deletion and clear dead-id caches if needed. | Do not use live player data. |
| Duplicate reward | Set a process near completion, then trigger the completion twice. | Reload and let the process finish twice through different paths. | Timer completion logs, reward logs, write logs. | Reward is emitted once. | Reward doubles or inventory increments twice. | Restore the test fixture or the affected resource counts. | Use a disposable record. |
| Loading hang | Delay auth or critical snapshot delivery. | Observe the loading overlay and readiness gate. | `pb_health_check_*`, `critical_buildings_snapshot_*`, `loading_waiting_for_critical_snapshot`. | Overlay closes only after readiness is complete. | Overlay never closes or closes too early. | Refresh the session and clear temp state. | Avoid live user sessions. |
| Mobile / high-latency | Use throttled network or slow CPU. | Perform build/collect/reconnect actions under latency. | PB queue logs, retry logs, timer logs. | The action remains stable under latency. | Race, stale overwrite, or duplicate write. | Restore the affected records. | Sandbox only. |
| Multi-player visibility | Use two clients on the same world segment. | Have one client mutate and the other observe. | Realtime subscription logs, snapshot logs, presence logs. | Both clients converge to the same live state. | One client remains stale or diverges. | Close both clients and restore the shared state. | Do not use production players. |
| Disconnect / reconnect | Start a process, then drop the connection and reconnect. | Observe state after reconnect. | `onSnapshot`, retry logs, `updatePlacedBuildingsFromServer`. | The process converges to the persisted state. | Reconnect restores stale or duplicate state. | Reset the process fixture. | Sandbox only. |
| Two simultaneous processes | Start two different process types with overlapping windows. | Force one to complete before the other. | Timer traces, process finalize logs, update logs. | One process does not complete the other. | Cross-process completion contamination. | Clear the test fixture and reapply. | Use isolated fixtures only. |
| Tree-hit and respawn | Hit a tree, then wait for respawn. | Confirm the server endpoint and cron behavior. | Tree-hit route logs, respawn logs, client reward logs. | Tree hit and respawn both follow the contract. | Tree reward mismatch or respawn timing drift. | Restore the tree fixture. | Only in a test environment. |

## Acceptance Gates

| Gate | Required evidence | Blocks which phases | Owner approval needed |
| --- | --- | --- | --- |
| Baseline reviewed | Current baseline docs, source anchors, graph freshness, and carried-forward corrections. | 1-18 | No |
| Git root healthy | Reproducible repo-root status/diff check or an agreed fallback if Git is unavailable. | 1-18 | No |
| Test runner available | Approved runner or approved ad hoc harness for repeatable tests. | 2-18 | Yes |
| Characterization coverage for target subsystem | The relevant timer/realtime/command behaviors are captured before extraction. | 3-17 | Yes |
| Build green | `npm run build` passes. | 1-18 | No |
| No balance/config changes | No diff in balance, costs, rewards, durations, or config values. | 1-18 | Yes if a change is proposed | 
| No schema diff | PocketBase schema snapshot matches the approved baseline. | 7-18 | Yes |
| Rollback tested | The phase has a defined and verified rollback path. | 9-16 | Yes |
| Realtime tests green | Replay, reconnect, duplicate-event, and stale-snapshot behavior is proven. | 13-16 | Yes |
| Legacy fixture green | Older records still roundtrip and load correctly. | 6-18 | Yes |
| Multiplayer smoke passed | At least one controlled multi-client visibility check passes. | 13-18 | Yes |

## Coverage Matrix

| Risk(s) | Invariant(s) | Proposed test(s) | Migration phase(s) | Acceptance gate(s) |
| --- | --- | --- | --- | --- |
| `RISK-GIT-01`, `RISK-TEST-01`, `RISK-LOAD-01` | `INV-GAME-03`, `INV-PB-05` | Git root check, baseline review, loading gate tests, repo-health smoke | 1-2 | Baseline reviewed, Git root healthy, test runner available |
| `RISK-TIME-01`, `RISK-REWARD-01`, `RISK-OFFLINE-01`, `RISK-CLOCK-01` | `INV-TIME-01` to `INV-TIME-10` | Two timers, reload during construction/production/upgrade, clock forward/backward, offline catch-up, reconnect after completion, duplicate completion, duplicate reward | 2-4, 10-12 | Characterization coverage, rollback tested |
| `RISK-SNAPSHOT-01`, `RISK-RESPONSE-01`, `RISK-DELETE-01` | `INV-STATE-03`, `INV-STATE-05`, `INV-STATE-06`, `INV-RT-03`, `INV-RT-07` | Initial fetch before event, event before fetch, out-of-order events, delete followed by stale update, reconnect, stale snapshot replay | 5, 13, 15 | Realtime tests green, multiplayer smoke passed |
| `RISK-PB-01`, `RISK-DATA-01`, `RISK-PWRITE-01`, `RISK-DWRITE-01`, `RISK-LEGACY-01`, `RISK-CACHE-01`, `RISK-SCHEMA-01`, `RISK-HOOK-01` | `INV-PB-01` to `INV-PB-05`, `INV-RT-05`, `INV-RT-06` | 404 vs network, timeout, late success after timeout, duplicate create, raw JSON preservation, legacy lookup, idempotent delete, schema snapshot, tree-hit hook smoke, tree respawn hook smoke | 7-9, 15, 18 | No schema diff, legacy fixture green, rollback tested |
| `RISK-RESOURCE-01`, `RISK-ROLLBACK-01`, `RISK-COMBAT-01`, `RISK-MULTI-01` | `INV-OPT-01` to `INV-OPT-08`, `INV-GAME-02`, `INV-STATE-01`, `INV-STATE-03` | Building create/move rollback, oil/quarry rollback, production/upgrade failure, repair/protection/explosion partial failure, clan join/leave rollback, concurrent attack/destruction race | 8-16 | Rollback tested, multiplayer smoke passed |
| `RISK-MONO-01`, `RISK-LOAD-01`, `RISK-GIT-01` | `INV-GAME-03`, `INV-PB-03`, `INV-PB-05` | Shell reduction smoke, startup smoke, build smoke, repo-health gate | 1, 17-18 | Baseline reviewed, build green, Git root healthy |

## Corrections Carried Forward

The roadmap and future tests must carry these corrections forward:

- `INV-TIME-04` stays `PARTIALLY_CONFIRMED` until a cross-process runtime test exists;
- `INV-TIME-07` stays `PARTIALLY_CONFIRMED` until repeated reload/reconnect coverage exists;
- `forceReloadAt` is not proof of persistence;
- exact-once reward stays `PARTIALLY_CONFIRMED`;
- the weapon-upgrade runtime path stays `UNCONFIRMED`.

These are not file changes in this run. They are prerequisites for future cleanup and for the first characterization pass.

## First Feature-Spec Recommendation

Recommended first feature-spec title:

- `characterization-tests-and-time-contracts`

Why this should come first:

- it covers the highest-risk runtime behavior first;
- it gives the roadmap a repeatable safety net;
- it supports the later adapter and extraction phases;
- it keeps the migration behavior-preserving and reversible.

Minimum contents of that feature-spec:

- business goal;
- technical goal;
- scope and out-of-scope;
- baseline docs used;
- risks covered;
- invariants covered;
- acceptance criteria;
- required owner decisions;
- why it must come first.
