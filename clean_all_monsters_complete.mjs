const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function cleanAllMonstersComplete() {
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

  // Get total count first
  console.log('\n🔍 Считаем всех монстров...');
  const countRes = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1`, {
    headers: { Authorization: token }
  });
  const countData = await countRes.json();
  const totalCount = countData.totalItems || 0;
  console.log(`📊 Всего монстров для удаления: ${totalCount}`);

  if (totalCount === 0) {
    console.log('✅ Монстров нет!');
    return;
  }

  // Delete in pages of 500
  let deletedTotal = 0;
  let failedTotal = 0;
  let page = 1;
  const perPage = 500;

  while (deletedTotal + failedTotal < totalCount) {
    console.log(`\n📄 Загружаем страницу ${page}...`);
    
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=${perPage}&page=${page}`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    const monsters = data.items || [];
    
    if (monsters.length === 0) {
      console.log('✅ Больше монстров нет');
      break;
    }

    console.log(`   Найдено ${monsters.length} монстров на странице`);

    // Delete all monsters on this page
    for (const monster of monsters) {
      try {
        const delRes = await fetch(PB_URL + `/api/collections/buildings/records/${monster.id}`, {
          method: 'DELETE',
          headers: { Authorization: token }
        });
        
        if (delRes.ok || delRes.status === 204) {
          deletedTotal++;
        } else {
          failedTotal++;
        }
      } catch (err) {
        failedTotal++;
      }
    }

    console.log(`   ✅ Удалено всего: ${deletedTotal} (ошибок: ${failedTotal})`);
    page++;
    
    // Small delay to avoid overwhelming the server
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n✅ УДАЛЕНИЕ ЗАВЕРШЕНО!`);
  console.log(`   Удалено: ${deletedTotal}`);
  console.log(`   Ошибок: ${failedTotal}`);
  
  // Final verification
  console.log('\n🔍 Финальная проверка...');
  const verifyRes = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1`, {
    headers: { Authorization: token }
  });
  const verifyData = await verifyRes.json();
  const remaining = verifyData.totalItems || 0;
  
  if (remaining === 0) {
    console.log('✅✅✅ ВСЕ МОНСТРЫ УСПЕШНО УДАЛЕНЫ! ✅✅✅');
  } else {
    console.log(`⚠️ Осталось монстров: ${remaining} (возможно нужно запустить еще раз)`);
  }
}

cleanAllMonstersComplete().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
