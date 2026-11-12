export const PAVEMENT_BUILDING_ID = 50006;

const PAVEMENT_BUILDING_IDS = new Set<number>([
    50006,
    500061,
    50007,
    500072,
    500073,
    500074,
    500075,
    500076,
    500077,
    500078,
    500079,
    5000720,
    5000721,
    5000722,
    5000723,
    5000724,
    5000725,
]);

export function isPavementBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return PAVEMENT_BUILDING_IDS.has(Number(buildingId));
}

const PAVEMENT_BASE_PATH = '/buildings/Дороги/new tiles roade/pavement';

/**
 * Isometric 4-neighbor autotile table indexed by bitmask:
 *   bit 0 (1): NE / TR neighbor at (x, y - 1)
 *   bit 1 (2): SE / BR neighbor at (x + 1, y)
 *   bit 2 (4): SW / BL neighbor at (x, y + 1)
 *   bit 3 (8): NW / TL neighbor at (x - 1, y)
 *
 * Filenames preserve original Gnomograd `35<NE><SW><NW><SE>.png` format.
 */
export const PAVEMENT_TILES_BY_MASK: readonly string[] = [
    `${PAVEMENT_BASE_PATH}/350000.png`, // 0: isolated cobblestone square with lantern
    `${PAVEMENT_BASE_PATH}/351000.png`, // 1: NE dead-end with lantern
    `${PAVEMENT_BASE_PATH}/350001.png`, // 2: SE dead-end with lantern
    `${PAVEMENT_BASE_PATH}/351001.png`, // 3: NE + SE bend with lantern
    `${PAVEMENT_BASE_PATH}/350100.png`, // 4: SW dead-end with lantern
    `${PAVEMENT_BASE_PATH}/351100.png`, // 5: NE + SW straight
    `${PAVEMENT_BASE_PATH}/350101.png`, // 6: SE + SW bend with lantern
    `${PAVEMENT_BASE_PATH}/351101.png`, // 7: NE + SE + SW T-junction with lantern
    `${PAVEMENT_BASE_PATH}/350010.png`, // 8: NW dead-end with lantern
    `${PAVEMENT_BASE_PATH}/351010.png`, // 9: NE + NW bend
    `${PAVEMENT_BASE_PATH}/350011.png`, // 10: SE + NW straight
    `${PAVEMENT_BASE_PATH}/351011.png`, // 11: NE + SE + NW T-junction with lantern
    `${PAVEMENT_BASE_PATH}/350110.png`, // 12: SW + NW bend with lantern
    `${PAVEMENT_BASE_PATH}/351110.png`, // 13: NE + SW + NW T-junction with lantern
    `${PAVEMENT_BASE_PATH}/350111.png`, // 14: SE + SW + NW T-junction with lantern
    `${PAVEMENT_BASE_PATH}/351111.png`, // 15: all 4 crossroads with lantern
] as const;

export const ALL_PAVEMENT_ASSET_URLS: string[] = [...PAVEMENT_TILES_BY_MASK];

export function getPavementTileMask(
    x: number,
    y: number,
    isPavementAt: (nx: number, ny: number) => boolean
): number {
    let mask = 0;
    if (isPavementAt(x, y - 1)) mask |= 1; // NE / TR
    if (isPavementAt(x + 1, y)) mask |= 2; // SE / BR
    if (isPavementAt(x, y + 1)) mask |= 4; // SW / BL
    if (isPavementAt(x - 1, y)) mask |= 8; // NW / TL
    return mask;
}

export function getPavementTileUrl(
    x: number,
    y: number,
    isPavementAt: (nx: number, ny: number) => boolean
): string {
    return PAVEMENT_TILES_BY_MASK[getPavementTileMask(x, y, isPavementAt)];
}
