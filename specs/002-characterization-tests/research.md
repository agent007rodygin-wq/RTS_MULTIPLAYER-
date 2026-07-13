# Research Notes: Characterization Tests

## Skills Opened

- `speckit-plan`: to generate the planning package for Feature 002 without creating tasks or implementation artifacts.
- `basing-project-navigation`: to keep the audit on live source and real baseline anchors instead of backups or Graphify alone.
- `basing-change-safety`: to keep the plan narrow, reversible, and free of runtime changes.
- `basing-debug-investigation`: to require a root-cause style investigation before freezing behavior.
- `basing-state-ownership`: to separate server authority, mirrors, caches, tombstones, and optimistic state.
- `basing-pocketbase-contracts`: to keep the PocketBase boundary explicit and compatibility-safe.
- `basing-realtime-sync`: to reason about initial fetch ordering, stale snapshots, retries, and tombstones.
- `basing-process-time`: to reason about absolute timestamps, offline catch-up, and exactly-once completion.
- `basing-optimistic-commands`: to separate pre-state, local mutation, ack, rollback, and late-response policy.
- `basing-verification`: to define a single repeatable command and the checks that prove the plan stays doc-only.

## Baseline Documents Used

- `.specify/memory/constitution.md`
- `specs/_baseline/00-project-overview.md`
- `specs/_baseline/01-current-architecture.md`
- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/12-target-architecture.md`
- `specs/_baseline/14-test-strategy.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## Graphify Surfaces Investigated

Graphify was treated as navigation only. The surfaces that matter for this plan are the same ones already confirmed by the baselines:

- `App.tsx` orchestration and runtime shell
- `src/pocketbase.ts` persistence and realtime adapter
- realtime merge and stale-snapshot handling
- timer and offline catch-up flows
- optimistic command flows
- state ownership and tombstone handling

## Promotion Model

All 10 first-wave scenarios begin as `UNCONFIRMED_RUNTIME_BEHAVIOR`.

A scenario may move to `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR` only after all of the following are true:

- direct current-source confirmation
- controlled observation or deterministic fixture evidence
- confirmation that the behavior is not a known bug
- owner acceptance of the observed contract

`KNOWN_BUG_DO_NOT_FREEZE` never enters the permanent characterization suite until a separate fix decision exists.

`TARGET_INVARIANT_REQUIRES_OWNER_DECISION` is a design warning, not a promotion path.

## Seam Map

| Track | Scenarios | Notes |
| --- | --- | --- |
| Pure seam candidates | 1, 2, 8, 9, 10 | These can usually be expressed as deterministic merge, tombstone, or optimistic-command replay helpers if the current source already exposes the right boundary. |
| Potential owner-approved seam candidates | 3, 4, 5, 6, 7 | These touch persisted process completion or reward delivery and may need a minimal runtime seam if the current source does not already expose a pure helper. |

## First-Wave Slices

| Slice | Scenarios | Fixture shape | Why this order |
| --- | --- | --- | --- |
| A - Realtime merge | 1, 2, 10 | newer local/server state plus older incoming snapshot | These define the stale-snapshot and resurrection boundary that protects the rest of the suite. |
| B - Timers and completion | 3, 4, 5, 6, 7 | frozen timestamps, deterministic clock, reload/reconnect replay | These are the most important idempotency and reward-delivery risks in the project. |
| C - Optimistic commands | 8, 9 | pre-state, local mutation, server reject or late ack | These establish the rollback and late-response contract for local-first commands. |

## Scenario Investigation Matrix

| # | Scenario | Group | Initial class | Likely seam | Investigation path | Owner approval boundary |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Initial fetch cannot be overwritten by an older late snapshot. | Realtime and Persistence | UNCONFIRMED_RUNTIME_BEHAVIOR | Pure seam candidate | Replay initial-fetch and stale-snapshot ordering against adapter merge fixtures using `src/pocketbase.ts` and `specs/_baseline/09-realtime-sync.md`. | Only if the merge helper must be extracted. |
| 2 | Deleted building cannot be resurrected by a reconnect snapshot. | Realtime and Building Lifecycle | UNCONFIRMED_RUNTIME_BEHAVIOR | Pure seam candidate | Replay tombstone and reconnect ordering against the building merge path using `App.tsx`, `src/pocketbase.ts`, and `03/04/06/09/10/11/15`. | Only if current merge logic needs a tiny wrapper. |
| 3 | Persisted process whose end time passed completes exactly once. | Temporal Gameplay | UNCONFIRMED_RUNTIME_BEHAVIOR | Owner-approved seam candidate | Freeze a persisted end-time fixture and observe the finalize path without live PocketBase writes using `05/07/08/15`. | Yes, because it touches completion state. |
| 4 | Offline catch-up cannot duplicate completion or reward. | Temporal Gameplay | UNCONFIRMED_RUNTIME_BEHAVIOR | Owner-approved seam candidate | Invoke catch-up twice on the same frozen fixture and compare emitted completion and reward state using `05/07/10/11/15`. | Yes, because it touches reward emission. |
| 5 | Construction state survives reload and converges from persisted end time. | Construction / Upgrade | UNCONFIRMED_RUNTIME_BEHAVIOR | Owner-approved seam candidate | Replay reload and offline-catch-up behavior against a persisted construction fixture using `05/06/08/15`. | Yes, because it touches timer-backed persistence. |
| 6 | Production completion survives reconnect and rewards once. | Production | UNCONFIRMED_RUNTIME_BEHAVIOR | Owner-approved seam candidate | Replay reconnect after production completion and verify one reward emission using `05/07/10/11/15`. | Yes, because it touches reward delivery. |
| 7 | Upgrade completion survives reconnect without duplicate transformation. | Upgrade | UNCONFIRMED_RUNTIME_BEHAVIOR | Owner-approved seam candidate | Replay upgrade completion across reconnect and verify the transformed record appears once using `05/08/10/11/15`. | Yes, because it touches persisted upgrade state. |
| 8 | Rejected optimistic building placement restores the pre-command state. | Optimistic Commands | UNCONFIRMED_RUNTIME_BEHAVIOR | Pure seam candidate | Replay a rejected build command against a local pre-state fixture using `10/11/03/15`. | Only if command reduction needs a new helper boundary. |
| 9 | Late command acknowledgement cannot overwrite a newer local intent. | Optimistic Commands / Realtime | UNCONFIRMED_RUNTIME_BEHAVIOR | Pure seam candidate | Replay delayed acknowledgements against a newer local intent fixture using `03/09/10/11/15`. | Only if the reconciliation boundary is not already pure. |
| 10 | Destroyed building terminal state survives a later stale snapshot. | Building Lifecycle / Realtime | UNCONFIRMED_RUNTIME_BEHAVIOR | Pure seam candidate | Replay stale snapshots over a tombstoned destroyed building using `03/06/09/10/11/15`. | Only if a tiny merge wrapper is needed. |

## Investigation Notes

- P2 and P3 groups are not part of the MVP investigation set.
- Social, economy, combat, assets, performance, tree rewards, elections, chat, clan, leaderboard, and market remain future-wave surfaces unless the owner separately expands the scope.
- No live PocketBase records or player data may be mutated during investigation.
- If a scenario cannot be reproduced from current source plus deterministic local fixtures, stop instead of promoting it.
- If the observed behavior is already a known bug, stop and route it through the fix decision path instead of freezing it.
