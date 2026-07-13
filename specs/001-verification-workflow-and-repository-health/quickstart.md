# Quickstart: verification-workflow-and-repository-health

## Prerequisites

- Windows 10 with Windows PowerShell
- Repository checked out at the project root
- Node.js/npm available for the existing verification commands
- PocketBase reachable if you want the full health sweep
- Git is optional for execution, but trusted Git metadata is required for a `PASS`

## Current Flags

The workflow currently accepts these PowerShell switches:

| Flag | Effect |
| --- | --- |
| `-AllowNetworkChecks` | Enables the network-read helpers that are gated behind the network opt-in matrix. |
| `-AllowSchema` | Enables `check_schema.mjs` without opening the other network helpers. |
| `-AllowWorld` | Enables `verify_world.mjs` without opening the other network helpers. |
| `-AllowBuild` | Enables the build helpers only when paired with `-AllowLocalWrites`. |
| `-AllowLocalWrites` | Required with `-AllowBuild` before any local-write helper can run. |

The default run uses no switches.

## Run the Workflow

From the repository root:

```powershell
.\verify_repository_health.ps1
```

The command should:

- print a readable console summary
- write a JSON report to `specs/001-verification-workflow-and-repository-health/reports/repository-health.json`
- return one of the planned exit codes:
  - `0` for `PASS`
  - `1` for `WARN`
  - `2` for `BLOCKED`
  - `3` for `FAIL`

## Expected Checks

The workflow should surface the result of these existing checks:

- `npm run lint`
- `npm run build`
- `node check_schema.mjs`
- `node smoke_pocketbase_startup.mjs`
- `node verify_world.mjs`
- `node check_regressions_worker6.mjs`

It should also report:

- whether Git metadata is trusted or fallback-only
- whether the baseline snapshot is fresh enough for the current source surface
- whether Graphify is still current for the active source files
- which paths were excluded from analysis
- whether Feature 002 is allowed or denied
- the guard, Git, freshness, and synthetic runtime validation blocks in the JSON report

## Validation Scenarios

1. Run the workflow in the current workspace and confirm the report is produced without touching gameplay code or PocketBase data.
2. Review the `git` object in the JSON report and confirm that an empty or incomplete `.git` state is reported as `git.mode = MISSING` or `FALLBACK_ONLY`, not as trusted.
3. Inspect the `gitValidation.cases` array and confirm the controlled fixture suite passes for the synthetic trusted and root-mismatch cases while keeping the temporary fixtures under `specs/001-verification-workflow-and-repository-health/.tmp/git-fixtures/`.
4. Run it after a source change that outpaces Graphify and confirm the graph freshness check does not claim a false `PASS`.
5. Run it after a PocketBase outage and confirm the report records the limitation instead of fabricating a trusted health result.
6. Inspect `runtimeFixtureValidation.cases` and confirm the synthetic runtime matrix passes without executing live network helpers.

## Git Fixture Recipes

The Git slice is now validated by controlled fixtures that the workflow creates and removes automatically. The default command is the same for every recipe:

```powershell
.\verify_repository_health.ps1
```

