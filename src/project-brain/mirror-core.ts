import {
  deepFreeze,
  stableStringify,
} from './knowledge-artifact.ts';
import {
  createArtifactReference,
  normalizeArtifactId,
  isArtifactId,
} from './artifact-identity.ts';
import {
  resolveArtifactReference,
  type ArtifactReferenceResolution,
  type CanonicalRegistry,
} from './canonical-registry.ts';
import { fnv1a32 } from './generation-hash.ts';

export type MirrorNodeType =
  | 'PROJECT'
  | 'MODULE'
  | 'SOURCE_FILE'
  | 'COMPONENT'
  | 'FUNCTION'
  | 'HOOK'
  | 'STATE_OWNER'
  | 'DATA_COLLECTION'
  | 'REALTIME_SUBSCRIPTION'
  | 'WORKFLOW'
  | 'INVARIANT'
  | 'RISK'
  | 'EXTERNAL_DEPENDENCY'
  | 'CANONICAL_ARTIFACT'
  | 'UNKNOWN';

export type MirrorEdgeType =
  | 'CONTAINS'
  | 'DEFINES'
  | 'CALLS'
  | 'READS'
  | 'WRITES'
  | 'SUBSCRIBES_TO'
  | 'PUBLISHES_TO'
  | 'OWNS_STATE'
  | 'DERIVES_FROM'
  | 'DEPENDS_ON'
  | 'VALIDATED_BY'
  | 'CONSTRAINED_BY'
  | 'SUPERSEDES'
  | 'RELATED_TO'
  | 'AFFECTS'
  | 'HANDLES_ERROR_FOR'
  | 'UNKNOWN';

export type MirrorKnowledgeStatus = 'CONFIRMED' | 'INFERRED' | 'UNKNOWN';

export type MirrorFreshnessState = 'CURRENT' | 'PARTIALLY_STALE' | 'STALE' | 'INVALID' | 'SUPERSEDED';

export interface MirrorIdentity {
  mirrorArtifactId: string;
  mirrorRevision: string;
  sourceRepositoryRevision: string;
  generationAttemptId?: string;
  supersedes?: string;
  sourceArtifactIds: readonly string[];
  schemaVersion: string;
}

export interface MirrorNodeInput {
  nodeId: string;
  nodeType: MirrorNodeType;
  label: string;
  sourceArtifactId?: string;
  sourceFile?: string;
  sourceSymbol?: string;
  knowledgeStatus?: MirrorKnowledgeStatus;
  repositoryRevision?: string;
  evidenceLink?: string;
  validationStatus?: string;
  metadata?: Record<string, unknown>;
}

