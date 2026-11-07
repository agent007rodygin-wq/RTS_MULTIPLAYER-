/**
 * Clan Stock & Equity Market Business Logic
 *
 * Handles Clan IPO issuance (up to 10,000 shares), market valuation,
 * share purchase/sale transactions, and dividend distribution from Watchtower taxes.
 */

export interface ClanStockListing {
    clanId: number;
    clanName: string;
    ticker: string;                  // 3-5 uppercase letters (e.g. "LEGI", "NORD", "WOLF")
    leaderUid: string;
    leaderName: string;
    isIssued: boolean;              // Whether IPO has been launched
    totalShares: number;            // Total shares issued (up to 10,000)
    circulatingShares: number;      // Shares currently owned by players
    availableIpoShares: number;     // Remaining unsold shares from the clan's public pool
    ipoPrice: number;               // Original IPO price per share in gold
    currentPrice: number;           // Current market price per share in gold
    dividendPercent: number;        // % of watchtower taxes distributed to shareholders (10% - 60%)
    accumulatedDividendPool: number;// Accumulated undistributed dividends in gold
    totalDividendsPaid: number;     // Historical total dividends paid to shareholders
    controlledSectorsCount: number; // Number of watchtowers/sectors controlled
    dailyTaxRevenue: number;        // Tax revenue generated in last 24h
    issuedAt: number;               // Timestamp of IPO
    lastPriceUpdate: number;
}

export interface PlayerStockHolding {
    clanId: number;
    clanName: string;
    ticker: string;
    sharesCount: number;
    totalInvestedGold: number;      // Total gold spent acquiring these shares (for P&L)
    unclaimedDividends: number;     // Accumulated unclaimed dividends ready for withdrawal
    lastClaimTimestamp: number;
}

export interface IpoLaunchParams {
    ticker: string;
    totalShares: number;
    ipoPrice: number;
    dividendPercent: number;
    publicOfferingShares: number;   // How many are offered for sale vs retained in treasury
}

export const MAX_CLAN_SHARES = 10000;
export const MIN_CLAN_SHARES = 500;
export const MIN_IPO_PRICE = 50;
export const MAX_IPO_PRICE = 10000;
export const MIN_DIVIDEND_PERCENT = 10;
export const MAX_DIVIDEND_PERCENT = 60;
export const DEFAULT_EXCHANGE_FEE_PERCENT = 5; // 5% fee on secondary market sell (burns gold)

/**
 * Validates parameters for launching a clan IPO.
 */
export function validateIpoParameters(params: Partial<IpoLaunchParams>): { ok: boolean; error?: string } {
    const ticker = String(params.ticker || '').trim().toUpperCase();
    if (!ticker || ticker.length < 2 || ticker.length > 5) {
        return { ok: false, error: 'Тикер акции должен содержать от 2 до 5 букв (например, LEGI)' };
    }
    if (!/^[A-Z0-9А-ЯЁ]+$/i.test(ticker)) {
        return { ok: false, error: 'Тикер может содержать только буквы и цифры' };
    }

    const totalShares = Math.floor(Number(params.totalShares) || 0);
    if (totalShares < MIN_CLAN_SHARES || totalShares > MAX_CLAN_SHARES) {
        return { ok: false, error: `Количество акций должно быть от ${MIN_CLAN_SHARES.toLocaleString()} до ${MAX_CLAN_SHARES.toLocaleString()} шт.` };
    }

    const ipoPrice = Math.floor(Number(params.ipoPrice) || 0);
    if (ipoPrice < MIN_IPO_PRICE || ipoPrice > MAX_IPO_PRICE) {
        return { ok: false, error: `Стартовая цена акции должна быть от ${MIN_IPO_PRICE} до ${MAX_IPO_PRICE.toLocaleString()} золота` };
    }

    const divPercent = Math.floor(Number(params.dividendPercent) || 0);
    if (divPercent < MIN_DIVIDEND_PERCENT || divPercent > MAX_DIVIDEND_PERCENT) {
        return { ok: false, error: `Дивидендная квота должна быть от ${MIN_DIVIDEND_PERCENT}% до ${MAX_DIVIDEND_PERCENT}%` };
    }

    return { ok: true };
}

/**
 * Creates a new clan stock listing record upon IPO.
 */
export function createClanStockListing(params: {
    clanId: number;
    clanName: string;
    leaderUid: string;
    leaderName: string;
    ticker: string;
    totalShares: number;
    ipoPrice: number;
    dividendPercent: number;
    controlledSectorsCount?: number;
    now?: number;
}): ClanStockListing {
    const now = params.now || Date.now();
    const cleanTicker = params.ticker.trim().toUpperCase();

    return {
        clanId: params.clanId,
        clanName: params.clanName,
        ticker: cleanTicker,
        leaderUid: params.leaderUid,
        leaderName: params.leaderName,
        isIssued: true,
        totalShares: params.totalShares,
        circulatingShares: 0,
        availableIpoShares: params.totalShares,
        ipoPrice: params.ipoPrice,
        currentPrice: params.ipoPrice,
        dividendPercent: params.dividendPercent,
        accumulatedDividendPool: 0,
        totalDividendsPaid: 0,
        controlledSectorsCount: Math.max(0, params.controlledSectorsCount || 1),
        dailyTaxRevenue: 0,
        issuedAt: now,
        lastPriceUpdate: now,
    };
}

