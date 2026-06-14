$file = "App.tsx"
$lines = Get-Content $file -Encoding UTF8

# Find the line index of "// Process cannons" (0-based)
$startIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^\s*// Process cannons') {
        $startIdx = $i
        break
    }
}

if ($startIdx -lt 0) {
    Write-Host "ERROR: Could not find '// Process cannons' block"
    exit 1
}

Write-Host "Found '// Process cannons' at line $($startIdx + 1)"

# Find the end of the cannonsAttacking.forEach block
# It ends at the line with just "                });" after the forEach
$endIdx = -1
$depth = 0
$inForEach = $false
for ($i = $startIdx; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'cannonsAttacking\.forEach') {
        $inForEach = $true
    }
    if ($inForEach) {
        foreach ($ch in $lines[$i].ToCharArray()) {
            if ($ch -eq '{') { $depth++ }
            if ($ch -eq '}') { $depth-- }
        }
        if ($depth -eq 0 -and $i -gt $startIdx) {
            $endIdx = $i
            break
        }
    }
}

if ($endIdx -lt 0) {
    Write-Host "ERROR: Could not find end of cannonsAttacking.forEach block"
    exit 1
}

Write-Host "Block spans lines $($startIdx + 1) to $($endIdx + 1)"

# Build replacement lines
$replacement = @(
    '                // Process cannons - attack any monster within range 3',
    '                const monsters = currentBuildings.filter(b => {',
    '                    if (b.isConstructing || b.isDestroying) return false;',
    '                    const info = buildingData.find(i => i.id === b.buildingId);',
    '                    return (info && info.stats.isMonster) || b.ownerId === "monster";',
    '                });',
    '',
    '                if (cannonsAttacking.length > 0) {',
    '                    console.log(`[DEFENSE] ${cannonsAttacking.length} cannons ready. Monsters on map: ${monsters.length}`);',
    '                }',
    '',
    '                cannonsAttacking.forEach(cannon => {',
    '                    const cannonInfo = buildingData.find(i => i.id === cannon.buildingId);',
    '',
    '                    let damage = cannonInfo?.stats.damage ? parseInt(cannonInfo.stats.damage) : 1;',
    '                    if (cannon.buildingId === CANNON_ID) damage = 5;',
    '',
    '                    let targetMonster: PlacedBuilding | null = null;',
    '',
    '                    // Range = 3 tiles (Chebyshev distance)',
    '                    const range = 3;',
    '                    let minDistance = range + 1;',
    '',
    '                    monsters.forEach(monster => {',
    '                        // Do not shoot own monsters',
    '                        if (cannon.ownerId !== "monster" && cannon.ownerId !== "0" && monster.ownerId === cannon.ownerId) return;',
    '                        const dist = Math.max(Math.abs(monster.x - cannon.x), Math.abs(monster.y - cannon.y));',
    '                        if (dist <= range && dist < minDistance) {',
    '                            minDistance = dist;',
    '                            targetMonster = monster;',
    '                        }',
    '                    });',
    '',
    '                    if (targetMonster) {',
    '                        const tm = targetMonster as PlacedBuilding;',
    '                        const targetKey = `${tm.x},${tm.y}`;',
    '                        damageMap.set(targetKey, (damageMap.get(targetKey) || 0) + damage);',
    '                        cannonUpdates.set(`${cannon.x},${cannon.y}`, { ...cannon, lastAttackTime: now });',
    '                        cannon.lastAttackTime = now;',
    '',
    '                        if (cannon.ownerId === "0" || (isAuthReadyRef.current && userRef.current && cannon.ownerId === userRef.current.uid)) {',
    '                            const docId = String(cannon.id);',
    '                            updateDoc(doc(db, "buildings", docId), { lastAttackTime: now }).catch(e => handleGameLoopError(e, OperationType.UPDATE, `buildings/${docId}`));',
    '                        }',
    '                    }',
    '                });'
)

# Replace lines
$newLines = @()
$newLines += $lines[0..($startIdx - 1)]
$newLines += $replacement
$newLines += $lines[($endIdx + 1)..($lines.Length - 1)]

Set-Content -Path $file -Value $newLines -Encoding UTF8
Write-Host "SUCCESS: Cannon block replaced! Lines $($startIdx+1)-$($endIdx+1) -> $($replacement.Length) lines"
Write-Host "New total lines: $($newLines.Length)"
