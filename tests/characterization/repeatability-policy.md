# Repeatability Policy

## Purpose

Define how the future characterization runner proves that two unchanged runs
are stable.

## Repeatability Contract

- Same inputs must produce the same scenario-by-scenario outcomes.
- The fixture set must remain unchanged between the first and second run.
- Scenario ordering must remain stable between runs.
- The comparison must be explicit and repeatable.

## Comparison Policy

Compare the two runs by scenario ID and by the full per-scenario record.

The comparison must treat these as meaningful differences:

- status changes
- classification changes
- evidence reference changes
- fixture reference changes
- seam decision changes
- failure or block reason changes
- scenario ordering changes

The comparison may ignore non-semantic runner noise only if that noise is not
part of the documented result contract.

## Two-Run Rule

1. Run the future command once against the approved deterministic inputs.
2. Run the same command a second time without changing fixtures or inputs.
3. Compare the per-scenario outputs exactly.
4. If any difference appears, stop and re-investigate before promotion.

## Never Do

- do not compare only the summary banner
- do not change fixtures between the two runs
- do not accept ordering drift
- do not treat an unexplained mismatch as success
