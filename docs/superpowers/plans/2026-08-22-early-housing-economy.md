# Early Housing Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebalance the confirmed early residential ladder so compact starter housing is much cheaper than the first normal house and the first house is reachable within 1-3 days at 120 coins/day.

**Architecture:** This is a canonical data-only balance change guarded by a small text-parsing characterization test. It does not add runtime systems or change persistence, ids, production logic, or UI.

**Tech Stack:** React/Vite/TypeScript project, canonical `data/buildings.ts`, Node.js test script using built-in `fs` and `assert`.

**Spec:** `docs/superpowers/specs/2026-08-22-early-housing-economy-design.md`

## Global Constraints

- Preserve building ids, categories, image paths, and save formats.
- Do not alter PocketBase collections, fields, or adapter behavior.
- Keep the change limited to the confirmed early residential ladder.
- Treat the user-reported "econom apartment" as `UNCONFIRMED` until a current source anchor exists.
- Verify with the local economy test, TypeScript lint, regression script, repository health script, and `git diff --check`.

---

### Task 1: Economy Characterization Test

**Files:**
- Create: `tests/economy/early-housing-balance.mjs`

**Interfaces:**
- Consumes: `data/buildings.ts` text.
- Produces: a Node.js check that fails when the first normal house exceeds 3 days of 120 coins/day or when starter housing is not much cheaper than the house.

- [ ] **Step 1: Write the failing test**

```javascript
const assert = require('assert');
```

Use `fs.readFileSync` to parse building blocks from `data/buildings.ts`, then assert:

```javascript
assert(firstHouse.price <= 120 * 3);
assert(starter.price * 3 <= firstHouse.price);
assert.deepEqual(woodenPrices, [...woodenPrices].sort((a, b) => a - b));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/economy/early-housing-balance.mjs`
Expected: FAIL because `Деревянный дом` currently costs `2000`.

### Task 2: Canonical Balance Patch

**Files:**
- Modify: `data/buildings.ts`

**Interfaces:**
- Consumes: target values from the spec.
- Produces: updated early residential prices and upgrade costs only.

- [ ] **Step 1: Patch `Деревянный дом` and wooden-house upgrades**

Change target ids:

```text
5: price 300, upgradeCost 450
6: price 450, upgradeCost 650
51: price 650, upgradeCost 900
52: price 900, upgradeCost 1250
217: price 1250, upgradeCost 1700
218: price 1700, upgradeCost 2500
7: price 2500, upgradeCost 5000
```

- [ ] **Step 2: Run the economy test**

Run: `node tests/economy/early-housing-balance.mjs`
Expected: PASS.

### Task 3: Verification

**Files:**
- No new files.

**Interfaces:**
- Consumes: changed docs, test, and data file.
- Produces: completion evidence.

- [ ] **Step 1: Run project checks**

Run:

```bash
npm run lint
node check_regressions_worker6.mjs
powershell -Command "& .\\verify_repository_health.ps1"
git diff --check
```

- [ ] **Step 2: Review diff**

Confirm only the approved spec, plan, economy test, and early residential data changed.
