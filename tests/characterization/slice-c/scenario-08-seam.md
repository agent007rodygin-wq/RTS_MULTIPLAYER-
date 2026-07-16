# Scenario 8 Seam Decision

Scenario 8 wording:

"Rejected optimistic building placement restores the pre-command state."

## Decision

Final seam decision: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`

The current optimistic placement boundary is inline-only in `App.tsx` and does
not expose a pure importable rollback helper. The source audit shows the
rollback/refund path and the optimistic-to-persisted handoff, but it does not
show a reusable replay boundary that can prove the full rollback contract on
its own.

## Source Boundary

- `App.tsx:3730-3815` - `validatePlacementTarget(...)`, the App-owned
  placement preflight guard.
- `App.tsx:5826-6215` - `placeBuildingAtTile(...)`, which owns the optimistic
  insert, resource deduction, server write, and create-failure rollback.
- `App.tsx:6237-6255` - `handleConfirmBuild(...)`, which owns the placement
  action gate around `placeBuildingAtTile(...)`.
- `App.tsx:7918-8194` - `updatePlacedBuildingsFromServer(...)`, which merges
  server snapshots, applies offline timers, and dedupes local/server building
  state.
- `App.tsx:8264-8395` - realtime snapshot consumers that feed building
  snapshots into reconciliation.
- `src/pocketbase.ts:1037-1555` - adapter write helpers used by the placement
  flow.
- `src/game/buildings/resolveBuildingSnapshotMerge.js` - the existing pure
  merge helper used during building reconciliation.
- `src/game/buildings/filterReconnectSnapshotBuildingsByTombstones.js` - the
  existing pure reconnect suppression helper used during building
  reconciliation.

## Ownership

- App.tsx owns the placement orchestration, optimistic local state,
  rollback/refund path, trace refs, and final reconciliation.
- PocketBase owns the persisted record once the create succeeds.
- The current source does not provide a pure importable placement rollback
  boundary.

## Why A Seam Is Required

The source-backed shape is enough to show that rejected placement can roll back
in the inline path, but it is not enough to prove the full rollback envelope for
controlled observation or replay without extracting a minimal helper.

That makes the narrow seam requirement explicit rather than optional.

## Minimal Future Seam Scope

A future seam may only project the restored placement state for a rejected
optimistic placement.

Allowed future scope:

- pure rollback projection only;
- no PocketBase writes;
- no resource mutation;
- no UI setters;
- no refs, caches, traces, retries, or subscriptions;
- no reconnect or snapshot logic;
- no synthetic state marker.

Forbidden future scope:

- optimistic insertion;
- resource deduction;
- persistence;
- reward or economy logic;
- duplicate-suppression policy;
- multi-client authority;
- any broader gameplay subsystem.

## Stop Conditions

- Stop if a future helper would need to own persistence or resource mutation.
- Stop if the helper would need a new persistent field or synthetic marker.
- Stop if the helper would fold in reconnect or snapshot logic.
- Stop if the helper would broaden the contract beyond rejected optimistic
  placement rollback.

## T089 Readiness

T089 may proceed to fixture design after this decision is recorded.
The scenario remains `UNCONFIRMED_RUNTIME_BEHAVIOR`, and the actual runtime
proof still depends on later controlled evidence.
