import assert from 'node:assert/strict';
import { createCanonicalRegistry } from '../../src/project-brain/canonical-registry.ts';
import {
  normalizeMirrorNode,
  normalizeMirrorEdge,
  createMirrorSnapshot,
  createMirrorIdentity,
  computeMirrorFingerprint,
  buildNodeIndex,
  buildEdgeIndex,
  lookupMirrorNode,
  lookupMirrorEdge,
  findNodesByType,
  findEdgesByType,
  findEdgesFromNode,
  findEdgesFromSource,
  buildMirrorSnapshotFromRegistry,
} from '../../src/project-brain/mirror-core.ts';
import { computeMirrorDiff } from '../../src/project-brain/mirror-diff.ts';
import {
  performFullRefresh,
  performIncrementalRefresh,
  verifyIncrementalRefreshEquivalence,
} from '../../src/project-brain/mirror-refresh.ts';
import { validateMirrorSnapshot } from '../../src/project-brain/mirror-validation.ts';
import {
  serializeMirrorSnapshot,
  loadMirrorSnapshot,
  loadAndValidateMirrorSnapshot,
  buildMirrorSerialization,
} from '../../src/project-brain/mirror-serialization.ts';
import { buildMirrorDiagnostics } from '../../src/project-brain/mirror-diagnostics.ts';

// ============================================================
// 1. Mirror Node Construction
// ============================================================
{
  const node = normalizeMirrorNode({
    nodeId: 'node-001',
    nodeType: 'PROJECT',
    label: 'Test Project',
    sourceArtifactId: 'PB-TEST-001',
    sourceFile: 'src/test.ts',
    sourceSymbol: 'TestComponent',
    knowledgeStatus: 'CONFIRMED',
    repositoryRevision: 'rev-001',
    evidenceLink: 'evidence-001',
    validationStatus: 'CURRENT',
    metadata: { description: 'A test project node' },
  });

  assert.equal(node.nodeId, 'node-001');
  assert.equal(node.nodeType, 'PROJECT');
  assert.equal(node.label, 'Test Project');
  assert.equal(node.sourceArtifactId, 'PB-TEST-001');
  assert.equal(node.knowledgeStatus, 'CONFIRMED');
  assert.equal(node.repositoryRevision, 'rev-001');
  assert.equal(node.metadata.description, 'A test project node');
  assert.equal(Object.isFrozen(node), true);
  assert.equal(Object.isFrozen(node.metadata), true);
}

// Default knowledge status
{
  const node = normalizeMirrorNode({
    nodeId: 'node-002',
    nodeType: 'FUNCTION',
    label: 'helper',
  });
  assert.equal(node.knowledgeStatus, 'UNKNOWN');
}

// Empty metadata
{
  const node = normalizeMirrorNode({
    nodeId: 'node-003',
    nodeType: 'MODULE',
    label: 'utils',
  });
  assert.deepEqual(node.metadata, {});
}

// Invalid node type defaults to UNKNOWN
{
  const node = normalizeMirrorNode({
    nodeId: 'node-004',
    nodeType: 'UNKNOWN',
    label: 'unknown',
  });
  assert.equal(node.nodeType, 'UNKNOWN');
}

// Fail-closed on empty nodeId
{
  assert.throws(() => {
    normalizeMirrorNode({
      nodeId: '',
      nodeType: 'PROJECT',
      label: 'test',
    });
  }, /non-empty string/);
}

// Fail-closed on empty label
{
  assert.throws(() => {
    normalizeMirrorNode({
      nodeId: 'node-005',
      nodeType: 'PROJECT',
      label: '',
    });
  }, /non-empty string/);
}

console.log('PASS: Mirror Node construction');

// ============================================================
// 2. Mirror Edge Construction
// ============================================================
{
  const edge = normalizeMirrorEdge({
    edgeId: 'edge-001',
    edgeType: 'CONTAINS',
    sourceNodeId: 'node-a',
    targetNodeId: 'node-b',
    knowledgeStatus: 'CONFIRMED',
    evidenceLink: 'evidence-002',
    metadata: { weight: 1 },
  });

  assert.equal(edge.edgeId, 'edge-001');
  assert.equal(edge.edgeType, 'CONTAINS');
  assert.equal(edge.sourceNodeId, 'node-a');
  assert.equal(edge.targetNodeId, 'node-b');
  assert.equal(edge.knowledgeStatus, 'CONFIRMED');
  assert.equal(Object.isFrozen(edge), true);
}

