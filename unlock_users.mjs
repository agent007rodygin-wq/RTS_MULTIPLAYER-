const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function unlock() {
  console.log('🔑 Авторизуемся как admin...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const { token } = await authRes.json();
  if (!token) {
    console.error('❌ Не удалось авторизоваться');
    return;
  }
  console.log('✅ Авторизован! Обновляем правила...');

  // Rule: any logged-in user can see and update other users (needed for reputation + profile view)
  const rule = '@request.auth.id != ""';

  const res = await fetch(PB_URL + '/api/collections/users', {
    method: 'PATCH',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listRule: rule,
      viewRule: rule,
      createRule: rule,
      updateRule: rule,
    })
  });

  const data = await res.json();
  if (res.ok) {
    console.log('🔥 СЕРВЕР РАЗБЛОКИРОВАН!');
    console.log(`  listRule:   ${data.listRule}`);
    console.log(`  viewRule:   ${data.viewRule}`);
    console.log(`  createRule: ${data.createRule}`);
    console.log(`  updateRule: ${data.updateRule}`);
    console.log('\n✅ Теперь обновите страницу игры — ошибки 404 исчезнут!');
  } else {
    console.error('❌ Ошибка:', JSON.stringify(data, null, 2));
  }
}

unlock().catch(console.error);
