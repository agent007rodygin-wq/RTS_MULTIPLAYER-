# Development Rules

These are the rules that keep the game stable while the codebase grows.

## General Rules

- Do not change gameplay code without thinking through the ripple effects.
- Do not "fix" a slow query by only increasing a timeout.
- Do not clear already loaded data just because a request is retrying.
- Prefer preserving the last good state over showing an empty placeholder.
- Keep changes small when touching shared systems.

## PocketBase Rules

- Never do a full `users` query unless you know it is safe.
- Never add a new sort or filter without checking whether the target field needs an index.
- Never assume a timeout means "no data."
- Never treat a transient network or realtime error as a missing record.
- When a collection changes, check both the client query and the PocketBase schema.
- When you touch `buildings`, think about owner, zone, and world-scan load together.

## Realtime Rules

- Every subscription must have a cleanup path.
- Changing tabs, zones, or modal state must not leave old subscriptions alive.
- Do not create unbounded retry loops.
- If realtime is unavailable, fall back gracefully without destroying existing data.
- Keep initial snapshot fetches conservative and deduped.

## State Preservation Rules

- Inventory must survive:
  - market actions
  - snapshot refreshes
  - re-login
- Leaderboard must preserve the last good data while retrying.
- Chat must not drop messages because of cleanup or retry noise.
- Building and world state should not be replaced by stale partial data.

## Lessons Learned

- Never use `users` collection for public leaderboard data.
- Never clear inventory because a snapshot is empty.
- Never replace JSON inventory; always merge it.
- Never treat a PB byte-array inventory payload as plain array data.
- Never move fields from top-level to `data` without checking the queries first.
- Never let the client decide respawn timing.
- Tree hits must go through `requestTreeHit`.
- Server owns reward distribution for trees, not the client.
- Realtime retries must preserve previous state.
- Timeout does not mean no data.
- A `404` after delete is often normal in a realtime race condition.

## Gameplay-Specific Checks

### After Changing Trees

- verify tree hits
- verify energy cost
- verify reward grants
- verify respawn
- verify inventory and glory updates

### After Changing Inventory

- verify trees
- verify market
- verify gifts
- verify construction

### After Changing Chat

- verify normal chat
- verify shout
- verify clan chat
- verify police chat
- verify private messages
- verify system cleanup

### After Changing Leaderboard

- verify all tabs
- verify switching tabs
- verify the current player is not the only visible player
- verify data does not blank during retries

### After Changing Construction

- verify place
- verify upgrade
- verify move
- verify demolish
- verify timers

### After Changing PocketBase Wrapper

- verify leaderboard
- verify inventory
- verify chat
- verify market
- verify clans
- verify presence
- verify world loading

## Required Check Scopes

- Small fix:
  - `GAME_CHECKLIST.md` quick smoke items related to the change
- Single-system refactor:
  - quick smoke
  - matching subsystem smoke
- Shared infrastructure change:
  - quick smoke
  - all subsystem smoke for impacted systems
- Large refactor or release:
  - quick smoke
  - all subsystem smoke
  - full regression

## Code Review Rules

- If a change touches `src/pocketbase.ts`, look for:
  - timeout behavior
  - deduplication
  - queue pressure
  - snapshot preservation
  - query shape and index risk
- If a change touches `App.tsx`, look for:
  - duplicate subscriptions
  - stale cleanup
  - state resets
  - loading flicker
  - interaction between systems

## App.tsx Change Limits

If `App.tsx` is modified:

- Never rewrite more than one subsystem in one patch.
- Never perform a large search-and-replace across the file.
- Never rename hundreds of variables in one change.
- Prefer extracting code into smaller helpers instead of rewriting existing logic.
- Changes above 300 lines require explicit justification.

## Documentation Rules

- Keep `GAME_ARCHITECTURE.md` updated when the system shape changes.
- Keep `KNOWN_BUGS.md` updated when a recurring issue is found or fixed.
- Keep `DEVELOPMENT_RULES.md` updated when a lesson becomes a durable rule.
- Keep `DATABASE_SCHEMA.md`, `NETWORK_FLOW.md`, `PERFORMANCE.md`, `ROADMAP.md`, and `POSTMORTEMS.md` current when their subject area changes.
- Use `GAME_CHECKLIST.md` for verification, not as a place to store architecture notes.

## Practical Reminder

If a change can affect more than one subsystem, assume it will.
