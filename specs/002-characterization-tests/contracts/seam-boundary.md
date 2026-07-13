# Seam Boundary

## Purpose

Define when a scenario can use a pure seam and when it needs a minimal owner-approved test seam.

## Seam Types

### Pure Seam

A pure seam is a deterministic helper, reducer, merge policy, or command-transition boundary that can be exercised without changing runtime behavior.

Pure seams are preferred when the current source already exposes the needed boundary.

### Owner-Approved Seam

An owner-approved seam is a minimal test-only boundary added because the current source does not expose a pure helper for the observation.

It must be:

- minimal
- separately tracked
- approved before implementation
- excluded from broad runtime refactors

## MVP Policy

- Pure seams are the first choice.
- Owner-approved seams are allowed only when a scenario cannot be proven against an existing pure boundary.
- No production refactor is allowed in the MVP.

## Never Do

- do not add a seam that changes gameplay behavior
- do not widen a seam into a refactor
- do not use a seam to mutate live PocketBase data
- do not let a seam become a second source of truth
