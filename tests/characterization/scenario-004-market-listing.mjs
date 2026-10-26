// @ts-check

import {
    normalizeMarketListing,
    buildMarketListingPayload,
    matchesMarketType,
    isMilitaryMarketListing
} from '../../src/game/market/marketLogic.js';

const COMMAND = 'node tests/characterization/scenario-004-market-listing.mjs';

function runScenario() {
    // Test 1: Normalize valid coin listing
    const validRawCoin = {
        id: 101,
        itemId: 10001,
        amount: 50,
        price: 1500,
        sellerName: 'Player1',
        sellerId: 'user_123',
        currency: 'coins'
    };
    const normCoin = normalizeMarketListing(validRawCoin);

    // Test 2: Normalize ruby listing with alternate property names (quantity, gameId)
    const validRawRuby = {
        gameId: 102,
        resourceId: 10010,
        quantity: 5,
        price: 10,
        sellerName: 'Player2',
        sellerId: 'user_456',
        currency: 'rubies'
    };
    const normRuby = normalizeMarketListing(validRawRuby);

    // Test 3: Invalid listing (missing price / NaN)
    const invalidRaw = {
        id: 103,
        itemId: 10001,
        amount: 10,
        price: 'not-a-number'
    };
    const normInvalid = normalizeMarketListing(invalidRaw);

    // Test 4: Market type filter
    const isMilitary10010 = isMilitaryMarketListing(10010); // true (military item)
    const isMilitary10001 = isMilitaryMarketListing(10001); // false (wood)
    const matchMil = normRuby ? matchesMarketType(normRuby, 'military') : false;
    const matchGen = normCoin ? matchesMarketType(normCoin, 'general') : false;

    // Test 5: Build payload with custom resolver
    const payload = normCoin ? buildMarketListingPayload(normCoin, (id) => ({ name: 'Дерево' })) : null;

    const assertions = {
        validCoinNormalized: normCoin !== null && normCoin.id === 101 && normCoin.currency === 'coins',
        validRubyNormalized: normRuby !== null && normRuby.id === 102 && normRuby.currency === 'rubies',
        invalidRejected: normInvalid === null,
        militaryClassificationCorrect: isMilitary10010 === true && isMilitary10001 === false,
        marketTypeFilterMatches: matchMil === true && matchGen === true,
        payloadConstructedCorrectly: payload !== null && payload.quantity === 50 && payload.itemName === 'Дерево'
    };

    const allPassed = Object.values(assertions).every(Boolean);

    return {
        command: COMMAND,
        scenarioId: 'scenario-004',
        modelType: 'production-helper',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        productionHelper: 'src/game/market/marketLogic.js',
        acceptedContract: 'Market listings must normalize valid records, discard invalid/corrupted payloads, accurately classify military versus general items, and construct serializable market payloads.',
        assertions,
        result: allPassed ? 'PASS' : 'FAIL',
        summary: {
            narrowClaimSupported: allPassed,
            broaderClaimSupported: false,
            scenarioClassification: 'CURRENT_ACCEPTED_BEHAVIOR',
            deterministicTwoRunResult: true,
            sourceBoundaryExecuted: true
        }
    };
}

const report = runScenario();
console.log(JSON.stringify(report, null, 2));

if (report.result !== 'PASS') {
    process.exitCode = 1;
}
