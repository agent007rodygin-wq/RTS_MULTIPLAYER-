/**
 * fix_monster_hp.mjs
 * 
 * Repairs PocketBase schema migration artifact: all buildings have hp=0 / maxHp=0
 * at the top level (default set when the fields were added to the schema).
 * 
 * For each building record with hp=0 and maxHp=0:
 *   1. If data.json.hp > 0  → restore from data.json
 *   2. Else if data.json.maxHp > 0 → restore from data.json.maxHp
 *   3. Else → use known durability from buildingId lookup
 * 
 * Run once: node fix_monster_hp.mjs
 */
import http from 'http';

const PB_HOST = '89.127.214.182';
const PB_PORT = '8090';

// Known monster durabilities (from data/buildings.ts)
const DURABILITY_MAP = {
  70001: 5,      // Killing Hut
  70002: 13,     // Kind Santa
  70003: 40,     // Gorynych
  70004: 60,     // Kolobok
  70005: 80,     // Baba Yaga
  70006: 33768,  // Bronekur
  // Town Hall levels
  301: 40, 306: 100, 312: 200, 331: 400, 345: 600,
  346: 900, 347: 1300, 348: 1800, 349: 2400, 350: 3200,
  351: 4200, 352: 5500, 353: 7000, 354: 9000, 355: 12000,
  360: 15000, 361: 20000, 371: 27000, 381: 36000,
};

function req(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: PB_HOST, port: PB_PORT, path, method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

async function main() {
  // Authenticate
  const auth = await req('/api/collections/_superusers/auth-with-password', 'POST',
    { identity: 'admin@basingse.game', password: 'BaSingSe2024' });
  if (auth.status !== 200) {
    console.error('AUTH FAILED:', auth.status, JSON.stringify(auth.data));
    process.exit(1);
  }
  const token = auth.data.token;
  console.log('[AUTH] OK');

  // Fetch all buildings with hp=0 and maxHp=0
  let page = 1;
  const perPage = 200;
  let totalFixed = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  while (true) {
    const res = await req(
      `/api/collections/buildings/records?filter=(hp=0%26%26maxHp=0)&perPage=${perPage}&page=${page}&fields=id,hp,maxHp,buildingId,data`,
      'GET', null, token
    );

    if (res.status !== 200) {
      console.error('Fetch failed:', res.status, JSON.stringify(res.data));
      break;
    }

    const items = res.data.items || [];
    const totalItems = res.data.totalItems || 0;
    const totalPages = res.data.totalPages || 1;

    console.log(`\nPage ${page}/${totalPages}: ${items.length} records (total with hp=0/maxHp=0: ${totalItems})`);

    for (const item of items) {
      const bid = Number(item.buildingId);
      const dataJson = item.data || {};

      // Determine correct hp and maxHp
      let correctHp = 0;
      let correctMaxHp = 0;

      if (typeof dataJson.hp === 'number' && dataJson.hp > 0) {
        // Restore from data.json.hp
        correctHp = dataJson.hp;
        correctMaxHp = typeof dataJson.maxHp === 'number' && dataJson.maxHp > 0
          ? dataJson.maxHp
          : (DURABILITY_MAP[bid] || dataJson.hp);
      } else if (typeof dataJson.maxHp === 'number' && dataJson.maxHp > 0) {
        // data.json.hp missing, use data.json.maxHp as full hp
        correctHp = dataJson.maxHp;
        correctMaxHp = dataJson.maxHp;
      } else if (DURABILITY_MAP[bid]) {
        // No data.json, use known durability
        correctHp = DURABILITY_MAP[bid];
        correctMaxHp = DURABILITY_MAP[bid];
      } else {
        console.warn(`  [SKIP] ${item.id} buildingId=${bid}: no durability known, skipping`);
        totalSkipped++;
        continue;
      }

      // Update the record: set top-level hp/maxHp AND sync to data.json
      const updatedData = { ...dataJson, hp: correctHp, maxHp: correctMaxHp };
      const patch = { hp: correctHp, maxHp: correctMaxHp, data: updatedData };

      const patchRes = await req(
        `/api/collections/buildings/records/${item.id}`,
        'PATCH', patch, token
      );

      if (patchRes.status === 200) {
        console.log(`  [FIXED] ${item.id} buildingId=${bid}: hp=${correctHp}, maxHp=${correctMaxHp}`);
        totalFixed++;
      } else {
        console.error(`  [ERROR] ${item.id}: ${patchRes.status} ${JSON.stringify(patchRes.data)}`);
        totalErrors++;
      }

      // Small delay to avoid overwhelming the server
      await new Promise(r => setTimeout(r, 50));
    }

    if (page >= totalPages) break;
    page++;
  }

  console.log(`\n=== DONE ===`);
  console.log(`Fixed: ${totalFixed}`);
  console.log(`Skipped (unknown buildingId): ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);
}

main().catch(e => { console.error('FATAL:', e.message || e); process.exit(1); });
