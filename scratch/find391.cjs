const fs = require('fs');
const s = fs.readFileSync('data/buildings.ts', 'utf8');

// Check how 391 block starts
const idx = s.indexOf('id: 391,');
const snip = s.slice(idx - 50, idx + 30);
console.log(JSON.stringify(snip));
