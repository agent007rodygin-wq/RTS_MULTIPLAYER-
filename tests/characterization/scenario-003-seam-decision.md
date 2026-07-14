# Scenario 3 Seam Decision

## Broad Target

`Destroyed building terminal state survives a later stale snapshot.`

This target is still `UNCONFIRMED_RUNTIME_BEHAVIOR`. The current source shows
the relevant branches, but it does not prove the whole reconnect race.

## Exact Source Boundaries Reviewed

- `App.tsx:processOfflineTimers(...)` (`633-760`)
- `App.tsx:updatePlacedBuildingsFromServer(...)` (`7926-8263`)
- `App.tsx:shouldPreferServerRevivedBuildingState(...)` (`125-126`, `12139-12161`, `12672-12698`)
- `src/game/buildings/resolveBuildingSnapshotMerge.js` (`37-213`)
- `src/pocketbase.ts:onSnapshot(...)` (`1842-2257`)
- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## Ownership Map

- `App.tsx` owns refs, local state, and side effects.
- `processOfflineTimers(...)` owns local destruction completion.
- `updatePlacedBuildingsFromServer(...)` owns the merge pipeline.
- `resolvePlacedBuildingSnapshotMerge(...)` owns the per-building snapshot
  merge decision.
- `shouldPreferServerRevivedBuildingState(...)` owns the revive-vs-preserve
  comparison.
- `src/pocketbase.ts:onSnapshot(...)` owns fetch-first subscription plumbing.
- Tombstone suppression is already handled by Scenario 2 and is not part of
  this target.

## Persisted-Field Map

The destroyed-building terminal-state path depends on:

- `isDestroying`
- `destructionStartedAt`
- `destructionEndTime`
- `destructionExpiresAt`
- `destructionDurationMs`
- `destructionMaxLifetimeMs`
- `hp`
- `maxHp`
- `pendingDamage`

The current runtime also consults freshness and intent guards such as:

- `lastServerSyncRef`
- `lastInteractionRef`
- `STICKY_INTERACTION_MS`

## Timer / Reconnect Split

- Timer completion is local and happens in `processOfflineTimers(...)`.
- Reconnect reconciliation happens in `updatePlacedBuildingsFromServer(...)`
  and `resolvePlacedBuildingSnapshotMerge(...)`.
- The broad scenario mixes these two responsibilities, so it is not a single
  contract.

## Candidate Contracts

### A. Local terminal-state retention

`After local destruction completion has produced a terminal building state, a
later older snapshot does not restore the pre-terminal building state.`

- Owner: `App.tsx` plus the per-building merge helper
- Source of truth: persisted building record plus local terminal-state result
- Persisted fields involved: destruction end / expiry fields, `hp`, `maxHp`
- Local mirrors / refs involved: `lastServerSyncRef`, `lastInteractionRef`,
  `placedBuildingsRef`, `serverZoneBuildingsRef`, `serverMyBuildingsRef`
- Timing dependency: yes, because completion is timestamp-based
- Realtime / reconnect dependency: yes, because the stale snapshot arrives
  later
- Existing importable production boundary: `resolvePlacedBuildingSnapshotMerge(...)`
  is importable, but `processOfflineTimers(...)` still owns the completion step
  inside `App.tsx`
- Locally deterministic replay possible: yes for the merge decision, if the
  completed terminal state is supplied as frozen input
- Live PocketBase required: no for the merge decision itself
- Owner-approved seam required: only if the later fixture needs the exact
  terminal-completion handoff exposed outside `App.tsx`
- Overlap with completed scenarios: shares the sticky / realtime envelope from
  Scenario 1, but it is not Scenario 2 tombstone suppression
- Proposed classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Belongs in Feature 002 MVP: yes, as the first split subcase

### B. Persisted terminal-state reconnect durability

`After terminal destruction state is persisted, reconnect or reload converges
to that terminal state without restoring the building.`

- Owner: `App.tsx` plus PocketBase persistence
- Source of truth: persisted building record
- Persisted fields involved: terminal destruction fields plus whatever the
  adapter writes back on reconnect
- Local mirrors / refs involved: replay / freshness refs and building caches
- Timing dependency: yes
- Realtime / reconnect dependency: yes, and reload behavior is part of the
  contract
- Existing importable production boundary: no single boundary yet proves the
  full persistence / reload claim
- Locally deterministic replay possible: not fully, without a persistence seam
  or a reload-safe fixture boundary
- Live PocketBase required: likely yes for the full claim
- Owner-approved seam required: likely yes if we ever want a safe local proof
  without live persistence
- Overlap with completed scenarios: touches the same freshness envelope as
  Scenario 1, but it is not the same contract
