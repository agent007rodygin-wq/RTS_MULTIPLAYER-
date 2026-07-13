# Feature Specification: characterization-tests

**Feature Branch**: `[002-characterization-tests]`
**Created**: 2026-07-13
**Status**: Draft
**Input**: User description: "Characterization Design Pass for the MMO project. Identify the critical runtime surfaces that must be frozen before any further runtime change, group them by confirmed project domains, and define the freeze order before the future characterization suite is written."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Freeze the highest-risk surfaces first (Priority: P1)

As a maintainer, I can see which runtime surfaces are dangerous enough to freeze before any further implementation work touches them.

**Why this priority**: The most damaging regressions in this project come from time, persistence, optimistic state, and replay-sensitive flows. Those surfaces need a stable freeze list before any new runtime change lands.

**Independent Test**: A reviewer can read the spec and map every high-risk surface to a real source anchor and baseline doc without inventing new categories.

**Acceptance Scenarios**:

1. **Given** the current source and baseline set, **When** I review the spec, **Then** the highest-risk runtime surfaces are explicitly grouped and ordered first.
2. **Given** a surface with shared ownership, **When** I review its group, **Then** the primary owner and secondary dependencies are visible instead of hidden.

---

### User Story 2 - See the full responsibility matrix (Priority: P1)

As a maintainer, I can inspect the owner, source of truth, persistence, optimistic state, realtime interaction, replay sensitivity, regression risk, and verification complexity for each confirmed surface group.

**Why this priority**: If a group is missing one of those fields, later characterization work can freeze the wrong behavior or miss a cross-cutting dependency.

**Independent Test**: A reviewer can pick any confirmed group and find all required responsibility fields in one place.

**Acceptance Scenarios**:

1. **Given** a confirmed surface group, **When** I inspect its section, **Then** I can see the required responsibility fields and the relevant evidence anchors.
2. **Given** a surface that is only partially proven, **When** I inspect the section, **Then** the uncertainty is labeled `UNCONFIRMED` rather than guessed.

---

### User Story 3 - Derive the first characterization order (Priority: P2)

As a maintainer, I can derive a small first-wave characterization order that protects the biggest risks without spreading into low-value areas.

**Why this priority**: The project needs a first guardrail set that maximizes protection with the fewest future tests.

**Independent Test**: A reviewer can derive a first-wave order from the spec and verify that it stays capped at 10 tests.

**Acceptance Scenarios**:

1. **Given** the spec, **When** I read the freeze priorities, **Then** I can name the first wave of coverage without needing implementation details.
2. **Given** the proposed first-wave order, **When** I count it, **Then** it stays at or below 10 tests.

## Non-Goals

- No test code, harness, or Ralph creation in this pass.
- No runtime edits, `App.tsx` edits, baseline edits, Graphify edits, AGENTS edits, or new skills.
- No Feature 002 implementation, commits, PRs, or plan/tasks artifacts.
- P2 and P3 groups are future waves unless separately approved by the owner.

## Behavior Classification

Characterization tests freeze observed accepted behavior. They must not silently canonize a known bug.

Each proposed scenario MUST carry exactly one classification:

