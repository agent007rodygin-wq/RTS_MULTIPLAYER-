import { deepFreeze } from './knowledge-artifact.ts';
import {
  getKnowledgeRevisionHistory,
  getLatestKnowledgeRevision,
  type KnowledgeStore,
} from './knowledge-store.ts';
import { lookupCanonicalArtifact, type CanonicalRegistryEntry } from './canonical-registry.ts';
import type { KnowledgeArtifactRevision } from './knowledge-artifact.ts';
import type { BrainSession } from './brain-session.ts';

export type BrainRequirementRole = 'authority' | 'required' | 'optional' | 'dependency';

export type BrainArtifactClassification =
  | 'canonical'
  | 'derived'
  | 'stale'
  | 'superseded'
  | 'missing';

export type BrainDependencyRelation =
  | 'authority-seed'
  | 'required-seed'
  | 'optional-seed'
  | 'derived-artifact'
  | 'supersedes'
  | 'registry-reference';

export interface BrainResolvedArtifact {
  artifactId: string;
  roles: readonly BrainRequirementRole[];
  classification: BrainArtifactClassification;
  registryEntry?: CanonicalRegistryEntry;
  latestRevision?: KnowledgeArtifactRevision;
  revisionHistory: readonly KnowledgeArtifactRevision[];
  selectedFromArtifactIds: readonly string[];
  dependencyArtifactIds: readonly string[];
  rationale: string;
}

export interface BrainDependencyEdge {
  fromArtifactId: string;
  toArtifactId: string;
  relation: BrainDependencyRelation;
  rationale: string;
}

export interface BrainDependencyGraph {
  requestId: string;
  sessionId: string;
  rootArtifactIds: readonly string[];
  nodes: readonly BrainResolvedArtifact[];
  edges: readonly BrainDependencyEdge[];
}

interface PendingSelection {
  roles: Set<BrainRequirementRole>;
  selectedFromArtifactIds: Set<string>;
}

function isDerivedRegistryEntry(candidate: {
  artifactType: string;
  canonicalRole: string;
}): boolean {
  return /derived/i.test(candidate.artifactType) || /derived/i.test(candidate.canonicalRole);
}

function mergeStringSet(target: Set<string>, values: readonly string[]): Set<string> {
  for (const value of values) {
    target.add(value);
  }
  return target;
}

function mergeRoleSet(target: Set<BrainRequirementRole>, values: readonly BrainRequirementRole[]): Set<BrainRequirementRole> {
  for (const value of values) {
    target.add(value);
  }
  return target;
}

function toSortedStrings(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}

function toSortedRoles(values: Iterable<BrainRequirementRole>): readonly BrainRequirementRole[] {
  return Array.from(new Set(values)).sort() as BrainRequirementRole[];
}

function classifyArtifact(
  registryEntry: CanonicalRegistryEntry | undefined,
  latestRevision: KnowledgeArtifactRevision | undefined,
): BrainArtifactClassification {
  if (!registryEntry) {
    return 'missing';
  }

  const registryFreshness = registryEntry.freshnessState.toUpperCase();
  const registryStatus = (registryEntry.status ?? '').toUpperCase();

  if (
    latestRevision?.lifecycleState === 'SUPERSEDED' ||
    registryFreshness === 'SUPERSEDED' ||
    registryStatus === 'SUPERSEDED'
  ) {
    return 'superseded';
  }

  if (latestRevision?.freshnessState === 'STALE' || registryFreshness === 'STALE' || registryStatus === 'STALE') {
    return 'stale';
  }

  if (
    latestRevision?.storageKind === 'derived' ||
    latestRevision?.lifecycleState === 'DERIVED' ||
    isDerivedRegistryEntry(registryEntry)
  ) {
    return 'derived';
  }

  return 'canonical';
}

