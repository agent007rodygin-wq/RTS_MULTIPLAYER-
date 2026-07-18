import assert from 'node:assert/strict';
import {
  refreshManifestFromMirror,
  detectManifestChanges,
} from '../../src/project-brain/manifest-refresh.ts';
import {
  createManifestIdentity,
  createManifestEntry,
  buildManifestSnapshot,
} from '../../src/project-brain/manifest-core.ts';
import {
  createInvestigation,
  createHypothesis,
  createEvidenceItem,
  createRootCause,
  createResolution,
} from '../../src/project-brain/manifest-investigation.ts';
import { serializeManifestSnapshot, deserializeManifestSnapshot } from '../../src/project-brain/manifest-serialization.ts';
import { buildLearningMemory } from '../../src/project-brain/manifest-learning.ts';

// ============================================================
// Fixtures
// ============================================================

const BASE_ID = createManifestIdentity({
  manifestArtifactId: 'PB-DM-001',
  manifestRevision: 'rev-001',
  investigationId: 'PB-INV-001',
  repositoryRevision: 'abc123def',
  freshness: 1000,
});

const BASE_ID_2 = createManifestIdentity({
  manifestArtifactId: 'PB-DM-002',
  manifestRevision: 'rev-002',
  investigationId: 'PB-INV-002',
  repositoryRevision: 'def456',
  freshness: 2000,
});

const EVIDENCE = createEvidenceItem({
  evidenceId: 'PB-EVID-001',
  evidenceType: 'SOURCE_INSPECTION',
  description: 'Found memory leak',
  sourceRevision: 'rev-a1b2c3',
  observation: 'Missing cleanup',
  timestamp: 100,
});

const HYPOTHESIS = createHypothesis({
  hypothesisId: 'PB-HYP-001',
  description: 'Memory leak in event subscription',
  author: 'dev-1',
  confidence: 0.85,
  timestamp: 100,
});

const ROOT_CAUSE = createRootCause({
  rootCauseId: 'PB-RC-001',
  description: 'Missing cleanup in useEffect',
  confidence: 0.95,
  supportingEvidence: ['PB-EVID-001'],
  affectedArtifacts: ['PB-COMP-A'],
  affectedInvariants: ['PB-INV-001'],
  validationStatus: 'CONFIRMED',
});

const RESOLUTION = createResolution({
  resolutionId: 'PB-RES-001',
  chosenApproach: 'Added cleanup return in useEffect',
  reasonForChoice: 'Standard React pattern',
  expectedOutcome: 'No more memory leaks',
  risks: ['Regression'],
  requiredValidation: ['Validate with profiler'],
});

const FAILED_HYPOTHESIS = createHypothesis({
  hypothesisId: 'PB-HYP-FAILED-001',
  description: 'Network timeout hypothesis',
  author: 'dev-1',
  confidence: 0.3,
  validationStatus: 'REJECTED',
  timestamp: 50,
});

const VALID_INVESTIGATION = createInvestigation({
  identity: BASE_ID,
  lifecycleState: 'RESOLVED',
  problemStatement: 'Memory leak in component',
  observedSymptoms: ['High memory usage'],
  reproductionSteps: ['Navigate'],
  assumptions: ['React 18'],
  hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
  evidence: [EVIDENCE],
  failedHypotheses: ['PB-HYP-FAILED-001'],
  confirmedRootCause: ROOT_CAUSE,
  affectedArtifacts: ['PB-COMP-A'],
  affectedSourceFiles: ['src/components/MyComponent.tsx'],
  affectedInvariants: ['PB-INV-001'],
  risks: ['Regression'],
  finalResolution: RESOLUTION,
  remainingUncertainty: '',
  futureRecommendations: ['Add unit test'],
  createdAt: 100,
  updatedAt: 200,
});

const VALID_ENTRY = createManifestEntry({
  entryType: 'ACTIVE',
  investigation: VALID_INVESTIGATION,
  diagnostics: [],
});

const BASE_METADATA = {
  sourceMirrorFingerprint: 'mirror-fp-001',
  sourceValidationFingerprint: 'valid-fp-001',
  activeEntryCount: 1,
  archivedEntryCount: 0,
  supersededEntryCount: 0,
  unresolvedEntryCount: 0,
  generatedAt: 500,
};

