import PocketBase from 'pocketbase';

const pb = new PocketBase('http://89.127.214.182:8090');

async function check() {
  await pb.admins.authWithPassword('admin@basingse.game', 'BaSingSe2024');
  console.log('[AUTH] OK');

  // Check monsters
  const monsters = await pb.collection('buildings').getFullList({ 
    filter: 'type="monster"',
    fields: 'id,hp,maxHp,type,data,isDestroying,pendingDamage,ownerId,zoneId'
  });
  console.log('\n=== MONSTERS ===');
  console.log('TOTAL:', monsters.length);
  const dead = monsters.filter(m => m.hp <= 0);
  const dying = monsters.filter(m => m.isDestroying);
  const withPending = monsters.filter(m => m.pendingDamage > 0);
  const zeroMaxHp = monsters.filter(m => !m.maxHp || m.maxHp <= 0);
  console.log('DEAD hp<=0:', dead.length);
  console.log('isDestroying=true:', dying.length);
  console.log('pendingDamage>0:', withPending.length);
  console.log('maxHp<=0 or missing:', zeroMaxHp.length);

  if (dead.length > 0) {
    console.log('\nDEAD MONSTER SAMPLES (up to 5):');
    dead.slice(0, 5).forEach(m => {
      console.log(JSON.stringify({ id: m.id, hp: m.hp, maxHp: m.maxHp, isDestroying: m.isDestroying, pendingDamage: m.pendingDamage, data_hp: m.data?.hp, data_maxHp: m.data?.maxHp }));
    });
  }

  if (dying.length > 0) {
    console.log('\nisDESTROYING SAMPLES (up to 5):');
    dying.slice(0, 5).forEach(m => {
      console.log(JSON.stringify({ id: m.id, hp: m.hp, maxHp: m.maxHp, isDestroying: m.isDestroying, pendingDamage: m.pendingDamage, data_hp: m.data?.hp }));
    });
  }

  // Check buildings (non-monsters)
  const buildings = await pb.collection('buildings').getFullList({ 
    filter: 'type!="monster"',
    fields: 'id,hp,maxHp,type,data,isDestroying,pendingDamage,buildingId,isConstructing'
  });
  console.log('\n=== BUILDINGS ===');
  console.log('TOTAL:', buildings.length);
  const deadB = buildings.filter(b => b.hp <= 0 && b.type !== 'main_building');
  const mainB = buildings.filter(b => b.type === 'main_building');
  const dyingB = buildings.filter(b => b.isDestroying);
  console.log('Main buildings:', mainB.length);
  console.log('Non-main with hp<=0:', deadB.length);
  console.log('isDestroying=true:', dyingB.length);

  mainB.forEach(m => {
    console.log('\nMAIN BUILDING:', JSON.stringify({ id: m.id, hp: m.hp, maxHp: m.maxHp, isDestroying: m.isDestroying, pendingDamage: m.pendingDamage, data_hp: m.data?.hp, data_maxHp: m.data?.maxHp, isConstructing: m.isConstructing }));
  });

  // Check dropped_items (loot)
  const loot = await pb.collection('dropped_items').getFullList({ fields: 'id' });
  console.log('\n=== LOOT ===');
  console.log('TOTAL dropped_items:', loot.length);
}

check().catch(e => { console.error('FATAL:', e?.message || e); process.exit(1); });
