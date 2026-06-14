const fs = require('fs');

// Check buildings.ts for issues
let bContent = fs.readFileSync('data/buildings.ts', 'utf8');

// Fix the JSON-style "type": "BuildingType.Default" -> type: BuildingType.Default
const beforeFix = (bContent.match(/"type": BuildingType/g) || []).length;
console.log('Before fix "type": BuildingType count:', beforeFix);

// The buildings appended from parse have JSON style - fix them
bContent = bContent.replace(/"type": BuildingType\.Default/g, 'type: BuildingType.Default');
bContent = bContent.replace(/"buildable": false/g, 'buildable: false');
bContent = bContent.replace(/"buildable": true/g, 'buildable: true');
bContent = bContent.replace(/"id": /g, 'id: ');
bContent = bContent.replace(/"name": /g, 'name: ');
bContent = bContent.replace(/"englishName": /g, 'englishName: ');
bContent = bContent.replace(/"category": /g, 'category: ');
bContent = bContent.replace(/"price": /g, 'price: ');
bContent = bContent.replace(/"constructionRequirements": /g, 'constructionRequirements: ');
bContent = bContent.replace(/"population": /g, 'population: ');
bContent = bContent.replace(/"resources": /g, 'resources: ');
bContent = bContent.replace(/"amount": /g, 'amount: ');
bContent = bContent.replace(/"stats": /g, 'stats: ');
bContent = bContent.replace(/"constructionTimeSeconds": /g, 'constructionTimeSeconds: ');
bContent = bContent.replace(/"accelerationCost": /g, 'accelerationCost: ');
bContent = bContent.replace(/"durability": /g, 'durability: ');
bContent = bContent.replace(/"gloryOnExplosion": /g, 'gloryOnExplosion: ');
bContent = bContent.replace(/"takesPopulation": /g, 'takesPopulation: ');
bContent = bContent.replace(/"workTimeSeconds": /g, 'workTimeSeconds: ');
bContent = bContent.replace(/"workYieldGold": /g, 'workYieldGold: ');
bContent = bContent.replace(/"givesCoins": /g, 'givesCoins: ');
bContent = bContent.replace(/"produces": /g, 'produces: ');
bContent = bContent.replace(/"sometimesProduces": /g, 'sometimesProduces: ');
bContent = bContent.replace(/"chance": /g, 'chance: ');
bContent = bContent.replace(/"consumes": /g, 'consumes: ');
bContent = bContent.replace(/"drops": /g, 'drops: ');
bContent = bContent.replace(/"frequent": /g, 'frequent: ');
bContent = bContent.replace(/"rare": /g, 'rare: ');
bContent = bContent.replace(/"destructionInfo": /g, 'destructionInfo: ');
bContent = bContent.replace(/"resourceId": /g, 'resourceId: ');
bContent = bContent.replace(/"weaponName": /g, 'weaponName: ');
bContent = bContent.replace(/"goldCost": /g, 'goldCost: ');
bContent = bContent.replace(/"energyCost": /g, 'energyCost: ');
bContent = bContent.replace(/"timeSeconds": /g, 'timeSeconds: ');
bContent = bContent.replace(/"damage": /g, 'damage: ');
bContent = bContent.replace(/"description": /g, 'description: ');
bContent = bContent.replace(/"imageUrl": /g, 'imageUrl: ');
bContent = bContent.replace(/"upgradesTo": /g, 'upgradesTo: ');

const afterFix = (bContent.match(/"type": BuildingType/g) || []).length;
console.log('After fix "type": BuildingType count:', afterFix);

// Check that category uses correct string
bContent = bContent.replace(/category: "Заводы"/g, "category: 'Заводы'");
bContent = bContent.replace(/description: "([^"]+)"/g, (match, p1) => `description: '${p1}'`);
bContent = bContent.replace(/imageUrl: "([^"]+)"/g, (match, p1) => `imageUrl: '${p1}'`);
bContent = bContent.replace(/englishName: "([^"]+)"/g, (match, p1) => `englishName: '${p1}'`);
bContent = bContent.replace(/weaponName: "([^"]+)"/g, (match, p1) => `weaponName: '${p1}'`);
bContent = bContent.replace(/name: "([^"]+)"/g, (match, p1) => `name: '${p1}'`);

fs.writeFileSync('data/buildings.ts', bContent, 'utf8');
console.log('buildings.ts properties un-JSON-ified.');

// Check for upgradesTo 392 on Лесопилка 2 (id 56)
const idx = bContent.indexOf("id: 56,");
const snip = bContent.slice(idx, idx + 300);
console.log('\nSawmill 2 snippet:', snip.slice(0, 300));
