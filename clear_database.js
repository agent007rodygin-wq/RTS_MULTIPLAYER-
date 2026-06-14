import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function clearCollections() {
    console.log("🔐 Авторизация...");
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
    
    const collections = ['buildings', 'map_resources', 'dropped_items', 'chat_messages', 'presence', 'private_messages', 'clans'];
    
    for (const colName of collections) {
        try {
            console.log(`♻️ Очистка коллекции: ${colName}...`);
            const records = await pb.collection(colName).getFullList({ fields: 'id' });
            for (const record of records) {
                await pb.collection(colName).delete(record.id);
            }
            console.log(`✅ ${colName} очищена.`);
        } catch (e) {
            console.log(`⚠️ Ошибка или коллекция ${colName} пуста:`, e.message);
        }
    }
    console.log("\n🚀 База готова к новой миграции!");
}

clearCollections().catch(console.error);
