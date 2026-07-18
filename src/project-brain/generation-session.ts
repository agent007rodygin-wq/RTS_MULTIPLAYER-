import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainOutputClass } from './brain-request.ts';
import type { BrainEngineResult } from './brain-response.ts';
import type { ContextPackageResult } from './context-item.ts';

export interface GenerationSession {
  generationSessionId: string;
  generationRequestId: string;
  attemptId: string;
  requestId: string;
  taskId: string;
  brainSessionId: string;
  contextPackageId: string;
  contextPackageFingerprint: string;
  generationVersion: string;
  expectedOutputType: BrainOutputClass;
  promptFingerprint: string;
}

export function createGenerationSession(input: {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationVersion: string;
  expectedOutputType: BrainOutputClass;
  promptFingerprint: string;
}): GenerationSession {
  const generationSessionId = [
    'GENERATION-SESSION',
    input.brainResult.session.sessionId,
    input.contextPackage.metadata.packageFingerprint,
    input.generationVersion,
  ].join('::');

  const generationRequestId = [
    'GENERATION-REQUEST',
    input.brainResult.request.requestId,
    input.contextPackage.contextRequestId,
    input.expectedOutputType.toUpperCase(),
  ].join('::');

  const attemptId = [
    'GENERATION-ATTEMPT',
    generationSessionId,
    input.promptFingerprint.slice(0, 12),
  ].join('::');

  return deepFreeze({
    generationSessionId,
    generationRequestId,
    attemptId,
    requestId: input.brainResult.request.requestId,
    taskId: input.brainResult.request.taskId,
    brainSessionId: input.brainResult.session.sessionId,
    contextPackageId: input.contextPackage.metadata.packageId,
    contextPackageFingerprint: input.contextPackage.metadata.packageFingerprint,
    generationVersion: input.generationVersion,
    expectedOutputType: input.expectedOutputType,
    promptFingerprint: input.promptFingerprint,
  });
}
