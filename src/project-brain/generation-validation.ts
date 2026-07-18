import { computeGenerationPromptFingerprint, validateGenerationPromptSections } from './generation-prompt.ts';
import { buildGenerationRequestFingerprint, type GenerationPipelineInput, type GenerationRequest } from './generation-request.ts';
import type { GenerationResultEnvelope } from './generation-result.ts';

export type GenerationValidationSource = 'request' | 'context' | 'prompt' | 'serialization';

export interface GenerationValidationFailure {
  source: GenerationValidationSource;
  code:
    | 'INVALID_GENERATION_REQUEST_SHAPE'
    | 'INVALID_GENERATION_VALUE'
    | 'INVALID_GENERATION_VERSION'
    | 'INVALID_PROVIDER_HINT'
    | 'BLOCKED_CONTEXT_PACKAGE'
    | 'BLOCKED_SOURCE_BRAIN_RESULT'
    | 'RESULT_STATUS_MISMATCH'
    | 'REQUEST_ID_MISMATCH'
    | 'TASK_ID_MISMATCH'
    | 'SESSION_ID_MISMATCH'
    | 'CONTEXT_PACKAGE_ID_MISMATCH'
    | 'CONTEXT_PACKAGE_FINGERPRINT_MISMATCH'
    | 'EXPECTED_OUTPUT_MISMATCH'
    | 'MISSING_PROMPT_SECTION'
    | 'DUPLICATE_PROMPT_SECTION'
    | 'PROMPT_SECTION_ORDER_MISMATCH'
    | 'EMPTY_REQUIRED_PROMPT_SECTION'
    | 'UNEXPECTED_PROMPT_SECTION'
    | 'PROMPT_FINGERPRINT_MISMATCH'
    | 'GENERATION_FINGERPRINT_MISMATCH'
    | 'SERIALIZATION_FINGERPRINT_MISMATCH'
    | 'SERIALIZATION_SCHEMA_MISMATCH'
    | 'INVALID_SERIALIZED_GENERATION'
    | 'INVALID_GENERATION_REQUEST';
  message: string;
  field?: string;
  sectionId?: string;
  artifactId?: string;
}

