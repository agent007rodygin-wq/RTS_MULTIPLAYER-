# Scenario 8 Classification

Scenario 8 wording:

"Rejected optimistic building placement restores the pre-command state."

## Classification

Final preliminary classification: `UNCONFIRMED_RUNTIME_BEHAVIOR`

## Known-Bug Review

No concrete active bug report was found for the exact Scenario 8 contract.
The nearby risk-register and partial-confirmation entries point to known risk
surfaces, but they are not proof of a currently reproducing bug.

Because of that, `KNOWN_BUG_DO_NOT_FREEZE` is not selected here.

## Source-Backed Reasoning

The source audit shows a fully visible optimistic placement flow:

- `validatePlacementTarget(...)` performs the App-owned preflight check.
- `placeBuildingAtTile(...)` performs the optimistic insertion, resource
  deduction, and server write.
- The create-success path replaces the temporary identity with the canonical
  server identity.
- The create-failure path removes the optimistic state and refunds resources.
- `updatePlacedBuildingsFromServer(...)` and the snapshot adapter reconcile
  later server truth with optimistic state and tombstones.

That is enough to prove the intended shape of the flow, but not enough to prove
every runtime edge that Scenario 8 would need for acceptance.

## Why Other Classifications Were Not Chosen

- `CURRENT_ACCEPTED_BEHAVIOR`: not supported because there is no controlled
  observation or replay evidence, and no owner acceptance for Scenario 8.
- `LEGACY_COMPATIBILITY_BEHAVIOR`: not supported because this is not a legacy
  compatibility path; it is the active optimistic placement flow.
- `KNOWN_BUG_DO_NOT_FREEZE`: not supported because there is no concrete active
  bug report for the exact contract.
- `UNCONFIRMED_RUNTIME_BEHAVIOR`: supported because the source audit is honest
  about the optimistic placement shape, but several critical runtime edges are
  still unproven.

## Evidence Used

- `tests/characterization/slice-c/scenario-08-source-audit.md`
- `App.tsx:3730-3815`
- `App.tsx:5826-6255`
- `App.tsx:7918-8395`
- `App.tsx:11440-11505`
- `App.tsx:13943-14186`
- `src/pocketbase.ts:80-193`
- `src/pocketbase.ts:832-978`
- `src/pocketbase.ts:981-1028`
- `src/pocketbase.ts:1037-1555`
- `src/pocketbase.ts:1854-2219`
- `src/pocketbase.ts:2326-2354`
- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Evidence Missing

The source audit still does not prove:

- rollback correctness for every failure shape,
- timeout handling for every write path,
- stale snapshot recovery after a rejected placement,
- duplicate placement suppression under retry or concurrency,
- cross-client placement authority,
- or a fully proven optimistic rollback envelope.

Those gaps are why the scenario remains unconfirmed rather than accepted.

## Split Assessment

This scenario likely should be split before any later runtime-proving work.
Placement eligibility, optimistic projection, resource deduction, persistence,
rollback / refund, temporary-to-server identity convergence, realtime
reconciliation, duplicate suppression, and multi-client authority are all
bundled together in the current source shape.

## T088 Readiness

T088 may proceed to the seam decision step.
It should do so with the understanding that Scenario 8 is still
`UNCONFIRMED_RUNTIME_BEHAVIOR` and that no known bug has been proven.

