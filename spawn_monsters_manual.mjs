const PB_URL = 'http://185.126.114.231:8090';
const ADMIN_EMAIL = 'admin@basingse.game';
const ADMIN_PASS = 'BaSingSe2024';

// Monster IDs from App.tsx
const GORYNYCH_ID = 70003;
const KILLING_HUT_ID = 70001;
const KIND_SANTA_ID = 70002;
const KOLOBOK_ID = 70004;
const BABA_YAGA_ID = 70005;
const BRONEKUR_ID = 70006;

const ZONES_X = 5;
const ZONES_Y = 5;
const ZONE_SIZE = 40;

async function spawnMonsters() {
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

  // Get all existing buildings to check occupied positions
  console.log('\n🔍 Загружаем существующие здания...');
  const buildingsRes = await fetch(PB_URL + '/api/collections/buildings/records?perPage=1000', {
    headers: { Authorization: token }
  });
  const buildingsData = await buildingsRes.json();
  const allBuildings = buildingsData.items || [];
  
  // Get resources
  const resourcesRes = await fetch(PB_URL + '/api/collections/resources/records?perPage=1000', {
    headers: { Authorization: token }
  });
  const resourcesData = await resourcesRes.json();
  const allResources = resourcesData.items || [];
  
  console.log(`   Зданий: ${allBuildings.length}, Ресурсов: ${allResources.length}`);

  // Monster configuration: 2 of each type per zone (regular monsters)
  const monsterConfig = [
    { typeId: GORYNYCH_ID, count: 2, name: 'горыныч', hp: 500 },
    { typeId: KILLING_HUT_ID, count: 2, name: 'избушка', hp: 300 },
    { typeId: KIND_SANTA_ID, count: 2, name: 'санта', hp: 400 },
    { typeId: KOLOBOK_ID, count: 2, name: 'колобок', hp: 60 },
    { typeId: BABA_YAGA_ID, count: 2, name: 'бабаяга', hp: 80 }
  ];
  
  // Boss monster: 1 per zone
  const bossMonsterConfig = [
    { typeId: BRONEKUR_ID, count: 1, name: 'бронекур', hp: 33768, isBoss: true }
  ];

  let spawnedCount = 0;
  let failedCount = 0;

  // Get all zones (0_0 to 4_4)
  for (let zoneX = 0; zoneX < ZONES_X; zoneX++) {
    for (let zoneY = 0; zoneY < ZONES_Y; zoneY++) {
      const zoneId = `${zoneX}_${zoneY}`;
      
      // Get occupied positions in this zone
      const occupiedInZone = new Set([
        ...allResources
          .filter(r => r.zoneId === zoneId)
          .map(r => `${r.x},${r.y}`),
        ...allBuildings
          .filter(b => b.zoneId === zoneId && (b.hp === undefined || b.hp > 0))
          .map(b => `${b.x},${b.y}`)
      ]);
      
      // Check each monster type for this zone
      for (const config of monsterConfig) {
        // Count existing monsters of this type in this zone
        const existingMonsters = allBuildings.filter(b => 
          b.buildingId === config.typeId && 
          (b.ownerId === "-1" || b.ownerId === "monster") &&
          b.zoneId === zoneId &&
          (b.hp === undefined || b.hp > 0)
        );

        // If we have less than required, spawn missing ones
        if (existingMonsters.length < config.count) {
          const missingCount = config.count - existingMonsters.length;
          
          for (let i = 0; i < missingCount; i++) {
            const monsterIndex = existingMonsters.length + i + 1;
            
            // Find a valid spawn position in this zone FIRST
            const zoneStartX = zoneX * ZONE_SIZE;
            const zoneStartY = zoneY * ZONE_SIZE;
            
            let spawnX, spawnY, key;
            let found = false;
            const maxTries = 300;
            
            for (let tries = 0; tries < maxTries; tries++) {
              spawnX = zoneStartX + Math.floor(Math.random() * ZONE_SIZE);
              spawnY = zoneStartY + Math.floor(Math.random() * ZONE_SIZE);
              key = `${spawnX},${spawnY}`;
              
              if (!occupiedInZone.has(key)) {
                found = true;
                occupiedInZone.add(key); // Mark as occupied for next spawn
                break;
              }
            }
            
            if (!found) {
              console.log(`   ⚠️ Нет свободного места в зоне ${zoneId}`);
              continue;
            }
            
            // Generate unique ID (must be exactly 15 characters for PocketBase)
            const idBase = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
            const monsterId = idBase.padEnd(15, '0').substring(0, 15);
            
            // Check if monster with same position already exists
            const existingAtPos = allBuildings.find(b => 
              b.x === spawnX && b.y === spawnY && 
              b.buildingId === config.typeId
            );
            if (existingAtPos) {
              console.log(`   ⏭️ Монстр уже есть на позиции (${spawnX},${spawnY})`);
              continue;
            }
              const newMonster = {
                id: monsterId,
                x: spawnX,
                y: spawnY,
                zoneId: zoneId,
                buildingId: config.typeId,
                ownerId: "monster",
                ownerName: "Монстр",
                isConstructing: false,
                constructionEndTime: 0,
                type: "default",
                workState: 'idle',
                hp: config.hp,
                maxHp: config.hp,
                lastMoveTime: Date.now(),
                isActive: true,
                monsterType: config.name,
                monsterSlot: monsterIndex
              };
              
              try {
                const createRes = await fetch(PB_URL + '/api/collections/buildings/records', {
                  method: 'POST',
                  headers: { 
                    Authorization: token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(newMonster)
                });
                
                if (createRes.ok) {
                  console.log(`   ✅ ${monsterId} заспавнен на (${spawnX}, ${spawnY}) в зоне ${zoneId}`);
                  spawnedCount++;
                } else {
                  const errorText = await createRes.text();
                  console.log(`   ❌ Ошибка создания ${monsterId}: ${createRes.status} - ${errorText.substring(0, 100)}`);
                  failedCount++;
                }
              } catch (err) {
                console.log(`   ❌ Ошибка сети для ${monsterId}: ${err.message}`);
                failedCount++;
              }
          }
        }
      }
      
      // Spawn boss monsters (Bronekur) - 1 per zone
      for (const config of bossMonsterConfig) {
        // Count existing boss monsters of this type in this zone
        const existingBosses = allBuildings.filter(b => 
          b.buildingId === config.typeId && 
          (b.ownerId === "-1" || b.ownerId === "monster") &&
          b.zoneId === zoneId &&
          (b.hp === undefined || b.hp > 0)
        );

        // If we have less than required, spawn missing ones
        if (existingBosses.length < config.count) {
          const missingCount = config.count - existingBosses.length;
          
          for (let i = 0; i < missingCount; i++) {
            const monsterIndex = existingBosses.length + i + 1;
            
            // Find a valid spawn position in this zone FIRST
            const zoneStartX = zoneX * ZONE_SIZE;
            const zoneStartY = zoneY * ZONE_SIZE;
            
            let spawnX, spawnY, key;
            let found = false;
            const maxTries = 300;
            
            for (let tries = 0; tries < maxTries; tries++) {
              spawnX = zoneStartX + Math.floor(Math.random() * ZONE_SIZE);
              spawnY = zoneStartY + Math.floor(Math.random() * ZONE_SIZE);
              key = `${spawnX},${spawnY}`;
              
              if (!occupiedInZone.has(key)) {
                found = true;
                occupiedInZone.add(key); // Mark as occupied for next spawn
                break;
              }
            }
            
            if (!found) {
              console.log(`   ⚠️ Нет свободного места для босса в зоне ${zoneId}`);
              continue;
            }
            
            // Generate unique ID (must be exactly 15 characters for PocketBase)
            const idBase = `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`;
            const monsterId = idBase.padEnd(15, '0').substring(0, 15);
            
            // Check if monster with same position already exists
            const existingAtPos = allBuildings.find(b => 
              b.x === spawnX && b.y === spawnY && 
              b.buildingId === config.typeId
            );
            if (existingAtPos) {
              console.log(`   ⏭️ Босс уже есть на позиции (${spawnX},${spawnY})`);
              continue;
            }
              const newMonster = {
                id: monsterId,
                x: spawnX,
                y: spawnY,
                zoneId: zoneId,
                buildingId: config.typeId,
                ownerId: "monster",
                ownerName: "Монстр",
                isConstructing: false,
                constructionEndTime: 0,
                type: "default",
                workState: 'idle',
                hp: config.hp,
                maxHp: config.hp,
                lastMoveTime: Date.now(),
                isActive: true,
                monsterType: config.name,
                monsterSlot: monsterIndex,
                isBoss: true
              };
              
              try {
                const createRes = await fetch(PB_URL + '/api/collections/buildings/records', {
                  method: 'POST',
                  headers: { 
                    Authorization: token,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(newMonster)
                });
                
                if (createRes.ok) {
                  console.log(`   ✅ БОСС ${monsterId} заспавнен на (${spawnX}, ${spawnY}) в зоне ${zoneId}`);
                  spawnedCount++;
                } else {
                  const errorText = await createRes.text();
                  console.log(`   ❌ Ошибка создания босса ${monsterId}: ${createRes.status} - ${errorText.substring(0, 100)}`);
                  failedCount++;
                }
              } catch (err) {
                console.log(`   ❌ Ошибка сети для босса ${monsterId}: ${err.message}`);
                failedCount++;
              }
          }
        }
      }
    }
  }

  console.log(`\n✅ СПАВН ЗАВЕРШЕН!`);
  console.log(`   Заспавнено: ${spawnedCount}`);
  console.log(`   Ошибок: ${failedCount}`);
  console.log(`   Всего должно быть: ${ZONES_X * ZONES_Y * 11} монстров (2 обычных каждого типа + 1 босс в каждой зоне)`);
}

spawnMonsters().catch(err => {
  console.error('❌ Критическая ошибка:', err);
  process.exit(1);
});
