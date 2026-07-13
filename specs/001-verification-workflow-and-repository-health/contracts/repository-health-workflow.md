# Contract: Repository Health Workflow

## Purpose

This contract defines the user-facing behavior of the Feature 001 repository-health workflow. It is intentionally read-only with respect to gameplay code and PocketBase data.

## Command Interface

### Entry Point

- `.\verify_repository_health.ps1`

### Inputs

- No required arguments.
- Optional implementation details may be added later, but the default command must remain safe and reproducible from the repository root.
- Current optional switches:
  - `-AllowNetworkChecks`
  - `-AllowSchema`
  - `-AllowWorld`
  - `-AllowBuild`
  - `-AllowLocalWrites`

### Outputs

- Human-readable console summary
- JSON report file at `specs/001-verification-workflow-and-repository-health/reports/repository-health.json`
- Exit code that matches the final status
- Diagnostic validation blocks for helper audit, stop conditions, Git trust, baseline/Graphify freshness, and synthetic runtime fixtures

## Status Contract

The workflow must emit exactly one final status:

- `PASS`
- `WARN`
- `BLOCKED`
- `FAIL`

### Exit Codes

- `0` -> `PASS`
- `1` -> `WARN`
- `2` -> `BLOCKED`
- `3` -> `FAIL`

## Feature 002 Gate Contract

The JSON report must include a dedicated Feature 002 gate decision.

### Required Fields

- `feature002GateDecision`: `ALLOW` or `DENY`
- `feature002GateBasis`: `PASS`, `APPROVED_WARNINGS`, `BLOCKED`, or `FAIL`
- `approvedWarnCategories`: array of owner-approved warning categories, when applicable
- `feature002GateReason`: short explanation of the decision

### Gate Rules

- `ALLOW` only when the workflow status is `PASS`.
- `ALLOW` is also acceptable when the workflow status is `WARN` and every warning category is explicitly owner-approved for Feature 002.
- `DENY` for any `BLOCKED` or `FAIL` outcome.

## JSON Report Contract

### Required Top-Level Fields

- `runId`
- `generatedAt`
- `durationMs`
- `repoRoot`
- `entryPoint`
- `overallStatus`
- `feature002GateDecision`
- `feature002GateBasis`
- `feature002GateReason`
- `approvedWarnCategories`
- `exitCode`
- `git`
- `freshness`
- `checks`
- `summary`
- `excludedPaths`
- `protectedPaths`
- `stopConditions`
- `stopConditionsStatus`
- `stopConditionsReason`
- `ownerApprovalGate`
- `ownerApprovalGateStatus`
- `ownerApprovalGateReason`
- `protectedPathGuardStatus`
- `protectedPathGuardReason`
- `guardValidation`
- `dispatchValidation`
- `gateValidation`
- `statusAggregationValidation`
- `gitValidation`
- `gitValidationStatus`
- `gitValidationReason`
- `freshnessValidation`
- `freshnessValidationStatus`
- `freshnessValidationReason`
- `runtimeFixtureValidation`
- `runtimeFixtureValidationStatus`
- `runtimeFixtureValidationReason`
- `notes`

### `git` Object

Required fields:

- `available`
- `executablePath`
- `metadataKind`
- `metadataTrusted`
- `trusted`
- `mode` (`TRUSTED`, `UNTRUSTED`, `FALLBACK_ONLY`, `MISSING`)
- `repositoryRoot`
- `expectedRoot`
- `rootMatches`
- `revParseExitCode`
- `statusExitCode`
- `diffExitCode`
- `changedFiles`
- `stagedFiles`
- `untrackedFiles`
- `reason`
- `evidence`
- `protectedPathComparison`

### `freshness` Object

Required fields:

- `baseline`
- `graph`
- `activeSourceFiles`
- `baselineDocs`
- `designDocs`
- `graphArtifacts`
- `driftReasons`
- `sourceSnapshot`
- `baselineSnapshot`
- `graphSnapshot`
- `graphifySurface`

### Validation Records

The current implementation emits the following diagnostic validation objects, each with a `status` and `cases` array:

- `guardValidation`
- `dispatchValidation`
- `gateValidation`
- `statusAggregationValidation`
- `gitValidation`
- `freshnessValidation`
- `runtimeFixtureValidation`

`runtimeFixtureValidation` is synthetic and does not execute live PocketBase, schema, world, or build commands.

### `checks` Array Item

Required fields:

- `id`
- `label`
- `kind`
- `status`
- `required`
- `reason` or `skippedReason`

Optional fields:

- `command`
- `exitCode`
- `evidence`
- `durationMs`

Current implementation may also include helper-specific metadata such as `helperClass`, `defaultAutoRun`, `optInGates`, `optInRequirement`, `auditState`, `sourcePath`, `auditTarget`, `skippedReason`, `executionEvidence`, `stdout`, `stderr`, and `safetyNotes`.

## Non-Mutation Contract

The workflow must not alter:

- gameplay code
- PocketBase schema or live data
- configs
- `.env` files
- protected source files in the active surface

Allowed transient outputs must be explicitly listed in the report and must stay outside the protected source surface.

## Reference Checks

The workflow may call these existing commands:

- `npm run lint`
- `npm run build`
- `node check_schema.mjs`
- `node smoke_pocketbase_startup.mjs`
- `node verify_world.mjs`
- `node check_regressions_worker6.mjs`

`check_build.mjs` is retained as a helper but is not required by this contract.
