// @ts-check

import { KOTOFEY_ID, TROLL_ID, AIBOLIT_ID, BIG_AIBOLIT_ID } from './monsterIds.js';
import {
    getOwnerMaxDefenderStatueLevel,
    getAibolitBaseRepair,
    getBigAibolitBaseRepair,
} from './statueBonusLogic.js';
import { getWrappedManhattanDistance, normalizeWorldCoord, WORLD_WIDTH_TILES, WORLD_HEIGHT_TILES } from '../../world.js';

export const KOTOFEY_ITEM_ID = 10053;
export const TROLL_ITEM_ID = 10054;
export const AIBOLIT_ITEM_ID = 10055;
export const KOTOFEY_PRICE_GOLD = 3300000;
export const AIBOLIT_PRICE_GOLD = 50000;
export const BIG_AIBOLIT_PRICE_GOLD = 1000000;
export const KOTOFEY_SEARCH_RADIUS = 10;
export const KOTOFEY_BASE_REPAIR = 300;
export const KOTOFEY_LOVED_CATEGORY = 'Подарки';
export const AIBOLIT_LOVED_CATEGORY = 'Монстры';
export const BIG_AIBOLIT_LOVED_CATEGORY = 'Хранилища монет';
export const HEALER_MONSTER_IDS = new Set([KOTOFEY_ID, AIBOLIT_ID, BIG_AIBOLIT_ID]);
export const ACADEMY_CRAFTABLE_MONSTER_ITEM_BY_BUILDING_ID = Object.freeze({
    [KOTOFEY_ID]: KOTOFEY_ITEM_ID,
    [TROLL_ID]: TROLL_ITEM_ID,
    [AIBOLIT_ID]: AIBOLIT_ITEM_ID,
});

export const KOTOFEY_RECIPE_RESOURCES = [
    { id: 10034, name: 'Изумруд', amount: 10 },
    { id: 10030, name: 'Цветок подсолнуха', amount: 100 },
    { id: 10019, name: 'Мешок муки', amount: 10 },
];

export const MONSTER_ACADEMY_BUILDING_IDS = new Set([
    689, 690, 691, 692, 693,
    694, 695, 696, 697, 698,
    69966, 70066, 70166, 70266, 70366,
    70466, 70566, 70666, 70766, 70866,
    70966,
]);

const ROAD_LIKE_IDS = new Set([
    50001, 500012, 500013, 500014, 500015, 500016, 500017, 500018, 500019,
    5000120, 5000121, 5000122, 5000123, 5000124, 5000125,
]);

const PAVEMENT_LIKE_IDS = new Set([
    50007, 500072, 500073, 500074, 500075, 500076, 500077, 500078, 500079,
    5000720, 5000721, 5000722, 5000723, 5000724, 5000725,
]);

const RIVER_LIKE_IDS = new Set([50004, 500040]);

/** @type {import('../../../types').KotofeySettings} */
export const DEFAULT_KOTOFEY_SETTINGS = {
    walkRoads: true,
    repairClan: true,
    repairClanGifts: true,
    repairFriends: false,
    repairFriendGifts: false,
    walkFriendRoads: false,
};

export function isKotofeyMonster(buildingId) {
    return Number(buildingId) === KOTOFEY_ID;
}

export function isHealerMonster(buildingId) {
    return HEALER_MONSTER_IDS.has(Number(buildingId));
}

export function isRoadCapableCustomMonster(buildingId) {
    const id = Number(buildingId);
    return id === KOTOFEY_ID || id === AIBOLIT_ID || id === BIG_AIBOLIT_ID || id === TROLL_ID;
}

/**
 * Normalizes buildingData array or Map into a Map<number, any>.
 * @param {any} buildingData
 * @returns {Map<number, any>}
 */
export function buildBuildingInfoLookup(buildingData) {
    if (buildingData instanceof Map) return buildingData;
    const map = new Map();
    if (Array.isArray(buildingData)) {
        for (let i = 0; i < buildingData.length; i++) {
            const b = buildingData[i];
            if (b && b.id !== undefined) {
                map.set(Number(b.id), b);
            }
        }
    }
    return map;
}

export function isMonsterAcademyBuilding(buildingId) {
    return MONSTER_ACADEMY_BUILDING_IDS.has(Number(buildingId));
}

export function isRoadOrPavementId(buildingId) {
    const id = Number(buildingId);
    return ROAD_LIKE_IDS.has(id) || PAVEMENT_LIKE_IDS.has(id);
}

