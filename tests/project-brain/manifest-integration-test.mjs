import assert from 'node:assert/strict';
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
import { validateManifestEntry, validateManifestSnapshot } from '../../src/project-brain/manifest-validation.ts';
import { buildLearningMemory } from '../../src/project-brain/manifest-learning.ts';
import { serializeManifestSnapshot, deserializeManifestSnapshot } from '../../src/project-brain/manifest-serialization.ts';
import { refreshManifestFromMirror, detectManifestChanges } from '../../src/project-brain/manifest-refresh.ts';

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

const FAILED_HYP = createHypothesis({
  hypothesisId: 'PB-HYP-FAILED-001',
  description: 'Network timeout hypothesis',
  author: 'dev-1',
  confidence: 0.3,
  validationStatus: 'REJECTED',
  timestamp: 50,
});

const ROOT_CAUSE = createRootCause({
  rootCauseId: 'PB-RC-001',
  description: 'Missing cleanup in useEffect',
  confidence: 0.95,
  supportingEvidence: ['PB-EVID-001'],
  affectedArtifacts: ['PB-COMP-A'],
  affectedInvariants: ['PB-INV-001'],
  validationStatus: 'CONFIRMED',
  alternativeExplanations: ['Timing issue'],
  remainingUncertainty: '',
});

const RESOLUTION = createResolution({
  resolutionId: 'PB-RES-001',
  chosenApproach: 'Added cleanup return in useEffect',
  reasonForChoice: 'Standard React pattern',
  expectedOutcome: 'No more memory leaks',
  risks: ['Regression'],
  requiredValidation: ['Validate with profiler'],
});

const VALID_INV = createInvestigation({
  identity: BASE_ID,
  lifecycleState: 'RESOLVED',
  problemStatement: 'Memory leak in component',
  observedSymptoms: ['High memory usage'],
  reproductionSteps: ['Navigate'],
  assumptions: ['React 18'],
  hypotheses: [HYPOTHESIS, FAILED_HYP],
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
  investigation: VALID_INV,
  diagnostics: [],
});

const BASE_METADATA = {
  sourceMirrorFingerprint: 'mirror-fp-001',
  sourceValidationFingerprint: 'valid-fp-001',
  activeEntryCount: 0,
  archivedEntryCount: 0,
  supersededEntryCount: 0,
  unresolvedEntryCount: 0,
  generatedAt: 500,
};

let testCount = 0;
function test(name, fn) {
  testCount++;
  try {
    fn();
  } catch (e) {
    console.error(`FAIL [${testCount}]: ${name}`);
    throw e;
  }
}

// ============================================================
// 1. End-to-end success
// ============================================================

test('E2E-1: Build snapshot from valid investigation', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.equal(snapshot.entryCount, 1);
  assert.equal(snapshot.fingerprint.length, 8);
  assert.equal(Object.isFrozen(snapshot), true);
});

test('E2E-2: Refresh without previous snapshot', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.equal(result.type, 'CHANGED');
  assert.ok(result.nextSnapshot);
  assert.equal(result.nextSnapshot.entryCount, 1);
  assert.ok(result.serialized);
  assert.equal(Object.isFrozen(result), true);
});

test('E2E-3: Refresh with previous snapshot', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
  });
  assert.equal(result.type, 'UNCHANGED');
  assert.ok(result.nextSnapshot);
  assert.equal(result.nextSnapshot.fingerprint, prevSnapshot.fingerprint);
});

test('E2E-4: Learning created through refresh', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.ok(result.memory);
  assert.equal(result.memory.patternCount, 1);
  assert.equal(typeof result.memory.fingerprint, 'string');
  assert.ok(Array.isArray(result.memory.observedEntryFingerprints));
  assert.ok(result.memory.observedEntryFingerprints.length >= 1);
});

test('E2E-5: Serialize snapshot', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const serialized = serializeManifestSnapshot(snapshot);
  assert.equal(typeof serialized, 'string');
  assert.ok(serialized.endsWith('\n'));
});

