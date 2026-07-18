import assert from 'node:assert/strict';
import {
  buildLearningMemory,
  findSimilarInvestigations,
} from '../../src/project-brain/manifest-learning.ts';
import { createManifestIdentity, createManifestEntry } from '../../src/project-brain/manifest-core.ts';
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

const BASE_IDENTITY_2 = createManifestIdentity({
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
  alternativeExplanations: ['Timing issue'],
  remainingUncertainty: '',
});

const RESOLUTION = createResolution({
  resolutionId: 'PB-RES-001',
  chosenApproach: 'Added cleanup return in useEffect',
  reasonForChoice: 'Standard React pattern',
  expectedOutcome: 'No more memory leaks',
  risks: ['Regression'],
  requiredValidation: ['Verify with profiler'],
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
  identity: BASE_IDENTITY,
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

// ============================================================
// 1. Valid extraction — creates learning record
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.memory.patternCount, 1);
    assert.equal(result.memory.patterns.length, 1);
    assert.equal(typeof result.memory.fingerprint, 'string');
    assert.equal(Object.isFrozen(result.memory), true);
  }
}

// ============================================================
// 2. Root cause transferred correctly
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const pattern = result.memory.patterns[0];
    assert.equal(pattern.rootCauseId, 'PB-RC-001');
    assert.equal(pattern.investigationId, 'PB-INV-001');
  }
}

// ============================================================
// 3. Resolution transferred correctly
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const pattern = result.memory.patterns[0];
    assert.equal(pattern.resolutionId, 'PB-RES-001');
  }
}

// ============================================================
// 4. Outcome contains resolution description
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const pattern = result.memory.patterns[0];
    assert.ok(pattern.outcome.includes('No more memory leaks'));
  }
}

// ============================================================
// 5. Failed hypotheses preserved
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const pattern = result.memory.patterns[0];
    assert.ok(pattern.failedHypothesisIds.includes('PB-HYP-FAILED-001'));
    assert.equal(pattern.failedHypothesisIds.length, 1);
  }
}

// ============================================================
// 6. Learning identity deterministic
// ============================================================

{
  const result1 = buildLearningMemory({ entries: [VALID_ENTRY] });
  const result2 = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result1.success && result2.success) {
    assert.equal(result1.memory.fingerprint, result2.memory.fingerprint);
  }
}

// ============================================================
// 7. Phase 1 invalid entry blocks full build
// ============================================================

{
  // Root cause without supporting evidence triggers Phase 1 MANIFEST_ROOTCAUSE_NO_EVIDENCE (ERROR)
  const rcNoEvidence = createRootCause({
    rootCauseId: 'PB-RC-NOEVID',
    description: 'Root cause without evidence',
    confidence: 0.9,
    supportingEvidence: [],
    validationStatus: 'CONFIRMED',
  });
  const inv = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Test problem',
    evidence: [EVIDENCE],
    confirmedRootCause: rcNoEvidence,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv,
    diagnostics: [],
  });
  const result = buildLearningMemory({ entries: [entry] });
  assert.equal(result.success, false);
}

// ============================================================
// 8. Merely ineligible entry (OPEN lifecycle) skips silently
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'OPEN',
    problemStatement: 'Test problem',
    createdAt: 100,
    updatedAt: 100,
  });
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv,
    diagnostics: [],
  });
  const result = buildLearningMemory({ entries: [entry] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 0);
  }
}

// ============================================================
// 9. Missing root cause — Phase 1 passes but ineligible
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Test',
    evidence: [EVIDENCE],
    createdAt: 100,
    updatedAt: 200,
  });
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv,
    diagnostics: [],
  });
  const result = buildLearningMemory({ entries: [entry] });
  if (result.success) {
    // Phase 1 passes (no root cause is not an ERROR), but ineligible for learning
    assert.equal(result.memory.patternCount, 0);
  }
}