function collectRelatedArtifactIds(
  registryEntry: CanonicalRegistryEntry | undefined,
  latestRevision: KnowledgeArtifactRevision | undefined,
): Array<{ artifactId: string; relation: BrainDependencyRelation; rationale: string }> {
  const related: Array<{ artifactId: string; relation: BrainDependencyRelation; rationale: string }> = [];

  if (registryEntry) {
    for (const artifactId of registryEntry.derivedArtifacts ?? []) {
      related.push({
        artifactId,
        relation: 'derived-artifact',
        rationale: `${registryEntry.artifactId} declares ${artifactId} as a derived artifact.`,
      });
    }

    for (const artifactId of registryEntry.supersedes ?? []) {
      related.push({
        artifactId,
        relation: 'supersedes',
        rationale: `${registryEntry.artifactId} supersedes ${artifactId}.`,
      });
    }
  }

  if (latestRevision) {
    for (const artifactId of latestRevision.supersedesArtifactIds ?? []) {
      related.push({
        artifactId,
        relation: 'registry-reference',
        rationale: `${latestRevision.artifactId} revision ${latestRevision.revisionId} references ${artifactId}.`,
      });
    }
  }

  const deduped = new Map<string, { artifactId: string; relation: BrainDependencyRelation; rationale: string }>();
  for (const relation of related) {
    const existing = deduped.get(relation.artifactId);
    if (!existing) {
      deduped.set(relation.artifactId, relation);
      continue;
    }

    const chosenRelation =
      existing.relation === relation.relation
        ? existing.relation
        : existing.relation === 'supersedes'
          ? existing.relation
          : relation.relation === 'supersedes'
            ? relation.relation
            : existing.relation;

    deduped.set(relation.artifactId, {
      artifactId: relation.artifactId,
      relation: chosenRelation,
      rationale: `${existing.rationale}; ${relation.rationale}`,
    });
  }

  return Array.from(deduped.values()).sort((left, right) =>
    left.artifactId.localeCompare(right.artifactId),
  );
}

function buildArtifactRationale(
  artifactId: string,
  roles: readonly BrainRequirementRole[],
  classification: BrainArtifactClassification,
  selectedFromArtifactIds: readonly string[],
  relationRationales: readonly string[],
): string {
  const roleFragments = roles
    .slice()
    .sort()
    .map((role) => {
      switch (role) {
        case 'authority':
          return 'authority seed';
        case 'required':
          return 'required context';
        case 'optional':
          return 'optional context';
        case 'dependency':
          return 'dependency';
      }
    });

  const classificationFragment = (() => {
    switch (classification) {
      case 'canonical':
        return 'current canonical knowledge';
      case 'derived':
        return 'derived knowledge';
      case 'stale':
        return 'stale knowledge';
      case 'superseded':
        return 'superseded knowledge';
      case 'missing':
        return 'missing knowledge';
    }
  })();

  const sourceFragment =
    selectedFromArtifactIds.length > 0
      ? `selected from ${selectedFromArtifactIds.join(', ')}`
      : 'selected directly from the request';

  const relatedFragment =
    relationRationales.length > 0 ? `dependencies: ${relationRationales.join(' | ')}` : 'no dependency expansion';

  return [
    artifactId,
    roleFragments.join(', ') || 'unclassified role',
    classificationFragment,
    sourceFragment,
    relatedFragment,
  ].join(' :: ');
}

function enqueueSelection(
  queue: Array<{ artifactId: string; roles: Set<BrainRequirementRole>; selectedFromArtifactIds: Set<string> }>,
  pending: Map<string, PendingSelection>,
  artifactId: string,
  roles: readonly BrainRequirementRole[],
  selectedFromArtifactIds: readonly string[],
): void {
  const entry = pending.get(artifactId) ?? {
    roles: new Set<BrainRequirementRole>(),
    selectedFromArtifactIds: new Set<string>(),
  };

  const beforeRoleCount = entry.roles.size;
  const beforeSelectedCount = entry.selectedFromArtifactIds.size;

  mergeRoleSet(entry.roles, roles);
  mergeStringSet(entry.selectedFromArtifactIds, selectedFromArtifactIds);
  pending.set(artifactId, entry);

  if (entry.roles.size !== beforeRoleCount || entry.selectedFromArtifactIds.size !== beforeSelectedCount) {
    queue.push({
      artifactId,
      roles: new Set(entry.roles),
      selectedFromArtifactIds: new Set(entry.selectedFromArtifactIds),
    });
  }
}

