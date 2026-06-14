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
      workState: 'idle'
    },
    gameId: '1775180050474.3312'
  };

  try {
    const res = await pb.collection('buildings').create({ ...payload, id: '1775180050474z3' });
    console.log("Success:", res);
  } catch (e) {
    console.log("FAILED to create ID with Z:");
    console.dir(e, { depth: null });
  }
}

test();
