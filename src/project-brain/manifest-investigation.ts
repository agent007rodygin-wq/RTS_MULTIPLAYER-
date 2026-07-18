import { deepFreeze } from './knowledge-artifact.ts';
import { normalizeArtifactId } from './artifact-identity.ts';
import { transitionManifestLifecycle } from './manifest-core.ts';
import type { ManifestIdentity, ManifestLifecycleState } from './manifest-core.ts';

export type HypothesisStatus = 'PROPOSED' | 'TESTING' | 'SUPPORTED' | 'CONTRADICTED' | 'REJECTED';

export type EvidenceType =
  | 'SOURCE_INSPECTION'
  | 'ARCHITECTURE_REFERENCE'
  | 'INVARIANT_REFERENCE'
  | 'VALIDATION_RESULT'
  | 'MIRROR_OBSERVATION'
  | 'REPOSITORY_EVIDENCE'
  | 'EXPERIMENT_RESULT'
  | 'MANUAL_OBSERVATION'
  | 'EXTERNAL_DOCUMENTATION';

export type RootCauseStatus = 'PROPOSED' | 'CONFIRMED' | 'REJECTED';

export type ResolutionStatus = 'PROPOSED' | 'APPLIED' | 'VERIFIED' | 'FAILED';

export interface Hypothesis {
  hypothesisId: string;
  description: string;
  author: string;
  confidence: number;
  supportingEvidence: readonly string[];
  contradictingEvidence: readonly string[];
  validationStatus: HypothesisStatus;
  rejectionReason?: string;
  timestamp: number;
}

export interface EvidenceItem {
  evidenceId: string;
  evidenceType: EvidenceType;
  description: string;
  sourceRevision: string;
  sourceArtifactId?: string;
  sourceFile?: string;
  sourceSymbol?: string;
  observation: string;
  timestamp: number;
}

export interface RootCause {
  rootCauseId: string;
  description: string;
  confidence: number;
  supportingEvidence: readonly string[];
  affectedArtifacts: readonly string[];
  affectedInvariants: readonly string[];
  validationStatus: RootCauseStatus;
  alternativeExplanations: readonly string[];
  remainingUncertainty: string;
}

export interface Resolution {
  resolutionId: string;
  chosenApproach: string;
  reasonForChoice: string;
  rejectedAlternatives: readonly string[];
  expectedOutcome: string;
  risks: readonly string[];
  followUpRecommendations: readonly string[];
  requiredValidation: readonly string[];
  validationStatus: ResolutionStatus;
}

export interface Investigation {
  identity: ManifestIdentity;
  lifecycleState: ManifestLifecycleState;
  problemStatement: string;
  observedSymptoms: readonly string[];
  reproductionSteps: readonly string[];
  assumptions: readonly string[];
  hypotheses: readonly Hypothesis[];
  evidence: readonly EvidenceItem[];
  failedHypotheses: readonly string[];
  confirmedRootCause?: RootCause;
  affectedArtifacts: readonly string[];
  affectedSourceFiles: readonly string[];
  affectedInvariants: readonly string[];
  risks: readonly string[];
  finalResolution?: Resolution;
  remainingUncertainty: string;
  futureRecommendations: readonly string[];
  createdAt: number;
  updatedAt: number;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Investigation ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Investigation ${fieldName} must be a non-empty string.`);
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
    throw new Error(`Investigation ${fieldName} must be a finite number.`);
  }
  return value;
}

function normalizeConfidence(value: unknown): number {
  const num = normalizeNumber(value, 'confidence');
  if (num < 0 || num > 1) {
    throw new Error('Investigation confidence must be between 0 and 1 inclusive.');
  }
  return num;
}

function normalizeStringArray(value: unknown, fieldName: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Investigation ${fieldName} must be an array.`);
  }
  const result = value.map((item) => normalizeText(item, `${fieldName} entry`));
  const deduped = Array.from(new Set(result));
  deduped.sort();
  return deepFreeze(deduped);
}

function normalizeHypothesisStatus(value: unknown): HypothesisStatus {
  const allowed: readonly HypothesisStatus[] = ['PROPOSED', 'TESTING', 'SUPPORTED', 'CONTRADICTED', 'REJECTED'];
  if (typeof value !== 'string' || !allowed.includes(value as HypothesisStatus)) {
    throw new Error(`Hypothesis status must be one of ${allowed.join(', ')}.`);
  }
  return value as HypothesisStatus;
}

