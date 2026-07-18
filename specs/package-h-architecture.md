# Package H — Debug Manifest and Investigation Memory

**Status**: Approved — Ready for Implementation  
**Owner Decisions**: H-DEC-01 through H-DEC-06 accepted 2026-07-18  
**Dependencies**: A (hard), F (hard), G (hard), C (soft), D (soft), E (soft)  
**Wave**: 4  
**Design Source**: `specs/003-project-brain-design/design.md` Phase 9  

---

## 1. Executive Summary

Package H defines the **Debug Manifest**: a derived, read-only engineering memory
that records how the Brain investigated a problem, which hypotheses were tested,
why a decision was reached, and what follow-up remains. It is not a log, not
telemetry, not runtime diagnostics, and not an event stream.

The manifest uses Foundation A (identity), F (validation), and G (mirror) for
identity primitives, validation contracts, diagnostic events, and serialization
patterns. It introduces its own types for investigations, hypotheses, evidence,
root cause, resolution, and learning memory.

Like all Project Brain artifacts, the Debug Manifest is deterministic,
fail-closed, and immutable once published. It never becomes a source of truth,
never changes Canonical Knowledge, and never replaces the Mirror.

---

## 2. Goals

1. **Structured investigation memory** — record problem statements, symptoms,
   reproduction steps, hypotheses, evidence, root cause, and resolution.
2. **Hypothesis and evidence traceability** — every hypothesis links to evidence;
   every evidence item links back to a repository revision or artifact ID.
3. **Deterministic derivation** — identical inputs produce identical output.
4. **Fail-closed validation** — incomplete investigations, missing evidence,
   broken references, and conflicting evidence prevent publication.
5. **Read-only consumption** — consumed by Brain Engine but never mutated.
6. **Learning memory reuse** — similarity search so the Brain avoids re-testing
   already-failed hypotheses.
7. **Monotonic lifecycle** — OPEN → INVESTIGATING → HYPOTHESIS_FORMED → TESTING
   → VALIDATED → RESOLVED → ARCHIVED/SUPERSEDED.

---

## 3. Non-Goals

1. **Not a log** — no runtime telemetry, stack traces, or debug prints.
2. **Not a source of truth** — derived, never canonical.
3. **Not a Mirror replacement** — references mirror entries, does not duplicate.
4. **Not a Validation replacement** — references validation reports, does not
   replace.
5. **No PocketBase or React coupling** — pure data artifact.
6. **No auto-hypothesis generation** — hypotheses are recorded, not generated.
7. **No retention or compression policy** — deferred (DM-001 through DM-004).

---

## 4. Gap Analysis

### What Foundation A–G Already Covers

| Capability | Package | What it provides | Gap for H |
| --- | --- | --- | --- |
| Artifact identity | A | `ArtifactId`, `ArtifactRevision`, `createArtifactId()` | Covers manifest entry identity. No change needed. |
| Canonical reference resolution | A | `CanonicalRegistry`, `resolveArtifact()` | Covers cross-reference resolution. No change needed. |
| Knowledge artifact lifecycle | B | `createKnowledgeArtifact()`, `freezeArtifact()` | Too generic. H needs investigation-specific lifecycle. |
| Brain state machine | C | `BrainPhase`, `BrainState`, `transitionBrain()` | Reusable pattern, but H needs its own lifecycle states. |
| Context frames | D | `ContextFrame`, `ContextId` | Cross-reference only. H does not manage context. |
| Generation pipeline | E | `GenerationRequest`, `GenerationResult` | Cross-reference generation attempts only. |
| Validation reports | F | `ValidationReport`, `buildValidationReport()` | Reusable for manifest validation plumbing. |
| Mirror snapshots | G | `MirrorSnapshot`, `MirrorNode`, `MirrorEdge` | Derivation source for manifest. No change needed. |
| Mirror diagnostics | G | `MirrorDiagnosticEvent`, `buildMirrorDiagnostics()` | Pattern is directly reusable for manifest diagnostics. |
| Mirror serialization | G | `serializeMirrorSnapshot()`, `loadMirrorSnapshot()` | Pattern is directly reusable. |
| Mirror diff | G | `computeMirrorDiff()` | Reusable for detecting which investigations need refresh. |
| Deterministic hash | E/G | `fnv1a32()` | Reusable for manifest fingerprinting. |

### What Is Missing (Requires Package H)

| Missing Capability | Why Foundation Cannot Cover It |
| --- | --- |
| Investigation model | No package models hypotheses, evidence, root cause, or resolution. |
| Debug Manifest identity | `ArtifactId` is generic; H needs `ManifestIdentity` with investigation-specific fields. |
| Hypothesis–evidence linking | No existing package manages the evidence graph (supporting/contradicting). |
| Evidence traceability | No package enforces that every evidence item has `sourceRevision`. |
| Root cause model | No package separates root cause from hypotheses or resolution. |
| Resolution model | No package tracks rejected alternatives, risks, or follow-up. |
| Learning memory | No package stores cross-investigation patterns or similarity search. |
| Manifest lifecycle | No package defines monotonic OPEN → ... → ARCHIVED state machine. |
| Manifest validation | No package has rules for incomplete investigations, broken refs, or conflicting evidence. |
| Manifest diagnostics | H diagnostics are distinct from mirror or validation diagnostics. |
| Manifest serialization | Serialization format is unique to manifest data. |
| Manifest refresh | Refresh from mirror diff is specific to manifest entries. |
| Fail-closed publication | No package implements the all-ERRORs-block publication gate. |

### Why Not Extend Package G Instead

- Package G owns Mirror (a read-only derived view of artifact graph state).
  Adding investigation memory would mix responsibilities and violate Single
  Source of Truth.
- Mirror invariants forbid mutable state; investigations are inherently
  mutable during their lifecycle.
- Mirror has no hypothesis, evidence, or learning memory concepts.

### Why Not Extend Package F Instead

- Package F owns validation plumbing. Adding investigation storage would
  mix validation logic with memory.
- Validation is about correctness; investigation is about explanation.
- Fail-closed for validation (all ERRORs block) differs in detail from
  fail-closed for manifest (WARN allowed for hypotheses without evidence).

---

## 5. Alternative Designs Considered

### Option A (Chosen): Package H as Standalone Debug Manifest

**Structure**: 7 new files, new types, imports from A/F/G only.  
**Data model**: `ManifestSnapshot` → `ManifestEntry` → `Investigation` →
`Hypothesis` / `EvidenceItem` / `RootCause` / `Resolution`.  
**Lifecycle**: Monotonic state machine, deterministic derivation, fail-closed
validation.  

**Rationale for choosing**:
- Cleanest separation of concerns — Debug Manifest is a genuinely new domain.
- Zero changes to A–G (constitution requirement).
- Reuses patterns (diagnostics, serialization, validation) without coupling.
- Learning memory is a natural extension of the investigation model.

### Option B: Debug Manifest as a Mirror Extension

**Approach**: Add investigation fields to `MirrorNode`, new investigation
collections in `MirrorSnapshot`, extend `MirrorDiagnosticEvent` with
investigation codes.

**Rejected because**:
- BREAKS Mirror invariants — Mirror is a derived view of artifact graph state,
  not an investigation log.
- Mirror's `nodes` and `edges` are about artifact relationships, not
  hypotheses or evidence.
- Adding mutable investigation lifecycle to Mirror's read-only model would
  require a second state store anyway.
- No clean place for learning memory or similarity search.

### Option C: Debug Manifest as a Brain Engine Plugin

**Approach**: Register investigation lifecycle as `BrainPhase` extensions,
store investigation state in `BrainState`, dispatch `BrainEvent` for each
hypothesis.

**Rejected because**:
- Brain Engine manages generation planning, not investigation memory.
- Tying investigation lifecycle to brain phases would force monotonicity to
  match brain transitions — they are not the same.
- No natural home for learning memory in the brain state machine.
- Would create circular dependency: Brain Engine → investigations →
  generation → Brain Engine.

### Option D: Debug Manifest as a Validation Extension

**Approach**: Add investigation rules to Package F's validation engine,
store investigation results as `ValidationReport` extensions.

**Rejected because**:
- Validation is about *correctness* (is the artifact valid?); investigation is
  about *explanation* (why did this fail?).
- A `ValidationReport` already has a fixed structure; adding hypotheses and
  evidence would require a new report type, effectively creating Package H
  anyway.
- No model for root cause, resolution, learning memory, or evidence graph.

### 5.7. Architecture Decision Record (ADR-001) — Standalone Debug Manifest

#### Decision

Adopt **Package H as a standalone Debug Manifest** — 7 new source files, 8 new test
files, new types defined in Package H, imports from A/F/G only, no changes to
existing Foundation.

#### Context

The Debug Manifest is a derived, read-only engineering memory of investigations.
It stores hypotheses, evidence, root cause, resolution, and learning memory.
No existing Package A–G covers this domain:

