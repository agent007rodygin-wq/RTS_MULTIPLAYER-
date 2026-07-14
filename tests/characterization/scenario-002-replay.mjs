const COMMAND = 'node tests/characterization/scenario-002-replay.mjs';
const ALLOWED_CONTROLS = new Set([
  'baseline',
  'tombstone-absent',
  'wrong-order',
  'missing-identity',
  'unrelated-building-changed',
]);

const SOURCE_ANCESTORS = [
  'tests/characterization/scenario-002-source-audit.md',
  'tests/characterization/scenario-002-classification.md',
  'tests/characterization/scenario-002-seam-decision.md',
  'tests/characterization/scenario-002-contract-split.md',
  'tests/characterization/scenario-002-fixture-design.md',
  'App.tsx',
  'src/pocketbase.ts',
  'src/game/buildings/resolveBuildingSnapshotMerge.js',
];

function parseControl(argv, env) {
  const arg = argv.find((value) => value.startsWith('--control='));
  const raw = (arg ? arg.slice('--control='.length) : env.SCENARIO_002_CONTROL || 'baseline').trim();
  if (!ALLOWED_CONTROLS.has(raw)) {
    throw new Error(`Unsupported Scenario 2 control "${raw}"`);
  }
  return raw;
}

function buildBlockedReport(control) {
  const missingSeam = 'App.tsx does not expose an importable pure helper for tombstone reconnect suppression; the replay would have to reimplement App-level tombstone state and merge filtering to exercise the contract.';

  return {
    command: COMMAND,
    scenarioId: 'scenario-002',
    control,
    artifactKind: 'blocked-boundary-audit',
    modelType: 'blocked-boundary-audit',
    productionBoundaryStatus: 'missing-importable-production-boundary',
    productionSourceExecution: false,
    controlledReplayEvidence: false,
    permanentTest: false,
    sourceBoundaryExecuted: false,
    sourceAnchors: SOURCE_ANCESTORS,
    replayClaim: 'While a local deletion tombstone is active, a reconnect snapshot does not restore the deleted building into the client building set.',
    broaderClaim: 'Deleted building cannot be resurrected by a reconnect snapshot.',
    missingSeam,
    run1: {
      status: 'BLOCKED',
      reason: 'missing-importable-production-boundary',
    },
    run2: {
      status: 'BLOCKED',
      reason: 'missing-importable-production-boundary',
    },
    comparison: 'IDENTICAL',
    negativeControls: {
      tombstoneAbsent: 'not-run',
      wrongOrder: 'not-run',
      missingIdentity: 'not-run',
      unrelatedBuildingChanged: 'not-run',
    },
    summary: {
      narrowClaimSupported: false,
      broaderClaimSupported: false,
      scenarioClassification: 'UNCONFIRMED_RUNTIME_BEHAVIOR',
      deterministicTwoRunResult: true,
      sourceBoundaryExecuted: false,
      replayResult: 'BLOCKED',
    },
  };
}

const CONTROL = parseControl(process.argv.slice(2), process.env);
const report = buildBlockedReport(CONTROL);

console.log(JSON.stringify(report, null, 2));
process.exitCode = 1;