export interface GenerationValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly GenerationValidationFailure[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeFailure(
  source: GenerationValidationSource,
  code: GenerationValidationFailure['code'],
  message: string,
  field?: string,
  sectionId?: string,
  artifactId?: string,
): GenerationValidationFailure {
  return {
    source,
    code,
    message,
    field,
    sectionId,
    artifactId,
  };
}

function normalizeStringList(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Generation request field ${fieldName} must be an array.`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error(`Generation request field ${fieldName} must contain only strings.`);
    }

    const trimmed = item.trim();
    if (!trimmed) {
      throw new Error(`Generation request field ${fieldName} cannot contain empty strings.`);
    }

    return trimmed;
  });

  return Array.from(new Set(normalized)).sort();
}

export function computeGenerationRequestFingerprint(request: GenerationRequest): string {
  return buildGenerationRequestFingerprint({
    generationVersion: request.generationVersion,
    requestedTask: request.instructions.requestedTask,
    expectedOutputType: request.expectedOutputType,
    contextPackageFingerprint: request.sourceContextPackageFingerprint,
    taskConstraints: request.constraints.taskConstraints,
    promptSections: request.promptSections,
  });
}

export function validateGenerationPipelineSource(input: unknown): GenerationValidationReport {
  if (!isPlainObject(input)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        makeFailure(
          'request',
          'INVALID_GENERATION_REQUEST_SHAPE',
          'Generation pipeline input must be a plain object.',
        ),
      ],
    };
  }

  const issues: GenerationValidationFailure[] = [];

  if (!('brainResult' in input)) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_REQUEST_SHAPE',
        'Generation pipeline input is missing brainResult.',
        'brainResult',
      ),
    );
  }

  if (!('contextPackage' in input)) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_REQUEST_SHAPE',
        'Generation pipeline input is missing contextPackage.',
        'contextPackage',
      ),
    );
  }

  if (issues.length > 0) {
    return {
      valid: false,
      issueCount: issues.length,
      issues,
    };
  }

  const candidate = input as unknown as GenerationPipelineInput;
  if (typeof candidate.generationVersion === 'string' && !candidate.generationVersion.trim()) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_VERSION',
        'Generation version must not be empty when provided.',
        'generationVersion',
      ),
    );
  }

  if (candidate.providerHints !== undefined) {
    try {
      normalizeStringList(candidate.providerHints, 'providerHints');
    } catch (error) {
      issues.push(
        makeFailure(
          'request',
          'INVALID_PROVIDER_HINT',
          error instanceof Error ? error.message : String(error),
          'providerHints',
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

export function validateGenerationRequestEnvelope(
  envelope: unknown,
  source?: GenerationPipelineInput,
): GenerationValidationReport {
  if (!isPlainObject(envelope) || !isPlainObject((envelope as { request?: unknown }).request)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        makeFailure(
          'serialization',
          'INVALID_SERIALIZED_GENERATION',
          'Generation envelope must be a plain object with a request object.',
        ),
      ],
    };
  }

  const candidate = envelope as unknown as GenerationResultEnvelope;
  const issues: GenerationValidationFailure[] = [];
  const request = candidate.request as GenerationRequest;

  if (
    !isPlainObject(request.configuration) ||
    !isPlainObject(request.constraints) ||
    !isPlainObject(request.instructions) ||
    !isPlainObject(request.metadata) ||
    !Array.isArray(request.promptSections)
  ) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_REQUEST_SHAPE',
        'Generation request envelope is missing required nested sections.',
      ),
    );

    return {
      valid: false,
      issueCount: issues.length,
      issues,
    };
  }

  if (candidate.schemaVersion !== '1.0.0') {
    issues.push(
      makeFailure(
        'serialization',
        'SERIALIZATION_SCHEMA_MISMATCH',
        `Unexpected generation schema version ${candidate.schemaVersion}.`,
        'schemaVersion',
      ),
    );
  }

  if (candidate.status !== 'READY' && candidate.status !== 'BLOCKED') {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        `Generation status must be READY or BLOCKED. Received ${String(candidate.status)}.`,
        'status',
      ),
    );
  }

  if (!request.generationRequestId || !request.generationSessionId || !request.attemptId) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_REQUEST_SHAPE',
        'Generation request is missing request, session, or attempt identity.',
      ),
    );
  }

  const normalizedGenerationVersion =
    typeof request.generationVersion === 'string' ? request.generationVersion : '';
  const normalizedExpectedOutputType =
    typeof request.expectedOutputType === 'string' ? request.expectedOutputType : '';
  const normalizedPromptFingerprint =
    typeof request.promptFingerprint === 'string' ? request.promptFingerprint : '';
  const expectedGenerationSessionId = `GENERATION-SESSION::${request.sourceBrainSessionId}::${request.sourceContextPackageFingerprint}::${normalizedGenerationVersion}`;
  const expectedAttemptId = `GENERATION-ATTEMPT::${expectedGenerationSessionId}::${normalizedPromptFingerprint.slice(0, 12)}`;

  if (request.generationSessionId !== expectedGenerationSessionId) {
    issues.push(
      makeFailure(
        'request',
        'SESSION_ID_MISMATCH',
        'Generation session identity does not match the deterministic session formula.',
        'generationSessionId',
      ),
    );
  }

  if (request.attemptId !== expectedAttemptId) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_VALUE',
        'Generation attempt identity does not match the deterministic attempt formula.',
        'attemptId',
      ),
    );
  }

  if (request.configuration.generationVersion !== request.generationVersion) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_VALUE',
        'Generation configuration version must match the request generation version.',
        'configuration.generationVersion',
      ),
    );
  }

  if (request.configuration.promptVersion !== request.generationVersion) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_VALUE',
        'Prompt version must match the request generation version.',
        'configuration.promptVersion',
      ),
    );
  }

  if (request.metadata.generationVersion !== request.generationVersion) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata version must match the request generation version.',
        'metadata.generationVersion',
      ),
    );
  }

  if (request.metadata.generationRequestId !== request.generationRequestId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata request identity must match the request identity.',
        'metadata.generationRequestId',
      ),
    );
  }

  if (request.metadata.generationSessionId !== request.generationSessionId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata session identity must match the request identity.',
        'metadata.generationSessionId',
      ),
    );
  }

  if (request.metadata.attemptId !== request.attemptId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata attempt identity must match the request identity.',
        'metadata.attemptId',
      ),
    );
  }

  if (request.metadata.requestId !== request.requestId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata requestId must match the requestId.',
        'metadata.requestId',
      ),
    );
  }

  if (request.metadata.taskId !== request.taskId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata taskId must match the taskId.',
        'metadata.taskId',
      ),
    );
  }

  if (request.metadata.sourceBrainSessionId !== request.sourceBrainSessionId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata source session must match the request source session.',
        'metadata.sourceBrainSessionId',
      ),
    );
  }

  if (request.metadata.sourceContextPackageId !== request.sourceContextPackageId) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata context package ID must match the request context package ID.',
        'metadata.sourceContextPackageId',
      ),
    );
  }

  if (request.metadata.sourceContextPackageFingerprint !== request.sourceContextPackageFingerprint) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata context package fingerprint must match the request context package fingerprint.',
        'metadata.sourceContextPackageFingerprint',
      ),
    );
  }

  if (request.metadata.sourceBrainResponseStatus !== request.sourceBrainResponseStatus) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata response status must match the request response status.',
        'metadata.sourceBrainResponseStatus',
      ),
    );
  }

  if (request.metadata.sourceBrainPlanStatus !== request.sourceBrainPlanStatus) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata plan status must match the request plan status.',
        'metadata.sourceBrainPlanStatus',
      ),
    );
  }

  if (request.metadata.expectedOutputType !== request.expectedOutputType) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Generation metadata expected output type must match the request output type.',
        'metadata.expectedOutputType',
      ),
    );
  }

  const promptValidation = validateGenerationPromptSections(request.promptSections);
  for (const issue of promptValidation.issues) {
    issues.push(
      makeFailure(
        'prompt',
        issue.code === 'INVALID_PROMPT_SECTION_SHAPE'
          ? 'INVALID_GENERATION_REQUEST_SHAPE'
          : issue.code === 'MISSING_PROMPT_SECTION'
            ? 'MISSING_PROMPT_SECTION'
            : issue.code === 'DUPLICATE_PROMPT_SECTION'
              ? 'DUPLICATE_PROMPT_SECTION'
              : issue.code === 'PROMPT_SECTION_ORDER_MISMATCH'
                ? 'PROMPT_SECTION_ORDER_MISMATCH'
                : issue.code === 'EMPTY_REQUIRED_PROMPT_SECTION'
                  ? 'EMPTY_REQUIRED_PROMPT_SECTION'
                  : 'UNEXPECTED_PROMPT_SECTION',
        issue.message,
        undefined,
        issue.sectionId,
      ),
    );
  }

  if (promptValidation.valid) {
    const expectedPromptFingerprint = computeGenerationPromptFingerprint({
      generationVersion: request.generationVersion,
      requestedTask: request.instructions.requestedTask,
      expectedOutputType: request.expectedOutputType,
      contextPackageFingerprint: request.sourceContextPackageFingerprint,
      taskConstraints: request.constraints.taskConstraints,
      promptSections: request.promptSections,
    });
    if (request.promptFingerprint !== expectedPromptFingerprint) {
      issues.push(
        makeFailure(
          'prompt',
          'PROMPT_FINGERPRINT_MISMATCH',
          `Prompt fingerprint mismatch: expected ${request.promptFingerprint}, found ${expectedPromptFingerprint}.`,
        ),
      );
    }
  }

  if (source) {
    if (request.requestId !== source.brainResult.request.requestId) {
      issues.push(
        makeFailure(
          'context',
          'REQUEST_ID_MISMATCH',
          'Generation request requestId does not match the Brain request.',
          'requestId',
        ),
      );
    }

    if (request.taskId !== source.brainResult.request.taskId) {
      issues.push(
        makeFailure(
          'context',
          'TASK_ID_MISMATCH',
          'Generation request taskId does not match the Brain request.',
          'taskId',
        ),
      );
    }

    const expectedSourceGenerationRequestId = `GENERATION-REQUEST::${source.brainResult.request.requestId}::${source.contextPackage.contextRequestId}::${String(request.expectedOutputType).toUpperCase()}`;
    const expectedSourceGenerationSessionId = `GENERATION-SESSION::${source.brainResult.session.sessionId}::${source.contextPackage.metadata.packageFingerprint}::${request.generationVersion}`;

    if (request.generationRequestId !== expectedSourceGenerationRequestId) {
      issues.push(
        makeFailure(
          'context',
          'REQUEST_ID_MISMATCH',
          'Generation request identity does not match the source request identity.',
          'generationRequestId',
        ),
      );
    }

    if (request.generationSessionId !== expectedSourceGenerationSessionId) {
      issues.push(
        makeFailure(
          'context',
          'SESSION_ID_MISMATCH',
          'Generation session identity does not match the source Brain session identity.',
          'generationSessionId',
        ),
      );
    }

    if (request.sourceBrainSessionId !== source.brainResult.session.sessionId) {
      issues.push(
        makeFailure(
          'context',
          'SESSION_ID_MISMATCH',
          'Generation metadata does not match the source Brain session identity.',
          'sourceBrainSessionId',
        ),
      );
    }

    if (request.sourceContextPackageId !== source.contextPackage.metadata.packageId) {
      issues.push(
        makeFailure(
          'context',
          'CONTEXT_PACKAGE_ID_MISMATCH',
          'Generation context package ID does not match the provided context package.',
          'sourceContextPackageId',
        ),
      );
    }

    if (request.sourceContextPackageFingerprint !== source.contextPackage.metadata.packageFingerprint) {
      issues.push(
        makeFailure(
          'context',
          'CONTEXT_PACKAGE_FINGERPRINT_MISMATCH',
          'Generation context package fingerprint does not match the provided context package.',
          'sourceContextPackageFingerprint',
        ),
      );
    }

    if (request.expectedOutputType !== source.brainResult.request.outputClass) {
      issues.push(
        makeFailure(
          'context',
          'EXPECTED_OUTPUT_MISMATCH',
          'Generation output type does not match the normalized Brain request.',
          'expectedOutputType',
        ),
      );
    }

    if (request.sourceBrainResponseStatus !== source.brainResult.response.status) {
      issues.push(
        makeFailure(
          'context',
          'RESULT_STATUS_MISMATCH',
          'Generation response status does not match the Brain result.',
          'sourceBrainResponseStatus',
        ),
      );
    }

    if (request.sourceBrainPlanStatus !== source.brainResult.executionPlan.status) {
      issues.push(
        makeFailure(
          'context',
          'RESULT_STATUS_MISMATCH',
          'Generation plan status does not match the Brain execution plan.',
          'sourceBrainPlanStatus',
        ),
      );
    }

    if (source.contextPackage.status === 'BLOCKED' && candidate.status !== 'BLOCKED') {
      issues.push(
        makeFailure(
          'context',
          'BLOCKED_CONTEXT_PACKAGE',
          'Blocked context package must not yield a READY generation envelope.',
          'status',
        ),
      );
    }

    if (source.brainResult.response.status === 'BLOCKED' && candidate.status !== 'BLOCKED') {
      issues.push(
        makeFailure(
          'context',
          'BLOCKED_SOURCE_BRAIN_RESULT',
          'Blocked Brain output must not yield a READY generation envelope.',
          'status',
        ),
      );
    }

    if (source.contextPackage.status === 'READY' && source.brainResult.response.status === 'ALLOW' && candidate.status === 'BLOCKED') {
      issues.push(
        makeFailure(
          'context',
          'RESULT_STATUS_MISMATCH',
          'READY source inputs must not yield a BLOCKED generation envelope without a validation reason.',
          'status',
        ),
      );
    }
  }

  let normalizedProviderHints: string[] = [];
  try {
    normalizedProviderHints = normalizeStringList(request.configuration.providerHints, 'providerHints');
  } catch (error) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_PROVIDER_HINT',
        error instanceof Error ? error.message : String(error),
        'providerHints',
      ),
    );
  }

  if (normalizedProviderHints.length !== request.metadata.providerHintCount) {
    issues.push(
      makeFailure(
        'request',
        'INVALID_GENERATION_VALUE',
        'Provider hint count metadata does not match the normalized provider hints.',
        'providerHints',
      ),
    );
  }

  if (request.promptSections.length !== request.metadata.promptSectionCount) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Prompt section count metadata does not match the actual prompt sections.',
        'promptSections',
      ),
    );
  }

  if (request.promptSections.length !== request.metadata.requiredPromptSectionCount) {
    issues.push(
      makeFailure(
        'serialization',
        'INVALID_GENERATION_VALUE',
        'Required prompt section count metadata does not match the actual prompt sections.',
        'promptSections',
      ),
    );
  }

  if (promptValidation.valid) {
    const expectedGenerationFingerprint = computeGenerationRequestFingerprint(request);
    if (request.metadata.generationFingerprint !== expectedGenerationFingerprint) {
      issues.push(
        makeFailure(
          'serialization',
          'GENERATION_FINGERPRINT_MISMATCH',
          `Generation fingerprint mismatch: expected ${request.metadata.generationFingerprint}, found ${expectedGenerationFingerprint}.`,
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