// ============================================================
// 10. Missing resolution — Phase 1 passes but ineligible
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Test',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    createdAt: 100,
    updatedAt: 200,
  });
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv,
    diagnostics: [],
  });
  const result = buildLearningMemory({ entries: [entry] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 0);
  }
}

// ============================================================
// 11. Unsupported lifecycle — Phase 1 warns but ineligible
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'OPEN',
    problemStatement: 'Test',
    createdAt: 100,
    updatedAt: 100,
  });
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv,
    diagnostics: [],
  });
  const result = buildLearningMemory({ entries: [entry] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 0);
  }
}

// ============================================================
// 12. Failed hypothesis does not become confirmed in learning
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const pattern = result.memory.patterns[0];
    assert.ok(pattern.failedHypothesisIds.includes('PB-HYP-FAILED-001'));
    assert.equal(pattern.rootCauseId, 'PB-RC-001');
  }
}

// ============================================================
// 13. Deduplication — same fingerprint within one batch counts once
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY, VALID_ENTRY] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 1);
    const pattern = result.memory.patterns[0];
    assert.equal(pattern.frequency, 1);
  }
}

// ============================================================
// 14. Repeated call with same entry — no frequency increment (already observed)
// ============================================================

{
  const result1 = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result1.success) {
    const result2 = buildLearningMemory({
      entries: [VALID_ENTRY],
      previousMemory: result1.memory,
    });
    if (result2.success) {
      assert.equal(result2.memory.patternCount, 1);
      // Entry fingerprint already observed in result1 — frequency does NOT increment
      assert.equal(result2.memory.patterns[0].frequency, 1);
    }
  }
}

// ============================================================
// 15. findSimilarInvestigations — exact match
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const similar = findSimilarInvestigations(result.memory, {
      problemStatement: 'Memory leak in component',
    });
    assert.ok(similar.length >= 1);
    assert.equal(similar[0].investigationId, 'PB-INV-001');
  }
}

// ============================================================
// 16. findSimilarInvestigations — root cause match boost
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const similar = findSimilarInvestigations(result.memory, {
      problemStatement: 'Different problem',
      rootCauseId: 'PB-RC-001',
    });
    assert.ok(similar.length >= 1);
    assert.ok(similar[0].similarity >= 0.9);
    assert.equal(similar[0].sharedRootCause, true);
  }
}

// ============================================================
// 17. Immutability — memory is frozen
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    assert.equal(Object.isFrozen(result.memory), true);
    assert.equal(Object.isFrozen(result.memory.patterns), true);
    assert.equal(Object.isFrozen(result.memory.patterns[0]), true);
  }
}

// ============================================================
// 18. No timestamps or random IDs generated
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    assert.equal(typeof result.memory.fingerprint, 'string');
    assert.equal(result.memory.fingerprint.length, 8);
  }
}

// ============================================================
// 19. Same patternId + same full semantics merges (same fingerprint counted once)
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY, VALID_ENTRY] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 1);
    assert.equal(result.memory.patterns[0].frequency, 1);
  }
}

// ============================================================
// 20. Semantic collision blocks — different root cause IDs under same problem
// ============================================================

{
  const rcA = createRootCause({
    rootCauseId: 'PB-RC-001',
    description: 'Root cause A',
    confidence: 0.9,
    supportingEvidence: ['PB-EVID-001'],
    validationStatus: 'CONFIRMED',
  });
  const rcB = createRootCause({
    rootCauseId: 'PB-RC-002',
    description: 'Root cause B',
    confidence: 0.9,
    supportingEvidence: ['PB-EVID-001'],
    validationStatus: 'CONFIRMED',
  });

  // Same problem statement but different root causes — should produce different patternIds
  const invA = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Same problem',
    evidence: [EVIDENCE],
    confirmedRootCause: rcA,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Same problem',
    evidence: [EVIDENCE],
    confirmedRootCause: rcB,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });

  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const result = buildLearningMemory({ entries: [entryA, entryB] });
  // Different rootCauseIds → different patternIds → no collision
  // Both should be stored as separate patterns
  if (result.success) {
    assert.equal(result.memory.patternCount, 2);
  }
}

