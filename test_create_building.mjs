import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function test() {
  await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');

  const payload = {
    x: 50,
    y: 50,
    zoneId: '25_14',
    ownerId: '177517711234567',
    buildingId: '1',
    data: {
      ownerName: "Игрок d",
      isConstructing: true,
      constructionEndTime: 1775180000000,
      type: "military",
      workState: 'idle',
      hp: 100,
      maxHp: 100,
      isActive: true,
      lastSaveTime: 1775180000000,
      isLocal: true
    },
    gameId: '1775180050474'
  };

  try {
    const res = await pb.collection('buildings').create({ ...payload, id: '177518005047400' });
    console.log("Success:", res);
  } catch (e) {
    console.dir(e, { depth: null });
  }
}

test();
