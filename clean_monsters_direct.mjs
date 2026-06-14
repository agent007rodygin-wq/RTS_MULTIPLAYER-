const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function cleanAllMonsters() {
  console.log('🔑 Авторизуемся в PocketBase...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;
  
  if (!token) { 
    console.error('❌ Ошибка авторизации:', authData); 
    return; 
  }
  console.log('✅ Авторизован успешно!');

  // Find all monsters (ownerId = "monster" or ownerId = "-1")
  console.log('\n🔍 Ищем всех монстров на карте...');
  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=500&page=1`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  const monsters = data.items || [];
  console.log(`📊 Найдено монстров: ${monsters.length}`);

  if (monsters.length === 0) {
    console.log('✅ Монстров нет - удалять нечего!');
    return;
  }

  // Count by type
  const typeCount = {};
  monsters.forEach(m => {
    const typeName = m.buildingId === 70001 ? 'Избушка' : m.buildingId === 70002 ? 'Санта' : m.buildingId === 70003 ? 'Горыныч' : `Другой(${m.buildingId})`;
    typeCount[typeName] = (typeCount[typeName] || 0) + 1;
  });
  console.log('\n📈 Распределение по типам:');
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Count by zone
  const zoneCount = {};
  monsters.forEach(m => {
    const zone = m.zoneId || 'unknown';
    zoneCount[zone] = (zoneCount[zone] || 0) + 1;
  });
  console.log('\n🗺️ Распределение по секторам (первые 10):');
  Object.entries(zoneCount).sort().slice(0, 10).forEach(([zone, count]) => {
    console.log(`   Сектор ${zone}: ${count} монстров`);
  });

  // Delete all monsters in batches
  console.log('\n🗑️ Удаляем всех монстров...');
  let deleted = 0;
  let failed = 0;

  for (let i = 0; i < monsters.length; i++) {
    const monster = monsters[i];
    try {
      const delRes = await fetch(PB_URL + `/api/collections/buildings/records/${monster.id}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      
      if (delRes.ok || delRes.status === 204) {
        deleted++;
        if (deleted % 50 === 0) {
          console.log(`   Удалено: ${deleted}/${monsters.length}...`);
        }
      } else {
        failed++;
        console.warn(`⚠️ Не удалось удалить монстра ${monster.id} (status: ${delRes.status})`);
      }
    } catch (err) {
      failed++;
      console.warn(`⚠️ Ошибка при удалении монстра ${monster.id}:`, err.message);
    }
  }

  console.log(`\n✅ Готово!`);
  console.log(`   Удалено: ${deleted}`);
  console.log(`   Ошибок: ${failed}`);
  
  // Verify deletion
  console.log('\n🔍 Проверяем результат...');
  const verifyRes = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1`, {
    headers: { Authorization: token }
  });
  const verifyData = await verifyRes.json();
  const remaining = verifyData.totalItems || 0;
  
  if (remaining === 0) {
    console.log('✅ Все монстры успешно удалены!');
  } else {
    console.log(`⚠️ Осталось монстров: ${remaining}`);
  }
  
  console.log(`\n🎮 Теперь обновите страницу игры!`);
  console.log(`   Новый спавнер создаст максимум 150 монстров (6 на сектор × 25 секторов)`);
}

cleanAllMonsters().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