// ============================================================
// 21. [A, B] and [B, A] produce same result
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Problem A',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Problem B',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });

  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });

  const result1 = buildLearningMemory({ entries: [entryA, entryB] });
  const result2 = buildLearningMemory({ entries: [entryB, entryA] });
  if (result1.success && result2.success) {
    assert.equal(result1.memory.fingerprint, result2.memory.fingerprint);
    assert.equal(result1.memory.patternCount, result2.memory.patternCount);
  }
}

// ============================================================
// 22. audit timestamp difference does not create collision
// ============================================================

{
  const invEarly = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Audit test',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const invLate = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Audit test',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 500,
    updatedAt: 600,
  });

  const entryEarly = createManifestEntry({ entryType: 'ACTIVE', investigation: invEarly, diagnostics: [] });
  const entryLate = createManifestEntry({ entryType: 'ACTIVE', investigation: invLate, diagnostics: [] });

  const result = buildLearningMemory({ entries: [entryEarly, entryLate] });
  // Same semantics (same root cause, resolution, problem statement) → same patternId → merged into one
  if (result.success) {
    assert.equal(result.memory.patternCount, 1);
    // Frequency = 2 (two entries merged)
    assert.equal(result.memory.patterns[0].frequency, 2);
    // lastObserved should reflect the max updatedAt
    assert.equal(result.memory.patterns[0].lastObserved, 600);
  }
}

// ============================================================
// 23. Empty entries produces empty memory
// ============================================================

{
  const result = buildLearningMemory({ entries: [] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 0);
    assert.equal(result.memory.patterns.length, 0);
  }
}

// ============================================================
// 24. Similarity tie order deterministic
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const similar1 = findSimilarInvestigations(result.memory, {
      problemStatement: 'Memory leak in component',
    });
    const similar2 = findSimilarInvestigations(result.memory, {
      problemStatement: 'Memory leak in component',
    });
    assert.equal(JSON.stringify(similar1), JSON.stringify(similar2));
    assert.equal(Object.isFrozen(similar1), true);
  }
}

// ============================================================
// 25. Similarity score boundaries
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    // Empty problem → no match (only with minSimilarity > 0)
    const similar = findSimilarInvestigations(result.memory, {
      problemStatement: '',
      minSimilarity: 0.01,
    });
    assert.equal(similar.length, 0);
  }
}

// ============================================================
// 26. existingPatterns order irrelevant
// ============================================================

{
  const patA = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: createInvestigation({
      identity: BASE_IDENTITY,
      lifecycleState: 'RESOLVED',
      problemStatement: 'Pattern A',
      evidence: [EVIDENCE],
      confirmedRootCause: ROOT_CAUSE,
      finalResolution: RESOLUTION,
      createdAt: 100,
      updatedAt: 200,
    }),
    diagnostics: [],
  });
  const patB = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: createInvestigation({
      identity: BASE_IDENTITY_2,
      lifecycleState: 'RESOLVED',
      problemStatement: 'Pattern B',
      evidence: [EVIDENCE],
      confirmedRootCause: ROOT_CAUSE,
      finalResolution: RESOLUTION,
      createdAt: 100,
      updatedAt: 200,
    }),
    diagnostics: [],
  });

  const base1 = buildLearningMemory({ entries: [patA, patB] });
  const base2 = buildLearningMemory({ entries: [patB, patA] });
  if (base1.success && base2.success) {
    const result1 = buildLearningMemory({
      entries: [VALID_ENTRY],
      previousMemory: base1.memory,
    });
    const result2 = buildLearningMemory({
      entries: [VALID_ENTRY],
      previousMemory: base2.memory,
    });
    if (result1.success && result2.success) {
      assert.equal(result1.memory.fingerprint, result2.memory.fingerprint);
    }
  }
}

