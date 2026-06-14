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
    
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;
    
    if (braceCount === 0) {
        insideApp = false;
        continue;
    }
    
    // Check for early returns in App top level
    if (line.match(/^\s*return\s+/)) {
        // Just print all returns to see where the JSX starts and if there are early returns
        results.push((i+1) + ": " + line.trim());
    }
}

console.log(results.join('\n'));