- A (identity) provides IDs but no investigation model.
- F (validation) provides validation plumbing but no investigation concepts.
- G (mirror) provides a derived view of artifact graph state, not investigation
  memory.
- B/C/D/E are even further from the domain (knowledge lifecycle, brain planning,
  context frames, generation pipeline).

The question was: should this new domain live in a new package, or be folded into
an existing one?

#### Assumptions

This decision relies on the following assumptions. If any becomes invalid, the
ADR must be revisited.

##### Architectural Assumptions

These assumptions are considered invariant for this ADR.

- Foundation Packages A–G are considered complete and immutable for the
  purpose of this ADR.
- Package H integrates exclusively through the public contracts of Packages A–G.
- Package H relies exclusively on the public contracts exposed by Package G
  for mirror-related functionality.
- Package H does not require modifications to Foundation packages.
- Package H introduces no new runtime dependencies outside the established
  architecture.
- Equivalent inputs are expected to produce equivalent outputs under
  deterministic execution.
- Deterministic Pipeline, Fail Closed, Single Source of Truth, Immutable
  Foundation, and Public Contracts Only remain mandatory architectural
  principles.

##### Project Assumptions

These assumptions describe the expected project evolution.

- Package H is implemented before Packages I–N.
- Future packages build on Package H rather than bypassing it.
- No alternative orchestration layer is introduced in parallel.
- Existing test infrastructure and regression suite remain available for
  Package H validation.

#### Assumption Validation

Each assumption has a validation method, frequency, owner, invalidation trigger,
and required reaction. If validation reveals a violation, the ADR must be
revisited.

| ID | Assumption | Validation | Frequency | Owner | Invalidation Trigger | Reaction |
| --- | --- | --- | --- | --- | --- | --- |
| AV-01 | Foundation A–G are complete and immutable for the purpose of this ADR. | `git log --oneline` shows no new commits modifying `src/project-brain/*.ts` (excluding index.ts). | Before each implementation step. | Implementer. | A new commit modifies any A–G source file. | Stop implementation. Escalate to owner. Revisit ADR. |
| AV-02 | Package H integrates exclusively through public contracts of A–G. | Code review confirms all imports resolve to `export`ed symbols from A–G `index.ts` re-exports. | Every code review. | Reviewer. | An import references a non-exported symbol or internal module path. | Reject PR. Correct import. |
| AV-03 | Package H relies exclusively on G's public contracts for mirror functionality. | Same as AV-02, scoped to `mirror-*.ts` exports. | Every code review. | Reviewer. | An import references a private G symbol or non-mirror file. | Reject PR. Correct import. |
| AV-04 | Package H does not modify Foundation packages. | `git diff --name-only` against Foundation baseline shows no A–G files changed. | Before each implementation commit. | Implementer. | A Foundation file appears in diff. | Drop the change. Escalate to owner. Revisit ADR. |
| AV-05 | Package H introduces no new runtime dependencies. | `package.json` diff shows no new dependencies. `import` statements reference only built-in Node modules or existing project modules. | Every PR. | Reviewer. | New npm package or external module imported. | Reject PR. Remove dependency. Escalate. |
| AV-06 | Equivalent inputs produce equivalent outputs under deterministic execution. | Determinism tests: same inputs → same fingerprint (see section 10, test strategy). | Every test run. | CI / implementer. | Determinism test fails. | Block release. Fix non-determinism source. Escalate. |
| AV-07 | Architectural principles remain mandatory. | Code review against each principle: Single Source of Truth, Fail Closed, Deterministic Pipeline, Immutable Foundation, Public Contracts Only. | Every code review. | Reviewer. | A change violates a principle (e.g., two packages claim same truth, or pipeline allows partial output after ERROR). | Reject PR. Escalate to owner. Revisit ADR. |
| AV-08 | Package H is implemented before Packages I–N. | No Package I–N source files exist in `src/project-brain/`. | At each implementation milestone. | Implementer. | I–N implementation starts before H is complete and passing all tests. | Pause I–N. Complete H first. Escalate. |
| AV-09 | Future packages build on H rather than bypassing it. | Code review confirms I–N consume H's public API, not reimplementing investigation memory. | Every I–N code review. | Reviewer. | I–N duplicates H types or bypasses H's validation. | Reject PR. Escalate to owner. Revisit ADR. |
| AV-10 | No alternative orchestration layer is introduced in parallel. | No new orchestration files outside `src/project-brain/index.ts` that duplicate H's flow. | Spot check per milestone. | Tech lead. | A second orchestration point for debug manifest appears. | Escalate to owner. Consolidate or revisit ADR. |
| AV-11 | Existing test and regression infrastructure remains available. | `node tests/project-brain/*.mjs` and `node check_regressions_worker6.mjs` continue to run. | Every CI run. | CI. | A Foundation test breaks due to H changes, or regression script is removed. | Fix regression. Escalate if regression is in Foundation. |

#### Alternatives Considered

| # | Alternative | Advantages | Disadvantages | Verdict |
| --- | --- | --- | --- | --- |
| B | Mirror Extension | Fewer new files. Reuses mirror snapshot structure. | BREAKS Mirror invariants (Mirror is read-only artifact graph view, not investigation log). No home for learning memory. Mutable lifecycle conflicts with Mirror's read-only model. | **Rejected** — invariants violation. |
| C | Brain Engine Plugin | Reuses brain phase state machine. Natural if investigations mirror brain planning. | Brain Engine manages generation, not investigation memory. Lifecycle states are incompatible. Creates circular dependency (Brain → investigations → generation → Brain). No home for evidence graph. | **Rejected** — circular dependency and domain mismatch. |
| D | Validation Extension | Reuses validation reports and rules engine. | Validation is about *correctness*, investigation is about *explanation*. Would require new report type anyway (effectively a new package). No root cause, resolution, or learning memory model. | **Rejected** — domain mismatch. |
| A | **Standalone Package** (chosen) | Clean separation of concerns. Zero changes to A–G. Reuses patterns, not packages. Learning memory is natural extension. | More new files. New validation rules to maintain. | **Accepted** — see rationale below. |

#### Decision Rationale

The standalone design was chosen because it satisfies all five architectural
principles:

1. **Single Source of Truth** — investigation memory is owned by exactly one
   package. No other package claims authority over hypotheses or evidence.
2. **Fail Closed** — Package H defines its own publication gate (all-ERRORs-block).
   No existing validation pipeline needs modification.
3. **Deterministic Pipeline** — manifest derivation is self-contained: same mirror
   + same investigations = same fingerprint. No external state leaks in.
4. **Immutable Foundation** — zero changes to A–G. The index.ts addition is the
   only modification, and it is additive only.
5. **Public Contracts Only** — H imports only public exports from A/F/G. No
   internal implementation coupling.

#### Trade-offs

| What was lost | Why it is acceptable |
| --- | --- |
| Fewer files (7 vs. extending G with 2–3) | File count is not a quality metric. Each file has a single responsibility. |
| Shared validation pipeline | Investigation validation rules are domain-specific. Sharing the pipeline would require generic hooks that neither F nor H needs today. |
| Shared diagnostic pipeline | Mirror diagnostics and manifest diagnostics have different stages and codes. Sharing would make both harder to reason about. |
| Learning memory delegated to G | G has no concept of "similar investigation." Adding it there would break Mirror invariants. |

#### Risks Accepted

| Risk | Why accepted | Mitigation |
| --- | --- | --- |
| HR-01 — Manifest misused as source of truth | Design doc Phase 9 explicitly forbids it. All invariants enforce derived status. | Read-only surface, fail-closed gate, DEBUG-INVARIANT-001/006. |
| HR-02 — Unbounded investigation growth | Not blocking implementation. Retention policy is deferred (DM-003). | Entry count validation, future archival mechanism. |
| HR-06 — Evidence rules too strict | WARN (not ERROR) for hypotheses without evidence. Investigations can proceed with partial data. | Severity mapping allows investigation to continue. |

#### Future Implications

- **Backward-compatible extensions** — new `EvidenceType` values, new
  `ManifestLifecycleState` values, new validation codes can all be added without
  breaking changes. `ManifestIdentity` fields have optional support.
- **Forward-compatible with AI** — per DM-004, the manifest is provider-agnostic
  and read-only. Agent Orchestration can consume it without modification.
- **Packages I–N** — persistence (I), search/visualization (J), AI orchestration (K),
  templates (L), attachments (M), workflow (N) can all layer on top without
  changing H's public API (see section 15 for details).
- **Breaking changes would require**: renaming `ManifestIdentity` fields, changing
  the monotonic lifecycle rules, changing the fingerprint algorithm, removing
  `deepFreeze`.

#### Revisit Criteria

This decision should be revisited if any of the following occur:

- The Debug Manifest specification (design.md Phase 9) is revised in a way that
  changes its fundamental identity model or publication rules.
- A future Package I–N requires capabilities that cannot be implemented without
  violating H's invariants.
- A new requirement emerges that forces the manifest to become a source of truth
  or to mutate Canonical Knowledge (would require RFC-level governance).
