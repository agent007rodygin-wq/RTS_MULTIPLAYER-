import assert from 'node:assert/strict';
import {
  createManifestIdentity,
  createManifestEntry,
  buildManifestSnapshot,
  transitionManifestLifecycle,
  computeManifestFingerprint,
} from '../../src/project-brain/manifest-core.ts';
import { createInvestigation, createHypothesis, createEvidenceItem } from '../../src/project-brain/manifest-investigation.ts';
import { validateManifestEntry } from '../../src/project-brain/manifest-validation.ts';

const BASE_IDENTITY = createManifestIdentity({
  manifestArtifactId: 'PB-DM-001',
  manifestRevision: 'rev-001',
  investigationId: 'PB-INV-001',
  repositoryRevision: 'abc123def',
  freshness: 1000,
});

const VALID_INVESTIGATION = createInvestigation({
  identity: BASE_IDENTITY,
  lifecycleState: 'OPEN',
  problemStatement: 'Test problem',
  createdAt: 100,
  updatedAt: 100,
});

const VALID_HYPOTHESIS = createHypothesis({
  hypothesisId: 'PB-HYP-001',
  description: 'Test hypothesis',
  author: 'tester',
  confidence: 0.8,
  timestamp: 100,
});

const VALID_EVIDENCE = createEvidenceItem({
  evidenceId: 'PB-EVID-001',
  evidenceType: 'SOURCE_INSPECTION',
  description: 'Test evidence',
  sourceRevision: 'rev-001',
  observation: 'Observed behavior',
  timestamp: 100,
});

// ============================================================
// 1. Identity creation
// ============================================================
{
  assert.equal(BASE_IDENTITY.manifestArtifactId, 'PB-DM-001');
  assert.equal(BASE_IDENTITY.manifestRevision, 'rev-001');
  assert.equal(BASE_IDENTITY.investigationId, 'PB-INV-001');
  assert.equal(BASE_IDENTITY.repositoryRevision, 'abc123def');
  assert.equal(BASE_IDENTITY.freshness, 1000);
  assert.equal(Object.isFrozen(BASE_IDENTITY), true);
}

// Identity with optional fields
{
  const id = createManifestIdentity({
    manifestArtifactId: 'PB-DM-002',
    manifestRevision: 'rev-002',
    investigationId: 'PB-INV-002',
    repositoryRevision: 'def456abc',
    freshness: 2000,
    relatedTaskRef: 'PB-TASK-001',
    relatedGenerationRef: 'PB-GEN-001',
  });
  assert.equal(id.relatedTaskRef, 'PB-TASK-001');
  assert.equal(id.relatedGenerationRef, 'PB-GEN-001');
}

// Fail-closed on empty artifactId
{
  assert.throws(() => {
    createManifestIdentity({
      manifestArtifactId: '',
      manifestRevision: 'rev-001',
      investigationId: 'PB-INV-001',
      repositoryRevision: 'abc',
      freshness: 1,
    });
  });
}

// Fail-closed on empty revision
{
  assert.throws(() => {
    createManifestIdentity({
      manifestArtifactId: 'PB-DM-001',
      manifestRevision: '',
      investigationId: 'PB-INV-001',
      repositoryRevision: 'abc',
      freshness: 1,
    });
  });
}

// ============================================================
// 2. Lifecycle transitions
// ============================================================

// Valid forward transition
{
  const result = transitionManifestLifecycle('OPEN', 'INVESTIGATING');
  assert.equal(result, 'INVESTIGATING');
}

// Same state returns same state
{
  const result = transitionManifestLifecycle('OPEN', 'OPEN');
  assert.equal(result, 'OPEN');
}

// SUPERSEDED from any state
{
  const result = transitionManifestLifecycle('OPEN', 'SUPERSEDED');
  assert.equal(result, 'SUPERSEDED');
}

// Invalid backward transition
{
  assert.throws(() => {
    transitionManifestLifecycle('RESOLVED', 'OPEN');
  });
}

// Invalid skip-forward transition
{
  assert.throws(() => {
    transitionManifestLifecycle('OPEN', 'RESOLVED');
  });
}

