# Project Brain Canonicalization Decision

## 1. Purpose

This document does not create a new architecture.

It assigns canonical roles to existing repository artifacts and records the smallest canonicalization needed to unblock the Design Phase.

It is subordinate to `specs/003-project-brain-design/design.md` and to `.specify/memory/constitution.md`.

The earlier readiness audit is preserved in `specs/003-project-brain-design/design-input-audit.md` as historical evidence; this decision supersedes only the readiness conclusion, not the audit record.

## 2. Current Artifact Inventory

| Required Role | Existing Candidate | Candidate Path | Coverage | Missing Content | Recommendation |
|---|---|---|---|---|---|
| Repository Constitution | `.specify/memory/constitution.md` | `.specify/memory/constitution.md` | COMPLETE | None | ADOPT AS CANONICAL |
| Project Constitution | `.specify/memory/constitution.md` | `.specify/memory/constitution.md` | COMPLETE | No separate project constitution is needed for this stage | ADOPT AS CANONICAL |
| Project Brain Architecture Specification v1.0 | Baseline bundle | `specs/_baseline/00-project-overview.md` through `specs/_baseline/17-traceability-index.md` | PARTIAL | Canonical bundle title and root pointer need to be stated explicitly | ADOPT AS CANONICAL BUNDLE |
| Architecture Phase 2A | Baseline bundle | `specs/_baseline/00-project-overview.md`, `specs/_baseline/01-current-architecture.md` | COMPLETE | None | ADOPT AS CANONICAL BUNDLE |
| Architecture Phase 2B | Baseline bundle | `specs/_baseline/03-state-ownership.md`, `specs/_baseline/04-pocketbase-contracts.md`, `specs/_baseline/09-realtime-sync.md` | COMPLETE | None | ADOPT AS CANONICAL BUNDLE |
| Architecture Phase 2C | Baseline bundle | `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/08-upgrade-system.md` | COMPLETE | None | ADOPT AS CANONICAL BUNDLE |
| Architecture Phase 2D | Baseline bundle | `specs/_baseline/03-state-ownership.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md` | COMPLETE | None | ADOPT AS CANONICAL BUNDLE |
| Architecture Phase 2E | Baseline bundle | `specs/_baseline/12-target-architecture.md`, `specs/_baseline/13-migration-roadmap.md`, `specs/_baseline/14-test-strategy.md`, `specs/_baseline/15-invariants.md`, `specs/_baseline/16-risk-register.md`, `specs/_baseline/17-traceability-index.md` | COMPLETE | None | ADOPT AS CANONICAL BUNDLE |
| Mirror | Graphify navigation set | `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/manifest.json` | COMPLETE | None | KEEP AS DERIVED VIEW |
| Debug Manifest | Evidence / traceability set | `tests/characterization/traceability.md`, `tests/characterization/reports/final.md`, `tests/characterization/fixture-manifest.md` | PARTIAL | No single incident ledger, hypothesis log, or root-cause register is present | EXISTING ARTIFACT CAN BE EXTENDED |
| RFC corpus | Constitution-level governance | `.specify/memory/constitution.md` | PARTIAL | No approved RFC corpus exists yet | DO NOT USE AS SOURCE OF TRUTH |
| Canonical Knowledge Registry | Baseline traceability index | `specs/_baseline/17-traceability-index.md` | PARTIAL | Missing canonical metadata columns for artifact ID, owner, version, freshness, supersedes, and validation mechanism | ADOPT AS CANONICAL |
| Brain Engine Contract | Design-phase contract target | `specs/003-project-brain-design/design.md` | PARTIAL | The technical contract itself is not yet written | ADOPT AS CANONICAL |

## 3. Constitution Decision

Verdict: ONE CONSTITUTION IS SUFFICIENT

`.specify/memory/constitution.md` can serve as the repository constitution and as the project-level admissibility authority for this repository because it already governs evidence, verification, idempotency, save safety, and amendment discipline.

No separate `Project Constitution` file is required for the current Design Phase.

## 4. Architecture Specification Decision

Verdict: BUNDLE REQUIRES NORMALIZATION

The baseline bundle

`specs/_baseline/00-project-overview.md`
through
`specs/_baseline/17-traceability-index.md`

contains the needed purpose, scope, boundaries, components, responsibilities, data flows, ownership, invariants, risks, target architecture, verification strategy, and traceability.

Missing normalization items:

- one canonical bundle name: `Project Brain Architecture Specification v1.0`
- one explicit bundle root reference
- an explicit statement that the listed baseline files are the approved architecture bundle

No content rewrite is required.

## 5. Architecture Phase Mapping

