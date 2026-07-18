# Project Brain Implementation Plan v1.0

> This document converts the approved Project Brain architecture and completed
> design into an implementation roadmap.
>
> Architecture is frozen. This plan does not reopen architecture, redesign
> components, or define production code.

## 1. Purpose and Scope

This plan defines the implementation sequence for Feature 003 using the frozen
architecture and the approved design baseline as its inputs.

It covers:

- implementation packages;
- package responsibilities;
- package dependencies;
- implementation waves;
- package interfaces;
- readiness criteria;
- testing strategy;
- rollout order;
- migration strategy;
- implementation risks;
- implementation checkpoints.

It does not cover:

- new architecture;
- new components;
- new phases;
- runtime code;
- production classes;
- API implementation;
- provider-specific implementation choices that would change the architecture.

## 2. Frozen Inputs

The implementation roadmap is subordinate to these approved inputs:

- `.specify/memory/constitution.md`;
- `specs/003-project-brain-design/design.md`;
- `specs/003-project-brain-design/canonicalization-decision.md`;
- `specs/003-project-brain-design/design-input-audit.md`;
- `specs/_baseline/00-project-overview.md` through `specs/_baseline/17-traceability-index.md`;
- `tests/characterization/traceability.md`;
- `tests/characterization/reports/final.md`;
- `graphify-out/*` as navigation only.

## 3. Implementation Principles

- Implement the frozen architecture, not a new one.
- Preserve canonical authority and derived-only views.
- Keep provider identity non-authoritative.
- Keep validation fail-closed.
- Preserve traceability for every package and wave.
- Prefer small, reversible slices.
- Do not introduce new truth sources.
- Do not let implementation convenience redefine architecture.

## 4. Implementation Packages

The package names and dependency order come directly from the approved design
package map. The roadmap does not introduce new packages.

| Package | Responsibility | Hard Dependencies | Package Interface | Readiness Criteria | Primary Test Focus |
| --- | --- | --- | --- | --- | --- |
| A - Identity and Canonical Registry | Stable artifact identity, reference resolution, registry authority, and canonical row metadata. | None | Registry contract | Identity rules frozen; canonical registry shape fixed; supersession and broken-reference behavior defined. | Identity stability, rename safety, broken-reference handling. |
| B - Knowledge Storage and Lifecycle | Canonical storage plus lifecycle-managed freshness, supersession, rejection, and derived/canonical status transitions. | A | Lifecycle contract | State machine and freshness policy frozen; storage model scoped to the approved design. | State transitions, stale handling, supersession, rejection paths. |
| C - Brain Engine Core and Component Contracts | Core reasoning boundary, intake, context planning, policy gate, result classification, and traceability recording. | A, B | Engine boundary contract | Component roles fixed; caller-owned context boundary clear; authority gate defined. | Authority gating, boundary checks, traceability capture. |
| D - Context Building and Knowledge Resolution | Assemble frozen context packages from canonical sources and preserve provenance and exclusions. | A, B, C | Context package contract | Context envelope fixed; resolution behavior and provenance expectations frozen. | Context freezing, exclusion visibility, missing-reference failure. |
| E - Generation Pipeline | Deterministic generation attempts, output normalization, and attempt identity. | C, D | Generation attempt contract | Reproducibility rules fixed; attempt metadata shape fixed. | Determinism, partial failures, attempt identity stability. |
| F - Validation Engine | Schema, reference, freshness, traceability, and architecture-compliance validation plus publication gating. | A, B, C, E | Validation report contract | Validation model frozen; severity mapping and blocking rules fixed. | Fail-closed validation, blocked publication, observable errors. |
| G - Mirror Generation and Refresh | Read-only navigation projection, incremental refresh, and source traceability. | A, C, E, F | Derived snapshot contract | Source traceability fixed; freshness rules fixed; refresh scope defined. | Stale snapshot blocking, refresh correctness, derived-only enforcement. |
| H - Debug Manifest and Investigation Memory | Structured investigation memory for hypotheses, evidence, root cause, resolution, and learning memory. | A, F, G | Investigation record contract | Investigation model frozen; retention and publication rules approved. | Evidence traceability, read-only investigation memory, publication gating. |
| I - Agent and Provider Orchestration | Execution/review boundaries, provider routing, independent review, and provider-agnostic handoff. | C, F, H | Orchestration envelope contract | Provider independence fixed; review boundaries fixed; handoff envelope defined. | Provider swap safety, review independence, authority separation. |
| J - Operational Workflow Coordination | Repository investigation, bug work, feature work, refresh, compliance checks, and workflow packaging. | I, F, G, H | Workflow template contract | Workflow template fixed; validation and review checkpoints stable. | Workflow consistency, checkpoint enforcement, failure recovery. |
| K - Publication and Governance | Canonical publication gating, approval records, and governance history. | F, J | Governance record contract | Publication flow fixed; governance envelope fixed. | Publish/block decisions, approval records, canonical-only updates. |
| L - Observability and Failure Reporting | Cross-cutting failure reports, recovery evidence, and audit trails. | F, G, H, I, J, K | Failure report contract | Report schema fixed; observable failure taxonomy agreed. | Error visibility, recovery evidence, no silent drops. |

