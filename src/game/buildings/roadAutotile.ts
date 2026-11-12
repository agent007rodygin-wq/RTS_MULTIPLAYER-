export const ROAD_BUILDING_ID = 50001;

const ROAD_BUILDING_IDS = new Set<number>([
    50001,
    500012,
    500013,
    500014,
    500015,
    500016,
    500017,
    500018,
    500019,
    5000120,
    5000121,
    5000122,
    5000123,
    5000124,
    5000125,
]);

export function isRoadBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return ROAD_BUILDING_IDS.has(Number(buildingId));
}

const ROAD_BASE_PATH = '/buildings/Дороги/new tiles roade/roads';

/**
 * Isometric 4-neighbor autotile table indexed by bitmask:
 *   bit 0 (1): NE / TR neighbor at (x, y - 1)
 *   bit 1 (2): SE / BR neighbor at (x + 1, y)
 *   bit 2 (4): SW / BL neighbor at (x, y + 1)
 *   bit 3 (8): NW / TL neighbor at (x - 1, y)
 *
 * Filenames preserve original Gnomograd `30<NE><SW><NW><SE>.png` format.
 */
export const ROAD_TILES_BY_MASK: readonly string[] = [
    `${ROAD_BASE_PATH}/300000.png`, // 0: isolated dirt spot
    `${ROAD_BASE_PATH}/301000.png`, // 1: NE dead-end
    `${ROAD_BASE_PATH}/300001.png`, // 2: SE dead-end
    `${ROAD_BASE_PATH}/301001.png`, // 3: NE + SE bend
    `${ROAD_BASE_PATH}/300100.png`, // 4: SW dead-end
    `${ROAD_BASE_PATH}/301100.png`, // 5: NE + SW straight
    `${ROAD_BASE_PATH}/300101.png`, // 6: SE + SW bend
    `${ROAD_BASE_PATH}/301101.png`, // 7: NE + SE + SW T-junction
    `${ROAD_BASE_PATH}/300010.png`, // 8: NW dead-end
    `${ROAD_BASE_PATH}/301010.png`, // 9: NE + NW bend
    `${ROAD_BASE_PATH}/300011.png`, // 10: SE + NW straight
    `${ROAD_BASE_PATH}/301011.png`, // 11: NE + SE + NW T-junction
    `${ROAD_BASE_PATH}/300110.png`, // 12: SW + NW bend
    `${ROAD_BASE_PATH}/301110.png`, // 13: NE + SW + NW T-junction
    `${ROAD_BASE_PATH}/300111.png`, // 14: SE + SW + NW T-junction
    `${ROAD_BASE_PATH}/301111.png`, // 15: all 4 crossroads
] as const;

export const ALL_ROAD_ASSET_URLS: string[] = [...ROAD_TILES_BY_MASK];

export function getRoadTileMask(
    x: number,
    y: number,
    isRoadAt: (nx: number, ny: number) => boolean
): number {
    let mask = 0;
    if (isRoadAt(x, y - 1)) mask |= 1; // NE / TR
    if (isRoadAt(x + 1, y)) mask |= 2; // SE / BR
    if (isRoadAt(x, y + 1)) mask |= 4; // SW / BL
    if (isRoadAt(x - 1, y)) mask |= 8; // NW / TL
    return mask;
}

export function getRoadTileUrl(
    x: number,
    y: number,
    isRoadAt: (nx: number, ny: number) => boolean
): string {
    return ROAD_TILES_BY_MASK[getRoadTileMask(x, y, isRoadAt)];
}
