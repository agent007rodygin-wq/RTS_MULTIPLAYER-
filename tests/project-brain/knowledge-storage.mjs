import assert from 'node:assert/strict';
import {
  createArtifactReference,
  createCanonicalRegistry,
  lookupCanonicalArtifact,
  resolveArtifactReference,
  validateCanonicalRegistry,
} from '../../src/project-brain/index.ts';
import {
  appendKnowledgeRevision,
  createKnowledgeStore,
  getCanonicalKnowledgeRevisions,
  getDerivedKnowledgeRevisions,
  getKnowledgeRevisionHistory,
  getLatestKnowledgeRevision,
  loadKnowledgeStore,
  serializeKnowledgeStore,
  supersedeKnowledgeRevision,
  transitionKnowledgeRevision,
  validateKnowledgeStore,
} from '../../src/project-brain/knowledge-store.ts';
import { createKnowledgeArtifactRevision } from '../../src/project-brain/knowledge-artifact.ts';

const registry = createCanonicalRegistry([
  {
    artifactId: 'PB-CONSTITUTION-001',
    artifactType: 'constitution',
    canonicalRole: 'governing-rule',
    authoritySource: 'constitution',
    owner: 'governance',
    sourceRevision: 'rev-001',
    freshnessState: 'CURRENT',
    version: '1.0.0',
    status: 'CURRENT',
  },
  {
    artifactId: 'PB-KNOWLEDGE-001',
    artifactType: 'knowledge-artifact',
    canonicalRole: 'approved-fact-set',
    authoritySource: 'package-b',
    owner: 'brain',
    sourceRevision: 'rev-101',
    freshnessState: 'CURRENT',
  },
  {
    artifactId: 'PB-KNOWLEDGE-002',
    artifactType: 'knowledge-artifact',
    canonicalRole: 'approved-fact-set',
    authoritySource: 'package-b',
    owner: 'brain',
    sourceRevision: 'rev-102',
    freshnessState: 'CURRENT',
  },
  {
    artifactId: 'PB-TRACEABILITY-002',
    artifactType: 'derived-surface',
    canonicalRole: 'derived-surface',
    authoritySource: 'traceability-report',
    owner: 'verification',
    sourceRevision: 'rev-201',
    freshnessState: 'CURRENT',
  },
]);

assert.equal(validateCanonicalRegistry(registry).valid, true);

const derivedSourceReference = createArtifactReference({
  targetArtifactId: 'PB-CONSTITUTION-001',
  sourceArtifactId: 'PB-TRACEABILITY-002',
  targetType: 'constitution',
  relationshipType: 'canonical',
});

const knowledgeDraft = {
  artifactId: 'PB-KNOWLEDGE-001',
  artifactType: 'knowledge-artifact',
  canonicalRole: 'approved-fact-set',
  authoritySource: 'package-b',
  owner: 'brain',
  sourceRevision: 'rev-101',
  freshnessState: 'CURRENT',
  storageKind: 'canonical',
  lifecycleState: 'DRAFT',
  revisionId: 'PB-KNOWLEDGE-001-DRAFT',
  payload: {
    summary: 'draft canonical knowledge',
    source: 'feature-006',
  },
  evidenceLinks: ['specs/003-project-brain-design/design.md'],
  validationMechanism: 'unit-test',
};

const derivedTraceability = {
  artifactId: 'PB-TRACEABILITY-002',
  artifactType: 'derived-surface',
  canonicalRole: 'derived-surface',
  authoritySource: 'traceability-report',
  owner: 'verification',
  sourceRevision: 'rev-201',
  freshnessState: 'CURRENT',
  storageKind: 'derived',
  lifecycleState: 'DERIVED',
  revisionId: 'PB-TRACEABILITY-002-DERIVED',
  payload: {
    summary: 'derived traceability surface',
  },
  canonicalSourceReferences: [derivedSourceReference],
  evidenceLinks: ['tests/project-brain/knowledge-storage.mjs'],
  validationMechanism: 'unit-test',
};

const storeA = createKnowledgeStore(registry, [derivedTraceability, knowledgeDraft]);
const storeB = createKnowledgeStore(registry, [knowledgeDraft, derivedTraceability]);

assert.equal(serializeKnowledgeStore(storeA), serializeKnowledgeStore(storeB));
assert.equal(validateKnowledgeStore(storeA).valid, true);
assert.equal(getCanonicalKnowledgeRevisions(storeA).length, 1);
assert.equal(getDerivedKnowledgeRevisions(storeA).length, 1);
assert.equal(
  resolveArtifactReference(storeA.registry, derivedSourceReference).resolutionStatus,
  'RESOLVED',
);
assert.equal(lookupCanonicalArtifact(storeA.registry, 'PB-CONSTITUTION-001')?.owner, 'governance');

