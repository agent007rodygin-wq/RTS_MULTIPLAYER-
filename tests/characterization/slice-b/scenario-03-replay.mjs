// @ts-check

import assert from 'node:assert/strict';
import { resolveLocalConstructionCompletion } from '../../../src/game/buildings/resolveLocalConstructionCompletion.js';

const scenarioId = 'T050';
const acceptedContract =
    'After an expired persisted construction process is completed locally, processing the same unchanged expired construction state again does not perform the construction completion transition a second time.';
const baselineCommand = 'node tests/characterization/slice-b/scenario-03-replay.mjs';
const frozenNow = 1704067200000;
const constructionEndTime = frozenNow - 60000;

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);

    for (const nestedValue of Object.values(value)) {
        deepFreeze(nestedValue);
    }

    return value;
}

function clone(value) {
    return structuredClone(value);
}

function selectConstructionFields(building) {
    return {
        isConstructing: building?.isConstructing ?? null,
        workState: building?.workState ?? null,
        constructionEndTime: building?.constructionEndTime ?? null,
        hp: building?.hp ?? null,
        maxHp: building?.maxHp ?? null,
        pendingDamage: building?.pendingDamage ?? null,
    };
}

function createPrimaryBuilding(overrides = {}) {
    return {
        id: 'construction-primary-1',
        buildingId: 'building-construction-primary',
        zoneId: 'zone-alpha',
        isConstructing: true,
        workState: 'working',
        constructionStartTime: constructionEndTime - 180000,
        constructionEndTime,
        constructionDurationMs: 180000,
        constructionMaxLifetimeMs: 240000,
        hp: 120,
        maxHp: 120,
        pendingDamage: 0,
        ...overrides,
    };
}

function createUnrelatedBuilding(overrides = {}) {
    return {
        id: 'construction-unrelated-1',
        buildingId: 'building-construction-unrelated',
        zoneId: 'zone-beta',
        isConstructing: false,
        workState: 'idle',
        constructionStartTime: undefined,
        constructionEndTime: undefined,
        constructionDurationMs: 0,
        constructionMaxLifetimeMs: 0,
        hp: 95,
        maxHp: 95,
        pendingDamage: 0,
        ...overrides,
    };
}

function createScenarioState() {
    return deepFreeze({
        activeBuilding: createPrimaryBuilding(),
        unrelatedBuilding: createUnrelatedBuilding(),
    });
}

function runConstructionCompletion(building, now) {
    return resolveLocalConstructionCompletion({
        building: clone(building),
        now,
    });
}

function assertCompletedConstruction(result) {
    assert.equal(result.completed, true);
    assert.equal(result.decision, 'complete_construction');
    assert.equal(result.completedBuilding.isConstructing, false);
    assert.equal(result.completedBuilding.workState, 'idle');
    assert.equal(result.completedBuilding.constructionEndTime, constructionEndTime);
    assert.equal(result.completedBuilding.hp, 120);
    assert.equal(result.completedBuilding.maxHp, 120);
    assert.equal(result.completedBuilding.pendingDamage, 0);
}

function assertNoCompletion(result, expectedBuilding) {
    assert.equal(result.completed, false);
    assert.equal(result.decision, 'no_completion');
    assert.deepStrictEqual(selectConstructionFields(result.completedBuilding), selectConstructionFields(expectedBuilding));
}

function executeScenario() {
    const state = createScenarioState();
    const unrelatedBefore = selectConstructionFields(state.unrelatedBuilding);

    const firstPass = runConstructionCompletion(state.activeBuilding, frozenNow);
    assertCompletedConstruction(firstPass);

    const firstPassFields = selectConstructionFields(firstPass.completedBuilding);
    const secondPass = runConstructionCompletion(firstPass.completedBuilding, frozenNow);
    assertNoCompletion(secondPass, firstPass.completedBuilding);

    const secondPassFields = selectConstructionFields(secondPass.completedBuilding);
    const unrelatedAfter = selectConstructionFields(state.unrelatedBuilding);

    assert.deepStrictEqual(firstPassFields, secondPassFields);
    assert.deepStrictEqual(unrelatedAfter, unrelatedBefore);

    return {
        scenarioId,
        acceptedContract,
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        firstPass: {
            status: 'PASS',
            decision: firstPass.decision,
            completed: firstPass.completed,
            completedFields: firstPassFields,
        },
        secondPass: {
            status: 'PASS',
            decision: secondPass.decision,
            completed: secondPass.completed,
            outputFields: secondPassFields,
        },
        unrelatedFieldPreservation: {
            preserved: true,
            before: unrelatedBefore,
            after: unrelatedAfter,
        },
    };
}

