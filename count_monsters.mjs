const PB_URL = 'http://185.126.114.231:8090';
async function check() {
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@basingse.game', password: 'BaSingSe2024' })
  });
  const token = (await authRes.json()).token;

  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  console.log('Total monsters:', data.totalItems);

  // Count by type
  const res2 = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=500`, {
    headers: { Authorization: token }
  });
  const data2 = await res2.json();
  const byType = {};
  for (const m of data2.items || []) {
    byType[m.buildingId] = (byType[m.buildingId] || 0) + 1;
  }
  console.log('By type:', byType);
  
  // Count per zone for one type
  const byZone = {};
  for (const m of data2.items || []) {
    const key = `${m.buildingId}_${m.zoneId}`;
    byZone[key] = (byZone[key] || 0) + 1;
  }
  // Find zones with more than 2 of same type
  const overStocked = Object.entries(byZone).filter(([k, v]) => v > 2);
  if (overStocked.length > 0) {
    console.log('\nZones with >2 of same type:', overStocked.slice(0, 10));
  }
}
check().catch(console.error);
