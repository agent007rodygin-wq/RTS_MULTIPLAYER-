/**
 * drawEffects — визуальные эффекты (бывший EFFECTS-сегмент draw() в App.tsx).
 * Перенесён дословно (characterization: 14/14 PASS) в рамках Приоритета D.1.
 */

import type { DrawContext } from './drawContext';

export function drawEffects(ctx: DrawContext): void {
  const {
    context,
    scaledTileHeight,
    scaledTileWidth,
    visualEffects,
    worldToScreen,
    zoom,
  } = ctx;

  visualEffects.forEach(effect => {
    const now = Date.now();
    const effectStart = Number(effect.createdAt || effect.startTime || now) || now;
    const effectDuration = Math.max(1, Number(effect.durationMs || effect.duration || 1) || 1);
    const elapsedTime = now - effectStart;
    const progress = Math.min(elapsedTime / effectDuration, 1.0);
    const { screenX, screenY } = worldToScreen(effect.x, effect.y, zoom);

    if (effect.type === 'upgrade') {
      const radius = scaledTileWidth * 0.75 * progress;
      const opacity = 1.0 - progress;
      context.beginPath();
      context.arc(screenX, screenY, radius, 0, 2 * Math.PI);
      context.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
      context.lineWidth = (4 * (1 - progress)) * zoom;
      context.stroke();
    } else if (effect.type === 'explosion') {
      const radius = scaledTileWidth * (0.5 + progress);
      const opacity = 1.0 - progress;
      context.beginPath();
      context.arc(screenX, screenY, radius, 0, 2 * Math.PI);
      context.fillStyle = `rgba(255, 69, 0, ${opacity})`;
      context.fill();
    } else if (effect.type === 'shot') {
      const { screenX: startX, screenY: startY } = worldToScreen(effect.x, effect.y, zoom);
      const { screenX: endX, screenY: endY } = worldToScreen(effect.targetX!, effect.targetY!, zoom);

      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      context.beginPath();
      context.arc(currentX, currentY, 4 * zoom, 0, 2 * Math.PI);
      context.fillStyle = '#F59E0B';
      context.shadowBlur = 10 * zoom;
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
      context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      context.fill();
    }
  });
}
