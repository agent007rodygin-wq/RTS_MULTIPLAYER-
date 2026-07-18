import assert from 'node:assert/strict';
import {
  serializeManifestSnapshot,
  deserializeManifestSnapshot,
  loadManifestSnapshot,
  exportManifestSummary,
} from '../../src/project-brain/manifest-serialization.ts';
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

// ============================================================
// Fixtures
// ============================================================

const BASE_IDENTITY = createManifestIdentity({
  manifestArtifactId: 'PB-DM-001',
  manifestRevision: 'rev-001',
  investigationId: 'PB-INV-001',
  repositoryRevision: 'abc123def',
  freshness: 1000,
});

const VALID_HYPOTHESIS = createHypothesis({
  hypothesisId: 'PB-HYP-001',
  description: 'Memory leak hypothesis',
  author: 'dev-1',
  confidence: 0.85,
  timestamp: 100,
});

const VALID_EVIDENCE = createEvidenceItem({
  evidenceId: 'PB-EVID-001',
  evidenceType: 'SOURCE_INSPECTION',
  description: 'Found unsubscribed handler',
  sourceRevision: 'rev-a1b2c3',
  observation: 'Missing cleanup in useEffect',
  timestamp: 200,
});

const VALID_ROOTCAUSE = createRootCause({
  rootCauseId: 'PB-RC-001',
  description: 'Missing cleanup in useEffect',
  confidence: 0.95,
  supportingEvidence: ['PB-EVID-001'],
  affectedArtifacts: ['PB-COMP-A'],
  affectedInvariants: [],
  validationStatus: 'CONFIRMED',
  alternativeExplanations: ['Timing issue'],
  remainingUncertainty: 'No other root cause found',
});

const VALID_RESOLUTION = createResolution({
  resolutionId: 'PB-RES-001',
  chosenApproach: 'Added cleanup return in useEffect',
  reasonForChoice: 'Standard React pattern',
  expectedOutcome: 'No more memory leaks',
  risks: ['Regression in edge case'],
  requiredValidation: ['Verify with profiler'],
});

const VALID_INVESTIGATION = createInvestigation({
  identity: BASE_IDENTITY,
  lifecycleState: 'RESOLVED',
  problemStatement: 'Root cause for production bug P-123',
  observedSymptoms: ['Memory leak', 'High CPU'],
  reproductionSteps: ['Open component', 'Navigate away'],
  assumptions: ['React 18'],
  hypotheses: [VALID_HYPOTHESIS],
  evidence: [VALID_EVIDENCE],
  failedHypotheses: [],
  confirmedRootCause: VALID_ROOTCAUSE,
  affectedArtifacts: ['PB-COMP-A'],
  affectedSourceFiles: ['src/components/MyComponent.tsx'],
  affectedInvariants: ['PB-INV-SUB-001'],
  risks: ['Regression'],
  finalResolution: VALID_RESOLUTION,
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

const VALID_SNAPSHOT = buildManifestSnapshot({
  identity: BASE_IDENTITY,
  entries: [VALID_ENTRY],
  metadata: {
    sourceMirrorFingerprint: 'mirror-fp-001',
    sourceValidationFingerprint: 'valid-fp-001',
    activeEntryCount: 0,
    archivedEntryCount: 0,
    supersededEntryCount: 0,
    unresolvedEntryCount: 0,
    generatedAt: 500,
  },
});

// ============================================================
// 1. Round trip — valid manifest via deserializeManifestSnapshot
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized);
  assert.equal(typeof serialized, 'string');
  assert.equal(parsed.fingerprint, VALID_SNAPSHOT.fingerprint);
  assert.equal(parsed.entryCount, 1);
  assert.equal(parsed.identity.manifestArtifactId, 'PB-DM-001');
  assert.equal(Object.isFrozen(parsed), true);
}

// ============================================================
// 2. Round trip — full cycle: deserialize → load → semantic equality
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const loaded = loadManifestSnapshot(serialized);
  assert.equal(loaded.fingerprint, VALID_SNAPSHOT.fingerprint);
  assert.equal(loaded.entryCount, VALID_SNAPSHOT.entryCount);
  assert.equal(loaded.identity.manifestArtifactId, VALID_SNAPSHOT.identity.manifestArtifactId);
  assert.equal(Object.isFrozen(loaded), true);
}

// ============================================================
// 3. Round trip — serialize(parse(serialize(snapshot))) identical
// ============================================================

