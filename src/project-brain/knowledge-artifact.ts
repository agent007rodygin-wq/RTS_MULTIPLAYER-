import {
  createArtifactReference,
  type ArtifactReference,
  type ArtifactReferenceInput,
  type ArtifactReferenceResolutionStatus,
} from './artifact-identity.ts';
import {
  resolveArtifactReference,
  type ArtifactReferenceResolution,
  type CanonicalRegistry,
} from './canonical-registry.ts';

export type KnowledgeStorageKind = 'canonical' | 'derived';

export type KnowledgeLifecycleState =
  | 'PROPOSED'
  | 'DRAFT'
  | 'VALIDATED'
  | 'CANONICAL'
  | 'STALE'
  | 'SUPERSEDED'
  | 'REJECTED'
  | 'DERIVED';

export type KnowledgeFreshnessState = 'CURRENT' | 'STALE' | 'UNKNOWN' | 'INVALID';

export interface KnowledgeArtifactProvenance {
  sourceRevision: string;
  validationMechanism?: string;
  evidenceLinks?: readonly string[];
  canonicalSourceResolutions?: readonly ArtifactReferenceResolution[];
}

export interface KnowledgeArtifactRevisionInput {
  artifactId: string;
  artifactType: string;
  canonicalRole: string;
  authoritySource: string;
  owner: string;
  sourceRevision: string;
  freshnessState: KnowledgeFreshnessState;
  storageKind: KnowledgeStorageKind;
  lifecycleState: KnowledgeLifecycleState;
  revisionId: string;
  revisionOrder?: number;
  payload?: Record<string, unknown>;
  canonicalSourceReferences?: readonly (ArtifactReferenceInput | ArtifactReference)[];
  supersedesArtifactIds?: readonly string[];
  validationMechanism?: string;
  evidenceLinks?: readonly string[];
  notes?: string;
}

export interface KnowledgeArtifactRevision {
  artifactId: string;
  artifactType: string;
  canonicalRole: string;
  authoritySource: string;
  owner: string;
  sourceRevision: string;
  freshnessState: KnowledgeFreshnessState;
  storageKind: KnowledgeStorageKind;
  lifecycleState: KnowledgeLifecycleState;
  revisionId: string;
  revisionOrder: number;
  payload: Readonly<Record<string, unknown>>;
  provenance: Readonly<KnowledgeArtifactProvenance>;
  canonicalSourceReferences?: readonly ArtifactReference[];
  supersedesArtifactIds?: readonly string[];
  notes?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      deepFreeze(item);
    });
    return Object.freeze(value);
  }

  if (isPlainObject(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    return Object.freeze(value);
  }

  return value;
}

export function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortObjectKeys(item));
  }

  if (!isPlainObject(value)) return value;

  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) {
    const child = value[key];
    if (child !== undefined) {
      sorted[key] = sortObjectKeys(child);
    }
  }
  return sorted;
}

export function stableStringify(value: unknown): string {
  return `${JSON.stringify(sortObjectKeys(value), null, 2)}\n`;
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Knowledge artifact field ${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Knowledge artifact field ${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeTextList(value: unknown, fieldName: string): readonly string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`Knowledge artifact field ${fieldName} must be an array when provided.`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error(`Knowledge artifact field ${fieldName} must contain only strings.`);
    }

    const trimmed = item.trim();
    if (!trimmed) {
      throw new Error(`Knowledge artifact field ${fieldName} cannot contain empty strings.`);
    }

    return trimmed;
  });

  const deduped = Array.from(new Set(normalized));
  deduped.sort();
  return deduped.length > 0 ? deduped : undefined;
}

export function normalizeKnowledgeStorageKind(value: unknown): KnowledgeStorageKind {
  if (value === 'canonical' || value === 'derived') {
    return value;
  }

  throw new Error(`Knowledge artifact storageKind must be canonical or derived. Received: ${String(value)}`);
}

export function normalizeKnowledgeLifecycleState(value: unknown): KnowledgeLifecycleState {
  const allowed: readonly KnowledgeLifecycleState[] = [
    'PROPOSED',
    'DRAFT',
    'VALIDATED',
    'CANONICAL',
    'STALE',
    'SUPERSEDED',
    'REJECTED',
    'DERIVED',
  ];

  if (allowed.includes(value as KnowledgeLifecycleState)) {
    return value as KnowledgeLifecycleState;
  }

  throw new Error(`Knowledge artifact lifecycleState must be one of ${allowed.join(', ')}. Received: ${String(value)}`);
}