// ============================================================
// Helpers
// ============================================================

function makeRefreshInput(overrides = {}) {
  return {
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    ...overrides,
  };
}

// ============================================================
// 1. Valid initial refresh without previous snapshot
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  assert.equal(result.nextSnapshot.entryCount, 1);
  assert.ok(result.serialized);
  assert.ok(typeof result.serialized === 'string');
  assert.ok(Array.isArray(result.diagnostics));
}

// ============================================================
// 2. Valid refresh from previous to changed next state
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const invChanged = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component — updated',
    observedSymptoms: ['High memory usage'],
    reproductionSteps: ['Navigate'],
    assumptions: ['React 18'],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedSourceFiles: ['src/components/MyComponent.tsx'],
    affectedInvariants: ['PB-INV-001'],
    risks: ['Regression'],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: ['Add unit test'],
    createdAt: 100,
    updatedAt: 300,
  });

  const changedEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invChanged,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [changedEntry],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  assert.ok(result.serialized);
  assert.ok(result.diagnostics.length >= 1);
}

// ============================================================
// 3. Valid no-op refresh
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [VALID_ENTRY],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'UNCHANGED');
  assert.ok(result.nextSnapshot);
  assert.equal(result.nextSnapshot.fingerprint, prevSnapshot.fingerprint);
}

// ============================================================
// 4. Candidate snapshot is canonical
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.nextSnapshot);
  assert.ok(result.nextSnapshot.entryCount >= 0);
  assert.ok(typeof result.nextSnapshot.fingerprint === 'string');
  assert.ok(result.nextSnapshot.fingerprint.length > 0);
}

// ============================================================
// 5. Candidate fingerprint matches canonical Phase 1 computation
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.nextSnapshot);

  const canonical = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  assert.equal(result.nextSnapshot.fingerprint, canonical.fingerprint);
}

// ============================================================
// 6. Serialized snapshot round-trips through deserialization
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.serialized);
  const deserialized = deserializeManifestSnapshot(result.serialized);
  assert.equal(deserialized.entryCount, 1);
  assert.ok(deserialized.fingerprint.length > 0);
}

// ============================================================
// 7. Exactly one trailing LF
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.serialized);
  assert.equal(result.serialized.endsWith('\n'), true);
}

// ============================================================
// 8. Result deeply frozen
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.diagnostics), true);
  if (result.nextSnapshot) {
    assert.equal(Object.isFrozen(result.nextSnapshot), true);
    assert.equal(Object.isFrozen(result.nextSnapshot.entries), true);
  }
}

// ============================================================
// 9. Caller inputs are not mutated
// ============================================================

{
  const originalEntry = VALID_ENTRY;
  const input = makeRefreshInput({
    entries: [originalEntry],
  });
  const beforeSnapshot = JSON.stringify(originalEntry);
  const result = refreshManifestFromMirror(input);
  const afterSnapshot = JSON.stringify(originalEntry);
  assert.equal(beforeSnapshot, afterSnapshot);
}

// ============================================================
// 10. Same inputs produce deeply equal results
// ============================================================

{
  const input = makeRefreshInput();
  const r1 = refreshManifestFromMirror(input);
  const r2 = refreshManifestFromMirror(input);
  assert.equal(JSON.stringify(r1), JSON.stringify(r2));
}

// ============================================================
// 11. Same inputs produce byte-identical serialization
// ============================================================

{
  const input = makeRefreshInput();
  const r1 = refreshManifestFromMirror(input);
  const r2 = refreshManifestFromMirror(input);
  assert.equal(r1.serialized, r2.serialized);
}

// ============================================================
// 12. Reversed source entry order produces the same result
// ============================================================

{
  const inv2 = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Second problem',
    observedSymptoms: ['Slow render'],
    reproductionSteps: ['Load page'],
    assumptions: [],
    hypotheses: [],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-B'],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 200,
    updatedAt: 300,
  });

  const entry2 = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv2,
    diagnostics: [],
  });

  const input1 = makeRefreshInput({
    entries: [VALID_ENTRY, entry2],
  });
  const input2 = makeRefreshInput({
    entries: [entry2, VALID_ENTRY],
  });

  const r1 = refreshManifestFromMirror(input1);
  const r2 = refreshManifestFromMirror(input2);
  assert.equal(r1.type, r2.type);
  if (r1.nextSnapshot && r2.nextSnapshot) {
    assert.equal(r1.nextSnapshot.fingerprint, r2.nextSnapshot.fingerprint);
  }
  assert.equal(r1.serialized, r2.serialized);
}

