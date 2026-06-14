import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(resolve(__dirname, 'ai-studio-applet-webapp-7ac33-firebase-adminsdk-fbsvc-209f88001c.json'), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ databaseId: 'ai-studio-4ee3ce41-1e82-48d8-a43b-4db0d823c981' });

async function exportAll() {
  console.log('Начинаем выгрузку базы Firebase...');
  const collectionsList = ['users', 'buildings', 'map_resources', 'dropped_items', 'map_state', 'chat_messages', 'clans', 'market', 'player_history'];
  
  const dump = {};
  
  for (const colName of collectionsList) {
    console.log(`Выгружаем коллекцию ${colName}...`);
    try {
      const snapshot = await db.collection(colName).get();
      dump[colName] = [];
      snapshot.forEach(doc => {
        dump[colName].push({ id: doc.id, ...doc.data() });
      });
      console.log(`✓ Записей: ${dump[colName].length}`);
    } catch (e) {
      console.log(`! Коллекция ${colName} пуста или не существует.`);
    }
  }

  writeFileSync(resolve(__dirname, 'firebase_dump.json'), JSON.stringify(dump, null, 2));
  console.log('✅ Выгрузка завершена! Данные сохранены в firebase_dump.json');
}

exportAll().catch(console.error);
