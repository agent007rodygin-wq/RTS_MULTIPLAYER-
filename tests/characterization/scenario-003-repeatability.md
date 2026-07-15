# Scenario 3 Repeatability

## Accepted Contract

`CURRENT_ACCEPTED_BEHAVIOR`

After local destruction completion has produced a terminal building state, a later older snapshot does not restore the pre-terminal building state.

## Exact Command

`node tests/characterization/scenario-003-characterization.mjs`

## Run Results

| Run | Result | Comparison | Completion decision | Merge decision |
| --- | --- | --- | --- | --- |
| Run 1 | PASS | IDENTICAL | `complete_destruction` | `keep_local_sticky` |
| Run 2 | PASS | IDENTICAL | `complete_destruction` | `keep_local_sticky` |

Stable semantic outputs were identical across both runs:

- `completionResult.completed === true`
- `completionDecision === complete_destruction`
- `mergeDecision === keep_local_sticky`
- `protectedFields === [isDestroying, hp, maxHp, pendingDamage]`
- `terminalFieldsPreserved === true`
- `run1.observed` and `run2.observed` both held:
  - `isDestroying: false`
  - `hp: 34`
  - `maxHp: 40`
  - `pendingDamage: 0`

## Controls

| Control | Result | Reason |
| --- | --- | --- |
| `completion-time-not-reached` | FAIL | `completion-window-not-yet-open` |
| `snapshot-not-older` | BLOCKED | `merge-helper-does-not-consume-snapshot-age-as-an-input` |
| `missing-identity` | BLOCKED | `missing-building-identity` |
| `pre-terminal-state-restored` | FAIL | `pre-terminal-state-was-not-restored` |
| `unrelated-building-changed` | FAIL | `unrelated-building-mutated` |

## Explicit Exclusions

This repeatability check does not claim or test:

- persistence or reload durability;
- PocketBase success or network behavior;
- server-revival precedence;
- Scenario 2 tombstone behavior;
- exactly-once destruction completion;
- broad destroyed-building durability;
- destruction timestamp cleanup beyond the accepted contract;
- position behavior.

## Residual Limitations

- The broader Scenario 3 contract remains `UNCONFIRMED_RUNTIME_BEHAVIOR` outside the accepted narrow subcase.
- No live PocketBase access occurred.
- No source files changed between Run 1 and Run 2.

## Task State

- `T045` marked complete.
- `T046` remains open.