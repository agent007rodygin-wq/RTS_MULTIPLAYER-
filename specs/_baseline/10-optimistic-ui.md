# 10. Optimistic UI and Rollback

## Scope

This document enumerates the confirmed local-first and optimistic UI flows in the active source snapshot. Graphify was used only to locate candidate paths; every factual statement below is backed by direct source reading.

## Confirmed Local-First Operations

| # | Operation | Source / lines | Local-first mutation | Server write | Rollback completeness | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Generic building placement (`placeBuildingAtTile`) | `App.tsx:5862-6234` | Creates an optimistic building record, deducts resources, and marks the record local before the create request resolves. | `setDoc()` plus cleanup `deleteDoc()` for map resources | FULL rollback on create failure: optimistic building is removed and the spent resources are refunded. | CONFIRMED_BY_SOURCE |
| 2 | Building move | `App.tsx:5246-5285` | Moves the building locally, deducts energy, and marks the move as in-flight before the update finishes. | `updateDoc()` on the building record | FULL rollback on catch: the building is moved back and the energy cost is restored. | CONFIRMED_BY_SOURCE |
| 3 | Oil rig build | `App.tsx:14068-14124` | Deducts gold, removes the map resource locally, and inserts the new building immediately. | `setDoc()` for the building and `deleteDoc()` for the source resource | FULL rollback on create failure: the building is removed and the resource tile is restored. | CONFIRMED_BY_SOURCE |
| 4 | Wild quarry build | `App.tsx:14130-14186` | Same local-first shape as the oil rig path. | `setDoc()` for the building and `deleteDoc()` for the source resource | FULL rollback on create failure: the building is removed and the resource tile is restored. | CONFIRMED_BY_SOURCE |
| 5 | Upgrade building | `App.tsx:14461-14610` | Deducts resources and rewrites the building locally into the upgraded form before the update settles. | `updateDoc()` on the building record | No general rollback was confirmed. Later snapshot reconciliation may repair the view, but source-level rollback code was not found. | CONFIRMED_BY_SOURCE |
| 6 | Start production | `App.tsx:14618-14676` | Marks the building as working, sets `workEndTime`, and consumes inputs locally before the backend write resolves. | `updateDoc()` on the building record | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 7 | Collect production | `App.tsx:14678-15280` | Credits rewards locally and returns the building to the idle state before the backend write completes. | `updateDoc()` on the building record | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 8 | Apply protection | `App.tsx:15878-15941` | Deducts rubies and immediately applies shield and destruction-reset state locally. | `updateDoc()` on the building record | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 9 | Explode / start destruction | `App.tsx:15944-16121` | Deducts gold, energy, and weapon items locally, then mutates the building into a destruction state. | `updateDoc()` on the building and `updateDoc()` on `users/<uid>` | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 10 | Speed up construction | `App.tsx:16123-16189` | Deducts rubies and finishes the construction locally before the backend ack arrives. | `updateDoc()` on the building and `users/<uid>` | PARTIAL rollback only: if the target building is already gone, rubies are returned and the optimistic record is removed. | CONFIRMED_BY_SOURCE |
| 11 | Dropped item pickup | `App.tsx:5300-5330` | Grants gold or inventory immediately and removes the item from local dropped-item state. | `deleteDoc()` on `dropped_items/<id>` | No rollback was confirmed if the delete fails after the local removal. | CONFIRMED_BY_SOURCE |
| 12 | Repair building | `App.tsx:15714-15783` | Deducts gold and restores the building hp locally before the write settles. | `updateDoc()` on the building and `users/<uid>` | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 13 | Toggle building active | `App.tsx:15699-15712` | Updates the active flag locally before the server write returns. | `updateDoc()` on the building record | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 14 | Withdraw building bank | `App.tsx:16441-16456` | Credits gold and clears the bank locally before the server write settles. | `updateDoc()` on the building record | No direct rollback was confirmed. | CONFIRMED_BY_SOURCE |
| 15 | Join clan | `App.tsx:17111-17157` | Switches the player's clan locally and mirrors the clan member count in client state before the user-doc write settles. | `updateDoc()` on `clans/<id>` and `users/<uid>` | PARTIAL rollback only: the code updates local state immediately, but no dedicated rollback path was confirmed. | CONFIRMED_BY_SOURCE |
| 16 | Leave clan | `App.tsx:17163-17183` | Clears the player's clan locally and mirrors the clan member count in client state before the writes settle. | `updateDoc()` on `clans/<id>` and `users/<uid>` | PARTIAL rollback only: the code updates local state immediately, but no dedicated rollback path was confirmed. | CONFIRMED_BY_SOURCE |