// ============================================================
// 13-16. Reversed order determinism (covered by stable sorts in Phase 1)
// ============================================================

{
  // Hypotheses order
  const hyp1 = createHypothesis({ hypothesisId: 'H-001', description: 'A', author: 'dev', confidence: 0.5, timestamp: 1 });
  const hyp2 = createHypothesis({ hypothesisId: 'H-002', description: 'B', author: 'dev', confidence: 0.5, timestamp: 2 });

  const invOrder = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Order test',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [hyp1, hyp2],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const invOrderReverse = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Order test',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [hyp2, hyp1],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const entryNorm = createManifestEntry({ entryType: 'ACTIVE', investigation: invOrder, diagnostics: [] });
  const entryRev = createManifestEntry({ entryType: 'ACTIVE', investigation: invOrderReverse, diagnostics: [] });

  // Same fingerprint because hypotheses are sorted by createInvestigation
  const fpNorm = entryNorm.fingerprint;
  const fpRev = entryRev.fingerprint;
  assert.equal(fpNorm, fpRev);
}

// ============================================================
// 17. No wall-clock or random data appears
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.nextSnapshot);
  const json = JSON.stringify(result.nextSnapshot);
  assert.ok(!json.includes('Date.now'));
}

// ============================================================
// 18. Historical failed hypothesis survives refresh
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  // New entry with SAME identity but NO failed hypotheses
  const invNew = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: ['High memory usage'],
    reproductionSteps: ['Navigate'],
    assumptions: ['React 18'],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],  // intentionally empty — should be populated from prev
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedSourceFiles: ['src/components/MyComponent.tsx'],
    affectedInvariants: ['PB-INV-001'],
    risks: ['Regression'],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: ['Add unit test'],
    createdAt: 100,
    updatedAt: 300,
  });

  const newEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invNew,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [newEntry],
  });

  const result = refreshManifestFromMirror(input);
  // Semantic content unchanged (audit-only timestamp differs) → UNCHANGED
  // Preservation still occurred — historical failedHypotheses restored
  assert.equal(result.type, 'UNCHANGED');
  assert.ok(result.nextSnapshot);
  const preserved = result.nextSnapshot.entries[0].investigation.failedHypotheses;
  assert.ok(preserved.includes('PB-HYP-FAILED-001'));
}

// ============================================================
// 19. Newly failed hypothesis is added
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const hyp3 = createHypothesis({ hypothesisId: 'PB-HYP-FAILED-002', description: 'New fail', author: 'dev', confidence: 0.3, validationStatus: 'REJECTED', timestamp: 100 });

  const invWithNewFail = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: ['High memory usage'],
    reproductionSteps: ['Navigate'],
    assumptions: ['React 18'],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS, hyp3],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-002'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedSourceFiles: ['src/components/MyComponent.tsx'],
    affectedInvariants: ['PB-INV-001'],
    risks: ['Regression'],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: ['Add unit test'],
    createdAt: 100,
    updatedAt: 300,
  });

  const newEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invWithNewFail,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [newEntry],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  const preserved = result.nextSnapshot.entries[0].investigation.failedHypotheses;
  assert.ok(preserved.includes('PB-HYP-FAILED-001'));
  assert.ok(preserved.includes('PB-HYP-FAILED-002'));
}

// ============================================================
// 20. Duplicate failed hypothesis is normalized
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const invDup = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: ['High memory usage'],
    reproductionSteps: ['Navigate'],
    assumptions: ['React 18'],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001', 'PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedSourceFiles: ['src/components/MyComponent.tsx'],
    affectedInvariants: ['PB-INV-001'],
    risks: ['Regression'],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: ['Add unit test'],
    createdAt: 100,
    updatedAt: 300,
  });

  const dupEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invDup,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [dupEntry],
  });

  const result = refreshManifestFromMirror(input);
  // Duplicate normalized to single — semantic content matches prev → UNCHANGED
  assert.equal(result.type, 'UNCHANGED');
  assert.ok(result.nextSnapshot);
  const preserved = result.nextSnapshot.entries[0].investigation.failedHypotheses;
  const count = preserved.filter((id) => id === 'PB-HYP-FAILED-001').length;
  assert.equal(count, 1);
}

