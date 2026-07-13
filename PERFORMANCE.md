# Performance

This file records the current performance rules for the MMO client and PocketBase usage.

## Hard Limits

- Do not call `getFullList(users)` unless the use case is proven safe.
- Do not sort or filter by fields that are not indexed or are too wide for the current query shape.
- Do not subscribe to the entire map when a zone-scoped query is enough.
- Do not load the whole world if the player only needs visible sectors.
- Do not create duplicate realtime subscriptions for the same data.
- Do not write to PocketBase every frame.
- Do not clear state while a request is still retrying.

## Current Guardrails In Code

- Zone loading is scoped and retried with limits.
- Leaderboard queries are capped.
- Chat queries are capped.
- Presence queries are capped.
- Tree hits go through a dedicated server endpoint.
- PocketBase wrappers dedupe in-flight requests and preserve last good data.

## Recommended Budgets

Use these as rough targets:

| Area | Target |
|---|---|
| World loading | Load only visible or nearby zones |
| Realtime listeners | One listener per logical view |
| Leaderboard | Top-N only |
| Chat history | Bounded window |
| Presence | Bounded window |
| Writes | Only on meaningful state changes |

## Expensive Patterns To Avoid

- full-table scans for public screens
- broad `in` queries over too many zones
- repeated update loops that write the same state again and again
- clearing loaded data before a retry finishes
- repeated cleanup logic that re-triggers the same delete work
- per-frame persistence for movement, animation, or hover state

## Safe Alternatives

- Load by zone, sector, or page.
- Keep optimistic client state, but preserve the previous good snapshot.
- Batch writes only when the action is complete.
- Prefer server-side resolution for shared world state.
- Keep cosmetic state local unless it must be shared.

## When To Be Extra Careful

- `src/pocketbase.ts`
- `App.tsx`
- world generation
- chat cleanup
- leaderboard changes
- inventory updates
- tree or respawn logic

