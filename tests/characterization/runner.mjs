// @ts-check

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMAND = 'node tests/characterization/runner.mjs';
const FIRST_WAVE_ORDER_SOURCE = 'tests/characterization/scenario-index.md';
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const NODE_EXECUTABLE = process.execPath;

/**
 * The first-wave suite follows the published scenario-index order. The
 * historical scenario scripts still use older local numbering for a few
 * entries, so the runner exposes the current first-wave identifier separately
 * from the legacy script identifier.
 */
const FIRST_WAVE_SCENARIOS = [
  {
    order: 1,
    scenarioId: 'scenario-01',
    sourceScenarioId: 'scenario-001',
    label: 'Initial fetch cannot be overwritten by an older late snapshot.',
    script: 'tests/characterization/scenario-001-characterization.mjs',
    seamDecision: 'PURE_SEAM',
    fixtureReference: 'tests/characterization/scenario-001-characterization.mjs',
  },
  {
    order: 2,
    scenarioId: 'scenario-02',
    sourceScenarioId: 'scenario-002',
    label: 'Deleted building cannot be resurrected by a reconnect snapshot.',
    script: 'tests/characterization/scenario-002-characterization.mjs',
    seamDecision: 'PURE_SEAM',
    fixtureReference: 'tests/characterization/scenario-002-characterization.mjs',
  },
  {
    order: 3,
    scenarioId: 'scenario-03',
    sourceScenarioId: 'scenario-03',
    label: 'Persisted process whose end time passed completes exactly once.',
    script: 'tests/characterization/slice-b/scenario-03.mjs',
    seamDecision: 'POTENTIAL_OWNER_APPROVED_SEAM',
    fixtureReference: 'tests/characterization/slice-b/scenario-03-fixture-design.md',
  },
  {
    order: 4,
    scenarioId: 'scenario-04',
    sourceScenarioId: 'scenario-04',
    label: 'Offline catch-up cannot duplicate completion or reward.',
    script: 'tests/characterization/slice-b/scenario-04.mjs',
    seamDecision: 'POTENTIAL_OWNER_APPROVED_SEAM',
    fixtureReference: 'tests/characterization/slice-b/scenario-04-fixture.json',
  },
  {
    order: 5,
    scenarioId: 'scenario-05',
    sourceScenarioId: 'scenario-05',
    label: 'Construction state survives reload and converges from persisted end time.',
    script: 'tests/characterization/slice-b/scenario-05.mjs',
    seamDecision: 'POTENTIAL_OWNER_APPROVED_SEAM',
    fixtureReference: 'tests/characterization/slice-b/scenario-05-fixture.json',
  },
  {
    order: 6,
    scenarioId: 'scenario-06',
    sourceScenarioId: 'scenario-06',
    label: 'Production completion survives reconnect and rewards once.',
    script: 'tests/characterization/slice-b/scenario-06.mjs',
    seamDecision: 'POTENTIAL_OWNER_APPROVED_SEAM',
    fixtureReference: 'tests/characterization/slice-b/scenario-06-fixture.json',
  },
  {
    order: 7,
    scenarioId: 'scenario-07',
    sourceScenarioId: 'scenario-07',
    label: 'Upgrade completion survives reconnect without duplicate transformation.',
    script: 'tests/characterization/slice-b/scenario-07.mjs',
    seamDecision: 'POTENTIAL_OWNER_APPROVED_SEAM',
    fixtureReference: 'tests/characterization/slice-b/scenario-07-fixture.json',
  },
  {
    order: 8,
    scenarioId: 'scenario-08',
    sourceScenarioId: 'scenario-08',
    label: 'Rejected optimistic building placement restores the pre-command state.',
    script: 'tests/characterization/slice-c/scenario-08.mjs',
    seamDecision: 'PURE_SEAM',
    fixtureReference: 'tests/characterization/slice-c/scenario-08-fixture.json',
  },
  {
    order: 9,
    scenarioId: 'scenario-09',
    sourceScenarioId: 'scenario-09',
    label: 'Late command acknowledgement cannot overwrite a newer local intent.',
    script: 'tests/characterization/slice-c/scenario-09.mjs',
    seamDecision: 'PURE_SEAM',
    fixtureReference: 'tests/characterization/slice-c/scenario-09-fixture.json',
  },
  {
    order: 10,
    scenarioId: 'scenario-10',
    sourceScenarioId: 'scenario-003',
    label: 'Destroyed building terminal state survives a later stale snapshot.',
    script: 'tests/characterization/scenario-003-characterization.mjs',
    seamDecision: 'PURE_SEAM',
    fixtureReference: 'tests/characterization/scenario-003-fixture-design.md',
  },
];

