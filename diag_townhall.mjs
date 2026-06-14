// Deep diagnostic for Town Hall explosion bug
import http from 'http';

const PB_HOST = '89.127.214.182';
const PB_PORT = 8090;

function pbRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: PB_HOST, port: PB_PORT, path, method,
      headers: { 'Content-Type': 'application/json', ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}) }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function getAll(token, filter) {
  const items = [];
  let page = 1;
  while (true) {
    const f = filter ? `&filter=${encodeURIComponent(filter)}` : '';
    const r = await pbRequest('GET', `/api/collections/buildings/records?page=${page}&perPage=200${f}`, null);
    if (!r.body.items) break;
    items.push(...r.body.items);
    if (items.length >= r.body.totalItems) break;
    page++;
  }
  return items;
}

async function main() {
  // Auth
  const auth = await pbRequest('POST', '/api/collections/_superusers/auth-with-password', {
    identity: 'admin@basingse.game', password: 'BaSingSe2024'
  });
  if (!auth.body.token) { console.error('AUTH FAILED', auth.body); return; }
  const token = auth.body.token;
  console.log('[AUTH] OK\n');

  // Get ALL buildings
  const all = await getAll(token);
  console.log(`=== ALL BUILDINGS: ${all.length} total ===\n`);

  // Town Halls (buildingId 301, 306, 312, 331, 345-355, 360, 361, 371, 381, etc.)
  const TOWN_HALL_IDS = [301,306,312,331,345,346,347,348,349,350,351,352,353,354,355,360,361,371,381,413,414,452,726,752];
  const townHalls = all.filter(b => TOWN_HALL_IDS.includes(Number(b.buildingId)));
  console.log(`=== TOWN HALLS: ${townHalls.length} ===`);
  townHalls.forEach(b => {
    const d = b.data || {};
    console.log(JSON.stringify({
      id: b.id,
      buildingId: b.buildingId,
      ownerId: b.ownerId,
      hp: b.hp,
      maxHp: b.maxHp,
      data_hp: d.hp,
      data_maxHp: d.maxHp,
      isDestroying: b.isDestroying,
      destructionEndTime: b.destructionEndTime,
      pendingDamage: b.pendingDamage,
      isConstructing: b.isConstructing,
      constructionEndTime: b.constructionEndTime,
      x: b.x,
      y: b.y
    }));
  });

  // Buildings with isDestroying=true
  const destroying = all.filter(b => b.isDestroying === true || b.isDestroying === 1 || b.isDestroying === 'true');
  console.log(`\n=== isDestroying=true: ${destroying.length} ===`);
  destroying.forEach(b => {
    const d = b.data || {};
    const now = Date.now();
    const endTime = b.destructionEndTime || (d.destructionEndTime);
    const overdue = endTime && now >= Number(endTime);
    console.log(JSON.stringify({
      id: b.id,
      buildingId: b.buildingId,
      ownerId: b.ownerId,
      hp: b.hp, maxHp: b.maxHp,
      data_hp: d.hp, data_maxHp: d.maxHp,
      destructionEndTime: endTime,
      pendingDamage: b.pendingDamage || d.pendingDamage,
      OVERDUE: overdue
    }));
  });

  // Buildings with hp=0 (player buildings only, not monsters)
  const MONSTER_IDS = [70001,70002,70003,70004,70005,70006];
  const deadPlayerBuildings = all.filter(b => !MONSTER_IDS.includes(Number(b.buildingId)) && b.hp === 0);
  console.log(`\n=== DEAD PLAYER BUILDINGS (hp=0): ${deadPlayerBuildings.length} ===`);
  deadPlayerBuildings.forEach(b => {
    const d = b.data || {};
    console.log(JSON.stringify({
      id: b.id,
      buildingId: b.buildingId,
      ownerId: b.ownerId,
      hp: b.hp, maxHp: b.maxHp,
      data_hp: d.hp, data_maxHp: d.maxHp,
      isDestroying: b.isDestroying,
      pendingDamage: b.pendingDamage
    }));
  });

  // Monsters stats
  const monsters = all.filter(b => MONSTER_IDS.includes(Number(b.buildingId)));
  const monstersDead = monsters.filter(b => b.hp <= 0);
  console.log(`\n=== MONSTERS: ${monsters.length} total, ${monstersDead.length} dead (hp<=0) ===`);
  
  // Check for any buildings with pendingDamage > 0
  const withPendingDamage = all.filter(b => {
    const pd = b.pendingDamage || (b.data && b.data.pendingDamage) || 0;
    return Number(pd) > 0;
  });
  console.log(`\n=== BUILDINGS WITH pendingDamage > 0: ${withPendingDamage.length} ===`);
  withPendingDamage.forEach(b => {
    const d = b.data || {};
    console.log(JSON.stringify({
      id: b.id, buildingId: b.buildingId, hp: b.hp,
      pendingDamage: b.pendingDamage, data_pendingDamage: d.pendingDamage,
      isDestroying: b.isDestroying
    }));
  });
}

main().catch(console.error);
