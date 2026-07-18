import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import { fnv1a32 } from './generation-hash.ts';
import type { ValidationOverallDecision } from './validation-rule.ts';

export interface ValidationRequestMetadata {
  schemaVersion: string;
  validationVersion: string;
  validationRequestId: string;
  generationRequestId: string;
  generationSessionId: string;
  generationAttemptId: string;
  requestId: string;
  taskId: string;
  contextRequestId: string;
  contextPackageId: string;
  contextPackageFingerprint: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  sourceBrainAuthorityStatus: string;
  sourceBrainDependencyNodeCount: number;
  sourceRegistryArtifactCount: number;
  sourceStoreRevisionCount: number;
  sourceRegistryFingerprint: string;
  sourceStoreFingerprint: string;
  expectedOutputType: string;
  referencedArtifactIds: readonly string[];
  validationRequestFingerprint: string;
}

export interface ValidationMetadata extends ValidationRequestMetadata {
  validationSessionId: string;
  validationAttemptId: string;
  validationFingerprint: string;
  overallDecision: ValidationOverallDecision;
  ruleCount: number;
  executedRuleCount: number;
  passedRuleCount: number;
  failedRuleCount: number;
  skippedRuleCount: number;
  warningCount: number;
  errorCount: number;
  blockedCount: number;
  fatalCount: number;
}

function toSortedStrings(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}

export function buildValidationRequestFingerprint(input: {
  validationVersion: string;
  validationRequestId: string;
  generationRequestId: string;
  generationSessionId: string;
  generationAttemptId: string;
  requestId: string;
  taskId: string;
  contextRequestId: string;
  contextPackageId: string;
  contextPackageFingerprint: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  sourceBrainAuthorityStatus: string;
  sourceBrainDependencyNodeCount: number;
  sourceRegistryArtifactCount: number;
  sourceStoreRevisionCount: number;
  sourceRegistryFingerprint: string;
  sourceStoreFingerprint: string;
  expectedOutputType: string;
  referencedArtifactIds: readonly string[];
}): string {
  return `VALIDATION-REQUEST::${fnv1a32(stableStringify({
    validationVersion: input.validationVersion,
    validationRequestId: input.validationRequestId,
    generationRequestId: input.generationRequestId,
    generationSessionId: input.generationSessionId,
    generationAttemptId: input.generationAttemptId,
    requestId: input.requestId,
    taskId: input.taskId,
    contextRequestId: input.contextRequestId,
    contextPackageId: input.contextPackageId,
    contextPackageFingerprint: input.contextPackageFingerprint,
    sourceBrainSessionId: input.sourceBrainSessionId,
    sourceBrainResponseStatus: input.sourceBrainResponseStatus,
    sourceBrainPlanStatus: input.sourceBrainPlanStatus,
    sourceBrainAuthorityStatus: input.sourceBrainAuthorityStatus,
    sourceBrainDependencyNodeCount: input.sourceBrainDependencyNodeCount,
    sourceRegistryArtifactCount: input.sourceRegistryArtifactCount,
    sourceStoreRevisionCount: input.sourceStoreRevisionCount,
    sourceRegistryFingerprint: input.sourceRegistryFingerprint,
    sourceStoreFingerprint: input.sourceStoreFingerprint,
    expectedOutputType: input.expectedOutputType,
    referencedArtifactIds: toSortedStrings(input.referencedArtifactIds),
  }))}`;
}

export function buildValidationRequestMetadata(input: {
  validationVersion: string;
  validationRequestId: string;
  generationRequestId: string;
  generationSessionId: string;
  generationAttemptId: string;
  requestId: string;
  taskId: string;
  contextRequestId: string;
  contextPackageId: string;
  contextPackageFingerprint: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  sourceBrainAuthorityStatus: string;
  sourceBrainDependencyNodeCount: number;
  sourceRegistryArtifactCount: number;
  sourceStoreRevisionCount: number;
  sourceRegistryFingerprint: string;
  sourceStoreFingerprint: string;
  expectedOutputType: string;
  referencedArtifactIds: readonly string[];
}): ValidationRequestMetadata {
  const validationRequestFingerprint = buildValidationRequestFingerprint(input);

  return deepFreeze({
    schemaVersion: '1.0.0',
    validationVersion: input.validationVersion,
    validationRequestId: input.validationRequestId,
    generationRequestId: input.generationRequestId,
    generationSessionId: input.generationSessionId,
    generationAttemptId: input.generationAttemptId,
    requestId: input.requestId,
    taskId: input.taskId,
    contextRequestId: input.contextRequestId,
    contextPackageId: input.contextPackageId,
    contextPackageFingerprint: input.contextPackageFingerprint,
    sourceBrainSessionId: input.sourceBrainSessionId,
    sourceBrainResponseStatus: input.sourceBrainResponseStatus,
    sourceBrainPlanStatus: input.sourceBrainPlanStatus,
    sourceBrainAuthorityStatus: input.sourceBrainAuthorityStatus,
    sourceBrainDependencyNodeCount: input.sourceBrainDependencyNodeCount,
    sourceRegistryArtifactCount: input.sourceRegistryArtifactCount,
    sourceStoreRevisionCount: input.sourceStoreRevisionCount,
    sourceRegistryFingerprint: input.sourceRegistryFingerprint,
    sourceStoreFingerprint: input.sourceStoreFingerprint,
    expectedOutputType: input.expectedOutputType,
    referencedArtifactIds: toSortedStrings(input.referencedArtifactIds),
    validationRequestFingerprint,
  });
}

export function buildValidationMetadata(input: {
  requestMetadata: ValidationRequestMetadata;
  validationSessionId: string;
  validationAttemptId: string;
  validationFingerprint: string;
  overallDecision: ValidationOverallDecision;
  ruleCount: number;
  executedRuleCount: number;
  passedRuleCount: number;
  failedRuleCount: number;
  skippedRuleCount: number;
  warningCount: number;
  errorCount: number;
  blockedCount: number;
  fatalCount: number;
}): ValidationMetadata {
  return deepFreeze({
    ...input.requestMetadata,
    validationSessionId: input.validationSessionId,
    validationAttemptId: input.validationAttemptId,
    validationFingerprint: input.validationFingerprint,
    overallDecision: input.overallDecision,
    ruleCount: input.ruleCount,
    executedRuleCount: input.executedRuleCount,
    passedRuleCount: input.passedRuleCount,
    failedRuleCount: input.failedRuleCount,
    skippedRuleCount: input.skippedRuleCount,
    warningCount: input.warningCount,
    errorCount: input.errorCount,
    blockedCount: input.blockedCount,
    fatalCount: input.fatalCount,
  });
}
