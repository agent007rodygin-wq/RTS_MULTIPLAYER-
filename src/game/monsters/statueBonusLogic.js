// @ts-check
import { TROLL_ID, AIBOLIT_ID, BIG_AIBOLIT_ID } from './monsterIds.js';

/**
 * Building ID -> Level map for "Статуя Гнома Защитника" (levels 1..20).
 * Level 1 is 48901, levels 2..20 are 51101..52901 in steps of 100.
 * @type {Readonly<Record<number, number>>}
 */
export const DEFENDER_STATUE_LEVEL_BY_ID = Object.freeze({
    48901: 1,
    ...Object.fromEntries(Array.from({ length: 19 }, (_, idx) => [51101 + idx * 100, idx + 2])),
});

/**
 * Building ID -> Level map for "Статуя Гнома Воителя" (levels 1..21).
 * Level 1..10: 49001..49901 (step 100), Level 11: 50011, Level 12..21: 50101..51001 (step 100).
 * @type {Readonly<Record<number, number>>}
 */
export const WARRIOR_STATUE_LEVEL_BY_ID = Object.freeze({
    ...Object.fromEntries(Array.from({ length: 10 }, (_, idx) => [49001 + idx * 100, idx + 1])),
    50011: 11,
    ...Object.fromEntries(Array.from({ length: 10 }, (_, idx) => [50101 + idx * 100, idx + 12])),
});

/**
 * Troll building damage per Warrior Statue level (indices 0..21).
 * @type {readonly number[]}
 */
export const TROLL_BUILDING_DAMAGE_BY_WARRIOR_LEVEL = Object.freeze([
    4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12,
]);

/**
 * Troll monster damage per Warrior Statue level (indices 0..21).
 * @type {readonly number[]}
 */
export const TROLL_MONSTER_DAMAGE_BY_WARRIOR_LEVEL = Object.freeze([
    2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6,
]);

/**
 * Returns the level (1..20) of "Статуя Гнома Защитника" or 0 if not a defender statue.
 * @param {number | string | undefined | null} buildingId
 * @returns {number}
 */
export function getDefenderStatueLevel(buildingId) {
    return DEFENDER_STATUE_LEVEL_BY_ID[Number(buildingId)] || 0;
}

/**
 * Returns the level (1..21) of "Статуя Гнома Воителя" or 0 if not a warrior statue.
 * @param {number | string | undefined | null} buildingId
 * @returns {number}
 */
export function getWarriorStatueLevel(buildingId) {
    return WARRIOR_STATUE_LEVEL_BY_ID[Number(buildingId)] || 0;
}

/**
 * Computes the highest active statue level owned by `ownerId`.
 * Incomplete, destroying, or destroyed statues do not grant bonuses.
 * @param {string | number | undefined | null} ownerId
 * @param {Array<any> | undefined | null} buildings
 * @param {'defender' | 'warrior'} statueType
 * @param {number} [now]
 * @returns {number}
 */
export function getOwnerMaxStatueLevel(ownerId, buildings, statueType, now = Date.now()) {
    if (!ownerId || ownerId === 'monster' || ownerId === '-1' || !Array.isArray(buildings)) {
        return 0;
    }
    const ownerKey = String(ownerId);
    const getLevel = statueType === 'defender' ? getDefenderStatueLevel : getWarriorStatueLevel;
    let maxLevel = 0;

    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (!b) continue;
        if (String(b.ownerId || '') !== ownerKey) continue;
        if (b.isDestroying) continue;
        if (b.hp !== undefined && b.hp <= 0) continue;
        const stillConstructing = Boolean(
            b.isConstructing && (b.constructionEndTime === undefined || Number(b.constructionEndTime) > now)
        );
        if (stillConstructing) continue;

        const level = getLevel(b.buildingId);
        if (level > maxLevel) {
            maxLevel = level;
        }
    }
    return maxLevel;
}

/**
 * Highest active Defender Statue level (0..20) for `ownerId`.
 * @param {string | number | undefined | null} ownerId
 * @param {Array<any> | undefined | null} buildings
 * @param {number} [now]
 * @returns {number}
 */
export function getOwnerMaxDefenderStatueLevel(ownerId, buildings, now = Date.now()) {
    return getOwnerMaxStatueLevel(ownerId, buildings, 'defender', now);
}

