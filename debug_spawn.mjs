const PB_URL = 'http://185.126.114.231:8090';
async function debug() {
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@basingse.game', password: 'BaSingSe2024' })
  });
  const token = (await authRes.json()).token;

  // Try creating one test monster
  const testId = 'testmonster0001';
  const body = {
    id: testId,
    gameId: 'test-monster-1',
    x: 50, y: 50,
    zoneId: '2_2',
    buildingId: 70003,
    ownerId: 'monster',
    ownerName: 'Монстр',
    isConstructing: false,
    constructionEndTime: 0,
    type: 'default',
    workState: 'idle',
    hp: 150, maxHp: 150,
    lastMoveTime: Date.now(),
    isActive: true,
    monsterType: 'горыныч',
    monsterSlot: 1
  };

  console.log('Creating test monster...');
  const res = await fetch(PB_URL + '/api/collections/buildings/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify(body)
  });
  console.log('Status:', res.status);
  const responseBody = await res.text();
  console.log('Response:', responseBody);

  // Now try to read it back
  console.log('\nReading back...');
  const readRes = await fetch(PB_URL + `/api/collections/buildings/records/${testId}`, {
    headers: { Authorization: token }
  });
  console.log('Read status:', readRes.status);
  const readBody = await readRes.text();
  console.log('Read response:', readBody.substring(0, 500));

  // Check with ownerId filter
  console.log('\nFilter by ownerId=monster...');
  const filterRes = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster')&perPage=5`, {
    headers: { Authorization: token }
  });
  const filterData = await filterRes.json();
  console.log('Found:', filterData.totalItems);

  // Check total records  
  console.log('\nTotal records in buildings collection:');
  const totalRes = await fetch(PB_URL + `/api/collections/buildings/records?perPage=1`, {
    headers: { Authorization: token }
  });
  const totalData = await totalRes.json();
  console.log('Total:', totalData.totalItems);

  // Cleanup test
  await fetch(PB_URL + `/api/collections/buildings/records/${testId}`, {
    method: 'DELETE', headers: { Authorization: token }
  });
  console.log('\nTest monster cleaned up');
}
debug().catch(console.error);