| Phase | Intended Meaning | Existing Files | Coverage | Canonicalization Action |
|---|---|---|---|---|
| 2A | project overview / App.tsx map | `specs/_baseline/00-project-overview.md`, `specs/_baseline/01-current-architecture.md` | COMPLETE | ADOPT AS CANONICAL BUNDLE |
| 2B | PocketBase / realtime | `specs/_baseline/03-state-ownership.md`, `specs/_baseline/04-pocketbase-contracts.md`, `specs/_baseline/09-realtime-sync.md` | COMPLETE | ADOPT AS CANONICAL BUNDLE |
| 2C | timers / construction / production | `specs/_baseline/05-timers-and-processes.md`, `specs/_baseline/06-building-system.md`, `specs/_baseline/07-production-system.md`, `specs/_baseline/08-upgrade-system.md` | COMPLETE | ADOPT AS CANONICAL BUNDLE |
| 2D | state ownership / optimistic UI / errors | `specs/_baseline/03-state-ownership.md`, `specs/_baseline/10-optimistic-ui.md`, `specs/_baseline/11-error-handling.md` | COMPLETE | ADOPT AS CANONICAL BUNDLE |
| 2E | invariants / risks / target architecture | `specs/_baseline/12-target-architecture.md`, `specs/_baseline/13-migration-roadmap.md`, `specs/_baseline/14-test-strategy.md`, `specs/_baseline/15-invariants.md`, `specs/_baseline/16-risk-register.md`, `specs/_baseline/17-traceability-index.md` | COMPLETE | ADOPT AS CANONICAL BUNDLE |

No separate phase files are needed.

## 6. Mirror Decision

Verdict: EXISTING ARTIFACT IS SUFFICIENT

`graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, and `graphify-out/manifest.json` already provide the navigation mirror role for this repository.

They remain derived views only and must not be promoted to truth sources.

## 7. Debug Manifest Decision

Verdict: EXISTING ARTIFACT CAN BE EXTENDED

The current evidence set

- `tests/characterization/traceability.md`
- `tests/characterization/reports/final.md`
- `tests/characterization/fixture-manifest.md`

already covers most of the intended debug-manifest function.

If a future incident ledger is needed, it should extend the existing evidence set instead of duplicating it.

No standalone Debug Manifest is required to unblock the current Design Phase.

## 8. RFC Decision

Verdict: EXISTING ARTIFACT IS SUFFICIENT

`.specify/memory/constitution.md` already defines amendment discipline and future governance expectations.

No separate RFC corpus, index, or template is required before the current Design Phase can proceed.

If an architectural or constitutional change is proposed later, that proposal should create RFC artifacts at that time.

## 9. Canonical Knowledge Registry Decision

Verdict: EXISTING INDEX REQUIRES EXTENSION

`specs/_baseline/17-traceability-index.md` is the best existing seed for the canonical knowledge registry.

It should gain the missing canonical metadata columns rather than spawning a duplicate registry:

- artifact ID
- owner
- version
- freshness timestamp
- supersedes
- derived artifacts
- validation mechanism

`tests/characterization/traceability.md` remains scenario-level evidence, not the canonical registry.

## 10. Brain Engine Contract Decision

Verdict: DESIGN-LEVEL CONTRACT CAN DEFINE IT

The Brain Engine contract belongs in `specs/003-project-brain-design/design.md`.

That section can define responsibility, inputs, outputs, deterministic requirements, freshness handling, failure behavior, validation, and the relationship to canonical knowledge without changing the approved architecture.

No architectural RFC is needed unless the role itself changes.

## 11. Source-of-Truth Conflict Analysis

| Concern | Candidate Sources | Conflict Risk | Recommended Authority |
|---|---|---|---|
| Governance | `.specify/memory/constitution.md` vs any future project constitution | Low if one constitution is used | `.specify/memory/constitution.md` |
| Architecture | Baseline bundle vs the working design draft | Medium if the draft is treated as architecture | Baseline bundle only |
| Traceability | `specs/_baseline/17-traceability-index.md` vs `tests/characterization/traceability.md` | Low if scope stays separate | Architecture traceability index for architecture; scenario traceability for characterization |
| Navigation mirror | `graphify-out/*` vs source files | Low if Graphify stays derived | Graphify as derived view only |
| Debug evidence | `tests/characterization/traceability.md`, `tests/characterization/reports/final.md`, `tests/characterization/fixture-manifest.md` | Low if evidence is not promoted to truth | Derived evidence only |
| Manifest wording | `fixture-manifest.md` vs `graphify-out/manifest.json` | Medium because both use the word manifest | Keep their roles distinct |

The main duplication risk is role confusion, not content duplication.

## 12. Minimum Unblocking Set

1. Treat `.specify/memory/constitution.md` as the shared constitution authority for the repository and the Project Brain work.
2. Treat `specs/_baseline/00-project-overview.md` through `specs/_baseline/17-traceability-index.md` as the canonical architecture bundle.
3. Extend `specs/_baseline/17-traceability-index.md` into the canonical knowledge registry.
4. Keep `graphify-out/*` as derived navigation only.
5. Keep `tests/characterization/traceability.md` and `tests/characterization/reports/final.md` as derived evidence only.
6. Do not create separate RFC, Mirror, or Debug Manifest artifacts yet unless a later change actually needs them.

This is the smallest canonicalization patch needed to let the Design Phase move forward without inventing new architecture.

## 13. Recommended Canonical Layout

- `.specify/memory/constitution.md` - shared constitution
- `specs/_baseline/` - canonical architecture bundle
- `specs/_baseline/17-traceability-index.md` - canonical registry seed
- `specs/003-project-brain-design/design.md` - subordinate design draft
- `specs/003-project-brain-design/design-input-audit.md` - audit record
- `specs/003-project-brain-design/canonicalization-decision.md` - this canonicalization decision
- `graphify-out/*` - derived mirror / navigation only
- `tests/characterization/traceability.md` - scenario traceability view
- `tests/characterization/reports/final.md` - final characterization evidence
- `tests/characterization/fixture-manifest.md` - documentation-only fixture manifest

The current placement of `specs/003-project-brain-design/design.md` is acceptable for this stage.

## 14. Canonicalization Verdict

DESIGN REQUIRES SMALL CANONICALIZATION PATCH

Gap resolution summary:

- GAP-01: CLOSED BY EXISTING ARTIFACT
- GAP-02: CLOSED BY CANONICAL BUNDLE
- GAP-03: NOT ACTUALLY REQUIRED
- GAP-04: CLOSED BY CANONICAL BUNDLE
- GAP-05: CLOSED BY EXISTING ARTIFACT
- GAP-06: EXISTING ARTIFACT CAN BE EXTENDED
- GAP-07: NOT ACTUALLY REQUIRED
- GAP-08: REQUIRES SMALL PATCH

The smallest patch is to normalize the architecture bundle naming and extend the baseline traceability index into a canonical registry.

After that patch, the design readiness target is `DESIGN READY WITH DECLARED GAPS`.

This readiness target supersedes the historical `DESIGN BLOCKED` conclusion in `specs/003-project-brain-design/design-input-audit.md`.

## 15. Process Compliance

1. Read `specs/003-project-brain-design/design-input-audit.md` first.
2. Use only existing repository evidence.
3. Do not change `specs/003-project-brain-design/design.md`.
4. Do not create duplicate baseline documents unless a later RFC or approved design decision requires them.
5. Do not commit.
6. Run:
   - `git diff --check`
   - `git status --short --untracked-files=all`
7. Preserve any existing user changes.

## 16. Final Report

- created file: `specs/003-project-brain-design/canonicalization-decision.md`
- modified files: `specs/003-project-brain-design/canonicalization-decision.md`
- canonicalization verdict: `DESIGN REQUIRES SMALL CANONICALIZATION PATCH`
- design readiness verdict: `DESIGN READY WITH DECLARED GAPS`
- was a new baseline bundle index created: no
- registry entries: 22 source-backed rows in `specs/_baseline/17-traceability-index.md`
- canonical artifacts: 19
- derived artifacts: 4
- verification artifacts: 3
- GAP-01 through GAP-08 post-patch status:
  - GAP-01: CLOSED BY EXISTING ARTIFACT
  - GAP-02: CLOSED BY CANONICAL BUNDLE
  - GAP-03: NOT ACTUALLY REQUIRED
  - GAP-04: CLOSED BY CANONICAL BUNDLE
  - GAP-05: CLOSED BY EXISTING ARTIFACT
  - GAP-06: EXISTING ARTIFACT CAN BE EXTENDED
  - GAP-07: NOT ACTUALLY REQUIRED
  - GAP-08: REQUIRES SMALL PATCH
- minimum unblocking set:
  - Officially describe `specs/_baseline/00-project-overview.md` through `specs/_baseline/17-traceability-index.md` as one canonical architecture bundle.
  - Extend `specs/_baseline/17-traceability-index.md` so it performs the canonical knowledge registry role.
  - Keep `graphify-out/*` as derived navigation only.
  - Keep `tests/characterization/traceability.md` and `tests/characterization/reports/final.md` as derived verification evidence only.
  - Keep `specs/003-project-brain-design/design.md` subordinate and unchanged in this step.
- `git diff --check` result: clean
- full `git status --short --untracked-files=all`:
  - `?? specs/003-project-brain-design/canonicalization-decision.md`
  - `?? specs/003-project-brain-design/design-input-audit.md`
  - `?? specs/003-project-brain-design/design.md`
- confirmation: `specs/003-project-brain-design/design.md` was not changed
