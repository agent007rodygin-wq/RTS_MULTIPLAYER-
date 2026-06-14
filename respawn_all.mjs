// =============================================================================
// FULL RESET: Delete all monsters + trees, then regenerate everything
// Monster HP values match buildings.ts exactly
// Trees reduced by 10% (270 per zone instead of 300)
// ZONE_SIZE = 40 (matches App.tsx)
// =============================================================================

const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40; // 40x40 tiles per zone = 200x200 total map

// Monster IDs (from App.tsx)
const KILLING_HUT_ID  = 70001;
const KIND_SANTA_ID   = 70002;
const GORYNYCH_ID     = 70003;
const KOLOBOK_ID      = 70004;
const BABA_YAGA_ID    = 70005;
const BRONEKUR_ID     = 70006;

// Monster config: type, count per zone, durability from buildings.ts
const MONSTER_CONFIG = [
  { typeId: KILLING_HUT_ID, count: 2, name: 'избушка',  hp: 5     },
  { typeId: KIND_SANTA_ID,  count: 2, name: 'санта',    hp: 13    },
  { typeId: GORYNYCH_ID,    count: 2, name: 'горыныч',  hp: 40    },
  { typeId: KOLOBOK_ID,     count: 2, name: 'колобок',  hp: 60    },
  { typeId: BABA_YAGA_ID,   count: 2, name: 'бабаяга',  hp: 80    },
];

const BOSS_CONFIG = {
  typeId: BRONEKUR_ID,
  name: 'бронекур',
  hp: 33768,
  totalCount: 1, // 1 boss on ENTIRE map (not per zone)
};

// Trees: 300 - 10% = 270 per zone
const TREES_PER_ZONE = 270;
const TREE_HP = 3;

// PocketBase requires exactly 15-char alphanumeric IDs
function sanitizePbId(raw) {
  let s = String(raw).replace(/[^a-zA-Z0-9]/g, 'z').toLowerCase();
  if (s.length > 15) s = s.substring(0, 15);
  while (s.length < 15) s += '0';
  return s;
}

function generateRandomId() {
  const base = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
  return base.replace(/[^a-zA-Z0-9]/g, '0').substring(0, 15).padEnd(15, '0');
}

async function authorize() {
  console.log('Authorizing...');
  const res = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const data = await res.json();
  if (!data.token) throw new Error('Auth failed: ' + JSON.stringify(data));
  console.log('Authorized!\n');
  return data.token;
}

// Fetch ALL records from a collection (handles pagination)
async function fetchAll(token, collection, filter = '') {
  const all = [];
  let page = 1;
  const perPage = 500;
  while (true) {
    const url = filter
      ? `${PB_URL}/api/collections/${collection}/records?filter=${encodeURIComponent(filter)}&perPage=${perPage}&page=${page}`
      : `${PB_URL}/api/collections/${collection}/records?perPage=${perPage}&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: token } });
    const data = await res.json();
    const items = data.items || [];
    all.push(...items);
    if (all.length >= (data.totalItems || 0)) break;
    page++;
  }
  return all;
}

// Delete records in batches with progress
async function deleteRecords(token, collection, filter, label) {
  console.log(`Deleting ${label}...`);
  let total = 0;
  while (true) {
    const url = `${PB_URL}/api/collections/${collection}/records?filter=${encodeURIComponent(filter)}&perPage=200&page=1`;
    const res = await fetch(url, { headers: { Authorization: token } });
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      try {
        await fetch(`${PB_URL}/api/collections/${collection}/records/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: token }
        });
        total++;
      } catch (e) {
        // ignore individual delete errors
      }
    }
    process.stdout.write(`  Deleted ${total}...\r`);
    await new Promise(r => setTimeout(r, 50));
  }
  console.log(`  ${label}: ${total} deleted`);
  return total;
}

