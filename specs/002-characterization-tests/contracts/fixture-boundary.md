# Fixture Boundary

## Purpose

Define the local deterministic data boundary for the characterization suite.

## Contract

- Fixtures are local, checked-in, or locally generated deterministic inputs.
- Fixtures represent frozen observations, not a second source of truth.
- Fixtures can include record snapshots, ordered event traces, and expected outcomes.
- Fixtures reset cleanly between runs.
- Fixtures do not require live PocketBase mutation.

## Allowed Fixture Content

- source anchors
- baseline anchors
- frozen record snapshots
- replay event sequences
- expected pass/fail assertions
- cleanup metadata

## Forbidden Fixture Content

- live PocketBase write credentials
- player data that would be mutated during setup
- hidden network calls
- any state that only exists because production code was modified for the fixture

## Reset Policy

- Every run starts from the same fixture state.
- Running the same command twice without changing fixtures must produce the same result.
- If cleanup cannot guarantee deterministic reset, the fixture is not MVP-safe.

## Never Do

- do not seed fixtures by mutating live PocketBase
- do not use production player data as fixture input
- do not let fixture setup become a second runtime path