- The Foundation (Packages A–G) is unfrozen and a refactor creates a natural home
  for investigation memory. (Currently out of scope — Foundation is frozen.)
- A performance or storage constraint forces inlining manifest data into an
  existing package (unlikely given deferred DM-001–003).

---

## 6. Dependency Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Package H                          │
│              Debug Manifest + Investigation Memory    │
│  ┌──────────┐ ┌──────────┐ ┌──────┐ ┌─────────────┐  │
│  │ manifest │ │manifest- │ │manifest│ │manifest-    │  │
│  │ -core    │ │investig. │ │-valid │ │diagnostics  │  │
│  └────┬─────┘ └────┬─────┘ └───┬───┘ └──────┬──────┘  │
│       │            │           │             │         │
│  ┌────┴────────────┴───────────┴─────────────┴──────┐  │
│  │ manifest-serialization │ manifest-refresh         │  │
│  │ manifest-learning      │                          │  │
│  └────────────────────────┴──────────────────────────┘  │
└──────────────────┬────────────────────────────────┬────-┘
                   │  imports                       │ imports
                   ▼                                ▼
         ┌─────────────────┐              ┌──────────────────┐
         │  Package F       │              │  Package G        │
         │  Validation      │              │  Mirror           │
         │  (Report, Sev,   │              │  (Snapshot, Diff, │
         │   Code, Rules)   │              │   Diagnostics,    │
         └────────┬─────────┘              │   Serialization)  │
                  │ imports                └────────┬──────────┘
                  ▼                                  │ imports
         ┌───────────────────────────────────────────┘
         ▼
┌──────────────────────┐
│  Package A            │
│  Artifact Identity    │
│  Canonical Registry   │
└──────────────────────┘

Soft dependencies (import when available, never required):
┌──────────┐  ┌──────────┐  ┌──────────┐
│Package C │  │Package D │  │Package E │
│Brain Eng.│  │Context   │  │Generation│
└──────────┘  └──────────┘  └──────────┘
```

### Data Flow Diagram

```
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│MirrorSnapshot│   │ValidationReport(s)│   │CanonicalRegistry │
│  (from G)    │   │   (from F)        │   │   (from A)       │
└──────┬───────┘   └────────┬─────────┘   └────────┬─────────┘
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  refreshManifestFromMirror()                  │
│  1. Compare previous/current mirror fingerprint              │
│  2. Identify changed nodes/edges                             │
│  3. Mark affected investigations for refresh                 │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              validateManifestEntry() per entry                │
│  1. resolveArtifact() for every cross-reference              │
│  2. Run validation rules                                     │
│  3. Collect diagnostics                                      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                 buildManifestSnapshot()                       │
│  1. Sort entries by identity                                 │
│  2. Build metadata from mirror/validation sources             │
│  3. Compute fingerprint (fnv1a32)                            │
│  4. Deep freeze                                              │
└──────────────────────────┬───────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌─────────────────────┐   ┌─────────────────────────────┐
│  ManifestSnapshot    │   │ serializeManifestSnapshot()  │
│  (immutable)         │   │  → JSON string              │
│  consumed by Brain   │   │  → stored/transmitted       │
└─────────────────────┘   └─────────────────────────────┘
```

---

## 7. Existing APIs Reused from Foundation A–G

Only contracts directly relevant to Package H are listed below. The complete
catalog of A–G public contracts is in Appendix A.

### Package A — Artifact Identity and Canonical Registry (hard dependency)

| Export | Source | How H uses it |
| --- | --- | --- |
| `ArtifactType` | `artifact-identity.ts` | Type-tag manifest artifact identities |
| `ArtifactId` | `artifact-identity.ts` | Identity for `ManifestIdentity`, `Investigation`, `Hypothesis`, `EvidenceItem` |
| `createArtifactId(namespace, slug, seq?)` | `artifact-identity.ts` | Generate IDs for manifest entries |
| `formatArtifactId(id)` / `parseArtifactId(raw)` | `artifact-identity.ts` | Serialize/deserialize manifest IDs |
| `ArtifactRevision` | `artifact-identity.ts` | Revision tracking for manifest entries |
| `CanonicalRegistry` | `canonical-registry.ts` | Resolve cross-references in validation |
| `createRegistry()` | `canonical-registry.ts` | Initialize registry for manifest tests |
| `registerArtifact()` / `resolveArtifact()` | `canonical-registry.ts` | Cross-reference resolution during validation |

### Package F — Validation (hard dependency)

| Export | Source | How H uses it |
| --- | --- | --- |
| `ValidationReport` | `validation-report.ts` | Structural pattern for `ManifestValidationReport` (H defines its own type, not a wrapper) |
| `ValidationSeverity` | `validation-severity.ts` | Pattern for ERROR / WARN severity mapping (H normalizes to `'ERROR' | 'WARN' | 'INFO'`) |
| `ValidationResult` | `validation-result.ts` | Pattern for overall decision and statistics structure |
| `ValidationRule` | `validation-rule.ts` | Pattern for `ManifestValidationRule` interface |
| `ValidationRuleResult` | `validation-rule.ts` | Pattern for `ManifestValidationRuleResult` |
| `buildValidationReport(input)` | `validation-engine.ts` | Pipeline pattern only — H uses its own `validateManifestEntry()` |

### Package G — Mirror (hard dependency)

| Export | Source | How H uses it |
| --- | --- | --- |
| `MirrorSnapshot` | `mirror-core.ts` | Derivation source for manifest refresh |
| `MirrorIdentity` | `mirror-core.ts` | Cross-reference from manifest entries |
| `MirrorNode`, `MirrorEdge` | `mirror-core.ts` | Evidence references |
| `MirrorDiagnosticEvent` | `mirror-diagnostics.ts` | Pattern for `ManifestDiagnosticEvent` |
| `computeMirrorDiff()` | `mirror-diff.ts` | Detect changed investigation targets during refresh |
| `serializeMirrorSnapshot()` | `mirror-serialization.ts` | Pattern for `serializeManifestSnapshot()` |
| `loadMirrorSnapshot()` | `mirror-serialization.ts` | Pattern for `loadManifestSnapshot()` |

### Shared Utilities (from B/E/G)

| Export | Source | How H uses it |
| --- | --- | --- |
| `deepFreeze(obj)` | `knowledge-artifact.ts` | Freeze manifest snapshots |
| `stableStringify(obj)` | `knowledge-artifact.ts` | Deterministic serialization |
| `fnv1a32(input)` | `generation-hash.ts` | Fingerprint computation |

### Soft Dependencies (cross-reference only, never required)

| Package | Types Used | When |
| --- | --- | --- |
| C — Brain Engine | `BrainPhase` | Tag manifest in brain pipeline |
| D — Context | `ContextId` | Reference context frames in investigations |
| E — Generation | `GenerationResult` | Reference generation attempts in investigations |

---

## 8. New Types (Package H Owns)

### Identity and Lifecycle

| Type | Kind | Purpose |
| --- | --- | --- |
| `ManifestIdentity` | interface | Unique identity per investigation with artifact/revision/refs |
| `ManifestLifecycleState` | union | Monotonic state: OPEN → ... → ARCHIVED/SUPERSEDED |
| `ManifestEntryType` | union | ACTIVE / ARCHIVED / SUPERSEDED |

### Investigation Model

| Type | Kind | Purpose |
| --- | --- | --- |
| `Investigation` | interface | Complete investigation: problem, symptoms, hypotheses, evidence, root cause, resolution |
| `Hypothesis` | interface | Proposed explanation with supporting/contradicting evidence refs |
| `HypothesisStatus` | union | PROPOSED / TESTING / SUPPORTED / CONTRADICTED / REJECTED |
| `EvidenceItem` | interface | Traceable observation with type, source revision, artifact ref |
| `EvidenceType` | union | SOURCE_INSPECTION / ARCHITECTURE_REFERENCE / VALIDATION_RESULT / MIRROR_OBSERVATION / etc. |
| `RootCause` | interface | Confirmed root cause with evidence refs, alternatives, uncertainty |
| `RootCauseStatus` | union | PROPOSED / CONFIRMED / REJECTED |
| `Resolution` | interface | Chosen fix with rejected alternatives, risks, follow-up |
| `ResolutionStatus` | union | PROPOSED / APPLIED / VERIFIED / FAILED |

### Snapshot and Metadata

| Type | Kind | Purpose |
| --- | --- | --- |
| `ManifestEntry` | interface | Entry wrapping investigation + diagnostics + validation |
| `ManifestSnapshot` | interface | Full manifest with entries, metadata, fingerprint |
| `ManifestMetadata` | interface | Source mirror/validation fingerprints, entry counts |
| `ManifestSnapshotInput` | interface | Input shape for `buildManifestSnapshot()` |

### Validation and Diagnostics

| Type | Kind | Purpose |
| --- | --- | --- |
| `ManifestValidationCode` | union | MANIFEST_MISSING_IDENTITY / MANIFEST_BROKEN_REFERENCE / etc. |
| `ManifestValidationRule` | interface | Rule with code, severity, validate function |
| `ManifestValidationReport` | interface | Per-entry or per-snapshot validation result (see definition below) |
| `ManifestDiagnosticEvent` | interface | Event with index, stage, severity, code, message |
| `ManifestDiagnosticStage` | union | identity / evidence / hypothesis / rootcause / resolution / validation / serialization / publication |
| `ManifestError` | class | Error with code, severity, entryId |

#### ManifestValidationReport

`ManifestValidationReport` is a standalone type specific to manifest validation.
It does **not** reuse Package F's `ValidationReport` because F's report is
coupled to F's pipeline (it references `ValidationRequest`, `GenerationSession`,
`ContextPackageResult`, etc. — objects that H does not and should not create).

Instead, `ManifestValidationReport` follows the same structural pattern as
F's report but with manifest-specific fields:

```typescript
interface ManifestValidationReport {
  manifestArtifactId: string;
  manifestRevision: string;
  overallDecision: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  executedRules: readonly ManifestValidationRuleResult[];
  entryCount: number;
  errorCount: number;
  warningCount: number;
  fingerprint: string;
}
```

Where `ManifestValidationRuleResult` is:

```typescript
interface ManifestValidationRuleResult {
  ruleId: string;
  code: ManifestValidationCode;
  severity: 'ERROR' | 'WARN';
  message: string;
  entryId?: string;
}
```

Key properties:
- **Read-only**: all fields are frozen after construction.
- **Last-entry semantics**: `manifestArtifactId` and `manifestRevision` identify
  the snapshot or entry being validated.
- **Blocking-error semantics**: `overallDecision === 'BLOCKED'` iff at least
  one rule produced `severity: 'ERROR'`. `'READY_WITH_WARNINGS'` iff no ERRORs
  but at least one WARN. `'READY'` iff all rules passed.
- **Fingerprint**: computed from stable-stringified executed rules (excluding
  `message` text and rule order when order does not affect result).
- **Diagnostics ordering**: rule results sorted by ruleId then code for
  deterministic output.
- **No serialization coupling**: this is a validation result, not a storage
  format. Serialization is handled separately (section 12).

### Serialization and Learning

| Type | Kind | Purpose |
| --- | --- | --- |
| `LearningMemory` | interface | Collection of snapshots + patterns |
| `LearningPattern` | interface | Reusable pattern with outcome, frequency, last observed |
| `SimilarInvestigation` | interface | Investigation match with similarity score (`number`, range 0.0–1.0) |

Full type definitions with all fields: see design doc Phase 9 sections 2–9 and
the detailed definitions in the source files (to be implemented).

---

## 9. Invariants

### Adopted from Design Doc (DEBUG-INVARIANT-001 through 015)

| ID | Invariant |
| --- | --- |
| DEBUG-INVARIANT-001 | Manifest is a DERIVED artifact |
| DEBUG-INVARIANT-002 | Investigation has its own identity |
| DEBUG-INVARIANT-003 | Hypothesis is not a fact |
| DEBUG-INVARIANT-004 | Root Cause requires evidence |
| DEBUG-INVARIANT-005 | Every evidence item has traceability |
| DEBUG-INVARIANT-006 | Manifest is not a source of truth |
| DEBUG-INVARIANT-007 | Manifest does not change Canonical Knowledge |
| DEBUG-INVARIANT-008 | Resolution does not bypass Validation |
| DEBUG-INVARIANT-009 | Failed hypotheses are preserved |
| DEBUG-INVARIANT-010 | Investigation is tied to a repository revision |
| DEBUG-INVARIANT-011 | Superseded investigations preserve history |
| DEBUG-INVARIANT-012 | Debug Manifest does not replace Mirror |
| DEBUG-INVARIANT-013 | Debug Manifest does not replace Validation |
| DEBUG-INVARIANT-014 | Manifest supports reuse of engineering knowledge |
| DEBUG-INVARIANT-015 | Traceability is mandatory for Root Cause |

### Implementation-Level (H-INV-001 through 013)

| ID | Invariant | Enforced by |
| --- | --- | --- |
| H-INV-001 | Every investigation has a unique `ManifestIdentity` | `createManifestIdentity()` |
| H-INV-002 | Every hypothesis must reference at least one evidence item | `validateManifestEntry()` |
| H-INV-003 | Every evidence item must specify `sourceRevision` | `validateManifestEntry()` |
| H-INV-004 | Root cause must reference at least one evidence item | `validateManifestEntry()` |
| H-INV-005 | Resolution must reference at least one validation | `validateManifestEntry()` |
| H-INV-006 | All cross-references must resolve or fail validation | `validateManifestEntry()` |
| H-INV-007 | Lifecycle transitions must be monotonic (forward only) | `transitionManifestLifecycle()` |
| H-INV-008 | Manifest snapshot must be deterministically derived | `buildManifestSnapshot()` |
| H-INV-009 | Published manifest is deeply frozen and immutable | `deepFreeze()` |
| H-INV-010 | Fingerprint changes if any entry content changes | `computeManifestFingerprint()` |
| H-INV-011 | Failed hypotheses are preserved, not deleted | `validateManifestEntry()` |
| H-INV-012 | SUPERSEDED entries preserve the full investigation record | `buildManifestSnapshot()` |
| H-INV-013 | Diagnostic events are append-only within a build | `buildManifestDiagnostics()` |

---

## 10. Determinism Model

### Canonical Pipeline Order

The manifest pipeline is ordered so that no fingerprint is computed on data
that has not passed structural and identity validation. Partial success is
forbidden — either the full snapshot passes validation and is published, or
no fingerprint is emitted.

```
Inputs:
  MirrorSnapshot (from G)
  ValidationReport(s) (from F)
  CanonicalRegistry (from A)
  Investigation data (recorded, not computed)

