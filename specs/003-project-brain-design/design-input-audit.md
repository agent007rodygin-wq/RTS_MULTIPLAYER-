# Project Brain Design Input Audit

> Authority banner
> - This audit reflects the repository state at the time of the original
>   readiness review.
> - The original readiness result was `DESIGN BLOCKED`.
> - `specs/003-project-brain-design/canonicalization-decision.md` supersedes
>   the readiness conclusion recorded here.
> - Current authoritative readiness status: `DESIGN READY WITH DECLARED GAPS`.
> - This document is preserved as historical evidence of the earlier audit.

## 1. Audit Purpose

This audit checks whether the approved architecture inputs are ready for the Design Phase.

The current working draft under review is `specs/003-project-brain-design/design.md`.
That file is treated as the target of the next phase, not as a source of truth.

The audit uses only found repository evidence. If a required source is missing, it is recorded as `GAP` and the dependent section is not filled in as if the missing source existed.

## 2. Source Inventory

| Source | Path | Status | Canonical Role | Consumed By | Conflicts / Gaps |
|---|---|---|---|---|---|
| Repository Constitution | `.specify/memory/constitution.md` | FOUND | Highest governance layer for admissibility, evidence, idempotency, save safety, and verification discipline | All sections, especially 1, 2, 5, 7, 9, 12, 15, 16, 17 | No conflict found |
| Baseline architecture evidence bundle | `specs/_baseline/00-project-overview.md; specs/_baseline/01-current-architecture.md; specs/_baseline/03-state-ownership.md; specs/_baseline/04-pocketbase-contracts.md; specs/_baseline/05-timers-and-processes.md; specs/_baseline/06-building-system.md; specs/_baseline/07-production-system.md; specs/_baseline/08-upgrade-system.md; specs/_baseline/09-realtime-sync.md; specs/_baseline/10-optimistic-ui.md; specs/_baseline/11-error-handling.md; specs/_baseline/12-target-architecture.md; specs/_baseline/13-migration-roadmap.md; specs/_baseline/14-test-strategy.md; specs/_baseline/15-invariants.md; specs/_baseline/16-risk-register.md; specs/_baseline/17-traceability-index.md` | FOUND | Current architecture evidence set and source-backed baseline for the next stage | Sections 2-17 | No single consolidated architecture spec file exists; evidence is distributed across the baseline set |
| Project Constitution | GAP - no standalone file found | ABSENT | Requested as a separate governance layer in the prompt | Sections 1, 2, 5, 6, 8, 13, 14, 17 | No separate project constitution file exists in the repo |
| Project Brain Architecture Specification v1.0 | GAP - no standalone file found | ABSENT | Requested canonical architecture spec for the Design Phase | Sections 1-17 | Architecture knowledge is distributed across the baseline bundle and the current draft, not a single approved file |
| Approved RFC corpus | GAP - no RFC files found | ABSENT | Would govern exceptions, architecture changes, and future expansions | Sections 2, 5, 8, 13, 14, 17 | No approved RFC set exists in the repo |
| Architecture Phase 2A-2E docs | GAP - no standalone 2A-2E files found | ABSENT | Requested architecture-phase source set | Sections 2-17 | Closest evidence is the baseline bundle plus the 2B-2F addenda in `specs/_baseline/17-traceability-index.md` |
| Mirror | GAP - no standalone file found | ABSENT | Would support identity/reference and freshness checks if present | Sections 5, 6, 11, 13 | Only Graphify navigation artifacts exist; they are not truth sources |
| Debug Manifest | GAP - no standalone file found | ABSENT | Would support deterministic generation / validation identity if present | Sections 2, 6, 8, 11, 16 | `graphify-out/manifest.json` exists, but it is a graph manifest, not the requested Debug Manifest |
| Derived evidence set | `tests/characterization/traceability.md; tests/characterization/reports/final.md` | FOUND | Read-only proof artifacts for the characterization phases | Sections 11, 16, 17 | Derived evidence only; not a canonical truth source |
| Fixture manifest document | `tests/characterization/fixture-manifest.md` | FOUND | Documentation-only manifest describing intended future fixture grouping | Sections 6, 8, 11, 16 | Explicitly not machine-readable; does not create `manifest.json` |
| Graphify navigation set | `graphify-out/GRAPH_REPORT.md; graphify-out/graph.json; graphify-out/graph.html; graphify-out/manifest.json` | FOUND | Navigation-only artifacts for locating source areas | Sections 2, 6, 8, 9, 16, 17 | Navigation only; not proof of runtime behavior |
| Current design draft | `specs/003-project-brain-design/design.md` | FOUND | Working draft for the next phase, not a source of truth | All sections as the target document | References architecture inputs that are not yet present as standalone files |

