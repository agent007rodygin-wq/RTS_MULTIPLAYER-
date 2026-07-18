# Project Brain Design Document v1.0

## Project Brain - Baseline v1.0

### Architecture Phase
- Status: Completed
- Deliverable: `Project Brain Architecture Specification v1.0`
- Lifecycle: Approved
- Lifecycle: Frozen
- Governance: RFC-only

### Design Phase
- Status: Started
- Governing Document: `Design Phase Charter`
- Primary Deliverable: `Project Brain Design Document v1.0`

### Design Mission
The purpose of the Design Phase is to transform the approved Project Brain Architecture Specification v1.0 into an implementable technical design.

The Design Phase refines architecture.

It does not redefine architecture.

## Design Phase Charter

### Authority Hierarchy

Repository Constitution  
    ->  
defines admissibility

Architecture Specification  
    ->  
defines the system

Design Document  
    ->  
defines technical realization

Implementation  
    ->  
builds the system

Verification  
    ->  
proves conformance

Each document is subordinate to the document above it.

### Design Authority

The Design Document may define:
- component boundaries;
- component responsibilities;
- contracts;
- lifecycles;
- data models;
- generation pipelines;
- validation rules;
- error handling;
- storage strategies;
- extension mechanisms;
- interfaces between subsystems;
- requirements to support implementation.

The Design Document must not redefine:
- constitutional rules;
- truth ownership;
- architectural philosophy;
- layer responsibilities;
- foundational invariants;
- approved `RULE-*` laws.

### Decision Filter

Every proposal must first answer one question:

Is this:

A) an architectural change

or

B) a design refinement?

Decision:

Architecture  
        |  
        v  
RFC

Design  
        |  
        v  
Design Document

### Section Completion Rule

Every section of the Design Document should end with a short traceability block.

Example:

Traceability

Implements:
- Architecture Section 5
- Architecture Section 8

Constitution:
- RULE-CANON-001
- RULE-DNA-002

Preserves:
- Determinism
- Freshness
- Single Source of Truth

## Scope of the Design Document

The Design Document is responsible for:
- component model;
- technical contracts;
- component lifecycles;
- data models;
- generation mechanisms;
- validation mechanisms;
- error handling;
- storage strategies;
- extensibility;
- interfaces between subsystems;
- implementation requirements.

The Design Document is not responsible for:
- changing system philosophy;
- changing sources of truth;
- changing foundational invariants;
- changing architectural layer responsibilities;
- changing the Repository Constitution;
- changing approved architectural principles.

## Design Document Structure (v1.0)

1. Purpose and Scope
2. Architecture Traceability
3. Component Model
4. Component Contracts
5. Canonical Knowledge Model
6. Identity and Reference Resolution
7. Knowledge Lifecycle
8. Generation Pipeline
9. Validation Model
10. Intelligence Pipeline
11. Derived View Generation
12. Error Model
13. Storage Strategy
14. Extension Model
15. Operational Workflows
16. Verification Requirements
17. Implementation Constraints

### Traceability Rule

Each section should end with a short traceability block that ties the design decision back to the approved architecture and constitution.

## Identity and Reference Resolution

This section defines the Phase 1 identity contract for Project Brain.
It is the first design section because every later section depends on stable
artifact identity, reference resolution, versioning, and supersession rules.

The repository does not yet contain a separate approved ID policy file, so this
section proposes the canonical policy for the Design Phase and keeps it
subordinate to the frozen architecture and the constitution.

### 1. Identity Principles

- Artifact identity is not the same thing as file path.
- Renaming or moving a file does not create a new logical artifact.
- A canonical artifact must have a stable Artifact ID that survives
  regeneration, relocation, and repository clone.
- A derived artifact must point back to its canonical source and must never
  replace that source in identity terms.
- Reference resolution must never silently substitute a missing source with a
  similar-looking path or filename.
- Ambiguous references must fail with an explicit error.
- Stale references must remain stale until they are explicitly refreshed or
  superseded.
- Absolute local paths, Windows drive letters, and transient checkout paths are
  location details only; they are not permanent identity.

### 2. Identity Types

The design recognizes the following identity types:

| Identity type | Purpose | Issuer | Lifetime | Mutable | Conflict rule |
| --- | --- | --- | --- | --- | --- |
| Artifact Identity | Identifies one canonical artifact or one derived artifact snapshot | Canonical registry or generator | Stable until superseded | No | Two active canonical artifacts may not share one Artifact ID |
| Logical Component Identity | Identifies a named architectural or design component | Architecture or design document | Stable across file moves | No, except by approved redesign | Two live components may not claim the same identity |
| Source Location | Identifies a physical repository path | Filesystem | As long as the file exists there | Yes | A path is not an identity collision domain |
| Version Identity | Identifies a released revision or bundle version | Baseline / release governance | Until replaced by a newer version | No | One version label may not point at two different contents |
| Revision Identity | Identifies a specific commit or revision | Git | Immutable once recorded | No | One revision ID must resolve to one commit object |
| Derived Artifact Identity | Identifies a generated snapshot or report | Generator | Stable for that generated output | No without regeneration | A derived artifact may not overwrite canonical identity |
| Scenario Identity | Identifies a characterization scenario | Task graph / scenario registry | Stable for the published scenario | No | A scenario ID may not silently change story or order |
| Evidence Identity | Identifies a verification artifact or evidence row | Verification workflow | Stable for the recorded evidence | No | Evidence may not be merged into a different claim without trace |
| Agent Task Identity | Identifies a design or implementation task | Spec-kit task graph | Stable for the task record | No | A task ID may not be reused for a different task |

### 3. Artifact ID Policy

The proposed canonical Artifact ID policy uses a single repository prefix:

- prefix: `PB-`
- namespace token: uppercase ASCII letters and digits separated by hyphens
- optional numeric suffix: zero-padded when sequential numbering is clearer
- optional descriptive slug: allowed when the artifact is naturally named

Policy rules:

- IDs are assigned by canonical registry, not by file path.
- IDs must be unique across active canonical artifacts.
- IDs must be stable once published.
- IDs may be reserved before the corresponding artifact is fully written, but
  a reserved ID may not be reused for a different artifact.
- Deprecated IDs remain in history and may be marked superseded, but they may
  not be reassigned.
- Superseded IDs remain resolvable as historical references only when the
  supersession relation is explicit.

This policy is intentionally readable by humans while still being stable enough
for derived tooling and traceability rows.

### 4. Path Versus Identity

The design separates the following concepts:

| Concept | Meaning | Resolution rule |
| --- | --- | --- |
| Canonical path | The preferred current repository location of a canonical artifact | Resolve by Artifact ID first, then confirm the canonical path |
| Current physical path | The file path where the artifact currently lives | May change without changing identity |
| Historical path | A past repository location for the same artifact | Preserved for audit and redirect history |
| Alias | An approved alternate path or legacy name | May redirect if the alias is explicitly recorded |
| Redirected reference | A reference that resolves through an approved supersession or alias | Must be explicit and deterministic |
| Broken reference | A reference that no longer resolves to a valid target | Must fail closed with an error |

Path behavior rules:

- Rename preserves identity and updates the current physical path.
- Move preserves identity and records the old path as history.
- Split creates new identities for the new artifacts unless a canonical parent
  artifact remains the authoritative source.
- Merge creates a new canonical identity when the merged result is a new
  artifact; old IDs become historical only if the merge is explicit.
- Copy never preserves identity automatically; a copy gets a new identity.
- Deletion makes the path disappear but does not erase identity history.
- Supersession preserves the older identity as historical evidence.
- Duplicate content does not imply identical identity.
- Identical filenames in different folders are distinct unless a registry
  relation says otherwise.

### 5. Reference Model

References are design-level contracts, not loose file mentions. A reference may
carry the following fields:

- `targetArtifactId`
- `targetType`
- `expectedVersion`
- `expectedStatus`
- `sourceArtifactId`
- `relationshipType`
- `optionalPathHint`
- `resolutionStatus`

The design does not force a JSON schema here. It only requires that any later
schema preserve the same semantic fields and failure behavior.

Reference rules:

- `targetArtifactId` is the primary resolver key.
- `targetType` must match the resolved artifact type.
- `expectedVersion` and `expectedStatus` are validated after identity matches.
- `sourceArtifactId` records who is making the reference and is required for
  traceability.
- `relationshipType` explains whether the reference is canonical, derived,
  historical, or observational.
- `optionalPathHint` may help locate a file, but it may never override identity.
- `resolutionStatus` must be explicit and must not be inferred by callers.

### 6. Reference Resolution Algorithm

Resolution is deterministic and fail-closed:

1. Resolve by stable Artifact ID.
2. Verify artifact type.
3. Verify canonical or derived status as required.
4. Verify version and revision constraints.
5. Use path only as a location hint.
6. Detect supersession.
7. Detect stale references.
8. Reject ambiguity.
9. Return an explicit resolution result.

Allowed resolution results:

- `RESOLVED`
- `RESOLVED_WITH_REDIRECT`
- `STALE`
- `SUPERSEDED`
- `MISSING`
- `AMBIGUOUS`
- `TYPE_MISMATCH`
- `VERSION_MISMATCH`
- `NON_CANONICAL_TARGET`
- `INVALID_REFERENCE`

### 7. Supersession and History

Supersession preserves meaning while replacing authority.

- One artifact may supersede one or more older artifacts only when the relation
  is explicitly recorded.
- Old IDs remain in the registry history and must not be deleted just because a
  newer artifact exists.
- Redirects are allowed only when the replacement is unambiguous and approved.
- Cycles in supersession are invalid.
- Supersession changes the current canonical authority, not the historical
  record.

### 8. Derived Artifact Identity

Graphify outputs and future Mirror outputs are derived artifacts.
They are useful navigation and review layers, not source of truth.

Rules for derived identity:

- A derived artifact has its own generated snapshot identity.
- That identity must include the source revision used to produce it.
- That identity must include freshness state.
- Derived artifacts must not redefine canonical architecture or source code.
- Derived artifacts must not silently out-rank canonical artifacts.

Mirror is not created from scratch in this phase. This section only defines the
identity and reference requirements that the later Mirror contract will use.

### 9. Debug Evidence Identity

Debug evidence is acknowledged here as a future identity family, but no
standalone Debug Manifest is created in Phase 1.

The design must be ready to name the following future evidence identities:

- investigation ID
- incident ID
- hypothesis ID
- evidence ID
- fix ID
- verification ID
- invariant link
- source revision link
- superseded investigation link

The choice between distributed evidence and a standalone Debug Manifest remains a
Phase 9 decision. Phase 1 only defines the identity requirements that such a
decision must satisfy.

### 10. Failure Behavior

Identity and reference resolution must fail closed.

- No silent fallback to a similar artifact.
- No guessing by file basename.
- No substitution of a derived artifact for a canonical one.
- Every error must include the source reference and the target reference or
  target path hint that triggered it.
- Every error must be reproducible from the same inputs.
- An unresolved reference must remain visible in the report or registry.
- Partial resolution must be marked explicitly and must not be treated as full
  success.
- Critical ambiguity must stop resolution instead of continuing with a guess.

### 11. Invariants

The Phase 1 identity contract is testable through the following invariants:

- `IDENTITY-INVARIANT-001`: Artifact ID remains stable across file renames and
  moves.
- `IDENTITY-INVARIANT-002`: One Artifact ID cannot denote two active canonical
  artifacts.
- `IDENTITY-INVARIANT-003`: A derived artifact cannot supersede a canonical
  artifact.
- `IDENTITY-INVARIANT-004`: Ambiguous references are never auto-resolved.
- `IDENTITY-INVARIANT-005`: Supersession history is preserved.
- `IDENTITY-INVARIANT-006`: Absolute local path is not a permanent ID.
- `IDENTITY-INVARIANT-007`: Reference resolution is deterministic.
- `IDENTITY-INVARIANT-008`: A missing target returns an explicit status.
- `IDENTITY-INVARIANT-009`: Identical filenames in different folders remain
  distinct unless a registry relation says otherwise.
- `IDENTITY-INVARIANT-010`: Historical paths never outrank canonical IDs.

### 12. Open Decisions

The following decisions remain intentionally deferred to later phases:

- whether debug evidence remains distributed or becomes a standalone Debug
  Ledger;
- how much of the future registry is generated versus hand-authored;
- how the later Mirror contract consumes the identity model in detail.

These decisions are deferred, not forgotten. Phase 1 only establishes the
identity vocabulary and the resolution contract that later phases must obey.

### 13. Phase 1 Completion Criteria

Phase 1 is complete when all of the following are true:

- every identity type listed above is defined;
- path and identity are explicitly separate concepts;
- a canonical Artifact ID policy exists;
- the reference resolution contract is deterministic and fail-closed;
- supersession rules are explicit;
- derived artifacts are clearly marked as derived;
- Graphify and Mirror are treated as derived navigation, not truth sources;
- debug evidence is accounted for without creating a standalone manifest in
  this phase;
- the section does not conflict with the constitution or the frozen baseline
  architecture;
- later phases can consume the identity contract without guessing.

### 14. Task Graph Update

When Phase 1 is approved, update only the Phase 1 task in the Feature 003 task
graph. Do not skip ahead to later phases, do not add implementation tasks, and
do not reopen Feature 002.

### 15. Traceability

Implements:

- Architecture Specification v1.0, Section 6: Identity and Reference
  Resolution
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- deterministic identity
- source-backed reference resolution
- single source of truth
- read-only derived views

## Canonical Knowledge Model and Registry

This is Phase 2. It uses the Phase 1 identity contract as the only identity
source and separates canonical knowledge from derived registry and evidence
surfaces.

The Design Document does not invent a second source of truth here. It defines
how the approved repository knowledge is named, indexed, owned, freshness-
tracked, and related to derived views.

### 1. Canonical Knowledge Principles

- Canonical knowledge is the smallest approved set of repository knowledge that
  can reconstruct validated derived views.
- The registry indexes canonical knowledge; it does not create it.
- A derived surface may summarize canonical knowledge, but it may not compete
  with it.
- Authority is recorded explicitly and is never inferred from file path.
- Freshness is a first-class registry property.
- If a fact can be deterministically derived, the canonical model should prefer
  the source fact and avoid storing a duplicate canonical copy.
- The Phase 1 identity model supplies the only identity vocabulary used here.

### 2. Canonical Artifact Roles

The current repository state exposes these roles:

