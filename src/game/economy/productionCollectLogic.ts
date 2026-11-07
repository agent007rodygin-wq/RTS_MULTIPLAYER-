/**
 * Production and Collection Logic for City Businesses, Garden Beds, and Financial Intelligence
 *
 * Implements 1-click collection of finished production, cooldown tracking,
 * and Egyptian Obelisk perk validation.
 */

import type { Building, PlacedBuilding } from '../../../types';

export const EGYPTIAN_OBELISK_IDS: number[] = Array.from({ length: 20 }, (_, i) => 185 + i); // IDs 185 to 204
export const FINANCIAL_INTELLIGENCE_IDS: number[] = [340, 341, 342];
export const FINANCIAL_COLLECT_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

const CANNON_IDS = new Set([700, 701, 365, 366, 367, 368, 369, 370, 382, 383, 384, 385]);
const BANDIT_CASTLE_IDS = new Set([200, 201, 202, 203]);
const EXCLUDED_PRODUCTION_IDS = new Set([301, 306, 312, 331, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 360, 361, 371, 381, 413, 414, 452, 726, 752, 328, 329, 311, 801, 214, 215, 216]);

export const WATCHTOWER_IDS = [801, 214, 215, 216];
export const isWatchtowerId = (id: number | string | undefined | null) => id != null && WATCHTOWER_IDS.includes(Number(id));

/**
 * Checks if the player has an active, completed Egyptian Obelisk
 */
export function checkHasEgyptianObelisk(
    buildings: PlacedBuilding[],
    isMyBuilding: (b: PlacedBuilding) => boolean
): boolean {
    return buildings.some(b =>
        b.buildingId >= 185 &&
        b.buildingId <= 204 &&
        isMyBuilding(b) &&
        !b.isConstructing &&
        (b.hp === undefined || b.hp > 0)
    );
}

/**
 * Returns cooldown status for Financial Intelligence 1-click collection.
 */
export function getFinancialCollectCooldownStatus(
    lastCollectTime: number,
    hasEgyptianObelisk: boolean,
    now: number = Date.now()
): {
    isReady: boolean;
    remainingMs: number;
    hasObeliskPerk: boolean;
    cooldownMs: number;
} {
    if (hasEgyptianObelisk) {
        return {
            isReady: true,
            remainingMs: 0,
            hasObeliskPerk: true,
            cooldownMs: 0,
        };
    }

    const elapsed = Math.max(0, now - lastCollectTime);
    const remainingMs = Math.max(0, FINANCIAL_COLLECT_COOLDOWN_MS - elapsed);
    return {
        isReady: remainingMs === 0,
        remainingMs,
        hasObeliskPerk: false,
        cooldownMs: FINANCIAL_COLLECT_COOLDOWN_MS,
    };
}

/**
 * Checks if building is finished and ready for harvest/collection.
 */
export function isBuildingReadyForCollection(
    building: PlacedBuilding,
    now: number = Date.now()
): boolean {
    if (building.isConstructing || building.isDestroying) return false;
    if (building.hp !== undefined && building.hp <= 0) return false;
    if (BANDIT_CASTLE_IDS.has(Number(building.buildingId))) return false;

    if (building.workState === 'finished') return true;
    if (building.workState === 'working' && building.workEndTime && now >= building.workEndTime) {
        return true;
    }
    return false;
}

/**
 * Checks if a building is a valid productive enterprise that can work/produce.
 */
export function isProductiveBuilding(info?: Building): boolean {
    if (!info) return false;
    if (info.category === 'Защита') return false;
    if (BANDIT_CASTLE_IDS.has(info.id)) return false;
    if (EXCLUDED_PRODUCTION_IDS.has(info.id)) return false;

    const stats = info.stats;
    if (!stats) return false;

    return Boolean(
        stats.workTimeSeconds ||
        stats.workYieldGold ||
        stats.givesCoins ||
        (stats.produces && stats.produces.length > 0) ||
        (stats.consumes && stats.consumes.length > 0)
    );
}

/**
 * Checks if a building is currently idle and ready to start production.
 */
export function isBuildingProductionIdle(
    building: PlacedBuilding,
    info?: Building
): boolean {
    if (building.isConstructing || building.isDestroying) return false;
    if (building.hp !== undefined && building.hp <= 0) return false;
    if (!isProductiveBuilding(info)) return false;

    return !building.workState || building.workState === 'idle';
}

