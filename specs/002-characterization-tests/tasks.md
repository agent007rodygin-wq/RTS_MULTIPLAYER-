---
description: "Task list for Feature 002 characterization foundation"
---

# Tasks: Characterization Tests

**Input**: Design documents from `/specs/002-characterization-tests/`

**Prerequisites**: `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/`

**Slice labels in this file**: `[US1]` = Slice A (scenarios 1, 2, 10), `[US2]` = Slice B (scenarios 3, 4, 5, 6, 7), `[US3]` = Slice C (scenarios 8, 9)

**Rules**: Every scenario starts as `UNCONFIRMED_RUNTIME_BEHAVIOR`; investigation must precede preliminary classification and known-bug review; preliminary classification must precede seam decision; seam decision must precede fixture design; fixture design must precede controlled observation or deterministic replay evidence; if a minimal seam is required, seam implementation must precede explicit owner acceptance and final promotion; explicit owner acceptance and final promotion must precede permanent test creation; permanent test creation must precede repeatability verification.

**Owner promotion rule**: A promotion task cannot be completed by inference or by the agent writing an approval record alone. Before any promotion task can be completed, the executor must present direct source evidence, controlled observation or deterministic replay evidence, known-bug analysis, a proposed final classification, and explicit owner acceptance in the conversation; only then may the decision be recorded.

## Format

Every task must follow this checklist shape:

`- [ ] T### [P?] [US?] Description with exact file path`

- **[P]**: safe to execute in parallel with other incomplete tasks
- **[US]**: required only for the first-wave slice phases in this file
- If exact implementation paths cannot be finalized yet, the task description must
  say so explicitly and mark the blocker as `OWNER_DECISION`.

---

## Phase 1: Setup and Safety Foundation

**Goal**: Make the characterization effort fail closed before any scenario work starts.

**Independent Test**: A clean `main`, a correct Feature 002 pointer, protected paths, no-live-mutation rules, and stop conditions are all enforced before scenario decomposition begins.

- [X] T001 [P] Encode the clean-`main` and active Feature 002 pointer gate in `tests/characterization/preflight.md` using `main`, `origin/main`, and `.specify/feature.json`; stop on branch mismatch or dirty status. (FR-007, SC-005)
- [X] T002 [P] Encode the allowed/protected path policy in `tests/characterization/path-policy.md` for `App.tsx`, `src/pocketbase.ts`, `types.ts`, `data/**`, `components/**`, `pb_hooks/**`, `public/**`, `package.json`, `package-lock.json`, `tsconfig.json`, and `vite.config.ts`; stop on any unexpected file. (FR-007, SC-005)
- [X] T003 [P] Encode the no-live-PocketBase-mutation rule in `tests/characterization/fixture-boundary.md` and `tests/characterization/preflight.md`; stop if any future step would write live records or player data. (FR-010, SC-007)
- [X] T004 [P] Encode test-artifact output boundaries in `tests/characterization/output-policy.md` so future reports stay feature-local and do not spill into runtime or data paths. (SC-007, SC-009)
- [X] T005 [P] Encode the owner-approval workflow in `tests/characterization/approval-policy.md` so seams, classification promotion, and known-bug exclusions all require explicit owner confirmation. (FR-008, FR-009, SC-008)
- [X] T006 [P] Encode the stop-condition matrix in `tests/characterization/stop-policy.md` for known bugs, schema/config/balance/save changes, broad refactors, hidden network access, and future-wave creep. (FR-007, FR-009, FR-012, SC-005, SC-006, SC-009)

---

## Phase 2: Foundational Prerequisites

**Goal**: Build the shared evidence and policy scaffolding that every scenario will depend on.

**Independent Test**: The feature has a traceable source inventory, a scenario inventory, ownership mapping, a path matrix, a promotion policy, and a seam-decision workflow before any slice implementation starts.

