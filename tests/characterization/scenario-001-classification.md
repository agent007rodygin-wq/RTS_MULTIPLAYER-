# Scenario 1 Classification Review

## Scope

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Observed contract under review:

> Initial fetch cannot be overwritten by an older late snapshot.

This note reuses the source audit for Scenario 1 and records the current
classification decision based only on evidence already available in the
repository.

## Evidence Reused

- `tests/characterization/scenario-001-source-audit.md`
- `src/pocketbase.ts:1854-2204`
- `App.tsx:4794-4897`
- `App.tsx:6852-7053`
- `App.tsx:7395-7464`
- `App.tsx:7591-7710`
- `App.tsx:8392-8560`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/17-traceability-index.md`

## Current Evidence Status

| Evidence question | Status | What the current evidence shows |
| --- | --- | --- |
| Direct current-source confirmation | PARTIAL | `src/pocketbase.ts` confirms `getDoc()` / `fetchQueryRecords()` happen before `realtime-event` handling, and `App.tsx` has consumer-specific merge guards. |
| Controlled observation | MISSING | No controlled replay or runtime observation was run for this scenario in this pass. |
| Deterministic replay | MISSING | No deterministic fixture or replay trace exists yet for the exact stale-snapshot race. |
| Known-bug exclusion | MISSING | No repository evidence shows this scenario is already classified as a known bug that must not be frozen. |

## Classification Comparison

| Classification | Result | Reason |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | Not selected | The source audit shows the fetch-first / merge-guard shape, but the exact scenario still lacks controlled replay evidence and therefore is not promoted. |
| `KNOWN_BUG_DO_NOT_FREEZE` | Not selected | Current source and baseline evidence show risk and partial confirmation, but no explicit known-bug record or regression proof was found. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Selected | Fetch-first ordering and stale-snapshot protection exist in source, but the behavior is not fully proven for the exact consumer path. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | Not selected | This is active runtime behavior, not a legacy compatibility path. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Not selected | The present gap is evidence, not an owner policy decision; no owner acceptance is requested or recorded here. |

## Known-Bug Review

Searches against the live source and baseline evidence found:

- fetch-before-subscribe behavior in `src/pocketbase.ts`
- refresh-load versus realtime-event separation in `src/pocketbase.ts`
- consumer-specific merge guards in `App.tsx`
- baseline entries that describe the risk as partially confirmed rather than
  already resolved
- no explicit monotonic comparator or version gate for this scenario

The missing monotonic comparator is an evidence gap, not proof of a known bug.
Nothing in the current repository evidence proves that the observed behavior is a
bug that must be frozen or rejected.

## Proposed Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

This is the most accurate classification from the current evidence because the
source path is known, fetch-before-subscribe is confirmed, and merge guards are
present, but controlled observation and deterministic replay are still missing.

## Why T024 Remains Blocked

T024 remains blocked because the promotion requirements are not yet satisfied:

- direct source confirmation exists only for the underlying fetch/merge shape,
  not for a controlled replay of the exact stale-snapshot race;
- controlled observation or deterministic fixture evidence is still missing;
- known-bug exclusion is not complete;
- explicit owner acceptance is not recorded here and must not be inferred.

Until those requirements exist, scenario 1 must stay unpromoted.

## Open State

Scenario 1 stays `UNCONFIRMED_RUNTIME_BEHAVIOR` until a later pass provides the
missing replay evidence and an owner-reviewed promotion step.
