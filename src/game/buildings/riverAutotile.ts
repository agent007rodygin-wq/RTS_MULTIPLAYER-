export const RIVER_BUILDING_ID = 50004;

export function isRiverBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    const numId = Number(buildingId);
    return numId === RIVER_BUILDING_ID || numId === 500040;
}

const RIVER_BASE_PATH = '/buildings/Реки и Горы/RIVERS';

/**
 * Isometric 4-neighbor autotile table indexed by bitmask:
 *   bit 0 (1): NE / TR neighbor at (x, y - 1)
 *   bit 1 (2): SE / BR neighbor at (x + 1, y)
 *   bit 2 (4): SW / BL neighbor at (x, y + 1)
 *   bit 3 (8): NW / TL neighbor at (x - 1, y)
 *
 * Asset filenames preserve the original `33<NE><SW><NW><SE>.png` encoding.
 */
export const RIVER_TILES_BY_MASK: readonly string[] = [
    `${RIVER_BASE_PATH}/330000.png`, // 0: [0000] isolated lake / pond
    `${RIVER_BASE_PATH}/331000.png`, // 1: [1000] NE source / dead-end
    `${RIVER_BASE_PATH}/330001.png`, // 2: [0001] SE source / dead-end
    `${RIVER_BASE_PATH}/331001.png`, // 3: [1001] NE + SE bend
    `${RIVER_BASE_PATH}/330100.png`, // 4: [0100] SW source / dead-end
    `${RIVER_BASE_PATH}/331100.png`, // 5: [1100] NE + SW (straight channel NE-SW)
    `${RIVER_BASE_PATH}/330101.png`, // 6: [0101] SE + SW bend
    `${RIVER_BASE_PATH}/331101.png`, // 7: [1101] NE + SE + SW (T-junction without NW)
    `${RIVER_BASE_PATH}/330010.png`, // 8: [0010] NW source / dead-end
    `${RIVER_BASE_PATH}/331010.png`, // 9: [1010] NE + NW bend
    `${RIVER_BASE_PATH}/330011.png`, // 10: [0011] SE + NW (straight channel NW-SE)
    `${RIVER_BASE_PATH}/331011.png`, // 11: [1011] NE + SE + NW (T-junction without SW)
    `${RIVER_BASE_PATH}/330110.png`, // 12: [0110] SW + NW bend
    `${RIVER_BASE_PATH}/331110.png`, // 13: [1110] NE + SW + NW (T-junction without SE)
    `${RIVER_BASE_PATH}/330111.png`, // 14: [0111] SE + SW + NW (T-junction without NE)
    `${RIVER_BASE_PATH}/331111.png`, // 15: [1111] all 4 neighbors (crossroads island)
] as const;

export const ALL_RIVER_ASSET_URLS: string[] = [...RIVER_TILES_BY_MASK];

/**
 * Computes the 4-bit cardinal autotile mask for a river at tile `(x, y)`.
 */
export function getRiverTileMask(
    x: number,
    y: number,
    isRiverAt: (nx: number, ny: number) => boolean
): number {
    let mask = 0;
    if (isRiverAt(x, y - 1)) mask |= 1; // NE / TR
    if (isRiverAt(x + 1, y)) mask |= 2; // SE / BR
    if (isRiverAt(x, y + 1)) mask |= 4; // SW / BL
    if (isRiverAt(x - 1, y)) mask |= 8; // NW / TL
    return mask;
}

/**
 * Resolves the autotile sprite URL for a river tile at `(x, y)`.
 */
export function getRiverTileUrl(
    x: number,
    y: number,
    isRiverAt: (nx: number, ny: number) => boolean
): string {
    return RIVER_TILES_BY_MASK[getRiverTileMask(x, y, isRiverAt)];
}
