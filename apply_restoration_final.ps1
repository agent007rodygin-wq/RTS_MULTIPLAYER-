$filePath = "c:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\App.tsx"
$fragmentPath = "/tmp/game_loop_fixed.txt"
$newLoopContent = Get-Content $fragmentPath -Raw

$content = [System.IO.File]::ReadAllText($filePath)

# 1. Replace the entire gameLoop logic block
$startMarker = "            if (buildingsToUpdate.length > 0 || monstersMoving.length > 0 || cannonsAttacking.length > 0) {"
$endMarker = "            setVisualEffects(prev => {"

$startIndex = $content.IndexOf($startMarker)
$endIndex = $content.IndexOf($endMarker, $startIndex)

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    $content = $before + $newLoopContent + "`n" + $after
    Write-Host "Success: Game loop block replaced."
} else {
    Write-Host "Error: Could not find game loop markers ($startIndex, $endIndex)."
}

# 2. Fix the 'shot' drawing effect
$shotStart = "            } else if (effect.type === 'shot') {"
$flashStart = "            } else if (effect.type === 'flash') {"

$sStartIndex = $content.IndexOf($shotStart)
$sEndIndex = $content.IndexOf($flashStart, $sStartIndex)

if ($sStartIndex -ge 0 -and $sEndIndex -gt $sStartIndex) {
    $newShotDraw = @"
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
"@
    $sBefore = $content.Substring(0, $sStartIndex)
    $sAfter = $content.Substring($sEndIndex)
    $content = $sBefore + $newShotDraw + $sAfter
    Write-Host "Success: Shot drawing effect fixed."
} else {
    Write-Host "Error: Could not find shot drawing markers ($sStartIndex, $sEndIndex)."
}

[System.IO.File]::WriteAllText($filePath, $content)