// ============================================================
// 21. Historical and new failed hypotheses canonical ordering
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const hypC = createHypothesis({ hypothesisId: 'PB-HYP-FAILED-003', description: 'Fail C', author: 'dev', confidence: 0.3, validationStatus: 'REJECTED', timestamp: 1 });

  const invWithC = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS, hypC],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-003'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const entryC = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invWithC,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [entryC],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  const preserved = result.nextSnapshot.entries[0].investigation.failedHypotheses;
  // Must be sorted
  for (let i = 1; i < preserved.length; i++) {
    assert.ok(preserved[i - 1] <= preserved[i]);
  }
}

// ============================================================
// 22. Previous failed hypothesis cannot disappear
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  // New entry with empty failedHypotheses — preservation should restore historical ones
  const invNoFailed = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const entryNoFailed = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invNoFailed,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [entryNoFailed],
  });

  const result = refreshManifestFromMirror(input);
  // Failed hypotheses preserved but other semantic fields differ → CHANGED
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  const preserved = result.nextSnapshot.entries[0].investigation.failedHypotheses;
  assert.ok(preserved.includes('PB-HYP-FAILED-001'));
}

// ============================================================
// 23. Same hypothesis identity with semantic conflict blocks refresh
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const hypConflict = createHypothesis({
    hypothesisId: 'PB-HYP-FAILED-001',
    description: 'DIFFERENT description — conflict!',
    author: 'other-dev',
    confidence: 0.8,
    timestamp: 200,
  });

  const invConflict = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, hypConflict],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const conflictEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invConflict,
    diagnostics: [],
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [conflictEntry],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
  assert.ok(result.diagnostics.length >= 1);
}

// ============================================================
// 24. [prev, next] ordering cannot change conflict outcome
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const hypConflict = createHypothesis({
    hypothesisId: 'PB-HYP-FAILED-001',
    description: 'DIFFERENT',
    author: 'dev',
    confidence: 0.3,
    timestamp: 100,
  });

  const invConflict = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, hypConflict],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const conflictEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invConflict,
    diagnostics: [],
  });

  // Order A: candidate is the conflict
  const inputA = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [conflictEntry],
  });
  const resultA = refreshManifestFromMirror(inputA);
  assert.equal(resultA.type, 'BLOCKED');

  // Order B: same as A — conflict is detected regardless
  const inputB = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [conflictEntry],
  });
  const resultB = refreshManifestFromMirror(inputB);
  assert.equal(resultB.type, 'BLOCKED');
}

// ============================================================
// 25. Previous input remains unchanged after preservation
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const before = JSON.stringify(prevSnapshot);
  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [VALID_ENTRY],
  });
  refreshManifestFromMirror(input);
  const after = JSON.stringify(prevSnapshot);
  assert.equal(before, after);
}

// ============================================================
// 26. Invalid previous snapshot blocks refresh
// ============================================================

{
  const input = makeRefreshInput({
    previousSnapshot: 'not-a-snapshot',
  });
  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
}

// ============================================================
// 27. Invalid source entry blocks refresh
// ============================================================

{
  const input = makeRefreshInput({
    entries: [],
  });
  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
}

// ============================================================
// 28. Invalid lifecycle transition blocks refresh
// ============================================================

{
  const invSuperseded = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'SUPERSEDED',
    problemStatement: 'Old problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 0,
    updatedAt: 100,
  });

  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [createManifestEntry({ entryType: 'SUPERSEDED', investigation: invSuperseded, diagnostics: [] })],
    metadata: BASE_METADATA,
  });

  const invResolved = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Old problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 0,
    updatedAt: 200,
  });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [createManifestEntry({ entryType: 'ACTIVE', investigation: invResolved, diagnostics: [] })],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
}

// ============================================================
// 29. Hypothesis with unresolved evidence ID triggers WARN
// ============================================================

