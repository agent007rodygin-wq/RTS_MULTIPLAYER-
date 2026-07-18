import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  GENERATION_PROMPT_SECTION_ORDER,
  buildContextPackage,
  buildGenerationPromptSections,
  buildGenerationRequestEnvelope,
  buildGenerationRequestSerialization,
  computeGenerationPromptFingerprint,
  createArtifactReference,
  createBrainRequest,
  createCanonicalRegistry,
  createContextPackageBuildRequest,
  createKnowledgeArtifactRevision,
  createKnowledgeStore,
  evaluateBrainAuthority,
  loadGenerationRequest,
  loadGenerationRequestFromFile,
  runBrainEngine,
  serializeGenerationRequest,
  supersedeKnowledgeRevision,
  validateGenerationPipelineSource,
  validateGenerationPromptSections,
  validateGenerationRequestEnvelope,
} from '../../src/project-brain/index.ts';

function buildPackageEFixture() {
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

  const brainRequest = createBrainRequest({
    requestId: 'REQ-001',
    taskId: 'TASK-001',
    summary: 'Produce a bounded plan from canonical knowledge.',
    purpose: 'Package E generation coverage',
    authorityArtifactIds: ['PB-CONSTITUTION-001'],
    requiredArtifactIds: ['PB-KNOWLEDGE-002'],
    optionalArtifactIds: ['PB-TRACEABILITY-002'],
    constraints: ['deterministic', 'traceable'],
    outputClass: 'plan',
  });

  const brainResult = runBrainEngine({
    request: brainRequest,
    store: superseded.store,
  });

  const authority = evaluateBrainAuthority(
    brainResult.session,
    brainResult.dependencyGraph,
    brainResult.validationFailures,
  );

  assert.equal(brainResult.status, 'ALLOW');
  assert.equal(brainResult.response.status, 'ALLOW');

  const contextBuildRequest = createContextPackageBuildRequest({
    contextRequestId: 'CTX-001',
    purpose: 'Package E generation coverage',
    excludedArtifactIds: ['pb knowledge 001', 'pb traceability 002'],
    source: {
      session: brainResult.session,
      response: brainResult.response,
      authority,
      executionPlan: brainResult.executionPlan,
      dependencyGraph: brainResult.dependencyGraph,
      traceability: brainResult.traceability,
      registry,
      store: superseded.store,
    },
  });

  const contextPackage = buildContextPackage(contextBuildRequest);

  const blockedSource = {
    ...contextBuildRequest.source,
    dependencyGraph: {
      ...contextBuildRequest.source.dependencyGraph,
      nodes: contextBuildRequest.source.dependencyGraph.nodes.map((node) =>
        node.artifactId === 'PB-KNOWLEDGE-002'
          ? { ...node, latestRevision: undefined }
          : node,
      ),
    },
  };

  const blockedContextPackage = buildContextPackage({
    contextRequestId: 'CTX-BLOCKED',
    purpose: 'Package E blocked coverage',
    excludedArtifactIds: [],
    source: blockedSource,
  });

  assert.equal(blockedContextPackage.status, 'BLOCKED');

  return {
    registry,
    store: superseded.store,
    brainRequest,
    brainResult,
    authority,
    contextBuildRequest,
    contextPackage,
    blockedContextPackage,
  };
}

const fixture = buildPackageEFixture();

const promptInput = {
  brainResult: fixture.brainResult,
  contextPackage: fixture.contextPackage,
  generationVersion: '1.0.0',
  expectedOutputType: fixture.brainResult.request.outputClass,
  taskConstraints: fixture.brainResult.request.constraints,
  providerHints: [],
};

const promptSections = buildGenerationPromptSections(promptInput);
assert.equal(promptSections.length, GENERATION_PROMPT_SECTION_ORDER.length);
assert.deepEqual(
  promptSections.map((section) => section.sectionId),
  GENERATION_PROMPT_SECTION_ORDER,
);
assert.equal(validateGenerationPromptSections(promptSections).valid, true);
assert.equal(
  computeGenerationPromptFingerprint({
    generationVersion: promptInput.generationVersion,
    requestedTask: fixture.brainResult.request.summary,
    expectedOutputType: fixture.brainResult.request.outputClass,
    contextPackageFingerprint: fixture.contextPackage.metadata.packageFingerprint,
    taskConstraints: fixture.brainResult.request.constraints,
    promptSections,
  }),
  computeGenerationPromptFingerprint({
    generationVersion: promptInput.generationVersion,
    requestedTask: fixture.brainResult.request.summary,
    expectedOutputType: fixture.brainResult.request.outputClass,
    contextPackageFingerprint: fixture.contextPackage.metadata.packageFingerprint,
    taskConstraints: fixture.brainResult.request.constraints,
    promptSections: buildGenerationPromptSections(promptInput),
  }),
);

const missingSectionReport = validateGenerationPromptSections(promptSections.slice(0, 11));
assert.equal(missingSectionReport.valid, false);
assert.equal(
  missingSectionReport.issues.some((issue) => issue.code === 'INVALID_PROMPT_SECTION_SHAPE'),
  true,
);