- [X] T007 [P] Build the current-source and baseline anchor inventory plus the confirmed domain group index in `tests/characterization/evidence-index.md`; source anchors must come from `App.tsx`, `src/pocketbase.ts`, `pb_hooks/**`, `types.ts`, `data/**`, and `specs/_baseline/*`. (FR-001, FR-002, FR-003, SC-001, SC-002)
- [X] T008 [P] Build the 10-scenario inventory and freeze-priority order in `tests/characterization/scenario-index.md` with every proposed scenario starting as `UNCONFIRMED_RUNTIME_BEHAVIOR`; stop if any scenario is treated as accepted behavior before investigation or if the order ignores runtime risk. (FR-004, FR-005, FR-006, FR-008, FR-009, SC-004, SC-006)
- [X] T009 [P] Record the current ownership model per scenario in `tests/characterization/ownership-matrix.md` using `specs/_baseline/03-state-ownership.md`, `specs/_baseline/04-pocketbase-contracts.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, and `specs/_baseline/15-invariants.md`. (FR-003, SC-002)
- [X] T010 [P] Record the current persistence/realtime/timer/optimistic path per scenario in `tests/characterization/path-matrix.md`; stop if any scenario would need a broad production refactor to observe it. (FR-003, FR-005, SC-003)
- [X] T011 [P] Record the known-bug check and owner-acceptance gate in `tests/characterization/promotion-policy.md`; do not let `KNOWN_BUG_DO_NOT_FREEZE` become a permanent test. (FR-008, FR-009, SC-008)
- [X] T012 [P] Record the seam-decision workflow in `tests/characterization/seam-boundary.md` and flag only potential owner-approved seams; stop if the seam would change gameplay behavior or become a production refactor. (FR-007, FR-011, SC-005, SC-006)

---

## Phase 3: Minimal Runner Foundation

**Goal**: Define a repository-local runner boundary on the existing Node `.mjs` helper format and finalize the command/package integration without adding dependencies.

**Independent Test**: The runner contract, output shape, fail-closed behavior, and repeatability policy are defined without hidden network access, live PocketBase writes, or framework lock-in.

- [X] T013 Record the final repository-local characterization runner invocation command and package-integration decision in `tests/characterization/runner-toolchain-decision.md`; use the existing Node `.mjs` helper format, permit a direct `node ...` invocation, and keep any `package.json` integration deferred unless separately approved. (FR-006, SC-009)
- [X] T014 Define the repository-local characterization runner contract and terminology boundary in `tests/characterization/runner-contract.md`; the contract must stay compatible with the decision recorded in `tests/characterization/runner-toolchain-decision.md`. (FR-006, FR-010, FR-011, SC-007, SC-009)
- [X] T015 Define the per-scenario result schema in `tests/characterization/results-format.md`; each run must emit classification plus evidence references for every atomic scenario and keep scenario / test / fixture / harness terminology distinct. (FR-008, FR-010, FR-011, SC-006, SC-009)
- [X] T016 Define fail-closed behavior in `tests/characterization/runner-contract.md`; the runner must stop when a fixture, evidence anchor, or approved seam is missing. (FR-009, FR-010, SC-007, SC-008)
- [X] T017 Define stable two-run comparison behavior in `tests/characterization/repeatability-policy.md` so the suite can prove unchanged runs produce the same outcome. (SC-007, SC-009)

---

## Phase 4: Deterministic Fixture Foundation

**Goal**: Define local, reproducible fixture shapes before any scenario implementation starts.

**Independent Test**: The suite has a fixture manifest, clock inputs, reset policy, and provenance rules that avoid credentials, hidden network state, and mutable production player data.

- [X] T018 [P] Define the fixture schema and identity rules in `tests/characterization/fixture-schema.md`; document allowed and forbidden fixture content, naming rules, evidence linkage, and failure conditions. (FR-010, SC-007)
- [X] T019 [P] Define the future fixture manifest documentation in `tests/characterization/fixture-manifest.md`; manifest means Markdown documentation of the future schema only, not `manifest.json` or any machine-readable artifact. (FR-010, SC-007)
- [X] T020 [P] Define the proposed fixture layout conventions in `tests/characterization/fixture-layout.md`; document the path layout only and do not create data-bearing fixture directories. (FR-010, SC-007)
- [X] T021 [P] Define the fixture reset and deterministic replay policy in `tests/characterization/fixture-reset-policy.md`; keep reset local, idempotent, and free of live PocketBase or player-data mutation. (FR-010, SC-007, SC-008)

---

## Phase 5: Slice A - Realtime Merge

**Goal**: Protect stale-snapshot and resurrection behavior first.

**Independent Test**: Scenarios 1, 2, and 10 are each investigated, preliminarily classified, seam-decided, fixture-designed, replay-evidenced, owner-accepted for final promotion, and only then promoted into permanent characterization checks if the current source and owner accept the observed contract.

### Scenario 1 - Initial fetch cannot be overwritten by an older late snapshot

- [X] T022 [P] [US1] Investigate scenario 1 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/09-realtime-sync.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, current ownership model, and observed behavior in `tests/characterization/scenario-001-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [X] T023 [US1] Record the preliminary classification and known-bug review for scenario 1 in `tests/characterization/scenario-001-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [X] T024 [US1] Decide whether scenario 1 needs a seam in `tests/characterization/scenario-001-seam-decision.md`; request a minimal seam only if the stale-snapshot guard cannot be expressed purely. (FR-007, FR-011, SC-005, SC-006)
- [X] T025 [US1] Design the deterministic merge fixture in `tests/characterization/scenario-001-fixture-design.md` after the seam decision is recorded. (FR-010, SC-007)
- [X] T026 [US1] Record the controlled observation or deterministic replay evidence for scenario 1 in `tests/characterization/scenario-001-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. The broad Scenario 1 contract remains open until the actual production boundary is executed through an existing importable pure seam, or a minimal owner-approved test seam is proposed and used, or the contract is formally narrowed by a separate owner decision. (FR-008, FR-009, SC-006, SC-007)
- [X] T027 [US1] Record the explicit owner acceptance for the narrow proven contract in `tests/characterization/scenario-001-owner-acceptance.md`; accept only the active sticky-interaction-window behavior as `CURRENT_ACCEPTED_BEHAVIOR` and keep the broader initial-fetch-versus-late-snapshot contract `UNCONFIRMED_RUNTIME_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [X] T028 [US1] Implement the permanent atomic characterization test for the accepted narrow Scenario 1 contract in `tests/characterization/scenario-001-characterization.mjs`; stop if the test would broaden scope beyond the sticky-interaction window or require live PocketBase data. (FR-008, FR-009, SC-005, SC-008)
- [X] T029 [US1] Run the permanent Scenario 1 characterization check twice from `tests/characterization/scenario-001-characterization.mjs` and confirm stable output, no hidden network access, and no live mutation; record the result in `tests/characterization/scenario-001-repeatability.md`. (SC-007, SC-009)

### Scenario 2 - Deleted building cannot be resurrected by a reconnect snapshot

- [X] T030 [P] [US1] Investigate scenario 2 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/03-state-ownership.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/scenario-002-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [X] T031 [US1] Record the preliminary classification and known-bug review for scenario 2 in `tests/characterization/scenario-002-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [X] T032 [US1] Decide whether scenario 2 needs a seam in `tests/characterization/scenario-002-seam-decision.md`; request a minimal seam only if the existing merge path cannot represent the terminal state. (FR-007, FR-011, SC-005, SC-006)
- [X] T033 [US1] Design the tombstone/reconnect fixture boundary in `tests/characterization/scenario-002-fixture-design.md` after the seam decision is recorded. (FR-010, SC-007)
- [X] T034 [US1] Record the controlled observation or deterministic replay evidence for scenario 2 in `tests/characterization/scenario-002-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [X] T035 [US1] Record the explicit owner acceptance for the narrow proven contract in `tests/characterization/scenario-002-owner-acceptance.md`; accept only the local tombstone/reconnect behavior as `CURRENT_ACCEPTED_BEHAVIOR` and keep the broader deletion resurrection contract `UNCONFIRMED_RUNTIME_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [X] T036 [US1] Implement the permanent atomic characterization test for scenario 2 in `tests/characterization/scenario-002-characterization.mjs`; stop if the test would broaden beyond the accepted tombstone/reconnect contract or require live PocketBase data. (FR-008, FR-009, SC-005, SC-008)
- [X] T037 [US1] Run the scenario-2 check twice from `tests/characterization/scenario-002-characterization.mjs` and confirm the tombstone/reconnect result stays unchanged across repeated runs; record the result in `tests/characterization/scenario-002-repeatability.md`. (SC-007, SC-009)

