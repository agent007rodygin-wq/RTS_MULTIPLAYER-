/**
 * regenerate_world.mjs — Full world regeneration via PocketBase
 * 
 * Matches the App's pocketbase.ts wrapper: sanitizePbId, wrapData format.
 * Generates: mountains, rivers, trees (243/zone), oil, quarries, chests, monsters (4/zone), 1 bronekur
 * Player buildings are NOT touched.
 * 
 * Run: node regenerate_world.mjs
 */

import PocketBase from 'pocketbase';

const PB_URL = 'http://89.127.214.182:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASSWORD = 'BaSingSe2024';
const CHUNK = 200;
const BATCH = 5; // Low concurrency to avoid PB throttling

// Map constants matching App.tsx
const WORLD_W = 200, WORLD_H = 200, ZONE_SIZE = 40, ZONES_X = 5, ZONES_Y = 5;
const TREE_HP = 3;
const TREES_PER_ZONE = 243;
const NUM_TREES = TREES_PER_ZONE * ZONES_X * ZONES_Y; // 6075
const MAX_MOUNTAINS = 70, MAX_RIVERS = 55, MAX_OIL = 8, MAX_QUARRIES = 6, MAX_CHESTS = 15;
const MOUNTAIN_ID = 50005, RIVER_ID = 50004;
const KILLING_HUT_ID = 70001, KIND_SANTA_ID = 70002, GORYNYCH_ID = 70003;
const KOLOBOK_ID = 70004, BABA_YAGA_ID = 70005, BRONEKUR_ID = 70006;

const MONSTER_STATS = {
    [KILLING_HUT_ID]: { hp: 100, name: 'избушка' },
    [KIND_SANTA_ID]: { hp: 80, name: 'санта' },
    [GORYNYCH_ID]: { hp: 150, name: 'горыныч' },
    [KOLOBOK_ID]: { hp: 120, name: 'колобок' },
    [BABA_YAGA_ID]: { hp: 130, name: 'бабаяга' },
    [BRONEKUR_ID]: { hp: 500, name: 'бронекур' },
};

