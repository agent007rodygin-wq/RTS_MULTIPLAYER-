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

async function transpileAndImport(relativeTsPath) {
    const fullPath = path.join(ROOT_DIR, relativeTsPath);
    const source = fs.readFileSync(fullPath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
        fileName: fullPath,
        compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
        },
    });
    const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText, 'utf8').toString('base64')}`;
    return import(dataUrl);
}

const wallModule = await transpileAndImport('src/game/buildings/wallAutotile.ts');
const roadModule = await transpileAndImport('src/game/buildings/roadAutotile.ts');
const paveModule = await transpileAndImport('src/game/buildings/pavementAutotile.ts');

test('wallAutotile identifiers and predicates recognize wooden and stone walls cleanly', () => {
    assert.equal(wallModule.WOODEN_WALL_BUILDING_ID, 50002);
    assert.equal(wallModule.STONE_WALL_BUILDING_ID, 50003);

    assert.equal(wallModule.isWoodenWallBuilding(50002), true);
    assert.equal(wallModule.isWoodenWallBuilding('50002'), true);
    assert.equal(wallModule.isWoodenWallBuilding(500021), true);
    assert.equal(wallModule.isWoodenWallBuilding(50003), false);

    assert.equal(wallModule.isStoneWallBuilding(50003), true);
    assert.equal(wallModule.isStoneWallBuilding('50003'), true);
    assert.equal(wallModule.isStoneWallBuilding(500031), true);
    assert.equal(wallModule.isStoneWallBuilding(500032), true);
    assert.equal(wallModule.isStoneWallBuilding(50002), false);

    assert.equal(wallModule.isWallBuilding(50002), true);
    assert.equal(wallModule.isWallBuilding(50003), true);
    assert.equal(wallModule.isWallBuilding(50001), false);
    assert.equal(wallModule.isWallBuilding(null), false);
    assert.equal(wallModule.isWallBuilding(undefined), false);
});

test('roadAutotile identifiers and predicates recognize dirt roads cleanly', () => {
    assert.equal(roadModule.ROAD_BUILDING_ID, 50001);
    assert.equal(roadModule.isRoadBuilding(50001), true);
    assert.equal(roadModule.isRoadBuilding('50001'), true);
    assert.equal(roadModule.isRoadBuilding(500012), true);
    assert.equal(roadModule.isRoadBuilding(50006), false);
    assert.equal(roadModule.isRoadBuilding(null), false);
});

test('pavementAutotile identifiers and predicates recognize pavements cleanly', () => {
    assert.equal(paveModule.PAVEMENT_BUILDING_ID, 50006);
    assert.equal(paveModule.isPavementBuilding(50006), true);
    assert.equal(paveModule.isPavementBuilding('50006'), true);
    assert.equal(paveModule.isPavementBuilding(500061), true);
    assert.equal(paveModule.isPavementBuilding(50007), true);
    assert.equal(paveModule.isPavementBuilding(50001), false);
    assert.equal(paveModule.isPavementBuilding(null), false);
});

test('all 16 wooden wall PNGs exist on disk, are valid PNGs, and match mask lookup', () => {
    assert.equal(wallModule.WOODEN_WALL_TILES_BY_MASK.length, 16);
    assert.equal(wallModule.ALL_WOODEN_WALL_ASSET_URLS.length, 16);
    assert.equal(new Set(wallModule.WOODEN_WALL_TILES_BY_MASK).size, 16);

    for (let mask = 0; mask < 16; mask++) {
        const url = wallModule.WOODEN_WALL_TILES_BY_MASK[mask];
        const relPath = url.startsWith('/') ? url.slice(1) : url;
        const absPath = path.join(ROOT_DIR, 'public', relPath);
        assert.ok(fs.existsSync(absPath), `Missing wooden wall sprite: ${absPath}`);

        const buf = fs.readFileSync(absPath);
        assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${url} is not a valid PNG`);

        // Test mask resolution
        const ne = (mask & 1) !== 0;
        const se = (mask & 2) !== 0;
        const sw = (mask & 4) !== 0;
        const nw = (mask & 8) !== 0;
        const isNeighbor = (nx, ny) => {
            if (nx === 5 && ny === 4) return ne;
            if (nx === 6 && ny === 5) return se;
            if (nx === 5 && ny === 6) return sw;
            if (nx === 4 && ny === 5) return nw;
            return false;
        };
        assert.equal(wallModule.getWoodenWallTileUrl(5, 5, isNeighbor), url);
    }
});

