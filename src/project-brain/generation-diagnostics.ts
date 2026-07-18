import { deepFreeze } from './knowledge-artifact.ts';
import type { GenerationResultEnvelope } from './generation-result.ts';
import type { GenerationSession } from './generation-session.ts';

export type GenerationDiagnosticStage =
  | 'request'
  | 'context'
  | 'prompt'
  | 'ordering'
  | 'fingerprint'
  | 'serialization'
  | 'validation'
  | 'result';

export type GenerationDiagnosticSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface GenerationWarning {
  code: string;
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface GenerationDiagnosticEvent {
  index: number;
  stage: GenerationDiagnosticStage;
  severity: GenerationDiagnosticSeverity;
  code: string;
  message: string;
  generationRequestId: string;
  generationSessionId: string;
  sectionId?: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

function pushEvent(
  events: GenerationDiagnosticEvent[],
  event: Omit<GenerationDiagnosticEvent, 'index'>,
): void {
  events.push({
    ...event,
    index: events.length + 1,
  });
}

export function appendGenerationDiagnosticEvent(
  events: GenerationDiagnosticEvent[],
  event: Omit<GenerationDiagnosticEvent, 'index'>,
): void {
  pushEvent(events, event);
}

export function buildGenerationDiagnostics(input: {
  session: GenerationSession;
  requestId: string;
  contextStatus: GenerationResultEnvelope['status'];
  sectionCount: number;
  promptFingerprint: string;
  validationFailures: readonly { source: 'request' | 'context' | 'prompt' | 'serialization'; code: string; message: string; sectionId?: string; artifactId?: string }[];
  warnings: readonly GenerationWarning[];
  resultStatus: GenerationResultEnvelope['status'];
  blockedReason?: string;
}): readonly GenerationDiagnosticEvent[] {
  const events: GenerationDiagnosticEvent[] = [];
  const requestFailure = input.validationFailures.find((failure) => failure.source === 'request');
  const contextFailure = input.validationFailures.find((failure) => failure.source === 'context');
  const promptFailure = input.validationFailures.find((failure) => failure.source === 'prompt');
  const serializationFailure = input.validationFailures.find(
    (failure) => failure.source === 'serialization',
  );

  pushEvent(events, {
    stage: 'request',
    severity: requestFailure ? 'ERROR' : 'INFO',
    code: requestFailure ? 'GENERATION_REQUEST_INVALID' : 'GENERATION_REQUEST_NORMALIZED',
    message: requestFailure
      ? requestFailure.message
      : `Generation request ${input.requestId} normalized for session ${input.session.generationSessionId}.`,
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  pushEvent(events, {
    stage: 'context',
    severity: contextFailure || input.resultStatus === 'BLOCKED' ? 'ERROR' : 'INFO',
    code: contextFailure
      ? 'GENERATION_CONTEXT_BLOCKED'
      : input.resultStatus === 'BLOCKED'
        ? 'GENERATION_CONTEXT_BLOCKED'
        : 'GENERATION_CONTEXT_READY',
    message: contextFailure
      ? contextFailure.message
      : input.resultStatus === 'BLOCKED' && input.blockedReason
        ? input.blockedReason
        : `Context package ${input.session.contextPackageId} accepted for generation.`,
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
    artifactId: input.session.contextPackageId,
  });

  pushEvent(events, {
    stage: 'prompt',
    severity: promptFailure ? 'ERROR' : 'INFO',
    code: promptFailure ? 'GENERATION_PROMPT_INVALID' : 'GENERATION_PROMPT_ASSEMBLED',
    message: promptFailure
      ? promptFailure.message
      : `Prompt assembled with ${input.sectionCount} section(s).`,
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  pushEvent(events, {
    stage: 'ordering',
    severity: promptFailure ? 'ERROR' : 'INFO',
    code: promptFailure ? 'GENERATION_PROMPT_ORDER_INVALID' : 'GENERATION_PROMPT_ORDERED',
    message: promptFailure
      ? 'Prompt ordering failed validation.'
      : 'Prompt ordering is deterministic.',
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  pushEvent(events, {
    stage: 'fingerprint',
    severity: 'INFO',
    code: 'GENERATION_PROMPT_FINGERPRINTED',
    message: `Prompt fingerprint ${input.promptFingerprint} computed deterministically.`,
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  pushEvent(events, {
    stage: 'serialization',
    severity: serializationFailure ? 'ERROR' : 'INFO',
    code: serializationFailure ? 'GENERATION_SERIALIZATION_INVALID' : 'GENERATION_SERIALIZATION_READY',
    message: serializationFailure
      ? serializationFailure.message
      : 'Generation request serialization is deterministic.',
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  pushEvent(events, {
    stage: 'validation',
    severity: input.validationFailures.length > 0 ? 'ERROR' : 'INFO',
    code: input.validationFailures.length > 0 ? 'GENERATION_VALIDATION_BLOCKED' : 'GENERATION_VALIDATION_READY',
    message: input.validationFailures.length > 0
      ? `Generation validation blocked ${input.validationFailures.length} issue(s).`
      : 'Generation validation completed without blocking issues.',
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  pushEvent(events, {
    stage: 'result',
    severity: input.resultStatus === 'BLOCKED' ? 'ERROR' : 'INFO',
    code: input.resultStatus === 'BLOCKED' ? 'GENERATION_BLOCKED' : 'GENERATION_READY',
    message: input.resultStatus === 'BLOCKED'
      ? input.blockedReason ?? 'Generation request blocked.'
      : 'Generation request ready.',
    generationRequestId: input.session.generationRequestId,
    generationSessionId: input.session.generationSessionId,
  });

  return deepFreeze(events);
}