// SUPERSEDED cannot transition further
{
  assert.throws(() => {
    transitionManifestLifecycle('SUPERSEDED', 'ARCHIVED');
  });
}

// ============================================================
// 3. Fingerprint determinism
// ============================================================

// Same semantic inputs -> same fingerprint
{
  const fp1 = computeManifestFingerprint({ a: 1, b: 'test' });
  const fp2 = computeManifestFingerprint({ a: 1, b: 'test' });
  assert.equal(fp1, fp2);
}

// Different order -> same fingerprint (sorted keys)
{
  const fp1 = computeManifestFingerprint({ a: 1, b: 2 });
  const fp2 = computeManifestFingerprint({ b: 2, a: 1 });
  assert.equal(fp1, fp2);
}

// Different semantic -> different fingerprint
{
  const fp1 = computeManifestFingerprint({ a: 1 });
  const fp2 = computeManifestFingerprint({ a: 2 });
  assert.notEqual(fp1, fp2);
}

// Diagnostics excluded from fingerprint
{
  const fp1 = computeManifestFingerprint({ data: 'test', diagnostics: [{ index: 1 }] });
  const fp2 = computeManifestFingerprint({ data: 'test', diagnostics: [{ index: 2 }] });
  assert.equal(fp1, fp2);
}

// generatedAt excluded from fingerprint
{
  const fp1 = computeManifestFingerprint({ data: 'test', generatedAt: 100 });
  const fp2 = computeManifestFingerprint({ data: 'test', generatedAt: 200 });
  assert.equal(fp1, fp2);
}

// ============================================================
// 4. Deep immutability
// ============================================================

{
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: VALID_INVESTIGATION,
    diagnostics: [],
  });
  assert.equal(Object.isFrozen(entry), true);
  assert.equal(Object.isFrozen(entry.investigation), true);
  assert.equal(Object.isFrozen(entry.investigation.identity), true);
}

// ============================================================
// 5. buildManifestSnapshot
// ============================================================

{
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: VALID_INVESTIGATION,
    diagnostics: [],
  });

  const snapshot = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [entry],
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

  assert.equal(snapshot.identity.manifestArtifactId, 'PB-DM-001');
  assert.equal(snapshot.entryCount, 1);
  assert.equal(snapshot.metadata.activeEntryCount, 1);
  assert.equal(snapshot.metadata.archivedEntryCount, 0);
  assert.equal(snapshot.metadata.supersededEntryCount, 0);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.entries), true);
  assert.equal(Object.isFrozen(snapshot.entries[0]), true);
  assert.equal(typeof snapshot.fingerprint, 'string');
  assert.equal(snapshot.fingerprint.length, 8);
}

// Deterministic snapshot: same inputs -> same fingerprint
{
  const entry1 = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: VALID_INVESTIGATION,
    diagnostics: [],
  });

  const entry2 = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: VALID_INVESTIGATION,
    diagnostics: [],
  });

  const snap1 = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [entry1],
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

  const snap2 = buildManifestSnapshot({
    identity: BASE_IDENTITY,
    entries: [entry2],
    metadata: {
      sourceMirrorFingerprint: 'mirror-fp-001',
      sourceValidationFingerprint: 'valid-fp-001',
      activeEntryCount: 0,
      archivedEntryCount: 0,
      supersededEntryCount: 0,
      unresolvedEntryCount: 0,
      generatedAt: 999,
    },
  });

  assert.equal(snap1.fingerprint, snap2.fingerprint);
}

// Fail-closed on invalid input
{
  assert.throws(() => {
    buildManifestSnapshot(null);
  });
}

// ============================================================
// 6. H-01: Canonical Semantic Projection — fingerprint determinism
// ============================================================

// 1. Different generatedAt → same fingerprint
{
  const fp1 = computeManifestFingerprint({ metadata: { generatedAt: 100, sourceMirrorFingerprint: 'abc' } });
  const fp2 = computeManifestFingerprint({ metadata: { generatedAt: 999, sourceMirrorFingerprint: 'abc' } });
  assert.equal(fp1, fp2);
}