{
  const serialized1 = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized1);
  const serialized2 = serializeManifestSnapshot(parsed);
  assert.equal(serialized1, serialized2);
}

// ============================================================
// 4. Fingerprint preserved through round trip
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const loaded = loadManifestSnapshot(serialized);
  assert.equal(loaded.fingerprint, VALID_SNAPSHOT.fingerprint);
}

// ============================================================
// 5. Canonical ordering preserved
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const loaded = loadManifestSnapshot(serialized);
  assert.equal(loaded.entries.length, 1);
  assert.equal(loaded.entries[0].entryType, 'ACTIVE');
}

// ============================================================
// 6. Audit timestamps preserved in serialized output
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  assert.ok(serialized.includes('"createdAt"'));
  assert.ok(serialized.includes('"updatedAt"'));
  assert.ok(serialized.includes('"generatedAt"'));
  assert.ok(serialized.includes('"timestamp"'));
}

// ============================================================
// 7. Determinism — repeated call
// ============================================================

{
  const str1 = serializeManifestSnapshot(VALID_SNAPSHOT);
  const str2 = serializeManifestSnapshot(VALID_SNAPSHOT);
  assert.equal(str1, str2);
}

// ============================================================
// 8. Determinism — reordered entries produce same output
// ============================================================

{
  const inv2 = createInvestigation({
    identity: createManifestIdentity({
      manifestArtifactId: 'PB-DM-002',
      manifestRevision: 'rev-002',
      investigationId: 'PB-INV-002',
      repositoryRevision: 'def456',
      freshness: 2000,
    }),
    lifecycleState: 'RESOLVED',
    problemStatement: 'Second problem',
    hypotheses: [],
    evidence: [],
    createdAt: 200,
    updatedAt: 300,
  });

  const entry2 = createManifestEntry({
    entryType: 'ARCHIVED',
    investigation: inv2,
    diagnostics: [],
  });

  const snapshot1 = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [VALID_ENTRY, entry2],
    metadata: {
      sourceMirrorFingerprint: 'fp',
      sourceValidationFingerprint: 'fp',
      activeEntryCount: 0,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 100,
    },
  });

  const snapshot2 = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [entry2, VALID_ENTRY],
    metadata: {
      sourceMirrorFingerprint: 'fp',
      sourceValidationFingerprint: 'fp',
      activeEntryCount: 0,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 200,
    },
  });

  assert.equal(snapshot1.fingerprint, snapshot2.fingerprint);
}

// ============================================================
// 9. Fail closed — malformed JSON
// ============================================================

{
  assert.throws(() => {
    deserializeManifestSnapshot('not-json{{{');
  });
}

// ============================================================
// 10. Fail closed — null input (non-string)
// ============================================================

{
  assert.throws(() => {
    deserializeManifestSnapshot(null);
  });
  assert.throws(() => {
    loadManifestSnapshot(null);
  });
}

// ============================================================
// 11. Fail closed — array root
// ============================================================

{
  assert.throws(() => {
    deserializeManifestSnapshot('[]');
  });
}

// ============================================================
// 12. Fail closed — missing required field
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  delete parsed.entries;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 13. Fail closed — unknown lifecycle (Phase 1 validation rejects)
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.entries[0].investigation.lifecycleState = 'UNKNOWN_STATE';
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 14. Fail closed — fingerprint mismatch
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.fingerprint = 'deadbeef';
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 15. Immutability — mutation after parse
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized);
  assert.equal(Object.isFrozen(parsed), true);
  assert.equal(Object.isFrozen(parsed.identity), true);
  assert.equal(Object.isFrozen(parsed.entries), true);
  assert.equal(Object.isFrozen(parsed.metadata), true);
}

// ============================================================
// 16. Immutability — nested arrays frozen
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized);
  for (const entry of parsed.entries) {
    assert.equal(Object.isFrozen(entry.investigation.hypotheses), true);
    assert.equal(Object.isFrozen(entry.investigation.evidence), true);
  }
}

// ============================================================
// 17. Immutability — loaded snapshot frozen
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const loaded = loadManifestSnapshot(serialized);
  assert.equal(Object.isFrozen(loaded), true);
  assert.equal(Object.isFrozen(loaded.entries), true);
  assert.equal(Object.isFrozen(loaded.entries[0]), true);
}

// ============================================================
// 18. exportManifestSummary
// ============================================================

{
  const summary = exportManifestSummary(VALID_SNAPSHOT);
  assert.equal(typeof summary, 'string');
  assert.ok(summary.includes('PB-DM-001'));
  assert.ok(summary.includes('rev-001'));
}

