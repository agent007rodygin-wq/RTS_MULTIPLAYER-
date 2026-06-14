const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function diagnose() {
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const { token } = await authRes.json();

  // Check map_resources types
  const res = await fetch(PB_URL + '/api/collections/map_resources/records?perPage=200', {
    headers: { Authorization: token }
  });
  const data = await res.json();
  const grouped = {};
  (data.items || []).forEach(r => { grouped[r.type] = (grouped[r.type] || 0) + 1; });
  console.log('📦 map_resources types:', JSON.stringify(grouped, null, 2));

  // Check remaining buildings with unknown IDs (not known ones)
  const knownIds = ['1','5','7','26','70','301','306','312','331','345','346','347','50004','50005','70001','70002','70003','146','400'];
  const res2 = await fetch(PB_URL + '/api/collections/buildings/records?perPage=500', {
    headers: { Authorization: token }
  });
  const data2 = await res2.json();
  const unknownGrouped = {};
  (data2.items || []).forEach(r => {
    if (!knownIds.includes(String(r.buildingId))) {
      unknownGrouped[r.buildingId] = (unknownGrouped[r.buildingId] || 0) + 1;
    }
  });
  console.log('❓ Buildings with UNKNOWN buildingId:', JSON.stringify(unknownGrouped, null, 2));
  console.log(`Total buildings checked: ${data2.totalItems}`);
}

diagnose().catch(console.error);
