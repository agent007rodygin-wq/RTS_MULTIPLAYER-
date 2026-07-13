# Data Model: Characterization Tests

## Overview

This feature does not introduce runtime data structures. It introduces planning-time records that describe scenarios, evidence, fixtures, seams, and repeatable runs.

## Core Entities

### CharacterizationSuite

Represents the Feature 002 MVP suite.

| Field | Type | Notes |
| --- | --- | --- |
| `suiteId` | string | Stable suite name for Feature 002. |
| `featureId` | string | Must stay `002-characterization-tests`. |
| `scenarioIds` | string[] | Ordered list of the 10 first-wave scenarios. |
| `verificationCommand` | string | Repository-defined repeatable characterization command, TBD during implementation. |
| `repeatCount` | number | Minimum consecutive unchanged runs required for determinism proof. |

### CharacterizationScenario

Represents one atomic observable contract.

| Field | Type | Notes |
| --- | --- | --- |
| `scenarioId` | string | Stable identifier, one per atomic scenario. |
| `title` | string | Human-readable contract statement. |
| `group` | string | Runtime surface group from the spec. |
| `initialClassification` | enum | Starts as `UNCONFIRMED_RUNTIME_BEHAVIOR`. |
| `currentClassification` | enum | One of the approved behavior classifications. |
| `sourceAnchors` | EvidenceRecord[] | Real source or baseline references only. |
| `fixtureId` | string | Local deterministic fixture used for replay. |
| `seamType` | enum | `PURE_SEAM`, `OWNER_APPROVED_SEAM`, or `NO_SEAM_YET`. |
| `ownerApprovalRequired` | boolean | True when the scenario needs a minimal production seam. |
| `promotionStatus` | enum | `PLANNED`, `AUDITED`, `PROMOTED`, `BLOCKED`. |
| `stopCondition` | string | Short description of the earliest safe stop. |

### EvidenceRecord

Represents one traceability anchor.

| Field | Type | Notes |
| --- | --- | --- |
| `evidenceId` | string | Unique id within the feature docs. |
| `kind` | enum | `SOURCE`, `BASELINE`, `CONTROLLED_OBSERVATION`, `DETERMINISTIC_FIXTURE`. |
| `path` | string | File path or doc path. |
| `note` | string | Why the evidence matters. |

### FixtureRecord

Represents deterministic local input.

| Field | Type | Notes |
| --- | --- | --- |
| `fixtureId` | string | Stable local fixture id. |
| `scenarioId` | string | The scenario it supports. |
| `seed` | string | Reproducible seed or captured snapshot id. |
| `initialState` | object | Frozen records, refs, or command state. |
| `eventTrace` | object[] | Ordered replay events. |
| `expectedOutcome` | object | Pass/fail expectation for the scenario. |
| `cleanupPolicy` | string | How the fixture resets between runs. |
| `mutationPolicy` | string | Must say no live PocketBase or player-data mutation. |

### SeamRecord

Represents the boundary used to observe a scenario.

| Field | Type | Notes |
| --- | --- | --- |
| `seamId` | string | Stable id for the seam or helper boundary. |
| `kind` | enum | `PURE_SEAM` or `OWNER_APPROVED_SEAM`. |
| `scope` | string | Minimal slice of behavior exposed by the seam. |
| `runtimeImpact` | string | Must stay narrow and non-refactoring in MVP. |
| `approvalState` | string | `NONE`, `REQUESTED`, `APPROVED`. |

### RunnerInvocation

Represents one run of the repeatable command.

| Field | Type | Notes |
| --- | --- | --- |
| `command` | string | Repository-defined characterization command, TBD during implementation. |
| `fixtureSet` | string[] | Fixture ids loaded for the run. |
| `repeatIndex` | number | Allows two consecutive unchanged runs. |
| `result` | enum | `PASS`, `FAIL`, `BLOCKED`. |
| `artifactPath` | string | Output report path in the feature folder. |

## Relationships

- One `CharacterizationSuite` contains 10 `CharacterizationScenario` records in MVP.
- One `CharacterizationScenario` has one initial classification and one current classification.
- One `CharacterizationScenario` can have multiple `EvidenceRecord` entries.
- One `CharacterizationScenario` uses one primary `FixtureRecord`.
- One `CharacterizationScenario` uses either a `PURE_SEAM` or an `OWNER_APPROVED_SEAM`, never both in the same MVP decision.
- One `RunnerInvocation` reads a stable fixture set and produces a deterministic result report.

## Classification Fields

Approved behavior classifications:

- `CURRENT_ACCEPTED_BEHAVIOR`
- `KNOWN_BUG_DO_NOT_FREEZE`
- `UNCONFIRMED_RUNTIME_BEHAVIOR`
- `LEGACY_COMPATIBILITY_BEHAVIOR`
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`

Rules:

- The first-wave scenarios begin as `UNCONFIRMED_RUNTIME_BEHAVIOR`.
- `CURRENT_ACCEPTED_BEHAVIOR` and `LEGACY_COMPATIBILITY_BEHAVIOR` are the only classes that may enter the permanent suite.
- `KNOWN_BUG_DO_NOT_FREEZE` blocks permanent freezing until a fix decision exists.
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` is a design signal, not a promotion path.

## Fixture Boundary

Fixtures are local and deterministic. They may contain:

- source or baseline anchors
- frozen record snapshots
- ordered event traces
- expected outcomes
- cleanup metadata

Fixtures must not contain:

- live PocketBase write credentials
- live player data as mutable input
- side effects that depend on server state
- hidden network calls

## Runner Boundary

The runner is a single command with stable outputs.

It must:

- load feature-local fixtures only
- execute the selected scenarios in order
- report one pass/fail result per scenario
- be repeatable on two consecutive unchanged runs
- fail closed when a fixture, seam, or evidence anchor is missing

## Stop Conditions

- live PocketBase mutation would be required
- a scenario still has no valid evidence anchor
- the scenario would need a broad production refactor
- the scenario is a known bug and has not been separately resolved
- the scenario belongs to P2 or P3 scope
