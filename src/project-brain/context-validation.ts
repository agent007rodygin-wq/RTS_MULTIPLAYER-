import type { CanonicalRegistry, CanonicalRegistryEntry } from './canonical-registry.ts';
import { lookupCanonicalArtifact, validateCanonicalRegistry } from './canonical-registry.ts';
import type { BrainAuthorityReport, BrainWarning } from './brain-authority.ts';
import type { BrainDependencyGraph } from './brain-dependency.ts';
import type { BrainExecutionPlan } from './brain-planner.ts';
import type { BrainResponse } from './brain-response.ts';
import type { BrainSession } from './brain-session.ts';
import type { BrainTraceRecord } from './brain-trace.ts';
import type { KnowledgeStore } from './knowledge-store.ts';
import { getLatestKnowledgeRevision, validateKnowledgeStore } from './knowledge-store.ts';
import type {
  ContextPackageBuildRequest,
  ContextPackageBuildRequestValidationReport,
} from './context-request.ts';
import type {
  ContextPackageIssue,
  ContextPackageResult,
  ContextPackageValidationFailure,
} from './context-item.ts';

export interface ContextPackageFoundationValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly ContextPackageValidationFailure[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeFailure(
  source: ContextPackageValidationFailure['source'],
  code: string,
  message: string,
  artifactId?: string,
  relatedArtifactId?: string,
): ContextPackageValidationFailure {
  return {
    source,
    code,
    message,
    artifactId,
    relatedArtifactId,
  };
}

export function validateContextPackageFoundation(
  request: ContextPackageBuildRequest,
): ContextPackageFoundationValidationReport {
  const issues: ContextPackageValidationFailure[] = [];
  const { session, response, authority, executionPlan, dependencyGraph, traceability, registry, store } =
    request.source;

  const registryValidation = validateCanonicalRegistry(registry);
  if (!registryValidation.valid) {
    issues.push(
      ...registryValidation.issues.map((issue) =>
        makeFailure('foundation', issue.code, issue.message),
      ),
    );
  }

  const storeValidation = validateKnowledgeStore(store);
  if (!storeValidation.valid) {
    issues.push(
      ...storeValidation.issues.map((issue) =>
        makeFailure('foundation', issue.code, issue.message, issue.artifactId, issue.relatedArtifactId),
      ),
    );
  }

  if (session.requestId !== response.requestId) {
    issues.push(
      makeFailure(
        'foundation',
        'SESSION_MISMATCH',
        'Brain session and response must reference the same request.',
      ),
    );
  }

  if (session.requestId !== dependencyGraph.requestId) {
    issues.push(
      makeFailure(
        'foundation',
        'SESSION_MISMATCH',
        'Brain session and dependency graph must reference the same request.',
      ),
    );
  }

  if (session.sessionId !== dependencyGraph.sessionId) {
    issues.push(
      makeFailure(
        'foundation',
        'SESSION_MISMATCH',
        'Brain session and dependency graph must reference the same session.',
      ),
    );
  }

  if (session.requestId !== executionPlan.requestId || session.sessionId !== executionPlan.sessionId) {
    issues.push(
      makeFailure(
        'foundation',
        'SESSION_MISMATCH',
        'Brain session and execution plan must match the same request and session.',
      ),
    );
  }

  if (session.requestId !== traceability.requestId || session.sessionId !== traceability.sessionId) {
    issues.push(
      makeFailure(
        'foundation',
        'SESSION_MISMATCH',
        'Brain session and traceability record must match the same request and session.',
      ),
    );
  }

  if (response.status === 'BLOCKED' && authority.allowed) {
    issues.push(
      makeFailure(
        'foundation',
        'RESPONSE_MISMATCH',
        'Blocked response must not report authority as allowed.',
      ),
    );
  }

  if (response.status === 'ALLOW' && authority.blocked) {
    issues.push(
      makeFailure(
        'foundation',
        'RESPONSE_MISMATCH',
        'Allowed response must not report authority as blocked.',
      ),
    );
  }

  if (executionPlan.status === 'BLOCKED' && response.status !== 'BLOCKED') {
    issues.push(
      makeFailure(
        'foundation',
        'RESPONSE_MISMATCH',
        'Blocked execution plans require a blocked brain response.',
      ),
    );
  }

  if (executionPlan.status === 'READY' && response.status !== 'ALLOW') {
    issues.push(
      makeFailure(
        'foundation',
        'RESPONSE_MISMATCH',
        'Ready execution plans require an allowed brain response.',
      ),
    );
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}

export function validateContextPackageSerializedShape(serialized: unknown): ContextPackageFoundationValidationReport {
  if (typeof serialized === 'string') {
    try {
      const parsed = JSON.parse(serialized) as unknown;
      if (!isPlainObject(parsed)) {
        return {
          valid: false,
          issueCount: 1,
          issues: [makeFailure('package', 'INVALID_PACKAGE_SCHEMA', 'Serialized context package must be a JSON object.')],
        };
      }
      return {
        valid: true,
        issueCount: 0,
        issues: [],
      };
    } catch (error) {
      return {
        valid: false,
        issueCount: 1,
        issues: [
          makeFailure(
            'package',
            'INVALID_PACKAGE_SCHEMA',
            error instanceof Error ? error.message : String(error),
          ),
        ],
      };
    }
  }

  if (!isPlainObject(serialized)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        makeFailure('package', 'INVALID_PACKAGE_SCHEMA', 'Serialized context package must be a plain object.'),
      ],
    };
  }

  return {
    valid: true,
    issueCount: 0,
    issues: [],
  };
}

