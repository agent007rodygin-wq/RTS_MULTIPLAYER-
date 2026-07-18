import type { BrainEngineResult } from './brain-response.ts';
import type { ContextPackageResult } from './context-item.ts';
import { buildGenerationPromptSections, computeGenerationPromptFingerprint, renderGenerationPrompt } from './generation-prompt.ts';
import { buildGenerationRequestSerialization } from './generation-serialization.ts';
import { createGenerationRequest, normalizeGenerationVersion, normalizeProviderHints } from './generation-request.ts';
import { createGenerationSession } from './generation-session.ts';
import { buildGenerationDiagnostics } from './generation-diagnostics.ts';
import { freezeGenerationResultEnvelope, type GenerationResultEnvelope } from './generation-result.ts';
import { validateGenerationRequestEnvelope } from './generation-validation.ts';

export interface GenerationRequestBuildInput {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationVersion?: unknown;
  providerHints?: readonly unknown[];
}

function determineBlockedReason(input: GenerationRequestBuildInput): string | undefined {
  if (input.contextPackage.status === 'BLOCKED') {
    return `Context package ${input.contextPackage.metadata.packageId} is blocked.`;
  }

  if (input.brainResult.response.status === 'BLOCKED') {
    return `Brain result ${input.brainResult.session.sessionId} is blocked.`;
  }

  return undefined;
}

export function buildGenerationRequestEnvelope(
  input: GenerationRequestBuildInput,
): GenerationResultEnvelope {
  const generationVersion = normalizeGenerationVersion(input.generationVersion);
  const providerHints = normalizeProviderHints(input.providerHints);
  const expectedOutputType = input.brainResult.request.outputClass;

  const promptSections = buildGenerationPromptSections({
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    generationVersion,
    expectedOutputType,
    taskConstraints: input.brainResult.request.constraints,
    providerHints,
  });
  const promptText = renderGenerationPrompt(promptSections);
  const promptFingerprint = computeGenerationPromptFingerprint({
    generationVersion,
    requestedTask: input.brainResult.request.summary,
    expectedOutputType,
    contextPackageFingerprint: input.contextPackage.metadata.packageFingerprint,
    taskConstraints: input.brainResult.request.constraints,
    promptSections,
  });

  const session = createGenerationSession({
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    generationVersion,
    expectedOutputType,
    promptFingerprint,
  });

  const provisionalRequest = createGenerationRequest({
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    generationSession: session,
    expectedOutputType,
    generationVersion,
    providerHints,
    promptSections,
    promptText,
    promptFingerprint,
    generationFingerprint: '',
  });

  const generationFingerprint = buildGenerationRequestSerialization({
    schemaVersion: '1.0.0',
    status: 'READY',
    request: provisionalRequest,
    validationFailures: [],
    warnings: [],
    diagnostics: [],
    serialized: '',
  }).generationFingerprint;

  const request = createGenerationRequest({
    brainResult: input.brainResult,
    contextPackage: input.contextPackage,
    generationSession: session,
    expectedOutputType,
    generationVersion,
    providerHints,
    promptSections,
    promptText,
    promptFingerprint,
    generationFingerprint,
  });

  const blockedReason = determineBlockedReason(input);
  const provisionalEnvelope = freezeGenerationResultEnvelope({
    schemaVersion: '1.0.0',
    status: blockedReason ? 'BLOCKED' : 'READY',
    blockedReason,
    request,
    validationFailures: [],
    warnings: [],
    diagnostics: [],
    serialized: '',
  });

  const validation = validateGenerationRequestEnvelope(provisionalEnvelope, input);
  const resultStatus =
    blockedReason !== undefined ? 'BLOCKED' : validation.valid ? 'READY' : 'BLOCKED';
  const resultBlockedReason =
    blockedReason ??
    (resultStatus === 'BLOCKED' ? validation.issues[0]?.message ?? 'Generation request blocked.' : undefined);
  const diagnostics = buildGenerationDiagnostics({
    session,
    requestId: request.requestId,
    contextStatus: resultStatus,
    sectionCount: promptSections.length,
    promptFingerprint,
    validationFailures: validation.issues,
    warnings: [],
    resultStatus,
    blockedReason: resultBlockedReason,
  });

  const envelopeWithoutSerialized = freezeGenerationResultEnvelope({
    schemaVersion: '1.0.0',
    status: resultStatus,
    blockedReason: resultBlockedReason,
    request,
    validationFailures: validation.issues,
    warnings: [],
    diagnostics,
    serialized: '',
  });

  const serialization = buildGenerationRequestSerialization(envelopeWithoutSerialized);

  return freezeGenerationResultEnvelope({
    ...envelopeWithoutSerialized,
    request: {
      ...request,
      metadata: {
        ...request.metadata,
        generationFingerprint: serialization.generationFingerprint,
      },
    },
    serialized: serialization.serialized,
  });
}