const duplicateSections = [...promptSections];
duplicateSections[11] = duplicateSections[0];
const duplicateSectionReport = validateGenerationPromptSections(duplicateSections);
assert.equal(duplicateSectionReport.valid, false);
assert.equal(
  duplicateSectionReport.issues.some((issue) => issue.code === 'DUPLICATE_PROMPT_SECTION'),
  true,
);
assert.equal(
  duplicateSectionReport.issues.some((issue) => issue.code === 'PROMPT_SECTION_ORDER_MISMATCH'),
  true,
);

const reorderedSections = [...promptSections];
[reorderedSections[0], reorderedSections[1]] = [reorderedSections[1], reorderedSections[0]];
const reorderedSectionReport = validateGenerationPromptSections(reorderedSections);
assert.equal(reorderedSectionReport.valid, false);
assert.equal(
  reorderedSectionReport.issues.some((issue) => issue.code === 'PROMPT_SECTION_ORDER_MISMATCH'),
  true,
);

const invalidSourceReport = validateGenerationPipelineSource({
  brainResult: fixture.brainResult,
  contextPackage: fixture.contextPackage,
  generationVersion: ' ',
  providerHints: ['Codex', ' '],
});
assert.equal(invalidSourceReport.valid, false);
assert.equal(
  invalidSourceReport.issues.some((issue) => issue.code === 'INVALID_GENERATION_VERSION'),
  true,
);
assert.equal(
  invalidSourceReport.issues.some((issue) => issue.code === 'INVALID_PROVIDER_HINT'),
  true,
);

const hintlessInput = {
  brainResult: fixture.brainResult,
  contextPackage: fixture.contextPackage,
  generationVersion: '1.0.0',
};

const hintedInput = {
  ...hintlessInput,
  providerHints: ['OpenRouter', ' Codex ', 'OpenRouter'],
};

const hintlessEnvelope = buildGenerationRequestEnvelope(hintlessInput);
const hintedEnvelope = buildGenerationRequestEnvelope(hintedInput);
const repeatedHintedEnvelope = buildGenerationRequestEnvelope(hintedInput);

assert.equal(hintlessEnvelope.status, 'READY');
assert.equal(hintlessEnvelope.blockedReason, undefined);
assert.deepEqual(hintlessEnvelope.request.configuration.providerHints, []);
assert.deepEqual(hintedEnvelope.request.configuration.providerHints, ['Codex', 'OpenRouter']);
assert.equal(hintlessEnvelope.request.promptFingerprint, hintedEnvelope.request.promptFingerprint);
assert.equal(hintlessEnvelope.request.metadata.generationFingerprint, hintedEnvelope.request.metadata.generationFingerprint);
assert.deepEqual(repeatedHintedEnvelope, hintedEnvelope);

assert.equal(hintedEnvelope.request.configuration.generationVersion, '1.0.0');
assert.equal(hintedEnvelope.request.configuration.promptVersion, '1.0.0');
assert.equal(hintedEnvelope.request.metadata.schemaVersion, '1.0.0');
assert.equal(hintedEnvelope.request.metadata.generationVersion, '1.0.0');
assert.equal(hintedEnvelope.request.metadata.requestId, fixture.brainResult.request.requestId);
assert.equal(hintedEnvelope.request.metadata.taskId, fixture.brainResult.request.taskId);
assert.equal(hintedEnvelope.request.metadata.sourceBrainSessionId, fixture.brainResult.session.sessionId);
assert.equal(hintedEnvelope.request.metadata.sourceContextPackageId, fixture.contextPackage.metadata.packageId);
assert.equal(
  hintedEnvelope.request.metadata.sourceContextPackageFingerprint,
  fixture.contextPackage.metadata.packageFingerprint,
);
assert.equal(hintedEnvelope.request.metadata.sourceBrainResponseStatus, 'ALLOW');
assert.equal(hintedEnvelope.request.metadata.sourceBrainPlanStatus, fixture.brainResult.executionPlan.status);
assert.equal(hintedEnvelope.request.metadata.expectedOutputType, fixture.brainResult.request.outputClass);
assert.equal(hintedEnvelope.request.metadata.providerHintCount, 2);
assert.equal(hintedEnvelope.request.metadata.promptSectionCount, GENERATION_PROMPT_SECTION_ORDER.length);
assert.equal(
  hintedEnvelope.request.metadata.requiredPromptSectionCount,
  GENERATION_PROMPT_SECTION_ORDER.length,
);
assert.deepEqual(
  hintedEnvelope.request.metadata.referencedArtifactIds,
  Array.from(
    new Set([
      ...fixture.brainResult.traceability.selectedArtifactIds,
      ...fixture.contextPackage.includedItems.map((item) => item.artifactId),
    ]),
  ).sort(),
);
assert.deepEqual(hintedEnvelope.request.promptSections.map((section) => section.sectionId), GENERATION_PROMPT_SECTION_ORDER);
assert.equal(
  hintedEnvelope.request.promptFingerprint,
  computeGenerationPromptFingerprint({
    generationVersion: '1.0.0',
    requestedTask: fixture.brainResult.request.summary,
    expectedOutputType: fixture.brainResult.request.outputClass,
    contextPackageFingerprint: fixture.contextPackage.metadata.packageFingerprint,
    taskConstraints: fixture.brainResult.request.constraints,
    promptSections: hintedEnvelope.request.promptSections,
  }),
);

