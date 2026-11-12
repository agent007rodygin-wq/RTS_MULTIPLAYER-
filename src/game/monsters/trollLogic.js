// @ts-check
import { getWrappedManhattanDistance } from '../../world.js';
import { TROLL_ID } from './monsterIds.js';
import {
    isGroundTileId,
    isMonsterAcademyBuilding,
    buildBuildingInfoLookup,
    areSameClan,
    resolveFriendOwnerIds,
} from './kotofeyLogic.js';
import {
    getOwnerMaxWarriorStatueLevel,
    getTrollDamageToBuilding,
    getTrollDamageToMonster,
} from './statueBonusLogic.js';

export const TROLL_ITEM_ID = 10054;
export const TROLL_PRICE_GOLD = 700000;
export const TROLL_SEARCH_RADIUS = 10;
export const TROLL_ATTACK_COOLDOWN_MS = 35000;
export const TROLL_MOVE_INTERVAL_MS = 22000;
export const TROLL_WORK_BOOST_COOLDOWN_MS = 40000;
export const TROLL_WORK_BOOST_REDUCE_MS = 5000;
export const TROLL_WORK_SELF_DAMAGE_CHANCE = 0.5;
export const TROLL_HATED_CATEGORY = 'Грядки';

export const TROLL_RECIPE_RESOURCES = [
    { id: 10021, name: 'Куски супер репки', amount: 10 },
    { id: 10037, name: 'Камень Тролля', amount: 1 },
];

export const DEFAULT_TROLL_SETTINGS = Object.freeze({
    attackEnabled: true,
    walkRoads: false,
    walkFriendRoads: false,
    attackClan: false,
    attackFriends: false,
    attackNeutralMonsters: true,
    attackPlayerMonsters: true,
    boostOwnProduction: true,
});

/**
 * Exact self-damage tiers by garden bed / farm growth stage building ID.
 * - Lily beds (400..409) & upgraded lily ponds (577..597): 2
 * - Mushroom beds (70..80) & upgraded mushroom beds (874..894): 3
 * - Pumpkin beds (82..94): 10
 * - Bomb beds (102..112): 15
 * - Turnip beds (240..259): 30
 * - Wheat beds (274..295): 50
 * - Sunflower beds (313..323): 100
 * - Atomic bomb beds (600, 617..634, 636): 150
 */
const FARM_SELF_DAMAGE_RANGES = [
    { ids: [400, 401, 402, 403, 404, 405, 406, 407, 408, 409], damage: 2 },
    { range: [577, 597], damage: 2 },
    { ids: [70, 71, 72, 73, 77, 78, 79, 80], damage: 3 },
    { range: [874, 894], damage: 3 },
    { ids: [82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94], damage: 10 },
    { ids: [102, 103, 104, 105, 106, 107, 109, 110, 111, 112], damage: 15 },
    { range: [240, 259], damage: 30 },
    { range: [274, 295], damage: 50 },
    { ids: [313, 314, 315, 316, 317, 318, 320, 321, 322, 323], damage: 100 },
    { ids: [600, 636], damage: 150 },
    { range: [617, 634], damage: 150 },
];

/** @type {Map<number, number>} */
export const FARM_TIER_DAMAGE_MAP = (() => {
    const map = new Map();
    for (const entry of FARM_SELF_DAMAGE_RANGES) {
        if (entry.ids) {
            for (const id of entry.ids) map.set(id, entry.damage);
        } else if (entry.range) {
            for (let id = entry.range[0]; id <= entry.range[1]; id++) {
                map.set(id, entry.damage);
            }
        }
    }
    return map;
})();

const UNATTACKABLE_NATURE_OR_ROAD_TYPES = new Set(['road', 'pavement', 'river', 'mountain', 'nature']);

/**
 * Checks whether buildingId is Тролль (70008).
 * @param {number | string | undefined | null} buildingId
 * @returns {boolean}
 */
export function isTrollMonster(buildingId) {
    return Number(buildingId) === TROLL_ID;
}

