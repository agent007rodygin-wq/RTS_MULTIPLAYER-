// Test: Create a fake Town Hall record and verify hp survives roundtrip
import http from 'http';

const PB_HOST = '89.127.214.182';
const PB_PORT = 8090;

function pbRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: PB_HOST, port: PB_PORT, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  // Auth
  const auth = await pbRequest('POST', '/api/collections/_superusers/auth-with-password', {
    identity: 'admin@basingse.game', password: 'BaSingSe2024'
  });
  if (!auth.body.token) { console.error('AUTH FAILED', auth.body); return; }
  const token = auth.body.token;
  console.log('[AUTH] OK');

  const testId = 'testhall000000a';
  const now = Date.now();

  // Clean up any leftover test record
  await pbRequest('DELETE', `/api/collections/buildings/records/${testId}`, null, token).catch(() => {});

  // Create a fake Town Hall with hp=40, maxHp=40 (simulating what setDoc would do)
  const payload = {
    id: testId,
    gameId: 'test_townhall_' + now,
    buildingId: '301',
    ownerId: 'test_user',
    x: 9999,
    y: 9999,
    zoneId: '99_99',
    hp: 40,
    maxHp: 40,
    isConstructing: false,
    constructionEndTime: 0,
    type: 'town_hall',
    workState: 'idle',
    data: { hp: 40, maxHp: 40, buildingId: 301, ownerName: 'Test', isConstructing: false }
  };

  const createResult = await pbRequest('POST', `/api/collections/buildings/records`, payload, token);
  console.log('\n[CREATE] Status:', createResult.status);
  if (createResult.status !== 200) {
    console.log('[CREATE] Error:', JSON.stringify(createResult.body));
    return;
  }

  const created = createResult.body;
  console.log('[CREATE] Result:');
  console.log('  id:', created.id);
  console.log('  hp (top-level):', created.hp, '← should be 40');
  console.log('  maxHp (top-level):', created.maxHp, '← should be 40');
  console.log('  data.hp:', created.data?.hp, '← should be 40');
  console.log('  data.maxHp:', created.data?.maxHp, '← should be 40');

  // Now read it back
  const readResult = await pbRequest('GET', `/api/collections/buildings/records/${testId}`, null, token);
  console.log('\n[READ BACK] Status:', readResult.status);
  const read = readResult.body;
  console.log('[READ BACK] Result:');
  console.log('  id:', read.id);
  console.log('  hp (top-level):', read.hp, '← should be 40');
  console.log('  maxHp (top-level):', read.maxHp, '← should be 40');
  console.log('  data.hp:', read.data?.hp, '← should be 40');
  console.log('  data.maxHp:', read.data?.maxHp, '← should be 40');

  // Simulate what wrapData would produce (check if hp=0 artifact would appear)
  const isHpArtifact = read.hp === 0 && read.maxHp === 0;
  console.log('\n[DIAGNOSIS] hp=0/maxHp=0 migration artifact:', isHpArtifact ? 'YES ❌' : 'NO ✅');
  console.log('[DIAGNOSIS] hp correctly preserved:', read.hp === 40 ? 'YES ✅' : 'NO ❌ (hp=' + read.hp + ')');

  // Clean up
  await pbRequest('DELETE', `/api/collections/buildings/records/${testId}`, null, token);
  console.log('\n[CLEANUP] Test record deleted');
  console.log('\n=== VERDICT ===');
  if (read.hp === 40) {
    console.log('✅ PocketBase correctly stores and returns hp=40 for new buildings.');
    console.log('   The hp=0 explosion bug is NOT caused by the PocketBase roundtrip.');
    console.log('   Check if monsters are adjacent to where Town Hall is placed!');
    console.log('   (Gorynych has damage=50 which one-shots Town Hall with hp=40)');
  } else {
    console.log('❌ PocketBase is returning hp=' + read.hp + ' instead of 40!');
    console.log('   This IS a PocketBase/schema issue.');
  }
}

main().catch(console.error);
