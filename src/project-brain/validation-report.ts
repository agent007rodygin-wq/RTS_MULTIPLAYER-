import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { ContextPackageResult } from './context-item.ts';
import type { GenerationSession } from './generation-session.ts';
import type { ValidationDiagnosticEvent } from './validation-diagnostics.ts';
import type { ValidationMetadata } from './validation-metadata.ts';
import type { ValidationRequest } from './validation-request.ts';
import type { ValidationResult } from './validation-result.ts';
import type { ValidationRuleResult } from './validation-rule.ts';
import type { ValidationSession } from './validation-session.ts';
import type { ValidationSummary } from './validation-summary.ts';
import { fnv1a32 } from './generation-hash.ts';

export interface ValidationTraceability {
  validationRequestId: string;
  validationSessionId: string;
  validationFingerprint: string;
  generationRequestId: string;
  generationSessionId: string;
  contextRequestId: string;
  contextPackageId: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  sourceBrainAuthorityStatus: string;
  sourceRegistryFingerprint: string;
  sourceStoreFingerprint: string;
  referencedArtifactIds: readonly string[];
  ruleIds: readonly string[];
  warningRuleIds: readonly string[];
  errorRuleIds: readonly string[];
  blockedRuleIds: readonly string[];
  fatalRuleIds: readonly string[];
}

export interface ValidationReport {
  schemaVersion: string;
  request: ValidationRequest;
  validationSession: ValidationSession;
  generationSession: GenerationSession;
  contextPackage: ContextPackageResult;
  executedRules: readonly ValidationRuleResult[];
  passedRules: readonly ValidationRuleResult[];
  failedRules: readonly ValidationRuleResult[];
  skippedRules: readonly ValidationRuleResult[];
  diagnostics: readonly ValidationDiagnosticEvent[];
  result: ValidationResult;
  summary: ValidationSummary;
  traceability: ValidationTraceability;
  overallDecision: ValidationResult['overallDecision'];
  serialized: string;
}

export interface ValidationReportIssue {
  code:
    | 'INVALID_REPORT_SHAPE'
    | 'REPORT_DECISION_MISMATCH'
    | 'REPORT_RESULT_MISMATCH'
    | 'REPORT_SUMMARY_MISMATCH'
    | 'REPORT_TRACEABILITY_MISMATCH'
    | 'REPORT_REQUEST_MISMATCH'
    | 'REPORT_SESSION_MISMATCH'
    | 'REPORT_GENERATION_SESSION_MISMATCH'
    | 'REPORT_CONTEXT_PACKAGE_MISMATCH'
    | 'REPORT_RULE_ORDER_MISMATCH'
    | 'REPORT_RULE_COUNT_MISMATCH'
    | 'REPORT_DIAGNOSTICS_MISMATCH'
    | 'REPORT_FINGERPRINT_MISMATCH'
    | 'SERIALIZATION_MISMATCH';
  message: string;
  field?: string;
  ruleId?: string;
}

