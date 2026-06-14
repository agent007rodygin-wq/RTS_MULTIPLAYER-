const PB_URL_CANDIDATES = [
  process.env.PB_URL,
  'http://185.126.114.231:8090',
  'http://89.127.214.182:8090'
].filter(Boolean);

const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      await sleep(800 * (i + 1));
    }
  }
  throw lastError;
}

async function resolvePocketBaseUrl() {
  for (const baseUrl of PB_URL_CANDIDATES) {
    try {
      const res = await fetchWithRetry(baseUrl + '/api/health', { method: 'GET' }, 2);
      if (res.ok) return baseUrl;
    } catch (_) {
      // try next
    }
  }
  throw new Error(`PocketBase unavailable at: ${PB_URL_CANDIDATES.join(', ')}`);
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function massDeleteMonsters() {
  console.log('Authorizing in PocketBase...');
  const PB_URL = await resolvePocketBaseUrl();
  console.log(`Using server: ${PB_URL}`);

  const authRes = await fetchWithRetry(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  }, 3);
  const authData = await authRes.json();
  const token = authData.token;
  if (!token) {
    console.error('Auth failed:', authData);
    return;
  }
  console.log('Authorized');

  const countRes = await fetchWithRetry(PB_URL + "/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1", {
    headers: authHeaders(token)
  }, 3);
  const countData = await countRes.json();
  const totalCount = countData.totalItems || 0;
  console.log(`Monsters found: ${totalCount}`);

  if (totalCount === 0) {
    console.log('No monsters to delete');
    return;
  }

  let deletedTotal = 0;
  let failedTotal = 0;
  const perPage = 500;
  const failedSamples = [];

  while (true) {
    // Always read page=1 after each delete wave to avoid pagination drift/skips.
    const res = await fetchWithRetry(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=${perPage}&page=1`, {
      headers: authHeaders(token)
    }, 3);
    const data = await res.json();
    const monsters = data.items || [];

    if (monsters.length === 0) break;

    console.log(`Wave: ${monsters.length} monsters`);

    const batchSize = 50;
    for (let i = 0; i < monsters.length; i += batchSize) {
      const batch = monsters.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async (monster) => {
        try {
          const delRes = await fetchWithRetry(PB_URL + `/api/collections/buildings/records/${monster.id}`, {
            method: 'DELETE',
            headers: authHeaders(token)
          }, 3);
          if (delRes.ok || delRes.status === 204) return { ok: true };
          const txt = await delRes.text().catch(() => '');
          return { ok: false, reason: `HTTP ${delRes.status} ${txt}` };
        } catch (e) {
          return { ok: false, reason: e?.message || 'network error' };
        }
      }));

      const successCount = results.filter(r => r.ok).length;
      const failCount = results.length - successCount;
      deletedTotal += successCount;
      failedTotal += failCount;
      if (failCount > 0 && failedSamples.length < 8) {
        results.filter(r => !r.ok).slice(0, 8 - failedSamples.length).forEach(r => failedSamples.push(r.reason));
      }
    }

    const progress = ((deletedTotal + failedTotal) / totalCount * 100).toFixed(1);
    console.log(`Progress: ${progress}% (${deletedTotal + failedTotal}/${totalCount})`);
    await sleep(100);
  }

  const verifyRes = await fetchWithRetry(PB_URL + "/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1", {
    headers: authHeaders(token)
  }, 3);
  const verifyData = await verifyRes.json();
  const remaining = verifyData.totalItems || 0;

  console.log(`Deleted: ${deletedTotal}, failed: ${failedTotal}, remaining: ${remaining}`);
  if (failedSamples.length > 0) {
    console.log('Failure samples:');
    failedSamples.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  }
}

massDeleteMonsters().catch(err => {
  console.error('Critical error:', err);
  process.exit(1);
});