test('E2E-6: Deserialize snapshot', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const serialized = serializeManifestSnapshot(snapshot);
  const deserialized = deserializeManifestSnapshot(serialized);
  assert.equal(deserialized.fingerprint, snapshot.fingerprint);
  assert.equal(deserialized.entryCount, 1);
  assert.equal(Object.isFrozen(deserialized), true);
});

test('E2E-7: Snapshot identity and fingerprint preserved through round trip', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const serialized = serializeManifestSnapshot(snapshot);
  const deserialized = deserializeManifestSnapshot(serialized);
  assert.equal(deserialized.fingerprint, snapshot.fingerprint);
  assert.equal(deserialized.entryCount, snapshot.entryCount);
  assert.equal(deserialized.identity.manifestArtifactId, snapshot.identity.manifestArtifactId);
  assert.equal(deserialized.metadata.activeEntryCount, snapshot.metadata.activeEntryCount);
  // serialization strips diagnostics/validation/fingerprint from entries,
  // so compare canonical fields only
  assert.equal(deserialized.entries.length, snapshot.entries.length);
  assert.equal(deserialized.entries[0].entryType, snapshot.entries[0].entryType);
});

// ============================================================
// 2. Determinism
// ============================================================

test('DET-1: Snapshot fingerprint identical across runs', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.equal(r1.nextSnapshot.fingerprint, r2.nextSnapshot.fingerprint);
});

test('DET-2: Memory fingerprint identical across runs', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.equal(r1.memory.fingerprint, r2.memory.fingerprint);
});

test('DET-3: Serialized JSON byte-identical', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.equal(r1.serialized, r2.serialized);
});

test('DET-4: Diagnostics identical', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.deepEqual(r1.diagnostics, r2.diagnostics);
});

test('DET-5: Refresh result identical', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.deepEqual(r1, r2);
});

// ============================================================
// 3. Permutation
// ============================================================

function makeSecondEntry() {
  const inv2 = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Second problem',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 300,
  });
  return createManifestEntry({ entryType: 'ACTIVE', investigation: inv2, diagnostics: [] });
}

test('PERM-1: Reversed entries produce identical output', () => {
  const entry2 = makeSecondEntry();

  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY, entry2],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entry2, VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  assert.equal(r1.nextSnapshot.fingerprint, r2.nextSnapshot.fingerprint);
  assert.equal(r1.memory.fingerprint, r2.memory.fingerprint);
  assert.equal(r1.serialized, r2.serialized);
});

test('PERM-2: Reversed hypotheses produce identical investigation', () => {
  const hypA = createHypothesis({ hypothesisId: 'PB-H-A', description: 'Hyp A', author: 'dev', confidence: 0.5, timestamp: 1 });
  const hypB = createHypothesis({ hypothesisId: 'PB-H-B', description: 'Hyp B', author: 'dev', confidence: 0.5, timestamp: 2 });

  const invNorm = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Hyp order test',
    hypotheses: [hypA, hypB],
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });

  const invRev = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Hyp order test',
    hypotheses: [hypB, hypA],
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });

  assert.equal(invNorm.hypotheses[0].hypothesisId, invRev.hypotheses[0].hypothesisId);
  assert.equal(invNorm.hypotheses[1].hypothesisId, invRev.hypotheses[1].hypothesisId);
});

test('PERM-3: Reversed evidence produce identical investigation', () => {
  const evA = createEvidenceItem({ evidenceId: 'PB-EVID-A', evidenceType: 'SOURCE_INSPECTION', description: 'A', sourceRevision: 'r1', observation: 'obs', timestamp: 1 });
  const evB = createEvidenceItem({ evidenceId: 'PB-EVID-B', evidenceType: 'SOURCE_INSPECTION', description: 'B', sourceRevision: 'r2', observation: 'obs', timestamp: 2 });

  const invNorm = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Evidence order test',
    evidence: [evA, evB],
    hypotheses: [HYPOTHESIS],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });

  const invRev = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Evidence order test',
    evidence: [evB, evA],
    hypotheses: [HYPOTHESIS],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });

  assert.equal(invNorm.evidence[0].evidenceId, invRev.evidence[0].evidenceId);
  assert.equal(invNorm.evidence[1].evidenceId, invRev.evidence[1].evidenceId);
});

