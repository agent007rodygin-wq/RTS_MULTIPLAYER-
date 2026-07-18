import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { ValidationCategory } from './validation-categories.ts';
import type { ValidationMetadata, ValidationRequestMetadata } from './validation-metadata.ts';
import { buildValidationMetadata } from './validation-metadata.ts';
import type { ValidationRequest } from './validation-request.ts';
import type { ValidationSession } from './validation-session.ts';
import type {
  ValidationOverallDecision,
  ValidationRuleResult,
  ValidationStage,
} from './validation-rule.ts';
import { VALIDATION_DECISION_ORDER, VALIDATION_STAGE_ORDER } from './validation-rule.ts';
import type { ValidationSeverity } from './validation-severity.ts';
import { fnv1a32 } from './generation-hash.ts';

export interface ValidationStatistics {
  ruleCount: number;
  executedRuleCount: number;
  passedRuleCount: number;
  failedRuleCount: number;
  skippedRuleCount: number;
  warningCount: number;
  errorCount: number;
  blockedCount: number;
  fatalCount: number;
  categoryCounts: Readonly<Record<ValidationCategory, number>>;
  severityCounts: Readonly<Record<ValidationSeverity, number>>;
  stageCounts: Readonly<Record<ValidationStage, number>>;
}

export interface ValidationResult {
  overallDecision: ValidationOverallDecision;
  passedChecks: readonly ValidationRuleResult[];
  warnings: readonly ValidationRuleResult[];
  errors: readonly ValidationRuleResult[];
  blockedReasons: readonly ValidationRuleResult[];
  fatalFailures: readonly ValidationRuleResult[];
  skippedChecks: readonly ValidationRuleResult[];
  statistics: ValidationStatistics;
  metadata: ValidationMetadata;
  fingerprint: string;
}

function initializeCounts<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>;
}

function countRuleResults(
  ruleResults: readonly ValidationRuleResult[],
): ValidationStatistics {
  const categoryCounts = initializeCounts([
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
  ] as const);
  const severityCounts = initializeCounts([
    'Info',
    'Warning',
    'Error',
    'Blocked',
    'Fatal',
  ] as const);
  const stageCounts = initializeCounts(VALIDATION_STAGE_ORDER);

  let passedRuleCount = 0;
  let failedRuleCount = 0;
  let skippedRuleCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let blockedCount = 0;
  let fatalCount = 0;

  for (const result of ruleResults) {
    categoryCounts[result.category] += 1;
    severityCounts[result.severity] += 1;
    stageCounts[result.executionStage] += 1;

    if (result.status === 'PASSED') {
      passedRuleCount += 1;
    } else if (result.status === 'FAILED') {
      failedRuleCount += 1;
      if (result.severity === 'Warning') warningCount += 1;
      if (result.severity === 'Error') errorCount += 1;
      if (result.severity === 'Blocked') blockedCount += 1;
      if (result.severity === 'Fatal') fatalCount += 1;
    } else {
      skippedRuleCount += 1;
    }
  }

  return {
    ruleCount: ruleResults.length,
    executedRuleCount: ruleResults.filter((result) => result.status !== 'SKIPPED').length,
    passedRuleCount,
    failedRuleCount,
    skippedRuleCount,
    warningCount,
    errorCount,
    blockedCount,
    fatalCount,
    categoryCounts,
    severityCounts,
    stageCounts,
  };
}

export function determineValidationOverallDecision(
  ruleResults: readonly ValidationRuleResult[],
): ValidationOverallDecision {
  if (ruleResults.length === 0) {
    return 'INVALID';
  }

  const hasFatal = ruleResults.some((result) => result.status === 'FAILED' && result.severity === 'Fatal');
  if (hasFatal) return 'INVALID';

  const hasBlocked = ruleResults.some((result) => result.status === 'FAILED' && result.severity === 'Blocked');
  if (hasBlocked) return 'BLOCKED';

  const hasError = ruleResults.some((result) => result.status === 'FAILED' && result.severity === 'Error');
  if (hasError) return 'FAILED';

  const hasWarnings = ruleResults.some((result) => result.status === 'FAILED' && result.severity === 'Warning');
  if (hasWarnings) return 'READY_WITH_WARNINGS';

  return 'READY';
}

