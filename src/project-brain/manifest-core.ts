import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import { fnv1a32 } from './generation-hash.ts';
import { normalizeArtifactId } from './artifact-identity.ts';
import type { Investigation } from './manifest-investigation.ts';
import type { ManifestDiagnosticEvent } from './manifest-diagnostics.ts';
import type { ManifestValidationReport } from './manifest-validation.ts';

export type ManifestLifecycleState =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'HYPOTHESIS_FORMED'
  | 'TESTING'
  | 'VALIDATED'
  | 'RESOLVED'
  | 'ARCHIVED'
  | 'SUPERSEDED';

export type ManifestEntryType = 'ACTIVE' | 'ARCHIVED' | 'SUPERSEDED';

export interface ManifestIdentity {
  manifestArtifactId: string;
  manifestRevision: string;
  investigationId: string;
  repositoryRevision: string;
  relatedTaskRef?: string;
  relatedGenerationRef?: string;
  relatedValidationRef?: string;
  relatedMirrorRef?: string;
  supersedes?: string;
  freshness: number;
}

export interface ManifestMetadata {
  sourceMirrorFingerprint: string;
  sourceValidationFingerprint: string;
  activeEntryCount: number;
  archivedEntryCount: number;
  supersededEntryCount: number;
  unresolvedEntryCount: number;
  generatedAt: number;
}

export interface ManifestEntry {
  entryType: ManifestEntryType;
  investigation: Investigation;
  diagnostics: readonly ManifestDiagnosticEvent[];
  validation?: ManifestValidationReport;
  fingerprint: string;
}

export interface ManifestSnapshotInput {
  identity: ManifestIdentity;
  entries: ManifestEntry[];
  metadata: ManifestMetadata;
}

export interface ManifestSnapshot {
  identity: ManifestIdentity;
  entries: readonly ManifestEntry[];
  entryCount: number;
  metadata: ManifestMetadata;
  fingerprint: string;
  diagnostics: readonly ManifestDiagnosticEvent[];
}

const LIFECYCLE_ORDER: readonly ManifestLifecycleState[] = [
  'OPEN',
  'INVESTIGATING',
  'HYPOTHESIS_FORMED',
  'TESTING',
  'VALIDATED',
  'RESOLVED',
  'ARCHIVED',
  'SUPERSEDED',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Manifest ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Manifest ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Manifest ${fieldName} must be a finite number.`);
  }
  return value;
}

function normalizeNonNegativeInteger(value: unknown, fieldName: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Manifest ${fieldName} must be a non-negative integer.`);
  }
  return value as number;
}

function normalizeIdentity(value: unknown): ManifestIdentity {
  if (!isPlainObject(value)) {
    throw new Error('Manifest identity must be a plain object.');
  }

  const obj = value as Record<string, unknown>;
  const manifestArtifactId = normalizeArtifactId(normalizeText(obj.manifestArtifactId, 'identity.manifestArtifactId'));
  const manifestRevision = normalizeText(obj.manifestRevision, 'identity.manifestRevision');
  const investigationId = normalizeArtifactId(normalizeText(obj.investigationId, 'identity.investigationId'));
  const repositoryRevision = normalizeText(obj.repositoryRevision, 'identity.repositoryRevision');
  const freshness = normalizeNumber(obj.freshness, 'identity.freshness');

  return deepFreeze({
    manifestArtifactId,
    manifestRevision,
    investigationId,
    repositoryRevision,
    freshness,
    relatedTaskRef: normalizeOptionalText(obj.relatedTaskRef),
    relatedGenerationRef: normalizeOptionalText(obj.relatedGenerationRef),
    relatedValidationRef: normalizeOptionalText(obj.relatedValidationRef),
    relatedMirrorRef: normalizeOptionalText(obj.relatedMirrorRef),
    supersedes: normalizeOptionalText(obj.supersedes),
  });
}

function normalizeLifecycleState(value: unknown): ManifestLifecycleState {
  if (typeof value !== 'string') {
    throw new Error('Manifest lifecycle state must be a string.');
  }
  if (!LIFECYCLE_ORDER.includes(value as ManifestLifecycleState)) {
    throw new Error(`Manifest lifecycle state must be one of ${LIFECYCLE_ORDER.join(', ')}.`);
  }
  return value as ManifestLifecycleState;
}

export function transitionManifestLifecycle(
  current: ManifestLifecycleState,
  target: ManifestLifecycleState,
): ManifestLifecycleState {
  if (current === target) return current;

  const currentIndex = LIFECYCLE_ORDER.indexOf(current);
  const targetIndex = LIFECYCLE_ORDER.indexOf(target);

  if (currentIndex === -1 || targetIndex === -1) {
    throw new Error(`Invalid lifecycle state transition: ${current} -> ${target}`);
  }

  if (current === 'SUPERSEDED') {
    throw new Error(`Lifecycle transition rejected: SUPERSEDED -> ${target} is not allowed.`);
  }

  if (target === 'SUPERSEDED') {
    return 'SUPERSEDED';
  }

  if (current === 'ARCHIVED') {
    throw new Error(`Lifecycle transition rejected: ARCHIVED -> ${target} is not allowed.`);
  }

  if (targetIndex !== currentIndex + 1) {
    throw new Error(`Lifecycle transition rejected: ${current} -> ${target} is not an adjacent forward transition.`);
  }

  return target;
}

export function createManifestIdentity(input: {
  manifestArtifactId: string;
  manifestRevision: string;
  investigationId: string;
  repositoryRevision: string;
  freshness: number;
  relatedTaskRef?: string;
  relatedGenerationRef?: string;
  relatedValidationRef?: string;
  relatedMirrorRef?: string;
  supersedes?: string;
}): ManifestIdentity {
  return normalizeIdentity(input);
}

