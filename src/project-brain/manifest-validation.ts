import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import { fnv1a32 } from './generation-hash.ts';
import type { ManifestEntry, ManifestLifecycleState } from './manifest-core.ts';

export type ManifestValidationCode =
  | 'MANIFEST_MISSING_IDENTITY'
  | 'MANIFEST_INVALID_LIFECYCLE'
  | 'MANIFEST_MISSING_PROBLEM'
  | 'MANIFEST_HYPOTHESIS_NO_EVIDENCE'
  | 'MANIFEST_HYPOTHESES_PRESERVED'
  | 'MANIFEST_EVIDENCE_NO_TRACE'
  | 'MANIFEST_ROOTCAUSE_NO_EVIDENCE'
  | 'MANIFEST_RESOLUTION_NO_VALIDATION'
  | 'MANIFEST_BROKEN_REFERENCE'
  | 'MANIFEST_DUPLICATE_INVESTIGATION'
  | 'MANIFEST_CONFLICTING_EVIDENCE'
  | 'MANIFEST_INCOMPLETE_INVESTIGATION';

export interface ManifestValidationRuleResult {
  ruleId: string;
  code: ManifestValidationCode;
  severity: 'ERROR' | 'WARN';
  message: string;
  entryId?: string;
}

export interface ManifestValidationRule {
  ruleId: string;
  code: ManifestValidationCode;
  severity: 'ERROR' | 'WARN';
  validate: (entry: ManifestEntry) => ManifestValidationRuleResult | null;
}

