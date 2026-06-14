/**
 * quick_reset_map.mjs
 * 
 * Быстрая очистка и регенерация карты через PocketBase:
 * - Удаляет ВСЕ map_resources (деревья, нефть, монстры, каменоломни)
 * - Удаляет системные buildings (горы, реки, монстры-здания) с ownerId="-1" или "monster"
 * - Удаляет map_state/status
 * - Генерирует новые деревья, горы, реки, монстров
 * - Постройки игроков (ownerId = их uid) НЕ удаляются
 * 
 * Запуск: node quick_reset_map.mjs
 */

import PocketBase from 'pocketbase';

const PB_URL = 'http://89.127.214.182:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASSWORD = 'BaSingSe2024';
const CHUNK = 200; // delete batch size

// Map constants — MUST match App.tsx
const WORLD_W = 200;
const WORLD_H = 200;
const ZONE_SIZE = 40; // 40x40 tiles per zone = 5x5 = 25 sectors total
const TREE_HP = 3;
const ZONES_X = 5;
const ZONES_Y = 5;
const TREES_PER_ZONE = 300; // 300 trees per sector × 25 sectors = 7500 total
const MAX_MOUNTAINS = 70;
const MAX_RIVERS = 55;
const MAX_OIL = 8;
const MAX_QUARRIES = 6;
const MAX_CHESTS = 15;
const MONSTERS_PER_TYPE = 5;

const MOUNTAIN_ID = 50005;
const RIVER_ID = 50004;
const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const GORYNYCH_ID = 70003;

// Monster stats (durability values)
const MONSTER_HP = { [KILLING_HUT_ID]: 100, [KIND_SANTA_ID]: 80, [GORYNYCH_ID]: 150 };

const pb = new PocketBase(PB_URL);