## Main Reconciliation Strategies

- `updatePlayerResources()` is the shared helper for local-first resource updates; it mutates the React mirrors immediately and then writes to `users/<uid>`.
- `lastInteractionRef` marks the most recent user intent so later snapshots do not snap the UI back too early.
- `optimisticBuildDocIdByTempIdRef` and `optimisticBuildTempIdByDocIdRef` resolve temporary building ids after create success.
- `deletingBuildingsRef`, `confirmedDeletedRef`, `deletingDroppedItemsRef`, `deadBuildingIds`, `deadResourceIds`, `deadDroppedItemIds`, `deletedRecordKeys`, and `missingUserIds` are suppression caches, not primary truth.
- `serverMyBuildingsRef` and `serverZoneBuildingsRef` hold the server view that `updatePlacedBuildingsFromServer()` merges with local optimism and offline catch-up.
- `speedUpInFlightRef` blocks duplicate speed-up submits.
- `zoneSyncRetryCountsRef` and `zoneSyncRetryTimeoutsRef` cap the retry churn for zone subscriptions.
- `processOfflineTimers()` is the catch-up mechanism that lets timer-backed buildings converge after a reload or offline gap.

## Non-Counted Paths

These flows are important, but they are not classic optimistic UI because the visible local state is either updated only after success or is just lightweight UI feedback:

- `handleBuyMarketItem()`, `handleCreateMarketListing()`, and `handleCancelListing()` are transaction-bound and update the local market list after success.
- `handleSendMessage()` and `handleSendPrivateMessage()` clear input state locally, but the message records themselves are server-authored.
- `handleSwitchChatTab()` and `updatePresence()` are background sync flows rather than visible optimistic gameplay actions.
- `handleBuyBuildingPermit()` is transactional and should be treated as a guarded write, not a local-first UI flow.
- `handleNameChange()` is local-first, but it is a small profile utility path and was not counted in the core gameplay optimistic set above.
- `requestTreeHit()` is server-authoritative: it waits for the server response before applying the resource rewards locally.

## Rollback Summary

- Full rollback confirmed: building placement, building move, oil rig build, wild quarry build.
- Partial rollback confirmed: speed-up construction, clan join, clan leave.
- No direct rollback confirmed: upgrade, production start, production collect, protection, explosion, dropped-item pickup, repair, active toggle, bank withdrawal.
- Transactional rather than optimistic: market handlers and building-permit purchase.

## Stale-State Protections

- `userRef`, `isAuthReadyRef`, `cameraOffsetRef`, `zoomIndexRef`, `playerClanIdRef`, `playerLeaderboardStatsRef`, and `allUsersRef` let async callbacks read current values without depending only on stale closures.
- `lastServerSyncRef` and `lastInteractionRef` keep the merged building state biased toward the newest confirmed intent.
- `speedUpInFlightRef` prevents duplicate user clicks from producing duplicate writes.
- Tombstone caches and delete-tracking refs stop already-deleted records from being resurrected by later snapshots.

## Remaining Risks

- Some actions rely on later snapshot reconciliation rather than explicit rollback code.
- Social and market flows are mostly transaction-bound rather than optimistic, so they can still leave short-lived local/server mismatch windows if the write fails after the local UI changed.
- The current source proves the intended sequencing, but not every race between an optimistic local write and a later realtime snapshot.