## 5. Package Interfaces

The implementation packages share a small set of interface families:

- Registry contract: artifact identity, authority metadata, supersession, and
  reference resolution.
- Lifecycle contract: state transitions, freshness, rejection, and derived
  promotion rules.
- Engine boundary contract: request intake, context selection, authority gate,
  classification, and traceability capture.
- Context package contract: frozen inputs, selected sources, excluded sources,
  and provenance.
- Generation attempt contract: attempt identity, deterministic output, and
  partial-failure reporting.
- Validation report contract: schema checks, reference checks, freshness
  checks, traceability checks, and publication gating.
- Derived snapshot contract: Mirror snapshots and other read-only derived
  outputs.
- Investigation record contract: evidence, hypotheses, root cause, and
  resolution memory.
- Orchestration envelope contract: execution/review envelopes and provider
  routing decisions.
- Workflow template contract: repeatable workflow shape, checkpoints, and
  outcome records.
- Governance record contract: approval, publication, and canonical update
  records.
- Failure report contract: blocking reasons, recovery evidence, and audit
  details.

## 6. Implementation Waves and Rollout Order

Wave order is sequential. Packages inside a wave are grouped for planning
clarity, but hard dependencies still control the actual start order.

| Wave | Packages | Why this wave exists | Exit Criteria |
| --- | --- | --- | --- |
| 1 | A, then B | Establish identity and lifecycle authority before any reasoning or storage work depends on it. | Canonical identity and lifecycle transitions are deterministic and traceable. |
| 2 | C, then D | Build the engine boundary and the context assembly contract on top of canonical identity. | Engine ownership and context freezing are explicit and fail closed. |
| 3 | E, then F | Establish deterministic generation before validation gates publication. | Generation is reproducible and validation blocks unsafe or stale outputs. |
| 4 | G, then H | Produce the read-only derived views and the investigation memory after validation is stable. | Mirror and Debug Manifest stay derived, read-only, and source-traceable. |
| 5 | I | Add provider-agnostic orchestration only after the engine, validation, and investigation boundaries are stable. | Execution and review remain separated; provider identity is never authority. |
| 6 | J, then K | Turn the orchestration boundary into repeatable workflows and governance records. | Workflows, approvals, and canonical publication follow one documented path. |
| 7 | L | Add cross-cutting observability after the core workflows and governance paths are stable. | Failure reporting and recovery evidence are comprehensive and observable. |

Rollout order follows the wave order above. No later wave should begin until the
previous wave has met its exit criteria and its traceability evidence is
complete.

## 7. Readiness Criteria

An implementation package is ready when all of the following are true:

- its architectural input is frozen in the approved design;
- its hard dependencies have completed their own readiness gates;
- its package interface is written down and traceable to the design;
- its failure behavior is defined and observable;
- its verification strategy is known;
- any implementation-level open decision for the package is explicitly marked
  as deferred or resolved.

Package-specific readiness notes:

- A: identity rules and registry roles are frozen.
- B: lifecycle states and storage boundaries are frozen.
- C: component roles and caller-owned context are frozen.
- D: context freezing and provenance requirements are frozen.
- E: generation attempt identity and determinism rules are frozen.
- F: validation layers and publication gating are frozen.
- G: source traceability and freshness rules are frozen.
- H: investigation model and retention boundaries are frozen.
- I: provider-agnostic routing and review boundaries are frozen.
- J: workflow template and checkpoint rules are frozen.
- K: publication and governance records are frozen.
- L: report schema and failure taxonomy are frozen.

## 8. Testing Strategy

The implementation strategy is test-first at the package and wave level.

### Package-level tests

- A/B: identity stability, reference resolution, lifecycle transitions, and
  stale/superseded handling.
