$path = "C:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\App.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# Broaden Monster AI targeting
$oldTargeting = @"
                    const possibleTargets = currentBuildings.filter\(t =>
                        neighbors.some\(n => n.x === t.x && n.y === t.y\) &&
                        t.ownerId !== monster.ownerId &&
                        !t.isConstructing &&
                        buildingData.find\(i => i.id === t.buildingId\)\?.category !== 'Природа'
                    \);

                    let target = possibleTargets.find\(t => {
                        const info = buildingData.find\(i => i.id === t.buildingId\);
                        const hates = monsterInfo\?.stats.hates;
                        if \(hates && info\?.category === hates\) return true;
                        if \(info\?.category !== 'Природа'\) return true;
                        return false;
                    }\);
                    if \(!target && possibleTargets.length > 0\) target = possibleTargets\[0\];
"@

$newTargeting = @"
                    const hates = monsterInfo?.stats.hates;
                    
                    let target: PlacedBuilding | undefined = undefined;
                    
                    // 1. Check for immediate neighbors first (adjacent attacking)
                    const adjacentTargets = currentBuildings.filter(t =>
                        neighbors.some(n => n.x === t.x && n.y === t.y) &&
                        t.ownerId !== monster.ownerId &&
                        !t.isConstructing &&
                        buildingData.find(i => i.id === t.buildingId)?.category !== 'Природа'
                    );

                    target = adjacentTargets.find(t => {
                        const info = buildingData.find(i => i.id === t.buildingId);
                        return hates && info?.category === hates;
                    }) || adjacentTargets[0];
"@

# Fix movement logic
$oldMovement = @"
                        const validMoves = neighbors.filter\(move =>
                            move.x >= 0 && move.x < WORLD_WIDTH_TILES &&
                            move.y >= 0 && move.y < WORLD_HEIGHT_TILES &&
                            !occupiedPositions.has\(`\$\{move.x\},\$\{move.y\}`\)
                        \);

                        if \(validMoves.length > 0\) {
                            const randomMove = validMoves\[Math.floor\(Math.random\(\) \* validMoves.length\)\];
                            occupiedPositions.add\(`\$\{randomMove.x\},\$\{randomMove.y\}`\);
                            occupiedPositions.delete\(`\$\{monster.x\},\$\{monster.y\}`\);

                            const newMonsterState = { ...monster, x: randomMove.x, y: randomMove.y, lastMoveTime: now, hostId: userRef.current\?.uid || null };
                            monsterUpdates.set\(`\$\{monster.x\},\$\{monster.y\}`, newMonsterState\);
                            monster.lastMoveTime = now;

                            if \(monster.ownerId === "monster" || monster.ownerId === "0" || \(isAuthReadyRef.current && userRef.current && monster.ownerId === userRef.current.uid\)\) {
                                const docId = String\(monster.id\);
                                updateDoc\(doc\(db, 'buildings', docId\), {
                                    x: randomMove.x,
                                    y: randomMove.y,
                                    lastMoveTime: now,
                                    hostId: userRef.current\?.uid || null
                                }\).catch\(e => handleGameLoopError\(e, OperationType.UPDATE, `buildings/\$\{docId\}`\)\);
                            }
                        }
"@

$newMovement = @"
                        // 2. No adjacent target. Look for "Hated" buildings in a 2-tile radius to move towards them
                        const seekerRange = 2;
                        const nearbyTargets = currentBuildings.filter(t => {
                            const dist = Math.max(Math.abs(t.x - monster.x), Math.abs(t.y - monster.y));
                            if (dist > seekerRange || t.ownerId === monster.ownerId || t.isConstructing) return false;
                            const info = buildingData.find(i => i.id === t.buildingId);
                            return info?.category !== 'Природа';
                        });

                        const prioritizedMoveTarget = nearbyTargets.find(t => {
                            const info = buildingData.find(i => i.id === t.buildingId);
                            return hates && info?.category === hates;
                        }) || nearbyTargets[0];

                        // Simplified movement towards prioritized target
                        let nextMove = null;
                        if (prioritizedMoveTarget) {
                            const dx = Math.sign(prioritizedMoveTarget.x - monster.x);
                            const dy = Math.sign(prioritizedMoveTarget.y - monster.y);
                            
                            const moves = [];
                            if (dx !== 0) moves.push({ x: monster.x + dx, y: monster.y });
                            if (dy !== 0) moves.push({ x: monster.x, y: monster.y + dy });
                            
                            nextMove = moves.find(m => !occupiedPositions.has(`${m.x},${m.y}`));
                        }

                        if (!nextMove) {
                            const validMoves = neighbors.filter(move =>
                                move.x >= 0 && move.x < WORLD_WIDTH_TILES &&
                                move.y >= 0 && move.y < WORLD_HEIGHT_TILES &&
                                !occupiedPositions.has(`${move.x},${move.y}`)
                            );
                            if (validMoves.length > 0) {
                                nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                            }
                        }

                        if (nextMove) {
                            occupiedPositions.add(`${nextMove.x},${nextMove.y}`);
                            occupiedPositions.delete(`${monster.x},${monster.y}`);

                            const newMonsterState = { ...monster, x: nextMove.x, y: nextMove.y, lastMoveTime: now, hostId: userRef.current?.uid || null };
                            monsterUpdates.set(`${monster.x},${monster.y}`, newMonsterState);
                            monster.lastMoveTime = now;

                            if (monster.ownerId === "monster" || monster.ownerId === "0" || (isAuthReadyRef.current && userRef.current && monster.ownerId === userRef.current.uid)) {
                                const docId = String(monster.id);
                                updateDoc(doc(db, 'buildings', docId), {
                                    x: nextMove.x,
                                    y: nextMove.y,
                                    lastMoveTime: now,
                                    hostId: userRef.current?.uid || null
                                }).catch(e => handleGameLoopError(e, OperationType.UPDATE, `buildings/${docId}`));
                            }
                        }
"@

# Fix Cannon Range and visual feedback
$oldCannon = @"
                    let range = 1;
                    const bId = Number\(cannon.buildingId\);
                    if \(bId === CANNON_ID\) range = 1;
                    else if \(bId === 701\) range = 1;
                    else if \(bId === PROTECTED_TOWER_ID\) range = 6;
                    else if \(bId === WATCHTOWER_ID\) range = 4;
"@

$newCannon = @"
                    let range = 1;
                    const bId = Number(cannon.buildingId);
                    if (bId === CANNON_ID || bId === 701) range = 1;
                    else if (bId === PROTECTED_TOWER_ID) range = 6;
                    else if (bId === WATCHTOWER_ID) range = 4;
"@

# Perform replacements using Regex for escaping characters
$escapedOldTargeting = [Regex]::Escape($oldTargeting).Replace('\(t', '(t').Replace('\)', ')').Replace('\?', '?').Replace('\[', '[').Replace('\]', ']')
# Actually, I'll just use literal string replacement for simplicity if possible, but the escaping is tricky.
# Power Shell 7+ has -replace with literal option? No.
# I'll use [string]::Replace(old, new) which is literal.

$content = $content.Replace($oldTargeting, $newTargeting)
$content = $content.Replace($oldMovement, $newMovement)
$content = $content.Replace($oldCannon, $newCannon)

# Write back
$content | Set-Content -Path $path -Encoding UTF8