export interface MirrorNode {
  nodeId: string;
  nodeType: MirrorNodeType;
  label: string;
  sourceArtifactId?: string;
  sourceFile?: string;
  sourceSymbol?: string;
  knowledgeStatus: MirrorKnowledgeStatus;
  repositoryRevision?: string;
  evidenceLink?: string;
  validationStatus?: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface MirrorEdgeInput {
  edgeId: string;
  edgeType: MirrorEdgeType;
  sourceNodeId: string;
  targetNodeId: string;
  knowledgeStatus?: MirrorKnowledgeStatus;
  evidenceLink?: string;
  metadata?: Record<string, unknown>;
}

export interface MirrorEdge {
  edgeId: string;
  edgeType: MirrorEdgeType;
  sourceNodeId: string;
  targetNodeId: string;
  knowledgeStatus: MirrorKnowledgeStatus;
  evidenceLink?: string;
  metadata: Readonly<Record<string, unknown>>;
}

export interface MirrorSnapshotInput {
  identity: MirrorIdentity;
  nodes: readonly MirrorNodeInput[];
  edges: readonly MirrorEdgeInput[];
  freshnessState?: MirrorFreshnessState;
}

export interface MirrorSnapshot {
  identity: MirrorIdentity;
  nodes: readonly MirrorNode[];
  edges: readonly MirrorEdge[];
  freshnessState: MirrorFreshnessState;
  nodeCount: number;
  edgeCount: number;
  fingerprint: string;
}

export interface MirrorFingerprintInput {
  identity: MirrorIdentity;
  nodes: readonly MirrorNode[];
  edges: readonly MirrorEdge[];
  freshnessState: MirrorFreshnessState;
}

export type MirrorNodeCollection = Record<string, MirrorNode>;
export type MirrorEdgeCollection = Record<string, MirrorEdge>;

const MIRROR_SCHEMA_VERSION = '1.0.0' as const;

const ALLOWED_NODE_TYPES: readonly MirrorNodeType[] = [
  'PROJECT', 'MODULE', 'SOURCE_FILE', 'COMPONENT', 'FUNCTION',
  'HOOK', 'STATE_OWNER', 'DATA_COLLECTION', 'REALTIME_SUBSCRIPTION',
  'WORKFLOW', 'INVARIANT', 'RISK', 'EXTERNAL_DEPENDENCY',
  'CANONICAL_ARTIFACT', 'UNKNOWN',
];

const ALLOWED_EDGE_TYPES: readonly MirrorEdgeType[] = [
  'CONTAINS', 'DEFINES', 'CALLS', 'READS', 'WRITES',
  'SUBSCRIBES_TO', 'PUBLISHES_TO', 'OWNS_STATE', 'DERIVES_FROM',
  'DEPENDS_ON', 'VALIDATED_BY', 'CONSTRAINED_BY', 'SUPERSEDES',
  'RELATED_TO', 'AFFECTS', 'HANDLES_ERROR_FOR', 'UNKNOWN',
];

const ALLOWED_KNOWLEDGE_STATUSES: readonly MirrorKnowledgeStatus[] = [
  'CONFIRMED', 'INFERRED', 'UNKNOWN',
];

const ALLOWED_FRESHNESS_STATES: readonly MirrorFreshnessState[] = [
  'CURRENT', 'PARTIALLY_STALE', 'STALE', 'INVALID', 'SUPERSEDED',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeTextField(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Mirror field ${fieldName} must be a non-empty string. Received: ${String(value)}`);
  }
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Mirror field ${fieldName} must be a non-empty string.`);
  }
  return normalized;
}

function normalizeOptionalTextField(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeEnumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string,
  defaultValue: T,
): T {
  if (value === undefined || value === null) return defaultValue;
  if (allowed.includes(value as T)) {
    return value as T;
  }
  throw new Error(`Mirror field ${fieldName} must be one of ${allowed.join(', ')}. Received: ${String(value)}`);
}

function normalizeMetadata(value: unknown): Readonly<Record<string, unknown>> {
  if (value === undefined || value === null) {
    return Object.freeze({});
  }
  if (!isPlainObject(value)) {
    throw new Error('Mirror metadata must be a plain object when provided.');
  }
  return deepFreeze({ ...value });
}

function normalizeNodeId(value: unknown): string {
  const id = normalizeTextField(value, 'nodeId');
  if (id.length > 256) {
    throw new Error(`Mirror nodeId must be at most 256 characters. Received: ${id.length}`);
  }
  return id;
}

function normalizeEdgeId(value: unknown): string {
  const id = normalizeTextField(value, 'edgeId');
  if (id.length > 256) {
    throw new Error(`Mirror edgeId must be at most 256 characters. Received: ${id.length}`);
  }
  return id;
}

function sortNodes(nodes: readonly MirrorNode[]): readonly MirrorNode[] {
  return [...nodes].sort((left, right) => {
    if (left.nodeId !== right.nodeId) return left.nodeId.localeCompare(right.nodeId);
    if (left.nodeType !== right.nodeType) return left.nodeType.localeCompare(right.nodeType);
    return left.label.localeCompare(right.label);
  });
}

function sortEdges(edges: readonly MirrorEdge[]): readonly MirrorEdge[] {
  return [...edges].sort((left, right) => {
    if (left.edgeId !== right.edgeId) return left.edgeId.localeCompare(right.edgeId);
    if (left.sourceNodeId !== right.sourceNodeId) return left.sourceNodeId.localeCompare(right.sourceNodeId);
    return left.targetNodeId.localeCompare(right.targetNodeId);
  });
}