function normalizeEvidenceType(value: unknown): EvidenceType {
  const allowed: readonly EvidenceType[] = [
    'SOURCE_INSPECTION', 'ARCHITECTURE_REFERENCE', 'INVARIANT_REFERENCE',
    'VALIDATION_RESULT', 'MIRROR_OBSERVATION', 'REPOSITORY_EVIDENCE',
    'EXPERIMENT_RESULT', 'MANUAL_OBSERVATION', 'EXTERNAL_DOCUMENTATION',
  ];
  if (typeof value !== 'string' || !allowed.includes(value as EvidenceType)) {
    throw new Error(`Evidence type must be one of ${allowed.join(', ')}.`);
  }
  return value as EvidenceType;
}

function normalizeRootCauseStatus(value: unknown): RootCauseStatus {
  const allowed: readonly RootCauseStatus[] = ['PROPOSED', 'CONFIRMED', 'REJECTED'];
  if (typeof value !== 'string' || !allowed.includes(value as RootCauseStatus)) {
    throw new Error(`Root cause status must be one of ${allowed.join(', ')}.`);
  }
  return value as RootCauseStatus;
}

function normalizeResolutionStatus(value: unknown): ResolutionStatus {
  const allowed: readonly ResolutionStatus[] = ['PROPOSED', 'APPLIED', 'VERIFIED', 'FAILED'];
  if (typeof value !== 'string' || !allowed.includes(value as ResolutionStatus)) {
    throw new Error(`Resolution status must be one of ${allowed.join(', ')}.`);
  }
  return value as ResolutionStatus;
}

export function createHypothesis(input: {
  hypothesisId: string;
  description: string;
  author: string;
  confidence: number;
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  validationStatus?: HypothesisStatus;
  rejectionReason?: string;
  timestamp: number;
}): Hypothesis {
  return deepFreeze({
    hypothesisId: normalizeArtifactId(normalizeText(input.hypothesisId, 'hypothesisId')),
    description: normalizeText(input.description, 'description'),
    author: normalizeText(input.author, 'author'),
    confidence: normalizeConfidence(input.confidence),
    supportingEvidence: normalizeStringArray(input.supportingEvidence ?? [], 'supportingEvidence'),
    contradictingEvidence: normalizeStringArray(input.contradictingEvidence ?? [], 'contradictingEvidence'),
    validationStatus: normalizeHypothesisStatus(input.validationStatus ?? 'PROPOSED'),
    rejectionReason: normalizeOptionalText(input.rejectionReason),
    timestamp: normalizeNumber(input.timestamp, 'timestamp'),
  });
}

export function createEvidenceItem(input: {
  evidenceId: string;
  evidenceType: EvidenceType;
  description: string;
  sourceRevision: string;
  sourceArtifactId?: string;
  sourceFile?: string;
  sourceSymbol?: string;
  observation: string;
  timestamp: number;
}): EvidenceItem {
  return deepFreeze({
    evidenceId: normalizeArtifactId(normalizeText(input.evidenceId, 'evidenceId')),
    evidenceType: normalizeEvidenceType(input.evidenceType),
    description: normalizeText(input.description, 'description'),
    sourceRevision: normalizeText(input.sourceRevision, 'sourceRevision'),
    sourceArtifactId: normalizeOptionalText(input.sourceArtifactId),
    sourceFile: normalizeOptionalText(input.sourceFile),
    sourceSymbol: normalizeOptionalText(input.sourceSymbol),
    observation: normalizeText(input.observation, 'observation'),
    timestamp: normalizeNumber(input.timestamp, 'timestamp'),
  });
}

export function createRootCause(input: {
  rootCauseId: string;
  description: string;
  confidence: number;
  supportingEvidence?: string[];
  affectedArtifacts?: string[];
  affectedInvariants?: string[];
  validationStatus?: RootCauseStatus;
  alternativeExplanations?: string[];
  remainingUncertainty?: string;
}): RootCause {
  return deepFreeze({
    rootCauseId: normalizeArtifactId(normalizeText(input.rootCauseId, 'rootCauseId')),
    description: normalizeText(input.description, 'description'),
    confidence: normalizeConfidence(input.confidence),
    supportingEvidence: normalizeStringArray(input.supportingEvidence ?? [], 'supportingEvidence'),
    affectedArtifacts: normalizeStringArray(input.affectedArtifacts ?? [], 'affectedArtifacts'),
    affectedInvariants: normalizeStringArray(input.affectedInvariants ?? [], 'affectedInvariants'),
    validationStatus: normalizeRootCauseStatus(input.validationStatus ?? 'PROPOSED'),
    alternativeExplanations: normalizeStringArray(input.alternativeExplanations ?? [], 'alternativeExplanations'),
    remainingUncertainty: normalizeOptionalText(input.remainingUncertainty) ?? '',
  });
}

