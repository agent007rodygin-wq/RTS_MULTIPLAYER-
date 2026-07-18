---
description: "Task list for Project Brain Design"
---

# Tasks: Project Brain Design

**Input**: Feature 002 closure, frozen architecture bundle, Feature 002 characterization evidence, Graphify navigation, and repository skills

**Prerequisites**: `spec.md`, `plan.md`, `design.md`, `design-input-audit.md`, `canonicalization-decision.md`

**Rules**: The Design feature refines the frozen architecture but must not redefine constitution, architecture, truth ownership, or runtime behavior. No new characterization scenarios, no Brain Engine implementation, no Ralph implementation, no production refactor, and no competing knowledge registry are allowed in this feature.

## Format

Every task must follow this checklist shape:

`- [ ] T### Description with exact file path`

---

## Phase 1: Identity and Reference Resolution

**Goal**: Make path, identity, version, supersession, and broken-reference rules explicit before any deeper design section depends on them.

- [x] T001 Define stable artifact identity, reference identity, path-versus-identity rules, versioning, supersession, and broken-reference behavior in `specs/003-project-brain-design/design.md`. 

## Phase 2: Canonical Knowledge Model and Registry

**Goal**: Separate canonical knowledge from derived registry and evidence surfaces.

- [x] T002 Define canonical artifact roles, authority, ownership, status, freshness, registry metadata, and derived-artifact relationships in `specs/003-project-brain-design/design.md`.

## Phase 3: Brain Engine Component Model

**Goal**: Define the internal responsibilities of the Project Brain Engine without changing architecture.

- [x] T003 Define the component model, including semantic understanding, dependency intelligence, confidence, and hybrid evolution responsibilities, in `specs/003-project-brain-design/design.md`.

## Phase 4: Component Contracts

**Goal**: Write the technical contracts that make the design traceable and enforceable.

- [x] T004 Define the contracts for discovery, context assembly, generation, validation, storage, reference resolution, and error reporting in `specs/003-project-brain-design/design.md`.

## Phase 5: Knowledge Lifecycle

**Goal**: Define the allowed lifecycle states for canonical and derived knowledge.

- [x] T005 Define states such as proposed, draft, validated, canonical, stale, superseded, rejected, and derived in `specs/003-project-brain-design/design.md`.

## Phase 6: Generation Pipeline

**Goal**: Define a deterministic generation path from canonical knowledge to derived views.

- [x] T006 Define deterministic inputs, generation stages, output identity, reproducibility, regeneration behavior, and partial-failure behavior in `specs/003-project-brain-design/design.md`.

## Phase 7: Validation Model

**Goal**: Define how freshness, references, traceability, and architecture compliance fail closed.

- [x] T007 Define schema validation, freshness validation, reference validation, traceability validation, architecture compliance, error visibility, and recovery behavior in `specs/003-project-brain-design/design.md`.

## Phase 8: Mirror Contract

**Goal**: Describe Graphify-derived navigation as a read-only view, not a truth source.

- [x] T008 Define Graphify outputs as derived navigation, plus source inputs, freshness rules, regeneration conditions, stale behavior, conflict behavior, and agent-consumption rules in `specs/003-project-brain-design/design.md`.

## Phase 9: Debug Manifest Contract

**Goal**: Decide whether a standalone Debug Manifest is required and how it differs from Graphify manifest and fixture manifest.

- [x] T009 Define the Debug Manifest decision, including problem, symptoms, evidence, hypotheses, experiments, rejected causes, root cause, fix, verification, affected invariants, and follow-up actions, in `specs/003-project-brain-design/design.md`.

## Phase 10: AI Agents and Ralph Boundary

**Goal**: Define single-agent and multi-agent authority boundaries and classify Ralph.

- [x] T010 Define single-agent responsibilities, multi-agent orchestration, evidence passing, review, conflict resolution, task ownership, authority limits, failure handling, and Ralph classification in `specs/003-project-brain-design/design.md`.

## Phase 11: Operational Workflows

**Goal**: Capture the day-to-day repository workflows that the design must support.

- [x] T011 Define workflows for repository investigation, bug investigation, feature design, architecture compliance checks, knowledge refresh, Mirror regeneration, and Debug Manifest updates in `specs/003-project-brain-design/design.md`.

## Phase 12: Verification and Implementation Constraints

**Goal**: Freeze the design done-definition and the constraints that later implementation must respect.

- [x] T012 Define the design definition of done, required tests, compliance evidence, allowed implementation freedom, forbidden architectural redefinition, and readiness criteria for the future implementation feature in `specs/003-project-brain-design/design.md`.

---

## Execution Order

The dependency order is linear:

1. Identity and Reference Resolution
2. Canonical Knowledge Model and Registry
3. Brain Engine Component Model
4. Component Contracts
5. Knowledge Lifecycle
6. Generation Pipeline
7. Validation and Error Model
8. Mirror Contract
9. Debug Manifest Contract
10. AI Agents and Ralph Boundary
11. Operational Workflows
12. Verification and Implementation Constraints

Each phase depends on the previous one because later sections reuse the earlier authority boundaries and terminology.
