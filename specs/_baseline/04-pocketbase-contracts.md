# 04. PocketBase Contracts and Realtime Adapter

## Scope

This document covers the current PocketBase-facing contract surface in `src/pocketbase.ts`, the client call sites that use it, and the backend hook route used by tree harvesting. Graphify was used only to locate the boundaries; every behavior below is taken from direct source reading.

## Adapter Architecture

### Confirmed export groups

| Group | Lines | Role | Key confirmed behaviors | Confidence |
| --- | --- | --- | --- | --- |
| Client bootstrap | `src/pocketbase.ts:1-19` | Creates the PocketBase client and runtime audit flags | Fixed base URL `http://89.127.214.182:8090`, `pb.autoCancellation(false)`, debug/audit env wiring | CONFIRMED |
| Auth bridge | `src/pocketbase.ts:198-355` | Firebase-shaped auth compatibility layer | `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signInWithPopup`, `signOut`, `onAuthStateChanged`, `forceClearAuth`, `clearUserCache`, `toPBUser` cache | CONFIRMED |
| Request queue and timeout | `src/pocketbase.ts:44-158` | Serializes and limits requests | `MAX_CONCURRENT_REQUESTS = 5`, `requestQueue`, `activeRequests`, `withTimeout`, `enqueueRequest`, `processQueue` | CONFIRMED |
| Firestore-like refs | `src/pocketbase.ts:821-827` | Compatibility wrappers | `doc()` returns `{ collectionName, id }`, `collection()` returns collection name string | CONFIRMED |
| Reads | `src/pocketbase.ts:831-1034` | Document and collection reads | `getDoc`, `getDocs`, 404 handling, fallback lookup by logical ID, zone-aware query fetch | CONFIRMED |
| Writes | `src/pocketbase.ts:1037-1555` | Create/update/delete/wipe operations | `setDoc`, `updateDoc`, `deleteDoc`, `deleteAll`, idempotent delete, raw JSON preservation, dedupe guards | CONFIRMED |
| Query builder | `src/pocketbase.ts:1592-1838` | Query construction and filter translation | `query`, `where`, `orderBy`, `limit`, `increment`, `zoneId in` splitting, `array-contains` translation, pagination | CONFIRMED |
| Realtime wrapper | `src/pocketbase.ts:1840-2227` | Realtime subscription abstraction | Single-doc and collection subscriptions, initial fetch first, retry/backoff, 404 fallback, zone incremental merge, throttled refetch, cleanup | CONFIRMED |
| Transaction/batch compatibility | `src/pocketbase.ts:2245-2303` | Firebase-like batch surface | `runTransaction` queues ops and runs them with `Promise.all`; `writeBatch` is a sequential wrapper, not a PocketBase atomic transaction | CONFIRMED |
| Error normalization | `src/pocketbase.ts:2325-2354` | Shared error reporter | Logs operation type and path, surfaces permission warnings, intentionally does not throw for every background sync error | CONFIRMED |
| Special backend hook | `src/pocketbase.ts:2366-2418` | Tree hit request endpoint | `TREE_HIT_API_PATH` and `requestTreeHit(resourceId)` POST to `/api/basingse/tree-hit` with auth token | CONFIRMED |

### Important adapter rules

- `pb.autoCancellation(false)` is enabled, so the adapter does not rely on PocketBase auto-abort behavior.
- `withTimeout()` hard-fails queued requests after 15 seconds.
- `queuedGetFullList`, `queuedGetOne`, and `queuedGetList` run through the shared request queue rather than calling PocketBase directly.
- `queuedGetList` strips undefined and empty options, and also sanitizes user filters to avoid legacy `gameId` / OR-clause problems.
- `getDoc()` treats 404 as not found, but propagates non-404 failures so callers do not accidentally overwrite data with defaults.
- `setDoc()` and `updateDoc()` preserve the raw `data` JSON field from PocketBase records so sibling fields are not lost on partial writes.
- `deleteDoc()` is idempotent: known-deleted records are skipped, in-flight delete requests are deduped, and 404s fall back to lookup-by-id, lookup-by-gameId, or coordinate lookup for `map_resources`.
- `onSnapshot()` always performs an initial fetch before or alongside the realtime subscription, then either merges incrementally or refetches with cooldown depending on the query shape.

