// @ts-check

import { repairMojibakeCp1251Utf8 } from '../utils/mojibake.js';

/**
 * @typedef {Object} UserStatCounters
 * @property {number} treesChopped
 * @property {number} monstersDestroyed
 * @property {number} buildingsDestroyed
 * @property {number} theftsCommitted
 */

/**
 * @param {any} data
 * @param {string} key
 * @returns {number}
 */
export const getUserCounter = (data, key) => {
    if (!data || typeof data !== 'object') return 0;
    return Number(data[key] ?? data.data?.[key] ?? 0) || 0;
};

/**
 * @param {any} data
 * @returns {UserStatCounters}
 */
export const getUserStatCounters = (data) => ({
    treesChopped: getUserCounter(data, 'treesChopped'),
    monstersDestroyed: getUserCounter(data, 'monstersDestroyed'),
    buildingsDestroyed: getUserCounter(data, 'buildingsDestroyed'),
    theftsCommitted: getUserCounter(data, 'theftsCommitted'),
});

/**
 * @param {any} incomingData
 * @param {any} [existingData]
 * @returns {UserStatCounters}
 */
export const mergeLocalUserStatCounters = (incomingData, existingData) => {
    const incoming = getUserStatCounters(incomingData);
    const existing = getUserStatCounters(existingData);
    return {
        treesChopped: Math.max(existing.treesChopped, incoming.treesChopped),
        monstersDestroyed: Math.max(existing.monstersDestroyed, incoming.monstersDestroyed),
        buildingsDestroyed: Math.max(existing.buildingsDestroyed, incoming.buildingsDestroyed),
        theftsCommitted: Math.max(existing.theftsCommitted, incoming.theftsCommitted),
    };
};

/**
 * @param {any} candidateData
 * @param {any} baselineData
 * @returns {boolean}
 */
export const hasHigherLeaderboardStats = (candidateData, baselineData) => {
    const candidate = getUserStatCounters(candidateData);
    const baseline = getUserStatCounters(baselineData);
    return (
        candidate.treesChopped > baseline.treesChopped ||
        candidate.monstersDestroyed > baseline.monstersDestroyed ||
        candidate.buildingsDestroyed > baseline.buildingsDestroyed ||
        candidate.theftsCommitted > baseline.theftsCommitted
    );
};

/**
 * @param {any} value
 * @returns {number | null}
 */
export const normalizeClanIdValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
};

/**
 * @param {any} data
 * @param {string | null} [fallback]
 * @returns {string | null}
 */
export const resolveUserAvatar = (data, fallback = null) => {
    if (!data || typeof data !== 'object') return fallback;
    return data.data?.avatar || data.avatar || data.photoURL || fallback;
};

/**
 * @param {string} uid
 * @param {any} data
 */
export const toTopPlayerEntry = (uid, data) => ({
    uid: String(uid),
    name: repairMojibakeCp1251Utf8(String(data?.name || 'Неизвестный')),
    avatar: resolveUserAvatar(data),
    glory: Math.max(0, Number(data?.glory || 0) || 0),
    ...getUserStatCounters(data),
});

/**
 * @param {...any[]} sources
 * @returns {any[]}
 */
export const mergeTopPlayersEntries = (...sources) => {
    /** @type {Map<string, any>} */
    const merged = new Map();

    sources.forEach((source) => {
        source.forEach((entry) => {
            const uid = String(entry?.uid || '');
            if (!uid) return;
            const existing = merged.get(uid);
            if (!existing) {
                merged.set(uid, {
                    ...entry,
                    uid,
                    name: entry.name || 'Неизвестный',
                    glory: Number(entry.glory || 0) || 0,
                    ...getUserStatCounters(entry),
                });
                return;
            }

            merged.set(uid, {
                ...existing,
                ...entry,
                uid,
                name: entry.name || existing.name || 'Неизвестный',
                avatar: entry.avatar || existing.avatar || null,
                glory: Math.max(Number(existing.glory || 0) || 0, Number(entry.glory || 0) || 0),
                treesChopped: Math.max(Number(existing.treesChopped || 0) || 0, Number(entry.treesChopped || 0) || 0),
                monstersDestroyed: Math.max(Number(existing.monstersDestroyed || 0) || 0, Number(entry.monstersDestroyed || 0) || 0),
                buildingsDestroyed: Math.max(Number(existing.buildingsDestroyed || 0) || 0, Number(entry.buildingsDestroyed || 0) || 0),
                theftsCommitted: Math.max(Number(existing.theftsCommitted || 0) || 0, Number(entry.theftsCommitted || 0) || 0),
            });
        });
    });

    return Array.from(merged.values());
};

/**
 * @typedef {'glory' | 'trees' | 'monsters' | 'buildings' | 'theft'} TopPlayersTab
 */

/**
 * @type {Array<{ id: TopPlayersTab, label: string, icon: string }>}
 */
export const TOP_PLAYERS_TABS = [
    { id: 'glory', label: 'Слава', icon: '🏆' },
    { id: 'trees', label: 'Деревья', icon: '🌳' },
    { id: 'monsters', label: 'Монстры', icon: '💥' },
    { id: 'buildings', label: 'Здания', icon: '🏚️' },
    { id: 'theft', label: 'Воровство', icon: '🥷' },
];

/**
 * @type {Record<TopPlayersTab, string>}
 */
export const TOP_PLAYERS_LABEL_BY_TAB = {
    glory: 'Рейтинг по славе',
    trees: 'Топ по срубленным деревьям',
    monsters: 'Топ по взрыву монстров',
    buildings: 'Топ по взрыву зданий',
    theft: 'Топ по воровству',
};

/**
 * @param {any} playerData
 * @param {string} tab
 * @param {string} [currentUid]
 * @param {any} [currentUserStats]
 * @param {number} [playerGlory]
 * @returns {number}
 */
export const calculateTopPlayerValue = (playerData, tab, currentUid, currentUserStats, playerGlory = 0) => {
    const isCurrent = Boolean(currentUid && playerData?.uid === currentUid);
    const stats = isCurrent && currentUserStats ? currentUserStats : (playerData || {});
    if (tab === 'glory') return isCurrent ? playerGlory : (Number(playerData?.glory || 0) || 0);
    if (tab === 'trees') return Number(stats.treesChopped || 0) || 0;
    if (tab === 'monsters') return Number(stats.monstersDestroyed || 0) || 0;
    if (tab === 'buildings') return Number(stats.buildingsDestroyed || 0) || 0;
    return Number(stats.theftsCommitted || 0) || 0;
};