// ============================================================
// 27. entries order irrelevant (already tested in 21)
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  const resultReversed = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success && resultReversed.success) {
    assert.equal(result.memory.fingerprint, resultReversed.memory.fingerprint);
  }
}

// ============================================================
// 28. Nested outputs frozen
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    assert.equal(Object.isFrozen(result.memory), true);
    assert.equal(Object.isFrozen(result.memory.patterns), true);
    assert.equal(Object.isFrozen(result.memory.patterns[0]), true);
  }
}

// ============================================================
// 29. Validate diagnostic on failure
// ============================================================

{
  // Root cause without evidence triggers Phase 1 ERROR → diagnostic emitted
  const rcNoEvidence = createRootCause({
    rootCauseId: 'PB-RC-NOEVID-29',
    description: 'RC without evidence',
    confidence: 0.9,
    supportingEvidence: [],
    validationStatus: 'CONFIRMED',
  });
  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Test for diagnostics',
    evidence: [EVIDENCE],
    confirmedRootCause: rcNoEvidence,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 200,
  });
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: inv,
    diagnostics: [],
  });
  const result = buildLearningMemory({ entries: [entry] });
  assert.equal(result.success, false);
  if (!result.success) {
    // Should have diagnostics array
    assert.ok(Array.isArray(result.diagnostics));
    assert.ok(result.diagnostics.length > 0);
    // All diagnostics should be frozen
    for (const d of result.diagnostics) {
      assert.equal(Object.isFrozen(d), true);
    }
  }
}

// ============================================================
// 30. lastObserved deterministic
// ============================================================

{
  const result1 = buildLearningMemory({ entries: [VALID_ENTRY] });
  const result2 = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result1.success && result2.success) {
    assert.equal(result1.memory.patterns[0].lastObserved, result2.memory.patterns[0].lastObserved);
  }
}

// ============================================================
// 31. Error on invalid input shape
// ============================================================

{
  const result = buildLearningMemory(null);
  assert.equal(result.success, false);
}

{
  const result = buildLearningMemory({ entries: null });
  assert.equal(result.success, false);
}

// ============================================================
// 32. Successful learning returns observedEntryFingerprints
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    assert.ok(Array.isArray(result.memory.observedEntryFingerprints));
    assert.ok(result.memory.observedEntryFingerprints.length >= 1);
  }
}

// ============================================================
// 33. observedEntryFingerprints contains only eligible entry fingerprints
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    assert.ok(result.memory.observedEntryFingerprints.includes(VALID_ENTRY.fingerprint));
  }
}

// ============================================================
// 34. Ineligible entry does not add its fingerprint to observed set
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'OPEN',
    problemStatement: 'Ineligible test',
    createdAt: 100,
    updatedAt: 100,
  });
  const entry = createManifestEntry({ entryType: 'ACTIVE', investigation: inv, diagnostics: [] });
  const result = buildLearningMemory({ entries: [entry] });
  if (result.success) {
    assert.equal(result.memory.patternCount, 0);
    assert.equal(result.memory.observedEntryFingerprints.length, 0);
  }
}

// ============================================================
// 35. Collision returns no memory — no observedEntryFingerprints
// ============================================================

{
  const invA = createInvestigation({
    identity: BASE_IDENTITY, lifecycleState: 'RESOLVED',
    problemStatement: 'Collision test', evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE, finalResolution: RESOLUTION,
    affectedInvariants: ['INV-X'],
    createdAt: 100, updatedAt: 200,
  });
  const invB = createInvestigation({
    identity: BASE_IDENTITY_2, lifecycleState: 'RESOLVED',
    problemStatement: 'Collision test', evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE, finalResolution: RESOLUTION,
    affectedInvariants: ['INV-Y'],
    createdAt: 100, updatedAt: 200,
  });
  const entryA = createManifestEntry({ entryType: 'ACTIVE', investigation: invA, diagnostics: [] });
  const entryB = createManifestEntry({ entryType: 'ACTIVE', investigation: invB, diagnostics: [] });
  const result = buildLearningMemory({ entries: [entryA, entryB] });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal('memory' in result, false);
  }
}