### Scenario 3 - Local terminal-state retention first

- [X] T038 [P] [US1] Investigate scenario 10 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/scenario-003-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [X] T039 [US1] Record the preliminary classification and known-bug review for the destroyed-building terminal-state target in `tests/characterization/scenario-003-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [X] T040 [US1] Decide whether the destroyed-building terminal-state target needs a seam in `tests/characterization/scenario-003-seam-decision.md`; request a minimal seam only if the current merge path cannot keep the terminal state from being overwritten by a later stale snapshot. (FR-007, FR-011, SC-005, SC-006)
- [X] T041 [US1] Design the local-terminal-state fixture in `tests/characterization/scenario-003-fixture-design.md` after the narrowing decision is recorded. (FR-010, SC-007)
- [X] T042 [US1] Record the controlled observation or deterministic replay evidence for the local-terminal-state subcase in `tests/characterization/scenario-003-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [X] T043 [US1] Record the explicit owner acceptance and final promotion decision for the local-terminal-state subcase in `tests/characterization/scenario-003-owner-acceptance.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [X] T044 [US1] Implement the permanent atomic characterization test for the local-terminal-state subcase in `tests/characterization/scenario-003-characterization.mjs` only after T043 exists; stop if the test would reintroduce ghost-building behavior or require live PocketBase writes. (FR-008, FR-009, SC-005, SC-008)
- [X] T045 [US1] Run the scenario-3 check twice from `tests/characterization/scenario-003-characterization.mjs` and confirm the terminal state does not regress under a stale snapshot; record the result in `tests/characterization/scenario-003-repeatability.md`. (SC-007, SC-009)

## Phase 6: Slice B - Timers and Completion

**Goal**: Protect the timer, completion, reward, and reload/reconnect contract before any lower-risk surface enters the MVP.

**Independent Test**: Scenarios 3, 4, 5, 6, and 7 are each investigated, preliminarily classified, seam-decided, fixture-designed, replay-evidenced, seam-implemented when required, owner-accepted for final promotion, and only then promoted into permanent characterization checks if the current source and owner accept the observed contract.

### Scenario 3 - Persisted process whose end time passed completes exactly once

- [x] T046 [P] [US2] Investigate scenario 3 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/08-upgrade-system.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/slice-b/scenario-03-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [x] T047 [US2] Record the owner narrowing decision for scenario 3 in `tests/characterization/slice-b/scenario-03-contract-narrowing.md`; select the construction-completion first continuation and stop until the task chain is narrowed to that subcase. (FR-008, FR-009, SC-006, SC-008)
- [x] T048 [US2] Decide whether the construction-completion subcase needs a seam in `tests/characterization/slice-b/scenario-03-seam.md`; request a minimal seam only if the current construction completion boundary cannot be observed without a minimal helper. (FR-007, FR-011, SC-005, SC-006)
- [x] T049 [US2] Design the frozen timestamp fixture for the construction-completion subcase in `tests/characterization/slice-b/scenario-03-fixture-design.md` after the seam decision is recorded. (FR-010, SC-007)
- [x] T050 [US2] Record the controlled observation or deterministic replay evidence for the construction-completion subcase in `tests/characterization/slice-b/scenario-03-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [x] T051 [US2] Record the explicit owner acceptance and final promotion decision for the construction-completion subcase in `tests/characterization/slice-b/scenario-03-promotion.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T052 [US2] Implement the permanent atomic characterization test for the construction-completion subcase in `tests/characterization/slice-b/scenario-03.mjs` and record the characterization note in `tests/characterization/slice-b/scenario-03-characterization.md` only after T051 exists; stop if the test would alter construction completion semantics, reward timing, or live data. (FR-008, FR-009, SC-005, SC-008)
- [x] T053 [US2] Run the construction-completion check twice from `tests/characterization/slice-b/scenario-03.mjs` and confirm the construction completion transition occurs exactly once on unchanged runs; record the result in `tests/characterization/slice-b/scenario-03-repeatability.md`. (SC-007, SC-009)

### Scenario 4 - Offline catch-up cannot duplicate completion or reward

- [x] T054 [US2] Freeze the accepted narrow construction-completion invariants in `tests/characterization/slice-b/scenario-03-invariants.md` and capture the supporting note in `tests/characterization/slice-b/scenario-03-invariants-note.md`; keep the freeze limited to the owner-accepted local construction contract and stop if it broadens into broader persisted-process behavior. (SC-007, SC-009)
- [X] T055 [US2] Record the preliminary classification and known-bug review for scenario 4 in `tests/characterization/slice-b/scenario-04-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [X] T056 [US2] Decide whether scenario 4 needs a seam in `tests/characterization/slice-b/scenario-04-seam.md`; request a minimal seam only if the current catch-up path cannot show the reward fence. (FR-007, FR-011, SC-005, SC-006)
- [x] T057 [US2] Design the offline catch-up fixture in `tests/characterization/slice-b/scenario-04-fixture.json` after the seam decision is recorded. (FR-010, SC-007)
- [x] T058 [US2] Record the controlled observation or deterministic replay evidence for scenario 4 in `tests/characterization/slice-b/scenario-04-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [x] T059 [US2] Record the explicit owner acceptance and final promotion decision for scenario 4 in `tests/characterization/slice-b/scenario-04-promotion.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T060 [US2] Implement the permanent atomic characterization test for scenario 4 in `tests/characterization/slice-b/scenario-04.mjs` only after T059 exists; stop if the test would introduce duplicate reward logic or live writes. (FR-008, FR-009, SC-005, SC-008)
- [x] T061 [US2] Run the scenario-4 check twice from `tests/characterization/slice-b/scenario-04.mjs` and confirm completion and reward are both single-shot; record the result in `tests/characterization/slice-b/scenario-04-repeatability.md`. (SC-007, SC-009)