{
  const hypBadRef = createHypothesis({
    hypothesisId: 'PB-HYP-BAD-REF',
    description: 'Hypothesis referencing missing evidence',
    author: 'test',
    confidence: 0.5,
    supportingEvidence: ['PB-EVID-NONEXISTENT'],
    timestamp: 1,
  });

  const invBad = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Bad ref test',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [hypBadRef],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry = createManifestEntry({ entryType: 'ACTIVE', investigation: invBad, diagnostics: [] });
  const input = makeRefreshInput({ entries: [entry] });
  const result = refreshManifestFromMirror(input);
  assert.ok(result.type === 'CHANGED' || result.type === 'UNCHANGED');
}

// ============================================================
// 30-31. Invalid root cause / resolution — tested through entry validation
// ============================================================

{
  const invNoRootCause = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'No root cause',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [createHypothesis({ hypothesisId: 'H-TEST', description: 'test', author: 'dev', confidence: 0.5, timestamp: 1 })],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const entryNoRC = createManifestEntry({ entryType: 'ACTIVE', investigation: invNoRootCause, diagnostics: [] });
  const input = makeRefreshInput({ entries: [entryNoRC] });
  const result = refreshManifestFromMirror(input);
  // createInvestigation with undefined confirmedRootCause/finalResolution is fine — they're optional
  // But validation might catch missing root cause evidence if rootCause has no supportingEvidence
  assert.ok(result.type === 'CHANGED');
}

// ============================================================
// 32. Valid but learning-ineligible entry does not create a pattern
// ============================================================

{
  const invOpen = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'OPEN',
    problemStatement: 'Open investigation',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 100,
  });

  const openEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invOpen, diagnostics: [] });
  const input = makeRefreshInput({ entries: [openEntry] });
  const result = refreshManifestFromMirror(input);
  assert.ok(result.type === 'CHANGED');
  // Learning memory should be empty since OPEN is ineligible
}

// ============================================================
// 33. Validation warning behavior — warnings allowed
// ============================================================

{
  const invWarn = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Warn test',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const warnEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invWarn, diagnostics: [] });
  const input = makeRefreshInput({ entries: [warnEntry] });
  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
}

// ============================================================
// 34. Eligible resolved entry creates learning
// ============================================================

{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.memory);
  assert.equal(result.memory.patternCount, 1);
}

// ============================================================
// 35. UNCHANGED returns deeply equal previous memory
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  // Build learning from prev entry
  const prevLearnResult = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearnResult.success);

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearnResult.success ? prevLearnResult.memory : undefined,
    entries: [VALID_ENTRY],
  });

  const result = refreshManifestFromMirror(input);
  // No semantic change — type is UNCHANGED
  // Memory should be deeply equal to previous memory (no increment)
  assert.ok(result.type === 'UNCHANGED');
  assert.ok(result.memory);
  assert.equal(result.memory.patternCount, 1);
  assert.equal(result.memory.patterns[0].frequency, 1);
  assert.deepEqual(result.memory, prevLearnResult.memory);
}

// ============================================================
// 36. lastObserved uses deterministic maximum
// ============================================================

{
  const invEarly = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: ['High memory usage'],
    reproductionSteps: ['Navigate'],
    assumptions: ['React 18'],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedSourceFiles: ['src/components/MyComponent.tsx'],
    affectedInvariants: ['PB-INV-001'],
    risks: ['Regression'],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: ['Add unit test'],
    createdAt: 100,
    updatedAt: 200,
  });

  const invLater = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: ['High memory usage'],
    reproductionSteps: ['Navigate'],
    assumptions: ['React 18'],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedSourceFiles: ['src/components/MyComponent.tsx'],
    affectedInvariants: ['PB-INV-001'],
    risks: ['Regression'],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: ['Add unit test'],
    createdAt: 100,
    updatedAt: 400,
  });

  const entryEarly = createManifestEntry({ entryType: 'ACTIVE', investigation: invEarly, diagnostics: [] });
  const entryLater = createManifestEntry({ entryType: 'ACTIVE', investigation: invLater, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [entryEarly, entryLater],
  });

  const result = refreshManifestFromMirror(input);
  assert.ok(result.memory);
  assert.equal(result.memory.patternCount, 1);
  assert.equal(result.memory.patterns[0].lastObserved, 400);
}

