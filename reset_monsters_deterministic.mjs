const PB_URL = 'http://89.127.214.182:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40;

const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const GORYNYCH_ID = 70003;
const KOLOBOK_ID = 70004;
const BABA_YAGA_ID = 70005;
const BRONEKUR_ID = 70006;

const REGULAR_MONSTER_SPAWN_CONFIG = [
  { typeId: GORYNYCH_ID, count: 1, name: 'горыныч', durability: 40 },
  { typeId: KILLING_HUT_ID, count: 1, name: 'избушка', durability: 5 },
  { typeId: KIND_SANTA_ID, count: 1, name: 'санта', durability: 13 },
  { typeId: KOLOBOK_ID, count: 1, name: 'колобок', durability: 60 },
  { typeId: BABA_YAGA_ID, count: 1, name: 'баба яга', durability: 80 }
];

function sanitizePbId(id) {
  const strId = String(id);
  if (strId.length === 15 && /^[a-z0-9]+$/i.test(strId)) return strId;
  return strId.replace(/[^a-zA-Z0-9]/g, 'z').toLowerCase().padEnd(15, '0').substring(0, 15);
}

function getRegularMonsterPlanForZone(zoneX, zoneY) {
  const excludedIndex = ((zoneY * ZONES_X) + zoneX) % REGULAR_MONSTER_SPAWN_CONFIG.length;
  return REGULAR_MONSTER_SPAWN_CONFIG.filter((_, index) => index !== excludedIndex);
}

function getRegularMonsterId(typeId, slot, zoneId) {
  return `m${typeId}s${slot}z${zoneId}`;
}

function getBronekurHomeZoneId() {
  return `${Math.floor(ZONES_X / 2)}_${Math.floor(ZONES_Y / 2)}`;
}

function getBronekurMonsterId() {
  return `m${BRONEKUR_ID}s1z${getBronekurHomeZoneId()}`;
}

async function pbFetch(path, options = {}) {
  const res = await fetch(`${PB_URL}${path}`, options);
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`${res.status} ${path}: ${text.slice(0, 300)}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function authAdmin() {
  const data = await pbFetch('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  return data?.token;
}

async function getAllRecords(path, token) {
  const items = [];
  let page = 1;
  const perPage = 500;

  while (true) {
    const data = await pbFetch(`${path}${path.includes('?') ? '&' : '?'}page=${page}&perPage=${perPage}`, {
      headers: { Authorization: token }
    });
    const batch = data?.items || [];
    items.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return items;
}

async function main() {
  const token = await authAdmin();
  if (!token) throw new Error('Admin auth failed');

  console.log('[MonsterReset] Loading world snapshot...');
  const [allBuildings, allResources] = await Promise.all([
    getAllRecords('/api/collections/buildings/records?sort=id', token),
    getAllRecords('/api/collections/map_resources/records?sort=id', token)
  ]);

  const monsterIds = new Set([KILLING_HUT_ID, KIND_SANTA_ID, GORYNYCH_ID, KOLOBOK_ID, BABA_YAGA_ID, BRONEKUR_ID]);
  const liveWorldMonsters = allBuildings.filter(record =>
    monsterIds.has(Number(record.buildingId)) &&
    (record.ownerId === 'monster' || record.ownerId === '-1')
  );

  console.log(`[MonsterReset] Deleting ${liveWorldMonsters.length} existing world monsters...`);
  for (const monster of liveWorldMonsters) {
    await pbFetch(`/api/collections/buildings/records/${monster.id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
  }

  const staticBuildings = allBuildings.filter(record => !liveWorldMonsters.some(monster => monster.id === record.id));
  const occupied = new Set([
    ...staticBuildings.filter(record => record.hp === undefined || record.hp > 0).map(record => `${record.x},${record.y}`),
    ...allResources.map(record => `${record.x},${record.y}`)
  ]);

  const findFreeSpot = (zoneX, zoneY) => {
    const sx = zoneX * ZONE_SIZE;
    const sy = zoneY * ZONE_SIZE;
    for (let attempt = 0; attempt < 150; attempt++) {
      const x = sx + Math.floor(Math.random() * ZONE_SIZE);
      const y = sy + Math.floor(Math.random() * ZONE_SIZE);
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
    return null;
  };

  let spawned = 0;
  console.log('[MonsterReset] Spawning deterministic sector monsters...');
  for (let zX = 0; zX < ZONES_X; zX++) {
    for (let zY = 0; zY < ZONES_Y; zY++) {
      const zoneId = `${zX}_${zY}`;
      const zoneMonsters = getRegularMonsterPlanForZone(zX, zY);

      for (const cfg of zoneMonsters) {
        for (let slot = 1; slot <= cfg.count; slot++) {
          const gameId = getRegularMonsterId(cfg.typeId, slot, zoneId);
          const pbId = sanitizePbId(gameId);
          const pos = findFreeSpot(zX, zY);
          if (!pos) {
            console.log(`[MonsterReset] No free spot for ${gameId}`);
            continue;
          }

          await pbFetch('/api/collections/buildings/records', {
            method: 'POST',
            headers: {
              Authorization: token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: pbId,
              gameId,
              x: pos.x,
              y: pos.y,
              zoneId,
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
            })
          });

          occupied.add(`${pos.x},${pos.y}`);
          spawned++;
        }
      }
    }
  }

  const bossZoneId = getBronekurHomeZoneId();
  const [bossZoneX, bossZoneY] = bossZoneId.split('_').map(Number);
  const bossPos = findFreeSpot(bossZoneX, bossZoneY);
  if (!bossPos) {
    throw new Error(`No free spot for Bronekur in sector ${bossZoneId}`);
  }

  const bossGameId = getBronekurMonsterId();
  await pbFetch('/api/collections/buildings/records', {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: sanitizePbId(bossGameId),
      gameId: bossGameId,
      x: bossPos.x,
      y: bossPos.y,
      zoneId: bossZoneId,
      buildingId: BRONEKUR_ID,
      ownerId: 'monster',
      ownerName: 'Монстр',
      isConstructing: false,
      constructionEndTime: 0,
      type: 'default',
      workState: 'idle',
      hp: 33768,
      maxHp: 33768,
      lastMoveTime: Date.now(),
      isActive: true,
      monsterType: 'бронекур',
      monsterSlot: 1,
      isBoss: true
    })
  });
  spawned++;

  console.log(`[MonsterReset] Done. Spawned ${spawned} monsters total.`);
}

main().catch(err => {
  console.error('[MonsterReset] Failed:', err);
  process.exit(1);
});
