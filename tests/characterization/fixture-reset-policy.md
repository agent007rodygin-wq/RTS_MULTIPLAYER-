# Fixture Reset Policy

## Purpose

Define how future fixtures reset and replay deterministically.

## Reset Policy

- Every run starts from the same fixture state.
- Fixture cleanup must be idempotent.
- Fixture reset must not depend on live PocketBase mutation.
- Fixture reset must not depend on live player data.
- Fixture reset must not use hidden network access.

## Deterministic Replay Policy

- Use the same inputs for every repeat run.
- Keep the fixture set unchanged between runs.
- Keep scenario ordering stable between runs.
- Produce the same scenario-by-scenario outcomes on unchanged inputs.
- Treat any unexplained difference as a stop condition, not a pass.

## Cleanup Policy

- Cleanup metadata may be recorded, but cleanup must never become a hidden
  runtime path.
- If cleanup cannot restore the exact initial state, the fixture is not MVP-safe.

## Failure Conditions

- live PocketBase mutation is needed to reset the fixture
- player data would be mutated during reset
- reset requires hidden network state
- replay results differ on unchanged inputs
- the fixture cannot be restored to the same starting state twice

## Evidence Linkage

The reset and replay policy must reference the same real source and baseline
anchors used by the fixture schema and manifest documents.