Pipeline:
   1. Resolve all cross-references via CanonicalRegistry
   2. Parse external input into ManifestSnapshotInput
   3. Structural validation (all required fields present, correct types)
   4. Identity validation (each ManifestIdentity is well-formed)
   5. Detect duplicate identities (same manifestArtifactId + revision)
   6. Fail-closed gate: any ERROR → BLOCKED, no fingerprint or snapshot emitted
   7. Canonical deduplication of equivalent repeated references only where
      explicitly allowed by specification (e.g., same evidenceId referenced
      twice in the same entry)
   8. Canonical sort of entries by identity
   9. Build canonical semantic projection (stable-stringified fields only)
  10. Compute per-entry fingerprints (fnv1a32 over semantic projection)
  11. Build manifest metadata
  12. Compute manifest fingerprint (fnv1a32 over sorted entry fingerprints + metadata)
  13. Append deterministic diagnostics (excluded from fingerprint)
  14. Deep freeze result

Output:
  ManifestSnapshot (identical for identical inputs)
```

### Field Categories and Fingerprint Projection

Fingerprints are computed exclusively from the **canonical semantic projection**.
No wall-clock, audit, or observational metadata enters the fingerprint.

| Category | Includes | Excluded from fingerprint | Reason for exclusion |
| --- | --- | --- | --- |
| **Semantic** | `ManifestIdentity`, problem statement, symptoms, hypothesis descriptions, evidence descriptions, root cause description, resolution description, cross-references, `EvidenceType`, `HypothesisStatus`, `RootCauseStatus`, `ResolutionStatus`, lifecycle state, list of failed hypothesis IDs, affected artifact IDs, contributor/source revision. | — | These define the semantic identity of an investigation. |
| **Metadata** | Source mirror fingerprint, source validation fingerprint, entry counts per type. | — | These describe the snapshot's derivation context. |
| **Audit** | — | `generatedAt`, `Investigation.createdAt`, `Investigation.updatedAt`, `Hypothesis.timestamp`, `EvidenceItem.timestamp`, `ManifestMetadata.generatedAt`, any other wall-clock or sequencing timestamp. | These are observational metadata. They change between runs without semantic difference. They are preserved in serialized output for display/debugging but do not affect identity. |
| **Excluded non-deterministic** | — | Diagnostics (event index, messages), runtime sequence numbers, environment variables, file paths. | These depend on execution order, environment, or timing and would break reproducibility. |

### Fingerprint Rules

- **Fingerprint = `fnv1a32(canonicalSemanticProjection)`** where the
  projection is the stable-stringified subset of semantic + metadata fields
  only.
- **`stableStringify`** (from Package B) guarantees deterministic key order.
- **`fnv1a32`** (from Package E/G) guarantees deterministic hash output.
- **Same semantic content + same metadata → same fingerprint.**
- **Different semantic content → different fingerprint.**
- **Different audit fields → same fingerprint** (identical semantic content).

### Deduplication Rules

- **Duplicate identity with same content**: silent canonicalization is allowed
  only for equivalent repeated references (e.g., the same `evidenceId`
  referenced by two hypotheses). Permitted cases must be explicitly listed in
  the specification.
- **Duplicate identity with conflicting content**: blocking ERROR. Two entries
  with the same `ManifestIdentity` but different semantic fields must be
  rejected. The diagnostic includes both conflicting entries.
- **No silent deduplication of conflicting data.** Manifest entries are never
  merged, overwritten, or collapsed without explicit validation.
- **Deduplication runs before fingerprinting** to ensure that
  canonicalized inputs produce the same fingerprint as non-duplicated inputs.

### Determinism Tests

| Test | Input | Expected |
| --- | --- | --- |
| Same semantics, different timestamps | Two investigations with identical semantic fields but different `createdAt` / `updatedAt` values | **Same fingerprint** |
| Reordered inputs | Same entries in different input order | **Same fingerprint** (stable sort) |
| Changed semantic field | One field value differs (e.g., hypothesis description) | **Different fingerprint** |
| Changed audit-only field | Only `generatedAt` differs | **Same fingerprint** |
| Duplicate with same content | Same entry appears twice in input | **Same fingerprint** as single entry (canonicalized) |
| Duplicate with conflicting content | Same identity, different semantic content | **Blocking ERROR**, no fingerprint emitted |
| Reordered diagnostics | Same diagnostics in different order | **Same fingerprint** (diagnostics excluded)

---

## 11. Validation and Fail-Closed Strategy

### Severity Mapping

| Condition | Severity | Effect |
| --- | --- | --- |
| Missing identity | ERROR | Entry rejected, snapshot blocked |
| Invalid lifecycle state | ERROR | Entry rejected, snapshot blocked |
| Missing problem statement | ERROR | Entry rejected, snapshot blocked |
| Hypothesis with zero evidence refs | WARN | Entry published with warning |
| Evidence without `sourceRevision` | ERROR | Entry rejected, snapshot blocked |
| Root cause without evidence refs | ERROR | Entry rejected, snapshot blocked |
| Resolution without validation ref | WARN | Entry published with warning |
| Broken cross-reference | ERROR | Entry rejected, snapshot blocked |
| Duplicate investigation ID | ERROR | Last-write fails |
| Conflicting evidence | WARN | Entry published with warning |
| Investigation still OPEN/INVESTIGATING | WARN | Entry published, summary reports unresolved |

### Fail-Closed Publication Gate

```
validateAndPublish(snapshot, registry):
  errors = 0
  for each entry:
    report = validateManifestEntry(entry, registry)
    if report has any ERROR: errors++
  if errors > 0: return BLOCKED
  return buildManifestSnapshot(snapshot)