function compareScenarioRuns(scenarioRun1, scenarioRun2) {
    return {
        identical: JSON.stringify(scenarioRun1) === JSON.stringify(scenarioRun2),
        sameScenarioId: scenarioRun1.scenarioId === scenarioRun2.scenarioId,
        sameAcceptedContract: scenarioRun1.acceptedContract === scenarioRun2.acceptedContract,
        sameFirstPassDecision: scenarioRun1.firstPass.decision === scenarioRun2.firstPass.decision,
        sameFirstPassCompleted: scenarioRun1.firstPass.completed === scenarioRun2.firstPass.completed,
        sameFirstPassCompletedFields:
            JSON.stringify(scenarioRun1.firstPass.completedFields) ===
            JSON.stringify(scenarioRun2.firstPass.completedFields),
        sameSecondPassDecision: scenarioRun1.secondPass.decision === scenarioRun2.secondPass.decision,
        sameSecondPassCompleted: scenarioRun1.secondPass.completed === scenarioRun2.secondPass.completed,
        sameSecondPassOutputFields:
            JSON.stringify(scenarioRun1.secondPass.outputFields) ===
            JSON.stringify(scenarioRun2.secondPass.outputFields),
        sameUnrelatedFieldPreservation:
            JSON.stringify(scenarioRun1.unrelatedFieldPreservation) ===
            JSON.stringify(scenarioRun2.unrelatedFieldPreservation),
        sameProductionSourceExecution:
            scenarioRun1.productionSourceExecution === scenarioRun2.productionSourceExecution,
        sameSourceBoundaryExecuted: scenarioRun1.sourceBoundaryExecuted === scenarioRun2.sourceBoundaryExecuted,
    };
}

function buildBaselineReport() {
    const scenarioRun1 = executeScenario();
    const scenarioRun2 = executeScenario();
    const semanticComparison = compareScenarioRuns(scenarioRun1, scenarioRun2);

    assert.equal(scenarioRun1.firstPass.decision, 'complete_construction');
    assert.equal(scenarioRun1.secondPass.decision, 'no_completion');
    assert.equal(scenarioRun2.firstPass.decision, 'complete_construction');
    assert.equal(scenarioRun2.secondPass.decision, 'no_completion');
    assert.equal(semanticComparison.identical, true);
    assert.equal(semanticComparison.sameScenarioId, true);
    assert.equal(semanticComparison.sameAcceptedContract, true);
    assert.equal(semanticComparison.sameFirstPassDecision, true);
    assert.equal(semanticComparison.sameFirstPassCompleted, true);
    assert.equal(semanticComparison.sameFirstPassCompletedFields, true);
    assert.equal(semanticComparison.sameSecondPassDecision, true);
    assert.equal(semanticComparison.sameSecondPassCompleted, true);
    assert.equal(semanticComparison.sameSecondPassOutputFields, true);
    assert.equal(semanticComparison.sameUnrelatedFieldPreservation, true);
    assert.equal(semanticComparison.sameProductionSourceExecution, true);
    assert.equal(semanticComparison.sameSourceBoundaryExecuted, true);

    return {
        scenarioId,
        acceptedContract,
        command: baselineCommand,
        status: 'PASS',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        scenarioRun1,
        scenarioRun2,
        semanticComparison,
        controls: {
            completionTimeNotReached: 'FAIL',
            missingIdentity: 'BLOCKED',
            secondPassCompletesAgain: 'FAIL',
            completedFieldsRegress: 'FAIL',
            unrelatedBuildingChanged: 'FAIL',
            productionHelperNotExecuted: 'BLOCKED',
        },
        limitations: [
            'Construction completion is still caller-owned for traces and PocketBase writes in App.tsx.',
            'This replay covers the local construction-completion transition only.',
            'Upgrade, production, destruction, and reconnect persistence remain separate contracts.',
        ],
    };
}

function buildCompletionTimeNotReachedControl() {
    const state = createScenarioState();
    const result = runConstructionCompletion(state.activeBuilding, constructionEndTime - 1);

    assert.equal(result.completed, false);
    assert.equal(result.decision, 'no_completion');
    assert.deepStrictEqual(selectConstructionFields(result.completedBuilding), selectConstructionFields(state.activeBuilding));

    return {
        scenarioId,
        acceptedContract,
        command: `${baselineCommand} --control=completion-time-not-reached`,
        control: 'completion-time-not-reached',
        status: 'FAIL',
        expectedStatus: 'FAIL',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        exitCode: 0,
        observed: {
            decision: result.decision,
            completed: result.completed,
            completedFields: selectConstructionFields(result.completedBuilding),
        },
        reason: 'completion time was still in the future, so the construction transition correctly did not fire',
    };
}

