import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { BrainOutputClass } from './brain-request.ts';
import type { BrainEngineResult } from './brain-response.ts';
import type { ContextPackageResult } from './context-item.ts';
import { fnv1a32 } from './generation-hash.ts';
import type { GenerationPromptSection } from './generation-prompt.ts';
import type { GenerationSession } from './generation-session.ts';

export interface GenerationConfiguration {
  schemaVersion: string;
  generationVersion: string;
  promptVersion: string;
  providerHints: readonly string[];
}

export interface GenerationConstraints {
  taskConstraints: readonly string[];
  validationRequirements: readonly string[];
}

export interface GenerationInstructions {
  requestedTask: string;
  purpose?: string;
  expectedOutputType: BrainOutputClass;
  lines: readonly string[];
}

export interface GenerationMetadata {
  schemaVersion: string;
  generationVersion: string;
  generationRequestId: string;
  generationSessionId: string;
  attemptId: string;
  requestId: string;
  taskId: string;
  sourceBrainSessionId: string;
  sourceContextPackageId: string;
  sourceContextPackageFingerprint: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  expectedOutputType: BrainOutputClass;
  providerHintCount: number;
  promptSectionCount: number;
  requiredPromptSectionCount: number;
  referencedArtifactIds: readonly string[];
  generationFingerprint: string;
  repositoryRevision?: string;
}

export interface GenerationRequest {
  generationRequestId: string;
  generationSessionId: string;
  attemptId: string;
  requestId: string;
  taskId: string;
  sourceBrainSessionId: string;
  sourceContextPackageId: string;
  sourceContextPackageFingerprint: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  expectedOutputType: BrainOutputClass;
  generationVersion: string;
  providerHints: readonly string[];
  configuration: GenerationConfiguration;
  constraints: GenerationConstraints;
  instructions: GenerationInstructions;
  promptSections: readonly GenerationPromptSection[];
  promptText: string;
  promptFingerprint: string;
  metadata: GenerationMetadata;
}

export interface GenerationPipelineInput {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationVersion?: unknown;
  providerHints?: readonly unknown[];
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Generation request field ${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Generation request field ${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

export function normalizeGenerationVersion(value: unknown): string {
  if (value === undefined || value === null) {
    return '1.0.0';
  }

  return normalizeText(value, 'generationVersion');
}

export function normalizeProviderHints(value: unknown): readonly string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Generation request providerHints must be an array when provided.');
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error('Generation request providerHints must contain only strings.');
    }

    const trimmed = item.trim();
    if (!trimmed) {
      throw new Error('Generation request providerHints cannot contain empty strings.');
    }

    return trimmed;
  });

  return Array.from(new Set(normalized)).sort();
}

export function buildGenerationConfiguration(input: {
  generationVersion: string;
  providerHints: readonly string[];
}): GenerationConfiguration {
  return deepFreeze({
    schemaVersion: '1.0.0',
    generationVersion: input.generationVersion,
    promptVersion: input.generationVersion,
    providerHints: [...input.providerHints],
  });
}

export function buildGenerationConstraints(input: {
  taskConstraints: readonly string[];
}): GenerationConstraints {
  return deepFreeze({
    taskConstraints: [...new Set(input.taskConstraints)].sort(),
    validationRequirements: [
      'context-package-ready',
      'prompt-ordering',
      'prompt-fingerprint',
      'serialization-roundtrip',
      'provider-independence',
    ],
  });
}

export function buildGenerationInstructions(input: {
  brainResult: BrainEngineResult;
  expectedOutputType: BrainOutputClass;
}): GenerationInstructions {
  const request = input.brainResult.request;

  return deepFreeze({
    requestedTask: request.summary,
    purpose: request.purpose,
    expectedOutputType: input.expectedOutputType,
    lines: [
      `Task ${request.taskId}`,
      `Request ${request.requestId}`,
      `Summary ${request.summary}`,
      request.purpose ? `Purpose ${request.purpose}` : 'Purpose not supplied.',
      `Expected output ${input.expectedOutputType}`,
    ],
  });
}