## PocketBase Compatibility Layers

| Export | Status | Notes |
| --- | --- | --- |
| `doc()` / `collection()` | CONFIRMED | Minimal wrappers used throughout `App.tsx` |
| `deleteField()` | CONFIRMED | Sentinel `null` value used as a delete marker |
| `increment()` | CONFIRMED | Sentinel object consumed by `updateDoc()` |
| `db` / `googleProvider` | LEGACY_COMPATIBILITY | Exported as `null` because the app no longer uses a Firestore backend |
| `storage`, `ref()`, `uploadBytes()`, `getDownloadURL()`, `uploadBytesResumable()` | LEGACY_COMPATIBILITY | Present only as stubs; they are not active storage paths in the current app |
| `runTransaction()` | PARTIALLY_CONFIRMED | Exists as a client-side queue of pending ops, but it is not an atomic server transaction |
| `writeBatch()` | PARTIALLY_CONFIRMED | Stub-like batch wrapper that commits via `Promise.all` |

## Collection Contract Map

Confirmed active collections and record families:

| Collection / doc | Role in the app | Readers | Writers | Realtime | Filters / sort / pagination | Source of truth | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `users` | Auth, profile, inventory, stats, bans, curses, clan membership, energy, currency | `getDoc`, `getDocs`, `onSnapshot`, `findUserRecord`, auth bridge | `setDoc`, `updateDoc`, auth helpers | Yes, both `users/<uid>` and broad `users` snapshot | `uid`, `name`, `clanId`, `leaderId`, `array-contains` in some lookup filters | Server auth collection; client caches only mirror or heal stronger values | CONFIRMED |
| `leaderboard_profiles` | Materialized public leaderboard profile snapshot | `onSnapshot`, leaderboard query | `setDoc` from client sync effect | Yes, ordered `onSnapshot` query | `orderBy(stat, desc)`, `limit(topPlayers)` | Server doc materialized from client sync payload | CONFIRMED |
| `map_state/status` | Global map generation / force reload coordination | `getDoc`, `onSnapshot` | `setDoc`, `deleteDoc` | Yes, single-doc realtime | Fixed doc id `status` | Server doc | CONFIRMED |
| `buildings` | Player buildings, monsters, construction, production, destruction, combat state | `getDoc`, `getDocs`, `onSnapshot`, owner / zone queries | `setDoc`, `updateDoc`, `deleteDoc`, `deleteAll` | Yes, owner and zone subscriptions | `ownerId`, `zoneId`, `buildingId`, `x`, `y`, plus some `gameId` fallback lookup | Server collection; client mirrors and optimistically updates | CONFIRMED |
| `map_resources` | Trees, oil, quarry, chest, other map resources | `getDoc`, `getDocs`, `onSnapshot` | `setDoc`, `updateDoc`, `deleteDoc`, `deleteAll` | Yes, zone subscriptions | `zoneId`, `x`, `y`, fallback lookup by coords | Server collection | CONFIRMED |
| `dropped_items` | Ground loot and pickup records | `getDocs`, `onSnapshot` | `setDoc`, `deleteDoc` | Yes, zone subscriptions | `zoneId`, `where` filters | Server collection | CONFIRMED |
| `chat_messages` | Global, system, clan, ban, curse, and event chat | `getDocs`, `onSnapshot` | `setDoc`, `deleteDoc` | Yes, last-50 query | `orderBy(timestamp, desc)`, `limit(50)`, some `where(type == 'system')` cleanup | Server collection; client appends local-only notices and dedupes | CONFIRMED |
| `private_messages` | Direct messages | `getDocs`, `onSnapshot` | `setDoc`, `updateDoc` | Yes, `participants array-contains user.uid` | `where('participants', 'array-contains', uid)` | Server collection | CONFIRMED |
| `presence` | Online presence and lightweight positional state | `getDoc`, `getDocs`, `onSnapshot` | `setDoc`, `updateDoc` | Yes, ordered by `lastSeen` | `orderBy(lastSeen, desc)`, `limit(200)` | Server collection with frequent client refresh | CONFIRMED |
| `clans` | Clan metadata, membership, permissions, and avatars | `getDoc`, `getDocs` | `setDoc`, `updateDoc`, `deleteDoc` | No dedicated realtime subscription in current app | `leaderId == user.uid`, `id` lookups, `playerClanId`-based fetches | Server collection | CONFIRMED |
| `market` | Listings and trading state | `getDocs` | `setDoc`, `updateDoc`, `deleteDoc` | No dedicated realtime subscription in current app | `where`, `orderBy` on listing metadata in UI filters | Server collection | CONFIRMED |
| `elections` | Fixed docs `police` and `royal` for election state | `getDoc`, `onSnapshot` | `setDoc`, `updateDoc` | Yes, two single-doc subscriptions | Fixed doc ids `police` and `royal` | Server collection | CONFIRMED |
| `tree_respawns` | Backend-only respawn queue | `processDueTreeRespawns` cron hook | `buildRespawnJob`, `respawnSingleTree` | No client subscription | `status = 'pending' && respawnAt <= now` | Server-only queue collection | CONFIRMED |

