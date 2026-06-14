const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix font at line 3003 (timer)
content = content.replace(/context\.font = [^;]+px serif\\;/g, "context.font = `bold ${12 * zoom}px serif`;");

// Fix emoji at line 3021
content = content.replace(/'рџ’°'/g, "'💰'");

// Fix generic font patterns
content = content.replace(/context\.font = \\ old \\px sans-serif\\;/g, (match, offset) => {
    // We need different font sizes based on context.
    const searchArea = content.substring(offset, offset + 100);
    if (searchArea.includes('💰')) return "context.font = `bold ${24 * zoom}px sans-serif`;";
    if (searchArea.includes('Ready')) return "context.font = `bold ${14 * zoom}px sans-serif`;";
    if (searchArea.includes('takesPopulation')) return "context.font = `bold ${16 * zoom}px sans-serif`;";
    return "context.font = `bold ${12 * zoom}px sans-serif`;";
});

// Extra fix for any other similar patterns
content = content.replace(/\\ old \\px/g, "px"); 

fs.writeFileSync(filePath, content);
console.log("Fixed broken strings in App.tsx");
