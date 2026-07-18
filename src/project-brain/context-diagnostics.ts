import { deepFreeze } from './knowledge-artifact.ts';
import type { ContextDiagnosticEvent, ContextDiagnosticSeverity, ContextDiagnosticStage } from './context-item.ts';

export function createContextDiagnosticEvent(input: Omit<ContextDiagnosticEvent, 'index'>): ContextDiagnosticEvent {
  return deepFreeze({
    ...input,
    index: 0,
  });
}

export function appendContextDiagnosticEvent(
  events: ContextDiagnosticEvent[],
  input: Omit<ContextDiagnosticEvent, 'index'>,
): void {
  events.push(
    deepFreeze({
      ...input,
      index: events.length + 1,
    }),
  );
}

export function buildContextDiagnosticEvent(
  stage: ContextDiagnosticStage,
  severity: ContextDiagnosticSeverity,
  code: string,
  message: string,
  contextRequestId: string,
  sourceBrainSessionId: string,
  artifactId?: string,
  relatedArtifactId?: string,
): ContextDiagnosticEvent {
  return deepFreeze({
    index: 0,
    stage,
    severity,
    code,
    message,
    contextRequestId,
    sourceBrainSessionId,
    artifactId,
    relatedArtifactId,
  });
}

