# Scenario Index

## Purpose

List the 10 first-wave atomic scenarios and their initial freeze order.

## Classification Rule

All scenarios start as `UNCONFIRMED_RUNTIME_BEHAVIOR`.

## First-Wave Order

| # | Scenario | Group | Initial Classification | Freeze Slice | Evidence Ref |
| --- | --- | --- | --- | --- | --- |
| 1 | Initial fetch cannot be overwritten by an older late snapshot. | Realtime and Persistence | `UNCONFIRMED_RUNTIME_BEHAVIOR` | A | EA-1 |
| 2 | Deleted building cannot be resurrected by a reconnect snapshot. | Realtime and Building Lifecycle | `UNCONFIRMED_RUNTIME_BEHAVIOR` | A | EA-1, EA-3 |
| 3 | Persisted process whose end time passed completes exactly once. | Temporal Gameplay | `UNCONFIRMED_RUNTIME_BEHAVIOR` | B | EA-2 |
| 4 | Offline catch-up cannot duplicate completion or reward. | Temporal Gameplay | `UNCONFIRMED_RUNTIME_BEHAVIOR` | B | EA-2 |
| 5 | Construction state survives reload and converges from persisted end time. | Temporal Gameplay and Building Lifecycle | `UNCONFIRMED_RUNTIME_BEHAVIOR` | B | EA-2, EA-3 |
| 6 | Production completion survives reconnect and rewards once. | Temporal Gameplay and Building Lifecycle | `UNCONFIRMED_RUNTIME_BEHAVIOR` | B | EA-2, EA-3 |
| 7 | Upgrade completion survives reconnect without duplicate transformation. | Temporal Gameplay and Building Lifecycle | `UNCONFIRMED_RUNTIME_BEHAVIOR` | B | EA-2, EA-3 |
| 8 | Rejected optimistic building placement restores the pre-command state. | Optimistic Commands | `UNCONFIRMED_RUNTIME_BEHAVIOR` | C | EA-4 |
| 9 | Late command acknowledgement cannot overwrite a newer local intent. | Optimistic Commands | `UNCONFIRMED_RUNTIME_BEHAVIOR` | C | EA-4 |
| 10 | Destroyed building terminal state survives a later stale snapshot. | Realtime and Building Lifecycle | `UNCONFIRMED_RUNTIME_BEHAVIOR` | A | EA-1, EA-3 |

## Freeze Order Notes

- Slice A protects stale-snapshot and tombstone behavior first.
- Slice B protects time-based completion and reward delivery next.
- Slice C protects optimistic rollback and late-ack reconciliation last.
- P2 and P3 surfaces are excluded from the first wave.
