# Stop Policy

## Purpose

Define the earliest safe stop points for characterization work.

## Stop Conditions

- `main` and `origin/main` are not synchronized
- the working tree is dirty outside the allowed feature-local docs
- `.specify/feature.json` does not point to `specs/002-characterization-tests`
- a scenario still lacks a real source anchor
- a scenario would require live PocketBase mutation
- a scenario would require a broad production refactor
- a scenario is a known bug without a separate fix decision
- a scenario belongs to P2 or P3 scope
- a seam would change gameplay behavior
- a seam would become a second source of truth
- hidden network access is required

## Stop Rule

Stop instead of guessing. If the evidence is incomplete, the correct action is
to pause and investigate, not to freeze unconfirmed behavior.
