import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function test() {
  try {
     // Try PocketBase 0.23+ superusers
     await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
     console.log('Authorized as superuser.');
  } catch (e) {
     console.log('Superuser Auth Error:', e?.response?.data || e.message);
  }
}

test().catch(console.log);