| Role | What it represents | Authority source | Ownership | Status / freshness | Derived relationships |
| --- | --- | --- | --- | --- | --- |
| Constitution | The admissibility rules for truth in the repository | `.specify/memory/constitution.md` | Constitution governance | Frozen / ratified | Governs all later artifacts |
| Frozen architecture bundle | The approved architecture evidence set for Feature 003 | `specs/_baseline/00-project-overview.md` through `specs/_baseline/17-traceability-index.md` | Architecture baseline approval | Frozen | Seeds later design contracts |
| Canonical registry seed | The indexed source-backed knowledge surface for canonical artifacts | `specs/_baseline/17-traceability-index.md` | Design-phase registry rules | Current / authoritative | Can point at canonical and derived rows |
| Feature 002 closure evidence | The verification record that Feature 002 is complete | `specs/002-characterization-tests/closure.md`, `tests/characterization/traceability.md`, `tests/characterization/reports/final.md` | Verification workflow | Complete / verified | Supports Feature 003 inputs |
| Derived evidence surfaces | Read-only proof and reporting views | Characterization runner outputs and report docs | Verification workflow | Derived / reproducible | Must point back to canonical sources |
| Graph navigation surfaces | Read-only navigation aids | `graphify-out/*` | Navigation tooling | Derived / freshness-based | Must never outrank canonical sources |

### 3. Canonical Authority Model

Canonical authority is a property of the role, not of the file extension.

- The constitution owns admissibility.
- The frozen architecture bundle owns approved architecture facts.
- The canonical registry seed owns source-backed indexing of those facts.
- Feature 002 evidence owns the proof that the first-wave characterization
  boundary is complete.
- Derived evidence and navigation own presentation and traceability only.

This model keeps the source of truth small and explicit.

### 4. Ownership and Status Metadata

Each registry entry should record the metadata needed to answer five questions:

1. What artifact is this?
2. Who owns it?
3. What gives it authority?
4. How fresh is it?
5. What does it derive from or supersede?

Recommended metadata fields:

- `artifactId`
- `artifactType`
- `canonicalRole`
- `authoritySource`
- `owner`
- `sourceRevision`
- `freshnessState`
- `supersedes`
- `derivedArtifacts`
- `validationMechanism`
- `evidenceLinks`
- `notes`

Field meanings:

- `artifactId` comes from the Phase 1 identity contract.
- `artifactType` distinguishes constitution, architecture bundle, registry
  seed, evidence, or derived surface.
- `canonicalRole` describes whether the artifact is a governing rule, an
  approved fact set, a registry seed, or a derived surface.
- `authoritySource` identifies the approval or evidence source that permits the
  artifact to exist as canonical knowledge.
- `owner` identifies the steward responsible for the row.
- `sourceRevision` anchors the row to a commit or revision.
- `freshnessState` records whether the row matches the current canonical
  sources.
- `supersedes` records explicit replacement history.
- `derivedArtifacts` lists read-only views generated from the source.
- `validationMechanism` records how the row was proven.
- `evidenceLinks` points at supporting traceability or verification material.
- `notes` is reserved for short human-readable clarifications only.

### 5. Derived-Artifact Relationships

Derived artifacts are allowed to summarize, present, or index canonical
knowledge, but they never become canonical by existing.

- Every derived artifact must point back to at least one canonical source.
- Every derived artifact must record the source revision used to generate it.
- Every derived artifact must record a freshness state.
- Every derived artifact must be reproducible from canonical inputs.
- A derived artifact may be stale, but a stale derived artifact must be marked
  as stale instead of silently treated as current.
- A derived artifact may never supersede the canonical artifact it depends on.
- The registry may relate canonical artifacts to derived artifacts, but it may
  not reverse the authority direction.

### 6. Canonical Knowledge Registry Contract

The canonical registry is a design-level contract for indexing approved
knowledge.

- It is seeded by the frozen architecture bundle and the Feature 002 evidence
  set.
- It records roles, ownership, authority, freshness, and supersession.
- It is read-only from the perspective of derived views.
- It may be regenerated, but regeneration must not change canonical meaning.
- It may point to derived evidence, but it may not promote derived evidence into
  canonical truth.
- It must fail closed on missing authority, ambiguous ownership, stale
  freshness, or unresolved supersession.

### 7. Failure Behavior

The canonical knowledge model and registry must fail closed.

- Missing authority must remain missing.
- Derived surfaces must not masquerade as canonical knowledge.
- A stale registry row must be marked stale.
- Ambiguous ownership must be reported explicitly.
- Supersession chains must be explicit and reproducible.
- A registry entry may not claim freshness without source evidence.
- No registry entry may rewrite the approved architecture or constitution.

### 8. Invariants

The Phase 2 canonical knowledge contract is testable through the following
invariants:

- `CANONICAL-INVARIANT-001`: Canonical knowledge is the minimum approved set
  needed to reconstruct validated derived views.
- `CANONICAL-INVARIANT-002`: The registry indexes canonical knowledge but does
  not create truth.
- `CANONICAL-INVARIANT-003`: Canonical and derived roles are never conflated.
- `CANONICAL-INVARIANT-004`: Authority is explicit and not inferred from path.
- `CANONICAL-INVARIANT-005`: Freshness is recorded for every registry entry.
- `CANONICAL-INVARIANT-006`: Derived artifacts always point back to canonical
  sources.
- `CANONICAL-INVARIANT-007`: A stale derived artifact is marked stale instead
  of promoted.
- `CANONICAL-INVARIANT-008`: Supersession is explicit and deterministic.
- `CANONICAL-INVARIANT-009`: The registry cannot silently invent ownership.
- `CANONICAL-INVARIANT-010`: The Phase 1 identity model remains the only
  identity vocabulary used by this section.

### 9. Phase 2 Completion Criteria

Phase 2 is complete when:

- canonical artifact roles are named and separated from derived surfaces;
- registry metadata is sufficient to describe authority, ownership, freshness,
  and supersession;
- derived artifacts cannot outrank canonical artifacts;
- the registry contract fails closed on missing or ambiguous authority;
- the Phase 1 identity model is reused without redefinition;
- later phases can consume the canonical model without inventing a second source
  of truth.

### 10. Phase 3 Handoff

Phase 4 is the next section in the design sequence after the Brain Engine
Component Model. Phase 2 ends here with the canonical knowledge surface
prepared for the next design step.

### 11. Traceability

Implements:

- Architecture Specification v1.0, Section 5: Canonical Knowledge Model
- Architecture Specification v1.0, Section 6: Identity and Reference
  Resolution
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- one source of truth
- deterministic freshness tracking
- source-backed ownership
- read-only derived views

## Brain Engine Component Model

This is Phase 3. It uses the Phase 1 identity contract and the Phase 2
canonical knowledge registry as fixed inputs.

The Brain Engine is the component-level reasoning and orchestration layer for
Project Brain. It does not create canonical truth, and it does not define the
detailed contracts that belong to Phase 4.

### 1. Purpose

The Brain Engine exists to turn a task or engineering request into a bounded,
deterministic, and traceable work package.

It should:

- accept a task or request;
- determine which knowledge classes are needed;
- locate canonical knowledge through the registry;
- distinguish canonical, derived, stale, and missing knowledge;
- assemble a minimal but sufficient context package;
- pass that context to an AI agent or other consumer;
- preserve traceability of what was selected and why;
- initiate validation;
- stop a dangerous operation when knowledge is insufficient or ambiguous.

It must not:

- become a new source of truth;
- rewrite the approved architecture;
- promote derived evidence to canonical status automatically;
- use Mirror or Graphify as authority instead of canonical knowledge;
- hide unresolved references;
- make final architectural decisions without authority;
- depend on a specific AI model for correctness.

### 2. Authority Boundary

The Brain Engine sits between canonical knowledge and a consumer, but it does
not replace either one.

- Canonical Knowledge is the authority.
- The Registry tells the Brain Engine where authority lives and what state it
  is in.
- The Brain Engine reads, selects, plans, and orchestrates.
- The AI model is a consumer / reasoning component, not a source of truth.
- Generated output stays proposed or derived until validation or governance
  explicitly promotes it.
- Human governance keeps final authority whenever the action requires it.
- Graphify and Mirror are navigation aids only.
- Characterization evidence is behavioral proof, not a design authority.

### 3. Logical Components

The minimal logical component set for Phase 3 is:

#### Request Intake

Purpose:

- accept the task or engineering request;
- normalize intent;
- capture constraints;
- assign Agent Task Identity;
- keep the request distinct from repository truth.

#### Knowledge Resolver

Purpose:

- resolve Artifact IDs through the registry;
- detect missing, stale, superseded, and ambiguous knowledge;
- apply the Phase 1 identity rules and Phase 2 canonical roles.

#### Context Planner

Purpose:

- determine the minimal necessary knowledge set;
- build the dependency graph for context selection;
- avoid loading the whole repository by default;
- record the rationale for each included artifact.

#### Context Assembler

Purpose:

- collect approved canonical and derived artifacts;
- preserve ordering;
- attach the source revision;
- produce a reproducible context package;
- avoid mutating the source knowledge.

#### Policy and Authority Gate

Purpose:

- check whether the operation is allowed;
- enforce constitution, architecture, ownership, and status rules;
- stop execution when the conflict is critical;
- determine whether human approval is required.

#### Agent / Model Adapter

Purpose:

- hand the prepared context to the AI agent or model;
- isolate the Brain Engine from provider-specific behavior;
- prevent the model from broadening authority on its own;
- return a structured proposal or result.

#### Result Classifier

Purpose:

- classify the returned result as answer, proposal, generated artifact, change
  plan, implementation candidate, validation report, unresolved request, or
  similar output class;
- prevent automatic promotion to canonical truth.

#### Validation Coordinator

Purpose:

- start the appropriate validators;
- collect validation evidence;
- distinguish validation failure from missing evidence;
- keep the detailed validator mechanics for Phase 7.

#### Traceability Recorder

Purpose:

- record task identity;
- record Artifact IDs and revisions used;
- record chosen outputs and blocking reasons;
- record validation status and unresolved references;
- make the decision path auditable.

#### Output Publisher

Purpose:

- publish the result to the approved location;
- preserve identity;
- mark status;
- avoid overwriting canonical artifacts without a lifecycle transition.

### 4. Component Responsibility Table

| Component | Primary Responsibility | Inputs | Outputs | Authority | Must Not Do |
| --- | --- | --- | --- | --- | --- |
| Request Intake | Normalize task intent and constraints | request text, task identity hints, scope limits | normalized request | caller / task context | infer repository truth |
| Knowledge Resolver | Resolve knowledge references | Artifact IDs, registry entries, identity rules | resolution results | canonical registry | guess by filename or path |
| Context Planner | Choose the minimal knowledge set | normalized request, resolution results, policy hints | context inclusion plan | Brain Engine | load everything by default |
| Context Assembler | Build reproducible context packages | included artifacts, revision data, ordering rules | context package | canonical + approved derived sources | mutate source knowledge |
| Policy and Authority Gate | Enforce admissibility | constitution, architecture, ownership, statuses | allow / block decision | governance rules | bypass approval |
| Agent / Model Adapter | Hand off context and isolate providers | context package, adapter policy | structured model response | caller policy | expand authority boundary |
| Result Classifier | Classify output class | model response, request type | output class and status | Brain Engine policy | promote output to canonical truth |
| Validation Coordinator | Launch and collect validation | output class, context package, validation policy | validation result set | validation rules | hide missing evidence |
| Traceability Recorder | Preserve decision trace | request, context, outputs, validations | traceability record | design rules | drop unresolved references |
| Output Publisher | Publish approved outputs | classified result, approval state | published artifact or blocked report | approval / lifecycle rules | overwrite canonical artifacts casually |

### 5. High-Level Execution Flow

The flow is deterministic and bounded:

1. Request accepted by Request Intake.
2. Task identity assigned.
3. Intent and constraints normalized.
4. Required knowledge classes identified.
5. Registry queried.
6. References resolved.
7. Authority and freshness checked.
8. Context planned.
9. Context assembled.
10. Policy gate evaluated.
11. Agent / model invoked.
12. Result classified.
13. Validation initiated when required.
14. Traceability recorded.
15. Output published or execution blocked.

For each step, the design must be able to state:

- which component is responsible;
- what can block the step;
- what evidence is created or preserved.

### 6. Brain Engine Inputs

Phase 3 treats the following as valid input categories:

- user or agent task;
- task constraints;
- repository state;
- Artifact IDs;
- registry snapshot;
- canonical knowledge;
- allowed derived navigation;
- current revision;
- execution policy;
- validation policy.

This phase does not define concrete APIs.

### 7. Brain Engine Outputs

Phase 3 treats the following as valid output categories:

- resolved context package;
- answer;
- proposal;
- implementation plan;
- generated artifact draft;
- validation request;
- validation result;
- traceability record;
- blocking report;
- unresolved knowledge report.

| Output class | Status before validation | May carry Artifact ID? | Notes |
| --- | --- | --- | --- |
| Resolved context package | derived | no | internal working package |
| Answer | proposed | no | consumer-facing response |
| Proposal | proposed | no | not canonical yet |
| Implementation plan | proposed | no | future implementation input |
| Generated artifact draft | derived | yes, if the source family already uses IDs | draft only until validated |
| Validation request | evidence-seeking | no | sent to validation |
| Validation result | evidence | yes, if the validation family already uses IDs | records proof or failure |
| Traceability record | evidence | yes | must preserve the selection path |
| Blocking report | evidence / error | yes, when tied to a registered artifact | records why work stopped |
| Unresolved knowledge report | evidence / error | yes, when tied to a registered artifact | records gaps explicitly |

### 8. Context Package

The context package is the core Phase 3 output.

It should contain:

- task identity;
- repository revision;
- included Artifact IDs;
- artifact roles;
- versions and revisions;
- freshness states;
- relationship graph;
- inclusion rationale;
- excluded but relevant artifacts;
- unresolved references;
- policy constraints;
- expected output class;
- validation requirements.

It must be:

- deterministic;
- minimal but sufficient;
- traceable;
- reproducible;
- bounded;
- ordered;
- explicit about gaps.

### 9. Fail-Closed Conditions

The Brain Engine must stop or degrade safely when it encounters:

- ambiguous canonical authority;
- missing required canonical artifact;
- unresolved critical reference;
- stale artifact when freshness is required;
- type mismatch;
- version mismatch;
- conflicting active canonical artifacts;
- forbidden operation;
- missing required approval;
- context budget exceeded without a safe reduction path;
- validation prerequisite missing;
- non-deterministic context selection;
- attempt to use a derived artifact as authority.

The design distinguishes four outcomes:

- hard block;
- soft warning;
- degraded read-only mode;
- request for clarification.

### 10. Model Independence

The Brain Engine is model-independent by design.

- The Brain Engine is not itself an LLM.
- AI models connect through an adapter.
- The same task must produce the same context package regardless of provider.
- A model change must not alter canonical authority.
- Model output is always an untrusted proposal until validation or governance
  upgrades it.
- Provider-specific behavior must not leak into canonical contracts.

### 11. Relationship to Existing Systems

The Brain Engine relates to the repository like this:

