# Tasks: verification-workflow-and-repository-health

**Input**: Design documents from `/specs/001-verification-workflow-and-repository-health/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/repository-health-workflow.md](./contracts/repository-health-workflow.md), [quickstart.md](./quickstart.md)

**Goal**: Deliver one safe Windows PowerShell repository-health workflow for Feature 001 that emits a text summary, JSON report, final status, exit code, and Feature 002 gate decision.

**Safety rule**: No helper is assumed to be read-only until audited. The workflow must classify helpers first, then auto-run only the classes that are explicitly allowed. `npm run build` and `check_build.mjs` are local-write helpers and must stay behind `-AllowBuild` plus `-AllowLocalWrites`. Networked helpers must stay behind the network opt-in flags in the matrix below.

## Helper Classification Matrix

This matrix is the safety gate for auto-execution. Audit tasks must confirm the class before the workflow is allowed to run that helper automatically.

| Helper | Audit target | Provisional class | Default auto-run | Opt-in gate |
| --- | --- | --- | --- | --- |
| `npm run lint` | `package.json` / TypeScript compile path | `READ_ONLY_LOCAL` | Yes | None |
| `check_regressions_worker6.mjs` | `check_regressions_worker6.mjs` | `READ_ONLY_LOCAL` | Yes | None |
| `check_schema.mjs` | `check_schema.mjs` | `NETWORK_READ_ONLY` | No | `-AllowNetworkChecks` or `-AllowSchema` |
| `smoke_pocketbase_startup.mjs` | `smoke_pocketbase_startup.mjs` | `NETWORK_READ_ONLY` | No | `-AllowNetworkChecks` |
| `verify_world.mjs` | `verify_world.mjs` | `NETWORK_READ_ONLY` | No | `-AllowNetworkChecks` or `-AllowWorld` |
| `check_build.mjs` | `check_build.mjs` | `LOCAL_WRITE` | No | `-AllowBuild` and `-AllowLocalWrites` |
| `npm run build` | `package.json` | `LOCAL_WRITE` | No | `-AllowBuild` and `-AllowLocalWrites` |

## Stop Conditions

The workflow must stop, set `BLOCKED`, and explain why if any of these are true:

| Trigger | Required action |
| --- | --- |
| Helper class is still `UNKNOWN` | Do not auto-run the helper and stop the workflow slice that depends on it. |
| Helper would write local files without `-AllowLocalWrites` | Skip the helper and keep the run non-destructive. |
| Network helper is not allowed by the active opt-in flags | Skip the helper and record the skip reason. |
| Git repair or Git metadata repair would be needed | Stop immediately; do not fix `.git` automatically. |
| Schema mutation is detected or required | Stop; do not attempt to write PocketBase schema or data. |
| Report path escapes the feature-local report directory | Stop; do not write outside the feature output folder. |
| Protected files change during the workflow | Stop and mark the run as failed/non-compliant. |
| Any task would require `package.json`, `tsconfig.json`, `App.tsx`, or `src/pocketbase.ts` edits | Stop and require owner approval before proceeding. |

## Format

Every task must follow this checklist form:

`- [ ] T### [P?] [US?] Description with file path`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the workflow entry point and its report target.

- [x] T001 Create the root PowerShell entry point scaffold in `verify_repository_health.ps1` with repo-root resolution, parameter parsing, status enums, and report path constants. (FR-001, FR-008 | US1 | SC-001 | verification: dry run produces no writes)
- [x] T002 Add feature-local report output handling in `verify_repository_health.ps1` so the workflow writes `specs/001-verification-workflow-and-repository-health/reports/repository-health.json` and rejects paths outside the feature folder. (FR-008, FR-009, FR-011 | US1 | SC-001, SC-006 | verification: path guard proves the report stays feature-local)
- [x] T003 Add the helper classification registry and opt-in flag matrix scaffold in `verify_repository_health.ps1` for `-AllowNetworkChecks`, `-AllowSchema`, `-AllowWorld`, `-AllowBuild`, and `-AllowLocalWrites`. (FR-004, FR-006, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: matrix entries exist before any helper auto-run)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Audit helper behavior, define stop conditions, and make the workflow safe before any auto-run.

**Critical**: No user story work should begin until the helper safety audit and stop conditions are in place.

