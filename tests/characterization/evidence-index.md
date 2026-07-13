# Evidence Index

## Purpose

List the real source and baseline documents that justify each confirmed
surface group.

## Navigation Only

- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`

## Confirmed Group Index

| Ref | Group | Source Anchors | Baseline Anchors | MVP Wave |
| --- | --- | --- | --- | --- |
| EA-1 | Realtime and Persistence | `src/pocketbase.ts`; `pb_hooks/main.pb.js`; `pb_hooks/tree_server_utils.js` | `03-state-ownership.md`; `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `10-optimistic-ui.md`; `11-error-handling.md`; `15-invariants.md` | P1 |
| EA-2 | Temporal Gameplay | `App.tsx`; `src/pocketbase.ts` | `05-timers-and-processes.md`; `06-building-system.md`; `07-production-system.md`; `08-upgrade-system.md`; `15-invariants.md` | P1 |
| EA-3 | World State and Building Lifecycle | `App.tsx`; `data/buildings.ts`; `src/pocketbase.ts` | `06-building-system.md`; `07-production-system.md`; `08-upgrade-system.md`; `10-optimistic-ui.md`; `11-error-handling.md`; `15-invariants.md` | P1 |
| EA-4 | Optimistic Commands | `App.tsx`; `src/pocketbase.ts` | `03-state-ownership.md`; `04-pocketbase-contracts.md`; `10-optimistic-ui.md`; `11-error-handling.md`; `15-invariants.md` | P1 |
| EA-5 | Combat and AI | `App.tsx`; `data/destructionWeapons.ts`; `src/game/monsters/monsterAnimationConfig.ts` | `05-timers-and-processes.md`; `09-realtime-sync.md`; `11-error-handling.md`; `15-invariants.md` | P2 |
| EA-6 | Resource Economy and Harvesting | `App.tsx`; `src/pocketbase.ts`; `data/items.ts`; `src/game/economy/energyPurchaseOptions.ts`; `src/game/market/marketStaticData.ts`; `pb_hooks/tree_server_utils.js` | `04-pocketbase-contracts.md`; `07-production-system.md`; `10-optimistic-ui.md`; `11-error-handling.md`; `15-invariants.md` | P2 |
| EA-7 | Social and Meta Systems | `App.tsx`; `src/pocketbase.ts` | `03-state-ownership.md`; `04-pocketbase-contracts.md`; `09-realtime-sync.md`; `10-optimistic-ui.md`; `11-error-handling.md`; `15-invariants.md`; `17-traceability-index.md` | P2 |
| EA-8 | Canonical Data and Assets | `data/buildings.ts`; `data/items.ts`; `data/destructionWeapons.ts`; `public/**` | `06-building-system.md`; `07-production-system.md`; `08-upgrade-system.md`; `15-invariants.md`; `16-risk-register.md` | P3 |
| EA-9 | Presentation and Performance | `App.tsx`; `components/**`; `src/game/**`; `public/**` | `01-current-architecture.md`; `09-realtime-sync.md`; `10-optimistic-ui.md`; `11-error-handling.md`; `12-target-architecture.md`; `14-test-strategy.md`; `15-invariants.md`; `16-risk-register.md`; `17-traceability-index.md` | P3 |

## Traceability Rule

Use the evidence rows above only as real source anchors. Do not invent new
categories or replace them with Graphify-only observations.
