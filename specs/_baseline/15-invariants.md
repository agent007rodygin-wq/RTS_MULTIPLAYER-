# 15. Final Invariant Catalog

## Scope

This catalog records the invariants that are currently verified, partially verified, or still open in the active source snapshot. Graphify was used only as a navigation aid. Every row is grounded either in direct source reading or in the already created baseline documents with source anchors.

Status values used in this file:

- `CONFIRMED`
- `PARTIALLY_CONFIRMED`
- `UNCONFIRMED`
- `NOT_APPLICABLE`

## Time and Process Invariants

| ID | Formulation | Area | Status | Proof | Violating or risky flow | Affected files / functions | Required future test | Severity | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-TIME-01 | Every process in scope has a stable identity that survives optimistic creates and reloads. | Time and process | CONFIRMED | `App.tsx` uses stable building ids, temp-id mapping refs, and process-specific refs; 05/10 document the timer-backed process families. | temporary building ids, stale selection objects, or index-based identity | `App.tsx:5862-6234, 7954-8028, 16123-16189`; `03`, `05`, `10` | reload/reconnect identity continuity test | HIGH | HIGH |
| INV-TIME-02 | Every process uses a canonical absolute end timestamp rather than countdown-only state. | Time and process | CONFIRMED | construction, production, destruction, and protection all persist end-time fields in `PlacedBuilding` and rereread them on load. | local countdown drift | `App.tsx:627-860, 14461-16189`; `types.ts:122-163`; `05` | end-time roundtrip test | HIGH | HIGH |
| INV-TIME-03 | Time units are explicit and converted in one direction only. | Time and process | CONFIRMED | current code stores milliseconds and converts seconds from building config fields into ms; 05 documents the timer fields. | mixed seconds/ms math | `App.tsx:627-860, 14461-16189`; `data/buildings.ts`; `05` | unit conversion test | HIGH | HIGH |
| INV-TIME-04 | An earlier canonical end timestamp must complete earlier than a later canonical end timestamp. | Time and process | CONFIRMED | process completion and offline catch-up are based on absolute timestamp comparison. | concurrent timers and catch-up loops | `App.tsx:627-860, 7988-8028, 14618-16189`; `05` | ordering test for completion timestamps | HIGH | HIGH |
| INV-TIME-05 | Reload or reconnect does not reset a persisted process. | Time and process | CONFIRMED | timer fields are written to PocketBase and reread on load; `forceReloadAt` only gates a reload, it does not define persistence. | reload gate vs persistence confusion | `App.tsx:4450-4477, 627-860, 7954-8560`; `src/pocketbase.ts:832-1460`; `05`, `09`, `11` | reload persistence test using timer fields | CRITICAL | HIGH |
| INV-TIME-06 | A local countdown is display-only and is not the source of truth. | Time and process | CONFIRMED | `LoadingScreen.tsx` and timer UI are gates / displays, while process state is stored in records and catch-up logic. | UI countdown drifting from saved state | `LoadingScreen.tsx:46-47`; `App.tsx:2496-2503, 8442-8456` | UI countdown vs persisted state test | MEDIUM | HIGH |
| INV-TIME-07 | Offline catch-up is applied once per stale timer state and not repeatedly for the same record. | Time and process | CONFIRMED | `_offlineTimersSynced` and last-sync guards prevent repeated DB writes during catch-up. | repeated reloads or stale snapshots | `App.tsx:627-860, 7954-8028`; `05` | repeated catch-up replay test | HIGH | HIGH |
| INV-TIME-08 | Completion is idempotent for timer-backed processes. | Time and process | PARTIALLY_CONFIRMED | completion guards and idempotent update shapes exist, but not every runtime ordering edge is proven. | stale snapshot / double tick / replay | `App.tsx:627-860, 14618-16189`; `05`, `10`, `11` | duplicate completion test | HIGH | MEDIUM |
| INV-TIME-09 | Rewards are issued at most once per completed process. | Time and process | PARTIALLY_CONFIRMED | reward emission is guarded by current state and post-write reconciliation, but some paths still depend on later snapshots. | duplicate reward after reload / retry | `App.tsx:627-860, 14618-16189, 15944-16189`; `05`, `10`, `11` | reward idempotency test | CRITICAL | MEDIUM |
| INV-TIME-10 | A stale snapshot must not restore a process that has already completed. | Time and process | PARTIALLY_CONFIRMED | `lastInteractionRef`, tombstones, and snapshot merge policy are present, but full runtime proof of every edge is not yet complete. | late realtime event after local completion | `App.tsx:7954-8560, 16123-16189`; `03`, `09`, `10` | stale snapshot replay test | HIGH | MEDIUM |

