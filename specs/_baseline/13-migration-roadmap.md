# 13. Migration Roadmap

## Scope

This roadmap describes a safe, incremental migration path for the current MMO codebase based on the accepted baseline documents, the current source snapshot, and the current risk register. It is intentionally not a feature spec, not an implementation plan, and not a test implementation.

The roadmap is constrained by the constitution and the current evidence:

- PocketBase remains the source of truth for persistent multiplayer state.
- `App.tsx` remains the orchestration root until an explicit refactor is approved.
- `src/pocketbase.ts` remains the canonical adapter boundary for reads, writes, queueing, retries, and realtime subscriptions.
- `App.tsx`, `src/pocketbase.ts`, balance, costs, rewards, durations, schema, and live data are frozen unless a later phase has explicit approval.
- Graphify is a navigation aid only; source and runtime evidence are the final authority.

## Migration Strategy

The migration strategy is:

- incremental, with one small verifiable slice at a time;
- reversible, with a rollback path for every phase;
- test-first, with behavior captured before extraction;
- behavior-preserving, especially for timers, rewards, and rollback;
- schema-preserving, with no silent PocketBase shape changes;
- compatible with existing PocketBase records and legacy fallbacks;
- divided into small independently verifiable phases;
- safe for a live MMO, meaning no phase may depend on an unproven runtime assumption.

Mandatory rules for every phase:

- do not rewrite `App.tsx` wholesale;
- do not move mutation-heavy code ahead of characterization coverage;
- do not change balance, costs, rewards, or durations;
- do not change PocketBase schema without a separate spec and approval;
- do not remove legacy compatibility until it is explicitly retired;
- do not change realtime semantics without dedicated tests;
- define rollback before implementation starts;
- define explicit success criteria before the phase is started;
- do not start the next phase until verification passes.

## Migration Phases

