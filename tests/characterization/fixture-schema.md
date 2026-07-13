# Fixture Schema

## Purpose

Describe the future deterministic local fixture schema only. This document is
documentation for a future fixture shape, not a machine-readable artifact.

## Fixture Identity

Each fixture must have a stable identity that can be traced back to one or more
first-wave scenarios.

Required identity fields:

- `fixtureId`: stable opaque fixture identifier
- `scenarioId`: the primary scenario the fixture supports
- `fixtureName`: human-readable stable name
- `schemaVersion`: documentation version for the fixture schema

Identity rules:

- one fixture identity maps to one primary scenario
- a shared fixture must still name the primary scenario it was derived from
- identity values must remain stable across unchanged documentation revisions
- identity values must not depend on generated timestamps or live record IDs

## Fixture Naming Rules

- Use lowercase, hyphenated names.
- Prefer `scenario-01-<slug>` style names for human-readable labels.
- Keep fixture names stable and scenario-linked.
- Do not encode live timestamps, record IDs, or environment-specific paths in
  the name.

## Schema Fields

| Field | Purpose |
| --- | --- |
| `fixtureId` | Stable opaque identity for the fixture record |
| `scenarioId` | Primary scenario that the fixture supports |
| `fixtureName` | Human-readable stable label |
| `sourceAnchors` | Real source file paths used to justify the fixture |
| `baselineAnchors` | Real baseline file paths used to justify the fixture |
| `recordSnapshot` | Frozen local observation or captured state snapshot |
| `eventTrace` | Ordered replay inputs or observed transitions |
| `expectedOutcome` | The pass/fail expectation for the scenario |
| `resetPolicyRef` | Link to the fixture reset policy document |
| `evidenceRefs` | Linked evidence records for traceability |
| `failureConditions` | Conditions that make the fixture invalid |

## Allowed Fixture Content

- source anchors
- baseline anchors
- frozen record snapshots
- ordered replay event traces
- expected outcomes
- cleanup metadata
- evidence references

## Forbidden Fixture Content

- live PocketBase write credentials
- live player data that would be mutated during setup
- hidden network calls
- executable code
- machine-readable fixture manifests
- runtime-loaded artifacts

## Evidence Linkage

Every fixture must link back to at least one real source anchor and one real
baseline anchor. If a fixture cannot point to those anchors, it is not valid
for MVP use.

## Failure Conditions

- any live mutation is required to build or refresh the fixture
- the fixture depends on hidden network state
- the fixture cannot be reset deterministically
- the fixture name or identity is unstable
- the fixture lacks a real evidence anchor
- the fixture would require a runtime or data-path change to exist