export function isGroundTileId(buildingId) {
    const id = Number(buildingId);
    return ROAD_LIKE_IDS.has(id) || PAVEMENT_LIKE_IDS.has(id) || RIVER_LIKE_IDS.has(id);
}

export function normalizeKotofeySettings(monster) {
    const raw = monster?.kotofeySettings || monster?.data?.kotofeySettings || monster?.trollSettings || monster?.data?.trollSettings || {};
    return {
        walkRoads: typeof raw.walkRoads === 'boolean' ? raw.walkRoads : DEFAULT_KOTOFEY_SETTINGS.walkRoads,
        repairClan: typeof raw.repairClan === 'boolean' ? raw.repairClan : DEFAULT_KOTOFEY_SETTINGS.repairClan,
        repairClanGifts: typeof raw.repairClanGifts === 'boolean' ? raw.repairClanGifts : DEFAULT_KOTOFEY_SETTINGS.repairClanGifts,
        repairFriends: typeof raw.repairFriends === 'boolean' ? raw.repairFriends : DEFAULT_KOTOFEY_SETTINGS.repairFriends,
        repairFriendGifts: typeof raw.repairFriendGifts === 'boolean' ? raw.repairFriendGifts : DEFAULT_KOTOFEY_SETTINGS.repairFriendGifts,
        walkFriendRoads: typeof raw.walkFriendRoads === 'boolean' ? raw.walkFriendRoads : DEFAULT_KOTOFEY_SETTINGS.walkFriendRoads,
    };
}