- Constitution: the highest-level admissibility rules.
- Frozen Architecture: the approved architecture to be respected.
- Canonical Registry: the source of location, status, and authority metadata.
- Characterization Harness: behavioral verification evidence.
- Graphify: derived navigation and dependency evidence.
- Mirror: future derived context-navigation contract, projected for Phase 8.
- Debug Evidence: evidence input/output for investigations; standalone Debug
  Manifest remains a later decision.
- AGENTS.md and skills: behavioral guidance for agents, not canonical truth.
- Ralph: not realized yet; any orchestration role remains a later discussion in
  Phase 10.

### 12. Component Invariants

The Phase 3 Brain Engine model is testable through the following invariants:

- `BRAIN-INVARIANT-001`: Brain Engine is not a source of truth.
- `BRAIN-INVARIANT-002`: Every used canonical artifact is resolved by Artifact
  ID.
- `BRAIN-INVARIANT-003`: Every Context Package is tied to a repository
  revision.
- `BRAIN-INVARIANT-004`: Derived artifacts are not authority.
- `BRAIN-INVARIANT-005`: Model output does not become canonical automatically.
- `BRAIN-INVARIANT-006`: Critical ambiguity causes a hard block.
- `BRAIN-INVARIANT-007`: Context selection is deterministic.
- `BRAIN-INVARIANT-008`: Inclusion rationale is preserved.
- `BRAIN-INVARIANT-009`: Validation evidence is tied to task identity.
- `BRAIN-INVARIANT-010`: Changing the model does not change authority rules.
- `BRAIN-INVARIANT-011`: Unsuccessful resolution is not hidden.
- `BRAIN-INVARIANT-012`: Publication respects lifecycle transitions.

### 13. Open Decisions

The following questions remain intentionally deferred to later phases:

- whether future debugging evidence remains distributed or becomes a standalone
  Debug Manifest;
- how much of the future registry is generated versus hand-authored;
- how the Phase 8 Mirror contract uses the output of this component model in
  detail;
- how Phase 4 formalizes the contracts for each component without changing the
  component boundaries defined here.

These are deferred decisions, not gaps in the Phase 3 model.

### 14. Phase 3 Completion Criteria

Phase 3 is complete when:

- Brain Engine purpose is defined;
- the authority boundary is explicit;
- the minimal component model is defined;
- component responsibilities do not overlap dangerously;
- execution flow is described;
- input categories are defined;
- output categories are defined;
- the context package is defined;
- fail-closed behavior is described;
- model independence is preserved;
- existing systems are connected without redefinition;
- invariants are defined;
- Phase 4 can define contracts without guessing the model.

### 15. Phase 4 Handoff

Phase 4 is the next section in the design sequence. It will define component
contracts using the model established here. This phase stops before contracts
are expanded into detailed shapes.

### 16. Traceability

Implements:

- Architecture Specification v1.0, three-layer macro architecture
- Architecture Specification v1.0, canonical knowledge model
- Architecture Specification v1.0, derived views boundary
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Temporal Correctness and Idempotency
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- canonical authority
- deterministic context selection
- model independence
- read-only derived views

## Component Contracts

This is Phase 4. It turns the Phase 3 component model into boundary-level
contracts without turning those contracts into implementation schemas or
runtime code.

Phase 4 does not redefine the components from Phase 3. It only states what each
component boundary must guarantee, what it may consume, what it may emit, and
what must cause a fail-closed block.

### 1. Contract Principles

- Every contract binds one clear boundary between Phase 3 responsibilities.
- A contract defines guarantees, required inputs, required outputs, authority,
  and failure behavior.
- A contract must remain subordinate to the Phase 1 identity model and the
  Phase 2 canonical knowledge registry.
- A contract may not create a second truth source.
- A contract may not turn an adapter, a derived view, or a model response into
  canonical authority.
- A contract may not describe concrete JSON schemas, transport payloads, class
  shapes, or runtime implementation details.
- A contract must be traceable to the approved architecture and to the
  component it constrains.

### 2. Contract Families

| Contract family | Boundary | Required guarantee | Fail-closed when |
| --- | --- | --- | --- |
| Discovery and reference resolution | Request Intake, Knowledge Resolver, Registry | Normalize the request, resolve Artifact IDs, and expose explicit resolution status | Authority is ambiguous, stale, missing, or superseded in an unresolved way |
| Context assembly | Context Planner, Context Assembler | Build a minimal, ordered, reproducible context package | The context would be non-deterministic, incomplete, or overbroad |
| Policy and authority | Policy and Authority Gate | Enforce constitution, architecture, ownership, and status rules before risky work proceeds | The action is forbidden, unapproved, or outside the component boundary |
| Generation handoff | Context Assembler, Agent / Model Adapter | Pass a bounded context to a consumer model without leaking authority rules | The provider would broaden scope, mutate authority, or require unsupported assumptions |
| Result classification | Agent / Model Adapter, Result Classifier | Classify model output before any promotion or publication happens | The output is unsafe, unclassifiable, or still ambiguous |
| Validation | Result Classifier, Validation Coordinator | Run required validators and preserve proof or failure evidence | Validation prerequisites are missing or evidence is absent |
| Storage and publication | Output Publisher | Publish only through an approved lifecycle transition and preserve identity | A canonical artifact would be overwritten, or a derived result would be published as truth |
| Error reporting and traceability | Traceability Recorder | Preserve task identity, selected artifacts, revisions, decisions, and blocking reasons | A failure would be hidden, rewritten, or detached from its source references |

### 3. Boundary Requirements

#### 3.1 Discovery and Reference Resolution

- The only authoritative resolver keys are the Phase 1 identity rules.
- File paths may help locate a source, but they may not override identity.
- Resolution must return an explicit status instead of guessing.
- A missing or stale source must stay visible as missing or stale.

#### 3.2 Context Assembly

- The assembled context must be minimal but sufficient for the task.
- The context must preserve order, source revision, and inclusion rationale.
- Excluded but relevant artifacts must remain visible in the traceability record.
- A context package must not silently expand when a smaller sufficient set exists.

#### 3.3 Generation Handoff

- The adapter isolates the Brain Engine from provider-specific behavior.
- The same context package must remain the same regardless of model choice.
- Model output remains untrusted until validation or governance says otherwise.
- The adapter may not broaden the authority boundary.

#### 3.4 Validation

- Validation is required before promoted or published results become trusted.
- Validation failure and missing evidence are distinct outcomes.
- Missing validation prerequisites must block the flow instead of being treated as pass.
- Validation evidence must remain traceable to the task identity and source revision.

#### 3.5 Storage and Publication

- Only approved lifecycle transitions may publish or replace outputs.
- Canonical knowledge may not be overwritten by a derived output.
- Derived outputs remain derived even when stored in a durable location.
- Publication must preserve identity and freshness status.

#### 3.6 Error Reporting and Traceability

- Every blocking condition must be visible in the traceability record.
- Every unresolved reference must carry the artifact identity or path hint that caused it.
- Every error must be reproducible from the same repository state.
- No contract may hide a failure by downgrading it into success.

### 4. Contract Invariants

The Phase 4 contract model is testable through these invariants:

- `CONTRACT-INVARIANT-001`: Contracts inherit identity from Phase 1 and may
  not redefine it.
- `CONTRACT-INVARIANT-002`: Contracts inherit canonical authority from Phase 2
  and may not replace it.
- `CONTRACT-INVARIANT-003`: Context packages are bounded, ordered, and
  reproducible.
- `CONTRACT-INVARIANT-004`: Derived views never become authority through a
  contract.
- `CONTRACT-INVARIANT-005`: Model output stays untrusted until validation or
  governance upgrades it.
- `CONTRACT-INVARIANT-006`: Missing authority fails closed.
- `CONTRACT-INVARIANT-007`: Validation prerequisites are explicit.
- `CONTRACT-INVARIANT-008`: Traceability survives blocking and failure.
- `CONTRACT-INVARIANT-009`: Publication follows lifecycle transitions only.
- `CONTRACT-INVARIANT-010`: A contract may not introduce a second source of
  truth.

### 5. Phase 4 Completion Criteria

Phase 4 is complete when:

- each Phase 3 component has a boundary-level contract;
- discovery, context assembly, generation handoff, validation, storage, and
  error reporting are all covered;
- contracts are design-level only and do not define JSON schemas or runtime
  classes;
- fail-closed behavior is explicit for ambiguous, missing, stale, or unsafe
  authority;
- traceability remains preserved across blocking and publication;
- Phase 5 can define knowledge lifecycle states without reinterpreting the
  contracts defined here.

### 6. Traceability

Implements:

- Architecture Specification v1.0, three-layer macro architecture
- Architecture Specification v1.0, canonical knowledge model
- Architecture Specification v1.0, derived views boundary
- Architecture Specification v1.0, frozen architecture as authority boundary
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Temporal Correctness and Idempotency
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- canonical authority
- deterministic context selection
- model independence
- read-only derived views
- fail-closed contract boundaries

## Knowledge Lifecycle

This is Phase 5. It defines the lifecycle of Project Brain knowledge artifacts
using the Phase 1 identity contract, the Phase 2 canonical knowledge registry,
and the Phase 3-4 Brain Engine boundaries as fixed inputs.

Phase 5 does not define the Generation Pipeline mechanics, and it does not
project the detailed Validation Model from Phase 7. It only states how
knowledge changes state, how authority moves, and when a lifecycle step must
block.

### 1. Lifecycle Purpose

The lifecycle exists to:

- distinguish raw proposals from approved knowledge;
- prevent generated output from becoming canonical automatically;
- track freshness and supersession explicitly;
- preserve the history of decisions and rejected attempts;
- avoid using stale or rejected knowledge where freshness is required;
- make promotion and demotion visible and auditable;
- support reproducibility and traceability across repository revisions.

### 2. Lifecycle States

The design recognizes the following states:

| State | Purpose | Can be authority? | Typical sources | Allowed operations | Typical exits |
| --- | --- | --- | --- | --- | --- |
| `PROPOSED` | A candidate idea or artifact under consideration | No | user input, agent output, investigation notes | review, enrich, reject | `DRAFT`, `REJECTED` |
| `DRAFT` | A working artifact that is not yet validated | No | design work, generated draft, revision candidate | revise, validate, reject, supersede | `VALIDATED`, `REJECTED` |
| `VALIDATED` | Evidence-backed artifact ready for authority review | Not yet by itself | validator output, approved evidence set | promote, reject, supersede | `CANONICAL`, `REJECTED`, `SUPERSEDED` |
| `CANONICAL` | Approved truth in the repository | Yes | approved knowledge, constitution-backed sources | mark stale, supersede, revise through a new cycle | `STALE`, `SUPERSEDED` |
| `STALE` | Previously valid artifact whose freshness is no longer current | Not where freshness is required | source revision change, dependency change, supersession, failed freshness check | revalidate, supersede, retire | `VALIDATED`, `SUPERSEDED`, `REJECTED` |
| `SUPERSEDED` | Historical artifact replaced by a newer approved artifact | Historical only | approved replacement, explicit redirect, versioned replacement | inspect history, resolve redirect | terminal historical state |
| `REJECTED` | Artifact that failed approval or validation and must not be treated as current truth | No | failed review, failed validation, unresolved authority conflict | preserve history, revise into a new draft | `DRAFT`, `PROPOSED` |
| `DERIVED` | Read-only generated view or snapshot | No | Graphify output, traceability export, validation report, future Mirror snapshot | regenerate, mark stale, retire | `DERIVED` (new revision), `STALE`, retired |

State rules:

- `VALIDATED` does not automatically mean `CANONICAL`.
- `DERIVED` is never an automatic step toward `CANONICAL`.
- `STALE` is a lifecycle state, not a synonym for broken data.
- `REJECTED` artifacts are preserved in history and are not deleted just
  because they failed.
- `CANONICAL` requires an authority decision in addition to validation.

### 3. State Transition Model

Allowed transitions are deterministic and explicit:

- `PROPOSED` -> `DRAFT`
- `DRAFT` -> `VALIDATED`
- `VALIDATED` -> `CANONICAL`
- `DRAFT` -> `REJECTED`
- `VALIDATED` -> `REJECTED`
- `CANONICAL` -> `STALE`
- `CANONICAL` -> `SUPERSEDED`
- `STALE` -> `VALIDATED`
- `STALE` -> `SUPERSEDED`
- any generated snapshot -> `DERIVED`

Forbidden transitions include:

- `PROPOSED` -> `CANONICAL` without validation and authority;
- `DERIVED` -> `CANONICAL` automatically;
- `REJECTED` -> `CANONICAL` without a new review cycle;
- `SUPERSEDED` -> active canonical without a new authority decision;
- `STALE` -> `CANONICAL` without freshness revalidation;
- deletion of history by status change alone.

### 4. Transition Authority

Every transition must name:

- initiator;
- required approver;
- required validators;
- required evidence;
- traceability record;
- blocking conditions.

Use design-level authority classes only:

- author;
- validator;
- canonical authority;
- repository governance process;
- automated freshness detector;
- Brain Engine coordinator.

The Brain Engine may initiate or coordinate transitions, but it must not
self-assign `CANONICAL` without authority.

### 5. Artifact Creation

New knowledge artifacts follow these rules:

- an Artifact ID is created before publication;
- the initial state is explicit;
- the source and task identity are preserved;
- the source revision is recorded;
- owner and authority source are recorded;
- relationships to existing artifacts are retained;
- generated output starts as `PROPOSED` or `DERIVED` depending on intent;
- missing required metadata blocks publication.

### 6. Validation and Promotion

Phase 5 only defines the lifecycle dependency on validation; it does not define
the validation engine itself.

The promotion flow is:

1. Artifact created.
2. Metadata checked.
3. References resolved.
4. Authority identified.
5. Validation requested.
6. Evidence recorded.
7. Promotion decision made.
8. Registry status updated.
9. Dependents notified or marked stale.

If required evidence is missing, promotion must stop rather than guessing.

### 7. Freshness and Staleness

Freshness answers whether an artifact is current enough for its intended use.
An artifact becomes stale when one or more of the following occurs:

- source revision changes;
- dependency is superseded;
- architecture changes;
- validation fails;
- evidence expires;
- a broken reference is detected;
- authority changes;
- regeneration produces a mismatch.

Freshness states:

- `known fresh`;
- `freshness unknown`;
- `stale`;
- `invalid`.

Freshness is not determined by file modification time alone.

### 8. Supersession

Supersession defines how one artifact replaces another while preserving
history.

The design records:

- superseding artifact;
- superseded artifact;
- effective revision/date;
- reason;
- compatibility;
- redirect policy;
- dependent impact;
- supersession chain;
- cycle prevention;
- split supersession;
- merge supersession.

The old Artifact ID remains preserved in history.