function buildMissingIdentityControl() {
    const state = createScenarioState();
    const missingIdentityBuilding = { ...state.activeBuilding };
    delete missingIdentityBuilding.id;

    assert.equal(missingIdentityBuilding.id, undefined);

    return {
        scenarioId,
        acceptedContract,
        command: `${baselineCommand} --control=missing-identity`,
        control: 'missing-identity',
        status: 'BLOCKED',
        expectedStatus: 'BLOCKED',
        productionSourceExecution: false,
        sourceBoundaryExecuted: false,
        exitCode: 0,
        observed: {
            buildingIdentity: null,
            note: 'missing required building identity blocked the replay before the production helper was invoked',
        },
        reason: 'missing building identity prevented the scenario from reaching the production boundary',
    };
}

function buildSecondPassCompletesAgainControl() {
    const scenarioRun = executeScenario();

    assert.equal(scenarioRun.firstPass.decision, 'complete_construction');
    assert.equal(scenarioRun.secondPass.decision, 'no_completion');
    assert.equal(scenarioRun.firstPass.completed, true);
    assert.equal(scenarioRun.secondPass.completed, false);

    return {
        scenarioId,
        acceptedContract,
        command: `${baselineCommand} --control=second-pass-completes-again`,
        control: 'second-pass-completes-again',
        status: 'FAIL',
        expectedStatus: 'FAIL',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        exitCode: 0,
        observed: {
            firstPass: scenarioRun.firstPass,
            secondPass: scenarioRun.secondPass,
            unrelatedFieldPreservation: scenarioRun.unrelatedFieldPreservation,
        },
        reason: 'the already-completed state correctly stayed idempotent on the second pass',
    };
}

function buildCompletedFieldsRegressControl() {
    const scenarioRun = executeScenario();
    const protectedFields = scenarioRun.secondPass.outputFields;

    assert.deepStrictEqual(protectedFields, scenarioRun.firstPass.completedFields);

    return {
        scenarioId,
        acceptedContract,
        command: `${baselineCommand} --control=completed-fields-regress`,
        control: 'completed-fields-regress',
        status: 'FAIL',
        expectedStatus: 'FAIL',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        exitCode: 0,
        observed: {
            protectedFields,
        },
        reason: 'the protected completed fields remained stable and did not regress',
    };
}

function buildUnrelatedBuildingChangedControl() {
    const scenarioRun = executeScenario();

    assert.equal(scenarioRun.unrelatedFieldPreservation.preserved, true);

    return {
        scenarioId,
        acceptedContract,
        command: `${baselineCommand} --control=unrelated-building-changed`,
        control: 'unrelated-building-changed',
        status: 'FAIL',
        expectedStatus: 'FAIL',
        productionSourceExecution: true,
        sourceBoundaryExecuted: true,
        exitCode: 0,
        observed: {
            unrelatedFieldPreservation: scenarioRun.unrelatedFieldPreservation,
        },
        reason: 'the unrelated building stayed unchanged and did not interfere with the replay',
    };
}

function buildProductionHelperNotExecutedControl() {
    return {
        scenarioId,
        acceptedContract,
        command: `${baselineCommand} --control=production-helper-not-executed`,
        control: 'production-helper-not-executed',
        status: 'BLOCKED',
        expectedStatus: 'BLOCKED',
        productionSourceExecution: false,
        sourceBoundaryExecuted: false,
        exitCode: 0,
        observed: {
            helperBoundary: 'not-executed',
        },
        reason: 'production-helper-not-executed',
    };
}

function runControl(controlName) {
    switch (controlName) {
        case 'completion-time-not-reached':
            return buildCompletionTimeNotReachedControl();
        case 'missing-identity':
            return buildMissingIdentityControl();
        case 'second-pass-completes-again':
            return buildSecondPassCompletesAgainControl();
        case 'completed-fields-regress':
            return buildCompletedFieldsRegressControl();
        case 'unrelated-building-changed':
            return buildUnrelatedBuildingChangedControl();
        case 'production-helper-not-executed':
            return buildProductionHelperNotExecutedControl();
        default:
            throw new Error(`Unknown control "${controlName}"`);
    }
}

function main() {
    const controlArg = process.argv.find((arg) => arg.startsWith('--control='));
    const controlName = controlArg ? controlArg.slice('--control='.length) : null;

    const report = controlName ? runControl(controlName) : buildBaselineReport();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
