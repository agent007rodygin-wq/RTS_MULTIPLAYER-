import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { BrainEngineResult } from './brain-response.ts';
import { createCanonicalRegistry, validateCanonicalRegistry, type CanonicalRegistry } from './canonical-registry.ts';
import { buildContextPackage } from './context-builder.ts';
import type { ContextPackageResult } from './context-item.ts';
import { createBrainRequest } from './brain-request.ts';
import { createKnowledgeStore, validateKnowledgeStore, type KnowledgeStore } from './knowledge-store.ts';
import { runBrainEngine } from './brain-engine.ts';
import { buildGenerationRequestEnvelope } from './generation-builder.ts';
import { computeGenerationRequestFingerprint, validateGenerationRequestEnvelope } from './generation-validation.ts';
import { serializeGenerationRequest } from './generation-serialization.ts';
import { serializeContextPackage } from './context-serialization.ts';
import {
  buildValidationRequestFingerprint,
  createValidationRequest,
  validateValidationPipelineSource,
  type ValidationPipelineInput,
  type ValidationRequest,
} from './validation-request.ts';
import { createValidationSession, type ValidationSession } from './validation-session.ts';
import {
  buildValidationResult,
  determineValidationOverallDecision,
  type ValidationResult,
} from './validation-result.ts';
import { buildValidationSummary, type ValidationSummary } from './validation-summary.ts';
import {
  appendValidationDiagnosticEvent,
  buildValidationDiagnostics,
  type ValidationDiagnosticEvent,
} from './validation-diagnostics.ts';
import {
  buildValidationReportFingerprint,
  buildValidationTraceability,
  createValidationGenerationSessionSnapshot,
  freezeValidationReport,
  type ValidationReport,
} from './validation-report.ts';
import {
  createValidationRuleResult,
  type ValidationRule,
  type ValidationRuleResult,
} from './validation-rule.ts';
import type { ValidationCategory } from './validation-categories.ts';
import type { ValidationSeverity } from './validation-severity.ts';

export const DEFAULT_VALIDATION_RULES: readonly ValidationRule[] = deepFreeze([
  {
    ruleId: 'VALIDATION-RULE-001',
    category: 'Integrity',
    description: 'Validation input must be structurally complete and source objects must exist.',
    severity: 'Fatal',
    executionStage: 'input',
    deterministicOutcome: 'INVALID',
  },
  {
    ruleId: 'VALIDATION-RULE-002',
    category: 'Generation',
    description: 'Generation result integrity must remain deterministic and internally consistent.',
    severity: 'Blocked',
    executionStage: 'generation',
    deterministicOutcome: 'BLOCKED',
  },
  {
    ruleId: 'VALIDATION-RULE-003',
    category: 'Authority',
    description: 'Authority chain must agree with the canonical source chain.',
    severity: 'Blocked',
    executionStage: 'authority',
    deterministicOutcome: 'BLOCKED',
  },
  {
    ruleId: 'VALIDATION-RULE-004',
    category: 'Context',
    description: 'Context package must remain complete and frozen.',
    severity: 'Blocked',
    executionStage: 'context',
    deterministicOutcome: 'BLOCKED',
  },
  {
    ruleId: 'VALIDATION-RULE-005',
    category: 'Dependency',
    description: 'Dependency chain and reference coverage must be complete and non-duplicated.',
    severity: 'Error',
    executionStage: 'dependency',
    deterministicOutcome: 'FAILED',
  },
  {
    ruleId: 'VALIDATION-RULE-006',
    category: 'Traceability',
    description: 'Traceability must explain the generated result and its source artifacts.',
    severity: 'Error',
    executionStage: 'traceability',
    deterministicOutcome: 'FAILED',
  },
  {
    ruleId: 'VALIDATION-RULE-007',
    category: 'Constraints',
    description: 'Constraint compliance must stay aligned with the approved generation contract.',
    severity: 'Error',
    executionStage: 'constraint',
    deterministicOutcome: 'FAILED',
  },
  {
    ruleId: 'VALIDATION-RULE-008',
    category: 'Serialization',
    description: 'Fingerprint and serialization checks must be reproducible byte-for-byte.',
    severity: 'Fatal',
    executionStage: 'fingerprint',
    deterministicOutcome: 'INVALID',
  },
  {
    ruleId: 'VALIDATION-RULE-009',
    category: 'Serialization',
    description: 'Validation serialization must round-trip without repair.',
    severity: 'Fatal',
    executionStage: 'serialization',
    deterministicOutcome: 'INVALID',
  },
  {
    ruleId: 'VALIDATION-RULE-010',
    category: 'Diagnostics',
    description: 'Diagnostics must remain complete, ordered, and attributable.',
    severity: 'Warning',
    executionStage: 'diagnostics',
    deterministicOutcome: 'READY_WITH_WARNINGS',
  },
]);

