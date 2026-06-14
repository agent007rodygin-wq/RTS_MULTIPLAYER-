const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function list() {
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;

  // Get more records
  const res = await fetch(PB_URL + '/api/collections/buildings/records?perPage=500', {
    headers: { Authorization: token }
  });
  const data = await res.json();

  const types = {};
  data.items?.forEach(i => {
    types[i.buildingId] = (types[i.buildingId] || 0) + 1;
  });

  console.log('Building types in DB (sorted by count):');
  Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ID ${k}: ${v}`));

  // Check for any defense buildings
  const defenseIds = [700, 701, 702, 801, 363, 364, 365, 366, 367, 368, 369, 370, 382, 383, 384, 385];
  const defense = data.items?.filter(i => defenseIds.includes(Number(i.buildingId)));
  console.log('\nDefense buildings found:', defense?.length);
  defense?.forEach(c => console.log(`  ID ${c.buildingId} at (${c.x},${c.y}) HP=${c.hp} Owner=${c.ownerId}`));
}

list().catch(console.error);
