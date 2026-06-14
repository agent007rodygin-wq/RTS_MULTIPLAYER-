const fs = require('fs');
const s = fs.readFileSync('data/buildings.ts', 'utf8');

[365,366,367,368,369,370,382,383,384,385].forEach(id => {
    const rx = new RegExp(`id: ${id},\\s*name: '([^']+)'`);
    const m = s.match(rx);
    if(m) console.log(`Found ID ${id}: ${m[1]}`);
});
console.log('Done checking IDs.');