## State Ownership Invariants

| ID | Formulation | Area | Status | Proof | Violating or risky flow | Affected files / functions | Required future test | Severity | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-STATE-01 | Every persistent entity has one server source of truth. | State ownership | CONFIRMED | PocketBase is the persistent authority per constitution and 04/09/11. | client mirror drifting into truth | `App.tsx:6367-7051, 7954-8560`; `src/pocketbase.ts:832-1460, 1853-2354`; `03`, `04`, `09`, `11` | ownership map assertion test | HIGH | HIGH |
| INV-STATE-02 | Optimistic state is never the final server truth. | State ownership | CONFIRMED | 10 documents local-first flows, but always as a pre-ack mirror or rollback candidate. | local optimistic write becoming authoritative by accident | `App.tsx:5246-5285, 5862-6234, 14068-16189`; `10` | optimistic/realtime reconciliation test | HIGH | HIGH |
| INV-STATE-03 | Merge state is not a second independent source of truth. | State ownership | CONFIRMED | `placedBuildings`, `allUsers`, and chat lists are merge results, not canonical stores. | using merged state for future writes without server check | `App.tsx:6848-7840, 7954-8560, 7340-7498`; `03`, `09`, `10` | merge-vs-owner test | HIGH | HIGH |
| INV-STATE-04 | A selected entity or array index is not a stable process identity. | State ownership | CONFIRMED | the code uses ids, refs, and tombstones rather than selected indexes as identity. | selection-based async mutation | `App.tsx:3040-3446, 5862-6234, 14461-16189` | selection reorder test | MEDIUM | HIGH |
| INV-STATE-05 | Server snapshots must not overwrite newer confirmed local state. | State ownership | PARTIALLY_CONFIRMED | merge guards and last-interaction refs exist, but runtime race coverage is incomplete. | stale snapshot after local write | `App.tsx:7954-8560, 16123-16189`; `03`, `09`, `10` | stale overwrite race test | HIGH | MEDIUM |
| INV-STATE-06 | Tombstones are suppression helpers, not truth. | State ownership | CONFIRMED | dead-id sets and deleted-record keys are only used to suppress reappearance and repeated 404s. | resurrecting deleted buildings/resources/items | `src/pocketbase.ts:658-699, 1213-1496`; `App.tsx:5300-5592, 15810-16520`; `03`, `04`, `11` | resurrection suppression test | HIGH | HIGH |

## Optimistic UI And Rollback Invariants

| ID | Formulation | Area | Status | Proof | Violating or risky flow | Affected files / functions | Required future test | Severity | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-OPT-01 | Every resource debit is either confirmed by server state or explicitly rolled back. | Optimistic UI / rollback | PARTIALLY_CONFIRMED | some flows fully roll back; others only reconcile later or rely on follow-up snapshot repair. | partial write or network failure after local debit | `App.tsx:5246-5285, 5862-6234, 14068-16189, 17111-17252`; `10`, `11` | resource debit rollback matrix | CRITICAL | MEDIUM |
| INV-OPT-02 | Every optimistic create either receives server identity or is removed. | Optimistic UI / rollback | CONFIRMED | building placement and special resource construction remove optimistic state when create fails. | optimistic create failure | `App.tsx:5862-6234, 14068-14186`; `10` | optimistic create rollback test | HIGH | HIGH |
| INV-OPT-03 | Retry must not repeat an irreversible operation. | Optimistic UI / rollback | CONFIRMED | duplicate click guards, dead-record caches, and in-flight refs are present. | repeated submit after slow response | `App.tsx:16123-16189, 13777-14004, 17111-17252`; `src/pocketbase.ts:1213-1496` | duplicate-submit test | HIGH | HIGH |
| INV-OPT-04 | Timeout after a possible server success must not create a duplicate effect. | Optimistic UI / rollback | PARTIALLY_CONFIRMED | request timeout exists, but not every write path has runtime proof of duplicate-suppression after timeout. | late ack after timeout | `src/pocketbase.ts:80-99, 161-193`; `App.tsx:5862-6234, 14461-16189` | timeout replay test | HIGH | MEDIUM |
| INV-OPT-05 | Full rollback restores all local mutations. | Optimistic UI / rollback | CONFIRMED | placement, move, oil/quarry build have full local reversal on failure. | create/update failure | `App.tsx:5246-5285, 5862-6234, 14068-14186` | full rollback matrix test | HIGH | HIGH |
| INV-OPT-06 | Partial rollback must not be represented as full rollback. | Optimistic UI / rollback | CONFIRMED | speed-up and clan join/leave are only partially rolled back. | assuming compensation is complete when it is not | `App.tsx:16123-16189, 17111-17183`; `10`, `11` | partial-rollback labeling test | MEDIUM | HIGH |
| INV-OPT-07 | Snapshot repair is not a full rollback if resources were already spent. | Optimistic UI / rollback | CONFIRMED | the docs explicitly distinguish later repair from actual refund / revert. | resource already spent but view healed later | `10`, `11` | snapshot-repair vs rollback test | MEDIUM | HIGH |
| INV-OPT-08 | Duplicate click guards prevent repeated mutation. | Optimistic UI / rollback | CONFIRMED | `isBuildingActionProcessing`, `isMarketProcessing`, `speedUpInFlightRef`, and similar guards exist. | double-tap or multi-click | `App.tsx:3040-3446, 5862-6234, 13777-17252`; `10` | duplicate-click guard test | HIGH | HIGH |