/**
 * Normalizes Troll settings object with defaults.
 * @param {any} monsterOrSettings
 */
export function normalizeTrollSettings(monsterOrSettings) {
    const raw = monsterOrSettings?.trollSettings || monsterOrSettings || {};
    return {
        attackEnabled: typeof raw.attackEnabled === 'boolean' ? raw.attackEnabled : DEFAULT_TROLL_SETTINGS.attackEnabled,
        walkRoads: typeof raw.walkRoads === 'boolean' ? raw.walkRoads : DEFAULT_TROLL_SETTINGS.walkRoads,
        walkFriendRoads: typeof raw.walkFriendRoads === 'boolean' ? raw.walkFriendRoads : DEFAULT_TROLL_SETTINGS.walkFriendRoads,
        attackClan: typeof raw.attackClan === 'boolean' ? raw.attackClan : DEFAULT_TROLL_SETTINGS.attackClan,
        attackFriends: typeof raw.attackFriends === 'boolean' ? raw.attackFriends : DEFAULT_TROLL_SETTINGS.attackFriends,
        attackNeutralMonsters: typeof raw.attackNeutralMonsters === 'boolean' ? raw.attackNeutralMonsters : DEFAULT_TROLL_SETTINGS.attackNeutralMonsters,
        attackPlayerMonsters: typeof raw.attackPlayerMonsters === 'boolean' ? raw.attackPlayerMonsters : DEFAULT_TROLL_SETTINGS.attackPlayerMonsters,
        boostOwnProduction: typeof raw.boostOwnProduction === 'boolean' ? raw.boostOwnProduction : DEFAULT_TROLL_SETTINGS.boostOwnProduction,
    };
}

/**
 * True if building is any farm / garden bed (category 'Грядки', upgraded pond/mushroom beds, or crop growth stages).
 * @param {number | string | undefined | null} buildingId
 * @param {any} [buildingInfo]
 * @returns {boolean}
 */
export function isFarmOrPlantationBuilding(buildingId, buildingInfo) {
    const id = Number(buildingId);
    if (buildingInfo?.category === TROLL_HATED_CATEGORY) return true;
    return FARM_TIER_DAMAGE_MAP.has(id);
}

/**
 * Computes self-damage inflicted on an own adjacent farm/factory when Troll whips workers.
 * @param {number | string} buildingId
 * @param {any} [buildingInfo]
 * @returns {number}
 */
export function getTrollWorkSelfDamage(buildingId, buildingInfo) {
    const id = Number(buildingId);
    if (FARM_TIER_DAMAGE_MAP.has(id)) {
        return FARM_TIER_DAMAGE_MAP.get(id);
    }
    if (buildingInfo?.category === TROLL_HATED_CATEGORY) {
        return 10;
    }
    const durability = Number(buildingInfo?.stats?.durability) || 500;
    return Math.max(2, Math.min(150, Math.round(durability * 0.015)));
}

/**
 * True if `candidate` is an own, active, working farm or factory adjacent-eligible for Troll worker whip.
 * Monster Academy (689..698, 69966..70966) is excluded.
 * @param {any} troll
 * @param {any} candidate
 * @param {any} buildingData
 * @param {any} [context]
 * @returns {boolean}
 */
export function isTrollProductionTarget(troll, candidate, buildingData, context = {}) {
    if (!troll || !candidate || String(candidate.id) === String(troll.id)) return false;
    if (candidate.isDestroying) return false;
    if (candidate.hp !== undefined && candidate.hp <= 0) return false;
    if (candidate.isConstructing) return false;

    const now = context?.now ?? Date.now();
    if (candidate.workState !== 'working' || Number(candidate.workEndTime || 0) <= now) {
        return false;
    }

    const trollOwner = troll.ownerId ? String(troll.ownerId) : '';
    const candOwner = candidate.ownerId ? String(candidate.ownerId) : '';
    if (!trollOwner || trollOwner === 'monster' || trollOwner === '-1' || candOwner !== trollOwner) {
        return false;
    }

    const bid = Number(candidate.buildingId);
    if (isMonsterAcademyBuilding(bid)) return false;

    const infoMap = context?.buildingInfoById || buildBuildingInfoLookup(buildingData);
    const info = infoMap.get(bid);
    if (isFarmOrPlantationBuilding(bid, info)) return true;
    return info?.category === 'Заводы';
}