- Proposed classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Belongs in Feature 002 MVP: no, defer until the local terminal-state split is
  established

### C. Server-revival precedence

`A server record may revive a locally terminal building only when the current
production revival rules explicitly prefer the server state.`

- Owner: `App.tsx` revive branch plus the helper comparison rule
- Source of truth: whichever side the revival rule explicitly prefers
- Persisted fields involved: destruction and revive comparison fields
- Local mirrors / refs involved: freshness refs and local terminal-state
  mirrors
- Timing dependency: yes
- Realtime / reconnect dependency: yes
- Existing importable production boundary: `shouldPreferServerRevivedBuildingState(...)`
  and `resolvePlacedBuildingSnapshotMerge(...)` expose the revive decision, but
  they do not prove every reconnect outcome
- Locally deterministic replay possible: yes for the narrow decision, but not
  for the whole reconnect durability claim
- Live PocketBase required: no for the narrow decision, yes for the broader
  reconnect proof
- Owner-approved seam required: only if we later want the full end-to-end
  reconnect durability story
- Overlap with completed scenarios: shares the merge helper surface from
  Scenario 1, but remains a distinct destruction/revive contract
- Proposed classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Belongs in Feature 002 MVP: no, defer behind the local terminal-state split

### D. Deletion / tombstone suppression

`Once deletion/tombstone suppression is active, later snapshots cannot
reintroduce the building while that suppression remains active.`

- Owner: Scenario 2 owns this contract
- Source of truth: deletion tombstones and dead-id suppression
- Persisted fields involved: deletion markers and adapter dead-record caches
- Local mirrors / refs involved: deletion refs, tombstone caches, dead-id sets
- Timing dependency: yes, but through deletion protection rather than
  destruction timing
- Realtime / reconnect dependency: yes
- Existing importable production boundary: already characterized by Scenario 2
- Locally deterministic replay possible: already handled by Scenario 2
- Live PocketBase required: not for the already-characterized narrow Scenario 2
  contract
- Owner-approved seam required: not for the already-characterized narrow
  Scenario 2 contract
- Overlap with completed scenarios: direct overlap with Scenario 2, so it must
  not be duplicated here
- Proposed classification: already handled outside Scenario 3
- Belongs in Feature 002 MVP: deferred, because this is not a new Scenario 3
  contract

## Overlap Analysis

- Scenario 1 covers a sticky-position contract, not destroyed-state durability.
- Scenario 2 covers deletion / tombstone suppression, which is intentionally
  separate from destroyed-state durability.
- Scenario 3 should not absorb Scenario 2 tombstone behavior just because both
  involve stale snapshots and reconnects.

## Final Decision

`SCENARIO_SPLIT_REQUIRED`

The broad destroyed-building terminal-state wording combines multiple
independent contracts:

1. local terminal-state retention after completion;
2. persisted terminal-state reconnect durability;
3. server-revival precedence;
4. deletion / tombstone suppression, which belongs to Scenario 2.

That is too much for one seam decision. The next characterization target should
be the narrowest locally deterministic contract first.

## Selected Next Subcase

`LOCAL_TERMINAL_STATE_FIRST`

This is the preferred next step because it is the narrowest locally
deterministic contract and does not require live PocketBase persistence proof.

## Deferred Subcases

- `PERSISTED_TERMINAL_RECONNECT_FIRST`
- `SERVER_REVIVAL_PRECEDENCE_FIRST`
- Scenario 2 tombstone suppression remains deferred and must not be folded into
  Scenario 3

## Smallest Possible Seam Proposal

No new seam is requested yet.

If the local terminal-state subcase later proves impossible to exercise through
the current importable merge boundary alone, the smallest possible seam would
be to expose only the terminal-state merge decision already embedded in
`App.tsx:updatePlacedBuildingsFromServer(...)`, without moving refs, caches,
or persistence ownership out of `App.tsx`.

That seam would need to keep runtime behavior identical and must not absorb the
deletion/tombstone path or any persistence cleanup behavior.

## Owner-Approval Boundary

- No owner approval is required for this split decision itself.
- Owner approval would be required before any runtime seam that changes
  behavior or exposes a new production path.

## Stop Conditions for T041

T041 should not proceed against the broad destroyed-state wording.

It may proceed only after the task chain is aligned to
`LOCAL_TERMINAL_STATE_FIRST`, because the persisted-durability and
server-revival subcases remain deferred.

## Whether T041 May Proceed

`Yes, but only for the selected local-terminal-state subcase once the task
chain is clarified to match this split decision.`

## Scenario Status

`Scenario 3` remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.