### Scenario 5 - Construction state survives reload and converges from persisted end time

- [x] T062 [P] [US2] Investigate scenario 5 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/08-upgrade-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/slice-b/scenario-05-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [x] T063 [US2] Record the preliminary classification and known-bug review for scenario 5 in `tests/characterization/slice-b/scenario-05-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [x] T064 [US2] Decide whether scenario 5 needs a seam in `tests/characterization/slice-b/scenario-05-seam.md`; request a minimal seam only if construction convergence cannot be observed through the existing boundary. (FR-007, FR-011, SC-005, SC-006)
- [x] T065 [US2] Design the reload fixture in `tests/characterization/slice-b/scenario-05-fixture.json` after the seam decision is recorded. (FR-010, SC-007)
- [x] T066 [US2] Record the controlled observation or deterministic replay evidence for scenario 5 in `tests/characterization/slice-b/scenario-05-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [x] T067 [US2] Record the explicit owner acceptance and final promotion decision for scenario 5 in `tests/characterization/slice-b/scenario-05-promotion.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T068 [US2] Implement the permanent atomic characterization test for scenario 5 in `tests/characterization/slice-b/scenario-05.mjs` only after T067 exists; stop if the timer would reset, complete early, or require live PocketBase mutation. (FR-008, FR-009, SC-005, SC-008)
- [x] T069 [US2] Run the scenario-5 check twice from `tests/characterization/slice-b/scenario-05.mjs` and confirm the construction timer remains stable across reloads; record the result in `tests/characterization/slice-b/scenario-05-repeatability.md`. (SC-007, SC-009)

### Scenario 6 - Production completion survives reconnect and rewards once

- [x] T070 [P] [US2] Investigate scenario 6 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/slice-b/scenario-06-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [x] T071 [US2] Record the preliminary classification and known-bug review for scenario 6 in `tests/characterization/slice-b/scenario-06-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [x] T072 [US2] Decide whether scenario 6 needs a seam in `tests/characterization/slice-b/scenario-06-seam.md`; request a minimal seam only if the current production boundary cannot show the one-time reward fence. (FR-007, FR-011, SC-005, SC-006)
- [x] T073 [US2] Design the reconnect fixture in `tests/characterization/slice-b/scenario-06-fixture.json` after the seam decision is recorded. (FR-010, SC-007)
- [x] T074 [US2] Record the controlled observation or deterministic replay evidence for scenario 6 in `tests/characterization/slice-b/scenario-06-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
#### Scenario 6 dependency repair - reward seam blocker

- [x] T111 [US2] Implement the minimal pure deterministic reward-eligibility seam in `src/game/buildings/resolveLocalRewardEligibility.js` and delegate the reward fence in `App.tsx`; first add the focused TDD test in `tests/characterization/slice-b/scenario-06-reward-seam.mjs`, then use TDD and fresh verification, and stop if the source-backed fence is not `workState = finished` -> `workState = idle`, if eligibility cannot be separated from reward mutation, if extraction would change payout behavior, if extraction would require a new persistent field, if extraction would require live PocketBase mutation at the test boundary, or if construction, production completion, reconnect, or snapshot behavior would be pulled into the helper. Verify with `node tests/characterization/slice-b/scenario-06-reward-seam.mjs`, `node --check tests/characterization/slice-b/scenario-06-reward-seam.mjs`, `node --check src/game/buildings/resolveLocalRewardEligibility.js`, `npm run lint`, `node check_regressions_worker6.mjs`, `git diff --check`, and `git status --short --untracked-files=all`. (FR-007, FR-011, SC-005, SC-006)

- [x] T075 [US2] Record the explicit owner acceptance and final promotion decision for scenario 6 in `tests/characterization/slice-b/scenario-06-promotion.md`; stop until T111 is complete and the replay evidence has been rerun against the real importable seam so the owner can accept actual production-bound evidence as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T076 [US2] Implement the permanent atomic characterization test for scenario 6 in `tests/characterization/slice-b/scenario-06.mjs` only after T075 exists; stop if reward delivery could duplicate or if the fixture would need live writes. (FR-008, FR-009, SC-005, SC-008)
  - [x] T077 [US2] Run the scenario-6 check twice from `tests/characterization/slice-b/scenario-06.mjs` and confirm finished state and reward stay single-shot; record the result in `tests/characterization/slice-b/scenario-06-repeatability.md`. (SC-007, SC-009)

### Scenario 7 - Upgrade completion survives reconnect without duplicate transformation

- [x] T078 [P] [US2] Investigate scenario 7 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/08-upgrade-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/slice-b/scenario-07-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [x] T079 [US2] Record the preliminary classification and known-bug review for scenario 7 in `tests/characterization/slice-b/scenario-07-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [x] T080 [US2] Decide whether scenario 7 needs a seam in `tests/characterization/slice-b/scenario-07-seam.md`; request a minimal seam only if the current upgrade boundary cannot show the one-time transformation. (FR-007, FR-011, SC-005, SC-006)
#### Scenario 7 dependency repair - upgrade seam blocker

- [x] T112 [US2] Implement the minimal pure deterministic upgrade-transformation seam in `src/game/buildings/resolveLocalUpgradeTransformation.js` and delegate the upgrade fence in `App.tsx`; first add the focused TDD test in `tests/characterization/slice-b/scenario-07-upgrade-seam.mjs`, then use TDD and fresh verification, and stop if the source-backed upgrade transformation cannot be separated from cost mutation, persistence, optimistic UI, reconnect/snapshot behavior, or if a new persistent field or synthetic transformation marker would be required. Verify with `node tests/characterization/slice-b/scenario-07-upgrade-seam.mjs`, `node --check tests/characterization/slice-b/scenario-07-upgrade-seam.mjs`, `node --check src/game/buildings/resolveLocalUpgradeTransformation.js`, `npm run lint`, `node check_regressions_worker6.mjs`, `git diff --check`, and `git status --short --untracked-files=all`. (FR-007, FR-011, SC-005, SC-006)

