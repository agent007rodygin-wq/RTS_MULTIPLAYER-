---
name: basing-realtime-sync
description: Use when handling subscriptions, initial fetches, stale snapshots, retries, tombstones, out-of-order events, or reconnect merge behavior.
---

# Purpose

Keep realtime merge behavior from becoming a second source of truth.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-pocketbase-contracts`
- `basing-state-ownership`

## Sources Of Truth

- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/15-invariants.md`

## Core Rules

- Perform the initial fetch before trusting a subscription.
- Delete events suppress resurrection instead of recreating state.
- A stale or out-of-order snapshot cannot overwrite newer intent.
- Retries must stay bounded.
- Cleanup on unmount is part of the contract.

## Workflow

1. Classify the subscription shape.
2. Map the owning state slice.
3. Decide merge, refetch, or suppression policy.
4. Add or preserve tombstones and late-event guards.
5. Check cleanup and retry behavior.

## Invariants

- Realtime is a transport, not a truth source.
- Late events are suppression-only.
- Infinite refetch is a bug.
- Zone merge and broad refetch need to be chosen, not implied.

## Stop Conditions

- The path would make realtime authoritative over persistence.
- Retry policy is unbounded or unclear.
- The change needs timer ownership, so open `basing-process-time` too.

## Common Failure Modes

- Trusting subscription before initial fetch.
- Letting stale or out-of-order snapshots win.
- Leaving retries unbounded.

## Never Do

- Make realtime authoritative over persistence.
- Treat tombstones as optional decoration.
- Skip cleanup on unmount.

## Examples

- Good: fetch first, then subscribe and suppress delete resurrection.
- Wrong: use the first socket event as the source of truth.

## Verification

- Confirm initial fetch, subscription, and cleanup order.
- Confirm stale snapshots do not win over newer local or server intent.
- Confirm retry and tombstone behavior with the current source.

## Completion Report

- Name the realtime surface and its merge policy.
- Note the retry and cleanup behavior.
- Record any remaining race or freshness risk.
