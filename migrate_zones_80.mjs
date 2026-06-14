import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231.nip.io:8090');

const BATCH_SIZE = 50;
const ZONE_SIZE = 80;

function getZoneId(x, y) {
    return `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;
}

async function migrateCollection(collectionName) {
    console.log(`Migrating collection: ${collectionName}...`);
    const records = await pb.collection(collectionName).getFullList();
    
    let updates = 0;
    
    for (const item of records) {
        if (item.x !== undefined && item.x !== null && item.y !== undefined && item.y !== null) {
            const newZoneId = getZoneId(item.x, item.y);
            if (item.zoneId !== newZoneId) {
                try {
                    await pb.collection(collectionName).update(item.id, {
                        zoneId: newZoneId
                    });
                    updates++;
                    if (updates % BATCH_SIZE === 0) {
                        console.log(`Updated ${updates} items in ${collectionName}...`);
                    }
                } catch (e) {
                    console.error(`Failed to update item ${item.id} in ${collectionName}:`, e.message);
                }
            }
        }
    }
    console.log(`Finished migrating ${collectionName}! Total updated: ${updates}`);
}

async function run() {
    try {
        console.log("Authenticating as admin...");
        // Auth with superuser credentials from the previous fix script
        await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
        console.log("Starting zone grid migration to 80x80...");
        
        await migrateCollection('buildings');
        await migrateCollection('map_resources');
        await migrateCollection('dropped_items');

        console.log("Migration complete! You can now restart your game server.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

run();