/**
 * Calculates next building ID upon crop/bed harvest.
 */
export function calculateNextCropBuildingId(bid: number): number {
    // 20% super chance roll simulation default
    const isSuperChance = Math.random() < 0.2;

    if (bid === 70) return isSuperChance ? 77 : 71;
    if (bid === 71) return 72;
    if (bid === 72) return 73;
    if (bid === 73 || bid === 80) return 70;
    if (bid === 77) return 78;
    if (bid === 78) return 80;

    if (bid === 82) return 83;
    if (bid === 83) return 84;
    if (bid === 84) return 85;
    if (bid === 85) return 86;
    if (bid === 86) return 87;
    if (bid === 87) return Math.random() < 0.013 ? 89 : 82;
    if (bid === 89) return 90;
    if (bid === 90) return 91;
    if (bid === 91) return 92;
    if (bid === 92) return 93;
    if (bid === 93) return 94;
    if (bid === 94) return 82;

    if (bid === 102) return 103;
    if (bid === 103) return Math.random() < 0.013 ? 109 : 104;
    if (bid === 104) return 105;
    if (bid === 105) return 106;
    if (bid === 106) return 107;
    if (bid === 107) return 102;
    if (bid === 109) return 110;
    if (bid === 110) return 111;
    if (bid === 111) return 112;
    if (bid === 112) return 102;

    if (bid === 240) return 241;
    if (bid === 241) return 242;
    if (bid === 242) return 243;
    if (bid === 243) return 244;
    if (bid === 244) return 245;
    if (bid === 245) return Math.random() < 0.013 ? 251 : 246;
    if (bid === 246) return 247;
    if (bid === 247) return 248;
    if (bid === 248) return 249;
    if (bid === 249) return 240;
    if (bid === 251) return 252;
    if (bid === 252) return 253;
    if (bid === 253) return 254;
    if (bid === 254) return 255;
    if (bid === 255) return 256;
    if (bid === 256) return 257;
    if (bid === 257) return 258;
    if (bid === 258) return 259;
    if (bid === 259) return 240;

    if (bid === 274) return 275;
    if (bid === 275) return 276;
    if (bid === 276) return 277;
    if (bid === 277) return 278;
    if (bid === 278) return 279;
    if (bid === 279) return Math.random() < 0.013 ? 286 : 280;
    if (bid === 280) return 281;
    if (bid === 281) return 282;
    if (bid === 282) return 283;
    if (bid === 283) return 284;
    if (bid === 284) return 285;
    if (bid === 285) return 274;
    if (bid === 286) return 287;
    if (bid === 287) return 288;
    if (bid === 288) return 289;
    if (bid === 289) return 290;
    if (bid === 290) return 291;
    if (bid === 291) return 292;
    if (bid === 292) return 293;
    if (bid === 293) return 294;
    if (bid === 294) return 295;
    if (bid === 295) return 274;

    if (bid === 313) return 314;
    if (bid === 314) return 315;
    if (bid === 315) return Math.random() < 0.013 ? 320 : 316;
    if (bid === 316) return 317;
    if (bid === 317) return 318;
    if (bid === 318) return 313;
    if (bid === 320) return 321;
    if (bid === 321) return 322;
    if (bid === 322) return 323;
    if (bid === 323) return 313;

    if (bid === 2) return 17;
    if (bid === 17) return 18;
    if (bid === 18) return 19;
    if (bid === 19) return 30;
    if (bid === 30) return 31;
    if (bid === 31) return 32;
    if (bid === 32) return 2;

    if (bid >= 577 && bid < 597) return bid + 1;
    if (bid === 597) return 577;

    if (bid === 400) return 402;
    if (bid === 401) return 406;
    if (bid === 406) return 407;
    if (bid === 407) return 408;
    if (bid === 408) return 409;
    if (bid === 409) return 400;
    if (bid === 402) return 403;
    if (bid === 403) return 404;
    if (bid === 404) return 405;
    if (bid === 405) return isSuperChance ? 401 : 400;

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
    if (bid === 627) return Math.random() < 0.45 ? 628 : 600;
    if (bid === 628) return 629;
    if (bid === 629) return 630;
    if (bid === 630) return 631;
    if (bid === 631) return 632;
    if (bid === 632) return 633;
    if (bid === 633) return 634;
    if (bid === 634) return 635;
    if (bid === 635) return 600;

    // Default: stays the same (e.g. sawmills, workshops, factories)
    return bid;
}

