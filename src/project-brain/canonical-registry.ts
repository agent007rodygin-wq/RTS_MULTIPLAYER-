import { readFile, writeFile } from 'node:fs/promises';
import {
  createArtifactReference,
  normalizeArtifactId,
  type ArtifactReferenceInput,
  type ArtifactReference,
  type ArtifactReferenceResolutionStatus,
} from './artifact-identity.ts';

export interface CanonicalRegistryEntry {
  artifactId: string;
  artifactType: string;
  canonicalRole: string;
  authoritySource: string;
  owner: string;
  sourceRevision: string;
  freshnessState: string;
  supersedes?: readonly string[];
  derivedArtifacts?: readonly string[];
  validationMechanism?: string;
  evidenceLinks?: readonly string[];
  notes?: string;
  version?: string;
  status?: string;
}

export interface CanonicalRegistry {
  entries: readonly CanonicalRegistryEntry[];
}

export interface RegistryValidationIssue {
  code:
    | 'INVALID_REGISTRY_SHAPE'
    | 'INVALID_ENTRY_SHAPE'
    | 'INVALID_ARTIFACT_ID'
    | 'DUPLICATE_ARTIFACT_ID'
    | 'BROKEN_SUPERSEDES_REFERENCE'
    | 'BROKEN_DERIVED_REFERENCE'
    | 'SUPERSESSION_CYCLE';
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface RegistryValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly RegistryValidationIssue[];
}

export interface ArtifactReferenceResolution {
  resolutionStatus: ArtifactReferenceResolutionStatus;
  reference: ArtifactReference;
  artifact?: CanonicalRegistryEntry;
  reason?: string;
}

interface NormalizedRegistryEntry extends CanonicalRegistryEntry {
  supersedes?: readonly string[];
  derivedArtifacts?: readonly string[];
  evidenceLinks?: readonly string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function freezeValue<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      freezeValue(item);
    });
    return Object.freeze(value);
  }

  if (isPlainObject(value)) {
    for (const child of Object.values(value)) {
      freezeValue(child);
    }
    return Object.freeze(value);
  }

  return value;
}

function sortObjectKeys(value: unknown): unknown {
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

function stableRegistryStringify(value: unknown): string {
  return `${JSON.stringify(sortObjectKeys(value), null, 2)}\n`;
}

function normalizeTextField(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Registry field ${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Registry field ${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

function normalizeOptionalTextField(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeArtifactIdList(value: unknown, fieldName: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`Registry field ${fieldName} must be an array when provided.`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error(`Registry relation ${fieldName} must contain only strings.`);
    }
    return normalizeArtifactId(item);
  });

  const deduped = Array.from(new Set(normalized));
  deduped.sort();
  return deduped.length > 0 ? deduped : undefined;
}

function normalizeEvidenceLinks(value: unknown): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new Error('Registry field evidenceLinks must be an array when provided.');
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error('Registry field evidenceLinks must contain only strings.');
    }
    const trimmed = item.trim();
    if (!trimmed) {
      throw new Error('Registry field evidenceLinks cannot contain empty strings.');
    }
    return trimmed;
  });

  const deduped = Array.from(new Set(normalized));
  deduped.sort();
  return deduped.length > 0 ? deduped : undefined;
}

function normalizeRegistryEntry(entry: unknown): NormalizedRegistryEntry {
  if (!isPlainObject(entry)) {
    throw new Error('Registry entries must be plain objects.');
  }

  const artifactId = normalizeArtifactId(normalizeTextField(entry.artifactId, 'artifactId'));
  const artifactType = normalizeTextField(entry.artifactType, 'artifactType');
  const canonicalRole = normalizeTextField(entry.canonicalRole, 'canonicalRole');
  const authoritySource = normalizeTextField(entry.authoritySource, 'authoritySource');
  const owner = normalizeTextField(entry.owner, 'owner');
  const sourceRevision = normalizeTextField(entry.sourceRevision, 'sourceRevision');
  const freshnessState = normalizeTextField(entry.freshnessState, 'freshnessState');

  const normalized: NormalizedRegistryEntry = {
    artifactId,
    artifactType,
    canonicalRole,
    authoritySource,
    owner,
    sourceRevision,
    freshnessState,
  };

  const supersedes = normalizeArtifactIdList(entry.supersedes, 'supersedes');
  if (supersedes) normalized.supersedes = supersedes;

  const derivedArtifacts = normalizeArtifactIdList(entry.derivedArtifacts, 'derivedArtifacts');
  if (derivedArtifacts) normalized.derivedArtifacts = derivedArtifacts;

  const evidenceLinks = normalizeEvidenceLinks(entry.evidenceLinks);
  if (evidenceLinks) normalized.evidenceLinks = evidenceLinks;

  const validationMechanism = normalizeOptionalTextField(entry.validationMechanism);
  if (validationMechanism) normalized.validationMechanism = validationMechanism;

  const notes = normalizeOptionalTextField(entry.notes);
  if (notes) normalized.notes = notes;

  const version = normalizeOptionalTextField(entry.version);
  if (version) normalized.version = version;

  const status = normalizeOptionalTextField(entry.status);
  if (status) normalized.status = status;

  return freezeValue(normalized);
}