export function validateContextPackageConsistency(
  packageResult: ContextPackageResult,
  request: ContextPackageBuildRequest,
): ContextPackageFoundationValidationReport {
  const issues: ContextPackageValidationFailure[] = [];
  const { session, response, authority, executionPlan, dependencyGraph, traceability, registry, store } =
    request.source;

  if (packageResult.contextRequestId !== request.contextRequestId) {
    issues.push(
      makeFailure('package', 'SESSION_MISMATCH', 'Context package request ID does not match the build request.'),
    );
  }

  if (packageResult.sourceBrainSessionId !== session.sessionId) {
    issues.push(
      makeFailure('package', 'SESSION_MISMATCH', 'Context package session ID does not match the source session.'),
    );
  }

  if (packageResult.sourceBrainResponseStatus !== response.status) {
    issues.push(
      makeFailure(
        'package',
        'RESPONSE_MISMATCH',
        'Context package response status does not match the source response.',
      ),
    );
  }

  const includedById = new Map(packageResult.includedItems.map((item) => [item.artifactId, item]));
  const excludedById = new Map(packageResult.excludedItems.map((item) => [item.artifactId, item]));

  for (const artifactId of packageResult.metadata.sourceBrainDependencyNodeCount ? dependencyGraph.nodes.map((node) => node.artifactId) : []) {
    const node = dependencyGraph.nodes.find((candidate) => candidate.artifactId === artifactId);
    if (!node) continue;

    if (includedById.has(artifactId) || excludedById.has(artifactId)) {
      continue;
    }

    issues.push(
      makeFailure(
        'package',
        'MISSING_CONTEXT_ARTIFACT',
        `Dependency graph artifact ${artifactId} was not represented in the context package.`,
        artifactId,
      ),
    );
  }

  const registryEntryCheck = (entry: CanonicalRegistryEntry | undefined, artifactId: string) => {
    if (!entry) {
      issues.push(
        makeFailure('package', 'MISSING_REGISTRY_ENTRY', `Registry entry is missing for ${artifactId}.`, artifactId),
      );
    }
  };

  for (const item of packageResult.includedItems) {
    registryEntryCheck(lookupCanonicalArtifact(registry, item.artifactId), item.artifactId);

    const latestRevision = getLatestKnowledgeRevision(store, item.artifactId);
    if (!latestRevision) {
      issues.push(
        makeFailure('package', 'MISSING_REVISION', `Knowledge revision is missing for ${item.artifactId}.`, item.artifactId),
      );
      continue;
    }

    if (item.revision.revisionId !== latestRevision.revisionId) {
      issues.push(
        makeFailure(
          'package',
          'SESSION_MISMATCH',
          `Context package revision ${item.revision.revisionId} does not match the latest store revision ${latestRevision.revisionId}.`,
          item.artifactId,
        ),
      );
    }
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
