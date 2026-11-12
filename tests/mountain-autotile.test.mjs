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
const MOUNTAIN_TS_PATH = path.join(ROOT_DIR, 'src/game/buildings/mountainAutotile.ts');

async function loadMountainAutotileModule() {
    try {
        return await import('../src/game/buildings/mountainAutotile.ts');
    } catch {
        const source = fs.readFileSync(MOUNTAIN_TS_PATH, 'utf8');
        const { outputText } = ts.transpileModule(source, {
            fileName: MOUNTAIN_TS_PATH,
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
    MOUNTAIN_BUILDING_ID,
    MOUNTAIN_TILES_BY_MASK,
    ALL_MOUNTAIN_ASSET_URLS,
    isMountainBuilding,
    getMountainTileMask,
    getMountainTileUrl,
} = await loadMountainAutotileModule();

test('isMountainBuilding recognizes 50005 cleanly', () => {
    assert.equal(MOUNTAIN_BUILDING_ID, 50005);
    assert.equal(isMountainBuilding(50005), true);
    assert.equal(isMountainBuilding('50005'), true);

    assert.equal(isMountainBuilding(50004), false);
    assert.equal(isMountainBuilding(0), false);
    assert.equal(isMountainBuilding(''), false);
    assert.equal(isMountainBuilding(null), false);
    assert.equal(isMountainBuilding(undefined), false);
    assert.equal(isMountainBuilding(Number.NaN), false);
});

test('all 16 autotile mountain PNGs exist on disk, duplicate 50005.png is absent, and 50005.webp remains', () => {
    assert.equal(MOUNTAIN_TILES_BY_MASK.length, 16);
    assert.equal(ALL_MOUNTAIN_ASSET_URLS.length, 16);
    assert.equal(new Set(MOUNTAIN_TILES_BY_MASK).size, 16);

    for (const url of MOUNTAIN_TILES_BY_MASK) {
        const relativePath = url.startsWith('/') ? url.slice(1) : url;
        const absPath = path.join(ROOT_DIR, 'public', relativePath);
        assert.ok(fs.existsSync(absPath), `Missing mountain sprite: ${absPath}`);
        const buf = fs.readFileSync(absPath);
        assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${url} is not a PNG`);
        const width = buf.readUInt32BE(16);
        const height = buf.readUInt32BE(20);
        assert.deepEqual({ width, height }, { width: 233, height: 270 }, `Unexpected size for ${url}`);
    }

    const duplicatePng = path.join(ROOT_DIR, 'public/buildings/Реки и Горы/mountin/50005.png');
    assert.equal(fs.existsSync(duplicatePng), false, 'Duplicate mountin/50005.png should be removed');

    const iconWebp = path.join(ROOT_DIR, 'public/buildings/Реки и Горы/50005.webp');
    assert.equal(fs.existsSync(iconWebp), true, 'Canonical shop icon 50005.webp must remain intact');

    const buildingsTs = fs.readFileSync(path.join(ROOT_DIR, 'data/buildings.ts'), 'utf8');
    assert.match(buildingsTs, /id:\s*50005[\s\S]*?imageUrl:\s*'\/buildings\/Реки и Горы\/50005\.webp'/);
});

test('getMountainTileMask and getMountainTileUrl cover all 16 neighbor combinations accurately', () => {
    const expectedFilesByMask = [
        '340000.png', // 0: none
        '341000.png', // 1: NE (x, y - 1)
        '340001.png', // 2: SE (x + 1, y)
        '341001.png', // 3: NE + SE
        '340100.png', // 4: SW (x, y + 1)
        '341100.png', // 5: NE + SW
        '340101.png', // 6: SE + SW
        '341101.png', // 7: NE + SE + SW
        '340010.png', // 8: NW (x - 1, y)
        '341010.png', // 9: NE + NW
        '340011.png', // 10: SE + NW
        '341011.png', // 11: NE + SE + NW
        '340110.png', // 12: SW + NW
        '341110.png', // 13: NE + SW + NW
        '340111.png', // 14: SE + SW + NW
        '341111.png', // 15: all 4 neighbors
    ];

    const cx = 10;
    const cy = 10;
    for (let mask = 0; mask < 16; mask++) {
        const neighbors = new Set([
            // Include all 4 diagonals to guarantee diagonal neighbors are ignored
            `${cx - 1},${cy - 1}`,
            `${cx + 1},${cy - 1}`,
            `${cx - 1},${cy + 1}`,
            `${cx + 1},${cy + 1}`,
        ]);
        if (mask & 1) neighbors.add(`${cx},${cy - 1}`); // NE
        if (mask & 2) neighbors.add(`${cx + 1},${cy}`); // SE
        if (mask & 4) neighbors.add(`${cx},${cy + 1}`); // SW
        if (mask & 8) neighbors.add(`${cx - 1},${cy}`); // NW

        const isMountainAt = (nx, ny) => neighbors.has(`${nx},${ny}`);
        assert.equal(getMountainTileMask(cx, cy, isMountainAt), mask);
        const url = getMountainTileUrl(cx, cy, isMountainAt);
        assert.equal(url, `/buildings/Реки и Горы/mountin/${expectedFilesByMask[mask]}`);
    }
});

test('world-edge wrapping connects seam mountains and ignores destroyed neighbors', () => {
    const mountains = new Map([
        ['0,0', { buildingId: 50005, hp: 999999 }],
        [`${WORLD_WIDTH_TILES - 1},0`, { buildingId: 50005, hp: 999999 }], // NW of (0,0) across wrap seam
        [`0,${WORLD_HEIGHT_TILES - 1}`, { buildingId: 50005, hp: 0 }],    // Destroyed NE neighbor must not connect
    ]);

    const isMountainAt = (nx, ny) => {
        const wx = wrapCoord(nx, WORLD_WIDTH_TILES);
        const wy = wrapCoord(ny, WORLD_HEIGHT_TILES);
        const nb = mountains.get(`${wx},${wy}`);
        return Boolean(nb && isMountainBuilding(nb.buildingId) && (nb.hp === undefined || nb.hp > 0));
    };

    // Only NW neighbor is alive -> mask 8 -> 340010.png
    assert.equal(getMountainTileMask(0, 0, isMountainAt), 8);
    assert.equal(getMountainTileUrl(0, 0, isMountainAt), '/buildings/Реки и Горы/mountin/340010.png');
});
