# First-Wave Runner Repeatability

Task authority: `T103` in `specs/002-characterization-tests/tasks.md`

Exact T103 row:

`[x] T103 Run the entire first-wave suite twice from \`tests/characterization/runner.mjs\` with the same deterministic fixtures and compare scenario-by-scenario results only after T115 exists. (SC-007, SC-009)`

HEAD commit tested:

`c6f05ec5e67da9576c9965ee6a5c94bd15cb95cd`

Exact command:

`node tests/characterization/runner.mjs`

## Run Results

| Run | Exit code | Suite status | Scenario count | deterministicOrdering | allScenariosExecuted |
| --- | --- | --- | --- | --- | --- |
| Run 1 | `0` | `PASS` | `10` | `true` | `true` |
| Run 2 | `0` | `PASS` | `10` | `true` | `true` |

## Published Scenario Order

- `scenario-01`
- `scenario-02`
- `scenario-03`
- `scenario-04`
- `scenario-05`
- `scenario-06`
- `scenario-07`
- `scenario-08`
- `scenario-09`
- `scenario-10`

## Scenario-By-Scenario Comparison

The two parsed reports were compared deeply, with no normalization and no
field exclusions beyond raw JSON parsing. They were identical.

| Scenario | Script | Run 1 | Run 2 | Comparison |
| --- | --- | --- | --- | --- |
| `scenario-01` | `tests/characterization/scenario-001-characterization.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-02` | `tests/characterization/scenario-002-characterization.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-03` | `tests/characterization/slice-b/scenario-03.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-04` | `tests/characterization/slice-b/scenario-04.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-05` | `tests/characterization/slice-b/scenario-05.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-06` | `tests/characterization/slice-b/scenario-06.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-07` | `tests/characterization/slice-b/scenario-07.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-08` | `tests/characterization/slice-c/scenario-08.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-09` | `tests/characterization/slice-c/scenario-09.mjs` | `PASS` | `PASS` | `IDENTICAL` |
| `scenario-10` | `tests/characterization/scenario-003-characterization.mjs` | `PASS` | `PASS` | `IDENTICAL` |

## Comparison Policy

- Compare the full parsed JSON reports directly.
- Do not normalize missing fields, ordering, reasons, classifications, or
  execution flags.
- Treat any diff as a T103 failure unless a source-backed contract explicitly
  allows it.

## Final Decision

`PASS / PASS / IDENTICAL`

This verifies deterministic replay of the current repository-local first-wave
runner only. It does not prove broad live runtime behavior.
