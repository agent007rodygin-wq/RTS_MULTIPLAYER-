import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  DEFAULT_VALIDATION_RULES,
  VALIDATION_CATEGORY_ORDER,
  VALIDATION_DECISION_ORDER,
  VALIDATION_SEVERITY_ORDER,
  VALIDATION_STAGE_ORDER,
  buildContextPackage,
  buildGenerationRequestEnvelope,
  buildValidationReport,
  buildValidationReportCandidate,
  buildValidationRequestFingerprint,
  createArtifactReference,
  createBrainRequest,
  createCanonicalRegistry,
  createContextPackageBuildRequest,
  createKnowledgeArtifactRevision,
  createKnowledgeStore,
  evaluateBrainAuthority,
  loadValidationReport,
  loadValidationReportFromFile,
  runBrainEngine,
  runValidationEngine,
  serializeGenerationRequest,
  serializeContextPackage,
  serializeValidationReport,
  supersedeKnowledgeRevision,
  validateValidationPipelineSourceShape,
  validateValidationReportSource,
} from '../../src/project-brain/index.ts';

function clone(value) {
  return structuredClone(value);
}

function buildValidationFixture() {
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
    purpose: 'Package F validation coverage',
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
    purpose: 'Package F validation coverage',
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
  assert.equal(contextPackage.status, 'READY');

  const generationResult = buildGenerationRequestEnvelope({
    brainResult,
    contextPackage,
    generationVersion: '1.0.0',
    providerHints: ['OpenRouter', 'Codex'],
  });

  assert.equal(generationResult.status, 'READY');
  assert.equal(generationResult.blockedReason, undefined);

  return {
    registry,
    store: superseded.store,
    brainResult,
    authority,
    contextPackage,
    generationResult,
  };
}

const fixture = buildValidationFixture();

const validationInput = {
  brainResult: fixture.brainResult,
  contextPackage: fixture.contextPackage,
  generationResult: fixture.generationResult,
  registry: fixture.registry,
  store: fixture.store,
  validationVersion: '1.0.0',
};

assert.deepEqual(VALIDATION_STAGE_ORDER, [
  'input',
  'generation',
  'authority',
  'context',
  'dependency',
  'traceability',
  'constraint',
  'fingerprint',
  'serialization',
  'diagnostics',
]);

assert.deepEqual(VALIDATION_CATEGORY_ORDER, [
  'Integrity',
  'Authority',
  'Context',
  'Dependency',
  'Registry',
  'Knowledge',
  'Lifecycle',
  'Generation',
  'Serialization',
  'Traceability',
  'Constraints',
  'Diagnostics',
]);

assert.deepEqual(VALIDATION_SEVERITY_ORDER, ['Info', 'Warning', 'Error', 'Blocked', 'Fatal']);
assert.deepEqual(VALIDATION_DECISION_ORDER, ['READY', 'READY_WITH_WARNINGS', 'FAILED', 'BLOCKED', 'INVALID']);
assert.equal(DEFAULT_VALIDATION_RULES.length, 10);
assert.deepEqual(
  DEFAULT_VALIDATION_RULES.map((rule) => rule.ruleId),
  [
    'VALIDATION-RULE-001',
    'VALIDATION-RULE-002',
    'VALIDATION-RULE-003',
    'VALIDATION-RULE-004',
    'VALIDATION-RULE-005',
    'VALIDATION-RULE-006',
    'VALIDATION-RULE-007',
    'VALIDATION-RULE-008',
    'VALIDATION-RULE-009',
    'VALIDATION-RULE-010',
  ],
);
assert.deepEqual(
  DEFAULT_VALIDATION_RULES.map((rule) => rule.executionStage),
  VALIDATION_STAGE_ORDER,
);

const missingShape = validateValidationPipelineSourceShape({
  brainResult: fixture.brainResult,
  contextPackage: fixture.contextPackage,
});

assert.equal(missingShape.valid, false);
assert.equal(missingShape.issueCount, 3);
assert.equal(
  missingShape.issues.some((issue) => issue.code === 'INVALID_VALIDATION_REQUEST_SHAPE'),
  true,
);
assert.equal(
  missingShape.issues.some((issue) => issue.message.includes('generationResult')),
  true,
);

const validationCheck = validateValidationPipelineSourceShape(validationInput);
assert.equal(validationCheck.valid, true);

const baselineReport = runValidationEngine(validationInput);
const repeatedBaselineReport = runValidationEngine(validationInput);
const rebuiltBaselineReport = buildValidationReport(validationInput);
const candidateBaselineReport = buildValidationReportCandidate(validationInput);

