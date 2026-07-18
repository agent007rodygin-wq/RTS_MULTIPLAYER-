import { deepFreeze } from './knowledge-artifact.ts';
import {
  resolveArtifactReference,
  type CanonicalRegistry,
} from './canonical-registry.ts';
import { isArtifactId } from './artifact-identity.ts';
import type { MirrorSnapshot, MirrorNode, MirrorEdge } from './mirror-core.ts';

export type MirrorValidationCode =
  | 'MIRROR_SCHEMA_VERSION_MISMATCH'
  | 'MIRROR_EMPTY_SNAPSHOT'
  | 'MIRROR_MISSING_IDENTITY'
  | 'MIRROR_MISSING_NODES'
  | 'MIRROR_MISSING_EDGES'
  | 'MIRROR_UNRESOLVED_REFERENCE'
  | 'MIRROR_DANGLING_EDGE'
  | 'MIRROR_DUPLICATE_NODE_ID'
  | 'MIRROR_DUPLICATE_EDGE_ID'
  | 'MIRROR_SELF_REFERENCING_EDGE'
  | 'MIRROR_FINGERPRINT_MISMATCH'
  | 'MIRROR_FRESHNESS_STALE'
  | 'MIRROR_FRESHNESS_INVALID'
  | 'MIRROR_STALE_SOURCE_REVISION';

export type MirrorValidationSeverity = 'WARNING' | 'ERROR' | 'BLOCKED';

