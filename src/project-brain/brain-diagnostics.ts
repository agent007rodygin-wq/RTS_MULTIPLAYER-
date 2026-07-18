import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainAuthorityReport } from './brain-authority.ts';
import type { BrainExecutionPlan } from './brain-planner.ts';
import type { BrainRequest } from './brain-request.ts';
import type { BrainSession } from './brain-session.ts';
import type { BrainTraceRecord } from './brain-trace.ts';

export type BrainDiagnosticStage =
  | 'request'
  | 'store'
  | 'authority'
  | 'dependency'
  | 'planning'
  | 'traceability'
  | 'response';

export type BrainDiagnosticSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface BrainDiagnosticEvent {
  index: number;
  stage: BrainDiagnosticStage;
  severity: BrainDiagnosticSeverity;
  code: string;
  message: string;
  requestId: string;
  sessionId: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

function pushEvent(
  events: BrainDiagnosticEvent[],
  event: Omit<BrainDiagnosticEvent, 'index'>,
): void {
  events.push({
    ...event,
    index: events.length + 1,
  });
}

export function buildBrainDiagnostics(input: {
  request: BrainRequest;
  session: BrainSession;
  validationFailures: readonly { source: 'request' | 'store'; code: string; message: string; field?: string }[];
  authority: BrainAuthorityReport;
  plan: BrainExecutionPlan;
  traceability: BrainTraceRecord;
}): readonly BrainDiagnosticEvent[] {
  const events: BrainDiagnosticEvent[] = [];
  const requestFailure = input.validationFailures.find((failure) => failure.source === 'request');
  const storeFailure = input.validationFailures.find((failure) => failure.source === 'store');
  const primaryBlockedArtifactId =
    input.authority.blockedArtifactIds[0] ??
    input.authority.missingArtifacts[0]?.artifactId ??
    input.authority.selectedArtifactIds[0];

  pushEvent(events, {
    stage: 'request',
    severity: requestFailure ? 'ERROR' : 'INFO',
    code: requestFailure ? 'REQUEST_INVALID' : 'REQUEST_NORMALIZED',
    message: requestFailure
      ? requestFailure.message
      : `Request ${input.request.requestId} normalized for session ${input.session.sessionId}.`,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
  });

  pushEvent(events, {
    stage: 'store',
    severity: storeFailure ? 'ERROR' : 'INFO',
    code: storeFailure ? 'STORE_INVALID' : 'STORE_VALIDATED',
    message: storeFailure
      ? storeFailure.message
      : `Knowledge store validated with ${input.session.canonicalRevisionCount} canonical revision(s) and ${input.session.derivedRevisionCount} derived revision(s).`,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
  });

  pushEvent(events, {
    stage: 'authority',
    severity: input.authority.blocked ? 'ERROR' : 'INFO',
    code: input.authority.blocked ? 'AUTHORITY_BLOCKED' : 'AUTHORITY_APPROVED',
    message: input.authority.blocked
      ? `Authority gate blocked ${input.authority.authorityFailures.length} artifact(s).`
      : `Authority gate approved ${input.authority.selectedArtifactIds.length} artifact(s).`,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
    artifactId: primaryBlockedArtifactId,
  });

  pushEvent(events, {
    stage: 'dependency',
    severity: 'INFO',
    code: 'DEPENDENCY_GRAPH_BUILT',
    message: `Dependency graph contains ${input.authority.dependencyGraph.nodes.length} node(s) and ${input.authority.dependencyGraph.edges.length} edge(s).`,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
  });

  pushEvent(events, {
    stage: 'planning',
    severity: input.plan.status === 'BLOCKED' ? 'WARN' : 'INFO',
    code: input.plan.status === 'BLOCKED' ? 'PLAN_BLOCKED' : 'PLAN_READY',
    message: input.plan.summary,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
    artifactId: input.plan.blockedArtifactIds[0],
  });

  pushEvent(events, {
    stage: 'traceability',
    severity: 'INFO',
    code: 'TRACEABILITY_BUILT',
    message: input.traceability.summary,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
  });

  pushEvent(events, {
    stage: 'response',
    severity: input.plan.status === 'BLOCKED' ? 'ERROR' : 'INFO',
    code: input.plan.status === 'BLOCKED' ? 'RESULT_BLOCKED' : 'RESULT_READY',
    message: input.plan.status === 'BLOCKED'
      ? 'Engine returned a fail-closed blocked result.'
      : 'Engine returned a deterministic ready result.',
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
  });

  return deepFreeze(events);
}

