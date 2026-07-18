import type {
  MirrorSnapshot,
  MirrorFreshnessState,
  MirrorNodeInput,
  MirrorEdgeInput,
  MirrorIdentity,
} from './mirror-core.ts';
import { createMirrorSnapshot } from './mirror-core.ts';

export type RefreshResultStatus = 'CURRENT' | 'REFRESHED' | 'STALE' | 'BLOCKED';

export interface RefreshResult {
  status: RefreshResultStatus;
  snapshot?: MirrorSnapshot;
  reason?: string;
}

function snapshotsEqual(
  previous: MirrorSnapshot,
  current: MirrorSnapshot,
): boolean {
  return previous.fingerprint === current.fingerprint;
}

function identitiesEqual(
  identity: MirrorIdentity,
  snapshot: MirrorSnapshot,
): boolean {
  return (
    identity.mirrorArtifactId === snapshot.identity.mirrorArtifactId &&
    identity.mirrorRevision === snapshot.identity.mirrorRevision &&
    identity.sourceRepositoryRevision === snapshot.identity.sourceRepositoryRevision
  );
}

export function performFullRefresh(input: {
  identity: MirrorIdentity;
  nodes: readonly MirrorNodeInput[];
  edges: readonly MirrorEdgeInput[];
  previousSnapshot?: MirrorSnapshot;
  freshnessState?: MirrorFreshnessState;
}): RefreshResult {
  try {
    const snapshot = createMirrorSnapshot({
      identity: input.identity,
      nodes: input.nodes,
      edges: input.edges,
      freshnessState: input.freshnessState ?? 'CURRENT',
    });

    if (input.previousSnapshot && snapshotsEqual(input.previousSnapshot, snapshot)) {
      return {
        status: 'CURRENT',
        snapshot: input.previousSnapshot,
      };
    }

    return {
      status: 'REFRESHED',
      snapshot,
    };
  } catch (error) {
    return {
      status: 'BLOCKED',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function performIncrementalRefresh(input: {
  identity: MirrorIdentity;
  previousSnapshot: MirrorSnapshot;
  addedNodes?: readonly MirrorNodeInput[];
  removedNodeIds?: readonly string[];
  modifiedNodes?: readonly MirrorNodeInput[];
  addedEdges?: readonly MirrorEdgeInput[];
  removedEdgeIds?: readonly string[];
  modifiedEdges?: readonly MirrorEdgeInput[];
  freshnessState?: MirrorFreshnessState;
}): RefreshResult {
  const previous = input.previousSnapshot;

  if (!input.addedNodes && !input.removedNodeIds && !input.modifiedNodes &&
      !input.addedEdges && !input.removedEdgeIds && !input.modifiedEdges) {
    if (
      identitiesEqual(input.identity, previous) &&
      (input.freshnessState === undefined || input.freshnessState === previous.freshnessState)
    ) {
      return {
        status: 'CURRENT',
        snapshot: previous,
      };
    }
  }

  const removedNodeSet = new Set(input.removedNodeIds ?? []);
  const removedEdgeSet = new Set(input.removedEdgeIds ?? []);
  const modifiedNodeIds = new Set((input.modifiedNodes ?? []).map((n) => n.nodeId));
  const modifiedEdgeIds = new Set((input.modifiedEdges ?? []).map((e) => e.edgeId));

  const combinedNodeInputs: MirrorNodeInput[] = [];

  for (const node of previous.nodes) {
    if (removedNodeSet.has(node.nodeId)) continue;
    if (modifiedNodeIds.has(node.nodeId)) continue;
    combinedNodeInputs.push(node);
  }

  for (const node of input.modifiedNodes ?? []) {
    if (removedNodeSet.has(node.nodeId)) continue;
    combinedNodeInputs.push(node);
  }

  for (const node of input.addedNodes ?? []) {
    if (removedNodeSet.has(node.nodeId)) continue;
    combinedNodeInputs.push(node);
  }

  const survivingNodeIds = new Set(combinedNodeInputs.map((n) => n.nodeId));

  const combinedEdgeInputs: MirrorEdgeInput[] = [];

  for (const edge of previous.edges) {
    if (removedEdgeSet.has(edge.edgeId)) continue;
    if (modifiedEdgeIds.has(edge.edgeId)) continue;
    if (!survivingNodeIds.has(edge.sourceNodeId) || !survivingNodeIds.has(edge.targetNodeId)) {
      continue;
    }
    combinedEdgeInputs.push(edge);
  }

  for (const edge of input.modifiedEdges ?? []) {
    if (removedEdgeSet.has(edge.edgeId)) continue;
    if (!survivingNodeIds.has(edge.sourceNodeId) || !survivingNodeIds.has(edge.targetNodeId)) {
      continue;
    }
    combinedEdgeInputs.push(edge);
  }

  for (const edge of input.addedEdges ?? []) {
    if (removedEdgeSet.has(edge.edgeId)) continue;
    if (!survivingNodeIds.has(edge.sourceNodeId) || !survivingNodeIds.has(edge.targetNodeId)) {
      continue;
    }
    combinedEdgeInputs.push(edge);
  }

  try {
    const mergedSnapshot = createMirrorSnapshot({
      identity: input.identity,
      nodes: combinedNodeInputs,
      edges: combinedEdgeInputs,
      freshnessState: input.freshnessState ?? previous.freshnessState,
    });

    if (snapshotsEqual(previous, mergedSnapshot)) {
      return {
        status: 'CURRENT',
        snapshot: previous,
      };
    }

    return {
      status: 'REFRESHED',
      snapshot: mergedSnapshot,
    };
  } catch (error) {
    return {
      status: 'BLOCKED',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function verifyIncrementalRefreshEquivalence(input: {
  fullRefreshSnapshot: MirrorSnapshot;
  incrementalRefreshSnapshot: MirrorSnapshot;
}): boolean {
  return input.fullRefreshSnapshot.fingerprint === input.incrementalRefreshSnapshot.fingerprint;
}
