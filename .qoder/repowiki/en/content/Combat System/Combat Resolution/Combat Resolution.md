# Combat Resolution

<cite>
**Referenced Files in This Document**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)
- [BuildingDetail.tsx](file://components/BuildingDetail.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the combat resolution system in the game, focusing on how battles are simulated, how outcomes are determined, and how rewards and penalties are distributed. It covers:
- Battle simulation between monsters and defensive structures (cannons)
- Winner determination based on damage accumulation and HP thresholds
- Resource rewards from destroyed buildings, including glory and loot
- Integration with the building system for destruction rewards and territorial control
- The combat log/history system and audit trail
- Player progression, reputation changes, and social consequences
- Practical guidance for synchronization, exploit prevention, tie handling, and performance optimization

## Project Structure
The combat system is implemented in the main application file and supported by shared types and building definitions:
- App.tsx: Contains the game loop, combat simulation, damage accumulation, building destruction, reward distribution, and history logging
- types.ts: Defines core data structures used across the system, including Building, PlacedBuilding, DestructionInfo, and HistoryEntry
- data/buildings.ts: Provides building definitions, including stats, drops, and destruction options
- components/BuildingDetail.tsx: Renders destruction options for UI display

```mermaid
graph TB
subgraph "Runtime"
GameLoop["Game Loop<br/>Combat Simulation"]
DamageAccumulation["Damage Accumulation"]
BuildingDestruction["Building Destruction"]
RewardDistribution["Reward Distribution"]
HistoryLog["History Logging"]
end
subgraph "Data"
Types["Types<br/>Building, PlacedBuilding, DestructionInfo, HistoryEntry"]
BuildingsData["Buildings Data<br/>Stats, Drops, DestructionInfo"]
end
GameLoop --> DamageAccumulation
GameLoop --> BuildingDestruction
BuildingDestruction --> RewardDistribution
GameLoop --> HistoryLog
Types --> GameLoop
BuildingsData --> GameLoop
```

**Diagram sources**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)

**Section sources**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)

## Core Components
- PlacedBuilding: Represents a building on the map, including position, ownership, HP, timers, and combat-related fields (initiatorId, lastAttackTime, protectionEndTime)
- Building: Defines static characteristics such as durability, damage, repair, and drops
- DestructionInfo: Describes weapon options for destruction, including costs and damage
- HistoryEntry: Captures combat-related actions for audit and display

Key combat-relevant fields:
- PlacedBuilding.hp/maxHp: Health pool for buildings under attack
- PlacedBuilding.pendingDamage: Accumulated damage applied during the current tick
- PlacedBuilding.isDestroying/destructionEndTime: Timers for delayed destruction actions
- PlacedBuilding.lastAttackTime: Tracks when a building last participated in combat
- PlacedBuilding.protectionEndTime: Temporarily prevents destructive actions
- Building.stats.durability: Base HP threshold for destruction
- Building.stats.damage: Attack power for defense structures
- Building.stats.gloryOnExplosion: Glory reward for the building’s owner upon destruction
- Building.drops: Loot tables for frequent and rare items

**Section sources**
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)

## Architecture Overview
The combat resolution pipeline runs continuously in the game loop:
1. Identify active actors (monsters and defensive structures)
2. Compute targets and apply damage per tick
3. Update HP and detect destruction
4. Distribute rewards and loot
5. Log combat events

```mermaid
sequenceDiagram
participant GameLoop as "Game Loop"
participant Monsters as "Monsters"
participant Cannons as "Defensive Structures"
participant Buildings as "Buildings"
participant Rewards as "Rewards"
participant History as "History"
GameLoop->>Monsters : Select eligible monsters
GameLoop->>Cannons : Select eligible defenses
GameLoop->>Monsters : Find adjacent targets
Monsters->>Buildings : Apply damage (HP -= damage)
GameLoop->>Cannons : Target monsters within range
Cannons->>Buildings : Apply damage (HP -= damage)
Buildings->>Buildings : Check HP <= 0
alt Destroyed
Buildings->>Rewards : Award glory and loot
Buildings->>History : Log destruction event
else Survived
Buildings->>Buildings : Persist updated HP
end
```