test('all 16 stone wall PNGs exist on disk, are valid PNGs, and match mask lookup', () => {
    assert.equal(wallModule.STONE_WALL_TILES_BY_MASK.length, 16);
    assert.equal(wallModule.ALL_STONE_WALL_ASSET_URLS.length, 16);
    assert.equal(new Set(wallModule.STONE_WALL_TILES_BY_MASK).size, 16);

    for (let mask = 0; mask < 16; mask++) {
        const url = wallModule.STONE_WALL_TILES_BY_MASK[mask];
        const relPath = url.startsWith('/') ? url.slice(1) : url;
        const absPath = path.join(ROOT_DIR, 'public', relPath);
        assert.ok(fs.existsSync(absPath), `Missing stone wall sprite: ${absPath}`);

        const buf = fs.readFileSync(absPath);
        assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${url} is not a valid PNG`);

        // Test mask resolution
        const ne = (mask & 1) !== 0;
        const se = (mask & 2) !== 0;
        const sw = (mask & 4) !== 0;
        const nw = (mask & 8) !== 0;
        const isNeighbor = (nx, ny) => {
            if (nx === 10 && ny === 9) return ne;
            if (nx === 11 && ny === 10) return se;
            if (nx === 10 && ny === 11) return sw;
            if (nx === 9 && ny === 10) return nw;
            return false;
        };
        assert.equal(wallModule.getStoneWallTileUrl(10, 10, isNeighbor), url);
    }
});

test('all 16 road PNGs exist on disk, are valid PNGs, and match mask lookup', () => {
    assert.equal(roadModule.ROAD_TILES_BY_MASK.length, 16);
    assert.equal(roadModule.ALL_ROAD_ASSET_URLS.length, 16);
    assert.equal(new Set(roadModule.ROAD_TILES_BY_MASK).size, 16);

    for (let mask = 0; mask < 16; mask++) {
        const url = roadModule.ROAD_TILES_BY_MASK[mask];
        const relPath = url.startsWith('/') ? url.slice(1) : url;
        const absPath = path.join(ROOT_DIR, 'public', relPath);
        assert.ok(fs.existsSync(absPath), `Missing road sprite: ${absPath}`);

        const buf = fs.readFileSync(absPath);
        assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${url} is not a valid PNG`);

        const ne = (mask & 1) !== 0;
        const se = (mask & 2) !== 0;
        const sw = (mask & 4) !== 0;
        const nw = (mask & 8) !== 0;
        const isNeighbor = (nx, ny) => {
            if (nx === 20 && ny === 19) return ne;
            if (nx === 21 && ny === 20) return se;
            if (nx === 20 && ny === 21) return sw;
            if (nx === 19 && ny === 20) return nw;
            return false;
        };
        assert.equal(roadModule.getRoadTileUrl(20, 20, isNeighbor), url);
    }
});

test('all 16 pavement PNGs exist on disk, are valid PNGs, and match mask lookup', () => {
    assert.equal(paveModule.PAVEMENT_TILES_BY_MASK.length, 16);
    assert.equal(paveModule.ALL_PAVEMENT_ASSET_URLS.length, 16);
    assert.equal(new Set(paveModule.PAVEMENT_TILES_BY_MASK).size, 16);

    for (let mask = 0; mask < 16; mask++) {
        const url = paveModule.PAVEMENT_TILES_BY_MASK[mask];
        const relPath = url.startsWith('/') ? url.slice(1) : url;
        const absPath = path.join(ROOT_DIR, 'public', relPath);
        assert.ok(fs.existsSync(absPath), `Missing pavement sprite: ${absPath}`);

        const buf = fs.readFileSync(absPath);
        assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${url} is not a valid PNG`);

        const ne = (mask & 1) !== 0;
        const se = (mask & 2) !== 0;
        const sw = (mask & 4) !== 0;
        const nw = (mask & 8) !== 0;
        const isNeighbor = (nx, ny) => {
            if (nx === 30 && ny === 29) return ne;
            if (nx === 31 && ny === 30) return se;
            if (nx === 30 && ny === 31) return sw;
            if (nx === 29 && ny === 30) return nw;
            return false;
        };
        assert.equal(paveModule.getPavementTileUrl(30, 30, isNeighbor), url);
    }
});

test('world-wrap neighbor check works consistently across boundaries', () => {
    // Road at boundary (0, 0) connecting to wrapped neighbor (WORLD_WIDTH_TILES - 1, 0) to the NW
    const grid = new Map();
    grid.set(`${0},${0}`, 50001);
    grid.set(`${WORLD_WIDTH_TILES - 1},${0}`, 50001);

    const isRoadAtWrapped = (nx, ny) => {
        const wx = wrapCoord(nx, WORLD_WIDTH_TILES);
        const wy = wrapCoord(ny, WORLD_HEIGHT_TILES);
        return grid.has(`${wx},${wy}`);
    };

    // (0, 0) has NW neighbor at (-1, 0) which wraps to (WORLD_WIDTH_TILES - 1, 0)
    const mask = roadModule.getRoadTileMask(0, 0, isRoadAtWrapped);
    assert.equal(mask, 8, 'NW bitmask must be 8 across world boundary wrap');
    assert.equal(roadModule.getRoadTileUrl(0, 0, isRoadAtWrapped), '/buildings/Дороги/new tiles roade/roads/300010.png');
});
