# Database Schema

This document is the current map of the game data model.

It focuses on what each collection is for, which fields are intentionally kept queryable at the top level, and what should not be treated as the source of truth.

## Reading Rules

- Top-level fields are the ones the app expects to query, sort, or filter on.
- `data` is the overflow area for extra game state.
- Some fields exist in both client code and PocketBase hooks because they are preserved across partial updates.
- `users` is an auth collection and has special rules.

## users

Source of truth for the authenticated player account and most personal game state.

| Field | Purpose | Notes |
|---|---|---|
| `id` | Auth primary key | Must stay equal to the auth record id. |
| `name` | Player display name | Used in profile, chat, and social views. |
| `gameId` | Legacy / logical id mapping | Kept for compatibility. |
| `gold` | Currency | Used by economy, construction, and rewards. |
| `rubies` | Premium currency | Used by premium purchases. |
| `level` | Player level | Used by progression and leaderboard fallback. |
| `glory` | Main score | Used by leaderboard and rewards. |
| `energy` | Action budget | Required for tree hits and some interactions. |
| `reputation` | Social / police-related score | Read in profile and social systems. |
| `inventory` | Item storage | Must be merged, not overwritten. |
| `clanId` | Clan membership | Used by clan UI and permissions. |
| `lastSaveTime` | Sync marker | Helps with save ordering. |
| `friends` | Social graph | Used by friends UI. |
| `gender` | Profile attribute | UI-facing only. |
| `tutorialCompleted` | Tutorial flag | UI gating. |
| `tutorialCompletedAt` | Tutorial timestamp | Audit field. |
| `townHallTutorialCompleted` | Town hall tutorial flag | UI gating. |
| `townHallTutorialCompletedAt` | Town hall tutorial timestamp | Audit field. |

Stored in `data` for `users`:

- `banEndTime`
- `activeCurse`
- `lastX`
- `lastY`
- `timestamp`
- `rank`
- `clanPermissions`
- `avatar`
- `extraBuildingPermits`
- `treesChopped`
- `monstersDestroyed`
- `buildingsDestroyed`
- `theftsCommitted`

Use:

- authorization
- profile
- economy
- social graph
- stats
- inventory

Avoid:

- using it as the public leaderboard source
- assuming every user field is available for full-table scans

## leaderboard_profiles

Dedicated public leaderboard source.

| Field | Purpose | Notes |
|---|---|---|
| `userId` | Links back to the owning user | Public leaderboard identity. |
| `name` | Display name | Rendered in the top players UI. |
| `level` | Player level | Used for display. |
| `glory` | Rank score | Used for sorting in the glory tab. |
| `avatar` | Avatar data | Rendered in the leaderboard. |
| `clanId` | Clan membership | Display context. |
| `treesChopped` | Tree stat | Used in the trees tab. |
| `monstersDestroyed` | Monster stat | Used in the monsters tab. |
| `buildingsDestroyed` | Building stat | Used in the buildings tab. |
| `theftsCommitted` | Theft stat | Used in the theft tab. |

Use:

- public top players views
- tab switching by stat

Avoid:

- reading from `users` for the public leaderboard
- assuming it contains every private profile field

## map_resources

Source of truth for world resources.

| Field | Purpose | Notes |
|---|---|---|
| `type` | Resource type | `tree`, `oil`, `quarry`, and other world resource types. |
| `x` | World X coordinate | Used for lookups and display. |
| `y` | World Y coordinate | Used for lookups and display. |
| `zoneId` | Zone key | Used for zone-scoped loading and respawn. |
| `gameId` | Logical id mapping | Used by wrappers and cleanup logic. |
| `data` | Extra resource metadata | Keeps non-core state. |

Important tree-specific fields are handled by server logic:

- `hp`
- `maxHp`
- `state`
- `respawnAt`
- `createdAt`
- `sectorId`

Use:

- trees
- oil deposits
- quarries
- other world pickups

Avoid:

- patching deleted trees after the server already removed them
- treating the client as authoritative for respawn timing

## buildings

Source of truth for placed and active world buildings.

| Field | Purpose | Notes |
|---|---|---|
| `ownerId` | Owner uid | Can be a player, neutral id, or system id. |
| `zoneId` | Zone key | Used for zone loading and collision checks. |
| `x` | World X coordinate | Placement coordinate. |
| `y` | World Y coordinate | Placement coordinate. |
| `buildingId` | Building template id | Maps to static building data. |
| `hp` | Current health | Used for damage, destruction, and repair. |
| `maxHp` | Max health | Used with `hp`. |
| `isConstructing` | Construction state | Used by timers and UI. |
| `constructionEndTime` | Construction finish time | Timer-driven completion. |
| `isActive` | Active/inactive state | Used by special buildings. |
| `lastMoveTime` | Movement cooldown marker | Used for movable buildings. |
| `lastAttackTime` | Attack cooldown marker | Used for combat buildings. |
| `type` | Building category | Used in filtering and behavior. |
| `workState` | Work state | Used by production buildings. |
| `hostId` | Host / controller id | Used by special ownership flows. |
| `isDestroying` | Destruction state | Used by destroy timers. |
| `destructionEndTime` | Destruction finish time | Timer-driven finalization. |
| `pendingDamage` | Queued damage | Used during delayed destruction. |
| `initiatorId` | Who started the action | Used by attack/destroy flows. |
| `gameId` | Logical id mapping | Used by wrappers and cleanup logic. |
| `data` | Extra building metadata | Keeps non-core state. |

