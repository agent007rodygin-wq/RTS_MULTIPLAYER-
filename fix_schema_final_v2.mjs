import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

const SCHEMA_UPDATES = {
  buildings: [
    { name: 'ownerId', type: 'text' },
    { name: 'zoneId', type: 'text' },
    { name: 'buildingId', type: 'text' },
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
  users: [], // Adding users collection to unlock it too
};

async function main() {
  console.log('🔐 Авторизация...');
  await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
  console.log('✅ Авторизация успешна!');

  const collections = await pb.collections.getFullList();

  for (const [colName, fieldsToadd] of Object.entries(SCHEMA_UPDATES)) {
    const col = collections.find(c => c.name === colName);
    if (!col) {
      console.log(`⚠️ Коллекция "${colName}" не найдена.`);
      continue;
    }

    console.log(`\n📦 Проверяю "${colName}"...`);
    const existingFields = col.fields || [];
    let hasChanges = false;

    for (const newField of fieldsToadd) {
      if (!existingFields.find(f => f.name === newField.name)) {
        console.log(`   ➕ Добавляю поле: ${newField.name} (${newField.type})`);
        existingFields.push({
          name: newField.name,
          type: newField.type,
          required: false,
          presentable: false,
          unique: false,
        });
        hasChanges = true;
      }
    }

    if (hasChanges || !col.listRule || !col.viewRule) {
      try {
        await pb.collections.update(col.id, {
          fields: existingFields,
          listRule: "",
          viewRule: "",
          createRule: col.createRule || "", // Ensure users can create if they need to
          updateRule: col.updateRule || "", // Ensure update is allowed if it was before
        });
        console.log(`   ✅ "${colName}" успешно обновлена и открыта для доступа!`);
      } catch (err) {
        console.error(`   ❌ Ошибка при обновлении "${colName}":`, err.data || err.message);
      }
    } else {
      console.log(`   ✅ Все поля и права доступа уже на месте.`);
    }
  }

  console.log('\n🚀 Все схемы синхронизированы!');
}

main().catch(console.error);