```

- **All-ERRORs-block**: any entry with ERROR prevents publication.
- **WARN-allowed**: entries with WARN-only issues are published with
  diagnostics at WARN severity.
- **Validation report attached** to every published snapshot.

---

## 12. Error and Diagnostic Model

### ManifestError

```typescript
class ManifestError extends Error {
  readonly code: ManifestValidationCode | 'MANIFEST_INTERNAL_ERROR'
    | 'MANIFEST_REFERENCE_ERROR';
  readonly severity: 'ERROR' | 'WARN';
  readonly entryId?: string;
}
```

Factory: `manifestError(message, code, severity, entryId?)`

### Diagnostic Stages

| Stage | Emitted when |
| --- | --- |
| `identity` | After identity assignment |
| `evidence` | After evidence resolution |
| `hypothesis` | After hypothesis validation |
| `rootcause` | After root cause validation |
| `resolution` | After resolution validation |
| `validation` | After full entry validation |
| `serialization` | After serialization |
| `publication` | After publication decision |

### Diagnostic Codes (preliminary)

```
MANIFEST_IDENTITY_ASSIGNED         INFO
MANIFEST_EVIDENCE_RESOLVED        INFO
MANIFEST_EVIDENCE_BROKEN          ERROR
MANIFEST_HYPOTHESIS_VALID         INFO
MANIFEST_HYPOTHESIS_NO_EVIDENCE   WARN
MANIFEST_ROOTCAUSE_CONFIRMED      INFO
MANIFEST_ROOTCAUSE_NO_EVIDENCE    ERROR
MANIFEST_RESOLUTION_APPLIED       INFO
MANIFEST_RESOLUTION_NO_VALIDATION WARN
MANIFEST_VALIDATION_PASSED        INFO
MANIFEST_VALIDATION_BLOCKED       ERROR
MANIFEST_VALIDATION_WARNINGS      WARN
MANIFEST_SERIALIZED               INFO
MANIFEST_PUBLISHED                INFO
MANIFEST_BLOCKED                  ERROR
```

---

## 13. Public Surface

### Files to Create

| File | Exports |
| --- | --- |
| `manifest-core.ts` | `ManifestIdentity`, `ManifestLifecycleState`, `ManifestEntryType`, `ManifestEntry`, `ManifestSnapshot`, `ManifestSnapshotInput`, `ManifestMetadata`, `createManifestIdentity()`, `createManifestEntry()`, `buildManifestSnapshot()`, `transitionManifestLifecycle()`, `computeManifestFingerprint()` |
| `manifest-investigation.ts` | `Hypothesis`, `HypothesisStatus`, `EvidenceItem`, `EvidenceType`, `RootCause`, `RootCauseStatus`, `Resolution`, `ResolutionStatus`, `Investigation`, `createInvestigation()`, `createHypothesis()`, `createEvidenceItem()`, `createRootCause()`, `createResolution()`, `updateInvestigationLifecycle()` |
| `manifest-validation.ts` | `ManifestValidationRule`, `ManifestValidationReport`, `ManifestValidationCode`, `ManifestError`, `manifestError()`, `validateManifestEntry()`, `validateManifestSnapshot()`, `buildManifestValidationRules()`, `aggregateManifestValidations()` |
| `manifest-diagnostics.ts` | `ManifestDiagnosticEvent`, `ManifestDiagnosticStage`, `ManifestDiagnosticSeverity`, `buildManifestDiagnostics()`, `appendManifestDiagnosticEvent()` |
| `manifest-serialization.ts` | `serializeManifestSnapshot()`, `deserializeManifestSnapshot()`, `loadManifestSnapshot()`, `exportManifestSummary()` |
| `manifest-learning.ts` | `LearningMemory`, `LearningPattern`, `SimilarInvestigation`, `LearningResult`, `buildLearningMemory()`, `findSimilarInvestigations()` |
| `manifest-refresh.ts` | `ManifestRefreshInput`, `ManifestRefreshResult`, `ManifestRefreshType`, `refreshManifestFromMirror()`, `detectManifestChanges()` |

### Changes to `src/project-brain/index.ts`

Add these lines:

```
export * from './manifest-core.ts'
export * from './manifest-investigation.ts'
export * from './manifest-validation.ts'
export * from './manifest-diagnostics.ts'
export * from './manifest-serialization.ts'
export * from './manifest-learning.ts'
export * from './manifest-refresh.ts'
```

### Circular Dependency Protection

Package H imports FROM A, F, G only. Nothing in A–G imports from H. Index
re-exports are additive only.

---

## 14. Acceptance Criteria

The Package H design is complete when:

| Criterion | Verification |
| --- | --- |
| AC-01 | All public APIs defined in section 13 are present in the design |
| AC-02 | No cyclic dependencies exist between H and A–G |
| AC-03 | No changes required to Packages A–G (index.ts addition excepted) |
| AC-04 | All 28 invariants (15 design-level + 13 implementation-level) are formalized in validation rules |
| AC-05 | Determinism model is documented (section 10) and testable |
| AC-06 | Fail-closed publication gate is defined (section 11) |
| AC-07 | Test strategy covers unit, integration, and determinism scenarios |
| AC-08 | Diagnostic model mirrors Mirror pattern (section 12) |
| AC-09 | Alternative designs have been evaluated and rejected with rationale (section 5) |
| AC-10 | Gap analysis proves necessity (section 4) |
| AC-11 | Open decisions (DM-001–004) are documented as deferred without blocking implementation |

---

## 15. Migration Impact (Future Packages I–N)

### Anticipated Extensions

| Future need | How H supports it | What would change |
| --- | --- | --- |
| Package I — Investigation Storage | H defines the data model; I would add persistence/retrieval. | No H changes needed. |
| Package J — Investigation Search/Visualization | H's `LearningMemory` and `findSimilarInvestigations()` provide the query surface. | No H changes needed. |
| Package K — AI Agent Orchestration | H remains provider-agnostic and read-only (per DM-004). | No H changes needed. |
| Package L — Investigation Templates | H's `ManifestEntry` and `Investigation` can be extended with template metadata. | New optional fields only. |
| Package M — Investigation Attachments | H's `EvidenceItem` has `sourceFile` and `sourceArtifactId`; attachment refs could be added. | New optional field `attachmentRefs` on `EvidenceItem`. |
| Package N — Investigation Workflow | H's lifecycle states are monotonic; workflow automation could sit on top. | No H changes needed. |

### Stability Guarantees

- `ManifestIdentity.investigationId` and `ManifestIdentity.manifestArtifactId`
  are the primary stable identifiers — they must not change.
- `ManifestLifecycleState` values are closed. Future packages may add new
  states only by extending the union type, never by redefining existing ones.
- `EvidenceType` is extensible — new evidence types can be added to the union.
- `ValidationCode` is extensible — new codes can be added.
- The fail-closed contract (all-ERRORs-block) is permanent.

### What Would Require a Breaking Change

- Removing or renaming any field on `ManifestIdentity`.
- Changing the monotonic lifecycle transition rules.
- Changing the fingerprint algorithm for existing snapshots.
- Changing the `deepFreeze` requirement.

---

## 16. Test Strategy

### Unit Tests

| File | Tests |
| --- | --- |
| `manifest-core-test.mjs` | Identity creation, lifecycle transitions, fingerprint computation, snapshot building, deep freeze, determinism |
| `manifest-investigation-test.mjs` | Investigation creation, hypothesis management, evidence linking, root cause, resolution, lifecycle updates |
| `manifest-validation-test.mjs` | Validation rules, error/warn mapping, broken references, duplicate IDs, incomplete investigations |
| `manifest-diagnostics-test.mjs` | Diagnostic event building, stage ordering, severity codes, append-only |
| `manifest-serialization-test.mjs` | Round-trip serialize/deserialize, format consistency, load with validation |
| `manifest-learning-test.mjs` | Learning memory building, similarity search, pattern matching |
| `manifest-refresh-test.mjs` | Refresh from mirror diff, change detection, stale investigation marking |

### Integration Tests

| File | Tests |
| --- | --- |
| `manifest-integration-test.mjs` | Full pipeline: raw data → validate → build snapshot → serialize; cross-reference resolution; fail-closed (ERROR blocks); determinism (same inputs = same fingerprint); learning memory from multiple snapshots |

### Key Test Assertions

- **Determinism**: `identicalInputs() => identical fingerprint`
- **Fail-closed**: `entryWithError() => BLOCKED`
- **WARN allowed**: `entryWithWarn() => PUBLISHED with diagnostics`
- **Broken reference**: `unresolvableRef() => ERROR`
- **Lifecycle**: `transition(OPEN, 'RESOLVED') => ERROR` (skipping states)
- **Freeze**: `postPublishMutation() => throws`

---

## 17. Risks

| ID | Risk | L | I | Mitigation |
| --- | --- | --- | --- | --- |
| HR-01 | Manifest becomes source of truth through misuse | M | H | DEBUG-INVARIANT-001/006, fail-closed validation, read-only surface |
| HR-02 | Investigation data grows unbounded | M | M | Deferred to DM-003; validate entry count |
| HR-03 | Broken cross-references silently degrade | L | H | ERROR-level for all refs, no soft failures |
| HR-04 | Determinism broken by unordered input | L | H | Stable sort, deterministic fingerprint |
| HR-05 | Learning memory creates false similarity | L | M | SimilarityScore is advisory only |
| HR-06 | Hypothesis evidence rules too strict | M | L | WARN (not ERROR) for zero-evidence hypotheses |
| HR-07 | H depends on G → F → A (chain) | L | L | All three frozen and stable |
| HR-08 | DM-001–004 block implementation | L | M | Deferred: none block the core model |

### Design Failure Modes (from design doc Phase 9 sec 11)

| Failure | Handling |
| --- | --- |
| Incomplete investigation | WARN, published but tagged |
| Missing evidence | WARN or ERROR by context |
| Conflicting evidence | WARN, both items preserved |
| Unresolved root cause | WARN, stays in TESTING |
| Stale investigation | Detected via freshness |
| Superseded investigation | entryType = SUPERSEDED |
| Broken references | ERROR, blocks publication |
| Duplicate investigations | ERROR on second |

---

## 18. Implementation Plan

### Wave 4 Order

```
Step 1: Package G (Mirror) — COMPLETED (dfeaacb)
Step 2: Package H (Debug Manifest) — THIS DOCUMENT
```

### Implementation Steps

| Step | File | Depends On | Risk |
| --- | --- | --- | --- |
| 1 | `manifest-core.ts` | A, G | MEDIUM |
| 2 | `manifest-investigation.ts` | A | MEDIUM |
| 3 | `manifest-validation.ts` | A, F | MEDIUM |
| 4 | `manifest-diagnostics.ts` | A | LOW |
| 5 | `manifest-serialization.ts` | A, G | LOW |
| 6 | `manifest-learning.ts` | H core | MEDIUM |
| 7 | `manifest-refresh.ts` | G, H core/valid | HIGH |
| 8 | Update `index.ts` | All H | LOW |
| 9 | `manifest-core-test.mjs` | Step 1 | MEDIUM |
| 10 | `manifest-investigation-test.mjs` | Step 2 | MEDIUM |
| 11 | `manifest-validation-test.mjs` | Step 3 | MEDIUM |
| 12 | `manifest-diagnostics-test.mjs` | Step 4 | LOW |
| 13 | `manifest-serialization-test.mjs` | Step 5 | LOW |
| 14 | `manifest-learning-test.mjs` | Step 6 | MEDIUM |
| 15 | `manifest-refresh-test.mjs` | Step 7 | HIGH |
| 16 | `manifest-integration-test.mjs` | Steps 1–7 | HIGH |

### Owner Decision Matrix

Each decision requires explicit owner acceptance (ACCEPT / REJECT / MODIFY).
Decisions are not considered accepted without a documented owner response.

#### H-DEC-01 — Accept New Types

| Field | Value |
| --- | --- |
| **Question** | Accept all new types defined in section 8 (`ManifestIdentity`, `ManifestLifecycleState`, `ManifestEntryType`, `Investigation`, `Hypothesis`, `HypothesisStatus`, `EvidenceItem`, `EvidenceType`, `RootCause`, `RootCauseStatus`, `Resolution`, `ResolutionStatus`, `ManifestEntry`, `ManifestSnapshot`, `ManifestMetadata`, `ManifestSnapshotInput`, `ManifestValidationCode`, `ManifestValidationRule`, `ManifestValidationReport`, `ManifestDiagnosticEvent`, `ManifestDiagnosticStage`, `ManifestError`, `ManifestSerialization`, `LearningMemory`, `LearningPattern`, `SimilarInvestigation`)? |
| **Recommended** | ACCEPT — all types are necessary. No existing A–G type covers these domains. |
| **Alternatives** | Use generic `Record<string, unknown>` (rejected — loses type safety). Extend Mirror types (rejected — breaks invariants). |
| **Why it aligns with A–G** | All new types use A's identity primitives and follow the structural patterns of F (validation) and G (diagnostics). |
| **Public API impact** | 24 new public type exports from 7 new files. |
| **Determinism impact** | None — all types are deterministic data containers. |
| **I–N impact** | These types are the foundation for all future investigation features. Rejection would require a different data model. |
| **Reversible after implementation** | Yes — types can be renamed or restructured within a single package before the first tagged release. After release, renames are breaking changes. |
| **Blocks first commit** | **YES** — core types must be defined before any implementation. |

#### H-DEC-02 — Accept Validation Severity Mapping

| Field | Value |
| --- | --- |
| **Question** | Accept the ERROR/WARN severity mapping defined in section 11? Key rules: missing identity → ERROR, evidence without `sourceRevision` → ERROR, broken reference → ERROR, hypothesis with zero evidence → WARN, conflicting evidence → WARN. |
| **Recommended** | ACCEPT — the mapping balances strictness (no publication with broken data) with practicality (investigations can proceed with partial evidence). |
| **Alternatives** | All violations → ERROR (rejected — blocks useful partial investigations). All violations → WARN (rejected — allows broken references into published manifest). |
| **Why it aligns with A–G** | Follows F's pattern where some conditions are blocking and some are advisory. Mirror uses a similar WARN/ERROR split. |
| **Public API impact** | Severity mapping is internal to validation logic — no public API change beyond the validation report itself. |
| **Determinism impact** | None — severity is deterministic given the data and rules. |
| **I–N impact** | Future packages can add new validation codes with the same severity rules. |
| **Reversible after implementation** | Yes — severity can be raised or lowered within a single rule without breaking the validation report format. |
| **Blocks first commit** | **NO** — core types can be defined without the full severity mapping, but it must be settled before the validation implementation commit. |

#### H-DEC-03 — Accept All-ERRORs-Block Fail-Closed Model

| Field | Value |
| --- | --- |
| **Question** | Accept that any validation ERROR across any entry blocks the entire manifest snapshot from publication? No partial publication is allowed. |
| **Recommended** | ACCEPT — this is consistent with Mirror's fail-closed behavior and prevents non-canonical data from entering the engineering memory. |
| **Alternatives** | Per-entry publication (rejected — a manifest with one broken entry and five valid ones would create an inconsistent view). WARN-only (rejected — violates Fail Closed principle). |
| **Why it aligns with A–G** | Mirror uses the same all-ERRORs-block model. Package F blocks on fatal/blocked severities. |
| **Public API impact** | `validateAndPublish()` returns either `ManifestSnapshot` or `BLOCKED` — no partial result type. |
| **Determinism impact** | None — blocking is deterministic given the input. Same invalid data always blocks. |
| **I–N impact** | Future packages cannot publish partial manifest snapshots either — consistent with the fail-closed contract. |
| **Reversible after implementation** | Technically reversible but would require rethinking the publication gate and all downstream consumers. Strongly recommended to get this right before implementation. |
| **Blocks first commit** | **NO** — the validation pipeline can be implemented later, but the fail-closed model must be documented before publication logic is written. |

#### H-DEC-04 — Accept DM-001–004 as Deferred

| Field | Value |
| --- | --- |
| **Question** | Accept that the four open design decisions (DM-001: storage/serialization location, DM-002: search/filter/visualize, DM-003: retention/compression, DM-004: AI Agent integration) are deferred to future packages and do not block Package H implementation? |
| **Recommended** | ACCEPT — none of these decisions affect the core data model, validation, or determinism. They are infrastructure and UX concerns. |
| **Alternatives** | Resolve each before implementation (rejected — would delay H by weeks with no architectural benefit; these are implementation decisions, not design decisions). |
| **Why it aligns with A–G** | A–G also deferred storage, search, and retention to future work. Mirror has no persistence layer. |
| **Public API impact** | No impact — the core model is independent of where snapshots are stored or how they are queried. |
| **Determinism impact** | None. |
| **I–N impact** | DM-001–004 become the responsibility of future packages (I, J, K). Package H must remain provider-agnostic (DM-004). |
| **Reversible after implementation** | N/A — nothing is being built for these decisions. They remain open. |
| **Blocks first commit** | **NO** — explicitly non-blocking. |

#### H-DEC-05 — Add Exports to `index.ts`

| Field | Value |
| --- | --- |
| **Question** | Add 7 `export * from` lines to `src/project-brain/index.ts` (one per source file)? |
| **Recommended** | ACCEPT — this follows the same pattern as all existing A–G packages. Without these exports, H's types are inaccessible. |
| **Alternatives** | Export selectively (rejected — inconsistent with A–G convention; all public symbols from a file are re-exported). Single combined export file (rejected — breaks modularity). |
| **Why it aligns with A–G** | Every existing package file has a corresponding `export * from` in `index.ts`. This is the established convention. |
| **Public API impact** | 7 new lines in `index.ts`. All H types and functions become available through the project-brain barrel. |
| **Determinism impact** | None — this is a module export concern, not a runtime behavior concern. |
| **I–N impact** | Future packages follow the same pattern. |
| **Reversible after implementation** | Yes — export lines can be added or removed without affecting runtime behavior of existing code. |
| **Blocks first commit** | **NO** — implementation can proceed without the final `index.ts` update; it is needed before other packages can consume H. |

#### H-DEC-06 — Accept File Placement

| Field | Value |
| --- | --- |
| **Question** | Accept the file structure: 7 source files in `src/project-brain/` + 8 test files in `tests/project-brain/`? |
| **Recommended** | ACCEPT — follows the exact same layout as all existing A–G packages. |
| **Alternatives** | Single large file (rejected — violates Single Responsibility). Separate `src/project-brain/manifest/` subdirectory (possible but unnecessary for 7 files; A–G also use flat structure). |
| **Why it aligns with A–G** | All A–G packages use flat files in `src/project-brain/` with tests in `tests/project-brain/`. No subdirectories. |
| **Public API impact** | None — file layout is an implementation detail. |
| **Determinism impact** | None. |
| **I–N impact** | Future packages should follow the same flat structure unless file count exceeds ~15 files per package. |
| **Reversible after implementation** | Yes — files can be renamed or relocated without changing public API (imports use barrel `index.ts`). |
| **Blocks first commit** | **NO** — implementation can start in any file layout; this decision only affects organization. |

#### Owner Response Summary

```
H-DEC-01: Accept all new types defined in section 8?
Recommended: ACCEPT
Owner response required: ACCEPT / REJECT / MODIFY

