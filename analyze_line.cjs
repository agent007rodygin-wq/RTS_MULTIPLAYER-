const fs = require('fs');
const filePath = 'c:\\Users\\User\\.antigravity\\extensions\\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\\App.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
const line3067 = lines[3066]; // 0-indexed
console.log("Line 3067 raw: " + JSON.stringify(line3067));
for (let i = 0; i < line3067.length; i++) {
    console.log(`Char ${i}: ${line3067[i]} (code: ${line3067.charCodeAt(i)})`);
}
