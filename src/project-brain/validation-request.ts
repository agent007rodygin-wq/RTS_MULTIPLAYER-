import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { BrainEngineResult } from './brain-response.ts';
import type { CanonicalRegistry } from './canonical-registry.ts';
import type { ContextPackageResult } from './context-item.ts';
import type { GenerationResultEnvelope } from './generation-result.ts';
import type { KnowledgeStore } from './knowledge-store.ts';
import {
  buildValidationRequestMetadata,
  type ValidationRequestMetadata,
} from './validation-metadata.ts';
import { serializeCanonicalRegistry } from './canonical-registry.ts';
import { serializeKnowledgeStore } from './knowledge-store.ts';
import { fnv1a32 } from './generation-hash.ts';

export interface ValidationPipelineInput {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationResult: GenerationResultEnvelope;
  registry: CanonicalRegistry;
  store: KnowledgeStore;
  validationVersion?: unknown;
}

export interface ValidationRequest {
  validationRequestId: string;
  validationVersion: string;
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationResult: GenerationResultEnvelope;
  registryFingerprint: string;
  storeFingerprint: string;
  metadata: ValidationRequestMetadata;
}

function normalizeValidationVersion(value: unknown): string {
  if (value === undefined || value === null) {
    return '1.0.0';
  }

  if (typeof value !== 'string') {
    throw new Error(`Validation version must be a non-empty string. Received: ${String(value)}`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error('Validation version must be a non-empty string.');
  }

  return normalized;
}

function collectReferencedArtifactIds(input: ValidationPipelineInput): string[] {
  return Array.from(
    new Set([
      ...input.generationResult.request.metadata.referencedArtifactIds,
      ...input.brainResult.traceability.selectedArtifactIds,
      ...input.contextPackage.includedItems.map((item) => item.artifactId),
    ]),
  ).sort();
}

export function buildValidationRequestFingerprint(input: {
  validationVersion: string;
  validationRequestId: string;
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationResult: GenerationResultEnvelope;
  registryFingerprint: string;
  storeFingerprint: string;
  sourceRegistryArtifactCount: number;
  sourceStoreRevisionCount: number;
  referencedArtifactIds: readonly string[];
}): string {
  return `VALIDATION-REQUEST::${fnv1a32(stableStringify({
    validationVersion: input.validationVersion,
    validationRequestId: input.validationRequestId,
    generationRequestId: input.generationResult.request.generationRequestId,
    generationSessionId: input.generationResult.request.generationSessionId,
    generationAttemptId: input.generationResult.request.attemptId,
    requestId: input.brainResult.request.requestId,
    taskId: input.brainResult.request.taskId,
    contextRequestId: input.contextPackage.contextRequestId,
    contextPackageId: input.contextPackage.metadata.packageId,
    contextPackageFingerprint: input.contextPackage.metadata.packageFingerprint,
    sourceBrainSessionId: input.brainResult.session.sessionId,
    sourceBrainResponseStatus: input.brainResult.response.status,
    sourceBrainPlanStatus: input.brainResult.executionPlan.status,
    sourceBrainAuthorityStatus: input.brainResult.status,
    sourceBrainDependencyNodeCount: input.brainResult.dependencyGraph.nodes.length,
    sourceRegistryArtifactCount: input.sourceRegistryArtifactCount,
    sourceStoreRevisionCount: input.sourceStoreRevisionCount,
    sourceRegistryFingerprint: input.registryFingerprint,
    sourceStoreFingerprint: input.storeFingerprint,
    expectedOutputType: input.generationResult.request.expectedOutputType,
    referencedArtifactIds: [...new Set(input.referencedArtifactIds)].sort(),
  }))}`;
}

export function createValidationRequest(input: ValidationPipelineInput): ValidationRequest {
  const validationVersion = normalizeValidationVersion(input.validationVersion);
  const registryFingerprint = `REGISTRY::${fnv1a32(serializeCanonicalRegistry(input.registry))}`;
  const storeFingerprint = `STORE::${fnv1a32(serializeKnowledgeStore(input.store))}`;
  const referencedArtifactIds = collectReferencedArtifactIds(input);
  const validationRequestId = `VALIDATION-REQUEST::${input.generationResult.request.generationRequestId}::${input.contextPackage.contextRequestId}::${validationVersion}`;
  const validationRequestMetadata = buildValidationRequestMetadata({
    validationVersion,
    validationRequestId,
    generationRequestId: input.generationResult.request.generationRequestId,
    generationSessionId: input.generationResult.request.generationSessionId,
    generationAttemptId: input.generationResult.request.attemptId,
    requestId: input.brainResult.request.requestId,
    taskId: input.brainResult.request.taskId,
    contextRequestId: input.contextPackage.contextRequestId,
    contextPackageId: input.contextPackage.metadata.packageId,
    contextPackageFingerprint: input.contextPackage.metadata.packageFingerprint,
    sourceBrainSessionId: input.brainResult.session.sessionId,
    sourceBrainResponseStatus: input.brainResult.response.status,
    sourceBrainPlanStatus: input.brainResult.executionPlan.status,
    sourceBrainAuthorityStatus: input.brainResult.status,
    sourceBrainDependencyNodeCount: input.brainResult.dependencyGraph.nodes.length,
    sourceRegistryArtifactCount: input.registry.entries.length,
    sourceStoreRevisionCount: input.store.revisions.length,
    sourceRegistryFingerprint: registryFingerprint,
    sourceStoreFingerprint: storeFingerprint,
    expectedOutputType: input.generationResult.request.expectedOutputType,
    referencedArtifactIds,
  });

  return deepFreeze({
    validationRequestId,
    validationVersion,
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    generationResult: input.generationResult,
    registryFingerprint,
    storeFingerprint,
    metadata: validationRequestMetadata,
  });
}

export function validateValidationPipelineSource(input: unknown): {
  valid: boolean;
  issueCount: number;
  issues: readonly { code: string; message: string }[];
} {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        {
          code: 'INVALID_VALIDATION_REQUEST_SHAPE',
          message: 'Validation pipeline input must be a plain object.',
        },
      ],
    };
  }

  const candidate = input as Partial<ValidationPipelineInput>;
  const issues: { code: string; message: string }[] = [];

  if (!candidate.brainResult) {
    issues.push({
      code: 'INVALID_VALIDATION_REQUEST_SHAPE',
      message: 'Validation pipeline input is missing brainResult.',
    });
  }

  if (!candidate.contextPackage) {
    issues.push({
      code: 'INVALID_VALIDATION_REQUEST_SHAPE',
      message: 'Validation pipeline input is missing contextPackage.',
    });
  }

  if (!candidate.generationResult) {
    issues.push({
      code: 'INVALID_VALIDATION_REQUEST_SHAPE',
      message: 'Validation pipeline input is missing generationResult.',
    });
  }

  if (!candidate.registry) {
    issues.push({
      code: 'INVALID_VALIDATION_REQUEST_SHAPE',
      message: 'Validation pipeline input is missing registry.',
    });
  }

  if (!candidate.store) {
    issues.push({
      code: 'INVALID_VALIDATION_REQUEST_SHAPE',
      message: 'Validation pipeline input is missing store.',
    });
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
