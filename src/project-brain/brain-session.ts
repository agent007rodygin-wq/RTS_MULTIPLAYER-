import { serializeCanonicalRegistry } from './canonical-registry.ts';
import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import {
  getCanonicalKnowledgeRevisions,
  getDerivedKnowledgeRevisions,
  serializeKnowledgeStore,
  type KnowledgeStore,
} from './knowledge-store.ts';
import type { BrainRequest } from './brain-request.ts';

export interface BrainSession {
  sessionId: string;
  requestId: string;
  taskId: string;
  outputClass: BrainRequest['outputClass'];
  requestFingerprint: string;
  registryFingerprint: string;
  storeFingerprint: string;
  canonicalRevisionCount: number;
  derivedRevisionCount: number;
  revisionCount: number;
  authorityArtifactIds: readonly string[];
  requiredArtifactIds: readonly string[];
  optionalArtifactIds: readonly string[];
  constraints: readonly string[];
}

function buildSessionId(request: BrainRequest): string {
  return [
    'BRAIN-SESSION',
    request.requestId,
    request.taskId,
    request.outputClass.toUpperCase(),
  ].join('::');
}

export function createBrainSession(
  request: BrainRequest,
  store: KnowledgeStore,
): BrainSession {
  const registryFingerprint = serializeCanonicalRegistry(store.registry);
  const storeFingerprint = serializeKnowledgeStore(store);

  return deepFreeze({
    sessionId: buildSessionId(request),
    requestId: request.requestId,
    taskId: request.taskId,
    outputClass: request.outputClass,
    requestFingerprint: stableStringify({
      requestId: request.requestId,
      taskId: request.taskId,
      summary: request.summary,
      purpose: request.purpose,
      authorityArtifactIds: request.authorityArtifactIds,
      requiredArtifactIds: request.requiredArtifactIds,
      optionalArtifactIds: request.optionalArtifactIds,
      constraints: request.constraints,
      outputClass: request.outputClass,
    }),
    registryFingerprint,
    storeFingerprint,
    canonicalRevisionCount: getCanonicalKnowledgeRevisions(store).length,
    derivedRevisionCount: getDerivedKnowledgeRevisions(store).length,
    revisionCount: store.revisions.length,
    authorityArtifactIds: request.authorityArtifactIds,
    requiredArtifactIds: request.requiredArtifactIds,
    optionalArtifactIds: request.optionalArtifactIds,
    constraints: request.constraints,
  });
}

