import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const pb = new PocketBase('http://89.127.214.182:8090');

// Helper to convert Firebase 20-28 char ID to PocketBase strict 15 char alphanumeric ID
function toPbId(id) {
    if (!id) return undefined;
    const strId = String(id);
    if (strId.length === 15 && /^[a-z0-9]+$/i.test(strId)) {
        return strId;
    }
    const safe = strId.replace(/[^a-zA-Z0-9]/g, 'z').toLowerCase();
    const pbId = safe.substring(0, 15).padEnd(15, '0');
    return pbId;
}

function deriveSchemaFromRecord(record) {
    const schema = [];
    for (const [key, val] of Object.entries(record)) {
        if (key === 'id' || key === 'collectionName' || key === 'expand' || key === 'collectionId' || key === 'created' || key === 'updated') continue;
        
        let type = 'text';
        if (typeof val === 'number') type = 'number';
        else if (typeof val === 'boolean') type = 'bool';
        else if (typeof val === 'object' && val !== null) type = 'json';
        
        schema.push({
            name: key,
            type: type,
            required: false,
        });
    }
    return schema;
}

async function migrate() {
    console.log("Авторизация в PocketBase...");
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
    pb.autoCancellation(false);

    console.log("Чтение firebase_dump.json...");
    const dump = JSON.parse(readFileSync('firebase_dump.json', 'utf8'));

    const existingCols = await pb.collections.getFullList();
    const existingColNames = existingCols.map(c => c.name);

    for (const [colName, records] of Object.entries(dump)) {
        if (!records || records.length === 0) continue;
        console.log(`\n--- Обработка коллекции: ${colName} (${records.length} записей) ---`);

        // Create or update schema
        if (colName === 'users') {
            try {
                const usersCol = await pb.collections.getOne('users');
                const currentFields = usersCol.fields || usersCol.schema; // v0.23+ uses fields
                const currentFieldNames = currentFields.map(f => f.name);
                
                const newSchema = deriveSchemaFromRecord(records[0]);
                let modified = false;
                
                for (const field of newSchema) {
                    const skip = ['email', 'emailVisibility', 'password', 'username', 'verified', 'avatar', 'name', 'uid'].includes(field.name);
                    if (!skip && !currentFieldNames.includes(field.name)) {
                        currentFields.push(field);
                        modified = true;
                    }
                }
                
                if (modified) {
                    usersCol.fields = currentFields;
                    await pb.collections.update('users', usersCol);
                    console.log(`Обновлена схема коллекции users.`);
                }
            } catch (e) {
                console.log('ОШИБКА обновления users:', e.message);
            }
        } else {
            if (!existingColNames.includes(colName)) {
                try {
                    const newFields = deriveSchemaFromRecord(records[0]);
                    await pb.collections.create({
                        name: colName,
                        type: 'base',
                        fields: [
                            { name: 'id', type: 'text', primaryKey: true, required: true, system: true },
                            ...newFields
                        ],
                        listRule: "",
                        viewRule: "",
                        createRule: "",
                        updateRule: "",
                        deleteRule: ""
                    });
                    console.log(`Создана пустая коллекция: ${colName}`);
                } catch(e) {
                    console.log(`Схема не создана для ${colName}:`, e?.response?.data || e.message);
                }
            }
        }

        // Insert records
        console.log(`Начинаем вставку ${records.length} записей в ${colName}...`);
        let inserted = 0;
        let failed = 0;
        
        for (const rec of records) {
            try {
                const pbId = toPbId(rec.id);
                const payload = { ...rec };
                delete payload.id; // Will pass custom id in params or let it auto
                
                // Remap IDs where they were used
                if (payload.ownerId && payload.ownerId !== "0" && payload.ownerId !== "-1" && payload.ownerId !== "monster") {
                    payload.ownerId = toPbId(payload.ownerId);
                }
                if (payload.senderId) payload.senderId = toPbId(payload.senderId);
                
                if (colName === 'users') {
                    payload.username = "u_" + pbId;
                    payload.emailVisibility = true;
                    payload.password = "PBmigrated_" + pbId;
                    payload.passwordConfirm = payload.password;
                    if (!payload.email) {
                        payload.email = `noemail_${pbId}@example.com`;
                    }
                    if (payload.displayName) {
                        payload.name = payload.displayName;
                    }
                }

                // PocketBase ID override
                payload.id = pbId;
                
                // Check if exists first to avoid duplicate errors on reruns
                try {
                    await pb.collection(colName).getOne(pbId);
                    // Exists, update it
                    await pb.collection(colName).update(pbId, payload);
                } catch (e) {
                    // Not exists, create it
                    await pb.collection(colName).create(payload);
                }
                inserted++;
            } catch (err) {
                failed++;
                console.log(`Error inserting record ${rec.id}:`, err?.response?.data || err.message);
            }
        }
        console.log(`Готово для ${colName}. Вставлено/Обновлено: ${inserted}, Ошибок: ${failed}`);
    }
    console.log("\n🎉 МИГРАЦИЯ ДАННЫХ ПОЛНОСТЬЮ ЗАВЕРШЕНА!");
}

migrate().catch(console.error);
