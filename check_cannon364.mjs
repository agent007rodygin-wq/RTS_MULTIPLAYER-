const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function check() {
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;

  // Check all cannon types
  for (const id of [363, 364, 365, 366, 367, 368, 369, 370, 382, 383, 384, 385]) {
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(buildingId=${id})&perPage=1`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    console.log(`Cannon ${id}: ${data.totalItems} found`);
  }

  // Check specifically cannon 364 details
  console.log('\n--- Cannon 364 details ---');
  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(buildingId=364)&perPage=10`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  console.log('Total:', data.totalItems);
  for (const item of data.items || []) {
    console.log({
      id: item.id,
      gameId: item.gameId,
      hp: item.hp,
      ownerId: item.ownerId,
      isDestroying: item.isDestroying,
      x: item.x,
      y: item.y
    });
  }
}

check().catch(console.error);
