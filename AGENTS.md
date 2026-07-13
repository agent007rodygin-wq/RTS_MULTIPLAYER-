# Project Router

This repository is a React/Vite MMO/RTS game backed by PocketBase. `App.tsx`
is the orchestration root and `src/pocketbase.ts` is the persistence and
realtime adapter. Graphify is navigation only; current source and the SDD
baseline are the evidence layer.

## Start Every Task

1. Read this file.
2. Read `.specify/memory/constitution.md`.
3. Pick the narrowest `basing-*` skill set.
4. Say which skills you are using and why.
5. Read the current source and the cited baseline docs before editing.

## Sources Of Truth

1. Current source code.
2. PocketBase contracts and runtime behavior.
3. `.specify/memory/constitution.md`.
4. `specs/_baseline/00-project-overview.md`
5. `specs/_baseline/01-current-architecture.md`
6. `specs/_baseline/03-state-ownership.md`
7. `specs/_baseline/04-pocketbase-contracts.md`
8. `specs/_baseline/05-timers-and-processes.md`
9. `specs/_baseline/06-building-system.md`
10. `specs/_baseline/07-production-system.md`
11. `specs/_baseline/08-upgrade-system.md`
12. `specs/_baseline/09-realtime-sync.md`
13. `specs/_baseline/10-optimistic-ui.md`
14. `specs/_baseline/11-error-handling.md`
15. `specs/_baseline/12-target-architecture.md`
16. `specs/_baseline/13-migration-roadmap.md`
17. `specs/_baseline/14-test-strategy.md`
18. `specs/_baseline/15-invariants.md`
19. `specs/_baseline/16-risk-register.md`
20. `specs/_baseline/17-traceability-index.md`
21. `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json` for navigation only.
22. Backups, restores, and test artifacts last.

## Skill Routing

- `basing-project-navigation` for live-source discovery, source anchors, and
  Graphify freshness.
- `basing-change-safety` for any edit, refactor, or patch that could affect
  runtime behavior.
- `basing-performance` for FPS, frame time, renders, batching, virtualization,
  startup latency, texture and image loading, PocketBase latency, realtime
  event storms, or render-budget bottlenecks.
- `basing-pocketbase-contracts` for PocketBase reads/writes, auth, schema
  assumptions, hooks, or record compatibility.
- `basing-realtime-sync` for subscriptions, snapshots, retries, tombstones,
  stale events, or merge races.
- `basing-process-time` for construction, production, upgrades, destruction,
  offline catch-up, or absolute timestamp logic.
- `basing-buildings-production-upgrades` for placement, construction,
  production, collection, upgrades, speed-up, or deletion protection.
- `basing-optimistic-commands` for local-first actions, duplicate submits,
  reconciliation, and rollback.
- `basing-monster-combat-ai` for spawn, respawn, target selection, movement,
  attacks, destruction, or combat cooldowns.
- `basing-state-ownership` for deciding what is server-owned, client-owned,
  mirrored, cached, optimistic, or tombstoned.
- `basing-debug-investigation` for root-cause work on wrong, flaky, or
  unexplained behavior.
- `basing-verification` for proving scope and completion with fresh evidence.
- `basing-content-and-assets` for canonical data, item/building definitions,
  and public assets.

## Skill Format

Every `basing-*` skill should stay compact and include:

- `Skill Version`
- `Common Failure Modes`
- `Never Do`
- `Examples`

Keep these sections short and domain-specific so the skill stays easy to scan.

## Spec Kit Routing

- `speckit-specify` for new feature specs.
- `speckit-clarify` for ambiguous requirements.
- `speckit-plan` for implementation plans.
- `speckit-tasks` for dependency-ordered task lists.
- `speckit-converge` and `speckit-analyze` for spec, plan, and task
  consistency.
- `speckit-taskstoissues` when converting tasks to issues.
- `speckit-constitution` when project governance itself changes.

## Risk Classification

Verification depth is selected by runtime risk, not by line count.

| Risk | Typical changes | Required checks |
| --- | --- | --- |
| LOW | docs, comments, formatting, runtime-neutral text | targeted diff review; `git diff --check` |
| MEDIUM | types, local UI state, pure helpers, TypeScript fixes | `npm run lint`; `node check_regressions_worker6.mjs`; `git diff --check` |
| HIGH | timers, completion, PocketBase, realtime, optimistic state, economy, rewards, combat, deletion, migrations, saves, schema, auth, permissions | `npm run lint`; `node check_regressions_worker6.mjs`; `verify_repository_health.ps1`; `git diff --check`; build/network only with owner approval |

Any HIGH-risk patch requires `basing-verification` even when the diff is a single line.

## Owner Approval Required

Do not proceed without explicit owner approval for:

- PocketBase schema changes.
- Collection or field renames.
- Compatibility removal.
- Balance, prices, rewards, or durations.
- Save format changes.
- Disputed asset deletion.
- Destructive migrations.
- Network helpers.
- Local-write build checks.
- Broad rewrites.
- Feature 002.
- Commit, push, or merge.

## Global Stop Conditions

Stop and realign if any of the following appear:

- Source and baseline conflict.
- Graphify is stale.
- The source of truth is unclear.
- No rollback path is available.
- A second source of truth appears.
- An unexpected file changes.
- Verification reveals new errors.
- Owner decision is still needed.

## Completion Report Requirements

Every implementation pass must report:

- used skills;
- root cause or source anchor;
- changed files;
- risk level;
- checks run;
- results;
- skipped checks;
- blockers;
- owner decisions;
- git diff summary;
- intentional non-goals.

## Anti-Monolith Rule

If this file or any `SKILL.md` starts to mix independent responsibilities or
grow beyond a compact routing or domain guide, stop and propose a new
specialized `basing-*` skill instead of inflating the existing document.

## Protected Scope

- Do not edit `App.tsx`, `src/pocketbase.ts`, `types.ts`, `data/**`,
  `components/**`, `pb_hooks/**`, `public/**`, PocketBase schema/data,
  gameplay balance, durations, prices, rewards, or save formats unless the
  user explicitly asks and the right domain skill plus
  `basing-change-safety`/`basing-verification` are open.
- Do not modify runtime source, baseline docs, Graphify artifacts, or Spec Kit
  files during router-only passes.
- Do not start Feature 002.
- If a task needs a new stable domain, propose a new `basing-*` skill instead
  of inflating an existing one.
