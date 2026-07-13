# Graph Report - .  (2026-07-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 994 nodes · 1635 edges · 124 communities (90 shown, 34 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.tsx
- monsterAnimationConfig.ts
- types.ts
- dependencies
- pocketbase.ts
- compilerOptions
- App
- IconComponents.tsx
- tree_server_utils.js
- updateDoc
- marketStaticData.ts
- pocketbase
- getPriorityAnimationUrlsForBuilding
- onSnapshot
- chooseMonsterBackgroundMove
- getUserStatCounters
- repair_live_pocketbase_schema.mjs
- regenerate_world.mjs
- cleanup_building_resource_overlaps.mjs
- cleanup_buildings_combat_legacy.mjs
- ErrorBoundary
- reset_monsters_deterministic.mjs
- setup_tree_server_architecture.mjs
- respawn_all.mjs
- getDoc
- quick_reset_map.mjs
- smoke_pocketbase_startup.mjs
- wipe_all_player_buildings.mjs
- repairMojibakeCp1251Utf8
- getCrowdingEscapeMove
- spawn_monsters_now.mjs
- logPbAudit
- add_building_schema_fields.mjs
- mass_delete_monsters.mjs
- processOfflineTimers
- export_firebase.js
- migrate_chat_messages_top_level.mjs
- collection
- main
- check_idp.js
- check_regressions_worker6.mjs
- find_nested.js
- import_pocketbase.js
- list_dbs.js
- migrate_zones_80.mjs
- actionOptions.ts
- fix_monster_hp.mjs
- fix_schema_final_v2.mjs
- import_buildings.js
- respawn_monsters_manual.mjs
- search_nan.js
- test_getone.js
- test_insert.js
- add_gender_field.mjs
- getAvatarCacheKey
- getLastPositionCacheKey
- getProfileSettingsCacheKey
- check_elections.mjs
- check_pb.js
- check_rules.mjs
- check_schema.mjs
- cleanup_elections.mjs
- clear_chat_messages.mjs
- clear_database.js
- create_elections_collection.mjs
- create_elections_http.mjs
- delete_all_cannons.mjs
- diag2.mjs
- explode_all_cannons.mjs
- find_nan.js
- fix_buildings_migration.mjs
- fix_elections.mjs
- fix_mail_schema.mjs
- fix_schema.mjs
- fix_schema_final.mjs
- force_reload.mjs
- LoadingScreen.tsx
- recreate_elections.mjs
- setup_elections.mjs
- playerAssets.ts
- test_create_building_2.mjs
- test_pb.js
- pbRequest
- update_schema.mjs
- debug_schema.mjs
- energyPurchaseOptions.ts
- vite-env.d.ts
- verify_world.mjs

