const fs = require('fs');
let s = fs.readFileSync('data/buildings.ts', 'utf8');

// Fix names for levels 12-16 and add missing upgradeCost
const fixMap = [
    { id: 391, upgradeCost: 76800 },  // -> Sawmill 4 price
    { id: 392, upgradeCost: 187500 }, // -> Sawmill 5 price
    { id: 393, upgradeCost: 388800 }, // -> Sawmill 6 price
    { id: 394, upgradeCost: 720300 }, // -> Sawmill 7 price
    { id: 395, upgradeCost: 1228800 }, // -> Sawmill 8 price
    { id: 396, upgradeCost: 1968300 }, // -> Sawmill 9 price
    { id: 397, upgradeCost: 3000000 }, // -> Sawmill 10 price
    { id: 398, upgradeCost: 4392300 }, // -> Sawmill 11 price
    { id: 399, upgradeCost: 6220800 }, // -> Sawmill 12 price
    { id: 453, upgradeCost: 8568300 }, // -> Sawmill 13 price
    { id: 454, upgradeCost: 11524800 }, // -> Sawmill 14 price
    { id: 468, upgradeCost: 15187500 }, // -> Sawmill 15 price
    { id: 470, upgradeCost: 19660800 }, // -> Sawmill 16 price
];

// Fix names for 453, 454, 468, 470, 471
const nameFixed = [
    { id: 453, name: 'Лесопилка 12', englishName: 'Sawmill 12' },
    { id: 454, name: 'Лесопилка 13', englishName: 'Sawmill 13' },
    { id: 468, name: 'Лесопилка 14', englishName: 'Sawmill 14' },
    { id: 470, name: 'Лесопилка 15', englishName: 'Sawmill 15' },
    { id: 471, name: 'Лесопилка 16', englishName: 'Sawmill 16' },
];

nameFixed.forEach(fix => {
    s = s.replace(
        new RegExp(`(id: ${fix.id},\\s*name: ')([^']+)(')`),
        `$1${fix.name}$3`
    );
    s = s.replace(
        new RegExp(`(id: ${fix.id},[\\s\\S]{0,100}englishName: ')([^']+)(')`),
        `$1${fix.englishName}$3`
    );
    console.log(`Fixed name for ${fix.id}: ${fix.name}`);
});

// Add upgradeCost to each (after upgradesTo: N)
fixMap.forEach(fix => {
    const pattern = new RegExp(`(upgradesTo: ${fix.id === 471 ? '\\d+' : fix.id + '(?!\\d)'})\\s*(\\n  },)`,'');
    // Find block for this building id and add upgradeCost before imageUrl
    const startIdx = s.indexOf(`\n  {\n    id: ${fix.id},`);
    if (startIdx === -1) {
        console.log(`${fix.id}: NOT FOUND in fixMap`);
        return;
    }
    const nextIdx = s.indexOf('\n  {\n    id:', startIdx + 1);
    const block = nextIdx !== -1 ? s.slice(startIdx, nextIdx) : s.slice(startIdx);
    
    // Check if upgradeCost already present in this block
    if (block.includes('upgradeCost:')) {
        console.log(`${fix.id}: upgradeCost already exists`);
        return;
    }
    
    // Find the upgradesTo line in this block
    const upMatch = block.match(/upgradesTo: \d+/);
    if (upMatch) {
        const insertPos = startIdx + block.indexOf(upMatch[0]) + upMatch[0].length;
        s = s.slice(0, insertPos) + `,\n    upgradeCost: ${fix.upgradeCost}` + s.slice(insertPos);
        console.log(`Added upgradeCost ${fix.upgradeCost} to ${fix.id}`);
    }
});

// Lv 1 (500) already has upgradeCost?
const idx500 = s.indexOf('\n  {\n    id: 500,');
const next500 = s.indexOf('\n  {\n    id:', idx500 + 1);
const block500 = s.slice(idx500, next500);
console.log('\nBlock 500 has upgradeCost:', block500.includes('upgradeCost:'));

fs.writeFileSync('data/buildings.ts', s, 'utf8');
console.log('\nDone.');