function normalizeMirrorIdentity(
  identity: MirrorIdentity,
): MirrorIdentity {
  const mirrorArtifactId = normalizeArtifactId(normalizeTextField(identity.mirrorArtifactId, 'mirrorArtifactId'));
  const mirrorRevision = normalizeTextField(identity.mirrorRevision, 'mirrorRevision');
  const sourceRepositoryRevision = normalizeTextField(identity.sourceRepositoryRevision, 'sourceRepositoryRevision');
  const schemaVersion = normalizeTextField(identity.schemaVersion, 'schemaVersion');

  if (schemaVersion !== MIRROR_SCHEMA_VERSION) {
    throw new Error(`Mirror schemaVersion must be ${MIRROR_SCHEMA_VERSION}. Received: ${schemaVersion}`);
  }

  const generationAttemptId = normalizeOptionalTextField(identity.generationAttemptId);
  const supersedes = normalizeOptionalTextField(identity.supersedes);

  if (supersedes !== undefined && !isArtifactId(supersedes)) {
    throw new Error(`Mirror supersedes must be a valid Artifact ID. Received: ${supersedes}`);
  }

  let sourceArtifactIds: string[];
  if (!Array.isArray(identity.sourceArtifactIds)) {
    throw new Error('Mirror identity sourceArtifactIds must be an array.');
  }
  sourceArtifactIds = identity.sourceArtifactIds.map((id) => normalizeArtifactId(normalizeTextField(id, 'sourceArtifactIds')));
  const dedupedIds = Array.from(new Set(sourceArtifactIds));
  dedupedIds.sort();

  return deepFreeze({
    mirrorArtifactId,
    mirrorRevision,
    sourceRepositoryRevision,
    schemaVersion,
    generationAttemptId,
    supersedes,
    sourceArtifactIds: dedupedIds,
  });
}

export function normalizeMirrorNode(input: MirrorNodeInput): MirrorNode {
  const nodeId = normalizeNodeId(input.nodeId);
  const nodeType = normalizeEnumValue(input.nodeType, ALLOWED_NODE_TYPES, 'nodeType', 'UNKNOWN');
  const label = normalizeTextField(input.label, 'label');
  const sourceArtifactId = normalizeOptionalTextField(input.sourceArtifactId);
  const sourceFile = normalizeOptionalTextField(input.sourceFile);
  const sourceSymbol = normalizeOptionalTextField(input.sourceSymbol);
  const knowledgeStatus = normalizeEnumValue(input.knowledgeStatus, ALLOWED_KNOWLEDGE_STATUSES, 'knowledgeStatus', 'UNKNOWN');
  const repositoryRevision = normalizeOptionalTextField(input.repositoryRevision);
  const evidenceLink = normalizeOptionalTextField(input.evidenceLink);
  const validationStatus = normalizeOptionalTextField(input.validationStatus);
  const metadata = normalizeMetadata(input.metadata);

  return deepFreeze({
    nodeId,
    nodeType,
    label,
    sourceArtifactId,
    sourceFile,
    sourceSymbol,
    knowledgeStatus,
    repositoryRevision,
    evidenceLink,
    validationStatus,
    metadata,
  });
}

export function normalizeMirrorEdge(input: MirrorEdgeInput): MirrorEdge {
  const edgeId = normalizeEdgeId(input.edgeId);
  const edgeType = normalizeEnumValue(input.edgeType, ALLOWED_EDGE_TYPES, 'edgeType', 'UNKNOWN');
  const sourceNodeId = normalizeNodeId(input.sourceNodeId);
  const targetNodeId = normalizeNodeId(input.targetNodeId);

  if (sourceNodeId === targetNodeId) {
    throw new Error(`Mirror edge cannot connect a node to itself. edgeId: ${edgeId}, nodeId: ${sourceNodeId}`);
  }

  const knowledgeStatus = normalizeEnumValue(input.knowledgeStatus, ALLOWED_KNOWLEDGE_STATUSES, 'knowledgeStatus', 'UNKNOWN');
  const evidenceLink = normalizeOptionalTextField(input.evidenceLink);
  const metadata = normalizeMetadata(input.metadata);

  return deepFreeze({
    edgeId,
    edgeType,
    sourceNodeId,
    targetNodeId,
    knowledgeStatus,
    evidenceLink,
    metadata,
  });
}

