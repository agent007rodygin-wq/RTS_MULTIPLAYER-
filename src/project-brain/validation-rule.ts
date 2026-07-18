import { deepFreeze } from './knowledge-artifact.ts';
import type { ValidationCategory } from './validation-categories.ts';
import { compareValidationCategories } from './validation-categories.ts';
import type { ValidationSeverity } from './validation-severity.ts';
import { compareValidationSeverity } from './validation-severity.ts';

export type ValidationStage =
  | 'input'
  | 'generation'
  | 'authority'
  | 'context'
  | 'dependency'
  | 'traceability'
  | 'constraint'
  | 'fingerprint'
  | 'serialization'
  | 'diagnostics';

export const VALIDATION_STAGE_ORDER: readonly ValidationStage[] = deepFreeze([
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

export type ValidationOverallDecision = 'READY' | 'READY_WITH_WARNINGS' | 'FAILED' | 'BLOCKED' | 'INVALID';

export const VALIDATION_DECISION_ORDER: readonly ValidationOverallDecision[] = deepFreeze([
  'READY',
  'READY_WITH_WARNINGS',
  'FAILED',
  'BLOCKED',
  'INVALID',
]);

export type ValidationRuleStatus = 'PASSED' | 'FAILED' | 'SKIPPED';

export interface ValidationRule {
  ruleId: string;
  category: ValidationCategory;
  description: string;
  severity: ValidationSeverity;
  executionStage: ValidationStage;
  deterministicOutcome: ValidationOverallDecision;
}

export interface ValidationRuleResult {
  ruleId: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  executionStage: ValidationStage;
  deterministicOutcome: ValidationOverallDecision;
  status: ValidationRuleStatus;
  code: string;
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
  details?: string;
}

export function compareValidationStages(left: ValidationStage, right: ValidationStage): number {
  const leftIndex = VALIDATION_STAGE_ORDER.indexOf(left);
  const rightIndex = VALIDATION_STAGE_ORDER.indexOf(right);
  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  return left.localeCompare(right);
}

export function compareValidationRules(left: ValidationRule, right: ValidationRule): number {
  const stageComparison = compareValidationStages(left.executionStage, right.executionStage);
  if (stageComparison !== 0) {
    return stageComparison;
  }

  const categoryComparison = compareValidationCategories(left.category, right.category);
  if (categoryComparison !== 0) {
    return categoryComparison;
  }

  const severityComparison = compareValidationSeverity(left.severity, right.severity);
  if (severityComparison !== 0) {
    return severityComparison;
  }

  if (left.ruleId !== right.ruleId) {
    return left.ruleId.localeCompare(right.ruleId);
  }

  return left.description.localeCompare(right.description);
}

export function compareValidationRuleResults(left: ValidationRuleResult, right: ValidationRuleResult): number {
  const stageComparison = compareValidationStages(left.executionStage, right.executionStage);
  if (stageComparison !== 0) {
    return stageComparison;
  }

  const categoryComparison = compareValidationCategories(left.category, right.category);
  if (categoryComparison !== 0) {
    return categoryComparison;
  }

  const severityComparison = compareValidationSeverity(left.severity, right.severity);
  if (severityComparison !== 0) {
    return severityComparison;
  }

  if (left.ruleId !== right.ruleId) {
    return left.ruleId.localeCompare(right.ruleId);
  }

  if (left.status !== right.status) {
    return left.status.localeCompare(right.status);
  }

  if (left.code !== right.code) {
    return left.code.localeCompare(right.code);
  }

  return left.message.localeCompare(right.message);
}

export function createValidationRuleResult(input: ValidationRule & {
  status: ValidationRuleStatus;
  code: string;
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
  details?: string;
}): ValidationRuleResult {
  return deepFreeze({
    ruleId: input.ruleId,
    category: input.category,
    severity: input.severity,
    executionStage: input.executionStage,
    deterministicOutcome: input.deterministicOutcome,
    status: input.status,
    code: input.code,
    message: input.message,
    artifactId: input.artifactId,
    relatedArtifactId: input.relatedArtifactId,
    details: input.details,
  });
}