### 9. Rejection and Revision

Rejected artifacts remain visible for audit and learning.

The design records:

- why the artifact was rejected;
- whether evidence is preserved;
- whether a new revision may be created;
- when the same Artifact ID may be reused;
- when a new Artifact ID is required;
- how rejected revisions relate to later proposals.

Rejected knowledge does not disappear from the repository record.

### 10. Derived Artifact Lifecycle

Derived artifacts have their own lifecycle separate from canonical knowledge.

This section applies to:

- Graphify outputs;
- future Mirror snapshots;
- generated reports;
- context packages;
- validation reports;
- traceability exports.

Rules:

- a derived artifact is tied to a source revision;
- a derived artifact has a freshness state;
- regeneration may create a new snapshot or revision;
- derived artifacts do not supersede canonical sources;
- stale derived artifacts are explicitly marked stale;
- deleting a generated file does not delete the canonical source.

### 11. Dependency Propagation

When a canonical artifact changes state, the design must be able to determine
the impact on dependents.

Possible dependent outcomes:

- remains valid;
- freshness becomes unknown;
- becomes stale;
- requires revalidation;
- becomes blocked;
- becomes superseded.

The impact decision must be deterministic and traceable.

### 12. Lifecycle Events

Phase 5 uses design-level lifecycle events:

- `ARTIFACT_CREATED`
- `VALIDATION_REQUESTED`
- `VALIDATION_PASSED`
- `VALIDATION_FAILED`
- `PROMOTION_REQUESTED`
- `PROMOTED_TO_CANONICAL`
- `MARKED_STALE`
- `SUPERSEDED`
- `REJECTED`
- `REVALIDATION_REQUESTED`
- `DERIVED_REGENERATED`
- `REFERENCE_BROKEN`
- `AUTHORITY_CHANGED`

Each event records:

- trigger;
- responsible role or component;
- required evidence;
- registry effect;
- dependent impact.

### 13. Fail-Closed Rules

The lifecycle must block dangerous actions when:

- Artifact ID is missing;
- current state is unknown;
- transition is illegal;
- authority is missing;
- required validation evidence is missing;
- a critical reference is unresolved;
- active canonical revisions conflict;
- a supersession cycle is detected;
- a freshness-required operation targets a stale artifact;
- derived output is being promoted automatically;
- traceability is missing.

### 14. Lifecycle Invariants

The Phase 5 model is testable through these invariants:

- `LIFECYCLE-INVARIANT-001`: Every artifact has an explicit lifecycle state.
- `LIFECYCLE-INVARIANT-002`: `CANONICAL` is never assigned without authority.
- `LIFECYCLE-INVARIANT-003`: `DERIVED` does not become `CANONICAL` automatically.
- `LIFECYCLE-INVARIANT-004`: `SUPERSEDED` artifacts remain in history.
- `LIFECYCLE-INVARIANT-005`: Illegal transitions fail explicitly.
- `LIFECYCLE-INVARIANT-006`: Every state change creates traceability evidence.
- `LIFECYCLE-INVARIANT-007`: Freshness is not determined by file time alone.
- `LIFECYCLE-INVARIANT-008`: Dependent impact is deterministic.
- `LIFECYCLE-INVARIANT-009`: Rejected knowledge is preserved in history.
- `LIFECYCLE-INVARIANT-010`: Brain Engine cannot self-promote artifacts to
  `CANONICAL`.
- `LIFECYCLE-INVARIANT-011`: Two conflicting active canonical artifacts for
  one identity cannot coexist.
- `LIFECYCLE-INVARIANT-012`: Supersession graphs do not contain cycles.

### 15. Open Decisions

The following questions are deferred beyond Phase 5:

- whether freshness timestamps are stored or derived in the later implementation;
- which lifecycle events are automated versus governance-driven;
- whether a future Debug Manifest needs its own lifecycle vocabulary;
- how storage layout will represent lifecycle state in the implementation.

### 16. Phase 5 Completion Criteria

Phase 5 is complete when:

- lifecycle states are defined;
- the transition model is explicit;
- transition authority is defined;
- creation and promotion flow is defined;
- freshness and staleness are defined;
- supersession is defined;
- rejection and revision are defined;
- derived lifecycle is defined;
- dependency propagation is defined;
- lifecycle events are defined;
- fail-closed rules are defined;
- invariants are defined;
- Phase 6 can define the Generation Pipeline without guessing lifecycle
  meanings.

### 17. Traceability

Implements:

- Architecture Specification v1.0, canonical knowledge model
- Architecture Specification v1.0, derived views boundary
- Architecture Specification v1.0, frozen architecture as authority boundary
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Temporal Correctness and Idempotency
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- canonical authority
- deterministic state transitions
- read-only derived views
- traceable promotion and rejection
- fail-closed lifecycle boundaries

## Generation Pipeline

This is Phase 6. It defines the deterministic generation path that turns a
normalized task and frozen canonical context into a controlled result.

Phase 6 uses the approved inputs from Phase 1 through Phase 5:

- Identity and Reference Resolution;
- Canonical Knowledge Model and Registry;
- Brain Engine Component Model;
- Component Contracts;
- Knowledge Lifecycle.

Phase 6 does not define the Phase 7 Validation Model. It only defines the
generation-to-validation handoff well enough to describe where validation
begins and why generation cannot promote output by itself.

### 1. Pipeline Purpose

The pipeline must:

- accept a normalized task;
- consume a reproducible Context Package;
- form a generation request from approved inputs;
- produce a proposed or derived output;
- preserve the provenance of the result;
- hand off the result for validation when required;
- classify the result before publication;
- publish only through an allowed lifecycle status;
- block when authority or knowledge is insufficient.

The pipeline must not:

- become a source of truth;
- rewrite canonical artifacts directly;
- bypass lifecycle transitions;
- automatically elevate output to `CANONICAL`;
- hide missing knowledge;
- depend on a specific AI provider for correctness;
- mix generation authority with validation authority.

### 2. Pipeline Stages

The pipeline is divided into the following deterministic stages:

1. Request Preparation
2. Context Resolution
3. Context Freeze
4. Generation Planning
5. Generation Execution
6. Output Normalization
7. Result Classification
8. Validation Handoff
9. Lifecycle Assignment
10. Traceability Recording
11. Publication or Block

Each stage must have:

- a clear purpose;
- a responsible Brain Engine component;
- defined inputs;
- defined outputs;
- explicit blocking conditions;
- traceability evidence.

### 3. Request Preparation

Request Preparation normalizes the task before any generation attempt begins.

It must identify:

- task identity;
- intent;
- constraints;
- expected output class;
- allowed scope;
- forbidden operations;
- risk level;
- required approval;
- required validation class.

Generation must not start when intent is unknown or critical ambiguity remains
unresolved.

### 4. Context Resolution and Freeze

Before generation begins, the pipeline must ensure that:

- all critical references are resolved;
- canonical authority is verified;
- source revisions are frozen for the attempt;
- freshness is checked where required;
- the Context Package becomes immutable for that attempt.

If the repository changes after the freeze, the in-flight attempt must not
silently absorb the change. A new context requires a new attempt or explicit
regeneration.

### 5. Generation Plan

Before execution, the pipeline creates a short Generation Plan containing:

- goal;
- expected output class;
- Artifact IDs involved;
- expected changes;
- affected components;
- constraints;
- risks;
- validation requirements;
- publication target.

The Generation Plan is proposed or derived evidence, not canonical truth.

### 6. Generation Execution

Generation Execution must:

- receive only the frozen Context Package;
- stay within the approved task scope;
- keep output identity tied to the task and attempt;
- record provider identity as provenance only;
- avoid damaging canonical state on provider failure;
- treat retries as new attempts when the context changes;
- mark partial output explicitly;
- keep provider switching from changing frozen context.

The pipeline does not define multi-provider orchestration here. That remains a
later AI Agent Orchestration concern.

### 7. Output Classes

The pipeline may produce the following output classes:

- Answer
- Proposal
- Investigation Summary
- Change Plan
- Generated Artifact Draft
- Implementation Candidate
- Documentation Draft
- Test Candidate
- Validation Request
- Blocking Report
- Unresolved Knowledge Report

For each output class, the design must know:

- its intended use;
- its initial lifecycle state;
- whether it may carry an Artifact ID;
- whether it may be published;
- whether it requires validation;
- which component can raise its status.

### 8. Output Normalization

Before the pipeline hands off or publishes anything, it must normalize the
result into a design-level envelope containing:

- task identity;
- attempt identity;
- provider identity;
- repository revision;
- context package identity;
- output class;
- lifecycle state;
- referenced Artifact IDs;
- assumptions;
- unresolved issues;
- risks;
- validation requirements;
- produced artifact references.

This section defines metadata categories only. It does not define any concrete
schema.

### 9. Validation Handoff

The pipeline must hand the result to Validation Coordinator with enough
information to continue validation without guessing:

- output identity;
- output class;
- expected invariants;
- required evidence;
- affected canonical artifacts;
- affected source files;
- risks;
- known gaps.

The pipeline itself does not decide whether validation passes. That decision
belongs to the later validation phase.

### 10. Lifecycle Assignment

The pipeline must assign an initial lifecycle state to every output class:

- generated proposal -> `PROPOSED`
- editable document -> `DRAFT`
- generated navigation snapshot -> `DERIVED`
- validation report -> evidence / derived according to the existing model
- failed or unusable output -> `REJECTED` or an explicit failed-attempt record
- `CANONICAL` is never assigned automatically by the pipeline

### 11. Publication Rules

Publication is allowed only if:

- the output class is allowed to publish;
- the lifecycle state is defined;
- an Artifact ID is assigned when required;
- traceability exists;
- destination authority is known;
- required validation is complete;
- overwrite policy allows the action;
- no critical unresolved references remain.

The pipeline distinguishes:

- preview;
- draft publication;
- proposed change;
- repository write;
- canonical promotion.

### 12. Retry and Regeneration

Generation attempts must be tracked explicitly.

Rules:

- every attempt has an identity;
- retries preserve the link to the previous attempt when the context is the
  same;
- a changed context creates a new attempt;
- regeneration of a derived artifact does not change the canonical source;
- duplicate publication must be idempotent or explicitly blocked;
- failed attempts remain visible in history.

### 13. Partial Failure

The pipeline must classify these failures explicitly:

- provider timeout;
- truncated output;
- malformed output;
- unsupported capability;
- context budget overflow;
- publication failure;
- validation handoff failure;
- traceability write failure;
- repository revision changed during operation.

Possible responses include:

- retryable failure;
- hard block;
- degraded draft;
- partial result;
- clarification required;
- manual recovery required.

### 14. Generation Evidence

Each attempt must preserve at least:

- task identity;
- attempt identity;
- provider;
- context package;
- repository revision;
- plan;
- output;
- lifecycle assignment;
- warnings;
- validation handoff;
- publication result;
- timestamps or ordering evidence;
- failure reason, if any.

This evidence is for traceability and later verification. It is not a storage
implementation.

### 15. Pipeline Invariants

The Phase 6 model is testable through these invariants:

- `GENERATION-INVARIANT-001`: Every generation attempt has an identity.
- `GENERATION-INVARIANT-002`: The Context Package is frozen before execution.
- `GENERATION-INVARIANT-003`: A provider is not a source of truth.
- `GENERATION-INVARIANT-004`: Generated output does not become `CANONICAL`
  automatically.
- `GENERATION-INVARIANT-005`: Every output is tied to a repository revision.
- `GENERATION-INVARIANT-006`: Retry does not destroy earlier evidence.
- `GENERATION-INVARIANT-007`: Provider switching does not change authority.
- `GENERATION-INVARIANT-008`: Critical unresolved reference blocks execution.
- `GENERATION-INVARIANT-009`: Publication does not bypass lifecycle.
- `GENERATION-INVARIANT-010`: Validation handoff is traceable.
- `GENERATION-INVARIANT-011`: Partial output is marked explicitly.
- `GENERATION-INVARIANT-012`: A changed context creates a new attempt.
- `GENERATION-INVARIANT-013`: Generation failure does not mutate canonical
  source.
- `GENERATION-INVARIANT-014`: Duplicate publication is idempotent or blocked.

### 16. Open Decisions

Only genuinely deferred decisions remain here:

- concrete provider adapters belong to Phase 10 or implementation;
- detailed validator rules belong to Phase 7;
- storage format belongs to implementation;
- Mirror generation belongs to Phase 8;
- Debug outputs belong to Phase 9;
- exact payload schemas belong to later contract / schema work.

For each deferred item, record:

- Decision ID;
- question;
- recommended direction;
- blocking/non-blocking;
- target phase.

### 17. Phase 6 Completion Criteria

Phase 6 is complete when:

- pipeline stages are defined;
- request preparation is defined;
- context freeze is defined;
- generation planning is defined;
- execution boundaries are defined;
- output classes are defined;
- normalization is defined;
- validation handoff is defined without over-specifying Phase 7;
- lifecycle assignment is defined;
- publication rules are defined;
- retry / regeneration is defined;
- partial failure is defined;
- generation evidence is defined;
- invariants are defined;
- Phase 7 can define Validation Model without guessing generation outputs.

### 18. Traceability

Implements:

- Architecture Specification v1.0, identity and reference resolution
- Architecture Specification v1.0, canonical knowledge model and registry
- Architecture Specification v1.0, Brain Engine component model
- Architecture Specification v1.0, component contracts
- Architecture Specification v1.0, knowledge lifecycle
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Temporal Correctness and Idempotency
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- canonical authority
- reproducible generation attempts
- read-only derived views
- fail-closed generation boundaries

## Mirror Contract

This is Phase 8. It defines Graphify-derived navigation as a read-only view,
not a source of truth.

Phase 8 uses the approved inputs from Phase 1 through Phase 7:

- Identity and Reference Resolution;
- Canonical Knowledge Model and Registry;
- Brain Engine Component Model;
- Component Contracts;
- Knowledge Lifecycle;
- Generation Pipeline;
- Validation Model.

Phase 8 does not define Debug Manifest or AI Agent Orchestration. It only
defines Mirror as a derived navigation contract that remains subordinate to
canonical knowledge.

### 1. Purpose

Mirror exists to provide a compact, selective, AI-friendly map of the
repository. It helps humans and agents navigate structure, ownership,
dependencies, and invariants without reading the whole repository every time.

Mirror must remain derived. It may summarize canonical knowledge, but it may
not replace source files, source anchors, or the canonical registry.

### 2. Mirror Identity

Mirror identity must include:

- Mirror Artifact ID;
- Mirror revision;
- source repository revision;
- generation attempt identity;
- generation timestamp or ordering evidence;
- freshness state;
- schema or version marker;
- supersedes relationship;
- source Artifact IDs;
- source file references.