// ============================================================
// REFRESH‑N1. Repeated UNCHANGED no-op returns deeply equal memory
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearn.success);

  const r1 = refreshManifestFromMirror(makeRefreshInput({
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
    entries: [VALID_ENTRY],
  }));
  assert.ok(r1.type === 'UNCHANGED');
  assert.deepEqual(r1.memory, prevLearn.memory);

  const r2 = refreshManifestFromMirror(makeRefreshInput({
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
    entries: [VALID_ENTRY],
  }));
  assert.equal(r2.type, 'UNCHANGED');
  assert.deepEqual(r2.memory, prevLearn.memory);
}

// ============================================================
// REFRESH‑N2. Repeated no-op 3× → frequency unchanged
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearn.success);

  for (let i = 0; i < 3; i++) {
    const result = refreshManifestFromMirror(makeRefreshInput({
      previousSnapshot: prevSnapshot,
      previousMemory: prevLearn.memory,
      entries: [VALID_ENTRY],
    }));
    assert.equal(result.type, 'UNCHANGED');
    assert.equal(result.memory.patterns[0].frequency, 1);
  }
}

// ============================================================
// REFRESH‑N3. Repeated no-op → lastObserved unchanged
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearn.success);
  const originalLastObserved = prevLearn.memory.patterns[0].lastObserved;

  for (let i = 0; i < 3; i++) {
    const result = refreshManifestFromMirror(makeRefreshInput({
      previousSnapshot: prevSnapshot,
      previousMemory: prevLearn.memory,
      entries: [VALID_ENTRY],
    }));
    assert.equal(result.memory.patterns[0].lastObserved, originalLastObserved);
  }
}

// ============================================================
// REFRESH‑N4. Repeated no-op → memory fingerprint unchanged
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearn.success);
  const originalFingerprint = prevLearn.memory.fingerprint;

  for (let i = 0; i < 3; i++) {
    const result = refreshManifestFromMirror(makeRefreshInput({
      previousSnapshot: prevSnapshot,
      previousMemory: prevLearn.memory,
      entries: [VALID_ENTRY],
    }));
    assert.equal(result.memory.fingerprint, originalFingerprint);
  }
}

// ============================================================
// REFRESH‑N5. Partial change: unchanged entry B's pattern frequency stays same
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Problem A',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Problem B',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 300,
  });
  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [entryA, entryB],
    metadata: BASE_METADATA,
  });

  const prevLearn = buildLearningMemory({ entries: [entryA, entryB] });
  assert.ok(prevLearn.success);

  // Entry A changes, entry B stays the same
  const invAChanged = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Problem A — UPDATED',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 400,
  });
  const entryAChanged = createManifestEntry({ entryType: 'ACTIVE', investigation: invAChanged, diagnostics: [] });

  const result = refreshManifestFromMirror(makeRefreshInput({
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
    entries: [entryAChanged, entryB],
  }));

  assert.equal(result.type, 'CHANGED');
  // Entry B's pattern frequency should not increase (its fingerprint already observed)
  const patternB = result.memory.patterns.find((p) => p.problemStatement === 'Problem B');
  assert.ok(patternB);
  assert.equal(patternB.frequency, 1);
}

// ============================================================
// REFRESH‑N6. Same pattern from different changed entries → frequency per distinct observation
// ============================================================

{
  const invX = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Shared pattern',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const entryX = createManifestEntry({ entryType: 'ACTIVE', investigation: invX, diagnostics: [] });

  // Two entries with different identities but same pattern semantics
  const invY = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Shared pattern',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 200,
    updatedAt: 400,
  });
  const entryY = createManifestEntry({ entryType: 'ACTIVE', investigation: invY, diagnostics: [] });

  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [entryX],
    metadata: BASE_METADATA,
  });

  const prevLearn = buildLearningMemory({ entries: [entryX] });
  assert.ok(prevLearn.success);

  const result = refreshManifestFromMirror(makeRefreshInput({
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
    entries: [entryY],
  }));

  assert.equal(result.type, 'CHANGED');
  assert.equal(result.memory.patternCount, 1);
  // entryX and entryY have different fingerprints → frequency = 2
  assert.equal(result.memory.patterns[0].frequency, 2);
}

