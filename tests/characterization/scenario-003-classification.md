# Scenario 3 Preliminary Classification

## Scenario

`Destroyed building terminal state survives a later stale snapshot.`

This note is classification-only. It does not design a seam, fixture, replay,
test, or owner-acceptance step.

## Evidence Status

| Area | Current source confirmation | Controlled observation | Deterministic replay | Note |
| --- | --- | --- | --- | --- |
| Destruction completion and terminal-state fields | Yes | No | No | `App.tsx:processOfflineTimers(...)` completes destruction when the terminal timer has elapsed and writes the resulting terminal state back into the client building record. `types.ts` shows the fields that carry the terminal-state decision. |
| Stale snapshot suppression | Yes for the branch structure, no for the full race outcome | No | No | `resolvePlacedBuildingSnapshotMerge(...)` and `App.tsx:updatePlacedBuildingsFromServer(...)` contain the stale-snapshot guards, but source guards alone do not prove the reconnect ordering outcome. |
| Server revival precedence | Yes for the branch structure, no for the full contract | No | No | `shouldPreferServerRevivedBuildingState(...)` can let a later server state win when the local record is clearly revivable, but that does not prove the stale reconnect path can never win incorrectly. |
| Reconnect behavior | Yes for the plumbing, no for the terminal-state result | No | No | `src/pocketbase.ts:onSnapshot()` shows fetch-first reconnect plumbing, but there is no controlled observation proving the stale snapshot outcome for destroyed buildings. |
| Exactly-once destruction completion | Yes in source logic, no for the end-to-end race | No | No | The source path prevents repeated completion in the local completion branch, but the reconnect race is still not exercised end-to-end. |

## Known-Bug Review

- Search of the current source and baseline evidence did **not** find a
  documented confirmed bug stating that destroyed buildings are currently
  resurrecting after reconnect.
- The baseline risk register still treats stale-snapshot overwrite and
  destruction-race behavior as risk categories, which is not the same as a
  confirmed active bug.
- The reviewed evidence therefore does **not** prove
  `KNOWN_BUG_DO_NOT_FREEZE`.

## Timer / Completion Findings

- `processOfflineTimers(...)` handles destruction completion and terminal-state
  writeback when the completion window has elapsed.
- `resolvePlacedBuildingSnapshotMerge(...)` includes destruction-related
  decisions, but those branches are only source evidence, not replay proof.
- The reviewed source proves the existence of the terminal-state decision, not
  the exact stale reconnect result after a real-world race.

## Stale-Snapshot Findings

- The stale-snapshot guards are present in the production merge path and the
  reconnect plumbing is fetch-first, then subscribe.
- Those guards do not show whether a later reconnect snapshot can still
  interfere with a locally completed destruction terminal state in every edge.
- No controlled observation or deterministic replay exists yet for this
  target.

## Server-Revival Findings

- `shouldPreferServerRevivedBuildingState(...)` gives the server a way to win
  in some revive scenarios.
- That branch is helpful, but it is not the same as a proof that stale
  reconnect snapshots can never disturb a destroyed building terminal state.
- The current evidence still leaves a race envelope around the reconnect and
  revival path.

## Classification Comparison

| Classification | Verdict | Why |
| --- | --- | --- |
| `CURRENT_ACCEPTED_BEHAVIOR` | Not selected | There is no controlled observation or replay evidence proving the broad contract. |
| `KNOWN_BUG_DO_NOT_FREEZE` | Not selected | No explicit current bug record was found for this exact behavior. |
| `UNCONFIRMED_RUNTIME_BEHAVIOR` | Selected | Source branches exist, but the reconnect outcome is not runtime-proven. |
| `LEGACY_COMPATIBILITY_BEHAVIOR` | Not selected | Nothing in the reviewed source or baseline evidence frames this as a legacy compatibility exception. |
| `TARGET_INVARIANT_REQUIRES_OWNER_DECISION` | Not selected | The target may later need narrowing, but no owner decision has been requested or recorded yet. |

## Proposed Classification

`UNCONFIRMED_RUNTIME_BEHAVIOR`

This is the conservative classification because the code clearly contains
destruction-completion, stale-snapshot, and revive-precedence branches, yet
there is still no controlled proof that a destroyed building terminal state
survives a later stale snapshot across the reconnect race.

## Target Narrowing

Yes, narrowing is likely required before fixture design.

The current wording combines several behaviors into one broad contract:

1. local destruction completion survives stale snapshot timing;
2. persisted terminal state survives reconnect;
3. server revival loses when the destroyed terminal state should remain final;
4. deletion/tombstone-style suppression is not the same as destroyed-state
   persistence.

That makes the current target too broad to promote yet, and it is not a clean
fixture target until the exact subcase is isolated.

## Why T040 Remains Blocked

T040 needs a seam decision, but the current evidence is not enough to choose
that seam safely.

Blocked reasons:

1. Source branches alone do not prove the reconnect race outcome.
2. The target combines multiple contracts, so the seam decision still needs a
   narrower behavioral boundary.
3. There is no controlled observation or deterministic replay yet.
4. We do not yet know whether the correct next step is a pure boundary, a
   minimal owner-approved seam, or a later narrowing of the scenario wording.

`Scenario 3` therefore stays `UNCONFIRMED_RUNTIME_BEHAVIOR`, and `T040`
remains blocked until seam design can exercise the actual destruction /
reconnect boundary safely.