export function createManifestEntry(input: {
  entryType: ManifestEntryType;
  investigation: Investigation;
  diagnostics: readonly ManifestDiagnosticEvent[];
  validation?: ManifestValidationReport;
}): ManifestEntry {
  if (!input.entryType || !['ACTIVE', 'ARCHIVED', 'SUPERSEDED'].includes(input.entryType)) {
    throw new Error('Manifest entryType must be ACTIVE, ARCHIVED, or SUPERSEDED.');
  }
  if (!isPlainObject(input.investigation)) {
    throw new Error('Manifest entry investigation must be a plain object.');
  }

  const fingerprint = computeManifestFingerprint({
    entryType: input.entryType,
    investigation: input.investigation,
    validation: input.validation
      ? {
          overallDecision: input.validation.overallDecision,
          executedRules: input.validation.executedRules.map((r) => ({
            ruleId: r.ruleId,
            code: r.code,
            severity: r.severity,
            entryId: r.entryId,
          })),
        }
      : undefined,
  });

  return deepFreeze({
    entryType: input.entryType,
    investigation: input.investigation,
    diagnostics: input.diagnostics,
    validation: input.validation,
    fingerprint,
  });
}

function canonicalSemanticProjection(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalSemanticProjection(item));
  }
  if (isPlainObject(value)) {
    const obj = value as Record<string, unknown>;

    const isHypothesis = typeof obj.hypothesisId === 'string' && typeof obj.confidence === 'number';
    const isEvidenceItem = typeof obj.evidenceId === 'string' && typeof obj.evidenceType === 'string';
    const isInvestigation = typeof obj.lifecycleState === 'string' && typeof obj.problemStatement === 'string';

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      if (key === 'diagnostics' || key === 'generatedAt') continue;
      if (isInvestigation && (key === 'createdAt' || key === 'updatedAt')) continue;
      if ((isHypothesis || isEvidenceItem) && key === 'timestamp') continue;
      const val = obj[key];
      if (val !== undefined) {
        result[key] = canonicalSemanticProjection(val);
      }
    }
    return result;
  }
  return value;
}

export function computeManifestFingerprint(data: unknown): string {
  const projected = canonicalSemanticProjection(data);
  return fnv1a32(stableStringify(projected));
}

export function buildManifestSnapshot(input: ManifestSnapshotInput): ManifestSnapshot {
  if (!input || !isPlainObject(input)) {
    throw new Error('Manifest snapshot input must be a plain object.');
  }
  if (!Array.isArray(input.entries)) {
    throw new Error('Manifest snapshot entries must be an array.');
  }

  const identity = normalizeIdentity(input.identity);
  const sortedEntries = [...input.entries].sort((left, right) => {
    const leftId = `${left.investigation.identity.manifestArtifactId}::${left.investigation.identity.manifestRevision}`;
    const rightId = `${right.investigation.identity.manifestArtifactId}::${right.investigation.identity.manifestRevision}`;
    return leftId.localeCompare(rightId);
  });

  let activeCount = 0;
  let archivedCount = 0;
  let supersededCount = 0;
  let unresolvedCount = 0;

  for (const entry of sortedEntries) {
    if (entry.entryType === 'ACTIVE') activeCount += 1;
    else if (entry.entryType === 'ARCHIVED') archivedCount += 1;
    else if (entry.entryType === 'SUPERSEDED') supersededCount += 1;

    const state = entry.investigation.lifecycleState;
    if (state === 'OPEN' || state === 'INVESTIGATING') {
      unresolvedCount += 1;
    }
  }

  const metadataRaw = isPlainObject(input.metadata) ? (input.metadata as Record<string, unknown>) : {};
  const metadata: ManifestMetadata = deepFreeze({
    sourceMirrorFingerprint: normalizeText(metadataRaw.sourceMirrorFingerprint, 'metadata.sourceMirrorFingerprint'),
    sourceValidationFingerprint: normalizeText(metadataRaw.sourceValidationFingerprint, 'metadata.sourceValidationFingerprint'),
    activeEntryCount: activeCount,
    archivedEntryCount: archivedCount,
    supersededEntryCount: supersededCount,
    unresolvedEntryCount: unresolvedCount,
    generatedAt: normalizeNumber(metadataRaw.generatedAt, 'metadata.generatedAt'),
  });

  const allDiagnostics: ManifestDiagnosticEvent[] = [];
  for (const entry of sortedEntries) {
    allDiagnostics.push(...entry.diagnostics);
  }

  const fingerprint = computeManifestFingerprint({
    identity,
    entries: sortedEntries.map((e) => ({
      entryType: e.entryType,
      investigation: e.investigation,
      validation: e.validation
        ? {
            overallDecision: e.validation.overallDecision,
            executedRules: e.validation.executedRules.map((r) => ({
              ruleId: r.ruleId,
              code: r.code,
              severity: r.severity,
              entryId: r.entryId,
            })),
          }
        : undefined,
    })),
    metadata: {
      sourceMirrorFingerprint: metadata.sourceMirrorFingerprint,
      sourceValidationFingerprint: metadata.sourceValidationFingerprint,
      activeEntryCount: metadata.activeEntryCount,
      archivedEntryCount: metadata.archivedEntryCount,
      supersededEntryCount: metadata.supersededEntryCount,
      unresolvedEntryCount: metadata.unresolvedEntryCount,
    },
  });

  return deepFreeze({
    identity,
    entries: sortedEntries,
    entryCount: sortedEntries.length,
    metadata,
    fingerprint,
    diagnostics: allDiagnostics,
  });
}
