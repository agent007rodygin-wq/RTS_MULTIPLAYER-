# Scenario 3 Replay Boundary Audit

Task authority: `T050` in `specs/002-characterization-tests/tasks.md`

Audit target: `After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.`

This artifact is a **blocked-boundary audit**, not production-bound replay
evidence. The current construction-completion behavior is still inline in
`App.tsx`, and there is no importable production construction-completion helper
to execute directly.

## Production-Boundary Status

- completion boundary status: `synthetic_or_missing`
- merge boundary status: `production_boundary_available`
- source-boundary executed for the complete replay chain: `false`
- replay result: `BLOCKED`

## Source Branch Reviewed

- `App.tsx:634-715` `processOfflineTimers`
- `App.tsx:12185-12203` foreground construction-completion loop
- `src/game/buildings/resolveBuildingSnapshotMerge.js`
- `src/game/buildings/resolveLocalDestructionCompletion.js`
- `tests/characterization/slice-b/scenario-03-fixture-design.md`
- `tests/characterization/slice-b/scenario-03-seam.md`

The live source shows the construction completion guard inline in both the
offline timer path and the foreground loop:

- `isConstructing && constructionEndTime && now >= constructionEndTime`
- local transition to `isConstructing = false`
- local transition to `workState = 'idle'`
- caller-owned `recordBuildingTimerTrace(...)`
- caller-owned `updateBuildingDocSafe(...)`

## Why The Replay Is Blocked

The replay cannot honestly execute the production completion boundary yet
because no importable construction-completion helper exists.

What exists today:

- a live inline construction-completion branch in `App.tsx`
- a merge helper for snapshot reconciliation
- a destruction helper for a different process family

What is missing:

- a narrow pure construction-completion helper that can be imported by both
  `App.tsx` and the characterization replay without copying the inline branch

## Run 1 / Run 2

- Run 1: `BLOCKED`
- Run 2: `BLOCKED`

No production source execution occurred for the construction-completion
transition, so there is no behavioral output to compare.

## Controls

All controls were blocked at the same missing-boundary gate:

- completion time not reached -> `BLOCKED`
- missing building identity -> `BLOCKED`
- second pass completes again -> `BLOCKED`
- completed fields regress -> `BLOCKED`
- unrelated building changes -> `BLOCKED`

The controls were not behaviorally executed because doing so would require
copying or reimplementing the construction-completion branch instead of running
the real production boundary.

## Exact Narrow Claim Supported

None yet for the broad construction-completion contract.

The only honest claim from this audit is that the current source still lacks an
importable construction-completion boundary.

## Known Limitations

- construction completion is still inline in `App.tsx`
- `resolveBuildingSnapshotMerge.js` is not the completion seam
- `resolveLocalDestructionCompletion.js` belongs to another process family
- `_offlineTimersSynced` is caller-side persistence suppression, not a pure
  transition authority
- no second-pass behavior was proven against production source

## Smallest Missing Seam

A minimal owner-approved pure helper extracted from the construction-completion
branch in `App.tsx`, for example a construction-specific decision helper under
`src/game/buildings/`, is the smallest missing piece needed before a real
production-bound replay can run.

## T050 Status

- `T050` completed: `no`
- `T051` may proceed: `no`

T050 remains open until the construction-completion boundary becomes importable
or an owner-approved seam is explicitly extracted.
