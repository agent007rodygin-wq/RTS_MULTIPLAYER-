$path = "C:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\App.tsx"
$lines = Get-Content -Path $path -Encoding UTF8

# Monster targeting replacement
$startIndex = -1
for ($i = 3200; $i -lt 3300; $i++) {
    if ($lines[$i] -match "const possibleTargets = currentBuildings\.filter") {
        $startIndex = $i
        break
    }
}
$endIndex = -1
if ($startIndex -ge 0) {
    for ($i = $startIndex; $i -lt $startIndex + 50; $i++) {
        if ($lines[$i] -match "if \(!target && possibleTargets\.length > 0\)") {
            $endIndex = $i
            break
        }
    }
}

if ($startIndex -ge 0 -and $endIndex -ge $startIndex) {
$newTargetingLines = @(
"                    const hates = monsterInfo?.stats.hates;",
"                    ",
"                    let target: PlacedBuilding | undefined = undefined;",
"                    ",
"                    // 1. Check for immediate neighbors first (adjacent attacking)",
"                    const adjacentTargets = currentBuildings.filter(t =>",
"                        neighbors.some(n => n.x === t.x && n.y === t.y) &&",
"                        t.ownerId !== monster.ownerId &&",
"                        !t.isConstructing &&",
"                        buildingData.find(i => i.id === t.buildingId)?.category !== 'Природа'",
"                    );",
"",
"                    target = adjacentTargets.find(t => {",
"                        const info = buildingData.find(i => i.id === t.buildingId);",
"                        return hates && info?.category === hates;",
"                    }) || adjacentTargets[0];"
)
    $lines = $lines[0..($startIndex-1)] + $newTargetingLines + $lines[($endIndex+1)..($lines.Length-1)]
}

# Fix Monster movement (seeker logic)
$moveStartIdx = -1
for ($i = 3270; $i -lt 3350; $i++) {
    if ($lines[$i] -match "const validMoves = neighbors\.filter") {
        $moveStartIdx = $i
        break
    }
}
$moveEndIdx = -1
if ($moveStartIdx -ge 0) {
    for ($i = $moveStartIdx; $i -lt $moveStartIdx + 50; $i++) {
        if ($i -lt $lines.Length -and $lines[$i] -match " monster\.lastMoveTime = now;" -and $lines[$i-1] -match "monsterUpdates\.set") {
            $moveEndIdx = $i + 1
            if ($moveEndIdx -lt $lines.Length -and $lines[$moveEndIdx] -match "updateDoc") {
               for ($j = $moveEndIdx; $j -lt $moveEndIdx + 10; $j++) {
                   if ($j -lt $lines.Length -and $lines[$j] -match "\}\)\.catch") { $moveEndIdx = $j + 2; break }
               }
            }
            break
        }
    }
}

if ($moveStartIdx -ge 0 -and $moveEndIdx -ge $moveStartIdx) {
$newMovementLines = @(
'                        // 2. No adjacent target. Look for "Hated" buildings in a 2-tile radius to move towards them',
'                        const seekerRange = 2;',
'                        const nearbyTargets = currentBuildings.filter(t => {',
'                            const dist = Math.max(Math.abs(t.x - monster.x), Math.abs(t.y - monster.y));',
'                            if (dist > seekerRange || t.ownerId === monster.ownerId || t.isConstructing) return false;',
'                            const info = buildingData.find(i => i.id === t.buildingId);',
'                            return info?.category !== "Природа";',
'                        });',
'',
'                        const prioritizedMoveTarget = nearbyTargets.find(t => {',
'                            const info = buildingData.find(i => i.id === t.buildingId);',
'                            return hates && info?.category === hates;',
'                        }) || nearbyTargets[0];',
'',
'                        // Simplified movement towards prioritized target',
'                        let nextMove = null;',
'                        if (prioritizedMoveTarget) {',
'                            const dx = Math.sign(prioritizedMoveTarget.x - monster.x);',
'                            const dy = Math.sign(prioritizedMoveTarget.y - monster.y);',
'                            ',
'                            const moves = [];',
'                            if (dx !== 0) moves.push({ x: monster.x + dx, y: monster.y });',
'                            if (dy !== 0) moves.push({ x: monster.x, y: monster.y + dy });',
'                            ',
'                            nextMove = moves.find(m => !occupiedPositions.has(`${m.x},${m.y}`));',
'                        }',
'',
'                        if (!nextMove) {',
'                            const validMoves = neighbors.filter(move =>',
'                                move.x >= 0 && move.x < WORLD_WIDTH_TILES &&',
'                                move.y >= 0 && move.y < WORLD_HEIGHT_TILES &&',
'                                !occupiedPositions.has(`${move.x},${move.y}`)',
'                            );',
'                            if (validMoves.length > 0) {',
'                                nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];',
'                            }',
'                        }',
'',
'                        if (nextMove) {',
'                            occupiedPositions.add(`${nextMove.x},${nextMove.y}`);',
'                            occupiedPositions.delete(`${monster.x},${monster.y}`);',
'',
'                            const newMonsterState = { ...monster, x: nextMove.x, y: nextMove.y, lastMoveTime: now, hostId: userRef.current?.uid || null };',
'                            monsterUpdates.set(`${monster.x},${monster.y}`, newMonsterState);',
'                            monster.lastMoveTime = now;',
'',
'                            if (monster.ownerId === "monster" || monster.ownerId === "0" || (isAuthReadyRef.current && userRef.current && monster.ownerId === userRef.current.uid)) {',
'                                const docId = String(monster.id);',
'                                updateDoc(doc(db, "buildings", docId), {',
'                                    x: nextMove.x,',
'                                    y: nextMove.y,',
'                                    lastMoveTime: now,',
'                                    hostId: userRef.current?.uid || null',
'                                }).catch(e => handleGameLoopError(e, OperationType.UPDATE, `buildings/${docId}`));',
'                            }',
'                        }'
)
    $lines = $lines[0..($moveStartIdx-1)] + $newMovementLines + $lines[($moveEndIdx)..($lines.Length-1)]
}

# Fix Cannon logic target/range
$cannonStartIdx = -1
for ($i = 3300; $i -lt 3450; $i++) {
    if ($lines[$i] -match "const monsters = currentBuildings\.filter") {
        $cannonStartIdx = $i
        break
    }
}
$cannonEndIdx = -1
if ($cannonStartIdx -ge 0) {
    for ($i = $cannonStartIdx; $i -lt $cannonStartIdx + 150; $i++) {
        if ($lines[$i] -match "newExplosions\.push" -and $lines[$i+11] -match "\}\);") {
            $cannonEndIdx = $i + 12
            # Check for another ending if needed, but this looks like the shot block
            break
        }
    }
}

# Write results
$lines | Set-Content -Path $path -Encoding UTF8
