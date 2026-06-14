const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function checkMonsters() {
  console.log('🔑 Авторизуемся в PocketBase...');
  const authRes = await fetch(PB_URL + '/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS })
  });
  const authData = await authRes.json();
  const token = authData.token;
  
  if (!token) { 
    console.error('❌ Ошибка авторизации'); 
    return; 
  }
  console.log('✅ Авторизован успешно!');

  // Check monsters
  console.log('\n🔍 Проверяем монстров в базе...');
  const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1`, {
    headers: { Authorization: token }
  });
  const data = await res.json();
  const totalCount = data.totalItems || 0;
  
  console.log(`📊 Всего монстров в базе: ${totalCount}`);
  
  if (totalCount > 0) {
    // Get first 10 to see their IDs
    const sampleRes = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=10&page=1`, {
      headers: { Authorization: token }
    });
    const sampleData = await sampleRes.json();
    
    console.log('\n📋 Примеры монстров:');
    sampleData.items.forEach((monster, idx) => {
      console.log(`  ${idx + 1}. ID: ${monster.id}, Zone: ${monster.zoneId}, Type: ${monster.buildingId}, Pos: (${monster.x}, ${monster.y})`);
    });
    
    if (totalCount > 150) {
      console.log(`\n⚠️ ВНИМАНИЕ: Монстров больше чем должно быть (150)!`);
      console.log(`   Нужно удалить еще ${totalCount - 150} монстров`);
    } else if (totalCount === 0) {
      console.log('\n✅ База очищена! Перезапустите игру для спавна новых монстров.');
    } else {
      console.log(`\n✅ Монстров в базе: ${totalCount} (ожидаем 150 после полного спавна)`);
    }
  }
  
  // Check total buildings
  console.log('\n🔍 Проверяем все здания...');
  const allRes = await fetch(PB_URL + `/api/collections/buildings/records?perPage=1&page=1`, {
    headers: { Authorization: token }
  });
  const allData = await allRes.json();
  console.log(`📊 Всего зданий в базе: ${allData.totalItems || 0}`);
}

checkMonsters().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