## 3. Architecture Component Inventory

The repository does not contain a dedicated architecture component registry yet, so the component IDs below are audit-only identifiers.

| Component ID | Responsibility | Inputs | Outputs | Source of Truth | Invariants | Design Section |
|---|---|---|---|---|---|---|
| TEMP-COMP-001 | App shell / bootstrap | auth readiness, loading state, top-level UI state | mounted shell, readiness transitions | `App.tsx`; `01-current-architecture.md`; `12-target-architecture.md` | `INV-GAME-03`, `INV-GAME-04`, `INV-LOAD-01` | 3, 4, 7, 15, 16 |
| TEMP-COMP-002 | PocketBase adapter / persistence boundary | PocketBase queries, auth, raw records, queue state | reads, writes, realtime snapshots, retries | `src/pocketbase.ts`; `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `11-error-handling.md` | `INV-PB-01` to `INV-PB-05`; `INV-RT-01` to `INV-RT-07` | 4, 5, 6, 8, 9, 12, 13, 16 |
| TEMP-COMP-003 | Time / process engine | absolute timestamps, persisted process state | finalization decisions, catch-up results, canonical end times | `05-timers-and-processes.md`; `15-invariants.md`; `App.tsx` | `INV-TIME-01` to `INV-TIME-10` | 4, 5, 7, 8, 10, 12, 16 |
| TEMP-COMP-004 | Building command family | building state, cost/eligibility inputs, optimistic refs | placement / move / repair / protection / upgrade / destroy commands | `06-building-system.md`; `07-production-system.md`; `08-upgrade-system.md`; `10-optimistic-ui.md`; `App.tsx` | `INV-OPT-01` to `INV-OPT-08`; `INV-GAME-01` | 3, 4, 5, 6, 10, 12, 14, 16 |
| TEMP-COMP-005 | Production command family | work state, work end times, reward calculations | start / collect / finish operations | `07-production-system.md`; `05-timers-and-processes.md`; `App.tsx` | `INV-TIME-08`, `INV-TIME-09`, `INV-OPT-05` | 4, 5, 7, 8, 10, 12, 16 |
| TEMP-COMP-006 | Realtime sync / merge service | snapshots, tombstones, previous docs, retry state | normalized merged view state | `03-state-ownership.md`; `09-realtime-sync.md`; `12-target-architecture.md`; `App.tsx`; `src/pocketbase.ts` | `INV-STATE-03`, `INV-STATE-05`, `INV-STATE-06`, `INV-RT-03`, `INV-RT-07` | 2, 3, 5, 6, 8, 9, 11, 13, 16 |
| TEMP-COMP-007 | Optimistic command / rollback service | local optimistic state, in-flight refs, command inputs | success / rollback / compensation results | `10-optimistic-ui.md`; `11-error-handling.md`; `App.tsx` | `INV-OPT-01` to `INV-OPT-08` | 4, 5, 7, 9, 12, 16 |
| TEMP-COMP-008 | Economy service | inventory and currency state, market inputs | resource deltas, market actions, permit / energy changes | `App.tsx`; `12-target-architecture.md`; `15-invariants.md` | `INV-GAME-01`, `INV-OPT-01`, `INV-OPT-02`, `INV-OPT-07` | 3, 4, 10, 12, 14, 16 |
| TEMP-COMP-009 | Social service | chat, private message, clan, presence, leaderboard inputs | social state updates and mirrored views | `App.tsx`; `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `10-optimistic-ui.md` | `INV-STATE-01`, `INV-STATE-03`, `INV-RT-01`, `INV-RT-02` | 3, 4, 6, 9, 10, 13, 16 |
| TEMP-COMP-010 | World / map service | zone data, map resources, dropped items, tree-hit inputs | world state merges, pickup results, respawn-related state | `03-state-ownership.md`; `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `pb_hooks/main.pb.js`; `pb_hooks/tree_server_utils.js` | `INV-STATE-01`, `INV-RT-06`, `INV-RT-07`, `INV-PB-04` | 3, 4, 6, 9, 11, 13, 16 |
| TEMP-COMP-011 | Combat / destruction service | damage, shields, destruction windows, pending damage | destruction transitions and reward / debit outcomes | `05-timers-and-processes.md`; `11-error-handling.md`; `App.tsx` | `INV-GAME-02`, `INV-TIME-08`, `INV-TIME-09`, `INV-COMBAT-01` | 4, 5, 7, 10, 12, 16 |
| TEMP-COMP-012 | Derived verification / reporting layer | source anchors, traceability rows, runner output, final evidence | traceability indexes, final reports, audit docs | `tests/characterization/traceability.md`; `tests/characterization/reports/final.md`; `graphify-out/*` | `INV-PB-05`, `INV-TEST-01`, `INV-GIT-01` | 1, 2, 9, 11, 16, 17 |

## 4. Architecture-to-Design Traceability Matrix

| Design Section | Architecture Source | Constitution Rules | Required RFCs | Input Status | Blocking Gaps |
|---|---|---|---|---|---|
| 1. Purpose and Scope | `.specify/memory/constitution.md`; `12-target-architecture.md`; `17-traceability-index.md` | Specification First, Evidence Always; Incremental Change and Verification | None found | READY | None |
| 2. Architecture Traceability | `01-current-architecture.md`; `12-target-architecture.md`; `17-traceability-index.md` | Evidence Always; Incremental Change and Verification | Missing RFC corpus | BLOCKED | No standalone architecture spec file and no approved RFC corpus |
| 3. Component Model | `01-current-architecture.md`; `03-state-ownership.md`; `12-target-architecture.md` | Incremental Change and Verification | None found | READY WITH ASSUMPTIONS | Component IDs are audit-only, not registry-backed |
| 4. Component Contracts | `04-pocketbase-contracts.md`; `05-timers-and-processes.md`; `06-building-system.md`; `07-production-system.md`; `08-upgrade-system.md`; `10-optimistic-ui.md`; `11-error-handling.md` | Server Authority and Data Integrity; Temporal Correctness and Idempotency | None found | READY WITH ASSUMPTIONS | Some contracts are still embedded in source rather than separated into a design contract |
| 5. Canonical Knowledge Model | `.specify/memory/constitution.md`; `15-invariants.md`; `17-traceability-index.md` | Specification First, Evidence Always; Server Authority and Data Integrity | Missing Project Constitution | BLOCKED | No canonical Project Constitution or separate knowledge registry found |
| 6. Identity and Reference Resolution | `03-state-ownership.md`; `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `17-traceability-index.md` | Temporal Correctness and Idempotency; Compatibility and Player Save Safety | Missing Mirror / Debug Manifest RFC | BLOCKED | Mirror and Debug Manifest are absent as standalone artifacts |
| 7. Knowledge Lifecycle | `05-timers-and-processes.md`; `07-production-system.md`; `08-upgrade-system.md`; `15-invariants.md` | Temporal Correctness and Idempotency | None found | READY WITH ASSUMPTIONS | Lifecycle is source-backed, but the design doc still needs a canonical lifecycle narrative |
| 8. Generation Pipeline | `14-test-strategy.md`; `17-traceability-index.md`; `tests/characterization/fixture-manifest.md` | Specification First, Evidence Always | Missing Project Brain Engine RFC | BLOCKED | No standalone generator contract or engine artifact exists |
| 9. Validation Model | `14-test-strategy.md`; `15-invariants.md`; `16-risk-register.md`; `tests/characterization/runner-contract.md`; `tests/characterization/reports/final.md` | Evidence Always; Incremental Change and Verification | None found | READY | None |
| 10. Intelligence Pipeline | `12-target-architecture.md`; `13-migration-roadmap.md`; `15-invariants.md`; `16-risk-register.md`; `17-traceability-index.md` | Specification First, Evidence Always | Missing semantic-model RFC | BLOCKED | Semantic model, knowledge graph, confidence engine, and evolution layer are not separately canonical yet |
| 11. Derived View Generation | `17-traceability-index.md`; `tests/characterization/traceability.md`; `tests/characterization/reports/final.md` | Evidence Always; Incremental Change and Verification | None found | READY WITH ASSUMPTIONS | Derived views exist as artifacts, but the generator contract is not yet canonical |
| 12. Error Model | `11-error-handling.md`; `16-risk-register.md`; `04-pocketbase-contracts.md`; `09-realtime-sync.md` | Evidence Always; Server Authority and Data Integrity | None found | READY WITH ASSUMPTIONS | Error taxonomy is source-backed, but design-level normalization is still implicit |
| 13. Storage Strategy | `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `10-optimistic-ui.md`; `17-traceability-index.md`; `tests/characterization/fixture-manifest.md` | Compatibility and Player Save Safety | Missing storage policy RFC | BLOCKED | Committed derived-storage policy for Project Brain artifacts is not separately defined |
| 14. Extension Model | `13-migration-roadmap.md`; `17-traceability-index.md` | Incremental Change and Verification | Missing RFC classification detail | READY WITH ASSUMPTIONS | Extension points are implied by the baseline set, but not yet written as a design contract |
| 15. Operational Workflows | `00-project-overview.md`; `01-current-architecture.md`; `13-migration-roadmap.md`; `14-test-strategy.md`; `17-traceability-index.md` | Specification First, Evidence Always | None found | READY WITH ASSUMPTIONS | Workflow shape is visible, but some steps still need formal design wording |
| 16. Verification Requirements | `14-test-strategy.md`; `17-traceability-index.md`; `tests/characterization/runner-contract.md`; `tests/characterization/traceability.md`; `tests/characterization/reports/final.md` | Evidence Always; Incremental Change and Verification | None found | READY | None |
| 17. Implementation Constraints | `12-target-architecture.md`; `13-migration-roadmap.md`; `14-test-strategy.md`; `15-invariants.md`; `16-risk-register.md`; `17-traceability-index.md`; `.specify/memory/constitution.md` | Compatibility and Player Save Safety; Incremental Change and Verification | None found | READY WITH ASSUMPTIONS | Constraints are source-backed, but some enforcement details are still distributed across baseline docs |

## 5. Invariant Inventory

The audit treats the constitution principles plus the baseline invariant families as the approved invariant set for this stage.

### Constitutional Principles

- Specification First, Evidence Always
- Server Authority and Data Integrity
- Temporal Correctness and Idempotency
- Compatibility and Player Save Safety
- Incremental Change and Verification

### Invariant Families

| Family | IDs | Summary | Source | Design Impact | Verification Requirement |
|---|---|---|---|---|---|
| Time and process | `INV-TIME-01` to `INV-TIME-10` | Stable identity, absolute timestamps, once-only completion, and stale-snapshot safety for timer-backed processes | `15-invariants.md`; `05-timers-and-processes.md`; `11-error-handling.md` | Drives lifecycle, determinism, and completion contracts | Replay and reload tests around timer-backed processes |
| State ownership | `INV-STATE-01` to `INV-STATE-06` | One server source of truth, no optimistic truth inversion, merge state is not canonical, tombstones are suppression helpers | `03-state-ownership.md`; `09-realtime-sync.md`; `10-optimistic-ui.md` | Defines ownership and reconciliation boundaries | Ownership-map and stale-overwrite tests |
| Optimistic UI / rollback | `INV-OPT-01` to `INV-OPT-08` | Debit confirmation, explicit rollback, bounded retries, duplicate-click protection, and repair-vs-rollback distinctions | `10-optimistic-ui.md`; `11-error-handling.md`; `15-invariants.md` | Shapes command contracts and compensation semantics | Rollback matrix and duplicate-submit tests |
| Realtime / network | `INV-RT-01` to `INV-RT-07` | Subscription uniqueness, cleanup, ordering, bounded retry, error classification, and resurrection suppression | `09-realtime-sync.md`; `11-error-handling.md`; `15-invariants.md` | Governs merge, snapshot, and retry behavior | Out-of-order snapshot and retry-budget tests |
| Persistence / compatibility | `INV-PB-01` to `INV-PB-05` | Existing records remain readable, raw JSON survives partial updates, legacy fallback persists until retired, no destructive migration needed | `04-pocketbase-contracts.md`; `11-error-handling.md`; `15-invariants.md` | Restricts storage and migration design | Compatibility, schema-drift, and migration-safety checks |
| Gameplay preservation | `INV-GAME-01` to `INV-GAME-04` | Balance, durations, costs, rewards, IDs, and orchestration-root behavior remain stable | `05-timers-and-processes.md`; `06-building-system.md`; `07-production-system.md`; `08-upgrade-system.md`; `12-target-architecture.md`; `15-invariants.md` | Sets immovable gameplay constraints for design | Balance freeze and orchestration-root checks |

## 6. Source-of-Truth Matrix

| Concern | Source of Truth | Derived Copies | Update Authority | Validation |
|---|---|---|---|---|
| Constitutional rules | `.specify/memory/constitution.md` | None | Constitution amendment process only | Constitution review and version check |
| Baseline architecture evidence | `specs/_baseline/00-project-overview.md` through `specs/_baseline/17-traceability-index.md` | Design draft, traceability notes, follow-up docs | Baseline review process | Direct source reading plus current source snapshot |
| Runtime implementation | `App.tsx`, `src/pocketbase.ts`, `src/game/**`, `pb_hooks/**` | Baseline docs, audit docs, traceability docs | Code owners / implementation tasks | Current source inspection and runtime verification |
| Derived views | `tests/characterization/traceability.md`, `tests/characterization/reports/final.md`, `graphify-out/*` | None | Documentation tasks only | Fresh generation / diff checks |
| Fixture / scenario intent | `tests/characterization/fixture-manifest.md`, scenario fixture files | Scenario reports and audit docs | Characterization tasks | Replay and characterization checks |
| Graph navigation artifacts | `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.json`, `graphify-out/graph.html`, `graphify-out/manifest.json` | None | Navigation only | Not proof of runtime behavior |

## 7. Design Readiness Assessment

| Section | Status | Why | Blocker if any |
|---|---|---|---|
| 1. Purpose and Scope | READY | Current draft already states the design mission and scope boundaries | None |
| 2. Architecture Traceability | BLOCKED | Needs a single approved architecture spec and RFC corpus to cite cleanly | Missing standalone architecture spec; missing RFC corpus |
| 3. Component Model | READY WITH ASSUMPTIONS | Baseline docs expose enough structure to draft temp component IDs | Component registry is not canonical yet |
| 4. Component Contracts | READY WITH ASSUMPTIONS | Core contracts are source-backed across the baseline set | Some contracts are still embedded in code or split across docs |
| 5. Canonical Knowledge Model | BLOCKED | No separate Project Constitution or canonical knowledge registry file found | Missing Project Constitution; no explicit knowledge registry |
| 6. Identity and Reference Resolution | BLOCKED | Mirror / Debug Manifest were requested but not found as standalone artifacts | Missing Mirror; missing Debug Manifest |
| 7. Knowledge Lifecycle | READY WITH ASSUMPTIONS | Process/timer docs provide a source-backed lifecycle outline | No single canonical lifecycle document exists |
| 8. Generation Pipeline | BLOCKED | No Project Brain Engine / generator contract exists yet | Missing generator contract / engine artifact |
| 9. Validation Model | READY | Validation and verification sources are present | None |
| 10. Intelligence Pipeline | BLOCKED | Semantic / graph / confidence / evolution layers are not yet canonical artifacts | Missing semantic-model RFC; missing intelligence-layer contract |
| 11. Derived View Generation | READY WITH ASSUMPTIONS | Derived reports and traceability views exist | Generator contract still needs formalization |
| 12. Error Model | READY WITH ASSUMPTIONS | Error handling and risk docs are source-backed | Some error handling remains distributed |
| 13. Storage Strategy | BLOCKED | Committed storage policy for derived Brain artifacts is not defined | Missing storage policy RFC |
| 14. Extension Model | READY WITH ASSUMPTIONS | Baseline roadmap and traceability index support extension thinking | No explicit extension contract yet |
| 15. Operational Workflows | READY WITH ASSUMPTIONS | Workflow shape is visible in baseline docs | Needs design wording, not new architecture |
| 16. Verification Requirements | READY | Test strategy, traceability, and final evidence exist | None |
| 17. Implementation Constraints | READY WITH ASSUMPTIONS | Constraints are visible in baseline docs and constitution | Some enforcement details still distributed |

Overall readiness verdict: DESIGN BLOCKED

## 8. Gap Register

| Gap ID | Description | Type | Blocks Section | Resolution Path |
|---|---|---|---|---|
| GAP-01 | No standalone `Project Constitution` file exists | missing constitution | 2, 5, 6, 13, 17 | Add or identify the project-level constitution before writing canonical design contracts |
| GAP-02 | No standalone `Project Brain Architecture Specification v1.0` file exists | missing architecture | 2, 3, 4, 5, 8, 10, 13, 17 | Consolidate the baseline architecture evidence into a single approved spec or explicitly nominate the baseline set as the authoritative spec bundle |
| GAP-03 | No approved RFC corpus influencing Project Brain was found | missing governance source | 2, 5, 8, 13, 14, 17 | Create or identify the approved RFC set before documenting exceptions or extensions |
| GAP-04 | No standalone Architecture Phase docs 2A-2E were found | naming / location ambiguity | 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17 | Either provide those docs or explicitly map the baseline bundle to that phase language |
| GAP-05 | No standalone `Mirror` artifact exists | missing identity / freshness source | 5, 6, 11, 13 | Define the Mirror artifact or explicitly declare its responsibility as part of another source |
| GAP-06 | No standalone `Debug Manifest` artifact exists | missing generation / validation source | 2, 6, 8, 11, 16 | Define the manifest role and its owner before freezing design contracts |
| GAP-07 | No canonical Project Brain Engine contract exists | missing core design mechanism | 8, 10, 11, 13 | Add the engine specification before committing generation and validation pipelines |
| GAP-08 | No explicit canonical knowledge registry exists separate from the baseline bundle | unclear ownership | 5, 6, 10, 13, 17 | Define the canonical knowledge surface and its update authority |

## 9. Recommended Design Sequence

1. Close GAP-01 through GAP-04 so the canonical source set is explicit.
2. Close GAP-05 through GAP-08 so identity, generation, and knowledge ownership are named.
3. Fill sections 3, 4, 7, 9, 11, 12, 14, 15, 16, and 17 using the baseline evidence bundle.
4. Revisit sections 2, 5, 6, 8, 10, and 13 only after the missing source definitions are resolved.

## 10. Final Audit Verdict

DESIGN BLOCKED

The audit found solid baseline evidence, but several required canonical inputs are missing as standalone repository artifacts. The Design Phase should not advance into the technical sections until those gaps are resolved or explicitly reclassified as part of the approved baseline bundle.
