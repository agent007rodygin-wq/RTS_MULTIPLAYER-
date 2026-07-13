import PocketBase from 'pocketbase';

const pb = new PocketBase('http://89.127.214.182:8090');

async function clearChatMessages() {
  console.log('Authorizing as superuser...');
  await pb.collection('_superusers').authWithPassword('admin@basingse.game', 'BaSingSe2024');

  console.log('Fetching chat messages...');
  const records = await pb.collection('chat_messages').getFullList({ fields: 'id' });
  console.log(`Found ${records.length} chat messages.`);

  for (const record of records) {
    await pb.collection('chat_messages').delete(record.id);
  }

  console.log('Chat messages cleared.');
}

clearChatMessages().catch((error) => {
  console.error('Failed to clear chat messages:', error);
  process.exitCode = 1;
});
