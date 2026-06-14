const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Comprehensive Mojibake Fix (including Protection Options)
const mojibakeMapping = {
    'РџРѕСЃС‚СЂРѕРёС‚СЊ': 'Построить',
    'РЎСЋРґР°!': 'Сюда!',
    'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ': 'Пользователь',
    'СѓРґР°Р»РµРЅ РёР· РґСЂСѓР·РµР№.': 'удален из друзей.',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ СЂСѓР±РёРЅРѕРІ!': 'Недостаточно рубинов!',
    'РќРµР»СЊР·СЏ РґРѕР±Р°РІРёС‚СЊ СЃР°РјРѕРіРѕ СЃРµР±СЏ РІ РґСЂСѓР·СЊСЏ!': 'Нельзя добавить самого себя в друзья!',
    'Р—Р°РїСЂРѕСЃ РґСЂСѓР¶Р±С‹ РѕС‚РїСЂР°РІР»РµРЅ РёРіСЂРѕРєСѓ': 'Запрос дружбы отправлен игроку',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ Р·РѕР»РѕС‚Р°!': 'Недостаточно золота!',
    'РўСЂРµР±СѓРµС‚СЃСЏ': 'Требуется',
    'РјРѕРЅРµС‚.': 'монет.',
    'Р’С‹ Р·Р°РєРѕР»РґРѕРІР°Р»Рё РёРіСЂРѕРєР°': 'Вы заколдовали игрока',
    'РІ "': 'в "',
    'РџРѕС‚СЂР°С‡РµРЅРѕ': 'Потрачено',
    'Р˜РіСЂРѕРє': 'Игрок',
    'СѓСЃРїРµС€РЅРѕ Р·Р°РєРѕР»РґРѕРІР°РЅ!': 'успешно заколдован!',
    'Р’С‹ РЅР°РєР°Р·Р°Р»Рё РёРіСЂРѕРєР°': 'Вы наказали игрока',
    'РїРѕС‚РµСЂСЏР»': 'потерял',
    'СЃР»Р°РІС‹!': 'славы!',
    'РќР° 10 С‡Р°СЃРѕРІ': 'На 10 часов',
    'РќР° 1 СЃСѓС‚РєРё': 'На 1 сутки',
    'РќР° 3 СЃСѓС‚РѕРє': 'На 3 суток',
    'РќР° 8 СЃСѓС‚РѕРє': 'На 8 суток',
    'рџ’Ґ': '💥',
    'рџ’°': '💰'
};

for (const [mojibake, correct] of Object.entries(mojibakeMapping)) {
    content = content.replace(new RegExp(mojibake, 'g'), correct);
}

// 2. Performance Optimization: Drawable Entities Sorting
// Current code sorts ALL resources (13,000 trees) every frame.
// We must filter by visibility BEFORE sorting.

const originalSortingLogic = `        const drawableEntities = [
            ...mapResources.map(r => ({ ...r, entityType: 'resource' as const })),
            ...droppedItems.map(i => ({ ...i, entityType: 'dropped_item' as const })),
            ...placedBuildings.filter(b => b.hp === undefined || b.hp > 0).map(b => ({ ...b, entityType: 'building' as const }))
        ];

        drawableEntities.sort((a, b) => {`;

const optimizedSortingLogic = `        // Optimization: Filter by approximate visibility before sorting thousands of entities
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
        ];

        drawableEntities.sort((a, b) => {`;

content = content.replace(originalSortingLogic, optimizedSortingLogic);

// 3. Performance Optimization: Ground Tiles Loop
// Current code iterates 200x200 = 40,000 times even with camera check.
// We can compute the min/max X and Y to iterate.

const originalGroundLoop = `        const groundImg = images[groundTileImageUrl];
        if (groundImg) {
            for (let i = 0; i < WORLD_WIDTH_TILES; i++) {
                for (let j = 0; j < WORLD_HEIGHT_TILES; j++) {
                    const { screenX, screenY } = worldToScreen(i, j, zoom);`;

const optimizedGroundLoop = `        const groundImg = images[groundTileImageUrl];
        if (groundImg) {
            // Optimization: Calculate visible tile range
            const tilesVisibleX = Math.ceil(canvas.width / scaledTileWidth / zoom) + 4;
            const tilesVisibleY = Math.ceil(canvas.height / scaledTileHeight / zoom) * 2 + 4;
            
            // Approximate center tile under camera
            const centerWorld = screenToWorld(canvas.width/2, canvas.height/2, cameraOffset, zoom);
            const minI = Math.max(0, Math.floor(centerWorld.x - tilesVisibleX));
            const maxI = Math.min(WORLD_WIDTH_TILES, Math.ceil(centerWorld.x + tilesVisibleX));
            const minJ = Math.max(0, Math.floor(centerWorld.y - tilesVisibleY));
            const maxJ = Math.min(WORLD_HEIGHT_TILES, Math.ceil(centerWorld.y + tilesVisibleY));

            for (let i = minI; i < maxI; i++) {
                for (let j = minJ; j < maxJ; j++) {
                    const { screenX, screenY } = worldToScreen(i, j, zoom);`;

content = content.replace(originalGroundLoop, optimizedGroundLoop);

fs.writeFileSync(filePath, content);
console.log("Applied Critical Performance Optimizations and Language fixes to App.tsx");
