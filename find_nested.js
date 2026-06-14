const fs = require('fs');
const content = fs.readFileSync('App.tsx', 'utf8');

const lines = content.split('\n');
const results = [];

// Look for components nested inside App
let insideApp = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const App: React.FC')) {
        insideApp = true;
    }
    if (insideApp && (lines[i].match(/^\s*const\s+[A-Z]\w+\s*=\s*(?:function|\([^)]*\)\s*=>)/) || lines[i].match(/^\s*function\s+[A-Z]\w+\s*\(/))) {
        results.push((i+1) + ": " + lines[i].trim());
    }
}

console.log("\n--- NESTED COMPONENTS ---");
console.log(results.join('\n'));
