const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Fixing drawing font strings by line number - these are confirmed from the last view_file
// Note: split('\n') uses 0-based indexing, so line 3020 is index 3019
if (lines[3019] && lines[3019].includes('context.font =')) {
    lines[3019] = "                            context.font = `bold ${24 * zoom}px sans-serif`;";
}
if (lines[3030] && lines[3030].includes('context.font =')) {
    lines[3030] = "                        context.font = `bold ${14 * zoom}px sans-serif`;";
}
if (lines[3042] && lines[3042].includes('context.font =')) {
    lines[3042] = "                            context.font = `bold ${16 * zoom}px sans-serif`;";
}

// Also fix the broken emoji if it's still there
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('рџ’°')) {
        lines[i] = lines[i].replace('рџ’°', '💰');
    }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log("Fixed drawing strings at lines 3020, 3031, 3043.");
