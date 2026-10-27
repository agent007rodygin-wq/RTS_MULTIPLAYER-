/**
 * drawTerrain — сетка тайлов ground (бывший TERRAIN-сегмент draw() в App.tsx).
 * Перенесён дословно (characterization: 14/14 PASS) в рамках Приоритета D.1.
 */

import {
  TILE_HEIGHT,
  TILE_WIDTH,
  WORLD_HEIGHT_TILES,
  WORLD_WIDTH_TILES,
} from '../../world.js';
import { groundTileImageUrl, RENDER_RADIUS } from './groundAssets';
import type { DrawContext } from './drawContext';

export function drawTerrain(ctx: DrawContext): void {
  const {
    canvas,
    cameraOffsetRef,
    context,
    isWorldWrapped,
    renderCenterX,
    renderCenterY,
    scaledTileHeight,
    scaledTileWidth,
    worldToScreen,
    zoom,
  } = ctx;

  const groundImg = ctx.images[groundTileImageUrl];

            if (groundImg) {
                // OPTIMIZATION: Only iterate tiles within RENDER_RADIUS of camera center
                // Instead of iterating all WORLD_WIDTH_TILES * WORLD_HEIGHT_TILES (200x200 = 40000)
                // we only iterate the visible range (~120x120 = 14400 at most)
                const minTileX = isWorldWrapped ? renderCenterX - RENDER_RADIUS : Math.max(0, renderCenterX - RENDER_RADIUS);
                const maxTileX = isWorldWrapped ? renderCenterX + RENDER_RADIUS : Math.min(WORLD_WIDTH_TILES - 1, renderCenterX + RENDER_RADIUS);
                const minTileY = isWorldWrapped ? renderCenterY - RENDER_RADIUS : Math.max(0, renderCenterY - RENDER_RADIUS);
                const maxTileY = isWorldWrapped ? renderCenterY + RENDER_RADIUS : Math.min(WORLD_HEIGHT_TILES - 1, renderCenterY + RENDER_RADIUS);
            
                for (let i = minTileX; i <= maxTileX; i++) {
                    for (let j = minTileY; j <= maxTileY; j++) {
                    
                        const { screenX, screenY } = worldToScreen(i, j, zoom);

                        if (
                            screenX + scaledTileWidth / 2 < -cameraOffsetRef.current.x ||
                            screenX - scaledTileWidth / 2 > canvas.width - cameraOffsetRef.current.x ||
                            screenY + scaledTileHeight / 2 < -cameraOffsetRef.current.y ||
                            screenY - scaledTileHeight / 2 > canvas.height - cameraOffsetRef.current.y
                        ) {
                            continue;
                        }

                        context.save();
                        context.beginPath();
                        context.moveTo(screenX, screenY - scaledTileHeight / 2);
                        context.lineTo(screenX + scaledTileWidth / 2, screenY);
                        context.lineTo(screenX, screenY + scaledTileHeight / 2);
                        context.lineTo(screenX - scaledTileWidth / 2, screenY);
                        context.closePath();
                        context.clip();

                        context.drawImage(
                            groundImg,
                            screenX - scaledTileWidth / 2,
                            screenY - scaledTileHeight / 2,
                            scaledTileWidth,
                            scaledTileHeight
                        );
                        context.restore();
                    }
                }
            }

            // Use pre-sorted memoized entities (avoids rebuilding 6000+ element arrays every frame)
}