- [x] T081 [US2] Design the reconnect fixture in `tests/characterization/slice-b/scenario-07-fixture.json` after T112 is complete and the seam decision is recorded; the existing blocked fixture may only become a completed replayable fixture after T112 is complete and the second-pass no-transformation contract is proven against the real helper. (FR-010, SC-007)
- [x] T082 [US2] Record the controlled observation or deterministic replay evidence for scenario 7 in `tests/characterization/slice-b/scenario-07-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [x] T083 [US2] Record the explicit owner acceptance and final promotion decision for scenario 7 in `tests/characterization/slice-b/scenario-07-promotion.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T084 [US2] Implement the permanent atomic characterization test for scenario 7 in `tests/characterization/slice-b/scenario-07.mjs` only after T083 exists; stop if the upgrade would transform twice, re-spend resources, or require live data. (FR-008, FR-009, SC-005, SC-008)
- [x] T085 [US2] Run the scenario-7 check twice from `tests/characterization/slice-b/scenario-07.mjs` and confirm the building transform occurs once; record the result in `tests/characterization/slice-b/scenario-07-repeatability.md`. (SC-007, SC-009)

## Phase 7: Slice C - Optimistic Commands

**Goal**: Protect rollback completeness and late-ack ordering for local-first commands.

**Independent Test**: Scenarios 8 and 9 are each investigated, preliminarily classified, seam-decided, fixture-designed, replay-evidenced, owner-accepted for final promotion, and only then promoted into permanent characterization checks if the current source and owner accept the observed contract.

### Scenario 8 - Rejected optimistic building placement restores the pre-command state

- [x] T086 [P] [US3] Investigate scenario 8 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/03-state-ownership.md`, `specs/_baseline/04-pocketbase-contracts.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/slice-c/scenario-08-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [x] T087 [US3] Record the preliminary classification and known-bug review for scenario 8 in `tests/characterization/slice-c/scenario-08-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [x] T088 [US3] Decide whether scenario 8 needs a seam in `tests/characterization/slice-c/scenario-08-seam.md`; request a minimal seam only if the current optimistic boundary cannot show the full rollback. (FR-007, FR-011, SC-005, SC-006)
- [x] T113 [US3] Implement the minimal pure deterministic rejected-placement rollback seam in `src/game/buildings/resolveRejectedOptimisticPlacementRollback.js` and delegate only the rejected-placement rollback projection in `App.tsx`; first add the focused TDD test in `tests/characterization/slice-c/scenario-08-rollback-seam.mjs`, then use TDD and fresh verification. Stop if exact pre-command restoration cannot be separated from PocketBase writes, React state mutation, realtime/reconnect behavior, timeout ambiguity, multi-client authority, or if a new persistent field or synthetic rollback token would be required. (FR-007, FR-011, SC-005, SC-006)
- [x] T089 [US3] Design the pre-state, reject, and rollback-completeness fixture in `tests/characterization/slice-c/scenario-08-fixture.json` only after T113 is complete; a blocked fixture draft may exist before then only if clearly labeled blocked and kept unpromoted. (FR-010, SC-007)
- [x] T090 [US3] Record the controlled observation or deterministic replay evidence for scenario 8 in `tests/characterization/slice-c/scenario-08-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [x] T091 [US3] Record the explicit owner acceptance and final promotion decision for scenario 8 in `tests/characterization/slice-c/scenario-08-promotion.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T092 [US3] Implement the permanent atomic characterization test for scenario 8 in `tests/characterization/slice-c/scenario-08.mjs` only after T091 exists; stop if the rollback is partial, if occupancy/resources are not restored, or if live mutation would be required. (FR-008, FR-009, SC-005, SC-008)
- [x] T093 [US3] Run the scenario-8 check twice from `tests/characterization/slice-c/scenario-08.mjs` and confirm the rejected placement restores the full pre-command state; record the result in `tests/characterization/slice-c/scenario-08-repeatability.md`. (SC-007, SC-009)

### Scenario 9 - Late command acknowledgement cannot overwrite a newer local intent

- [x] T094 [P] [US3] Investigate scenario 9 against `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/03-state-ownership.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, and `specs/_baseline/15-invariants.md`; capture source anchors, ownership model, and observed behavior in `tests/characterization/slice-c/scenario-09-source-audit.md`. (FR-001, FR-003, SC-001, SC-006)
- [x] T095 [US3] Record the preliminary classification and known-bug review for scenario 9 in `tests/characterization/slice-c/scenario-09-classification.md`; stop if the behavior is still `UNCONFIRMED_RUNTIME_BEHAVIOR` or `KNOWN_BUG_DO_NOT_FREEZE`. (FR-008, FR-009, SC-006, SC-008)
- [x] T096 [US3] Decide whether scenario 9 needs a seam in `tests/characterization/slice-c/scenario-09-seam.md`; request a minimal seam only if the current reconciliation boundary cannot express the late-response fence. (FR-007, FR-011, SC-005, SC-006)
- [x] T114 [US3] Implement the minimal pure deterministic late-response reconciliation seam in `src/game/buildings/resolveLateAcknowledgementReconciliation.js` and delegate the late-response fence in `App.tsx`; first add the focused TDD test in `tests/characterization/slice-c/scenario-09-reconciliation-seam.mjs`, then use TDD and fresh verification. Stop if the source-backed late-response reconciliation cannot be separated from PocketBase writes, React setters, refs/caches, subscriptions, retries, timeout handling, reconnect, network ordering, collection iteration, multi-client authority, or if a new persistent field or synthetic acknowledgement token would be required. Verify with `node tests/characterization/slice-c/scenario-09-reconciliation-seam.mjs`, `node --check tests/characterization/slice-c/scenario-09-reconciliation-seam.mjs`, `node --check src/game/buildings/resolveLateAcknowledgementReconciliation.js`, `npm run lint`, `node check_regressions_worker6.mjs`, `git diff --check`, and `git status --short --untracked-files=all`. (FR-007, FR-011, SC-005, SC-006)
- [x] T097 [US3] Design the pre-state, delayed-ack, and newer-intent fixture in `tests/characterization/slice-c/scenario-09-fixture.json` after T114 is complete and the seam decision is recorded; blocked fixture design is allowed before T114 only if clearly labeled blocked. (FR-010, SC-007)
- [x] T098 [US3] Record the controlled observation or deterministic replay evidence for scenario 9 in `tests/characterization/slice-c/scenario-09-replay-evidence.md`; keep the result unpromoted until the owner acceptance step is recorded. (FR-008, FR-009, SC-006, SC-007)
- [x] T099 [US3] Record the explicit owner acceptance and final promotion decision for scenario 9 in `tests/characterization/slice-c/scenario-09-promotion.md`; stop until the owner accepts the observed contract as `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR`. (FR-008, FR-009, SC-008)
- [x] T100 [US3] Implement the permanent atomic characterization test for scenario 9 in `tests/characterization/slice-c/scenario-09.mjs` only after T099 exists; stop if a late ack can roll back newer state, if duplicate-submit protection is absent, or if live writes are required. (FR-008, FR-009, SC-005, SC-008)
- [x] T101 [US3] Run the scenario-9 check twice from `tests/characterization/slice-c/scenario-09.mjs` and confirm the old ack never wins over newer intent; record the result in `tests/characterization/slice-c/scenario-09-repeatability.md`. (SC-007, SC-009)