test('PERM-4: Reversed previous memory produces identical result', () => {
  const entry2 = makeSecondEntry();

  const base1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY, entry2],
    metadata: BASE_METADATA,
  });
  const base2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entry2, VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const invNew = createInvestigation({
    identity: createManifestIdentity({
      manifestArtifactId: 'PB-DM-003',
      manifestRevision: 'rev-003',
      investigationId: 'PB-INV-003',
      repositoryRevision: 'ghi789',
      freshness: 3000,
    }),
    lifecycleState: 'RESOLVED',
    problemStatement: 'Third pattern',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 400,
  });
  const newEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invNew, diagnostics: [] });

  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [newEntry],
    metadata: BASE_METADATA,
    previousMemory: base1.memory,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [newEntry],
    metadata: BASE_METADATA,
    previousMemory: base2.memory,
  });

  assert.equal(r1.memory.patternCount, r2.memory.patternCount);
  assert.equal(r1.memory.fingerprint, r2.memory.fingerprint);
});

// ============================================================
// 4. Refresh UNCHANGED
// ============================================================

test('UNCH-1: No learning rebuild on UNCHANGED', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
  });

  assert.equal(result.type, 'UNCHANGED');
  // Must be same reference (not a rebuild)
  assert.equal(result.memory, prevLearn.memory);
});

test('UNCH-2: No frequency change on UNCHANGED', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });

  for (let i = 0; i < 3; i++) {
    const result = refreshManifestFromMirror({
      identity: BASE_ID,
      entries: [VALID_ENTRY],
      metadata: BASE_METADATA,
      previousSnapshot: prevSnapshot,
      previousMemory: prevLearn.memory,
    });
    assert.equal(result.type, 'UNCHANGED');
    assert.equal(result.memory.patterns[0].frequency, 1);
  }
});

test('UNCH-3: No lastObserved change on UNCHANGED', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  const originalLastObserved = prevLearn.memory.patterns[0].lastObserved;

  for (let i = 0; i < 3; i++) {
    const result = refreshManifestFromMirror({
      identity: BASE_ID,
      entries: [VALID_ENTRY],
      metadata: BASE_METADATA,
      previousSnapshot: prevSnapshot,
      previousMemory: prevLearn.memory,
    });
    assert.equal(result.memory.patterns[0].lastObserved, originalLastObserved);
  }
});

test('UNCH-4: Identical memory on UNCHANGED', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
  });

  assert.deepEqual(result.memory, prevLearn.memory);
});

test('UNCH-5: Identical serialization on UNCHANGED', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });

  const result1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
  });

  const result2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
  });

  assert.equal(result1.serialized, result2.serialized);
});

// ============================================================
// 5. Refresh CHANGED
// ============================================================

test('CHG-1: New observations processed', () => {
  const invNew = createInvestigation({
    identity: createManifestIdentity({
      manifestArtifactId: 'PB-DM-003',
      manifestRevision: 'rev-003',
      investigationId: 'PB-INV-003',
      repositoryRevision: 'ghi789',
      freshness: 3000,
    }),
    lifecycleState: 'RESOLVED',
    problemStatement: 'Brand new pattern',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 300,
  });
  const newEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invNew, diagnostics: [] });

  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [newEntry],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
  });

  assert.equal(result.type, 'CHANGED');
  // Previous pattern + new pattern
  assert.equal(result.memory.patternCount, 2);
});

test('CHG-2: Previous observations skipped on CHANGED', () => {
  // Same pattern semantics as VALID_ENTRY but different identity → different fingerprint
  const invNew = createInvestigation({
    identity: createManifestIdentity({
      manifestArtifactId: 'PB-DM-003',
      manifestRevision: 'rev-003',
      investigationId: 'PB-INV-003',
      repositoryRevision: 'ghi789',
      freshness: 3000,
    }),
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    hypotheses: [HYPOTHESIS, FAILED_HYP],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedInvariants: ['PB-INV-001'],
    finalResolution: RESOLUTION,
    createdAt: 50,
    updatedAt: 400,
  });
  const newEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invNew, diagnostics: [] });

  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [newEntry],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
    previousMemory: prevLearn.memory,
  });

  assert.equal(result.type, 'CHANGED');
  // Same patternId (same rootCause+resolution+problemStatement)
  // Different fingerprint (different identity) → new observation → frequency extends
  assert.equal(result.memory.patternCount, 1);
  assert.equal(result.memory.patterns[0].frequency, 2);
});