export function buildGenerationMetadata(input: {
  generationVersion: string;
  generationRequestId: string;
  generationSessionId: string;
  attemptId: string;
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  expectedOutputType: BrainOutputClass;
  providerHints: readonly string[];
  promptSections: readonly GenerationPromptSection[];
  generationFingerprint: string;
}): GenerationMetadata {
  const referencedArtifactIds = Array.from(
    new Set([
      ...input.brainResult.traceability.selectedArtifactIds,
      ...input.contextPackage.includedItems.map((item) => item.artifactId),
    ]),
  ).sort();

  return deepFreeze({
    schemaVersion: '1.0.0',
    generationVersion: input.generationVersion,
    generationRequestId: input.generationRequestId,
    generationSessionId: input.generationSessionId,
    attemptId: input.attemptId,
    requestId: input.brainResult.request.requestId,
    taskId: input.brainResult.request.taskId,
    sourceBrainSessionId: input.brainResult.session.sessionId,
    sourceContextPackageId: input.contextPackage.metadata.packageId,
    sourceContextPackageFingerprint: input.contextPackage.metadata.packageFingerprint,
    sourceBrainResponseStatus: input.brainResult.response.status,
    sourceBrainPlanStatus: input.brainResult.executionPlan.status,
    expectedOutputType: input.expectedOutputType,
    providerHintCount: input.providerHints.length,
    promptSectionCount: input.promptSections.length,
    requiredPromptSectionCount: input.promptSections.length,
    referencedArtifactIds,
    generationFingerprint: input.generationFingerprint,
  });
}

export function createGenerationRequest(input: {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationSession: GenerationSession;
  expectedOutputType: BrainOutputClass;
  generationVersion: string;
  providerHints?: readonly string[];
  promptSections: readonly GenerationPromptSection[];
  promptText: string;
  promptFingerprint: string;
  generationFingerprint: string;
}): GenerationRequest {
  const providerHints = normalizeProviderHints(input.providerHints);
  const configuration = buildGenerationConfiguration({
    generationVersion: input.generationVersion,
    providerHints,
  });
  const constraints = buildGenerationConstraints({
    taskConstraints: input.brainResult.request.constraints,
  });
  const instructions = buildGenerationInstructions({
    brainResult: input.brainResult,
    expectedOutputType: input.expectedOutputType,
  });
  const metadata = buildGenerationMetadata({
    generationVersion: input.generationVersion,
    generationRequestId: input.generationSession.generationRequestId,
    generationSessionId: input.generationSession.generationSessionId,
    attemptId: input.generationSession.attemptId,
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    expectedOutputType: input.expectedOutputType,
    providerHints,
    promptSections: input.promptSections,
    generationFingerprint: input.generationFingerprint,
  });

  return deepFreeze({
    generationRequestId: input.generationSession.generationRequestId,
    generationSessionId: input.generationSession.generationSessionId,
    attemptId: input.generationSession.attemptId,
    requestId: input.brainResult.request.requestId,
    taskId: input.brainResult.request.taskId,
    sourceBrainSessionId: input.brainResult.session.sessionId,
    sourceContextPackageId: input.contextPackage.metadata.packageId,
    sourceContextPackageFingerprint: input.contextPackage.metadata.packageFingerprint,
    sourceBrainResponseStatus: input.brainResult.response.status,
    sourceBrainPlanStatus: input.brainResult.executionPlan.status,
    expectedOutputType: input.expectedOutputType,
    generationVersion: input.generationVersion,
    providerHints,
    configuration,
    constraints,
    instructions,
    promptSections: [...input.promptSections],
    promptText: input.promptText,
    promptFingerprint: input.promptFingerprint,
    metadata,
  });
}

export function buildGenerationRequestFingerprint(input: {
  generationVersion: string;
  requestedTask: string;
  expectedOutputType: BrainOutputClass;
  contextPackageFingerprint: string;
  taskConstraints: readonly string[];
  promptSections: readonly GenerationPromptSection[];
}): string {
  return `GEN-${fnv1a32(stableStringify({
    generationVersion: input.generationVersion,
    requestedTask: input.requestedTask,
    expectedOutputType: input.expectedOutputType,
    contextPackageFingerprint: input.contextPackageFingerprint,
    taskConstraints: [...new Set(input.taskConstraints)].sort(),
    promptSections: input.promptSections.map((section) => ({
      sectionId: section.sectionId,
      order: section.order,
      title: section.title,
      required: section.required,
      lines: section.lines,
      sourceArtifactIds: [...section.sourceArtifactIds].sort(),
    })),
  }))}`;
}
