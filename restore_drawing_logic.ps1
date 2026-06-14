$filePath = "c:\Users\User\.antigravity\extensions\goldwasdx-svg-BASINGSEMMORPGREALTIME-main\App.tsx"
$content = [System.IO.File]::ReadAllText($filePath)

# 1. Define the clean segment for the Drawing area (Shimmer to Flash)
# We find where it starts (the shimmer comment) and where its logical block ends.
$drawStartMarker = "// 3. Draw the `"Shimmer`" Animation (Flowing Highlight)"
$drawEndMarker = "context.fillStyle = \`"rgba(255, 255, 255, \${opacity})\`";" # Part of 'flash' end

# Since there might be multiple 'flash' ends, let's use a more specific end marker
$drawEndAnchor = "visualEffects.forEach(effect => {" # We'll replace from shimmer down to the end of the visualEffects loop

$startIndex = $content.IndexOf($drawStartMarker)
$endIndex = $content.IndexOf("        });", $content.IndexOf("visualEffects.forEach", $startIndex)) + 11

if ($startIndex -ge 0 -and $endIndex -gt $startIndex) {
    $cleanDrawSegment = @"
                        // 3. Draw the "Shimmer" Animation (Flowing Highlight)
                        const shimmerPos = (now / 2000) % 1.5 - 0.5;
                        if (shimmerPos > -0.2 && shimmerPos < 1.2) {
                            const shimmerX = barX + (barWidth * progress * shimmerPos);
                            const shimmerW = 20 * zoom;
                            const shimmerGrad = context.createLinearGradient(shimmerX, barY, shimmerX + shimmerW, barY);
                            shimmerGrad.addColorStop(0, 'rgba(255,255,255,0)');
                            shimmerGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
                            shimmerGrad.addColorStop(1, 'rgba(255,255,255,0)');
                            context.fillStyle = shimmerGrad;
                            const drawW = Math.min(shimmerW, barX + barWidth * progress - shimmerX);
                            if (drawW > 0) {
                                context.fillRect(Math.max(barX, shimmerX), barY, drawW, barHeight);
                            }
                        }
                    }

                    const minutes = Math.floor(timeRemaining / 60000);
                    const seconds = Math.floor((timeRemaining % 60000) / 1000);
                    const timeText = \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
                    context.font = \`bold \${14 * zoom}px serif\`;
                    context.textAlign = 'center';
                    context.fillStyle = 'rgba(0,0,0,0.8)';
                    context.fillText(timeText, screenX + (1 * zoom), barY - (4 * zoom) + (1 * zoom));
                    context.fillStyle = '#E2E8F0';
                    context.fillText(timeText, screenX, barY - (4 * zoom));
                } else if (entity.workState === 'finished') {
                    const isMushroomOrLily = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 70, 71, 72, 73, 77, 78, 79, 80].includes(buildingInfo.id);
                    if (isMushroomOrLily) {
                        const coinImg = images[coinImageUrl];
                        if (coinImg) {
                            const iconSize = 36 * zoom;
                            const iconX = screenX - iconSize / 2;
                            const iconY = drawY - iconSize - (15 * zoom);
                            context.drawImage(coinImg, iconX, iconY, iconSize, iconSize);
                        } else {
                            context.fillStyle = '#FFD700';
                            context.font = \`bold \${24 * zoom}px sans-serif\`;
                            context.fillText('💰', screenX, drawY - (20 * zoom));
                        }
                    } else if (isMyBuilding(entity)) {
                        const iconSize = 20 * zoom;
                        const boxHeight = Math.max(iconSize, 16 * zoom) + (10 * zoom);
                        const boxX = screenX - (iconSize * 1.5);
                        const boxY = drawY - boxHeight - (10 * zoom);
                        context.fillStyle = 'rgba(0,0,0,0.7)';
                        context.fillRect(boxX, boxY, iconSize * 3, boxHeight);
                        context.fillStyle = '#FFD700';
                        context.font = \`bold \${14 * zoom}px sans-serif\`;
                        context.fillText('Ready', screenX, boxY + (boxHeight / 1.5));
                    }
                } else if (!entity.workState || entity.workState === 'idle') {
                    const isMushroomOrLily = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 70, 71, 72, 73, 77, 78, 79, 80].includes(buildingInfo.id);
                    if (isMushroomOrLily && isMyBuilding(entity)) {
                        const builderImg = images[builderIconUrl];
                        if (builderImg) {
                            const iconSize = 32 * zoom;
                            const iconX = screenX - iconSize;
                            const iconY = drawY - iconSize - (10 * zoom);
                            context.drawImage(builderImg, iconX, iconY, iconSize, iconSize);
                            context.font = \`bold \${24 * zoom}px sans-serif\`;
                            context.fillStyle = 'white';
                            context.strokeStyle = 'black';
                            context.lineWidth = 3;
                            const popNeeded = buildingInfo.stats.takesPopulation || 0;
                            context.strokeText(String(popNeeded), iconX + iconSize + (5 * zoom), iconY + iconSize / 1.5);
                            context.fillText(String(popNeeded), iconX + iconSize + (5 * zoom), iconY + iconSize / 1.5);
                        }
                    }
                }
            }
        });

        visualEffects.forEach(effect => {
            const now = Date.now();
            const elapsedTime = now - effect.startTime;
            const progress = Math.min(elapsedTime / effect.duration, 1.0);
            const { screenX, screenY } = worldToScreen(effect.x, effect.y, zoom);

            if (effect.type === 'upgrade') {
                const radius = scaledTileWidth * 0.75 * progress;
                const opacity = 1.0 - progress;
                context.beginPath();
                context.arc(screenX, screenY, radius, 0, 2 * Math.PI);
                context.strokeStyle = \`rgba(255, 215, 0, \${opacity})\`;
                context.lineWidth = (4 * (1 - progress)) * zoom;
                context.stroke();
            } else if (effect.type === 'explosion') {
                const radius = scaledTileWidth * (0.5 + progress);
                const opacity = 1.0 - progress;
                context.beginPath();
                context.arc(screenX, screenY, radius, 0, 2 * Math.PI);
                context.fillStyle = \`rgba(255, 69, 0, \${opacity})\`;
                context.fill();
            } else if (effect.type === 'shot') {
                const { screenX: startX, screenY: startY } = worldToScreen(effect.x, effect.y, zoom);
                const { screenX: endX, screenY: endY } = worldToScreen(effect.targetX!, effect.targetY!, zoom);
                const currentX = startX + (endX - startX) * progress;
                const currentY = startY + (endY - startY) * progress;
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(currentX, currentY);
                const trailGrad = context.createLinearGradient(startX, startY, currentX, currentY);
                trailGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
                trailGrad.addColorStop(1, 'rgba(245, 158, 11, 0.4)');
                context.strokeStyle = trailGrad;
                context.lineWidth = 2 * zoom;
                context.stroke();
                context.beginPath();
                context.arc(currentX, currentY, 4 * zoom, 0, 2 * Math.PI);
                context.fillStyle = '#F59E0B';
                context.shadowBlur = 12 * zoom;
                context.shadowColor = '#F59E0B';
                context.fill();
                context.shadowBlur = 0;
            } else if (effect.type === 'flash') {
                const { screenX, screenY } = worldToScreen(effect.x, effect.y, zoom);
                const opacity = 0.8 * (1.0 - progress);
                context.beginPath();
                context.moveTo(screenX, screenY - scaledTileHeight / 2);
                context.lineTo(screenX + scaledTileWidth / 2, screenY);
                context.lineTo(screenX, screenY + scaledTileHeight / 2);
                context.lineTo(screenX - scaledTileWidth / 2, screenY);
                context.closePath();
                context.fillStyle = \`rgba(255, 255, 255, \${opacity})\`;
                context.fill();
            }
        });
"@
    $before = $content.Substring(0, $startIndex)
    $after = $content.Substring($endIndex)
    $newContent = $before + $cleanDrawSegment + $after
    [System.IO.File]::WriteAllText($filePath, $newContent)
    Write-Host "Success: Drawing segment restored."
} else {
    Write-Host "Error: Could not find markers ($startIndex, $endIndex)."
}