- [x] T004 [P] Audit `npm run lint` in `package.json` and classify it in `verify_repository_health.ps1` as `READ_ONLY_LOCAL` or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves no file writes)
- [x] T005 [P] Verify `npm run lint` classification by confirming the TypeScript no-emit path has no local writes and no network mutations. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: dry run leaves the workspace unchanged)
- [x] T006 [P] Audit `check_regressions_worker6.mjs` in `check_regressions_worker6.mjs` and classify it in `verify_repository_health.ps1` as `READ_ONLY_LOCAL` or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves it only reads source text)
- [x] T007 [P] Verify `check_regressions_worker6.mjs` classification by confirming it only reads `App.tsx` and exits on pattern failures without writing files. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: no local file mutation)
- [x] T008 [P] Audit `check_schema.mjs` in `check_schema.mjs` and classify it in `verify_repository_health.ps1` as `NETWORK_READ_ONLY`, `NETWORK_WRITE`, or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves the PocketBase path)
- [x] T009 [P] Verify `check_schema.mjs` classification by confirming it only reads schema state and does not write local files or PocketBase data. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: helper remains read-only in practice)
- [x] T010 [P] Audit `smoke_pocketbase_startup.mjs` in `smoke_pocketbase_startup.mjs` and classify it in `verify_repository_health.ps1` as `NETWORK_READ_ONLY`, `NETWORK_WRITE`, or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves the health-check path)
- [x] T011 [P] Verify `smoke_pocketbase_startup.mjs` classification by confirming it only reads PocketBase health and collections without mutating local files or live data. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: no write verbs or file writes occur)
- [x] T012 [P] Audit `verify_world.mjs` in `verify_world.mjs` and classify it in `verify_repository_health.ps1` as `NETWORK_READ_ONLY`, `NETWORK_WRITE`, or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves the world-sanity path)
- [x] T013 [P] Verify `verify_world.mjs` classification by confirming it only reads world state and does not mutate local files or PocketBase data. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: no state writes)
- [x] T014 [P] Audit `check_build.mjs` in `check_build.mjs` and classify it in `verify_repository_health.ps1` as `LOCAL_WRITE`, `NETWORK_WRITE`, or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves it shells out to build)
- [x] T015 [P] Verify `check_build.mjs` classification by confirming it stays behind `-AllowBuild` and `-AllowLocalWrites`. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: the helper is not auto-run by default)
- [x] T016 [P] Audit `npm run build` in `package.json` and classify it in `verify_repository_health.ps1` as `LOCAL_WRITE`, `NETWORK_WRITE`, or `UNKNOWN`. (FR-004, FR-009, FR-010 | Foundational | SC-001, SC-006 | verification: source inspection proves dist output can be written)
- [x] T017 [P] Verify `npm run build` classification by confirming it stays behind `-AllowBuild` and `-AllowLocalWrites` and does not auto-run in safe mode. (FR-004, FR-009, FR-011 | Foundational | SC-001, SC-006 | verification: build is skipped unless explicitly enabled)
- [x] T018 Add stop conditions in `verify_repository_health.ps1` for `UNKNOWN` helper status, required writes without opt-in, Git repair, schema mutation, report-path escape, and protected-path mutations. (FR-006, FR-009, FR-010, FR-011 | Foundational | SC-003, SC-006 | verification: each trigger produces a hard stop) <!-- enforced and verified by synthetic validation cases; dispatcher still deferred to T021 -->
- [x] T019 Add an owner-approval gate in `verify_repository_health.ps1` for any future need to touch `package.json`, `tsconfig.json`, `App.tsx`, `src/pocketbase.ts`, or baseline docs outside this feature. (FR-009, FR-011 | Foundational | SC-006 | verification: out-of-scope edits are blocked) <!-- enforced and verified by synthetic validation cases -->
- [x] T020 Add the helper audit summary and safety result fields to the JSON report and console output in `verify_repository_health.ps1` so helper class, opt-in gate, and skip reason are visible before execution. (FR-004, FR-008, FR-010 | Foundational | SC-001, SC-006 | verification: summary shows helper class and gate state)

**Checkpoint**: The workflow can say which helpers are safe, which need flags, and which must stop the run.

---

## Phase 3: User Story 1 - Single repo-health gate (Priority: P1) MVP

**Goal**: Run one documented command that emits a clear health decision plus console and JSON output.

**Independent Test**: Run `.\verify_repository_health.ps1` in the current workspace and confirm it prints a readable summary, writes the JSON report, and returns the documented exit code.

