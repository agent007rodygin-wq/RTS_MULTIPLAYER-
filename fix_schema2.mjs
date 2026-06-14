// fix_schema2.mjs — add 'data' JSON field to all collections
const PB_URL = 'http://185.126.114.231:8090';

async function main() {
  console.log('🔐 Авторизация...');
  const authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@basingse.game', password: 'BaSingSe2024' }),
  });
  const authData = await authRes.json();
  const token = authData.token;

  const colsRes = await fetch(`${PB_URL}/api/collections`, { headers: { Authorization: token } });
  const colsData = await colsRes.json();
  const collections = colsData.items || colsData;

  const targets = ['buildings','chat_messages','presence','clans','market','map_resources','dropped_items','map_state','private_messages'];

  for (const colName of targets) {
    const col = collections.find(c => c.name === colName);
    if (!col) continue;
    const fields = col.fields || [];
    if (fields.find(f => f.name === 'data')) {
      console.log(`✅ "${colName}" — поле 'data' уже есть.`);
      continue;
    }
    fields.push({ name: 'data', type: 'json' });
    const res = await fetch(`${PB_URL}/api/collections/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify({ fields }),
    });
    console.log(res.ok ? `✅ "${colName}" — добавлено поле 'data'` : `❌ "${colName}" ошибка: ${await res.text()}`);
  }
  console.log('\n🎉 Готово!');
}
main().catch(console.error);