## Phase 8: Determinism and Suite Verification

**Goal**: Prove the whole first-wave suite is stable, closed, and free of hidden mutation.

**Independent Test**: The complete suite runs twice with identical fixtures and produces identical scenario-by-scenario results, while rejecting hidden network access, live PocketBase writes, and unpromoted or known-bug scenarios.

- [x] T115 Implement the repository-local first-wave characterization runner in `tests/characterization/runner.mjs` according to `tests/characterization/runner-contract.md` and `tests/characterization/runner-toolchain-decision.md`; run the complete ten-scenario first-wave suite from existing deterministic local characterization inputs, emit stable scenario-by-scenario results, and fail closed when required evidence, fixture, or seam data is unavailable, without live PocketBase access, player-data mutation, or runtime changes. (SC-007, SC-009)
- [x] T103 Run the entire first-wave suite twice from `tests/characterization/runner.mjs` with the same deterministic fixtures and compare scenario-by-scenario results only after T115 exists. (SC-007, SC-009)
- [x] T116 [US3] Implement fail-closed validation in `tests/characterization/runner.mjs` for required runner-owned `fixtureReference`, `seamDecision`, and meaningful evidence metadata so a first-wave scenario cannot normalize to PASS when those inputs are missing or invalid; emit a deterministic blocking reason and non-zero suite exit for invalid metadata, preserve the existing ten-scenario ordering, report shape, offline execution, and no-mutation guarantees, and do not treat the scenario entrypoint path alone as sufficient evidence. This task is an implementation prerequisite for T104. (FR-010, SC-007, SC-008)
- [x] T104 Verify the suite fails closed in `tests/characterization/runner.mjs` only after T115 exists when deterministic fixture information, fixture evidence, fixture metadata, or seam data is missing; confirm no live PocketBase or player-data mutation occurs. (FR-010, SC-007, SC-008)
- [x] T105 Verify every permanent test in `tests/characterization/promotion-policy.md` was promoted from investigation and that no known bug was silently frozen. (FR-008, FR-009, SC-008)
- [x] T106 Verify the MVP boundary in `tests/characterization/scenario-index.md` and `tests/characterization/results-format.md` so P2/P3 surfaces never enter the first wave. (FR-012, SC-004, SC-005)

---

## Phase 9: Documentation and Final MVP Gate

**Goal**: Lock the final contract only after the actual runner behavior is known.

**Independent Test**: Quickstart, contracts, traceability, and final evidence match the implemented runner and fixture boundaries without widening scope or introducing future-wave surfaces.

- [ ] T107 Update `specs/002-characterization-tests/quickstart.md` only after the real repository-defined characterization command is known; keep the runner/toolchain implementation-neutral until then. (SC-009)
- [ ] T108 Sync `specs/002-characterization-tests/contracts/runner-contract.md`, `specs/002-characterization-tests/contracts/fixture-boundary.md`, `specs/002-characterization-tests/contracts/promotion-policy.md`, and `specs/002-characterization-tests/contracts/seam-boundary.md` with the implemented boundaries only if implementation differs from planning. (FR-006, FR-010, SC-002, SC-007)
- [ ] T109 Produce final traceability from scenario to source, fixture, seam, classification, and test in `tests/characterization/traceability.md`; keep any future Feature 003 or runtime refactor blocked until Feature 002 passes. (SC-001, SC-002, SC-006)
- [ ] T110 Finalize risk-appropriate verification notes and completion evidence in `tests/characterization/reports/final.md`; keep the MVP boundary and explicit future-wave exclusions intact. (SC-004, SC-005, SC-009)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: can start immediately after the clean-main and feature-pointer verification passes.
- **Phase 2**: depends on Phase 1 and blocks all later phases.
- **Phase 3**: depends on Phase 2 and blocks runner implementation until T013 records the final invocation command and integration policy.
- **Phase 4**: depends on Phase 2 and blocks scenario implementation until fixtures are defined.
- **Phase 5**: depends on Phases 2, 3, and 4 and must finish before Phase 6 begins.
- **Phase 6**: depends on Phase 5 and must finish before Phase 7 begins.
- **Phase 7**: depends on Phase 6 and must finish before Phase 8 begins.
- **Phase 8**: depends on all first-wave scenario tasks and the runner-contract boundary.
- **Phase 9**: depends on the runner contract, fixture policy, and the final verification pass.

### Slice Order

- **Slice A**: scenarios 1, 2, 10
- **Slice B**: scenarios 3, 4, 5, 6, 7
- **Slice C**: scenarios 8, 9

### Within Each Scenario

- Investigation precedes preliminary classification and known-bug review.
- Preliminary classification and known-bug review precedes seam decision.
- Seam decision precedes fixture design.
- Fixture design precedes controlled observation or deterministic replay evidence.
- Controlled observation or deterministic replay evidence precedes explicit owner acceptance and final promotion decision.
- Explicit owner acceptance and final promotion decision precedes permanent test creation.
- Permanent test creation precedes repeatability verification.
- Owner approval is required before any minimal runtime seam.