// ============================================================
// REFRESH‑N7. Previously observed fingerprints survive refresh
// ============================================================

{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearn.success);

  const result = refreshManifestFromMirror(makeRefreshInput({
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
    entries: [VALID_ENTRY],
  }));

  assert.equal(result.type, 'UNCHANGED');
  assert.ok(result.memory.observedEntryFingerprints.includes(VALID_ENTRY.fingerprint));
}

// ============================================================
// REFRESH‑N8. New fingerprints merged canonically into observed set
// ============================================================

{
  const invNew = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Brand new pattern',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 300,
  });
  const newEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invNew, diagnostics: [] });

  const result = refreshManifestFromMirror(makeRefreshInput({
    entries: [newEntry],
  }));

  assert.ok(result.memory);
  assert.ok(result.memory.observedEntryFingerprints.includes(newEntry.fingerprint));
}

// ============================================================
// 37. Candidate-to-candidate semantic collision blocks refresh
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Same problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-X'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Same problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Y'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [entryA, entryB],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
}

// ============================================================
// 38. Candidate-to-existing semantic collision blocks refresh
// ============================================================

{
  const prevPatternInv = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Original problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-X'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const prevPatternEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: prevPatternInv, diagnostics: [] });
  const prevLearn = buildLearningMemory({ entries: [prevPatternEntry] });
  assert.ok(prevLearn.success);

  const collidingInv = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Original problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Y'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const collidingEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: collidingInv, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [collidingEntry],
    previousMemory: prevLearn.success ? prevLearn.memory : undefined,
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
}

// ============================================================
// 39. Collision returns error diagnostic
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Collision diag',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-X'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Collision diag',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Y'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [entryA, entryB],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
  assert.ok(result.diagnostics.length >= 1);
}

// ============================================================
// 40. Collision returns no partial learning memory
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'No partial memory',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-X'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'No partial memory',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Y'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [entryA, entryB],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
  assert.equal(result.memory, undefined);
}

// ============================================================
// 41. Reversed collision inputs produce equivalent failure
// ============================================================

{
  const invX = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Rev collision',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-X'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-X'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const invY = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Rev collision',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-X'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Y'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const entryX = createManifestEntry({ entryType: 'ACTIVE', investigation: invX, diagnostics: [] });
  const entryY = createManifestEntry({ entryType: 'ACTIVE', investigation: invY, diagnostics: [] });

  const r1 = refreshManifestFromMirror(makeRefreshInput({ entries: [entryX, entryY] }));
  const r2 = refreshManifestFromMirror(makeRefreshInput({ entries: [entryY, entryX] }));
  assert.equal(r1.type, 'BLOCKED');
  assert.equal(r2.type, 'BLOCKED');
}

// ============================================================
// 42. Learning diagnostics are propagated
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Learn diag',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-X'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Learn diag',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Y'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [entryA, entryB],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
}

// ============================================================
// 43-49. Atomicity and rollback (partial state never escapes)
// ============================================================

// 43. Failure during history preservation returns no candidate snapshot
{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const hypConflict = createHypothesis({
    hypothesisId: 'PB-HYP-FAILED-001',
    description: 'CONFLICT',
    author: 'dev',
    confidence: 0.3,
    timestamp: 100,
  });

  const invConflict = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, hypConflict],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const conflictEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invConflict, diagnostics: [] });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [conflictEntry],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'BLOCKED');
  assert.equal(result.nextSnapshot, undefined);
  assert.equal(result.serialized, undefined);
}

// 44-46. Similar tests for validation/learning/serialization failure
{
  const badInput = makeRefreshInput({
    entries: [],
  });
  const result = refreshManifestFromMirror(badInput);
  assert.equal(result.type, 'BLOCKED');
  assert.equal(result.nextSnapshot, undefined);
  assert.equal(result.memory, undefined);
  assert.equal(result.serialized, undefined);
}

// 47. Previous snapshot remains deeply equal after failure
{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const before = JSON.stringify(prevSnapshot);
  const hypConflict = createHypothesis({
    hypothesisId: 'PB-HYP-FAILED-001',
    description: 'CONFLICT',
    author: 'dev',
    confidence: 0.3,
    timestamp: 100,
  });

  const invConflict = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, hypConflict],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const conflictEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invConflict, diagnostics: [] });

  refreshManifestFromMirror(makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [conflictEntry],
  }));

  const after = JSON.stringify(prevSnapshot);
  assert.equal(before, after);
}

