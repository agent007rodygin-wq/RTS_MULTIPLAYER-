import assert from 'node:assert/strict';
import {
  createArtifactReference,
  createCanonicalRegistry,
  createKnowledgeArtifactRevision,
  createKnowledgeStore,
  createBrainRequest,
  evaluateBrainAuthority,
  runBrainEngine,
  supersedeKnowledgeRevision,
  validateBrainRequest,
  validateKnowledgeStore,
} from '../../src/project-brain/index.ts';

function buildKnowledgeStoreFixture() {
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
      derivedArtifacts: ['PB-TRACEABILITY-002'],
    },
    {
      artifactId: 'PB-KNOWLEDGE-002',
      artifactType: 'knowledge-artifact',
      canonicalRole: 'approved-fact-set',
      authoritySource: 'package-b',
      owner: 'brain',
      sourceRevision: 'rev-102',
      freshnessState: 'CURRENT',
      supersedes: ['PB-KNOWLEDGE-001'],
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
    {
      artifactId: 'PB-STALE-001',
      artifactType: 'knowledge-artifact',
      canonicalRole: 'approved-fact-set',
      authoritySource: 'package-b',
      owner: 'brain',
      sourceRevision: 'rev-301',
      freshnessState: 'STALE',
    },
  ]);

  const initialStore = createKnowledgeStore(registry, [
    createKnowledgeArtifactRevision(
      {
        artifactId: 'PB-CONSTITUTION-001',
        artifactType: 'constitution',
        canonicalRole: 'governing-rule',
        authoritySource: 'constitution',
        owner: 'governance',
        sourceRevision: 'rev-001',
        freshnessState: 'CURRENT',
        storageKind: 'canonical',
        lifecycleState: 'CANONICAL',
        revisionId: 'PB-CONSTITUTION-001-CANONICAL',
        revisionOrder: 1,
        payload: {
          summary: 'frozen governance baseline',
        },
        validationMechanism: 'unit-test',
      },
      registry,
    ),
    createKnowledgeArtifactRevision(
      {
        artifactId: 'PB-KNOWLEDGE-001',
        artifactType: 'knowledge-artifact',
        canonicalRole: 'approved-fact-set',
        authoritySource: 'package-b',
        owner: 'brain',
        sourceRevision: 'rev-101',
        freshnessState: 'CURRENT',
        storageKind: 'canonical',
        lifecycleState: 'CANONICAL',
        revisionId: 'PB-KNOWLEDGE-001-CANONICAL',
        revisionOrder: 1,
        payload: {
          summary: 'seed knowledge',
        },
        validationMechanism: 'unit-test',
      },
      registry,
    ),
    createKnowledgeArtifactRevision(
      {
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
        revisionOrder: 1,
        payload: {
          summary: 'traceability surface',
        },
        canonicalSourceReferences: [
          createArtifactReference({
            targetArtifactId: 'pb knowledge 001',
            sourceArtifactId: 'pb traceability 002',
            targetType: 'knowledge-artifact',
            relationshipType: 'canonical',
          }),
        ],
        validationMechanism: 'unit-test',
      },
      registry,
    ),
  ]);

  const superseded = supersedeKnowledgeRevision(initialStore, {
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
    revisionOrder: 2,
    payload: {
      summary: 'replacement knowledge',
    },
    supersedesArtifactIds: ['PB-KNOWLEDGE-001'],
    validationMechanism: 'unit-test',
  });

  assert.equal(superseded.ok, true);
  assert.ok(superseded.store);

  return superseded.store;
}

const store = buildKnowledgeStoreFixture();
assert.equal(validateKnowledgeStore(store).valid, true);

const validRequest = {
  requestId: 'REQ-001',
  taskId: 'TASK-001',
  summary: 'Produce a bounded plan from canonical knowledge.',
  purpose: 'Package C integration coverage',
  authorityArtifactIds: ['PB-CONSTITUTION-001'],
  requiredArtifactIds: ['PB-KNOWLEDGE-002'],
  optionalArtifactIds: ['PB-TRACEABILITY-002'],
  constraints: ['deterministic', 'traceable'],
  outputClass: 'plan',
};

const normalizedValidRequest = createBrainRequest(validRequest);
assert.equal(validateBrainRequest(validRequest).valid, true);
assert.deepEqual(normalizedValidRequest.authorityArtifactIds, ['PB-CONSTITUTION-001']);
assert.deepEqual(normalizedValidRequest.requiredArtifactIds, ['PB-KNOWLEDGE-002']);
assert.deepEqual(normalizedValidRequest.optionalArtifactIds, ['PB-TRACEABILITY-002']);

const validResult = runBrainEngine({
  request: validRequest,
  store,
});

