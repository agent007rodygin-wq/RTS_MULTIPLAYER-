const fs = require('fs');
const content = fs.readFileSync('c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx', 'utf8');

// Find a snippet with Р and print codes
const index = content.indexOf('Р');
if (index !== -1) {
    const snippet = content.slice(index, index + 2);
    console.log(`Snippet: ${snippet}`);
    console.log(`Char 1: ${snippet[0]} code: ${snippet.charCodeAt(0)}`);
    console.log(`Char 2: ${snippet[1]} code: ${snippet.charCodeAt(1)}`);
} else {
    console.log("No Р found.");
}
