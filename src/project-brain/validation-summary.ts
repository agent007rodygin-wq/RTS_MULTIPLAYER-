import { deepFreeze } from './knowledge-artifact.ts';
import type { ValidationCategory } from './validation-categories.ts';
import type { ValidationResult } from './validation-result.ts';
import type { ValidationSeverity } from './validation-severity.ts';
import type { ValidationOverallDecision } from './validation-rule.ts';

export interface ValidationSummary {
  validationRequestId: string;
  validationSessionId: string;
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
  categoryCounts: Readonly<Record<ValidationCategory, number>>;
  severityCounts: Readonly<Record<ValidationSeverity, number>>;
}

export function buildValidationSummary(result: ValidationResult): ValidationSummary {
  return deepFreeze({
    validationRequestId: result.metadata.validationRequestId,
    validationSessionId: result.metadata.validationSessionId,
    validationFingerprint: result.fingerprint,
    overallDecision: result.overallDecision,
    ruleCount: result.statistics.ruleCount,
    executedRuleCount: result.statistics.executedRuleCount,
    passedRuleCount: result.statistics.passedRuleCount,
    failedRuleCount: result.statistics.failedRuleCount,
    skippedRuleCount: result.statistics.skippedRuleCount,
    warningCount: result.statistics.warningCount,
    errorCount: result.statistics.errorCount,
    blockedCount: result.statistics.blockedCount,
    fatalCount: result.statistics.fatalCount,
    categoryCounts: result.statistics.categoryCounts,
    severityCounts: result.statistics.severityCounts,
  });
}