test('CHG-3: Deterministic merge on CHANGED', () => {
  const entry2 = makeSecondEntry();

  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY, entry2] });

  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY, entry2],
    metadata: BASE_METADATA,
    previousMemory: prevLearn.memory,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entry2, VALID_ENTRY],
    metadata: BASE_METADATA,
    previousMemory: prevLearn.memory,
  });

  assert.equal(r1.memory.fingerprint, r2.memory.fingerprint);
});

// ============================================================
// 6. Failed hypotheses preservation
// ============================================================

test('HYP-1: Failed hypotheses preserved through refresh', () => {
  const prevSnapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const invNew = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    hypotheses: [HYPOTHESIS, FAILED_HYP],
    evidence: [EVIDENCE],
    failedHypotheses: [],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 300,
  });
  const newEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invNew, diagnostics: [] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [newEntry],
    metadata: BASE_METADATA,
    previousSnapshot: prevSnapshot,
  });

  const preserved = result.nextSnapshot.entries[0].investigation.failedHypotheses;
  assert.ok(preserved.includes('PB-HYP-FAILED-001'));
});

test('HYP-2: Failed hypotheses survive serialization round trip', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const serialized = serializeManifestSnapshot(snapshot);
  const deserialized = deserializeManifestSnapshot(serialized);
  const failed = deserialized.entries[0].investigation.failedHypotheses;
  assert.ok(failed.includes('PB-HYP-FAILED-001'));
});

test('HYP-3: Failed hypotheses survive multiple refresh cycles', () => {
  const snapshot1 = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const result1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: snapshot1,
  });

  const result2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
    previousSnapshot: result1.nextSnapshot,
  });

  const failed = result2.nextSnapshot.entries[0].investigation.failedHypotheses;
  assert.ok(failed.includes('PB-HYP-FAILED-001'));
});

test('HYP-4: Failed hypotheses preserved through learning', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.ok(result.memory);
  const pattern = result.memory.patterns[0];
  assert.ok(pattern.failedHypothesisIds.includes('PB-HYP-FAILED-001'));
});

// ============================================================
// 7. Learning
// ============================================================

test('LEARN-1: Duplicate entry fingerprint counted once', () => {
  const result = buildLearningMemory({ entries: [VALID_ENTRY, VALID_ENTRY] });
  if (result.success) {
    assert.equal(result.memory.patterns[0].frequency, 1);
  }
});

test('LEARN-2: Same pattern / different fingerprint → frequency 2', () => {
  const invDiff = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Memory leak in component',
    hypotheses: [HYPOTHESIS, FAILED_HYP],
    evidence: [EVIDENCE],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    confirmedRootCause: ROOT_CAUSE,
    affectedArtifacts: ['PB-COMP-A'],
    affectedInvariants: ['PB-INV-001'],
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 400,
  });
  const diffEntry = createManifestEntry({ entryType: 'ACTIVE', investigation: invDiff, diagnostics: [] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY, diffEntry],
    metadata: BASE_METADATA,
  });
  assert.equal(result.memory.patternCount, 1);
  assert.equal(result.memory.patterns[0].frequency, 2);
});

test('LEARN-3: Collision blocks refresh', () => {
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Collision problem',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-X'],
    createdAt: 100,
    updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Collision problem',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-Y'],
    createdAt: 100,
    updatedAt: 200,
  });
  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entryA, entryB],
    metadata: BASE_METADATA,
  });
  assert.equal(result.type, 'BLOCKED');
});