| Recipe | Setup | Expected status in `gitValidation` | Expected exit code | Expected `git.mode` | Cleanup | Safety warning |
| --- | --- | --- | --- | --- | --- | --- |
| Current untrusted workspace | No manual setup; use the repository as-is. | `BLOCKED` for the real workspace snapshot | `3` on this workspace because other checks still fail | `MISSING` | None required | Do not repair the real `.git` directory. |
| Missing `.git` | The workflow creates a temp fixture with no `.git` metadata. | `BLOCKED` | `3` on this workspace unless all required checks are clean | `MISSING` | Automatic temp cleanup | Never delete the live `.git` to simulate this case. |
| Empty `.git` | The workflow creates a temp fixture with an empty `.git` directory. | `BLOCKED` | `3` on this workspace unless all required checks are clean | `MISSING` | Automatic temp cleanup | Do not add files to the real `.git` just to test. |
| Malformed pointer | The workflow creates a temp fixture with a malformed worktree pointer file. | `BLOCKED` | `3` on this workspace unless all required checks are clean | `MISSING` | Automatic temp cleanup | Never replace the real `.git` with a pointer file. |
| Trusted synthetic fixture | The workflow creates a synthetic trusted fixture case and records it in `gitValidation`. | `PASS` | `3` on this workspace because the overall repo-health gate still reflects real helper failures | `TRUSTED` | Automatic temp cleanup | This is synthetic; do not change the live repo to make it pass. |
| Git executable unavailable | The workflow disables Git resolution for the fixture case and records fallback-only evidence. | `BLOCKED` | `3` on this workspace unless all required checks are clean | `MISSING` | Automatic temp cleanup | Do not uninstall Git or change PATH just to test the gate. |

## Freshness and Runtime-Sensitive Recipes

These recipes use controlled fixture workspaces or opt-in flags. The workflow now includes a fully synthetic `runtimeFixtureValidation` suite, so the runtime cases below are checked without calling live PocketBase, schema, or world helpers. The fixture status is separate from the overall workflow status, which may still be `FAIL` on the current workspace because the existing lint/regression checks are not clean.

| Recipe | Setup | Expected status in freshness/check record | Expected overall exit code | Safety warning |
| --- | --- | --- | --- | --- |
| Current baseline freshness | No manual setup; run against the current workspace. | `freshness.baseline = FRESH` and `freshness.graph = FRESH` | `3` on this workspace because other required checks still fail | Do not touch baseline docs just to force a pass. |
| Stale Graphify snapshot | Use a controlled fixture where `graphify-out/` is older than the active source surface or missing one tracked source file. | `freshness.graph = STALE` or `UNKNOWN`, depending on what is missing | `3` unless all other required checks are otherwise clean | Do not rebuild the live graph just to test the stale case. |
| Schema drift | Use a controlled fixture workspace where the schema contract no longer matches the baseline and run with `-AllowNetworkChecks -AllowSchema`. | The schema helper should report `BLOCKED` or `FAIL` depending on the fixture | `3` on this workspace unless every other required check is clean | Do not change the live PocketBase schema to manufacture drift. |
| PocketBase unavailable | Use a controlled fixture where PocketBase is unreachable and run with `-AllowNetworkChecks`. | The PocketBase helper should report `BLOCKED` | `3` on this workspace unless every other required check is clean | Do not stop or repair the live PocketBase service just for the recipe. |
| World sanity mismatch | Use a controlled fixture with divergent world state and run with `-AllowNetworkChecks -AllowWorld`. | The world helper should report `BLOCKED` | `3` on this workspace unless every other required check is clean | Do not alter live world data to force the mismatch. |

## Report Blocks

The JSON report now includes these validation objects for review:

- `guardValidation`
- `dispatchValidation`
- `gateValidation`
- `statusAggregationValidation`
- `gitValidation`
- `freshnessValidation`
- `runtimeFixtureValidation`

`runtimeFixtureValidation` is synthetic only. It records:

- `SCHEMA_MATCH`
- `SCHEMA_DRIFT`
- `POCKETBASE_UNAVAILABLE_DOCS_ONLY`
- `POCKETBASE_UNAVAILABLE_PERSISTENT_GATE`
- `WORLD_SANITY_PASS`
- `WORLD_SANITY_MISMATCH`

## Safety Checks

- The workflow must not modify `App.tsx`, `src/pocketbase.ts`, `package.json`, `tsconfig.json`, or PocketBase data.
- Any allowed transient output should stay outside the protected source surface and be called out explicitly in the JSON report.
- The JSON report is the artifact to review; console text is for immediate human feedback.

## Next Review Point

After this quickstart is stable, the implementation phase can split the work into the four slices described in `research.md`.