export interface ValidationReportValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly ValidationReportIssue[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSortedStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export function createValidationGenerationSessionSnapshot(
  request: ValidationRequest,
): GenerationSession {
  return deepFreeze({
    generationSessionId: request.metadata.generationSessionId,
    generationRequestId: request.metadata.generationRequestId,
    attemptId: request.metadata.generationAttemptId,
    requestId: request.metadata.requestId,
    taskId: request.metadata.taskId,
    brainSessionId: request.metadata.sourceBrainSessionId,
    contextPackageId: request.metadata.contextPackageId,
    contextPackageFingerprint: request.metadata.contextPackageFingerprint,
    generationVersion: request.validationVersion,
    expectedOutputType: request.metadata.expectedOutputType as GenerationSession['expectedOutputType'],
    promptFingerprint: request.generationResult.request.promptFingerprint,
  });
}

export function buildValidationTraceability(input: {
  request: ValidationRequest;
  session: ValidationSession;
  result: ValidationResult;
  rules: readonly ValidationRuleResult[];
}): ValidationTraceability {
  const ruleIds = toSortedStrings(input.rules.map((rule) => rule.ruleId));
  const warningRuleIds = toSortedStrings(input.result.warnings.map((rule) => rule.ruleId));
  const errorRuleIds = toSortedStrings(input.result.errors.map((rule) => rule.ruleId));
  const blockedRuleIds = toSortedStrings(input.result.blockedReasons.map((rule) => rule.ruleId));
  const fatalRuleIds = toSortedStrings(input.result.fatalFailures.map((rule) => rule.ruleId));

  return deepFreeze({
    validationRequestId: input.request.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    validationFingerprint: input.result.fingerprint,
    generationRequestId: input.request.metadata.generationRequestId,
    generationSessionId: input.request.metadata.generationSessionId,
    contextRequestId: input.request.metadata.contextRequestId,
    contextPackageId: input.request.metadata.contextPackageId,
    sourceBrainSessionId: input.request.metadata.sourceBrainSessionId,
    sourceBrainResponseStatus: input.request.metadata.sourceBrainResponseStatus,
    sourceBrainPlanStatus: input.request.metadata.sourceBrainPlanStatus,
    sourceBrainAuthorityStatus: input.request.metadata.sourceBrainAuthorityStatus,
    sourceRegistryFingerprint: input.request.metadata.sourceRegistryFingerprint,
    sourceStoreFingerprint: input.request.metadata.sourceStoreFingerprint,
    referencedArtifactIds: toSortedStrings(input.request.metadata.referencedArtifactIds),
    ruleIds,
    warningRuleIds,
    errorRuleIds,
    blockedRuleIds,
    fatalRuleIds,
  });
}

export function buildValidationReportFingerprint(input: {
  request: ValidationRequest;
  session: ValidationSession;
  generationSession: GenerationSession;
  contextPackage: ContextPackageResult;
  executedRules: readonly ValidationRuleResult[];
  diagnostics: readonly ValidationDiagnosticEvent[];
  result: ValidationResult;
  summary: ValidationSummary;
  traceability: ValidationTraceability;
  overallDecision: ValidationResult['overallDecision'];
}): string {
  return `VALIDATION-REPORT::${fnv1a32(stableStringify({
    schemaVersion: '1.0.0',
    validationRequestId: input.request.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    validationVersion: input.request.validationVersion,
    generationRequestId: input.request.metadata.generationRequestId,
    generationSessionId: input.request.metadata.generationSessionId,
    contextPackageId: input.request.metadata.contextPackageId,
    overallDecision: input.overallDecision,
    validationRequestFingerprint: input.request.metadata.validationRequestFingerprint,
    executedRules: input.executedRules.map((rule) => ({
      ruleId: rule.ruleId,
      category: rule.category,
      severity: rule.severity,
      executionStage: rule.executionStage,
      deterministicOutcome: rule.deterministicOutcome,
      status: rule.status,
      code: rule.code,
      message: rule.message,
      artifactId: rule.artifactId,
      relatedArtifactId: rule.relatedArtifactId,
      details: rule.details,
    })),
    diagnostics: input.diagnostics.map((event) => ({
      stage: event.stage,
      severity: event.severity,
      code: event.code,
      message: event.message,
      artifactId: event.artifactId,
      relatedArtifactId: event.relatedArtifactId,
      ruleId: event.ruleId,
    })),
    result: {
      overallDecision: input.result.overallDecision,
      ruleCount: input.result.statistics.ruleCount,
      executedRuleCount: input.result.statistics.executedRuleCount,
      passedRuleCount: input.result.statistics.passedRuleCount,
      failedRuleCount: input.result.statistics.failedRuleCount,
      skippedRuleCount: input.result.statistics.skippedRuleCount,
      warningCount: input.result.statistics.warningCount,
      errorCount: input.result.statistics.errorCount,
      blockedCount: input.result.statistics.blockedCount,
      fatalCount: input.result.statistics.fatalCount,
      categoryCounts: input.result.statistics.categoryCounts,
      severityCounts: input.result.statistics.severityCounts,
      stageCounts: input.result.statistics.stageCounts,
    },
    summary: {
      overallDecision: input.summary.overallDecision,
      ruleCount: input.summary.ruleCount,
      executedRuleCount: input.summary.executedRuleCount,
      passedRuleCount: input.summary.passedRuleCount,
      failedRuleCount: input.summary.failedRuleCount,
      skippedRuleCount: input.summary.skippedRuleCount,
      warningCount: input.summary.warningCount,
      errorCount: input.summary.errorCount,
      blockedCount: input.summary.blockedCount,
      fatalCount: input.summary.fatalCount,
      categoryCounts: input.summary.categoryCounts,
      severityCounts: input.summary.severityCounts,
    },
    traceability: {
      validationRequestId: input.traceability.validationRequestId,
      validationSessionId: input.traceability.validationSessionId,
      generationRequestId: input.traceability.generationRequestId,
      generationSessionId: input.traceability.generationSessionId,
      contextRequestId: input.traceability.contextRequestId,
      contextPackageId: input.traceability.contextPackageId,
      sourceBrainSessionId: input.traceability.sourceBrainSessionId,
      sourceBrainResponseStatus: input.traceability.sourceBrainResponseStatus,
      sourceBrainPlanStatus: input.traceability.sourceBrainPlanStatus,
      sourceBrainAuthorityStatus: input.traceability.sourceBrainAuthorityStatus,
      sourceRegistryFingerprint: input.traceability.sourceRegistryFingerprint,
      sourceStoreFingerprint: input.traceability.sourceStoreFingerprint,
      referencedArtifactIds: input.traceability.referencedArtifactIds,
      ruleIds: input.traceability.ruleIds,
      warningRuleIds: input.traceability.warningRuleIds,
      errorRuleIds: input.traceability.errorRuleIds,
      blockedRuleIds: input.traceability.blockedRuleIds,
      fatalRuleIds: input.traceability.fatalRuleIds,
    },
    contextPackage: {
      contextRequestId: input.contextPackage.contextRequestId,
      sourceBrainSessionId: input.contextPackage.sourceBrainSessionId,
      sourceBrainResponseStatus: input.contextPackage.sourceBrainResponseStatus,
      metadata: input.contextPackage.metadata,
      includedItemIds: input.contextPackage.includedItems.map((item) => item.artifactId),
      excludedItemIds: input.contextPackage.excludedItems.map((item) => item.artifactId),
      traceabilityLinkCount: input.contextPackage.traceabilityLinks.length,
      validationFailureCount: input.contextPackage.validationFailures.length,
      status: input.contextPackage.status,
    },
  }))}`;
}

export function freezeValidationReport(report: ValidationReport): ValidationReport {
  return deepFreeze({
    ...report,
    executedRules: [...report.executedRules],
    passedRules: [...report.passedRules],
    failedRules: [...report.failedRules],
    skippedRules: [...report.skippedRules],
    diagnostics: [...report.diagnostics],
  });
}

export function validateValidationReport(report: unknown): ValidationReportValidationReport {
  if (!isPlainObject(report)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        {
          code: 'INVALID_REPORT_SHAPE',
          message: 'Validation report must be a plain object.',
        },
      ],
    };
  }

  const candidate = report as Partial<ValidationReport>;
  const issues: ValidationReportIssue[] = [];

  if (!candidate.request || !candidate.validationSession || !candidate.generationSession || !candidate.contextPackage) {
    issues.push({
      code: 'INVALID_REPORT_SHAPE',
      message: 'Validation report is missing required source objects.',
    });
  }

  if (!candidate.result || !candidate.summary || !candidate.traceability) {
    issues.push({
      code: 'INVALID_REPORT_SHAPE',
      message: 'Validation report is missing result, summary, or traceability.',
    });
  }

  if (issues.length > 0) {
    return {
      valid: false,
      issueCount: issues.length,
      issues,
    };
  }

  const ruleCollections: Array<{ name: keyof Pick<ValidationReport, 'executedRules' | 'passedRules' | 'failedRules' | 'skippedRules'>; rules: readonly ValidationRuleResult[] }> = [
    { name: 'executedRules', rules: candidate.executedRules ?? [] },
    { name: 'passedRules', rules: candidate.passedRules ?? [] },
    { name: 'failedRules', rules: candidate.failedRules ?? [] },
    { name: 'skippedRules', rules: candidate.skippedRules ?? [] },
  ];

  const collectionRuleIds = new Map<string, Set<string>>();
  for (const { name, rules } of ruleCollections) {
    const seenInCollection = new Set<string>();
    for (const rule of rules) {
      if (!rule || typeof rule !== 'object' || !('ruleId' in rule)) {
        issues.push({
          code: 'INVALID_REPORT_SHAPE',
          message: 'Validation report rule collections must contain rule results.',
        });
        break;
      }
      const result = rule as ValidationRuleResult;
      if (seenInCollection.has(result.ruleId)) {
        issues.push({
          code: 'REPORT_RULE_ORDER_MISMATCH',
          message: `Duplicate validation rule result detected within ${name} for ${result.ruleId}.`,
          ruleId: result.ruleId,
        });
      } else {
        seenInCollection.add(result.ruleId);
      }
    }
    collectionRuleIds.set(name, seenInCollection);
  }

  const executedRuleIds = collectionRuleIds.get('executedRules') ?? new Set<string>();
  const passedRuleIds = collectionRuleIds.get('passedRules') ?? new Set<string>();
  const failedRuleIds = collectionRuleIds.get('failedRules') ?? new Set<string>();
  const skippedRuleIds = collectionRuleIds.get('skippedRules') ?? new Set<string>();
  const publishedRuleIds = new Set([...passedRuleIds, ...failedRuleIds]);

  for (const ruleId of passedRuleIds) {
    if (!executedRuleIds.has(ruleId)) {
      issues.push({
        code: 'REPORT_RULE_COUNT_MISMATCH',
        message: `Passed validation rule ${ruleId} is not present in executed rules.`,
        ruleId,
      });
    }

    if (failedRuleIds.has(ruleId) || skippedRuleIds.has(ruleId)) {
      issues.push({
        code: 'REPORT_RULE_COUNT_MISMATCH',
        message: `Passed validation rule ${ruleId} must not also appear in another status bucket.`,
        ruleId,
      });
    }
  }

  for (const ruleId of failedRuleIds) {
    if (!executedRuleIds.has(ruleId)) {
      issues.push({
        code: 'REPORT_RULE_COUNT_MISMATCH',
        message: `Failed validation rule ${ruleId} is not present in executed rules.`,
        ruleId,
      });
    }

    if (skippedRuleIds.has(ruleId)) {
      issues.push({
        code: 'REPORT_RULE_COUNT_MISMATCH',
        message: `Failed validation rule ${ruleId} must not also appear in skipped rules.`,
        ruleId,
      });
    }
  }

  for (const ruleId of skippedRuleIds) {
    if (executedRuleIds.has(ruleId)) {
      issues.push({
        code: 'REPORT_RULE_COUNT_MISMATCH',
        message: `Skipped validation rule ${ruleId} must not also appear in executed rules.`,
        ruleId,
      });
    }
  }

  if (executedRuleIds.size !== publishedRuleIds.size) {
    issues.push({
      code: 'REPORT_RULE_COUNT_MISMATCH',
      message: 'Executed validation rules must match the union of passed and failed rule results.',
    });
  }

  if (candidate.result.metadata.validationFingerprint !== candidate.result.fingerprint) {
    issues.push({
      code: 'REPORT_FINGERPRINT_MISMATCH',
      message: 'Validation result fingerprint does not match its metadata.',
    });
  }

  if (candidate.summary.validationFingerprint !== candidate.result.fingerprint) {
    issues.push({
      code: 'REPORT_FINGERPRINT_MISMATCH',
      message: 'Validation summary fingerprint does not match the validation result fingerprint.',
    });
  }

  if (candidate.overallDecision !== candidate.result.overallDecision) {
    issues.push({
      code: 'REPORT_DECISION_MISMATCH',
      message: 'Validation report overall decision does not match the validation result.',
    });
  }

  if (candidate.result.metadata.validationRequestId !== candidate.request.validationRequestId) {
    issues.push({
      code: 'REPORT_REQUEST_MISMATCH',
      message: 'Validation result request ID does not match the validation request.',
    });
  }

  if (candidate.validationSession.validationRequestId !== candidate.request.validationRequestId) {
    issues.push({
      code: 'REPORT_SESSION_MISMATCH',
      message: 'Validation session request ID does not match the validation request.',
    });
  }

  if (candidate.validationSession.validationSessionId !== candidate.result.metadata.validationSessionId) {
    issues.push({
      code: 'REPORT_SESSION_MISMATCH',
      message: 'Validation session ID does not match the validation result metadata.',
    });
  }

  if (candidate.result.metadata.validationFingerprint !== candidate.summary.validationFingerprint) {
    issues.push({
      code: 'REPORT_SUMMARY_MISMATCH',
      message: 'Validation summary does not match the validation result fingerprint.',
    });
  }

  const expectedSerialization = `${stableStringify({
    schemaVersion: candidate.schemaVersion,
    request: candidate.request,
    validationSession: candidate.validationSession,
    generationSession: candidate.generationSession,
    contextPackage: candidate.contextPackage,
    executedRules: candidate.executedRules,
    passedRules: candidate.passedRules,
    failedRules: candidate.failedRules,
    skippedRules: candidate.skippedRules,
    diagnostics: candidate.diagnostics,
    result: candidate.result,
    summary: candidate.summary,
    traceability: candidate.traceability,
    overallDecision: candidate.overallDecision,
  })}\n`;

  if (typeof candidate.serialized === 'string' && candidate.serialized !== expectedSerialization) {
    issues.push({
      code: 'SERIALIZATION_MISMATCH',
      message: 'Validation report serialized content does not match the canonical serialization.',
    });
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