A Mirror snapshot must have a stable identity as an artifact, but each new
revision must be distinguishable from earlier revisions.

### 3. Mirror Scope

Mirror may describe:

- project overview;
- major modules;
- files;
- components;
- functions;
- hooks;
- state ownership;
- backend collections;
- realtime subscriptions;
- timers;
- construction;
- production;
- combat;
- optimistic UI;
- error handling;
- invariants;
- risks;
- data flow;
- dependency edges;
- important entry points.

Mirror is selective and purpose-driven. It does not need to include every
small function or every source line.

### 4. Mirror Node Model

At design level, Mirror must be able to represent at least these node types:

- Project;
- Module;
- Source File;
- Component;
- Function;
- Hook;
- State Owner;
- Data Collection;
- Realtime Subscription;
- Workflow;
- Invariant;
- Risk;
- External Dependency;
- Canonical Artifact.

For each node type, the design must define:

- what it represents;
- what identity it uses;
- what source references it must carry;
- whether it may be canonical or only derived;
- what relations are allowed.

The design does not define a concrete JSON schema here.

### 5. Mirror Edge Model

Mirror must support at least these relation types:

- CONTAINS;
- DEFINES;
- CALLS;
- READS;
- WRITES;
- SUBSCRIBES_TO;
- PUBLISHES_TO;
- OWNS_STATE;
- DERIVES_FROM;
- DEPENDS_ON;
- VALIDATED_BY;
- CONSTRAINED_BY;
- SUPERSEDES;
- RELATED_TO;
- AFFECTS;
- HANDLES_ERROR_FOR.

For each relation type, the design must define:

- direction;
- traceability requirement;
- how inferred edges are marked;
- how confirmed edges differ from inferred edges;
- how critical edges are validated.

Unconfirmed critical edges must never be treated as established fact.

### 6. Confirmed vs Inferred Knowledge

Mirror must distinguish at least:

- CONFIRMED;
- INFERRED;
- UNKNOWN;
- STALE.

For inferred knowledge, Mirror must preserve:

- evidence;
- confidence;
- reason;
- source references;
- validation requirement.

An inferred relationship must not look like a confirmed fact. A critical
inference must not drive destructive change without additional validation.

### 7. Source Traceability

Every significant Mirror node and edge must be traceable to:

- Artifact ID;
- source file;
- symbol or section;
- repository revision;
- evidence link;
- validation status.

If traceability is missing, the entry must be blocked, marked incomplete, or
limited to a navigation hint.

### 8. Mirror Generation

Mirror generation follows a deterministic high-level flow:

1. choose scope;
2. resolve authoritative sources;
3. freeze repository revision;
4. gather source evidence;
5. create candidate nodes;
6. create candidate edges;
7. classify confirmed versus inferred;
8. verify references;
9. hand off to the Validation Model;
10. assign `DERIVED`;
11. publish a new Mirror snapshot;
12. supersede the previous snapshot if required.

Mirror generation uses the Generation Pipeline but does not change its rules.

### 9. Incremental Updates

Mirror must define how it reacts to:

- full regeneration;
- incremental refresh;
- partial refresh;
- stale region;
- changed source file;
- removed symbol;
- renamed symbol;
- moved source;
- broken reference.

If the affected scope cannot be determined reliably, Mirror must expand the
refresh scope, mark the region stale, or require full regeneration rather than
silently preserve stale edges.

### 10. Freshness

Mirror freshness must depend on more than time alone. It must also reflect:

- repository revision;
- source artifact revision;
- registry changes;
- removed or renamed files;
- changed authority;
- failed validation;
- dependency changes.

Mirror freshness states must include:

- CURRENT;
- PARTIALLY_STALE;
- STALE;
- INVALID;
- SUPERSEDED.

These states are Mirror-specific and must not be confused with the general
Knowledge Lifecycle unless the relationship is explicitly explained.

### 11. Publication and Consumption

The design must define:

- who may publish Mirror;
- that publication creates only a derived snapshot;
- how the Brain Engine consumes Mirror;
- when the Knowledge Resolver must fall back to authoritative sources;
- that Mirror may not be the sole basis for a critical decision;
- that stale or invalid Mirror snapshots must not be used silently.

### 12. Failure Modes

Mirror must fail explicitly for at least these conditions:

- unresolved source reference;
- deleted file;
- renamed symbol;
- stale repository revision;
- conflicting nodes;
- cyclic dependency representation;
- unsupported source type;
- incomplete generation;
- validation failure;
- publication failure;
- registry mismatch;
- duplicate Artifact ID;
- traceability loss.

For each failure, the design must specify whether the outcome is:

- block;
- partial Mirror;
- stale marking;
- retry;
- manual review;
- full regeneration;
- rejection.

### 13. Mirror Evidence

Every Mirror generation attempt must preserve at least:

- Mirror Artifact ID;
- generation attempt identity;
- repository revision;
- source scope;
- source Artifact IDs;
- generated nodes and edges;
- confirmed / inferred classification;
- unresolved references;
- warnings;
- validation result;
- publication result;
- superseded Mirror reference;
- failure reason, if any.

### 14. Mirror Invariants

The Phase 8 model is testable through the following invariants:

- `MIRROR-INVARIANT-001`: Mirror is a `DERIVED` artifact.
- `MIRROR-INVARIANT-002`: Mirror is not a source of truth.
- `MIRROR-INVARIANT-003`: Every critical node has source traceability.
- `MIRROR-INVARIANT-004`: Every critical edge has evidence.
- `MIRROR-INVARIANT-005`: Inferred knowledge is explicitly marked.
- `MIRROR-INVARIANT-006`: Mirror is tied to a concrete repository revision.
- `MIRROR-INVARIANT-007`: Stale Mirror is not used silently.
- `MIRROR-INVARIANT-008`: Mirror generation does not change canonical source.
- `MIRROR-INVARIANT-009`: Incremental update does not preserve known broken references.
- `MIRROR-INVARIANT-010`: A new snapshot does not destroy evidence of the previous version.
- `MIRROR-INVARIANT-011`: Mirror publication passes the Validation Model.
- `MIRROR-INVARIANT-012`: Mirror cannot automatically become `CANONICAL`.
- `MIRROR-INVARIANT-013`: Critical inference requires additional confirmation.
- `MIRROR-INVARIANT-014`: Knowledge Resolver may return to authoritative source.
- `MIRROR-INVARIANT-015`: Mirror identity is not only a file path.

### 15. Open Decisions

Only genuinely deferred Mirror decisions remain here. Use the structured
format:

- Decision ID;
- Question;
- Recommended Direction;
- Blocking Status;
- Target Phase.

Examples of deferred Mirror decisions include:

- serialization format;
- physical storage location;
- symbol extraction strategy;
- Graphify integration depth;
- confidence threshold for inferred edges;
- full versus incremental regeneration policy;
- visual presentation depth;
- mirror partitioning strategy;
- implementation tooling.

### 16. Completion Criteria

Phase 8 is complete when:

- Mirror purpose is defined;
- Mirror identity is defined;
- Mirror scope is defined;
- node model is defined;
- edge model is defined;
- confirmed / inferred distinction is defined;
- source traceability is defined;
- generation flow is defined;
- incremental update is defined;
- freshness is defined;
- publication and consumption are defined;
- failure modes are defined;
- evidence is defined;
- invariants are defined;
- later phases can rely on Mirror as a fixed derived-navigation boundary.

### 17. Traceability

Implements:

- Architecture Specification v1.0, derived navigation boundary;
- Architecture Specification v1.0, generation pipeline handoff;
- Architecture Specification v1.0, validation handoff;
- `specs/_baseline/17-traceability-index.md`;
- `tests/characterization/traceability.md`;
- `tests/characterization/reports/final.md`.

Constitution:

- Specification First, Evidence Always;
- Server Authority and Data Integrity;
- Temporal Correctness and Idempotency;
- Compatibility and Player Save Safety;
- Incremental Change and Verification.

Preserves:

- read-only derived views;
- canonical authority;
- traceable source resolution;
- fail-closed freshness handling.

## Validation Model

This is Phase 7. It defines the fail-closed validation model that receives the
output of Phase 6 and decides whether a result may advance, remain blocked, or
be returned for correction.

Phase 7 uses the approved inputs from Phase 1 through Phase 6:

- Identity and Reference Resolution;
- Canonical Knowledge Model and Registry;
- Brain Engine Component Model;
- Component Contracts;
- Knowledge Lifecycle;
- Generation Pipeline.

Phase 7 does not redefine earlier phases. It validates the outputs of those
phases against the approved architecture, the constitution, and the current
repository evidence.

### 1. Validation Purpose

Validation must:

- verify that the produced artifact or report is structurally valid;
- verify that references resolve to the intended canonical targets;
- verify that freshness constraints are satisfied;
- verify that traceability is complete enough to explain the result;
- verify that the result still matches the approved architecture;
- block publication when authority, evidence, or context is insufficient;
- make every failure observable and attributable.

Validation must not:

- invent missing authority;
- rewrite canonical knowledge;
- silently repair broken inputs;
- promote an invalid result;
- treat an incomplete result as successful;
- infer success from the absence of an error message.

### 2. Validation Layers

The model uses the following validation layers in order:

1. Schema validation
2. Reference validation
3. Freshness validation
4. Traceability validation
5. Architecture compliance validation
6. Publication eligibility validation

Each layer may stop the flow if its contract is not satisfied. Later layers may
assume earlier layers already passed, but they must not weaken earlier checks.

### 3. Schema Validation

Schema validation checks that the result has the required shape for its class.

It must verify:

- required fields are present;
- required fields have the expected semantic type;
- forbidden fields are absent when the class forbids them;
- field combinations are internally consistent;
- result categories are recognized by the design.

Schema validation is about structure, not truth.

### 4. Reference Validation

Reference validation checks that all required references resolve correctly.

It must verify:

- the referenced artifact exists or is otherwise resolvable by the approved
  identity contract;
- the reference points to the intended artifact type;
- the reference is not ambiguous;
- the reference is not silently redirected unless the identity contract
  explicitly allows that redirect;
- broken references fail closed instead of being guessed.

### 5. Freshness Validation

Freshness validation checks whether the result is still current relative to the
canonical knowledge and source revisions used to produce it.

It must verify:

- the source revision used for generation is the one being validated;
- stale canonical inputs are detected explicitly;
- stale derived outputs are marked stale instead of promoted;
- freshness evidence is present where freshness is required;
- a newer repository state does not silently inherit an older result.

### 6. Traceability Validation

Traceability validation checks whether the result can be explained from source
to output.

It must verify:

- the result identifies its source inputs;
- the result identifies the attempt or context that produced it when relevant;
- the result carries enough provenance to reconstruct the validation path;
- canonical knowledge, derived output, and evidence remain distinguishable;
- unresolved or missing traceability is reported explicitly.

### 7. Architecture Compliance Validation

Architecture compliance checks whether the result still obeys the approved
architecture and design boundaries.

It must verify:

- the result does not redefine authority;
- the result does not bypass the canonical knowledge boundary;
- the result does not promote derived material into truth;
- the result respects lifecycle boundaries;
- the result stays within the approved Phase 1 through Phase 6 contracts;
- the result does not smuggle in behavior from later phases.

### 8. Publication Eligibility

A result may be published only when:

- the required validation layers have passed;
- the result type is allowed to publish;
- traceability is complete enough for review;
- no critical unresolved reference remains;
- no freshness failure remains unresolved;
- the publication target is authorized by the relevant contract.

If any required condition is missing, publication must be blocked.

### 9. Error Visibility

Validation errors must be visible, specific, and attributable.

An error must say:

- what failed;
- which layer failed;
- what input or reference caused the failure;
- whether the failure is recoverable;
- whether the result is blocked, stale, rejected, or requires correction.

Errors must not collapse distinct problems into a single vague failure.

### 10. Recovery Behavior

Recovery behavior must be explicit and fail closed.

The design allows the following recovery responses:

- fix the input and retry;
- refresh the context and regenerate;
- mark the result stale;
- reject the result;
- request additional evidence;
- stop and escalate for human review.

Recovery must not silently promote an invalid result.

### 11. Validation Invariants

The Phase 7 model is testable through the following invariants:

- `VALIDATION-INVARIANT-001`: A result cannot pass validation without a
  recognized shape.
- `VALIDATION-INVARIANT-002`: Broken references fail closed.
- `VALIDATION-INVARIANT-003`: Freshness is checked explicitly where required.
- `VALIDATION-INVARIANT-004`: Traceability is required for publication.
- `VALIDATION-INVARIANT-005`: Derived output cannot become canonical through
  validation alone.
- `VALIDATION-INVARIANT-006`: Validation never invents missing authority.
- `VALIDATION-INVARIANT-007`: Architecture compliance is checked before
  publication.
- `VALIDATION-INVARIANT-008`: Validation errors are attributable.
- `VALIDATION-INVARIANT-009`: Recovery does not bypass the validation contract.
- `VALIDATION-INVARIANT-010`: Unresolved ambiguity blocks advancement.

### 12. Open Decisions

Only genuinely deferred validation details remain here:

- concrete schema fields for specific future artifact classes belong to later
  contract work;
- detailed validator implementation belongs to implementation;
- any future specialized validation artifact belongs to its own approved phase
  if one is ever introduced.

For each deferred item, record:

- Decision ID;
- question;
- recommended direction;
- blocking / non-blocking;
- target phase.

### 13. Phase 7 Completion Criteria

Phase 7 is complete when:

- schema validation is defined;
- reference validation is defined;
- freshness validation is defined;
- traceability validation is defined;
- architecture compliance validation is defined;
- publication eligibility is defined;
- error visibility is defined;
- recovery behavior is defined;
- validation invariants are defined;
- Phase 8 can define its contract without guessing the validation model.

### 14. Traceability

Implements:

