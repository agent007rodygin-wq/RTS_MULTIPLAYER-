# Research Notes: verification-workflow-and-repository-health

## 1. Entry Point Placement

**Decision**: Use a root-level PowerShell script named `verify_repository_health.ps1`.

**Rationale**: The repository already uses root-level PowerShell helper scripts, so a short Windows-first command fits the existing style and avoids introducing a new tooling directory just for one workflow.

**Alternatives considered**:

- `scripts/verification/verify_repository_health.ps1`
  - Rejected because the repo does not currently have a `scripts/` directory and the extra path hop does not buy anything for this feature.
- `tools/verification/verify_repository_health.ps1`
  - Rejected for the same reason; it would add structure before the workflow proves it needs one.

## 2. Existing Checks To Orchestrate

**Decision**: The workflow should call the existing project verification commands directly:

- `npm run lint`
- `npm run build`
- `node check_schema.mjs`
- `node smoke_pocketbase_startup.mjs`
- `node verify_world.mjs`
- `node check_regressions_worker6.mjs`

**Rationale**: These are the commands that currently provide real signal for type safety, build health, PocketBase schema/health, world sanity, and source-level regression diagnostics. They already exist and do not require a new test runner.

**Alternatives considered**:

- `node check_build.mjs`
  - Rejected as a primary path because it only shells out to `npm run build` and adds no extra signal.
- `npm run diag:regressions`
  - Acceptable as an alias, but the workflow should prefer the underlying helper directly so the report can name the exact script.

## 3. Git Trust and Fallback

**Decision**: Probe Git explicitly with `Get-Command git`, then `git rev-parse --show-toplevel`, `git status --short`, and `git diff --name-only` only when Git is available and the repo root is trustworthy.

**Rationale**: In this workspace, the `.git` directory exists but is empty/partial and the `git` executable is unavailable in the current shell. A repo-health gate must fail safely instead of pretending that a changeset was verified.

**Fallback**: If Git is unavailable or untrustworthy, the workflow should switch to a filesystem-only snapshot mode that records the active source surface and explicitly marks the Git trust check as `BLOCKED`.

**Alternatives considered**:

- Rely on `.git` folder existence alone
  - Rejected because an empty or partial `.git` directory does not prove that Git metadata is usable.
- Infer trust from timestamps only
  - Rejected because timestamps cannot prove branch state, staged changes, or diff accuracy.

## 4. Freshness Checks

**Decision**: Treat freshness as a source-surface consistency problem, not just a timestamp comparison.

**Rationale**: The graph bundle in `graphify-out/` is current enough to serve as a navigation map, but the workflow still needs to compare the active source surface against the graph and baseline anchors on every run.

**Graphify freshness**:

- Use `graphify-out/graph.json` as the operational graph source because it contains node records with `source_file`, `label`, `community_name`, and related fields.
- Use `graphify-out/GRAPH_REPORT.md`, `graphify-out/.graphify_analysis.json`, and `graphify-out/.graphify_labels.json` as supporting metadata when present.
- Treat `graphify-out/cache/` and other generated graph internals as excluded from the source surface.

**Baseline freshness**:

- Compare the active source surface against the baseline docs in `specs/_baseline/12-target-architecture.md` through `specs/_baseline/17-traceability-index.md`.
- Use the current source anchors and file inventory as the proof surface, not the baseline doc timestamps alone.

**Alternatives considered**:

- Use doc timestamps only
  - Rejected because docs can be updated after graph generation and still describe the same source snapshot.
- Use graph timestamps only
  - Rejected because a graph can be newer than the code in one folder and still miss later source drift elsewhere.

## 5. Report Format and Exit Codes

**Decision**: Emit a JSON report with a single top-level run object, a status enum, a feature-002 gate decision, check records, freshness snapshots, and a protected-path snapshot.

**Suggested top-level fields**:

- `runId`
- `generatedAt`
- `repoRoot`
- `entryPoint`
- `overallStatus`
- `feature002GateDecision`
- `feature002GateBasis`
- `exitCode`
- `git`
- `freshness`
- `checks`
- `summary`
- `excludedPaths`
- `protectedPaths`
- `notes`

**Exit code mapping**:

- `0` = `PASS`
- `1` = `WARN`
- `2` = `BLOCKED`
- `3` = `FAIL`

**Rationale**: A small numeric mapping is easy to remember and works well with shell automation, while the JSON report carries the richer detail.

**Alternatives considered**:

- Sparse status-only exit codes with a separate internal error code
  - Rejected because the feature explicitly needs all four visible statuses.
- Large jump codes such as `10/20/30`
  - Rejected because they are harder to remember without adding value.

## 6. Mutation Guard

**Decision**: The workflow should snapshot the protected source surface before and after execution and treat any unexpected mutation outside sanctioned transient outputs as a failure.

**Rationale**: The feature must prove that it did not modify gameplay logic, schema, or user data. The only intentional write should be the JSON report artifact.

**Protected surface should exclude**:

- `node_modules`
- `.git`
- `dist`
- `build`
- `pb_data`
- databases
- secrets and `.env`
- images, music, video
- archives
- temporary logs
- generated files
- inactive backups that are not part of the active build

**Alternatives considered**:

- Trust the command list to stay read-only
  - Rejected because the workflow itself needs an explicit mutation proof.
- Rely on Git diff
  - Rejected because Git may not be available or trustworthy in the current shell.

## 7. Future Task Slices

**Decision**: Split Feature 001 into four implementation slices.

1. Create the PowerShell entry point, report schema, and console summary.
2. Add Git trust/fallback and source-surface freshness checks.
3. Wire the existing Node helpers and aggregate PASS/WARN/BLOCKED/FAIL results.
4. Add the feature-local contract, quickstart, and validation notes.

**Rationale**: Each slice is independently reviewable and keeps the implementation non-destructive.