## Realtime And Network Invariants

| ID | Formulation | Area | Status | Proof | Violating or risky flow | Affected files / functions | Required future test | Severity | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-RT-01 | One logical subscription is created once per source. | Realtime / network | CONFIRMED | `onSnapshot()` and collection fetches are routed through a single adapter. | accidental duplicate subscribe | `src/pocketbase.ts:1853-2219`; `App.tsx:4450-8560` | duplicate-subscribe test | HIGH | HIGH |
| INV-RT-02 | Cleanup must actually unsubscribe. | Realtime / network | CONFIRMED | effect cleanups and unsubscribe functions are present in the adapter and App effects. | unmounted listener still mutating state | `src/pocketbase.ts:1841-1964, 2219`; `App.tsx:7310, 7497, 7838, 8560` | unmount cleanup test | HIGH | HIGH |
| INV-RT-03 | Initial fetch and realtime event must not lose newer state. | Realtime / network | PARTIALLY_CONFIRMED | the adapter fetches first and then subscribes, but the exact race envelope still needs runtime proof. | late initial snapshot vs realtime event | `src/pocketbase.ts:1853-2219`; `09` | initial-vs-realtime ordering test | HIGH | MEDIUM |
| INV-RT-04 | Retry is bounded. | Realtime / network | CONFIRMED | transient retries back off and cap at 30000 ms. | infinite retry loop | `src/pocketbase.ts:1874-1928`; `04`, `09` | bounded retry test | HIGH | HIGH |
| INV-RT-05 | Transient errors must not be silently treated as empty data. | Realtime / network | PARTIALLY_CONFIRMED | `getDoc()` rethrows non-404, but `getDocs()` can return an empty snapshot on error. | error disguised as no records | `src/pocketbase.ts:953-1028`; `11` | error-vs-empty-snapshot test | HIGH | MEDIUM |
| INV-RT-06 | 404 is distinct from network failure. | Realtime / network | CONFIRMED | `getDoc`, `updateDoc`, `onSnapshot`, and cleanup code treat 404 separately from other failure classes. | deleted record vs transport failure confusion | `src/pocketbase.ts:776-1028, 1204-1460, 1853-1964`; `11` | 404-vs-network classification test | HIGH | HIGH |
| INV-RT-07 | A deleted record must not resurrect from a stale snapshot. | Realtime / network | CONFIRMED | tombstones and dead-id caches suppress reappearance. | stale snapshot / replay | `src/pocketbase.ts:658-699, 1213-1496, 1853-1964`; `App.tsx:7954-8560, 15810-16520` | resurrection test | HIGH | HIGH |

## Persistence And Compatibility Invariants

