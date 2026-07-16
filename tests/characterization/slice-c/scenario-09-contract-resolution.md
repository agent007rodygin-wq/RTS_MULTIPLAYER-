# Scenario 9 Contract Resolution

Task authority: `T097` in `specs/002-characterization-tests/tasks.md`

Exact task authority row:

`[x] T097 [US3] Design the pre-state, delayed-ack, and newer-intent fixture in \`tests/characterization/slice-c/scenario-09-fixture.json\` after T114 is complete and the seam decision is recorded; blocked fixture design is allowed before T114 only if clearly labeled blocked. (FR-010, SC-007)`

Selected replay unit:

- `C` - one complete caller lifecycle containing exactly one helper invocation plus caller-owned identity-remap cleanup

Why the projected-state second pass is not required:

- `App.tsx` clears the optimistic temp/canonical mapping immediately after the first successful reconciliation.
- The helper is pure and deterministic, so repeating the same frozen original inputs yields identical results.
- Feeding `firstPass.projectedBuilding` back into the helper with the original optimistic mapping is a negative control only, not the main replay unit.

Decision:

- `T097_CAN_COMPLETE_AS_SINGLE_INVOCATION_REPLAY_FIXTURE`

What the fixture now records:

- frozen local building, frozen server acknowledgement state, and explicit reconciliation context
- two complete executions rebuilt from the same original inputs
- identical outputs for the preserve-local case
- the accept-server alternate case as a separate frozen source-backed case
- projected-state reentry only as a negative control (`blocked_identity_mismatch`)

Broad Scenario 9 remains:

- `UNCONFIRMED_RUNTIME_BEHAVIOR`

Task state:

- `T097`: complete
- `T098`: open
- `T114`: complete
