# T038 Source Audit

## Target

Scenario 10: `Destroyed building terminal state survives a later stale snapshot.`

This is the next characterization target after the completed Scenario 2 tombstone/reconnect contract. It remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.

## Exact Source Trail

1. `src/pocketbase.ts:onSnapshot` (`1842-2257`)
   - `getDoc()` and `fetchQueryRecords()` perform the initial fetch before the subscription is trusted.
   - The adapter annotates `refresh-load` vs `realtime-event` so the source of each snapshot remains visible.
   - `deadBuildingIds` and `deletedRecordKeys` suppress deleted records, but that is a separate deletion-suppression path, not the destruction-terminal-state contract.

2. `App.tsx:updatePlacedBuildingsFromServer` (`7926-8263`)
   - builds `activeDeletingBuildingIds` and `activeConfirmedDeletedBuildingIds`
   - filters reconnect snapshot buildings through `filterReconnectSnapshotBuildingsByTombstones(...)`
   - applies `processOfflineTimers(...)` after snapshot merge
   - merges each building through `resolvePlacedBuildingSnapshotMerge(...)`
   - updates `lastServerSyncRef`

3. `App.tsx:processOfflineTimers` (`633-760`)
   - the destruction completion branch runs when `isDestroying` is true and `now >= getEffectiveDestructionExpiresAt(building)`
   - the branch clears destruction fields and writes the finished state back when allowed

4. `App.tsx` destruction and stale-snapshot guards (`11373-11389`, `12139-12161`, `12672-12698`)
   - `lastServerSyncRef` and `STICKY_INTERACTION_MS` reduce stale overwrite risk
   - `shouldPreferServerRevivedBuildingState(...)` can revive a live server record over a locally destroyed one when the server clearly wins
   - the cleanup effect only deletes dead buildings when they are not still protected by server revival

5. `src/game/buildings/resolveBuildingSnapshotMerge.js` (`37-213`)
   - the pure merge helper is the production decision boundary for per-building snapshot reconciliation
   - destruction-relevant decisions include `skip_server_dead`, `replace_local_with_server`, `keep_local_sticky`, `accepted_server_matches_local`, and `accept_server_update`

6. `App.tsx` deletion/tombstone ownership (`3307-3339`, `3475-3479`)
   - `deletingBuildingsRef` and `confirmedDeletedRef` are suppression caches
   - `removeBuildingFromSnapshotCaches(...)` marks deletions and clears the snapshot caches

7. `types.ts:122-171`
   - `PlacedBuilding` owns the fields that matter here: `isDestroying`, `destructionEndTime`, `destructionExpiresAt`, `destructionDurationMs`, `destructionMaxLifetimeMs`, `hp`, `maxHp`, `pendingDamage`, `lastMoveTime`, `lastAttackTime`, `protectionEndTime`, and `initiatorId`

## Decision Boundary

The main reconciliation boundary is `updatePlacedBuildingsFromServer(...)`.

Inside that path, the destruction-specific decision is split across:
- `processOfflineTimers(...)` for local terminal-state completion
- `resolvePlacedBuildingSnapshotMerge(...)` for per-building snapshot reconciliation
- `shouldPreferServerRevivedBuildingState(...)` for the revive-vs-preserve choice when the building is already in a terminal-looking state

## State Ownership

- Persistent authority: PocketBase `buildings` records.
- Client mirrors / caches: `placedBuildings`, `serverZoneBuildingsRef`, `serverMyBuildingsRef`, `lastServerSyncRef`, `lastInteractionRef`, `deletingBuildingsRef`, `confirmedDeletedRef`.
- The terminal destruction state itself is stored on the building record, but the client caches decide whether a stale snapshot is suppressed, finalized, or allowed to revive the record.

## Reconnect Implications

- `onSnapshot()` is fetch-first, then subscribe / refetch.
- A reconnect snapshot can still arrive after local destruction completion, so the target is a race between:
  - the fresh or stale server snapshot,
  - `processOfflineTimers(...)`,
  - `resolvePlacedBuildingSnapshotMerge(...)`,
  - and the revive / sticky guards.
- The current source proves the branch structure, but not the full stale-reconnect race envelope for this terminal-state case.

## Known Gaps

- `INV-RT-03`, `INV-STATE-05`, and `INV-TIME-10` are still only partially confirmed in the baseline.
- The destruction-terminal-state target is not the same as Scenario 2 tombstone suppression.
- The source does not yet prove the exact runtime race ordering between a completed destruction state and a later stale reconnect snapshot.
- No deterministic replay has been created yet for this target.

## Audit Result

- This target remains `UNCONFIRMED_RUNTIME_BEHAVIOR`.
- `T038` is now the active source-audit checkpoint for the next characterization target.