assert.equal(baselineReport.overallDecision, 'READY');
assert.equal(baselineReport.result.overallDecision, 'READY');
assert.equal(baselineReport.summary.overallDecision, 'READY');
assert.deepEqual(
  baselineReport.executedRules.map((rule) => rule.ruleId),
  DEFAULT_VALIDATION_RULES.map((rule) => rule.ruleId),
);
assert.deepEqual(
  baselineReport.passedRules.map((rule) => rule.ruleId),
  DEFAULT_VALIDATION_RULES.map((rule) => rule.ruleId),
);
assert.equal(baselineReport.failedRules.length, 0);
assert.equal(baselineReport.skippedRules.length, 0);
assert.deepEqual(
  baselineReport.diagnostics.map((event) => event.stage),
  [
    'request',
    'generation',
    'authority',
    'context',
    'dependency',
    'traceability',
    'constraint',
    'fingerprint',
    'serialization',
    'diagnostics',
    'result',
  ],
);
assert.deepEqual(
  baselineReport.diagnostics.map((event) => event.index),
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
);
assert.equal(baselineReport.result.metadata.validationFingerprint, baselineReport.result.fingerprint);
assert.equal(baselineReport.summary.validationFingerprint, baselineReport.result.fingerprint);
assert.equal(baselineReport.traceability.validationFingerprint, baselineReport.result.fingerprint);
assert.deepEqual(
  baselineReport.traceability.ruleIds,
  DEFAULT_VALIDATION_RULES.map((rule) => rule.ruleId),
);
assert.deepEqual(baselineReport, repeatedBaselineReport);
assert.deepEqual(baselineReport, rebuiltBaselineReport);
assert.deepEqual(baselineReport, candidateBaselineReport);
assert.equal(
  baselineReport.request.metadata.validationRequestFingerprint,
  buildValidationRequestFingerprint({
    validationVersion: baselineReport.request.validationVersion,
    validationRequestId: baselineReport.request.validationRequestId,
    brainResult: validationInput.brainResult,
    contextPackage: validationInput.contextPackage,
    generationResult: validationInput.generationResult,
    registryFingerprint: baselineReport.request.registryFingerprint,
    storeFingerprint: baselineReport.request.storeFingerprint,
    sourceRegistryArtifactCount: validationInput.registry.entries.length,
    sourceStoreRevisionCount: validationInput.store.revisions.length,
    referencedArtifactIds: baselineReport.request.metadata.referencedArtifactIds,
  }),
);
assert.equal(serializeValidationReport(baselineReport), baselineReport.serialized);
assert.equal(baselineReport.serialized.endsWith('\n'), true);
assert.equal(validateValidationReportSource(baselineReport).valid, true);

const reloadedBaselineReport = loadValidationReport(baselineReport.serialized);
assert.equal(reloadedBaselineReport.serialized, baselineReport.serialized);
assert.equal(reloadedBaselineReport.result.fingerprint, baselineReport.result.fingerprint);
assert.equal(reloadedBaselineReport.result.overallDecision, baselineReport.result.overallDecision);
assert.equal(
  reloadedBaselineReport.request.metadata.validationRequestFingerprint,
  baselineReport.request.metadata.validationRequestFingerprint,
);

const tempDir = await mkdtemp(join(tmpdir(), 'project-brain-validation-'));
const tempFile = join(tempDir, 'validation-report.json');
await writeFile(tempFile, baselineReport.serialized, 'utf8');
assert.equal(await readFile(tempFile, 'utf8'), baselineReport.serialized);
const reloadedFromFile = await loadValidationReportFromFile(tempFile);
assert.equal(reloadedFromFile.serialized, baselineReport.serialized);
assert.equal(reloadedFromFile.result.fingerprint, baselineReport.result.fingerprint);
assert.equal(reloadedFromFile.summary.validationFingerprint, baselineReport.summary.validationFingerprint);
await rm(tempDir, { recursive: true, force: true });

assert.throws(
  () => loadValidationReport(baselineReport.serialized.trimEnd()),
  /SERIALIZATION_MISMATCH/,
);

