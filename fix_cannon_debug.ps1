$file = "App.tsx"
$lines = Get-Content $file -Encoding UTF8

# Find the cannonsAttacking filter
$startIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'const cannonsAttacking = placedBuildingsRef') {
        $startIdx = $i
        break
    }
}

if ($startIdx -lt 0) {
    Write-Host "ERROR: cannonsAttacking not found"
    exit 1
}
Write-Host "Found cannonsAttacking at line $($startIdx + 1)"

# Find closing }); of the filter
$endIdx = -1
$depth = 0
$inFilter = $false
for ($i = $startIdx; $i -lt $lines.Length; $i++) {
    foreach ($ch in $lines[$i].ToCharArray()) {
        if ($ch -eq '{' -or $ch -eq '(') { $depth++ }
        if ($ch -eq '}' -or $ch -eq ')') { $depth-- }
    }
    if ($i -gt $startIdx -and $depth -le 0) {
        $endIdx = $i
        break
    }
}

Write-Host "cannonsAttacking block: lines $($startIdx+1) to $($endIdx+1)"

# New block with debug logging
$replacement = @(
    '            const cannonsAttacking = placedBuildingsRef.current.filter(b => {',
    '                if (b.isConstructing || b.isDestroying) return false;',
    '',
    '                const isDefense = [CANNON_ID, 701, PROTECTED_TOWER_ID, WATCHTOWER_ID].includes(Number(b.buildingId));',
    '                if (!isDefense) return false;',
    '',
    '                const isOwner = isAuthReadyRef.current && userRef.current && b.ownerId === userRef.current.uid;',
    '',
    '                // Debug: log every 5s per cannon why it may be skipped',
    '                const _dbgKey = `_cannon_dbg_${b.id}`;',
    '                const _lastDbg = (window as any)[_dbgKey] || 0;',
    '                if (now - _lastDbg > 5000) {',
    '                    (window as any)[_dbgKey] = now;',
    '                    const _lastTime = b.lastAttackTime || 0;',
    '                    console.log(`[CANNON DEBUG] id=${b.id} buildingId=${b.buildingId} ownerId="${b.ownerId}" userId="${userRef.current?.uid}" isOwner=${isOwner} isConstructing=${b.isConstructing} lastAttackTime=${b.lastAttackTime} cooldownOk=${now - _lastTime >= 10000} (${Math.round((now - _lastTime)/1000)}s ago)`);',
    '                }',
    '',
    '                if (!isOwner) return false;',
    '',
    '                const interval = 10;',
    '                const lastTime = b.lastAttackTime || 0;',
    '                return (now - lastTime >= interval * 1000);',
    '            });'
)

$newLines = @()
$newLines += $lines[0..($startIdx - 1)]
$newLines += $replacement
$newLines += $lines[($endIdx + 1)..($lines.Length - 1)]

Set-Content -Path $file -Value $newLines -Encoding UTF8
Write-Host "SUCCESS: Added debug logging to cannonsAttacking filter"
Write-Host "New total lines: $($newLines.Length)"
