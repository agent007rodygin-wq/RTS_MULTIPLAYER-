# GAME CHECKLIST

This file defines what "the game works" means before and after refactors.

Use it in three modes:

- `Quick Smoke` after a small fix
- `Subsystem Smoke` after a medium change
- `Full Regression` before release or after a big refactor

## Verification Header

| Field | Value |
|---|---|
| Build | local-dev |
| Git commit | UNKNOWN |
| Date | 2026-07-11 |
| Tester | Codex |
| Environment | local docs review |
| PocketBase URL | http://89.127.214.182:8090 |

## Status Legend

- `PASS`
- `FAIL`
- `NOT TESTED`
- `BLOCKED`

## Pass Criteria

The game is considered working if the relevant checklist items pass without:

- fatal UI errors
- broken loading states
- unexpected data loss
- repeated `404` / timeout loops
- duplicate live subscriptions
- stale data being replaced by empty state

## Quick Smoke

Run these after a small fix, especially anything touching trees, inventory, chat, or loading.

| System | Test | Status | Evidence | Notes |
|---|---|---|---|---|
| Authorization | Registration works | NOT TESTED |  |  |
| Authorization | Login works | NOT TESTED |  |  |
| Authorization | Logout works | NOT TESTED |  |  |
| Authorization | Re-login works | NOT TESTED |  |  |
| Authorization | Re-login after page refresh works | NOT TESTED |  |  |
| World | Map loads | NOT TESTED |  |  |
| World | Player can move | NOT TESTED |  |  |
| World | Sector changes correctly | NOT TESTED |  |  |
| World | Resources appear | NOT TESTED |  |  |
| World | Buildings appear | NOT TESTED |  |  |
| Trees | Tree can be hit | NOT TESTED |  |  |
| Trees | One hit costs exactly `2` energy | NOT TESTED |  |  |
| Trees | One hit gives `1` wood | NOT TESTED |  |  |
| Trees | One hit gives gold | NOT TESTED |  |  |
| Trees | One hit gives `2` glory | NOT TESTED |  |  |
| Trees | Third hit removes the tree | NOT TESTED |  |  |
| Trees | Tree respawns after about `3-4` minutes | NOT TESTED |  |  |
| Trees | No `PATCH` / `DELETE` `404` spam during tree actions | NOT TESTED |  |  |
| Inventory | Wood is added to inventory | NOT TESTED |  |  |
| Inventory | Old inventory items do not disappear | NOT TESTED |  |  |
| Inventory | Market actions do not wipe inventory | NOT TESTED |  |  |
| Inventory | Inventory survives re-login | NOT TESTED |  |  |
| Inventory | Snapshot updates do not roll back inventory | NOT TESTED |  |  |
| Chat | Normal message sends and appears | NOT TESTED |  |  |
| Chat | Shout message sends and appears | NOT TESTED |  |  |
| Chat | General tab works | NOT TESTED |  |  |
| Chat | Clan tab works | NOT TESTED |  |  |
| Chat | Police tab works | NOT TESTED |  |  |
| Chat | Private messages work | NOT TESTED |  |  |
| Chat | System messages appear | NOT TESTED |  |  |
| Chat | Cleanup runs without errors | NOT TESTED |  |  |
| Leaderboard | Glory leaderboard works | NOT TESTED |  |  |
| Leaderboard | Trees leaderboard works | NOT TESTED |  |  |
| Leaderboard | Monsters leaderboard works | NOT TESTED |  |  |
| Leaderboard | Buildings leaderboard works | NOT TESTED |  |  |
| Leaderboard | Theft leaderboard works | NOT TESTED |  |  |
| Leaderboard | Switching tabs works | NOT TESTED |  |  |
| Leaderboard | Leaderboard is not limited to the current player only | NOT TESTED |  |  |

## Subsystem Smoke

Run these after a medium-sized change in one subsystem.

| System | Test | Status | Evidence | Notes |
|---|---|---|---|---|
| Resources | Tree works end to end | NOT TESTED |  |  |
| Resources | Oil works | NOT TESTED |  |  |
| Resources | Quarry works | NOT TESTED |  |  |
| Resources | Chest works | NOT TESTED |  |  |
| Monsters | Monsters spawn | NOT TESTED |  |  |
| Monsters | Monsters move | NOT TESTED |  |  |
| Monsters | Monsters attack | NOT TESTED |  |  |
| Monsters | Monsters take damage | NOT TESTED |  |  |
| Monsters | Monsters die | NOT TESTED |  |  |
| Monsters | Monsters respawn | NOT TESTED |  |  |
| Market | Item can be listed | NOT TESTED |  |  |
| Market | Item can be bought | NOT TESTED |  |  |
| Market | Item can be removed from sale | NOT TESTED |  |  |
| Market | Money is credited correctly | NOT TESTED |  |  |
| Market | Item arrives in inventory | NOT TESTED |  |  |
| Clans | Clan can be created | NOT TESTED |  |  |
| Clans | Player can join a clan | NOT TESTED |  |  |
| Clans | Player can leave a clan | NOT TESTED |  |  |
| Clans | Clan chat works | NOT TESTED |  |  |
| King elections | Player can register | NOT TESTED |  |  |
| King elections | Player can vote | NOT TESTED |  |  |
| King elections | Winner is determined | NOT TESTED |  |  |
| King elections | Crown is awarded | NOT TESTED |  |  |
| Queen elections | Player can register | NOT TESTED |  |  |
| Queen elections | Player can vote | NOT TESTED |  |  |
| Queen elections | Winner is determined | NOT TESTED |  |  |
| Queen elections | Reward is awarded | NOT TESTED |  |  |
| Police elections | Player can register | NOT TESTED |  |  |
| Police elections | Player can vote | NOT TESTED |  |  |
| Police elections | Winner is determined | NOT TESTED |  |  |
| Police elections | Badge is awarded | NOT TESTED |  |  |
| Police of morals | Ban works | NOT TESTED |  |  |
| Police of morals | Punishment works | NOT TESTED |  |  |
| Police of morals | Curse works | NOT TESTED |  |  |
| Construction | Building can be placed | NOT TESTED |  |  |
| Construction | Building can be upgraded | NOT TESTED |  |  |
| Construction | Building can be moved | NOT TESTED |  |  |
| Construction | Building can be demolished | NOT TESTED |  |  |
| Construction | Timer behaves correctly | NOT TESTED |  |  |