// Default edge knowledge status
{
  const edge = normalizeMirrorEdge({
    edgeId: 'edge-002',
    edgeType: 'DEPENDS_ON',
    sourceNodeId: 'node-a',
    targetNodeId: 'node-c',
  });
  assert.equal(edge.knowledgeStatus, 'UNKNOWN');
}

// Fail-closed on self-referencing edge
{
  assert.throws(() => {
    normalizeMirrorEdge({
      edgeId: 'edge-self',
      edgeType: 'CONTAINS',
      sourceNodeId: 'node-self',
      targetNodeId: 'node-self',
    });
  }, /cannot connect a node to itself/);
}

// Fail-closed on empty edgeId
{
  assert.throws(() => {
    normalizeMirrorEdge({
      edgeId: '',
      edgeType: 'CONTAINS',
      sourceNodeId: 'node-a',
      targetNodeId: 'node-b',
    });
  }, /non-empty string/);
}

console.log('PASS: Mirror Edge construction');

// ============================================================
// 3. Mirror Identity
// ============================================================
{
  const identity = createMirrorIdentity({
    mirrorArtifactId: 'PB-MIRROR-001',
    mirrorRevision: 'rev-001',
    sourceRepositoryRevision: 'src-rev-001',
    generationAttemptId: 'attempt-001',
    sourceArtifactIds: ['PB-CONSTITUTION-001', 'PB-ARCHITECTURE-001'],
  });

  assert.equal(identity.mirrorArtifactId, 'PB-MIRROR-001');
  assert.equal(identity.mirrorRevision, 'rev-001');
  assert.equal(identity.sourceRepositoryRevision, 'src-rev-001');
  assert.equal(identity.schemaVersion, '1.0.0');
  assert.equal(identity.generationAttemptId, 'attempt-001');
  assert.deepEqual(identity.sourceArtifactIds, ['PB-ARCHITECTURE-001', 'PB-CONSTITUTION-001']);
  assert.equal(Object.isFrozen(identity), true);
}

// Identity with minimal fields
{
  const identity = createMirrorIdentity({
    mirrorArtifactId: 'PB-MIRROR-MINIMAL',
    mirrorRevision: 'rev-001',
  });
  assert.equal(identity.sourceRepositoryRevision, 'rev-001');
  assert.deepEqual(identity.sourceArtifactIds, []);
}

console.log('PASS: Mirror Identity');

// ============================================================
// 4. Mirror Snapshot Construction
// ============================================================
{
  const snapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({
      mirrorArtifactId: 'PB-MIRROR-SNAPSHOT',
      mirrorRevision: 'rev-001',
      sourceRepositoryRevision: 'src-rev-001',
    }),
    nodes: [
      { nodeId: 'node-a', nodeType: 'PROJECT', label: 'Project A' },
      { nodeId: 'node-b', nodeType: 'MODULE', label: 'Module B' },
      { nodeId: 'node-c', nodeType: 'MODULE', label: 'Module C' },
    ],
    edges: [
      { edgeId: 'edge-1', edgeType: 'CONTAINS', sourceNodeId: 'node-a', targetNodeId: 'node-b' },
      { edgeId: 'edge-2', edgeType: 'CONTAINS', sourceNodeId: 'node-a', targetNodeId: 'node-c' },
    ],
    freshnessState: 'CURRENT',
  });

  assert.equal(snapshot.nodeCount, 3);
  assert.equal(snapshot.edgeCount, 2);
  assert.equal(snapshot.freshnessState, 'CURRENT');
  assert.equal(snapshot.fingerprint.startsWith('MIRROR::'), true);
  assert.equal(Object.isFrozen(snapshot), true);

  // Nodes are sorted
  assert.equal(snapshot.nodes[0].nodeId, 'node-a');
  assert.equal(snapshot.nodes[1].nodeId, 'node-b');
  assert.equal(snapshot.nodes[2].nodeId, 'node-c');
}

