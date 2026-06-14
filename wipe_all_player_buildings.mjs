/**
 * wipe_all_player_buildings.mjs
 *
 * Deletes all player-owned buildings from PocketBase.
 *
 * Defaults:
 * - DRY_RUN=1 (no deletion, only count/preview)
 * - KEEP_SYSTEM=1 (keeps ownerId = "-1" and "monster")
 *
 * Usage:
 *   node wipe_all_player_buildings.mjs
 *   APPLY=1 node wipe_all_player_buildings.mjs
 *   APPLY=1 KEEP_SYSTEM=0 node wipe_all_player_buildings.mjs
 */

import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://89.127.214.182:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@basingse.game';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'BaSingSe2024';

const APPLY = process.env.APPLY === '1';
const DRY_RUN = !APPLY;
const KEEP_SYSTEM = process.env.KEEP_SYSTEM !== '0';
const DELETE_CONCURRENCY = Number(process.env.DELETE_CONCURRENCY || 25);

const pb = new PocketBase(PB_URL);

function buildFilter() {
  if (KEEP_SYSTEM) {
    return `ownerId != "-1" && ownerId != "monster"`;
  }
  return '';
}

function explainPbError(e) {
  const status = e?.status || e?.originalError?.status;
  const message = e?.message || e?.originalError?.message || 'unknown error';
  const data = e?.data || e?.originalError?.data;
  console.error('[PB ERROR]', { status, message, data });
}

function shouldDeleteByOwner(ownerId) {
  if (!KEEP_SYSTEM) return true;
  return ownerId !== '-1' && ownerId !== 'monster';
}

async function fetchAllBuildings() {
  try {
    // Avoid getList/get pagination path that returns 400 on this server.
    return await pb.collection('buildings').getFullList({
      $autoCancel: false,
    });
  } catch (e) {
    explainPbError(e);
    throw e;
  }
}

async function deleteChunk(items) {
  await Promise.all(
    items.map((r) =>
      pb.collection('buildings').delete(r.id, { $autoCancel: false }).catch((e) => {
        console.error(`[DELETE ERROR] ${r.id}:`, e?.status || e?.message || e);
      })
    )
  );
}

async function main() {
  console.log('--- WIPE ALL PLAYER BUILDINGS ---');
  console.log(`PB_URL=${PB_URL}`);
  console.log(`DRY_RUN=${DRY_RUN ? '1' : '0'}`);
  console.log(`KEEP_SYSTEM=${KEEP_SYSTEM ? '1' : '0'}`);

  try {
    // PocketBase 0.23+ default superuser auth
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  } catch (e) {
    // Backward compatibility with older PB admin API
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  }
  console.log('Admin auth: OK');

  const all = await fetchAllBuildings();
  const matched = all.filter((r) => shouldDeleteByOwner(String(r.ownerId ?? '')));
  const total = matched.length;
  console.log(`Matched buildings: ${total}${KEEP_SYSTEM ? ' (excluding system/monster)' : ''}`);

  if (total === 0) {
    console.log('Nothing to delete.');
    return;
  }

  const preview = matched.slice(0, 10).map((r) => ({
    id: r.id,
    ownerId: r.ownerId,
    buildingId: r.buildingId,
    x: r.x,
    y: r.y,
    zoneId: r.zoneId,
  }));
  console.log('Preview (first up to 10):');
  console.table(preview);

  if (DRY_RUN) {
    console.log('DRY_RUN enabled. No records were deleted.');
    return;
  }

  let deleted = 0;
  for (let i = 0; i < matched.length; i += DELETE_CONCURRENCY) {
    const chunk = matched.slice(i, i + DELETE_CONCURRENCY);
    await deleteChunk(chunk);
    deleted += chunk.length;
    process.stdout.write(`Deleted: ${deleted}/${total}\r`);
  }

  process.stdout.write('\n');
  console.log(`Done. Deleted records: ${deleted}`);
}

main().catch((e) => {
  explainPbError(e);
  console.error('Fatal error:', e?.status || e?.message || e);
  process.exitCode = 1;
});
