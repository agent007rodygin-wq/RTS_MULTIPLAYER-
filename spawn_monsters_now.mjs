// Manual monster spawn script - runs immediately without waiting for game trigger
const PB_URL_CANDIDATES = [
  process.env.PB_URL,
  'http://185.126.114.231:8090',
  'http://89.127.214.182:8090'
].filter(Boolean);
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40;

const GORYNYCH_ID = 70003;
const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const KOLOBOK_ID = 70004;
const BABA_YAGA_ID = 70005;
const BRONEKUR_ID = 70006;

const monsterConfig = [
  { typeId: GORYNYCH_ID, count: 2, name: 'gorynych', durability: 150 },
  { typeId: KILLING_HUT_ID, count: 2, name: 'izbushka', durability: 200 },
  { typeId: KIND_SANTA_ID, count: 2, name: 'santa', durability: 120 },
  { typeId: KOLOBOK_ID, count: 2, name: 'kolobok', durability: 80 },
  { typeId: BABA_YAGA_ID, count: 2, name: 'baba_yaga', durability: 180 }
];

function sanitizePbId(raw) {
  let s = String(raw).replace(/[^a-zA-Z0-9]/g, 'z').toLowerCase();
  if (s.length > 15) s = s.substring(0, 15);
  while (s.length < 15) s += '0';
  return s;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastError;
}

async function resolvePocketBaseUrl() {
  for (const baseUrl of PB_URL_CANDIDATES) {
    try {
      const res = await fetchWithRetry(baseUrl + '/api/health', { method: 'GET' }, 2);
      if (res.ok) return baseUrl;
    } catch (_) {
      // try next
    }
  }
  throw new Error(`PocketBase unavailable at: ${PB_URL_CANDIDATES.join(', ')}`);
}

async function spawnMonsters() {
  console.log('Authorizing...');
  const PB_URL = await resolvePocketBaseUrl();
  console.log(`Using server: ${PB_URL}`);

  const authRes = await fetchWithRetry(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  }, 3);
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) { console.error('Auth failed'); return; }
  console.log('Authorized!');

  console.log('Fetching existing buildings...');
  const buildingsRes = await fetchWithRetry(PB_URL + '/api/collections/buildings/records?perPage=1000', {
    headers: { Authorization: token }
  }, 3);
  const buildingsData = await buildingsRes.json();
  const allBuildings = buildingsData.items || [];

  const resourcesRes = await fetchWithRetry(PB_URL + '/api/collections/map_resources/records?perPage=1000', {
    headers: { Authorization: token }
  }, 3);
  const resourcesData = await resourcesRes.json();
  const allResources = resourcesData.items || [];

  const occupied = new Set([
    ...allBuildings.filter(b => b.hp === undefined || b.hp > 0).map(b => `${b.x},${b.y}`),
    ...allResources.map(r => `${r.x},${r.y}`)
  ]);

  const findFreeSpot = (zoneX, zoneY) => {
    const sx = zoneX * ZONE_SIZE;
    const sy = zoneY * ZONE_SIZE;
    for (let t = 0; t < 100; t++) {
      const x = sx + Math.floor(Math.random() * ZONE_SIZE);
      const y = sy + Math.floor(Math.random() * ZONE_SIZE);
      if (!occupied.has(`${x},${y}`)) return {x, y};
    }
    return null;
  };

  let spawned = 0;

  for (let zX = 0; zX < ZONES_X; zX++) {
    for (let zY = 0; zY < ZONES_Y; zY++) {
      const zoneId = `${zX}_${zY}`;
      for (const cfg of monsterConfig) {
        const existing = allBuildings.filter(b =>
          b.buildingId === cfg.typeId &&
          (b.ownerId === '-1' || b.ownerId === 'monster') &&
          b.zoneId === zoneId &&
          (b.hp === undefined || b.hp > 0)
        );
        if (existing.length >= cfg.count) continue;

        for (let i = 0; i < cfg.count - existing.length; i++) {
          const slot = existing.length + i + 1;
          const monsterId = `m${cfg.typeId}s${slot}z${zoneId}`;
          if (allBuildings.some(b => b.id === monsterId)) continue;

          const pos = findFreeSpot(zX, zY);
          if (!pos) break;

          const newMonster = {
            id: sanitizePbId(monsterId),
            gameId: monsterId,
            x: pos.x,
            y: pos.y,
            zoneId: zoneId,
            buildingId: cfg.typeId,
            ownerId: 'monster',
            ownerName: 'Monster',
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

          try {
            const res = await fetchWithRetry(PB_URL + '/api/collections/buildings/records', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: token
              },
              body: JSON.stringify(newMonster)
            }, 3);
            if (res.ok) {
              occupied.add(`${pos.x},${pos.y}`);
              spawned++;
            }
          } catch (_) {}
        }
      }
    }
  }

  const hasBronekur = allBuildings.some(b =>
    b.buildingId === BRONEKUR_ID &&
    (b.ownerId === '-1' || b.ownerId === 'monster') &&
    (b.hp === undefined || b.hp > 0)
  );

  if (!hasBronekur) {
    const bzX = Math.floor(Math.random() * ZONES_X);
    const bzY = Math.floor(Math.random() * ZONES_Y);
    const bossZoneId = `${bzX}_${bzY}`;
    const pos = findFreeSpot(bzX, bzY);

    if (pos) {
      const bossMonsterId = `m${BRONEKUR_ID}s1z${bossZoneId}`;
      const bossMonster = {
        id: sanitizePbId(bossMonsterId),
        gameId: bossMonsterId,
        x: pos.x,
        y: pos.y,
        zoneId: bossZoneId,
        buildingId: BRONEKUR_ID,
        ownerId: 'monster',
        ownerName: 'Monster',
        isConstructing: false,
        constructionEndTime: 0,
        type: 'default',
        workState: 'idle',
        hp: 500,
        maxHp: 500,
        lastMoveTime: Date.now(),
        isActive: true,
        monsterType: 'bronekur',
        monsterSlot: 1,
        isBoss: true
      };
      try {
        const res = await fetchWithRetry(PB_URL + '/api/collections/buildings/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify(bossMonster)
        }, 3);
        if (res.ok) spawned++;
      } catch (_) {}
    }
  }

  console.log(`Spawn completed. Created: ${spawned}`);
}

spawnMonsters().catch(console.error);
