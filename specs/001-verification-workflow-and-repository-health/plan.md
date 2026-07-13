# Implementation Plan: verification-workflow-and-repository-health

**Branch**: `[001-verification-workflow-and-repository-health]` | **Date**: 2026-07-13 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `spec.md`

## Summary

Build one safe Windows PowerShell repo-health workflow for Feature 001. The command will orchestrate existing npm scripts and Node `.mjs` diagnostics, emit a console summary plus a JSON report, classify Git trust and fallback, compare the active source surface with the baseline and Graphify artifacts, and return a gate decision for Feature 002 without touching gameplay code, PocketBase schema/data, or config.

Graphify is currently usable as a navigation map: the bundle in `graphify-out/` is newer than the active source files inspected in this workspace, but the workflow must still re-check freshness every run instead of trusting timestamps alone.

## Technical Context

**Language/Version**: Windows PowerShell entry point on Windows 10, orchestrating existing Node.js `.mjs` helpers in a React + TypeScript + Vite repository

**Primary Dependencies**: PowerShell, Node.js/npm, existing repo helper scripts (`check_schema.mjs`, `smoke_pocketbase_startup.mjs`, `verify_world.mjs`, `check_regressions_worker6.mjs`), Graphify artifacts in `graphify-out/`, PocketBase as the authoritative backend for read-only health checks

**Storage**: File-based repository inputs plus one generated JSON report artifact under `specs/001-verification-workflow-and-repository-health/reports/`; no gameplay or PocketBase data writes

**Testing**: Existing project checks only (`npm run lint`, `npm run build`, `node check_schema.mjs`, `node smoke_pocketbase_startup.mjs`, `node verify_world.mjs`, `node check_regressions_worker6.mjs`); no configured test runner yet

**Target Platform**: Windows 10 with Windows PowerShell

**Project Type**: Single-repository web game with repo-health tooling and PocketBase-backed runtime state

**Performance Goals**: One interactive command, bounded subprocess timeouts, repeatable enough to run before each major feature decision

**Constraints**: Do not change gameplay code, `App.tsx`, PocketBase schema/data, configs, saved data, or `.env`; exclude `node_modules`, `.git`, `dist`, `build`, `pb_data`, databases, secrets, media, archives, logs, generated files, and inactive backups from analysis; treat Git absence as a trust failure, not a reason to fake a pass

**Scale/Scope**: One repository, one new PowerShell entry point, one JSON summary artifact, and documentation/contract files only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Specification First, Evidence Always: pass. The plan is grounded in the current source surface, baseline docs, Graphify artifacts, and the actual helper-script inventory.
- Server Authority and Data Integrity: pass. The workflow is read-only with respect to PocketBase data and schema.
- Temporal Correctness and Idempotency: pass. The workflow inspects timer/process evidence but does not mutate gameplay state.
- Compatibility and Player Save Safety: pass. No balance, save-format, collection, or field-name changes are planned.
- Incremental Change and Verification: pass. The feature is a single workflow wrapper plus docs/contracts, not a refactor of game logic.

No constitution violations are expected, so no complexity-tracking exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/001-verification-workflow-and-repository-health/
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/
    repository-health-workflow.md
  tasks.md
```

### Source Code (repository root)

```text
verify_repository_health.ps1
check_build.mjs
check_regressions_worker6.mjs
check_schema.mjs
smoke_pocketbase_startup.mjs
verify_world.mjs
package.json
tsconfig.json
graphify-out/
specs/_baseline/
App.tsx
LoadingScreen.tsx
components/
data/
pb_hooks/
src/
```

**Structure Decision**: Keep the user-facing entry point as a root-level PowerShell script named `verify_repository_health.ps1` so it matches the repo's existing helper-script style. Keep the report artifact feature-local under `specs/001-verification-workflow-and-repository-health/reports/` so the workflow stays easy to find and easy to exclude from mutation checks. Leave production code untouched.

## Complexity Tracking

Not needed. This feature does not introduce a constitution exception, a new runtime subsystem, or a schema change.
