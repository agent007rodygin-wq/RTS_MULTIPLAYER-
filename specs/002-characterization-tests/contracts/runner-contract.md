# Runner Contract

## Purpose

Define the repository-defined repeatable command that executes the Feature 002 characterization suite from the published first-wave scenario index.

## Contract

- One repository-defined command runs the entire first-wave suite in published first-wave order.
- The command uses only local deterministic fixtures.
- The command does not mutate live PocketBase records or player data.
- The command returns one scenario-by-scenario result per atomic scenario, with PASS, FAIL, or BLOCKED status as needed.
- The command is repeatable on two consecutive unchanged runs.
- The command fails closed if a fixture reference, seam decision, or meaningful evidence metadata is missing or invalid.

## Inputs

- feature-local scenario index
- deterministic fixture set
- approved seam definition, if a scenario needs one
- evidence anchors from the spec and baseline docs

## Outputs

- scenario-by-scenario status
- classification state
- evidence references
- a stable summary report for the suite

## Never Do

- do not make live writes to PocketBase
- do not depend on hidden network state
- do not widen the command to P2 or P3 surfaces
- do not hide a failed scenario behind a global pass
