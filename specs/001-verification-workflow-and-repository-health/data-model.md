# Data Model: verification-workflow-and-repository-health

## Overview

This feature models one execution of a repository-health workflow. The workflow is read-only with respect to game code and PocketBase data, but it does produce a JSON report artifact under `specs/001-verification-workflow-and-repository-health/reports/`.

## Entities

### RepositoryHealthRun

Represents one end-to-end execution of the workflow.

| Field | Type | Validation / Notes |
| --- | --- | --- |
| `runId` | string | Required; unique for each run |
| `generatedAt` | string (ISO-8601) | Required |
| `repoRoot` | string | Required; must resolve to the repository root |
| `entryPoint` | string | Required; expected to be `verify_repository_health.ps1` |
| `overallStatus` | enum | `PASS`, `WARN`, `BLOCKED`, or `FAIL` |
| `exitCode` | integer | Must match the status mapping in the contract |
| `feature002GateDecision` | enum | `ALLOW` or `DENY` |
| `feature002GateBasis` | enum | `PASS`, `APPROVED_WARNINGS`, `BLOCKED`, or `FAIL` |
| `gitState` | enum | `TRUSTED`, `UNTRUSTED`, or `MISSING` |
| `baselineFreshness` | enum | `FRESH`, `STALE`, or `UNKNOWN` |
| `graphFreshness` | enum | `FRESH`, `STALE`, or `UNKNOWN` |
| `checks` | VerificationCheck[] | Required; ordered in execution order |
| `summary` | SummaryCounts | Required |
| `excludedPaths` | string[] | Required; normalized relative paths or glob patterns |
| `protectedPaths` | string[] | Required; the surface that must not be modified by the workflow |
| `notes` | string[] | Optional; short human-readable caveats |

### VerificationCheck

Represents one command, inventory item, or derived check.

| Field | Type | Validation / Notes |
| --- | --- | --- |
| `id` | string | Required; stable and unique within the run |
| `label` | string | Required; short human-readable name |
| `kind` | enum | `COMMAND`, `INVENTORY`, `FRESHNESS`, `GIT`, `DERIVED` |
| `status` | enum | `PASS`, `WARN`, `BLOCKED`, `FAIL`, or `SKIPPED` |
| `required` | boolean | Required; `true` for checks that must run when possible |
| `command` | string | Optional; used for executable checks |
| `evidence` | string[] | Optional; paths, hashes, or log fragments supporting the result |
| `reason` | string | Required whenever `status` is not `PASS` |
| `skippedReason` | string | Required when `status` is `SKIPPED` |
| `durationMs` | number | Optional; should be non-negative when present |

### FreshnessSnapshot

Captures the source-vs-baseline-vs-graph comparison used by the workflow.

| Field | Type | Validation / Notes |
| --- | --- | --- |
| `activeSourceFiles` | string[] | Normalized relative paths for the active source surface |
| `baselineDocs` | string[] | Baseline docs consulted, typically `12` through `17` plus the current feature spec |
| `graphArtifacts` | string[] | `graphify-out/graph.json`, `GRAPH_REPORT.md`, `.graphify_analysis.json`, `.graphify_labels.json`, and related metadata when present |
| `latestSourceMTime` | string | ISO-8601 or comparable canonical time string |
| `latestBaselineMTime` | string | Same format as above |
| `latestGraphMTime` | string | Same format as above |
| `missingGraphFiles` | string[] | Optional; active files not represented in the current graph surface |
| `driftReasons` | string[] | Optional; reasons the snapshot is stale or uncertain |

### GateDecision

Represents whether Feature 002 may proceed.

| Field | Type | Validation / Notes |
| --- | --- | --- |
| `targetFeature` | string | Required; expected to be `Feature 002` |
| `decision` | enum | `ALLOW` or `DENY` |
| `basis` | enum | `PASS`, `APPROVED_WARNINGS`, `BLOCKED`, or `FAIL` |
| `approvedWarnCategories` | string[] | Optional; populated only when warnings are explicitly owner-approved |
| `reason` | string | Required |

### SurfaceRuleSet

Defines what the workflow may inspect and what it must ignore.

| Field | Type | Validation / Notes |
| --- | --- | --- |
| `includedRoots` | string[] | Active source, baseline docs, helper scripts, and Graphify artifacts |
| `excludedPatterns` | string[] | `node_modules`, `.git`, `dist`, `build`, `pb_data`, databases, secrets, `.env`, media, archives, logs, generated files, and inactive backups |
| `reportPath` | string | The JSON artifact location |
| `protectedSurface` | string[] | Files/directories that must not change during the workflow |

## Relationships

- One `RepositoryHealthRun` has many `VerificationCheck` records.
- One `RepositoryHealthRun` has one `FreshnessSnapshot`.
- One `RepositoryHealthRun` has one `GateDecision`.
- One `SurfaceRuleSet` applies to one `RepositoryHealthRun`.

## State Transitions

### RepositoryHealthRun

- `created` -> `running` -> `complete`
- `running` -> `complete` with final `overallStatus`

### VerificationCheck

- `pending` -> `PASS` / `WARN` / `BLOCKED` / `FAIL` / `SKIPPED`

### GateDecision

- `pending` -> `ALLOW` or `DENY`

## Validation Rules

- `exitCode` must match `overallStatus`.
- `feature002GateDecision = ALLOW` only when `overallStatus = PASS` or when `overallStatus = WARN` and every warning category is owner-approved.
- Git absence, empty `.git`, or untrustworthy Git metadata must force a non-`PASS` result.
- No protected file may change as a side effect of the workflow.
- The JSON report path must remain inside the feature-local output directory, not inside gameplay source folders.
