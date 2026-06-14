/**
 * reset_trees_monsters.mjs
 * 
 * Deletes ALL trees from map_resources and ALL monsters from buildings
 * so they regenerate with new settings (fewer trees, 4 monsters per sector).
 * Player buildings are NOT touched.
 * 
 * Run: node reset_trees_monsters.mjs
 */

import PocketBase from 'pocketbase';

const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASSWORD = 'BaSingSe2024';
const CHUNK = 200;

const pb = new PocketBase(PB_URL);

async function deleteFiltered(col, filter) {
    console.log(`\n🗑️  Deleting from ${col} where: ${filter}`);
    let deleted = 0;
    while (true) {
        const items = await pb.collection(col).getList(1, CHUNK, { filter, fields: 'id' });
        if (items.items.length === 0) break;
        await Promise.all(items.items.map(r => pb.collection(col).delete(r.id).catch(() => {})));
        deleted += items.items.length;
        process.stdout.write(`  Deleted: ${deleted}\r`);
    }
    console.log(`  ✅ Total deleted from ${col}: ${deleted}`);
    return deleted;
}

async function main() {
    console.log('🔑 Authenticating as admin...');
    await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated!\n');

    // Delete ALL trees from map_resources
    await deleteFiltered('map_resources', 'type="tree"');

    // Delete ALL monsters from buildings (ownerId = "monster" or "-1" with monster buildingIds)
    await deleteFiltered('buildings', '(ownerId="monster" || ownerId="-1") && buildingId>=70001 && buildingId<=70006');

    // Also delete map_state/status to trigger fresh world generation
    try {
        await pb.collection('map_state').delete('status000000000');
        console.log('\n✅ map_state/status deleted - will trigger fresh generation on next load');
    } catch (e) {
        console.log('\n⚠️ map_state/status not found or already deleted');
    }

    console.log('\n🎉 Done! Reload the game to regenerate trees and monsters with new settings.');
}

main().catch(err => {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
});

