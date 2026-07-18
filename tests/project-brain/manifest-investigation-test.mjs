import assert from 'node:assert/strict';
import {
  createInvestigation,
  createHypothesis,
  createEvidenceItem,
  createRootCause,
  createResolution,
  updateInvestigationLifecycle,
} from '../../src/project-brain/manifest-investigation.ts';
import { createManifestIdentity } from '../../src/project-brain/manifest-core.ts';

const BASE_IDENTITY = createManifestIdentity({
  manifestArtifactId: 'PB-DM-001',
  manifestRevision: 'rev-001',
  investigationId: 'PB-INV-001',
  repositoryRevision: 'abc123def',
  freshness: 1000,
});

// ============================================================
// 1. Investigation creation
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'OPEN',
    problemStatement: 'Root cause for production bug P-123',
    createdAt: 100,
    updatedAt: 100,
  });
  assert.equal(inv.problemStatement, 'Root cause for production bug P-123');
  assert.equal(inv.lifecycleState, 'OPEN');
  assert.equal(inv.createdAt, 100);
  assert.equal(inv.updatedAt, 100);
  assert.deepEqual(inv.hypotheses, []);
  assert.deepEqual(inv.evidence, []);
  assert.equal(inv.confirmedRootCause, undefined);
  assert.equal(inv.finalResolution, undefined);
  assert.equal(Object.isFrozen(inv), true);
  assert.equal(inv.identity.manifestArtifactId, 'PB-DM-001');
}

// ============================================================
// 2. Hypothesis creation
// ============================================================

{
  const hyp = createHypothesis({
    hypothesisId: 'PB-HYP-001',
    description: 'Memory leak in event subscription',
    author: 'developer-1',
    confidence: 0.85,
    timestamp: 200,
  });
  assert.equal(hyp.hypothesisId, 'PB-HYP-001');
  assert.equal(hyp.confidence, 0.85);
  assert.equal(Object.isFrozen(hyp), true);
}

// Fail-closed: empty hypothesisId
{
  assert.throws(() => {
    createHypothesis({
      hypothesisId: '',
      description: 'test',
      author: 'dev',
      confidence: 0.5,
      timestamp: 100,
    });
  });
}

// Fail-closed: confidence out of range (too high)
{
  assert.throws(() => {
    createHypothesis({
      hypothesisId: 'PB-HYP-002',
      description: 'test',
      author: 'dev',
      confidence: 1.5,
      timestamp: 100,
    });
  });
}

// Fail-closed: confidence out of range (too low)
{
  assert.throws(() => {
    createHypothesis({
      hypothesisId: 'PB-HYP-003',
      description: 'test',
      author: 'dev',
      confidence: -0.1,
      timestamp: 100,
    });
  });
}

// ============================================================
// 3. Evidence creation
// ============================================================

{
  const ev = createEvidenceItem({
    evidenceId: 'PB-EVID-001',
    evidenceType: 'SOURCE_INSPECTION',
    description: 'Found unsubscribed event handler',
    sourceRevision: 'rev-a1b2c3',
    observation: 'ComponentWillUnmount missing cleanup',
    timestamp: 300,
  });
  assert.equal(ev.evidenceId, 'PB-EVID-001');
  assert.equal(ev.evidenceType, 'SOURCE_INSPECTION');
  assert.equal(Object.isFrozen(ev), true);
}

// Fail-closed: empty evidenceId
{
  assert.throws(() => {
    createEvidenceItem({
      evidenceId: '',
      evidenceType: 'SOURCE_INSPECTION',
      description: 'test',
      sourceRevision: 'rev-001',
      observation: 'obs',
      timestamp: 100,
    });
  });
}

// Fail-closed: invalid evidenceType
{
  assert.throws(() => {
    createEvidenceItem({
      evidenceId: 'PB-EVID-002',
      evidenceType: 'UNKNOWN_TYPE',
      description: 'test',
      sourceRevision: 'rev-001',
      observation: 'obs',
      timestamp: 100,
    });
  });
}

// ============================================================
// 3b. M-03: Defensive copy for RootCause
// ============================================================

// Mutable RootCause object — mutation after createInvestigation does not affect investigation
{
  const mutableRc = {
    rootCauseId: 'RC-001',
    description: 'Original root cause',
    confidence: 0.9,
    supportingEvidence: ['EVID-001'],
    affectedArtifacts: ['COMP-A'],
    affectedInvariants: [],
    validationStatus: 'CONFIRMED',
    alternativeExplanations: [],
    remainingUncertainty: '',
  };

  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Defensive copy test',
    confirmedRootCause: mutableRc,
    createdAt: 100,
    updatedAt: 200,
  });

  assert.equal(inv.confirmedRootCause.rootCauseId, 'RC-001');
  assert.equal(inv.confirmedRootCause.description, 'Original root cause');

  // Mutate original
  mutableRc.description = 'Mutated root cause';

  // Investigation should be unchanged
  assert.equal(inv.confirmedRootCause.description, 'Original root cause');

  // Investigation is frozen
  assert.equal(Object.isFrozen(inv.confirmedRootCause), true);
}

// Mutating nested array in original does not affect investigation
{
  const mutableRc = {
    rootCauseId: 'RC-002',
    description: 'Nested array test',
    confidence: 0.8,
    supportingEvidence: ['EVID-A'],
    affectedArtifacts: ['COMP-A', 'COMP-B'],
    affectedInvariants: [],
    validationStatus: 'CONFIRMED',
    alternativeExplanations: [],
    remainingUncertainty: '',
  };

  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Defensive copy nested arrays',
    confirmedRootCause: mutableRc,
    createdAt: 100,
    updatedAt: 200,
  });

  const originalAffectedCount = inv.confirmedRootCause.affectedArtifacts.length;

  // Push to original array
  mutableRc.affectedArtifacts.push('COMP-C');

  assert.equal(inv.confirmedRootCause.affectedArtifacts.length, originalAffectedCount);
}

