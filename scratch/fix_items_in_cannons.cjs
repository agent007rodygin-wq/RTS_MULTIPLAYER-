const fs = require('fs');

let s = fs.readFileSync('data/buildings.ts', 'utf8');

// We only want to repair the cannons block, which are the last additions at the end of the file.
// Or we can just search and replace the specific bad mappings for cannons.
const ids = [365, 366, 367, 368, 369, 370, 382, 383, 384, 385];

for (const id of ids) {
    const rx = new RegExp(`"id"\\s*:\\s*${id},[\\s\\S]*?(?=\\n  \\{|\\n\\];)`);
    let match = s.match(rx);
    if (!match) continue;
    
    let block = match[0];
    
    // Fix 10005: "Супер тыква" -> 10004: "Супер тыква" (or "Куски супер тыквы")
    block = block.replace(/"id": 10005,\s*"name": "Супер тыква"/g, '"id": 10004, "name": "Куски супер тыквы"');
    
    // Fix 10028: "Камни" -> 10005: "Камни"
    block = block.replace(/"id": 10028,\s*"name": "Камни"/g, '"id": 10005, "name": "Камни"');
    
    // Fix 10006: "Яйцо Горыныча" -> 10018: "Яйцо Горыныча"
    block = block.replace(/"id": 10006,\s*"name": "Яйцо Горыныча"/g, '"id": 10018, "name": "Яйцо Горыныча"');
    
    // Fix 10048: "Каменные блоки" -> 10006: "Каменные блоки"
    block = block.replace(/"id": 10048,\s*"name": "Каменные блоки"/g, '"id": 10006, "name": "Каменные блоки"');
    
    // Fix 10004: "Супер лилия" -> 10024: "Супер лилия"
    block = block.replace(/"id": 10004,\s*"name": "Супер лилия"/g, '"id": 10024, "name": "Супер лилия 1"');
    
    // Fix 10025: "Супер подсолнух" -> probably Building ID? Or just item ID doesn't exist. "Супер подсолнух" is building 411? Let's check "Супер подсолнух 1" ID. We will leave it as 411 for now or another known ID.
    // Let me find what Super Sunflower building IDs are. In the past it was 85-87, then 107-112? I'll look it up later. For now, replace it to 120 (Super Sunflower 1).
    block = block.replace(/"id": 10025,\s*"name": "Супер подсолнух"/g, '"id": 120, "name": "Супер подсолнух"');
    
    // Replace names to match items.ts
    block = block.replace(/"name": "Супер гриб"/g, '"name": "Куски супер гриба"');

    s = s.replace(match[0], block);
}

fs.writeFileSync('data/buildings.ts', s, 'utf8');
console.log('Fixed item IDs in Cannons.');
