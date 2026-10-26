// @ts-check

export const MAX_SAFE_INVENTORY_COUNT = Number.MAX_SAFE_INTEGER - 1;

/**
 * @param {unknown} value
 * @returns {number}
 */
export const normalizeInventoryCount = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.min(MAX_SAFE_INVENTORY_COUNT, Math.floor(numeric)));
};

/**
 * @param {unknown} rawInventory
 * @returns {Record<number, number>}
 */
export const sanitizeInventoryCounts = (rawInventory) => {
    if (!rawInventory || typeof rawInventory !== 'object') return {};

    /** @type {Record<number, number>} */
    const sanitized = {};
    for (const [rawId, rawAmount] of Object.entries(/** @type {Record<string, unknown>} */ (rawInventory))) {
        const itemId = Number(rawId);
        if (!Number.isFinite(itemId)) continue;
        sanitized[itemId] = normalizeInventoryCount(rawAmount);
    }
    return sanitized;
};
