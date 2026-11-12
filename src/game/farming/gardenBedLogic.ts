/**
 * Garden Bed Growth & Fertilizer Logic
 */

export const BONE_ITEM_ID = 10051;
export const BONE_MEAL_ITEM_ID = 10052;
export const CHAN_VAT_BUILDING_ID = 910;

/**
 * Returns the next level stage building ID for a growing garden bed.
 * If the bed is already at its final growth stage or not a garden bed, returns null.
 */
export function getNextGardenBedStage(bid: number): number | null {
    // Mushroom beds: 70 -> 71 -> 72 -> 73 (max stage)
    if (bid === 70) return 71;
    if (bid === 71) return 72;
    if (bid === 72) return 73;
    // Super mushrooms: 77 -> 78 -> 80 (max stage)
    if (bid === 77) return 78;
    if (bid === 78) return 80;

    // Pumpkin beds: 82 -> 83 -> 84 -> 85 -> 86 -> 87 (max stage)
    if (bid === 82) return 83;
    if (bid === 83) return 84;
    if (bid === 84) return 85;
    if (bid === 85) return 86;
    if (bid === 86) return 87;
    // Super pumpkins: 89 -> 90 -> 91 -> 92 -> 93 -> 94 (max stage)
    if (bid === 89) return 90;
    if (bid === 90) return 91;
    if (bid === 91) return 92;
    if (bid === 92) return 93;
    if (bid === 93) return 94;

    // Bomb beds: 102 -> 103 -> 104 -> 105 -> 106 -> 107 (max stage)
    if (bid === 102) return 103;
    if (bid === 103) return 104;
    if (bid === 104) return 105;
    if (bid === 105) return 106;
    if (bid === 106) return 107;
    // Super bombs: 109 -> 110 -> 111 -> 112 (max stage)
    if (bid === 109) return 110;
    if (bid === 110) return 111;
    if (bid === 111) return 112;

    // Turnip beds: 240 -> 241 -> ... -> 249 (max stage)
    if (bid >= 240 && bid < 249) return bid + 1;
    // Super turnips: 251 -> ... -> 259 (max stage)
    if (bid >= 251 && bid < 259) return bid + 1;

    // Corn/Wheat/etc
    // 274 -> ... -> 285 (max stage)
    if (bid >= 274 && bid < 285) return bid + 1;
    // Super: 286 -> ... -> 295 (max stage)
    if (bid >= 286 && bid < 295) return bid + 1;

    // 313 -> ... -> 318 (max stage)
    if (bid >= 313 && bid < 318) return bid + 1;
    // Super: 320 -> ... -> 323 (max stage)
    if (bid >= 320 && bid < 323) return bid + 1;

    // Water lily beds: 400 -> 402 -> 403 -> 404 -> 405 (max stage)
    if (bid === 400) return 402;
    if (bid === 402) return 403;
    if (bid === 403) return 404;
    if (bid === 404) return 405;
    // Super lilies: 401 -> 406 -> 407 -> 408 -> 409 (max stage)
    if (bid === 401) return 406;
    if (bid === 406) return 407;
    if (bid === 407) return 408;
    if (bid === 408) return 409;

    // Nuclear bomb beds: 600 -> 617 -> 618 -> 636 -> 620 -> 621 -> 622 -> 623 -> 624 -> 625 -> 626 -> 627 (max stage)
    if (bid === 600) return 617;
    if (bid === 617) return 618;
    if (bid === 618) return 636;
    if (bid === 636) return 620;
    if (bid === 620) return 621;
    if (bid === 621) return 622;
    if (bid === 622) return 623;
    if (bid === 623) return 624;
    if (bid === 624) return 625;
    if (bid === 625) return 626;
    if (bid === 626) return 627;
    // Super nuclear: 628 -> 629 -> 630 -> 631 -> 632 -> 633 -> 634 -> 635 (max stage)
    if (bid >= 628 && bid < 635) return bid + 1;

    return null;
}

/**
 * Set of max-stage garden bed IDs which are fully grown and ready for harvest.
 */
export const GARDEN_BED_MAX_STAGES = new Set<number>([
    73, 80, 87, 94, 107, 112, 249, 259, 285, 295, 318, 323, 405, 409, 627, 635
]);

export function isGardenBed(bid: number): boolean {
    return getNextGardenBedStage(bid) !== null || GARDEN_BED_MAX_STAGES.has(bid);
}

export function isGardenBedMaxStage(bid: number): boolean {
    return GARDEN_BED_MAX_STAGES.has(bid);
}
