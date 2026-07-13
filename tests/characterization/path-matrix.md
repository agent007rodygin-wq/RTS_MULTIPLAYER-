# Path Matrix

## Purpose

Record how each first-wave scenario reaches the runtime surface that needs to
be frozen.

## Matrix

| # | Scenario | Persistence Path | Realtime Path | Timer Path | Optimistic Path | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Initial fetch cannot be overwritten by an older late snapshot. | PocketBase record merge | initial fetch vs stale snapshot | no | no | pure realtime ordering |
| 2 | Deleted building cannot be resurrected by a reconnect snapshot. | tombstone persistence | reconnect replay | no | no | stale snapshot resurrection guard |
| 3 | Persisted process whose end time passed completes exactly once. | persisted end timestamp | possible replay on reload | absolute timestamp completion | no | exactly-once completion |
| 4 | Offline catch-up cannot duplicate completion or reward. | persisted completion state | resume after offline gap | frozen clock / catch-up | no | reward duplication guard |
| 5 | Construction state survives reload and converges from persisted end time. | construction record | reload plus post-reload replay | construction timer | no | reload convergence path |
| 6 | Production completion survives reconnect and rewards once. | production record | reconnect replay | production timer | no | once-only reward path |
| 7 | Upgrade completion survives reconnect without duplicate transformation. | upgrade record | reconnect replay | upgrade timer | no | one transformation only |
| 8 | Rejected optimistic building placement restores the pre-command state. | authoritative record after reject | server reject reply | no | optimistic placement rollback | local state restore path |
| 9 | Late command acknowledgement cannot overwrite a newer local intent. | authoritative record after late ack | delayed ack vs newer intent | no | optimistic command reconciliation | late-ack race path |
| 10 | Destroyed building terminal state survives a later stale snapshot. | tombstone persistence | stale reconnect snapshot | no | no | destroyed-state merge guard |

## Notes

- The matrix records observation paths, not implementation plans.
- If a path would require a broad production refactor to observe, stop and
  re-scope.