- `CURRENT_ACCEPTED_BEHAVIOR`: observed and accepted in current runtime; eligible for freezing.
- `KNOWN_BUG_DO_NOT_FREEZE`: observed bug; do not freeze until the owner decides whether to fix or preserve it.
- `UNCONFIRMED_RUNTIME_BEHAVIOR`: not yet proven from current source or baseline; keep it out of the permanent suite.
- `LEGACY_COMPATIBILITY_BEHAVIOR`: intentionally preserved legacy behavior that remains part of the contract.
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION`: desired target state that cannot be frozen until the owner resolves it.

Any item classified as `KNOWN_BUG_DO_NOT_FREEZE` requires a separate fix decision before it can become a permanent characterization test.

## Terminology

- `Characterization scenario`: one observable contract to protect.
- `Atomic characterization test`: one scenario, one contract, one pass/fail result.
- `Suite`: an ordered set of atomic characterization tests.
- `Fixture`: deterministic setup and teardown used by a suite.
- `Harness`: the runner boundary that executes suites and reports results.

## Feature 002 MVP

Feature 002 MVP is limited to:

- test-runner foundation
- deterministic local fixture boundary
- no live PocketBase mutation
- 10 atomic P1 characterization tests
- one repeatable verification command
- no production refactor

P2 and P3 groups remain future waves unless separately approved by the owner.

## Critical Surface Groups

| Priority | Group | Freeze focus |
| --- | --- | --- |
| P1 | Realtime and Persistence | initial fetch, bounded retries, tombstones, auth semantics, compatibility |
| P1 | Temporal Gameplay | absolute timestamps, exactly-once completion, offline catch-up, reward emission |
| P1 | World State and Building Lifecycle | placement, move, collect, upgrade, delete protection, HP normalization |
| P1 | Optimistic Commands | local-first mutate/ack/rollback flows |
| P2 | Combat and AI | monster targeting, movement, attacks, destruction, cooldowns |
| P2 | Resource Economy and Harvesting | inventory, gold/rubies, tree-hit rewards, market, caps |
| P2 | Social and Meta Systems | chat, private messages, clans, friends, leaderboards, elections |
| P3 | Canonical Data and Assets | building/item definitions and public asset references |
| P3 | Presentation and Performance | frame budget, rerenders, startup, asset loading, network bursts |

### P1 - Realtime and Persistence

Freeze: initial fetch-before-subscribe ordering, bounded retries, tombstones, auth semantics, and compatibility behavior. Why: the persistence boundary decides whether the client sees truth or stale state. Owner: `src/pocketbase.ts` with server hook counterparts in `pb_hooks/**`. Source of truth: PocketBase records and auth store. Persistence: yes. Optimistic state: mirrors, caches, and provisional writes. Realtime interaction: central. Replay sensitivity: very high. Regression risk: stale snapshots, delete resurrection, auth drift, duplicate event replay. Verification complexity: very high. Evidence ref: `EA-1`.

### P1 - Temporal Gameplay

Freeze: absolute timestamps, exactly-once completion, offline catch-up, reward emission, and destruction windows. Why: a single stale timer can double-complete a process or duplicate rewards. Owner: `App.tsx` orchestrates the flow; `src/pocketbase.ts` persists it; `data/buildings.ts` supplies canonical durations and durability facts. Source of truth: persisted end timestamps and completion fields in PocketBase. Persistence: yes. Optimistic state: display-only countdowns and provisional local timers. Realtime interaction: yes. Replay sensitivity: very high. Regression risk: double completion, stale timer, duplicated reward, rollback race. Verification complexity: very high. Evidence ref: `EA-2`.

### P1 - World State and Building Lifecycle

Freeze: placement validation, move/collect/upgrade/delete-protection flows, HP normalization, and map-resource occupancy. Why: save safety and world consistency depend on building lifecycle staying deterministic. Owner: `App.tsx` with canonical building config in `data/buildings.ts` and persistence in `src/pocketbase.ts`. Source of truth: building records plus canonical config. Persistence: yes. Optimistic state: local placement and action previews. Realtime interaction: yes. Replay sensitivity: high. Regression risk: invalid placement, ghost buildings, HP desync, duplicate delete, stale occupancy. Verification complexity: high. Evidence ref: `EA-3`.

### P1 - Optimistic Commands

Freeze: local-first mutate/ack/rollback paths for placement, move, upgrade, collect, repair, protection, and other duplicate-submit-prone actions. Why: wrong rollback semantics can create duplicate effects or hide server rejection. Owner: `App.tsx` and `src/pocketbase.ts`. Persistent authority: the authoritative PocketBase record/state. Acknowledgement and reconciliation converge the optimistic mirror; they are not the source of truth. Persistence: yes. Optimistic state: primary. Realtime interaction: yes. Replay sensitivity: high. Regression risk: duplicate submits, late-ack overwrite, rollback gaps. Verification complexity: high. Evidence ref: `EA-4`.

### P2 - Combat and AI

Freeze: monster spawn/respawn, target selection, movement, attacks, cooldowns, and destruction resolution. Why: combat is deterministic only if selection, movement, and hit logic stay aligned. Owner: `App.tsx`, `data/destructionWeapons.ts`, and `src/game/monsters/monsterAnimationConfig.ts`. Source of truth: combat state plus canonical monster/building config. Persistence: yes. Optimistic state: limited. Realtime interaction: yes. Replay sensitivity: high. Regression risk: double hit, stale target, pathing divergence, double destroy. Verification complexity: high. Evidence ref: `EA-5`.

### P2 - Resource Economy and Harvesting

Freeze: inventory mutation, gold/rubies, tree-hit rewards, market listings, resource transfers, caps, and item identity. Why: duplicated rewards or wrong prices corrupt progression quickly. Owner: `App.tsx`, `src/pocketbase.ts`, `data/items.ts`, `src/game/economy/**`, `src/game/market/**`, and `pb_hooks/tree_server_utils.js`. Source of truth: PocketBase resource fields and canonical item definitions. Persistence: yes. Optimistic state: yes for resource deltas and trade flows. Realtime interaction: yes. Replay sensitivity: medium-high. Regression risk: duplicated reward, lost inventory, stale market, cap overflow. Verification complexity: high. Evidence ref: `EA-6`.

### P2 - Social and Meta Systems

Freeze: chat, private messages, clans, friends, leaderboards, elections, and profile sync/presence. Why: these systems are heavily cached and realtime-driven, so stale merges or bad ownership rules create confusing cross-user regressions. Owner: `App.tsx` and `src/pocketbase.ts`. Source of truth: PocketBase records are the persistent authority for social state. Presence and roster caches are transient mirrors/read models used to derive visible online state. Persistence: yes. Optimistic state: local previews and caches. Realtime interaction: yes. Replay sensitivity: medium-high. Regression risk: duplicate messages, wrong membership, stale rankings, election timer drift. Verification complexity: high. Evidence ref: `EA-7`.

### P3 - Canonical Data and Assets

Freeze: building/item IDs, building stats, destruction weapon mappings, and public asset references. Why: a small identity or asset-path change can silently break many runtime surfaces at once. Owner: `data/buildings.ts`, `data/items.ts`, `data/destructionWeapons.ts`, and `public/**`. Source of truth: canonical data files and asset paths. Persistence: indirect through saved IDs and references. Optimistic state: none. Realtime interaction: limited. Replay sensitivity: low-medium. Regression risk: broken references, ID drift, balance drift, missing assets. Verification complexity: medium. Evidence ref: `EA-8`.

### P3 - Presentation and Performance

Freeze: frame budget, rerender storms, startup latency, loading order, image/WebP loading, and network burst handling. Why: the UI can become unusable even when game logic is technically correct. Owner: `App.tsx`, `components/**`, `src/game/**`, and `public/**`. Source of truth: measured runtime behavior and asset-loading behavior on the current source. Persistence: none directly. Optimistic state: UI-only. Realtime interaction: yes through event bursts. Replay sensitivity: medium. Regression risk: jank, slow startup, blank screens, render thrash. Verification complexity: medium-high. Evidence ref: `EA-9`.

## First Characterization Suite

The first wave is a set of atomic characterization tests, not broad multi-domain suites. Every proposed first-wave scenario begins as `UNCONFIRMED_RUNTIME_BEHAVIOR`.

Promotion rule:

- A proposed scenario may move to `CURRENT_ACCEPTED_BEHAVIOR` or `LEGACY_COMPATIBILITY_BEHAVIOR` only after direct current-source confirmation, controlled observation or deterministic fixture evidence, confirmation that it is not a known bug, and owner acceptance of the observed contract.
- `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` cannot be auto-promoted into accepted behavior.
- `KNOWN_BUG_DO_NOT_FREEZE` may not be added to the permanent suite until a separate fix decision exists.

| # | Atomic characterization test | Classification | Evidence ref(s) |
| --- | --- | --- | --- |
| 1 | Initial fetch cannot be overwritten by an older late snapshot. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-1 |
| 2 | Deleted building cannot be resurrected by a reconnect snapshot. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-1, EA-3 |
| 3 | Persisted process whose end time passed completes exactly once. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-2 |
| 4 | Offline catch-up cannot duplicate completion or reward. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-2 |
| 5 | Construction state survives reload and converges from persisted end time. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-2, EA-3 |
| 6 | Production completion survives reconnect and rewards once. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-2, EA-3 |
| 7 | Upgrade completion survives reconnect without duplicate transformation. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-2, EA-3 |
| 8 | Rejected optimistic building placement restores the pre-command state. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-4 |
| 9 | Late command acknowledgement cannot overwrite a newer local intent. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-4 |
| 10 | Destroyed building terminal state survives a later stale snapshot. | UNCONFIRMED_RUNTIME_BEHAVIOR | EA-1, EA-3 |

If later investigation proves any row is a known bug, the row MUST move to `KNOWN_BUG_DO_NOT_FREEZE` before it becomes part of the permanent suite.

## Evidence Appendix

| Ref | Group | Source anchors |
| --- | --- | --- |
| EA-1 | Realtime and Persistence | `src/pocketbase.ts`; `pb_hooks/main.pb.js`; `pb_hooks/tree_server_utils.js`; `specs/_baseline/03-state-ownership.md`; `specs/_baseline/04-pocketbase-contracts.md`; `specs/_baseline/09-realtime-sync.md`; `specs/_baseline/10-optimistic-ui.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/15-invariants.md` |
| EA-2 | Temporal Gameplay | `App.tsx`; `src/pocketbase.ts`; `specs/_baseline/05-timers-and-processes.md`; `specs/_baseline/06-building-system.md`; `specs/_baseline/07-production-system.md`; `specs/_baseline/08-upgrade-system.md`; `specs/_baseline/15-invariants.md` |
| EA-3 | World State and Building Lifecycle | `App.tsx`; `data/buildings.ts`; `src/pocketbase.ts`; `specs/_baseline/06-building-system.md`; `specs/_baseline/07-production-system.md`; `specs/_baseline/08-upgrade-system.md`; `specs/_baseline/10-optimistic-ui.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/15-invariants.md` |
| EA-4 | Optimistic Commands | `App.tsx`; `src/pocketbase.ts`; `specs/_baseline/03-state-ownership.md`; `specs/_baseline/04-pocketbase-contracts.md`; `specs/_baseline/10-optimistic-ui.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/15-invariants.md` |
| EA-5 | Combat and AI | `App.tsx`; `data/destructionWeapons.ts`; `src/game/monsters/monsterAnimationConfig.ts`; `specs/_baseline/05-timers-and-processes.md`; `specs/_baseline/09-realtime-sync.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/15-invariants.md` |
| EA-6 | Resource Economy and Harvesting | `App.tsx`; `src/pocketbase.ts`; `data/items.ts`; `src/game/economy/energyPurchaseOptions.ts`; `src/game/market/marketStaticData.ts`; `pb_hooks/tree_server_utils.js`; `specs/_baseline/04-pocketbase-contracts.md`; `specs/_baseline/07-production-system.md`; `specs/_baseline/10-optimistic-ui.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/15-invariants.md` |
| EA-7 | Social and Meta Systems | `App.tsx`; `src/pocketbase.ts`; `specs/_baseline/03-state-ownership.md`; `specs/_baseline/04-pocketbase-contracts.md`; `specs/_baseline/09-realtime-sync.md`; `specs/_baseline/10-optimistic-ui.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/15-invariants.md`; `specs/_baseline/17-traceability-index.md` |
| EA-8 | Canonical Data and Assets | `data/buildings.ts`; `data/items.ts`; `data/destructionWeapons.ts`; `public/**`; `specs/_baseline/06-building-system.md`; `specs/_baseline/07-production-system.md`; `specs/_baseline/08-upgrade-system.md`; `specs/_baseline/15-invariants.md`; `specs/_baseline/16-risk-register.md` |
| EA-9 | Presentation and Performance | `App.tsx`; `components/**`; `src/game/**`; `public/**`; `specs/_baseline/01-current-architecture.md`; `specs/_baseline/09-realtime-sync.md`; `specs/_baseline/10-optimistic-ui.md`; `specs/_baseline/11-error-handling.md`; `specs/_baseline/12-target-architecture.md`; `specs/_baseline/14-test-strategy.md`; `specs/_baseline/15-invariants.md`; `specs/_baseline/16-risk-register.md`; `specs/_baseline/17-traceability-index.md` |

## Completion Criteria

Feature 002 MVP is complete only when:

- all 10 atomic P1 characterization tests exist;
- each test has one classification and one evidence reference;
- the suite is deterministic on two consecutive unchanged runs;
- the suite does not mutate live PocketBase or player data;
- known bugs are not silently frozen;
- one repeatable command reports pass/fail for the suite;
- runtime behavior remains unchanged except for owner-approved test seams, if those are later required.

## Edge Cases

- A behavior is visible in Graphify but not yet confirmed in current source.
- A surface crosses `App.tsx` and `src/pocketbase.ts` with no single operational owner.
- A surface is persisted but also mirrored locally; the spec must record both instead of collapsing them.
- A surface is replay-sensitive through reconnect or late snapshot rather than through timers.
- A UI surface has no persistence but still carries a measurable performance or replay risk.
- A source-backed group spans several collections or helpers such as `chat_messages`, `clans`, `leaderboard_profiles`, `elections`, or `market`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The spec MUST identify only confirmed runtime surfaces from current source, baseline docs, and Graphify navigation, and it MUST mark any unconfirmed surface as `UNCONFIRMED`.
- **FR-002**: The spec MUST group confirmed surfaces into confirmed project domains rather than inventing new categories.
- **FR-003**: For each grouped surface, the spec MUST record owner, source of truth, persistence, optimistic state, realtime interaction, replay sensitivity, regression risk, and verification complexity.
- **FR-004**: The spec MUST assign a freeze priority to each group and order groups by runtime risk rather than by file size or implementation convenience.
- **FR-005**: The spec MUST distinguish surfaces that need first-wave characterization coverage from those that can wait.
- **FR-006**: The spec MUST define the initial characterization order as a design-only outcome capped at 10 tests.
- **FR-007**: The spec MUST remain read-only with respect to runtime code, baseline docs, Graphify artifacts, AGENTS routing, and skill definitions.
- **FR-008**: The spec MUST classify every proposed characterization scenario with exactly one behavior classification from the approved set.
- **FR-009**: The spec MUST state that characterization freezes accepted behavior only and MUST NOT permanently freeze a known bug without an owner decision.
- **FR-010**: The spec MUST define the MVP boundary as test-runner foundation, deterministic local fixture boundary, no live PocketBase mutation, 10 atomic P1 tests, one repeatable verification command, and no production refactor.
- **FR-011**: The spec MUST distinguish characterization scenario, atomic characterization test, suite, fixture, and harness.
- **FR-012**: The spec MUST keep P2 and P3 groups in future waves unless separately approved by the owner.

### Key Entities *(include if feature involves data)*

- **Runtime Surface**: A confirmed behavior boundary that can regress independently; attributes include owner, source of truth, persistence, optimistic state, realtime interaction, replay sensitivity, regression risk, and verification complexity.
- **Surface Group**: A cluster of runtime surfaces that share a freeze priority and characterization intent.
- **Evidence Anchor**: A real source or baseline file used to justify a surface or group.
- **Freeze Priority**: The relative order in which characterization coverage should be written or reviewed.
- **Critical Regression Mode**: The most likely failure family for a surface, such as double completion, stale snapshot, duplicate reward, or rollback race.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every confirmed critical runtime surface in the project appears in exactly one group or in a clearly marked cross-cutting note.
- **SC-002**: Every group in the spec includes the required ownership and risk fields plus at least one real evidence anchor.
- **SC-003**: The spec orders groups so that the highest replay- and persistence-risk surfaces are frozen first.
- **SC-004**: The first-wave characterization recommendation is no larger than 10 tests and targets the highest-risk groups before lower-risk presentation or asset concerns.
- **SC-005**: No implementation, harness, runtime, AGENTS, baseline, or Graphify modification is required to approve the spec.
- **SC-006**: All 10 atomic P1 tests are individually listed and each one carries exactly one classification plus one evidence reference.
- **SC-007**: The first-wave suite produces the same result on two consecutive unchanged runs and does not mutate live PocketBase or player data.
- **SC-008**: Any discovered known bug is excluded from the permanent suite until an owner decision is recorded.
- **SC-009**: One repeatable command can report pass/fail for the first-wave suite.

## Assumptions

- Current source and baseline docs are the final authority; Graphify is navigation only.
- Behavior that cannot be proven from current source or baseline stays `UNCONFIRMED` instead of being guessed.
- Shared ownership is recorded as shared ownership rather than forced into a false single-owner model.
- The first characterization suite will be written later, after this design pass is approved, and will use the repository’s existing verification strategy when that phase arrives.
