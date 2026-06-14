$filePath = "c:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\App.tsx"
$content = Get-Content $filePath -Raw

$startMarker = 'if (buildingsToUpdate.length > 0 || monstersMoving.length > 0 || cannonsAttacking.length > 0) {'
$endMarker = 'if (newExplosions.length > 0) {'

$startIndex = $content.IndexOf($startMarker)
$endIndex = $content.IndexOf($endMarker, $startIndex)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    # We want to keep everything from the endMarker onwards, but we need to find where the block closing BEFORE the endMarker is.
    # Actually, let's just replace the entire logic from startMarker to the end of the gameLoop if needed.
    
    # Let's try a more targeted replacement for the Cannon block specifically, and the Shot effect.
    $cannonStart = '                // Process cannons'
    $cannonEnd = '                // Process destructions and damage'
    
    $cStartIndex = $content.IndexOf($cannonStart)
    $cEndIndex = $content.IndexOf($cannonEnd, $cStartIndex)
    
    if ($cStartIndex -ge 0 -and $cEndIndex -gt $cStartIndex) {
        $newCannonCode = @"
                // Process cannons
                const monsters = currentBuildings.filter(b => {
                    const info = buildingData.find(i => i.id === b.buildingId);
                    return (info && info.stats.isMonster) || b.ownerId === "monster";
                });

                if (cannonsAttacking.length > 0) {
                    console.log(`[DEFENSE] \${cannonsAttacking.length} cannons ready to fire. Targets available: \${monsters.length}`);
                }

                cannonsAttacking.forEach(cannon => {
                    const cannonInfo = buildingData.find(i => i.id === cannon.buildingId);

                    let damage = cannonInfo?.stats.damage ? parseInt(cannonInfo.stats.damage) : 1;
                    if (cannon.buildingId === CANNON_ID) damage = 5;

                    let targetMonster = null;

                    // Range enforcement: Level 1 (700) and Level 2 (701) have range 1
                    let range = 1;
                    const bId = Number(cannon.buildingId);
                    if (bId === 700 || bId === 701) range = 1;
                    else if (bId === PROTECTED_TOWER_ID) range = 6;
                    else if (bId === WATCHTOWER_ID) range = 4;

                    let minDistance = range + 1;

                    monsters.forEach(monster => {
                        if (monster.ownerId === cannon.ownerId) return;
                        const dist = Math.max(Math.abs(monster.x - cannon.x), Math.abs(monster.y - cannon.y));
                        if (dist <= range && dist < minDistance) {
                            minDistance = dist;
                            targetMonster = monster;
                        }
                    });

                    if (targetMonster) {
                        const targetKey = \`\${targetMonster.x},\${targetMonster.y}\`;
                        damageMap.set(targetKey, (damageMap.get(targetKey) || 0) + damage);
                        cannonUpdates.set(\`\${cannon.x},\${cannon.y}\`, { ...cannon, lastAttackTime: now });
                        cannon.lastAttackTime = now;

                        if (cannon.ownerId === "0" || (isAuthReadyRef.current && userRef.current && cannon.ownerId === userRef.current.uid)) {
                            const docId = String(cannon.id);
                            updateDoc(doc(db, 'buildings', docId), { lastAttackTime: now }).catch(e => handleGameLoopError(e, OperationType.UPDATE, \`buildings/\$docId\`));
                        }

                        newExplosions.push({
                            id: Date.now() + Math.random(),
                            x: cannon.x,
                            y: cannon.y,
                            type: 'shot',
                            startTime: now,
                            duration: 400,
                            targetX: targetMonster.x,
                            targetY: targetMonster.y
                        });
                    }
                });

"@
        $before = $content.Substring(0, $cStartIndex)
        $after = $content.Substring($cEndIndex)
        $newContent = $before + $newCannonCode + $after
        
        # Also fix the visual effect draw code
        $shotStart = "} else if (effect.type === 'shot') {"
        $flashStart = "} else if (effect.type === 'flash') {"
        
        $sStartIndex = $newContent.IndexOf($shotStart)
        $sEndIndex = $newContent.IndexOf($flashStart, $sStartIndex)
        
        if ($sStartIndex -ge 0 -and $sEndIndex -gt $sStartIndex) {
            $newShotDraw = @'
            } else if (effect.type === 'shot') {
                const { screenX: startX, screenY: startY } = worldToScreen(effect.x, effect.y, zoom);
                const { screenX: endX, screenY: endY } = worldToScreen(effect.targetX!, effect.targetY!, zoom);

                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;

                // Trail
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(currentX, currentY);
                const trailGrad = context.createLinearGradient(startX, startY, currentX, currentY);
                trailGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
                trailGrad.addColorStop(1, 'rgba(245, 158, 11, 0.4)');
                context.strokeStyle = trailGrad;
                context.lineWidth = 2 * zoom;
                context.stroke();

                // Projectile
                context.beginPath();
                context.arc(currentX, currentY, 4 * zoom, 0, 2 * Math.PI);
                context.fillStyle = '#F59E0B';
                context.shadowBlur = 12 * zoom;
                context.shadowColor = '#F59E0B';
                context.fill();
                context.shadowBlur = 0;
'@
            $sBefore = $newContent.Substring(0, $sStartIndex)
            $sAfter = $newContent.Substring($sEndIndex)
            $newContent = $sBefore + $newShotDraw + $sAfter
        }

        [System.IO.File]::WriteAllText($filePath, $newContent)
        Write-Host "Success: Braces and visual effects fixed."
    } else {
        Write-Host "Error: Could not find cannon markers."
    }
} else {
    Write-Host "Error: Could not find start/end markers."
}