## PocketBase

Run this after any change to `src/pocketbase.ts` or to PocketBase schema/indexes.

| System | Test | Status | Evidence | Notes |
|---|---|---|---|---|
| PocketBase | `users` queries still behave | NOT TESTED |  | Check auth, profile lookup, and no accidental full scan |
| PocketBase | `leaderboard_profiles` queries still behave | NOT TESTED |  | Verify tabs and sorting |
| PocketBase | `map_resources` queries still behave | NOT TESTED |  | Verify trees, oil, quarry, chest |
| PocketBase | `buildings` queries still behave | NOT TESTED |  | Verify world load, zone load, construction, ownership |
| PocketBase | `presence` queries still behave | NOT TESTED |  | Verify online state and player list |
| PocketBase | `chat_messages` queries still behave | NOT TESTED |  | Verify tabs, shout, cleanup, system messages |
| PocketBase | `market` queries still behave | NOT TESTED |  | Verify listings and inventory preservation |

## Full Regression

Run this before a release or after a large refactor.

| System | Test | Status | Evidence | Notes |
|---|---|---|---|---|
| Authorization | Registration | NOT TESTED |  |  |
| Authorization | Login | NOT TESTED |  |  |
| Authorization | Logout | NOT TESTED |  |  |
| Authorization | Re-login after refresh | NOT TESTED |  |  |
| World | Map loading | NOT TESTED |  |  |
| World | Sector loading | NOT TESTED |  |  |
| Trees | Cutting | NOT TESTED |  |  |
| Trees | Respawn | NOT TESTED |  |  |
| Inventory | Add items | NOT TESTED |  |  |
| Inventory | Preserve items | NOT TESTED |  |  |
| Monsters | Spawn | NOT TESTED |  |  |
| Monsters | Movement | NOT TESTED |  |  |
| Monsters | Combat | NOT TESTED |  |  |
| Chat | General chat | NOT TESTED |  |  |
| Chat | Shout | NOT TESTED |  |  |
| Chat | Clan chat | NOT TESTED |  |  |
| Chat | Police chat | NOT TESTED |  |  |
| Chat | Private messages | NOT TESTED |  |  |
| Market | Listing | NOT TESTED |  |  |
| Market | Buying | NOT TESTED |  |  |
| Market | Removing listings | NOT TESTED |  |  |
| Clans | Create | NOT TESTED |  |  |
| Clans | Join | NOT TESTED |  |  |
| Clans | Leave | NOT TESTED |  |  |
| Friends | Add friend | NOT TESTED |  |  |
| Friends | Remove friend | NOT TESTED |  |  |
| Leaderboard | Glory | NOT TESTED |  |  |
| Leaderboard | Trees | NOT TESTED |  |  |
| Leaderboard | Monsters | NOT TESTED |  |  |
| Leaderboard | Buildings | NOT TESTED |  |  |
| Leaderboard | Theft | NOT TESTED |  |  |
| Construction | Place | NOT TESTED |  |  |
| Construction | Upgrade | NOT TESTED |  |  |
| Construction | Move | NOT TESTED |  |  |
| Construction | Demolish | NOT TESTED |  |  |
| Building destruction | Normal destruction flow | NOT TESTED |  |  |
| Bombs | Bomb placement and detonation | NOT TESTED |  |  |
| Gifts | Gift mechanics | NOT TESTED |  |  |
| Police | Registration | NOT TESTED |  |  |
| Police | Voting | NOT TESTED |  |  |
| Police of morals | Registration | NOT TESTED |  |  |
| Police of morals | Voting | NOT TESTED |  |  |
| King elections | Registration | NOT TESTED |  |  |
| King elections | Voting | NOT TESTED |  |  |
| Queen elections | Registration | NOT TESTED |  |  |
| Queen elections | Voting | NOT TESTED |  |  |

## When A Test Fails

Record:

- the exact screen or action
- the expected result
- the actual result
- the console or server error
- the related collection or subsystem
- whether it was a timeout, `400`, `404`, stale snapshot, or UI regression
- the commit or build reference
- evidence links, such as screenshot, console log, or PocketBase log

## Suggested Workflow

- Small fix:
  - `Quick Smoke`
- Subsystem refactor:
  - `Quick Smoke`
  - matching `Subsystem Smoke`
- Large refactor / Release:
  - `Quick Smoke`
  - all `Subsystem Smoke`
  - `Full Regression`

## How To Fill Status

- `PASS` means it was really checked and passed.
- `FAIL` means the bug was really reproduced.
- `NOT TESTED` means nobody checked it yet.
- `BLOCKED` means it could not be checked right now, for example because a second account is missing or PocketBase is unavailable.

## Recent Regressions

| Date | System | Bug | Fixed In | Status |
|---|---|---|---|---|
| 2026-07-11 | Trees | Inventory reset to `{"10001":1}` | local-dev | Fixed |
| 2026-07-11 | Leaderboard | Only current player visible | local-dev | Fixed |
| 2026-07-11 | Chat | Messages stored in `data` instead of top-level | local-dev | Fixed |