/**
 * Finds the best adjacent (distance 1) own active farm/factory for Troll to speed up.
 * @param {any} troll
 * @param {Array<any>} buildings
 * @param {any} buildingData
 * @param {any} [context]
 */
export function getTrollAdjacentProductionTarget(troll, buildings, buildingData, context = {}) {
    if (!troll || !isTrollMonster(troll.buildingId) || !Array.isArray(buildings)) return null;
    const settings = normalizeTrollSettings(troll);
    if (!settings.boostOwnProduction) return null;

    const isWrappedWorld = Boolean(context?.isWrappedWorld);
    const infoMap = context?.buildingInfoById || buildBuildingInfoLookup(buildingData);
    const enrichedContext = { ...context, buildingInfoById: infoMap };

    let best = null;
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (!isTrollProductionTarget(troll, b, buildingData, enrichedContext)) continue;
        const dist = getWrappedManhattanDistance(troll, b, isWrappedWorld);
        if (dist !== 1) continue;
        if (
            !best ||
            Number(b.workEndTime || 0) < Number(best.workEndTime || 0) ||
            (Number(b.workEndTime || 0) === Number(best.workEndTime || 0) && String(b.id).localeCompare(String(best.id)) < 0)
        ) {
            best = b;
        }
    }
    return best;
}

/**
 * Executes Troll's worker-whip boost on an adjacent own farm or factory:
 * reduces `workEndTime` by 5 seconds (2x speed for 5s) and rolls 50% chance for tier self-damage.
 * @param {any} target
 * @param {any} buildingInfo
 * @param {number} [now]
 * @param {() => number} [rng]
 */
export function resolveTrollProductionWhip(target, buildingInfo, now = Date.now(), rng = Math.random) {
    const currentWorkEndTime = Number(target?.workEndTime || now);
    const nextWorkEndTime = Math.max(now, currentWorkEndTime - TROLL_WORK_BOOST_REDUCE_MS);
    const fullHp = Number(target?.maxHp ?? buildingInfo?.stats?.durability ?? 100);
    const currentHp = Number(target?.hp ?? fullHp);

    const roll = typeof rng === 'function' ? rng() : Math.random();
    const dealDamage = roll < TROLL_WORK_SELF_DAMAGE_CHANCE;
    const selfDamage = dealDamage ? getTrollWorkSelfDamage(target?.buildingId, buildingInfo) : 0;
    const nextHp = Math.max(0, currentHp - selfDamage);

    return {
        boosted: true,
        speedupMs: TROLL_WORK_BOOST_REDUCE_MS,
        nextWorkEndTime,
        selfDamage,
        nextHp,
        targetDestroyed: selfDamage > 0 && nextHp <= 0,
    };
}

/**
 * Checks whether `candidate` can be attacked by `troll` in combat (buildings + neutral/player monsters).
 * @param {any} troll
 * @param {any} candidate
 * @param {any} buildingData
 * @param {any} [context]
 * @returns {boolean}
 */