export interface ValidationPipelineCheck {
  valid: boolean;
  issueCount: number;
  issues: readonly { code: string; message: string; ruleId?: string; category?: ValidationCategory; severity?: ValidationSeverity }[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildRuleResult(
  rule: ValidationRule,
  status: ValidationRuleResult['status'],
  code: string,
  message: string,
  details?: string,
  artifactId?: string,
  relatedArtifactId?: string,
): ValidationRuleResult {
  return createValidationRuleResult({
    ...rule,
    status,
    code,
    message,
    details,
    artifactId,
    relatedArtifactId,
  });
}

function joinMessages(messages: readonly string[]): string {
  return messages.length > 0 ? messages.join('; ') : 'Validation succeeded.';
}

function compareArtifactIdSets(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function evaluateInputStage(request: ValidationRequest): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[0];
  const issues: string[] = [];

  if (!request.validationRequestId || !request.validationVersion) {
    issues.push('Validation request identity is missing.');
  }

  if (!request.brainResult || !request.contextPackage || !request.generationResult) {
    issues.push('Validation source objects are incomplete.');
  }

  if (!request.registryFingerprint || !request.storeFingerprint) {
    issues.push('Registry or store fingerprint is missing.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'INVALID_VALIDATION_REQUEST_SHAPE', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_INPUT_READY', 'Validation input is structurally complete.');
}

function evaluateGenerationStage(input: ValidationPipelineInput, request: ValidationRequest): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[1];
  const validation = validateGenerationRequestEnvelope(input.generationResult, {
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
  });
  const issues = validation.issues.map((issue) => issue.message);

  if (input.generationResult.request.requestId !== input.brainResult.request.requestId) {
    issues.push('Generation requestId does not match the source Brain request.');
  }

  if (input.generationResult.request.taskId !== input.brainResult.request.taskId) {
    issues.push('Generation taskId does not match the source Brain request.');
  }

  if (input.generationResult.request.expectedOutputType !== input.brainResult.request.outputClass) {
    issues.push('Generation output type does not match the source Brain request output class.');
  }

  if (input.generationResult.status === 'BLOCKED' && !input.generationResult.blockedReason) {
    issues.push('Blocked generation results must carry a blocked reason.');
  }

  if (input.generationResult.status === 'READY' && input.generationResult.blockedReason !== undefined) {
    issues.push('Ready generation results must not carry a blocked reason.');
  }

  if (request.metadata.validationRequestFingerprint.length === 0) {
    issues.push('Validation request fingerprint is missing.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'INVALID_GENERATION_RESULT', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_GENERATION_READY', 'Generation result validation passed.');
}

function evaluateAuthorityStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[2];
  const registryValidation = validateCanonicalRegistry(input.registry);
  const storeValidation = validateKnowledgeStore(input.store);
  const issues: string[] = [];

  if (!registryValidation.valid) {
    issues.push(...registryValidation.issues.map((issue) => issue.message));
  }

  if (!storeValidation.valid) {
    issues.push(...storeValidation.issues.map((issue) => issue.message));
  }

  if (input.brainResult.response.status === 'BLOCKED' && input.generationResult.status === 'READY') {
    issues.push('Blocked Brain output must propagate into a blocked generation result.');
  }

  if (input.brainResult.response.status === 'ALLOW' && input.generationResult.status === 'BLOCKED' && !input.generationResult.blockedReason) {
    issues.push('Unexpected blocked generation result must explain the authority failure.');
  }

  if (input.brainResult.status === 'BLOCKED' && input.brainResult.response.status !== 'BLOCKED') {
    issues.push('Blocked Brain authority must align with a blocked Brain response.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'AUTHORITY_CHAIN_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_AUTHORITY_READY', 'Authority chain is consistent.');
}

function evaluateContextStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[3];
  const issues: string[] = [];

  if (input.contextPackage.contextRequestId.length === 0) {
    issues.push('Context request ID is missing.');
  }

  if (input.contextPackage.sourceBrainSessionId !== input.brainResult.session.sessionId) {
    issues.push('Context package session does not match the source Brain session.');
  }

  if (input.contextPackage.sourceBrainResponseStatus !== input.brainResult.response.status) {
    issues.push('Context package response status does not match the source Brain response.');
  }

  if (input.contextPackage.metadata.sourceBrainAuthorityStatus !== (input.brainResult.status === 'ALLOW' ? 'ALLOWED' : 'BLOCKED')) {
    issues.push('Context package authority status does not match the source Brain authority status.');
  }

  if (input.contextPackage.metadata.sourceBrainPlanStatus !== input.brainResult.executionPlan.status) {
    issues.push('Context package plan status does not match the Brain execution plan.');
  }

  if (input.contextPackage.metadata.sourceBrainDependencyNodeCount !== input.brainResult.dependencyGraph.nodes.length) {
    issues.push('Context package dependency count does not match the Brain dependency graph.');
  }

  if (input.contextPackage.metadata.includedCount !== input.contextPackage.includedItems.length) {
    issues.push('Context package included-count metadata does not match the included items.');
  }

  if (input.contextPackage.metadata.excludedCount !== input.contextPackage.excludedItems.length) {
    issues.push('Context package excluded-count metadata does not match the excluded items.');
  }

  if (input.contextPackage.metadata.traceabilityLinkCount !== input.contextPackage.traceabilityLinks.length) {
    issues.push('Context package traceability-count metadata does not match the traceability links.');
  }

  for (const item of input.contextPackage.includedItems) {
    const registryEntry = input.registry.entries.find((entry) => entry.artifactId === item.artifactId);
    if (!registryEntry) {
      issues.push(`Missing registry entry for context item ${item.artifactId}.`);
      continue;
    }

    if (
      item.registryIdentity.artifactType !== registryEntry.artifactType ||
      item.registryIdentity.canonicalRole !== registryEntry.canonicalRole ||
      item.registryIdentity.authoritySource !== registryEntry.authoritySource ||
      item.registryIdentity.owner !== registryEntry.owner ||
      item.registryIdentity.sourceRevision !== registryEntry.sourceRevision
    ) {
      issues.push(`Context item ${item.artifactId} does not match its registry identity.`);
    }

    const latestRevision = input.store.revisions.find((revision) => revision.artifactId === item.artifactId);
    if (!latestRevision) {
      issues.push(`Missing knowledge revision for context item ${item.artifactId}.`);
      continue;
    }

    if (
      item.revision.revisionId !== latestRevision.revisionId ||
      item.revision.sourceRevision !== latestRevision.sourceRevision ||
      item.revision.storageKind !== latestRevision.storageKind ||
      item.revision.lifecycleState !== latestRevision.lifecycleState ||
      item.revision.freshnessState !== latestRevision.freshnessState
    ) {
      issues.push(`Context item ${item.artifactId} revision does not match the knowledge store.`);
    }
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'CONTEXT_PACKAGE_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_CONTEXT_READY', 'Context package is internally consistent.');
}

function evaluateDependencyStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[4];
  const issues: string[] = [];
  const referencedArtifactIds = input.generationResult.request.metadata.referencedArtifactIds;
  const sourceArtifactIds = Array.from(
    new Set([
      ...input.brainResult.traceability.selectedArtifactIds,
      ...input.contextPackage.includedItems.map((item) => item.artifactId),
    ]),
  ).sort();

  if (!compareArtifactIdSets(referencedArtifactIds, Array.from(new Set(referencedArtifactIds)).sort())) {
    issues.push('Referenced artifact IDs contain duplicates or are not sorted deterministically.');
  }

  if (!compareArtifactIdSets(referencedArtifactIds, sourceArtifactIds)) {
    issues.push('Referenced artifact IDs do not match the Brain traceability and context package sources.');
  }

  for (const artifactId of referencedArtifactIds) {
    if (artifactId !== artifactId.toUpperCase()) {
      issues.push(`Referenced artifact ID ${artifactId} is not canonical.`);
    }
  }

  if (input.brainResult.dependencyGraph.nodes.length === 0) {
    issues.push('Dependency graph must contain at least one node.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'DEPENDENCY_CHAIN_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_DEPENDENCY_READY', 'Dependency chain is consistent.');
}

function evaluateTraceabilityStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[5];
  const issues: string[] = [];
  const traceabilityIds = Array.from(new Set(input.brainResult.traceability.selectedArtifactIds)).sort();
  const resultReferenceIds = Array.from(new Set(input.generationResult.request.metadata.referencedArtifactIds)).sort();

  if (!compareArtifactIdSets(traceabilityIds, resultReferenceIds)) {
    issues.push('Brain traceability and generation referenced artifact IDs do not match.');
  }

  if (input.brainResult.traceability.entries.length !== input.brainResult.dependencyGraph.nodes.length) {
    issues.push('Brain traceability entries do not cover every dependency graph node.');
  }

  for (const entry of input.brainResult.traceability.entries) {
    if (!entry.artifactId || !entry.rationale) {
      issues.push('Traceability entries must describe each artifact deterministically.');
    }
  }

  if (input.contextPackage.traceabilityLinks.length === 0) {
    issues.push('Context package traceability links are missing.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'TRACEABILITY_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_TRACEABILITY_READY', 'Traceability is complete.');
}

function evaluateConstraintStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[6];
  const issues: string[] = [];
  const requestedConstraints = Array.from(new Set(input.brainResult.request.constraints)).sort();
  const generationConstraints = Array.from(new Set(input.generationResult.request.constraints.taskConstraints)).sort();

  if (!compareArtifactIdSets(requestedConstraints, generationConstraints)) {
    issues.push('Generation constraints do not match the Brain request constraints.');
  }

  if (input.generationResult.request.constraints.validationRequirements.length === 0) {
    issues.push('Generation validation requirements must not be empty.');
  }

  if (input.generationResult.request.expectedOutputType !== input.brainResult.request.outputClass) {
    issues.push('Expected output type does not match the Brain request output class.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'CONSTRAINT_VALIDATION_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_CONSTRAINT_READY', 'Constraint compliance is intact.');
}

function evaluateFingerprintStage(input: ValidationPipelineInput, request: ValidationRequest): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[7];
  const issues: string[] = [];
  const expectedGenerationFingerprint = computeGenerationRequestFingerprint(input.generationResult.request);
  const expectedValidationRequestFingerprint = buildValidationRequestFingerprint({
    validationVersion: request.validationVersion,
    validationRequestId: request.validationRequestId,
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    generationResult: input.generationResult,
    registryFingerprint: request.registryFingerprint,
    storeFingerprint: request.storeFingerprint,
    sourceRegistryArtifactCount: input.registry.entries.length,
    sourceStoreRevisionCount: input.store.revisions.length,
    referencedArtifactIds: request.metadata.referencedArtifactIds,
  });

  if (input.generationResult.request.metadata.generationFingerprint !== expectedGenerationFingerprint) {
    issues.push('Generation fingerprint must match the canonical generation request fingerprint.');
  }

  if (request.metadata.validationRequestFingerprint !== expectedValidationRequestFingerprint) {
    issues.push('Validation request fingerprint must match the canonical validation request fingerprint.');
  }

  if (input.contextPackage.metadata.packageFingerprint.length === 0) {
    issues.push('Context package fingerprint must be present.');
  }

  if (input.contextPackage.metadata.packageFingerprint !== input.contextPackage.metadata.packageFingerprint.trim()) {
    issues.push('Context package fingerprint must be canonical.');
  }

  if (input.registry.entries.length !== request.metadata.sourceRegistryArtifactCount) {
    issues.push('Registry count metadata does not match the registry input.');
  }

  if (input.store.revisions.length !== request.metadata.sourceStoreRevisionCount) {
    issues.push('Store revision count metadata does not match the store input.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'FINGERPRINT_VALIDATION_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_FINGERPRINT_READY', 'Fingerprint validation passed.');
}

function evaluateSerializationStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[8];
  const issues: string[] = [];

  if (serializeGenerationRequest(input.generationResult) !== input.generationResult.serialized) {
    issues.push('Generation result serialization does not round-trip deterministically.');
  }

  if (serializeContextPackage(input.contextPackage) !== input.contextPackage.serialized) {
    issues.push('Context package serialization does not round-trip deterministically.');
  }

  return issues.length > 0
    ? buildRuleResult(rule, 'FAILED', 'SERIALIZATION_INVALID', joinMessages(issues))
    : buildRuleResult(rule, 'PASSED', 'VALIDATION_SERIALIZATION_READY', 'Serialization checks passed.');
}

function evaluateDiagnosticsStage(input: ValidationPipelineInput): ValidationRuleResult {
  const rule = DEFAULT_VALIDATION_RULES[9];
  const issues: string[] = [];

  if (input.brainResult.diagnostics.length === 0) {
    issues.push('Brain diagnostics are missing.');
  }

  if (input.contextPackage.diagnostics.length === 0) {
    issues.push('Context diagnostics are missing.');
  }

  if (input.generationResult.diagnostics.length === 0) {
    issues.push('Generation diagnostics are missing.');
  }

  if (issues.length === 0) {
    return buildRuleResult(rule, 'PASSED', 'VALIDATION_DIAGNOSTICS_READY', 'Diagnostics are complete.');
  }

  return buildRuleResult(rule, 'FAILED', 'VALIDATION_DIAGNOSTICS_INCOMPLETE', joinMessages(issues));
}

function buildValidationReportFromEvaluation(input: ValidationPipelineInput): ValidationReport {
  const request = createValidationRequest(input);
  const validationSession = createValidationSession(request);
  const generationSession = createValidationGenerationSessionSnapshot(request);

  const ruleResults = [
    evaluateInputStage(request),
    evaluateGenerationStage(input, request),
    evaluateAuthorityStage(input),
    evaluateContextStage(input),
    evaluateDependencyStage(input),
    evaluateTraceabilityStage(input),
    evaluateConstraintStage(input),
    evaluateFingerprintStage(input, request),
    evaluateSerializationStage(input),
    evaluateDiagnosticsStage(input),
  ];

  const validationResult = buildValidationResult({
    request,
    session: validationSession,
    ruleResults,
  });
  const summary = buildValidationSummary(validationResult);
  const traceability = buildValidationTraceability({
    request,
    session: validationSession,
    result: validationResult,
    rules: ruleResults,
  });
  const diagnostics = buildValidationDiagnostics({
    session: validationSession,
    ruleResults,
    result: validationResult,
    summary,
  });

  const report = freezeValidationReport({
    schemaVersion: '1.0.0',
    request,
    validationSession,
    generationSession,
    contextPackage: input.contextPackage,
    executedRules: ruleResults.filter((rule) => rule.status !== 'SKIPPED'),
    passedRules: validationResult.passedChecks,
    failedRules: [
      ...validationResult.warnings,
      ...validationResult.errors,
      ...validationResult.blockedReasons,
      ...validationResult.fatalFailures,
    ],
    skippedRules: validationResult.skippedChecks,
    diagnostics,
    result: validationResult,
    summary,
    traceability,
    overallDecision: validationResult.overallDecision,
    serialized: '',
  });

  const validationFingerprint = buildValidationReportFingerprint({
    request,
    session: validationSession,
    generationSession,
    contextPackage: input.contextPackage,
    executedRules: ruleResults,
    diagnostics,
    result: validationResult,
    summary,
    traceability,
    overallDecision: validationResult.overallDecision,
  });

  const finalizedResult = buildValidationResult({
    request,
    session: validationSession,
    ruleResults,
  });
  const finalizedSummary = buildValidationSummary(finalizedResult);
  const finalizedTraceability = buildValidationTraceability({
    request,
    session: validationSession,
    result: finalizedResult,
    rules: ruleResults,
  });
  const finalizedDiagnostics = buildValidationDiagnostics({
    session: validationSession,
    ruleResults,
    result: finalizedResult,
    summary: finalizedSummary,
  });

  const finalizedReport = freezeValidationReport({
    ...report,
    executedRules: ruleResults.filter((rule) => rule.status !== 'SKIPPED'),
    passedRules: finalizedResult.passedChecks,
    failedRules: [
      ...finalizedResult.warnings,
      ...finalizedResult.errors,
      ...finalizedResult.blockedReasons,
      ...finalizedResult.fatalFailures,
    ],
    skippedRules: finalizedResult.skippedChecks,
    diagnostics: finalizedDiagnostics,
    result: {
      ...finalizedResult,
      metadata: {
        ...finalizedResult.metadata,
        validationFingerprint,
      },
      fingerprint: validationFingerprint,
    },
    summary: {
      ...finalizedSummary,
      validationFingerprint,
    },
    traceability: {
      ...finalizedTraceability,
      validationFingerprint,
    },
    overallDecision: finalizedResult.overallDecision,
  });

  return freezeValidationReport({
    ...finalizedReport,
    serialized: `${stableStringify({
      schemaVersion: finalizedReport.schemaVersion,
      request: finalizedReport.request,
      validationSession: finalizedReport.validationSession,
      generationSession: finalizedReport.generationSession,
      contextPackage: finalizedReport.contextPackage,
      executedRules: finalizedReport.executedRules,
      passedRules: finalizedReport.passedRules,
      failedRules: finalizedReport.failedRules,
      skippedRules: finalizedReport.skippedRules,
      diagnostics: finalizedReport.diagnostics,
      result: finalizedReport.result,
      summary: finalizedReport.summary,
      traceability: finalizedReport.traceability,
      overallDecision: finalizedReport.overallDecision,
    })}\n`,
  });
}

export function runValidationEngine(input: ValidationPipelineInput): ValidationReport {
  return buildValidationReportFromEvaluation(input);
}

export function validateValidationPipelineSourceShape(input: unknown): ValidationPipelineCheck {
  const report = validateValidationPipelineSource(input);
  return {
    valid: report.valid,
    issueCount: report.issueCount,
    issues: report.issues,
  };
}

export function buildValidationReport(input: ValidationPipelineInput): ValidationReport {
  return buildValidationReportFromEvaluation(input);
}

export function validateValidationReportSource(input: ValidationReport): ValidationPipelineCheck {
  const issues: {
    code: string;
    message: string;
    ruleId?: string;
    category?: ValidationCategory;
    severity?: ValidationSeverity;
  }[] = [];

  if (!input.schemaVersion) {
    issues.push({
      code: 'INVALID_REPORT_SHAPE',
      message: 'Validation report schemaVersion is missing.',
    });
  }

  if (input.overallDecision !== input.result.overallDecision) {
    issues.push({
      code: 'REPORT_DECISION_MISMATCH',
      message: 'Validation report overall decision does not match the validation result.',
    });
  }

  if (input.serialized.length === 0) {
    issues.push({
      code: 'SERIALIZATION_MISMATCH',
      message: 'Validation report serialization is missing.',
    });
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}

export function buildValidationReportCandidate(input: ValidationPipelineInput): ValidationReport {
  return buildValidationReportFromEvaluation(input);
}
