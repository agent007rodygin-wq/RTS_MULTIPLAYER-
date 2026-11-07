import test from 'node:test';
import assert from 'node:assert/strict';

import {
    validateIpoParameters,
    createClanStockListing,
    calculateDynamicSharePrice,
    calculateSharePurchaseCost,
    calculateShareSellProceeds,
    allocateTaxToDividends,
    calculateClaimableDividends,
    MAX_CLAN_SHARES,
    MIN_CLAN_SHARES,
} from '../src/game/economy/clanStockLogic.ts';

test('Clan Stocks - IPO Parameters Validation', () => {
    // Valid IPO parameters
    const valid = validateIpoParameters({
        ticker: 'LEGI',
        totalShares: 5000,
        ipoPrice: 500,
        dividendPercent: 25,
    });
    assert.equal(valid.ok, true);

    // Ticker too short
    const badTickerShort = validateIpoParameters({ ticker: 'A', totalShares: 5000, ipoPrice: 500, dividendPercent: 25 });
    assert.equal(badTickerShort.ok, false);

    // Ticker too long
    const badTickerLong = validateIpoParameters({ ticker: 'TOOLONG', totalShares: 5000, ipoPrice: 500, dividendPercent: 25 });
    assert.equal(badTickerLong.ok, false);

    // Shares count exceeds 10,000 cap
    const badSharesHigh = validateIpoParameters({ ticker: 'LEGI', totalShares: 15000, ipoPrice: 500, dividendPercent: 25 });
    assert.equal(badSharesHigh.ok, false);

    // Shares count below minimum (500)
    const badSharesLow = validateIpoParameters({ ticker: 'LEGI', totalShares: 100, ipoPrice: 500, dividendPercent: 25 });
    assert.equal(badSharesLow.ok, false);

    // Dividend % outside 10% - 60%
    const badDivLow = validateIpoParameters({ ticker: 'LEGI', totalShares: 5000, ipoPrice: 500, dividendPercent: 5 });
    assert.equal(badDivLow.ok, false);
    const badDivHigh = validateIpoParameters({ ticker: 'LEGI', totalShares: 5000, ipoPrice: 500, dividendPercent: 80 });
    assert.equal(badDivHigh.ok, false);
});

test('Clan Stocks - Listing Creation & Pricing Dynamics', () => {
    const listing = createClanStockListing({
        clanId: 101,
        clanName: 'Северные Волки',
        leaderUid: 'user_leader_1',
        leaderName: 'Конунг',
        ticker: 'wolf',
        totalShares: 10000,
        ipoPrice: 200,
        dividendPercent: 30,
        controlledSectorsCount: 1,
    });

    assert.equal(listing.ticker, 'WOLF'); // Ticker uppercase
    assert.equal(listing.totalShares, 10000);
    assert.equal(listing.currentPrice, 200);
    assert.equal(listing.availableIpoShares, 10000);
    assert.equal(listing.circulatingShares, 0);

    // At 0 circulating shares and 1 sector, dynamic price is base IPO price
    const initialPrice = calculateDynamicSharePrice(listing);
    assert.equal(initialPrice, 200);

    // When 5,000 shares are bought (50% demand)
    listing.circulatingShares = 5000;
    const midDemandPrice = calculateDynamicSharePrice(listing);
    assert.ok(midDemandPrice > 200, 'Price should increase with demand');

    // When clan controls 4 sectors and has high tax revenue
    listing.controlledSectorsCount = 4;
    listing.dailyTaxRevenue = 50000;
    const boomPrice = calculateDynamicSharePrice(listing);
    assert.ok(boomPrice > midDemandPrice, 'Price should grow with territorial and tax expansion');
});

test('Clan Stocks - Share Purchase & Sell Calculations', () => {
    const listing = createClanStockListing({
        clanId: 101,
        clanName: 'Легион',
        leaderUid: 'user_1',
        leaderName: 'Цезарь',
        ticker: 'LEGI',
        totalShares: 5000,
        ipoPrice: 300,
        dividendPercent: 20,
    });

    // Valid purchase
    const buyResult = calculateSharePurchaseCost(listing, 100);
    assert.equal(buyResult.canFulfill, true);
    assert.equal(buyResult.totalGoldCost, 30000); // 100 * 300

    // Purchase exceeding available shares
    const buyTooMuch = calculateSharePurchaseCost(listing, 6000);
    assert.equal(buyTooMuch.canFulfill, false);
    assert.ok(buyTooMuch.error?.includes('Доступно'));

    // Sell shares with 5% exchange fee
    const holding = {
        clanId: 101,
        clanName: 'Легион',
        ticker: 'LEGI',
        sharesCount: 100,
        totalInvestedGold: 30000,
        unclaimedDividends: 0,
        lastClaimTimestamp: Date.now(),
    };

    const sellResult = calculateShareSellProceeds(holding, listing, 50, 5);
    assert.equal(sellResult.canFulfill, true);
    assert.equal(sellResult.grossGold, 15000); // 50 * 300
    assert.equal(sellResult.feeGold, 750);     // 5% of 15,000
    assert.equal(sellResult.netGold, 14250);   // 15,000 - 750
});

test('Clan Stocks - Watchtower Tax Allocation & Dividends', () => {
    // 1000 gold collected from Watchtower tax, 30% dividend rate
    const allocation = allocateTaxToDividends(1000, 30);
    assert.equal(allocation.dividendPoolShare, 300);
    assert.equal(allocation.clanBankShare, 700);

    const listing = createClanStockListing({
        clanId: 101,
        clanName: 'Легион',
        leaderUid: 'u1',
        leaderName: 'Лидер',
        ticker: 'LEGI',
        totalShares: 1000,
        ipoPrice: 100,
        dividendPercent: 30,
    });
    listing.accumulatedDividendPool = 10000; // 10,000 gold in pool

    // Holding 250 shares (25% of total shares)
    const holding = {
        clanId: 101,
        clanName: 'Легион',
        ticker: 'LEGI',
        sharesCount: 250,
        totalInvestedGold: 25000,
        unclaimedDividends: 500, // previous unclaimed
        lastClaimTimestamp: Date.now(),
    };

    const claimable = calculateClaimableDividends(holding, listing);
    // 25% of 10,000 = 2,500 + 500 previous = 3,000
    assert.equal(claimable, 3000);
});
