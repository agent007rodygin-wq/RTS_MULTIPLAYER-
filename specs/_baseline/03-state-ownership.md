# 03. State Ownership, Sources, and Reconciliation

## Scope

This document records who owns each active runtime state slice in the current source snapshot, what mirrors or caches exist, and where reconciliation happens. Graphify was used only as a navigation aid. Every factual statement below is backed by direct source reading.

Primary sources:

- `App.tsx`
- `src/pocketbase.ts`
- `LoadingScreen.tsx`
- `types.ts`
- `pb_hooks/main.pb.js`
- `pb_hooks/tree_server_utils.js`

## Ownership Map

| State slice | Source / lines | Ownership model | Local mirrors / refs | Reconciliation shape | Confidence |
| --- | --- | --- | --- | --- | --- |
| Loading gate and auth bootstrap | `App.tsx:3109-3111, 8442-8451, 17912-17941`; `LoadingScreen.tsx:46-47` | UI-owned gate on top of auth and data readiness | `loadingReady`, `loadingProgress`, `isLoadingScreen`, `loadTimerDone`, `loadStartTime` | `LoadingScreen.tsx` only exits when `loadingReady && user`; the minimum-loading timer prevents an early close, but a missing readiness signal can still keep the overlay visible. | CONFIRMED_BY_SOURCE |
| Persistent profile, currency, inventory, permits | `App.tsx:6367-7051, 6590-6624, 6773-6802` | PocketBase `users/<uid>` doc is the persistent source of truth | `user`, `playerName`, `playerGold`, `playerRubies`, `playerEnergy`, `inventory`, `extraBuildingPermits`, `playerGender`, `playerAvatar`, `playerReputation`, `playerClanId`, `playerLeaderboardStats`, `banEndTime`, `playerActiveCurse` | Auth bootstrap, user snapshot sync, cache healing, and `updatePlayerResources()` keep the React mirrors aligned. | CONFIRMED_BY_SOURCE |
| Player position and camera | `App.tsx:6773-6802, 7501-7564` | Camera is client-owned; persisted position is a cache in `users/<uid>` | `cameraOffsetRef`, `zoomIndexRef`, `lastPersistedPlayerPositionRef`, `lastLocationShareTime` | `persistLastPlayerPosition()` writes cached `lastX`, `lastY`, and `lastPositionUpdatedAt` after throttling. | CONFIRMED_BY_SOURCE |
| Placed buildings | `App.tsx:5862-6234, 7954-8560` | PocketBase `buildings` collection plus client merge state | `placedBuildings`, `serverMyBuildingsRef`, `serverZoneBuildingsRef`, `deletingBuildingsRef`, `confirmedDeletedRef`, `optimisticBuildDocIdByTempIdRef`, `optimisticBuildTempIdByDocIdRef`, `lastInteractionRef`, `lastServerSyncRef` | Owner-scoped and zone-scoped snapshots are merged with local optimistic state, tombstones, and offline timer catch-up. | PARTIALLY_CONFIRMED |
| Map resources and dropped items | `App.tsx:4794-4897, 5300-5592, 12822-12942, 14068-14186` | PocketBase `map_resources` and `dropped_items` collections | `mapResources`, `droppedItems`, `deletingDroppedItemsRef`, `deadResourceIds`, `deadDroppedItemIds` | Zone snapshots and local pickup/build actions both mutate the same client view; deletion tombstones suppress repeated writes. | CONFIRMED_BY_SOURCE |
| Online users, presence, and leaderboard mirrors | `App.tsx:6848-7708, 7501-7840` | PocketBase `users`, `presence`, and `leaderboard_profiles` docs | `allUsers`, `onlineUsers`, `playerLeaderboardStatsRef`, `leaderboardProfileSyncSignatureRef` | Roster state is merged from user snapshots, presence heartbeats, leaderboard sync, and local recovery writes. | PARTIALLY_CONFIRMED |
| Chat history and private messages | `App.tsx:7340-7498, 16535-16783` | PocketBase `chat_messages` and `private_messages` collections | `chatHistory`, `privateMessages`, `chatInput`, `privateMessageText`, local system-notice helpers | Realtime chat is authoritative, but local-only notices and TTL cleanup also shape the visible list. | CONFIRMED_BY_SOURCE |
| Market listings | `App.tsx:13777-14004` | PocketBase `market` collection | `marketListings`, `sellItemSelection`, `isMarketProcessing` | Listings are loaded from the backend and then mirrored locally after transaction success; no long-lived realtime subscription was confirmed. | CONFIRMED_BY_SOURCE |
| Clans and clan membership | `App.tsx:17111-17252, 7340-7350` | PocketBase `clans` and `users/<uid>.clanId` | `clans`, `clanSettings`, `localClanOverride`, `playerClanId`, `isClanDirectoryLoading` | Clan list fetches and membership writes are combined with local UI mirrors and recovery logic. | PARTIALLY_CONFIRMED |
| Bans, curses, and election state | `App.tsx:7247-7334, 8719-8906` | PocketBase `users/<uid>` plus election docs | `banEndTime`, `playerActiveCurse`, `currentTime`, election timers | Current-user listeners, cleanup loops, and warning timers keep the ban/curse/election UI coherent. | CONFIRMED_BY_SOURCE |
| Runtime action flags and modal state | `App.tsx:3040-3042, 3109-3111, 3245-3246, 3287, 3305-3311, 3438-3446` | Client-owned UI state | `isSaving`, `isBuildingActionProcessing`, `isMoveActionProcessing`, `isMarketProcessing`, `isShopProcessing`, `selectedBuilding`, `buildMenu`, `chatHistory`, `privateMessageText` | These flags are purely local guards and do not represent persisted gameplay state. | CONFIRMED_BY_SOURCE |
| World combat and monster runtime | `App.tsx:11566-12663, 13119-13439` | Embedded client simulation with server writes to buildings and users | `monsterLastActionRef`, `monsterAttackTimeRef`, `monsterWriteCooldownRef`, `pendingHostClaimsRef`, `recentMoveInteractionRef` | The source proves the refs and loop guards, but the ownership split is still embedded in the monolith rather than isolated into a dedicated service. | PARTIALLY_CONFIRMED |