// ============================================================
// 5b. M-03: Defensive copy for Resolution
// ============================================================

// Mutable Resolution object — mutation after createInvestigation does not affect investigation
{
  const mutableRes = {
    resolutionId: 'RES-001',
    chosenApproach: 'Fix A',
    reasonForChoice: 'Best practice',
    rejectedAlternatives: ['Fix B', 'Fix C'],
    expectedOutcome: 'Bug fixed',
    risks: ['Regression'],
    followUpRecommendations: ['Monitor'],
    requiredValidation: ['Integration test'],
    validationStatus: 'PROPOSED',
  };

  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Defensive copy resolution',
    finalResolution: mutableRes,
    createdAt: 100,
    updatedAt: 200,
  });

  assert.equal(inv.finalResolution.chosenApproach, 'Fix A');
  assert.equal(inv.finalResolution.rejectedAlternatives.length, 2);

  // Mutate original
  mutableRes.chosenApproach = 'Mutated approach';
  mutableRes.rejectedAlternatives.push('Fix D');

  // Investigation should be unchanged
  assert.equal(inv.finalResolution.chosenApproach, 'Fix A');
  assert.equal(inv.finalResolution.rejectedAlternatives.length, 2);
  assert.equal(Object.isFrozen(inv.finalResolution), true);
}

// ============================================================
// 4. Root cause creation
// ============================================================

{
  const rc = createRootCause({
    rootCauseId: 'PB-RC-001',
    description: 'Missing cleanup in useEffect',
    confidence: 0.95,
    supportingEvidence: ['PB-EVID-001', 'PB-EVID-002'],
    affectedArtifacts: ['PB-COMP-A'],
    affectedInvariants: ['PB-INV-SUB-001'],
    validationStatus: 'CONFIRMED',
    alternativeExplanations: ['Timing issue'],
    remainingUncertainty: 'No other root cause found',
  });
  assert.equal(rc.rootCauseId, 'PB-RC-001');
  assert.equal(rc.confidence, 0.95);
  assert.equal(rc.validationStatus, 'CONFIRMED');
  assert.equal(Object.isFrozen(rc), true);
}

// Fail-closed: empty rootCauseId
{
  assert.throws(() => {
    createRootCause({
      rootCauseId: '',
      description: 'test',
      confidence: 0.5,
    });
  });
}

// ============================================================
// 5. Resolution creation
// ============================================================

{
  const res = createResolution({
    resolutionId: 'PB-RES-001',
    chosenApproach: 'Added cleanup return in useEffect',
    reasonForChoice: 'Standard React pattern',
    expectedOutcome: 'No more memory leaks',
    risks: ['Regression in edge case'],
    requiredValidation: ['Verify with profiler'],
  });
  assert.equal(res.resolutionId, 'PB-RES-001');
  assert.equal(res.chosenApproach, 'Added cleanup return in useEffect');
  assert.equal(res.validationStatus, 'PROPOSED');
  assert.equal(Object.isFrozen(res), true);
}

// Fail-closed: empty resolutionId
{
  assert.throws(() => {
    createResolution({
      resolutionId: '',
      chosenApproach: 'test',
      reasonForChoice: 'reason',
      expectedOutcome: 'outcome',
    });
  });
}

// ============================================================
// 6. updateInvestigationLifecycle
// ============================================================

{
  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'OPEN',
    problemStatement: 'Bug investigation',
    createdAt: 100,
    updatedAt: 100,
  });

  const updated = updateInvestigationLifecycle(inv, 'INVESTIGATING', 200);
  assert.equal(updated.lifecycleState, 'INVESTIGATING');
  assert.equal(updated.updatedAt, 200);
  assert.equal(updated.problemStatement, 'Bug investigation');
  assert.equal(Object.isFrozen(updated), true);

  // Original should remain frozen
  assert.equal(inv.lifecycleState, 'OPEN');
  assert.equal(inv.updatedAt, 100);
}

// Fail-closed: invalid transition
{
  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'OPEN',
    problemStatement: 'test',
    createdAt: 100,
    updatedAt: 100,
  });
  assert.throws(() => {
    updateInvestigationLifecycle(inv, 'RESOLVED', 200);
  });
}

// ============================================================
// 7. Deep immutability
// ============================================================

{
  const hyp1 = createHypothesis({
    hypothesisId: 'PB-HYP-001',
    description: 'Test hypothesis',
    author: 'dev',
    confidence: 0.8,
    timestamp: 100,
  });

  const ev1 = createEvidenceItem({
    evidenceId: 'PB-EVID-001',
    evidenceType: 'EXPERIMENT_RESULT',
    description: 'Test evidence',
    sourceRevision: 'rev-001',
    observation: 'obs',
    timestamp: 200,
  });

  const inv = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'OPEN',
    problemStatement: 'Test',
    createdAt: 100,
    updatedAt: 100,
    hypotheses: [hyp1],
    evidence: [ev1],
  });
  assert.equal(Object.isFrozen(inv), true);
  assert.equal(Object.isFrozen(inv.hypotheses), true);
  assert.equal(Object.isFrozen(inv.hypotheses[0]), true);
  assert.equal(Object.isFrozen(inv.evidence), true);
  assert.equal(Object.isFrozen(inv.evidence[0]), true);
}