/**
 * Highest active Warrior Statue level (0..21) for `ownerId`.
 * @param {string | number | undefined | null} ownerId
 * @param {Array<any> | undefined | null} buildings
 * @param {number} [now]
 * @returns {number}
 */
export function getOwnerMaxWarriorStatueLevel(ownerId, buildings, now = Date.now()) {
    return getOwnerMaxStatueLevel(ownerId, buildings, 'warrior', now);
}

/**
 * Base repair per hit for small Айболит (70009):
 * without statue -> 5; levels 1..20 -> 6,6,7,7,...,15,15.
 * @param {number} defenderStatueLevel
 * @returns {number}
 */
export function getAibolitBaseRepair(defenderStatueLevel) {
    const lvl = Math.max(0, Math.min(20, Math.floor(Number(defenderStatueLevel) || 0)));
    if (lvl <= 0) return 5;
    return 5 + Math.ceil(lvl / 2);
}

/**
 * Base repair per hit for Большой Айболит (70010):
 * without statue -> 50; levels 1..20 -> 60 + (level - 1) * 5 (60..155).
 * @param {number} defenderStatueLevel
 * @returns {number}
 */
export function getBigAibolitBaseRepair(defenderStatueLevel) {
    const lvl = Math.max(0, Math.min(20, Math.floor(Number(defenderStatueLevel) || 0)));
    if (lvl <= 0) return 50;
    return 60 + (lvl - 1) * 5;
}

/**
 * Base Troll damage to buildings for Warrior Statue level (0..21).
 * @param {number} warriorStatueLevel
 * @returns {number}
 */
export function getTrollDamageToBuilding(warriorStatueLevel) {
    const lvl = Math.max(0, Math.min(21, Math.floor(Number(warriorStatueLevel) || 0)));
    return TROLL_BUILDING_DAMAGE_BY_WARRIOR_LEVEL[lvl];
}

/**
 * Troll damage to monsters for Warrior Statue level (0..21).
 * @param {number} warriorStatueLevel
 * @returns {number}
 */
export function getTrollDamageToMonster(warriorStatueLevel) {
    const lvl = Math.max(0, Math.min(21, Math.floor(Number(warriorStatueLevel) || 0)));
    return TROLL_MONSTER_DAMAGE_BY_WARRIOR_LEVEL[lvl];
}

/**
 * Computes current statue-adjusted stats for any custom monster (70008, 70009, 70010).
 * @param {{ buildingId: number; ownerId?: string | number | null; buildings?: Array<any> | null; now?: number }} params
 */
export function getCustomMonsterScaledStats({ buildingId, ownerId, buildings, now = Date.now() }) {
    const id = Number(buildingId);
    const defenderLevel = getOwnerMaxDefenderStatueLevel(ownerId, buildings, now);
    const warriorLevel = getOwnerMaxWarriorStatueLevel(ownerId, buildings, now);

    if (id === TROLL_ID) {
        const damageToBuilding = getTrollDamageToBuilding(warriorLevel);
        const damageToMonster = getTrollDamageToMonster(warriorLevel);
        return {
            defenderLevel,
            warriorLevel,
            baseRepair: 0,
            lovedRepair: 0,
            damageToBuilding,
            lovedDamageToBuilding: damageToBuilding * 2,
            damageToMonster,
        };
    }

    if (id === AIBOLIT_ID) {
        const baseRepair = getAibolitBaseRepair(defenderLevel);
        return {
            defenderLevel,
            warriorLevel,
            baseRepair,
            lovedRepair: baseRepair * 2,
            damageToBuilding: 0,
            lovedDamageToBuilding: 0,
            damageToMonster: 0,
        };
    }

    if (id === BIG_AIBOLIT_ID) {
        const baseRepair = getBigAibolitBaseRepair(defenderLevel);
        return {
            defenderLevel,
            warriorLevel,
            baseRepair,
            lovedRepair: baseRepair * 2,
            damageToBuilding: 0,
            lovedDamageToBuilding: 0,
            damageToMonster: 0,
        };
    }

    return {
        defenderLevel,
        warriorLevel,
        baseRepair: 0,
        lovedRepair: 0,
        damageToBuilding: 0,
        lovedDamageToBuilding: 0,
        damageToMonster: 0,
    };
}