export function isTrollCombatCandidate(troll, candidate, buildingData, context = {}) {
    if (!troll || !candidate || String(candidate.id) === String(troll.id)) return false;
    const settings = normalizeTrollSettings(troll);
    if (!settings.attackEnabled) return false;
    if (candidate.isDestroying) return false;
    if (candidate.hp !== undefined && candidate.hp <= 0) return false;

    const now = context?.now ?? Date.now();
    if (candidate.protectionEndTime && Number(candidate.protectionEndTime) > now) return false;

    const infoMap = context?.buildingInfoById || buildBuildingInfoLookup(buildingData);
    const candBid = Number(candidate.buildingId);
    const candInfo = infoMap.get(candBid);
    if (!candInfo) return false;

    const isCandMonster = Boolean(candInfo.stats?.isMonster || candInfo.category === 'Монстры');
    if (!isCandMonster) {
        if (isGroundTileId(candBid)) return false;
        if (UNATTACKABLE_NATURE_OR_ROAD_TYPES.has(String(candInfo.type || ''))) return false;
        if (candInfo.category === 'Дороги и стены' && candInfo.name?.toLowerCase?.().includes('дорог')) return false;
        if (Number(candInfo.stats?.durability ?? 0) <= 0) return false;
    }

    const trollOwner = troll.ownerId ? String(troll.ownerId) : '';
    const candOwner = candidate.ownerId ? String(candidate.ownerId) : '';
    const isNeutralOwner = !candOwner || candOwner === 'monster' || candOwner === '-1' || candOwner === '0';

    // Never attack own buildings/monsters in combat
    if (trollOwner && candOwner && trollOwner === candOwner) {
        return false;
    }

    if (isCandMonster) {
        if (isNeutralOwner) {
            return Boolean(settings.attackNeutralMonsters);
        }
        if (!settings.attackPlayerMonsters) return false;
    } else {
        // Non-monster natural/neutral objects without player owner are not combat targets
        if (isNeutralOwner) return false;
    }

    const isOwnerClanmate = context?.isSameClan
        ? Boolean(trollOwner && candOwner && context.isSameClan(trollOwner, candOwner))
        : areSameClan(trollOwner, candOwner, context);
    const friendIds = !context?.isFriend ? resolveFriendOwnerIds(trollOwner, context) : null;
    const isOwnerFriend = context?.isFriend
        ? Boolean(trollOwner && candOwner && context.isFriend(trollOwner, candOwner))
        : Boolean(candOwner && friendIds?.has(candOwner));

    if (isOwnerClanmate && !settings.attackClan) return false;
    if (isOwnerFriend && !settings.attackFriends) return false;

    return true;
}

/**
 * True if target is Troll's hated category ('Грядки' / farm / plantation).
 * @param {number | string} buildingId
 * @param {any} buildingInfo
 * @returns {boolean}
 */
export function isTargetHatedByTroll(buildingId, buildingInfo) {
    if (!buildingInfo) return false;
    const isCandMonster = Boolean(buildingInfo.stats?.isMonster || buildingInfo.category === 'Монстры');
    if (isCandMonster) return false;
    return isFarmOrPlantationBuilding(buildingId, buildingInfo);
}

/**
 * Selects adjacent (distance 1) combat target for Troll, respecting anti-distraction by hated 'Грядки'
 * anywhere within TROLL_SEARCH_RADIUS (10 tiles).
 * Returns null if no target should be attacked right now (e.g. patrolling toward a hated farm).
 * @param {any} troll
 * @param {Array<any>} buildings
 * @param {any} buildingData
 * @param {any} [context]
 */
export function selectTrollAdjacentCombatTarget(troll, buildings, buildingData, context = {}) {
    if (!troll || !isTrollMonster(troll.buildingId) || !Array.isArray(buildings)) return null;
    if (troll.monsterMode !== 'patrol') return null;
    const settings = normalizeTrollSettings(troll);
    if (!settings.attackEnabled) return null;

    const isWrappedWorld = Boolean(context?.isWrappedWorld);
    const radius = context?.searchRadius ?? TROLL_SEARCH_RADIUS;
    const infoMap = context?.buildingInfoById || buildBuildingInfoLookup(buildingData);
    const enriched = { ...context, buildingInfoById: infoMap };

    let hasHatedInRadius = false;
    const adjacentHated = [];
    const adjacentRegular = [];

    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (!isTrollCombatCandidate(troll, b, buildingData, enriched)) continue;
        const dist = getWrappedManhattanDistance(troll, b, isWrappedWorld);
        if (dist > radius) continue;

        const info = infoMap.get(Number(b.buildingId));
        const isHated = isTargetHatedByTroll(b.buildingId, info);
        if (isHated) hasHatedInRadius = true;

        if (dist === 1) {
            if (isHated) adjacentHated.push(b);
            else adjacentRegular.push(b);
        }
    }

    if (adjacentHated.length > 0) {
        adjacentHated.sort((a, b) => (a.hp ?? 0) - (b.hp ?? 0) || String(a.id).localeCompare(String(b.id)));
        return adjacentHated[0];
    }

    // Anti-distraction: if any hated farm exists within 10 tiles, do not stop to attack other targets
    if (hasHatedInRadius) {
        return null;
    }

    if (adjacentRegular.length > 0) {
        adjacentRegular.sort((a, b) => (a.hp ?? 0) - (b.hp ?? 0) || String(a.id).localeCompare(String(b.id)));
        return adjacentRegular[0];
    }

    return null;
}

