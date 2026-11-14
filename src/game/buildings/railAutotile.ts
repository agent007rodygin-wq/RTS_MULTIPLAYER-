export const RAIL_BUILDING_ID = 50008;

/**
 * Every railroad piece (straight/turn/dead-end/switch/junction/S-curve).
 * All of them count as rail neighbors when computing the connection mask.
 */
const RAIL_FAMILY_IDS = new Set<number>([
    50008,
    500081,
    500082,
    500083,
    500084,
    500085,
    500086,
    500087,
    500088,
    500089,
    5000810,
    5000811,
    5000812,
    5000813,
    5000814,
    5000815,
    5000816,
    5000817,
    5000818,
    5000819,
    5000820,
    5000821,
    5000822,
    5000823,
    5000824,
    5000825,
]);

/**
 * Core pieces rendered from the neighbor mask (same system as roads).
 * Decorative specials (switches 5000811-5000818, rail_cross_double 5000823,
 * S-curves 5000824/5000825) keep their own definition image so already-placed
 * pieces never change appearance, but still connect as neighbors.
 */
const RAIL_RENDER_IDS = new Set<number>([
    50008, // straight N-S
    500081, // straight W-E
    500082, // corner NE
    500083, // corner ES
    500084, // corner SW
    500085, // corner WN
    500086, // dead end N
    500087, // dead end E
    500088, // dead end S
    500089, // dead end W
    5000810, // crossing
    5000819, // junction N-E-S
    5000820, // junction E-S-W
    5000821, // junction S-W-N
    5000822, // junction W-N-E
]);

export function isRailBuilding(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return RAIL_FAMILY_IDS.has(Number(buildingId));
}

export function isRailRenderTile(buildingId: number | string | null | undefined): boolean {
    if (buildingId === null || buildingId === undefined || buildingId === '') return false;
    return RAIL_RENDER_IDS.has(Number(buildingId));
}

const RAIL_BASE_PATH = '/buildings/Дороги/Железная дорога';

/**
 * Isometric 4-neighbor autotile table indexed by bitmask:
 *   bit 0 (1): NE / TR neighbor at (x, y - 1)  — asset compass: E
 *   bit 1 (2): SE / BR neighbor at (x + 1, y)  — asset compass: S
 *   bit 2 (4): SW / BL neighbor at (x, y + 1)  — asset compass: W
 *   bit 3 (8): NW / TL neighbor at (x - 1, y)  — asset compass: N
 *
 * Asset compass (pixel-verified against the PNGs): N = upper-left edge,
 * E = upper-right edge, S = lower-right edge, W = lower-left edge.
 */
export const RAIL_TILES_BY_MASK: readonly string[] = [
    `${RAIL_BASE_PATH}/rail_dead_end_n.webp`, // 0: isolated stub
    `${RAIL_BASE_PATH}/rail_dead_end_e.webp`, // 1: NE dead-end
    `${RAIL_BASE_PATH}/rail_dead_end_s.webp`, // 2: SE dead-end
    `${RAIL_BASE_PATH}/rail_corner_es.webp`, // 3: NE + SE bend
    `${RAIL_BASE_PATH}/rail_dead_end_w.webp`, // 4: SW dead-end
    `${RAIL_BASE_PATH}/rail_straight_ew.webp`, // 5: NE + SW straight
    `${RAIL_BASE_PATH}/rail_corner_sw.webp`, // 6: SE + SW bend
    `${RAIL_BASE_PATH}/rail_junction_esw.webp`, // 7: NE + SE + SW T-junction
    `${RAIL_BASE_PATH}/rail_dead_end_n.webp`, // 8: NW dead-end
    `${RAIL_BASE_PATH}/rail_corner_ne.webp`, // 9: NW + NE bend
    `${RAIL_BASE_PATH}/rail_straight_ns.webp`, // 10: NW + SE straight
    `${RAIL_BASE_PATH}/rail_junction_nes.webp`, // 11: NW + NE + SE T-junction
    `${RAIL_BASE_PATH}/rail_corner_wn.webp`, // 12: SW + NW bend
    `${RAIL_BASE_PATH}/rail_junction_wne.webp`, // 13: NE + SW + NW T-junction
    `${RAIL_BASE_PATH}/rail_junction_swn.webp`, // 14: SE + SW + NW T-junction
    `${RAIL_BASE_PATH}/rail_crossing.webp`, // 15: all 4 crossroads
] as const;

export const ALL_RAIL_ASSET_URLS: string[] = [...RAIL_TILES_BY_MASK];

export function getRailTileMask(
    x: number,
    y: number,
    isRailAt: (nx: number, ny: number) => boolean
): number {
    let mask = 0;
    if (isRailAt(x, y - 1)) mask |= 1; // NE / TR
    if (isRailAt(x + 1, y)) mask |= 2; // SE / BR
    if (isRailAt(x, y + 1)) mask |= 4; // SW / BL
    if (isRailAt(x - 1, y)) mask |= 8; // NW / TL
    return mask;
}

export function getRailTileUrl(
    x: number,
    y: number,
    isRailAt: (nx: number, ny: number) => boolean
): string {
    return RAIL_TILES_BY_MASK[getRailTileMask(x, y, isRailAt)];
}
