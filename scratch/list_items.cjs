const fs = require('fs');
let s = fs.readFileSync('data/items.ts', 'utf8');
const r = /id:\s*(\d+),\s*name:\s*'([^']+)'/g;
let m;
while (m = r.exec(s)) {
    console.log(`${m[1]}: ${m[2]}`);
}