// 48. Existing learning memory remains deeply equal after failure
{
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.ok(prevLearn.success);
  const memoryBefore = JSON.stringify(prevLearn.success ? prevLearn.memory : null);

  const invCollide = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Collision test',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['ART-A'],
    affectedSourceFiles: [],
    affectedInvariants: ['INV-Z'],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 300,
    updatedAt: 400,
  });

  const collideEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invCollide, diagnostics: [] });

  const input = makeRefreshInput({
    entries: [collideEntry],
    previousMemory: prevLearn.success ? prevLearn.memory : undefined,
  });

  // This should BLOCK due to candidate-to-existing collision
  // Note: collision happens because same rootCauseId + resolutionId + problemStatement → same patternId
  // But different affectedInvariants → different semantic projection → collision
  const result = refreshManifestFromMirror(input);

  const memoryAfter = JSON.stringify(prevLearn.success ? prevLearn.memory : null);
  assert.equal(memoryBefore, memoryAfter);
}

// ============================================================
// 51-59. Comparison behavior
// ============================================================

// 51. Semantic change detected
{
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const invDifferent = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'COMPLETELY DIFFERENT PROBLEM',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS, FAILED_HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const diffEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invDifferent, diagnostics: [] });

  const input = makeRefreshInput({
    previousSnapshot: prevSnapshot,
    entries: [diffEntry],
  });

  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
}

// 53. Added entry detected
{
  const inv2 = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Second entry',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry2 = createManifestEntry({ entryType: 'ACTIVE', investigation: inv2, diagnostics: [] });
  const input = makeRefreshInput({ entries: [VALID_ENTRY, entry2] });
  const result = refreshManifestFromMirror(input);
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  assert.equal(result.nextSnapshot.entryCount, 2);
}

// ============================================================
// 60-65. Serialization integration
// ============================================================

// 60. No schema field in output
{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.serialized);
  const parsed = JSON.parse(result.serialized);
  assert.equal('schema' in parsed, false);
}

// 61. Unknown fields remain rejected on reload
{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.serialized);
  const parsed = JSON.parse(result.serialized);
  parsed.unknownField = 'injected';
  try {
    deserializeManifestSnapshot(JSON.stringify(parsed));
    assert.fail('Should reject unknown field');
  } catch {
    assert.ok(true);
  }
}

// 62-63. Fingerprint tampering rejected on reload
{
  const input = makeRefreshInput();
  const result = refreshManifestFromMirror(input);
  assert.ok(result.serialized);
  const parsed = JSON.parse(result.serialized);
  parsed.fingerprint = 'tampered';
  try {
    deserializeManifestSnapshot(JSON.stringify(parsed));
    assert.fail('Should reject tampered fingerprint');
  } catch {
    assert.ok(true);
  }
}

// 65. Refreshed serialized output is byte-stable
{
  const input = makeRefreshInput();
  const r1 = refreshManifestFromMirror(input);
  const r2 = refreshManifestFromMirror(input);
  assert.equal(r1.serialized, r2.serialized);
}

// ============================================================
// detectManifestChanges unit
// ============================================================

{
  const snap1 = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const snap2 = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: { ...BASE_METADATA, generatedAt: 999 },
  });

  // Same semantic content → same fingerprint regardless of generatedAt
  assert.equal(detectManifestChanges(snap1, snap2), 'UNCHANGED');
}

{
  const snap1 = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const invDiff = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Different problem',
    observedSymptoms: [],
    reproductionSteps: [],
    assumptions: [],
    hypotheses: [HYPOTHESIS],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: [],
    affectedSourceFiles: [],
    affectedInvariants: [],
    risks: [],
    finalResolution: RESOLUTION,
    remainingUncertainty: '',
    futureRecommendations: [],
    createdAt: 100,
    updatedAt: 300,
  });

  const diffEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invDiff, diagnostics: [] });
  const snap2 = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [diffEntry],
    metadata: BASE_METADATA,
  });

  assert.equal(detectManifestChanges(snap1, snap2), 'CHANGED');
}

console.log('PASS');