export function createResolution(input: {
  resolutionId: string;
  chosenApproach: string;
  reasonForChoice: string;
  rejectedAlternatives?: string[];
  expectedOutcome: string;
  risks?: string[];
  followUpRecommendations?: string[];
  requiredValidation?: string[];
  validationStatus?: ResolutionStatus;
}): Resolution {
  return deepFreeze({
    resolutionId: normalizeArtifactId(normalizeText(input.resolutionId, 'resolutionId')),
    chosenApproach: normalizeText(input.chosenApproach, 'chosenApproach'),
    reasonForChoice: normalizeText(input.reasonForChoice, 'reasonForChoice'),
    rejectedAlternatives: normalizeStringArray(input.rejectedAlternatives ?? [], 'rejectedAlternatives'),
    expectedOutcome: normalizeText(input.expectedOutcome, 'expectedOutcome'),
    risks: normalizeStringArray(input.risks ?? [], 'risks'),
    followUpRecommendations: normalizeStringArray(input.followUpRecommendations ?? [], 'followUpRecommendations'),
    requiredValidation: normalizeStringArray(input.requiredValidation ?? [], 'requiredValidation'),
    validationStatus: normalizeResolutionStatus(input.validationStatus ?? 'PROPOSED'),
  });
}

export function createInvestigation(input: {
  identity: ManifestIdentity;
  lifecycleState: ManifestLifecycleState;
  problemStatement: string;
  observedSymptoms?: string[];
  reproductionSteps?: string[];
  assumptions?: string[];
  hypotheses?: Hypothesis[];
  evidence?: EvidenceItem[];
  failedHypotheses?: string[];
  confirmedRootCause?: RootCause;
  affectedArtifacts?: string[];
  affectedSourceFiles?: string[];
  affectedInvariants?: string[];
  risks?: string[];
  finalResolution?: Resolution;
  remainingUncertainty?: string;
  futureRecommendations?: string[];
  createdAt: number;
  updatedAt: number;
}): Investigation {
  if (!isPlainObject(input.identity)) {
    throw new Error('Investigation identity must be a plain object.');
  }

  return deepFreeze({
    identity: input.identity,
    lifecycleState: input.lifecycleState,
    problemStatement: normalizeText(input.problemStatement, 'problemStatement'),
    observedSymptoms: normalizeStringArray(input.observedSymptoms ?? [], 'observedSymptoms'),
    reproductionSteps: normalizeStringArray(input.reproductionSteps ?? [], 'reproductionSteps'),
    assumptions: normalizeStringArray(input.assumptions ?? [], 'assumptions'),
    hypotheses: deepFreeze([...(input.hypotheses ?? [])].sort((a, b) => a.hypothesisId.localeCompare(b.hypothesisId))),
    evidence: deepFreeze([...(input.evidence ?? [])].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId))),
    failedHypotheses: normalizeStringArray(input.failedHypotheses ?? [], 'failedHypotheses'),
    confirmedRootCause: input.confirmedRootCause ? deepFreeze(structuredClone(input.confirmedRootCause)) : undefined,
    affectedArtifacts: normalizeStringArray(input.affectedArtifacts ?? [], 'affectedArtifacts'),
    affectedSourceFiles: normalizeStringArray(input.affectedSourceFiles ?? [], 'affectedSourceFiles'),
    affectedInvariants: normalizeStringArray(input.affectedInvariants ?? [], 'affectedInvariants'),
    risks: normalizeStringArray(input.risks ?? [], 'risks'),
    finalResolution: input.finalResolution ? deepFreeze(structuredClone(input.finalResolution)) : undefined,
    remainingUncertainty: normalizeOptionalText(input.remainingUncertainty) ?? '',
    futureRecommendations: normalizeStringArray(input.futureRecommendations ?? [], 'futureRecommendations'),
    createdAt: normalizeNumber(input.createdAt, 'createdAt'),
    updatedAt: normalizeNumber(input.updatedAt, 'updatedAt'),
  });
}

export function updateInvestigationLifecycle(
  investigation: Investigation,
  newState: ManifestLifecycleState,
  updatedAt: number,
): Investigation {
  if (!isPlainObject(investigation)) {
    throw new Error('Investigation must be a plain object.');
  }
  if (!newState) {
    throw new Error('New lifecycle state is required.');
  }
  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) {
    throw new Error('updatedAt must be a finite number.');
  }

  const validatedState = transitionManifestLifecycle(investigation.lifecycleState, newState);

  return deepFreeze({
    ...investigation,
    lifecycleState: validatedState,
    updatedAt,
  });
}