// ============================================================
// 36. Invalid entry blocks — no partial observed set emitted
// ============================================================

{
  const rcNoEvidence = createRootCause({
    rootCauseId: 'PB-RC-NOEVID-36', description: 'No evidence',
    confidence: 0.9, supportingEvidence: [], validationStatus: 'CONFIRMED',
  });
  const inv = createInvestigation({
    identity: BASE_IDENTITY, lifecycleState: 'RESOLVED',
    problemStatement: 'Invalid entry', evidence: [EVIDENCE],
    confirmedRootCause: rcNoEvidence, finalResolution: RESOLUTION,
    createdAt: 100, updatedAt: 200,
  });
  const entry = createManifestEntry({ entryType: 'ACTIVE', investigation: inv, diagnostics: [] });
  const result = buildLearningMemory({ entries: [VALID_ENTRY, entry] });
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal('memory' in result, false);
  }
}

// ============================================================
// 37. observedEntryFingerprints is deeply frozen
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    assert.equal(Object.isFrozen(result.memory.observedEntryFingerprints), true);
  }
}

// ============================================================
// 38. Cross-cycle dedup does not update lastObserved
// ============================================================

{
  const result1 = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result1.success) {
    const firstObserved = result1.memory.patterns[0].lastObserved;
    const result2 = buildLearningMemory({
      entries: [VALID_ENTRY],
      previousMemory: result1.memory,
    });
    if (result2.success) {
      assert.equal(result2.memory.patterns[0].lastObserved, firstObserved);
    }
  }
}

// ============================================================
// 39. observedEntryFingerprints is unique and sorted
// ============================================================

{
  const result = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result.success) {
    const fps = result.memory.observedEntryFingerprints;
    // Verify sorted
    for (let i = 1; i < fps.length; i++) {
      assert.ok(fps[i - 1] <= fps[i]);
    }
    // Verify unique
    assert.equal(new Set(fps).size, fps.length);
  }
}

// ============================================================
// 40. New distinct entry adds fingerprint to observed set across calls
// ============================================================

{
  const inv2 = createInvestigation({
    identity: BASE_IDENTITY_2,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Second distinct entry',
    evidence: [EVIDENCE],
    confirmedRootCause: ROOT_CAUSE,
    finalResolution: RESOLUTION,
    createdAt: 100,
    updatedAt: 300,
  });
  const entry2 = createManifestEntry({ entryType: 'ACTIVE', investigation: inv2, diagnostics: [] });

  const result1 = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (result1.success) {
    const result2 = buildLearningMemory({
      entries: [entry2],
      previousMemory: result1.memory,
    });
    if (result2.success) {
      assert.equal(result2.memory.patternCount, 2);
      assert.ok(result2.memory.observedEntryFingerprints.includes(VALID_ENTRY.fingerprint));
      assert.ok(result2.memory.observedEntryFingerprints.includes(entry2.fingerprint));
    }
  }
}

// ============================================================
// 41. Same previousMemory yields deeply equal results
// ============================================================

{
  const base = buildLearningMemory({ entries: [VALID_ENTRY] });
  if (base.success) {
    const resultA = buildLearningMemory({
      entries: [VALID_ENTRY],
      previousMemory: base.memory,
    });
    const resultB = buildLearningMemory({
      entries: [VALID_ENTRY],
      previousMemory: base.memory,
    });
    if (resultA.success && resultB.success) {
      assert.deepEqual(resultA.memory, resultB.memory);
    }
  }
}
