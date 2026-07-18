import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type {
  ManifestSnapshot,
  ManifestEntry,
  ManifestIdentity,
  ManifestMetadata,
} from './manifest-core.ts';
import { buildManifestSnapshot, computeManifestFingerprint } from './manifest-core.ts';
import type { Investigation, Hypothesis, EvidenceItem, RootCause, Resolution } from './manifest-investigation.ts';
import { validateManifestSnapshot } from './manifest-validation.ts';
import type { ManifestValidationReport } from './manifest-validation.ts';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertNoUnknownKeys(
  obj: Record<string, unknown>,
  allowedKeys: readonly string[],
  context: string,
): void {
  const unknown = Object.keys(obj).filter((k) => !allowedKeys.includes(k));
  if (unknown.length > 0) {
    throw new Error(
      `Serialization ${context} has unknown field(s): ${unknown.join(', ')}`,
    );
  }
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Serialization ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Serialization ${fieldName} must be a non-empty string.`);
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
    throw new Error(`Serialization ${fieldName} must be a finite number.`);
  }
  return value;
}

function normalizeNonNegativeInteger(value: unknown, fieldName: string): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`Serialization ${fieldName} must be a non-negative integer.`);
  }
  return value as number;
}

function assertString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Serialization ${fieldName} must be a string.`);
  }
}

// --- Allowed key sets for closed-schema validation ---

const IDENTITY_KEYS: readonly string[] = [
  'manifestArtifactId', 'investigationId', 'manifestRevision', 'repositoryRevision',
  'freshness', 'relatedTaskRef', 'relatedGenerationRef', 'relatedValidationRef',
  'relatedMirrorRef', 'supersedes',
];

const HYPOTHESIS_KEYS: readonly string[] = [
  'hypothesisId', 'description', 'author', 'confidence', 'validationStatus',
  'timestamp', 'supportingEvidence', 'contradictingEvidence', 'rejectionReason',
];

const EVIDENCE_KEYS: readonly string[] = [
  'evidenceId', 'evidenceType', 'description', 'sourceRevision', 'sourceArtifactId',
  'sourceFile', 'sourceSymbol', 'observation', 'timestamp',
];

const ROOTCAUSE_KEYS: readonly string[] = [
  'rootCauseId', 'description', 'confidence', 'validationStatus', 'supportingEvidence',
  'affectedArtifacts', 'affectedInvariants', 'alternativeExplanations', 'remainingUncertainty',
];

const RESOLUTION_KEYS: readonly string[] = [
  'resolutionId', 'chosenApproach', 'reasonForChoice', 'validationStatus',
  'rejectedAlternatives', 'expectedOutcome', 'risks', 'followUpRecommendations',
  'requiredValidation',
];

const INVESTIGATION_KEYS: readonly string[] = [
  'identity', 'lifecycleState', 'problemStatement', 'observedSymptoms',
  'reproductionSteps', 'assumptions', 'hypotheses', 'evidence', 'failedHypotheses',
  'confirmedRootCause', 'affectedArtifacts', 'affectedSourceFiles', 'affectedInvariants',
  'risks', 'finalResolution', 'remainingUncertainty', 'futureRecommendations',
  'createdAt', 'updatedAt',
];

const ENTRY_KEYS: readonly string[] = [
  'entryType', 'investigation',
];

const METADATA_KEYS: readonly string[] = [
  'sourceMirrorFingerprint', 'sourceValidationFingerprint', 'activeEntryCount',
  'archivedEntryCount', 'supersededEntryCount', 'unresolvedEntryCount', 'generatedAt',
];

const ROOT_KEYS: readonly string[] = [
  'identity', 'entries', 'metadata', 'entryCount', 'fingerprint',
];

// --- Parser helpers ---

function parseStringArray(raw: unknown, fieldName: string): readonly string[] {
  if (!Array.isArray(raw)) return deepFreeze([]);
  return deepFreeze(raw.map((s: unknown) => normalizeText(s, `${fieldName} entry`)));
}

