# Scenario 7 Seam Decision

Task authority: `T080`

Exact Scenario 7 wording:

`Upgrade completion survives reconnect without duplicate transformation.`

## Decision

- Broad scenario classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`
- Final seam decision: `MINIMAL_OWNER_APPROVED_SEAM_REQUIRED`
- Current boundary classification: `inline-only` for the upgrade
  transformation itself, with supporting importable helpers for construction
  completion and snapshot merge but no dedicated pure upgrade boundary
- Pure importable upgrade boundary already exists: `no`
- Replayable boundary already exists today: `not honestly as a pure upgrade
  seam`

## Source-Boundary Review

The live source shows the upgrade flow split across caller-owned orchestration
and helper-assisted reconciliation:

- `App.tsx:14335-14491` `handleUpgrade(...)` performs the upgrade decision,
  deducts resources, emits traces, rewrites the selected building locally, and
  persists the upgraded record.
- `App.tsx:636-707` `processOfflineTimers(...)` finalizes overdue construction
  through the pure construction-completion helper.
- `App.tsx:7917-8124` `updatePlacedBuildingsFromServer(...)` merges local and
  server state on reconnect.
- `src/game/buildings/resolveLocalConstructionCompletion.js` is a pure helper,
  but it is construction-specific, not a dedicated upgrade seam.
- `src/game/buildings/resolveBuildingSnapshotMerge.js` is a pure merge helper,
  but it does not isolate the one-time upgrade transformation.
- `src/pocketbase.ts:1853-2219` owns the fetch-before-subscribe realtime
  boundary and retry behavior.

The baseline docs reinforce that upgrade uses construction semantics, is
optimistic, and still has partially confirmed replay / reconnect edges:

- `specs/_baseline/05-timers-and-processes.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Ownership

| Slice | Owner | Source-backed responsibility |
| --- | --- | --- |
| Upgrade validation and orchestration | `App.tsx` | Chooses the upgrade target, computes the new end time, deducts resources, rewrites local state, and coordinates writes. |
| Persisted building row | PocketBase via `src/pocketbase.ts` | Stores the upgraded record and participates in reconnect / replay delivery. |
| Construction completion helper | `src/game/buildings/resolveLocalConstructionCompletion.js` | Purely projects overdue construction into the consumed idle state. |
| Snapshot merge helper | `src/game/buildings/resolveBuildingSnapshotMerge.js` | Reconciles local and server building views. |
| Realtime adapter | `src/pocketbase.ts` | Performs initial fetch, subscription, retries, and event delivery. |

## Why A Minimal Seam Is Required

The current upgrade boundary is not a pure importable decision boundary. The
one-time transformation is embedded in `handleUpgrade(...)` and is coupled to:

- local resource mutation
- optimistic UI replacement
- trace emission
- PocketBase write-back
- reconnect and snapshot reconciliation

The existing pure helpers are useful, but they only cover construction
completion and snapshot merge. They do not expose a dedicated, deterministic
upgrade-completion seam that can be replayed without also carrying caller-owned
effects.

That means the scenario cannot honestly be frozen yet without a small
owner-approved seam.

## What The Future Seam May Do

Allowed future implementation scope:

- extract a minimal pure helper under `src/game/buildings/` that isolates the
  upgrade-completion decision and projected transformed state
- keep the helper deterministic and importable
- preserve the current caller-owned ordering in `App.tsx`
- preserve the existing PocketBase adapter behavior

The future seam should follow the same style as:

- `resolveLocalConstructionCompletion.js`
- `resolveBuildingSnapshotMerge.js`

## What The Future Seam Must Not Do

Forbidden implementation scope:

- PocketBase writes inside the helper
- resource mutation inside the helper
- trace logging inside the helper
- refs, caches, or subscriptions inside the helper
- UI state setters inside the helper
- any replay logic inside the helper
- any production / destruction / reconnect / snapshot merge behavior beyond the
  narrow upgrade decision
- any broad runtime refactor

## Helper Extraction And Runtime Behavior

Helper extraction would be runtime-safe only if it isolates the pure decision
and projected transformed state while leaving the current writes and
orchestration in `App.tsx`. Anything broader would change behavior and is not
approved by this seam decision.

## Stop Conditions

Stop before implementation if any future step would require:

- moving writes or traces into the helper
- adding new persisted fields
- introducing live PocketBase mutation at the seam boundary
- combining upgrade with production, destruction, or generic timer behavior
- widening the scenario into a multi-contract replay bundle
- claiming replayability before a real importable seam exists

## Evidence Gaps

- No dedicated pure upgrade-completion helper exists yet.
- No controlled runtime proof shows the one-time upgrade transformation survives
  reconnect without duplicate transformation on every replay edge.
- The source supports the relevant mechanics, but not a fully replayable pure
  boundary for the upgrade transition itself.

## Whether T081 May Proceed

Yes. T081 may proceed to fixture design, but only in service of the selected
minimal seam and without widening the contract.

## Implementation Authorization

Runtime implementation is not authorized yet. The scenario still needs the
minimal owner-approved seam before replay / characterization work can honestly
freeze behavior.

Task state:

- `T080`: complete
- `T081`: open
