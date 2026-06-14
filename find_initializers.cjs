const fs = require('fs');
const content = fs.readFileSync('App.tsx', 'utf8');

const lines = content.split('\n');
const results = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('useState') || line.includes('useMemo') || line.includes('useRef')) {
        results.push((i+1) + ": " + line.trim());
    }
}

console.log(results.join('\n'));
