# Results Format

## Purpose

Define the future per-scenario result shape for the characterization runner.

## Result Record

Each atomic scenario result must carry these fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `scenarioId` | yes | Stable scenario identifier such as `T001`-style scenario ordering, mapped to the scenario index |
| `status` | yes | Final state for the scenario result |
| `classification` | yes | One of the approved behavior classifications |
| `evidenceReferences` | yes | Real source or baseline anchors used for the result |
| `fixtureReference` | yes | Feature-local deterministic fixture reference |
| `seamDecision` | yes | Pure seam, potential owner-approved seam, or no seam recorded yet |
| `failureBlockReason` | conditional | Required when `status` is blocked or fail-closed |

## Status Values

- `PASS`
- `FAIL`
- `BLOCKED`

## Output Rules

- One row per atomic scenario.
- Preserve the scenario order from the scenario index.
- Keep the record format stable across unchanged runs.
- Include evidence references on every row, even when a scenario is blocked.
- Include the failure or block reason only when relevant.

## Never Do

- do not collapse the suite into one aggregate result only
- do not omit evidence references
- do not omit fixture references
- do not convert this document into a machine-readable manifest
