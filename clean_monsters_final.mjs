const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

async function cleanMonstersLoop() {
  console.log('🔑 Авторизуемся...');
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
  console.log('✅ Готово!\n');

  let iteration = 1;
  
  while (true) {
    // Check count
    const countRes = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=1&page=1`, {
      headers: { Authorization: token }
    });
    const countData = await countRes.json();
    const totalCount = countData.totalItems || 0;
    
    if (totalCount === 0) {
      console.log(`\n✅✅✅ ИТЕРАЦИЯ ${iteration}: МОНСТРОВ БОЛЬШЕ НЕТ! ✅✅✅`);
      break;
    }
    
    console.log(`\n🔄 ИТЕРАЦИЯ ${iteration}: Найдено ${totalCount} монстров`);
    
    // Delete first page
    const res = await fetch(PB_URL + `/api/collections/buildings/records?filter=(ownerId='monster'||ownerId='-1')&perPage=500&page=1`, {
      headers: { Authorization: token }
    });
    const data = await res.json();
    const monsters = data.items || [];
    
    let deleted = 0;
    for (const monster of monsters) {
      try {
        await fetch(PB_URL + `/api/collections/buildings/records/${monster.id}`, {
          method: 'DELETE',
          headers: { Authorization: token }
        });
        deleted++;
      } catch (e) {}
    }
    
    console.log(`   Удалено: ${deleted}`);
    iteration++;
    
    await new Promise(r => setTimeout(r, 200));
  }
}

cleanMonstersLoop().catch(console.error);