/**
 * Selects chase target within 10 tiles for Troll during patrol.
 * Hated farms/plantations take priority across the entire search radius before other targets.
 * @param {any} troll
 * @param {Array<any>} buildings
 * @param {any} buildingData
 * @param {any} [context]
 */
export function getTrollChaseTarget(troll, buildings, buildingData, context = {}) {
    if (!troll || !isTrollMonster(troll.buildingId) || !Array.isArray(buildings)) return null;
    if (troll.monsterMode !== 'patrol') return null;
    const settings = normalizeTrollSettings(troll);
    if (!settings.attackEnabled) return null;

    const isWrappedWorld = Boolean(context?.isWrappedWorld);
    const radius = context?.searchRadius ?? TROLL_SEARCH_RADIUS;
    const infoMap = context?.buildingInfoById || buildBuildingInfoLookup(buildingData);
    const enriched = { ...context, buildingInfoById: infoMap };

    let bestHated = null;
    let bestHatedDist = Infinity;
    let bestRegular = null;
    let bestRegularDist = Infinity;

    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (!isTrollCombatCandidate(troll, b, buildingData, enriched)) continue;
        const dist = getWrappedManhattanDistance(troll, b, isWrappedWorld);
        if (dist <= 0 || dist > radius) continue;

        const info = infoMap.get(Number(b.buildingId));
        if (isTargetHatedByTroll(b.buildingId, info)) {
            if (dist < bestHatedDist || (dist === bestHatedDist && String(b.id).localeCompare(String(bestHated?.id || '')) < 0)) {
                bestHatedDist = dist;
                bestHated = b;
            }
        } else if (dist < bestRegularDist || (dist === bestRegularDist && String(b.id).localeCompare(String(bestRegular?.id || '')) < 0)) {
            bestRegularDist = dist;
            bestRegular = b;
        }
    }

    return bestHated || bestRegular;
}

/**
 * Computes Troll combat damage against `target` using the owner's highest active Warrior Statue
 * and applying 2x damage against hated farms/plantations.
 * @param {any} troll
 * @param {any} target
 * @param {Array<any>} allBuildings
 * @param {any} buildingData
 * @param {number} [now]
 * @returns {number}
 */
export function getTrollCombatDamage(troll, target, allBuildings, buildingData, now = Date.now()) {
    if (!troll || !target) return 0;
    const infoMap = buildBuildingInfoLookup(buildingData);
    const targetInfo = infoMap.get(Number(target.buildingId));
    const warriorLevel = getOwnerMaxWarriorStatueLevel(troll.ownerId, allBuildings, now);

    const isTargetMonster = Boolean(targetInfo?.stats?.isMonster || targetInfo?.category === 'Монстры');
    if (isTargetMonster) {
        return getTrollDamageToMonster(warriorLevel);
    }

    const baseBuildingDmg = getTrollDamageToBuilding(warriorLevel);
    return isTargetHatedByTroll(target.buildingId, targetInfo) ? baseBuildingDmg * 2 : baseBuildingDmg;
}
