# Early Housing Economy Design

**Date:** 2026-08-22
**Status:** Approved for implementation
**Risk:** HIGH, because this changes economy and balance values

## Purpose

Early housing must feel reachable. A player who sees income around 120 coins per
day should not need roughly 41 days to buy or recover the value of a first
normal house. Cheap compact housing must be much cheaper than a house, matching
real-world intuition: an apartment or starter dwelling is the entry step; a
house is a larger upgrade.

## Source Anchors

- `data/buildings.ts`: canonical building catalog and balance values.
- `App.tsx`: imports `data/buildings.ts` as the active `buildingData` source.
- `specs/_baseline/06-building-system.md`: building placement and construction
  source model.
- `specs/_baseline/07-production-system.md`: production reward fields.
- `.specify/memory/constitution.md`: balance changes require explicit owner
  approval.

## Confirmed Current State

- The active source does not contain a building named `Квартира`, `Apartment`,
  or `Flat` in `data/buildings.ts`.
- The active residential ladder contains `Лягушачья нора` and `Деревянный дом`
  as early living-space entries.
- The active source has `Деревянный дом` at `price: 2000`.
- The user-reported pair "econom apartment costs 5000 and econom house costs
  5000" is not confirmed in current source and must not be patched blindly.

## Balance Rules

- Starter compact housing must be clearly cheaper than the first normal house.
- The first normal house must cost no more than 3 days of a 120 coins/day early
  income benchmark.
- The first normal house target price is 300 coins.
- Upgrade costs in the early wooden-house chain should rise smoothly from the
  first house instead of jumping from hundreds to thousands immediately.
- Building ids, categories, asset paths, save formats, PocketBase fields, and
  runtime production logic stay unchanged.

## Target Values

| Building id | Name | Current role | Target |
| --- | --- | --- | --- |
| `1` | `Лягушачья нора` | starter compact housing | remains far cheaper than house |
| `5` | `Деревянный дом` | first normal house | `price: 300`, `upgradeCost: 450` |
| `6` | `Деревянный дом 2` | wooden-house upgrade | `price: 450`, `upgradeCost: 650` |
| `51` | `Деревянный дом 3` | wooden-house upgrade | `price: 650`, `upgradeCost: 900` |
| `52` | `Деревянный дом 4` | wooden-house upgrade | `price: 900`, `upgradeCost: 1250` |
| `217` | `Деревянный дом 5` | wooden-house upgrade | `price: 1250`, `upgradeCost: 1700` |
| `218` | `Деревянный дом 6` | wooden-house upgrade | `price: 1700`, `upgradeCost: 2500` |
| `7` | `Кирпичный дом` | next material tier | `price: 2500`, `upgradeCost: 5000` |

## Acceptance Criteria

- A local economy test fails before the data patch and passes after it.
- The test proves the first normal house costs at most 3 days of 120 coins/day.
- The test proves starter compact housing remains at least 3x cheaper than the
  first normal house.
- The test proves the early residential price ladder is strictly increasing.
- No schema, save format, PocketBase adapter, building ids, or image paths are
  changed.
