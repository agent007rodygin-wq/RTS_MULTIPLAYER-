# Scenario 9 Classification

Task authority:

- `specs/002-characterization-tests/tasks.md` T095
- `tests/characterization/slice-c/scenario-09-source-audit.md`

Scenario wording:

"Late command acknowledgement cannot overwrite a newer local intent."

Classification result:

`UNCONFIRMED_RUNTIME_BEHAVIOR`

## Known-Bug Review

I did not find a concrete active bug report for the exact Scenario 9
contract in the reviewed source and baseline material. The audit shows
realistic risk surfaces and partial protection, but not a reproducible,
currently active bug that would justify freezing the behavior as
`KNOWN_BUG_DO_NOT_FREEZE`.

## Source-Backed Reasoning

- `App.tsx:3336-3381` shows the optimistic-placement identity refs.
- `App.tsx:5827-6234` shows the optimistic placement flow.
- `App.tsx:6099-6206` shows optimistic render, server write, success remap,
  and rollback catch.
- `App.tsx:6565-6682` shows local-first resource mutation.
- `App.tsx:7929-8145` shows merge, offline catch-up, and snapshot repair.
- `App.tsx:11374-12680` shows later building-merge and protection paths that
  still consult `lastInteractionRef`.
- `src/pocketbase.ts:1854-2219` shows initial fetch, subscription, retry, and
  cooldown refetch behavior.
- `src/pocketbase.ts:1037-1460` shows create and update helper behavior and
  failure handling shape.
- Baseline docs `03-state-ownership`, `09-realtime-sync`, `10-optimistic-ui`,
  `11-error-handling`, and `15-invariants` confirm the ownership split,
  optimistic mirrors, retry boundaries, and partially confirmed invariants.

## Ownership Summary

- PocketBase owns persistent multiplayer records.
- App.tsx owns orchestration, optimistic placement, local state updates, and
  the persistence call.
- `src/pocketbase.ts` owns transport, realtime lifecycle, retry, and snapshot
  delivery.
- Refs and tombstones protect local intent from stale acknowledgements and
  later merges.

## Classification Comparison

- `CURRENT_ACCEPTED_BEHAVIOR`: not supported, because there is no controlled
  runtime proof or owner acceptance.
- `KNOWN_BUG_DO_NOT_FREEZE`: not supported, because there is no concrete
  active bug report for the exact contract.
- `LEGACY_COMPATIBILITY_BEHAVIOR`: not supported, because the source reads as
  active optimistic/realtime behavior rather than a frozen legacy path.
- `UNCONFIRMED_RUNTIME_BEHAVIOR`: supported, because the source suggests a
  boundary but does not prove the runtime guarantee.

## Evidence Gaps

- no controlled observation
- no replay evidence
- no repeatability run
- no narrower split between late acknowledgement, rollback, and merge edges

## Conclusion

Scenario 9 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`. This task is complete as a
preliminary source-backed classification, but the runtime guarantee is still
unproven. T096 may proceed only as the next seam-decision step; this note does
not promote the behavior.
