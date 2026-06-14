import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function fixCannonsDB() {
    console.log("🔐 Авторизация...");
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
    
    console.log("♻️ Получение защитных зданий (пушек, вышек) из базы данных...");
    const records = await pb.collection('buildings').getFullList();
    
    // IDs of defensive buildings
    const DEFENSE_IDS = [700, 701, 702, 801];
    
    let fixed = 0;
    
    for (const record of records) {
        if (DEFENSE_IDS.includes(Number(record.buildingId))) {
            const dataToUpdate = {};
            let needsUpdate = false;
            
            // Fix 1: Reset lastAttackTime to 0 if it's stuck in the future.
            if (record.lastAttackTime > Date.now() || record.lastAttackTime === undefined || record.lastAttackTime > 0) {
                dataToUpdate.lastAttackTime = 0;
                needsUpdate = true;
            }
            
            // Fix 2: Ensure isActive is strictly true
            if (record.isActive !== true) {
                dataToUpdate.isActive = true;
                needsUpdate = true;
            }
            
            // Fix 3: Ensure they are no longer stuck in "constructing" state if time passed
            if (record.isConstructing && (record.constructionEndTime < Date.now() || record.constructionEndTime == null)) {
                dataToUpdate.isConstructing = false;
                needsUpdate = true;
            }

            if (needsUpdate) {
                try {
                    await pb.collection('buildings').update(record.id, dataToUpdate);
                    fixed++;
                    console.log(`✅ Починена пушка ${record.id} (ownerId: ${record.ownerId})`);
                } catch(e) {
                    console.error(`⚠️ Ошибка обновления пушки ${record.id}:`, e.message);
                }
            }
        }
    }
    
    console.log(`\n🚀 Готово! Исправлено пушек в базе: ${fixed}`);
}

fixCannonsDB().catch(console.error);