function parseIdentity(raw: Record<string, unknown>): ManifestIdentity {
  assertNoUnknownKeys(raw, IDENTITY_KEYS, 'identity');
  const manifestArtifactId = normalizeText(raw.manifestArtifactId, 'identity.manifestArtifactId');
  const investigationId = normalizeText(raw.investigationId, 'identity.investigationId');
  const manifestRevision = normalizeText(raw.manifestRevision, 'identity.manifestRevision');
  const repositoryRevision = normalizeText(raw.repositoryRevision, 'identity.repositoryRevision');
  const freshness = normalizeNumber(raw.freshness, 'identity.freshness');

  return deepFreeze({
    manifestArtifactId,
    manifestRevision,
    investigationId,
    repositoryRevision,
    freshness,
    relatedTaskRef: normalizeOptionalText(raw.relatedTaskRef),
    relatedGenerationRef: normalizeOptionalText(raw.relatedGenerationRef),
    relatedValidationRef: normalizeOptionalText(raw.relatedValidationRef),
    relatedMirrorRef: normalizeOptionalText(raw.relatedMirrorRef),
    supersedes: normalizeOptionalText(raw.supersedes),
  });
}

function parseHypothesis(raw: Record<string, unknown>): Hypothesis {
  assertNoUnknownKeys(raw, HYPOTHESIS_KEYS, 'hypothesis');
  const hypothesisId = normalizeText(raw.hypothesisId, 'hypothesis.hypothesisId');
  const description = normalizeText(raw.description, 'hypothesis.description');
  const author = normalizeText(raw.author, 'hypothesis.author');
  const confidence = normalizeNumber(raw.confidence, 'hypothesis.confidence');
  if (confidence < 0 || confidence > 1) {
    throw new Error('Serialization hypothesis confidence must be between 0 and 1 inclusive.');
  }
  const validationStatusRaw = raw.validationStatus;
  assertString(validationStatusRaw, 'hypothesis.validationStatus');
  const supportingEvidenceRaw = raw.supportingEvidence;
  const supportingEvidence: readonly string[] = Array.isArray(supportingEvidenceRaw)
    ? deepFreeze(supportingEvidenceRaw.map((s: unknown) => normalizeText(s, 'hypothesis.supportingEvidence entry')))
    : deepFreeze([]);
  const contradictingEvidenceRaw = raw.contradictingEvidence;
  const contradictingEvidence: readonly string[] = Array.isArray(contradictingEvidenceRaw)
    ? deepFreeze(contradictingEvidenceRaw.map((s: unknown) => normalizeText(s, 'hypothesis.contradictingEvidence entry')))
    : deepFreeze([]);

  return deepFreeze({
    hypothesisId,
    description,
    author,
    confidence,
    supportingEvidence,
    contradictingEvidence,
    validationStatus: validationStatusRaw as Hypothesis['validationStatus'],
    rejectionReason: normalizeOptionalText(raw.rejectionReason),
    timestamp: normalizeNumber(raw.timestamp, 'hypothesis.timestamp'),
  });
}

function parseEvidenceItem(raw: Record<string, unknown>): EvidenceItem {
  assertNoUnknownKeys(raw, EVIDENCE_KEYS, 'evidence');
  const evidenceId = normalizeText(raw.evidenceId, 'evidence.evidenceId');
  const evidenceTypeRaw = raw.evidenceType;
  assertString(evidenceTypeRaw, 'evidence.evidenceType');
  const description = normalizeText(raw.description, 'evidence.description');
  const sourceRevision = normalizeText(raw.sourceRevision, 'evidence.sourceRevision');
  const observation = normalizeText(raw.observation, 'evidence.observation');
  const timestamp = normalizeNumber(raw.timestamp, 'evidence.timestamp');

  return deepFreeze({
    evidenceId,
    evidenceType: evidenceTypeRaw as EvidenceItem['evidenceType'],
    description,
    sourceRevision,
    sourceArtifactId: normalizeOptionalText(raw.sourceArtifactId),
    sourceFile: normalizeOptionalText(raw.sourceFile),
    sourceSymbol: normalizeOptionalText(raw.sourceSymbol),
    observation,
    timestamp,
  });
}