/**
 * Calculates current market price based on supply/demand and clan fundamentals.
 * Factors:
 * 1. Ratio of circulating shares to total shares (demand multiplier)
 * 2. Controlled watchtower sectors (economic power multiplier)
 * 3. Daily tax revenue
 */
export function calculateDynamicSharePrice(listing: ClanStockListing, clanGlory: number = 0): number {
    if (!listing.isIssued || listing.totalShares <= 0) return listing.ipoPrice;

    const soldRatio = listing.circulatingShares / listing.totalShares;
    // Demand factor: up to +80% if all shares are bought
    const demandMultiplier = 1 + soldRatio * 0.8;

    // Territory factor: +15% per controlled sector beyond the 1st (max +150%)
    const territoryBonus = Math.min(1.5, Math.max(0, (listing.controlledSectorsCount - 1) * 0.15));

    // Tax revenue bonus: +1% per 1,000 daily tax gold (max +50%)
    const taxBonus = Math.min(0.5, (listing.dailyTaxRevenue || 0) / 100000);

    const price = Math.round(listing.ipoPrice * demandMultiplier * (1 + territoryBonus + taxBonus));
    return Math.max(MIN_IPO_PRICE, price);
}

/**
 * Calculates total cost to buy a given amount of shares.
 */
export function calculateSharePurchaseCost(listing: ClanStockListing, sharesToBuy: number): {
    totalGoldCost: number;
    pricePerShare: number;
    canFulfill: boolean;
    error?: string;
} {
    const count = Math.floor(sharesToBuy);
    if (count <= 0) {
        return { totalGoldCost: 0, pricePerShare: listing.currentPrice, canFulfill: false, error: 'Укажите количество акций' };
    }

    if (count > listing.availableIpoShares) {
        return {
            totalGoldCost: 0,
            pricePerShare: listing.currentPrice,
            canFulfill: false,
            error: `Доступно для покупки только ${listing.availableIpoShares.toLocaleString()} акций`,
        };
    }

    const totalGoldCost = count * listing.currentPrice;
    return {
        totalGoldCost,
        pricePerShare: listing.currentPrice,
        canFulfill: true,
    };
}

/**
 * Calculates proceeds when an investor sells shares back to the market.
 * Deducts exchange fee (e.g. 5%) to counteract game inflation.
 */
export function calculateShareSellProceeds(
    holding: PlayerStockHolding,
    listing: ClanStockListing,
    sharesToSell: number,
    feePercent: number = DEFAULT_EXCHANGE_FEE_PERCENT
): {
    grossGold: number;
    feeGold: number;
    netGold: number;
    canFulfill: boolean;
    error?: string;
} {
    const count = Math.floor(sharesToSell);
    if (count <= 0) {
        return { grossGold: 0, feeGold: 0, netGold: 0, canFulfill: false, error: 'Укажите количество акций' };
    }

    if (count > holding.sharesCount) {
        return {
            grossGold: 0,
            feeGold: 0,
            netGold: 0,
            canFulfill: false,
            error: `У вас есть только ${holding.sharesCount.toLocaleString()} акций`,
        };
    }

    const grossGold = count * listing.currentPrice;
    const feeGold = Math.floor(grossGold * (feePercent / 100));
    const netGold = Math.max(0, grossGold - feeGold);

    return {
        grossGold,
        feeGold,
        netGold,
        canFulfill: true,
    };
}

/**
 * Computes allocation of incoming watchtower tax between Clan Treasury and Dividend Pool.
 */
export function allocateTaxToDividends(
    taxShare: number,
    dividendPercent: number
): { dividendPoolShare: number; clanBankShare: number } {
    if (taxShare <= 0) return { dividendPoolShare: 0, clanBankShare: 0 };

    const safePercent = Math.max(0, Math.min(100, dividendPercent));
    const dividendPoolShare = Math.floor(taxShare * (safePercent / 100));
    const clanBankShare = Math.max(0, taxShare - dividendPoolShare);

    return { dividendPoolShare, clanBankShare };
}

/**
 * Calculates dividend payout for a shareholder given the current dividend pool.
 */
export function calculateClaimableDividends(
    holding: PlayerStockHolding,
    listing: ClanStockListing
): number {
    if (holding.sharesCount <= 0 || listing.totalShares <= 0 || listing.accumulatedDividendPool <= 0) {
        return holding.unclaimedDividends || 0;
    }

    // Shareholder portion of the current undistributed pool
    const shareRatio = holding.sharesCount / listing.totalShares;
    const fromPool = Math.floor(listing.accumulatedDividendPool * shareRatio);

    return (holding.unclaimedDividends || 0) + fromPool;
}