- [x] T021 [US1] Implement the default helper dispatcher in `verify_repository_health.ps1` so only audited `READ_ONLY_LOCAL` helpers auto-run and network/local-write helpers stay skipped unless the matching opt-in flags are present. (FR-001, FR-004, FR-007, FR-008, FR-010, FR-011 | US1 | SC-001, SC-002, SC-006 | verification: safe default run executes only allowed helpers)
- [x] T022 [US1] Verify the default dispatcher by running the workflow without opt-in flags and confirming skipped checks are explicit in the console and JSON report. (FR-008, FR-010, FR-011 | US1 | SC-001, SC-002, SC-006 | verification: the report shows executed versus skipped checks)
- [x] T023 [US1] Implement the local-write path in `verify_repository_health.ps1` so `npm run build` and `check_build.mjs` run only with `-AllowBuild` plus `-AllowLocalWrites`. (FR-009, FR-011 | US1 | SC-006 | verification: build helpers do not auto-run) <!-- verified via synthetic dispatch-policy cases; the slice intentionally does not execute build helpers -->
- [x] T024 [US1] Verify the local-write path by running once without the flags and once with them, confirming the first run skips the build helpers and the second run permits them. (FR-009, FR-011 | US1 | SC-006 | verification: flag-gated build behavior is stable) <!-- verified via default run plus synthetic dispatch-policy cases; build helpers were not executed per slice rules -->
- [x] T025 [US1] Implement console summary formatting and status aggregation in `verify_repository_health.ps1` for executed, skipped, and failed checks. (FR-007, FR-008, FR-010 | US1 | SC-001, SC-002 | verification: the text summary lists all check outcomes)
- [x] T026 [US1] Verify console summary and exit-code mapping in `verify_repository_health.ps1` for `PASS`, `WARN`, `BLOCKED`, and `FAIL`. (FR-007, FR-008 | US1 | SC-001, SC-003, SC-004 | verification: each status maps to the documented exit code)
- [x] T027 [US1] Implement JSON report serialization in `verify_repository_health.ps1` with `runId`, `generatedAt`, `overallStatus`, `exitCode`, `checks`, `summary`, `git`, `freshness`, `excludedPaths`, `protectedPaths`, and `notes`. (FR-008, FR-010 | US1 | SC-001, SC-002 | verification: the JSON shape matches the contract)
- [x] T028 [US1] Verify JSON report stability by reading the generated file twice on an unchanged workspace and confirming the report content and decision remain stable. (FR-011, SC-005 | US1 | SC-005 | verification: repeated runs do not drift)
- [x] T029 [US1] Implement Feature 002 gate decision logic in `verify_repository_health.ps1` so only `PASS` or owner-approved `WARN` categories can allow Feature 002. (FR-012 | US1 | SC-007 | verification: the gate decision is explicit in the JSON report)
- [x] T030 [US1] Verify Feature 002 stays denied for `BLOCKED` and `FAIL`, and only allows approved `PASS` or approved `WARN` states. (FR-012 | US1 | SC-007 | verification: the gate cannot open on an unapproved status) <!-- verified via synthetic gate-matrix cases -->

**Checkpoint**: The workflow can run end to end and produce the main repository-health artifact.

---

## Phase 4: User Story 2 - Honest Git fallback (Priority: P1)

**Goal**: Detect Git trust truthfully and fall back safely when Git is unavailable or untrustworthy.

**Independent Test**: Run the workflow in a shell where Git is unavailable or the repo root is not trustworthy and confirm the result is `BLOCKED` with an explicit fallback reason.