**Diagram sources**
- [App.tsx](file://App.tsx)

## Detailed Component Analysis

### Monster vs Defensive Structures
- Targeting: Monsters scan adjacent tiles for enemy buildings, prioritizing categories defined by stats.hates or defaulting to business-type categories when not specified
- Damage scaling: If a monster attacks a building of its hated category, damage is doubled
- Attack timing: Monsters and cannons apply damage only after meeting their move/attack intervals

```mermaid
flowchart TD
Start(["Tick Start"]) --> ScanMonsters["Scan Active Monsters"]
ScanMonsters --> AdjacentTargets["Find Adjacent Targets"]
AdjacentTargets --> HasTarget{"Target Found?"}
HasTarget --> |Yes| ChooseTarget["Choose Target by Hate/Default"]
HasTarget --> |No| RandomMove["Pick Random Valid Move"]
ChooseTarget --> ApplyDamage["Compute Damage (Scale if Hated)"]
ApplyDamage --> UpdateMonster["Update Monster State"]
RandomMove --> UpdateMonster
UpdateMonster --> CannonScan["Scan Nearby Defenses"]
CannonScan --> CannonTargets["Select Targets Within Range"]
CannonTargets --> CannonDamage["Apply Cannon Damage"]
CannonDamage --> NextTick["Next Tick"]
```

**Diagram sources**
- [App.tsx](file://App.tsx)

**Section sources**
- [App.tsx](file://App.tsx)

### Damage Application and Building Destruction
- Damage accumulation: During each tick, damage is accumulated per tile and later subtracted from HP
- HP thresholds: Buildings are destroyed when HP falls to zero or below
- Visual feedback: Explosions are generated on destruction
- Owner checks: Only the building owner or designated host can persist partial HP after destruction

```mermaid
flowchart TD
Enter(["Apply Damage"]) --> Accumulate["Accumulate Damage per Tile"]
Accumulate --> Subtract["Subtract from HP"]
Subtract --> CheckZero{"HP <= 0?"}
CheckZero --> |Yes| Explode["Spawn Explosion Effects"]
Explode --> OwnerCheck{"Owner or Host?"}
OwnerCheck --> |Yes| PersistHP["Persist Remaining HP"]
OwnerCheck --> |No| Delete["Delete Building Doc"]
PersistHP --> End(["Done"])
Delete --> End
CheckZero --> |No| UpdateHP["Update Building HP"]
UpdateHP --> End
```

**Diagram sources**
- [App.tsx](file://App.tsx)

**Section sources**
- [App.tsx](file://App.tsx)

### Reward Distribution on Destruction
- Glory rewards: The building owner gains glory equal to stats.gloryOnExplosion when their building is destroyed by an action they initiated or are the fallback owner for
- Loot generation: If drops are defined, random item spawns are created with configurable chances and amounts
- Ownership eligibility: Only initiators or fallback owners receive glory and loot

```mermaid
sequenceDiagram
participant Building as "Destroyed Building"
participant Owner as "Owner/Host"
participant Rewards as "Rewards"
participant Loot as "Loot System"
Building->>Owner : Check Initiator/Fallback Ownership
alt Eligible
Owner->>Rewards : Add Glory (gloryOnExplosion)
Owner->>Loot : Spawn Drops (chance-based)
else Not Eligible
Owner-->>Owner : No rewards
end
```

**Diagram sources**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)

**Section sources**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)

### Integration with Building System and Territorial Control
- Destruction options: Buildings define destructionInfo entries that specify weapon requirements, costs, and damage
- Weapon consumption: Players spend inventory items, gold, and energy to trigger destruction actions
- Zone-based effects: Some mechanics (e.g., taxation) depend on zone coordinates; destruction actions respect protection timers and zone ownership
- UI exposure: The Building Detail panel lists destruction options for players to choose from

```mermaid
classDiagram
class Building {
+number durability
+number gloryOnExplosion
+object drops
+DestructionInfo[] destructionInfo
}
class PlacedBuilding {
+number hp
+number maxHp
+number pendingDamage
+boolean isDestroying
+number destructionEndTime
+string ownerId
+string initiatorId
+number protectionEndTime
}
class DestructionInfo {
+number resourceId
+string weaponName
+number amount
+number goldCost
+number energyCost
+number timeSeconds
+number damage
}
Building --> DestructionInfo : "defines"
PlacedBuilding --> Building : "based on"
```

**Diagram sources**
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)
- [App.tsx](file://App.tsx)

**Section sources**
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)
- [App.tsx](file://App.tsx)

### Combat Log System, History Tracking, and Audit Trails
- History entries: The system logs combat-related actions with timestamps and types (e.g., destroy, combat)
- UI display: History entries are rendered in the profile/history tab with localized timestamps
- Persistence: Logs capture who performed actions, where, and what was destroyed

```mermaid
sequenceDiagram
participant UI as "UI"
participant Game as "Game Loop"
participant Firestore as "Firestore"
UI->>Game : Trigger Action (e.g., explode)
Game->>Firestore : Write History Entry
Firestore-->>UI : Confirm write
UI->>UI : Render History List
```

**Diagram sources**
- [App.tsx](file://App.tsx)

**Section sources**
- [App.tsx](file://App.tsx)

### Relationship Between Outcomes and Player Progression, Reputation, and Social Consequences
- Glory: Earned when buildings explode, contributing to player progression metrics
- Reputation: Social actions (praise/complain) modify player reputation and are logged
- Social UI: Buttons for praise and complaints are exposed in profiles, with transactional updates and local fallbacks

```mermaid
graph TB
Actions["Actions"] --> Glory["Glory Gain"]
Actions --> Reputation["Reputation Change"]
Actions --> History["History Log"]
Glory --> Progression["Player Progression"]
Reputation --> Social["Social Consequences"]
```

**Diagram sources**
- [App.tsx](file://App.tsx)

**Section sources**
- [App.tsx](file://App.tsx)

## Dependency Analysis
- App.tsx orchestrates combat logic and interacts with Firestore for persistence
- types.ts defines shared structures used across components
- data/buildings.ts supplies building definitions consumed by the game loop
- components/BuildingDetail.tsx renders destruction options for UI selection

```mermaid
graph LR
App["App.tsx"] --> Types["types.ts"]
App --> BuildingsData["data/buildings.ts"]
UI["components/BuildingDetail.tsx"] --> BuildingsData
App --> UI
```

**Diagram sources**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)
- [BuildingDetail.tsx](file://components/BuildingDetail.tsx)

**Section sources**
- [App.tsx](file://App.tsx)
- [types.ts](file://types.ts)
- [buildings.ts](file://data/buildings.ts)
- [BuildingDetail.tsx](file://components/BuildingDetail.tsx)

## Performance Considerations
- Batch updates: Prefer applying state changes and Firestore writes in batches to reduce network overhead
- Interval-based actions: Use attack/move intervals to throttle damage application and avoid excessive computations
- Local optimistic updates: Maintain local state for recent interactions to minimize perceived latency; reconcile with server state when appropriate
- Zone-based queries: Limit Firestore reads/writes to relevant zones to reduce load
- Avoid redundant writes: Only update documents when state changes are detected

## Troubleshooting Guide
Common issues and mitigations:
- Synchronization across clients
  - Use sticky interaction logic to prevent rollback of recent local changes until server catches up
  - Merge server and local states carefully, keeping local-only persistent entities
  - Example references:
    - [App.tsx](file://App.tsx)
- Preventing combat exploits
  - Validate ownership and protection timers before allowing destructive actions
  - Enforce weapon/item/energy/gold requirements before initiating destruction
  - Example references:
    - [App.tsx](file://App.tsx)
- Handling tie scenarios
  - When multiple actors target the same tile, accumulate damage and resolve HP in a single pass per tick
  - Example references:
    - [App.tsx](file://App.tsx)
- Optimizing combat resolution performance
  - Use efficient data structures (maps) for damage accumulation and updates
  - Minimize Firestore operations by batching and debouncing writes
  - Example references:
    - [App.tsx](file://App.tsx)

**Section sources**
- [App.tsx](file://App.tsx)

## Conclusion
The combat resolution system simulates real-time battles between monsters and defensive structures, resolves outcomes deterministically based on damage accumulation and HP thresholds, and distributes rewards and penalties fairly. It integrates tightly with the building system for destruction rewards and loot, maintains a robust history/log system, and supports player progression and social dynamics. By following the recommended practices for synchronization, exploit prevention, and performance, developers can maintain a smooth and fair combat experience.

## Appendices

### Concrete Examples from the Codebase
- Monster targeting and damage scaling:
  - [App.tsx](file://App.tsx)
- Cannon targeting and damage application:
  - [App.tsx](file://App.tsx)
- Building destruction and reward distribution:
  - [App.tsx](file://App.tsx)
- Destruction options UI:
  - [BuildingDetail.tsx](file://components/BuildingDetail.tsx)
- Building definitions (stats, drops, destruction):
  - [buildings.ts](file://data/buildings.ts)
- Shared types:
  - [types.ts](file://types.ts)