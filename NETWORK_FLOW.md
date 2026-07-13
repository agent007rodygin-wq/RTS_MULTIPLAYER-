# Network Flow

This file shows how the main game interactions move through the client, PocketBase, and realtime updates.

## Shared Pattern

Most flows follow this shape:

```mermaid
flowchart TD
  A[Player action] --> B[App.tsx handler]
  B --> C[Client validation]
  C --> D[HTTP or realtime request]
  D --> E[PocketBase or server hook]
  E --> F[Persisted record]
  F --> G[Realtime update]
  G --> H[Client state refresh]
  H --> I[UI rerender]
```

## Tree Hit

```mermaid
flowchart TD
  A[Player clicks a tree] --> B[App.tsx]
  B --> C[requestTreeHit(resourceId)]
  C --> D[POST /api/basingse/tree-hit]
  D --> E[tree_server_utils.js]
  E --> F[Validate auth, tree state, energy]
  F --> G[Reduce tree hp]
  F --> H[Grant energy cost, wood, gold, glory]
  G --> I{Tree depleted?}
  I -->|No| J[Save updated tree]
  I -->|Yes| K[Create respawn job]
  K --> L[Delete tree record]
  J --> M[Realtime update]
  L --> M
  M --> N[Client updates inventory and world]
```

Key rule:

- the server decides whether the tree hit succeeds
- the client only triggers the request and renders the result

## Building Placement And Upgrades

```mermaid
flowchart TD
  A[Player chooses building] --> B[App.tsx]
  B --> C[Check resources, zone, and placement rules]
  C --> D[Create or update building record]
  D --> E[World scan / collision checks]
  E --> F[Realtime sync]
  F --> G[UI shows new building state]
```

Important points:

- placement is zone-scoped
- collision and cleanup logic run after persistence
- construction and destruction can be timer-driven

## World Loading

```mermaid
flowchart TD
  A[Open game] --> B[App.tsx startup]
  B --> C[Load map_state]
  B --> D[Load buildings]
  B --> E[Load map_resources]
  D --> F[Zone status tracking]
  E --> F
  F --> G[Render visible sectors]
```

The app intentionally loads the world in phases:

- critical world state first
- gameplay state second
- social state after that

## Chat

```mermaid
flowchart TD
  A[Player sends message] --> B[App.tsx chat handler]
  B --> C[Write chat_messages]
  C --> D[Realtime snapshot]
  D --> E[Chat state update]
  E --> F[Render tab-specific UI]
```

Related behaviors:

- normal chat
- shout
- system messages
- clan / police / private message paths

## Leaderboard

```mermaid
flowchart TD
  A[Open top players] --> B[App.tsx]
  B --> C[Query leaderboard_profiles]
  C --> D[Order by active stat]
  D --> E[Limit top entries]
  E --> F[Realtime subscription]
  F --> G[Leaderboard state]
  G --> H[Switch tabs without losing all players]
```

Key rule:

- the public top list comes from `leaderboard_profiles`, not from `users`

## Presence

```mermaid
flowchart TD
  A[Player moves or changes tab] --> B[App.tsx presence update]
  B --> C[Write presence/{uid}]
  C --> D[Realtime read for others]
  D --> E[Online player list]
```

Presence should stay lightweight:

- it supports visibility and recent activity
- it is not the save file

## Elections

```mermaid
flowchart TD
  A[Player votes or registers] --> B[App.tsx election flow]
  B --> C[Write elections/royal or elections/police]
  C --> D[Realtime update]
  D --> E[Result UI]
```

The election records are small coordination records, not bulk data stores.

## Notes

- Most flows are optimistic on the client but authoritative on the server or database.
- Realtime listeners must be cleaned up when tabs, zones, or modals change.
- Query shape matters as much as the handler code.

