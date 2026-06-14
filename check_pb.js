import PocketBase from 'pocketbase';
import fs from 'fs';

const pb = new PocketBase('http://185.126.114.231:8090');

async function test() {
  await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
  const cols = await pb.collections.getFullList();
  
  let out = '';
  for (const c of cols) {
    if (c.name.startsWith('_')) continue;
    const records = await pb.collection(c.name).getList(1, 1);
    out += `Collection ${c.name}: ${records.totalItems} records\n`;
  }
  fs.writeFileSync('pb_stats.txt', out);
}

test().catch(console.log);