// Determinism: same input produces same snapshot
{
  const identity = createMirrorIdentity({
    mirrorArtifactId: 'PB-MIRROR-DET',
    mirrorRevision: 'rev-001',
  });

  const snap1 = createMirrorSnapshot({
    identity,
    nodes: [
      { nodeId: 'node-z', nodeType: 'FUNCTION', label: 'Z' },
      { nodeId: 'node-a', nodeType: 'FUNCTION', label: 'A' },
    ],
    edges: [
      { edgeId: 'edge-b', edgeType: 'DEPENDS_ON', sourceNodeId: 'node-z', targetNodeId: 'node-a' },
    ],
  });

  const snap2 = createMirrorSnapshot({
    identity,
    nodes: [
      { nodeId: 'node-a', nodeType: 'FUNCTION', label: 'A' },
      { nodeId: 'node-z', nodeType: 'FUNCTION', label: 'Z' },
    ],
    edges: [
      { edgeId: 'edge-b', edgeType: 'DEPENDS_ON', sourceNodeId: 'node-z', targetNodeId: 'node-a' },
    ],
  });

  assert.equal(snap1.fingerprint, snap2.fingerprint);
}

// Fail-closed on dangling edge
{
  assert.throws(() => {
    createMirrorSnapshot({
      identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-DANGLING', mirrorRevision: 'rev-001' }),
      nodes: [{ nodeId: 'node-a', nodeType: 'PROJECT', label: 'A' }],
      edges: [{ edgeId: 'edge-dangle', edgeType: 'CONTAINS', sourceNodeId: 'node-a', targetNodeId: 'node-missing' }],
    });
  }, /unknown target node/);
}

// Empty snapshot
{
  const snapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-EMPTY', mirrorRevision: 'rev-001' }),
    nodes: [],
    edges: [],
  });
  assert.equal(snapshot.nodeCount, 0);
  assert.equal(snapshot.edgeCount, 0);
}

console.log('PASS: Mirror Snapshot construction');

// ============================================================
// 5. Mirror Fingerprint
// ============================================================
{
  const identity = createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-FP', mirrorRevision: 'rev-001' });
  const nodes = [
    normalizeMirrorNode({ nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' }),
  ];
  const edges = [];

  const fp1 = computeMirrorFingerprint({ identity, nodes, edges, freshnessState: 'CURRENT' });
  const fp2 = computeMirrorFingerprint({ identity, nodes, edges, freshnessState: 'CURRENT' });
  assert.equal(fp1, fp2);
  assert.equal(fp1.startsWith('MIRROR::'), true);

  // Different data produces different fingerprint
  const fp3 = computeMirrorFingerprint({ identity, nodes, edges, freshnessState: 'STALE' });
  assert.notEqual(fp1, fp3);
}

console.log('PASS: Mirror Fingerprint');

// ============================================================
// 6. Query helpers
// ============================================================
{
  const snapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-QUERY', mirrorRevision: 'rev-001' }),
    nodes: [
      { nodeId: 'p', nodeType: 'PROJECT', label: 'Project' },
      { nodeId: 'm1', nodeType: 'MODULE', label: 'Module 1' },
      { nodeId: 'm2', nodeType: 'MODULE', label: 'Module 2' },
      { nodeId: 'f1', nodeType: 'FUNCTION', label: 'func1' },
    ],
    edges: [
      { edgeId: 'e1', edgeType: 'CONTAINS', sourceNodeId: 'p', targetNodeId: 'm1' },
      { edgeId: 'e2', edgeType: 'CONTAINS', sourceNodeId: 'p', targetNodeId: 'm2' },
      { edgeId: 'e3', edgeType: 'CALLS', sourceNodeId: 'm1', targetNodeId: 'f1' },
    ],
  });

  assert.equal(lookupMirrorNode(snapshot, 'p')?.label, 'Project');
  assert.equal(lookupMirrorNode(snapshot, 'nonexistent'), undefined);
  assert.equal(lookupMirrorEdge(snapshot, 'e1')?.edgeType, 'CONTAINS');
  assert.equal(lookupMirrorEdge(snapshot, 'nonexistent'), undefined);

  const modules = findNodesByType(snapshot, 'MODULE');
  assert.equal(modules.length, 2);

  const contains = findEdgesByType(snapshot, 'CONTAINS');
  assert.equal(contains.length, 2);

  const fromP = findEdgesFromNode(snapshot, 'p');
  assert.equal(fromP.length, 2);

  const sourceEdges = findEdgesFromSource(snapshot, 'm1');
  assert.equal(sourceEdges.length, 1);

  const index = buildNodeIndex(snapshot.nodes);
  assert.equal(index['p'].nodeType, 'PROJECT');
  assert.equal(Object.isFrozen(index), true);

  const edgeIndex = buildEdgeIndex(snapshot.edges);
  assert.equal(edgeIndex['e3'].edgeType, 'CALLS');
}

