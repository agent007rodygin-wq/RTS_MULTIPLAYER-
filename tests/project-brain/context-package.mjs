import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildContextPackage,
  createArtifactReference,
  createBrainRequest,
  createCanonicalRegistry,
  createContextPackageBuildRequest,
  createKnowledgeArtifactRevision,
  createKnowledgeStore,
  evaluateBrainAuthority,
  loadContextPackage,
  loadContextPackageFromFile,
  runBrainEngine,
  serializeContextPackage,
  supersedeKnowledgeRevision,
  validateContextPackageBuildRequest,
  validateContextPackageConsistency,
  validateContextPackageFoundation,
} from '../../src/project-brain/index.ts';

function buildContextFixture() {
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
  ]);

  const store = createKnowledgeStore(registry, [
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

  const superseded = supersedeKnowledgeRevision(store, {
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

  const request = createBrainRequest({
    requestId: 'REQ-001',
    taskId: 'TASK-001',
    summary: 'Produce a bounded plan from canonical knowledge.',
    purpose: 'Package D integration coverage',
    authorityArtifactIds: ['PB-CONSTITUTION-001'],
    requiredArtifactIds: ['PB-KNOWLEDGE-002'],
    optionalArtifactIds: ['PB-TRACEABILITY-002'],
    constraints: ['deterministic', 'traceable'],
    outputClass: 'plan',
  });

  const brainResult = runBrainEngine({
    request,
    store: superseded.store,
  });
  const authority = evaluateBrainAuthority(
    brainResult.session,
    brainResult.dependencyGraph,
    brainResult.validationFailures,
  );

  assert.equal(brainResult.status, 'ALLOW');
  assert.equal(brainResult.response.status, 'ALLOW');

  return {
    registry,
    store: superseded.store,
    request,
    brainResult,
    authority,
  };
}

const fixture = buildContextFixture();

const normalizedRequest = createContextPackageBuildRequest({
  contextRequestId: '  CTX-001  ',
  purpose: '  Package D integration coverage  ',
  excludedArtifactIds: ['pb knowledge 001', 'pb traceability 002'],
    source: {
      session: fixture.brainResult.session,
      response: fixture.brainResult.response,
      authority: fixture.authority,
      executionPlan: fixture.brainResult.executionPlan,
      dependencyGraph: fixture.brainResult.dependencyGraph,
      traceability: fixture.brainResult.traceability,
    registry: fixture.registry,
    store: fixture.store,
  },
});

assert.equal(normalizedRequest.contextRequestId, 'CTX-001');
assert.equal(normalizedRequest.purpose, 'Package D integration coverage');
assert.deepEqual(normalizedRequest.excludedArtifactIds, ['PB-KNOWLEDGE-001', 'PB-TRACEABILITY-002']);

const invalidRequestReport = validateContextPackageBuildRequest({
  contextRequestId: 'CTX-002',
  excludedArtifactIds: ['pb knowledge 001', 'PB-KNOWLEDGE-001'],
  source: normalizedRequest.source,
});

assert.equal(invalidRequestReport.valid, false);
assert.equal(
  invalidRequestReport.issues.some((issue) => issue.code === 'DUPLICATE_EXCLUDED_ARTIFACT_ID'),
  true,
);

const foundationValidation = validateContextPackageFoundation(normalizedRequest);
assert.equal(foundationValidation.valid, true);

const readyPackage = buildContextPackage({
  contextRequestId: 'CTX-001',
  purpose: 'Package D integration coverage',
  excludedArtifactIds: ['pb knowledge 001', 'pb traceability 002'],
  source: normalizedRequest.source,
});

assert.equal(readyPackage.status, 'READY');
assert.equal(readyPackage.contextRequestId, 'CTX-001');
assert.equal(readyPackage.sourceBrainSessionId, fixture.brainResult.session.sessionId);
assert.equal(readyPackage.sourceBrainResponseStatus, 'ALLOW');
assert.equal(readyPackage.metadata.sourceBrainDependencyNodeCount, fixture.brainResult.dependencyGraph.nodes.length);
assert.equal(readyPackage.metadata.includedCount, 2);
assert.equal(readyPackage.metadata.excludedCount, 2);
assert.equal(readyPackage.metadata.warningCount, 2);
assert.equal(readyPackage.metadata.validationFailureCount, 0);
assert.deepEqual(
  readyPackage.includedItems.map((item) => item.artifactId),
  ['PB-CONSTITUTION-001', 'PB-KNOWLEDGE-002'],
);
assert.deepEqual(
  readyPackage.excludedItems.map((item) => item.artifactId),
  ['PB-KNOWLEDGE-001', 'PB-TRACEABILITY-002'],
);
assert.equal(
  readyPackage.warnings.some((warning) => warning.code === 'EXPLICIT_CONTEXT_EXCLUSION'),
  true,
);
assert.equal(
  readyPackage.traceabilityLinks.some((link) => link.artifactId === 'PB-TRACEABILITY-002'),
  true,
);
assert.equal(Object.isFrozen(readyPackage), true);
assert.equal(Object.isFrozen(readyPackage.includedItems), true);
assert.equal(serializeContextPackage(readyPackage), readyPackage.serialized);

const roundTrippedPackage = loadContextPackage(readyPackage.serialized, {
  request: normalizedRequest,
});

assert.equal(roundTrippedPackage.serialized, readyPackage.serialized);
assert.equal(roundTrippedPackage.metadata.packageFingerprint, readyPackage.metadata.packageFingerprint);
assert.deepEqual(roundTrippedPackage.includedItems.map((item) => item.artifactId), [
  'PB-CONSTITUTION-001',
  'PB-KNOWLEDGE-002',
]);

const tamperedPackage = JSON.parse(readyPackage.serialized);
tamperedPackage.packageFingerprint = 'CTX-00000000';
tamperedPackage.metadata.packageFingerprint = 'CTX-00000000';
assert.throws(
  () => loadContextPackage(tamperedPackage, { request: normalizedRequest }),
  /fingerprint mismatch/i,
);

const brokenSource = {
  ...normalizedRequest.source,
  dependencyGraph: {
    ...normalizedRequest.source.dependencyGraph,
    nodes: normalizedRequest.source.dependencyGraph.nodes.map((node) =>
      node.artifactId === 'PB-KNOWLEDGE-002'
        ? { ...node, latestRevision: undefined }
        : node,
    ),
  },
};

const blockedPackage = buildContextPackage({
  contextRequestId: 'CTX-BLOCKED',
  purpose: 'Package D missing revision coverage',
  excludedArtifactIds: [],
  source: brokenSource,
});

assert.equal(blockedPackage.status, 'BLOCKED');
assert.equal(
  blockedPackage.invalidReferenceItems.some((item) => item.reasonCode === 'MISSING_REVISION'),
  true,
);
assert.equal(blockedPackage.metadata.validationFailureCount > 0, true);

const tempDir = await mkdtemp(join(tmpdir(), 'project-brain-context-package-'));
const tempFile = join(tempDir, 'context-package.json');
await writeFile(tempFile, readyPackage.serialized, 'utf8');
assert.equal(await readFile(tempFile, 'utf8'), readyPackage.serialized);
const loadedFromFile = await loadContextPackageFromFile(tempFile, { request: normalizedRequest });
assert.equal(loadedFromFile.serialized, readyPackage.serialized);
await rm(tempDir, { recursive: true, force: true });

console.log('Package D context package tests passed.');
