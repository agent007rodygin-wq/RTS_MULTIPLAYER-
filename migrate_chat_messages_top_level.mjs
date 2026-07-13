import PocketBase from 'pocketbase';

const PB_URL = process.env.PB_URL || 'http://89.127.214.182:8090';
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@basingse.game';
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'BaSingSe2024';
const PAGE_SIZE = 200;

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value);
}

function normalizeTimestamp(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return numeric;
}

function isBlankText(value) {
  return normalizeText(value).trim() === '';
}

function needsTopLevelBackfill(record, field, fallbackValue) {
  if (field === 'timestamp') {
    return normalizeTimestamp(record[field]) <= 0 && normalizeTimestamp(fallbackValue) > 0;
  }
  return isBlankText(record[field]) && !isBlankText(fallbackValue);
}

async function main() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);
  await pb.collection('_superusers').authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);

  let page = 1;
  let scanned = 0;
  let updated = 0;

  while (true) {
    const list = await pb.collection('chat_messages').getList(page, PAGE_SIZE, {
      sort: 'id',
      skipTotal: true,
    });

    if (!list.items.length) break;

    for (const record of list.items) {
      scanned += 1;
      const data = record.data && typeof record.data === 'object' ? record.data : {};
      const patch = {};

      if (needsTopLevelBackfill(record, 'sender', data.sender)) {
        patch.sender = normalizeText(data.sender);
      }
      if (needsTopLevelBackfill(record, 'text', data.text)) {
        patch.text = normalizeText(data.text);
      }
      if (needsTopLevelBackfill(record, 'type', data.type)) {
        patch.type = normalizeText(data.type);
      }
      if (needsTopLevelBackfill(record, 'tab', data.tab)) {
        patch.tab = normalizeText(data.tab);
      }
      if (needsTopLevelBackfill(record, 'timestamp', data.timestamp)) {
        patch.timestamp = normalizeTimestamp(data.timestamp);
      }
      if (needsTopLevelBackfill(record, 'senderId', data.senderId)) {
        patch.senderId = normalizeText(data.senderId);
      }
      if (needsTopLevelBackfill(record, 'gameId', data.gameId)) {
        patch.gameId = normalizeText(data.gameId);
      }

      if (Object.keys(patch).length === 0) {
        continue;
      }

      await pb.collection('chat_messages').update(record.id, patch);
      updated += 1;
      console.log(`[chat-migrate] updated ${record.id} ${JSON.stringify(patch)}`);
    }

    if (list.items.length < PAGE_SIZE) break;
    page += 1;
  }

  console.log(JSON.stringify({ scanned, updated }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
