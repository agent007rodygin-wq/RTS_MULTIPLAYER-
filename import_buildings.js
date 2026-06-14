import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const pb = new PocketBase('http://185.126.114.231:8090');

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

async function migrate() {
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
    const dump = JSON.parse(readFileSync('firebase_dump.json', 'utf8'));

    const records = dump['buildings'];
    console.log(`Начинаем вставку ${records.length} записей в buildings...`);
    let inserted = 0;
    
    for (const rec of records) {
        try {
            const pbId = toPbId(rec.id);
            const payload = { ...rec };
            delete payload.id;
            
            if (payload.ownerId && payload.ownerId !== "0" && payload.ownerId !== "-1" && payload.ownerId !== "monster") {
                payload.ownerId = toPbId(payload.ownerId);
            }
            if (payload.senderId) payload.senderId = toPbId(payload.senderId);

            payload.id = pbId;
            
            try {
                await pb.collection('buildings').getOne(pbId);
                await pb.collection('buildings').update(pbId, payload);
            } catch (e) {
                await pb.collection('buildings').create(payload);
            }
            inserted++;
        } catch (err) {
            console.log(`Error inserting record ${rec.id}:`, err?.response?.data || err.message);
            break; // Stop on first error
        }
    }
    console.log(`Готово. Вставлено/Обновлено: ${inserted}`);
}

migrate().catch(console.error);