export function normalizeKnowledgeFreshnessState(value: unknown): KnowledgeFreshnessState {
  const allowed: readonly KnowledgeFreshnessState[] = ['CURRENT', 'STALE', 'UNKNOWN', 'INVALID'];

  if (allowed.includes(value as KnowledgeFreshnessState)) {
    return value as KnowledgeFreshnessState;
  }

  throw new Error(`Knowledge artifact freshnessState must be one of ${allowed.join(', ')}. Received: ${String(value)}`);
}

function normalizePayload(value: unknown): Readonly<Record<string, unknown>> {
  if (value === undefined) {
    return Object.freeze({});
  }

  if (!isPlainObject(value)) {
    throw new Error('Knowledge artifact payload must be a plain object when provided.');
  }

  return deepFreeze({ ...value });
}

function normalizeArtifactReferenceList(
  value: unknown,
): readonly ArtifactReference[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('Knowledge artifact canonicalSourceReferences must be an array when provided.');
  }

  const normalized = value.map((reference) => createArtifactReference(reference as ArtifactReferenceInput));
  return normalized.length > 0 ? deepFreeze(normalized) : undefined;
}

function buildCanonicalSourceResolutions(
  registry: CanonicalRegistry | undefined,
  canonicalSourceReferences: readonly ArtifactReference[] | undefined,
): readonly ArtifactReferenceResolution[] | undefined {
  if (!registry || !canonicalSourceReferences || canonicalSourceReferences.length === 0) {
    return undefined;
  }

  const resolved = canonicalSourceReferences.map((reference) => resolveArtifactReference(registry, reference));
  return deepFreeze(resolved);
}

export function createKnowledgeArtifactRevision(
  input: KnowledgeArtifactRevisionInput,
  registry?: CanonicalRegistry,
): KnowledgeArtifactRevision {
  const artifactId = normalizeText(input.artifactId, 'artifactId');
  const artifactType = normalizeText(input.artifactType, 'artifactType');
  const canonicalRole = normalizeText(input.canonicalRole, 'canonicalRole');
  const authoritySource = normalizeText(input.authoritySource, 'authoritySource');
  const owner = normalizeText(input.owner, 'owner');
  const sourceRevision = normalizeText(input.sourceRevision, 'sourceRevision');
  const freshnessState = normalizeKnowledgeFreshnessState(input.freshnessState);
  const storageKind = normalizeKnowledgeStorageKind(input.storageKind);
  const lifecycleState = normalizeKnowledgeLifecycleState(input.lifecycleState);
  const revisionId = normalizeText(input.revisionId, 'revisionId');

  const canonicalSourceReferences = normalizeArtifactReferenceList(input.canonicalSourceReferences);
  const supersedesArtifactIds = normalizeTextList(input.supersedesArtifactIds, 'supersedesArtifactIds');
  const evidenceLinks = normalizeTextList(input.evidenceLinks, 'evidenceLinks');
  const validationMechanism = normalizeOptionalText(input.validationMechanism);
  const notes = normalizeOptionalText(input.notes);
  const payload = normalizePayload(input.payload);
  const provenance = deepFreeze({
    sourceRevision,
    validationMechanism,
    evidenceLinks,
    canonicalSourceResolutions: buildCanonicalSourceResolutions(registry, canonicalSourceReferences),
  });

  const revisionOrder = input.revisionOrder ?? 0;
  if (!Number.isInteger(revisionOrder) || revisionOrder < 0) {
    throw new Error(`Knowledge artifact revisionOrder must be a non-negative integer. Received: ${input.revisionOrder}`);
  }

  return deepFreeze({
    artifactId,
    artifactType,
    canonicalRole,
    authoritySource,
    owner,
    sourceRevision,
    freshnessState,
    storageKind,
    lifecycleState,
    revisionId,
    revisionOrder,
    payload,
    provenance,
    canonicalSourceReferences,
    supersedesArtifactIds,
    notes,
  });
}

export function isCanonicalKnowledgeArtifactRevision(
  revision: KnowledgeArtifactRevision,
): boolean {
  return revision.storageKind === 'canonical';
}

export function isDerivedKnowledgeArtifactRevision(
  revision: KnowledgeArtifactRevision,
): boolean {
  return revision.storageKind === 'derived';
}