assert.equal(validateGenerationRequestEnvelope(hintedEnvelope, hintlessInput).valid, true);
assert.equal(validateGenerationRequestEnvelope(hintedEnvelope, fixture).valid, true);
assert.equal(buildGenerationRequestSerialization(hintedEnvelope).generationFingerprint, hintedEnvelope.request.metadata.generationFingerprint);
assert.equal(serializeGenerationRequest(hintedEnvelope), hintedEnvelope.serialized);
assert.ok(hintedEnvelope.serialized.endsWith('\n'));

const loadedFromMemory = loadGenerationRequest(hintedEnvelope.serialized, fixture);
assert.deepStrictEqual(loadedFromMemory, hintedEnvelope);

const tempDir = await mkdtemp(join(tmpdir(), 'project-brain-generation-'));
const tempFile = join(tempDir, 'generation-request.json');
await writeFile(tempFile, hintedEnvelope.serialized, 'utf8');
assert.equal(await readFile(tempFile, 'utf8'), hintedEnvelope.serialized);

const loadedFromFile = await loadGenerationRequestFromFile(tempFile, fixture);
assert.deepStrictEqual(loadedFromFile, hintedEnvelope);
await rm(tempDir, { recursive: true, force: true });

assert.equal(
  hintedEnvelope.diagnostics.map((event) => event.stage).join(','),
  'request,context,prompt,ordering,fingerprint,serialization,validation,result',
);
assert.deepEqual(
  hintedEnvelope.diagnostics.map((event) => event.code),
  [
    'GENERATION_REQUEST_NORMALIZED',
    'GENERATION_CONTEXT_READY',
    'GENERATION_PROMPT_ASSEMBLED',
    'GENERATION_PROMPT_ORDERED',
    'GENERATION_PROMPT_FINGERPRINTED',
    'GENERATION_SERIALIZATION_READY',
    'GENERATION_VALIDATION_READY',
    'GENERATION_READY',
  ],
);
assert.equal(
  hintedEnvelope.diagnostics.every((event, index) => event.index === index + 1),
  true,
);

const blockedEnvelope = buildGenerationRequestEnvelope({
  brainResult: fixture.brainResult,
  contextPackage: fixture.blockedContextPackage,
  generationVersion: '1.0.0',
});

assert.equal(blockedEnvelope.status, 'BLOCKED');
assert.equal(
  blockedEnvelope.blockedReason,
  `Context package ${fixture.blockedContextPackage.metadata.packageId} is blocked.`,
);
assert.equal(
  blockedEnvelope.validationFailures.length,
  0,
);
assert.equal(validateGenerationRequestEnvelope(blockedEnvelope, {
  brainResult: fixture.brainResult,
  contextPackage: fixture.blockedContextPackage,
}).valid, true);
assert.deepEqual(
  blockedEnvelope.diagnostics.map((event) => event.code),
  [
    'GENERATION_REQUEST_NORMALIZED',
    'GENERATION_CONTEXT_BLOCKED',
    'GENERATION_PROMPT_ASSEMBLED',
    'GENERATION_PROMPT_ORDERED',
    'GENERATION_PROMPT_FINGERPRINTED',
    'GENERATION_SERIALIZATION_READY',
    'GENERATION_VALIDATION_READY',
    'GENERATION_BLOCKED',
  ],
);

const reloadedBlockedEnvelope = loadGenerationRequest(blockedEnvelope.serialized, {
  brainResult: fixture.brainResult,
  contextPackage: fixture.blockedContextPackage,
});
assert.deepStrictEqual(reloadedBlockedEnvelope, blockedEnvelope);

const tamperedEnvelope = JSON.parse(hintedEnvelope.serialized);
delete tamperedEnvelope.request.configuration.providerHints;
tamperedEnvelope.request.promptSections = [null, ...tamperedEnvelope.request.promptSections.slice(1)];

const tamperedValidation = validateGenerationRequestEnvelope(tamperedEnvelope, fixture);
assert.equal(tamperedValidation.valid, false);
assert.equal(
  tamperedValidation.issues.some((issue) => issue.code === 'INVALID_PROVIDER_HINT'),
  true,
);
assert.equal(
  tamperedValidation.issues.some((issue) => issue.code === 'INVALID_GENERATION_REQUEST_SHAPE'),
  true,
);
assert.throws(
  () => loadGenerationRequest(tamperedEnvelope, fixture),
  /Invalid generation request:/,
);

assert.equal(
  hintlessEnvelope.request.promptFingerprint === hintedEnvelope.request.promptFingerprint,
  true,
);
assert.equal(
  hintlessEnvelope.request.metadata.generationFingerprint === hintedEnvelope.request.metadata.generationFingerprint,
  true,
);

console.log('Package E generation pipeline tests passed.');
