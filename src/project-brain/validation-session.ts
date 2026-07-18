import { deepFreeze } from './knowledge-artifact.ts';
import type { ValidationRequest } from './validation-request.ts';

export interface ValidationSession {
  validationRequestId: string;
  validationSessionId: string;
  validationAttemptId: string;
  validationVersion: string;
  generationRequestId: string;
  generationSessionId: string;
  generationAttemptId: string;
  requestId: string;
  taskId: string;
  contextRequestId: string;
  contextPackageId: string;
  contextPackageFingerprint: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  sourceBrainAuthorityStatus: string;
  expectedOutputType: string;
  validationRequestFingerprint: string;
}

export function createValidationSession(request: ValidationRequest): ValidationSession {
  const validationSessionId = [
    'VALIDATION-SESSION',
    request.metadata.generationRequestId,
    request.metadata.contextPackageFingerprint,
    request.validationVersion,
  ].join('::');

  const validationAttemptId = [
    'VALIDATION-ATTEMPT',
    validationSessionId,
    request.metadata.validationRequestFingerprint.slice(0, 12),
  ].join('::');

  return deepFreeze({
    validationRequestId: request.validationRequestId,
    validationSessionId,
    validationAttemptId,
    validationVersion: request.validationVersion,
    generationRequestId: request.metadata.generationRequestId,
    generationSessionId: request.metadata.generationSessionId,
    generationAttemptId: request.metadata.generationAttemptId,
    requestId: request.metadata.requestId,
    taskId: request.metadata.taskId,
    contextRequestId: request.metadata.contextRequestId,
    contextPackageId: request.metadata.contextPackageId,
    contextPackageFingerprint: request.metadata.contextPackageFingerprint,
    sourceBrainSessionId: request.metadata.sourceBrainSessionId,
    sourceBrainResponseStatus: request.metadata.sourceBrainResponseStatus,
    sourceBrainPlanStatus: request.metadata.sourceBrainPlanStatus,
    sourceBrainAuthorityStatus: request.metadata.sourceBrainAuthorityStatus,
    expectedOutputType: request.metadata.expectedOutputType,
    validationRequestFingerprint: request.metadata.validationRequestFingerprint,
  });
}
