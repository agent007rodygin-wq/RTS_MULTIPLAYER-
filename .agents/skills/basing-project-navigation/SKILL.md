---
name: basing-project-navigation
description: Use when locating the live repository surface, separating current source from backups or restores, checking Graphify freshness, or finding the right source anchors before analysis.
---

# Purpose

Find the active source and the right evidence path before any analysis or
change.

## Skill Version

1.0

## Required Companion Skills

- None. This is the root navigation skill.

## Sources Of Truth

- `App.tsx`
- `src/pocketbase.ts`
- `specs/_baseline/00-project-overview.md`
- `specs/_baseline/01-current-architecture.md`
- `specs/_baseline/17-traceability-index.md`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`

## Core Rules

- Treat Graphify as navigation only.
- Treat backups, restores, and test snapshots as non-authoritative unless
  current source proves otherwise.
- Anchor every fact to a file path, symbol, or baseline doc.
- Start from the live source path, not from archives or generated outputs.

## Common Failure Modes

- Starting from a backup or restored file instead of the active source.
- Treating Graphify as runtime proof.
- Reading too much before finding a source anchor.

## Never Do

- Infer live behavior from backup or test artifacts.
- Claim runtime truth from Graphify alone.
- Skip the direct source anchor.

## Examples

- Good: "Need current building behavior" -> open `App.tsx` + the matching
  baseline doc.
- Wrong: "Use `App.tsx.backup.*` for live runtime behavior."

## Workflow

1. Identify the task surface.
2. Find the current source file or symbol.
3. Use Graphify only to narrow candidates.
4. Read direct source and the matching baseline doc.
5. Record the anchor and freshness note.

## Invariants

- Live source beats backup.
- Graphify never proves runtime behavior.
- Every claim needs a source anchor.

## Stop Conditions

- Only backup or restore files are available.
- Graphify and source disagree and the source anchor is still missing.
- The task clearly requires a change, so hand off to `basing-change-safety`.

## Verification

- Confirm the exact file paths and symbol names.
- Confirm the Graphify artifact is the current snapshot, not a stale export.
- Do not claim behavior without a direct source anchor.

## Completion Report

- List the live source files and symbols that matter.
- Note whether Graphify helped or was only a fallback map.
- Name the next skill to open if the work continues.
