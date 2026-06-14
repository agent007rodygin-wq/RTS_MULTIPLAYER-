const fs = require('fs');
const filePath = 'c:\\Users\\User\\.antigravity\\extensions\\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\\App.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');
console.log("Line 3067: " + JSON.stringify(lines[3066]));
console.log("Line 3075: " + JSON.stringify(lines[3074]));
console.log("Line 3107: " + JSON.stringify(lines[3106]));
