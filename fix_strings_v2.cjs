const fs = require('fs');
const filePath = 'c:\\Users\\User\\.antigravity\\extensions\\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\\App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Aggressive match for the broken rgba strings
content = content.replace(/context\.strokeStyle = .*gba\(255, 215, 0, .*\)\;/g, "context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;");
content = content.replace(/context\.fillStyle = .*gba\(255, 69, 0, .*\)\;/g, "context.fillStyle = `rgba(255, 69, 0, ${opacity})`;");
content = content.replace(/context\.fillStyle = .*gba\(255, 255, 255, .*\)\;/g, "context.fillStyle = `rgba(255, 255, 255, ${opacity})`;");

fs.writeFileSync(filePath, content);
console.log("Success: Aggressive fix applied.");