### Parallel Opportunities

- Phase 1 policy tasks can run in parallel because they touch separate safety artifacts.
- Phase 2 inventory tasks can run in parallel because they map different matrices.
- Phase 4 fixture-policy tasks can run in parallel because they define separate fixture concerns.
- Within each slice, the scenario investigation tasks can run in parallel once the foundational phases are complete.
- Within each slice, the classification tasks can run in parallel only after their own investigations are complete.
- Within each slice, the seam-decision tasks can run in parallel only after classification is complete.
- Within each slice, the fixture-design tasks can run in parallel once seam decisions are complete.
- Within each slice, the controlled-evidence tasks can run in parallel once fixtures are ready.
- Within each slice, the promotion tasks can run in parallel only after their own evidence tasks are complete.
- Within each slice, the permanent test tasks can run in parallel only after promotion is complete.
- Within each slice, the repeatability tasks can run in parallel only after their permanent tests are complete.

---

## Implementation Strategy

### MVP First

1. Complete Phases 1-4.
2. Complete Slice A first.
3. Stop and validate Slice A before touching timers or optimistic commands.
4. Complete Slice B next.
5. Stop and validate Slice B before touching Slice C.
6. Complete Slice C last.
7. Run suite-level determinism checks.
8. Finish only after traceability and documentation are aligned with the implemented runner.

### Incremental Delivery

1. Safety foundation
2. Shared evidence and promotion policy
3. Runner boundary
4. Fixture boundary
5. Slice A
6. Slice B
7. Slice C
8. Suite determinism
9. Documentation and MVP gate

---

## Traceability Matrices

### 1. Requirement Coverage Matrix

| Requirement | Covered by tasks |
| --- | --- |
| FR-001 | T007, T022, T030, T038, T046, T062, T070, T078, T086, T094, T108 |
| FR-002 | T007, T009 |
| FR-003 | T009, T010, T022, T030, T038, T046, T062, T070, T078, T086, T094 |
| FR-004 | T008, T105 |
| FR-005 | T008, T010, T105 |
| FR-006 | T008, T013, T014, T015, T017 |
| FR-007 | T001, T002, T003, T004, T005, T006, T111, T112, T113, T114 |
| FR-008 | T008, T011, T023, T027, T031, T035, T039, T043, T047, T051, T055, T059, T063, T067, T071, T075, T079, T083, T087, T091, T095, T099 |
| FR-009 | T005, T011, T023, T027, T031, T035, T039, T043, T047, T051, T055, T059, T063, T067, T071, T075, T079, T083, T087, T091, T095, T099 |
| FR-010 | T003, T004, T014, T015, T016, T018, T019, T020, T021, T025, T033, T041, T049, T057, T065, T073, T081, T089, T097, T103, T104, T107, T115, T116 |
| FR-011 | T012, T014, T015, T024, T032, T040, T048, T056, T064, T072, T080, T088, T096, T111, T112, T113, T114 |
| FR-012 | T006, T008, T105 |

### 2. Success-Criteria Coverage Matrix

| Success criterion | Covered by tasks |
| --- | --- |
| SC-001 | T007, T022, T030, T038, T046, T062, T070, T078, T086, T094 |
| SC-002 | T009, T014, T108 |
| SC-003 | T010, T016, T028, T036, T044, T052, T060, T068, T076, T084, T092, T100 |
| SC-004 | T008, T105 |
| SC-005 | T006, T024, T025, T028, T032, T033, T036, T040, T041, T044, T048, T049, T052, T056, T057, T060, T064, T065, T068, T072, T073, T076, T080, T081, T084, T088, T089, T092, T096, T097, T100, T102, T104, T109, T111, T112, T113, T114 |
| SC-006 | T007, T008, T009, T022, T023, T026, T030, T031, T034, T038, T039, T042, T046, T047, T050, T055, T058, T062, T063, T066, T070, T071, T074, T078, T079, T082, T086, T087, T090, T094, T095, T098, T103, T111, T112, T113, T114 |
| SC-007 | T003, T004, T015, T016, T017, T018, T019, T020, T025, T029, T033, T037, T041, T045, T049, T053, T054, T057, T061, T065, T069, T073, T077, T081, T085, T089, T093, T097, T101, T102, T103, T104, T115, T116 |
| SC-008 | T005, T011, T023, T027, T031, T035, T039, T043, T047, T051, T055, T059, T063, T067, T071, T075, T079, T083, T087, T091, T095, T099, T104, T116 |
| SC-009 | T004, T013, T014, T017, T029, T037, T045, T053, T054, T061, T069, T077, T085, T093, T101, T102, T105, T106, T109, T115 |

### 3. Scenario-to-Evidence Matrix

| Scenario | Evidence anchors expected in investigation tasks |
| --- | --- |
| 1 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/15-invariants.md` |
| 2 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/03-state-ownership.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 3 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/08-upgrade-system.md`, `specs/_baseline/15-invariants.md` |
| 4 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 5 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/08-upgrade-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 6 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 7 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/08-upgrade-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 8 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/03-state-ownership.md`, `specs/_baseline/04-pocketbase-contracts.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 9 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/03-state-ownership.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |
| 10 | `App.tsx`, `src/pocketbase.ts`, `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/09-realtime-sync.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md`, `specs/_baseline/15-invariants.md` |

### 4. Scenario-to-Fixture Matrix

| Scenario | Planned fixture path |
| --- | --- |
| 1 | `tests/characterization/slice-a/scenario-01-fixture.json` |
| 2 | `tests/characterization/slice-a/scenario-02-fixture.json` |
| 3 | `tests/characterization/slice-b/scenario-03-fixture-design.md` |
| 4 | `tests/characterization/slice-b/scenario-04-fixture.json` |
| 5 | `tests/characterization/slice-b/scenario-05-fixture.json` |
| 6 | `tests/characterization/slice-b/scenario-06-fixture.json` |
| 7 | `tests/characterization/slice-b/scenario-07-fixture.json` |
| 8 | `tests/characterization/slice-c/scenario-08-fixture.json` |
| 9 | `tests/characterization/slice-c/scenario-09-fixture.json` |
| 10 | `tests/characterization/slice-a/scenario-10-fixture.json` |

