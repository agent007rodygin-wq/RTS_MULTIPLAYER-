# Scenario 6 Replay Evidence

Task authority: `T074` in `specs/002-characterization-tests/tasks.md`

Exact Scenario 6 wording:

`Production completion survives reconnect and rewards once.`

This note is a blocked replay audit. It records why the replay cannot be
honestly executed yet: there is no pure deterministic importable
reward-specific boundary. The evidence here is intentionally evidence-only and
does **not** claim a successful production-bound replay.

## Evidence Basis

- Source audit: `tests/characterization/slice-b/scenario-06-source-audit.md`
- Classification: `tests/characterization/slice-b/scenario-06-classification.md`
- Seam decision: `tests/characterization/slice-b/scenario-06-seam.md`
- Fixture: `tests/characterization/slice-b/scenario-06-fixture.json`
- Live source anchors:
  - `App.tsx:14551-14659` `handleCollectProductionFromWorld(...)`
  - `App.tsx:14936-15024` `handleCollectProduction(...)`
  - `App.tsx:6552-6560` `updatePlayerResources(...)`
  - `data/buildings.ts:29968-30001` Cafe 2 production definition

## Replay Result

- `BLOCKED`

Reason:

- No pure deterministic importable reward-specific boundary exists.

## Boundary Status

- `inlineRewardBranchAvailable = true`
- `pureImportableRewardBoundaryAvailable = false`
- `replayableProductionBoundaryAvailable = false`
- `minimalOwnerApprovedSeamRequired = true`
- `productionSourceExecution = false`
- `sourceBoundaryExecuted = false`

The current source shows a source-backed inline reward fence only:

- `workState = finished` means reward-eligible in the caller-owned collection
  branch.
- `workState = idle` means the building is no longer eligible for the current
  collection path.
- `finished -> idle` is the caller-owned fence used by `App.tsx`; it is not a
  pure importable helper and not yet a replayable production seam.

The reward decision remains coupled to caller-owned `App.tsx` logic. The
following remain outside any replayable boundary:

- `updatePlayerResources(...)`
- resource / inventory mutation
- PocketBase writes
- UI state setters
- optimistic updates
- trace logging
- refs and caches
- retries
- subscriptions
- orchestration

## Controls

All controls are documented as blocked at the same missing boundary. They were
not behaviorally executed in this pass.

| Control | Expected semantic outcome | Reason | productionSourceExecution | sourceBoundaryExecuted |
| --- | --- | --- | --- | --- |
| `reward-not-yet-eligible` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `missing-building-identity` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `second-pass-rewards-again` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `rewarded-state-regresses` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `unrelated-field-changed` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `production-boundary-not-available` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `reward-payload-mutation-required` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |
| `live-pocketbase-required` | `BLOCKED` | No pure deterministic importable reward-specific boundary exists. | `false` | `false` |

## Smallest Missing Seam

A pure deterministic importable helper that decides reward eligibility and
returns the projected consumed state only.

## Explicit Exclusions

- reward persistence
- exactly-once resource credit
- reconnect idempotency
- stale snapshot convergence
- server transactionality
- multi-client authority
- broad Scenario 6 behavior

## Why This Remains Blocked

- Reward eligibility is coupled to caller-owned `App.tsx` logic.
- The source-backed fence is inline-only, not a pure importable helper.
- A production-bound replay would require a seam that does not exist yet.
- No runtime evidence has been invented here.

## Task State

- `T074` complete: `yes`
- `T074` blocked: `yes`
- `T075` remains open: `yes`
