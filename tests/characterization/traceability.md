# Feature 002 Traceability Index

Task authority: `T109` in `specs/002-characterization-tests/tasks.md`

## Purpose

This index ties each first-wave scenario to the source-backed evidence, fixture,
seam, classification, and permanent test that currently exist in the
repository.

The rows below follow the published first-wave order from
`tests/characterization/scenario-index.md`. Feature 003 or any runtime refactor
remains blocked until Feature 002 passes.

## First-Wave Traceability

| Scenario | Source trace | Fixture | Seam | Classification | Test | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `scenario-01` - Initial fetch cannot be overwritten by an older late snapshot. | `tests/characterization/scenario-001-source-audit.md` | `tests/characterization/scenario-001-fixture-design.md` | `tests/characterization/scenario-001-seam-decision.md` | `tests/characterization/scenario-001-classification.md` | `tests/characterization/scenario-001-characterization.mjs` | Root-level Slice A artifact set. |
| `scenario-02` - Deleted building cannot be resurrected by a reconnect snapshot. | `tests/characterization/scenario-002-source-audit.md` | `tests/characterization/scenario-002-fixture-design.md` | `tests/characterization/scenario-002-seam-decision.md` | `tests/characterization/scenario-002-classification.md` | `tests/characterization/scenario-002-characterization.mjs` | Root-level Slice A artifact set. |
| `scenario-03` - Persisted process whose end time passed completes exactly once. | `tests/characterization/scenario-003-source-audit.md` | `tests/characterization/scenario-003-fixture-design.md` | `tests/characterization/scenario-003-seam-decision.md` | `tests/characterization/scenario-003-classification.md` | `tests/characterization/scenario-003-characterization.mjs` | Root-level Slice A artifact set. |
| `scenario-04` - Offline catch-up cannot duplicate completion or reward. | `tests/characterization/slice-b/scenario-04-classification.md`<br>`tests/characterization/slice-b/scenario-04-seam.md` | `tests/characterization/slice-b/scenario-04-fixture.json` | `tests/characterization/slice-b/scenario-04-seam.md` | `tests/characterization/slice-b/scenario-04-classification.md` | `tests/characterization/slice-b/scenario-04.mjs` | No separate `*-source-audit.md` file exists; source anchors are recorded in the classification and seam docs. |
| `scenario-05` - Construction state survives reload and converges from persisted end time. | `tests/characterization/slice-b/scenario-05-source-audit.md` | `tests/characterization/slice-b/scenario-05-fixture.json` | `tests/characterization/slice-b/scenario-05-seam.md` | `tests/characterization/slice-b/scenario-05-classification.md` | `tests/characterization/slice-b/scenario-05.mjs` | Slice B construction boundary. |
| `scenario-06` - Production completion survives reconnect and rewards once. | `tests/characterization/slice-b/scenario-06-source-audit.md` | `tests/characterization/slice-b/scenario-06-fixture.json` | `tests/characterization/slice-b/scenario-06-seam.md` | `tests/characterization/slice-b/scenario-06-classification.md` | `tests/characterization/slice-b/scenario-06.mjs` | Slice B production boundary. |
| `scenario-07` - Upgrade completion survives reconnect without duplicate transformation. | `tests/characterization/slice-b/scenario-07-source-audit.md` | `tests/characterization/slice-b/scenario-07-fixture.json` | `tests/characterization/slice-b/scenario-07-seam.md` | `tests/characterization/slice-b/scenario-07-classification.md` | `tests/characterization/slice-b/scenario-07.mjs` | Slice B upgrade boundary. |
| `scenario-08` - Rejected optimistic building placement restores the pre-command state. | `tests/characterization/slice-c/scenario-08-source-audit.md` | `tests/characterization/slice-c/scenario-08-fixture.json` | `tests/characterization/slice-c/scenario-08-seam.md` | `tests/characterization/slice-c/scenario-08-classification.md` | `tests/characterization/slice-c/scenario-08.mjs` | Slice C rollback boundary. |
| `scenario-09` - Late command acknowledgement cannot overwrite a newer local intent. | `tests/characterization/slice-c/scenario-09-source-audit.md` | `tests/characterization/slice-c/scenario-09-fixture.json` | `tests/characterization/slice-c/scenario-09-seam.md` | `tests/characterization/slice-c/scenario-09-classification.md` | `tests/characterization/slice-c/scenario-09.mjs` | Slice C late-ack reconciliation boundary. |
| `scenario-10` - Destroyed building terminal state survives a later stale snapshot. | `tests/characterization/scenario-003-source-audit.md` | `tests/characterization/scenario-003-fixture-design.md` | `tests/characterization/scenario-003-seam-decision.md` | `tests/characterization/scenario-003-classification.md` | `tests/characterization/scenario-003-characterization.mjs` | Published as first-wave `scenario-10` in the runner; the historical filename remains `scenario-003-characterization.mjs`. |

## Boundary Notes

- The traceability rows intentionally point to the committed scenario
  artifacts, not to a machine-readable manifest.
- Scenario 4 records source anchors in the classification and seam docs rather
  than in a dedicated source-audit file.
- Scenario 10 keeps the legacy `scenario-003` filename for the historical
  characterization test while the runner publishes it as first-wave
  `scenario-10`.

## Final Block

This traceability index keeps future Feature 003 work and any runtime refactor
blocked until Feature 002 is complete.
