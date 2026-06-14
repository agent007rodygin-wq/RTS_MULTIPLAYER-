import PocketBase from 'pocketbase';

const pb = new PocketBase('http://185.126.114.231:8090');

async function updateSchema() {
    console.log('🔐 Authenticating as admin...');
    await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');

    const collections = await pb.collections.getFullList();

    const collectionsToUpdate = [
        {
            name: 'private_messages',
            newFields: [
                { name: 'text', type: 'text' },
                { name: 'timestamp', type: 'number' },
                { name: 'senderName', type: 'text' },
                { name: 'gameId', type: 'text' },
                { name: 'data', type: 'json' }
            ]
        },
        {
            name: 'clans',
            newFields: [
                { name: 'members', type: 'json' },
                { name: 'description', type: 'text' },
                { name: 'gameId', type: 'text' },
                { name: 'data', type: 'json' },
                { name: 'avatarUrl', type: 'text' }
            ]
        },
        {
            name: 'market',
            newFields: [
                { name: 'sellerId', type: 'text' },
                { name: 'sellerName', type: 'text' },
                { name: 'itemId', type: 'text' },
                { name: 'itemName', type: 'text' },
                { name: 'quantity', type: 'number' },
                { name: 'price', type: 'number' },
                { name: 'timestamp', type: 'number' },
                { name: 'gameId', type: 'text' },
                { name: 'data', type: 'json' }
            ]
        }
    ];

    for (const update of collectionsToUpdate) {
        const coll = collections.find(c => c.name === update.name);
        if (!coll) {
            console.log(`⚠️ Collection ${update.name} not found, skipping.`);
            continue;
        }

        console.log(`\n📦 Updating collection: ${coll.name}...`);
        
        // Filter out fields that already exist
        const existingFields = (coll.fields || coll.schema || []).map(f => f.name);
        const fieldsToAdd = update.newFields.filter(f => !existingFields.includes(f.name));

        if (fieldsToAdd.length === 0) {
            console.log(`  ✅ All fields already exist.`);
            continue;
        }

        const updatedFields = [...(coll.fields || coll.schema || []), ...fieldsToAdd];
        
        try {
            await pb.collections.update(coll.id, {
                ...coll,
                fields: updatedFields
            });
            console.log(`  ✅ Added ${fieldsToAdd.length} fields: ${fieldsToAdd.map(f => f.name).join(', ')}`);
        } catch (err) {
            console.error(`  ❌ Error updating ${coll.name}:`, err.data || err.message);
        }
    }

    console.log('\n✨ Schema update complete!');
}

updateSchema().catch(console.error);
