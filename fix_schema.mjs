// fix_schema.mjs — adds all missing fields to PocketBase collections
const PB_URL = 'http://185.126.114.231:8090';

// Fields that each collection MUST have for the game queries to work
const REQUIRED_FIELDS = {
  buildings: [
    { name: 'ownerId', type: 'text' },
    { name: 'zoneId', type: 'text' },
    { name: 'buildingId', type: 'number' },
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' },
    { name: 'level', type: 'number' },
    { name: 'hp', type: 'number' },
    { name: 'maxHp', type: 'number' },
    { name: 'population', type: 'number' },
    { name: 'name', type: 'text' },
    { name: 'lastCollected', type: 'number' },
    { name: 'inventory', type: 'json' },
    { name: 'config', type: 'json' },
    { name: 'isLocal', type: 'bool' },
    { name: 'timestamp', type: 'number' },
    { name: 'gameId', type: 'text' },
  ],
  chat_messages: [
    { name: 'senderId', type: 'text' },
    { name: 'senderName', type: 'text' },
    { name: 'text', type: 'text' },
    { name: 'timestamp', type: 'number' },
    { name: 'channel', type: 'text' },
    { name: 'displayName', type: 'text' },
    { name: 'gameId', type: 'text' },
  ],
  presence: [
    { name: 'displayName', type: 'text' },
    { name: 'lastSeen', type: 'number' },
    { name: 'isOnline', type: 'bool' },
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' },
    { name: 'level', type: 'number' },
    { name: 'clanName', type: 'text' },
    { name: 'gameId', type: 'text' },
  ],
  clans: [
    { name: 'name', type: 'text' },
    { name: 'leaderId', type: 'text' },
    { name: 'members', type: 'json' },
    { name: 'description', type: 'text' },
    { name: 'gameId', type: 'text' },
  ],
  market: [
    { name: 'sellerId', type: 'text' },
    { name: 'sellerName', type: 'text' },
    { name: 'itemId', type: 'number' },
    { name: 'itemName', type: 'text' },
    { name: 'quantity', type: 'number' },
    { name: 'price', type: 'number' },
    { name: 'timestamp', type: 'number' },
    { name: 'gameId', type: 'text' },
  ],
  map_resources: [
    { name: 'type', type: 'text' },
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' },
    { name: 'amount', type: 'number' },
    { name: 'zoneId', type: 'text' },
    { name: 'gameId', type: 'text' },
  ],
  dropped_items: [
    { name: 'itemId', type: 'number' },
    { name: 'x', type: 'number' },
    { name: 'y', type: 'number' },
    { name: 'quantity', type: 'number' },
    { name: 'droppedBy', type: 'text' },
    { name: 'timestamp', type: 'number' },
    { name: 'gameId', type: 'text' },
  ],
  map_state: [
    { name: 'data', type: 'json' },
    { name: 'gameId', type: 'text' },
  ],
  private_messages: [
    { name: 'senderId', type: 'text' },
    { name: 'receiverId', type: 'text' },
    { name: 'text', type: 'text' },
    { name: 'timestamp', type: 'number' },
    { name: 'senderName', type: 'text' },
    { name: 'gameId', type: 'text' },
  ],
};

async function main() {
  // 1. Auth as superuser
  console.log('🔐 Авторизация...');
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@basingse.game', password: 'BaSingSe2024' }),
  });
  if (!authRes.ok) {
    console.error('Ошибка авторизации:', await authRes.text());
    return;
  }
  const authData = await authRes.json();
  const token = authData.token;
  console.log('✅ Авторизация успешна!');

  // 2. Get all collections
  const colsRes = await fetch(`${PB_URL}/api/collections`, {
    headers: { Authorization: token },
  });
  const colsData = await colsRes.json();
  const collections = colsData.items || colsData;

  // 3. For each collection that needs fixing
  for (const [colName, requiredFields] of Object.entries(REQUIRED_FIELDS)) {
    const col = collections.find((c) => c.name === colName);
    if (!col) {
      console.log(`⚠️  Коллекция "${colName}" не найдена, пропускаю.`);
      continue;
    }

    const existingFields = (col.fields || col.schema || []).map((f) => f.name);
    const missingFields = requiredFields.filter((f) => !existingFields.includes(f.name));

    if (missingFields.length === 0) {
      console.log(`✅ "${colName}" — все поля на месте.`);
      continue;
    }

    console.log(`🔧 "${colName}" — добавляю ${missingFields.length} полей: ${missingFields.map(f => f.name).join(', ')}`);

    const updatedFields = [...(col.fields || col.schema || [])];
    for (const field of missingFields) {
      updatedFields.push({ name: field.name, type: field.type, required: false });
    }

    const updateRes = await fetch(`${PB_URL}/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({ fields: updatedFields }),
    });

    if (updateRes.ok) {
      console.log(`   ✅ "${colName}" обновлена успешно!`);
    } else {
      const err = await updateRes.text();
      console.error(`   ❌ Ошибка обновления "${colName}":`, err);
    }
  }

  console.log('\n🎉 Готово! Все схемы обновлены.');
}

main().catch(console.error);
