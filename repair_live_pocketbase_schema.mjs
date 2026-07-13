import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL;
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;
const ZONE_SIZE = 40;

if (!PB_URL || !PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error('Missing PB_URL, PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD.');
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

const textField = (name) => ({
  name,
  type: 'text',
  required: false,
  hidden: false,
  presentable: false,
  min: 0,
  max: 0,
  pattern: '',
});

const jsonField = (name) => ({
  name,
  type: 'json',
  required: false,
  hidden: false,
  presentable: false,
  maxSize: 0,
});

const numberField = (name, onlyInt = false) => ({
  name,
  type: 'number',
  required: false,
  hidden: false,
  presentable: false,
  min: null,
  max: null,
  onlyInt,
});

const boolField = (name) => ({
  name,
  type: 'bool',
  required: false,
  hidden: false,
  presentable: false,
});

const desiredFields = {
  buildings: [textField('zoneId'), jsonField('data'), textField('gameId')],
  map_resources: [textField('zoneId'), jsonField('data'), textField('gameId')],
  dropped_items: [textField('zoneId'), jsonField('data'), textField('gameId')],
  chat_messages: [
    textField('sender'),
    textField('text'),
    textField('type'),
    numberField('timestamp', true),
    textField('tab'),
    textField('senderId'),
    textField('channel'),
    textField('gameId'),
    jsonField('data'),
  ],
  presence: [boolField('isOnline'), textField('gameId'), jsonField('data')],
  elections: [
    jsonField('candidates'),
    textField('sheriffId'),
    textField('sheriffName'),
    jsonField('deputies'),
    numberField('electionEndTime', true),
    boolField('firstElectionCompleted'),
    textField('kingId'),
    textField('kingName'),
    textField('queenId'),
    textField('queenName'),
    numberField('votesTotal', true),
    textField('gameId'),
    jsonField('data'),
  ],
  map_state: [textField('gameId'), jsonField('data')],
  private_messages: [textField('senderId'), textField('receiverId'), jsonField('participants'), textField('senderName'), textField('gameId'), jsonField('data')],
  clans: [textField('leaderId'), jsonField('members'), textField('description'), textField('gameId'), jsonField('data')],
  market: [textField('sellerId'), textField('sellerName'), textField('itemId'), textField('itemName'), numberField('quantity', true), numberField('price'), numberField('timestamp', true), textField('gameId'), jsonField('data')],
};

function zoneIdFor(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return `${Math.floor(x / ZONE_SIZE)}_${Math.floor(y / ZONE_SIZE)}`;
}

async function ensureCollectionFields(collectionName, fieldsToAdd) {
  const collection = await pb.collections.getOne(collectionName);
  const existingNames = new Set(collection.fields.map((field) => field.name));
  const missing = fieldsToAdd.filter((field) => !existingNames.has(field.name));

  if (missing.length === 0) {
    console.log(`[schema] ${collectionName}: ok`);
    return;
  }

  await pb.collections.update(collection.id, {
    fields: [...collection.fields, ...missing],
  });
  console.log(`[schema] ${collectionName}: added ${missing.map((field) => field.name).join(', ')}`);
}

async function backfillZoneIds(collectionName) {
  let page = 1;
  let updated = 0;

  while (true) {
    const list = await pb.collection(collectionName).getList(page, 200, {
      sort: 'id',
      skipTotal: true,
    });

    if (list.items.length === 0) break;

    for (const item of list.items) {
      if (item.zoneId) continue;
      const zoneId = zoneIdFor(Number(item.x), Number(item.y));
      if (!zoneId) continue;
      await pb.collection(collectionName).update(item.id, { zoneId });
      updated++;
    }

    if (list.items.length < 200) break;
    page++;
  }

  console.log(`[data] ${collectionName}: backfilled zoneId for ${updated} records`);
}

async function ensureElectionRecord(id, defaults) {
  try {
    await pb.collection('elections').getOne(id);
    console.log(`[data] elections/${id}: ok`);
  } catch (error) {
    if (error?.status !== 404) throw error;
    await pb.collection('elections').create({ id, ...defaults });
    console.log(`[data] elections/${id}: created`);
  }
}

async function ensureMapStateStatus() {
  const id = 'status000000000';
  try {
    await pb.collection('map_state').getOne(id);
    console.log(`[data] map_state/${id}: ok`);
  } catch (error) {
    if (error?.status !== 404) throw error;
    await pb.collection('map_state').create({
      id,
      data: {
        generated: false,
        seed: 0,
        forceReloadAt: 0,
      },
    });
    console.log(`[data] map_state/${id}: created`);
  }
}

async function verifyQueries() {
  const tests = [
    ['buildings', { filter: '(zoneId = "0_0" || zoneId = "1_0")' }],
    ['map_resources', { filter: '(zoneId = "0_0" || zoneId = "1_0")' }],
    ['dropped_items', { filter: '(zoneId = "0_0" || zoneId = "1_0")' }],
    ['chat_messages', { sort: '-timestamp' }],
  ];

  for (const [collectionName, options] of tests) {
    const list = await pb.collection(collectionName).getList(1, 3, options);
    console.log(`[verify] ${collectionName}: ok (${list.items.length})`);
  }
}

await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
console.log('[auth] ok');

for (const [collectionName, fields] of Object.entries(desiredFields)) {
  await ensureCollectionFields(collectionName, fields);
}

await backfillZoneIds('buildings');
await backfillZoneIds('map_resources');
await backfillZoneIds('dropped_items');

await ensureElectionRecord('police000000000', {
  candidates: {},
  sheriffId: '',
  sheriffName: '',
  deputies: [],
  electionEndTime: 0,
  firstElectionCompleted: false,
  votesTotal: 0,
});

await ensureElectionRecord('royal0000000000', {
  candidates: {},
  kingId: '',
  kingName: '',
  queenId: '',
  queenName: '',
  electionEndTime: 0,
  firstElectionCompleted: false,
  votesTotal: 0,
});

await ensureMapStateStatus();
await verifyQueries();
console.log('[done] PocketBase schema repair complete');
