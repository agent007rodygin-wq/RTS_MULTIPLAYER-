---
name: basing-content-and-assets
description: Use when changing canonical game data, item or building definitions, or public assets while preserving identifiers, balance, and asset references.
---

# Purpose

Keep canonical data and assets stable while updating only the intended
reference.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`
- `basing-verification`

## Sources Of Truth

- `data/buildings.ts`
- `data/items.ts`
- `public/**`
- `specs/_baseline/06-building-system.md`
- `specs/_baseline/07-production-system.md`
- `specs/_baseline/08-upgrade-system.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`

## Core Rules

- The canonical id is the key.
- Display names come from canonical mappings, not ad hoc text.
- Do not invent balance facts that source does not prove.
- Check runtime references before deleting or renaming an asset.
- Preserve path casing and replacement coverage.

## Canonical Rules

- ID is the main key.
- The display name comes from the canonical mapping.
- item `10003` is `Куски супер гриба`.
- item `10039` is `Символ любви`.
- Do not use `Сердце` when the source requires `Символ любви`.
- Do not change requirements, prices, durations, or rewards without a
  separate requirement.

## Common Failure Modes

- Renaming ids to match display names.
- Deleting an asset before confirming every runtime reference.
- Swapping canonical text for ad hoc local strings.

## Never Do

- Change canonical ids silently.
- Remove a fallback before replacement is verified.
- Guess balance from memory.

## Examples

- Good: replace one public asset after searching all references.
- Wrong: rename an item id because the UI label looks nicer.

## Workflow

1. Find the canonical data source.
2. Audit runtime references to the item or asset.
3. Update the mapping or asset in one narrow step.
4. Confirm the replacement exists everywhere it is needed.
5. Only then consider removal of the old asset or alias.

## Invariants

- IDs stay stable unless a separate migration exists.
- Assets are deleted only after replacement is verified.
- Public assets are source-linked, not decorative leftovers.
- Legacy fallback stays until a deliberate retirement step exists.

## Stop Conditions

- The edit would alter balance, durations, rewards, or canonical ids.
- The asset is still referenced and has no replacement.
- The task needs a broader gameplay or schema decision.

## Verification

- Search for every runtime reference to the changed data or asset.
- Confirm the replacement path exists and loads cleanly.
- Confirm no unexpected asset path or casing breakage was introduced.

## Completion Report

- List the canonical data or assets touched.
- State which replacements were verified.
- Note any legacy asset or fallback that intentionally remains.