export function resolveBrainDependencyGraph(
  store: KnowledgeStore,
  session: BrainSession,
): BrainDependencyGraph {
  const queue: Array<{
    artifactId: string;
    roles: Set<BrainRequirementRole>;
    selectedFromArtifactIds: Set<string>;
  }> = [];
  const pending = new Map<string, PendingSelection>();
  const visited = new Set<string>();
  const nodes = new Map<string, BrainResolvedArtifact>();
  const edges = new Map<string, BrainDependencyEdge>();

  const rootArtifactIds = toSortedStrings([
    ...session.authorityArtifactIds,
    ...session.requiredArtifactIds,
    ...session.optionalArtifactIds,
  ]);

  for (const artifactId of session.authorityArtifactIds) {
    enqueueSelection(queue, pending, artifactId, ['authority'], []);
  }

  for (const artifactId of session.requiredArtifactIds) {
    enqueueSelection(queue, pending, artifactId, ['required'], []);
  }

  for (const artifactId of session.optionalArtifactIds) {
    enqueueSelection(queue, pending, artifactId, ['optional'], []);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const existingPending = pending.get(current.artifactId) ?? {
      roles: current.roles,
      selectedFromArtifactIds: current.selectedFromArtifactIds,
    };

    const registryEntry = lookupCanonicalArtifact(store.registry, current.artifactId);
    const latestRevision = getLatestKnowledgeRevision(store, current.artifactId);
    const revisionHistory = getKnowledgeRevisionHistory(store, current.artifactId);
    const classification = classifyArtifact(registryEntry, latestRevision);

    const related = collectRelatedArtifactIds(registryEntry, latestRevision);
    const dependencyArtifactIds = related.map((item) => item.artifactId);
    const rationale = buildArtifactRationale(
      current.artifactId,
      Array.from(existingPending.roles),
      classification,
      Array.from(existingPending.selectedFromArtifactIds),
      related.map((item) => item.rationale),
    );

    const node: BrainResolvedArtifact = deepFreeze({
      artifactId: current.artifactId,
      roles: toSortedRoles(existingPending.roles),
      classification,
      registryEntry,
      latestRevision,
      revisionHistory,
      selectedFromArtifactIds: toSortedStrings(existingPending.selectedFromArtifactIds),
      dependencyArtifactIds,
      rationale,
    });

    nodes.set(current.artifactId, node);
    visited.add(current.artifactId);

    for (const relation of related) {
      const edgeKey = `${current.artifactId}::${relation.relation}::${relation.artifactId}`;
      if (!edges.has(edgeKey)) {
        edges.set(
          edgeKey,
          deepFreeze({
            fromArtifactId: current.artifactId,
            toArtifactId: relation.artifactId,
            relation: relation.relation,
            rationale: relation.rationale,
          }),
        );
      }

      enqueueSelection(
        queue,
        pending,
        relation.artifactId,
        [...existingPending.roles, 'dependency'],
        [...existingPending.selectedFromArtifactIds, current.artifactId],
      );
    }
  }

  const sortedNodes = Array.from(nodes.values()).sort((left, right) =>
    left.artifactId.localeCompare(right.artifactId),
  );

  const sortedEdges = Array.from(edges.values()).sort((left, right) => {
    if (left.fromArtifactId !== right.fromArtifactId) {
      return left.fromArtifactId.localeCompare(right.fromArtifactId);
    }

    if (left.relation !== right.relation) {
      return left.relation.localeCompare(right.relation);
    }

    return left.toArtifactId.localeCompare(right.toArtifactId);
  });

  return deepFreeze({
    requestId: session.requestId,
    sessionId: session.sessionId,
    rootArtifactIds,
    nodes: sortedNodes,
    edges: sortedEdges,
  });
}
