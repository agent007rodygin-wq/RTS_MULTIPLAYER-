import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://89.127.214.182:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@basingse.game';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'BaSingSe2024';

const pb = new PocketBase(PB_URL);

const TREE_MAX_HP = 3;

const textField = (name) => ({
  name,
  type: 'text',
  required: false,
  hidden: false,
  presentable: false,
  min: null,
  max: null,
  pattern: '',
});

const numberField = (name) => ({
  name,
  type: 'number',
  required: false,
  hidden: false,
  presentable: false,
  min: null,
  max: null,
  onlyInt: true,
});

const MAP_RESOURCE_TREE_FIELDS = [
  numberField('maxHp'),
  textField('sectorId'),
  textField('state'),
  numberField('respawnAt'),
  numberField('createdAt'),
];

const TREE_RESPAWN_FIELDS = [
  textField('resourceType'),
  textField('oldResourceId'),
  numberField('oldX'),
  numberField('oldY'),
  textField('zoneId'),
  textField('sectorId'),
  numberField('respawnAt'),
  textField('status'),
  numberField('attempts'),
  numberField('createdAt'),
];

function normalizeInt(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.floor(numeric);
}

async function ensureMapResourcesTreeFields() {
  const collection = await pb.collections.getOne('map_resources');
  const existingNames = new Set((collection.fields || []).map((field) => field.name));
  const missing = MAP_RESOURCE_TREE_FIELDS.filter((field) => !existingNames.has(field.name));

  if (!missing.length) {
    console.log('[schema] map_resources: tree lifecycle fields already exist');
    return;
  }

  await pb.collections.update(collection.id, {
    fields: [...collection.fields, ...missing],
  });

  console.log(`[schema] map_resources: added ${missing.map((field) => field.name).join(', ')}`);
}

async function ensureTreeRespawnsCollection() {
  let collection = null;

  try {
    collection = await pb.collections.getOne('tree_respawns');
    console.log('[schema] tree_respawns: collection exists');
  } catch (error) {
    if (error?.status !== 404) throw error;
  }

  if (!collection) {
    await pb.collections.create({
      name: 'tree_respawns',
      type: 'base',
      fields: TREE_RESPAWN_FIELDS,
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
    });
    console.log('[schema] tree_respawns: collection created');
    return;
  }

  const existingNames = new Set((collection.fields || []).map((field) => field.name));
  const missing = TREE_RESPAWN_FIELDS.filter((field) => !existingNames.has(field.name));

  if (!missing.length) {
    console.log('[schema] tree_respawns: fields already up to date');
    return;
  }

  await pb.collections.update(collection.id, {
    fields: [...collection.fields, ...missing],
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  console.log(`[schema] tree_respawns: added ${missing.map((field) => field.name).join(', ')}`);
}

async function migrateExistingTrees() {
  let page = 1;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const list = await pb.collection('map_resources').getList(page, 500, {
      filter: 'type="tree"',
      sort: 'id',
      skipTotal: true,
    });

    if (!list.items.length) break;

    for (const resource of list.items) {
      scanned++;

      const x = normalizeInt(resource.x, 0);
      const y = normalizeInt(resource.y, 0);
      const zoneId = resource.zoneId || `${Math.floor(x / 40)}_${Math.floor(y / 40)}`;
      const patch = {};

      if (!Number.isFinite(Number(resource.hp)) || Number(resource.hp) <= 0) {
        patch.hp = TREE_MAX_HP;
      }
      if (!Number.isFinite(Number(resource.maxHp)) || Number(resource.maxHp) <= 0) {
        patch.maxHp = TREE_MAX_HP;
      }
      if (!resource.state) {
        patch.state = 'alive';
      }
      if (!resource.sectorId) {
        patch.sectorId = zoneId;
      }
      if (!Number.isFinite(Number(resource.respawnAt))) {
        patch.respawnAt = 0;
      }
      if (!Number.isFinite(Number(resource.createdAt)) || Number(resource.createdAt) <= 0) {
        patch.createdAt = Date.parse(resource.created || '') || Date.now();
      }

      if (Object.keys(patch).length > 0) {
        await pb.collection('map_resources').update(resource.id, patch);
        updated++;
      }
    }

    console.log(`[data] trees migrated: scanned ${scanned}, updated ${updated}`);

    if (list.items.length < 500) break;
    page++;
  }

  console.log(`[done] tree migration complete: scanned ${scanned}, updated ${updated}`);
}

async function main() {
  console.log(`[auth] PB_URL=${PB_URL}`);
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  console.log('[auth] ok');

  await ensureMapResourcesTreeFields();
  await ensureTreeRespawnsCollection();
  await migrateExistingTrees();
}

main().catch((error) => {
  console.error('[fatal]', error);
  process.exit(1);
});