const warningInput = clone(validationInput);
warningInput.generationResult = clone(validationInput.generationResult);
warningInput.generationResult.diagnostics = [];
warningInput.generationResult.serialized = serializeGenerationRequest(warningInput.generationResult);
const warningReport = runValidationEngine(warningInput);
assert.equal(warningReport.overallDecision, 'READY_WITH_WARNINGS');
assert.equal(warningReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-010'), true);

const blockedInput = clone(validationInput);
blockedInput.brainResult = clone(validationInput.brainResult);
blockedInput.brainResult.status = 'BLOCKED';
blockedInput.brainResult.response.status = 'BLOCKED';
blockedInput.brainResult.executionPlan.status = 'BLOCKED';
blockedInput.contextPackage = clone(validationInput.contextPackage);
blockedInput.contextPackage.sourceBrainResponseStatus = 'BLOCKED';
blockedInput.contextPackage.metadata.sourceBrainResponseStatus = 'BLOCKED';
blockedInput.contextPackage.metadata.sourceBrainAuthorityStatus = 'BLOCKED';
blockedInput.contextPackage.metadata.sourceBrainPlanStatus = 'BLOCKED';
blockedInput.generationResult = clone(validationInput.generationResult);
blockedInput.generationResult.status = 'READY';
blockedInput.generationResult.request.sourceBrainResponseStatus = 'BLOCKED';
blockedInput.generationResult.request.metadata.sourceBrainResponseStatus = 'BLOCKED';
blockedInput.generationResult.request.sourceBrainPlanStatus = 'BLOCKED';
blockedInput.generationResult.request.metadata.sourceBrainPlanStatus = 'BLOCKED';
blockedInput.generationResult.serialized = serializeGenerationRequest(blockedInput.generationResult);
blockedInput.contextPackage.serialized = serializeContextPackage(blockedInput.contextPackage);
const blockedReport = runValidationEngine(blockedInput);
assert.equal(blockedReport.overallDecision, 'BLOCKED');
assert.equal(blockedReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-002'), true);

const authorityInput = clone(validationInput);
authorityInput.brainResult = clone(validationInput.brainResult);
authorityInput.brainResult.status = 'BLOCKED';
authorityInput.contextPackage = clone(validationInput.contextPackage);
authorityInput.contextPackage.metadata.sourceBrainAuthorityStatus = 'BLOCKED';
authorityInput.contextPackage.serialized = serializeContextPackage(authorityInput.contextPackage);
const authorityReport = runValidationEngine(authorityInput);
assert.equal(authorityReport.overallDecision, 'BLOCKED');
assert.equal(authorityReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-003'), true);

const contextInput = clone(validationInput);
contextInput.contextPackage = clone(validationInput.contextPackage);
contextInput.contextPackage.metadata.includedCount += 1;
contextInput.contextPackage.serialized = serializeContextPackage(contextInput.contextPackage);
const contextReport = runValidationEngine(contextInput);
assert.equal(contextReport.overallDecision, 'BLOCKED');
assert.equal(contextReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-004'), true);

const dependencyInput = clone(validationInput);
dependencyInput.generationResult = clone(validationInput.generationResult);
dependencyInput.generationResult.request.metadata.referencedArtifactIds = ['PB-CONSTITUTION-001'];
dependencyInput.generationResult.serialized = serializeGenerationRequest(dependencyInput.generationResult);
const dependencyReport = runValidationEngine(dependencyInput);
assert.equal(dependencyReport.overallDecision, 'FAILED');
assert.equal(dependencyReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-005'), true);

const traceabilityInput = clone(validationInput);
traceabilityInput.brainResult = clone(validationInput.brainResult);
traceabilityInput.brainResult.traceability = clone(validationInput.brainResult.traceability);
traceabilityInput.brainResult.traceability.entries = traceabilityInput.brainResult.traceability.entries.map(
  (entry, index) => (index === 0 ? { ...entry, rationale: '' } : entry),
);
const traceabilityReport = runValidationEngine(traceabilityInput);
assert.equal(traceabilityReport.overallDecision, 'FAILED');
assert.equal(traceabilityReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-006'), true);

const constraintInput = clone(validationInput);
constraintInput.generationResult = clone(validationInput.generationResult);
constraintInput.generationResult.request.constraints = clone(validationInput.generationResult.request.constraints);
constraintInput.generationResult.request.constraints.validationRequirements = [];
constraintInput.generationResult.serialized = serializeGenerationRequest(constraintInput.generationResult);
const constraintReport = runValidationEngine(constraintInput);
assert.equal(constraintReport.overallDecision, 'FAILED');
assert.equal(constraintReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-007'), true);

const fingerprintInput = clone(validationInput);
fingerprintInput.generationResult = clone(validationInput.generationResult);
fingerprintInput.generationResult.request.metadata.generationFingerprint = 'GENERATION-REQUEST::00000000';
fingerprintInput.generationResult.serialized = serializeGenerationRequest(fingerprintInput.generationResult);
const fingerprintReport = runValidationEngine(fingerprintInput);
assert.equal(fingerprintReport.overallDecision, 'INVALID');
assert.equal(fingerprintReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-008'), true);

const serializationInput = clone(validationInput);
serializationInput.contextPackage = clone(validationInput.contextPackage);
serializationInput.contextPackage.serialized = serializationInput.contextPackage.serialized.trimEnd();
const serializationReport = runValidationEngine(serializationInput);
assert.equal(serializationReport.overallDecision, 'INVALID');
assert.equal(serializationReport.failedRules.some((rule) => rule.ruleId === 'VALIDATION-RULE-009'), true);

assert.equal(validateValidationReportSource(clone(baselineReport)).valid, true);
const tamperedReport = clone(baselineReport);
tamperedReport.overallDecision = 'FAILED';
assert.equal(validateValidationReportSource(tamperedReport).valid, false);

console.log('Package F validation engine tests passed.');