const historyBefore = getKnowledgeRevisionHistory(storeA, 'PB-KNOWLEDGE-001');
assert.equal(historyBefore.length, 1);
assert.equal(historyBefore[0].lifecycleState, 'DRAFT');
assert.equal(Object.isFrozen(historyBefore[0]), true);

const validatedResult = transitionKnowledgeRevision(storeA, 'PB-KNOWLEDGE-001', 'VALIDATED', {
  revisionId: 'PB-KNOWLEDGE-001-VALIDATED',
});

assert.equal(validatedResult.ok, true);
assert.ok(validatedResult.store);
assert.ok(validatedResult.revision);
assert.equal(validatedResult.revision?.artifactId, 'PB-KNOWLEDGE-001');
assert.equal(validatedResult.revision?.lifecycleState, 'VALIDATED');
assert.equal(validatedResult.revision?.provenance.sourceRevision, 'rev-101');
assert.deepEqual(validatedResult.revision?.provenance.evidenceLinks, ['specs/003-project-brain-design/design.md']);

const validatedStore = validatedResult.store;
assert.ok(validatedStore);

const canonicalResult = transitionKnowledgeRevision(validatedStore, 'PB-KNOWLEDGE-001', 'CANONICAL', {
  revisionId: 'PB-KNOWLEDGE-001-CANONICAL',
});

assert.equal(canonicalResult.ok, true);
assert.ok(canonicalResult.store);
assert.ok(canonicalResult.revision);
assert.equal(canonicalResult.revision?.artifactId, 'PB-KNOWLEDGE-001');
assert.equal(canonicalResult.revision?.lifecycleState, 'CANONICAL');
assert.equal(canonicalResult.revision?.provenance.sourceRevision, 'rev-101');

const canonicalStore = canonicalResult.store;
assert.ok(canonicalStore);

const historyAfter = getKnowledgeRevisionHistory(canonicalStore, 'PB-KNOWLEDGE-001');
assert.equal(historyAfter.length, 3);
assert.deepEqual(
  historyAfter.map((revision) => revision.lifecycleState),
  ['DRAFT', 'VALIDATED', 'CANONICAL'],
);
assert.ok(historyAfter.every((revision) => revision.artifactId === 'PB-KNOWLEDGE-001'));
assert.equal(
  getLatestKnowledgeRevision(canonicalStore, 'PB-KNOWLEDGE-001')?.lifecycleState,
  'CANONICAL',
);

const invalidCanonicalTransition = transitionKnowledgeRevision(
  canonicalStore,
  'PB-KNOWLEDGE-001',
  'PROPOSED',
  {
    revisionId: 'PB-KNOWLEDGE-001-INVALID',
  },
);

assert.equal(invalidCanonicalTransition.ok, false);
assert.equal(
  invalidCanonicalTransition.issues.some((issue) => issue.code === 'INVALID_LIFECYCLE_TRANSITION'),
  true,
);

const derivedWithoutCanonicalSource = appendKnowledgeRevision(canonicalStore, {
  artifactId: 'PB-TRACEABILITY-002',
  artifactType: 'derived-surface',
  canonicalRole: 'derived-surface',
  authoritySource: 'traceability-report',
  owner: 'verification',
  sourceRevision: 'rev-202',
  freshnessState: 'CURRENT',
  storageKind: 'derived',
  lifecycleState: 'DERIVED',
  revisionId: 'PB-TRACEABILITY-002-DERIVED-002',
  payload: {
    summary: 'missing canonical source linkage',
  },
  validationMechanism: 'unit-test',
});

assert.equal(derivedWithoutCanonicalSource.ok, false);
assert.equal(
  derivedWithoutCanonicalSource.issues.some((issue) => issue.code === 'MISSING_CANONICAL_SOURCE'),
  true,
);