// 2. Different createdAt → same fingerprint
{
  const fp1 = computeManifestFingerprint({ createdAt: 100, problemStatement: 'test', lifecycleState: 'OPEN', identity: { investigationId: 'a' } });
  const fp2 = computeManifestFingerprint({ createdAt: 999, problemStatement: 'test', lifecycleState: 'OPEN', identity: { investigationId: 'a' } });
  assert.equal(fp1, fp2);
}

// 3. Different updatedAt → same fingerprint
{
  const fp1 = computeManifestFingerprint({ updatedAt: 100, problemStatement: 'test', lifecycleState: 'OPEN', identity: { investigationId: 'a' } });
  const fp2 = computeManifestFingerprint({ updatedAt: 999, problemStatement: 'test', lifecycleState: 'OPEN', identity: { investigationId: 'a' } });
  assert.equal(fp1, fp2);
}

// 4. Different Hypothesis.timestamp → same fingerprint
{
  const hyp1 = { hypothesisId: 'H-001', description: 'test', author: 'dev', confidence: 0.5, timestamp: 100 };
  const hyp2 = { hypothesisId: 'H-001', description: 'test', author: 'dev', confidence: 0.5, timestamp: 999 };
  const fp1 = computeManifestFingerprint({ hypotheses: [hyp1] });
  const fp2 = computeManifestFingerprint({ hypotheses: [hyp2] });
  assert.equal(fp1, fp2);
}

// 5. Different EvidenceItem.timestamp → same fingerprint
{
  const ev1 = { evidenceId: 'E-001', evidenceType: 'SOURCE_INSPECTION', description: 'test', sourceRevision: 'r1', observation: 'obs', timestamp: 100 };
  const ev2 = { evidenceId: 'E-001', evidenceType: 'SOURCE_INSPECTION', description: 'test', sourceRevision: 'r1', observation: 'obs', timestamp: 999 };
  const fp1 = computeManifestFingerprint({ evidence: [ev1] });
  const fp2 = computeManifestFingerprint({ evidence: [ev2] });
  assert.equal(fp1, fp2);
}

// 6. Different diagnostics → same fingerprint
{
  const fp1 = computeManifestFingerprint({ data: 'test', diagnostics: [{ index: 1, code: 'WARN' }] });
  const fp2 = computeManifestFingerprint({ data: 'test', diagnostics: [{ index: 2, code: 'ERROR' }] });
  assert.equal(fp1, fp2);
}

// 7. Semantic field changed → different fingerprint
{
  const fp1 = computeManifestFingerprint({ problemStatement: 'Bug A', lifecycleState: 'OPEN' });
  const fp2 = computeManifestFingerprint({ problemStatement: 'Bug B', lifecycleState: 'OPEN' });
  assert.notEqual(fp1, fp2);
}

// 8. Input object not mutated
{
  const input = { problemStatement: 'test', createdAt: 100, lifecycleState: 'OPEN' };
  const beforeKeys = Object.keys(input).sort().join(',');
  computeManifestFingerprint(input);
  assert.equal(Object.keys(input).sort().join(','), beforeKeys);
  assert.equal(input.createdAt, 100);
  assert.equal(input.problemStatement, 'test');
}

// 9. Semantic field with 'timestamp' in name but not audit field is preserved
{
  const fp1 = computeManifestFingerprint({ data: 'test', lastEventTimestamp: 100 });
  const fp2 = computeManifestFingerprint({ data: 'test', lastEventTimestamp: 200 });
  assert.notEqual(fp1, fp2, 'lastEventTimestamp is semantic, should affect fingerprint');
}

// 10. Pipeline fingerprint and direct-call fingerprint match for equivalent semantics
{
  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation: VALID_INVESTIGATION,
    diagnostics: [],
  });

  const directFp = computeManifestFingerprint({
    entryType: 'ACTIVE',
    investigation: VALID_INVESTIGATION,
  });

  assert.equal(entry.fingerprint, directFp);
}