assert.equal(validResult.status, 'ALLOW');
assert.equal(validResult.response.status, 'ALLOW');
assert.equal(validResult.response.warningCodes.length, 1);
assert.deepEqual(validResult.response.warningCodes, ['DERIVED_REQUIRED_ARTIFACT']);
assert.deepEqual(validResult.resolvedArtifacts.map((artifact) => artifact.artifactId), [
  'PB-CONSTITUTION-001',
  'PB-KNOWLEDGE-001',
  'PB-KNOWLEDGE-002',
  'PB-TRACEABILITY-002',
]);
assert.equal(
  validResult.dependencyGraph.nodes.find((node) => node.artifactId === 'PB-KNOWLEDGE-001')?.classification,
  'superseded',
);
assert.equal(
  validResult.dependencyGraph.nodes.find((node) => node.artifactId === 'PB-TRACEABILITY-002')?.classification,
  'derived',
);
assert.equal(
  validResult.dependencyGraph.nodes.find((node) => node.artifactId === 'PB-CONSTITUTION-001')?.registryEntry?.owner,
  'governance',
);
assert.equal(
  validResult.dependencyGraph.nodes.find((node) => node.artifactId === 'PB-KNOWLEDGE-001')?.latestRevision?.lifecycleState,
  'SUPERSEDED',
);
assert.equal(
  validResult.dependencyGraph.nodes.find((node) => node.artifactId === 'PB-KNOWLEDGE-001')?.revisionHistory.length,
  2,
);
assert.deepEqual(validResult.executionPlan.blockedReasonCodes, []);
assert.deepEqual(validResult.executionPlan.warningCodes, ['DERIVED_REQUIRED_ARTIFACT']);
assert.deepEqual(validResult.traceability.dependencyPaths, [
  'PB-KNOWLEDGE-001 -[derived-artifact]-> PB-TRACEABILITY-002',
  'PB-KNOWLEDGE-002 -[supersedes]-> PB-KNOWLEDGE-001',
]);
assert.equal(
  validResult.traceability.entries.find((entry) => entry.artifactId === 'PB-TRACEABILITY-002')?.classification,
  'derived',
);
assert.equal(
  validResult.traceability.entries.find((entry) => entry.artifactId === 'PB-KNOWLEDGE-002')?.rationale.includes('current canonical knowledge'),
  true,
);
assert.deepEqual(validResult.diagnostics.map((event) => event.code), [
  'REQUEST_NORMALIZED',
  'STORE_VALIDATED',
  'AUTHORITY_APPROVED',
  'DEPENDENCY_GRAPH_BUILT',
  'PLAN_READY',
  'TRACEABILITY_BUILT',
  'RESULT_READY',
]);

const semanticallyEquivalentRequest = {
  requestId: 'REQ-001',
  taskId: 'TASK-001',
  summary: '  Produce a bounded plan from canonical knowledge.  ',
  purpose: 'Package C integration coverage',
  authorityArtifactIds: ['pb constitution 001'],
  requiredArtifactIds: ['PB-KNOWLEDGE-002', 'pb knowledge 002'],
  optionalArtifactIds: ['pb traceability 002'],
  constraints: ['traceable', ' deterministic ', 'traceable'],
  outputClass: 'plan',
};

const repeatedResult = runBrainEngine({
  request: semanticallyEquivalentRequest,
  store,
});

assert.deepEqual(repeatedResult, validResult);

const invalidRequestResult = runBrainEngine({
  request: {
    requestId: 'REQ-INVALID',
    taskId: 'TASK-INVALID',
    summary: '   ',
    authorityArtifactIds: [],
    requiredArtifactIds: [],
    optionalArtifactIds: [],
    constraints: [],
    outputClass: 'plan',
  },
  store,
});

assert.equal(invalidRequestResult.status, 'BLOCKED');
assert.equal(invalidRequestResult.response.status, 'BLOCKED');
assert.equal(
  invalidRequestResult.validationFailures.some(
    (failure) => failure.source === 'request' && failure.code === 'INVALID_REQUEST_VALUE',
  ),
  true,
);
assert.equal(
  invalidRequestResult.diagnostics.map((event) => event.code).includes('REQUEST_INVALID'),
  true,
);

const authorityRejectedResult = runBrainEngine({
  request: {
    requestId: 'REQ-AUTH',
    taskId: 'TASK-AUTH',
    summary: 'Reject non-canonical authority.',
    authorityArtifactIds: ['PB-TRACEABILITY-002'],
    requiredArtifactIds: ['PB-KNOWLEDGE-002'],
    optionalArtifactIds: [],
    constraints: [],
    outputClass: 'plan',
  },
  store,
});

assert.equal(authorityRejectedResult.status, 'BLOCKED');
assert.equal(authorityRejectedResult.response.status, 'BLOCKED');
assert.equal(
  authorityRejectedResult.authorityFailures.some(
    (failure) => failure.code === 'DERIVED_AUTHORITY_ARTIFACT',
  ),
  true,
);
assert.equal(
  authorityRejectedResult.response.blockedReasonCodes.includes('DERIVED_AUTHORITY_ARTIFACT'),
  true,
);
assert.equal(
  authorityRejectedResult.diagnostics.map((event) => event.code).includes('AUTHORITY_BLOCKED'),
  true,
);

const missingArtifactResult = runBrainEngine({
  request: {
    requestId: 'REQ-MISSING',
    taskId: 'TASK-MISSING',
    summary: 'Reject missing authority.',
    authorityArtifactIds: ['PB-MISSING-404'],
    requiredArtifactIds: ['PB-KNOWLEDGE-002'],
    optionalArtifactIds: [],
    constraints: [],
    outputClass: 'plan',
  },
  store,
});

assert.equal(missingArtifactResult.status, 'BLOCKED');
assert.equal(missingArtifactResult.response.status, 'BLOCKED');
assert.equal(
  missingArtifactResult.authorityFailures.some(
    (failure) => failure.code === 'MISSING_AUTHORITY_ARTIFACT',
  ),
  true,
);
assert.equal(
  missingArtifactResult.response.blockedReasonCodes.includes('MISSING_AUTHORITY_ARTIFACT'),
  true,
);

console.log('Package C Brain Engine tests passed.');
