# 01. Current Architecture

## How To Read This Document

This architecture view uses three evidence levels:

- `CONFIRMED_BY_SOURCE` means the relationship is visible in the current source code.
- `INFERRED_BY_GRAPH` means Graphify suggests the relationship, but the source was not yet used to prove it.
- `UNCONFIRMED` means the current baseline does not have enough evidence to state the relationship as fact.

## Graphify Navigation Map

The main Graphify communities point to these current clusters:

- `App.tsx` - the primary gameplay shell, with very low cohesion and many cross-cutting responsibilities.
- `pocketbase.ts` - the data access and realtime adapter cluster.
- `types.ts` - shared domain shapes and prop types.
- `monsterAnimationConfig.ts` - animation data.
- `marketStaticData.ts` - market/economy data.
- `actionOptions.ts` - clan / punishment / protection option data.
- `IconComponents.tsx` - icon primitives used by the UI.
- `getPriorityAnimationUrlsForBuilding()` - a hot data-selection helper around building visuals.
- `onSnapshot()` - the realtime wrapper cluster.
- `updateDoc()` and `setDoc()` - write-path clusters.
- `chooseMonsterBackgroundMove()` and `getUserStatCounters()` - focused gameplay helper clusters.
- `tree_server_utils.js` - a backend-side tree workflow boundary surfaced by Graphify.

Graphify also reports that `App()` has 3 inferred edges, and that `App.tsx` has very low cohesion. That is a navigation signal, not a proof that the file should be split in this stage.

## Confirmed Runtime Architecture

### 1. `App.tsx` is the runtime shell

Source evidence:

- `App.tsx:2875-23138` defines `const App: React.FC = () => { ... }` and exports it at the end.
- `App.tsx:4450-4509` handles the global reload and map-generation effects.
- `App.tsx:4764-4900` covers zone-sensitive loading and realtime map data.
- `App.tsx:5298-5592` covers click handling for resources and trees.
- `App.tsx:5850-6180` covers building placement, validation, and persistence.
- `App.tsx:627-860+` covers offline timer reconciliation and catch-up logic.
- `App.tsx:6848-7840` covers user sync, leaderboard, and presence flows.
- `App.tsx:7340-8878` covers clan, market, and election loading / interaction.
- `App.tsx:9347-9365` covers private message syncing.
- `App.tsx:9764-11463` covers canvas drawing.
- `App.tsx:11469-12752` covers the main game loop and reconciliation pass.

What this means:

- It owns the auth bootstrap and the main UI state.
- It coordinates local state with server snapshots.
- It renders the world and drives the animation loop.
- It hosts the major gameplay systems: buildings, production, resources, chat, market, clans, elections, leaderboards, presence, and timers.

### 2. `src/pocketbase.ts` is the data and realtime layer

Source evidence:

- `src/pocketbase.ts:1-19` initializes the PocketBase client and disables auto-cancellation.
- `src/pocketbase.ts:161-178` provides queued request helpers.
- `src/pocketbase.ts:1037-1185` implements `setDoc`.
- `src/pocketbase.ts:1204-1450` implements `updateDoc`.
- `src/pocketbase.ts:1853-2219+` implements `onSnapshot`.
- `src/pocketbase.ts:2392-2418` implements `requestTreeHit`.

What this means:

- PocketBase access is centralized instead of being spread directly throughout the UI.
- Writes are protected with partial-merge and field-preservation logic.
- Realtime subscriptions are wrapped with retry, throttling, and initial-fetch behavior.
- Tree harvesting is routed through a server endpoint rather than a direct client-side record mutation.

### 3. The app currently has one large orchestration boundary

Graphify and direct source reading both point to the same broad boundary:

- orchestration and gameplay state live in `App.tsx`
- server interaction lives in `src/pocketbase.ts`
- static data lives in small dedicated modules
- a few helper clusters exist for animations, market data, and UI icons

That makes the current repository easy to navigate at the top level, but the main gameplay shell is still a monolith.

## Confirmed Subsystems

### Build / construction / production

Status: `CONFIRMED_BY_SOURCE`

Evidence:

- `App.tsx:5850-6180`
- `App.tsx:627-860+`
- `App.tsx:11469-12752`

Signals:

- construction completion
- work-state completion
- destruction finalization
- offline catch-up for overdue timers

### Realtime / snapshot reconciliation

Status: `CONFIRMED_BY_SOURCE`

Evidence:

- `App.tsx:4450-4509`
- `App.tsx:4794-4900`
- `App.tsx:6848-7840`
- `src/pocketbase.ts:1853-2219+`

Signals:

- map-state reload listener
- zone-scoped resource sync
- user / leaderboard / presence snapshot flows
- realtime wrapper with retry and throttling

### Optimistic UI and stale-state guards

Status: `CONFIRMED_BY_SOURCE`

Evidence:

- `App.tsx:5233-5243`
- `App.tsx:5368-5370`
- `App.tsx:6134-6221`
- `App.tsx:11479-11525`

Signals:

- `lastInteractionRef`
- `pendingHostClaimsRef`
- `speedUpInFlightRef`
- freshness checks before auto-completion

### Tree harvesting

Status: `CONFIRMED_BY_SOURCE`

Evidence:

- `App.tsx:5411-5545`
- `src/pocketbase.ts:2392-2418`

Signals:

- resource click handler
- `requestTreeHit(resourceId)`
- server-returned payload applied only after the request succeeds

### Social / economy systems

Status: `CONFIRMED_BY_SOURCE`

Evidence:

- `App.tsx:7340-8878`
- `App.tsx:9347-9365`

Signals:

- chat
- clans
- market
- elections
- private messages
- presence and leaderboard support

## Domain Boundaries

The current source suggests these working boundaries:

- Gameplay shell and orchestration: `App.tsx`
- Persistence and realtime transport: `src/pocketbase.ts`
- Static domain data: `data/*.ts`, `src/game/**`, `types.ts`
- UI primitives: `components/*.tsx`, `IconComponents.tsx`
- Backend hook / server-side tree logic: `pb_hooks/*.js`
- Maintenance and migration tooling: root-level scripts and repair utilities

The backend hook boundary is visible in Graphify, but it is still only `INFERRED_BY_GRAPH` in this baseline unless the hook source is read directly.

## What Graphify Can And Cannot Prove

Graphify is useful for navigation, but it cannot prove:

- exact runtime ordering between optimistic local writes and later realtime snapshots
- whether every dynamic callback is actually invoked in production
- whether every helper is still live in the current build
- whether a legacy or backup file is truly inactive

Examples of Graphify-only links that remain `INFERRED_BY_GRAPH`:

- `App()` -> `createVisualEffect()`
- `App()` -> `getPriorityAnimationUrlsForBuilding()`
- `App()` -> `src/pocketbase` snapshot-data helpers
- `pb_hooks/tree_server_utils.js` -> `processTreeHit()` / `processDueTreeRespawns()`
- `src/pocketbase.ts` transaction helpers -> ref/data helpers

## Current Risk Picture

- `App.tsx` is still a very large mixed-responsibility file.
- Graphify shows low cohesion and a large number of weakly connected nodes.
- The graph is current enough to guide the next audit, but it is not sufficient to replace direct source reading.