### 5. Scenario-to-Seam-Decision Matrix

| Scenario | Initial seam decision |
| --- | --- |
| 1 | `tests/characterization/slice-a/scenario-01-seam.md` - pure seam candidate; owner-approved seam only if the merge boundary cannot express the stale-snapshot guard |
| 2 | `tests/characterization/slice-a/scenario-02-seam.md` - pure seam candidate; owner-approved seam only if the merge boundary cannot express the terminal state |
| 3 | `tests/characterization/slice-b/scenario-03-seam.md` - potential owner-approved seam candidate if the completion boundary cannot be observed purely |
| 4 | `tests/characterization/slice-b/scenario-04-seam.md` - potential owner-approved seam candidate if the reward fence cannot be observed purely |
| 5 | `tests/characterization/slice-b/scenario-05-seam.md` - potential owner-approved seam candidate if construction convergence cannot be observed purely |
| 6 | `tests/characterization/slice-b/scenario-06-seam.md` - potential owner-approved seam candidate if the reward fence cannot be observed purely |
| 7 | `tests/characterization/slice-b/scenario-07-seam.md` - potential owner-approved seam candidate if the upgrade fence cannot be observed purely |
| 8 | `tests/characterization/slice-c/scenario-08-seam.md` - pure seam candidate; owner-approved seam only if rollback completeness cannot be observed purely |
| 9 | `tests/characterization/slice-c/scenario-09-seam.md` - pure seam candidate; owner-approved seam only if the reconciliation boundary cannot express late-ack ordering |
| 10 | `tests/characterization/slice-a/scenario-10-seam.md` - pure seam candidate; owner-approved seam only if stale-snapshot suppression cannot be observed purely |

### 6. Owner-Approval Matrix

| Scenario | Approval required when |
| --- | --- |
| 1 | when `tests/characterization/slice-a/scenario-01-promotion.md` is written or a seam must be extracted |
| 2 | when `tests/characterization/scenario-002-owner-acceptance.md` is written or a seam must be extracted |
| 3 | when `tests/characterization/slice-b/scenario-03-promotion.md` is written or a minimal completion seam is required |
| 4 | when `tests/characterization/slice-b/scenario-04-promotion.md` is written or a minimal reward-fence seam is required |
| 5 | when `tests/characterization/slice-b/scenario-05-promotion.md` is written or a minimal construction seam is required |
| 6 | when `tests/characterization/slice-b/scenario-06-promotion.md` is written or a minimal reward-eligibility seam is required |
| 7 | when `tests/characterization/slice-b/scenario-07-promotion.md` is written or a minimal upgrade seam is required |
| 8 | when `tests/characterization/slice-c/scenario-08-promotion.md` is written or rollback cannot be observed purely |
| 9 | when `tests/characterization/slice-c/scenario-09-promotion.md` is written or reconciliation cannot be observed purely |
| 10 | when `tests/characterization/slice-a/scenario-10-promotion.md` is written or tombstone suppression cannot be observed purely |

### 7. Stop-Condition Matrix

| Condition | Task groups that must stop |
| --- | --- |
| Source evidence does not confirm behavior | T022-T101 |
| Current behavior is a known bug | T022-T101 |
| Controlled observation or deterministic replay evidence is missing | T083, T091, T099 |
| Owner acceptance is missing | T083, T091, T099 |
| Live PocketBase mutation would be required | T003, T016, T018-T021, T028, T036, T044, T052, T060, T076, T084, T092, T100, T102-T109 |
| Production player data would be used | T003, T016, T018-T021, T028, T036, T044, T052, T060, T076, T084, T092, T100, T102-T109 |
| Broad runtime refactor would be needed | T012, T024, T032, T040, T048, T056, T064, T072, T080, T088, T096 |
| Schema/config/balance/save-format change required | T006, T012, T015, T028, T036, T044, T052, T060, T076, T084, T092, T100 |
| Seam changes gameplay behavior | T012, T024, T032, T040, T048, T056, T064, T072, T080, T088, T096 |
| Unexpected file changes occur | T001, T002, T004, T006, T102-T109 |
| P2/P3 surface enters MVP | T006, T008, T105 |
| Toolchain cannot be selected without production dependency changes | T013 |
| Deterministic reset cannot be guaranteed | T018-T021, T029, T037, T045, T053, T061, T069, T077, T085, T093, T101, T102 |

### 8. Parallel Execution Opportunities

| Opportunity | Notes |
| --- | --- |
| Phase 1 policy tasks | `T001-T006` can proceed in parallel because they touch separate safety artifacts. |
| Phase 2 inventory tasks | `T007-T012` can proceed in parallel once the baseline docs are loaded. |
| Phase 4 fixture tasks | `T018-T021` can proceed in parallel because they define separate fixture concerns. |
| Slice A investigations | `T022`, `T030`, and `T038` can proceed in parallel after the foundational phases are complete. |
| Slice B investigations | `T046`, `T054`, `T062`, `T070`, and `T078` can proceed in parallel after the foundational phases are complete. |
| Slice C investigations | `T086` and `T094` can proceed in parallel after the foundational phases are complete. |

### 9. MVP Boundary

- Realtime merge: scenarios 1, 2, 10
- Timers and completion: scenarios 3, 4, 5, 6, 7
- Optimistic commands: scenarios 8, 9
- All scenarios remain `UNCONFIRMED_RUNTIME_BEHAVIOR` until source, evidence, known-bug status, and owner acceptance are confirmed
- No combat, economy, social/meta, chat, clans, leaderboards, elections, market, assets, FPS, or performance work enters the MVP

### 10. Explicit Future-Wave Exclusions

- combat and monster AI
- economy and harvesting
- social and meta systems
- chat
- clans
- leaderboards
- elections
- market
- assets
- FPS or performance
- any broader runtime refactor not needed for the first-wave slices
