---
name: basing-pocketbase-contracts
description: Use when working on PocketBase reads, writes, auth, collections, adapter helpers, hooks, or schema compatibility.
---

# Purpose

Keep the persistence boundary coherent and backwards compatible.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-state-ownership`

## Sources Of Truth

- `src/pocketbase.ts`
- `pb_hooks/main.pb.js`
- `pb_hooks/tree_server_utils.js`
- `specs/_baseline/03-state-ownership.md`
- `specs/_baseline/04-pocketbase-contracts.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/11-error-handling.md`

## Core Rules

- PocketBase is the persistent authority.
- `src/pocketbase.ts` is the canonical client adapter.
- Use the existing queue, timeout, and compatibility helpers instead of adding
  a second persistence path.
- Preserve raw JSON, legacy fallbacks, and 404 / 401 / 403 handling exactly as
  the source defines them.
- Schema changes and destructive migrations need owner approval.

## Workflow

1. Identify the collection, doc, or helper.
2. Read the current adapter path and the matching baseline doc.
3. Decide whether the change is a read, write, subscription, or hook path.
4. Preserve compatibility before you touch semantics.
5. If you are changing behavior, hand off to `basing-verification`.

## Invariants

- One adapter, not two.
- Raw record fields survive partial writes.
- 404 means not found, not silent data loss.
- Client mirrors never replace the server contract.

## Stop Conditions

- The edit would rename a collection or field.
- The task needs a new adapter or a destructive migration.
- The source does not prove the record shape or error behavior.

## Common Failure Modes

- Creating a second adapter path.
- Renaming fields or collections without schema review.
- Breaking 404 / 401 / 403 semantics.

## Never Do

- Change schema or destructive migrations without owner approval.
- Replace the canonical client adapter.
- Assume raw record shape from memory.

## Examples

- Good: update one helper and keep the 404 fallback intact.
- Wrong: add a new persistence wrapper beside `src/pocketbase.ts`.

## Verification

- Confirm the exact collection and helper path that changed.
- Confirm compatibility behavior for 404, auth, and partial writes.
- Confirm no second persistence path was added.

## Completion Report

- List the affected collections, helpers, or hooks.
- State the compatibility risk and any owner approval used.
- Note any fallback or legacy branch that had to stay alive.
