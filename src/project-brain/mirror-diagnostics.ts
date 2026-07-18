import { deepFreeze } from './knowledge-artifact.ts';
import type { MirrorSnapshot } from './mirror-core.ts';

export type MirrorDiagnosticStage =
  | 'identity'
  | 'source'
  | 'assembly'
  | 'ordering'
  | 'fingerprint'
  | 'validation'
  | 'serialization'
  | 'refresh'
  | 'result';

export type MirrorDiagnosticSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface MirrorDiagnosticEvent {
  index: number;
  stage: MirrorDiagnosticStage;
  severity: MirrorDiagnosticSeverity;
  code: string;
  message: string;
  mirrorArtifactId: string;
  mirrorRevision: string;
  nodeId?: string;
  edgeId?: string;
  artifactId?: string;
}

function pushEvent(
  events: MirrorDiagnosticEvent[],
  event: Omit<MirrorDiagnosticEvent, 'index'>,
): void {
  events.push({
    ...event,
    index: events.length + 1,
  });
}

export function appendMirrorDiagnosticEvent(
  events: MirrorDiagnosticEvent[],
  event: Omit<MirrorDiagnosticEvent, 'index'>,
): void {
  pushEvent(events, event);
}

export function buildMirrorDiagnostics(input: {
  snapshot: MirrorSnapshot;
  unresolvedReferences: number;
  staleNodes: number;
  inferredEdges: number;
  validationBlocked: boolean;
  validationWarnings: number;
  refreshType: 'full' | 'incremental';
  previousFingerprint?: string;
}): readonly MirrorDiagnosticEvent[] {
  const events: MirrorDiagnosticEvent[] = [];
  const id = input.snapshot.identity.mirrorArtifactId;
  const revision = input.snapshot.identity.mirrorRevision;

  pushEvent(events, {
    stage: 'identity',
    severity: 'INFO',
    code: 'MIRROR_IDENTITY_ASSIGNED',
    message: `Mirror identity ${id} revision ${revision} assigned.`,
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  pushEvent(events, {
    stage: 'source',
    severity: input.unresolvedReferences > 0 ? 'WARN' : 'INFO',
    code: input.unresolvedReferences > 0 ? 'MIRROR_UNRESOLVED_REFERENCES' : 'MIRROR_SOURCES_RESOLVED',
    message: input.unresolvedReferences > 0
      ? `${input.unresolvedReferences} unresolved source reference(s).`
      : 'All source references resolved.',
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  pushEvent(events, {
    stage: 'assembly',
    severity: 'INFO',
    code: 'MIRROR_ASSEMBLED',
    message: `Mirror assembled with ${input.snapshot.nodeCount} node(s) and ${input.snapshot.edgeCount} edge(s).`,
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  pushEvent(events, {
    stage: 'ordering',
    severity: 'INFO',
    code: 'MIRROR_ORDERING_DETERMINISTIC',
    message: 'Mirror nodes and edges sorted deterministically.',
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  pushEvent(events, {
    stage: 'fingerprint',
    severity: 'INFO',
    code: 'MIRROR_FINGERPRINT_COMPUTED',
    message: `Mirror fingerprint ${input.snapshot.fingerprint} computed.`,
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  if (input.previousFingerprint) {
    const fingerprintChanged = input.snapshot.fingerprint !== input.previousFingerprint;
    pushEvent(events, {
      stage: 'refresh',
      severity: 'INFO',
      code: fingerprintChanged ? 'MIRROR_REFRESH_CHANGED' : 'MIRROR_REFRESH_UNCHANGED',
      message: fingerprintChanged
        ? `Mirror changed during ${input.refreshType} refresh.`
        : `Mirror unchanged during ${input.refreshType} refresh.`,
      mirrorArtifactId: id,
      mirrorRevision: revision,
    });
  }

  pushEvent(events, {
    stage: 'validation',
    severity: input.validationBlocked ? 'ERROR' : input.validationWarnings > 0 ? 'WARN' : 'INFO',
    code: input.validationBlocked
      ? 'MIRROR_VALIDATION_BLOCKED'
      : input.validationWarnings > 0
        ? 'MIRROR_VALIDATION_WARNINGS'
        : 'MIRROR_VALIDATION_READY',
    message: input.validationBlocked
      ? 'Mirror validation blocked.'
      : input.validationWarnings > 0
        ? `Mirror validation completed with ${input.validationWarnings} warning(s).`
        : 'Mirror validation completed successfully.',
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  pushEvent(events, {
    stage: 'result',
    severity: input.validationBlocked ? 'ERROR' : 'INFO',
    code: input.validationBlocked ? 'MIRROR_BLOCKED' : 'MIRROR_READY',
    message: input.validationBlocked
      ? 'Mirror generation blocked by validation failures.'
      : 'Mirror snapshot ready for publication.',
    mirrorArtifactId: id,
    mirrorRevision: revision,
  });

  return deepFreeze(events);
}
