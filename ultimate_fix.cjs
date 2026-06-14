const fs = require('fs');
const filePath = 'c:\\Users\\User\\.antigravity\\extensions\\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\\App.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// The lines currently look like: "                context.strokeStyle = rgba(255, 215, 0,`);"
// We want: "                context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;"

const lines = content.split('\n');
lines[3066] = "                context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;";
lines[3074] = "                context.fillStyle = `rgba(255, 69, 0, ${opacity})`;";
lines[3106] = "                context.fillStyle = `rgba(255, 255, 255, ${opacity})`;";

fs.writeFileSync(filePath, lines.join('\n'));
console.log("Ultimate fix applied via line indexing.");