### Collection notes

- `users` is both the auth collection and the main player-state store.
- `leaderboard_profiles` is a materialized public view derived from user stats, not the only source of truth for gameplay.
- `buildings` is the central world-state collection: it carries player buildings, monsters, destruction/combat state, and several timer fields.
- `map_resources` and `dropped_items` are loaded by zone, which keeps world loading bounded.
- `market` and `clans` are loaded on demand rather than with long-lived realtime listeners.
- `tree_respawns` is never consumed directly by the client; it is managed by the backend cron flow.

## PocketBase Operation Inventory

This inventory groups the meaningful runtime operations that touch PocketBase or the tree-hit backend route.

| Player / system action | App.tsx entry point or runtime caller | Adapter or hook function | Collection / endpoint | Operation type | Optimistic local update | Server confirmation / reconciliation | Timeout / retry / rollback / duplicate risk | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Email/password sign-in | Auth UI flow | `signInWithEmailAndPassword()` | `users` auth | Read / auth | None | PocketBase auth session | Uses PocketBase auth directly; no custom retry layer here | CONFIRMED |
| Google sign-in | Auth UI flow | `signInWithPopup()` | `users` auth | Read / auth | None | Ensures user doc exists after auth | No custom retry layer; cache cleared on user change | CONFIRMED |
| First user bootstrap / guest restoration | `App.tsx:6296-6493` | `getDoc`, `setDoc`, `updateDoc` | `users`, legacy guest migration path | Read + create/update | Local profile state, caches, and camera position are initialized before later syncs | Later `users/<uid>` snapshot heals level, stats, permits, and position | `getDoc` 404 fallback, stale-cache healing, legacy guest migration | CONFIRMED |
| Map generation on first join | `App.tsx:4480-4509` | `getDoc`, `getDocs`, `setDoc` | `map_state/status`, `buildings`, `map_resources` | Read + create | None; generation is server-persisted immediately | The first player writes generated buildings, resources, and map state | Potential duplicate generation is prevented by checking `map_state/status` first | CONFIRMED |
| Zone resource loading | `App.tsx:4794-4805` | `onSnapshot()` | `map_resources` | Read / realtime | `setMapResources(resourcesData)` | Realtime snapshot replaces the local zone resource array | Wrapper retries on transient errors and throttles refetches | CONFIRMED |
| Dropped item loading | `App.tsx:4880-4897` | `onSnapshot()` | `dropped_items` | Read / realtime | `setDroppedItems(itemsData)` | Realtime snapshot replaces visible dropped items | `activeDroppedItemsRequestRef` prevents stale zone responses | CONFIRMED |
| Building creation / placement | `App.tsx:5850-6180` | `setDoc`, `updateDoc`, `deleteDoc` | `buildings` | Create / update / delete | Local placement is shown before server confirmation in several flows | Snapshot reconciliation and idempotent writes converge on server state | Risk of duplicate create/update is reduced by sanitized ids, lookup fallbacks, and delete dedupe | CONFIRMED |
| Building speed-up | `App.tsx:16123-16189` | `updateDoc`, `deleteField`, `increment` | `buildings`, `users` | Update | Local rubies and selected building are updated immediately | Rollback restores rubies if the target building is already gone | `speedUpInFlightRef` prevents duplicate execution; rollback exists for not-found building | CONFIRMED |
| Tree hit | `App.tsx:5411-5545` | `requestTreeHit()` then local reconciliation | `/api/basingse/tree-hit`, `map_resources`, `users` | Server action + local reconciliation | UI applies reward state only after server response | Server hook writes reward and tree state atomically inside a PB transaction; client then reconciles resource removal / HP | Request is auth-gated; client handles "already changed" responses and not-found cases | CONFIRMED |
| Resource finalization after tree hit or chest pickup | `App.tsx:5570-5592` | `updateDoc`, `deleteDoc` | `map_resources` | Update / delete | Local resource array is updated immediately | Server doc is then updated or deleted | Delete/update paths are idempotent; 404s are treated as already-removed | CONFIRMED |
| Inventory / coin gain from pickup | `App.tsx:5316-5336` | `updateDoc`, `increment`, `deleteDoc` | `users`, `dropped_items` | Update / delete | Local gold is incremented, dropped item removed | Snapshot / later user sync heals state if needed | Duplicate execution risk is reduced by local deletion markers and idempotent delete | CONFIRMED |
| Chat load and local-only notices | `App.tsx:7432-7465` | `onSnapshot()` | `chat_messages` | Read / realtime | Local-only notices are appended and then deduped with server messages | Server messages remain authoritative in the merged history | Dedupe key prevents duplicate chat items; snapshot is limited to 50 most recent rows | CONFIRMED |
| Chat cleanup of expired system messages | `App.tsx:7467-7496` | `getDocs`, `deleteDoc` | `chat_messages` | Read + delete | Local history is filtered after cleanup | Old system docs are removed from PocketBase | Timer-based cleanup is bounded; deleting already-missing docs is handled by the adapter | CONFIRMED |
| Presence update / sync | `App.tsx:7501-7548` and `App.tsx:7754-7841` | `setDoc`, `updateDoc`, `onSnapshot` | `presence` | Create / update / realtime read | Local online-user lists and player position are updated immediately | Realtime presence snapshots reconcile online lists and player info | Snapshot merge deliberately preserves stronger local glory/reputation values; retry happens in the adapter | CONFIRMED |
| Leaderboard profile materialization | `App.tsx:7501-7528` | `setDoc` | `leaderboard_profiles` | Create / update | None beyond local signature caching | Profile doc is written only when a payload signature changes | Signature dedupe prevents repeated writes; no rollback path is needed | CONFIRMED |
| Leaderboard and all-users realtime sync | `App.tsx:7591-7708` | `onSnapshot()` | `users`, `leaderboard_profiles` | Read / realtime | `setAllUsers`, `setTopPlayersData`, `setLeaderboardLoading` | Realtime snapshots merge user stats and top-player data | `leaderboardProfileSyncSignatureRef` and max-stat merges reduce stale overwrites | CONFIRMED |
| Current-user ban / curse listener | `App.tsx:7247-7311` | `onSnapshot()` | `users/<uid>` | Read / realtime | `setBanEndTime`, `setPlayerActiveCurse`, local allUsers merge | Current-user doc drives UI ban/curse state | Uses existing state as a guard against stale writes | CONFIRMED |
| Clan and membership management | `App.tsx:7340-7422`, `App.tsx:16939-17462` | `getDocs`, `getDoc`, `setDoc`, `updateDoc`, `deleteDoc` | `clans`, `users` | Read / create / update / delete | Some UI state is updated immediately after join/leave/settings changes | Later fetches re-hydrate clan lists and membership | No dedicated realtime subscription; state can lag until the next fetch | CONFIRMED |
| Market listing load / trade actions | `App.tsx:8566-8577`, `App.tsx:13794-13979` | `getDocs`, `setDoc`, `updateDoc`, `deleteDoc` | `market`, `users` | Read / create / update / delete | Optimistic UI appears in trading flows and inventory counters | Server-side listing records resolve the final state | No dedicated realtime subscription; trade UI depends on explicit refreshes | CONFIRMED |
| Elections load and vote writes | `App.tsx:8602-8878`, `App.tsx:20298-20530` | `onSnapshot`, `getDoc`, `setDoc`, `updateDoc` | `elections/police`, `elections/royal`, `chat_messages` | Read / create / update | Local election UI updates after user action | Realtime docs keep candidate and winner state current | Fixed doc ids reduce ambiguity; chat notification writes are follow-up side effects | CONFIRMED |
| Combat / destruction / offline catch-up | `App.tsx:627-860`, `App.tsx:11469-12752` | `processOfflineTimers`, `updateDoc`, `deleteDoc`, `writeBatch`-style paths | `buildings`, `map_resources` | Update / delete | Local state may be updated before server writes finish | Later snapshots converge the world state | `lastInteractionRef`, `pendingHostClaimsRef`, `speedUpInFlightRef`, and freshness guards reduce stale overwrite risk | PARTIALLY_CONFIRMED |
| Backend tree respawn queue | `pb_hooks/main.pb.js:55-56`, `pb_hooks/tree_server_utils.js:632-694` | `processDueTreeRespawns()` | `tree_respawns`, `map_resources` | Server cron / server transaction | None on client | Tree respawn jobs are created and later consumed in a server transaction | All behavior is server-side; client has no realtime subscription to the queue | CONFIRMED |
| Maintenance wipe helpers | `src/pocketbase.ts:1556-1574`, various root scripts | `deleteAll()` | any collection | Bulk delete | None | Server collection is cleared in chunks of 50 | Dangerous by design; only for admin / repair scripts | CONFIRMED |

