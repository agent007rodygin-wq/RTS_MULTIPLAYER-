# Scenario 3 Replay Evidence

## Scope

Selected narrow contract:

> After local destruction completion has produced a terminal building state,
> a later older snapshot does not restore the pre-terminal building state.

Scenario 3 remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

This checkpoint is now a production-helper replay. It imports the production
seam for local completion and the existing production merge helper directly.

## Exact Helper Signature

`resolveLocalDestructionCompletion({ building, buildingInfo, now, destructionExpiresAt })`

Returns:

- `completedBuilding`
- `decision`
- `completed`
- `blocked`
- `blockedReason`

The helper performs only the local destruction-completion transition for an
expired destruction window. `pendingDamage` is part of the input calculation,
but the replay does not invent any post-completion mutation beyond the current
source behavior.

## Production Boundaries

- **Completion helper imported:** `src/game/buildings/resolveLocalDestructionCompletion.js`
- **Merge helper imported:** `src/game/buildings/resolveBuildingSnapshotMerge.js`
- **Completion boundary status:** `production_boundary_available`
- **Merge boundary status:** `production_boundary_available`
- **Source boundary executed:** `true`

## Exact Command

```bash
node tests/characterization/scenario-003-replay.mjs
```

The replay was executed twice with unchanged frozen inputs and the outputs were
identical. The same command was also re-run externally to confirm the repeat
result matched exactly.

## Frozen Inputs

Baseline replay inputs:

- completion time: `1_000_000`
- reconnect time: `1_002_000`
- sticky interaction window: `15_000`
- deletion-protection window: `120_000`
- terminal seed building id: `building-terminal-1`
- terminal seed building type: `301`
- building durability fallback: `40`
- stale reconnect snapshot for the same building id
- unrelated building that must remain stable
- deterministic event order:
  1. destruction process is active
  2. completion time passes
  3. terminal local state is produced
  4. older snapshot arrives later
  5. merge boundary executes
  6. the terminal operational state is not restored

## Run Results

Run 1 and Run 2 were identical.

| Field | Run 1 | Run 2 |
| --- | --- | --- |
| `result` | `PASS` | `PASS` |
| `comparison` | `IDENTICAL` | `IDENTICAL` |
| `completionDecision` | `complete_destruction` | `complete_destruction` |
| `mergeDecision` | `keep_local_sticky` | `keep_local_sticky` |
| `shouldStickPosition` | `true` | `true` |
| `shouldStickHealthState` | `true` | `true` |
| core terminal fields | `isDestroying=false`, `hp=0`, `maxHp=40`, `pendingDamage=0` | same |
| unrelated building preserved | `true` | `true` |

## Observed Merge Shape

The merged target building kept the terminal operational state:

- `isDestroying: false`
- `hp: 0`
- `maxHp: 40`
- `pendingDamage: 0`

The merge helper also left these destruction metadata fields sourced from the
older snapshot, which is a fidelity limitation of the current production
boundary and not part of the pass/fail assertion:

- `destructionStartedAt`
- `destructionExpiresAt`
- `destructionDurationMs`
- `destructionMaxLifetimeMs`
- `destructionStatus`

That limitation is recorded honestly here so we do not overclaim that the merge
helper owns fields it does not rewrite today.

## Negative Controls

| Control | Result | Observed reason |
| --- | --- | --- |
| `completion-time-not-reached` | `FAIL` | the completion helper stayed in `no_completion` before expiry |
| `snapshot-not-older` | `BLOCKED` | the merge helper does not consume snapshot age as an input |
| `missing-identity` | `BLOCKED` | the completion helper failed closed on missing building identity |
| `pre-terminal-state-restored` | `FAIL` | the terminal operational state remained preserved instead |
| `unrelated-building-changed` | `FAIL` | an out-of-scope unrelated mutation is not accepted as proof |

## Exact Claim Supported

This evidence supports only the narrow operational contract for Scenario 3:

the local completion helper produces the terminal building state, and the
production merge helper preserves that terminal operational state against a
later stale snapshot while the sticky window is active.

It does **not** claim that every destruction metadata field is rewritten by the
merge helper. The stale metadata limitation above is deliberate and explicit.

## Deferred Contracts

Still deferred:

- persisted terminal-state reconnect durability
- full reload durability
- server-revival precedence
- Scenario 2 tombstone suppression
- exactly-once destruction completion
- destruction metadata freshness beyond the helper-owned operational fields

## Status

- `productionSourceExecution`: `true`
- `sourceBoundaryExecuted`: `true`
- `summary.scenarioClassification`: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- `T042`: complete
- `T043`: still open and blocked on the later owner-acceptance step