async function createRecord(token, collection, body) {
  const res = await fetch(`${PB_URL}/api/collections/${collection}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify(body)
  });
  return res;
}

async function main() {
  const token = await authorize();

  // ==================== PHASE 1: DELETE ALL MONSTERS ====================
  console.log('=== PHASE 1: Deleting all monsters ===');
  
  // Delete by ownerId
  await deleteRecords(token, 'buildings', "(ownerId='monster'||ownerId='-1')", 'monsters by ownerId');
  
  // Also delete by buildingId (catch any strays)
  const monsterIds = [KILLING_HUT_ID, KIND_SANTA_ID, GORYNYCH_ID, KOLOBOK_ID, BABA_YAGA_ID, BRONEKUR_ID];
  const buildingIdFilter = monsterIds.map(id => `buildingId=${id}`).join('||');
  await deleteRecords(token, 'buildings', `(${buildingIdFilter})`, 'monsters by buildingId');

  // ==================== PHASE 2: DELETE ALL TREES ====================
  console.log('\n=== PHASE 2: Deleting all trees ===');
  await deleteRecords(token, 'map_resources', "type='tree'", 'trees');

  // ==================== PHASE 3: FETCH MAP STATE ====================
  console.log('\n=== PHASE 3: Loading map state ===');
  const [allBuildings, allResources] = await Promise.all([
    fetchAll(token, 'buildings'),
    fetchAll(token, 'map_resources')
  ]);
  console.log(`  Buildings: ${allBuildings.length}, Resources: ${allResources.length}`);

  // Build occupied set
  const occupied = new Set([
    ...allBuildings.filter(b => b.hp === undefined || b.hp > 0).map(b => `${b.x},${b.y}`),
    ...allResources.map(r => `${r.x},${r.y}`)
  ]);
  console.log(`  Occupied positions: ${occupied.size}`);

  // Helper: find free spot in zone
  const findFreeSpot = (zoneX, zoneY) => {
    const sx = zoneX * ZONE_SIZE;
    const sy = zoneY * ZONE_SIZE;
    for (let t = 0; t < 300; t++) {
      const x = sx + Math.floor(Math.random() * ZONE_SIZE);
      const y = sy + Math.floor(Math.random() * ZONE_SIZE);
      const key = `${x},${y}`;
      if (!occupied.has(key)) return { x, y };
    }
    return null;
  };

  // ==================== PHASE 4: SPAWN MONSTERS ====================
  console.log('\n=== PHASE 4: Spawning monsters ===');
  let monsterSpawned = 0;
  let monsterFailed = 0;

  for (let zX = 0; zX < ZONES_X; zX++) {
    for (let zY = 0; zY < ZONES_Y; zY++) {
      const zoneId = `${zX}_${zY}`;

      // Regular monsters
      for (const cfg of MONSTER_CONFIG) {
        for (let slot = 1; slot <= cfg.count; slot++) {
          const pos = findFreeSpot(zX, zY);
          if (!pos) { console.log(`  WARNING: Zone ${zoneId} full!`); continue; }

          const gameId = `m${cfg.typeId}s${slot}z${zoneId}`;
          const pbId = sanitizePbId(gameId);

          const res = await createRecord(token, 'buildings', {
            id: pbId,
            gameId: gameId,
            x: pos.x,
            y: pos.y,
            zoneId: zoneId,
            buildingId: cfg.typeId,
            ownerId: 'monster',
            ownerName: 'Монстр',
            isConstructing: false,
            constructionEndTime: 0,
            type: 'default',
            workState: 'idle',
            hp: cfg.hp,
            maxHp: cfg.hp,
            lastMoveTime: Date.now() - Math.floor(Math.random() * 10000),
            isActive: true,
            monsterType: cfg.name,
            monsterSlot: slot
          });

          if (res.ok) {
            occupied.add(`${pos.x},${pos.y}`);
            monsterSpawned++;
          } else {
            monsterFailed++;
            if (monsterFailed <= 5) {
              const err = await res.text();
              console.log(`  FAIL ${gameId}: ${err.substring(0, 120)}`);
            }
          }
        }
      }

      process.stdout.write(`  Zone ${zoneId}: ${monsterSpawned} spawned...\r`);
    }
  }

  // === BOSS: 1 Bronekur on ENTIRE map (random zone) ===
  {
    const bzX = Math.floor(Math.random() * ZONES_X);
    const bzY = Math.floor(Math.random() * ZONES_Y);
    const bossZoneId = `${bzX}_${bzY}`;
    const pos = findFreeSpot(bzX, bzY);
    if (pos) {
      const gameId = `m${BOSS_CONFIG.typeId}s1z${bossZoneId}`;
      const pbId = sanitizePbId(gameId);

      const res = await createRecord(token, 'buildings', {
        id: pbId,
        gameId: gameId,
        x: pos.x,
        y: pos.y,
        zoneId: bossZoneId,
        buildingId: BOSS_CONFIG.typeId,
        ownerId: 'monster',
        ownerName: 'Монстр',
        isConstructing: false,
        constructionEndTime: 0,
        type: 'default',
        workState: 'idle',
        hp: BOSS_CONFIG.hp,
        maxHp: BOSS_CONFIG.hp,
        lastMoveTime: Date.now(),
        isActive: true,
        monsterType: BOSS_CONFIG.name,
        monsterSlot: 1,
        isBoss: true
      });

      if (res.ok) {
        occupied.add(`${pos.x},${pos.y}`);
        monsterSpawned++;
        console.log(`  BOSS spawned in zone ${bossZoneId} at (${pos.x},${pos.y})`);
      } else {
        const err = await res.text();
        console.log(`  BOSS FAIL: ${err.substring(0, 120)}`);
      }
    } else {
      console.log('  WARNING: No space for boss!');
    }
  }

  const expectedMonsters = ZONES_X * ZONES_Y * MONSTER_CONFIG.reduce((s, c) => s + c.count, 0) + 1;
  console.log(`\n  Monsters: ${monsterSpawned} spawned, ${monsterFailed} failed (expected: ${expectedMonsters})`);

  // Boss chat notification
  try {
    await createRecord(token, 'chat_messages', {
      sender: '[СИСТЕМА]',
      senderId: 'system',
      text: `⚠️ ВНИМАНИЕ! На карте появился Бронекур - мощнейший босс! Все на защиту!`,
      type: 'system',
      timestamp: Date.now(),
      tab: 'general'
    });
  } catch { /* ignore */ }

  // ==================== PHASE 5: SPAWN TREES ====================
  console.log('\n=== PHASE 5: Spawning trees (270 per zone, -10%) ===');
  let treesSpawned = 0;
  let treesFailed = 0;

  for (let zX = 0; zX < ZONES_X; zX++) {
    for (let zY = 0; zY < ZONES_Y; zY++) {
      const zoneId = `${zX}_${zY}`;
      
      for (let i = 0; i < TREES_PER_ZONE; i++) {
        const pos = findFreeSpot(zX, zY);
        if (!pos) {
          console.log(`  WARNING: Zone ${zoneId} full, placed ${i} trees`);
          break;
        }

        const resourceId = generateRandomId();

        const res = await createRecord(token, 'map_resources', {
          id: resourceId,
          x: pos.x,
          y: pos.y,
          zoneId: zoneId,
          hp: TREE_HP,
          type: 'tree'
        });

        if (res.ok) {
          occupied.add(`${pos.x},${pos.y}`);
          treesSpawned++;
        } else {
          treesFailed++;
          if (treesFailed <= 3) {
            const err = await res.text();
            console.log(`  TREE FAIL: ${err.substring(0, 120)}`);
          }
        }
      }

      process.stdout.write(`  Zone ${zoneId}: ${treesSpawned} trees...\r`);
      // Small delay per zone to avoid overwhelming server
      await new Promise(r => setTimeout(r, 100));
    }
  }

  const expectedTrees = ZONES_X * ZONES_Y * TREES_PER_ZONE;
  console.log(`\n  Trees: ${treesSpawned} spawned, ${treesFailed} failed (expected: ${expectedTrees})`);

  // ==================== SUMMARY ====================
  console.log('\n========================================');
  console.log('            RESPAWN COMPLETE');
  console.log('========================================');
  console.log(`  Monsters: ${monsterSpawned} / ${expectedMonsters}`);
  console.log(`  Trees:    ${treesSpawned} / ${expectedTrees}`);
  console.log(`  Errors:   ${monsterFailed + treesFailed}`);
  console.log('========================================');
  console.log('\nMonster HP values (from buildings.ts):');
  for (const cfg of MONSTER_CONFIG) {
    console.log(`  ${cfg.name.padEnd(10)} (${cfg.typeId}): ${cfg.count}/zone, HP=${cfg.hp}`);
  }
  console.log(`  ${BOSS_CONFIG.name.padEnd(10)} (${BOSS_CONFIG.typeId}): 1/map, HP=${BOSS_CONFIG.hp}`);
  console.log(`\nTrees: ${TREES_PER_ZONE}/zone (was 300, reduced 10%)`);
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
