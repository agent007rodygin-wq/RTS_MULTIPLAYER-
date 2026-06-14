const fs = require('fs');
let s = fs.readFileSync('data/buildings.ts', 'utf8');

// The appended block starts with "  },\n{" instead of "  },\n  {"
// Fix: replace the boundary
s = s.replace(/\n\};\n\n\n\n\n\n$/, '\n];\n');
// Actually the append script put ",\n{" where it should be ",\n  {"
// Let's check the exact pattern
const idx = s.indexOf('},\n{\n    id: 391');
console.log('pattern idx:', idx);
if (idx !== -1) {
    const before = s.slice(idx, idx + 30);
    console.log('Before fix:', JSON.stringify(before));
    s = s.replace(/},\n{\n    id: 391,/g, '},\n  {\n    id: 391,');
    console.log('Fixed 391 indentation');
}

// Also fix similar patterns for other appended buildings
const newIds = [392, 393, 394, 395, 396, 397, 398, 399, 453, 454, 468, 470, 471];
newIds.forEach(id => {
    const pattern = `},\n{\n    id: ${id},`;
    if (s.includes(pattern)) {
        s = s.replace(new RegExp(`},\\n{\\n    id: ${id},`, 'g'), `},\n  {\n    id: ${id},`);
        console.log(`Fixed ${id} indentation`);
    }
});

fs.writeFileSync('data/buildings.ts', s, 'utf8');
console.log('Done');
