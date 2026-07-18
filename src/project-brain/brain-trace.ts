import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainAuthorityReport } from './brain-authority.ts';
import type { BrainDependencyGraph, BrainResolvedArtifact } from './brain-dependency.ts';
import type { BrainExecutionPlan } from './brain-planner.ts';
import type { BrainRequest } from './brain-request.ts';
import type { BrainSession } from './brain-session.ts';

export interface BrainTraceEntry {
  artifactId: string;
  roles: readonly string[];
  classification: BrainResolvedArtifact['classification'];
  selectedFromArtifactIds: readonly string[];
  dependencyArtifactIds: readonly string[];
  rationale: string;
  sourceRevision?: string;
  latestRevisionId?: string;
}

export interface BrainTraceRecord {
  requestId: string;
  sessionId: string;
  selectedArtifactIds: readonly string[];
  missingArtifactIds: readonly string[];
  blockedReasonCodes: readonly string[];
  entries: readonly BrainTraceEntry[];
  dependencyPaths: readonly string[];
  summary: string;
}

export function buildBrainTraceRecord(input: {
  request: BrainRequest;
  session: BrainSession;
  authority: BrainAuthorityReport;
  plan: BrainExecutionPlan;
  dependencyGraph: BrainDependencyGraph;
}): BrainTraceRecord {
  const entries = input.dependencyGraph.nodes.map<BrainTraceEntry>((node) => ({
    artifactId: node.artifactId,
    roles: node.roles,
    classification: node.classification,
    selectedFromArtifactIds: node.selectedFromArtifactIds,
    dependencyArtifactIds: node.dependencyArtifactIds,
    rationale: node.rationale,
    sourceRevision: node.latestRevision?.sourceRevision ?? node.registryEntry?.sourceRevision,
    latestRevisionId: node.latestRevision?.revisionId,
  }));

  const dependencyPaths = input.dependencyGraph.edges
    .map((edge) => `${edge.fromArtifactId} -[${edge.relation}]-> ${edge.toArtifactId}`)
    .sort();

  return deepFreeze({
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
    selectedArtifactIds: input.authority.selectedArtifactIds,
    missingArtifactIds: input.authority.missingArtifacts.map((artifact) => artifact.artifactId),
    blockedReasonCodes: input.plan.blockedReasonCodes,
    entries,
    dependencyPaths,
    summary: input.plan.status === 'BLOCKED'
      ? `Traceability captured for a blocked plan with ${input.plan.blockedReasonCodes.length} issue(s).`
      : `Traceability captured for ${input.authority.selectedArtifactIds.length} resolved artifact(s).`,
  });
}

