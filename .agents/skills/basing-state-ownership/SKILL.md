---
name: basing-state-ownership
description: Use when deciding whether a slice of state is server-owned, client-owned, mirrored, cached, optimistic, or tombstoned.
---

# Purpose

Map who owns a state slice before anyone writes to it.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`

## Sources Of Truth

- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/12-target-architecture.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/17-traceability-index.md`

## Core Rules

- Every persistent slice gets one server source of truth.
- Mirrored state, refs, and caches are not authority.
- Optimistic state is provisional until the server confirms it.
- Tombstones suppress resurrection; they do not become truth.
- Loading gates and other UI-only state stay client-owned.

## Common Failure Modes

- A client cache quietly becoming the real source of truth.
- Merging state and then writing back as if the merge were canonical.
- Treating a selected index or view ref as stable identity.

## Never Do

- Create a second source of truth.
- Promote optimistic shadow state to authority.
- Let tombstones or caches own persistent data.

## Examples

- Good: `users/<uid>` owns profile data; React state mirrors it.
- Wrong: local UI state becomes the authoritative inventory store.

## Workflow

1. Name the slice.
2. Identify the server owner.
3. List the client mirrors, refs, and caches.
4. Write the reconciliation and reset policy.
5. Check whether the slice already has a competing source of truth.

## Invariants

- One owner per persistent slice.
- Merge state is derived, not primary.
- Selection or array index is not stable identity.
- A state slice without reconciliation is incomplete.

## Stop Conditions

- Two places claim authority over the same persisted slice.
- The slice cannot be named with a clear owner, reader, and writer.
- The task needs a mutation, so open `basing-change-safety` next.

## Verification

- Check that every claim in the task points at one owner.
- Check that mirrors and caches are labeled as mirrors or caches only.
- Check that tombstones are suppression helpers, not data stores.

## Completion Report

- State the owner, mirrors, and reconciliation policy.
- Note any ambiguity that still needs a decision.
- Say whether the slice is safe to mutate or still needs design work.
