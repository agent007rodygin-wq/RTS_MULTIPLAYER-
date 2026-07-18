export const ARTIFACT_ID_PREFIX = 'PB-' as const;

export const ARTIFACT_ID_PATTERN = /^PB-(?:[A-Z0-9]+(?:-[A-Z0-9]+)*)$/;

export type ArtifactReferenceResolutionStatus =
  | 'RESOLVED'
  | 'RESOLVED_WITH_REDIRECT'
  | 'STALE'
  | 'SUPERSEDED'
  | 'MISSING'
  | 'AMBIGUOUS'
  | 'TYPE_MISMATCH'
  | 'VERSION_MISMATCH'
  | 'NON_CANONICAL_TARGET'
  | 'INVALID_REFERENCE';

export interface ArtifactIdInput {
  namespaceToken: string;
  numericSuffix?: number;
  descriptiveSlug?: string;
}

export interface ArtifactReferenceInput {
  targetArtifactId: string;
  sourceArtifactId: string;
  targetType?: string;
  expectedVersion?: string;
  expectedStatus?: string;
  relationshipType?: string;
  optionalPathHint?: string;
}

export interface ArtifactReference {
  targetArtifactId: string;
  sourceArtifactId: string;
  targetType?: string;
  expectedVersion?: string;
  expectedStatus?: string;
  relationshipType?: string;
  optionalPathHint?: string;
}

function normalizeTokenSegment(value: string): string {
  return String(value)
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/[^A-Za-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalPathHint(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeNumericSuffix(value: number): string {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Artifact ID numeric suffix must be a non-negative integer. Received: ${value}`);
  }

  return String(value).padStart(3, '0');
}

/**
 * Canonicalizes a repository artifact ID.
 *
 * The ID is always namespaced under the approved `PB-` prefix and uses
 * uppercase ASCII tokens separated by hyphens.
 */
export function normalizeArtifactId(value: string): string {
  const normalized = normalizeTokenSegment(value);

  if (!normalized || normalized === 'PB') {
    throw new Error('Artifact ID cannot be empty.');
  }

  let candidate = normalized.startsWith('PB-') ? normalized : `${ARTIFACT_ID_PREFIX}${normalized}`;

  const parts = candidate.split('-');
  const tail = parts[parts.length - 1];
  if (parts.length > 2 && /^\d+$/.test(tail)) {
    parts[parts.length - 1] = tail.padStart(3, '0');
    candidate = parts.join('-');
  }

  if (!ARTIFACT_ID_PATTERN.test(candidate)) {
    throw new Error(`Invalid Artifact ID: ${value}`);
  }

  return candidate;
}

export function isArtifactId(value: unknown): value is string {
  return typeof value === 'string' && ARTIFACT_ID_PATTERN.test(value);
}

/**
 * Builds a stable repository artifact ID from approved namespace parts.
 */
export function createArtifactId(input: ArtifactIdInput): string {
  const namespaceToken = normalizeTokenSegment(input.namespaceToken).replace(/^PB-/, '');

  if (!namespaceToken) {
    throw new Error('Artifact namespace token cannot be empty.');
  }

  const segments = [ARTIFACT_ID_PREFIX.slice(0, -1), namespaceToken];

  if (input.numericSuffix !== undefined) {
    segments.push(normalizeNumericSuffix(input.numericSuffix));
  }

  if (input.descriptiveSlug !== undefined) {
    const slug = normalizeTokenSegment(input.descriptiveSlug);
    if (!slug) {
      throw new Error('Artifact descriptive slug cannot be empty when provided.');
    }
    segments.push(slug);
  }

  return normalizeArtifactId(segments.join('-'));
}

/**
 * Normalizes a design-level artifact reference into a fail-closed shape.
 */
export function createArtifactReference(input: ArtifactReferenceInput): ArtifactReference {
  const targetArtifactId = normalizeArtifactId(input.targetArtifactId);
  const sourceArtifactId = normalizeArtifactId(input.sourceArtifactId);

  return Object.freeze({
    targetArtifactId,
    sourceArtifactId,
    targetType: normalizeOptionalText(input.targetType),
    expectedVersion: normalizeOptionalText(input.expectedVersion),
    expectedStatus: normalizeOptionalText(input.expectedStatus),
    relationshipType: normalizeOptionalText(input.relationshipType),
    optionalPathHint: normalizeOptionalPathHint(input.optionalPathHint),
  });
}
