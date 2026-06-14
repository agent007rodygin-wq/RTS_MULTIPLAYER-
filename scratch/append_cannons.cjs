const fs = require('fs');

let s = fs.readFileSync('data/buildings.ts', 'utf8');
let out = fs.readFileSync('scratch/out_cannons.ts', 'utf8');

// Strip surrounding []
out = out.trim();
if(out.startsWith('[')) out = out.slice(1);
if(out.endsWith(']')) out = out.slice(0, -1);
out = out.trim();

// Add missing comma to the last building in s before the closing ]
const lastBracketIdx = s.lastIndexOf('];');
if(lastBracketIdx === -1) {
    console.error("Could not find closing ];");
    process.exit(1);
}

// Find the last object closing brace before var closing
let beforeBracket = s.slice(0, lastBracketIdx).trimRight();
if(beforeBracket.endsWith('}')) {
    beforeBracket += ',';
}

s = beforeBracket + '\n  ' + out + '\n];\n';

fs.writeFileSync('data/buildings.ts', s, 'utf8');
console.log('Appended cannons successfully.');