const pb = new PocketBase(PB_URL);
const getZoneId = (x, y) => `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;

// === sanitizePbId — must match pocketbase.ts exactly ===
function sanitizePbId(id) {
    const strId = String(id);
    if (strId.length === 15 && /^[a-z0-9]+$/i.test(strId)) return strId;
    const safe = strId.replace(/[^a-zA-Z0-9]/g, 'z').toLowerCase();
    let pbId = safe.length >= 15 ? safe.substring(0, 15) : safe.padEnd(15, '0');
    return pbId.substring(0, 15);
}

// === wrapData for buildings ===
function wrapBuilding(gameId, data) {
    const KNOWN = ['ownerId', 'zoneId', 'x', 'y', 'buildingId'];
    const result = { gameId };
    const extra = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'id') continue;
        if (KNOWN.includes(key)) {
            result[key] = key === 'buildingId' ? String(value) : value;
        } else {
            extra[key] = value;
        }
    }
    if (Object.keys(extra).length > 0) result.data = extra;
    return result;
}

// === wrapData for map_resources ===
function wrapResource(gameId, data) {
    const KNOWN = ['type', 'x', 'y', 'zoneId'];
    const result = { gameId };
    const extra = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'id') continue;
        if (KNOWN.includes(key)) {
            result[key] = key === 'type' ? String(value) : value;
        } else {
            extra[key] = value;
        }
    }
    if (Object.keys(extra).length > 0) result.data = extra;
    return result;
}

// Seeded random
function makeRandom(seed) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

async function deleteFiltered(col, filter) {
    console.log(`🗑️  Deleting from ${col}${filter ? ` where: ${filter}` : ' (all)'}...`);
    let deleted = 0;
    while (true) {
        const items = await pb.collection(col).getList(1, CHUNK, { filter: filter || '', fields: 'id' });
        if (items.items.length === 0) break;
        await Promise.all(items.items.map(r => pb.collection(col).delete(r.id).catch(() => {})));
        deleted += items.items.length;
        process.stdout.write(`  Deleted: ${deleted}\r`);
    }
    console.log(`  ✅ Deleted from ${col}: ${deleted}`);
}

async function batchCreateBuildings(items) {
    let created = 0, errors = 0;
    for (let i = 0; i < items.length; i += BATCH) {
        const batch = items.slice(i, i + BATCH);
        for (const item of batch) {
            const pbId = sanitizePbId(item.gameId);
            const payload = { ...item, id: pbId };
            try {
                await pb.collection('buildings').create(payload);
                created++;
            } catch (err) {
                try {
                    await pb.collection('buildings').update(pbId, item);
                    created++;
                } catch (e2) {
                    errors++;
                    if (errors <= 3) console.log(`  ERR: ${pbId} -> ${e2.message}`);
                }
            }
        }
        process.stdout.write(`  Progress: ${Math.min(i + BATCH, items.length)}/${items.length} (ok: ${created}, err: ${errors})\r`);
    }
    console.log(`  ✅ Buildings: ${created} ok, ${errors} errors                     `);
}

async function batchCreateResources(items) {
    let created = 0, errors = 0;
    for (let i = 0; i < items.length; i += BATCH) {
        const batch = items.slice(i, i + BATCH);
        for (const item of batch) {
            const pbId = sanitizePbId(item.gameId);
            const payload = { ...item, id: pbId };
            try {
                await pb.collection('map_resources').create(payload);
                created++;
            } catch (err) {
                try {
                    await pb.collection('map_resources').update(pbId, item);
                    created++;
                } catch (e2) {
                    errors++;
                    if (errors <= 3) console.log(`  ERR: ${pbId} -> ${e2.message}`);
                }
            }
        }
        process.stdout.write(`  Progress: ${Math.min(i + BATCH, items.length)}/${items.length} (ok: ${created}, err: ${errors})\r`);
    }
    console.log(`  ✅ Resources: ${created} ok, ${errors} errors                     `);
}

async function main() {
    console.log('🔑 Authenticating...');
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated!\n');

    // === STEP 1: Clean ===
    console.log('=== STEP 1: Cleaning old world data ===\n');
    await deleteFiltered('buildings', '(ownerId="-1" || ownerId="monster")');
    await deleteFiltered('map_resources', '');
    try {
        const states = await pb.collection('map_state').getFullList({ fields: 'id' });
        for (const s of states) await pb.collection('map_state').delete(s.id).catch(() => {});
        console.log(`  ✅ Deleted ${states.length} map_state records`);
    } catch { console.log('  ⚠️ map_state cleanup skipped'); }

    // === STEP 2: Load player buildings ===
    console.log('\n=== STEP 2: Loading player buildings ===\n');
    const playerBuildings = await pb.collection('buildings').getFullList({ fields: 'id,x,y' });
    const occupied = new Set(playerBuildings.map(b => `${b.x},${b.y}`));
    console.log(`  Found ${playerBuildings.length} player buildings\n`);

    // === STEP 3: Generate ===
    console.log('=== STEP 3: Generating new world ===\n');
    const seed = Math.floor(Math.random() * 1000000);
    const random = makeRandom(seed);

    const tryPlace = () => {
        for (let t = 0; t < 200; t++) {
            const x = Math.floor(random() * WORLD_W);
            const y = Math.floor(random() * WORLD_H);
            if (!occupied.has(`${x},${y}`)) { occupied.add(`${x},${y}`); return { x, y }; }
        }
        return null;
    };

    // --- Mountains ---
    console.log(`🏔️  Generating ${MAX_MOUNTAINS} mountains...`);
    const mountains = [];
    for (let i = 0; i < MAX_MOUNTAINS; i++) {
        const pos = tryPlace();
        if (pos) {
            const gameId = `mountain_${pos.x}_${pos.y}`;
            mountains.push(wrapBuilding(gameId, {
                x: pos.x, y: pos.y, zoneId: getZoneId(pos.x, pos.y),
                buildingId: MOUNTAIN_ID, ownerId: "-1", ownerName: "Система",
                isConstructing: false, constructionEndTime: 0,
                type: 'Default', workState: 'idle',
                hp: 999999, maxHp: 999999
            }));
        }
    }
    await batchCreateBuildings(mountains);

    // --- Rivers ---
    console.log(`🌊 Generating ${MAX_RIVERS} rivers...`);
    const rivers = [];
    for (let i = 0; i < MAX_RIVERS; i++) {
        const pos = tryPlace();
        if (pos) {
            const gameId = `river_${pos.x}_${pos.y}`;
            rivers.push(wrapBuilding(gameId, {
                x: pos.x, y: pos.y, zoneId: getZoneId(pos.x, pos.y),
                buildingId: RIVER_ID, ownerId: "-1", ownerName: "Система",
                isConstructing: false, constructionEndTime: 0,
                type: 'Default', workState: 'idle',
                hp: 999999, maxHp: 999999
            }));
        }
    }
    await batchCreateBuildings(rivers);

    // --- Trees ---
    console.log(`🌲 Generating ${NUM_TREES} trees (${TREES_PER_ZONE}/zone)...`);
    const trees = [];
    for (let i = 0; i < NUM_TREES; i++) {
        const pos = tryPlace();
        if (pos) {
            const gameId = `${pos.x}_${pos.y}`;
            trees.push(wrapResource(gameId, {
                x: pos.x, y: pos.y, zoneId: getZoneId(pos.x, pos.y),
                hp: TREE_HP, type: 'tree'
            }));
        }
    }
    await batchCreateResources(trees);

    // --- Oil ---
    console.log(`🛢️  Generating ${MAX_OIL} oil deposits...`);
    const oils = [];
    for (let i = 0; i < MAX_OIL; i++) {
        const pos = tryPlace();
        if (pos) {
            const gameId = `${pos.x}_${pos.y}`;
            oils.push(wrapResource(gameId, {
                x: pos.x, y: pos.y, zoneId: getZoneId(pos.x, pos.y),
                hp: 10, type: 'oil'
            }));
        }
    }
    await batchCreateResources(oils);

    // --- Quarries ---
    console.log(`⛏️  Generating ${MAX_QUARRIES} quarries...`);
    const quarries = [];
    for (let i = 0; i < MAX_QUARRIES; i++) {
        const pos = tryPlace();
        if (pos) {
            const gameId = `${pos.x}_${pos.y}`;
            quarries.push(wrapResource(gameId, {
                x: pos.x, y: pos.y, zoneId: getZoneId(pos.x, pos.y),
                hp: 50, type: 'quarry'
            }));
        }
    }
    await batchCreateResources(quarries);

    // --- Chests ---
    console.log(`📦 Generating ${MAX_CHESTS} chests...`);
    const chests = [];
    for (let i = 0; i < MAX_CHESTS; i++) {
        const pos = tryPlace();
        if (pos) {
            const gameId = `${pos.x}_${pos.y}`;
            chests.push(wrapResource(gameId, {
                x: pos.x, y: pos.y, zoneId: getZoneId(pos.x, pos.y),
                hp: 1, type: 'chest'
            }));
        }
    }
    await batchCreateResources(chests);

    // --- Monsters: 4 random types per zone ---
    console.log(`👾 Generating monsters (4 random per zone × 25 zones)...`);
    const monsterTypes = [KILLING_HUT_ID, KIND_SANTA_ID, GORYNYCH_ID, KOLOBOK_ID, BABA_YAGA_ID];
    const allMonsters = [];
    for (let zX = 0; zX < ZONES_X; zX++) {
        for (let zY = 0; zY < ZONES_Y; zY++) {
            const zoneId = `${zX}_${zY}`;
            const shuffled = [...monsterTypes].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 4);
            for (const typeId of selected) {
                const stats = MONSTER_STATS[typeId];
                const sx = zX * ZONE_SIZE, sy = zY * ZONE_SIZE;
                let pos = null;
                for (let t = 0; t < 100; t++) {
                    const x = sx + Math.floor(Math.random() * ZONE_SIZE);
                    const y = sy + Math.floor(Math.random() * ZONE_SIZE);
                    if (!occupied.has(`${x},${y}`)) { occupied.add(`${x},${y}`); pos = { x, y }; break; }
                }
                if (pos) {
                    const gameId = `m${typeId}s1z${zoneId}`;
                    allMonsters.push(wrapBuilding(gameId, {
                        x: pos.x, y: pos.y, zoneId,
                        buildingId: typeId, ownerId: "monster", ownerName: "Монстр",
                        isConstructing: false, constructionEndTime: 0,
                        type: 'Default', workState: 'idle',
                        hp: stats.hp, maxHp: stats.hp,
                        lastMoveTime: Date.now() - Math.floor(Math.random() * 10000),
                        isActive: true, monsterType: stats.name, monsterSlot: 1
                    }));
                }
            }
        }
    }
    await batchCreateBuildings(allMonsters);

    // --- Boss: 1 Bronekur ---
    console.log(`🐔 Spawning Bronekur boss...`);
    const bzX = Math.floor(Math.random() * ZONES_X);
    const bzY = Math.floor(Math.random() * ZONES_Y);
    const bossZoneId = `${bzX}_${bzY}`;
    const bsx = bzX * ZONE_SIZE, bsy = bzY * ZONE_SIZE;
    let bossPos = null;
    for (let t = 0; t < 100; t++) {
        const x = bsx + Math.floor(Math.random() * ZONE_SIZE);
        const y = bsy + Math.floor(Math.random() * ZONE_SIZE);
        if (!occupied.has(`${x},${y}`)) { occupied.add(`${x},${y}`); bossPos = { x, y }; break; }
    }
    if (bossPos) {
        const gameId = `m${BRONEKUR_ID}s1z${bossZoneId}`;
        const pbId = sanitizePbId(gameId);
        const payload = wrapBuilding(gameId, {
            x: bossPos.x, y: bossPos.y, zoneId: bossZoneId,
            buildingId: BRONEKUR_ID, ownerId: "monster", ownerName: "Монстр",
            isConstructing: false, constructionEndTime: 0,
            type: 'Default', workState: 'idle',
            hp: MONSTER_STATS[BRONEKUR_ID].hp, maxHp: MONSTER_STATS[BRONEKUR_ID].hp,
            lastMoveTime: Date.now(), isActive: true,
            monsterType: 'бронекур', monsterSlot: 1, isBoss: true
        });
        try {
            await pb.collection('buildings').create({ ...payload, id: pbId });
            console.log(`  ✅ Bronekur spawned at zone ${bossZoneId} (pbId: ${pbId})`);
        } catch (e) {
            console.error('  ⚠️ Bronekur error:', e.message);
        }
    }

    // --- map_state ---
    console.log(`\n💾 Saving map_state...`);
    const stateId = sanitizePbId('status');
    try {
        await pb.collection('map_state').create({
            id: stateId, gameId: 'status',
            data: { generated: true, seed, forceReloadAt: Date.now() }
        });
    } catch {
        try {
            await pb.collection('map_state').update(stateId, {
                gameId: 'status',
                data: { generated: true, seed, forceReloadAt: Date.now() }
            });
        } catch (e2) { console.error('  ⚠️ map_state error:', e2.message); }
    }
    console.log('  ✅ map_state saved');

    // === Summary ===
    console.log('\n========================================');
    console.log('🎉 WORLD REGENERATION COMPLETE!');
    console.log('========================================');
    console.log(`  🏔️  Mountains: ${mountains.length}`);
    console.log(`  🌊 Rivers: ${rivers.length}`);
    console.log(`  🌲 Trees: ${trees.length} (${TREES_PER_ZONE}/zone)`);
    console.log(`  🛢️  Oil: ${oils.length}`);
    console.log(`  ⛏️  Quarries: ${quarries.length}`);
    console.log(`  📦 Chests: ${chests.length}`);
    console.log(`  👾 Monsters: ${allMonsters.length} (4/zone × 25 zones)`);
    console.log(`  🐔 Bronekur: 1`);
    console.log(`  🏠 Player buildings preserved: ${playerBuildings.length}`);
    console.log(`  🌱 Seed: ${seed}`);
    console.log('\nReload the game to see the new world!');
}

main().catch(err => {
    console.error('❌ Fatal:', err.message || err);
    process.exit(1);
});

