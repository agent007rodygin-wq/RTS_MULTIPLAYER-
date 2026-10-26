// @ts-check

import {
    GENERAL_MARKET_ENGLISH_NAMES,
    MILITARY_MARKET_ENGLISH_NAMES,
    MILITARY_ITEM_IDS,
    GENERAL_MARKET_RESOURCE_SECTION_IDS,
    GENERAL_MARKET_BED_SECTION_IDS,
    GENERAL_MARKET_MONSTER_SECTION_IDS
} from './marketStaticData.js';
import { repairMojibakeCp1251Utf8 } from '../utils/mojibake.js';

/**
 * @param {number} resourceId
 * @returns {boolean}
 */
export const isMilitaryMarketListing = (resourceId) =>
    MILITARY_ITEM_IDS.includes(resourceId);

/**
 * @param {{ englishName?: string }} buildingInfo
 * @returns {boolean}
 */
export const isGeneralMarketBuilding = (buildingInfo) =>
    GENERAL_MARKET_ENGLISH_NAMES.has(buildingInfo.englishName || '');

/**
 * @param {{ englishName?: string }} buildingInfo
 * @returns {boolean}
 */
export const isMilitaryMarketBuilding = (buildingInfo) =>
    MILITARY_MARKET_ENGLISH_NAMES.has(buildingInfo.englishName || '');

/**
 * @param {any} listing
 * @param {'general' | 'military'} type
 * @returns {boolean}
 */
export const matchesMarketType = (listing, type) =>
    type === 'military'
        ? isMilitaryMarketListing(Number(listing?.resourceId))
        : !isMilitaryMarketListing(Number(listing?.resourceId));

/**
 * @param {number} itemId
 * @returns {'resources' | 'beds' | 'monsters' | null}
 */
export const getGeneralMarketBuySectionForItem = (itemId) => {
    if (Object.values(GENERAL_MARKET_RESOURCE_SECTION_IDS).some(ids => ids.includes(itemId))) return 'resources';
    if (Object.values(GENERAL_MARKET_BED_SECTION_IDS).some(ids => ids.includes(itemId))) return 'beds';
    if (Object.values(GENERAL_MARKET_MONSTER_SECTION_IDS).some(ids => ids.includes(itemId))) return 'monsters';
    return null;
};

/**
 * @param {number} itemId
 * @param {string} section
 * @param {string} resourceSection
 * @param {string} bedSection
 * @param {string} monsterSection
 * @returns {boolean}
 */
export const matchesGeneralMarketBuyFilters = (
    itemId,
    section,
    resourceSection,
    bedSection,
    monsterSection
) => {
    if (section === 'resources') return Boolean(GENERAL_MARKET_RESOURCE_SECTION_IDS[resourceSection]?.includes(itemId));
    if (section === 'beds') return Boolean(GENERAL_MARKET_BED_SECTION_IDS[bedSection]?.includes(itemId));
    return Boolean(GENERAL_MARKET_MONSTER_SECTION_IDS[monsterSection]?.includes(itemId));
};

/**
 * @param {any} raw
 * @returns {import('../../../types').MarketListing | null}
 */
export const normalizeMarketListing = (raw) => {
    const id = Number(raw?.id ?? raw?.gameId);
    const resourceId = Number(raw?.resourceId ?? raw?.itemId);
    const amount = Number(raw?.amount ?? raw?.quantity);
    const price = Number(raw?.price);
    const sellerName = repairMojibakeCp1251Utf8(String(raw?.sellerName ?? ''));
    const sellerId = String(raw?.sellerId ?? '0');
    const currency = raw?.currency === 'rubies' ? 'rubies' : 'coins';

    if (!Number.isFinite(id) || !Number.isFinite(resourceId) || !Number.isFinite(amount) || !Number.isFinite(price)) {
        return null;
    }

    return {
        id,
        sellerName,
        sellerId,
        resourceId,
        amount,
        price,
        currency
    };
};

/**
 * @param {import('../../../types').MarketListing} listing
 * @param {(id: number) => { name?: string } | undefined} [itemResolver]
 */
export const buildMarketListingPayload = (listing, itemResolver) => {
    const itemInfo = itemResolver ? itemResolver(listing.resourceId) : undefined;

    return {
        ...listing,
        itemId: String(listing.resourceId),
        itemName: itemInfo?.name || `Item ${listing.resourceId}`,
        quantity: listing.amount,
        timestamp: listing.id
    };
};