export interface MirrorValidationIssue {
  code: MirrorValidationCode;
  severity: MirrorValidationSeverity;
  message: string;
  nodeId?: string;
  edgeId?: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface MirrorValidationReport {
  valid: boolean;
  blocked: boolean;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  issues: readonly MirrorValidationIssue[];
}

const EXPECTED_SCHEMA_VERSION = '1.0.0';
const ALLOWED_FRESHNESS_STATES = new Set([
  'CURRENT', 'PARTIALLY_STALE', 'STALE', 'INVALID', 'SUPERSEDED',
]);

function collectNodeIds(nodes: readonly MirrorNode[]): Set<string> {
  return new Set(nodes.map((node) => node.nodeId));
}

function findDuplicateIds(ids: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return duplicates;
}

export function validateMirrorSnapshot(
  snapshot: unknown,
  registry?: CanonicalRegistry,
): MirrorValidationReport {
  const issues: MirrorValidationIssue[] = [];

  if (!snapshot || typeof snapshot !== 'object') {
    issues.push({
      code: 'MIRROR_MISSING_IDENTITY',
      severity: 'BLOCKED',
      message: 'Mirror snapshot must be a non-null object.',
    });
    return buildReport(issues);
  }

  const s = snapshot as Record<string, unknown>;

  if (!s.identity || typeof s.identity !== 'object') {
    issues.push({
      code: 'MIRROR_MISSING_IDENTITY',
      severity: 'BLOCKED',
      message: 'Mirror snapshot must have an identity object.',
    });
    return buildReport(issues);
  }

  const identity = s.identity as Record<string, unknown>;

  if (identity.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    issues.push({
      code: 'MIRROR_SCHEMA_VERSION_MISMATCH',
      severity: 'BLOCKED',
      message: `Expected schema version ${EXPECTED_SCHEMA_VERSION}, found ${String(identity.schemaVersion)}.`,
    });
  }

  if (!Array.isArray(s.nodes)) {
    issues.push({
      code: 'MIRROR_MISSING_NODES',
      severity: 'BLOCKED',
      message: 'Mirror snapshot must have a nodes array.',
    });
    return buildReport(issues);
  }

  if (s.nodes.length === 0) {
    issues.push({
      code: 'MIRROR_EMPTY_SNAPSHOT',
      severity: 'WARNING',
      message: 'Mirror snapshot contains no nodes.',
    });
    return buildReport(issues);
  }

  if (!Array.isArray(s.edges)) {
    issues.push({
      code: 'MIRROR_MISSING_EDGES',
      severity: 'BLOCKED',
      message: 'Mirror snapshot must have an edges array.',
    });
    return buildReport(issues);
  }

  const nodes = s.nodes as MirrorNode[];
  const edges = s.edges as MirrorEdge[];
  const knownNodeIds = collectNodeIds(nodes);

  const duplicateNodeIds = findDuplicateIds(nodes.map((n) => n.nodeId));
  for (const nodeId of duplicateNodeIds) {
    issues.push({
      code: 'MIRROR_DUPLICATE_NODE_ID',
      severity: 'ERROR',
      message: `Duplicate node ID: ${nodeId}.`,
      nodeId,
    });
  }

  const duplicateEdgeIds = findDuplicateIds(edges.map((e) => e.edgeId));
  for (const edgeId of duplicateEdgeIds) {
    issues.push({
      code: 'MIRROR_DUPLICATE_EDGE_ID',
      severity: 'ERROR',
      message: `Duplicate edge ID: ${edgeId}.`,
      edgeId,
    });
  }

  const freshnessState = String(s.freshnessState ?? '');
  if (freshnessState && !ALLOWED_FRESHNESS_STATES.has(freshnessState)) {
    issues.push({
      code: 'MIRROR_FRESHNESS_INVALID',
      severity: 'ERROR',
      message: `Unknown freshness state: ${freshnessState}.`,
    });
  } else if (freshnessState === 'STALE') {
    issues.push({
      code: 'MIRROR_FRESHNESS_STALE',
      severity: 'BLOCKED',
      message: 'Mirror snapshot is stale. Regeneration required.',
    });
  } else if (freshnessState === 'INVALID') {
    issues.push({
      code: 'MIRROR_FRESHNESS_INVALID',
      severity: 'BLOCKED',
      message: 'Mirror snapshot is invalid. Regeneration required.',
    });
  }

  for (const edge of edges) {
    if (edge.sourceNodeId === edge.targetNodeId) {
      issues.push({
        code: 'MIRROR_SELF_REFERENCING_EDGE',
        severity: 'ERROR',
        message: `Edge ${edge.edgeId} connects node ${edge.sourceNodeId} to itself.`,
        edgeId: edge.edgeId,
        nodeId: edge.sourceNodeId,
      });
      continue;
    }

    if (!knownNodeIds.has(edge.sourceNodeId)) {
      issues.push({
        code: 'MIRROR_DANGLING_EDGE',
        severity: 'ERROR',
        message: `Edge ${edge.edgeId} references unknown source node: ${edge.sourceNodeId}.`,
        edgeId: edge.edgeId,
        nodeId: edge.sourceNodeId,
      });
    }

    if (!knownNodeIds.has(edge.targetNodeId)) {
      issues.push({
        code: 'MIRROR_DANGLING_EDGE',
        severity: 'ERROR',
        message: `Edge ${edge.edgeId} references unknown target node: ${edge.targetNodeId}.`,
        edgeId: edge.edgeId,
        nodeId: edge.targetNodeId,
      });
    }
  }

  if (registry) {
    for (const node of nodes) {
      if (node.sourceArtifactId) {
        if (!isArtifactId(node.sourceArtifactId)) {
          issues.push({
            code: 'MIRROR_UNRESOLVED_REFERENCE',
            severity: 'WARNING',
            message: `Node ${node.nodeId} references invalid Artifact ID: ${node.sourceArtifactId}.`,
            nodeId: node.nodeId,
            artifactId: node.sourceArtifactId,
          });
          continue;
        }

        const resolution = resolveArtifactReference(registry, {
          targetArtifactId: node.sourceArtifactId,
          sourceArtifactId: node.nodeId,
        });

        if (resolution.resolutionStatus === 'MISSING' || resolution.resolutionStatus === 'INVALID_REFERENCE') {
          issues.push({
            code: 'MIRROR_UNRESOLVED_REFERENCE',
            severity: 'WARNING',
            message: `Node ${node.nodeId} references unresolved Artifact ID: ${node.sourceArtifactId}. Status: ${resolution.resolutionStatus}`,
            nodeId: node.nodeId,
            artifactId: node.sourceArtifactId,
          });
        }
      }
    }
  }

  return buildReport(issues);
}

function buildReport(issues: MirrorValidationIssue[]): MirrorValidationReport {
  const blocked = issues.some((issue) => issue.severity === 'BLOCKED');
  const errorCount = issues.filter((issue) => issue.severity === 'ERROR').length;
  const warningCount = issues.filter((issue) => issue.severity === 'WARNING').length;

  return deepFreeze({
    valid: !blocked && errorCount === 0,
    blocked,
    issueCount: issues.length,
    errorCount,
    warningCount,
    issues,
  });
}
