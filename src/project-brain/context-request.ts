import { deepFreeze } from './knowledge-artifact.ts';
import { normalizeArtifactId } from './artifact-identity.ts';
import type { CanonicalRegistry } from './canonical-registry.ts';
import type { KnowledgeStore } from './knowledge-store.ts';
import type { BrainAuthorityReport } from './brain-authority.ts';
import type { BrainDependencyGraph } from './brain-dependency.ts';
import type { BrainExecutionPlan } from './brain-planner.ts';
import type { BrainResponse } from './brain-response.ts';
import type { BrainSession } from './brain-session.ts';
import type { BrainTraceRecord } from './brain-trace.ts';

export interface ContextPackageSourceEnvelope {
  session: BrainSession;
  response: BrainResponse;
  authority: BrainAuthorityReport;
  executionPlan: BrainExecutionPlan;
  dependencyGraph: BrainDependencyGraph;
  traceability: BrainTraceRecord;
  registry: CanonicalRegistry;
  store: KnowledgeStore;
}

export interface ContextPackageBuildRequestInput {
  contextRequestId: string;
  purpose?: string;
  excludedArtifactIds?: readonly string[];
  source: ContextPackageSourceEnvelope;
}

export interface ContextPackageBuildRequest {
  contextRequestId: string;
  purpose?: string;
  excludedArtifactIds: readonly string[];
  source: ContextPackageSourceEnvelope;
}

export interface ContextPackageBuildRequestValidationIssue {
  code:
    | 'INVALID_REQUEST_SHAPE'
    | 'INVALID_SOURCE_SHAPE'
    | 'INVALID_CONTEXT_REQUEST_ID'
    | 'INVALID_EXCLUDED_ARTIFACT_ID'
    | 'DUPLICATE_EXCLUDED_ARTIFACT_ID';
  message: string;
  artifactId?: string;
}

export interface ContextPackageBuildRequestValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly ContextPackageBuildRequestValidationIssue[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSortedUniqueArtifactIds(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function validateContextPackageBuildRequest(
  request: unknown,
): ContextPackageBuildRequestValidationReport {
  if (!isPlainObject(request)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        {
          code: 'INVALID_REQUEST_SHAPE',
          message: 'Context package build request must be a plain object.',
        },
      ],
    };
  }

  const issues: ContextPackageBuildRequestValidationIssue[] = [];

  const contextRequestId = normalizeOptionalText(request.contextRequestId);
  if (!contextRequestId) {
    issues.push({
      code: 'INVALID_CONTEXT_REQUEST_ID',
      message: 'Context package build request must include a non-empty contextRequestId.',
    });
  }

  if (!isPlainObject(request.source)) {
    issues.push({
      code: 'INVALID_SOURCE_SHAPE',
      message: 'Context package build request must include a source envelope.',
    });
    return {
      valid: issues.length === 0,
      issueCount: issues.length,
      issues,
    };
  }

  const excludedArtifactIds = request.excludedArtifactIds;
  if (excludedArtifactIds !== undefined && !Array.isArray(excludedArtifactIds)) {
    issues.push({
      code: 'INVALID_REQUEST_SHAPE',
      message: 'excludedArtifactIds must be an array when provided.',
    });
  } else if (Array.isArray(excludedArtifactIds)) {
    const normalized = excludedArtifactIds.map((artifactId) => {
      if (typeof artifactId !== 'string') {
        issues.push({
          code: 'INVALID_EXCLUDED_ARTIFACT_ID',
          message: 'Excluded Artifact IDs must be strings.',
        });
        return '';
      }

      try {
        return normalizeArtifactId(artifactId);
      } catch (error) {
        issues.push({
          code: 'INVALID_EXCLUDED_ARTIFACT_ID',
          message: error instanceof Error ? error.message : String(error),
          artifactId,
        });
        return '';
      }
    });

    const duplicates = normalized.filter((artifactId, index, array) =>
      artifactId && array.indexOf(artifactId) !== index,
    );

    for (const duplicate of duplicates) {
      issues.push({
        code: 'DUPLICATE_EXCLUDED_ARTIFACT_ID',
        message: `Duplicate excluded Artifact ID detected: ${duplicate}`,
        artifactId: duplicate,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}

export function createContextPackageBuildRequest(
  request: ContextPackageBuildRequestInput,
): ContextPackageBuildRequest {
  const report = validateContextPackageBuildRequest(request);
  if (!report.valid) {
    const message = report.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid context package build request: ${message}`);
  }

  return deepFreeze({
    contextRequestId: request.contextRequestId.trim(),
    purpose: normalizeOptionalText(request.purpose),
    excludedArtifactIds: toSortedUniqueArtifactIds(
      (request.excludedArtifactIds ?? []).map((artifactId) => normalizeArtifactId(artifactId)),
    ),
    source: request.source,
  });
}
