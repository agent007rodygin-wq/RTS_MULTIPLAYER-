const fs = require('fs');
const content = fs.readFileSync('App.tsx', 'utf8');

const lines = content.split('\n');
const results = [];

let insideApp = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('const App: React.FC = () => {')) {
        insideApp = true;
        braceCount = 1;
        continue;
    }
    
    if (!insideApp) continue;
    
    // Count braces to stay at top level of App
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
    
    if (braceCount === 0) {
        insideApp = false;
        continue;
    }
    
    // If we are somewhat near the top level (braceCount might vary if there are single line blocks, but let's just grep)
    if (line.match(/^\s*const\s+\w+\s*=/)) {
        results.push((i+1) + ": " + line.trim());
    }
}

fs.writeFileSync('all_consts.txt', results.join('\n'));
console.log("Wrote all_consts.txt");
