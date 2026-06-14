const PB_URL = 'http://185.126.114.231:8090';
async function check() {
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@basingse.game', password: 'BaSingSe2024' })
  });
  const token = (await authRes.json()).token;
  
  const monsterIds = [70001, 70002, 70003, 70004, 70005, 70006];
  const filter = monsterIds.map(id => `buildingId=${id}`).join('||');
  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(${filter})&perPage=10`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  console.log('Total monsters in DB:', data.totalItems);
  console.log('Sample:', data.items?.slice(0, 5).map(i => ({
    id: i.id, gameId: i.gameId, bid: i.buildingId, hp: i.hp, x: i.x, y: i.y, zone: i.zoneId, owner: i.ownerId
  })));
}
check().catch(console.error);
