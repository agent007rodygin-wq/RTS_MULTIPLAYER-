const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function deleteDuplicateMonsters() {
  console.log('🔑 Authenticating...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) { console.error('Auth failed'); return; }
  console.log('✅ Authenticated');

  // Fetch all buildings
  let page = 1;
  let allRecords = [];
  while (true) {
    const res = await fetch(`${PB_URL}/api/collections/buildings/records?perPage=500&page=${page}`, {
      headers: { 'Authorization': token }
    });
    const data = await res.json();
    allRecords = allRecords.concat(data.items || []);
    if (page >= data.totalPages) break;
    page++;
  }

  // Find slot 2 monsters (ID pattern: m{typeId}s2z{zone})
  const monsterTypes = [70001, 70002, 70003, 70004, 70005];
  const duplicates = allRecords.filter(r => {
    const id = r.id || '';
    // Match pattern like m70001s2z0_0
    return monsterTypes.some(t => id.startsWith(`m${t}s2z`));
  });

  console.log(`Found ${duplicates.length} slot-2 duplicate monsters to delete`);

  let deleted = 0;
  for (const rec of duplicates) {
    try {
      const res = await fetch(`${PB_URL}/api/collections/buildings/records/${rec.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      if (res.ok) {
        deleted++;
        console.log(`Deleted: ${rec.id}`);
      } else {
        console.log(`Failed to delete ${rec.id}: ${res.status}`);
      }
    } catch (e) {
      console.error(`Error deleting ${rec.id}:`, e.message);
    }
  }

  console.log(`\n✅ Done! Deleted ${deleted}/${duplicates.length} duplicate monsters`);
}

deleteDuplicateMonsters().catch(console.error);