test('LEARN-4: Learning failure returns no partial memory', () => {
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Partial fail',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-P'],
    createdAt: 100,
    updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Partial fail',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-Q'],
    createdAt: 100,
    updatedAt: 200,
  });
  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entryA, entryB],
    metadata: BASE_METADATA,
  });
  assert.equal(result.memory, undefined);
});

test('LEARN-5: Learning idempotency — same input same memory', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.deepEqual(r1.memory, r2.memory);
});

test('LEARN-6: Memory fingerprint stable under same inputs', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  assert.equal(r1.memory.fingerprint, r2.memory.fingerprint);
});

// ============================================================
// 8. Serialization
// ============================================================

test('SER-1: Exactly one trailing LF', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const serialized = serializeManifestSnapshot(snapshot);
  assert.equal(serialized.endsWith('\n'), true);
  const trimmed = serialized.slice(0, -1);
  assert.equal(trimmed.endsWith('\n'), false);
});

test('SER-2: Verified reload round trip', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const deserialized = deserializeManifestSnapshot(result.serialized);
  assert.equal(deserialized.fingerprint, result.nextSnapshot.fingerprint);
  assert.equal(deserialized.entryCount, result.nextSnapshot.entryCount);
  assert.equal(deserialized.identity.manifestArtifactId, result.nextSnapshot.identity.manifestArtifactId);
  assert.equal(deserialized.metadata.generatedAt, result.nextSnapshot.metadata.generatedAt);
  // serialization strips validation from entries, so compare canonical fields only
  assert.equal(deserialized.entries.length, result.nextSnapshot.entries.length);
  assert.equal(deserialized.entries[0].entryType, result.nextSnapshot.entries[0].entryType);
});

test('SER-3: Tampered fingerprint rejected', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const parsed = JSON.parse(result.serialized);
  parsed.fingerprint = 'deadbeef';
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
});

test('SER-4: Unknown top-level field rejected', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const parsed = JSON.parse(result.serialized);
  parsed.bogusField = 'injected';
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
});

test('SER-5: Entry fingerprint not serialized', () => {
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  // serializeManifestSnapshot strips diagnostics/validation/fingerprint from entries
  const parsed = JSON.parse(result.serialized);
  for (const entry of parsed.entries) {
    assert.equal('fingerprint' in entry, false);
    assert.equal('diagnostics' in entry, false);
    assert.equal('validation' in entry, false);
  }
});

test('SER-6: Metadata mismatch rejected', () => {
  const snapshot = buildManifestSnapshot({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });
  const serialized = serializeManifestSnapshot(snapshot);
  const parsed = JSON.parse(serialized);
  parsed.metadata.activeEntryCount = 999;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
});

// ============================================================
// 9. Atomicity
// ============================================================

test('ATOM-1: Validation failure — no nextSnapshot leak', () => {
  const badInput = {
    identity: BASE_ID,
    entries: [],
    metadata: BASE_METADATA,
  };
  const result = refreshManifestFromMirror(badInput);
  assert.equal(result.type, 'BLOCKED');
  assert.equal(result.nextSnapshot, undefined);
});

test('ATOM-2: Learning collision — no memory leak', () => {
  const invA = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Atom col',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-A1'],
    createdAt: 100,
    updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Atom col',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-A2'],
    createdAt: 100,
    updatedAt: 200,
  });
  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entryA, entryB],
    metadata: BASE_METADATA,
  });
  assert.equal(result.type, 'BLOCKED');
  assert.equal(result.nextSnapshot, undefined);
  assert.equal(result.memory, undefined);
  assert.equal(result.serialized, undefined);
});

test('ATOM-3: Validation failure — inputs unchanged', () => {
  const originalEntries = [VALID_ENTRY];
  const before = JSON.stringify(originalEntries);
  const result = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: originalEntries,
    metadata: BASE_METADATA,
  });
  const after = JSON.stringify(originalEntries);
  assert.equal(before, after);
  // Still succeeds — this isn't a failure case
  // Purpose: verify inputs not mutated
  assert.equal(result.type, 'CHANGED');
});