function toPosixPath(value) {
  return value.replace(/\\/g, '/');
}

function relativeCommand(relativeScriptPath) {
  return `node ${toPosixPath(relativeScriptPath)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stripScenarioEnvironment(env) {
  const next = { ...env };

  for (const key of Object.keys(next)) {
    if (key.startsWith('SCENARIO_')) {
      delete next[key];
    }
  }

  return next;
}

function uniqueStrings(values) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    output.push(trimmed);
  }

  return output;
}

const ALLOWED_CHILD_STATUSES = new Set(['PASS', 'FAIL', 'BLOCKED']);

function extractClassification(report) {
  const candidates = [
    report?.classification,
    report?.scenarioClassification,
    report?.broadScenarioClassification,
    report?.broadScenarioStatus,
    report?.summary?.scenarioClassification,
    report?.summary?.broadScenarioClassification,
    report?.summary?.broadScenarioStatus,
  ];

  return candidates.find((value) => typeof value === 'string' && value.length > 0) ?? null;
}

function extractEvidenceReferences(entry, report) {
  const references = [];

  if (Array.isArray(report?.sourceAnchors)) {
    references.push(...report.sourceAnchors);
  }

  if (typeof report?.fixturePath === 'string') {
    references.push(report.fixturePath);
  }

  if (typeof report?.productionHelper === 'string') {
    references.push(report.productionHelper);
  }

  if (typeof report?.helper === 'string') {
    references.push(report.helper);
  }

  references.push(entry.script);
  references.push(entry.fixtureReference);

  return uniqueStrings(references);
}

function extractFixtureReference(entry, report) {
  if (typeof report?.fixturePath === 'string' && report.fixturePath.trim()) {
    return report.fixturePath;
  }

  return entry.fixtureReference;
}

function normalizeChildReport(report) {
  return report && typeof report === 'object' ? report : null;
}

function hasDeterministicOrdering(results) {
  const producedOrder = results.map((result) => result.scenarioId);
  const publishedOrder = FIRST_WAVE_SCENARIOS.map((entry) => entry.scenarioId);

  return (
    producedOrder.length === publishedOrder.length
    && producedOrder.every((scenarioId, index) => scenarioId === publishedOrder[index])
  );
}

function runScenario(entry) {
  const absoluteScriptPath = path.resolve(REPO_ROOT, entry.script);
  const command = relativeCommand(entry.script);

  if (!existsSync(absoluteScriptPath)) {
    return {
      order: entry.order,
      scenarioId: entry.scenarioId,
      sourceScenarioId: entry.sourceScenarioId,
      label: entry.label,
      script: entry.script,
      command,
      status: 'BLOCKED',
      reason: 'missing-scenario-entrypoint',
      exitCode: 1,
      executionFlags: {
        productionSourceExecution: false,
        sourceBoundaryExecuted: false,
      },
      classification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      evidenceReferences: uniqueStrings([entry.script, entry.fixtureReference]),
      fixtureReference: entry.fixtureReference,
      seamDecision: entry.seamDecision,
      failureBlockReason: 'missing-scenario-entrypoint',
      summary: {
        runStatus: 'BLOCKED',
        outcome: 'BLOCKED',
        discoveryStrategy: FIRST_WAVE_ORDER_SOURCE,
        sourceBoundaryExecuted: false,
      },
      loadFailure: {
        kind: 'missing-entrypoint',
        script: entry.script,
      },
    };
  }

  const child = spawnSync(NODE_EXECUTABLE, [absoluteScriptPath], {
    cwd: REPO_ROOT,
    env: stripScenarioEnvironment(process.env),
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });

  const exitCode = typeof child.status === 'number' ? child.status : 1;
  const childStdout = typeof child.stdout === 'string' ? child.stdout.trim() : '';
  const childStderr = typeof child.stderr === 'string' ? child.stderr.trim() : '';

  if (child.error) {
    return {
      order: entry.order,
      scenarioId: entry.scenarioId,
      sourceScenarioId: entry.sourceScenarioId,
      label: entry.label,
      script: entry.script,
      command,
      status: 'BLOCKED',
      reason: 'scenario-process-failed',
      exitCode: exitCode || 1,
      executionFlags: {
        productionSourceExecution: false,
        sourceBoundaryExecuted: false,
      },
      classification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      evidenceReferences: uniqueStrings([entry.script, entry.fixtureReference]),
      fixtureReference: entry.fixtureReference,
      seamDecision: entry.seamDecision,
      failureBlockReason: 'scenario-process-failed',
      summary: {
        runStatus: 'BLOCKED',
        outcome: 'BLOCKED',
        discoveryStrategy: FIRST_WAVE_ORDER_SOURCE,
        sourceBoundaryExecuted: false,
      },
      loadFailure: {
        kind: 'process-error',
        message: child.error.message,
        stderr: childStderr || null,
      },
    };
  }

  if (!childStdout) {
    return {
      order: entry.order,
      scenarioId: entry.scenarioId,
      sourceScenarioId: entry.sourceScenarioId,
      label: entry.label,
      script: entry.script,
      command,
      status: 'BLOCKED',
      reason: exitCode === 0 ? 'missing-scenario-output' : 'scenario-process-exited-nonzero',
      exitCode,
      executionFlags: {
        productionSourceExecution: false,
        sourceBoundaryExecuted: false,
      },
      classification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      evidenceReferences: uniqueStrings([entry.script, entry.fixtureReference]),
      fixtureReference: entry.fixtureReference,
      seamDecision: entry.seamDecision,
      failureBlockReason: exitCode === 0 ? 'missing-scenario-output' : 'scenario-process-exited-nonzero',
      summary: {
        runStatus: 'BLOCKED',
        outcome: 'BLOCKED',
        discoveryStrategy: FIRST_WAVE_ORDER_SOURCE,
        sourceBoundaryExecuted: false,
      },
      loadFailure: {
        kind: 'missing-stdout',
        stderr: childStderr || null,
      },
    };
  }

  let childReport;
  try {
    childReport = normalizeChildReport(JSON.parse(childStdout));
  } catch (error) {
    return {
      order: entry.order,
      scenarioId: entry.scenarioId,
      sourceScenarioId: entry.sourceScenarioId,
      label: entry.label,
      script: entry.script,
      command,
      status: 'BLOCKED',
      reason: 'invalid-scenario-json',
      exitCode: exitCode || 1,
      executionFlags: {
        productionSourceExecution: false,
        sourceBoundaryExecuted: false,
      },
      classification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      evidenceReferences: uniqueStrings([entry.script, entry.fixtureReference]),
      fixtureReference: entry.fixtureReference,
      seamDecision: entry.seamDecision,
      failureBlockReason: 'invalid-scenario-json',
      summary: {
        runStatus: 'BLOCKED',
        outcome: 'BLOCKED',
        discoveryStrategy: FIRST_WAVE_ORDER_SOURCE,
        sourceBoundaryExecuted: false,
      },
      loadFailure: {
        kind: 'invalid-json',
        message: error instanceof Error ? error.message : String(error),
        stderr: childStderr || null,
      },
    };
  }

  const childStatus = typeof childReport.status === 'string'
    ? childReport.status
    : typeof childReport.result === 'string'
      ? childReport.result
      : null;
  const childReason = typeof childReport.reason === 'string' ? childReport.reason : null;
  const productionSourceExecution = childReport.productionSourceExecution === true;
  const sourceBoundaryExecuted = childReport.sourceBoundaryExecuted === true;
  const classification = extractClassification(childReport);
  const evidenceReferences = extractEvidenceReferences(entry, childReport);
  const fixtureReference = extractFixtureReference(entry, childReport);
  const executionFlags = {
    productionSourceExecution,
    sourceBoundaryExecuted,
  };

  let status;
  let reason = childReason ?? null;

  if (childStatus === null) {
    status = 'BLOCKED';
    reason = 'missing-scenario-status';
  } else if (!ALLOWED_CHILD_STATUSES.has(childStatus)) {
    status = 'BLOCKED';
    reason = `unknown-child-status:${childStatus}`;
  } else {
    status = childStatus;
  }

  if (exitCode !== 0 && status === 'PASS') {
    status = 'BLOCKED';
    reason = 'scenario-process-exited-nonzero';
  }

  if (status !== 'PASS' && !reason) {
    reason = 'missing-scenario-reason';
  }

  if (!classification) {
    status = 'BLOCKED';
    reason = 'missing-classification';
  }

  if (typeof childReport.productionSourceExecution !== 'boolean') {
    status = 'BLOCKED';
    reason = 'missing-production-source-execution-flag';
  }

  if (typeof childReport.sourceBoundaryExecuted !== 'boolean') {
    status = 'BLOCKED';
    reason = 'missing-source-boundary-executed-flag';
  }

  return {
    order: entry.order,
    scenarioId: entry.scenarioId,
    sourceScenarioId: childReport.scenarioId ?? entry.sourceScenarioId,
    label: entry.label,
    script: entry.script,
    command,
    status,
    reason,
    exitCode,
    executionFlags,
    classification,
    evidenceReferences,
    fixtureReference,
    seamDecision: entry.seamDecision,
    failureBlockReason: status === 'PASS' ? undefined : reason,
    comparison: typeof childReport.comparison === 'string' ? childReport.comparison : null,
    summary: childReport.summary ?? null,
    sourceReport: {
      command: childReport.command ?? command,
      scenarioId: childReport.scenarioId ?? null,
      status: childStatus,
      reason: childReason,
      productionSourceExecution,
      sourceBoundaryExecuted,
    },
  };
}

function countStatuses(results) {
  return results.reduce(
    (accumulator, result) => {
      if (result.status === 'PASS') {
        accumulator.passCount += 1;
      } else if (result.status === 'FAIL') {
        accumulator.failCount += 1;
      } else if (result.status === 'BLOCKED') {
        accumulator.blockedCount += 1;
      } else {
        accumulator.otherCount += 1;
      }

      if (result.loadFailure) {
        accumulator.loadFailureCount += 1;
      }

      if (result.exitCode !== 0) {
        accumulator.nonZeroExitCount += 1;
      }

      return accumulator;
    },
    {
      passCount: 0,
      failCount: 0,
      blockedCount: 0,
      otherCount: 0,
      loadFailureCount: 0,
      nonZeroExitCount: 0,
    },
  );
}

function buildSuiteStatus(summary) {
  if (summary.loadFailureCount > 0) {
    return 'BLOCKED';
  }

  if (summary.failCount > 0) {
    return 'FAIL';
  }

  if (summary.blockedCount > 0) {
    return 'BLOCKED';
  }

  return 'PASS';
}

function main() {
  const scenarioResults = FIRST_WAVE_SCENARIOS.map((entry) => runScenario(entry));
  const summary = countStatuses(scenarioResults);
  const suiteStatus = buildSuiteStatus(summary);
  const report = {
    command: COMMAND,
    suiteId: 'first-wave-characterization',
    discoveryStrategy: {
      type: 'static-order-list',
      source: FIRST_WAVE_ORDER_SOURCE,
    },
    scenarioOrder: FIRST_WAVE_SCENARIOS.map((entry) => entry.scenarioId),
    scenarioResults,
    summary: {
      scenarioCount: scenarioResults.length,
      passCount: summary.passCount,
      failCount: summary.failCount,
      blockedCount: summary.blockedCount,
      loadFailureCount: summary.loadFailureCount,
      nonZeroExitCount: summary.nonZeroExitCount,
      suiteStatus,
      deterministicOrdering: hasDeterministicOrdering(scenarioResults),
      allScenariosExecuted: scenarioResults.length === FIRST_WAVE_SCENARIOS.length,
    },
    status: suiteStatus,
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (suiteStatus !== 'PASS') {
    process.exitCode = 1;
  }
}

main();
