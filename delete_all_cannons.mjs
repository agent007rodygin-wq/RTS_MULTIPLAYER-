// Delete ALL cannons/towers from the map
// Cannon IDs: 700,701,365,366,367,368,369,370,382,383,384,385 + tower 702 + watchtower 801
const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

const CANNON_BUILDING_IDS = [700, 701, 365, 366, 367, 368, 369, 370, 382, 383, 384, 385, 702, 801];

async function deleteAllCannons() {
  console.log('Authorizing...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) { console.error('Auth failed'); return; }
  console.log('Authorized!');

  const filterParts = CANNON_BUILDING_IDS.map(id => `buildingId=${id}`).join('||');
  let totalDeleted = 0;

  while (true) {
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(${filterParts})&perPage=200&page=1`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) break;

    console.log(`Deleting batch of ${items.length} cannons/towers...`);
    for (const item of items) {
      try {
        await fetch(PB_URL + `/api/collections/buildings/records/${item.id}`, {
          method: 'DELETE', headers: { Authorization: token }
        });
        totalDeleted++;
      } catch (e) {
        console.error(`Failed to delete ${item.id}:`, e.message);
      }
    }
    console.log(`Deleted so far: ${totalDeleted}`);
    if (data.totalItems <= 0) break;
  }

  console.log(`\nDone! Total cannons/towers deleted: ${totalDeleted}`);
}

deleteAllCannons().catch(console.error);
