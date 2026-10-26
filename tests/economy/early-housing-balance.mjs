import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const buildingsPath = path.join(repoRoot, 'data', 'buildings.ts');
const source = fs.readFileSync(buildingsPath, 'utf8');

function extractTopLevelObjects(text) {
  const blocks = [];
  let start = -1;
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        blocks.push(text.slice(start, index + 1));
        start = -1;
      }
    }
  }

  return blocks;
}

function readNumber(block, pattern, fieldName) {
  const match = block.match(pattern);
  assert(match, `Missing ${fieldName} in block:\n${block.slice(0, 240)}`);
  return Number(match[1]);
}

function readString(block, pattern, fieldName) {
  const match = block.match(pattern);
  assert(match, `Missing ${fieldName} in block:\n${block.slice(0, 240)}`);
  return match[1];
}

const buildings = extractTopLevelObjects(source)
  .filter((block) => /category:\s*['"]Жилые['"]/.test(block))
  .map((block) => ({
    id: readNumber(block, /id:\s*(\d+)/, 'id'),
    name: readString(block, /name:\s*['"]([^'"]+)['"]/, 'name'),
    price: readNumber(block, /price:\s*(\d+)/, 'price'),
    upgradeCost: block.match(/upgradeCost"?\s*:\s*(\d+)/)?.[1]
      ? Number(block.match(/upgradeCost"?\s*:\s*(\d+)/)[1])
      : null,
  }));

function byId(id) {
  const building = buildings.find((candidate) => candidate.id === id);
  assert(building, `Missing residential building ${id}`);
  return building;
}

const earlyDailyIncome = 120;
const maxFirstHousePaybackDays = 3;
const starter = byId(1);
const firstHouse = byId(5);

assert.equal(firstHouse.name, 'Деревянный дом');
assert(
  firstHouse.price <= earlyDailyIncome * maxFirstHousePaybackDays,
  `First normal house should cost at most ${earlyDailyIncome * maxFirstHousePaybackDays} coins, got ${firstHouse.price}.`,
);
assert(
  starter.price * 3 <= firstHouse.price,
  `Starter compact housing should be at least 3x cheaper than the first house: starter ${starter.price}, house ${firstHouse.price}.`,
);

const woodenLadderIds = [5, 6, 51, 52, 217, 218, 7];
const woodenPrices = woodenLadderIds.map((id) => byId(id).price);
for (let index = 1; index < woodenPrices.length; index += 1) {
  assert(
    woodenPrices[index] > woodenPrices[index - 1],
    `Early residential prices must increase strictly: ${woodenPrices.join(' -> ')}.`,
  );
}

const expectedUpgradeCosts = new Map([
  [5, 450],
  [6, 650],
  [51, 900],
  [52, 1250],
  [217, 1700],
  [218, 2500],
  [7, 5000],
]);

for (const [id, expected] of expectedUpgradeCosts) {
  assert.equal(byId(id).upgradeCost, expected, `Unexpected upgradeCost for building ${id}.`);
}

console.log('PASS early housing economy balance');
