const fs = require('fs');
const s = fs.readFileSync('data/buildings.ts', 'utf8');

// Split by building objects
const ids = [500, 56, 391, 392, 393, 394, 395, 396, 397, 398, 399, 453, 454, 468, 470, 471];

ids.forEach((id, i) => {
    // Find the block for this ID
    const startIdx = s.indexOf(`\n  {\n    id: ${id},\n`);
    if (startIdx === -1) {
        console.log(`${id}: NOT FOUND`);
        return;
    }
    // Find the end of this block (next object at root level)
    const nextIdx = s.indexOf('\n  {\n    id:', startIdx + 1);
    const block = nextIdx !== -1 ? s.slice(startIdx, nextIdx) : s.slice(startIdx);
    
    const nameMatch = block.match(/name: '([^']+)'/);
    const upgradesMatch = block.match(/upgradesTo: (\d+)/);
    const name = nameMatch ? nameMatch[1] : '???';
    const upgradesTo = upgradesMatch ? upgradesMatch[1] : 'NONE (max level)';
    console.log(`${id} (${name}) -> upgradesTo: ${upgradesTo}`);
});