export function buildValidationResultFingerprint(input: {
  request: ValidationRequest;
  session: ValidationSession;
  overallDecision: ValidationOverallDecision;
  ruleResults: readonly ValidationRuleResult[];
  statistics: ValidationStatistics;
}): string {
  return `VALIDATION-RESULT::${fnv1a32(stableStringify({
    validationRequestId: input.request.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    validationVersion: input.request.validationVersion,
    validationRequestFingerprint: input.request.metadata.validationRequestFingerprint,
    overallDecision: input.overallDecision,
    ruleResults: input.ruleResults.map((result) => ({
      ruleId: result.ruleId,
      category: result.category,
      severity: result.severity,
      executionStage: result.executionStage,
      deterministicOutcome: result.deterministicOutcome,
      status: result.status,
      code: result.code,
      message: result.message,
      artifactId: result.artifactId,
      relatedArtifactId: result.relatedArtifactId,
      details: result.details,
    })),
    statistics: {
      ruleCount: input.statistics.ruleCount,
      executedRuleCount: input.statistics.executedRuleCount,
      passedRuleCount: input.statistics.passedRuleCount,
      failedRuleCount: input.statistics.failedRuleCount,
      skippedRuleCount: input.statistics.skippedRuleCount,
      warningCount: input.statistics.warningCount,
      errorCount: input.statistics.errorCount,
      blockedCount: input.statistics.blockedCount,
      fatalCount: input.statistics.fatalCount,
      categoryCounts: input.statistics.categoryCounts,
      severityCounts: input.statistics.severityCounts,
      stageCounts: input.statistics.stageCounts,
    },
  }))}`;
}

export function buildValidationResult(input: {
  request: ValidationRequest;
  session: ValidationSession;
  ruleResults: readonly ValidationRuleResult[];
}): ValidationResult {
  const orderedRuleResults = [...input.ruleResults].sort((left, right) => {
    const leftStageIndex = VALIDATION_STAGE_ORDER.indexOf(left.executionStage);
    const rightStageIndex = VALIDATION_STAGE_ORDER.indexOf(right.executionStage);
    if (leftStageIndex !== rightStageIndex) {
      return leftStageIndex - rightStageIndex;
    }

    if (left.ruleId !== right.ruleId) {
      return left.ruleId.localeCompare(right.ruleId);
    }

    if (left.status !== right.status) {
      return left.status.localeCompare(right.status);
    }

    return left.code.localeCompare(right.code);
  });

  const statistics = countRuleResults(orderedRuleResults);
  const overallDecision = determineValidationOverallDecision(orderedRuleResults);
  const fingerprint = buildValidationResultFingerprint({
    request: input.request,
    session: input.session,
    overallDecision,
    ruleResults: orderedRuleResults,
    statistics,
  });

  const passedChecks = orderedRuleResults.filter((result) => result.status === 'PASSED');
  const failedChecks = orderedRuleResults.filter((result) => result.status === 'FAILED');
  const skippedChecks = orderedRuleResults.filter((result) => result.status === 'SKIPPED');

  const warnings = failedChecks.filter((result) => result.severity === 'Warning');
  const errors = failedChecks.filter((result) => result.severity === 'Error');
  const blockedReasons = failedChecks.filter((result) => result.severity === 'Blocked');
  const fatalFailures = failedChecks.filter((result) => result.severity === 'Fatal');

  const metadata = buildValidationMetadata({
    requestMetadata: input.request.metadata,
    validationSessionId: input.session.validationSessionId,
    validationAttemptId: input.session.validationAttemptId,
    validationFingerprint: fingerprint,
    overallDecision,
    ruleCount: statistics.ruleCount,
    executedRuleCount: statistics.executedRuleCount,
    passedRuleCount: statistics.passedRuleCount,
    failedRuleCount: statistics.failedRuleCount,
    skippedRuleCount: statistics.skippedRuleCount,
    warningCount: statistics.warningCount,
    errorCount: statistics.errorCount,
    blockedCount: statistics.blockedCount,
    fatalCount: statistics.fatalCount,
  });

  return deepFreeze({
    overallDecision,
    passedChecks,
    warnings,
    errors,
    blockedReasons,
    fatalFailures,
    skippedChecks,
    statistics,
    metadata,
    fingerprint,
  });
}
