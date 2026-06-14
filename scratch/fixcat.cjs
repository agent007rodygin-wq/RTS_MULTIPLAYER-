const fs = require('fs');
let s = fs.readFileSync('data/buildings.ts', 'utf8');

// Check current category of 500 and 56
const idx500 = s.indexOf('\n  {\n    id: 500,');
const idx56 = s.indexOf('\n  {\n    id: 56,');
const next500 = s.indexOf('\n  {\n    id:', idx500 + 1);
const next56 = s.indexOf('\n  {\n    id:', idx56 + 1);

const block500 = s.slice(idx500, next500);
const block56 = s.slice(idx56, next56);

const cat500 = block500.match(/category: '([^']+)'/);
const cat56 = block56.match(/category: '([^']+)'/);
console.log('Category 500:', cat500 ? cat500[1] : '?');
console.log('Category 56:', cat56 ? cat56[1] : '?');

// Fix categories if needed
// Actually we leave them in Бизнес since that's how they were originally
// But the user's info says "Заводы" category for all sawmills
// Let's change 500 and 56 to Заводы to be consistent
if (cat500 && cat500[1] !== 'Заводы') {
    const toReplace = `category: '${cat500[1]}'`;
    // Replace only in block500 context
    const blockStr500 = block500.replace(toReplace, "category: 'Заводы'");
    s = s.slice(0, idx500) + blockStr500 + s.slice(next500);
    console.log('Fixed category for 500 -> Заводы');
}

// Re-index after first replacement
const idx56b = s.indexOf('\n  {\n    id: 56,');
const next56b = s.indexOf('\n  {\n    id:', idx56b + 1);
const block56b = s.slice(idx56b, next56b);
const cat56b = block56b.match(/category: '([^']+)'/);
if (cat56b && cat56b[1] !== 'Заводы') {
    const blockStr56 = block56b.replace(`category: '${cat56b[1]}'`, "category: 'Заводы'");
    s = s.slice(0, idx56b) + blockStr56 + s.slice(next56b);
    console.log('Fixed category for 56 -> Заводы');
}

fs.writeFileSync('data/buildings.ts', s, 'utf8');

// Also check the chain one more time
console.log('\nFinal chain check:');
const ids = [500, 56, 391, 392, 393, 394, 395, 396, 397, 398, 399, 453, 454, 468, 470, 471];
ids.forEach(id => {
    const startIdx = s.indexOf(`\n  {\n    id: ${id},`);
    if (startIdx === -1) { console.log(`${id}: NOT FOUND`); return; }
    const nextIdx = s.indexOf('\n  {\n    id:', startIdx + 1);
    const block = nextIdx !== -1 ? s.slice(startIdx, nextIdx) : s.slice(startIdx);
    const nameMatch = block.match(/name: '([^']+)'/);
    const upgradesMatch = block.match(/upgradesTo: (\d+)/);
    const upgradeCostMatch = block.match(/upgradeCost: (\d+)/);
    console.log(`${id} (${nameMatch ? nameMatch[1] : '?'}) -> upgradesTo: ${upgradesMatch ? upgradesMatch[1] : 'FINAL'}, upgradeCost: ${upgradeCostMatch ? upgradeCostMatch[1] : 'NONE'}`);
});
