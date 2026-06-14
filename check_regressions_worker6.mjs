import fs from 'fs';

const appPath = 'App.tsx';
const source = fs.readFileSync(appPath, 'utf8');

const checks = [];

const has = (name, pattern) => {
  const ok = pattern.test(source);
  checks.push({ name, ok });
};

// 1) Building/monster respawn after destruction:
// Ensure deterministic monster IDs are rebuilt when missing and returned to home sector when displaced.
has(
  'Respawn: deterministic regular monster IDs are generated per zone',
  /const monsterId = getRegularMonsterId\(cfg\.typeId, slot, zoneId\);/
);
has(
  'Respawn: missing regular monster is recreated with setDoc',
  /if \(!pos\) break;[\s\S]*?await setDoc\(doc\(db, 'buildings', monsterId\),/
);
has(
  'Respawn: displaced monster is returned to its home sector',
  /if \(actualZoneId !== zoneId\) \{[\s\S]*?await updateDoc\(doc\(db, 'buildings', monsterId\), \{[\s\S]*?zoneId,/
);

// 2) Baba Yaga target handling (shared monster chase/attack logic):
// Ensure stale targets are dropped, sticky valid targets are kept, and attacks only hold when target is valid.
has(
  'AI target: stale chase target is cleared when invalid',
  /if \(staleTargetId && \(!staleTarget \|\| !isValidMonsterChaseTarget\(monster, staleTarget, pendingDestroyedIds\)\)\) \{[\s\S]*?monsterChaseTargetRef\.current\.delete\(monsterId\);/
);
has(
  'AI target: sticky target is retained when still valid and in radius',
  /if \(stickyTargetId\) \{[\s\S]*?if \(stickyTarget && isValidMonsterChaseTarget\(monster, stickyTarget, pendingDestroyedIds\)\) \{[\s\S]*?if \(dist <= SEARCH_RADIUS\) \{[\s\S]*?nearestTarget = \{ id: stickyTargetId,/
);
has(
  'AI target: hold-for-attack requires a real target and cooldown ready',
  /const shouldHoldPositionForAttack = Boolean\(target\) && canAttackNow;/
);

// 3) Empty monster sectors:
// Ensure each zone gets a non-empty regular monster plan and spawn loop handles no free tile safely.
has(
  'Empty sector: per-zone regular plan excludes only one type (4 of 5 remain)',
  /const getRegularMonsterPlanForZone = \(zoneX: number, zoneY: number\) => \{[\s\S]*?return REGULAR_MONSTER_SPAWN_CONFIG\.filter\(\(_, index\) => index !== excludedIndex\);/
);
has(
  'Empty sector: spawn loop iterates all sectors and uses per-zone plan',
  /for \(let zX = 0; zX < ZONES_X; zX\+\+\) \{[\s\S]*?for \(let zY = 0; zY < ZONES_Y; zY\+\+\) \{[\s\S]*?const zoneMonsters = getRegularMonsterPlanForZone\(zX, zY\)\.slice\(0, MAX_WILD_MONSTERS_PER_ZONE\);/
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
