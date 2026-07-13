# Ownership Matrix

## Purpose

Record the current ownership model for each first-wave scenario.

## Matrix

| # | Scenario | Owner | Source of Truth | Persistence | Optimistic State | Realtime Interaction | Replay Sensitivity | Regression Risk | Verification Complexity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Initial fetch cannot be overwritten by an older late snapshot. | `src/pocketbase.ts` | PocketBase record state plus merge order | yes | mirrored realtime snapshot state | central | very high | stale snapshot, state rollback | very high |
| 2 | Deleted building cannot be resurrected by a reconnect snapshot. | `App.tsx` and `src/pocketbase.ts` | tombstoned building record state | yes | local delete mirror | central | very high | ghost building, resurrection | very high |
| 3 | Persisted process whose end time passed completes exactly once. | `App.tsx` | persisted end timestamp and completion state | yes | display countdown only | yes | very high | double completion | very high |
| 4 | Offline catch-up cannot duplicate completion or reward. | `App.tsx` | persisted end timestamp and reward state | yes | local catch-up preview | yes | very high | duplicated reward | very high |
| 5 | Construction state survives reload and converges from persisted end time. | `App.tsx` and `src/pocketbase.ts` | construction record plus end timestamp | yes | provisional construction timer | yes | high | timer reset, premature finish | very high |
| 6 | Production completion survives reconnect and rewards once. | `App.tsx` and `src/pocketbase.ts` | production record plus completion fields | yes | provisional production timer | yes | very high | duplicate reward, stale completion | very high |
| 7 | Upgrade completion survives reconnect without duplicate transformation. | `App.tsx` and `src/pocketbase.ts` | upgrade record plus transformed target state | yes | provisional upgrade timer | yes | very high | double transformation | very high |
| 8 | Rejected optimistic building placement restores the pre-command state. | `App.tsx` and `src/pocketbase.ts` | authoritative PocketBase record/state | yes | local placement mirror | yes | high | rollback gap | high |
| 9 | Late command acknowledgement cannot overwrite a newer local intent. | `App.tsx` and `src/pocketbase.ts` | authoritative PocketBase record/state | yes | local intent queue | yes | high | late-ack overwrite | high |
| 10 | Destroyed building terminal state survives a later stale snapshot. | `src/pocketbase.ts` and `App.tsx` | tombstoned building record state | yes | local destroyed-state mirror | central | very high | resurrection, stale merge | very high |

## Notes

- Persistent authority always stays with the authoritative PocketBase record or
  derived record state.
- Mirrors, countdowns, and optimistic previews are not source of truth.
- If ownership cannot be stated without guessing, the scenario stays
  unconfirmed.