function normalizeClanId(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function isSpecialNonPlayerOwner(ownerId) {
    return !ownerId || ownerId === 'monster' || ownerId === '-1';
}

export function resolveOwnerClanId(ownerId, context) {
    const uid = String(ownerId || '');
    if (isSpecialNonPlayerOwner(uid) || uid === '0') return null;

    const userClan = normalizeClanId(context?.allUsers?.[uid]?.clanId);
    if (userClan !== null) return userClan;

    if (Array.isArray(context?.clans)) {
        const ledClan = context.clans.find(c => String(c?.leaderUid || '') === uid);
        if (ledClan) {
            const ledId = normalizeClanId(ledClan.id);
            if (ledId !== null) return ledId;
        }
    }
    return null;
}

export function resolveFriendOwnerIds(ownerId, context) {
    const friendIds = new Set();
    const uid = String(ownerId || '');
    if (isSpecialNonPlayerOwner(uid) || uid === '0') return friendIds;

    const rawLists = [];
    if (context?.localUserUid && String(context.localUserUid) === uid && Array.isArray(context.localFriends)) {
        rawLists.push(context.localFriends);
    }
    const profileFriends = context?.allUsers?.[uid]?.friends;
    if (Array.isArray(profileFriends)) {
        rawLists.push(profileFriends);
    }

    let nameToUid = null;
    const getNameToUidMap = () => {
        if (nameToUid) return nameToUid;
        nameToUid = new Map();
        const usersObj = context?.allUsers || {};
        for (const [candidateUid, info] of Object.entries(usersObj)) {
            if (!info) continue;
            const n1 = String(info.name || '').trim().toLowerCase();
            const n2 = String(info.username || '').trim().toLowerCase();
            if (n1) nameToUid.set(n1, candidateUid);
            if (n2) nameToUid.set(n2, candidateUid);
        }
        return nameToUid;
    };

    for (const list of rawLists) {
        for (const entry of list) {
            if (!entry) continue;
            let resolvedUid = entry.uid ? String(entry.uid) : '';
            if (!resolvedUid && entry.name) {
                resolvedUid = getNameToUidMap().get(String(entry.name).trim().toLowerCase()) || '';
            }
            if (resolvedUid && resolvedUid !== uid && !isSpecialNonPlayerOwner(resolvedUid) && resolvedUid !== '0') {
                friendIds.add(resolvedUid);
            }
        }
    }
    return friendIds;
}

export function areSameClan(ownerA, ownerB, context) {
    const uidA = String(ownerA || '');
    const uidB = String(ownerB || '');
    if (!uidA || !uidB || uidA === uidB) return false;
    if (isSpecialNonPlayerOwner(uidA) || isSpecialNonPlayerOwner(uidB) || uidA === '0' || uidB === '0') {
        return false;
    }
    const clanA = resolveOwnerClanId(uidA, context);
    const clanB = resolveOwnerClanId(uidB, context);
    return clanA !== null && clanB !== null && clanA === clanB;
}

export function isTargetGiftCategory(monsterInfo, targetInfo) {
    const mid = Number(monsterInfo?.id);
    if (mid === AIBOLIT_ID) {
        return Boolean(targetInfo?.stats?.isMonster || targetInfo?.category === 'Монстры');
    }
    if (mid === BIG_AIBOLIT_ID) {
        return Boolean(
            targetInfo?.type === 'storage' ||
            targetInfo?.category === 'Хранилище' ||
            targetInfo?.category === 'Хранилища монет'
        );
    }
    const lovedCategory = monsterInfo?.stats?.loves || KOTOFEY_LOVED_CATEGORY;
    return Boolean(lovedCategory && targetInfo?.category === lovedCategory);
}

export function isTargetLovedByHealer(monsterInfo, targetInfo) {
    return isTargetGiftCategory(monsterInfo, targetInfo);
}

export function getHealerBaseRepairAmount(monsterInfo, monster, allBuildings, now = Date.now()) {
    const mid = Number(monster?.buildingId ?? monsterInfo?.id);
    if (mid === AIBOLIT_ID) {
        const defenderLevel = getOwnerMaxDefenderStatueLevel(monster?.ownerId, allBuildings, now);
        return getAibolitBaseRepair(defenderLevel);
    }
    if (mid === BIG_AIBOLIT_ID) {
        const defenderLevel = getOwnerMaxDefenderStatueLevel(monster?.ownerId, allBuildings, now);
        return getBigAibolitBaseRepair(defenderLevel);
    }
    return parseInt(String(monsterInfo?.stats?.repair ?? KOTOFEY_BASE_REPAIR), 10) || KOTOFEY_BASE_REPAIR;
}

export function getKotofeyRepairAmount(monsterInfo, targetInfo, target, options = {}) {
    const baseRepair = getHealerBaseRepairAmount(
        monsterInfo,
        options?.monster,
        options?.allBuildings,
        options?.now
    );
    const rawAmount = isTargetGiftCategory(monsterInfo, targetInfo) ? baseRepair * 2 : baseRepair;
    const maxHp = target?.maxHp ?? targetInfo?.stats?.durability ?? 100;
    const currentHp = target?.hp ?? maxHp;
    const missingHp = Math.max(0, maxHp - currentHp);
    return Math.min(rawAmount, missingHp);
}

export function isKotofeyRepairCandidate(monster, target, buildingData, options) {
    if (!monster || !target) return false;
    const isPlayerOwned = Boolean(monster.ownerId && monster.ownerId !== 'monster' && monster.ownerId !== '-1' && monster.ownerId !== '0');
    if (monster.monsterMode === 'stand' || (isPlayerOwned && monster.monsterMode !== 'patrol')) return false;

    const targetId = String(target.id);
    if (targetId === String(monster.id)) return false;

    const bId = Number(target.buildingId);
    const riverId = Number(options?.riverId ?? 50004);
    const mountainId = Number(options?.mountainId ?? 50005);
    if (bId === mountainId || bId === riverId || RIVER_LIKE_IDS.has(bId) || isRoadOrPavementId(bId)) {
        return false;
    }

    if (options?.blockedTargetIds?.has(targetId)) return false;
    if (options?.pendingDestroyedIds?.has(targetId)) return false;
    // Owner rule (2026-11-14): healer monsters (Kotofey, Aibolit, Big Aibolit) may
    // repair/heal targets that are mined or under attack, so a healer can save a
    // mined target: the destruction finalize keeps the target alive when
    // remainingHp > 0 (hp - pendingDamage). Only an already-expired destruction
    // window (finalize imminent) is excluded below.
    if (target.destructionEndTime && target.destructionEndTime <= Date.now()) return false;
    if (target.isConstructing && (target.constructionEndTime === undefined || target.constructionEndTime > Date.now())) return false;
    if (target.hp === undefined || target.hp <= 0) return false;

    const targetInfo = buildingData.find(i => Number(i.id) === bId);
    const maxHp = target.maxHp ?? targetInfo?.stats?.durability ?? 100;
    if (target.hp >= maxHp) return false;

    const targetOwnerId = String(target.ownerId || '');
    const monsterOwnerId = String(monster.ownerId || '');
    if (isSpecialNonPlayerOwner(targetOwnerId)) return false;

    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));
    const settings = normalizeKotofeySettings(monster);
    const isGift = isTargetGiftCategory(monsterInfo, targetInfo);

    if (targetOwnerId === monsterOwnerId) {
        return true;
    }

    const context = options?.kotofeyContext;
    if (areSameClan(monsterOwnerId, targetOwnerId, context)) {
        if (isGift ? settings.repairClanGifts : settings.repairClan) {
            return true;
        }
    }

    const friendIds = resolveFriendOwnerIds(monsterOwnerId, context);
    if (friendIds.has(targetOwnerId)) {
        if (isGift ? settings.repairFriendGifts : settings.repairFriends) {
            return true;
        }
    }

    return false;
}