## God Nodes (most connected - your core abstractions)
1. `App()` - 131 edges
2. `pocketbase` - 48 edges
3. `updateDoc()` - 25 edges
4. `setDoc()` - 20 edges
5. `getPriorityAnimationUrlsForBuilding()` - 18 edges
6. `compilerOptions` - 16 edges
7. `processTreeHit()` - 15 edges
8. `collection()` - 15 edges
9. `getDoc()` - 14 edges
10. `deleteDoc()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `test()` --references--> `pocketbase`  [EXTRACTED]
  check_pb.js → package.json
- `getRules()` --references--> `pocketbase`  [EXTRACTED]
  check_rules.mjs → package.json
- `clearChatMessages()` --references--> `pocketbase`  [EXTRACTED]
  clear_chat_messages.mjs → package.json
- `clearCollections()` --references--> `pocketbase`  [EXTRACTED]
  clear_database.js → package.json
- `createElectionsCollection()` --references--> `pocketbase`  [EXTRACTED]
  create_elections_collection.mjs → package.json

## Import Cycles
- None detected.

## Communities (124 total, 34 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.02
Nodes (116): ALCHEMY_FACTORY_ANIM_DEFS, alchemyFactoryIdleFrames, alchemyFactoryWorkingFrames, APP_ENV, babyAngelBoyAnimationFrames, babyAngelGirlAnimationFrames, babyBearAnimationFrames, babyCatAnimationFrames (+108 more)

### Community 1 - "monsterAnimationConfig.ts"
Cohesion: 0.03
Nodes (57): babaYagaAttackBottomFrames, babaYagaAttackLeftFrames, babaYagaAttackRightFrames, babaYagaAttackTopFrames, babaYagaIdleFrames, babaYagaWalkDownFrames, babaYagaWalkLeftFrames, babaYagaWalkRightFrames (+49 more)

### Community 2 - "types.ts"
Cohesion: 0.07
Nodes (33): BuildingDetail(), BuildingDetailProps, SparklesIcon(), ItemDetailProps, buildings, DESTRUCTION_WEAPONS, DestructionTarget, DestructionWeaponDefinition (+25 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (41): dotenv, google-auth-library, @google/genai, lucide-react, motion, dependencies, dotenv, google-auth-library (+33 more)

### Community 4 - "pocketbase.ts"
Cohesion: 0.05
Nodes (37): AnyRecord, DATA_FIELDS_BY_COLLECTION, deadBuildingIds, deadDroppedItemIds, deadResourceIds, deletedRecordKeys, deleteField(), DocRef (+29 more)

### Community 5 - "compilerOptions"
Cohesion: 0.05
Nodes (38): ./*, App.tsx, components/**/*.ts, components/**/*.tsx, data/**/*.ts, dist, DOM, DOM.Iterable (+30 more)

### Community 6 - "App"
Cohesion: 0.06
Nodes (38): App(), BABY_MAX_LEVEL_IDS, BANDIT_CASTLE_IDS, buildMarketListingPayload(), CANNON_IDS, CASINO_IDS, ChatMessage, createVisualEffect() (+30 more)

### Community 7 - "IconComponents.tsx"
Cohesion: 0.05
Nodes (31): BusinessIcon(), ChatBubbleIcon(), ChevronDownIcon(), ChevronUpIcon(), ClanIcon(), CloseIcon(), CoinIcon(), CompassIcon() (+23 more)

### Community 8 - "tree_server_utils.js"
Cohesion: 0.24
Nodes (24): addInventoryItem(), buildErrorResponse(), buildFreeTreeCell(), buildRespawnJob(), buildTreeHitResponse(), collectOccupiedCells(), debugLog(), decodeUtf8Bytes() (+16 more)

### Community 9 - "updateDoc"
Cohesion: 0.17
Nodes (21): AUTH_FIELDS, buildIdLookupFilter(), clearDeletedRecord(), deleteAll(), deleteDoc(), handleFirestoreError(), hasInFlightDelete(), isDeletedRecord() (+13 more)

### Community 10 - "marketStaticData.ts"
Cohesion: 0.11
Nodes (18): isGeneralMarketBuilding(), isMilitaryMarketBuilding(), isMilitaryMarketListing(), matchesMarketType(), GENERAL_MARKET_BED_SECTION_IDS, GENERAL_MARKET_ENGLISH_NAMES, GENERAL_MARKET_MONSTER_SECTION_IDS, GENERAL_MARKET_RESOURCE_SECTION_IDS (+10 more)

### Community 11 - "pocketbase"
Cohesion: 0.12
Nodes (13): check(), pb, dumpMapState(), pb, fixCannonsDB(), pb, pocketbase, pocketbase (+5 more)

### Community 12 - "getPriorityAnimationUrlsForBuilding"
Cohesion: 0.12
Nodes (17): ALCHEMY_FACTORY_ID_SET, COIN_FACTORY_ID_SET, DETONATOR_FACTORY_ID_SET, EMERALD_FACTORY_ID_SET, FLAG_ANIMATION_ID_SET, getPriorityAnimationUrlsForBuilding(), GOLD_SMELTER_ID_SET, LILY_POND_ID_SET (+9 more)

### Community 13 - "onSnapshot"
Cohesion: 0.15
Nodes (13): clearUserCache(), doc(), DocSnapshot, emptySnapshot(), forceClearAuth(), getDocs(), onSnapshot(), QuerySnapshot (+5 more)

### Community 14 - "chooseMonsterBackgroundMove"
Cohesion: 0.15
Nodes (17): chooseMonsterBackgroundMove(), chooseMonsterMoveTowardTarget(), chooseMonsterPatrolMove(), getCardinalNeighborTiles(), getMonsterAdjacentAttackTarget(), getMonsterAdjacentHoldTarget(), getMonsterChaseTarget(), getMonsterMoveInterval() (+9 more)

### Community 15 - "getUserStatCounters"
Cohesion: 0.20
Nodes (11): BuildingTimerTraceSource, getLeaderboardStatsCacheKey(), getUserCounter(), getUserStatCounters(), hasHigherLeaderboardStats(), hashMonsterZoneSeed(), mergeLocalUserStatCounters(), mergeTopPlayersEntries() (+3 more)

### Community 16 - "repair_live_pocketbase_schema.mjs"
Cohesion: 0.17
Nodes (7): backfillZoneIds(), desiredFields, ensureElectionRecord(), ensureMapStateStatus(), pb, verifyQueries(), zoneIdFor()

### Community 17 - "regenerate_world.mjs"
Cohesion: 0.32
Nodes (11): batchCreateBuildings(), batchCreateResources(), deleteFiltered(), getZoneId(), main(), makeRandom(), MONSTER_STATS, pb (+3 more)

### Community 18 - "cleanup_building_resource_overlaps.mjs"
Cohesion: 0.33
Nodes (10): authenticate(), findFreeSpot(), getAllowedResourceTypesForBuildingId(), getSortScore(), isActiveBuilding(), keyOf(), LIMIT, main() (+2 more)

### Community 19 - "cleanup_buildings_combat_legacy.mjs"
Cohesion: 0.29
Nodes (10): computePatch(), isValidZoneId(), LIMIT, main(), pb, readField(), toBool(), toNumberOrUndefined() (+2 more)

### Community 20 - "ErrorBoundary"
Cohesion: 0.20
Nodes (5): ErrorBoundary, Props, State, root, rootElement

### Community 21 - "reset_monsters_deterministic.mjs"
Cohesion: 0.38
Nodes (10): authAdmin(), getAllRecords(), getBronekurHomeZoneId(), getBronekurMonsterId(), getRegularMonsterId(), getRegularMonsterPlanForZone(), main(), pbFetch() (+2 more)

### Community 22 - "setup_tree_server_architecture.mjs"
Cohesion: 0.25
Nodes (8): ensureMapResourcesTreeFields(), ensureTreeRespawnsCollection(), main(), MAP_RESOURCE_TREE_FIELDS, migrateExistingTrees(), normalizeInt(), pb, TREE_RESPAWN_FIELDS

### Community 23 - "respawn_all.mjs"
Cohesion: 0.33
Nodes (9): authorize(), BOSS_CONFIG, createRecord(), deleteRecords(), fetchAll(), generateRandomId(), main(), MONSTER_CONFIG (+1 more)

### Community 24 - "getDoc"
Cohesion: 0.29
Nodes (10): findUserRecord(), getDoc(), hashToBase36(), pbFilterString(), pbFilterValue(), query(), queuedGetList(), queuedGetOne() (+2 more)

### Community 25 - "quick_reset_map.mjs"
Cohesion: 0.39
Nodes (8): deleteAll(), getZoneId(), makeId(), MONSTER_HP, pb, run(), seedBuildings(), seedResources()

### Community 26 - "smoke_pocketbase_startup.mjs"
Cohesion: 0.36
Nodes (8): checkHealth(), checkRealtimeEndpoint(), fail(), main(), pass(), pb, results, run()

### Community 27 - "wipe_all_player_buildings.mjs"
Cohesion: 0.33
Nodes (7): DELETE_CONCURRENCY, deleteChunk(), explainPbError(), fetchAllBuildings(), main(), pb, shouldDeleteByOwner()

### Community 28 - "repairMojibakeCp1251Utf8"
Cohesion: 0.33
Nodes (6): normalizeAssetUrl(), normalizeMarketListing(), repairMojibakeCp1251Utf8(), repairMojibakeDom(), resolveUserAvatar(), toTopPlayerEntry()

### Community 29 - "getCrowdingEscapeMove"
Cohesion: 0.32
Nodes (8): buildMonsterZoneCounts(), findFreeMonsterTeleportSpot(), getCrowdingEscapeMove(), getMonsterZoneId(), getZoneId(), isMonsterTileBlocked(), normalizeWorldCoord(), wrapCoord()

### Community 30 - "spawn_monsters_now.mjs"
Cohesion: 0.43
Nodes (7): fetchWithRetry(), monsterConfig, PB_URL_CANDIDATES, resolvePocketBaseUrl(), sanitizePbId(), sleep(), spawnMonsters()

### Community 31 - "logPbAudit"
Cohesion: 0.32
Nodes (8): enqueueRequest(), fetchQueryRecords(), getRuntimeTraceLabel(), logPbAudit(), processQueue(), queuedGetFullList(), summarizeQueryOptions(), withTimeout()

### Community 33 - "mass_delete_monsters.mjs"
Cohesion: 0.57
Nodes (6): authHeaders(), fetchWithRetry(), massDeleteMonsters(), PB_URL_CANDIDATES, resolvePocketBaseUrl(), sleep()

### Community 34 - "processOfflineTimers"
Cohesion: 0.33
Nodes (6): getEffectiveDestructionExpiresAt(), PlacementGuardOptions, processOfflineTimers(), pushRuntimeAuditLog(), recordBuildingTimerTrace(), MapResource

### Community 35 - "export_firebase.js"
Cohesion: 0.33
Nodes (4): db, __dirname, __filename, serviceAccount

### Community 36 - "migrate_chat_messages_top_level.mjs"
Cohesion: 0.73
Nodes (5): isBlankText(), main(), needsTopLevelBackfill(), normalizeText(), normalizeTimestamp()

### Community 37 - "collection"
Cohesion: 0.47
Nodes (6): collection(), createUserWithEmailAndPassword(), onAuthStateChanged(), signInWithEmailAndPassword(), signInWithPopup(), toPBUser()

### Community 38 - "main"
Cohesion: 0.70
Nodes (4): TOWN_HALL_IDS, getAll(), main(), pbRequest()

### Community 39 - "check_idp.js"
Cohesion: 0.40
Nodes (3): __dirname, __filename, serviceAccount

### Community 40 - "check_regressions_worker6.mjs"
Cohesion: 0.40
Nodes (3): checks, failed, source

### Community 41 - "find_nested.js"
Cohesion: 0.40
Nodes (4): content, fs, lines, results

### Community 42 - "import_pocketbase.js"
Cohesion: 0.60
Nodes (4): deriveSchemaFromRecord(), migrate(), pb, toPbId()

### Community 43 - "list_dbs.js"
Cohesion: 0.40
Nodes (3): __dirname, __filename, serviceAccount

### Community 44 - "migrate_zones_80.mjs"
Cohesion: 0.60
Nodes (4): getZoneId(), migrateCollection(), pb, run()

### Community 45 - "actionOptions.ts"
Cohesion: 0.40
Nodes (4): BAN_OPTIONS, CURSE_OPTIONS, PROTECTION_OPTIONS, PUNISHMENT_OPTIONS

### Community 46 - "fix_monster_hp.mjs"
Cohesion: 0.67
Nodes (3): DURABILITY_MAP, main(), req()

### Community 47 - "fix_schema_final_v2.mjs"
Cohesion: 0.50
Nodes (3): main(), pb, SCHEMA_UPDATES

### Community 48 - "import_buildings.js"
Cohesion: 0.67
Nodes (3): migrate(), pb, toPbId()

### Community 49 - "respawn_monsters_manual.mjs"
Cohesion: 0.67
Nodes (3): monsterConfig, respawnMonsters(), sanitizePbId()

### Community 51 - "test_getone.js"
Cohesion: 0.67
Nodes (3): pb, run(), toPbId()

### Community 52 - "test_insert.js"
Cohesion: 0.67
Nodes (3): pb, run(), toPbId()

### Community 54 - "getAvatarCacheKey"
Cohesion: 0.67
Nodes (3): getAvatarCacheKey(), readCachedAvatar(), writeCachedAvatar()

### Community 55 - "getLastPositionCacheKey"
Cohesion: 0.67
Nodes (3): getLastPositionCacheKey(), readCachedLastPosition(), writeCachedLastPosition()

### Community 56 - "getProfileSettingsCacheKey"
Cohesion: 0.67
Nodes (3): getProfileSettingsCacheKey(), readCachedProfileSettings(), writeCachedProfileSettings()

## Knowledge Gaps
- **282 isolated node(s):** `buildingData`, `ZOOM_LEVELS`, `PLAYER_COLORS`, `MOCK_USER_LEVELS`, `BuildMenuTab` (+277 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pocketbase` connect `pocketbase` to `dependencies`, `repair_live_pocketbase_schema.mjs`, `regenerate_world.mjs`, `cleanup_building_resource_overlaps.mjs`, `cleanup_buildings_combat_legacy.mjs`, `setup_tree_server_architecture.mjs`, `quick_reset_map.mjs`, `smoke_pocketbase_startup.mjs`, `wipe_all_player_buildings.mjs`, `migrate_chat_messages_top_level.mjs`, `import_pocketbase.js`, `migrate_zones_80.mjs`, `fix_schema_final_v2.mjs`, `import_buildings.js`, `test_getone.js`, `test_insert.js`, `check_pb.js`, `check_rules.mjs`, `clear_chat_messages.mjs`, `clear_database.js`, `create_elections_collection.mjs`, `fix_buildings_migration.mjs`, `fix_mail_schema.mjs`, `force_reload.mjs`, `setup_elections.mjs`, `test_create_building_2.mjs`, `test_pb.js`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `pocketbase`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `App()` connect `App` to `App.tsx`, `processOfflineTimers`, `types.ts`, `pocketbase.ts`, `collection`, `main`, `updateDoc`, `marketStaticData.ts`, `getPriorityAnimationUrlsForBuilding`, `onSnapshot`, `chooseMonsterBackgroundMove`, `getUserStatCounters`, `getAvatarCacheKey`, `getLastPositionCacheKey`, `getProfileSettingsCacheKey`, `getDoc`, `repairMojibakeCp1251Utf8`, `getCrowdingEscapeMove`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `App()` (e.g. with `createVisualEffect()` and `getPriorityAnimationUrlsForBuilding()`) actually correct?**
  _`App()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `buildingData`, `ZOOM_LEVELS`, `PLAYER_COLORS` to the rest of the system?**
  _282 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.01652892561983471 - nodes in this community are weakly interconnected._
- **Should `monsterAnimationConfig.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.034482758620689655 - nodes in this community are weakly interconnected._