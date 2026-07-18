import { createCanonicalRegistry } from './canonical-registry.ts';
import { deepFreeze } from './knowledge-artifact.ts';
import {
  createKnowledgeStore,
  validateKnowledgeStore,
  type KnowledgeStore,
} from './knowledge-store.ts';
import { createBrainRequest, validateBrainRequest, type BrainRequest } from './brain-request.ts';
import { createBrainSession } from './brain-session.ts';
import { resolveBrainDependencyGraph } from './brain-dependency.ts';
import { evaluateBrainAuthority, type BrainValidationFailure } from './brain-authority.ts';
import { buildBrainExecutionPlan } from './brain-planner.ts';
import { buildBrainTraceRecord } from './brain-trace.ts';
import { buildBrainDiagnostics } from './brain-diagnostics.ts';
import { createBrainResponse, type BrainEngineResult } from './brain-response.ts';

export interface BrainEngineRunInput {
  request: unknown;
  store: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function createFallbackRequest(validationMessages: readonly string[]): BrainRequest {
  return {
    requestId: 'INVALID-REQUEST',
    taskId: 'INVALID-REQUEST',
    summary: validationMessages[0] ?? 'Invalid Brain request blocked before planning.',
    purpose: undefined,
    authorityArtifactIds: [],
    requiredArtifactIds: [],
    optionalArtifactIds: [],
    constraints: [],
    outputClass: 'analysis',
  };
}

function createFallbackStore(): KnowledgeStore {
  const registry = createCanonicalRegistry();
  return createKnowledgeStore(registry, []);
}

export function runBrainEngine(input: BrainEngineRunInput): BrainEngineResult {
  const requestValidation = validateBrainRequest(input.request);
  const normalizedRequest = requestValidation.valid
    ? createBrainRequest(input.request)
    : createFallbackRequest(requestValidation.issues.map((issue) => issue.message));

  const storeLike = isPlainObject(input.store) ? input.store : undefined;
  const storeValidationFailures: BrainValidationFailure[] = [];
  let store: KnowledgeStore = createFallbackStore();

  if (storeLike && 'registry' in storeLike && 'revisions' in storeLike) {
    try {
      const candidate = storeLike as unknown as KnowledgeStore;
      const validation = validateKnowledgeStore(candidate);
      if (validation.valid) {
        store = candidate;
      } else {
        storeValidationFailures.push(
          ...validation.issues.map((issue) => ({
            source: 'store' as const,
            code: issue.code,
            message: issue.message,
          })),
        );
      }
    } catch (error) {
      storeValidationFailures.push({
        source: 'store',
        code: 'INVALID_STORE_SHAPE',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    storeValidationFailures.push({
      source: 'store',
      code: 'INVALID_STORE_SHAPE',
      message: 'Brain engine store input must expose registry and revisions arrays.',
    });
  }

  const validationFailures: BrainValidationFailure[] = [
    ...requestValidation.issues.map((issue) => ({
      source: 'request' as const,
      code: issue.code,
      message: issue.message,
      field: issue.field,
    })),
    ...storeValidationFailures,
  ];

  const session = createBrainSession(normalizedRequest, store);
  const dependencyGraph = resolveBrainDependencyGraph(store, session);
  const authority = evaluateBrainAuthority(session, dependencyGraph, validationFailures);
  const executionPlan = buildBrainExecutionPlan({
    request: normalizedRequest,
    session,
    authority,
    validationFailures,
  });
  const traceability = buildBrainTraceRecord({
    request: normalizedRequest,
    session,
    authority,
    plan: executionPlan,
    dependencyGraph,
  });
  const response = createBrainResponse({
    request: normalizedRequest,
    session,
    authority,
    plan: executionPlan,
    traceability,
    validationFailures,
  });
  const diagnostics = buildBrainDiagnostics({
    request: normalizedRequest,
    session,
    validationFailures,
    authority,
    plan: executionPlan,
    traceability,
  });

  return deepFreeze({
    request: normalizedRequest,
    session,
    status: response.status,
    response,
    resolvedArtifacts: authority.resolvedArtifacts,
    missingArtifacts: authority.missingArtifacts,
    warnings: authority.warnings,
    authorityFailures: authority.authorityFailures,
    validationFailures,
    dependencyGraph,
    executionPlan,
    traceability,
    diagnostics,
  });
}
