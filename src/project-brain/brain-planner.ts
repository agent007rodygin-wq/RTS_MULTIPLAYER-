import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainAuthorityReport, BrainValidationFailure } from './brain-authority.ts';
import type { BrainDependencyGraph } from './brain-dependency.ts';
import type { BrainRequest } from './brain-request.ts';
import type { BrainSession } from './brain-session.ts';

export type BrainPlanStepStatus = 'COMPLETE' | 'BLOCKED';

export type BrainPlanStepCode =
  | 'VALIDATE_REQUEST'
  | 'VALIDATE_STORE'
  | 'RESOLVE_AUTHORITY'
  | 'TRAVERSE_DEPENDENCIES'
  | 'ASSEMBLE_TRACEABILITY'
  | 'RETURN_RESPONSE';

export interface BrainPlanStep {
  index: number;
  code: BrainPlanStepCode;
  status: BrainPlanStepStatus;
  message: string;
  artifactIds: readonly string[];
}

export interface BrainExecutionPlan {
  planId: string;
  requestId: string;
  sessionId: string;
  status: 'READY' | 'BLOCKED';
  summary: string;
  selectedArtifactIds: readonly string[];
  blockedArtifactIds: readonly string[];
  blockedReasonCodes: readonly string[];
  warningCodes: readonly string[];
  steps: readonly BrainPlanStep[];
}

function toSortedStrings(values: Iterable<string>): string[] {
  return Array.from(new Set(values)).sort();
}

function collectCodes(
  authority: BrainAuthorityReport,
  validationFailures: readonly BrainValidationFailure[],
): string[] {
  return toSortedStrings([
    ...authority.authorityFailures.map((failure) => failure.code),
    ...validationFailures.map((failure) => failure.code),
  ]);
}

function buildStep(
  index: number,
  code: BrainPlanStepCode,
  status: BrainPlanStepStatus,
  message: string,
  artifactIds: readonly string[] = [],
): BrainPlanStep {
  return {
    index,
    code,
    status,
    message,
    artifactIds: toSortedStrings(artifactIds),
  };
}

export function buildBrainExecutionPlan(input: {
  request: BrainRequest;
  session: BrainSession;
  authority: BrainAuthorityReport;
  validationFailures: readonly BrainValidationFailure[];
}): BrainExecutionPlan {
  const blocked = !input.authority.allowed || input.validationFailures.length > 0;
  const blockedArtifactIds = toSortedStrings(input.authority.blockedArtifactIds);
  const blockedReasonCodes = collectCodes(input.authority, input.validationFailures);
  const warningCodes = toSortedStrings(input.authority.warnings.map((warning) => warning.code));
  const selectedArtifactIds = toSortedStrings(input.authority.selectedArtifactIds);
  const stepStatus: BrainPlanStepStatus = blocked ? 'BLOCKED' : 'COMPLETE';

  const steps: BrainPlanStep[] = [
    buildStep(
      1,
      'VALIDATE_REQUEST',
      input.validationFailures.some((failure) => failure.source === 'request') ? 'BLOCKED' : 'COMPLETE',
      input.validationFailures.some((failure) => failure.source === 'request')
        ? 'Request validation blocked the engine.'
        : 'Request validation succeeded.',
      [input.request.requestId],
    ),
    buildStep(
      2,
      'VALIDATE_STORE',
      input.validationFailures.some((failure) => failure.source === 'store') ? 'BLOCKED' : 'COMPLETE',
      input.validationFailures.some((failure) => failure.source === 'store')
        ? 'Knowledge store validation blocked the engine.'
        : 'Knowledge store validation succeeded.',
      selectedArtifactIds,
    ),
    buildStep(
      3,
      'RESOLVE_AUTHORITY',
      input.authority.blocked ? 'BLOCKED' : 'COMPLETE',
      input.authority.blocked
        ? 'Authority gate blocked the request.'
        : 'Authority gate accepted the request.',
      selectedArtifactIds,
    ),
    buildStep(
      4,
      'TRAVERSE_DEPENDENCIES',
      stepStatus,
      blocked
        ? 'Dependency traversal is frozen because the engine is blocked.'
        : 'Dependency traversal completed deterministically.',
      selectedArtifactIds,
    ),
    buildStep(
      5,
      'ASSEMBLE_TRACEABILITY',
      stepStatus,
      blocked
        ? 'Traceability assembly is frozen because the engine is blocked.'
        : 'Traceability assembly completed deterministically.',
      selectedArtifactIds,
    ),
    buildStep(
      6,
      'RETURN_RESPONSE',
      stepStatus,
      blocked
        ? 'Blocked response returned to the caller.'
        : 'Ready response returned to the caller.',
      selectedArtifactIds,
    ),
  ];

  return deepFreeze({
    planId: `BRAIN-PLAN::${input.session.sessionId}`,
    requestId: input.request.requestId,
    sessionId: input.session.sessionId,
    status: blocked ? 'BLOCKED' : 'READY',
    summary: blocked
      ? `Blocked by ${blockedReasonCodes.length} issue(s).`
      : `Ready with ${selectedArtifactIds.length} resolved artifact(s).`,
    selectedArtifactIds,
    blockedArtifactIds,
    blockedReasonCodes,
    warningCodes,
    steps,
  });
}