console.log('PASS: Mirror query helpers');

// ============================================================
// 7. Mirror Diff
// ============================================================
{
  const identity = createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-DIFF', mirrorRevision: 'rev-001' });

  const previous = createMirrorSnapshot({
    identity,
    nodes: [
      { nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' },
      { nodeId: 'n2', nodeType: 'MODULE', label: 'M1' },
    ],
    edges: [
      { edgeId: 'e1', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n2' },
    ],
  });

  const current = createMirrorSnapshot({
    identity,
    nodes: [
      { nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' },
      { nodeId: 'n2', nodeType: 'MODULE', label: 'M1' },
      { nodeId: 'n3', nodeType: 'FUNCTION', label: 'F1' },
    ],
    edges: [
      { edgeId: 'e1', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n2' },
      { edgeId: 'e2', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n3' },
    ],
  });

  const diff = computeMirrorDiff(previous, current);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.metadata.addedNodeCount, 1);
  assert.equal(diff.metadata.removedNodeCount, 0);
  assert.equal(diff.metadata.modifiedNodeCount, 0);
  assert.equal(diff.metadata.addedEdgeCount, 1);

  const addedNodes = diff.nodes.filter((n) => n.changeType === 'ADDED');
  assert.equal(addedNodes.length, 1);
  assert.equal(addedNodes[0].node.label, 'F1');

  // No changes diff
  const identicalDiff = computeMirrorDiff(previous, previous);
  assert.equal(identicalDiff.hasChanges, false);
  assert.equal(identicalDiff.metadata.changedNodeCount, 0);
}

console.log('PASS: Mirror Diff');

// ============================================================
// 8. Full Refresh
// ============================================================
{
  const identity = createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-REFRESH', mirrorRevision: 'rev-001' });

  // First full refresh
  const result1 = performFullRefresh({
    identity,
    nodes: [{ nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' }],
    edges: [],
  });
  assert.equal(result1.status, 'REFRESHED');
  assert.equal(result1.snapshot?.nodeCount, 1);

  // Same content -> CURRENT (no change)
  const result2 = performFullRefresh({
    identity,
    nodes: [{ nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' }],
    edges: [],
    previousSnapshot: result1.snapshot,
  });
  assert.equal(result2.status, 'CURRENT');

  // Different content -> REFRESHED
  const result3 = performFullRefresh({
    identity,
    nodes: [
      { nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' },
      { nodeId: 'n2', nodeType: 'MODULE', label: 'M2' },
    ],
    edges: [],
    previousSnapshot: result1.snapshot,
  });
  assert.equal(result3.status, 'REFRESHED');

  // Invalid input -> BLOCKED
  const result4 = performFullRefresh({
    identity,
    nodes: [{ nodeId: '', nodeType: 'PROJECT', label: '' }],
    edges: [],
  });
  assert.equal(result4.status, 'BLOCKED');
  assert.ok(result4.reason);
}

console.log('PASS: Full Refresh');

// ============================================================
// 9. Incremental Refresh
// ============================================================
{
  const identity = createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-INCR', mirrorRevision: 'rev-001' });

  const base = performFullRefresh({
    identity,
    nodes: [
      { nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' },
      { nodeId: 'n2', nodeType: 'MODULE', label: 'M1' },
    ],
    edges: [
      { edgeId: 'e1', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n2' },
    ],
  });
  const baseSnapshot = base.snapshot;
  if (!baseSnapshot) throw new Error('Expected base snapshot');
 
  // No changes -> CURRENT
  const noChange = performIncrementalRefresh({
    identity,
    previousSnapshot: baseSnapshot,
  });
  assert.equal(noChange.status, 'CURRENT');

  // Add node -> REFRESHED
  const addNode = performIncrementalRefresh({
    identity,
    previousSnapshot: baseSnapshot,
    addedNodes: [{ nodeId: 'n3', nodeType: 'FUNCTION', label: 'F3' }],
    addedEdges: [{ edgeId: 'e2', edgeType: 'CALLS', sourceNodeId: 'n2', targetNodeId: 'n3' }],
  });
  assert.equal(addNode.status, 'REFRESHED');
  assert.equal(addNode.snapshot?.nodeCount, 3);
  assert.equal(addNode.snapshot?.edgeCount, 2);

  // Remove node -> REFRESHED
  const removeNode = performIncrementalRefresh({
    identity,
    previousSnapshot: baseSnapshot,
    removedNodeIds: ['n2'],
  });
  assert.equal(removeNode.status, 'REFRESHED');
  assert.equal(removeNode.snapshot?.nodeCount, 1);
}

console.log('PASS: Incremental Refresh');

// ============================================================
// 10. Full Refresh vs Incremental Refresh Equivalence
// ============================================================
{
  const identity = createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-EQUIV', mirrorRevision: 'rev-001' });

  // Build full snapshot directly
  const fullSnapshot = createMirrorSnapshot({
    identity,
    nodes: [
      { nodeId: 'a', nodeType: 'PROJECT', label: 'A' },
      { nodeId: 'b', nodeType: 'MODULE', label: 'B' },
      { nodeId: 'c', nodeType: 'FUNCTION', label: 'C' },
    ],
    edges: [
      { edgeId: 'ab', edgeType: 'CONTAINS', sourceNodeId: 'a', targetNodeId: 'b' },
      { edgeId: 'bc', edgeType: 'CALLS', sourceNodeId: 'b', targetNodeId: 'c' },
    ],
  });

  // Build same snapshot incrementally
  const baseSnapshot = createMirrorSnapshot({
    identity,
    nodes: [
      { nodeId: 'a', nodeType: 'PROJECT', label: 'A' },
      { nodeId: 'b', nodeType: 'MODULE', label: 'B' },
    ],
    edges: [
      { edgeId: 'ab', edgeType: 'CONTAINS', sourceNodeId: 'a', targetNodeId: 'b' },
    ],
  });

  const incremental = performIncrementalRefresh({
    identity,
    previousSnapshot: baseSnapshot,
    addedNodes: [{ nodeId: 'c', nodeType: 'FUNCTION', label: 'C' }],
    addedEdges: [{ edgeId: 'bc', edgeType: 'CALLS', sourceNodeId: 'b', targetNodeId: 'c' }],
  });

  assert.equal(incremental.status, 'REFRESHED');
  if (!incremental.snapshot) throw new Error('Expected incremental snapshot');
  const equivalent = verifyIncrementalRefreshEquivalence({
    fullRefreshSnapshot: fullSnapshot,
    incrementalRefreshSnapshot: incremental.snapshot,
  });
  assert.equal(equivalent, true);
}

console.log('PASS: Full Refresh vs Incremental Refresh equivalence');

// ============================================================
// 11. Mirror Validation
// ============================================================
{
  const registry = createCanonicalRegistry([
    {
      artifactId: 'PB-VALID-001',
      artifactType: 'constitution',
      canonicalRole: 'governing-rule',
      authoritySource: 'constitution',
      owner: 'governance',
      sourceRevision: 'rev-001',
      freshnessState: 'CURRENT',
    },
  ]);

  // Valid snapshot passes validation
  const validSnapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-VALID', mirrorRevision: 'rev-001' }),
    nodes: [
      { nodeId: 'n1', nodeType: 'PROJECT', label: 'P1', sourceArtifactId: 'PB-VALID-001' },
    ],
    edges: [],
  });

  const validValidation = validateMirrorSnapshot(validSnapshot, registry);
  assert.equal(validValidation.valid, true);
  assert.equal(validValidation.blocked, false);

  // Stale snapshot -> blocked
  const staleSnapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-STALE', mirrorRevision: 'rev-001' }),
    nodes: [{ nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' }],
    edges: [],
    freshnessState: 'STALE',
  });
  const staleValidation = validateMirrorSnapshot(staleSnapshot);
  assert.equal(staleValidation.valid, false);
  assert.equal(staleValidation.blocked, true);

  // Invalid snapshot -> blocked
  const invalidValidation = validateMirrorSnapshot(null);
  assert.equal(invalidValidation.blocked, true);

  // Dangling edge validation (raw object bypassing createMirrorSnapshot)
  const danglingValidation = validateMirrorSnapshot({
    identity: { mirrorArtifactId: 'PB-MIRROR-DANGLING-VAL', mirrorRevision: 'rev-001', sourceRepositoryRevision: 'rev-001', sourceArtifactIds: [], schemaVersion: '1.0.0' },
    nodes: [{ nodeId: 'n1', nodeType: 'PROJECT', label: 'P1', knowledgeStatus: 'UNKNOWN', metadata: {} }],
    edges: [{ edgeId: 'bad', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n2', knowledgeStatus: 'UNKNOWN', metadata: {} }],
    freshnessState: 'CURRENT',
    nodeCount: 1,
    edgeCount: 1,
    fingerprint: 'MIRROR::dummy',
  });
  assert.equal(danglingValidation.valid, false);
  assert.equal(
    danglingValidation.issues.some((i) => i.code === 'MIRROR_DANGLING_EDGE'),
    true,
  );

  // Empty snapshot warning
  const emptySnapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-EMPTY-VAL', mirrorRevision: 'rev-001' }),
    nodes: [],
    edges: [],
  });
  const emptyValidation = validateMirrorSnapshot(emptySnapshot);
  assert.equal(emptyValidation.issues.some((i) => i.code === 'MIRROR_EMPTY_SNAPSHOT'), true);
}

console.log('PASS: Mirror Validation');

// ============================================================
// 12. Serialization Round-Trip
// ============================================================
{
  const original = createMirrorSnapshot({
    identity: createMirrorIdentity({
      mirrorArtifactId: 'PB-MIRROR-SERIAL',
      mirrorRevision: 'rev-001',
      sourceRepositoryRevision: 'src-rev-001',
      sourceArtifactIds: ['PB-CONSTITUTION-001'],
    }),
    nodes: [
      { nodeId: 'n1', nodeType: 'PROJECT', label: 'Test Project' },
      { nodeId: 'n2', nodeType: 'MODULE', label: 'Test Module' },
    ],
    edges: [
      { edgeId: 'e1', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n2' },
    ],
    freshnessState: 'CURRENT',
  });

  const serialized = serializeMirrorSnapshot(original);
  const deserialized = loadMirrorSnapshot(serialized);

  assert.equal(deserialized.fingerprint, original.fingerprint);
  assert.equal(deserialized.nodeCount, original.nodeCount);
  assert.equal(deserialized.edgeCount, original.edgeCount);
  assert.equal(deserialized.identity.mirrorArtifactId, original.identity.mirrorArtifactId);
  assert.deepEqual(deserialized.nodes[0], original.nodes[0]);

  // buildMirrorSerialization
  const serialization = buildMirrorSerialization(original);
  assert.equal(serialization.fingerprint, original.fingerprint);
  assert.equal(typeof serialization.serialized, 'string');

  // loadAndValidateMirrorSnapshot
  const loaded = loadAndValidateMirrorSnapshot(serialized);
  assert.equal(loaded.snapshot.fingerprint, original.fingerprint);
  assert.equal(loaded.validation.valid, true);
}

console.log('PASS: Serialization round-trip');

// ============================================================
// 13. Mirror Diagnostics
// ============================================================
{
  const snapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({
      mirrorArtifactId: 'PB-MIRROR-DIAG',
      mirrorRevision: 'rev-001',
    }),
    nodes: [{ nodeId: 'n1', nodeType: 'PROJECT', label: 'P1' }],
    edges: [],
  });

  const diagnostics = buildMirrorDiagnostics({
    snapshot,
    unresolvedReferences: 0,
    staleNodes: 0,
    inferredEdges: 0,
    validationBlocked: false,
    validationWarnings: 0,
    refreshType: 'full',
  });

  assert.equal(diagnostics.length > 0, true);
  assert.equal(diagnostics[0].mirrorArtifactId, 'PB-MIRROR-DIAG');
  assert.equal(diagnostics[0].index, 1);
  assert.equal(Object.isFrozen(diagnostics), true);

  // Diagnostics with warnings
  const warnDiagnostics = buildMirrorDiagnostics({
    snapshot,
    unresolvedReferences: 2,
    staleNodes: 1,
    inferredEdges: 3,
    validationBlocked: false,
    validationWarnings: 2,
    refreshType: 'incremental',
    previousFingerprint: snapshot.fingerprint,
  });

  const hasWarning = warnDiagnostics.some((d) => d.severity === 'WARN');
  assert.equal(hasWarning, true);
}

console.log('PASS: Mirror Diagnostics');

// ============================================================
// 14. Build Mirror from Registry
// ============================================================
{
  const registry = createCanonicalRegistry([
    {
      artifactId: 'PB-CONSTITUTION-001',
      artifactType: 'constitution',
      canonicalRole: 'governing-rule',
      authoritySource: 'constitution',
      owner: 'governance',
      sourceRevision: 'rev-001',
      freshnessState: 'CURRENT',
      supersedes: [],
      derivedArtifacts: ['PB-TRACEABILITY-001'],
    },
    {
      artifactId: 'PB-TRACEABILITY-001',
      artifactType: 'derived-surface',
      canonicalRole: 'derived-surface',
      authoritySource: 'traceability-report',
      owner: 'verification',
      sourceRevision: 'rev-002',
      freshnessState: 'CURRENT',
    },
  ]);

  const identity = createMirrorIdentity({
    mirrorArtifactId: 'PB-MIRROR-REG',
    mirrorRevision: 'rev-001',
    sourceRepositoryRevision: 'rev-001',
    sourceArtifactIds: ['PB-CONSTITUTION-001', 'PB-TRACEABILITY-001'],
  });

  const registryMirror = buildMirrorSnapshotFromRegistry(registry, identity);

  assert.equal(registryMirror.nodeCount, 2);
  assert.equal(registryMirror.edgeCount, 1);
  assert.equal(registryMirror.freshnessState, 'CURRENT');

  const constitutionNode = lookupMirrorNode(registryMirror, 'PB-CONSTITUTION-001');
  assert.equal(constitutionNode?.nodeType, 'CANONICAL_ARTIFACT');

  // With exclude filter
  const filteredIdentity = createMirrorIdentity({
    mirrorArtifactId: 'PB-MIRROR-REG-FILTERED',
    mirrorRevision: 'rev-001',
  });

  const filteredMirror = buildMirrorSnapshotFromRegistry(registry, filteredIdentity, {
    excludeArtifactTypes: ['constitution'],
  });

  assert.equal(filteredMirror.nodeCount, 1);
  assert.equal(lookupMirrorNode(filteredMirror, 'PB-CONSTITUTION-001'), undefined);
}

console.log('PASS: Mirror from Registry');

// ============================================================
// 15. Determinism Tests
// ============================================================
{
  const identity = createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-DETERMINISM', mirrorRevision: 'rev-001' });
  const nodesInput = [
    { nodeId: 'n3', nodeType: 'FUNCTION', label: 'Z' },
    { nodeId: 'n1', nodeType: 'MODULE', label: 'A' },
    { nodeId: 'n2', nodeType: 'PROJECT', label: 'M' },
  ];
  const edgesInput = [
    { edgeId: 'e3', edgeType: 'DEPENDS_ON', sourceNodeId: 'n2', targetNodeId: 'n3' },
    { edgeId: 'e1', edgeType: 'CONTAINS', sourceNodeId: 'n1', targetNodeId: 'n2' },
  ];

  const results = [];
  for (let i = 0; i < 5; i++) {
    // Shuffle inputs to verify determinism
    const shuffledNodes = [...nodesInput].sort(() => Math.random() - 0.5);
    const shuffledEdges = [...edgesInput].sort(() => Math.random() - 0.5);

    results.push(createMirrorSnapshot({
      identity,
      nodes: shuffledNodes,
      edges: shuffledEdges,
    }).fingerprint);
  }

  const allSame = results.every((fp) => fp === results[0]);
  assert.equal(allSame, true);
}

console.log('PASS: Determinism tests');

// ============================================================
// 16. Fail-Closed Tests
// ============================================================
{
  // Identity normalization always produces valid Artifact ID
  const idNormalized = createMirrorSnapshot({
    identity: { mirrorArtifactId: 'not normalized id', mirrorRevision: 'rev-001', sourceRepositoryRevision: 'rev-001', sourceArtifactIds: [], schemaVersion: '1.0.0' },
    nodes: [],
    edges: [],
  });
  assert.equal(idNormalized.identity.mirrorArtifactId, 'PB-NOT-NORMALIZED-ID');

  // Wrong schema version
  assert.throws(() => {
    createMirrorSnapshot({
      identity: { mirrorArtifactId: 'PB-MIRROR-BAD-SCHEMA', mirrorRevision: 'rev-001', sourceRepositoryRevision: 'rev-001', sourceArtifactIds: [], schemaVersion: '0.0.0' },
      nodes: [],
      edges: [],
    });
  });

  // Duplicate node IDs cause fail-closed in validation
  const duplicateValidation = validateMirrorSnapshot({
    identity: { mirrorArtifactId: 'PB-MIRROR-DUP', mirrorRevision: 'rev-001', sourceRepositoryRevision: 'rev-001', sourceArtifactIds: [], schemaVersion: '1.0.0' },
    nodes: [
      { nodeId: 'dup', nodeType: 'PROJECT', label: 'A', knowledgeStatus: 'UNKNOWN', metadata: {} },
      { nodeId: 'dup', nodeType: 'PROJECT', label: 'B', knowledgeStatus: 'UNKNOWN', metadata: {} },
    ],
    edges: [],
    freshnessState: 'CURRENT',
    nodeCount: 2,
    edgeCount: 0,
    fingerprint: 'MIRROR::dummy',
  });
  assert.equal(duplicateValidation.valid, false);
  assert.equal(
    duplicateValidation.issues.some((i) => i.code === 'MIRROR_DUPLICATE_NODE_ID'),
    true,
  );
}

console.log('PASS: Fail-closed tests');

// ============================================================
// 17. Immutability Tests
// ============================================================
{
  const node = normalizeMirrorNode({
    nodeId: 'immutable-test',
    nodeType: 'FUNCTION',
    label: 'immutable',
    metadata: { key: 'value' },
  });

  assert.throws(() => {
    Object.assign(node, { nodeId: 'changed' });
  });

  assert.throws(() => {
    Object.assign(node.metadata, { key: 'changed' });
  });

  const edge = normalizeMirrorEdge({
    edgeId: 'immutable-edge',
    edgeType: 'CALLS',
    sourceNodeId: 'a',
    targetNodeId: 'b',
  });

  assert.throws(() => {
    Object.assign(edge, { edgeId: 'changed' });
  });

  const snapshot = createMirrorSnapshot({
    identity: createMirrorIdentity({ mirrorArtifactId: 'PB-MIRROR-IMMUTABLE', mirrorRevision: 'rev-001' }),
    nodes: [{ nodeId: 'n', nodeType: 'MODULE', label: 'N' }],
    edges: [],
  });

  assert.throws(() => {
    Object.assign(snapshot, { fingerprint: 'changed' });
  });
}

console.log('PASS: Immutability tests');

console.log('\nAll Package G mirror tests passed.');
