---
name: basing-performance
description: Use when diagnosing or changing FPS, frame time, React renders, batching, virtualization, startup latency, texture or image loading, WebP, lazy loading, PocketBase latency, realtime event storms, or render-budget bottlenecks.
---

# Purpose

Keep performance work measured, narrow, and tied to a proven bottleneck.

## Skill Version

1.0

## Required Companion Skills

- `basing-project-navigation`
- `basing-change-safety`
- `basing-verification`
- `basing-realtime-sync`
- `basing-pocketbase-contracts`
- `basing-state-ownership`

## Sources Of Truth

- `App.tsx`
- `src/pocketbase.ts`
- `components/**`
- `public/**`
- `specs/_baseline/01-current-architecture.md`
- `specs/_baseline/09-realtime-sync.md`
- `specs/_baseline/10-optimistic-ui.md`
- `specs/_baseline/11-error-handling.md`
- `specs/_baseline/12-target-architecture.md`
- `specs/_baseline/14-test-strategy.md`
- `specs/_baseline/15-invariants.md`
- `specs/_baseline/16-risk-register.md`
- `specs/_baseline/17-traceability-index.md`

## Core Rules

- Measure first.
- Identify the bottleneck before changing code.
- Optimize the narrowest hot path that the evidence proves.
- Prefer frame time, render count, payload size, and request latency over intuition.
- Treat `React.memo`, `useMemo`, and `useCallback` as tools, not goals.
- Use `basing-pocketbase-contracts` when latency is data-bound.
- Use `basing-realtime-sync` when event storms or reconnect bursts dominate.
- Use `basing-state-ownership` when extra renders come from misplaced state.

## Common Failure Modes

- Optimizing a guess instead of a measured bottleneck.
- Sprinkling memoization everywhere without proving it helps.
- Fixing one render storm by adding a broader rerender storm.
- Confusing startup latency with steady-state frame time.
- Treating asset loading slowness as a rendering problem.

## Never Do

- Optimize on feel alone.
- Change balance or gameplay logic as a performance shortcut.
- Turn this into heap, GC, leak, or disposal analysis.
- Add memoization that obscures correctness or ownership.
- Chase micro-optimizations before measuring the hot path.

## Examples

- Good: measure a slow shop open, confirm PocketBase latency, then cache the exact request path.
- Good: prove a list scroll drops frames, then virtualize that list only.
- Wrong: wrap every component in `React.memo` because the UI seems heavy.
- Wrong: start debugging heap usage when the symptom is repeated rerenders.

## Workflow

1. Reproduce the slowdown.
2. Measure it in frames, renders, latency, or payload size.
3. Locate the narrow hot path.
4. Pick the smallest change that addresses the measured bottleneck.
5. Re-measure the same path.
6. Keep the fix if the evidence improves.

## Invariants

- A faster guess is not a performance fix.
- A local optimization that shifts cost elsewhere is a regression until proven otherwise.
- If the bottleneck moves, re-measure before expanding the patch.
- Optimization stops where ownership or persistence questions begin.

## Stop Conditions

- The problem is actually memory, GC, leaks, or resource cleanup.
- The bottleneck has not been measured.
- The fix would become a broad rewrite.
- The task needs a separate persistence, realtime, or state-ownership skill first.

## Verification

- Compare before/after frame time, render count, or latency on the same path.
- Confirm the bottleneck improved without changing behavior.
- Confirm no unrelated subsystem was widened just to chase speed.
