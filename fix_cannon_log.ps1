$file = "App.tsx"
$lines = Get-Content $file -Encoding UTF8

# Find cannonsAttacking filter
$startIdx = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'const cannonsAttacking = placedBuildingsRef.current.filter') {
        $startIdx = $i
        break
    }
}
if ($startIdx -lt 0) { Write-Host "ERROR: Not found"; exit 1 }

$endIdx = -1
$depth = 0
for ($i = $startIdx; $i -lt $lines.Length; $i++) {
    foreach ($ch in $lines[$i].ToCharArray()) {
        if ($ch -eq '(' -or $ch -eq '{') { $depth++ }
        if ($ch -eq ')' -or $ch -eq '}') { $depth-- }
    }
    if ($i -gt $startIdx -and $depth -le 0) {
        $endIdx = $i
        break
    }
}

$replacement = @(
    '            const cannonsAttacking = placedBuildingsRef.current.filter(b => {',
    '                const isDefense = [CANNON_ID, 701, PROTECTED_TOWER_ID, WATCHTOWER_ID].includes(Number(b.buildingId));',
    '                if (!isDefense) return false;',
    '',
    '                // Debug: log EVERY cannon, even if constructing',
    '                const _dbgKey = `_cdg_${b.id}`;',
    '                const _lastDbg = (window as any)[_dbgKey] || 0;',
    '                if (now - _lastDbg > 5000) {',
    '                    (window as any)[_dbgKey] = now;',
    '                    const _lt = b.lastAttackTime || 0;',
    '                    const _secAgo = Math.round((now - _lt) / 1000);',
    '                    console.log(`[CANNON DEBUG] id=${b.id} buildingId=${b.buildingId} ownerId="${b.ownerId}" isConstructing=${b.isConstructing} (ends in ${b.isConstructing ? Math.round((b.constructionEndTime - now)/1000) : 0}s) cooldownOk=${now - _lt >= 10000} (${_secAgo}s ago)`);',
    '                }',
    '',
    '                if (b.isConstructing || b.isDestroying) return false;',
    '',
    '                const isOwner = b.ownerId === "0" ||',
    '                    (isAuthReadyRef.current && userRef.current && b.ownerId === userRef.current.uid);',
    '',
    '                if (!isOwner) return false;',
    '',
    '                const lastTime = b.lastAttackTime || 0;',
    '                return (now - lastTime >= 10000);',
    '            });'
)

$newLines = @()
$newLines += $lines[0..($startIdx - 1)]
$newLines += $replacement
$newLines += $lines[($endIdx + 1)..($lines.Length - 1)]

Set-Content -Path $file -Value $newLines -Encoding UTF8
Write-Host "SUCCESS: Fixed cannon log order"