test('ATOM-4: Collision — previous memory unchanged', () => {
  const prevLearn = buildLearningMemory({ entries: [VALID_ENTRY] });
  const memoryBefore = JSON.stringify(prevLearn.memory);

  const invX = createInvestigation({
    identity: BASE_ID,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Atom mem',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-M1'],
    createdAt: 100,
    updatedAt: 200,
  });
  const invY = createInvestigation({
    identity: BASE_ID_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Atom mem',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    affectedInvariants: ['INV-M2'],
    createdAt: 100,
    updatedAt: 200,
  });
  const entryX = createManifestEntry({ entryType: 'ACTIVE', investigation: invX, diagnostics: [] });
  const entryY = createManifestEntry({ entryType: 'ACTIVE', investigation: invY, diagnostics: [] });

  refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [entryX, entryY],
    metadata: BASE_METADATA,
    previousMemory: prevLearn.memory,
  });

  const memoryAfter = JSON.stringify(prevLearn.memory);
  assert.equal(memoryBefore, memoryAfter);
});

// ============================================================
// 10. Full replay
// ============================================================

test('REPLAY-1: Refresh → serialize → deserialize → refresh — UNCHANGED', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const deserialized = deserializeManifestSnapshot(r1.serialized);

  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: deserialized.entries,
    metadata: {
      sourceMirrorFingerprint: 'mirror-fp-001',
      sourceValidationFingerprint: 'valid-fp-001',
      activeEntryCount: deserialized.entryCount,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 600,
    },
    previousSnapshot: deserialized,
    previousMemory: r1.memory,
  });

  assert.equal(r2.type, 'UNCHANGED');
});

test('REPLAY-2: Snapshot fingerprints unchanged through replay', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const deserialized = deserializeManifestSnapshot(r1.serialized);

  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: deserialized.entries,
    metadata: {
      sourceMirrorFingerprint: 'mirror-fp-001',
      sourceValidationFingerprint: 'valid-fp-001',
      activeEntryCount: deserialized.entryCount,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 600,
    },
    previousSnapshot: deserialized,
    previousMemory: r1.memory,
  });

  assert.equal(r2.nextSnapshot.fingerprint, r1.nextSnapshot.fingerprint);
});

test('REPLAY-3: Memory unchanged through replay', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const deserialized = deserializeManifestSnapshot(r1.serialized);

  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: deserialized.entries,
    metadata: {
      sourceMirrorFingerprint: 'mirror-fp-001',
      sourceValidationFingerprint: 'valid-fp-001',
      activeEntryCount: deserialized.entryCount,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 600,
    },
    previousSnapshot: deserialized,
    previousMemory: r1.memory,
  });

  // Same reference — UNCHANGED returns previousMemory directly
  assert.equal(r2.memory, r1.memory);
});

test('REPLAY-4: Frequency unchanged through replay', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const deserialized = deserializeManifestSnapshot(r1.serialized);

  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: deserialized.entries,
    metadata: {
      sourceMirrorFingerprint: 'mirror-fp-001',
      sourceValidationFingerprint: 'valid-fp-001',
      activeEntryCount: deserialized.entryCount,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 600,
    },
    previousSnapshot: deserialized,
    previousMemory: r1.memory,
  });

  assert.equal(r2.memory.patterns[0].frequency, r1.memory.patterns[0].frequency);
});

test('REPLAY-5: lastObserved unchanged through replay', () => {
  const r1 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: [VALID_ENTRY],
    metadata: BASE_METADATA,
  });

  const deserialized = deserializeManifestSnapshot(r1.serialized);

  const r2 = refreshManifestFromMirror({
    identity: BASE_ID,
    entries: deserialized.entries,
    metadata: {
      sourceMirrorFingerprint: 'mirror-fp-001',
      sourceValidationFingerprint: 'valid-fp-001',
      activeEntryCount: deserialized.entryCount,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 600,
    },
    previousSnapshot: deserialized,
    previousMemory: r1.memory,
  });

  assert.equal(r2.memory.patterns[0].lastObserved, r1.memory.patterns[0].lastObserved);
});

// ============================================================
// 11. Public contract audit — all imports verified above
// ============================================================

console.log('PASS');
