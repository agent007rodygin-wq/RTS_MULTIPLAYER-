import { deepFreeze } from './knowledge-artifact.ts';

export type ManifestDiagnosticStage =
  | 'identity'
  | 'evidence'
  | 'hypothesis'
  | 'rootcause'
  | 'resolution'
  | 'validation'
  | 'serialization'
  | 'publication';

export type ManifestDiagnosticSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface ManifestDiagnosticEvent {
  index: number;
  stage: ManifestDiagnosticStage;
  severity: ManifestDiagnosticSeverity;
  code: string;
  message: string;
  manifestArtifactId: string;
  manifestRevision: string;
  entryId?: string;
  evidenceId?: string;
  hypothesisId?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Diagnostic ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Diagnostic ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeDiagnosticStage(value: unknown): ManifestDiagnosticStage {
  const allowed: readonly ManifestDiagnosticStage[] = [
    'identity', 'evidence', 'hypothesis', 'rootcause',
    'resolution', 'validation', 'serialization', 'publication',
  ];
  if (typeof value !== 'string' || !allowed.includes(value as ManifestDiagnosticStage)) {
    throw new Error(`Diagnostic stage must be one of ${allowed.join(', ')}.`);
  }
  return value as ManifestDiagnosticStage;
}

function normalizeDiagnosticSeverity(value: unknown): ManifestDiagnosticSeverity {
  const allowed: readonly ManifestDiagnosticSeverity[] = ['INFO', 'WARN', 'ERROR'];
  if (typeof value !== 'string' || !allowed.includes(value as ManifestDiagnosticSeverity)) {
    throw new Error(`Diagnostic severity must be one of ${allowed.join(', ')}.`);
  }
  return value as ManifestDiagnosticSeverity;
}

export function appendManifestDiagnosticEvent(
  events: ManifestDiagnosticEvent[],
  event: Omit<ManifestDiagnosticEvent, 'index'>,
): void {
  events.push({
    ...event,
    stage: normalizeDiagnosticStage(event.stage),
    severity: normalizeDiagnosticSeverity(event.severity),
    code: normalizeText(event.code, 'code'),
    message: normalizeText(event.message, 'message'),
    manifestArtifactId: normalizeText(event.manifestArtifactId, 'manifestArtifactId'),
    manifestRevision: normalizeText(event.manifestRevision, 'manifestRevision'),
    entryId: normalizeOptionalText(event.entryId),
    evidenceId: normalizeOptionalText(event.evidenceId),
    hypothesisId: normalizeOptionalText(event.hypothesisId),
    index: events.length + 1,
  });
}

export function buildManifestDiagnostics(input: {
  manifestArtifactId: string;
  manifestRevision: string;
  entryCount: number;
  validationBlocked: boolean;
  validationWarnings: number;
  unresolvedEntries: number;
  brokenReferences: number;
  duplicateIdentities: number;
  stage: ManifestDiagnosticStage;
}): readonly ManifestDiagnosticEvent[] {
  const events: ManifestDiagnosticEvent[] = [];
  const id = normalizeText(input.manifestArtifactId, 'manifestArtifactId');
  const revision = normalizeText(input.manifestRevision, 'manifestRevision');

  appendManifestDiagnosticEvent(events, {
    stage: 'identity',
    severity: 'INFO',
    code: 'MANIFEST_IDENTITY_ASSIGNED',
    message: `Manifest ${id} revision ${revision} identity assigned.`,
    manifestArtifactId: id,
    manifestRevision: revision,
  });

  if (input.brokenReferences > 0) {
    appendManifestDiagnosticEvent(events, {
      stage: 'evidence',
      severity: 'ERROR',
      code: 'MANIFEST_EVIDENCE_BROKEN',
      message: `${input.brokenReferences} broken reference(s) detected.`,
      manifestArtifactId: id,
      manifestRevision: revision,
    });
  } else {
    appendManifestDiagnosticEvent(events, {
      stage: 'evidence',
      severity: 'INFO',
      code: 'MANIFEST_EVIDENCE_RESOLVED',
      message: 'All references resolved successfully.',
      manifestArtifactId: id,
      manifestRevision: revision,
    });
  }

  if (input.duplicateIdentities > 0) {
    appendManifestDiagnosticEvent(events, {
      stage: 'validation',
      severity: 'ERROR',
      code: 'MANIFEST_VALIDATION_BLOCKED',
      message: `${input.duplicateIdentities} duplicate identity/ies detected.`,
      manifestArtifactId: id,
      manifestRevision: revision,
    });
  }

  appendManifestDiagnosticEvent(events, {
    stage: input.validationBlocked ? 'validation' : input.stage,
    severity: input.validationBlocked ? 'ERROR' : input.validationWarnings > 0 ? 'WARN' : 'INFO',
    code: input.validationBlocked
      ? 'MANIFEST_VALIDATION_BLOCKED'
      : input.validationWarnings > 0
        ? 'MANIFEST_VALIDATION_WARNINGS'
        : 'MANIFEST_VALIDATION_PASSED',
    message: input.validationBlocked
      ? 'Manifest validation blocked.'
      : input.validationWarnings > 0
        ? `Manifest validation completed with ${input.validationWarnings} warning(s).`
        : 'Manifest validation completed successfully.',
    manifestArtifactId: id,
    manifestRevision: revision,
  });

  if (input.unresolvedEntries > 0) {
    appendManifestDiagnosticEvent(events, {
      stage: 'validation',
      severity: 'WARN',
      code: 'MANIFEST_UNRESOLVED_ENTRIES',
      message: `${input.unresolvedEntries} unresolved investigation(s).`,
      manifestArtifactId: id,
      manifestRevision: revision,
    });
  }

  appendManifestDiagnosticEvent(events, {
    stage: 'publication',
    severity: input.validationBlocked ? 'ERROR' : 'INFO',
    code: input.validationBlocked ? 'MANIFEST_BLOCKED' : 'MANIFEST_PUBLISHED',
    message: input.validationBlocked
      ? 'Manifest publication blocked by validation failures.'
      : 'Manifest published.',
    manifestArtifactId: id,
    manifestRevision: revision,
  });

  return deepFreeze(events);
}