- C/D: authority gates, context freezing, provenance, and missing-reference
  failure behavior.
- E/F: deterministic generation, partial failure reporting, schema validation,
  freshness validation, and publish/block decisions.
- G/H: derived-view freshness, read-only snapshots, investigation traceability,
  and publication gating.
- I: provider independence, review independence, and orchestration boundaries.
- J/K: workflow checkpoint enforcement, approval flow, canonical publication,
  and governance records.
- L: observable failures, recovery evidence, and audit completeness.

### Wave-level tests

Each wave must prove:

- the new package(s) obey the frozen architecture;
- earlier waves still pass unchanged;
- no package becomes a second source of truth;
- derived artifacts remain derived;
- validation still fails closed;
- traceability still reaches canonical inputs.

### Cross-cutting checks

- diff hygiene and formatting checks;
- repository health checks required by the repo;
- characterization evidence remains stable where relevant;
- no package introduces silent authority drift.

## 9. Migration Strategy

Implementation migration is incremental, not big-bang.

- Introduce packages in wave order only.
- Keep compatibility until a package has proved its replacement path.
- Do not migrate canonical authority into derived views.
- Treat storage or serialization changes as explicit migration work, not as an
  incidental refactor.
- Keep old and new derived outputs side-by-side until equivalence is proven.
- Preserve rollback paths at each wave boundary.
- Any change that affects saved or authoritative data must be isolated behind a
  migration note and a verification gate.

Migration implications by package family:

- A/B: identity and lifecycle changes must preserve canonical references.
- E/F: generation and validation changes must preserve reproducibility and
  fail-closed behavior.
- G/H: derived views can be regenerated; they are not authoritative state.
- I/J/K: orchestration and governance changes must not alter source of truth.
- L: observability changes must not change product behavior.

## 10. Implementation Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Authority drift | A derived or provider-generated artifact starts acting like truth. | Keep canonical authority explicit and gate every derived output. |
| Package overlap | Two packages claim the same responsibility. | Keep the package map and interface boundaries stable. |
| Provider coupling | Execution logic becomes tied to one provider. | Preserve provider-agnostic orchestration boundaries. |
| Stale derived output | Mirror or Debug Manifest becomes outdated. | Require freshness checks and regeneration gates. |
| Traceability loss | A result cannot be traced back to canonical inputs. | Make traceability part of every package interface and test. |
| Migration coupling | A storage or schema change spreads beyond its wave. | Require explicit migration notes and rollback criteria. |
| Workflow drift | Workflow templates diverge between scenarios. | Keep the shared workflow template authoritative. |
| Review ambiguity | Review results become advisory noise instead of a gate. | Preserve explicit review statuses and governance records. |

## 11. Implementation Checkpoints

| Checkpoint | What must be true | Stop Condition |
| --- | --- | --- |
| CP-0 Roadmap approval | This implementation plan is accepted as the roadmap. | Any package boundary still needs architectural redesign. |
| CP-1 Wave 1 complete | Identity and lifecycle are stable. | Canonical identity or lifecycle behavior is still ambiguous. |
| CP-2 Wave 2 complete | Engine boundary and context assembly are stable. | Caller-owned context or provenance is not explicit. |
| CP-3 Wave 3 complete | Generation and validation are deterministic and fail closed. | Unsafe or stale output can still pass. |
| CP-4 Wave 4 complete | Mirror and Debug Manifest remain derived and read-only. | A derived view can out-rank canonical knowledge. |
| CP-5 Wave 5 complete | Provider-agnostic orchestration and independent review are stable. | Provider identity influences authority. |
| CP-6 Wave 6 complete | Workflows and governance are repeatable. | Publication or approval bypasses validation. |
| CP-7 Wave 7 complete | Failure reporting is complete and observable. | A failure path is still silent or untraceable. |
| CP-Final Implementation Kickoff | All wave checkpoints are met and final review remains green. | Any Major or Critical inconsistency remains open. |

## 12. Final Completion Criteria

The implementation plan is complete when:

- all packages A through L are mapped to responsibilities and dependencies;
- all waves have explicit exit criteria;
- package interfaces are documented;
- readiness criteria are documented;
- testing strategy is documented;
- migration strategy is documented;
- implementation risks are documented;
- implementation checkpoints are documented;
- the plan remains subordinate to the frozen architecture and design.

## 13. Traceability Note

This roadmap intentionally reuses the package names, wave order, and dependency
direction that were already approved in the design baseline. It does not create
new architecture, new phases, or new truth sources.
