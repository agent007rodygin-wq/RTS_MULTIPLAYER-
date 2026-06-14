const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Use more flexible regex to find the sorting logic
// It starts with const drawableEntities = [ followed by mapResources.map
const sortingPattern = /const drawableEntities\s*=\s*\[\s*\.\.\.mapResources\.map\(r\s*=>\s*\(\{[\s\S]+?\}\) \)/;

const sortingReplacement = `        // Optimization: Filter by approximate visibility before sorting thousands of entities
        const viewportMargin = 200 * zoom;
        const isVisibleApprox = (x: number, y: number) => {
            const { screenX, screenY } = worldToScreen(x, y, zoom);
            return screenX + viewportMargin > -cameraOffset.x &&
                   screenX - viewportMargin < canvas.width - cameraOffset.x &&
                   screenY + viewportMargin > -cameraOffset.y &&
                   screenY - viewportMargin < canvas.height - cameraOffset.y;
        };

        const drawableEntities = [
            ...mapResources.filter(r => isVisibleApprox(r.x, r.y)).map(r => ({ ...r, entityType: 'resource' as const })),
            ...droppedItems.filter(i => isVisibleApprox(i.x, i.y)).map(i => ({ ...i, entityType: 'dropped_item' as const })),
            ...placedBuildings.filter(b => (b.hp === undefined || b.hp > 0) && isVisibleApprox(b.x, b.y)).map(b => ({ ...b, entityType: 'building' as const }))
        ]`; // Note: we'll keep the semi-colon outside if possible or adjust

content = content.replace(sortingPattern, sortingReplacement);

// Fix ground loop optimization with more robust regex
const groundLoopPattern = /for\s*\(let\s*i\s*=\s*0;\s*i\s*<\s*WORLD_WIDTH_TILES;\s*i\+\+\)\s*\{\s*for\s*\(let\s*j\s*=\s*0;\s*j\s*<\s*WORLD_HEIGHT_TILES;\s*j\+\+\)\s*\{\s*const\s*\{ screenX,\s*screenY \}\s*=\s*worldToScreen\(i,\s*j,\s*zoom\);/;

const groundLoopReplacement = `            // Optimization: Calculate visible tile range
            const tilesVisibleX = Math.ceil(canvas.width / (TILE_WIDTH * zoom / 2)) + 4;
            const tilesVisibleY = Math.ceil(canvas.height / (TILE_HEIGHT * zoom / 2)) + 4;
            
            // Approximate center tile under camera
            // Use screenToWorld correctly (3rd arg is zoom, cameraOffset is from closure)
            const centerWorld = screenToWorld(canvas.width/2, canvas.height/2, zoom);
            const minI = Math.max(0, Math.floor(centerWorld.x - tilesVisibleX));
            const maxI = Math.min(WORLD_WIDTH_TILES, Math.ceil(centerWorld.x + tilesVisibleX));
            const minJ = Math.max(0, Math.floor(centerWorld.y - tilesVisibleY));
            const maxJ = Math.min(WORLD_HEIGHT_TILES, Math.ceil(centerWorld.y + tilesVisibleY));

            for (let i = minI; i < maxI; i++) {
                for (let j = minJ; j < maxJ; j++) {
                    const { screenX, screenY } = worldToScreen(i, j, zoom);`;

content = content.replace(groundLoopPattern, groundLoopReplacement);

fs.writeFileSync(filePath, content);
console.log("Optimizations applied successfully.");
if (content.includes("isVisibleApprox")) {
  console.log("Verified: sorting optimization applied.");
}
if (content.includes("tilesVisibleX")) {
  console.log("Verified: ground loop optimization applied.");
}
