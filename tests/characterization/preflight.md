# Preflight Gate

## Purpose

Fail closed before any characterization work starts.

## Required Checks

- `git status --short` must be empty.
- The current branch must be `main`.
- `main` must be synchronized with `origin/main`.
- `.specify/feature.json` must point to `specs/002-characterization-tests`.
- Read `specs/002-characterization-tests/spec.md`, `research.md`, `data-model.md`, `quickstart.md`, and `contracts/*` before any write.
- Stop if any unexpected file appears in the working tree or staged set.

## Stop Conditions

- dirty branch
- branch mismatch
- feature pointer mismatch
- missing baseline or source anchors
- any runtime, baseline, Graphify, AGENTS, skill, or PocketBase change
- any plan to mutate live PocketBase or player data

## Notes

This gate is documentation only. It records the preconditions for future
characterization work; it does not implement a runner.