H-DEC-02: Accept the ERROR/WARN severity mapping?
Recommended: ACCEPT
Owner response required: ACCEPT / REJECT / MODIFY

H-DEC-03: Accept all-ERRORs-block fail-closed model?
Recommended: ACCEPT
Owner response required: ACCEPT / REJECT / MODIFY

H-DEC-04: Accept DM-001–004 as deferred?
Recommended: ACCEPT
Owner response required: ACCEPT / REJECT / MODIFY

H-DEC-05: Add 7 export lines to index.ts?
Recommended: ACCEPT
Owner response required: ACCEPT / REJECT / MODIFY

H-DEC-06: Accept file placement (7 source + 8 test)?
Recommended: ACCEPT
Owner response required: ACCEPT / REJECT / MODIFY
```

### Completion Criteria

1. All 7 source files pass `npm run lint` and `npm run typecheck`.
2. All 8 test files pass `node tests/project-brain/manifest-integration-test.mjs`.
3. `check_regressions_worker6.mjs` reports no regressions.
4. `verify_repository_health.ps1` passes.
5. `git diff --check` shows no whitespace errors.
6. No existing A–G files modified (index.ts addition only).
7. All 28 invariants enforced by validation rules.
8. Determinism test: same inputs → same fingerprint.

---

## Appendix A: Complete A–G Public Contract Catalog

> Full catalog of all public contracts in Foundation A–G. Only contracts
> marked **[H-relevant]** are directly used by Package H. The remainder are
> listed for completeness and cross-reference.

### Package A — Artifact Identity (`artifact-identity.ts`)

| Export | H-relevant |
| --- | --- |
| `ArtifactType` | Yes — type-tag manifest artifacts |
| `ArtifactId` | Yes — identity for manifest entries |
| `ArtifactRevision` | Yes — revision tracking |
| `ArtifactSlug` | No |
| `createArtifactId(namespace, slug, seq?)` | Yes |
| `formatArtifactId(id)` | Yes |
| `parseArtifactId(raw)` | Yes |
| `incrementRevision(rev)` | No |
| `formatRevision(rev)` | No |
| `compareRevisions(a, b)` | No |
| `isValidArtifactId(candidate)` | No |
| `artifactTypeFromString(raw)` | No |
| `defaultNamespace` | No |

### Package A — Canonical Registry (`canonical-registry.ts`)

| Export | H-relevant |
| --- | --- |
| `CanonicalRegistry` | Yes — resolves cross-references |
| `CanonicalEntry` | Yes — registry entry shape |
| `createRegistry()` | Yes |
| `registerArtifact(registry, entry)` | Yes |
| `resolveArtifact(registry, id)` | Yes |
| `hasArtifact(registry, id)` | No |
| `listArtifacts(registry)` | No |
| `RegistryError` | Yes |
| `registryError()` | Yes |
| `RegistryConflictError` | No |

### Package B — Knowledge Artifact (`knowledge-artifact.ts`)

| Export | H-relevant |
| --- | --- |
| `KnowledgeArtifactId` | No |
| `KnowledgeArtifactInput` | No |
| `KnowledgeArtifact` | No |
| `createKnowledgeArtifact(input)` | No |
| `freezeArtifact(artifact)` | No |
| `isFrozen(artifact)` | No |
| `deepFreeze(obj)` | **Yes** — shared utility |
| `stableStringify(obj)` | **Yes** — shared utility |
| `cloneArtifact(artifact)` | No |
| `KnowledgeArtifactStatus` | No |

### Package B — Knowledge Lifecycle (`knowledge-lifecycle.ts`)

| Export | H-relevant |
| --- | --- |
| `KnowledgeLifecycleState` | No |
| `transitionLifecycle(current, target)` | No |
| `isValidTransition(current, target)` | No |
| `LifecycleTransitionError` | No |
| `LIFECYCLE_TRANSITIONS` | No |

### Package B — Knowledge Store (`knowledge-store.ts`)

| Export | H-relevant |
| --- | --- |
| `KnowledgeStore` | No |
| `StoreEntry` | No |
| `createStore()` | No |
| `storeArtifact(store, artifact)` | No |
| `retrieveArtifact(store, id)` | No |
| `removeArtifact(store, id)` | No |
| `listStore(store)` | No |
| `StoreError` | No |
| `storeError()` | No |

### Package B — Knowledge Validation (`knowledge-validation.ts`)

| Export | H-relevant |
| --- | --- |
| `KnowledgeValidationReport` | No |
| `validateKnowledgeArtifact(artifact)` | No |
| `ValidationRule` | No |

### Package C — Brain Engine

| Export | H-relevant |
| --- | --- |
| `BrainState` | No (soft dep only) |
| `BrainPhase` | Soft — tag manifest in pipeline |
| `BrainEvent` | Soft |
| `createBrain()` | No |
| `transitionBrain()` | No |
| `getBrainState()` | No |
| `BrainCommand` | No |
| `BrainResult` | No |
| `ValidationError` | No |
| `engineError()` | No |
| `BrainAuthority` (`brain-authority.ts`) | No |
| `BrainDependency` (`brain-dependency.ts`) | No |
| `BrainPlanner` (`brain-planner.ts`) | No |
| `BrainRequest` (`brain-request.ts`) | No |
| `BrainResponse` (`brain-response.ts`) | No |
| `BrainSession` (`brain-session.ts`) | No |
| `BrainTrace` (`brain-trace.ts`) | No |
| `BrainDiagnostics` (`brain-diagnostics.ts`) | No |

### Package D — Context

| Export | H-relevant |
| --- | --- |
| `ContextId` | Soft — cross-reference |
| `ContextFrame` | No |
| `ContextStack` | No |
| `createContextFrame()` | No |
| `pushContext()` | No |
| `popContext()` | No |
| `ContextPackage` | No |
| `ContextItem` | No |
| `ContextRequest` | No |
| `ContextSelection` | No |
| `ContextBuilder` | No |
| `ContextDiagnostics` | No |
| `ContextError` | No |
| `contextError()` | No |

### Package E — Generation Pipeline

| Export | H-relevant |
| --- | --- |
| `GenerationResult` | Soft — cross-reference |
| `GenerationRequest` | No |
| `GenerationDiagnostic` | Soft — pattern reference |
| `GenerationStage` | No |
| `GenerationError` | No |
| `generationError()` | No |
| `GenerationBuilder` | No |
| `GenerationPrompt` | No |
| `GenerationSession` | No |
| `GenerationHash` / `fnv1a32` | **Yes** — shared fingerprint utility |
| `GenerationSerialization` | No |
| `GenerationValidation` | No |

### Package F — Validation

| Export | Source | H-relevant |
| --- | --- | --- |
| `ValidationReport` | `validation-report.ts` | Yes — structural pattern for `ManifestValidationReport` |
| `ValidationReportIssue` | `validation-report.ts` | No — internal to F |
| `ValidationReportValidationReport` | `validation-report.ts` | No — internal to F |
| `ValidationTraceability` | `validation-report.ts` | No — F-specific (brain/generation/context coupling) |
| `buildValidationTraceability()` | `validation-report.ts` | No |
| `buildValidationReportFingerprint()` | `validation-report.ts` | No — H uses its own fingerprint |
| `freezeValidationReport()` | `validation-report.ts` | No — H uses `deepFreeze` directly |
| `validateValidationReport()` | `validation-report.ts` | No |
| `ValidationResult` | `validation-result.ts` | Yes — pattern for decision + statistics |
| `ValidationStatistics` | `validation-result.ts` | Yes — pattern for counts |
| `determineValidationOverallDecision()` | `validation-result.ts` | Yes — pattern for blocking logic |
| `buildValidationResult()` | `validation-result.ts` | No — H builds its own result |
| `ValidationSeverity` | `validation-severity.ts` | Yes — pattern (H normalizes casing) |
| `VALIDATION_SEVERITY_ORDER` | `validation-severity.ts` | No |
| `compareValidationSeverity()` | `validation-severity.ts` | No |
| `normalizeValidationSeverity()` | `validation-severity.ts` | No |
| `ValidationRule` | `validation-rule.ts` | Yes — pattern for `ManifestValidationRule` |
| `ValidationRuleResult` | `validation-rule.ts` | Yes — pattern for `ManifestValidationRuleResult` |
| `ValidationStage` | `validation-rule.ts` | No — H has its own diagnostic stages |
| `ValidationOverallDecision` | `validation-rule.ts` | Yes — pattern for overall decision |
| `ValidationRuleStatus` | `validation-rule.ts` | No |
| `compareValidationRules()` | `validation-rule.ts` | No |
| `createValidationRuleResult()` | `validation-rule.ts` | No |
| `buildValidationReport()` | `validation-engine.ts` | Yes — pipeline pattern only |
| `buildValidationReportCandidate()` | `validation-engine.ts` | No |
| `DEFAULT_VALIDATION_RULES` | `validation-engine.ts` | No — H has its own rules |
| `ValidationCategories` | `validation-categories.ts` | No |
| `ValidationDiagnostics` / `ValidationDiagnosticEvent` | `validation-diagnostics.ts` | No — H has its own diagnostics |
| `ValidationMetadata` | `validation-metadata.ts` | No — F-specific |
| `ValidationRequest` | `validation-request.ts` | No — F-specific |
| `ValidationSession` | `validation-session.ts` | No — F-specific |
| `ValidationSerialization` | `validation-serialization.ts` | No — H has its own |
| `ValidationSummary` | `validation-summary.ts` | No — F-specific |

### Package G — Mirror

| Export | H-relevant |
| --- | --- |
| `MirrorSnapshot` | Yes — derivation source |
| `MirrorSnapshotInput` | Yes — input pattern |
| `MirrorNode` | Yes — evidence refs |
| `MirrorEdge` | Yes — evidence refs |
| `MirrorNodeType` | No |
| `MirrorEdgeType` | No |
| `MirrorKnowledgeStatus` | No |
| `MirrorIdentity` | Yes — cross-reference |
| `MirrorFreshnessState` | No |
| `createMirrorSnapshot(input)` | No |
| `buildMirrorSnapshot(input)` | No |
| `MirrorDiagnosticEvent` | Yes — pattern for H diagnostics |
| `MirrorDiagnosticStage` | Yes — pattern for H stages |
| `appendMirrorDiagnosticEvent()` | Yes — pattern |
| `buildMirrorDiagnostics(input)` | Yes — pattern |
| `MirrorDiff` | Yes — detect changes |
| `computeMirrorDiff(prev, curr)` | Yes |
| `MirrorDiffNodeEntry` | No |
| `MirrorDiffEdgeEntry` | No |
| `MirrorDiffMetadata` | No |
| `MirrorSerialization` | Yes — pattern for H serialization |
| `serializeMirrorSnapshot(snap)` | Yes — pattern |
| `loadMirrorSnapshot(serialized)` | Yes — pattern |
| `loadAndValidateMirrorSnapshot()` | Yes — pattern |
| `MirrorValidationReport` | Yes — pattern |
| `validateMirrorSnapshot(snap)` | Yes — pattern |
| `MirrorRefreshInput` | No |
| `MirrorRefreshResult` | No |
| `MirrorRefreshType` | No |
| `refreshMirrorSnapshot()` | No |

### Tests

| File | H-relevant |
| --- | --- |
| `artifact-identity-test.mjs` | No |
| `brain-engine-test.mjs` | No |
| `context-test.mjs` | No |
| `generation-test.mjs` | No |
| `validation-engine-test.mjs` | No |
| `mirror-core-test.mjs` | No (pattern reference only) |
| `knowledge-store-test.mjs` | No |

---

## Appendix B: Design Decisions

| ID | Question | Direction | Status |
| --- | --- | --- | --- |
| DM-001 | Where will the derived manifest be stored and serialized? | Defer to implementation. Storage layer is not part of the core model. | Open |
| DM-002 | How will the manifest be searched, filtered, and visualized? | Defer to implementation. Search is a future Package J concern. | Open |
| DM-003 | What retention/compression policy for older investigations? | Defer to implementation. Not blocking. | Open |
| DM-004 | How should H integrate with future AI Agent Orchestration? | Keep artifact provider-agnostic and read-only. | Open |

---

## Appendix C: File Manifest

| File | Purpose | Est. lines |
| --- | --- | --- |
| `src/project-brain/manifest-core.ts` | Core types, identity, snapshot, lifecycle, fingerprint | 250 |
| `src/project-brain/manifest-investigation.ts` | Investigation, hypothesis, evidence, root cause, resolution | 300 |
| `src/project-brain/manifest-validation.ts` | Validation rules, report, error type | 180 |
| `src/project-brain/manifest-diagnostics.ts` | Diagnostic events, builder, codes | 120 |
| `src/project-brain/manifest-serialization.ts` | Serialize, deserialize, load, export | 100 |
| `src/project-brain/manifest-learning.ts` | Learning memory, similarity, patterns | 150 |
| `src/project-brain/manifest-refresh.ts` | Refresh from mirror, change detection | 120 |
| `tests/project-brain/manifest-core-test.mjs` | Core unit tests | 150 |
| `tests/project-brain/manifest-investigation-test.mjs` | Investigation unit tests | 200 |
| `tests/project-brain/manifest-validation-test.mjs` | Validation unit tests | 180 |
| `tests/project-brain/manifest-diagnostics-test.mjs` | Diagnostics unit tests | 100 |
| `tests/project-brain/manifest-serialization-test.mjs` | Serialization unit tests | 100 |
| `tests/project-brain/manifest-learning-test.mjs` | Learning memory unit tests | 120 |
| `tests/project-brain/manifest-refresh-test.mjs` | Refresh unit tests | 120 |
| `tests/project-brain/manifest-integration-test.mjs` | Integration tests | 200 |