## Server Authority Matrix

| System | Server source of truth | Client copy | Optimistic state | Realtime source | Conflict risk | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| Profile | `users` doc | `playerName`, `playerLevel`, `playerGlory`, `playerEnergy`, `playerAvatar`, caches | Yes, for a few save/restore flows | `users/<uid>` snapshot | Medium: snapshot healing and cache restoration can race | CONFIRMED |
| Inventory | `users.inventory` | `inventory`, cached leaderboard stats, permit counts | Yes, in pickup / reward flows | `users/<uid>` snapshot | High: inventory and counters are merged from multiple sources | CONFIRMED |
| Buildings | `buildings` collection | `placedBuildings`, `serverMyBuildingsRef`, `serverZoneBuildingsRef` | Yes, heavily | `buildings` owner and zone snapshots | High: many timer and destruction paths touch the same docs | CONFIRMED |
| Construction | `buildings.constructionEndTime` and related fields | Timer refs and selected building state | Yes | `buildings` snapshots | High | PARTIALLY_CONFIRMED |
| Production | `buildings.workEndTime` / `workState` | Timer refs and current building view | Yes | `buildings` snapshots | High | PARTIALLY_CONFIRMED |
| Upgrades | `buildings` + `users` (rubies / permits) | Selected building and upgrade UI state | Yes | `buildings` and `users` snapshots | High | PARTIALLY_CONFIRMED |
| Map zones | `map_state/status`, `buildings`, `map_resources` | `currentZones`, `currentBuildingZones`, zone status refs | Mostly no, except map generation bootstrap | `map_state/status`, zone-scoped collection snapshots | Medium | CONFIRMED |
| Trees / resources | `map_resources` collection | `mapResources`, selection refs | Yes, after tree hit / resource finalization | `map_resources` zone snapshots | High | CONFIRMED |
| Monsters | `buildings` records used as monster entities | `placedBuildings`, monster AI refs | Yes, through game loop updates | `buildings` snapshots | High | PARTIALLY_CONFIRMED |
| Market | `market` collection | `marketListings` and tab UI state | Limited optimistic UI in trade flows | None in current app | Medium | CONFIRMED |
| Chat | `chat_messages` collection | `chatHistory`, local-only notices | Yes, local-only notices are appended before server data returns | `chat_messages` realtime query | Medium | CONFIRMED |
| Presence | `presence` collection | `onlineUsers`, `onlinePlayersData`, `allUsers` merges | Yes, client periodically writes its own record | `presence` realtime query | Medium | CONFIRMED |
| Leaderboard | `leaderboard_profiles` plus derived `users` data | `topPlayersData`, `playerLeaderboardStats` | Yes, via signature-based sync and cache merging | `leaderboard_profiles` realtime query and `users` snapshot | Medium | CONFIRMED |
| Combat / destruction | `buildings` collection | combat refs, interaction refs, local HP views | Yes | `buildings` zone snapshots | High | PARTIALLY_CONFIRMED |

