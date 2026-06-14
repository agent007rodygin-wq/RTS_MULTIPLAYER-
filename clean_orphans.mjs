const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function cleanOrphans() {
  console.log('🔑 Авторизуемся...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const { token } = await authRes.json();
  if (!token) { console.error('❌ Ошибка авторизации'); return; }
  console.log('✅ Авторизован!');

  // Find all buildings with empty or null buildingId
  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(buildingId='')&perPage=500`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  const items = data.items || [];
  console.log(`🔍 Найдено пустых записей: ${items.length}`);

  let deleted = 0;
  for (const item of items) {
    const delRes = await fetch(PB_URL + `/api/collections/buildings/records/${item.id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    });
    if (delRes.ok) {
      deleted++;
    } else {
      console.warn(`⚠️ Не удалось удалить ${item.id}`);
    }
  }
  console.log(`✅ Удалено ${deleted} мусорных записей! Обновите страницу игры.`);
}

cleanOrphans().catch(console.error);
