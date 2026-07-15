# Scenario 3 Characterization

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

> After local destruction completion has produced a terminal building state,
> a later older snapshot does not restore the pre-terminal building state.

This is the narrow accepted Scenario 3 contract only.

## Evidence Basis

The permanent characterization test imports and executes both production
helpers directly:

- `src/game/buildings/resolveLocalDestructionCompletion.js`
- `src/game/buildings/resolveBuildingSnapshotMerge.js`

The test runs with frozen in-memory inputs only and does not depend on React,
App mounting, PocketBase, live subscriptions, network access, random values,
or package-script changes.

## Exact Command

```bash
node tests/characterization/scenario-003-characterization.mjs
```

## Frozen Inputs

- `scenarioId = scenario-003`
- `currentUserId = user-9`
- `buildingId = building-terminal-1`
- `buildingTypeId = 301`
- completion time = `1_000_000`
- reconnect time = `1_002_000`
- sticky interaction window = `15_000`
- deletion protection window = `120_000`
- destruction expiry = `1_000_000`
- active local destruction state
- older pre-terminal reconnect snapshot for the same building id
- unrelated stable building that must remain visible

## Assertions

The permanent test asserts only the terminal fields proven by the replay:

- `isDestroying`
- `hp`
- `maxHp`
- `pendingDamage`

It also asserts the exact helper decisions returned by the production
boundaries:

- completion helper decision: `complete_destruction`
- merge helper decision: `keep_local_sticky`
- `shouldStickPosition: true`
- `shouldStickHealthState: true`
- `clearLastInteraction: false`

The older snapshot does not restore the pre-terminal values for those terminal
fields.

## Run Results

- Run 1: `PASS`
- Run 2: `PASS`
- comparison: `IDENTICAL`

The same command was rerun unchanged and produced the same PASS / IDENTICAL
result.

Observed terminal state:

- `isDestroying: false`
- `hp: 34`
- `maxHp: 40`
- `pendingDamage: 0`

## Controls

- completion time not reached: `FAIL`
- snapshot not older: `BLOCKED`
- missing identity: `BLOCKED`
- pre-terminal state restored: `FAIL`
- unrelated building changed: `FAIL`

## Explicit Exclusions

This test does **not** claim:

- persisted reconnect durability
- full reload durability
- PocketBase persistence success
- server-revival precedence
- Scenario 2 tombstone behavior
- exactly-once destruction completion
- broad destroyed-building durability

## Residual Limitation

The accepted contract is limited to the narrow local terminal-state replay
proven above. Scenario 3 remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside that
subcase.

`T045` remains open.