## Special Backend Hooks

### Tree hit route

- `pb_hooks/main.pb.js:3-55` registers `POST /api/basingse/tree-hit` and requires `users` auth.
- The route binds a `resourceId`, resolves the authenticated user, and delegates to `tree_server_utils.js`.
- `src/pocketbase.ts:2392-2418` exposes `requestTreeHit(resourceId)` on the client side, sending the auth token to the same endpoint.

### Tree respawn cron

- `pb_hooks/main.pb.js:55-56` registers `tree-respawn-manager` to run every minute.
- `pb_hooks/tree_server_utils.js:269-374` resolves tree records by record id, sanitized id, `gameId`, or coordinates, then builds the respawn job when a tree is depleted.
- `pb_hooks/tree_server_utils.js:377-631` runs the tree-hit transaction: it updates the user, updates or deletes the tree, and writes a respawn job when needed.
- `pb_hooks/tree_server_utils.js:632-694` respawns trees from `tree_respawns` when the timer expires.

## LEGACY_COMPATIBILITY and fallback behavior

Confirmed compatibility surfaces:

- `getDoc()` falls back from `getOne` to `getList` and, for `map_resources`, to coordinate-based lookup.
- `setDoc()` falls back from create to update on duplicate sanitized ids.
- `updateDoc()` skips deleted or in-flight deleted docs, and it has coordinate fallback for `map_resources`.
- `deleteDoc()` is idempotent and deletes by id/gameId/coords fallbacks when the direct delete returns 404.
- `runTransaction()` and `writeBatch()` are useful compatibility wrappers, but they are not atomic PocketBase transactions.
- `storage` / `ref` / upload helpers remain stubs and are not part of the active app surface.

## What This Stage Still Does Not Prove

- Exact event ordering between optimistic UI writes and later realtime snapshots.
- Whether all race windows are closed in every combat / destruction / offline-catch-up path.
- Whether every collection has final PocketBase access rules matching the client assumptions.
- Whether all legacy compatibility exports are truly unused by some hidden maintenance path.

