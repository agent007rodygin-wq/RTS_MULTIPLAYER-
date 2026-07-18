import { deepFreeze } from './knowledge-artifact.ts';
import type { GenerationDiagnosticEvent, GenerationWarning } from './generation-diagnostics.ts';
import type { GenerationRequest } from './generation-request.ts';
import type { GenerationValidationFailure } from './generation-validation.ts';

export type GenerationResultStatus = 'READY' | 'BLOCKED';

export interface GenerationResultEnvelope {
  schemaVersion: string;
  status: GenerationResultStatus;
  blockedReason?: string;
  request: GenerationRequest;
  validationFailures: readonly GenerationValidationFailure[];
  warnings: readonly GenerationWarning[];
  diagnostics: readonly GenerationDiagnosticEvent[];
  serialized: string;
}

export function freezeGenerationResultEnvelope(
  envelope: GenerationResultEnvelope,
): GenerationResultEnvelope {
  return deepFreeze({
    ...envelope,
    validationFailures: [...envelope.validationFailures],
    warnings: [...envelope.warnings],
    diagnostics: [...envelope.diagnostics],
  });
}