const brokenDerivedReference = appendKnowledgeRevision(canonicalStore, {
  artifactId: 'PB-TRACEABILITY-002',
  artifactType: 'derived-surface',
  canonicalRole: 'derived-surface',
  authoritySource: 'traceability-report',
  owner: 'verification',
  sourceRevision: 'rev-203',
  freshnessState: 'CURRENT',
  storageKind: 'derived',
  lifecycleState: 'DERIVED',
  revisionId: 'PB-TRACEABILITY-002-DERIVED-003',
  payload: {
    summary: 'broken canonical source linkage',
  },
  canonicalSourceReferences: [
    createArtifactReference({
      targetArtifactId: 'PB-MISSING-404',
      sourceArtifactId: 'PB-TRACEABILITY-002',
      targetType: 'constitution',
      relationshipType: 'canonical',
    }),
  ],
  validationMechanism: 'unit-test',
});

assert.equal(brokenDerivedReference.ok, false);
assert.equal(
  brokenDerivedReference.issues.some((issue) => issue.code === 'BROKEN_CANONICAL_REFERENCE'),
  true,
);

const invalidDerivedAuthority = appendKnowledgeRevision(canonicalStore, {
  artifactId: 'PB-TRACEABILITY-002',
  artifactType: 'derived-surface',
  canonicalRole: 'derived-surface',
  authoritySource: 'traceability-report',
  owner: 'verification',
  sourceRevision: 'rev-204',
  freshnessState: 'CURRENT',
  storageKind: 'derived',
  lifecycleState: 'CANONICAL',
  revisionId: 'PB-TRACEABILITY-002-CANONICAL',
  payload: {
    summary: 'derived artifact may not become canonical',
  },
  canonicalSourceReferences: [derivedSourceReference],
  validationMechanism: 'unit-test',
});

assert.equal(invalidDerivedAuthority.ok, false);
assert.equal(
  invalidDerivedAuthority.issues.some((issue) => issue.code === 'INVALID_LIFECYCLE_STATE'),
  true,
);

const supersededResult = supersedeKnowledgeRevision(canonicalStore, {
  artifactId: 'PB-KNOWLEDGE-002',
  artifactType: 'knowledge-artifact',
  canonicalRole: 'approved-fact-set',
  authoritySource: 'package-b',
  owner: 'brain',
  sourceRevision: 'rev-102',
  freshnessState: 'CURRENT',
  storageKind: 'canonical',
  lifecycleState: 'CANONICAL',
  revisionId: 'PB-KNOWLEDGE-002-CANONICAL',
  payload: {
    summary: 'replacement canonical knowledge',
  },
  supersedesArtifactIds: ['PB-KNOWLEDGE-001'],
  validationMechanism: 'unit-test',
});

assert.equal(supersededResult.ok, true);
assert.ok(supersededResult.store);
assert.ok(supersededResult.revision);
assert.deepEqual(supersededResult.revision?.supersedesArtifactIds, ['PB-KNOWLEDGE-001']);
assert.equal(
  getLatestKnowledgeRevision(supersededResult.store, 'PB-KNOWLEDGE-001')?.lifecycleState,
  'SUPERSEDED',
);
assert.equal(
  getKnowledgeRevisionHistory(supersededResult.store, 'PB-KNOWLEDGE-002').length,
  1,
);

const supersededStore = supersededResult.store;
assert.ok(supersededStore);

const serialized = serializeKnowledgeStore(supersededStore);
const reloaded = loadKnowledgeStore(serialized);
assert.equal(serializeKnowledgeStore(reloaded), serialized);
assert.equal(validateKnowledgeStore(reloaded).valid, true);

const manualDuplicateStore = {
  registry,
  revisions: [
    createKnowledgeArtifactRevision(
      {
        ...knowledgeDraft,
        revisionId: 'PB-KNOWLEDGE-001-DUPLICATE',
        payload: {
          summary: 'duplicate one',
        },
      },
      registry,
    ),
    createKnowledgeArtifactRevision(
      {
        ...knowledgeDraft,
        revisionId: 'PB-KNOWLEDGE-001-DUPLICATE',
        payload: {
          summary: 'duplicate two with conflicting content',
        },
      },
      registry,
    ),
  ],
};

const duplicateValidation = validateKnowledgeStore(manualDuplicateStore);
assert.equal(duplicateValidation.valid, false);
assert.equal(
  duplicateValidation.issues.some((issue) => issue.code === 'DUPLICATE_REVISION_ID'),
  true,
);
assert.equal(
  duplicateValidation.issues.some((issue) => issue.code === 'CONFLICTING_REVISION'),
  true,
);

assert.equal(historyBefore[0].lifecycleState, 'DRAFT');
assert.equal(canonicalStore.revisions.length > storeA.revisions.length, true);
assert.equal(storeA.revisions.length, 2);

console.log('Package B knowledge storage and lifecycle tests passed.');