function normalizeRegistryEntries(entries: Iterable<unknown>): NormalizedRegistryEntry[] {
  return Array.from(entries, (entry) => normalizeRegistryEntry(entry)).sort((left, right) =>
    left.artifactId.localeCompare(right.artifactId),
  );
}

function collectArtifactIds(entries: readonly CanonicalRegistryEntry[]): Set<string> {
  return new Set(entries.map((entry) => entry.artifactId));
}

function collectRegistryShapeIssues(entries: readonly NormalizedRegistryEntry[]): RegistryValidationIssue[] {
  const issues: RegistryValidationIssue[] = [];
  const knownIds = collectArtifactIds(entries);
  const counts = new Map<string, number>();

  for (const entry of entries) {
    counts.set(entry.artifactId, (counts.get(entry.artifactId) ?? 0) + 1);
  }

  for (const [artifactId, count] of counts) {
    if (count > 1) {
      issues.push({
        code: 'DUPLICATE_ARTIFACT_ID',
        message: `Duplicate Artifact ID detected: ${artifactId}`,
        artifactId,
      });
    }
  }

  for (const entry of entries) {
    const relationTargets = [
      ...(entry.supersedes ?? []),
      ...(entry.derivedArtifacts ?? []),
    ];

    for (const relatedArtifactId of relationTargets) {
      if (relatedArtifactId === entry.artifactId) {
        issues.push({
          code: 'INVALID_ENTRY_SHAPE',
          message: `Artifact ${entry.artifactId} cannot reference itself.`,
          artifactId: entry.artifactId,
          relatedArtifactId,
        });
        continue;
      }

      if (!knownIds.has(relatedArtifactId)) {
        issues.push({
          code: entry.supersedes?.includes(relatedArtifactId)
            ? 'BROKEN_SUPERSEDES_REFERENCE'
            : 'BROKEN_DERIVED_REFERENCE',
          message: `Broken registry reference from ${entry.artifactId} to ${relatedArtifactId}.`,
          artifactId: entry.artifactId,
          relatedArtifactId,
        });
      }
    }
  }

  const supersedesMap = new Map(entries.map((entry) => [entry.artifactId, entry.supersedes ?? []]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cyclePaths = new Set<string>();

  const visit = (artifactId: string, path: string[]): void => {
    if (visiting.has(artifactId)) {
      const cycleStart = path.indexOf(artifactId);
      const cycle = path.slice(cycleStart).concat(artifactId);
      const cycleKey = cycle.join(' -> ');
      if (!cyclePaths.has(cycleKey)) {
        cyclePaths.add(cycleKey);
        issues.push({
          code: 'SUPERSESSION_CYCLE',
          message: `Supersession cycle detected: ${cycleKey}`,
          artifactId,
        });
      }
      return;
    }

    if (visited.has(artifactId)) return;
    visited.add(artifactId);
    visiting.add(artifactId);

    const parents = supersedesMap.get(artifactId) ?? [];
    for (const parent of parents) {
      if (supersedesMap.has(parent)) {
        visit(parent, [...path, artifactId]);
      }
    }

    visiting.delete(artifactId);
  };

  for (const entry of entries) {
    visit(entry.artifactId, []);
  }

  return issues;
}

function getEntryStatus(entry: CanonicalRegistryEntry): string {
  return entry.status ?? entry.freshnessState;
}

function getEntryVersion(entry: CanonicalRegistryEntry): string {
  return entry.version ?? entry.sourceRevision;
}

export function validateCanonicalRegistry(
  registry: unknown,
): RegistryValidationReport {
  if (!isPlainObject(registry) || !Array.isArray(registry.entries)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        {
          code: 'INVALID_REGISTRY_SHAPE',
          message: 'Canonical registry must be an object with an entries array.',
        },
      ],
    };
  }

  const issues: RegistryValidationIssue[] = [];
  let normalizedEntries: NormalizedRegistryEntry[] = [];

  try {
    normalizedEntries = normalizeRegistryEntries(registry.entries);
  } catch (error) {
    issues.push({
      code: 'INVALID_ENTRY_SHAPE',
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      valid: false,
      issueCount: issues.length,
      issues,
    };
  }

  issues.push(...collectRegistryShapeIssues(normalizedEntries));

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}

function ensureValidRegistry(registry: unknown): CanonicalRegistry {
  const report = validateCanonicalRegistry(registry);
  if (!report.valid) {
    const message = report.issues
      .map((issue) => `${issue.code}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid canonical registry: ${message}`);
  }

  const normalizedEntries = normalizeRegistryEntries((registry as { entries: unknown[] }).entries);
  return freezeValue({
    entries: normalizedEntries,
  });
}

export function createCanonicalRegistry(entries: Iterable<unknown> = []): CanonicalRegistry {
  return ensureValidRegistry({
    entries: Array.from(entries),
  });
}

export function registerCanonicalArtifact(
  registry: CanonicalRegistry,
  entry: unknown,
): CanonicalRegistry {
  const nextEntries = [...registry.entries, entry];
  return createCanonicalRegistry(nextEntries);
}

export function lookupCanonicalArtifact(
  registry: CanonicalRegistry,
  artifactId: string,
): CanonicalRegistryEntry | undefined {
  const normalizedArtifactId = normalizeArtifactId(artifactId);
  return registry.entries.find((entry) => entry.artifactId === normalizedArtifactId);
}

export function resolveArtifactReference(
  registry: CanonicalRegistry,
  reference: ArtifactReference | unknown,
): ArtifactReferenceResolution {
  let normalizedReference: ArtifactReference;

  try {
    normalizedReference = createArtifactReference(reference as ArtifactReferenceInput);
  } catch (error) {
    return {
      resolutionStatus: 'INVALID_REFERENCE',
      reference: {
        targetArtifactId: '',
        sourceArtifactId: '',
      },
      reason: error instanceof Error ? error.message : String(error),
    };
  }

  const target = lookupCanonicalArtifact(registry, normalizedReference.targetArtifactId);
  if (!target) {
    return {
      resolutionStatus: 'MISSING',
      reference: normalizedReference,
      reason: `Missing Artifact ID: ${normalizedReference.targetArtifactId}`,
    };
  }

  if (normalizedReference.targetType && target.artifactType !== normalizedReference.targetType) {
    return {
      resolutionStatus: 'TYPE_MISMATCH',
      reference: normalizedReference,
      artifact: target,
      reason: `Expected type ${normalizedReference.targetType} but found ${target.artifactType}`,
    };
  }

  const targetStatus = getEntryStatus(target);
  if (targetStatus === 'STALE') {
    return {
      resolutionStatus: 'STALE',
      reference: normalizedReference,
      artifact: target,
      reason: `Target ${target.artifactId} is stale`,
    };
  }

  if (targetStatus === 'SUPERSEDED') {
    return {
      resolutionStatus: 'SUPERSEDED',
      reference: normalizedReference,
      artifact: target,
      reason: `Target ${target.artifactId} is superseded`,
    };
  }

  if (
    normalizedReference.expectedVersion &&
    getEntryVersion(target) !== normalizedReference.expectedVersion
  ) {
    return {
      resolutionStatus: 'VERSION_MISMATCH',
      reference: normalizedReference,
      artifact: target,
      reason: `Expected version ${normalizedReference.expectedVersion} but found ${getEntryVersion(target)}`,
    };
  }

  if (
    normalizedReference.expectedStatus &&
    targetStatus !== normalizedReference.expectedStatus
  ) {
    return {
      resolutionStatus: 'NON_CANONICAL_TARGET',
      reference: normalizedReference,
      artifact: target,
      reason: `Expected status ${normalizedReference.expectedStatus} but found ${targetStatus}`,
    };
  }

  return {
    resolutionStatus: normalizedReference.optionalPathHint
      ? 'RESOLVED_WITH_REDIRECT'
      : 'RESOLVED',
    reference: normalizedReference,
    artifact: target,
  };
}

export function serializeCanonicalRegistry(registry: CanonicalRegistry): string {
  return stableRegistryStringify(createCanonicalRegistry(registry.entries));
}

export function loadCanonicalRegistry(serialized: string | CanonicalRegistry | { entries: unknown[] }): CanonicalRegistry {
  if (typeof serialized === 'string') {
    const parsed = JSON.parse(serialized) as unknown;
    return ensureValidRegistry(parsed);
  }

  return ensureValidRegistry(serialized);
}

export async function loadCanonicalRegistryFromFile(filePath: string): Promise<CanonicalRegistry> {
  const serialized = await readFile(filePath, 'utf8');
  return loadCanonicalRegistry(serialized);
}

export async function saveCanonicalRegistryToFile(
  filePath: string,
  registry: CanonicalRegistry,
): Promise<void> {
  await writeFile(filePath, serializeCanonicalRegistry(registry), 'utf8');
}

export function getCanonicalRegistryEntries(registry: CanonicalRegistry): readonly CanonicalRegistryEntry[] {
  return registry.entries;
}

export function hasCanonicalRegistryArtifact(registry: CanonicalRegistry, artifactId: string): boolean {
  return Boolean(lookupCanonicalArtifact(registry, artifactId));
}
