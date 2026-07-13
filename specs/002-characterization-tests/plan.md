# Implementation Plan: Characterization Tests

**Branch**: `002-characterization-tests` | **Date**: 2026-07-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-characterization-tests/spec.md`

## Summary

This feature turns Feature 002 into a controlled characterization program for the MMO runtime. The MVP is a deterministic local runner plus a fixture boundary that can investigate 10 atomic P1 scenarios without touching live PocketBase or player data. Each scenario starts as `UNCONFIRMED_RUNTIME_BEHAVIOR`; promotion to a permanent classification only happens after direct source audit, controlled observation or deterministic fixture evidence, known-bug exclusion, and owner acceptance. P2 and P3 surfaces stay out of MVP.

## Technical Context

**Language/Version**: TypeScript 5 on the existing React 19 + Vite 6 codebase, with a repository-local characterization runner.

**Primary Dependencies**: existing repo modules (`App.tsx`, `src/pocketbase.ts`, `pb_hooks/**`, `data/**`, `types.ts`, `LoadingScreen.tsx`), plus a repository-local characterization runner for future execution. No new production dependency is required for planning.

**Storage**: feature-local docs in `specs/002-characterization-tests/` and future deterministic fixture files under the same feature area. Live PocketBase is inspection-only; it is not part of fixture seeding.

**Testing**: a repeatable characterization command will be defined during implementation. The suite itself must be repeatable on two consecutive unchanged runs and must report one pass/fail result per atomic scenario.

**Target Platform**: local desktop workspace and the current web app runtime as the system under observation. No browser automation is required unless a scenario later proves it needs a UI seam.

**Project Type**: web application with backend hooks and realtime persistence.

**Performance Goals**: deterministic reruns, no live-network mutation, and a 10-scenario cap for the first wave. The command should be fast enough to rerun during investigation without changing the fixture set.

**Constraints**: no runtime code changes in this planning pass; no live PocketBase mutation; no `App.tsx` refactor; no `src/pocketbase.ts` refactor; no schema, balance, or saved-data changes; no P2/P3 coverage in MVP; any required production test seam must be minimal, owner-approved, and separately tracked.

**Scale/Scope**: one feature, one runner, one deterministic fixture boundary, 10 atomic P1 scenarios, and a future path for additional waves only after the MVP is accepted.

## Constitution Check

GATE: PASS

- Spec-first and evidence-always is preserved.
- Server authority and data integrity are preserved.
- Temporal correctness and idempotency are central to the MVP.
- Compatibility and player save safety are preserved by the no-live-mutation and no-schema-change rules.
- Incremental change and verification are preserved because this pass is documentation-only and the runner is intentionally bounded.

## Project Structure

### Documentation for this feature

```text
specs/002-characterization-tests/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
`-- contracts/
    |-- runner-contract.md
    |-- fixture-boundary.md
    |-- promotion-policy.md
    `-- seam-boundary.md
```

### Current runtime surface used as evidence only

```text
App.tsx
LoadingScreen.tsx
src/pocketbase.ts
pb_hooks/
data/
types.ts
specs/_baseline/
graphify-out/
```

**Structure Decision**: keep the current runtime surface unchanged and add only feature-local planning documents under `specs/002-characterization-tests/`. This feature plans a doc-only characterization foundation; it does not introduce new runtime modules in the planning pass.

## Execution Slices

1. Slice A - Realtime merge: scenarios 1, 2, and 10. Build the merge and tombstone fixtures first because they define the stale-snapshot boundary.
2. Slice B - Timers and completion: scenarios 3, 4, 5, 6, and 7. Build frozen timestamp fixtures and deterministic catch-up/reconnect replay next.
3. Slice C - Optimistic commands: scenarios 8 and 9. Build the pre-state, local mutation, reject, and late-ack replay boundary last.
4. Confirm the 10 first-wave scenarios and their source anchors from the spec and baseline docs.
5. Define the deterministic local fixture boundary and the repeatable runner contract.
6. Keep P2/P3 surfaces out of the first wave and do not widen the runner to chat, clan, market, combat AI, FPS, assets, tree rewards, or elections.

## Complexity Tracking

No constitution violations require justification in this plan. If a later seam would require a production refactor, schema change, or live PocketBase mutation, that seam is out of MVP and must be re-scoped or owner-approved before implementation.