export function hasDamagedLovedGiftInRange(monster, buildings, buildingData, options) {
    const radius = options?.searchRadius ?? KOTOFEY_SEARCH_RADIUS;
    const isWrapped = !!options?.isWrappedWorld;
    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));
    return buildings.some((target) => {
        if (!isKotofeyRepairCandidate(monster, target, buildingData, options)) return false;
        const targetInfo = buildingData.find(i => Number(i.id) === Number(target.buildingId));
        if (!isTargetGiftCategory(monsterInfo, targetInfo)) return false;
        const dist = getWrappedManhattanDistance(monster, target, isWrapped);
        return dist <= radius;
    });
}

export function selectKotofeyAdjacentTarget(monster, candidates, buildings, buildingData, options) {
    if (!candidates || candidates.length === 0) return null;
    const monsterInfo = buildingData.find(i => Number(i.id) === Number(monster.buildingId));

    const adjacentGifts = candidates.filter((t) => {
        const info = buildingData.find(i => Number(i.id) === Number(t.buildingId));
        return isTargetGiftCategory(monsterInfo, info);
    });

    const preferredTargetId = options?.preferredTargetId ? String(options.preferredTargetId) : null;

    if (adjacentGifts.length > 0) {
        if (preferredTargetId) {
            const preferredGift = adjacentGifts.find((t) => String(t.id) === preferredTargetId);
            if (preferredGift) return preferredGift;
        }
        return adjacentGifts[0];
    }

    // Do not get distracted by regular structures/monsters while a damaged loved Gift exists within search radius.
    if (hasDamagedLovedGiftInRange(monster, buildings, buildingData, options)) {
        return null;
    }

    if (preferredTargetId) {
        const preferred = candidates.find((t) => String(t.id) === preferredTargetId);
        if (preferred) return preferred;
    }
    return candidates[0];
}

/**
 * Checks whether a tile is blocked for a Kotofey monster, respecting its
 * `walkRoads` and `walkFriendRoads` settings.
 */
export function isKotofeyTileBlocked(
    monster,
    x,
    y,
    allBuildings,
    blockedResourcePositions,
    kotofeyContext,
    isWrappedWorld = false,
    extraBlocked = null
) {
    const nx = normalizeWorldCoord(x, WORLD_WIDTH_TILES, isWrappedWorld);
    const ny = normalizeWorldCoord(y, WORLD_HEIGHT_TILES, isWrappedWorld);
    if (!isWrappedWorld && (nx < 0 || nx >= WORLD_WIDTH_TILES || ny < 0 || ny >= WORLD_HEIGHT_TILES)) {
        return true;
    }

    const key = `${nx},${ny}`;
    if (blockedResourcePositions && blockedResourcePositions.has(key)) {
        return true;
    }

    // Extra tile-level blocking (e.g. procedural forest mask), mirroring
    // isMonsterTileBlocked's extraBlocked contract. Receives normalized coords.
    if (extraBlocked && extraBlocked(nx, ny)) {
        return true;
    }

    const settings = normalizeKotofeySettings(monster);
    const monsterOwnerId = String(monster?.ownerId || '');
    const monsterIdStr = String(monster?.id || '');
    const friendIds = settings.walkRoads && settings.walkFriendRoads
        ? resolveFriendOwnerIds(monsterOwnerId, kotofeyContext)
        : null;

    for (let i = 0; i < allBuildings.length; i++) {
        const b = allBuildings[i];
        if (!b || (b.hp !== undefined && b.hp <= 0)) continue;
        if (String(b.id) === monsterIdStr) continue;
        if (b.x !== nx || b.y !== ny) continue;

        if (!isRoadOrPavementId(b.buildingId)) {
            return true;
        }

        // Road or pavement tile:
        if (!settings.walkRoads) {
            return true;
        }
        const tileOwnerId = String(b.ownerId || '');
        if (tileOwnerId === monsterOwnerId) {
            continue;
        }
        if (settings.walkFriendRoads && friendIds && friendIds.has(tileOwnerId)) {
            continue;
        }
        return true;
    }

    return false;
}
