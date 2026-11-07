// @ts-check

import { getUserStatCounters, resolveUserAvatar } from '../leaderboard/leaderboardLogic.js';

export { resolveUserAvatar };

/**
 * @param {string} uid
 * @returns {string}
 */
export const getAvatarCacheKey = (uid) => `player_avatar_${uid}`;

/**
 * @param {string | null | undefined} [uid]
 * @returns {string | null}
 */
export const readCachedAvatar = (uid) => {
    if (!uid) return null;
    try {
        return localStorage.getItem(getAvatarCacheKey(uid));
    } catch {
        return null;
    }
};

/**
 * @param {string} uid
 * @param {string | null} avatar
 */
export const writeCachedAvatar = (uid, avatar) => {
    try {
        if (!avatar) {
            localStorage.removeItem(getAvatarCacheKey(uid));
            return;
        }
        localStorage.setItem(getAvatarCacheKey(uid), avatar);
    } catch {
        // Ignore localStorage errors for avatar cache
    }
};

/**
 * @param {string} uid
 * @returns {string}
 */
export const getProfileSettingsCacheKey = (uid) => `goldwasdx:profileSettings:${uid}`;

/**
 * @param {string | null | undefined} [uid]
 * @returns {{ gender: 'male' | 'female' | null; friends: Array<{ name: string; uid?: string; addedAt: number }> }}
 */
export const readCachedProfileSettings = (uid) => {
    if (!uid) return { gender: null, friends: [] };
    try {
        const raw = localStorage.getItem(getProfileSettingsCacheKey(uid));
        if (!raw) return { gender: null, friends: [] };
        const parsed = JSON.parse(raw);
        const gender = parsed?.gender === 'male' || parsed?.gender === 'female' ? parsed.gender : null;
        const friends = Array.isArray(parsed?.friends)
            ? parsed.friends.filter((friend) => friend && typeof friend.name === 'string').map((friend) => ({
                name: friend.name,
                uid: typeof friend.uid === 'string' ? friend.uid : undefined,
                addedAt: Number(friend.addedAt) || Date.now()
            }))
            : [];
        return { gender, friends };
    } catch {
        return { gender: null, friends: [] };
    }
};

/**
 * @param {string} uid
 * @param {{ gender: 'male' | 'female' | null; friends: Array<{ name: string; uid?: string; addedAt: number }> }} settings
 */
export const writeCachedProfileSettings = (uid, settings) => {
    try {
        localStorage.setItem(getProfileSettingsCacheKey(uid), JSON.stringify({
            gender: settings.gender,
            friends: settings.friends
        }));
    } catch {
        // Ignore localStorage write failures.
    }
};

/**
 * @param {string} uid
 * @returns {string}
 */
export const getLeaderboardStatsCacheKey = (uid) => `goldwasdx:leaderboardStats:${uid}`;

/**
 * @param {string | null | undefined} [uid]
 */
export const readCachedLeaderboardStats = (uid) => {
    if (!uid) return getUserStatCounters(null);
    try {
        const raw = localStorage.getItem(getLeaderboardStatsCacheKey(uid));
        if (!raw) return getUserStatCounters(null);
        const parsed = JSON.parse(raw);
        return getUserStatCounters(parsed);
    } catch {
        return getUserStatCounters(null);
    }
};

/**
 * @param {string} uid
 * @param {import('../leaderboard/leaderboardLogic.js').UserStatCounters} stats
 */
export const writeCachedLeaderboardStats = (uid, stats) => {
    try {
        localStorage.setItem(getLeaderboardStatsCacheKey(uid), JSON.stringify(getUserStatCounters(stats)));
    } catch {
        // Ignore localStorage write failures.
    }
};

/**
 * @param {string} uid
 * @returns {string}
 */
export const getLastPositionCacheKey = (uid) => `goldwasdx:lastPosition:${uid}`;

/**
 * @param {string | null | undefined} [uid]
 * @returns {{ x: number; y: number; savedAt: number } | null}
 */
export const readCachedLastPosition = (uid) => {
    if (!uid) return null;
    try {
        const raw = localStorage.getItem(getLastPositionCacheKey(uid));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const x = Number(parsed?.x);
        const y = Number(parsed?.y);
        const savedAt = Number(parsed?.savedAt) || 0;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return { x, y, savedAt };
    } catch {
        return null;
    }
};

/**
 * @param {string} uid
 * @param {{ x: number; y: number; savedAt?: number } | null} position
 */
export const writeCachedLastPosition = (uid, position) => {
    try {
        if (!position) {
            localStorage.removeItem(getLastPositionCacheKey(uid));
            return;
        }

        localStorage.setItem(getLastPositionCacheKey(uid), JSON.stringify({
            x: Number(position.x) || 0,
            y: Number(position.y) || 0,
            savedAt: Number(position.savedAt) || Date.now()
        }));
    } catch {
        // Ignore localStorage write failures.
    }
};

/**
 * @param {string} uid
 * @returns {string}
 */
export const getBanEndTimeCacheKey = (uid) => `goldwasdx:banEndTime:${uid}`;

/**
 * @param {string | null | undefined} [uid]
 * @returns {number}
 */
export const readCachedBanEndTime = (uid) => {
    if (!uid) return 0;
    try {
        const raw = localStorage.getItem(getBanEndTimeCacheKey(uid));
        const val = Number(raw || 0) || 0;
        return val > Date.now() ? val : 0;
    } catch {
        return 0;
    }
};

/**
 * @param {string} uid
 * @param {number} banEndTime
 */
export const writeCachedBanEndTime = (uid, banEndTime) => {
    if (!uid) return;
    try {
        const normalized = Number(banEndTime || 0) || 0;
        if (normalized > Date.now()) {
            localStorage.setItem(getBanEndTimeCacheKey(uid), String(normalized));
        } else {
            localStorage.removeItem(getBanEndTimeCacheKey(uid));
        }
    } catch {
        // Ignore localStorage write failures.
    }
};

