/**
 * One-time cleanup for invalid map overlaps.
 *
 * Fixes:
 * - buildings sitting on top of blocked resources (forest/tree, oil, quarry, chest)
 * - overlapping buildings on the same tile
 *
 * Rules:
 * - Oil rigs may stay on oil.
 * - Wild quarries may stay on quarry.
 * - Everything else must not occupy a resource tile.
 * - For overlapping buildings, keep the oldest active record and move newer ones.
 *
 * Usage:
 *   node cleanup_building_resource_overlaps.mjs
 *   APPLY=1 node cleanup_building_resource_overlaps.mjs
 *
 * Env:
 *   PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD
 * Optional:
 *   DRY_RUN=1 (default), APPLY=1 to commit, LIMIT=1000
 */
import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://89.127.214.182:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@basingse.game';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'BaSingSe2024';
const DRY_RUN = process.env.APPLY === '1' ? false : process.env.DRY_RUN !== '0';
const LIMIT = Number(process.env.LIMIT || 0);

const WORLD_WIDTH_TILES = 200;
const WORLD_HEIGHT_TILES = 200;

const OIL_RIG_ID = 606;
const TWO_OIL_RIGS_ID = 607;
const WILD_QUARRY_ID = 610;

const pb = new PocketBase(PB_URL);

const isActiveBuilding = (b) => b && (b.hp === undefined || b.hp > 0);

const toMillis = (value) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getSortScore = (record) => {
  const created = toMillis(record.created);
  const updated = toMillis(record.updated);
  const timestamp = Number(record.timestamp);
  const idNumber = Number(record.id);
  return created || updated || (Number.isFinite(timestamp) ? timestamp : 0) || (Number.isFinite(idNumber) ? idNumber : 0);
};

const getAllowedResourceTypesForBuildingId = (buildingId) => {
  if (buildingId === OIL_RIG_ID || buildingId === TWO_OIL_RIGS_ID) return ['oil'];
  if (buildingId === WILD_QUARRY_ID) return ['quarry'];
  return [];
};

const keyOf = (x, y) => `${x},${y}`;

function findFreeSpot(originX, originY, occupied, resourceByKey, allowedResourceTypes) {
  const maxRadius = Math.max(WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES);
  const originKey = keyOf(originX, originY);

  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const x = originX + dx;
        const y = originY + dy;
        if (x < 0 || x >= WORLD_WIDTH_TILES || y < 0 || y >= WORLD_HEIGHT_TILES) continue;
        const key = keyOf(x, y);
        if (key === originKey) continue;
        if (occupied.has(key)) continue;
        const resource = resourceByKey.get(key);
        if (resource && !allowedResourceTypes.has(resource.type)) continue;
        return { x, y };
      }
    }
  }

  return null;
}

async function authenticate() {
  try {
    await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  } catch {
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  }
}

async function main() {
  console.log('[cleanup] connect', PB_URL);
  console.log('[cleanup] mode', DRY_RUN ? 'DRY_RUN' : 'APPLY');
  await authenticate();
  console.log('[cleanup] authenticated');

  const [buildings, resources] = await Promise.all([
    pb.collection('buildings').getFullList({ $autoCancel: false }),
    pb.collection('map_resources').getFullList({ $autoCancel: false })
  ]);

  const records = LIMIT > 0 ? buildings.slice(0, LIMIT) : buildings;
  const activeBuildings = records.filter(isActiveBuilding);
  const resourceByKey = new Map(resources.map(r => [keyOf(r.x, r.y), r]));
  const occupied = new Set([
    ...activeBuildings.map(b => keyOf(b.x, b.y)),
    ...resources.map(r => keyOf(r.x, r.y))
  ]);

  const stats = {
    scanned: records.length,
    buildingCollisions: 0,
    resourceCollisions: 0,
    moved: 0,
    skipped: 0,
    failed: 0,
  };

  const groups = new Map();
  for (const b of activeBuildings) {
    const key = keyOf(b.x, b.y);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }

  for (const [position, group] of groups.entries()) {
    if (group.length <= 1) continue;

    group.sort((a, b) => {
      const aScore = getSortScore(a);
      const bScore = getSortScore(b);
      if (aScore !== bScore) return aScore - bScore;
      return String(a.id).localeCompare(String(b.id));
    });

    const keeper = group[0];
    for (let i = 1; i < group.length; i++) {
      const building = group[i];
      const allowedResourceTypes = new Set(getAllowedResourceTypesForBuildingId(Number(building.buildingId)));
      const newSpot = findFreeSpot(building.x, building.y, occupied, resourceByKey, allowedResourceTypes);
      stats.buildingCollisions++;
      if (!newSpot) {
        stats.skipped++;
        console.warn('[cleanup] no free spot for overlapping building', {
          id: building.id,
          buildingId: building.buildingId,
          position,
        });
        continue;
      }

      const oldKey = keyOf(building.x, building.y);
      const newKey = keyOf(newSpot.x, newSpot.y);
      occupied.delete(oldKey);
      occupied.add(newKey);

      if (!DRY_RUN) {
        await pb.collection('buildings').update(building.id, {
          x: newSpot.x,
          y: newSpot.y,
          zoneId: `${Math.floor(newSpot.x / 40)}_${Math.floor(newSpot.y / 40)}`
        });
      }

      building.x = newSpot.x;
      building.y = newSpot.y;
      building.zoneId = `${Math.floor(newSpot.x / 40)}_${Math.floor(newSpot.y / 40)}`;
      stats.moved++;
      console.log('[cleanup] moved overlapping building', {
        id: building.id,
        buildingId: building.buildingId,
        from: position,
        to: newKey,
        keeper: keeper.id,
      });
    }
  }

  for (const building of activeBuildings) {
    const resource = resourceByKey.get(keyOf(building.x, building.y));
    if (!resource) continue;

    const allowedResourceTypes = new Set(getAllowedResourceTypesForBuildingId(Number(building.buildingId)));
    if (allowedResourceTypes.has(resource.type)) continue;

    const newSpot = findFreeSpot(building.x, building.y, occupied, resourceByKey, allowedResourceTypes);
    stats.resourceCollisions++;
    if (!newSpot) {
      stats.skipped++;
      console.warn('[cleanup] no free spot away from resource', {
        id: building.id,
        buildingId: building.buildingId,
        resourceType: resource.type,
        position: keyOf(building.x, building.y),
      });
      continue;
    }

    const oldKey = keyOf(building.x, building.y);
    const newKey = keyOf(newSpot.x, newSpot.y);
    occupied.delete(oldKey);
    occupied.add(newKey);

    if (!DRY_RUN) {
      await pb.collection('buildings').update(building.id, {
        x: newSpot.x,
        y: newSpot.y,
        zoneId: `${Math.floor(newSpot.x / 40)}_${Math.floor(newSpot.y / 40)}`
      });
    }

    building.x = newSpot.x;
    building.y = newSpot.y;
    building.zoneId = `${Math.floor(newSpot.x / 40)}_${Math.floor(newSpot.y / 40)}`;
    stats.moved++;
    console.log('[cleanup] moved building off resource', {
      id: building.id,
      buildingId: building.buildingId,
      from: oldKey,
      to: newKey,
      resourceType: resource.type,
    });
  }

  console.log('\n[cleanup] summary');
  console.log(JSON.stringify(stats, null, 2));
  if (DRY_RUN) {
    console.log('[cleanup] dry run complete. Set APPLY=1 to commit changes.');
  }
}

main().catch((error) => {
  console.error('[cleanup] fatal error:', error?.message || error);
  process.exitCode = 1;
});
