import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { wrapCoord, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES } from '../src/world.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const RIVER_TS_PATH = path.join(ROOT_DIR, 'src/game/buildings/riverAutotile.ts');

async function loadRiverAutotileModule() {
    try {
        return await import('../src/game/buildings/riverAutotile.ts');
    } catch {
        const source = fs.readFileSync(RIVER_TS_PATH, 'utf8');
        const { outputText } = ts.transpileModule(source, {
            fileName: RIVER_TS_PATH,
            compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ES2022,
            },
        });
        const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText, 'utf8').toString('base64')}`;
        return import(dataUrl);
    }
}

const {
    RIVER_BUILDING_ID,
    RIVER_TILES_BY_MASK,
    ALL_RIVER_ASSET_URLS,
    isRiverBuilding,
    getRiverTileMask,
    getRiverTileUrl,
} = await loadRiverAutotileModule();

test('isRiverBuilding recognizes 50004 and 500040 cleanly', () => {
    assert.equal(RIVER_BUILDING_ID, 50004);
    assert.equal(isRiverBuilding(50004), true);
    assert.equal(isRiverBuilding('50004'), true);
    assert.equal(isRiverBuilding(500040), true);
    assert.equal(isRiverBuilding('500040'), true);

    assert.equal(isRiverBuilding(50005), false);
    assert.equal(isRiverBuilding(50001), false);
    assert.equal(isRiverBuilding(0), false);
    assert.equal(isRiverBuilding(''), false);
    assert.equal(isRiverBuilding(null), false);
    assert.equal(isRiverBuilding(undefined), false);
    assert.equal(isRiverBuilding(Number.NaN), false);
});

test('all 16 autotile river PNGs exist on disk, duplicate 50004.png is absent, and 50004.webp remains', () => {
    assert.equal(RIVER_TILES_BY_MASK.length, 16);
    assert.equal(ALL_RIVER_ASSET_URLS.length, 16);
    assert.equal(new Set(RIVER_TILES_BY_MASK).size, 16);

    for (const url of RIVER_TILES_BY_MASK) {
        const relativePath = url.startsWith('/') ? url.slice(1) : url;
        const absPath = path.join(ROOT_DIR, 'public', relativePath);
        assert.ok(fs.existsSync(absPath), `Missing river sprite: ${absPath}`);
        const buf = fs.readFileSync(absPath);
        assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${url} is not a PNG`);
        const width = buf.readUInt32BE(16);
        const height = buf.readUInt32BE(20);
        assert.deepEqual({ width, height }, { width: 280, height: 168 }, `Unexpected size for ${url}`);
    }

    const duplicatePngOriginal = path.join(ROOT_DIR, 'public/buildings/Реки и Горы/RIVERS/original/50004.png');
    assert.equal(fs.existsSync(duplicatePngOriginal), false, 'Duplicate RIVERS/original/50004.png should be removed');

    const duplicatePngRoot = path.join(ROOT_DIR, 'public/buildings/Реки и Горы/RIVERS/50004.png');
    assert.equal(fs.existsSync(duplicatePngRoot), false, 'Duplicate RIVERS/50004.png should be removed');

    const iconWebp = path.join(ROOT_DIR, 'public/buildings/Реки и Горы/50004.webp');
    assert.equal(fs.existsSync(iconWebp), true, 'Canonical shop icon 50004.webp must remain intact');

    const buildingsTs = fs.readFileSync(path.join(ROOT_DIR, 'data/buildings.ts'), 'utf8');
    assert.match(buildingsTs, /id:\s*50004[\s\S]*?imageUrl:\s*'\/buildings\/Реки и Горы\/50004\.webp'/);
});

test('getRiverTileMask and getRiverTileUrl cover all 16 neighbor combinations accurately', () => {
    const expectedFilesByMask = [
        '330000.png', // 0: none (lake / pond)
        '331000.png', // 1: NE (x, y - 1)
        '330001.png', // 2: SE (x + 1, y)
        '331001.png', // 3: NE + SE bend
        '330100.png', // 4: SW (x, y + 1)
        '331100.png', // 5: NE + SW straight
        '330101.png', // 6: SE + SW bend
        '331101.png', // 7: NE + SE + SW T-junction
        '330010.png', // 8: NW (x - 1, y)
        '331010.png', // 9: NE + NW bend
        '330011.png', // 10: SE + NW straight
        '331011.png', // 11: NE + SE + NW T-junction
        '330110.png', // 12: SW + NW bend
        '331110.png', // 13: NE + SW + NW T-junction
        '330111.png', // 14: SE + SW + NW T-junction
        '331111.png', // 15: all 4 neighbors (crossroads island)
    ];

    const cx = 10;
    const cy = 10;

    for (let mask = 0; mask < 16; mask++) {
        const hasNE = Boolean(mask & 1);
        const hasSE = Boolean(mask & 2);
        const hasSW = Boolean(mask & 4);
        const hasNW = Boolean(mask & 8);

        const isRiverAt = (nx, ny) => {
            if (nx === cx && ny === cy - 1) return hasNE;
            if (nx === cx + 1 && ny === cy) return hasSE;
            if (nx === cx && ny === cy + 1) return hasSW;
            if (nx === cx - 1 && ny === cy) return hasNW;
            return false;
        };

        const calculatedMask = getRiverTileMask(cx, cy, isRiverAt);
        assert.equal(calculatedMask, mask, `Mismatch in calculated mask for mask=${mask}`);

        const url = getRiverTileUrl(cx, cy, isRiverAt);
        assert.ok(url.endsWith(expectedFilesByMask[mask]), `Expected ${expectedFilesByMask[mask]} but got ${url}`);
    }
});

test('world-edge wrapping connects seam rivers and ignores destroyed neighbors', () => {
    const buildings = [
        { id: 'r1', x: 0, y: 15, buildingId: 50004, hp: 999999 },
        // Wrapped neighbor on the opposite side: (WORLD_WIDTH_TILES - 1, 15) -> NW neighbor of (0, 15)
        { id: 'r2', x: WORLD_WIDTH_TILES - 1, y: 15, buildingId: 50004, hp: 999999 },
        // Destroyed neighbor at SE (1, 15)
        { id: 'r3', x: 1, y: 15, buildingId: 50004, hp: 0 },
    ];

    const isRiverAtWrapped = (nx, ny) => {
        const wx = wrapCoord(nx, WORLD_WIDTH_TILES);
        const wy = wrapCoord(ny, WORLD_HEIGHT_TILES);
        const b = buildings.find(item => item.x === wx && item.y === wy);
        return Boolean(b && isRiverBuilding(b.buildingId) && (b.hp === undefined || b.hp > 0));
    };

    // For r1 at (0, 15):
    // NE (0, 14): none
    // SE (1, 15): destroyed (hp = 0) -> false
    // SW (0, 16): none
    // NW (-1, 15) wrapped to (WORLD_WIDTH_TILES - 1, 15): alive -> true (bit 3 / mask 8)
    const mask = getRiverTileMask(0, 15, isRiverAtWrapped);
    assert.equal(mask, 8);
    assert.ok(getRiverTileUrl(0, 15, isRiverAtWrapped).endsWith('330010.png'));
});