export interface ManifestValidationReport {
  manifestArtifactId: string;
  manifestRevision: string;
  overallDecision: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  executedRules: readonly ManifestValidationRuleResult[];
  entryCount: number;
  errorCount: number;
  warningCount: number;
  fingerprint: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Validation ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Validation ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function validateEntryIdentity(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const identity = entry.investigation?.identity;
  if (!identity || !isPlainObject(identity)) {
    return {
      ruleId: 'manifest-identity-required',
      code: 'MANIFEST_MISSING_IDENTITY',
      severity: 'ERROR',
      message: 'Investigation is missing identity.',
    };
  }
  if (!identity.manifestArtifactId || !identity.manifestRevision || !identity.investigationId) {
    return {
      ruleId: 'manifest-identity-required',
      code: 'MANIFEST_MISSING_IDENTITY',
      severity: 'ERROR',
      message: 'Investigation identity is incomplete.',
    };
  }
  return null;
}

function validateEntryLifecycle(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const state = entry.investigation?.lifecycleState;
  const validStates: ManifestLifecycleState[] = [
    'OPEN', 'INVESTIGATING', 'HYPOTHESIS_FORMED', 'TESTING',
    'VALIDATED', 'RESOLVED', 'ARCHIVED', 'SUPERSEDED',
  ];
  if (!state || !validStates.includes(state)) {
    return {
      ruleId: 'manifest-lifecycle-valid',
      code: 'MANIFEST_INVALID_LIFECYCLE',
      severity: 'ERROR',
      message: `Invalid lifecycle state: ${String(state)}`,
    };
  }
  return null;
}

function validateProblemStatement(entry: ManifestEntry): ManifestValidationRuleResult | null {
  if (!entry.investigation?.problemStatement) {
    return {
      ruleId: 'manifest-problem-required',
      code: 'MANIFEST_MISSING_PROBLEM',
      severity: 'ERROR',
      message: 'Investigation is missing a problem statement.',
    };
  }
  return null;
}

function validateHypotheses(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const hypotheses = entry.investigation?.hypotheses;
  if (!hypotheses || hypotheses.length === 0) return null;

  for (const hypothesis of hypotheses) {
    const hasSupporting = hypothesis.supportingEvidence && hypothesis.supportingEvidence.length > 0;
    const hasContradicting = hypothesis.contradictingEvidence && hypothesis.contradictingEvidence.length > 0;
    if (!hasSupporting && !hasContradicting) {
      return {
        ruleId: 'manifest-hypothesis-evidence',
        code: 'MANIFEST_HYPOTHESIS_NO_EVIDENCE',
        severity: 'WARN',
        message: `Hypothesis ${hypothesis.hypothesisId} has no supporting or contradicting evidence.`,
      };
    }
  }
  return null;
}

function validateEvidenceTraceability(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const evidence = entry.investigation?.evidence;
  if (!evidence || evidence.length === 0) return null;

  for (const item of evidence) {
    if (!item.sourceRevision) {
      return {
        ruleId: 'manifest-evidence-traceability',
        code: 'MANIFEST_EVIDENCE_NO_TRACE',
        severity: 'ERROR',
        message: `Evidence ${item.evidenceId} is missing sourceRevision.`,
        entryId: entry.investigation.identity?.investigationId,
      };
    }
  }
  return null;
}

function validateRootCause(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const rootCause = entry.investigation?.confirmedRootCause;
  if (!rootCause) return null;

  if (!rootCause.supportingEvidence || rootCause.supportingEvidence.length === 0) {
    return {
      ruleId: 'manifest-rootcause-evidence',
      code: 'MANIFEST_ROOTCAUSE_NO_EVIDENCE',
      severity: 'ERROR',
      message: `Root cause ${rootCause.rootCauseId} has no supporting evidence.`,
    };
  }
  return null;
}

function validateResolution(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const resolution = entry.investigation?.finalResolution;
  if (!resolution) return null;

  if (!resolution.requiredValidation || resolution.requiredValidation.length === 0) {
    return {
      ruleId: 'manifest-resolution-validation',
      code: 'MANIFEST_RESOLUTION_NO_VALIDATION',
      severity: 'WARN',
      message: `Resolution ${resolution.resolutionId} has no required validation references.`,
    };
  }
  return null;
}

function validateFailedHypothesesPreserved(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const hypotheses = entry.investigation?.hypotheses;
  const failedHypothesisIds = entry.investigation?.failedHypotheses;
  if (!failedHypothesisIds || failedHypothesisIds.length === 0) return null;
  if (!hypotheses || hypotheses.length === 0) {
    return {
      ruleId: 'manifest-hypotheses-preserved',
      code: 'MANIFEST_HYPOTHESES_PRESERVED',
      severity: 'ERROR',
      message: `Investigation has ${failedHypothesisIds.length} failed hypothesis reference(s) but no hypotheses array.`,
      entryId: entry.investigation.identity?.investigationId,
    };
  }
  const activeIds = new Set(hypotheses.map((h) => h.hypothesisId));
  const missing = failedHypothesisIds.filter((id) => !activeIds.has(id));
  if (missing.length > 0) {
    return {
      ruleId: 'manifest-hypotheses-preserved',
      code: 'MANIFEST_HYPOTHESES_PRESERVED',
      severity: 'ERROR',
      message: `Failed hypotheses ${missing.join(', ')} missing from hypotheses array.`,
      entryId: entry.investigation.identity?.investigationId,
    };
  }
  return null;
}

function validateIncomplete(entry: ManifestEntry): ManifestValidationRuleResult | null {
  const state = entry.investigation?.lifecycleState;
  if (state === 'OPEN' || state === 'INVESTIGATING') {
    return {
      ruleId: 'manifest-incomplete',
      code: 'MANIFEST_INCOMPLETE_INVESTIGATION',
      severity: 'WARN',
      message: `Investigation is ${state} — not yet complete.`,
    };
  }
  return null;
}

function sortRules(rules: readonly ManifestValidationRuleResult[]): ManifestValidationRuleResult[] {
  return [...rules].sort((a, b) => {
    if (a.ruleId !== b.ruleId) return a.ruleId.localeCompare(b.ruleId);
    if (a.code !== b.code) return a.code.localeCompare(b.code);
    return 0;
  });
}

function computeValidationFingerprint(rules: readonly ManifestValidationRuleResult[]): string {
  const sorted = sortRules(rules).map((r) => ({
    ruleId: r.ruleId,
    code: r.code,
    severity: r.severity,
  }));
  return fnv1a32(stableStringify(sorted));
}

export function validateManifestEntry(
  entry: ManifestEntry,
  duplicateIdentityDetected?: boolean,
): ManifestValidationReport {
  if (!isPlainObject(entry)) {
    return deepFreeze({
      manifestArtifactId: 'unknown',
      manifestRevision: 'unknown',
      overallDecision: 'BLOCKED',
      executedRules: [
        {
          ruleId: 'manifest-entry-required',
          code: 'MANIFEST_MISSING_IDENTITY',
          severity: 'ERROR',
          message: 'Manifest entry must be a plain object.',
        },
      ],
      entryCount: 0,
      errorCount: 1,
      warningCount: 0,
      fingerprint: fnv1a32(stableStringify({ error: 'entry-required' })),
    });
  }

  const artifactId = entry.investigation?.identity?.manifestArtifactId ?? 'unknown';
  const revision = entry.investigation?.identity?.manifestRevision ?? 'unknown';

  const rules: ManifestValidationRuleResult[] = [];
  const check = (fn: (entry: ManifestEntry) => ManifestValidationRuleResult | null): void => {
    const result = fn(entry);
    if (result) {
      rules.push(result);
    }
  };

  check(validateEntryIdentity);
  check(validateEntryLifecycle);
  check(validateProblemStatement);
  check(validateHypotheses);
  check(validateEvidenceTraceability);
  check(validateFailedHypothesesPreserved);
  check(validateRootCause);
  check(validateResolution);
  check(validateIncomplete);

  if (duplicateIdentityDetected) {
    rules.push({
      ruleId: 'manifest-identity-unique',
      code: 'MANIFEST_DUPLICATE_INVESTIGATION',
      severity: 'ERROR',
      message: `Duplicate investigation identity: ${artifactId}::${revision}`,
      entryId: entry.investigation?.identity?.investigationId,
    });
  }

  const sorted = sortRules(rules);
  const errors = sorted.filter((r) => r.severity === 'ERROR');
  const warnings = sorted.filter((r) => r.severity === 'WARN');
  const errorCount = errors.length;
  const warningCount = warnings.length;

  let overallDecision: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  if (errorCount > 0) {
    overallDecision = 'BLOCKED';
  } else if (warningCount > 0) {
    overallDecision = 'READY_WITH_WARNINGS';
  } else {
    overallDecision = 'READY';
  }

  const fingerprint = computeValidationFingerprint(sorted);

  return deepFreeze({
    manifestArtifactId: artifactId,
    manifestRevision: revision,
    overallDecision,
    executedRules: sorted,
    entryCount: 1,
    errorCount,
    warningCount,
    fingerprint,
  });
}

export function validateManifestSnapshot(
  entries: readonly ManifestEntry[],
): ManifestValidationReport {
  if (!Array.isArray(entries) || entries.length === 0) {
    return deepFreeze({
      manifestArtifactId: 'unknown',
      manifestRevision: 'unknown',
      overallDecision: 'BLOCKED',
      executedRules: [
        {
          ruleId: 'manifest-entries-required',
          code: 'MANIFEST_MISSING_IDENTITY',
          severity: 'ERROR',
          message: 'Manifest snapshot must contain at least one entry.',
        },
      ],
      entryCount: 0,
      errorCount: 1,
      warningCount: 0,
      fingerprint: fnv1a32(stableStringify({ error: 'empty-snapshot' })),
    });
  }

  const identityMap = new Map<string, number>();
  const allRules: ManifestValidationRuleResult[] = [];

  for (const entry of entries) {
    const artifactId = entry.investigation?.identity?.manifestArtifactId ?? 'unknown';
    const revision = entry.investigation?.identity?.manifestRevision ?? 'unknown';
    const key = `${artifactId}::${revision}`;
    const count = identityMap.get(key) ?? 0;
    identityMap.set(key, count + 1);

    const duplicate = count > 0;
    const report = validateManifestEntry(entry, duplicate);
    allRules.push(...report.executedRules);
  }

  const sorted = sortRules(allRules);
  const errors = sorted.filter((r) => r.severity === 'ERROR');
  const warnings = sorted.filter((r) => r.severity === 'WARN');

  let overallDecision: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  if (errors.length > 0) {
    overallDecision = 'BLOCKED';
  } else if (warnings.length > 0) {
    overallDecision = 'READY_WITH_WARNINGS';
  } else {
    overallDecision = 'READY';
  }

  const fingerprint = computeValidationFingerprint(sorted);

  return deepFreeze({
    manifestArtifactId: entries[0].investigation?.identity?.manifestArtifactId ?? 'unknown',
    manifestRevision: entries[0].investigation?.identity?.manifestRevision ?? 'unknown',
    overallDecision,
    executedRules: sorted,
    entryCount: entries.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    fingerprint,
  });
}

export function buildManifestValidationRules(): ManifestValidationCode[] {
  return [
    'MANIFEST_MISSING_IDENTITY',
    'MANIFEST_INVALID_LIFECYCLE',
    'MANIFEST_MISSING_PROBLEM',
    'MANIFEST_HYPOTHESIS_NO_EVIDENCE',
    'MANIFEST_HYPOTHESES_PRESERVED',
    'MANIFEST_EVIDENCE_NO_TRACE',
    'MANIFEST_ROOTCAUSE_NO_EVIDENCE',
    'MANIFEST_RESOLUTION_NO_VALIDATION',
    'MANIFEST_BROKEN_REFERENCE',
    'MANIFEST_DUPLICATE_INVESTIGATION',
    'MANIFEST_CONFLICTING_EVIDENCE',
    'MANIFEST_INCOMPLETE_INVESTIGATION',
  ];
}

export function buildManifestValidationRuleObjects(): readonly ManifestValidationRule[] {
  return deepFreeze([
    {
      ruleId: 'manifest-identity-required',
      code: 'MANIFEST_MISSING_IDENTITY',
      severity: 'ERROR',
      validate: validateEntryIdentity,
    },
    {
      ruleId: 'manifest-lifecycle-valid',
      code: 'MANIFEST_INVALID_LIFECYCLE',
      severity: 'ERROR',
      validate: validateEntryLifecycle,
    },
    {
      ruleId: 'manifest-problem-required',
      code: 'MANIFEST_MISSING_PROBLEM',
      severity: 'ERROR',
      validate: validateProblemStatement,
    },
    {
      ruleId: 'manifest-hypothesis-evidence',
      code: 'MANIFEST_HYPOTHESIS_NO_EVIDENCE',
      severity: 'WARN',
      validate: validateHypotheses,
    },
    {
      ruleId: 'manifest-hypotheses-preserved',
      code: 'MANIFEST_HYPOTHESES_PRESERVED',
      severity: 'ERROR',
      validate: validateFailedHypothesesPreserved,
    },
    {
      ruleId: 'manifest-evidence-traceability',
      code: 'MANIFEST_EVIDENCE_NO_TRACE',
      severity: 'ERROR',
      validate: validateEvidenceTraceability,
    },
    {
      ruleId: 'manifest-rootcause-evidence',
      code: 'MANIFEST_ROOTCAUSE_NO_EVIDENCE',
      severity: 'ERROR',
      validate: validateRootCause,
    },
    {
      ruleId: 'manifest-resolution-validation',
      code: 'MANIFEST_RESOLUTION_NO_VALIDATION',
      severity: 'WARN',
      validate: validateResolution,
    },
    {
      ruleId: 'manifest-incomplete',
      code: 'MANIFEST_INCOMPLETE_INVESTIGATION',
      severity: 'WARN',
      validate: validateIncomplete,
    },
  ]);
}

export function aggregateManifestValidations(
  reports: readonly ManifestValidationReport[],
): ManifestValidationReport {
  if (!Array.isArray(reports) || reports.length === 0) {
    return deepFreeze({
      manifestArtifactId: 'unknown',
      manifestRevision: 'unknown',
      overallDecision: 'BLOCKED',
      executedRules: [],
      entryCount: 0,
      errorCount: 0,
      warningCount: 0,
      fingerprint: fnv1a32(stableStringify({ empty: true })),
    });
  }

  const allRules: ManifestValidationRuleResult[] = [];
  let totalEntryCount = 0;

  for (const report of reports) {
    allRules.push(...report.executedRules);
    totalEntryCount += report.entryCount;
  }

  const sorted = sortRules(allRules);
  const errors = sorted.filter((r) => r.severity === 'ERROR');
  const warnings = sorted.filter((r) => r.severity === 'WARN');

  let overallDecision: 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';
  if (errors.length > 0) {
    overallDecision = 'BLOCKED';
  } else if (warnings.length > 0) {
    overallDecision = 'READY_WITH_WARNINGS';
  } else {
    overallDecision = 'READY';
  }

  const fingerprint = computeValidationFingerprint(sorted);

  return deepFreeze({
    manifestArtifactId: reports[0].manifestArtifactId,
    manifestRevision: reports[0].manifestRevision,
    overallDecision,
    executedRules: sorted,
    entryCount: totalEntryCount,
    errorCount: errors.length,
    warningCount: warnings.length,
    fingerprint,
  });
}

export class ManifestError extends Error {
  readonly code: ManifestValidationCode | 'MANIFEST_INTERNAL_ERROR' | 'MANIFEST_REFERENCE_ERROR';
  readonly severity: 'ERROR' | 'WARN';
  readonly entryId?: string;

  constructor(
    message: string,
    code: ManifestValidationCode | 'MANIFEST_INTERNAL_ERROR' | 'MANIFEST_REFERENCE_ERROR',
    severity: 'ERROR' | 'WARN',
    entryId?: string,
  ) {
    super(message);
    this.name = 'ManifestError';
    this.code = code;
    this.severity = severity;
    this.entryId = entryId;
  }
}

export function manifestError(
  message: string,
  code: ManifestValidationCode | 'MANIFEST_INTERNAL_ERROR' | 'MANIFEST_REFERENCE_ERROR',
  severity: 'ERROR' | 'WARN',
  entryId?: string,
): ManifestError {
  return new ManifestError(message, code, severity, entryId);
}
