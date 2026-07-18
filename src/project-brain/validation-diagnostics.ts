import { deepFreeze } from './knowledge-artifact.ts';
import type { ValidationResult } from './validation-result.ts';
import type { ValidationRuleResult, ValidationStage } from './validation-rule.ts';
import type { ValidationSession } from './validation-session.ts';
import type { ValidationSummary } from './validation-summary.ts';

export type ValidationDiagnosticStage =
  | 'request'
  | 'generation'
  | 'authority'
  | 'context'
  | 'dependency'
  | 'traceability'
  | 'constraint'
  | 'fingerprint'
  | 'serialization'
  | 'diagnostics'
  | 'result';

export type ValidationDiagnosticSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface ValidationDiagnosticEvent {
  index: number;
  stage: ValidationDiagnosticStage;
  severity: ValidationDiagnosticSeverity;
  code: string;
  message: string;
  validationRequestId: string;
  validationSessionId: string;
  ruleId?: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

function pushEvent(
  events: ValidationDiagnosticEvent[],
  event: Omit<ValidationDiagnosticEvent, 'index'>,
): void {
  events.push({
    ...event,
    index: events.length + 1,
  });
}

function stageHasFailure(ruleResults: readonly ValidationRuleResult[], stage: ValidationStage): boolean {
  return ruleResults.some((result) => result.executionStage === stage && result.status === 'FAILED');
}

function stageMessage(ruleResults: readonly ValidationRuleResult[], stage: ValidationStage, fallback: string): string {
  const failed = ruleResults.find((result) => result.executionStage === stage && result.status === 'FAILED');
  if (failed) {
    return failed.details ?? failed.message;
  }

  return fallback;
}

export function appendValidationDiagnosticEvent(
  events: ValidationDiagnosticEvent[],
  event: Omit<ValidationDiagnosticEvent, 'index'>,
): void {
  pushEvent(events, event);
}

export function buildValidationDiagnostics(input: {
  session: ValidationSession;
  ruleResults: readonly ValidationRuleResult[];
  result: ValidationResult;
  summary: ValidationSummary;
}): readonly ValidationDiagnosticEvent[] {
  const events: ValidationDiagnosticEvent[] = [];
  const requestFailure = input.ruleResults.find((result) => result.executionStage === 'input' && result.status === 'FAILED');
  const generationFailure = stageHasFailure(input.ruleResults, 'generation');
  const authorityFailure = stageHasFailure(input.ruleResults, 'authority');
  const contextFailure = stageHasFailure(input.ruleResults, 'context');
  const dependencyFailure = stageHasFailure(input.ruleResults, 'dependency');
  const traceabilityFailure = stageHasFailure(input.ruleResults, 'traceability');
  const constraintFailure = stageHasFailure(input.ruleResults, 'constraint');
  const fingerprintFailure = stageHasFailure(input.ruleResults, 'fingerprint');
  const serializationFailure = stageHasFailure(input.ruleResults, 'serialization');
  const diagnosticsFailure = stageHasFailure(input.ruleResults, 'diagnostics');

  pushEvent(events, {
    stage: 'request',
    severity: requestFailure ? 'ERROR' : 'INFO',
    code: requestFailure ? 'VALIDATION_REQUEST_INVALID' : 'VALIDATION_REQUEST_NORMALIZED',
    message: requestFailure
      ? requestFailure.details ?? requestFailure.message
      : `Validation request ${input.session.validationRequestId} normalized.`,
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: requestFailure?.ruleId,
  });

  pushEvent(events, {
    stage: 'generation',
    severity: generationFailure ? 'ERROR' : 'INFO',
    code: generationFailure ? 'VALIDATION_GENERATION_INVALID' : 'VALIDATION_GENERATION_READY',
    message: generationFailure
      ? stageMessage(input.ruleResults, 'generation', 'Generation result validation failed.')
      : 'Generation result validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'generation' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'authority',
    severity: authorityFailure ? 'ERROR' : 'INFO',
    code: authorityFailure ? 'VALIDATION_AUTHORITY_BLOCKED' : 'VALIDATION_AUTHORITY_READY',
    message: authorityFailure
      ? stageMessage(input.ruleResults, 'authority', 'Authority validation blocked.')
      : 'Authority validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'authority' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'context',
    severity: contextFailure ? 'ERROR' : 'INFO',
    code: contextFailure ? 'VALIDATION_CONTEXT_BLOCKED' : 'VALIDATION_CONTEXT_READY',
    message: contextFailure
      ? stageMessage(input.ruleResults, 'context', 'Context validation blocked.')
      : 'Context validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'context' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'dependency',
    severity: dependencyFailure ? 'ERROR' : 'INFO',
    code: dependencyFailure ? 'VALIDATION_DEPENDENCY_BLOCKED' : 'VALIDATION_DEPENDENCY_READY',
    message: dependencyFailure
      ? stageMessage(input.ruleResults, 'dependency', 'Dependency validation blocked.')
      : 'Dependency validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'dependency' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'traceability',
    severity: traceabilityFailure ? 'ERROR' : 'INFO',
    code: traceabilityFailure ? 'VALIDATION_TRACEABILITY_BLOCKED' : 'VALIDATION_TRACEABILITY_READY',
    message: traceabilityFailure
      ? stageMessage(input.ruleResults, 'traceability', 'Traceability validation blocked.')
      : 'Traceability validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'traceability' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'constraint',
    severity: constraintFailure ? 'ERROR' : 'INFO',
    code: constraintFailure ? 'VALIDATION_CONSTRAINT_BLOCKED' : 'VALIDATION_CONSTRAINT_READY',
    message: constraintFailure
      ? stageMessage(input.ruleResults, 'constraint', 'Constraint validation blocked.')
      : 'Constraint validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'constraint' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'fingerprint',
    severity: fingerprintFailure ? 'ERROR' : 'INFO',
    code: fingerprintFailure ? 'VALIDATION_FINGERPRINT_MISMATCH' : 'VALIDATION_FINGERPRINT_READY',
    message: fingerprintFailure
      ? stageMessage(input.ruleResults, 'fingerprint', 'Fingerprint validation blocked.')
      : 'Fingerprint validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'fingerprint' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'serialization',
    severity: serializationFailure ? 'ERROR' : 'INFO',
    code: serializationFailure ? 'VALIDATION_SERIALIZATION_INVALID' : 'VALIDATION_SERIALIZATION_READY',
    message: serializationFailure
      ? stageMessage(input.ruleResults, 'serialization', 'Serialization validation blocked.')
      : 'Serialization validation completed.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'serialization' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'diagnostics',
    severity: diagnosticsFailure ? 'ERROR' : 'INFO',
    code: diagnosticsFailure ? 'VALIDATION_DIAGNOSTICS_INCOMPLETE' : 'VALIDATION_DIAGNOSTICS_READY',
    message: diagnosticsFailure
      ? stageMessage(input.ruleResults, 'diagnostics', 'Diagnostics assembly blocked.')
      : 'Diagnostics assembled deterministically.',
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
    ruleId: input.ruleResults.find((result) => result.executionStage === 'diagnostics' && result.status === 'FAILED')?.ruleId,
  });

  pushEvent(events, {
    stage: 'result',
    severity: input.result.overallDecision === 'READY' ? 'INFO' : input.result.overallDecision === 'READY_WITH_WARNINGS' ? 'WARN' : 'ERROR',
    code: `VALIDATION_RESULT_${input.result.overallDecision}`,
    message: `Validation completed with decision ${input.result.overallDecision}.`,
    validationRequestId: input.session.validationRequestId,
    validationSessionId: input.session.validationSessionId,
  });

  return deepFreeze(events);
}
