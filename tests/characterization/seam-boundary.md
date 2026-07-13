# Seam Boundary

## Purpose

Define when a scenario can use a pure seam and when it needs a potential
owner-approved test seam.

## Seam Types

### Pure Seam

A pure seam is a deterministic helper, reducer, merge policy, or
command-transition boundary that can be exercised without changing runtime
behavior.

Pure seams are preferred when the current source already exposes the needed
boundary.

### Potential Owner-Approved Seam

A potential owner-approved seam is a minimal test-only boundary that may be
needed if the current source does not expose a pure helper for the
observation.

It must remain:

- potential until the source audit proves it is needed
- minimal
- separately tracked
- approved before implementation
- excluded from broad runtime refactors

## Scenario Mapping

| Scenario | Preferred Seam Type | Notes |
| --- | --- | --- |
| 1 | Pure seam | stale-snapshot ordering should stay a merge helper if possible |
| 2 | Pure seam | tombstone and reconnect ordering should stay narrow |
| 3 | Potential owner-approved seam | completion may need a minimal timer boundary |
| 4 | Potential owner-approved seam | catch-up and reward delivery may need a minimal replay boundary |
| 5 | Potential owner-approved seam | reload convergence may need a small persisted-process seam |
| 6 | Potential owner-approved seam | reconnect reward delivery may need a small process helper |
| 7 | Potential owner-approved seam | upgrade completion may need a small replay helper |
| 8 | Pure seam | reject rollback should stay within an optimistic command helper |
| 9 | Pure seam | late-ack reconciliation should stay within command merge logic |
| 10 | Pure seam | destroyed-state resurrection guard should stay within merge logic |

## MVP Policy

- Pure seams are the first choice.
- Potential owner-approved seams are allowed only when a scenario cannot be
  proven against an existing pure boundary.
- No production refactor is allowed in the MVP.

## Never Do

- do not add a seam that changes gameplay behavior
- do not widen a seam into a refactor
- do not use a seam to mutate live PocketBase data
- do not let a seam become a second source of truth
