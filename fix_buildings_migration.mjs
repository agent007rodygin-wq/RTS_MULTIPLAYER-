/**
 * Migration script to fix buildings records in PocketBase.
 * 
 * Problem: buildingId was stored inside the 'data' JSON blob instead of
 * as a top-level field. This script extracts it and sets it at the top level.
 * 
 * Also clears all monster/system buildings (ownerId = "monster" or "-1")
 * to let the game regenerate them with proper field mapping.
 */
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function main() {
    // Authenticate as admin (PocketBase v0.25+ uses _superusers)
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');
    console.log('✅ Authenticated as admin');

    // Get all buildings
    const buildings = await pb.collection('buildings').getFullList();
    console.log(`📦 Found ${buildings.length} building records`);

    let fixed = 0;
    let deleted = 0;
    let errors = 0;

    for (const building of buildings) {
        try {
            const data = building.data || {};
            
            // Check if this is a monster/system building that should be regenerated
            if (building.ownerId === 'monster' || building.ownerId === '-1') {
                await pb.collection('buildings').delete(building.id);
                deleted++;
                continue;
            }

            // Fix buildingId: extract from data JSON if missing at top level
            if (!building.buildingId && data.buildingId) {
                await pb.collection('buildings').update(building.id, {
                    buildingId: String(data.buildingId)
                });
                fixed++;
                console.log(`  ✅ Fixed buildingId for ${building.id}: ${data.buildingId}`);
            }
        } catch (e) {
            errors++;
            console.error(`  ❌ Error processing ${building.id}:`, e.message);
        }
    }

    // Also clear map_state to force regeneration
    try {
        const mapStates = await pb.collection('map_state').getFullList();
        for (const state of mapStates) {
            await pb.collection('map_state').delete(state.id);
        }
        console.log(`🗺️ Cleared ${mapStates.length} map_state records (will regenerate on next login)`);
    } catch (e) {
        console.log('No map_state records to clear');
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  Fixed buildingId: ${fixed}`);
    console.log(`  Deleted monster/system buildings: ${deleted}`);
    console.log(`  Errors: ${errors}`);
    console.log('\n✅ Done! Monster buildings will regenerate automatically when a player logs in.');
}

main().catch(console.error);