- [x] T031 [US2] Implement Git trust detection in `verify_repository_health.ps1` using `Get-Command git`, `git rev-parse --show-toplevel`, `git status --short`, and `git diff --name-only` when Git is available. (FR-002, FR-003, FR-010 | US2 | SC-003 | verification: trusted repo-root evidence is captured only when Git is usable)
- [x] T032 [US2] Verify trusted Git behavior by confirming the report records the repo root, status, and diff evidence only when Git is available and trustworthy. (FR-002, FR-003 | US2 | SC-003 | verification: trusted Git path is explicit) <!-- verified via synthetic trusted fixture and live report fields -->
- [x] T033 [US2] Implement fallback-only handling in `verify_repository_health.ps1` so missing `git.exe`, empty `.git`, partial `.git`, or an untrustworthy repo root become `BLOCKED` instead of a false pass. (FR-003, FR-010, FR-011 | US2 | SC-003 | verification: the run never repairs Git automatically) <!-- verified via current workspace and controlled fixture cases -->
- [x] T034 [US2] Verify fallback-only handling on a fake-Git fixture workspace and confirm the workflow reports `BLOCKED` with a clear fallback reason and no repair attempt. (FR-003, FR-011 | US2 | SC-003 | verification: fake Git case is rejected safely) <!-- verified via controlled temp fixtures and validation suite -->
- [x] T035 [P] Add fake-Git, empty-repo, and missing-git fixture recipes to `quickstart.md` so the repo-health gate can be exercised without risking the real workspace. (FR-003, FR-011 | US2 | SC-003 | verification: fixture steps are reproducible and non-destructive)
- [x] T036 [P] Verify the fake-Git fixture recipes in `quickstart.md` by walking the blocked path and confirming the expected console and JSON results. (FR-003, FR-011 | US2 | SC-003 | verification: blocked outcomes are repeatable) <!-- verified via gitValidation PASS and updated quickstart recipes -->

**Checkpoint**: The workflow never pretends Git changesets were verified when they were not.

---

## Phase 5: User Story 3 - Baseline freshness gate (Priority: P2)

**Goal**: Detect stale baseline or stale Graphify navigation and report source drift clearly.

**Independent Test**: Change source after the baseline or use stale Graphify artifacts, then run the workflow and confirm it reports the mismatch and does not return a false `PASS`.

