import PocketBase from 'pocketbase';
const pb = new PocketBase('http://185.126.114.231:8090');
await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');

// Check a player building to see schema format
const buildings = await pb.collection('buildings').getList(1, 1, { filter: 'ownerId!="" && ownerId!="-1" && ownerId!="monster"' });
if (buildings.items.length > 0) {
    console.log('=== Player Building Example ===');
    console.log(JSON.stringify(buildings.items[0], null, 2));
}

// Check a successfully created mountain 
const mountains = await pb.collection('buildings').getList(1, 1, { filter: 'buildingId="50005"' });
console.log('\n=== Mountain (if any) ===');
console.log(mountains.items.length ? JSON.stringify(mountains.items[0], null, 2) : 'None found');

// Check a successfully created monster
const monsters = await pb.collection('buildings').getList(1, 1, { filter: 'ownerId="monster"' });
console.log('\n=== Monster (if any) ===');
console.log(monsters.items.length ? JSON.stringify(monsters.items[0], null, 2) : 'None found');

// Check a tree
const trees = await pb.collection('map_resources').getList(1, 1, { filter: 'type="tree"' });
console.log('\n=== Tree (if any) ===');
console.log(trees.items.length ? JSON.stringify(trees.items[0], null, 2) : 'None found');

// Try to create a test mountain to see the actual error
console.log('\n=== Testing mountain create ===');
try {
    const testId = 'testmountain000';
    const result = await pb.collection('buildings').create({
        id: testId,
        gameId: 'test_mountain_1_1',
        ownerId: '-1',
        zoneId: '0_0',
        x: 1,
        y: 1,
        buildingId: '50005',
        data: {
            ownerName: 'Система',
            isConstructing: false,
            constructionEndTime: 0,
            type: 'Default',
            workState: 'idle',
            hp: 999999,
            maxHp: 999999
        }
    });
    console.log('SUCCESS:', result.id);
    // Clean up test
    await pb.collection('buildings').delete(testId);
} catch (e) {
    console.log('ERROR status:', e.status);
    console.log('ERROR response:', JSON.stringify(e.response));
}