| ID | Formulation | Area | Status | Proof | Violating or risky flow | Affected files / functions | Required future test | Severity | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-PB-01 | Existing PocketBase records remain readable. | Persistence / compatibility | CONFIRMED | adapter reads preserve record shapes and explicit 404 handling does not overwrite data with defaults. | non-404 read error treated as missing data | `src/pocketbase.ts:832-1034, 953-968`; `04`, `11` | read-compatibility test | HIGH | HIGH |
| INV-PB-02 | Raw JSON fields are preserved on partial update. | Persistence / compatibility | CONFIRMED | `setDoc()` / `updateDoc()` preserve raw `data` payload fields while merging known fields. | partial update truncating sibling fields | `src/pocketbase.ts:1037-1460`; `04`, `11` | raw-json preservation test | HIGH | HIGH |
| INV-PB-03 | Legacy fallback stays in place until an explicit migration retires it. | Persistence / compatibility | CONFIRMED | fallback lookup, cleanup caches, and compatibility branches are present. | removing a compatibility branch too early | `src/pocketbase.ts:571-699, 832-1460, 1853-1964`; `04`, `11` | legacy-fallback compatibility test | MEDIUM | HIGH |
| INV-PB-04 | Server hooks and client assumptions remain compatible. | Persistence / compatibility | PARTIALLY_CONFIRMED | tree-hit and tree-respawn hooks are source-backed, but the full hook cluster is not exhaustively proven here. | client/hook contract drift | `pb_hooks/main.pb.js:3-55`, `pb_hooks/tree_server_utils.js:6-700`; `04`, `05` | hook-contract smoke test | HIGH | MEDIUM |
| INV-PB-05 | Current code does not require a destructive migration for the next stage. | Persistence / compatibility | CONFIRMED | current baseline shows no schema rename or save-format rewrite is required for the 2E architecture work. | accidental destructive schema changes | constitution v1.0.0; `04`, `11`, `17` | migration-safety review | HIGH | HIGH |

## Gameplay Preservation Invariants

| ID | Formulation | Area | Status | Proof | Violating or risky flow | Affected files / functions | Required future test | Severity | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-GAME-01 | Balance, durations, costs, rewards, and item IDs remain stable during audit / refactor work. | Gameplay preservation | CONFIRMED | constitution and 05-08 baseline docs freeze these values; current source uses those configs directly. | accidental balance change in extraction | `data/buildings.ts`, `data/destructionWeapons.ts`, `App.tsx`; `05`, `06`, `07`, `08` | balance freeze test | CRITICAL | HIGH |
| INV-GAME-02 | Destruction / combat behavior does not change without an explicit spec. | Gameplay preservation | CONFIRMED | destruction and combat rules are documented in 05/11 and implemented in the current loop. | behavior drift during extraction | `App.tsx:11469-12752, 15944-16189`; `05`, `11` | combat regression test | HIGH | HIGH |
| INV-GAME-03 | `App.tsx` remains the orchestration root until separately approved refactor work exists. | Gameplay preservation | CONFIRMED | constitution explicitly says the monolith should not be rewritten wholesale. | architectural rewrite by accident | `App.tsx` root plus constitution v1.0.0 | shell-orchestration smoke test | HIGH | HIGH |
| INV-GAME-04 | No destructive migration is required for the next stage. | Gameplay preservation | CONFIRMED | current docs and source do not require schema or save-format changes for this stage. | accidental save corruption | `04`, `11`, `17` | migration safety gate | HIGH | HIGH |

## Confirmed Violations

- None were proven from the current source snapshot in this stage.
- The current code contains partial-rollback and partial-proof areas, but those are not yet source-backed violations.

## Partial Violations

- `INV-TIME-09`: reward-once is strongly guarded but not exhaustively runtime-proven for every replay edge.
- `INV-OPT-04`: timeout-after-success duplicate suppression is not proven for every write path.
- `INV-RT-03`: initial fetch vs realtime ordering is implemented, but the full race envelope is still partially confirmed.
- `INV-RT-05`: `getDocs()` can fail open into an empty snapshot, which is a deliberate continuity tradeoff rather than a fully closed error path.
- `INV-PB-04`: server hook compatibility is source-backed in the tree paths, but not exhaustively proven for the whole hook surface.

## Unconfirmed Risks

- exact runtime ordering between optimistic local writes and later snapshots
- raw 409 / uniqueness handling beyond the `validation_not_unique` create fallback
- malformed JSON and invalid timestamp recovery beyond the demonstrated healing helpers
- whether every backend hook outside the audited tree paths still matches current client assumptions

## Confirmed Protections

- request queueing and request timeout in `src/pocketbase.ts`
- dead-record suppression caches and tombstones
- full rollback for building placement, move, oil rig, and quarry creation
- optimistic duplicate-click guards and in-flight refs
- explicit reload / catch-up timer fields written to PocketBase
- bounded realtime retry and fail-open fallback only where explicitly implemented
- raw JSON preservation during partial updates
- compatibility fallbacks for legacy record lookup

