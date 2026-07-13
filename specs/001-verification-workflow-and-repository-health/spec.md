# Feature Specification: verification-workflow-and-repository-health

**Feature Branch**: `[001-verification-workflow-and-repository-health]`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Create the first separate feature-spec through the installed Spec Kit workflow. This is Feature 001 from the accepted roadmap."

## Clarifications

### Session 2026-07-12

- Q: What should the canonical repository-health entry point be? -> A: A Windows PowerShell command is the primary user-facing entry point, with existing Node `.mjs` helpers available for complex checks.
- Q: What output format should the workflow produce? -> A: Human-readable console text plus a JSON file for machine-readable consumption.
- Q: How should Git absence, empty metadata, or untrustworthy status be classified? -> A: `BLOCKED`, because a trustworthy changeset cannot be verified.
- Q: How should PocketBase unavailability, schema drift, and stale Graphify be classified? -> A: Temporary PocketBase unavailability is `WARN` for read-only documentation work; schema drift is `BLOCKED`; stale Graphify is `WARN` until structural changes and `BLOCKED` before architectural transfer.
- Q: What is the Feature 002 gate rule? -> A: Allow Feature 002 only when the repo-health report is `PASS` or when the later phase explicitly enumerates owner-approved `WARN` categories.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single repo-health gate (Priority: P1)

As a maintainer, I can run one documented repository-health workflow and get a clear readiness decision for the next feature.

**Why this priority**: Every later step depends on a trustworthy gate before any deeper work begins.

**Independent Test**: Run the documented PowerShell workflow on the current workspace and verify that it reports the checks it performed, the checks it skipped, the final decision, and the JSON summary.

**Acceptance Scenarios**:

1. **Given** a current workspace with the accepted baseline in place, **When** the workflow runs, **Then** it reports a single overall decision and an itemized check list.
2. **Given** a healthy repository state, **When** the workflow runs, **Then** it returns PASS only if all required checks succeed.

---

### User Story 2 - Honest Git fallback (Priority: P1)

As a maintainer, when Git metadata or Git status is not trustworthy, I see that limitation clearly instead of getting a false pass.

**Why this priority**: The current workspace may not expose a reliable Git diff, so the workflow must fail safely.

**Independent Test**: Run the workflow in a workspace where Git status or diff cannot be trusted and verify that the report uses the documented fallback or returns `BLOCKED` with the reason.

**Acceptance Scenarios**:

1. **Given** an unusable or incomplete `.git` state, **When** the workflow runs, **Then** it returns `BLOCKED` and does not claim that diff verification is complete.
2. **Given** Git commands are unavailable, **When** the workflow runs, **Then** it shows the documented fallback and explains the limitation without pretending that changeset trust was established.

---

### User Story 3 - Baseline freshness gate (Priority: P2)

As a maintainer, I can confirm that the accepted baseline, Graphify map, and current source snapshot still agree before starting Feature 002.

**Why this priority**: This protects the next feature from stale navigation, stale assumptions, and hidden source drift.

**Independent Test**: Change the source after the baseline or use stale Graphify artifacts, then run the workflow and verify that it reports WARN or BLOCKED and identifies the mismatch.

**Acceptance Scenarios**:

1. **Given** source files changed after the baseline, **When** the workflow runs, **Then** it reports the mismatch and does not return a false PASS.
2. **Given** Graphify artifacts are stale, **When** the workflow runs, **Then** it reports the staleness and does not treat Graphify as proof of runtime behavior.

### Edge Cases

- `.git` exists but is empty, partial, or otherwise untrustworthy.
- Git is installed, but `git status` or `git diff` cannot be used reliably.
- The repository has changed since the baseline and the workflow must surface that drift.
- Graphify exists but is stale relative to the current source snapshot.
- A required verification command is missing from the repository.
- A required check passes while another required check fails.
- Unexpected file changes are present alongside the accepted baseline docs and this feature spec.
- PocketBase health or schema snapshot checks are unavailable at runtime.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a single documented repository-health entry point for Feature 001 as a Windows PowerShell command.
- **FR-002**: The system MUST detect whether the current workspace is a trustworthy repository root.
- **FR-003**: The system MUST explicitly report whether Git status and diff are trustworthy, unavailable, or replaced by the documented fallback, and it MUST classify absent, empty, or untrustworthy Git metadata as `BLOCKED`.
- **FR-004**: The system MUST inventory the real verification commands available in the repository and surface missing commands as missing.
- **FR-005**: The system MUST evaluate the repository-health checks for source freshness, Graphify freshness, schema snapshot, PocketBase health, TypeScript, production build, and world sanity.
- **FR-006**: The system MUST clearly separate allowed file changes from unexpected file changes.
- **FR-007**: The system MUST emit a single overall decision using PASS, WARN, BLOCKED, or FAIL.
- **FR-008**: The system MUST produce both human-readable console output and a machine-readable JSON summary.
- **FR-009**: The system MUST not modify gameplay code, PocketBase schema or data, configs, or user files.
- **FR-010**: The system MUST make missing tools, missing checks, and skipped checks visible rather than silently hiding them.
- **FR-011**: The system MUST remain safe to run repeatedly without destructive side effects.
- **FR-012**: The system MUST block Feature 002 unless the repository-health report is `PASS` or a later phase explicitly lists owner-approved `WARN` categories.

### Key Entities *(include if feature involves data)*

- **Verification Check**: One named health check with a result, reason, and supporting evidence.
- **Repository Health Report**: The combined output that lists checks, skipped items, and the final decision.
- **Baseline Snapshot**: The accepted baseline documents and source snapshot that the workflow compares against.
- **Graphify Snapshot**: The current navigation map used only to detect staleness, not to prove behavior.
- **Feature Gate**: The readiness decision that blocks or unlocks Feature 002.
- **Fallback Mode**: The documented non-Git path used when Git status or diff cannot be trusted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: One documented PowerShell command produces a single overall readiness decision, a list of executed, skipped, and failed checks, and a JSON summary.
- **SC-002**: On a healthy workspace, 100% of required checks appear in the report with explicit outcomes.
- **SC-003**: On an unusable or untrustworthy Git workspace, 100% of runs return BLOCKED rather than a false PASS.
- **SC-004**: On source drift, stale Graphify, or schema drift, 100% of runs surface the mismatch in the report and do not return PASS.
- **SC-005**: Re-running the workflow on an unchanged workspace produces the same decision and check list in repeated validation runs.
- **SC-006**: The workflow leaves gameplay files, schema, configs, and saved data unchanged in every validation run.
- **SC-007**: Feature 002 remains blocked unless the repository-health report is `PASS` or matches the owner-approved `WARN` categories explicitly listed for Feature 002.

## Assumptions

- Existing verification and helper scripts documented in `package.json` and the repository are the starting command inventory.
- The workflow entry point is a Windows PowerShell command, while existing Node `.mjs` helpers may be used internally for complex checks.
- Graphify artifacts are read-only navigation aids and are not treated as proof of runtime behavior.
- This feature does not install or configure a test runner; that belongs to Feature 002.
- The repository-health workflow is intentionally non-destructive and must not repair Git metadata automatically.
- When Git cannot be trusted, the workflow uses the documented fallback instead of pretending that status or diff was verified, and the overall result is `BLOCKED`.
- Temporary PocketBase unavailability can be reported as `WARN` for read-only documentation work, but any gate that would authorize persistent or network-backed changes remains `BLOCKED` until PocketBase health is confirmed.
- Schema drift is always `BLOCKED`.
- Stale Graphify is `WARN` for navigation-only use and `BLOCKED` before architectural transfers.