export function computeMirrorFingerprint(input: MirrorFingerprintInput): string {
  const normalized = {
    identity: {
      mirrorArtifactId: input.identity.mirrorArtifactId,
      mirrorRevision: input.identity.mirrorRevision,
      sourceRepositoryRevision: input.identity.sourceRepositoryRevision,
      schemaVersion: input.identity.schemaVersion,
      generationAttemptId: input.identity.generationAttemptId,
      supersedes: input.identity.supersedes,
      sourceArtifactIds: [...input.identity.sourceArtifactIds].sort(),
    },
    nodes: sortNodes(input.nodes).map((node) => ({
      nodeId: node.nodeId,
      nodeType: node.nodeType,
      label: node.label,
      sourceArtifactId: node.sourceArtifactId,
      sourceFile: node.sourceFile,
      sourceSymbol: node.sourceSymbol,
      knowledgeStatus: node.knowledgeStatus,
      repositoryRevision: node.repositoryRevision,
      evidenceLink: node.evidenceLink,
      validationStatus: node.validationStatus,
    })),
    edges: sortEdges(input.edges).map((edge) => ({
      edgeId: edge.edgeId,
      edgeType: edge.edgeType,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      knowledgeStatus: edge.knowledgeStatus,
      evidenceLink: edge.evidenceLink,
    })),
    freshnessState: input.freshnessState,
  };

  return `MIRROR::${fnv1a32(stableStringify(normalized))}`;
}

export function createMirrorSnapshot(input: MirrorSnapshotInput): MirrorSnapshot {
  const identity = normalizeMirrorIdentity(input.identity);
  const freshnessState = normalizeEnumValue(input.freshnessState, ALLOWED_FRESHNESS_STATES, 'freshnessState', 'CURRENT');

  const normalizedNodes = input.nodes.map((node) => normalizeMirrorNode(node));
  const sortedNodes = sortNodes(normalizedNodes);

  const knownNodeIds = new Set(sortedNodes.map((node) => node.nodeId));

  const normalizedEdges = input.edges.map((edge) => {
    const normalized = normalizeMirrorEdge(edge);
    if (!knownNodeIds.has(normalized.sourceNodeId)) {
      throw new Error(`Mirror edge references unknown source node: ${normalized.sourceNodeId}`);
    }
    if (!knownNodeIds.has(normalized.targetNodeId)) {
      throw new Error(`Mirror edge references unknown target node: ${normalized.targetNodeId}`);
    }
    return normalized;
  });
  const sortedEdges = sortEdges(normalizedEdges);

  const fingerprint = computeMirrorFingerprint({
    identity,
    nodes: sortedNodes,
    edges: sortedEdges,
    freshnessState,
  });

  return deepFreeze({
    identity,
    nodes: sortedNodes,
    edges: sortedEdges,
    freshnessState,
    nodeCount: sortedNodes.length,
    edgeCount: sortedEdges.length,
    fingerprint,
  });
}

export function createMirrorIdentity(input: {
  mirrorArtifactId: string;
  mirrorRevision: string;
  sourceRepositoryRevision?: string;
  generationAttemptId?: string;
  supersedes?: string;
  sourceArtifactIds?: readonly string[];
}): MirrorIdentity {
  return normalizeMirrorIdentity({
    mirrorArtifactId: input.mirrorArtifactId,
    mirrorRevision: input.mirrorRevision,
    sourceRepositoryRevision: input.sourceRepositoryRevision ?? input.mirrorRevision,
    schemaVersion: MIRROR_SCHEMA_VERSION,
    generationAttemptId: input.generationAttemptId,
    supersedes: input.supersedes,
    sourceArtifactIds: input.sourceArtifactIds ?? [],
  });
}

export function buildNodeIndex(nodes: readonly MirrorNode[]): MirrorNodeCollection {
  const index: Record<string, MirrorNode> = {};
  for (const node of nodes) {
    index[node.nodeId] = node;
  }
  return Object.freeze(index);
}

export function buildEdgeIndex(edges: readonly MirrorEdge[]): MirrorEdgeCollection {
  const index: Record<string, MirrorEdge> = {};
  for (const edge of edges) {
    index[edge.edgeId] = edge;
  }
  return Object.freeze(index);
}

