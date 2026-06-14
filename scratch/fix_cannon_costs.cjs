const fs = require('fs');

let s = fs.readFileSync('data/buildings.ts', 'utf8');

const ids = [365, 366, 367, 368, 369, 370, 382, 383, 384, 385];

for (let i = 0; i < ids.length - 1; i++) {
    const currentId = ids[i];
    const nextId = ids[i + 1];

    // Find price of nextId - accounting for quotes
    const nextRegex = new RegExp(`"id"\\s*:\\s*${nextId},[\\s\\S]*?"price"\\s*:\\s*(\\d+)`);
    const matchNext = s.match(nextRegex);
    if (!matchNext) {
        console.error(`Could not find price for nextId ${nextId}`);
        continue;
    }
    const nextPrice = matchNext[1];

    // Find block for currentId
    const blockRegex = new RegExp(`("id"\\s*:\\s*${currentId},[\\s\\S]*?"upgradesTo"\\s*:\\s*${nextId})\\s*(,?)\\s*(\\n\\s*\\},)`);
    if (s.match(blockRegex) && !s.match(new RegExp(`"id"\\s*:\\s*${currentId},[\\s\\S]*?"upgradesTo"\\s*:\\s*${nextId},?\\s*\\n\\s*"upgradeCost":`))) {
        s = s.replace(blockRegex, `$1,\n    "upgradeCost": ${nextPrice}$3`);
        console.log(`Added upgradeCost ${nextPrice} to Cannon ID ${currentId}`);
    } else {
        console.log(`Could not successfully replace or already exists for ID ${currentId}`);
    }
}

fs.writeFileSync('data/buildings.ts', s, 'utf8');
console.log('Done.');
