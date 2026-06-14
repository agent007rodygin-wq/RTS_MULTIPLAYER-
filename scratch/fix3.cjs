const fs = require('fs');

let appContent = fs.readFileSync('App.tsx', 'utf8');

// ===========================================================
// 1. Add nextBid logic for sawmills (they stay same building on collect)
// Insert after: else if (bid === 323) nextBid = 313;
// ===========================================================
const anchor_nextBid = `else if (bid === 323) nextBid = 313;`;
const sawmill_nextBid = `else if (bid === 323) nextBid = 313;
            // Sawmill upgraded lumbermills - stay same building after collect
            else if ([500, 56, 391, 392, 393, 394, 395, 396, 397, 398, 399, 453, 454, 468, 470, 471].includes(bid)) nextBid = bid;`;

if (appContent.includes(anchor_nextBid) && !appContent.includes('Sawmill upgraded lumbermills')) {
    appContent = appContent.replace(anchor_nextBid, sawmill_nextBid);
    console.log('Added sawmill nextBid logic');
} else {
    console.log('sawmill nextBid already present or anchor not found');
}

// ===========================================================
// 2. Add elite wood (sometimesProduces) handling in collect function
// After inventoryDeltas from produces, handle sometimesProduces
// ===========================================================
const produceSection = `        const inventoryDeltas: Record<number, number> = {};
        if (info.stats.produces) {
            info.stats.produces.forEach(prod => {
                inventoryDeltas[prod.id] = (inventoryDeltas[prod.id] || 0) + (prod.amount || 0);
            });
        }
        
        updatePlayerResources(actualGold, 0, inventoryDeltas);`;

const produceSectionNew = `        const inventoryDeltas: Record<number, number> = {};
        if (info.stats.produces) {
            info.stats.produces.forEach(prod => {
                inventoryDeltas[prod.id] = (inventoryDeltas[prod.id] || 0) + (prod.amount || 0);
            });
        }
        // Handle sometimesProduces (e.g. elite wood for sawmills)
        if (info.stats.sometimesProduces) {
            info.stats.sometimesProduces.forEach(sp => {
                const roll = Math.random() * 100;
                if (roll < (sp.chance || 0)) {
                    inventoryDeltas[sp.id] = (inventoryDeltas[sp.id] || 0) + 1;
                }
            });
        }
        
        updatePlayerResources(actualGold, 0, inventoryDeltas);`;

if (appContent.includes(produceSection) && !appContent.includes('Handle sometimesProduces')) {
    appContent = appContent.replace(produceSection, produceSectionNew);
    console.log('Added sometimesProduces to collect function');
} else {
    console.log('sometimesProduces already present or anchor not found:', appContent.includes(produceSection));
}

// ===========================================================
// 3. Replace 'Ready' text with coin icon for ALL buildings with workState=finished
//    Currently only lily/mushroom get the coin icon. The "Ready" box serves the rest.
//    We want sawmills to ALSO get the coin icon (they're already in isMushroomOrLily).
//    So no additional change needed — they already use coin icon path.
//    BUT we need to make sure when "Ready" is shown for sawmills (in old path), it's coin icon.
//    Since we added sawmills to the isMushroomOrLily list, the coin icon branch IS hit.
//    Let's verify by checking the lines around 3484
// ===========================================================

// Check what the current code looks like at the Ready text spot
const readyIdx = appContent.indexOf("context.fillText('Ready'");
if (readyIdx !== -1) {
    const snip = appContent.slice(readyIdx - 200, readyIdx + 300);
    console.log('\nReady text context:\n', snip);
} else {
    console.log('Ready text not found');
}

fs.writeFileSync('App.tsx', appContent, 'utf8');
console.log('\nApp.tsx saved.');
