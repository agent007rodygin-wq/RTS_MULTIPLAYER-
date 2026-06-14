const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all occurrences of the broken template literal
content = content.replace(/'монет\. : 'рубинов'/g, "'монет.' : 'рубинов'");

fs.writeFileSync(filePath, content);
console.log("Global fix for 'монет.' template strings applied.");