| Phase | Goal | Why here | Prerequisites | Baseline evidence | Risks covered | Invariants protected | Files likely involved | Functions likely involved | Allowed changes | Explicitly forbidden changes | Verification | Success criteria | Rollback plan | Owner approval gate | Estimated difficulty | Blocks next phase | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Verification and repository health | Establish a reproducible repo-health gate and confirm the source/baseline snapshot is current. | Every later phase depends on a trustworthy root, known commands, and a current source snapshot. | Current baseline docs, graph freshness, repo-root checks, existing scripts. | `12`, `15`, `16`, `17`; `package.json`; `tsconfig.json`; `SDD_BASELINE_GRAPHIFY.md`; `graphify-out/GRAPH_REPORT.md`; `check_regressions_worker6.mjs`; `smoke_pocketbase_startup.mjs`; `check_schema.mjs`. | Broken Git metadata, stale graph, missing scripts, hidden source drift. | `INV-GAME-03`, `INV-PB-05`, `INV-PB-03`. | Verification docs and any repo-health helper scripts only. | `check_regressions_worker6.mjs`, `smoke_pocketbase_startup.mjs`, `check_schema.mjs`, `verify_world.mjs`. | Repo-health docs, command inventory, snapshot notes. | Any gameplay code, PB schema, balance, rewards, durations, or hooks. | Repo-root verification, build, typecheck, schema snapshot, startup smoke. | Reproducible checks exist and the current source snapshot is trusted. | Remove the new verification notes or helper script edits. | Low unless repo-root or schema health is inconsistent. | Yes, because later phases need a trusted baseline. | High |
| 2. Characterization test foundation | Capture current behavior in repeatable tests before extracting logic. | The current repo has ad hoc test-like files but no configured runner, so the first behavior-safe step is to make the current behavior executable and measurable. | Phase 1, approved test harness choice, current behavior baseline. | Ad hoc test-like files (`App.test2.tsx`, `App.test3.tsx`, `App.test_restore.tsx`, `test_*.mjs`, `test_*.js`); no configured test runner in `package.json`. | Missing tests, unmeasured regressions, stale snapshot races, duplicate reward risk. | `INV-TIME-04`, `INV-TIME-07`, `INV-TIME-08`, `INV-TIME-09`, `INV-OPT-04`, `INV-RT-03`, `INV-RT-05`. | New test harness files and first characterization fixtures. | Timer/process characterization cases, realtime replay cases, adapter contract cases. | Test harness setup, fixtures, and assertions only. | Any gameplay behavior, balance, schema, or save-format changes. | First failing tests, then passing tests, then regression rerun. | A repeatable characterization suite exists for the highest-risk behavior. | Delete the new harness/fixtures and revert to baseline. | Yes, because the test runner choice affects the whole migration. | Medium | Yes, because later extractions need behavior fences. | High |
| 3. Time and process contracts | Define canonical time semantics and process identity. | Timer correctness is one of the main runtime risks and must be explicit before helper extraction. | Phase 2, source-backed timer evidence, owner decisions on authority. | `App.tsx:627-860, 4450-4477, 7988-8028, 14461-16189, 17912-17945`; `types.ts`; `data/buildings.ts`; `data/destructionWeapons.ts`; `05`, `09`, `10`, `11`, `12`, `15`, `16`. | Absolute timer drift, duplicate completion, duplicate reward, offline catch-up replay, client clock dependence. | `INV-TIME-01` to `INV-TIME-10`, especially `02`, `03`, `05`, `07`, `08`, `09`, `10`. | `App.tsx`, `types.ts`, new `domain/processes` helpers. | `processOfflineTimers`, construction/production/upgrade completion logic, loading gate timing. | Canonical timestamp helpers, process identity contracts, idempotent finalize rules. | Changing durations, rewards, item IDs, or save shapes. | Reload/reconnect tests, clock-skew tests, duplicate completion tests. | Time math is centralized and the process contract is explicit. | Revert helper extraction and keep timer math inline. | Yes, because time authority affects saves and multiplayer sync. | High | Yes, because timer helpers feed all later process phases. | High |
| 4. Pure timer helpers | Extract pure time conversion and normalization helpers. | Once the contract is explicit, pure helpers are the safest code extraction. | Phase 3 and passing timer characterization. | `App.tsx:627-860, 14461-16189`; `types.ts:122-163`; `05`. | Clock skew bugs, repeat application, unit conversion mistakes. | `INV-TIME-02`, `INV-TIME-03`, `INV-TIME-05`, `INV-TIME-07`, `INV-TIME-08`. | New `domain/processes` modules. | `computeEndTime`, `applyCatchUp`, normalization helpers. | Pure functions and exported types only. | Network calls, UI state, side effects, balance changes. | Unit tests and build/typecheck. | Timer helpers are pure and behavior-preserving. | Delete the helper module and restore inline logic. | Yes, if timer shape changes are needed. | Medium-high | Yes, because later phases reuse these helpers. | High |
| 5. Pure merge and reconciliation helpers | Extract snapshot merge policy and reconciliation helpers. | Realtime safety depends on explicit merge rules before adapter and feature extraction. | Phase 3, characterization for stale snapshots and replay ordering. | `App.tsx:7954-8560, 15797-15810, 8054-8256`; `src/pocketbase.ts:1853-2219`; `03`, `09`, `10`, `11`. | Stale snapshot resurrection, stale response overwrite, multi-source drift. | `INV-STATE-03`, `INV-STATE-05`, `INV-STATE-06`, `INV-RT-03`, `INV-RT-07`. | New reconciliation helpers and snapshot policy modules. | Merge policy functions, tombstone handling, snapshot freshness checks. | Pure merge logic with explicit inputs/outputs. | Direct rendering mutations, network calls, balance edits. | Out-of-order event tests and resurrection suppression tests. | Merge behavior is deterministic and isolated. | Revert the helper module and keep the old merge path. | Yes, because merge policy changes affect live multiplayer state. | Medium-high | Yes, because adapter and domain extraction depend on stable reconciliation. | High |
| 6. Types and explicit contracts | Encode the extracted contracts in types. | Types lock down the shape before more modules are split out. | Phases 3-5. | `types.ts`; `data/buildings.ts`; `data/destructionWeapons.ts`; `04`, `05`, `06`, `07`, `08`, `09`, `10`, `11`. | Schema drift, hidden optional fields, confusing payload shapes. | `INV-PB-01`, `INV-PB-02`, `INV-PB-03`, `INV-STATE-01`. | `types.ts` and any new domain type files. | Domain interfaces, discriminated unions, explicit payload shapes. | Type additions and clarifications only. | Changing persisted shapes, IDs, or balance values. | Typecheck and representative build. | The extracted helpers compile against explicit contracts. | Remove the new types and restore the old signatures. | Yes, when a type change affects persisted state. | Medium | Yes, because later phases should use these stable contracts. | High |
| 7. PocketBase adapter boundary | Tighten the adapter boundary so all persistence and realtime traffic is centralized. | The adapter already exists and should be made the hard boundary before more domain extraction. | Phases 3-6, adapter contract tests, current PB evidence. | `src/pocketbase.ts:48-193, 832-1460, 1853-2354, 2392-2418`; `04`, `09`, `11`, `16`. | Partial writes, timeout-after-success, duplicate writes, schema drift, stale reads. | `INV-PB-01` to `INV-PB-05`, `INV-RT-01` to `INV-RT-07`. | `src/pocketbase.ts` and service wrappers. | `getDoc`, `getDocs`, `setDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `requestTreeHit`. | Adapter consolidation and boundary normalization. | New collections, schema changes, or changing raw field semantics. | Schema snapshot, startup smoke, and adapter contract tests. | All persistence flows go through one narrow boundary. | Revert the wrapper changes and keep the old API path. | Yes, because PB contract changes need explicit approval. | High | Yes, because later extraction should call through the adapter only. | High |
| 8. Error classification | Define fail-open, retry, warn, and halt behavior per error class. | The adapter can only be safely extracted if error policy is explicit. | Phase 7 plus timeout/error characterization. | `src/pocketbase.ts:80-99, 953-1028, 1853-2354`; `App.tsx:2976-2991, 6949-7051`. | Cache healing masking corruption, timeout ambiguity, loading hangs. | `INV-RT-05`, `INV-RT-06`, `INV-OPT-04`, `INV-GAME-03`, `INV-PB-05`. | `src/pocketbase.ts` and App error paths. | `handleFirestoreError`, `withTimeout`, `onSnapshot`, window error hooks. | Error classification and logging policy only. | Silencing fatal data loss or changing gameplay outcomes. | 404-vs-network tests, timeout tests, fail-open replay tests. | Each error class has a declared recovery path. | Revert the classification policy and keep the old handlers. | Yes, because recovery behavior affects save integrity. | Medium-high | Yes, because optimistic commands depend on this policy. | High |
| 9. Optimistic command contracts | Standardize optimistic success, rollback, and compensation. | Command boundaries must be explicit before building and production extraction. | Phases 7-8 and rollback characterization. | `App.tsx:5246-5285, 5862-6234, 13777-17252`; `10`, `11`, `16`. | Duplicate write, resource loss, partial write, misclassified rollback. | `INV-OPT-01` to `INV-OPT-08`, `INV-PB-02`. | `App.tsx` command handlers and new command helper modules. | Build, move, repair, upgrade, speed-up, market, social command handlers. | Command wrappers, rollback metadata, compensation contracts. | Balance changes, price changes, duration changes, or schema changes. | Full rollback and partial rollback matrix tests. | Every optimistic command declares its success and rollback path. | Route commands back through the old inline handlers. | Yes, because save-impacting commands need approval. | High | Yes, because domain extraction relies on these contracts. | High |
| 10. Building process extraction | Extract building placement, construction, move, repair, and permit logic. | Building state is the central gameplay surface and should be isolated after command contracts are proven. | Phases 3-9 and building rollback coverage. | `App.tsx:5246-6234, 14068-14186, 14461-14610, 16123-16189, 18283-18606`; `06`, `08`, `10`, `11`, `16`. | Build race, stale snapshot, resource loss, duplicate completion. | `INV-TIME-01`, `INV-STATE-01`, `INV-OPT-02`, `INV-OPT-05`, `INV-GAME-01`. | `App.tsx` and new `domain/buildings`. | `placeBuildingAtTile`, `handleBuildOilRig`, `handleBuildWildQuarry`, `handleMoveClick`, `handleRepair`, `handleBuyBuildingPermit`. | Extraction and wrapper wiring only. | Balance, costs, durations, IDs, schema, or save-format changes. | Building rollback tests and build/typecheck. | Building commands call into a dedicated module without drift. | Keep the logic inline and revert the module. | Yes, because buildings affect persistent saves. | High | Yes, because production and upgrade depend on building state. | High |
| 11. Production process extraction | Extract work-state start, collection, and catch-up logic. | Production depends on canonical timer behavior and is safer after building contracts are stable. | Phases 3-10. | `App.tsx:14618-15590, 15252-15280, 7991-8028`; `07`, `10`, `11`, `15`, `16`. | Duplicate reward, production drift, offline catch-up replay. | `INV-TIME-08`, `INV-TIME-09`, `INV-OPT-01`. | `App.tsx` and new `domain/production`. | `handleStartProductionFromWorld`, `handleCollectProductionFromWorld`, `handleStartProduction`, `handleCollectProduction`. | Extraction and contract wiring only. | Yield changes, work-time changes, or inventory formula changes. | Reload-during-production tests and collect-failure tests. | Production completes and collects exactly as before. | Keep production logic inline and remove the module. | Yes, because production changes resources. | High | Yes, because upgrade/speed-up extraction shares the same timer contract. | High |
| 12. Upgrade and speed-up extraction | Isolate upgrade and speed-up behavior. | Upgrade and speed-up are coupled to timer correctness and paid acceleration, so they belong after production. | Phases 3-11. | `App.tsx:14461-14610, 16123-16189`; `08`, `10`, `11`, `16`. | Duplicate completion, timeout-after-success, balance drift. | `INV-TIME-09`, `INV-OPT-04`, `INV-GAME-01`. | `App.tsx` and the building/process modules. | `handleUpgrade`, `handleSpeedUp`. | Extraction and explicit contracts only. | Changing acceleration cost, upgrade cost, or durations. | Reload-during-upgrade, speed-up-vs-natural-completion tests. | Upgrade and speed-up behavior stays identical. | Keep the inline handlers and revert the helper. | Yes, because paid acceleration and rewards are affected. | High | Yes, because realtime and combat should not inherit upgrade coupling. | High |
| 13. Realtime reconciliation extraction | Separate realtime subscription policy from rendering and command handling. | Realtime merge policy should be stable before combat, world, and social extraction. | Phases 4-9 and replay-order coverage. | `src/pocketbase.ts:1853-2219, 2325-2354`; `App.tsx:4798-4891, 7391-7766, 8395-8534, 9355-9365, 15797-15810`; `09`, `10`, `11`. | Stale snapshot resurrection, duplicate events, reconnect races, fail-open drift. | `INV-RT-01` to `INV-RT-07`, `INV-STATE-05`, `INV-STATE-06`. | `src/pocketbase.ts` and App snapshot orchestration. | `onSnapshot`, zone loaders, `updatePlacedBuildingsFromServer`. | Merge orchestration and subscription composition. | Changing realtime semantics without tests or dropping fallback behavior. | Initial-fetch ordering, duplicate-event, reconnect, and zone-switch tests. | Realtime policy is deterministic and isolated. | Restore the old inline merge orchestration. | Yes, because realtime affects live multiplayer state. | High | Yes, because combat/world/social extraction should reuse this policy. | High |
| 14. Combat and destruction extraction | Isolate combat, destruction, protection, and monster-facing logic. | Combat is destructive and should be extracted only after timer, rollback, and realtime rules are stable. | Phases 3-13 and combat race coverage. | `App.tsx:11469-12752, 15878-16189`; `05`, `10`, `11`, `16`. | Combat/destruction race, duplicate reward, resource loss. | `INV-GAME-02`, `INV-TIME-08`, `INV-TIME-09`. | `App.tsx` and new `domain/combat`. | `handleExplode`, `handleApplyProtection`, monster loop branches. | Combat transition extraction and pure damage math. | Changing damage, shield, destruction, or reward behavior. | Protection-failure and concurrent attack/destruction tests. | Combat transitions are isolated without behavior drift. | Keep combat inline and revert the module. | Yes, because destruction affects saves and player fairness. | High | Yes, because world and social phases should not inherit combat coupling. | High |
| 15. World and resource extraction | Separate trees, map resources, dropped items, and world bootstrap. | World/resource state crosses adapter, realtime, and hook boundaries and should be isolated before social extraction. | Phases 5-14 and world/resource replay coverage. | `App.tsx:4450-5592, 12822-14186, 15797-16520`; `src/pocketbase.ts:2392-2418`; `pb_hooks/main.pb.js`; `pb_hooks/tree_server_utils.js`; `04`, `05`, `09`, `10`, `11`, `16`. | Deletion resurrection, stale update, cross-record corruption, hook drift. | `INV-STATE-03`, `INV-RT-07`, `INV-PB-01`, `INV-PB-02`, `INV-PB-04`. | `App.tsx`, `src/pocketbase.ts`, and new `domain/world`. | Tree-hit flow, map-resource sync, dropped-item pickup, zone loaders. | Extraction and snapshot helpers only. | New resource types, spawn rule changes, or hook contract changes. | Delete-failure, stale-update, and tree-hit hook smoke tests. | World/resource boundaries are isolated and still compatible. | Restore the old inline world flow. | Yes, because world state feeds the live server contract. | High | Yes, because social extraction should reuse the same state model. | High |
| 16. Social systems extraction | Move chat, private messages, presence, clans, and elections out of the shell. | Social systems are coupled, but they are safer after the core state and realtime policies are stable. | Phases 7-15 and duplicate-message/reconnect coverage. | `App.tsx:6848-7840, 7340-7498, 17111-17252`; `03`, `04`, `09`, `10`, `11`, `16`. | Multi-source state drift, stale response overwrite, partial rollback, permission drift. | `INV-STATE-01`, `INV-STATE-03`, `INV-OPT-06`, `INV-RT-02`. | `App.tsx` and new `domain/social`. | Chat handlers, private-message handlers, presence updates, clan/election actions. | Social flow extraction and dedupe helpers. | Changing chat semantics, permissions, or membership rules. | Duplicate-message cleanup, clan rollback, reconnect tests. | Social flows run through a dedicated module. | Keep social code inline and revert the module. | Yes, because social permissions affect user data. | Medium-high | Yes, because shell reduction should only happen after social extraction. | High |
| 17. App shell reduction | Reduce `App.tsx` to orchestration and dependency wiring only. | The shell should be reduced only after the domain modules are stable. | Phases 3-16 and build green. | `App.tsx:2875-3446, 4450-4477, 17912-18191`; `LoadingScreen.tsx:46-47`; `01`, `03`, `10`, `11`, `12`, `15`, `16`. | Monolithic coupling, accidental behavior drift, startup regressions. | `INV-GAME-03`, `INV-PB-03`, `INV-PB-05`. | `App.tsx`, `LoadingScreen.tsx`, feature facades. | Top-level providers, screen composition, event routing. | Wiring and orchestration only. | Direct persistence logic, timer math, merge policy, or domain mutation. | Build, targeted smoke, and shell composition checks. | App.tsx becomes orchestration only. | Restore the previous thin-facade wiring. | Yes, if startup or orchestration changes affect live behavior. | Medium-high | Yes, because the final audit assumes a reduced shell. | High |
| 18. Final compatibility and regression audit | Prove compatibility, legacy records, and regressions are still safe. | This is the end-state gate before a migration branch can be considered stable. | All previous phases, runtime proof, and compatibility fixtures. | `src/pocketbase.ts:832-1460, 1853-2354`; `04`, `11`, `12`, `15`, `16`, `17`. | Legacy compatibility break, schema drift, stale docs, regression gaps. | `INV-PB-03`, `INV-PB-05`, `INV-GAME-03`. | Docs, verification scripts, compatibility fixtures. | Validation helpers only. | Compatibility checks and doc cleanup. | Any gameplay behavior, schema change, or save migration. | Schema snapshot, legacy fixture, multiplayer smoke, build green. | The migration is complete and the current behavior remains compatible. | Revert docs and keep the last verified module boundary set. | Yes, because any compatibility failure blocks deployment. | Medium | No, this is the final audit gate. | Medium |

## First Safe Migration Slice

### Recommended first slice: Verification workflow and repository health

Why this is the safest first slice:

- it touches no gameplay logic;
- it exposes the current command surface before any extraction starts;
- it gives the team a reliable gate for later phases;
- it directly addresses the highest current operational risks: broken Git metadata, missing tests, stale graph assumptions, and incomplete verification.

Exact scope:

- repo-root health checks;
- command inventory and verification matrix;
- schema snapshot and startup smoke checks;
- baseline freshness and source-vs-graph checks;
- first characterization harness decision, without implementing gameplay refactors yet.

Out of scope:

- `App.tsx` refactoring;
- any production code mutation;
- PocketBase schema changes;
- balance, duration, reward, or cost changes;
- destruction, combat, market, or social extraction;
- feature-spec creation;
- implementation work.

Files likely created:

- a minimal verification runner or wrapper if one is approved later;
- characterization test scaffold and fixtures once the test harness is chosen;
- command inventory or verification notes if the team wants a permanent record.

Files likely modified:

- the first repo-health helper script(s), if the team wants them normalized;
- any supporting docs that describe the verification gate.

Behavior that must remain unchanged:

- the game build must still succeed;
- PocketBase data must remain untouched;
- current save data, balance, rewards, and durations must remain unchanged;
- the Graphify map must remain a navigation aid only.

Acceptance criteria:

- the repository has a repeatable health check;
- the team can tell which commands are real and which are missing;
- the baseline and source snapshot are still aligned;
- the next phase has a known starting gate.

Rollback:

- remove the new verification wrapper or notes;
- revert any harness scaffolding that was added for the slice;
- keep game code and data unchanged.

Required owner decisions:

- which test harness should be adopted;
- whether the first persistent verification command should be a repo-health runner, with characterization harness setup deferred to Feature 002.

Suitable first feature-spec title:

- `verification-workflow-and-repository-health`

Follow-up feature-spec title:

- `characterization-tests-and-time-contracts`

## Dependency Graph

phase
-> depends on
-> enables
-> blocked by
-> evidence

- `1. Verification and repository health`
-> baseline docs, current source snapshot, command inventory
-> every later phase
-> Git root unreliability, stale graph, missing commands
-> `package.json`, `tsconfig.json`, `SDD_BASELINE_GRAPHIFY.md`, `graphify-out/GRAPH_REPORT.md`, `check_regressions_worker6.mjs`, `smoke_pocketbase_startup.mjs`, `check_schema.mjs`

- `2. Characterization test foundation`
-> phase 1, approved harness choice
-> all extraction phases
-> no repeatable test runner, missing fixtures
-> `App.test*.tsx`, `test_*.mjs`, `test_*.js`, current baseline docs

- `3. Time and process contracts`
-> characterization coverage for timer/reload behavior
-> phases 4, 11, 12, 14
-> unclear time authority, reward duplication
-> `App.tsx:627-860, 14461-16189, 17912-17945`; `types.ts`; `data/buildings.ts`

- `4. Pure timer helpers`
-> phase 3
-> phases 10-12
-> unit tests for time conversion
-> `App.tsx:627-860, 14461-16189`

- `5. Pure merge and reconciliation helpers`
-> phase 3 and replay-order coverage
-> phases 13-16
-> stale snapshot / stale response races
-> `App.tsx:7954-8560, 15797-15810, 8054-8256`; `src/pocketbase.ts:1853-2219`

- `6. Types and explicit contracts`
-> phases 3-5
-> phases 7-17
-> hidden field drift
-> `types.ts`, `data/buildings.ts`, `data/destructionWeapons.ts`

- `7. PocketBase adapter boundary`
-> phases 6 and adapter contract tests
-> phases 8-16
-> schema drift and partial writes
-> `src/pocketbase.ts:48-193, 832-1460, 1853-2354, 2392-2418`

- `8. Error classification`
-> phase 7
-> phases 9-16
-> timeout ambiguity and cache-healing ambiguity
-> `src/pocketbase.ts:80-99, 953-1028, 1853-2354`

- `9. Optimistic command contracts`
-> phases 7-8 and rollback characterization
-> phases 10-16
-> resource loss, duplicate write, partial write
-> `App.tsx:5246-5285, 5862-6234, 13777-17252`

- `10. Building process extraction`
-> phases 3-9
-> phases 11-17
-> building race and stale snapshot resurrection
-> `App.tsx:5246-6234, 14068-14186, 14461-14610, 16123-16189`

- `11. Production process extraction`
-> phases 3-10
-> phases 12-17
-> duplicate reward and offline catch-up replay
-> `App.tsx:14618-15590, 7991-8028`

- `12. Upgrade and speed-up extraction`
-> phases 3-11
-> phases 13-17
-> paid acceleration drift and timeout-after-success
-> `App.tsx:14461-14610, 16123-16189`

- `13. Realtime reconciliation extraction`
-> phases 4-9
-> phases 14-17
-> stale snapshot resurrection and reconnect races
-> `src/pocketbase.ts:1853-2219`; `App.tsx:8395-8534, 9355-9365`

- `14. Combat and destruction extraction`
-> phases 3-13
-> phases 15-17
-> combat/destruction race and duplicate completion
-> `App.tsx:11469-12752, 15878-16189`

- `15. World and resource extraction`
-> phases 5-14
-> phases 16-17
-> deletion resurrection and hook drift
-> `App.tsx:4450-5592, 12822-14186, 15797-16520`; `pb_hooks/main.pb.js`; `pb_hooks/tree_server_utils.js`

- `16. Social systems extraction`
-> phases 7-15
-> phase 17
-> multi-source drift and partial rollback
-> `App.tsx:6848-7840, 7340-7498, 17111-17252`

- `17. App shell reduction`
-> phases 3-16
-> phase 18
-> monolithic coupling
-> `App.tsx:2875-3446, 4450-4477, 17912-18191`

- `18. Final compatibility and regression audit`
-> all previous phases
-> completion
-> legacy compatibility break and schema drift
-> `src/pocketbase.ts:832-1460, 1853-2354`

## Migration Stop Conditions

| Stop condition | Trigger | Required action | Who decides | Restart criteria |
| --- | --- | --- | --- | --- |
| Git root not reliable | `git` status/diff cannot be trusted in the current environment. | Pause the roadmap execution, re-establish a trustworthy repo root, and re-run the verification gate. | Owner plus reviewer responsible for repo health. | Repo root checks are repeatable and the diff surface is stable. |
| Tests unavailable | No repeatable harness exists for the targeted phase. | Do not start extraction; first create the characterization foundation. | Owner and migration lead. | A repeatable test harness or approved ad hoc harness exists. |
| Baseline contradicts source | A baseline claim cannot be verified against the current source snapshot. | Mark the claim `UNCONFIRMED`, refresh the baseline, and re-audit the source. | Reviewer and owner. | Baseline and source agree again. |
| Unknown PocketBase field semantics | A field shape, default, or persistence rule is unclear. | Stop before changing any related code or data. | Owner plus backend steward. | The field semantics are documented by source or snapshot. |
| Schema change required | The proposed phase cannot proceed without changing collections or field names. | Stop and create a separate schema migration spec. | Owner approval required. | A separate schema spec exists and is approved. |
| Save migration required | Existing player data would need a transformation. | Stop and create a dedicated save migration plan. | Owner approval required. | The save migration is approved and testable. |
| Balance change detected | A phase would alter costs, rewards, durations, or item identities. | Stop immediately; this is outside the roadmap scope. | Owner approval required. | A separate balance or content spec exists. |
| Runtime behavior cannot be characterized | A critical path cannot be observed with source or runtime evidence. | Do not extract the code yet; add characterization coverage first. | Migration lead with owner oversight. | The behavior is characterized and repeatable. |
| Rollback cannot be defined | A phase changes behavior but has no clear revert path. | Stop and define rollback before coding. | Migration lead and reviewer. | Rollback is explicit and verified. |
| Feature scope expands | The work drifts into a subsystem not covered by the current phase. | Split the work, update the roadmap, and re-evaluate dependencies. | Owner plus migration lead. | Scope is re-scoped into a separate phase or spec. |
| Build passes but behavior is not proven | The app bundles successfully but characterization or smoke evidence is missing. | Do not advance to the next phase. | Reviewer and migration lead. | Build and behavior evidence both exist. |
| Source changed after baseline without refresh | Any active source file changes while the roadmap is still being used. | Refresh the source audit and any stale baseline notes first. | Reviewer. | The baseline is refreshed against the current source. |
| Graphify became stale after structural changes | The graph no longer matches the current active source paths. | Rebuild or refresh the graph before relying on it again. | Migration lead. | The graph is rebuilt against the current source snapshot. |

## Corrections Carried Forward

The following corrections are prerequisites for future baseline cleanup and are not applied to `15-invariants.md` in this run:

- `INV-TIME-04` should remain `PARTIALLY_CONFIRMED` until a cross-process runtime test exists;
- `INV-TIME-07` should remain `PARTIALLY_CONFIRMED` until repeated reload/reconnect coverage exists;
- `forceReloadAt` is a reload gate only and is not proof of persistence;
- the weapon-upgrade runtime path remains `UNCONFIRMED`;
- exact-once reward remains `PARTIALLY_CONFIRMED`.

## First Feature-Spec Recommendation

Recommended first feature-spec title:

- `verification-workflow-and-repository-health`

Follow-up feature-spec title:

- `characterization-tests-and-time-contracts`

Why Feature 001 should come first:

- it establishes a trustworthy repo-health gate before any harness setup;
- it records the real verification commands and safe diff workflow;
- it keeps gameplay, schema, and data untouched;
- it gives later phases a reliable baseline to measure against.

Suggested Feature 001 contents:

- business goal: restore a reliable repository-health and verification workflow;
- technical goal: capture the real verification commands, safe diff process, and source-vs-baseline checks;
- scope: repo-root health, baseline freshness, command inventory, schema snapshot, and startup smoke checks;
- out of scope: gameplay changes, PocketBase schema changes, and test-runner installation;
- baseline docs: `12`, `15`, `16`, `17`;
- risks covered: broken Git metadata, missing tests, stale graph assumptions, incomplete verification;
- invariants covered: `INV-GAME-03`, `INV-PB-03`, `INV-PB-05`;
- acceptance criteria: repeatable health gate and a documented verification command surface;
- required owner decisions: whether a future test harness should be added after the gate;
- why it must come first: later phases depend on a trusted repository-health baseline.

Suggested Feature 002 contents:

- business goal: preserve gameplay behavior while enabling safe extraction;
- technical goal: establish repeatable characterization coverage and canonical time/process contracts;
- scope: timer, process, reload, replay, and adapter contract checks;
- out of scope: gameplay balance, schema migration, and any extraction beyond contracts;
- baseline docs: `05`, `09`, `10`, `11`, `12`, `15`, `16`, `17`;
- risks covered: timer drift, duplicate reward, stale snapshot, stale response, load hang, rollback ambiguity;
- invariants covered: `INV-TIME-01` to `INV-TIME-10`, `INV-OPT-01` to `INV-OPT-08`, `INV-RT-01` to `INV-RT-07`;
- acceptance criteria: repeatable tests and a stable contract boundary;
- required owner decisions: test harness choice and authority for timer/process contracts;
- why it must come second: it depends on the repo-health gate from Feature 001.
