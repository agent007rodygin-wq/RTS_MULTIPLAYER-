import PocketBase from 'pocketbase';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const pb = new PocketBase('http://185.126.114.231:8090');

function toPbId(firebaseId) {
    if (!firebaseId) return undefined;
    const hash = crypto.createHash('md5').update(String(firebaseId)).digest('hex');
    const b36 = BigInt('0x' + hash).toString(36);
    let id15 = b36.substring(0, 15);
    while(id15.length < 15) id15 += 'a';
    return id15;
}

async function run() {
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
    const dump = JSON.parse(readFileSync('firebase_dump.json', 'utf8'));

    const b = dump.buildings[0];
    const pbId = toPbId(b.id);
    console.log("Checking pbId:", pbId);
    
    try {
        const record = await pb.collection('buildings').getOne(pbId);
        console.log("Found record!", record.id);
    } catch(err) {
        console.log("Error finding record:", err.response?.data || err.message);
    }
}

run().catch(console.error);