- [x] T037 [US3] Implement baseline freshness checks in `verify_repository_health.ps1` against `specs/_baseline/12-target-architecture.md` through `specs/_baseline/17-traceability-index.md` and the feature-local design docs. (FR-005, FR-010, FR-011 | US3 | SC-004, SC-005 | verification: source-vs-baseline comparison is explicit)
- [x] T038 [US3] Verify baseline freshness by re-running the workflow on an unchanged workspace and confirming the decision, check list, and drift notes stay stable. (FR-011 | US3 | SC-005 | verification: repeated baseline checks do not drift)
- [x] T039 [US3] Implement Graphify freshness and active-source-surface checks in `verify_repository_health.ps1` using `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `graphify-out/.graphify_analysis.json`, and `graphify-out/.graphify_labels.json`. (FR-005, FR-006, FR-010, FR-011 | US3 | SC-004, SC-005 | verification: graph freshness is derived from the active source surface)
- [x] T040 [US3] Verify stale-graph and stale-source fixtures by confirming the workflow reports `WARN` or `BLOCKED` as appropriate and never produces a false `PASS`. (FR-005, FR-006, FR-011 | US3 | SC-004 | verification: stale graph and drift fixtures fail safely) <!-- verified via controlled freshness validation cases -->
- [x] T041 [P] Add schema-drift, PocketBase-unavailable, and world-sanity fixture recipes to `quickstart.md` so source freshness and runtime-sensitive checks can be validated in controlled scenarios. (FR-005, FR-010, FR-011 | US3 | SC-004, SC-006 | verification: fixture steps are documented and repeatable)
- [x] T042 [P] Verify the fixture recipes by confirming the expected statuses for schema drift, PocketBase unavailability, and world-sanity mismatches. (FR-005, FR-011 | US3 | SC-004, SC-005 | verification: fixture outcomes match the contract) <!-- verified through controlled synthetic runtime fixture cases -->

**Checkpoint**: The workflow can tell the difference between a current navigation map and stale or excluded source surfaces.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and contract alignment.

- [x] T043 [P] Update [contracts/repository-health-workflow.md](./contracts/repository-health-workflow.md) and [quickstart.md](./quickstart.md) with the final flag names, helper classes, exit codes, and report fields discovered during the helper audit and story work. (FR-001, FR-008, FR-012 | US1 | SC-001, SC-007 | verification: docs match the final workflow contract) <!-- synchronized with actual flags, report sections, and synthetic runtime validation -->
- [x] T044 [P] Run the no-touch verification pass against `App.tsx`, `src/pocketbase.ts`, `package.json`, `tsconfig.json`, `graphify-out/`, and the protected paths, then confirm the workflow only creates the planned report artifact. (FR-009, FR-011 | Cross-cutting | SC-006 | verification: protected files remain unchanged) <!-- verified by workflow snapshot comparison; no protected-path mutations were reported -->
- [x] T045 [P] Add the requirement coverage matrix and task traceability summary to `tasks.md` so every FR, SC, task range, and verification path can be cross-referenced before implementation. (FR-001 to FR-012 | Cross-cutting | SC-001 to SC-007 | verification: every requirement maps to at least one task range) <!-- finalized with the runtime fixture and no-touch slices included -->
- [x] T046 [P] Finalize the helper safety audit summary in `tasks.md` so no helper is treated as read-only without audit and no auto-run path bypasses the opt-in matrix. (FR-004, FR-009, FR-010, FR-011 | Cross-cutting | SC-001, SC-006 | verification: audit summary and opt-in matrix are complete) <!-- all seven helpers remain audited and gated -->
- [x] T047 [P] Confirm all tasks remain checklist-formatted, sequentially numbered, and scoped to the existing feature without touching production code. (FR-009, FR-011 | Cross-cutting | SC-006 | verification: the task list stays implementation-only) <!-- checklist formatting, numbering, and scope preserved -->

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies, can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Final Phase)**: Depends on the story work being complete.

### Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational and is the MVP slice.
- **User Story 2 (P1)**: Can start after Foundational and independently verifies Git fallback behavior.
- **User Story 3 (P2)**: Can start after Foundational and independently verifies baseline and Graphify freshness.

### Within Each Story

- Implement the core behavior first.
- Emit the report fields second.
- Verify the story with its independent test scenario last.

---

## Parallel Opportunities

- T004-T017 can be split across helper audits and verification checks because they touch different helper files.
- T035-T036 can run independently of the baseline freshness work once the Git fallback slice is stable.
- T041-T042 can run in parallel with the stale-graph verification once the fixture recipes are written.
- T043-T047 can run in parallel with each other once the workflow behavior is stable enough to freeze the contract.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3.
4. Stop and validate the repo-health workflow before extending Git fallback or freshness logic.

### Incremental Delivery

1. Ship the safety matrix and helper audits first.
2. Add the safe default workflow next.
3. Add Git fallback and fixture coverage after that.
4. Finish with baseline and Graphify freshness, then quickstart validation and the no-touch verification pass.

---

## Requirement Coverage Matrix

| Requirement / criterion | Task ranges | Verification emphasis |
| --- | --- | --- |
| FR-001, FR-007, FR-008, SC-001, SC-002 | T001, T021, T025-T030, T043 | Single PowerShell entry point, console summary, JSON summary, gate decision |
| FR-002, FR-003, SC-003 | T031-T036 | Git trust, fallback-only mode, fake-Git fixture behavior |
| FR-004, FR-010, FR-011 | T003-T020, T021-T024, T045-T046 | Helper audit, skipped checks visibility, safe repeated runs |
| FR-005, FR-006, SC-004, SC-005 | T037-T042 | Baseline freshness, Graphify freshness, source-surface drift, synthetic runtime fixture validation |
| FR-009, SC-006 | T002, T018-T019, T023-T024, T044 | No gameplay / schema / config mutation, protected-path guard, no-touch pass |
| FR-012, SC-007 | T029-T030, T043 | Feature 002 gate logic and approved WARN categories |

---

## Traceability Summary

Each task line above already carries `FR`, `US`, `SC`, and `verification` references. The matrix below shows the high-level mapping by task block so the implementation can be audited quickly.

| Task block | Primary FRs | Primary user story | Primary success criteria | Primary verification |
| --- | --- | --- | --- | --- |
| T001-T003 | FR-001, FR-008, FR-009, FR-010 | US1 / Foundation | SC-001, SC-006 | Safe scaffold and feature-local report path |
| T004-T020 | FR-004, FR-006, FR-009, FR-010, FR-011 | Foundational | SC-001, SC-003, SC-006 | Helper audit, matrix, stop conditions |
| T021-T030 | FR-001, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012 | US1 | SC-001, SC-002, SC-006, SC-007 | Default pipeline, report, exit codes, gate decision |
| T031-T036 | FR-002, FR-003, FR-010, FR-011 | US2 | SC-003 | Trusted Git path, fallback-only path, fake-Git fixtures |
| T037-T042 | FR-005, FR-006, FR-010, FR-011 | US3 | SC-004, SC-005 | Baseline freshness, Graphify freshness, drift fixtures |
| T043-T047 | FR-001, FR-004, FR-008, FR-009, FR-011, FR-012 | Cross-cutting | SC-001, SC-006, SC-007 | Contract alignment, no-touch pass, requirement coverage, helper safety audit finalization |
