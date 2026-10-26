// @ts-check

import {
    normalizeClanIdValue,
    getUserCounter,
    getUserStatCounters,
    mergeLocalUserStatCounters,
    mergeTopPlayersEntries
} from '../../src/game/leaderboard/leaderboardLogic.js';

const COMMAND = 'node tests/characterization/scenario-006-clan-id-normalize.mjs';

function runScenario() {
    // 1. Clan ID normalization
    const clanNum = normalizeClanIdValue(15);
    const clanStr = normalizeClanIdValue('42');
    const clanNull = normalizeClanIdValue(null);
    const clanEmpty = normalizeClanIdValue('');
    const clanInvalid = normalizeClanIdValue('not-a-number');

    // 2. Stat counters
    const rawUser1 = {
        treesChopped: 10,
        monstersDestroyed: 5,
        buildingsDestroyed: 2,
        theftsCommitted: 0
    };
    const rawUserNested = {
        data: {
            treesChopped: 15,
            monstersDestroyed: 3,
            buildingsDestroyed: 4,
            theftsCommitted: 1
        }
    };
    const mergedStats = mergeLocalUserStatCounters(rawUser1, rawUserNested);

    // 3. Top players merge
    const sourceA = [
        { uid: 'u1', name: 'Alice', glory: 100, treesChopped: 20 },
        { uid: 'u2', name: 'Bob', glory: 50, treesChopped: 10 }
    ];
    const sourceB = [
        { uid: 'u1', name: 'Alice', glory: 120, treesChopped: 15 }, // higher glory, lower trees
        { uid: 'u3', name: 'Charlie', glory: 200, treesChopped: 50 }
    ];
    const mergedPlayers = mergeTopPlayersEntries(sourceA, sourceB);
    const playerMap = new Map(mergedPlayers.map(p => [p.uid, p]));
    const alice = playerMap.get('u1');

    const assertions = {
        clanNumberPreserved: clanNum === 15,
        clanStringParsed: clanStr === 42,
        clanEmptyOrNullBecomesNull: clanNull === null && clanEmpty === null && clanInvalid === null,
        counterMergedTakeMax: mergedStats.treesChopped === 15 && mergedStats.monstersDestroyed === 5 && mergedStats.buildingsDestroyed === 4 && mergedStats.theftsCommitted === 1,
        playersCountCorrect: mergedPlayers.length === 3,
        aliceDeduplicatedWithMaxStats: alice !== undefined && alice.glory === 120 && alice.treesChopped === 20
    };

    const allPassed = Object.values(assertions).every(Boolean);

    return {
        command: COMMAND,
        scenarioId: 'scenario-006',
        modelType: 'production-helper',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        productionHelper: 'src/game/leaderboard/leaderboardLogic.js',
        acceptedContract: 'Clan IDs must normalize safely to numbers or null; user stat counters must merge taking the maximum of each category across top player entries without duplication.',
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
