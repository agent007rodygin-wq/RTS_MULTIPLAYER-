<!--
Sync Impact Report
Version change: template -> 1.0.0 (initial ratification)
Modified principles: placeholders -> Specification First, Evidence Always; Server Authority and Data Integrity; Temporal Correctness and Idempotency; Compatibility and Player Save Safety; Incremental Change and Verification
Added sections: Mandatory Constraints; Delivery Workflow and Quality Gates
Removed sections: none
Templates checked: .specify/templates/plan-template.md (aligned, no change); .specify/templates/spec-template.md (aligned, no change); .specify/templates/tasks-template.md (aligned, no change); .specify/templates/commands/ (not present)
Deferred items: none
-->

# Basingse Real-Time MMO Constitution

## Core Principles

### I. Specification First, Evidence Always
Every non-trivial change starts with direct evidence from the current repo,
then a clear specification of the desired behavior, then clarification of any
ambiguities. Graphify, diagrams, and notes are navigation aids only; they do
not prove runtime behavior. Specs, plans, and tasks must be written before
implementation for any non-trivial change. Any claim that is not proven by
source or runtime evidence must remain `UNCONFIRMED`.

### II. Server Authority and Data Integrity
PocketBase is the source of truth for persistent multiplayer state. Client-side
optimistic UI is allowed only when it can be reconciled with the authoritative
server result or safely rolled back. The client must not invent rewards,
respawns, ownership changes, or other shared-world state. `src/pocketbase.ts`
is the canonical data-access layer for request queueing, deduplication, timeout
handling, field normalization, and realtime subscriptions. Bypassing it
requires explicit justification. Realtime and retry paths must preserve the
last good state instead of clearing data on transient failures.

### III. Temporal Correctness and Idempotency
Construction, production, upgrades, destruction, respawn, timer catch-up, and
offline reconciliation must use canonical absolute timestamps and must be
idempotent. Local countdowns are display-only. A completion, reward, or state
transition may be applied once and only once. Duplicate realtime events, stale
snapshots, reconnects, and out-of-order responses must not double-apply
elapsed time or overwrite newer confirmed state. If a process can run after a
reload or reconnect, it must still converge to the same result.

### IV. Compatibility and Player Save Safety
Existing collections, field names, record shapes, item IDs, balance values, and
saved player data are stable contracts. Do not rename or remove PocketBase
collections or fields, change record formats, or alter gameplay balance
without an explicit migration spec, a rollback plan, and owner approval.
Legacy fallbacks stay in place until they are intentionally retired. Any
migration that could affect saves, rewards, progress, or access must be
treated as a high-risk change.

### V. Incremental Change and Verification
The codebase must evolve in small, reviewable, reversible slices. `App.tsx`
is the orchestration root and should not be rewritten wholesale; prefer
extracting focused helpers or modules when a change naturally exposes a
boundary. Each meaningful change must have clear acceptance criteria, a
bounded scope, and a verification step using existing project scripts or
documented checks. Changes touching shared systems must prove they do not
introduce stale subscriptions, loading flicker, hidden retries, or regressions
in unrelated subsystems.

## Mandatory Constraints

- Stack remains React + Vite + TypeScript on the client, with PocketBase as
  the backend and realtime layer.
- `App.tsx` remains the main gameplay orchestrator until a separately approved
  refactor plan exists.
- `src/pocketbase.ts` remains the canonical wrapper for data access, retries,
  queueing, realtime, and partial-update safety.
- No change may alter game balance, item identities, collection names, field
  names, or save formats without an approved migration path.
- Graphify may be used to find related code, but source code and runtime
  behavior are the final authority.
- Durable rules in `DEVELOPMENT_RULES.md`, `PROJECT_DECISIONS.md`,
  `GAME_ARCHITECTURE.md`, and `NETWORK_FLOW.md` stay aligned with this
  constitution.

## Delivery Workflow and Quality Gates

- Start with evidence, then write or update the spec, then clarify
  ambiguities, then create the technical plan, then break work into small
  tasks, then implement only the approved scope.
- Any change that touches realtime, timers, optimistic UI, or PocketBase must
  explicitly consider success, timeout, network failure, duplicate event,
  out-of-order event, reconnect, and rollback behavior.
- Any spec or plan that affects schema, migrations, access control, balance,
  rewards, or saved data requires owner approval before implementation.
- Use only commands that already exist in `package.json` or are explicitly
  documented in the repo for validation.
- If a behavior cannot be proven, record it as `UNCONFIRMED` rather than
  promoting it to fact.
- Every meaningful delivery must end with a verification pass and a checked
  file list.

## Governance

This constitution overrides other guidance when there is a conflict.
Amendments require an explicit rationale, a version bump, and an updated sync
impact report. Versioning rules are:

- MAJOR: backward-incompatible governance changes or principle removals or
  redefinitions
- MINOR: new principles or materially expanded guidance
- PATCH: clarifications, wording fixes, or non-semantic refinements

A proposed change must be reviewed against the current source, the active
spec, and the affected runtime paths before adoption. If a change conflicts
with the constitution, the constitution wins until amended.

**Version**: 1.0.0 | **Ratified**: 2026-07-12 | **Last Amended**: 2026-07-12
