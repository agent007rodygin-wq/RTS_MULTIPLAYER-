export const MOUNTAIN_BUILDING_ID = 50005;

export function isMountainBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return Number(buildingId) === MOUNTAIN_BUILDING_ID;
}

const MOUNTAIN_BASE_PATH = '/buildings/Реки и Горы/mountin';

/**
 * Isometric 4-neighbor autotile table indexed by bitmask:
 *   bit 0 (1): NE / TR neighbor at (x, y - 1)
 *   bit 1 (2): SE / BR neighbor at (x + 1, y)
 *   bit 2 (4): SW / BL neighbor at (x, y + 1)
 *   bit 3 (8): NW / TL neighbor at (x - 1, y)
 *
 * Asset filenames preserve the original `34<NE><SW><NW><SE>.png` encoding.
 */
export const MOUNTAIN_TILES_BY_MASK: readonly string[] = [
    `${MOUNTAIN_BASE_PATH}/340000.png`, // 0: isolated peak
    `${MOUNTAIN_BASE_PATH}/341000.png`, // 1: NE
    `${MOUNTAIN_BASE_PATH}/340001.png`, // 2: SE
    `${MOUNTAIN_BASE_PATH}/341001.png`, // 3: NE + SE
    `${MOUNTAIN_BASE_PATH}/340100.png`, // 4: SW
    `${MOUNTAIN_BASE_PATH}/341100.png`, // 5: NE + SW (straight ridge)
    `${MOUNTAIN_BASE_PATH}/340101.png`, // 6: SE + SW
    `${MOUNTAIN_BASE_PATH}/341101.png`, // 7: NE + SE + SW
    `${MOUNTAIN_BASE_PATH}/340010.png`, // 8: NW
    `${MOUNTAIN_BASE_PATH}/341010.png`, // 9: NE + NW
    `${MOUNTAIN_BASE_PATH}/340011.png`, // 10: SE + NW (straight ridge)
    `${MOUNTAIN_BASE_PATH}/341011.png`, // 11: NE + SE + NW
    `${MOUNTAIN_BASE_PATH}/340110.png`, // 12: SW + NW
    `${MOUNTAIN_BASE_PATH}/341110.png`, // 13: NE + SW + NW
    `${MOUNTAIN_BASE_PATH}/340111.png`, // 14: SE + SW + NW
    `${MOUNTAIN_BASE_PATH}/341111.png`, // 15: all 4 neighbors (caldera center)
] as const;

export const ALL_MOUNTAIN_ASSET_URLS: string[] = [...MOUNTAIN_TILES_BY_MASK];

/**
 * Computes the 4-bit cardinal autotile mask for a mountain at tile `(x, y)`.
 */
export function getMountainTileMask(
    x: number,
    y: number,
    isMountainAt: (nx: number, ny: number) => boolean
): number {
    let mask = 0;
    if (isMountainAt(x, y - 1)) mask |= 1; // NE / TR
    if (isMountainAt(x + 1, y)) mask |= 2; // SE / BR
    if (isMountainAt(x, y + 1)) mask |= 4; // SW / BL
    if (isMountainAt(x - 1, y)) mask |= 8; // NW / TL
    return mask;
}

/**
 * Resolves the autotile sprite URL for a mountain tile at `(x, y)`.
 */
export function getMountainTileUrl(
    x: number,
    y: number,
    isMountainAt: (nx: number, ny: number) => boolean
): string {
    return MOUNTAIN_TILES_BY_MASK[getMountainTileMask(x, y, isMountainAt)];
}