export function lookupMirrorNode(
  snapshot: MirrorSnapshot,
  nodeId: string,
): MirrorNode | undefined {
  return snapshot.nodes.find((node) => node.nodeId === nodeId);
}

export function lookupMirrorEdge(
  snapshot: MirrorSnapshot,
  edgeId: string,
): MirrorEdge | undefined {
  return snapshot.edges.find((edge) => edge.edgeId === edgeId);
}

export function findNodesByType(
  snapshot: MirrorSnapshot,
  nodeType: MirrorNodeType,
): readonly MirrorNode[] {
  return snapshot.nodes.filter((node) => node.nodeType === nodeType);
}

export function findEdgesByType(
  snapshot: MirrorSnapshot,
  edgeType: MirrorEdgeType,
): readonly MirrorEdge[] {
  return snapshot.edges.filter((edge) => edge.edgeType === edgeType);
}

export function findEdgesFromNode(
  snapshot: MirrorSnapshot,
  nodeId: string,
): readonly MirrorEdge[] {
  return snapshot.edges.filter((edge) => edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId);
}

export function findEdgesFromSource(
  snapshot: MirrorSnapshot,
  nodeId: string,
): readonly MirrorEdge[] {
  return snapshot.edges.filter((edge) => edge.sourceNodeId === nodeId);
}

export function resolveMirrorNodeSourceReference(
  registry: CanonicalRegistry,
  node: MirrorNode,
): ArtifactReferenceResolution | undefined {
  if (!node.sourceArtifactId) return undefined;
  return resolveArtifactReference(
    registry,
    createArtifactReference({
      targetArtifactId: node.sourceArtifactId,
      sourceArtifactId: node.nodeId,
    }),
  );
}

export function buildMirrorSnapshotFromRegistry(
  registry: CanonicalRegistry,
  identity: MirrorIdentity,
  options?: {
    freshnessState?: MirrorFreshnessState;
    excludeArtifactTypes?: readonly string[];
  },
): MirrorSnapshot {
  const entries = registry.entries;
  const excludeTypes = options?.excludeArtifactTypes ?? [];

  const filteredEntries = entries.filter((entry) => !excludeTypes.includes(entry.artifactType));
  const includedNodeIds = new Set(filteredEntries.map((entry) => entry.artifactId));

  const nodes: MirrorNodeInput[] = filteredEntries.map((entry) => ({
    nodeId: entry.artifactId,
    nodeType: 'CANONICAL_ARTIFACT' as MirrorNodeType,
    label: `${entry.artifactType}: ${entry.artifactId}`,
    sourceArtifactId: entry.artifactId,
    sourceFile: entry.authoritySource,
    knowledgeStatus: 'CONFIRMED' as MirrorKnowledgeStatus,
    repositoryRevision: entry.sourceRevision,
    validationStatus: entry.freshnessState === 'CURRENT' ? 'CURRENT' : entry.freshnessState,
  }));

  const edges: MirrorEdgeInput[] = [];
  for (const entry of filteredEntries) {
    if (entry.supersedes) {
      for (const supersededId of entry.supersedes) {
        if (includedNodeIds.has(supersededId)) {
          edges.push({
            edgeId: `${entry.artifactId}-SUPERSEDES-${supersededId}`,
            edgeType: 'SUPERSEDES',
            sourceNodeId: entry.artifactId,
            targetNodeId: supersededId,
            knowledgeStatus: 'CONFIRMED',
          });
        }
      }
    }
    if (entry.derivedArtifacts) {
      for (const derivedId of entry.derivedArtifacts) {
        if (includedNodeIds.has(derivedId)) {
          edges.push({
            edgeId: `${entry.artifactId}-DERIVES-${derivedId}`,
            edgeType: 'DERIVES_FROM',
            sourceNodeId: derivedId,
            targetNodeId: entry.artifactId,
            knowledgeStatus: 'CONFIRMED',
          });
        }
      }
    }
  }

  return createMirrorSnapshot({
    identity,
    nodes,
    edges,
    freshnessState: options?.freshnessState ?? 'CURRENT',
  });
}
