const fs = require('fs');
const out = fs.readFileSync('scratch/out.ts', 'utf8');
const original = fs.readFileSync('data/buildings.ts', 'utf8');

// Strip surrounding [ ... ]
const innerContent = out.trim().slice(1, -1).trim();

// Append to buildings.ts
const newOriginal = original.replace(/}\n\];\s*$/, '},\n' + innerContent + '\n];');
fs.writeFileSync('data/buildings.ts', newOriginal, 'utf8');

console.log("Buildings appended successfully!");
