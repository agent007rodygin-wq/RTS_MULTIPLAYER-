// @ts-check
// Monster spawn planning — deterministic ID generation and per-zone type selection.
// Dependencies: monsterIds.js, ../../world.js

import { GORYNYCH_ID, KILLING_HUT_ID, KIND_SANTA_ID, KOLOBOK_ID, BABA_YAGA_ID, BRONEKUR_ID } from './monsterIds.js';
import { ZONES_X, ZONES_Y } from '../../world.js';

/** @type {Array<{ typeId: number; count: number; name: string }>} */
export const REGULAR_MONSTER_SPAWN_CONFIG = [
    { typeId: GORYNYCH_ID, count: 1, name: 'горыныч' },
    { typeId: KILLING_HUT_ID, count: 1, name: 'избушка' },
    { typeId: KIND_SANTA_ID, count: 1, name: 'санта' },
    { typeId: KOLOBOK_ID, count: 1, name: 'колобок' },
    { typeId: BABA_YAGA_ID, count: 1, name: 'баба яга' }
];

/**
 * Returns the monster types that should spawn in a given zone, deterministically
 * excluding one type based on (zoneX, zoneY) position.
 * @param {number} zoneX
 * @param {number} zoneY
 * @returns {Array<{ typeId: number; count: number; name: string }>}
 */
export function getRegularMonsterPlanForZone(zoneX, zoneY) {
    const excludedIndex = ((zoneY * ZONES_X) + zoneX) % REGULAR_MONSTER_SPAWN_CONFIG.length;
    return REGULAR_MONSTER_SPAWN_CONFIG.filter((_, index) => index !== excludedIndex);
}

/**
 * Generates a deterministic monster entity ID.
 * @param {number} typeId
 * @param {number} slot
 * @param {string} zoneId
 * @returns {string}
 */
export function getRegularMonsterId(typeId, slot, zoneId) {
    return `m${typeId}s${slot}z${zoneId}`;
}

/**
 * Returns the center zone ID for the Bronekur boss home.
 * @returns {string}
 */
export function getBronekurHomeZoneId() {
    return `${Math.floor(ZONES_X / 2)}_${Math.floor(ZONES_Y / 2)}`;
}

/**
 * Generates the deterministic Bronekur boss monster ID.
 * @returns {string}
 */
export function getBronekurMonsterId() {
    return `m${BRONEKUR_ID}s1z${getBronekurHomeZoneId()}`;
}