function parseRootCause(raw: unknown): RootCause | undefined {
  if (!isPlainObject(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  assertNoUnknownKeys(obj, ROOTCAUSE_KEYS, 'rootCause');
  const rootCauseId = normalizeText(obj.rootCauseId, 'rootCause.rootCauseId');
  const description = normalizeText(obj.description, 'rootCause.description');
  const confidence = normalizeNumber(obj.confidence, 'rootCause.confidence');
  if (confidence < 0 || confidence > 1) {
    throw new Error('Serialization rootCause confidence must be between 0 and 1 inclusive.');
  }
  const validationStatusRaw = obj.validationStatus;
  assertString(validationStatusRaw, 'rootCause.validationStatus');

  return deepFreeze({
    rootCauseId,
    description,
    confidence,
    supportingEvidence: parseStringArray(obj.supportingEvidence, 'rootCause.supportingEvidence'),
    affectedArtifacts: parseStringArray(obj.affectedArtifacts, 'rootCause.affectedArtifacts'),
    affectedInvariants: parseStringArray(obj.affectedInvariants, 'rootCause.affectedInvariants'),
    validationStatus: validationStatusRaw as RootCause['validationStatus'],
    alternativeExplanations: parseStringArray(obj.alternativeExplanations, 'rootCause.alternativeExplanations'),
    remainingUncertainty: normalizeOptionalText(obj.remainingUncertainty) ?? '',
  });
}

function parseResolution(raw: unknown): Resolution | undefined {
  if (!isPlainObject(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  assertNoUnknownKeys(obj, RESOLUTION_KEYS, 'resolution');
  const resolutionId = normalizeText(obj.resolutionId, 'resolution.resolutionId');
  const chosenApproach = normalizeText(obj.chosenApproach, 'resolution.chosenApproach');
  const reasonForChoice = normalizeText(obj.reasonForChoice, 'resolution.reasonForChoice');
  const expectedOutcome = normalizeText(obj.expectedOutcome, 'resolution.expectedOutcome');
  const validationStatusRaw = obj.validationStatus;
  assertString(validationStatusRaw, 'resolution.validationStatus');

  return deepFreeze({
    resolutionId,
    chosenApproach,
    reasonForChoice,
    rejectedAlternatives: parseStringArray(obj.rejectedAlternatives, 'resolution.rejectedAlternatives'),
    expectedOutcome,
    risks: parseStringArray(obj.risks, 'resolution.risks'),
    followUpRecommendations: parseStringArray(obj.followUpRecommendations, 'resolution.followUpRecommendations'),
    requiredValidation: parseStringArray(obj.requiredValidation, 'resolution.requiredValidation'),
    validationStatus: validationStatusRaw as Resolution['validationStatus'],
  });
}

function parseInvestigation(raw: Record<string, unknown>): Investigation {
  assertNoUnknownKeys(raw, INVESTIGATION_KEYS, 'investigation');
  const lifecycleStateRaw = raw.lifecycleState;
  assertString(lifecycleStateRaw, 'investigation.lifecycleState');

  const identityRaw = raw.identity;
  if (!isPlainObject(identityRaw)) {
    throw new Error('Serialization investigation.identity must be a plain object.');
  }

  const hypothesesRaw = raw.hypotheses;
  const hypotheses: readonly Hypothesis[] = Array.isArray(hypothesesRaw)
    ? deepFreeze(
        (hypothesesRaw as Record<string, unknown>[])
          .map((h) => parseHypothesis(h))
          .sort((a, b) => a.hypothesisId.localeCompare(b.hypothesisId)),
      )
    : deepFreeze([]);

  const evidenceRaw = raw.evidence;
  const evidence: readonly EvidenceItem[] = Array.isArray(evidenceRaw)
    ? deepFreeze(
        (evidenceRaw as Record<string, unknown>[])
          .map((e) => parseEvidenceItem(e))
          .sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)),
      )
    : deepFreeze([]);

  return deepFreeze({
    identity: parseIdentity(identityRaw as Record<string, unknown>),
    lifecycleState: lifecycleStateRaw as Investigation['lifecycleState'],
    problemStatement: normalizeText(raw.problemStatement, 'investigation.problemStatement'),
    observedSymptoms: parseStringArray(raw.observedSymptoms, 'investigation.observedSymptoms'),
    reproductionSteps: parseStringArray(raw.reproductionSteps, 'investigation.reproductionSteps'),
    assumptions: parseStringArray(raw.assumptions, 'investigation.assumptions'),
    hypotheses,
    evidence,
    failedHypotheses: parseStringArray(raw.failedHypotheses, 'investigation.failedHypotheses'),
    confirmedRootCause: parseRootCause(raw.confirmedRootCause),
    affectedArtifacts: parseStringArray(raw.affectedArtifacts, 'investigation.affectedArtifacts'),
    affectedSourceFiles: parseStringArray(raw.affectedSourceFiles, 'investigation.affectedSourceFiles'),
    affectedInvariants: parseStringArray(raw.affectedInvariants, 'investigation.affectedInvariants'),
    risks: parseStringArray(raw.risks, 'investigation.risks'),
    finalResolution: parseResolution(raw.finalResolution),
    remainingUncertainty: normalizeOptionalText(raw.remainingUncertainty) ?? '',
    futureRecommendations: parseStringArray(raw.futureRecommendations, 'investigation.futureRecommendations'),
    createdAt: normalizeNumber(raw.createdAt, 'investigation.createdAt'),
    updatedAt: normalizeNumber(raw.updatedAt, 'investigation.updatedAt'),
  });
}

function parseEntry(raw: Record<string, unknown>): { entryType: string; investigation: Investigation } {
  assertNoUnknownKeys(raw, ENTRY_KEYS, 'entry');
  const entryTypeRaw = raw.entryType;
  assertString(entryTypeRaw, 'entry.entryType');
  const investigationRaw = raw.investigation;
  if (!isPlainObject(investigationRaw)) {
    throw new Error('Serialization entry.investigation must be a plain object.');
  }
  const investigation = parseInvestigation(investigationRaw as Record<string, unknown>);

  return { entryType: entryTypeRaw, investigation };
}

function parseMetadata(raw: Record<string, unknown>): ManifestMetadata {
  assertNoUnknownKeys(raw, METADATA_KEYS, 'metadata');
  return deepFreeze({
    sourceMirrorFingerprint: normalizeText(raw.sourceMirrorFingerprint, 'metadata.sourceMirrorFingerprint'),
    sourceValidationFingerprint: normalizeText(raw.sourceValidationFingerprint, 'metadata.sourceValidationFingerprint'),
    activeEntryCount: normalizeNonNegativeInteger(raw.activeEntryCount, 'metadata.activeEntryCount'),
    archivedEntryCount: normalizeNonNegativeInteger(raw.archivedEntryCount, 'metadata.archivedEntryCount'),
    supersededEntryCount: normalizeNonNegativeInteger(raw.supersededEntryCount, 'metadata.supersededEntryCount'),
    unresolvedEntryCount: normalizeNonNegativeInteger(raw.unresolvedEntryCount, 'metadata.unresolvedEntryCount'),
    generatedAt: normalizeNumber(raw.generatedAt, 'metadata.generatedAt'),
  });
}

// --- Public API ---

export function serializeManifestSnapshot(snapshot: ManifestSnapshot): string {
  if (!isPlainObject(snapshot)) {
    throw new Error('Serialization input must be a plain object.');
  }

  const serialized = {
    identity: snapshot.identity,
    entries: snapshot.entries.map((entry) => ({
      entryType: entry.entryType,
      investigation: entry.investigation,
    })),
    metadata: snapshot.metadata,
    entryCount: snapshot.entryCount,
    fingerprint: snapshot.fingerprint,
  };

  return stableStringify(serialized);
}

export function deserializeManifestSnapshot(serialized: string): ManifestSnapshot {
  if (typeof serialized !== 'string') {
    throw new Error('Serialization input must be a string.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error('Serialization input is not valid JSON.');
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Serialized manifest must be a JSON object.');
  }

  const root = parsed as Record<string, unknown>;
  assertNoUnknownKeys(root, ROOT_KEYS, 'root');

  const identity = parseIdentity(root.identity as Record<string, unknown>);
  const entriesRaw = root.entries;
  if (!Array.isArray(entriesRaw)) {
    throw new Error('Serialization entries must be an array.');
  }
  const parsedEntries = (entriesRaw as Record<string, unknown>[]).map((e) => parseEntry(e));
  const metadata = parseMetadata(root.metadata as Record<string, unknown>);
  const entryCount = normalizeNonNegativeInteger(root.entryCount, 'entryCount');

  if (entryCount !== parsedEntries.length) {
    throw new Error(
      `Serialization entryCount mismatch: declared ${entryCount}, actual ${parsedEntries.length}.`,
    );
  }

  const persistedFingerprint = normalizeText(root.fingerprint, 'fingerprint');
  const persistedActive = normalizeNonNegativeInteger(metadata.activeEntryCount, 'metadata.activeEntryCount');
  const persistedArchived = normalizeNonNegativeInteger(metadata.archivedEntryCount, 'metadata.archivedEntryCount');
  const persistedSuperseded = normalizeNonNegativeInteger(metadata.supersededEntryCount, 'metadata.supersededEntryCount');

  const candidateEntries = parsedEntries.map((e) => {
    const fp = computeManifestFingerprint({
      entryType: e.entryType,
      investigation: e.investigation,
    });
    return {
      entryType: e.entryType,
      investigation: e.investigation,
      diagnostics: [] as readonly [],
      fingerprint: fp,
    } as unknown as ManifestEntry;
  });

  const snapshot = buildManifestSnapshot({
    identity,
    entries: candidateEntries,
    metadata,
  });

  const validationReport = validateManifestSnapshot(snapshot.entries);
  if (validationReport.overallDecision === 'BLOCKED') {
    throw new Error(
      `Manifest validation blocked: ${validationReport.errorCount} error(s), ${validationReport.warningCount} warning(s).`,
    );
  }

  if (snapshot.fingerprint !== persistedFingerprint) {
    throw new Error(
      `Manifest fingerprint mismatch: expected ${persistedFingerprint}, computed ${snapshot.fingerprint}.`,
    );
  }

  const computedActive = snapshot.entries.filter((e) => e.entryType === 'ACTIVE').length;
  const computedArchived = snapshot.entries.filter((e) => e.entryType === 'ARCHIVED').length;
  const computedSuperseded = snapshot.entries.filter((e) => e.entryType === 'SUPERSEDED').length;

  if (persistedActive !== computedActive) {
    throw new Error(`Serialization metadata activeEntryCount mismatch: declared ${persistedActive}, actual ${computedActive}.`);
  }
  if (persistedArchived !== computedArchived) {
    throw new Error(`Serialization metadata archivedEntryCount mismatch: declared ${persistedArchived}, actual ${computedArchived}.`);
  }
  if (persistedSuperseded !== computedSuperseded) {
    throw new Error(`Serialization metadata supersededEntryCount mismatch: declared ${persistedSuperseded}, actual ${computedSuperseded}.`);
  }

  return snapshot;
}

export function loadManifestSnapshot(serialized: string): ManifestSnapshot {
  return deserializeManifestSnapshot(serialized);
}

export function exportManifestSummary(snapshot: ManifestSnapshot): string {
  if (!isPlainObject(snapshot)) {
    throw new Error('Summary input must be a plain object.');
  }

  const activeCount = snapshot.entries.filter((e) => e.entryType === 'ACTIVE').length;
  const archivedCount = snapshot.entries.filter((e) => e.entryType === 'ARCHIVED').length;
  const supersededCount = snapshot.entries.filter((e) => e.entryType === 'SUPERSEDED').length;
  const resolvedCount = snapshot.entries.filter(
    (e) => e.investigation.lifecycleState === 'RESOLVED',
  ).length;
  const unresolvedCount = snapshot.entries.filter(
    (e) => e.investigation.lifecycleState === 'OPEN' || e.investigation.lifecycleState === 'INVESTIGATING',
  ).length;

  const summary = {
    manifestArtifactId: snapshot.identity.manifestArtifactId,
    manifestRevision: snapshot.identity.manifestRevision,
    totalEntries: snapshot.entryCount,
    activeEntryCount: activeCount,
    archivedEntryCount: archivedCount,
    supersededEntryCount: supersededCount,
    resolvedEntryCount: resolvedCount,
    unresolvedEntryCount: unresolvedCount,
    fingerprint: snapshot.fingerprint,
  };

  return stableStringify(summary);
}
