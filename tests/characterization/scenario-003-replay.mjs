const report = {
  scenarioId: 'scenario-003',
  subcase: 'LOCAL_TERMINAL_STATE_FIRST',
  replayResult: 'BLOCKED',
  sourceBoundaryExecuted: false,
  productionBoundaryStatus: {
    completion: 'synthetic_or_missing',
    merge: 'production_boundary_available',
  },
  blockedReason:
    'processOfflineTimers is a local App.tsx const and is not exported/importable; the local destruction-completion half cannot be executed through a production boundary without extracting a seam.',
  smallestMissingSeam:
    'Extract the local destruction-completion branch from App.tsx into one pure importable helper; keep updatePlacedBuildingsFromServer and resolvePlacedBuildingSnapshotMerge as the separate merge boundary.',
  intendedFrozenInputs: {
    completionNow: 'frozen deterministic clock value at or after destruction expiry',
    reconnectNow: 'frozen deterministic clock value after completion',
    buildingIdentity: ['id', 'buildingId', 'zoneId', 'x', 'y'],
  },
  controls: {
    'completion-time-not-reached': 'BLOCKED',
    'snapshot-not-older': 'BLOCKED',
    'missing-building-identity': 'BLOCKED',
    'pre-terminal-state-restored': 'BLOCKED',
    'unrelated-building-changed': 'BLOCKED',
  },
};

console.log(JSON.stringify(report, null, 2));
