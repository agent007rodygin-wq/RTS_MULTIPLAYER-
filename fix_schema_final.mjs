// fix_schema_final.mjs — perfectly aligns PocketBase schema with game queries
const PB_URL = 'http://185.126.114.231:8090';

const SCHEMA_UPDATES = {
  buildings: [
    { name: 'ownerId', type: 'text' },
    { name: 'zoneId', type: 'text' },
  ],
  map_resources: [
    { name: 'zoneId', type: 'text' },
    { name: 'type', type: 'text' },
  ],
  dropped_items: [
    { name: 'zoneId', type: 'text' },
    { name: 'itemId', type: 'number' },
  ],
  chat_messages: [
    { name: 'channel', type: 'text' },
    { name: 'senderId', type: 'text' },
  ],
  presence: [
    { name: 'lastSeen', type: 'number' },
    { name: 'uid', type: 'text' },
    { name: 'isOnline', type: 'bool' },
  ],
  private_messages: [
    { name: 'participantIds', type: 'json' },
    { name: 'senderId', type: 'text' },
    { name: 'receiverId', type: 'text' },
  ],
  clans: [
    { name: 'name', type: 'text' },
    { name: 'leaderId', type: 'text' },
  ],
};

async function main() {
  console.log('⚡ Начинаю финальную настройку схем...');
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@basingse.game', password: 'BaSingSe2024' }),
  });
  const { token } = await authRes.json();

  const colsRes = await fetch(`${PB_URL}/api/collections`, { headers: { Authorization: token } });
  const collections = await colsRes.json();
  const items = collections.items || collections;

  for (const [colName, fields] of Object.entries(SCHEMA_UPDATES)) {
    const col = items.find(c => c.name === colName);
    if (!col) continue;

    let changed = false;
    const currentFields = col.fields || [];
    
    for (const field of fields) {
      if (!currentFields.find(f => f.name === field.name)) {
        currentFields.push({ name: field.name, type: field.type });
        changed = true;
      }
    }

    if (changed) {
      console.log(`🔧 Обновляю "${colName}"...`);
      await fetch(`${PB_URL}/api/collections/${col.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: token },
        body: JSON.stringify({ fields: currentFields }),
      });
    } else {
      console.log(`✅ "${colName}" уже в порядке.`);
    }
  }
  console.log('\n✨ Схемы базы данных полностью синхронизированы!');
}

main().catch(console.error);
