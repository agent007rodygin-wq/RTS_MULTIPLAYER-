import fs from 'fs';

const appPath = 'App.tsx';
const source = fs.readFileSync(appPath, 'utf8');

const checks = [];

const has = (name, pattern) => {
  const ok = pattern.test(source);
  checks.push({ name, ok });
};

// 1) Building/monster respawn after destruction:
// Ensure deterministic monster IDs are rebuilt when missing and zone metadata is healed to the actual sector when displaced.
has(
  'Respawn: deterministic regular monster IDs are generated per zone',
  /const monsterId = getRegularMonsterId\(cfg\.typeId, slot, zoneId\);/
);
has(
  'Respawn: missing regular monster is recreated with setDoc',
  /if \(!pos\) break;[\s\S]*?await setDoc\(doc\(db, 'buildings', monsterId\),/
);
has(
  'Respawn: displaced monster zoneId is healed to its actual sector',
  /const actualZoneId = existingById\.zoneId \|\| getZoneId\(existingById\.x, existingById\.y\);[\s\S]*?await updateDoc\(doc\(db, 'buildings', monsterId\), \{[\s\S]*?zoneId: actualZoneId[\s\S]*?\}\);/
);

// 2) Baba Yaga target handling (shared monster chase/attack logic):
// Ensure chase selection only uses live targets, adjacent locks are retained while valid, and cooldown gates attacks only.
has(
  'AI target: chase target is recomputed from live buildings only',
  /function getMonsterChaseTarget\([\s\S]*?if \(!isMonsterAttackTargetCandidate\(monster, target, buildingData, options\)\) return;[\s\S]*?return target && isBuildingAlive\(target\) \? target : null;/
);
has(
  'AI target: adjacent target lock is retained while still valid',
  /const preferredTargetId = monsterTargetLockRef\.current\.get\(monsterId\) \|\| null;[\s\S]*?const target = getMonsterAdjacentAttackTarget\(monster, currentBuildings, buildingData, \{[\s\S]*?preferredTargetId,[\s\S]*?\}\);[\s\S]*?monsterTargetLockRef\.current\.set\(monsterId, targetId\);/
);
has(
  'AI target: cooldown gates damage, not movement hold',
  /const canAttackNow = lastAttackTime <= now && \(now - lastAttackTime\) >= MONSTER_ATTACK_INTERVAL_MS;[\s\S]*?const shouldHoldPositionForAttack = Boolean\(target\);/
);

// 3) Empty monster sectors:
// Ensure the world spawn sweep still iterates all sectors and handles no free tile safely.
has(
  'Empty sector: initial monster spawn iterates all sectors safely',
  /for \(let zX = 0; zX < ZONES_X; zX\+\+\) \{[\s\S]*?for \(let zY = 0; zY < ZONES_Y; zY\+\+\) \{[\s\S]*?const pos = findFreeSpot\(zX, zY\);[\s\S]*?if \(!pos\) break;/
);
has(
  'Empty sector: background sweep walks managed zones incrementally',
  /const sweepZoneIds: string\[\] = \[\];[\s\S]*?for \(let i = 0; i < WORLD_MONSTER_SWEEP_ZONES_PER_CYCLE; i\+\+\) \{[\s\S]*?sweepZoneIds\.push\(/
);
has(
  'Empty sector: full sector is handled gracefully without crash',
  /const pos = findFreeSpot\(zX, zY\);[\s\S]*?if \(!pos\) break;/
);

const failed = checks.filter(c => !c.ok);

for (const c of checks) {
  console.log(`${c.ok ? 'PASS' : 'FAIL'}: ${c.name}`);
}

if (failed.length > 0) {
  console.error(`\nRegression diagnostics failed: ${failed.length}/${checks.length} checks.`);
  process.exit(1);
}

console.log(`\nRegression diagnostics passed: ${checks.length}/${checks.length} checks.`);
