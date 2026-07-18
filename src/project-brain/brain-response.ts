import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainAuthorityFailure, BrainAuthorityReport, BrainValidationFailure, BrainWarning } from './brain-authority.ts';
import type { BrainDependencyGraph, BrainResolvedArtifact } from './brain-dependency.ts';
import type { BrainDiagnosticEvent } from './brain-diagnostics.ts';
import type { BrainExecutionPlan } from './brain-planner.ts';
import type { BrainRequest } from './brain-request.ts';
import type { BrainSession } from './brain-session.ts';
import type { BrainTraceRecord } from './brain-trace.ts';

export type BrainEngineStatus = 'ALLOW' | 'BLOCKED';

export interface BrainResponse {
  requestId: string;
  sessionId: string;
  status: BrainEngineStatus;
  outputClass: BrainRequest['outputClass'];
  summary: string;
  resolvedArtifactIds: readonly string[];
  missingArtifactIds: readonly string[];
  blockedReasonCodes: readonly string[];
  warningCodes: readonly string[];
}

export interface BrainEngineResult {
  request: BrainRequest;
  session: BrainSession;
  status: BrainEngineStatus;
  response: BrainResponse;
  resolvedArtifacts: readonly BrainResolvedArtifact[];
  missingArtifacts: readonly BrainResolvedArtifact[];
  warnings: readonly BrainWarning[];
  authorityFailures: readonly BrainAuthorityFailure[];
  validationFailures: readonly BrainValidationFailure[];
  dependencyGraph: BrainDependencyGraph;
  executionPlan: BrainExecutionPlan;
  traceability: BrainTraceRecord;
  diagnostics: readonly BrainDiagnosticEvent[];
}

function toSortedStrings(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}

function buildSummary(
  status: BrainEngineStatus,
  resolvedArtifactIds: readonly string[],
  blockedReasonCodes: readonly string[],
  warningCodes: readonly string[],
): string {
  if (status === 'BLOCKED') {
    return `Blocked by ${blockedReasonCodes.length} issue(s) across ${resolvedArtifactIds.length} resolved artifact(s).`;
  }

  if (warningCodes.length > 0) {
    return `Ready with ${resolvedArtifactIds.length} resolved artifact(s) and ${warningCodes.length} warning(s).`;
  }

  return `Ready with ${resolvedArtifactIds.length} resolved artifact(s).`;
}

export function createBrainResponse(input: {
  request: BrainRequest;
  session: BrainSession;
  authority: BrainAuthorityReport;
  plan: BrainExecutionPlan;
  traceability: BrainTraceRecord;
  validationFailures: readonly BrainValidationFailure[];
}): BrainResponse {
  const resolvedArtifactIds = toSortedStrings(input.authority.resolvedArtifacts.map((artifact) => artifact.artifactId));
  const missingArtifactIds = toSortedStrings(input.authority.missingArtifacts.map((artifact) => artifact.artifactId));
  const blockedReasonCodes = toSortedStrings([
    ...input.authority.authorityFailures.map((failure) => failure.code),
    ...input.validationFailures.map((failure) => failure.code),
  ]);
  const warningCodes = toSortedStrings(input.authority.warnings.map((warning) => warning.code));
  const status: BrainEngineStatus = input.plan.status === 'BLOCKED' ? 'BLOCKED' : 'ALLOW';

  return deepFreeze({
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
    status,
    outputClass: input.request.outputClass,
    summary: buildSummary(status, resolvedArtifactIds, blockedReasonCodes, warningCodes),
    resolvedArtifactIds,
    missingArtifactIds,
    blockedReasonCodes,
    warningCodes,
  });
}
