# Scenario 3 Fixture Design

## Scope

Selected continuation:

`LOCAL_TERMINAL_STATE_FIRST`

Accepted continuation contract for the fixture boundary:

`After local destruction completion has produced a terminal building state, a later older snapshot does not restore the pre-terminal building state.`

This fixture design is local-only and deterministic. It does not prove
persisted reconnect durability, full reload durability, server-revival
precedence, Scenario 2 tombstone suppression, or exactly-once completion.

Scenario 3 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Exact Local Completion Boundary

The boundary under review is the handoff between:

1. `App.tsx:processOfflineTimers(...)` turning an expired destruction window
   into a terminal building state in local memory.
2. Later reconnect reconciliation in
   `App.tsx:updatePlacedBuildingsFromServer(...)` and
   `resolvePlacedBuildingSnapshotMerge(...)`.

The fixture must isolate the local terminal-state result before the later
older snapshot is merged.

## Frozen Inputs

The fixture should freeze these input groups:

| Input | Purpose | Notes |
| --- | --- | --- |
| `completionNow` | Time when the local destruction window is considered expired | Must be deterministic and at or after the destruction expiry. |
| `reconnectNow` | Time when the later older snapshot is applied | Must be greater than `completionNow` and deterministic across runs. |
| Local building record | Represents the state before local destruction finalization | Same stable building identity as the stale snapshot. |
| Older reconnect snapshot record | Represents the pre-terminal state that arrives later | Same stable building identity as the local record. |
| Merge-context refs / caches | Mirrors consulted by the reconnect merge path | Kept local and frozen, not backed by live PocketBase. |

Do not invent extra fixture values beyond what the current source path needs.

## Stable Building Identity

The same building must be represented in both states by the same canonical
record identity:

- same `id`
- same `buildingId`
- same `zoneId`
- same `x`
- same `y`

The fixture is not about relocation or type changes. It is about the terminal
destruction boundary versus a later stale snapshot for the same building.

## Terminal State After Local Completion

Derived from `App.tsx:processOfflineTimers(...)`, the terminal state produced
by the local completion boundary must include only fields supported by the
current source evidence:

- `isDestroying` becomes `false`
- `destructionStartedAt` is cleared
- `destructionEndTime` is cleared
- `destructionExpiresAt` is cleared
- `destructionDurationMs` is cleared
- `destructionMaxLifetimeMs` is cleared
- `hp` is updated to the computed remaining value
- `maxHp` is preserved / written so the completed state is not misread as a
  migration artifact

The completion branch uses:

- `damage = pendingDamage || 0`
- `fullHp = maxHp ?? durability fallback`
- `currentHp = hp ?? fullHp`
- `remainingHp = currentHp - damage`

`pendingDamage` is part of the calculation input, but the current completion
path does not write a terminal output assertion for it. The fixture must not
invent a post-completion mutation for `pendingDamage`.

## Older Pre-Terminal Snapshot

The later snapshot must represent the same building id in a pre-terminal shape
that still carries the earlier destruction state:

- `isDestroying: true`
- the earlier destruction timestamps
- the earlier destruction duration / max-lifetime values
- the earlier `hp` / `maxHp` pair before local completion

This snapshot is intentionally stale. It should be older than the local
terminal state and should attempt to restore the pre-terminal shape when
merged.

## Client / Server Mirror State Before Merge

Before merge, the fixture should represent:

- local client mirror: the terminal building state already produced by the
  local completion boundary
- server mirror: the older snapshot payload for the same building id
- freshness refs: frozen values for `lastServerSyncRef` and `lastInteractionRef`
  so the stale-vs-fresh comparison is deterministic
- building caches: the local placed-building mirror and the server building
  mirrors used by the reconnect path

The fixture must not rely on live PocketBase or on any runtime fetch to fill in
these mirrors.

## Refs / Caches That May Influence Merge

May influence the reconnect merge:

- `placedBuildingsRef`
- `serverZoneBuildingsRef`
- `serverMyBuildingsRef`
- `lastServerSyncRef`
- `lastInteractionRef`

Explicitly out of scope:

- `deletingBuildingsRef`
- `confirmedDeletedRef`
- `deadBuildingIds`
- `deletedRecordKeys`
- any tombstone / dead-id suppression helper from Scenario 2

Those deletion helpers belong to Scenario 2 and must not be used as proof for
this local-terminal-state fixture.

## Exact Event Order

The fixture must enforce this order:

1. destruction process is active;
2. persisted or local end time passes;
3. `processOfflineTimers(...)` produces the terminal building state locally;
4. the older snapshot arrives later;
5. the reconnect merge decision executes;
6. the pre-terminal state is not restored.

## Process-Time Inputs

The fixture input shape should include the destruction process fields that the
current source path actually uses:

- `isDestroying`
- `destructionStartedAt`
- `destructionEndTime`
- `destructionExpiresAt`
- `destructionDurationMs`
- `destructionMaxLifetimeMs`
- `pendingDamage`
- `hp`
- `maxHp`

These are the process-time fields relevant to the local completion boundary.

## Clock / Reset Assumptions

- The clock is frozen.
- `completionNow` and `reconnectNow` do not drift between runs.
- Every run rebuilds the fixture from scratch.
- No prior run state, cache residue, or ambient timer state may leak in.
- No live PocketBase reads or writes are allowed.

## Deterministic Event-Order Assumptions

- The local completion boundary always runs before the stale snapshot merge.
- The older snapshot always arrives after completion, not before.
- The merge decision must see the completed terminal state as already present.
- No hidden scheduler, retry, or network interleaving may change that order.

## Failure Conditions

The fixture design is invalid if any of these become necessary:

1. live PocketBase access;
2. full reload or persistence proof;
3. server-revival precedence;
4. Scenario 2 tombstone suppression;
5. exactly-once completion proof;
6. inventing field values not supported by current source evidence;
7. assuming the later snapshot is authoritative merely because it arrives later.

## Preconditions for T042 Controlled Replay Evidence

T042 may proceed only if the future replay can consume these frozen inputs and
exercise the local completion boundary without requiring:

- runtime modification;
- live PocketBase;
- a new production helper;
- a tombstone contract;
- or a persistence claim.

If the local boundary cannot be exercised deterministically from the current
production surface, T042 blocks until a separately approved minimal seam is
available.

## Why This Fixture Does Not Prove Broader Contracts

This fixture does not prove:

- persisted reconnect durability;
- full reload durability;
- server-revival precedence;
- Scenario 2 tombstone suppression;
- exactly-once destruction completion.

Those are separate contracts and remain deferred.