## Multiple Active Source Areas

The following slices are not single-source state and must be treated as merge results rather than simple records:

- `placedBuildings` combines owner-scoped building snapshots, zone-scoped building snapshots, optimistic placements, tombstones, and offline timer catch-up.
- `allUsers` combines the `users` collection, presence heartbeats, leaderboard sync, clan lookups, and local recovery writes.
- `chatHistory` combines realtime chat documents, local-only notices, and cleanup of expired system messages.
- `playerGold`, `playerRubies`, `playerEnergy`, `inventory`, and `extraBuildingPermits` are mirrored from `users/<uid>` but are also mutated immediately by `updatePlayerResources()`.
- `clans` and `playerClanId` are updated from fetches, membership writes, and local UI mirrors.
- `loadingReady`, `loadPhase`, `isLoadingScreen`, and `loadingProgress` are all client-owned, but their meaning depends on auth and data readiness.

## Authority Boundaries

- PocketBase is the source of truth for persistent multiplayer state.
- React state and refs own transient UI, optimistic shadow state, and throttling guards.
- Tombstone caches such as `deadBuildingIds`, `deadResourceIds`, `deadDroppedItemIds`, `deletedRecordKeys`, and `missingUserIds` are suppression helpers, not primary truth.
- `forceReloadAt` is only a reload gate. It does not prove construction or production persistence after reload. That persistence must come from timer fields such as `constructionEndTime`, `workEndTime`, `destructionEndTime`, and their reread through `processOfflineTimers()` and snapshot reconciliation.

## State Ownership Risks

- `placedBuildings` is the highest-risk merge zone because it mixes server data, optimistic placement, offline catch-up, and deletion tombstones.
- `allUsers` is the largest multi-source aggregate and can briefly reflect different recency levels across presence, clan, and leaderboard inputs.
- `LoadingScreen.tsx` is a pure gate, but it can still remain visible if the readiness chain never resolves.
- The current source snapshot proves the merge logic, but not every runtime race that can occur between writes and later snapshots.