/**
 * Calculates raw gold output for a building based on ID overrides and base stats.
 */
export function calculateBuildingBaseGoldYield(bid: number, info?: Building): number {
    if (CANNON_IDS.has(bid)) return 0;

    if ([70, 71, 72, 77, 78, 79].includes(bid)) return 5;
    if (bid === 73) return 170;
    if (bid === 80) return 2200;

    if ([400, 401, 402, 403, 404, 406, 407, 408].includes(bid)) return 3;
    if (bid === 405) return 100;
    if (bid === 409) return 1200;

    if ([82, 83, 84, 85, 86, 89, 90, 91, 92, 93].includes(bid)) return 10;
    if (bid === 87) return 400;
    if (bid === 94) return 4000;

    if ([102, 103, 104, 105, 106, 109, 110, 111].includes(bid)) return 5;
    if (bid === 107) return 200;
    if (bid === 112) return 1000;

    if ([240, 241, 242, 243, 244, 245, 246, 247, 248].includes(bid)) return 20;
    if (bid === 249) return 12000;
    if ([251, 252, 253, 254, 255, 256, 257, 258].includes(bid)) return 30;
    if (bid === 259) return 20000;

    if ([274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284].includes(bid)) return 40;
    if (bid === 285) return 20000;
    if ([286, 287, 288, 289, 290, 291, 292, 293, 294].includes(bid)) return 60;
    if (bid === 295) return 40000;

    if ([313, 314, 315, 316, 317].includes(bid)) return 70;
    if (bid === 318) return 30000;
    if ([320, 321, 322].includes(bid)) return 100;
    if (bid === 323) return 50000;

    if ([600, 617, 618, 636, 620, 621, 622, 623, 624, 625, 626].includes(bid)) return 50;
    if (bid === 627) return 100;
    if ([628, 629, 630, 631, 632, 633].includes(bid)) return 200;
    if (bid === 634) return 500;
    if (bid === 635) return 1000;

    return (info?.stats.givesCoins || info?.stats.workYieldGold || 0);
}

/**
 * Calculates complete production rewards (gold + items + next building state) for collection.
 */
export function calculateBuildingReward(params: {
    building: PlacedBuilding;
    info: Building;
    allBuildings?: PlacedBuilding[];
    zoneSize?: number;
}): {
    gold: number;
    inventoryDeltas: Record<number, number>;
    nextBuildingId: number;
} {
    const { building, info, allBuildings = [], zoneSize = 64 } = params;
    const bid = Number(building.buildingId);

    let gold = calculateBuildingBaseGoldYield(bid, info);

    // Apply sector tax if watchtower with tax is present in the sector
    if (gold > 0 && allBuildings.length > 0) {
        const zoneX = Math.floor(building.x / zoneSize);
        const zoneY = Math.floor(building.y / zoneSize);

        const taxCollector = allBuildings.find(b =>
            isWatchtowerId(b.buildingId) &&
            !b.isConstructing &&
            Math.floor(b.x / zoneSize) === zoneX &&
            Math.floor(b.y / zoneSize) === zoneY
        );

        if (taxCollector && taxCollector.taxRate && taxCollector.taxRate > 0) {
            const taxRate = Math.min(50, Math.max(0, taxCollector.taxRate));
            gold = Math.floor(gold * (1 - taxRate / 100));
        }
    }

    const inventoryDeltas: Record<number, number> = {};
    if (info.stats.produces) {
        info.stats.produces.forEach(prod => {
            inventoryDeltas[prod.id] = (inventoryDeltas[prod.id] || 0) + (prod.amount || 0);
        });
    }

    if (info.stats.sometimesProduces) {
        info.stats.sometimesProduces.forEach(sp => {
            if (Math.random() * 100 < (sp.chance || 0)) {
                const qty = sp.amount || 1;
                inventoryDeltas[sp.id] = (inventoryDeltas[sp.id] || 0) + qty;
            }
        });
    }

    const nextBuildingId = calculateNextCropBuildingId(bid);

    return {
        gold,
        inventoryDeltas,
        nextBuildingId,
    };
}