const getZoneId = (x, y) => `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;

async function deleteAll(col, filter = '') {
    console.log(`\n🗑️  Очистка коллекции: ${col} ${filter ? `(filter: ${filter})` : ''}...`);
    let deleted = 0;
    while (true) {
        const items = await pb.collection(col).getList(1, CHUNK, { filter, fields: 'id' });
        if (items.items.length === 0) break;
        await Promise.all(items.items.map(r => pb.collection(col).delete(r.id).catch(() => {})));
        deleted += items.items.length;
        process.stdout.write(`  Удалено: ${deleted}\r`);
    }
    console.log(`  ✅ Итого удалено из ${col}: ${deleted}`);
    return deleted;
}

function makeId() {
    // Generate 15-char alphanumeric ID like PocketBase
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 15; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
}

async function seedResources() {
    console.log(`\n🌲 Генерация ресурсов для карты ${WORLD_W}×${WORLD_H}...`);
    const occupied = new Set();
    let created = 0;
    const BATCH = 50; // concurrent writes

    const tryPlace = () => {
        for (let t = 0; t < 200; t++) {
            const x = Math.floor(Math.random() * WORLD_W);
            const y = Math.floor(Math.random() * WORLD_H);
            const k = `${x}_${y}`;
            if (!occupied.has(k)) {
                occupied.add(k);
                return { x, y };
            }
        }
        return null;
    };

    // --- Trees: Generate exactly TREES_PER_ZONE trees per sector ---
    const TOTAL_TREES = TREES_PER_ZONE * ZONES_X * ZONES_Y;
    console.log(`  🌳 Деревья: ${TREES_PER_ZONE} на сектор × ${ZONES_X * ZONES_Y} секторов = ${TOTAL_TREES}...`);
    
    const treeBatch = [];
    for (let zx = 0; zx < ZONES_X; zx++) {
        for (let zy = 0; zy < ZONES_Y; zy++) {
            const zoneId = `${zx}_${zy}`;
            let treesInZone = 0;
            let attempts = 0;
            
            while (treesInZone < TREES_PER_ZONE && attempts < TREES_PER_ZONE * 3) {
                const rx = zx * ZONE_SIZE + Math.floor(Math.random() * ZONE_SIZE);
                const ry = zy * ZONE_SIZE + Math.floor(Math.random() * ZONE_SIZE);
                const k = `${rx}_${ry}`;
                
                if (!occupied.has(k)) {
                    occupied.add(k);
                    const id = `${rx}_${ry}`;
                    treeBatch.push(
                        pb.collection('map_resources').create({
                            id, x: rx, y: ry,
                            zoneId, hp: TREE_HP, type: 'tree'
                        }, { $autoCancel: false }).catch(() => {})
                    );
                    treesInZone++;
                    created++;
                    
                    if (treeBatch.length >= BATCH) {
                        await Promise.all(treeBatch.splice(0));
                        process.stdout.write(`    Деревьев: ${created}/${TOTAL_TREES}\r`);
                    }
                }
                attempts++;
            }
        }
    }
    await Promise.all(treeBatch);
    console.log(`    ✅ Деревья созданы: ${created}`);

    // --- Oil ---
    console.log(`  🛢️  Нефть: ${MAX_OIL}...`);
    for (let i = 0; i < MAX_OIL; i++) {
        const pos = tryPlace();
        if (!pos) continue;
        const id = `${pos.x}_${pos.y}`;
        await pb.collection('map_resources').create({
            id, x: pos.x, y: pos.y,
            zoneId: getZoneId(pos.x, pos.y),
            hp: 10, type: 'oil'
        }, { $autoCancel: false }).catch(() => {});
    }

    // --- Quarries ---
    console.log(`  ⛏️  Каменоломни: ${MAX_QUARRIES}...`);
    for (let i = 0; i < MAX_QUARRIES; i++) {
        const pos = tryPlace();
        if (!pos) continue;
        const id = `${pos.x}_${pos.y}`;
        await pb.collection('map_resources').create({
            id, x: pos.x, y: pos.y,
            zoneId: getZoneId(pos.x, pos.y),
            hp: 50, type: 'quarry'
        }, { $autoCancel: false }).catch(() => {});
    }

    // --- Chests ---
    console.log(`  📦 Сундуки: ${MAX_CHESTS}...`);
    for (let i = 0; i < MAX_CHESTS; i++) {
        const pos = tryPlace();
        if (!pos) continue;
        const id = `${pos.x}_${pos.y}`;
        await pb.collection('map_resources').create({
            id, x: pos.x, y: pos.y,
            zoneId: getZoneId(pos.x, pos.y),
            hp: 1, type: 'chest'
        }, { $autoCancel: false }).catch(() => {});
    }

    console.log(`  ✅ Ресурсы готовы!`);
}

async function seedBuildings() {
    console.log(`\n🏔️  Генерация зданий (горы, реки, монстры)...`);
    const occupied = new Set();
    const BATCH = 50;

    const tryPlace = () => {
        for (let t = 0; t < 200; t++) {
            const x = Math.floor(Math.random() * WORLD_W);
            const y = Math.floor(Math.random() * WORLD_H);
            const k = `${x}_${y}`;
            if (!occupied.has(k)) {
                occupied.add(k);
                return { x, y };
            }
        }
        return null;
    };

    // --- Mountains ---
    console.log(`  🏔️  Горы: ${MAX_MOUNTAINS}...`);
    let batch = [];
    for (let i = 0; i < MAX_MOUNTAINS; i++) {
        const pos = tryPlace();
        if (!pos) continue;
        batch.push(
            pb.collection('buildings').create({
                id: makeId(), x: pos.x, y: pos.y,
                zoneId: getZoneId(pos.x, pos.y), buildingId: MOUNTAIN_ID,
                ownerId: '-1', ownerName: 'Система', isConstructing: false,
                constructionEndTime: 0, type: 'default', workState: 'idle',
                hp: 9999, maxHp: 9999
            }, { $autoCancel: false }).catch(() => {})
        );
        if (batch.length >= BATCH) {
            await Promise.all(batch.splice(0));
        }
    }
    await Promise.all(batch);

    // --- Rivers ---
    console.log(`  🌊 Реки: ${MAX_RIVERS}...`);
    batch = [];
    for (let i = 0; i < MAX_RIVERS; i++) {
        const pos = tryPlace();
        if (!pos) continue;
        batch.push(
            pb.collection('buildings').create({
                id: makeId(), x: pos.x, y: pos.y,
                zoneId: getZoneId(pos.x, pos.y), buildingId: RIVER_ID,
                ownerId: '-1', ownerName: 'Система', isConstructing: false,
                constructionEndTime: 0, type: 'default', workState: 'idle',
                hp: 9999, maxHp: 9999
            }, { $autoCancel: false }).catch(() => {})
        );
        if (batch.length >= BATCH) {
            await Promise.all(batch.splice(0));
        }
    }
    await Promise.all(batch);

    // --- Monsters ---
    const monsterTypes = [
        { id: KILLING_HUT_ID, name: 'Избушка-убийца' },
        { id: KIND_SANTA_ID, name: 'Добрый Санта' },
        { id: GORYNYCH_ID, name: 'Горыныч' },
    ];

    for (const mt of monsterTypes) {
        console.log(`  👹 ${mt.name}: ${MONSTERS_PER_TYPE}...`);
        batch = [];
        const hp = MONSTER_HP[mt.id] || 100;
        for (let i = 0; i < MONSTERS_PER_TYPE; i++) {
            const pos = tryPlace();
            if (!pos) continue;
            batch.push(
                pb.collection('buildings').create({
                    id: makeId(), x: pos.x, y: pos.y,
                    zoneId: getZoneId(pos.x, pos.y), buildingId: mt.id,
                    ownerId: 'monster', ownerName: 'Монстр', isConstructing: false,
                    constructionEndTime: 0, type: 'default', workState: 'idle',
                    hp, maxHp: hp,
                    lastMoveTime: Date.now(), isActive: true
                }, { $autoCancel: false }).catch(() => {})
            );
            if (batch.length >= BATCH) {
                await Promise.all(batch.splice(0));
                process.stdout.write(`    ${mt.name}: ${i + 1}/${MONSTERS_PER_TYPE}\r`);
            }
        }
        await Promise.all(batch);
        console.log(`    ✅ ${mt.name}: ${MONSTERS_PER_TYPE}`);
    }

    console.log(`  ✅ Здания готовы!`);
}

async function run() {
    console.log('🔐 Авторизация как администратор...');
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Авторизован!');

    // 1. Delete all map resources
    await deleteAll('map_resources');

    // 2. Delete system buildings (mountains, rivers, monsters)
    await deleteAll('buildings', `ownerId="-1" || ownerId="monster"`);

    // 3. Reset map state
    try {
        const states = await pb.collection('map_state').getFullList({ fields: 'id' });
        for (const s of states) await pb.collection('map_state').delete(s.id).catch(() => {});
        console.log(`\n🗺️  map_state очищен.`);
    } catch (e) {
        console.log('  (map_state уже пуст)');
    }

    // 4. Seed new resources
    await seedResources();

    // 5. Seed new buildings (mountains, rivers, monsters)
    await seedBuildings();

    // 6. Set map state as generated
    const seed = Math.floor(Math.random() * 1000000);
    try {
        await pb.collection('map_state').create({ id: 'status', generated: true, seed }, { $autoCancel: false });
    } catch (e) {
        // Try update if create fails (id exists)
        try {
            await pb.collection('map_state').update('status', { generated: true, seed });
        } catch (e2) {
            console.log('  ⚠️ Не удалось создать map_state, но это не критично.');
        }
    }

    console.log('\n🎉 Готово! Карта полностью пересоздана.');
    console.log(`   Карта: ${WORLD_W}×${WORLD_H}, зоны: ${ZONE_SIZE}×${ZONE_SIZE}`);
    console.log(`   Деревья: ${TREES_PER_ZONE} на сектор × ${ZONES_X * ZONES_Y} секторов = ${TREES_PER_ZONE * ZONES_X * ZONES_Y}`);
    console.log(`   Горы: ${MAX_MOUNTAINS}, Реки: ${MAX_RIVERS}`);
    console.log(`   Монстры: ${MONSTERS_PER_TYPE * 3} (${MONSTERS_PER_TYPE} каждого типа)`);
    console.log('   Постройки игроков сохранены.\n');
    process.exit(0);
}

run().catch(e => {
    console.error('❌ Ошибка:', e.message || e);
    process.exit(1);
});
