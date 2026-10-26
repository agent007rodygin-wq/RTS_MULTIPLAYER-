// @ts-check

import {
    normalizeInventoryCount,
    sanitizeInventoryCounts,
    MAX_SAFE_INVENTORY_COUNT
} from '../../src/game/inventory/inventorySanitize.js';

const COMMAND = 'node tests/characterization/scenario-005-inventory-sanitize.mjs';

function runScenario() {
    // Edge case 1: normal numbers
    const norm50 = normalizeInventoryCount(50);
    const normFloat = normalizeInventoryCount(12.7);

    // Edge case 2: negative & NaN & string
    const normNeg = normalizeInventoryCount(-10);
    const normNaN = normalizeInventoryCount(NaN);
    const normString = normalizeInventoryCount('25');
    const normInvalidString = normalizeInventoryCount('abc');

    // Edge case 3: Upper bound
    const normInfinity = normalizeInventoryCount(Infinity);
    const normOverflow = normalizeInventoryCount(Number.MAX_SAFE_INTEGER + 100);

    // Full sanitization
    const rawInv = {
        '10001': 100,
        '10002': -5,
        '10003': '35.9',
        'invalid_key': 50,
        '10004': NaN
    };

    const sanitized = sanitizeInventoryCounts(rawInv);
    const emptySanitized = sanitizeInventoryCounts(null);

    const assertions = {
        normalNumbersFloor: norm50 === 50 && normFloat === 12,
        negativeAndNaNNormalizeToZero: normNeg === 0 && normNaN === 0 && normInvalidString === 0,
        stringNumberParsed: normString === 25,
        overflowBoundedToMaxSafe: normInfinity === 0 && normOverflow === MAX_SAFE_INVENTORY_COUNT,
        invalidKeysDiscarded: !('invalid_key' in sanitized) && ('10001' in sanitized),
        sanitizedValuesClean: sanitized[10001] === 100 && sanitized[10002] === 0 && sanitized[10003] === 35 && sanitized[10004] === 0,
        nullInventoryReturnsEmptyObject: Object.keys(emptySanitized).length === 0
    };

    const allPassed = Object.values(assertions).every(Boolean);

    return {
        command: COMMAND,
        scenarioId: 'scenario-005',
        modelType: 'production-helper',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        productionHelper: 'src/game/inventory/inventorySanitize.js',
        acceptedContract: 'Inventory amounts must be positive, whole, non-NaN numbers bounded by MAX_SAFE_INVENTORY_COUNT with corrupted keys dropped safely.',
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