- Architecture Specification v1.0, generation pipeline handoff
- Architecture Specification v1.0, canonical knowledge model and registry
- Architecture Specification v1.0, component contracts
- Architecture Specification v1.0, knowledge lifecycle
- `specs/_baseline/17-traceability-index.md`
- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`

Constitution:

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Temporal Correctness and Idempotency
- Compatibility and Player Save Safety
- Incremental Change and Verification

Preserves:

- fail-closed validation
- traceable validation outcomes
- read-only derived views
- canonical authority boundaries

## Phase 9: Debug Manifest

This is Phase 9. It defines Debug Manifest as a derived engineering memory of
investigations. It is not a log, not telemetry, not runtime diagnostics, and
not an event stream. It records how the Brain investigated a problem, which
hypotheses were tested, why a decision was reached, and what follow-up
remains.

Debug Manifest is distinct from the Graphify manifest and the fixture
manifest. It may refer to both, but it does not replace either one.

### 1. Purpose

Debug Manifest stores:

- engineering investigations;
- observed symptoms;
- tested hypotheses;
- confirmed causes;
- rejected causes;
- experiment outcomes;
- affected invariants;
- changed artifacts;
- chosen resolutions;
- remaining risks;
- follow-up recommendations.

Debug Manifest does not store:

- runtime telemetry;
- stack traces;
- ordinary application logs;
- performance counters;
- ad hoc debug prints.

### 2. Manifest Identity

Each investigation must have stable identity fields:

- Manifest Artifact ID;
- Investigation ID;
- Investigation Revision;
- Repository Revision;
- Related Task Identity;
- Related Generation Attempt;
- Related Validation;
- Related Mirror;
- Freshness;
- Lifecycle State;
- Supersedes.

Each investigation must have its own identity so later revisions can be
distinguished from earlier ones without overwriting history.

### 3. Investigation Lifecycle

The Debug Manifest lifecycle is forward-moving and traceable:

- OPEN;
- INVESTIGATING;
- HYPOTHESIS_FORMED;
- TESTING;
- VALIDATED;
- RESOLVED;
- ARCHIVED;
- SUPERSEDED.

Allowed transitions are monotonic. An investigation may move forward as new
evidence arrives, and a newer revision may supersede an older one, but the
manifest must not silently rewrite history.

### 4. Investigation Structure

Each investigation should record:

- problem statement;
- observed symptoms;
- reproduction steps;
- assumptions;
- hypotheses;
- evidence;
- failed hypotheses;
- confirmed root cause;
- affected artifacts;
- affected source files;
- affected invariants;
- risks;
- final resolution;
- remaining uncertainty;
- future recommendations.

### 5. Hypothesis Model

Each hypothesis should record:

- identity;
- author;
- confidence;
- supporting evidence;
- contradicting evidence;
- validation status;
- rejection reason;
- timestamps or ordering.

A hypothesis is never automatically true. It becomes useful only when
evidence confirms or rejects it.

### 6. Evidence Model

Supported evidence types include:

- source inspection;
- architecture reference;
- invariant reference;
- validation result;
- mirror observation;
- repository evidence;
- experiment result;
- manual observation;
- external documentation.

Every evidence item must be traceable back to a repository revision, artifact
identifier, or validated observation so later review can replay the reasoning.

### 7. Root Cause

Root cause is a separate object and should record:

- description;
- confidence;
- supporting evidence;
- affected artifacts;
- affected invariants;
- validation status;
- alternative explanations;
- remaining uncertainty.

### 8. Resolution

Resolution should record:

- chosen resolution;
- reasons for the choice;
- rejected alternatives;
- expected outcome;
- risks;
- follow-up recommendations;
- required validation.

### 9. Learning Memory

The Debug Manifest should help Brain remember:

- which hypotheses were already tested;
- which investigations are similar;
- which errors repeat;
- which resolutions have worked before;
- which approaches did not work.

This is engineering memory, not model training and not a source of truth.

### 10. Cross References

Every manifest should link to:

- Artifact IDs;
- Mirror entries;
- Generation attempts;
- Validation reports;
- Canonical artifacts;
- Invariants;
- Repository revisions.

Cross references must resolve to stable identifiers or revisions. Broken
references fail validation rather than becoming soft links.

### 11. Failure Modes

The manifest must handle these failure modes explicitly:

- incomplete investigation;
- missing evidence;
- conflicting evidence;
- unresolved root cause;
- stale investigation;
- superseded investigation;
- broken references;
- duplicate investigations.

The design-level outcome is non-publishable manifest data. A manifest with any
of these failures must not be treated as canonical knowledge or as a completed
investigation.

### 12. Publication Rules

The Debug Manifest may be published only as a derived artifact.

It never becomes a source of truth.
It never changes Canonical Knowledge.
It never changes the Mirror.
It may be consumed by Brain Engine as additional engineering memory, but only
as a read-only projection of validated investigation history.

### 13. Manifest Invariants

- DEBUG-INVARIANT-001: Manifest is a DERIVED artifact.
- DEBUG-INVARIANT-002: Investigation has its own identity.
- DEBUG-INVARIANT-003: Hypothesis is not a fact.
- DEBUG-INVARIANT-004: Root Cause requires evidence.
- DEBUG-INVARIANT-005: Every evidence item has traceability.
- DEBUG-INVARIANT-006: Manifest is not a source of truth.
- DEBUG-INVARIANT-007: Manifest does not change Canonical Knowledge.
- DEBUG-INVARIANT-008: Resolution does not bypass Validation.
- DEBUG-INVARIANT-009: Failed hypotheses are preserved.
- DEBUG-INVARIANT-010: Investigation is tied to a repository revision.
- DEBUG-INVARIANT-011: Superseded investigations preserve history.
- DEBUG-INVARIANT-012: Debug Manifest does not replace Mirror.
- DEBUG-INVARIANT-013: Debug Manifest does not replace Validation.
- DEBUG-INVARIANT-014: Manifest supports reuse of engineering knowledge.
- DEBUG-INVARIANT-015: Traceability is mandatory for Root Cause.

### 14. Open Decisions

The remaining questions are implementation questions only. They should use the
structured format below and must not redefine the Debug Manifest model:

- Decision ID: DM-001
  Question: Where will the derived manifest be stored and how will it be
  serialized?
  Recommended Direction: Defer to implementation design.
  Blocking Status: Open
  Target Phase: Future implementation

- Decision ID: DM-002
  Question: How will the manifest be searched, filtered, and visualized?
  Recommended Direction: Defer to implementation design.
  Blocking Status: Open
  Target Phase: Future implementation

- Decision ID: DM-003
  Question: What retention and compression policy should apply to older
  investigations?
  Recommended Direction: Defer to implementation design.
  Blocking Status: Open
  Target Phase: Future implementation

- Decision ID: DM-004
  Question: How should Debug Manifest consumption integrate with future AI
  Agent Orchestration?
  Recommended Direction: Keep the artifact provider-agnostic and read-only.
  Blocking Status: Open
  Target Phase: Phase 10

### 15. Completion Criteria

Phase 9 is complete when:

- the purpose of the Debug Manifest is defined;
- manifest identity is defined;
- the investigation lifecycle is defined;
- the investigation structure is defined;
- the hypothesis model is defined;
- the evidence model is defined;
- root cause is defined as a separate object;
- resolution is defined;
- learning memory is defined;
- cross references are defined;
- failure modes are defined;
- publication rules are defined;
- manifest invariants are defined;
- open decisions are recorded in structured form.

Phase 10 must be able to consume the Debug Manifest without redefining its
model.

## Phase 10: AI Agents and Ralph Boundary

This is Phase 10. It defines the authority boundary between Project Brain,
Execution Agents, Review Agents, Ralph, Validation, Mirror, Debug Manifest,
Canonical Knowledge, and external execution providers. It is design-only and
does not define runtime implementation or provider-specific wiring.

Phase 10 uses the approved inputs from Phase 1 through Phase 9:

- Identity and Reference Resolution;
- Canonical Knowledge Model and Registry;
- Brain Engine Component Model;
- Component Contracts;
- Knowledge Lifecycle;
- Generation Pipeline;
- Validation Model;
- Mirror Contract;
- Debug Manifest.

Phase 10 does not redefine earlier phases. It defines ownership,
communication, trust, and review boundaries only.

### 1. Role Model

- **Project Brain**: the central knowledge architecture. It owns the approved
  architecture, the canonical knowledge boundary, orchestration rules, and the
  derived-view contract. It is the authority that coordinates work, but it is
  not replaced by any agent or provider.
- **Canonical Knowledge**: the only source of truth. It stores proven facts
  and approved architectural knowledge. No agent, provider, Mirror snapshot, or
  Debug Manifest may replace it.
- **Validation**: the fail-closed gatekeeper. It checks authority, traceability,
  freshness, and compliance. It may block advancement, but it may not invent
  truth.
- **Mirror**: a read-only navigation view. It helps humans and agents inspect
  the repository and dependencies, but it is never authoritative.
- **Debug Manifest**: a read-only investigation memory. It records reasoning,
  evidence, hypotheses, resolutions, and follow-up actions, but it is never a
  source of truth.
- **External Execution Providers**: interchangeable execution backends for AI
  work. They may compute, summarize, or draft, but they do not own authority.
- **Execution Agent**: the role that performs investigation or change work by
  gathering evidence, proposing actions, and producing a report or patch
  proposal.
- **Review Agent**: the role that independently evaluates a proposal or
  completion report and returns a structured decision.
- **Ralph**: an orchestration boundary role or workflow convention. If used in
  future workflows, Ralph may coordinate work or represent an agent-facing
  boundary, but it must never become a source of truth, a provider authority,
  or a persistence owner.

### 2. Authority Boundaries

- Canonical Knowledge outranks all agent output, provider output, Mirror
  output, and Debug Manifest output.
- Validation may approve, block, or require correction, but it may not create
  authority.
- Mirror and Debug Manifest are derived read-only artifacts; they may inform
  work, but they do not decide truth.
- External execution providers are interchangeable and must not be depended on
  as the authority layer.
- Execution and review may use the same provider or different providers, but
  provider choice never changes authority.
- Ralph cannot own canonical data, cannot bypass validation, and cannot act as
  a hidden source of truth.
- Project Brain coordinates the workflow, but the authoritative knowledge
  remains in Canonical Knowledge and governance.

### 3. Communication Boundaries

- Execution Agents communicate with Project Brain through bounded proposals,
  evidence bundles, task updates, and change reports.
- Review Agents communicate with Project Brain through bounded review results
  such as approval, conditional approval, rejection, or need-for-evidence.
- Providers receive task context from the execution or review role they serve;
  they do not receive authority to change canonical knowledge directly.
- Mirror and Debug Manifest may be read as context, but their outputs are never
  treated as the final word when they disagree with canonical authority.
- No agent communicates directly with canonical storage as if it were a
  peer-to-peer collaboration surface.

### 4. Lifecycle Interactions

- A task enters Project Brain as a request or investigation.
- Project Brain assembles context from canonical knowledge and the approved
  derived views.
- An Execution Agent performs the work using one interchangeable execution
  provider or another.
- The resulting proposal, evidence, or patch candidate is validated.
- If independent review is required, a Review Agent evaluates the proposal or
  completion report.
- Only after validation and any required review can the work advance toward a
  canonical change.
- Mirror and Debug Manifest may be regenerated or updated as derived outputs
  after the underlying evidence is validated.

### 5. Trust Boundaries

- Execution Provider output is untrusted until validated.
- Review Provider output is advisory until it is accepted by the governing
  workflow.
- Mirror output is trusted only as a navigation aid and only when freshness is
  confirmed.
- Debug Manifest output is trusted only as a record of investigated reasoning,
  not as a truth source.
- Canonical Knowledge is trusted as the authority only because it is proven and
  committed under governance.

### 6. Prohibited Responsibilities

The following responsibilities are forbidden for Execution Agents, Review
Agents, Ralph, providers, Mirror, and Debug Manifest:

- acting as a source of truth;
- mutating Canonical Knowledge directly without the approved workflow;
- bypassing Validation;
- redefining architecture or constitution;
- silently replacing evidence with inference;
- making provider identity authoritative;
- treating a derived view as canonical storage;
- hiding failure, uncertainty, or unresolved evidence;
- escalating an unvalidated proposal into a fact.

### 7. Failure Boundaries

The design must fail closed when:

- a provider is unavailable or returns an unusable result;
- a proposal lacks sufficient evidence;
- a review result is missing, ambiguous, or contradictory;
- validation fails for freshness, traceability, or authority;
- Mirror or Debug Manifest disagree with canonical authority and the conflict
  cannot be resolved from approved sources;
- Ralph or any orchestration role attempts to cross an authority boundary;
- the workflow cannot distinguish proposal, review, and canonical change.

Failure must block advancement instead of inventing a fallback truth.

### 8. Review Responsibilities

- Execution Agents are responsible for the initial investigation, candidate
  change, and evidence bundle.
- Review Agents are responsible for independent scrutiny of the proposal,
  expected impact, risks, and missing evidence.
- Review must be able to request more evidence, approve conditionally, reject,
  or defer.
- Review must not rewrite the proposal; it can only accept, reject, or request
  correction.
- If execution and review use different providers, the workflow should preserve
  that separation so a correlated mistake is less likely.

### 9. Invariants

- `AGENT-INVARIANT-001`: Project Brain remains the central knowledge
  architecture.
- `AGENT-INVARIANT-002`: Canonical Knowledge remains the only source of truth.
- `AGENT-INVARIANT-003`: External execution providers are interchangeable.
- `AGENT-INVARIANT-004`: Provider identity never becomes authority.
- `AGENT-INVARIANT-005`: Execution and review roles are separable.
- `AGENT-INVARIANT-006`: Review provider may differ from execution provider.
- `AGENT-INVARIANT-007`: Ralph is not a source of truth.
- `AGENT-INVARIANT-008`: Validation can block but cannot invent truth.
- `AGENT-INVARIANT-009`: Mirror stays read-only.
- `AGENT-INVARIANT-010`: Debug Manifest stays read-only.
- `AGENT-INVARIANT-011`: Derived outputs cannot silently become canonical.
- `AGENT-INVARIANT-012`: Authority boundaries must be observable.

### 10. Open Decisions

The remaining questions are implementation questions only. They should use the
structured format below and must not redefine the Phase 10 boundary model:

- Decision ID: AGENT-001
  Question: What review consensus strategy should future workflows use when
  multiple review agents are available?
  Recommended Direction: Defer the algorithm to implementation design; keep
  the boundary provider-agnostic.
  Blocking Status: Open
  Target Phase: Future implementation

- Decision ID: AGENT-002
  Question: What exact context package and review-report envelope should be
  used for agent handoffs?
  Recommended Direction: Defer the envelope shape to implementation design
  while preserving the authority boundaries defined here.
  Blocking Status: Open
  Target Phase: Future implementation

### 11. Completion Criteria

Phase 10 is complete when:

- Project Brain authority is defined;
- Execution Agent responsibilities are defined;
- Review Agent responsibilities are defined;
- Ralph classification is defined;
- external execution providers are classified as interchangeable;
- communication boundaries are defined;
- authority boundaries are defined;
- trust boundaries are defined;
- prohibited responsibilities are defined;
- failure boundaries are defined;
- review responsibilities are defined;
- invariants are defined;
- open decisions are recorded in structured form.

Phase 11 must be able to consume this boundary model without redefining it.

### 12. Traceability

Implements:

- Architecture Specification v1.0, orchestration boundary;
- Architecture Specification v1.0, canonical authority boundary;
- Architecture Specification v1.0, derived artifact boundary;
- `specs/_baseline/17-traceability-index.md`;
- `tests/characterization/traceability.md`;
- `tests/characterization/reports/final.md`.

Constitution:

- Specification First, Evidence Always;
- Server Authority and Data Integrity;
- Temporal Correctness and Idempotency;
- Compatibility and Player Save Safety;
- Incremental Change and Verification.

Preserves:

- canonical knowledge authority;
- fail-closed validation;
- read-only derived views;
- provider interchangeability at the execution boundary.

## Phase 11: Operational Workflows

This is Phase 11. It defines the day-to-day repository workflows that Project Brain must support using existing components only. It does not add new components, runtime behavior, or authority rules.

Phase 11 uses the approved inputs from Phase 1 through Phase 10:

- Identity and Reference Resolution;
- Canonical Knowledge Model and Registry;
- Brain Engine Component Model;
- Component Contracts;
- Knowledge Lifecycle;
- Generation Pipeline;
- Validation Model;
- Mirror Contract;
- Debug Manifest;
- AI Agents and Ralph Boundary.

### Workflow Template Rule

Every workflow in this phase must use the same section order and the same meaning for each section. Keep each workflow compact enough to compare at a glance. Do not add ad hoc subsections or let a single workflow turn into a special-case document.

### Shared Workflow Template

For each workflow define:

- Purpose;
- Trigger;
- Entry Conditions;
- Starting Role;
- Required Inputs;
- Context Sources;
- Execution Steps;
- Validation Gates;
- Review Points;
- Canonical Update;
- Mirror Update;
- Debug Manifest Update;
- Failure Paths;
- Recovery Paths;
- Completion Conditions;
- Produced Artifacts;
- Affected Artifacts;
- Authority Checkpoints;
- Traceability Requirements;
- Related Invariants.

### 1. Bug Investigation

Path: Bug Report -> Project Brain -> Context Package -> Execution Agent -> Validation -> Review -> Root Cause -> Resolution -> Canonical Change -> Mirror Refresh -> Debug Manifest Update.

- Purpose: explain and fix a reported incorrect behavior with evidence-backed root cause analysis.
- Authority / Validation: canonical knowledge stays authoritative; execution output is advisory until validation and review pass.
- Updates: canonical fix only after validation; Mirror and Debug Manifest refresh after publication.
- Failure / Recovery: reproduce failure, gather more evidence, or request a second review when the cause is not yet proven.
- Completion / Artifacts: validated fix, canonical change, refreshed Mirror, updated Debug Manifest.
- Related invariants: fail-closed validation, traceability, canonical authority.

### 2. Feature Development

Path: Idea -> Project Brain -> Context Package -> Execution Agent -> Validation -> Review -> Canonical Knowledge Update -> Mirror Refresh -> Debug Manifest Update.

- Purpose: move a feature from idea to validated canonical knowledge without bypassing the architecture boundary.
- Authority / Validation: approved architecture constrains the feature; validation and review gate publication.
- Updates: canonical update only after validation; derived views refresh after publication.
- Failure / Recovery: trim scope, revise the design, or gather more evidence when the feature drifts from authority.
- Completion / Artifacts: validated feature proposal, canonical change, refreshed Mirror, Debug Manifest note.
- Related invariants: architecture compliance, canonical authority, traceability.

### 3. Refactoring

Path: Current Source -> Project Brain -> Context Package -> Execution Agent -> Validation -> Review -> Refactored Source -> Mirror Refresh (if needed) -> Debug Manifest Update.

- Purpose: improve structure without changing architectural meaning or protected behavior.
- Authority / Validation: compatibility and invariants outrank cleanup convenience.
- Updates: canonical knowledge changes only if the refactor reveals a new validated architectural fact; otherwise derived views only.
- Failure / Recovery: revert the slice, narrow the refactor, and retest if behavior changes.
- Completion / Artifacts: refactored source, validation evidence, optional derived-view refresh.
- Related invariants: compatibility, architectural boundaries, validation.

### 4. Code Review

Path: Proposed Change -> Review Agent -> Validation -> Decision -> Optional Follow-up -> Canonical Publication or Rejection.

- Purpose: independently evaluate a proposal before it changes canonical knowledge.
- Authority / Validation: review is advisory until accepted by governance; it must not rewrite the proposal.
- Updates: no canonical update on reject; publication only after approved review.
- Failure / Recovery: ask for more evidence, reject, or defer when the proposal is ambiguous.
- Completion / Artifacts: structured review decision and optional follow-up request.
- Related invariants: independent review, fail-closed validation, canonical authority.

### 5. Root Cause Analysis

Path: Symptom -> Hypotheses -> Evidence -> Validation -> Confirmed Root Cause -> Resolution.

- Purpose: identify the confirmed cause of a failure and the evidence that proves it.
- Authority / Validation: evidence proves the cause; unsupported conclusions stay blocked.
- Updates: canonical knowledge changes only when the root cause is confirmed and accepted.
- Failure / Recovery: collect more evidence or revisit hypotheses when the cause remains ambiguous.
- Completion / Artifacts: root cause record, resolution proposal, Debug Manifest entry.
- Related invariants: evidence-backed reasoning, traceability, canonical authority.

### 6. Regression Investigation

Path: Regression Signal -> Baseline Comparison -> Evidence -> Validation -> Prevention -> Publication.

- Purpose: explain why a previously working behavior regressed and prevent it from reappearing.
- Authority / Validation: historical baseline and canonical evidence outrank conjecture.
- Updates: canonical knowledge may record a new invariant or dependency understanding; derived views refresh if navigation changes.
- Failure / Recovery: reconstruct the baseline, narrow the cause, or ask for more history when the regression is unclear.
- Completion / Artifacts: regression report, validated fix, prevention note, Debug Manifest entry.
- Related invariants: freshness, traceability, canonical authority.

### 7. Knowledge Refresh

Path: Freshness Signal -> Source Comparison -> Regeneration -> Validation -> Refresh Decision.

- Purpose: decide when knowledge is stale and needs regeneration or review.
- Authority / Validation: freshness never outranks canonical truth.
- Updates: canonical knowledge changes only through the source that owns it; Mirror refresh follows the canonical change.
- Failure / Recovery: widen scope, re-resolve sources, or regenerate when freshness is unclear.
- Completion / Artifacts: refresh decision, updated canonical entry if needed, updated Mirror, Debug Manifest note.
- Related invariants: freshness, fail-closed validation, canonical authority.

### 8. Mirror Regeneration

Path: Source Revision -> Mirror Scope -> Generation -> Validation -> Publish Snapshot -> Supersede Previous Snapshot.

- Purpose: rebuild the read-only navigation view from authoritative sources.
- Authority / Validation: Mirror is derived only; canonical authority stays with source knowledge.
- Updates: Mirror snapshot refreshes; Debug Manifest records the regeneration reason.
- Failure / Recovery: broaden scope, refresh sources, or block publish if references are broken.
- Completion / Artifacts: regenerated Mirror snapshot, validation evidence, supersession record.
- Related invariants: read-only derived views, traceability, freshness.

### 9. Validation Failure Recovery

Path: Validation Failure -> Classification -> Recovery Choice -> Revalidation or Escalation.

- Purpose: define what happens when validation blocks progress.
- Authority / Validation: the failure must remain observable and attributable.
- Updates: no canonical update is allowed until validation succeeds; stale or invalid Mirror content must not be silently reused.
- Failure / Recovery: fix the input, refresh the context, request more evidence, or escalate when the failure cannot be resolved locally.
- Completion / Artifacts: failure report, recovery decision, revalidation result, Debug Manifest note.
- Related invariants: fail-closed validation, attributable errors, canonical authority.

### 10. Publication Workflow

Path: Validated Proposal -> Required Review -> Approval -> Canonical Knowledge Update -> Mirror Refresh -> Debug Manifest Update -> Publication Complete.

- Purpose: publish a validated proposal into canonical knowledge and derived views.
- Authority / Validation: approval, validation, and canonical authority must all align before publication completes.
- Updates: canonical update happens first; Mirror and Debug Manifest refresh after publication.
- Failure / Recovery: correct the proposal, revalidate, or request more evidence if publication is blocked.
- Completion / Artifacts: canonical update, refreshed Mirror, updated Debug Manifest, publication record.
- Related invariants: canonical authority, freshness, read-only derived views.

### 11. Completion Criteria

Phase 11 is complete when:

- all 10 workflows are described;
- every workflow uses the shared template and section order;
- every workflow uses existing components only;
- every workflow shows authority boundaries;
- every workflow shows Validation;
- every workflow shows Review;
- every workflow shows Canonical Update;
- every workflow shows Mirror Update;
- every workflow shows Debug Manifest Update;
- every workflow defines failure and recovery paths;
- Phase 12 can consume Operational Workflows without redefining them.

### 12. Traceability

Implements:

- Architecture Specification v1.0, operational workflow boundary;
- Architecture Specification v1.0, canonical authority boundary;
- Architecture Specification v1.0, derived artifact boundary;
- `specs/_baseline/17-traceability-index.md`;
- `tests/characterization/traceability.md`;
- `tests/characterization/reports/final.md`.

Constitution:

- Specification First, Evidence Always;
- Server Authority and Data Integrity;
- Temporal Correctness and Idempotency;
- Compatibility and Player Save Safety;
- Incremental Change and Verification.

Preserves:

- workflow comparability;
- explicit authority boundaries;
- read-only derived views;
- fail-closed validation;
- provider interchangeability at the execution boundary.

## Phase 12: Design Completion

This is Phase 12. It does not add architecture. It consolidates the approved phases, records implementation-level gaps, and states whether Feature 003 is ready for implementation.

Phase 12 uses Phase 1 through Phase 11 as the frozen design baseline.

### 1. Architecture Completion

| Phase | Defines | Depends On | Provides To | Boundary | Open Decisions |
| --- | --- | --- | --- | --- | --- |
| 1 - Identity and Reference Resolution | stable artifact identity, reference rules, supersession, broken-reference behavior | Constitution and source anchors | all later phases | closed | implementation-level only |
| 2 - Canonical Knowledge Model and Registry | canonical authority, registry metadata, derived relationships | Phase 1 | phases 3-12 | closed | storage / serialization |
| 3 - Brain Engine Component Model | semantic, dependency, confidence, hybrid-evolution responsibilities | Phases 1-2 | phases 4-12 | closed | internal execution details |
| 4 - Component Contracts | discovery, context, generation, validation, storage, resolution, errors | Phases 1-3 | phases 5-12 | closed | contract envelope details |
| 5 - Knowledge Lifecycle | proposed, draft, validated, canonical, stale, superseded, rejected, derived | Phases 1-4 | phases 6-12 | closed | lifecycle transition storage |
| 6 - Generation Pipeline | deterministic inputs, stages, reproducibility, partial failure | Phases 1-5 | phases 7-12 | closed | provider routing, attempt metadata |
| 7 - Validation Model | schema, reference, freshness, traceability, architecture compliance, publication eligibility | Phases 1-6 | phases 8-12 | closed | validator implementation |
| 8 - Mirror Contract | read-only navigation, freshness, regeneration, stale behavior | Phases 1-7 | phases 9-12 | closed | serialization, partitioning |
| 9 - Debug Manifest | investigation memory, hypotheses, evidence, root cause, resolution, publication rules | Phases 1-8 | phases 10-12 | closed | storage / search / retention |
| 10 - AI Agents and Ralph Boundary | execution/review roles, provider independence, trust and authority boundaries | Phases 1-9 | phases 11-12 | closed | review consensus, handoff envelope |
| 11 - Operational Workflows | investigation, feature, refactor, review, refresh, regeneration, recovery, publication workflows | Phases 1-10 | Phase 12 | closed | workflow packaging |

Cross-cutting dependencies:

- authoritative chain: Identity -> Canonical Knowledge -> Brain Engine -> Component Contracts -> Lifecycle -> Generation -> Validation;
- derived-artifact chain: Validation -> Mirror and Debug Manifest as read-only outputs;
- execution chain: Brain Engine -> Agents and Providers -> Operational Workflows;
- review chain: Validation -> Review -> Publication;
- traceability chain: every phase must preserve a source-to-output path back to canonical knowledge.

### 2. Dependency Map

| Component / Phase | Depends On | Provides To | Authority Level | Failure Impact |
| --- | --- | --- | --- | --- |
| Identity | Constitution, source anchors | canonical registry, every later phase | canonical | broken references, ambiguous IDs |
| Canonical Knowledge | Identity, architecture rules | Brain Engine, Validation, Mirror, Debug Manifest | canonical | second source of truth |
| Brain Engine | Canonical Knowledge | Generation, Validation, Agents | canonical consumer | incorrect reasoning, bad context |
| Component Contracts | Brain Engine, Canonical Knowledge | Lifecycle, Generation, Validation | architectural | contract drift |
| Lifecycle | Canonical Knowledge, Component Contracts | Generation, Validation, Mirror | architectural | illegal state transitions |
| Generation Pipeline | Lifecycle, Brain Engine | Validation, Mirror, Debug Manifest | derived | non-deterministic output |
| Validation Model | Generation, Canonical Knowledge, Identity | Mirror, Debug Manifest, Agents, Publication | gatekeeper | blocked or unsafe publication |
| Mirror Contract | Validation, Generation, Canonical Knowledge | Agents, Workflows | derived | stale or misleading navigation |
| Debug Manifest | Validation, Mirror, Canonical Knowledge | Agents, Workflows, Review | derived | lost investigation memory |
| AI Agents and Ralph Boundary | Brain Engine, Validation, Mirror, Debug Manifest | Operational Workflows | orchestrated / non-authoritative | authority confusion |
| Operational Workflows | Agents, Validation, Mirror, Debug Manifest | Publication and Governance | process layer | workflow deadlock or unsafe publish |

### 3. Final Invariant Index

Selected invariants only; no new IDs are introduced.

| Category | Invariant ID | Short Statement | Source Phase | Protects | Later Phases Depending |
| --- | --- | --- | --- | --- | --- |
| Identity and References | IDENTITY-INVARIANT-001 | Artifact ID remains stable across renames and path moves | Phase 1 | stable identity | 2-12 |
| Identity and References | IDENTITY-INVARIANT-007 | Reference resolution is deterministic | Phase 1 | reliable lookup | 2-12 |
| Canonical Authority | CANONICAL-INVARIANT-001 | Canonical knowledge is the minimum approved set of truth | Phase 2 | truth boundary | 3-12 |
| Canonical Authority | CANONICAL-INVARIANT-004 | Authority is explicit and not inferred from path | Phase 2 | authority clarity | 3-12 |
| Lifecycle | LIFECYCLE-INVARIANT-001 | Every artifact has an explicit lifecycle state | Phase 5 | state clarity | 6-12 |
| Lifecycle | LIFECYCLE-INVARIANT-003 | DERIVED does not become CANONICAL automatically | Phase 5 | derived boundary | 6-12 |
| Generation | GENERATION-INVARIANT-001 | Every generation attempt has an identity | Phase 6 | attempt traceability | 7-12 |
| Generation | GENERATION-INVARIANT-004 | Generated output does not become CANONICAL automatically | Phase 6 | authority boundary | 7-12 |
| Validation | VALIDATION-INVARIANT-002 | Broken references fail closed | Phase 7 | safe publication | 8-12 |
| Validation | VALIDATION-INVARIANT-004 | Traceability is required for publication | Phase 7 | evidence quality | 8-12 |
| Mirror | MIRROR-INVARIANT-002 | Mirror is not a source of truth | Phase 8 | read-only navigation | 9-12 |
| Mirror | MIRROR-INVARIANT-011 | Mirror publication passes the Validation Model | Phase 8 | freshness and correctness | 9-12 |
| Debug Manifest | DEBUG-INVARIANT-006 | Manifest is not a source of truth | Phase 9 | investigation memory boundary | 10-12 |
| Debug Manifest | DEBUG-INVARIANT-015 | Traceability is mandatory for Root Cause | Phase 9 | root-cause evidence | 10-12 |
| Agents and Providers | AGENT-INVARIANT-002 | Canonical Knowledge remains the only source of truth | Phase 10 | authority boundary | 11-12 |
| Agents and Providers | AGENT-INVARIANT-006 | Review provider may differ from execution provider | Phase 10 | correlated-error reduction | 11-12 |
| Operational Workflows | CONTRACT-INVARIANT-008 | Traceability survives blocking and failure | Phase 4 | recoverable workflows | 11-12 |
| Traceability and Governance | PROCESS-RULE-001 | Every phase consumes approved artifacts of the previous phase | Design rules | phase boundaries | 12 |

Operational workflows are protected by the cross-cutting invariants above; no new invariant IDs are introduced in Phase 12.

### 4. Architecture Readiness

**Final readiness status:** DESIGN READY WITH DECLARED GAPS

Fully defined:

- identity model;
- canonical authority;
- component roles;
- component contracts;
- lifecycle;
- generation flow;
- validation boundaries;
- Mirror contract;
- Debug Manifest contract;
- agent and provider boundaries;
- operational workflows.

Intentionally deferred:

- serialization format;
- storage implementation;
- provider selection algorithm;
- consensus strategy;
- exact handoff envelope;
- UI / visualization;
- retention policy;
- incremental refresh algorithm;
- physical module / package structure.

Blocking gaps:

- none at the architecture level.

### 5. Final Open Decision Register

Implementation-level only; these do not block architecture completion.

| Decision ID | Question | Recommended Direction | Blocking Status | Target Phase |
| --- | --- | --- | --- | --- |
| OD-001 | What serialization format should derived artifacts use? | Defer to implementation design | Non-blocking | Implementation |
| OD-002 | Where should the derived artifacts be stored? | Defer to implementation design | Non-blocking | Implementation |
| OD-003 | How should provider selection be performed? | Keep capability-based routing | Non-blocking | Implementation |
| OD-004 | What consensus strategy should review use? | Defer algorithm choice | Non-blocking | Implementation |
| OD-005 | What exact handoff envelope should agents use? | Defer envelope shape | Non-blocking | Implementation |
| OD-006 | How deep should UI / visualization go? | Defer presentation details | Non-blocking | Implementation |
| OD-007 | What retention policy should older investigations follow? | Defer retention policy | Non-blocking | Implementation |
| OD-008 | What incremental refresh algorithm should Mirror use? | Defer refresh strategy | Non-blocking | Implementation |
| OD-009 | What physical module / package structure should implementation use? | Defer structure to implementation planning | Non-blocking | Implementation |

### 6. Traceability Audit

| Audit Area | Status | Evidence | Finding | Severity | Required Action |
| --- | --- | --- | --- | --- | --- |
| Cross references | PASS | Phase links and traceability sections exist across Phases 1-11 | No broken phase-to-phase references found in the design baseline | None | None |
| Completion criteria | PASS | Every phase has completion criteria; T012 remains the only open task before this section is applied | Completion chain is intact | None | None |
| Invariant references | PASS | Selected invariants exist in each phase and remain versioned | No duplicate IDs found in the selected index | None | None |
| Constitution links | PASS | Constitution is referenced in design rules and traceability sections | Authority hierarchy remains stable | None | None |
| Baseline traceability | PASS | Baseline index and prior characterization evidence are referenced | Traceability path is explicit | None | None |
| Terminology | PASS WITH NOTE | Current design uses Validation Model, Mirror, Debug Manifest, Ralph, and provider terminology consistently | No legacy Debug Ledger wording remains in the design baseline; the legacy Open Decisions blocks are intentionally preserved as historical notes | Minor | Keep the legacy note until final review |
| Derived-artifact wording | PASS | Mirror and Debug Manifest are described as derived / read-only | Derived artifacts are not treated as truth | None | None |
| Authority wording | PASS | Canonical Knowledge remains the only source of truth | No second authority layer introduced | None | None |
| Open Decisions format | PASS WITH NOTE | Phases 1-5 remain historical legacy notes; later phases use the structured form | Legacy notes are preserved, not rewritten | Minor | Keep the structured-format note for final review |
| Final review gate | PASS WITH NOTE | Final Architecture Review remains separate from implementation kickoff | Final review can still block implementation if Major or Critical contradictions are found | Minor | Preserve mandatory final review |

### 7. Implementation Package Map

Recommended wave order is a planning aid, not a strict rule:

- Wave 1: Package A, Package B;
- Wave 2: Package C, Package D;
- Wave 3: Package E, Package F;
- Wave 4: Package G, Package H;
- Wave 5: Package I;
- Wave 6: Package J, Package K;
- Wave 7: Package L.

| Package | Purpose | Architectural Inputs | Outputs | Hard Dependencies | Soft Dependencies | Can Start Independently | Readiness Condition | Major Open Decisions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A - Identity and Canonical Registry | stable identity and registry authority | Constitution, Phase 1 | canonical IDs, registry rules | none | traceability index | Yes | identity rules frozen | storage / serialization |
| B - Knowledge Storage and Lifecycle | store lifecycle-managed canonical knowledge | A, Phase 2, Phase 5 | lifecycle-backed canonical store | A | traceability, validation | Partially | lifecycle states stable | retention, storage model |
| C - Brain Engine Core and Component Contracts | core reasoning and boundaries | A, B, Phase 3, Phase 4 | component contracts, execution boundary | A, B | traceability, validation | Partially | component roles fixed | internal orchestration detail |
| D - Context Building and Knowledge Resolution | assemble context from canonical sources | A, B, C | frozen context packages | A, B, C | mirror, debug memory | Partially | context contract fixed | handoff envelope |
| E - Generation Pipeline | deterministic generation flow | C, D, Phase 6 | candidate outputs, attempt records | C, D | validation | Partially | reproducibility rules fixed | attempt metadata, provider routing |
| F - Validation Engine | fail-closed validation and publication gating | A, B, C, E, Phase 7 | validation reports, publish/block decisions | A, E | mirror, debug memory | Partially | validation model frozen | validator storage, severity mapping |
| G - Mirror Generation and Refresh | read-only navigation projection | A, C, E, F, Phase 8 | Mirror snapshots | F | debug memory, workflows | Partially | source traceability fixed | refresh / partitioning |
| H - Debug Manifest and Investigation Memory | structured investigation memory | A, F, G, Phase 9 | derived manifest entries | F, G | agents, workflows | Partially | investigation model frozen | search, retention |
| I - Agent and Provider Orchestration | execution/review boundary and provider interchangeability | A, C, F, G, H, Phase 10 | context packages, review envelopes, orchestration decisions | C, F, H | mirror | Partially | provider-agnostic boundary fixed | consensus, exact handoff |
| J - Operational Workflow Coordination | daily workflows across the system | I, F, G, H, Phase 11 | workflow templates, workflow outcomes | I, F | mirror, debug memory | Partially | workflow template fixed | workflow packaging |
| K - Publication and Governance | canonical update and governance gating | F, J | publication approvals, governance records | F, J | traceability | Partially | publication flow fixed | governance envelope |
| L - Observability and Failure Reporting | cross-cutting reporting of failures and recovery | F, G, H, I, J, K | failure reports, recovery evidence | F, J | mirror, debug memory | Partially | failure categories stable | report schema |

### 8. Final Completion Statement

Feature 003 design is complete and ready for Final Architecture Review.

- Feature ID: Feature 003 - Project Brain Design
- Completed phases: Phase 1 through Phase 12
- Architecture readiness status: DESIGN READY WITH DECLARED GAPS
- Architecture-level blocking gaps: none
- Intentionally deferred implementation decisions: serialization format, storage implementation, provider selection algorithm, consensus strategy, exact handoff envelope, UI / visualization, retention policy, incremental refresh algorithm, physical module / package structure
- Final review requirement: Final Architecture Review remains mandatory before implementation kickoff and may block if Major or Critical inconsistencies remain
- Implementation start recommendation: implementation may begin only after the final review confirms that no Major or Critical inconsistencies remain
## Design Rules

### DESIGN-RULE-001
The Design Document is subordinate to the approved Architecture Specification.

It may refine architecture.

It may not redefine architecture.

### DESIGN-RULE-002
Every technical decision must be traceable to one or more architectural principles.

If a technical decision cannot be justified by the approved architecture, it must be proposed through an RFC instead of silently extending the design.

### DESIGN-RULE-003
The Design Document specifies contracts, responsibilities, interfaces, lifecycles and validation rules.

It does not prescribe implementation details unless they are required to preserve architectural invariants.

Legacy note: the Open Decisions blocks in Phases 1-5 are historical design
notes. Beginning with Phase 6, open decisions use the structured format
Decision ID / Question / Recommended Direction / Blocking Status / Target
Phase. A full normalization pass will be performed later during the final
Architecture Consistency Review.

## Definition of Done

The Design Phase is complete when:
- every architectural component has a technical contract;
- every lifecycle is fully specified;
- every interface between components is described;
- every data model is defined;
- every validation mechanism is defined;
- every error mode has a handling strategy;
- every generated artifact has a deterministic production path;
- every design decision is traceable to the approved Architecture Specification.

## Required Inputs

The Design Phase consumes:
- `Repository Constitution`;
- `Project Brain Architecture Specification v1.0`;
- approved RFCs that affect design scope.

## Phase Guidance

Architecture answers: "What the system is."

Design answers: "How the architecture is realized."

Implementation answers: "How the design is built."

Verification answers: "How compliance is proven."

## Process Rule

### PROCESS-RULE-001
Every engineering phase consumes the approved artifacts of the previous phase.

No phase may redefine its inputs.

It may only refine them.

## Future Architecture Notes - Multi Provider Execution

This is a future design note for Phase 10. It does not define runtime behavior,
implementation classes, adapter code, API surfaces, or production wiring. It
records architectural intent so that the later AI Agent Orchestration work can
remain provider-agnostic.

### 1. Execution Provider Abstraction

Project Brain must not depend on a single AI model or a single provider.

All AI providers are treated as interchangeable execution providers.

Examples of future providers may include:

- Codex
- OpenRouter
- future providers not yet chosen

Brain Engine behavior must stay the same regardless of which provider is
selected. Provider choice changes execution strategy, not canonical authority.

### 2. Provider Router

A future Execution Provider Router may choose a provider by evaluating:

- task requirements;
- required capabilities;
- cost;
- limits;
- availability;
- user preferences.

The router is a selection layer, not a truth layer. It chooses a provider, but
it must not alter canonical knowledge, design authority, or repository truth.

### 3. User Choice

Future UX may ask the user which execution mode to use before a complex task
runs:

- Codex
- OpenRouter
- Automatic

This choice is a routing preference, not a change to canonical authority.

### 4. OpenRouter Support

Future architecture should support capability-based routing through
OpenRouter-like providers, including:

- free coding models;
- fallback between free models;
- automatic switching on rate limits;
- automatic switching on provider unavailability.

The design note does not fix specific model names. It only records that routing
must be capability-based and resilient to provider failure.

### 5. Independent Review

The future architecture should allow the implementation provider and the review
provider to be different.

Example:

- Implementation provider: Codex
- Review provider: OpenRouter

or the reverse.

The point is to reduce correlated mistakes by separating execution from review
when the workflow allows it.

### 5.1 Multi-Provider Review Council

Future Project Brain architecture may support a review council composed of
multiple independent AI providers.

Example future shape:

- Implementation: Codex
- Review Council:
  - GPT
  - Claude
  - Gemini
  - Qwen
  - DeepSeek
  - other providers as needed

Each review provider may return one of the same future review outcomes:

- APPROVED
- APPROVED_WITH_CONDITIONS
- REJECTED
- NEEDS_MORE_EVIDENCE

The execution provider does not have to be part of the review council.

Design considerations:

- review may be performed by one provider;
- review may be performed by several providers at the same time;
- Brain Engine must not assume a specific model exists;
- the council must be provider-agnostic;
- the council is not a source of truth;
- final authority remains with Canonical Knowledge and governance.

### 5.2 Review Consensus

This note does not define a consensus algorithm.

Possible future strategies include:

- single reviewer
- majority
- unanimous
- weighted review
- human override

The consensus algorithm is intentionally left undefined for now and will be
designed later as part of the future Phase 10 architecture work.

### 6. Review Workflow

Future orchestration should support an independent review loop:

1. Agent investigates the problem.
2. Agent prepares a short summary containing:
   - root cause found;
   - proposed fix;
   - files to change;
   - risks.
3. Summary is sent for independent review.
4. Review returns one of:
   - APPROVED
   - APPROVED_WITH_CONDITIONS
   - REJECTED
   - NEEDS_MORE_EVIDENCE
5. Only after an acceptable review result does the agent continue with the
   change.

This workflow is intended for future Phase 10 orchestration. It is not a
runtime behavior requirement in the current design phase.

### 7. Completion Review

After a change is completed, future orchestration should support a secondary
review report containing:

- original cause;
- final fix;
- changed files;
- checks performed;
- remaining risks;
- diff summary.

This is a review workflow concept, not a production artifact definition.

### 8. Provider Independence Invariants

Future architecture should preserve the following invariants:

- Project Brain must not depend on a single AI provider.
- A provider can be replaced without changing Brain Engine authority rules.
- Context assembly must not depend on provider identity.
- A provider must never become a source of truth.
- Canonical Knowledge remains the authority regardless of provider.
- Review provider may differ from implementation provider.
- Project Brain must support any number of execution providers and review
  providers without changing Brain Engine Architecture.

### 9. Scope

This is a future architecture goal for Phase 10.

It does not introduce runtime changes.
It does not introduce new adapters.
It does not define APIs.
It does not define model-specific implementation details.
It does not change Phase 1 through Phase 5.

## End of Design Note
