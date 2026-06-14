const PB_URL = 'http://89.127.214.182:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function clearLoot() {
  console.log('Authenticating with PocketBase...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;

  if (!token) {
    console.error('Authentication failed:', authData.message || 'Unknown error');
    process.exit(1);
  }
  console.log('Authenticated successfully.');

  // Get total count first
  console.log('Counting dropped items...');
  const countRes = await fetch(PB_URL + '/api/collections/dropped_items/records?perPage=1&page=1', {
    headers: { Authorization: token }
  });
  const countData = await countRes.json();
  const totalCount = countData.totalItems || 0;
  console.log(`Found ${totalCount} loot items to delete.`);

  if (totalCount === 0) {
    console.log('No loot items found. Nothing to delete.');
    return;
  }

  let deletedTotal = 0;
  let failedTotal = 0;
  let page = 1;
  const perPage = 200;
  const batchSize = 20;

  while (true) {
    // Fetch current page
    const res = await fetch(
      PB_URL + `/api/collections/dropped_items/records?perPage=${perPage}&page=${page}`,
      { headers: { Authorization: token } }
    );
    const data = await res.json();
    const items = data.items || [];

    if (items.length === 0) {
      break;
    }

    // Delete in parallel batches of 20
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      const deletePromises = batch.map(async (item) => {
        try {
          const delRes = await fetch(
            PB_URL + `/api/collections/dropped_items/records/${item.id}`,
            { method: 'DELETE', headers: { Authorization: token } }
          );
          if (delRes.ok || delRes.status === 204) {
            return { success: true };
          }
          console.error(`   Failed to delete ${item.id}: HTTP ${delRes.status}`);
          return { success: false };
        } catch (err) {
          console.error(`   Failed to delete ${item.id}: ${err.message}`);
          return { success: false };
        }
      });

      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      deletedTotal += successCount;
      failedTotal += failCount;

      process.stdout.write(`\rDeleted ${deletedTotal} / ${totalCount}...`);
    }

    page++;
  }

  console.log(); // newline after progress
  console.log(`\nDone! Cleared ${deletedTotal} loot items total.`);
  if (failedTotal > 0) {
    console.log(`(${failedTotal} failed deletions)`);
  }
}

clearLoot().catch((err) => {
  console.error('Critical error:', err);
  process.exit(1);
});