// ============================================================
// 19. Fail closed — wrong primitive type for lifecycleState
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.entries[0].investigation.lifecycleState = 42;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 20. Fail closed — mutation of input after serialization
// ============================================================

{
  const mutableSnapshot = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [VALID_ENTRY],
    metadata: {
      sourceMirrorFingerprint: 'fp',
      sourceValidationFingerprint: 'fp',
      activeEntryCount: 0,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 100,
    },
  });

  const serialized = serializeManifestSnapshot(mutableSnapshot);
  const loaded = deserializeManifestSnapshot(serialized);
  assert.equal(loaded.fingerprint, mutableSnapshot.fingerprint);
}

// ============================================================
// 21. Fail closed — unknown top-level field rejected
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.unknownTopLevelField = 'extra';
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 22. Fail closed — unknown nested field rejected
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.identity.unknownField = 'extra';
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 23. Fail closed — entryCount mismatch
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.entryCount = 999;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 24. Fail closed — metadata derived count mismatch (active)
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.metadata.activeEntryCount = 999;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 25. Fail closed — metadata derived count mismatch (archived)
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.metadata.archivedEntryCount = 999;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 26. Fail closed — metadata derived count mismatch (superseded)
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = JSON.parse(serialized);
  parsed.metadata.supersededEntryCount = 999;
  assert.throws(() => {
    deserializeManifestSnapshot(JSON.stringify(parsed));
  });
}

// ============================================================
// 27. Exactly one trailing newline
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  // stableStringify returns with trailing \n, serialize does not add another
  assert.equal(serialized.endsWith('\n'), true);
  // Ensure it's exactly one trailing newline, not two
  const trimmed = serialized.slice(0, -1);
  assert.equal(trimmed.endsWith('\n'), false);
}

// ============================================================
// 28. Byte-stable round trip
// ============================================================

{
  const serialized1 = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized1);
  const serialized2 = serializeManifestSnapshot(parsed);
  assert.equal(serialized1, serialized2);
}

// ============================================================
// 29. Full-fidelity round trip (audit fields preserved)
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized);
  // Audit timestamps in investigation
  assert.equal(parsed.entries[0].investigation.createdAt, 100);
  assert.equal(parsed.entries[0].investigation.updatedAt, 200);
  // generatedAt in metadata
  assert.equal(parsed.metadata.generatedAt, 500);
}

// ============================================================
// 30. Phase 1 validation failure rejected
// ============================================================

{
  // Root cause without supporting evidence triggers Phase 1 ERROR
  const rcNoEvidence = createRootCause({
    rootCauseId: 'PB-RC-NOEVID',
    description: 'RC without evidence',
    confidence: 0.9,
    supportingEvidence: [],
    validationStatus: 'CONFIRMED',
  });
  const invalidInv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'A problem',
    evidence: [VALID_EVIDENCE],
    confirmedRootCause: rcNoEvidence,
    finalResolution: VALID_RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const invalidEntry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: invalidInv,
    diagnostics: [],
  });
  const invalidSnapshot = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [invalidEntry],
    metadata: {
      sourceMirrorFingerprint: 'fp',
      sourceValidationFingerprint: 'fp',
      activeEntryCount: 0,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 100,
    },
  });
  const ser = serializeManifestSnapshot(invalidSnapshot);
  assert.throws(() => {
    deserializeManifestSnapshot(ser);
  });
}

// ============================================================
// 31. Output deeply frozen after deserialize
// ============================================================

{
  const serialized = serializeManifestSnapshot(VALID_SNAPSHOT);
  const parsed = deserializeManifestSnapshot(serialized);
  assert.equal(Object.isFrozen(parsed), true);
  assert.equal(Object.isFrozen(parsed.entries), true);
  assert.equal(Object.isFrozen(parsed.entries[0]), true);
  assert.equal(Object.isFrozen(parsed.entries[0].investigation), true);
  assert.equal(Object.isFrozen(parsed.metadata), true);
}

// ============================================================
// 32. Input not mutated after serialize
// ============================================================

{
  const snap = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [VALID_ENTRY],
    metadata: {
      sourceMirrorFingerprint: 'fp',
      sourceValidationFingerprint: 'fp',
      activeEntryCount: 0,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 100,
    },
  });
  const originalFingerprint = snap.fingerprint;
  serializeManifestSnapshot(snap);
  assert.equal(snap.fingerprint, originalFingerprint);
}
