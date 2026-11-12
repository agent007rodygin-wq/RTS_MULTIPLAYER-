export const WOODEN_WALL_BUILDING_ID = 50002;
export const STONE_WALL_BUILDING_ID = 50003;

const WOODEN_WALL_BUILDING_IDS = new Set<number>([50002, 500021]);
const STONE_WALL_BUILDING_IDS = new Set<number>([50003, 500031, 500032]);

export function isWoodenWallBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return WOODEN_WALL_BUILDING_IDS.has(Number(buildingId));
}

export function isStoneWallBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return STONE_WALL_BUILDING_IDS.has(Number(buildingId));
}

export function isWallBuilding(buildingId: number | string | null | undefined): boolean {
    return isWoodenWallBuilding(buildingId) || isStoneWallBuilding(buildingId);
}

const WOODEN_WALL_BASE_PATH = '/buildings/Дороги/new wals/wooden';
const STONE_WALL_BASE_PATH = '/buildings/Дороги/new wals/stone';

/**
 * Isometric 4-neighbor autotile table indexed by bitmask:
 *   bit 0 (1): NE / TR neighbor at (x, y - 1)
 *   bit 1 (2): SE / BR neighbor at (x + 1, y)
 *   bit 2 (4): SW / BL neighbor at (x, y + 1)
 *   bit 3 (8): NW / TL neighbor at (x - 1, y)
 *
 * Filenames preserve original Gnomograd `<prefix><NE><SW><NW><SE>.png` format.
 */
export const WOODEN_WALL_TILES_BY_MASK: readonly string[] = [
    `${WOODEN_WALL_BASE_PATH}/310000.png`, // 0: isolated post / tower
    `${WOODEN_WALL_BASE_PATH}/311000.png`, // 1: NE
    `${WOODEN_WALL_BASE_PATH}/310001.png`, // 2: SE
    `${WOODEN_WALL_BASE_PATH}/311001.png`, // 3: NE + SE
    `${WOODEN_WALL_BASE_PATH}/310100.png`, // 4: SW
    `${WOODEN_WALL_BASE_PATH}/311100.png`, // 5: NE + SW (straight)
    `${WOODEN_WALL_BASE_PATH}/310101.png`, // 6: SE + SW
    `${WOODEN_WALL_BASE_PATH}/311101.png`, // 7: NE + SE + SW
    `${WOODEN_WALL_BASE_PATH}/310010.png`, // 8: NW
    `${WOODEN_WALL_BASE_PATH}/311010.png`, // 9: NE + NW
    `${WOODEN_WALL_BASE_PATH}/310011.png`, // 10: SE + NW (straight)
    `${WOODEN_WALL_BASE_PATH}/311011.png`, // 11: NE + SE + NW
    `${WOODEN_WALL_BASE_PATH}/310110.png`, // 12: SW + NW
    `${WOODEN_WALL_BASE_PATH}/311110.png`, // 13: NE + SW + NW
    `${WOODEN_WALL_BASE_PATH}/310111.png`, // 14: SE + SW + NW
    `${WOODEN_WALL_BASE_PATH}/311111.png`, // 15: all 4 neighbors
] as const;

export const STONE_WALL_TILES_BY_MASK: readonly string[] = [
    `${STONE_WALL_BASE_PATH}/320000.png`, // 0: isolated pillar
    `${STONE_WALL_BASE_PATH}/321000.png`, // 1: NE
    `${STONE_WALL_BASE_PATH}/320001.png`, // 2: SE
    `${STONE_WALL_BASE_PATH}/321001.png`, // 3: NE + SE
    `${STONE_WALL_BASE_PATH}/320100.png`, // 4: SW
    `${STONE_WALL_BASE_PATH}/321100.png`, // 5: NE + SW (straight)
    `${STONE_WALL_BASE_PATH}/320101.png`, // 6: SE + SW
    `${STONE_WALL_BASE_PATH}/321101.png`, // 7: NE + SE + SW
    `${STONE_WALL_BASE_PATH}/320010.png`, // 8: NW
    `${STONE_WALL_BASE_PATH}/321010.png`, // 9: NE + NW
    `${STONE_WALL_BASE_PATH}/320011.png`, // 10: SE + NW (straight)
    `${STONE_WALL_BASE_PATH}/321011.png`, // 11: NE + SE + NW
    `${STONE_WALL_BASE_PATH}/320110.png`, // 12: SW + NW
    `${STONE_WALL_BASE_PATH}/321110.png`, // 13: NE + SW + NW
    `${STONE_WALL_BASE_PATH}/320111.png`, // 14: SE + SW + NW
    `${STONE_WALL_BASE_PATH}/321111.png`, // 15: all 4 neighbors
] as const;

export const ALL_WOODEN_WALL_ASSET_URLS: string[] = [...WOODEN_WALL_TILES_BY_MASK];
export const ALL_STONE_WALL_ASSET_URLS: string[] = [...STONE_WALL_TILES_BY_MASK];
export const ALL_WALL_ASSET_URLS: string[] = [...ALL_WOODEN_WALL_ASSET_URLS, ...ALL_STONE_WALL_ASSET_URLS];

export function getWallTileMask(
    x: number,
    y: number,
    isSameWallAt: (nx: number, ny: number) => boolean
): number {
    let mask = 0;
    if (isSameWallAt(x, y - 1)) mask |= 1; // NE / TR
    if (isSameWallAt(x + 1, y)) mask |= 2; // SE / BR
    if (isSameWallAt(x, y + 1)) mask |= 4; // SW / BL
    if (isSameWallAt(x - 1, y)) mask |= 8; // NW / TL
    return mask;
}

export function getWoodenWallTileUrl(
    x: number,
    y: number,
    isWoodenWallAt: (nx: number, ny: number) => boolean
): string {
    return WOODEN_WALL_TILES_BY_MASK[getWallTileMask(x, y, isWoodenWallAt)];
}

export function getStoneWallTileUrl(
    x: number,
    y: number,
    isStoneWallAt: (nx: number, ny: number) => boolean
): string {
    return STONE_WALL_TILES_BY_MASK[getWallTileMask(x, y, isStoneWallAt)];
}
