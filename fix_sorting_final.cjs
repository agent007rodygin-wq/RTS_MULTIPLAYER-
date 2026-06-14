const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const target = `        const drawableEntities = [
            ...mapResources.map(r => ({ ...r, entityType: 'resource' as const })),
            ...droppedItems.map(i => ({ ...i, entityType: 'dropped_item' as const })),
            ...placedBuildings.filter(b => b.hp === undefined || b.hp > 0).map(b => ({ ...b, entityType: 'building' as const }))
        ];`;

const replacement = `        // Optimization: Filter by approximate visibility before sorting thousands of entities
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
        ];`;

if (content.includes(target.trim())) {
    content = content.replace(target.trim(), replacement.trim());
    fs.writeFileSync(filePath, content);
    console.log("Sorting optimization applied successfully.");
} else {
    console.log("Target sorting block not found for exact replacement. Trying regex...");
    const regex = /const drawableEntities\s*=\s*\[\s*\.\.\.mapResources[\s\S]+?\];/;
    if (regex.test(content)) {
        content = content.replace(regex, replacement.trim());
        fs.writeFileSync(filePath, content);
        console.log("Sorting optimization applied successfully via regex.");
    } else {
        console.log("Failed to find sorting block even with regex.");
    }
}
