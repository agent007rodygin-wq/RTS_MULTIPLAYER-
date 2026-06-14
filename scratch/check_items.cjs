const fs = require('fs');

let s = fs.readFileSync('data/buildings.ts', 'utf8');

// The incorrect mapping we applied to buildings.ts:
// 10025 -> was supposed to be "Супер подсолнух". In items.ts: 10030 is 'Цветок подсолнуха' ?? wait!
// Is there a 'Супер подсолнух' in items.ts? No... Wait, maybe there's another items file?
// Let me just query items.ts directly via regex to find the right IDs.
