# Scenario 1 Seam Decision

## Scope

Scenario 1 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Observed contract under review:

> Initial fetch cannot be overwritten by an older late snapshot.

This note decides whether the current source surface is already a usable seam
for replay work, without changing runtime code or promoting the scenario.

## Evidence Reused

This decision is based on the current evidence already recorded in:

- `tests/characterization/scenario-001-source-audit.md`
- `tests/characterization/scenario-001-classification.md`

Those docs already point to the relevant source anchors:

- `src/pocketbase.ts:1854-2204`
- `App.tsx:4794-4897`
- `App.tsx:6852-7053`
- `App.tsx:7395-7464`
- `App.tsx:7591-7710`
- `App.tsx:7954-8560`

## Seam Candidates Reviewed

| Candidate | What it gives us | Verdict |
| --- | --- | --- |
| `src/pocketbase.ts:onSnapshot()` | Confirms the fetch-first shape and the `refresh-load` / `realtime-event` split. | Useful adapter boundary, but not enough by itself to prove the final visible state under replay. |
| `App.tsx:updatePlacedBuildingsFromServer()` | Applies the building merge policy that uses `lastInteractionRef`, `lastServerSyncRef`, and tombstone-aware caches. | Best current candidate for this scenario. |
| `serverMyBuildingsRef` / `serverZoneBuildingsRef` | Hold the latest server snapshot inputs for the building merge path. | Input caches only, not a seam on their own. |
| `buildIncrementalZoneSnapshot()` | Produces incremental zone snapshots when the realtime layer can merge in place. | Helpful context, but the scenario still depends on the building consumer merge path. |

## Decision

Selected outcome:

`PURE_SEAM_CANDIDATE_NEEDS_REPLAY_PROOF`

Reasoning:

- the source audit confirms fetch-before-subscribe and the building merge
  boundary;
- the classification review confirms the scenario is still
  `UNCONFIRMED_RUNTIME_BEHAVIOR`;
- the exact stale-snapshot race has not yet been proven with controlled
  replay;
- consumer-specific merge behavior means one generic seam is not yet enough to
  prove the exact scenario across all consumers.

## Exact Source Boundary

The working boundary for this scenario is the building snapshot merge path in
`App.tsx:updatePlacedBuildingsFromServer()`, fed by the realtime adapter
callbacks in `src/pocketbase.ts:onSnapshot()`.

That boundary is the best place to observe the behavior because it is where the
late snapshot is actually reconciled against current client state.

## Why This Is Still Provisional

The boundary is deterministic enough to explain the source shape, but it is not
yet a proven pure replay seam because:

- the merge uses React refs and cached server mirrors rather than a fully pure
  argument list;
- the exact outcome depends on consumer-specific merge rules for buildings;
- no controlled replay trace has yet shown that an older late snapshot loses
  every time;
- no monotonic comparator or version gate is visible in the current source.

## Runtime Behavior That Must Stay Unchanged

This decision does not request runtime changes.

The following behavior must remain exactly as it is:

- initial fetch happens before later realtime callbacks;
- `refresh-load` and `realtime-event` remain distinct audit sources;
- tombstone and delete caches continue to suppress resurrection;
- `lastInteractionRef` and `lastServerSyncRef` continue to protect newer local
  intent and newer confirmed server state;
- consumer-specific merge semantics remain intact;
- no generic monotonic comparator is introduced as part of this pass.

## Stop Conditions Blocking Fixture Design

Fixture design should stop if any of the following remain true:

- no controlled replay of the exact stale-snapshot race exists yet;
- no deterministic fixture evidence exists yet;
- known-bug exclusion is still unproven;
- owner acceptance has not been recorded.

## Owner Approval

No owner-approved production seam is required yet.

If later replay work shows that the exact building merge path cannot be observed
without changing runtime behavior, then a minimal owner-approved seam may be
considered. For now, that is only a contingency.

## T025

T025 may proceed to fixture design using the current building merge boundary as
the working candidate, but only as a provisional step. It does not unlock
promotion or permanent test creation.
