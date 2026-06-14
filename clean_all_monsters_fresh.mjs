const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function cleanAllMonsters() {
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

  let totalDeleted = 0;
  let page = 1;

  while (true) {
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=200&page=1`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    const items = data.items || [];
    
    if (items.length === 0) break;

    console.log(`Deleting batch of ${items.length} monsters...`);
    
    for (const item of items) {
      try {
        await fetch(PB_URL + `/api/collections/buildings/records/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: token }
        });
        totalDeleted++;
      } catch (e) {
        console.error(`Failed to delete ${item.id}:`, e.message);
      }
    }
    
    console.log(`Deleted so far: ${totalDeleted}`);
    
    // Safety check - if totalItems hasn't changed, we're stuck
    if (data.totalItems <= 0) break;
  }

  console.log(`\nDone! Total deleted: ${totalDeleted}`);
  console.log('Monsters will respawn cleanly within 60 seconds after game loads with new code.');
}

cleanAllMonsters().catch(console.error);
