// Fixed monster respawn - uses gameId field + lets PB auto-generate record IDs
const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

const ZONES_X = 5, ZONES_Y = 5, ZONE_SIZE = 20;
const GORYNYCH_ID = 70003, KILLING_HUT_ID = 70001, KIND_SANTA_ID = 70002;
const KOLOBOK_ID = 70004, BABA_YAGA_ID = 70005, BRONEKUR_ID = 70006;

const monsterConfig = [
  { typeId: GORYNYCH_ID, count: 2, name: 'горыныч', durability: 150 },
  { typeId: KILLING_HUT_ID, count: 2, name: 'избушка', durability: 200 },
  { typeId: KIND_SANTA_ID, count: 2, name: 'санта', durability: 120 },
  { typeId: KOLOBOK_ID, count: 2, name: 'колобок', durability: 80 },
  { typeId: BABA_YAGA_ID, count: 2, name: 'бабаяга', durability: 180 }
];

// Replicate sanitizePbId from pocketbase.ts - must be exactly 15 chars, alphanumeric
function sanitizePbId(raw) {
  let s = String(raw).replace(/[^a-zA-Z0-9]/g, 'z');
  if (s.length > 15) s = s.substring(0, 15);
  while (s.length < 15) s += '0';
  return s;
}

async function respawnMonsters() {
  console.log('=== MONSTER RESPAWN (FIXED) ===\n');

  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const token = (await authRes.json()).token;
  if (!token) { console.error('Auth failed'); return; }
  console.log('Authorized!\n');

  // Delete ALL existing monsters
  console.log('Deleting old monsters...');
  const monsterTypeIds = [GORYNYCH_ID, KILLING_HUT_ID, KIND_SANTA_ID, KOLOBOK_ID, BABA_YAGA_ID, BRONEKUR_ID];
  const filter = monsterTypeIds.map(id => `buildingId=${id}`).join('||');
  let deleted = 0;
  while (true) {
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(${filter})&perPage=200`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    if (!data.items || data.items.length === 0) break;
    for (const item of data.items) {
      await fetch(PB_URL + `/api/collections/buildings/records/${item.id}`, {
        method: 'DELETE', headers: { Authorization: token }
      });
      deleted++;
    }
    console.log(`  Deleted ${deleted}...`);
  }
  // Also delete by ownerId=monster
  while (true) {
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster')&perPage=200`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    if (!data.items || data.items.length === 0) break;
    for (const item of data.items) {
      await fetch(PB_URL + `/api/collections/buildings/records/${item.id}`, {
        method: 'DELETE', headers: { Authorization: token }
      });
      deleted++;
    }
  }
  console.log(`Total deleted: ${deleted}\n`);

  // Fetch map state
  const [bRes, rRes] = await Promise.all([
    fetch(PB_URL + '/api/collections/buildings/records?perPage=2000', { headers: { Authorization: token } }),
    fetch(PB_URL + '/api/collections/resources/records?perPage=2000', { headers: { Authorization: token } })
  ]);
  const allBuildings = (await bRes.json()).items || [];
  const allResources = (await rRes.json()).items || [];
  console.log(`Map: ${allBuildings.length} buildings, ${allResources.length} resources\n`);

  const occupied = new Set([
    ...allBuildings.filter(b => b.hp === undefined || b.hp > 0).map(b => `${b.x},${b.y}`),
    ...allResources.map(r => `${r.x},${r.y}`)
  ]);

  const findFreeSpot = (zX, zY) => {
    const sx = zX * ZONE_SIZE, sy = zY * ZONE_SIZE;
    for (let t = 0; t < 100; t++) {
      const x = sx + Math.floor(Math.random() * ZONE_SIZE);
      const y = sy + Math.floor(Math.random() * ZONE_SIZE);
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
    return null;
  };

  // Spawn monsters
  let spawned = 0, errors = 0;
  console.log('Spawning monsters...');
  
  for (let zX = 0; zX < ZONES_X; zX++) {
    for (let zY = 0; zY < ZONES_Y; zY++) {
      const zoneId = `${zX}_${zY}`;
      for (const cfg of monsterConfig) {
        for (let slot = 1; slot <= cfg.count; slot++) {
          const gameId = `m${cfg.typeId}s${slot}z${zoneId}`;
          const pbId = sanitizePbId(gameId);
          const pos = findFreeSpot(zX, zY);
          if (!pos) continue;

          const body = {
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
            hp: cfg.durability,
            maxHp: cfg.durability,
            lastMoveTime: Date.now(),
            isActive: true,
            monsterType: cfg.name,
            monsterSlot: slot
          };

          const res = await fetch(PB_URL + '/api/collections/buildings/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: token },
            body: JSON.stringify(body)
          });
          
          if (res.ok) {
            occupied.add(`${pos.x},${pos.y}`);
            spawned++;
          } else {
            const err = await res.text();
            if (errors < 5) console.error(`  FAIL ${gameId} (pbId=${pbId}): ${err}`);
            errors++;
          }
        }
      }
    }
  }
  console.log(`Regular monsters: ${spawned} spawned, ${errors} errors\n`);

  // Boss Bronekur
  console.log('Spawning Bronekur boss...');
  const bzX = Math.floor(Math.random() * ZONES_X);
  const bzY = Math.floor(Math.random() * ZONES_Y);
  const bossZoneId = `${bzX}_${bzY}`;
  const pos = findFreeSpot(bzX, bzY);
  if (pos) {
    const bossGameId = `m${BRONEKUR_ID}s1z${bossZoneId}`;
    const bossPbId = sanitizePbId(bossGameId);
    const res = await fetch(PB_URL + '/api/collections/buildings/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({
        id: bossPbId,
        gameId: bossGameId,
        x: pos.x, y: pos.y,
        zoneId: bossZoneId,
        buildingId: BRONEKUR_ID,
        ownerId: 'monster', ownerName: 'Монстр',
        isConstructing: false, constructionEndTime: 0,
        type: 'default', workState: 'idle',
        hp: 500, maxHp: 500,
        lastMoveTime: Date.now(), isActive: true,
        monsterType: 'бронекур', monsterSlot: 1, isBoss: true
      })
    });
    if (res.ok) {
      console.log(`  Boss at (${pos.x},${pos.y}) sector ${bzX}.${bzY}`);
      // Chat notification
      await fetch(PB_URL + '/api/collections/chat_messages/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({
          sender: '[СИСТЕМА]', senderId: 'system',
          text: `⚠️ ВНИМАНИЕ! В секторе ${bzX}.${bzY} появился Бронекур!`,
          type: 'system', timestamp: Date.now(), tab: 'general'
        })
      });
    } else {
      console.error('  Boss FAILED:', await res.text());
    }
  }

  console.log('\n=== DONE ===');
}

respawnMonsters().catch(console.error);
