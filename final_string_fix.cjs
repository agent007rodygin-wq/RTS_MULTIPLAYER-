const fs = require('fs');
const filePath = 'c:\\Users\\User\\.antigravity\\extensions\\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\\App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The pattern identified: Backslash (92) + CR (13) + gba
// In JS string regex: \\ \r gba
// We'll use a very specific regex for this.

const brokenPattern1 = /context\.strokeStyle = \x5C\rgba\(255, 215, 0, \x5C\)\x5C\;/g;
const brokenPattern2 = /context\.fillStyle = \x5C\rgba\(255, 69, 0, \x5C\)\x5C\;/g;
const brokenPattern3 = /context\.fillStyle = \x5C\rgba\(255, 255, 255, \x5C\)\x5C\;/g;

// If the above don't catch it due to variations in whitespace or whatever, 
// we'll use a more generic one that finds the CR after a backslash near 'gba'.

content = content.replace(/\x5C\rgba/g, 'rgba');
content = content.replace(/ \x5C\)\x5C\;/g, '`);'); // Also fix the trailing mess

// Wait, let's be even more precise. 
// Standard format we want: context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;

content = content.replace(/context\.strokeStyle = \x5C\rgba\(255, 215, 0, [^\)]+\)\x5C\;/g, "context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;");
content = content.replace(/context\.fillStyle = \x5C\rgba\(255, 69, 0, [^\)]+\)\x5C\;/g, "context.fillStyle = `rgba(255, 69, 0, ${opacity})`;");
content = content.replace(/context\.fillStyle = \x5C\rgba\(255, 255, 255, [^\)]+\)\x5C\;/g, "context.fillStyle = `rgba(255, 255, 255, ${opacity})`;");

fs.writeFileSync(filePath, content);
console.log("Final fix attempt with CR-aware regex complete.");
