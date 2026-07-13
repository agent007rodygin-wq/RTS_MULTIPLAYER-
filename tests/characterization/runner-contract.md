# Runner Contract

## Purpose

Define the future repository-local command contract for the Feature 002
characterization suite.

## Contract

- The runner uses local deterministic inputs only.
- The runner does not depend on hidden network access.
- The runner does not mutate live PocketBase records or player data.
- The runner returns one result per atomic scenario.
- The runner fails closed when evidence, fixture, classification, or approved
  seam information is missing.
- The runner keeps scenario ordering stable and reportable.

## Inputs

- feature-local scenario index
- evidence index
- repeatability policy
- approved seam decision, if one exists
- future deterministic fixture set

## Outputs

- scenario-by-scenario result records
- a stable summary of pass, fail, or blocked outcomes
- evidence references for every result

## Stop Conditions

- missing evidence anchor
- missing fixture reference
- missing classification decision
- missing approved seam decision where one is required
- any live PocketBase or player-data mutation
- any hidden network dependency
- any attempt to widen the command to P2 or P3 scope

## Never Do

- do not hide a blocked scenario behind a global pass
- do not make live writes
- do not treat a future manifest as a machine-readable file in this pass
- do not create a harness in this pass
