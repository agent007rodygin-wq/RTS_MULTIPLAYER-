// @ts-check

import {
    TOP_PLAYERS_TABS,
    TOP_PLAYERS_LABEL_BY_TAB,
    calculateTopPlayerValue
} from '../../src/game/leaderboard/leaderboardLogic.js';

const COMMAND = 'node tests/characterization/scenario-007-top-players-calculation.mjs';

function runScenario() {
    // 1. Verify tabs structure
    const tabIds = TOP_PLAYERS_TABS.map(t => t.id);
    const expectedTabs = ['glory', 'trees', 'monsters', 'buildings', 'theft'];
    const hasAllTabs = expectedTabs.every(id => tabIds.includes(/** @type {any} */ (id)));

    // 2. Verify labels
    const hasAllLabels = expectedTabs.every(id => Boolean(TOP_PLAYERS_LABEL_BY_TAB[id]));

    // 3. Calculation for other player
    const otherPlayer = {
        uid: 'user_other',
        name: 'Opponent',
        glory: 750,
        treesChopped: 120,
        monstersDestroyed: 35,
        buildingsDestroyed: 12,
        theftsCommitted: 4
    };

    const otherGlory = calculateTopPlayerValue(otherPlayer, 'glory', 'user_current', null, 999);
    const otherTrees = calculateTopPlayerValue(otherPlayer, 'trees', 'user_current', null, 999);

    // 4. Calculation for current player (should use live stats)
    const currentPlayerEntry = {
        uid: 'user_current',
        name: 'Hero',
        glory: 100, // snapshot has old value
        treesChopped: 10
    };
    const currentLiveStats = {
        treesChopped: 88,
        monstersDestroyed: 15,
        buildingsDestroyed: 3,
        theftsCommitted: 2
    };
    const liveGlory = 500;

    const currentGloryVal = calculateTopPlayerValue(currentPlayerEntry, 'glory', 'user_current', currentLiveStats, liveGlory);
    const currentTreesVal = calculateTopPlayerValue(currentPlayerEntry, 'trees', 'user_current', currentLiveStats, liveGlory);

    // 5. Fallback on empty
    const fallbackVal = calculateTopPlayerValue(null, 'trees');

    const assertions = {
        hasAllTabs,
        hasAllLabels,
        otherGloryMatches: otherGlory === 750,
        otherTreesMatches: otherTrees === 120,
        currentGloryUsesLive: currentGloryVal === 500,
        currentTreesUsesLive: currentTreesVal === 88,
        fallbackSafe: fallbackVal === 0
    };

    const allPassed = Object.values(assertions).every(Boolean);

    return {
        command: COMMAND,
        scenarioId: 'scenario-007',
        modelType: 'production-helper',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        productionHelper: 'src/game/leaderboard/leaderboardLogic.js',
        acceptedContract: 'Leaderboard top players tabs must define standard tabs and labels, calculate values accurately distinguishing current player live stats from snapshot stats, and safely fallback on missing data.',
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

export { runScenario };
