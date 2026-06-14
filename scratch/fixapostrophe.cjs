const fs = require('fs');
let s = fs.readFileSync('data/buildings.ts', 'utf8');

// Fix: Frog's burrow - apostrophe breaks single-quoted string
// Replace all instances of englishName: 'Frog's burrow N'
// with englishName: "Frog's burrow N"

// Find all englishName lines with apostrophe inside single quotes
let fixed = 0;
s = s.replace(/englishName: '([^']*'[^']*)',/g, (match, inner) => {
    fixed++;
    return `englishName: "${inner.replace(/'/g, "'")}",`;
});
console.log(`Fixed ${fixed} englishName strings with apostrophe`);

// Also fix any other string fields with unescaped apostrophes
// Check for category: "Жилые" → category: 'Жилые'
s = s.replace(/category: "Жилые"/g, "category: 'Жилые'");

// Check for remaining double-quoted strings in the appended section
const doubleQuoteCount = (s.match(/: "[^"]+"/g) || []).length;
console.log('Remaining double-quoted values:', doubleQuoteCount);

fs.writeFileSync('data/buildings.ts', s, 'utf8');
console.log('Saved.');
