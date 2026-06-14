// Replace old nuclear bomb buildings (116-134) with new ones (617-635)
// and update ID 600 stats
const fs = require('fs');

let content = fs.readFileSync('data/buildings.ts', 'utf8');
const newBuildings = fs.readFileSync('scratch/out_nuclear.ts', 'utf8');

// Find the block to replace: from "  {\n    id: 116," to the end of "id: 134" building (before "  {\n    id: 240,")
// Handle both \n and \r\n line endings
const nl = content.includes('\r\n') ? '\r\n' : '\n';
const startMarker = `  {${nl}    id: 116,`;
const endMarker = `  },${nl}  {${nl}    id: 240,`;

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1) {
  console.error('Could not find start marker (id: 116)');
  process.exit(1);
}
if (endIdx === -1) {
  console.error('Could not find end marker (id: 240)');
  process.exit(1);
}

// Replace from startIdx to endIdx (keep the "  },\n  {\n    id: 240," part)
const before = content.substring(0, startIdx);
const after = content.substring(endIdx + 4); // skip "  },"

// Convert newBuildings to same line endings
const newBuildingsFixed = nl === '\r\n' ? newBuildings.replace(/(?<!\r)\n/g, '\r\n') : newBuildings;
const newContent = before + newBuildingsFixed + `,${nl}` + after;

// Now update ID 600 building stats
// Fix workTimeSeconds from 60 to 800
let finalContent = newContent;

// Replace the entire ID 600 building block with correct data
const old600Start = finalContent.indexOf(`    id: 600,${nl}    name: 'Атомная бомба',`);
if (old600Start === -1) {
  console.error('Could not find id 600 building');
  process.exit(1);
}

// Find the start of the building object (2 chars back for "  {")
const blockStart = finalContent.lastIndexOf('  {', old600Start);
// Find the end "  }," after this building
const old600End = finalContent.indexOf(`${nl}  },${nl}`, old600Start);
if (old600End === -1) {
  console.error('Could not find end of id 600 building');
  process.exit(1);
}
const blockEnd = old600End + `${nl}  },`.length;

let new600 = `  {
    id: 600,
    name: 'Атомная бомба',
    englishName: 'Nuclear Bomb',
    category: 'Грядки',
    type: BuildingType.Default,
    price: 600000,
    buildable: true,
    constructionRequirements: {
      population: 24,
    },
    stats: {
      constructionTimeSeconds: 480, // 8 minutes
      accelerationCost: 5,
      durability: 7376,
      gloryOnExplosion: 30000,
      takesPopulation: 15,
      workTimeSeconds: 800, // 13 minutes 20 seconds
      workYieldGold: 20,
      consumes: [
        { id: 10009, name: 'Канистра с бензином', amount: 10 },
        { id: 10004, name: 'Куски супер тыквы', amount: 1 }
      ],
      givesCoins: 10631
    },
    drops: {
      frequent: [
        { id: 10026, name: 'Золото', amount: 3 },
        { id: 10023, name: 'Сталь', amount: 6 }
      ],
      rare: [
        { id: 10044, name: 'Самородок', amount: 74 }
      ]
    },
    destructionInfo: [
      { resourceId: 10013, weaponName: 'Петарда', amount: 1230, goldCost: 6150, energyCost: 1230, timeSeconds: 30750, damage: 6 },
      { resourceId: 10010, weaponName: 'Садовая бомба', amount: 93, goldCost: 46500, energyCost: 372, timeSeconds: 167400, damage: 73 },
      { resourceId: 10012, weaponName: 'MGM-52 «Ланс»', amount: 19, goldCost: 95000, energyCost: 304, timeSeconds: 49400, damage: 328 },
      { resourceId: 10011, weaponName: 'Садовая супер бомба', amount: 13, goldCost: 195000, energyCost: 260, timeSeconds: 23400, damage: 328 },
      { resourceId: 10016, weaponName: 'Атомная бомба «Снежинка»', amount: 4, goldCost: 40000, energyCost: 192, timeSeconds: 14400, damage: 656 },
      { resourceId: 10043, weaponName: 'Суператомная бомба', amount: 3, goldCost: 120000, energyCost: 180, timeSeconds: 10800, damage: 656 }
    ],
    description: 'Грядка для выращивания атомных бомб.',
    imageUrl: 'https://i.ibb.co/qY5F4VW0/116.png',
  },`;

if (nl === '\r\n') new600 = new600.replace(/(?<!\r)\n/g, '\r\n');
finalContent = finalContent.substring(0, blockStart) + new600 + finalContent.substring(blockEnd);

fs.writeFileSync('data/buildings.ts', finalContent, 'utf8');

// Verify no undefined entries
const lines = finalContent.split('\n');
let strayCommas = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === ',') {
    strayCommas++;
    console.log(`Warning: stray comma at line ${i+1}`);
  }
}
console.log(`Stray commas found: ${strayCommas}`);

// Verify IDs exist
for (let id = 617; id <= 635; id++) {
  if (!finalContent.includes(`id: ${id},`)) {
    console.error(`Missing building ID ${id}!`);
  }
}
if (!finalContent.includes('id: 600,')) {
  console.error('Missing building ID 600!');
}

console.log('Done! buildings.ts updated.');
console.log(`File size: ${finalContent.length} chars, ${lines.length} lines`);
