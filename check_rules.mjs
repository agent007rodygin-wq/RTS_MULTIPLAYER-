import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function getRules() {
  await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
  const collection = await pb.collections.getOne('buildings');
  console.log("Buildings rules:", {
    listRule: collection.listRule,
    viewRule: collection.viewRule,
    createRule: collection.createRule,
    updateRule: collection.updateRule,
    deleteRule: collection.deleteRule,
  });
}

getRules().catch(console.error);
