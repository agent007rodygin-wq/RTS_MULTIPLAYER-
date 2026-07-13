# Quickstart: Characterization Tests

## Purpose

This is the future operator flow for Feature 002. It does not create tests yet; it explains the order the implementation should follow once the runner exists.

## Before You Start

- Confirm `main` is clean and synchronized with `origin/main`.
- Confirm `.specify/feature.json` points to `specs/002-characterization-tests`.
- Read `spec.md`, `research.md`, `data-model.md`, and the `contracts/*` files.
- Do not start with P2, P3, or a production refactor.

## Expected Command

The repeatable characterization command is defined during implementation and should run against deterministic local fixtures only.

## Future Workflow

1. Load the approved feature-local fixture set.
2. Run Slice A, then Slice B, then Slice C as defined by `research.md`.
3. Record the source anchors and classification for each scenario.
4. Repeat the same command a second time without changing the fixture set.
5. Confirm that the second run produces the same pass/fail result set.
6. If a scenario still needs a seam, stop and request owner approval before adding it.

## What a Passing MVP Looks Like

- 10 atomic P1 scenarios exist.
- Each scenario has one classification and one evidence reference.
- The suite is deterministic on two consecutive unchanged runs.
- No live PocketBase or player data is mutated.
- One command reports pass/fail for the suite.
- No production refactor is required for the MVP.

## What Not To Do

- Do not create `tasks.md` in this planning pass.
- Do not create a harness that mutates live PocketBase data.
- Do not widen the suite to P2 or P3 surfaces.
- Do not treat a known bug as frozen behavior.