Use:

- construction
- upgrade
- movement
- destruction
- collision resolution
- monsters

Avoid:

- mass rewriting of building ids or ownership without checking dependent queries
- clearing `data` fields during partial updates

## map_state

Small world-level state record.

| Field | Purpose | Notes |
|---|---|---|
| `gameId` | Logical id mapping | Used as a stable reference. |
| `data` | World metadata | Stores generation and reload state. |

Known usage:

- `generated`
- `seed`
- `forceReloadAt`

Use:

- world generation state
- reload coordination

## presence

Online presence and recent activity.

| Field | Purpose | Notes |
|---|---|---|
| `uid` | Player id | Presence key. |
| `lastSeen` | Last activity timestamp | Used for ordering. |
| `isOnline` | Online state | Used by the social UI. |
| `gameId` | Logical id mapping | Used by wrappers. |
| `data` | Extra presence state | Keeps position and status details. |

Use:

- online players
- social visibility
- lightweight activity tracking

Avoid:

- using it as durable save state

## chat_messages

Public and system chat.

| Field | Purpose | Notes |
|---|---|---|
| `sender` | Sender name | Display text. |
| `senderId` | Sender uid | Link to the player. |
| `text` | Message body | Normal chat and system text. |
| `type` | Message type | Normal, shout, system, and related variants. |
| `timestamp` | Message time | Used for ordering. |
| `tab` | Chat tab target | Used by tab filtering. |
| `channel` | Channel name | Social routing. |
| `gameId` | Logical id mapping | Used by wrappers. |
| `data` | Extra message state | Keeps any extra UI payload. |

Use:

- world chat
- shout
- system notices
- clan/police routing

Avoid:

- storing long-lived game state here

## private_messages

One-to-one mail / direct messages.

| Field | Purpose | Notes |
|---|---|---|
| `senderId` | Sender uid | Message origin. |
| `receiverId` | Receiver uid | Message target. |
| `participants` | Conversation members | Helps query the thread. |
| `text` | Message body | Direct message content. |
| `timestamp` | Message time | Used for sorting. |
| `senderName` | Sender display name | UI convenience copy. |
| `gameId` | Logical id mapping | Used by wrappers. |
| `data` | Extra DM metadata | Keeps any extras. |

Use:

- personal mail
- direct message threads

## clans

Clan membership and clan metadata.

| Field | Purpose | Notes |
|---|---|---|
| `name` | Clan name | Public display. |
| `leaderId` | Leader uid | Used for ownership checks. |
| `members` | Clan roster | Member list or member metadata. |
| `description` | Clan description | Public text. |
| `gameId` | Logical id mapping | Used by wrappers. |
| `data` | Extra clan state | Keeps expansion fields. |

Use:

- clan membership
- clan chat
- leadership
- invitations

## market

Player marketplace listings.

| Field | Purpose | Notes |
|---|---|---|
| `sellerId` | Seller uid | Listing owner. |
| `sellerName` | Seller display name | UI convenience copy. |
| `itemId` | Listed item id | Numerical resource or item id. |
| `itemName` | Item display name | UI text. |
| `quantity` | Quantity listed | Amount for sale. |
| `price` | Listing price | Currency cost. |
| `timestamp` | Listing time | Used for ordering and cleanup. |
| `gameId` | Logical id mapping | Used by wrappers. |
| `data` | Extra market metadata | Keeps extra state. |

Use:

- buy listings
- sell listings
- market cleanup

## elections

Government and role elections.

| Field | Purpose | Notes |
|---|---|---|
| `candidates` | Candidate list | Current participants. |
| `sheriffId` | Sheriff uid | Police election result. |
| `sheriffName` | Sheriff display name | UI copy. |
| `deputies` | Deputy list | Auxiliary office holders. |
| `electionEndTime` | Election deadline | Timer-driven close. |
| `firstElectionCompleted` | First election flag | Controls election mode. |
| `kingId` | King uid | Royal election result. |
| `kingName` | King display name | UI copy. |
| `queenId` | Queen uid | Royal election result. |
| `queenName` | Queen display name | UI copy. |
| `votesTotal` | Vote count | Used by UI and results. |
| `gameId` | Logical id mapping | Used by wrappers. |
| `data` | Extra election state | Keeps future fields. |

Use:

- king election
- queen election
- police election

## Practical Notes

- `leaderboard_profiles` is public-facing ranking data.
- `users` is private auth-centered state.
- `map_resources` and `buildings` are the main world entities.
- `map_state` is small but important for generation and reload control.
- If a field needs sorting or filtering, it should stay queryable at the top level.

