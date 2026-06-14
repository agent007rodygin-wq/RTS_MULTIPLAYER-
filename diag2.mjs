import http from 'http';

const PB_HOST = '89.127.214.182';
const PB_PORT = '8090';

function req(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: PB_HOST, port: PB_PORT, path, method, headers: { 'Content-Type': 'application/json' } };
    if (token) opts.headers['Authorization'] = token;
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  // Auth
  const auth = await req('/api/collections/_superusers/auth-with-password', 'POST', { identity: 'admin@basingse.game', password: 'BaSingSe2024' });
  if (auth.status !== 200) { console.error('AUTH FAILED:', auth.status, JSON.stringify(auth.data)); process.exit(1); }
  const token = auth.data.token;
  console.log('[AUTH] OK');

  // Monsters - type field in data JSON for monsters, buildingId >= 70001
  const monBuildingIds = [70001, 70002, 70003, 70004, 70005, 70006];
  const monFilter = encodeURIComponent('(' + monBuildingIds.map(id => `buildingId="${id}"`).join('||') + ')');
  const monRes = await req(`/api/collections/buildings/records?filter=${monFilter}&perPage=500&fields=id,hp,maxHp,isDestroying,pendingDamage,buildingId,data`, 'GET', null, token);
  const monsters = monRes.data.items || [];
  console.log('\n=== MONSTERS (by buildingId 70001-70006) ===');
  console.log('TOTAL:', monsters.length);
  const dead = monsters.filter(m => m.hp <= 0);
  const dying = monsters.filter(m => m.isDestroying);
  const pd = monsters.filter(m => m.pendingDamage > 0);
  const noMaxHp = monsters.filter(m => !m.maxHp || m.maxHp <= 0);
  console.log('hp<=0:', dead.length);
  console.log('isDestroying=true:', dying.length);
  console.log('pendingDamage>0:', pd.length);
  console.log('maxHp<=0:', noMaxHp.length);
  if (dead.length > 0) { console.log('DEAD SAMPLES:'); dead.slice(0,5).forEach(m => console.log(JSON.stringify({id:m.id,hp:m.hp,maxHp:m.maxHp,isDestroying:m.isDestroying,pendingDamage:m.pendingDamage,data_hp:m.data?.hp,data_maxHp:m.data?.maxHp}))); }
  if (dying.length > 0) { console.log('DYING SAMPLES:'); dying.slice(0,5).forEach(m => console.log(JSON.stringify({id:m.id,hp:m.hp,maxHp:m.maxHp,isDestroying:m.isDestroying,pd:m.pendingDamage,data_hp:m.data?.hp}))); }

  // All buildings
  const allRes = await req('/api/collections/buildings/records?perPage=500&fields=id,hp,maxHp,type,buildingId,isDestroying,pendingDamage,isConstructing,data', 'GET', null, token);
  const allB = allRes.data.items || [];
  console.log('\n=== ALL BUILDINGS ===');
  console.log('TOTAL:', allB.length);
  const mainB = allB.filter(b => b.type === 'main_building');
  const deadB = allB.filter(b => b.hp <= 0);
  const dyingB = allB.filter(b => b.isDestroying);
  console.log('main_building count:', mainB.length);
  console.log('hp<=0:', deadB.length);
  console.log('isDestroying:', dyingB.length);
  mainB.forEach(m => console.log('MAIN BUILDING:', JSON.stringify({id:m.id,hp:m.hp,maxHp:m.maxHp,isDestroying:m.isDestroying,pd:m.pendingDamage,data_hp:m.data?.hp,data_maxHp:m.data?.maxHp,isConstructing:m.isConstructing})));
  if (deadB.length > 0) { console.log('DEAD BUILDINGS:'); deadB.slice(0,5).forEach(b => console.log(JSON.stringify({id:b.id,type:b.type,bid:b.buildingId,hp:b.hp,maxHp:b.maxHp,isDestroying:b.isDestroying,data_hp:b.data?.hp}))); }

  // Loot
  const lootRes = await req('/api/collections/dropped_items/records?perPage=1&fields=id', 'GET', null, token);
  console.log('\n=== LOOT ===');
  console.log('TOTAL dropped_items:', lootRes.data.totalItems);
}

main().catch(e => { console.error('FATAL:', e.message || e); process.exit(1); });
