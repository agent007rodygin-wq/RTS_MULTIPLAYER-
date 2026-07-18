import { deepFreeze } from './knowledge-artifact.ts';
import type {
  MirrorSnapshot,
  MirrorNode,
  MirrorEdge,
  MirrorNodeType,
  MirrorEdgeType,
  MirrorKnowledgeStatus,
} from './mirror-core.ts';

export type MirrorDiffChangeType = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';

export interface MirrorDiffNodeEntry {
  changeType: MirrorDiffChangeType;
  node: MirrorNode;
  previousNode?: MirrorNode;
}

export interface MirrorDiffEdgeEntry {
  changeType: MirrorDiffChangeType;
  edge: MirrorEdge;
  previousEdge?: MirrorEdge;
}

export interface MirrorDiffMetadata {
  previousFingerprint: string;
  currentFingerprint: string;
  previousSnapshotId: string;
  currentSnapshotId: string;
  previousRevision: string;
  currentRevision: string;
  changedNodeCount: number;
  changedEdgeCount: number;
  addedNodeCount: number;
  removedNodeCount: number;
  modifiedNodeCount: number;
  addedEdgeCount: number;
  removedEdgeCount: number;
  modifiedEdgeCount: number;
}

export interface MirrorDiff {
  metadata: MirrorDiffMetadata;
  nodes: readonly MirrorDiffNodeEntry[];
  edges: readonly MirrorDiffEdgeEntry[];
  hasChanges: boolean;
}

function getNodeKey(node: MirrorNode): string {
  return node.nodeId;
}

function getEdgeKey(edge: MirrorEdge): string {
  return `${edge.sourceNodeId}::${edge.edgeType}::${edge.targetNodeId}::${edge.edgeId}`;
}

function nodesEqual(left: MirrorNode, right: MirrorNode): boolean {
  if (left.nodeId !== right.nodeId) return false;
  if (left.nodeType !== right.nodeType) return false;
  if (left.label !== right.label) return false;
  if (left.sourceArtifactId !== right.sourceArtifactId) return false;
  if (left.sourceFile !== right.sourceFile) return false;
  if (left.sourceSymbol !== right.sourceSymbol) return false;
  if (left.knowledgeStatus !== right.knowledgeStatus) return false;
  if (left.repositoryRevision !== right.repositoryRevision) return false;
  if (left.evidenceLink !== right.evidenceLink) return false;
  if (left.validationStatus !== right.validationStatus) return false;
  return true;
}

function edgesEqual(left: MirrorEdge, right: MirrorEdge): boolean {
  if (left.edgeId !== right.edgeId) return false;
  if (left.edgeType !== right.edgeType) return false;
  if (left.sourceNodeId !== right.sourceNodeId) return false;
  if (left.targetNodeId !== right.targetNodeId) return false;
  if (left.knowledgeStatus !== right.knowledgeStatus) return false;
  if (left.evidenceLink !== right.evidenceLink) return false;
  return true;
}

export function computeMirrorDiff(
  previous: MirrorSnapshot,
  current: MirrorSnapshot,
): MirrorDiff {
  const previousNodeMap = new Map<string, MirrorNode>();
  for (const node of previous.nodes) {
    previousNodeMap.set(getNodeKey(node), node);
  }

  const currentNodeMap = new Map<string, MirrorNode>();
  for (const node of current.nodes) {
    currentNodeMap.set(getNodeKey(node), node);
  }

  const previousEdgeMap = new Map<string, MirrorEdge>();
  for (const edge of previous.edges) {
    previousEdgeMap.set(getEdgeKey(edge), edge);
  }

  const currentEdgeMap = new Map<string, MirrorEdge>();
  for (const edge of current.edges) {
    currentEdgeMap.set(getEdgeKey(edge), edge);
  }

  const nodeEntries: MirrorDiffNodeEntry[] = [];
  const allNodeKeys = new Set([...previousNodeMap.keys(), ...currentNodeMap.keys()]);

  let addedNodeCount = 0;
  let removedNodeCount = 0;
  let modifiedNodeCount = 0;

  for (const key of allNodeKeys) {
    const previousNode = previousNodeMap.get(key);
    const currentNode = currentNodeMap.get(key);

    if (!previousNode && currentNode) {
      nodeEntries.push({ changeType: 'ADDED', node: currentNode });
      addedNodeCount += 1;
    } else if (previousNode && !currentNode) {
      nodeEntries.push({ changeType: 'REMOVED', node: previousNode });
      removedNodeCount += 1;
    } else if (previousNode && currentNode) {
      if (nodesEqual(previousNode, currentNode)) {
        nodeEntries.push({ changeType: 'UNCHANGED', node: currentNode, previousNode });
      } else {
        nodeEntries.push({ changeType: 'MODIFIED', node: currentNode, previousNode });
        modifiedNodeCount += 1;
      }
    }
  }

  const edgeEntries: MirrorDiffEdgeEntry[] = [];
  const allEdgeKeys = new Set([...previousEdgeMap.keys(), ...currentEdgeMap.keys()]);

  let addedEdgeCount = 0;
  let removedEdgeCount = 0;
  let modifiedEdgeCount = 0;

  for (const key of allEdgeKeys) {
    const previousEdge = previousEdgeMap.get(key);
    const currentEdge = currentEdgeMap.get(key);

    if (!previousEdge && currentEdge) {
      edgeEntries.push({ changeType: 'ADDED', edge: currentEdge });
      addedEdgeCount += 1;
    } else if (previousEdge && !currentEdge) {
      edgeEntries.push({ changeType: 'REMOVED', edge: previousEdge });
      removedEdgeCount += 1;
    } else if (previousEdge && currentEdge) {
      if (edgesEqual(previousEdge, currentEdge)) {
        edgeEntries.push({ changeType: 'UNCHANGED', edge: currentEdge, previousEdge });
      } else {
        edgeEntries.push({ changeType: 'MODIFIED', edge: currentEdge, previousEdge });
        modifiedEdgeCount += 1;
      }
    }
  }

  nodeEntries.sort((left, right) => left.node.nodeId.localeCompare(right.node.nodeId));
  edgeEntries.sort((left, right) => left.edge.edgeId.localeCompare(right.edge.edgeId));

  const changedNodeCount = addedNodeCount + removedNodeCount + modifiedNodeCount;
  const changedEdgeCount = addedEdgeCount + removedEdgeCount + modifiedEdgeCount;

  const metadata: MirrorDiffMetadata = {
    previousFingerprint: previous.fingerprint,
    currentFingerprint: current.fingerprint,
    previousSnapshotId: previous.identity.mirrorArtifactId,
    currentSnapshotId: current.identity.mirrorArtifactId,
    previousRevision: previous.identity.mirrorRevision,
    currentRevision: current.identity.mirrorRevision,
    changedNodeCount,
    changedEdgeCount,
    addedNodeCount,
    removedNodeCount,
    modifiedNodeCount,
    addedEdgeCount,
    removedEdgeCount,
    modifiedEdgeCount,
  };

  return deepFreeze({
    metadata,
    nodes: nodeEntries,
    edges: edgeEntries,
    hasChanges: changedNodeCount > 0 || changedEdgeCount > 0,
  });
}
