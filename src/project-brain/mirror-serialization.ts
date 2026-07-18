import { stableStringify } from './knowledge-artifact.ts';
import { createMirrorSnapshot } from './mirror-core.ts';
import type {
  MirrorSnapshot,
  MirrorSnapshotInput,
} from './mirror-core.ts';
import { validateMirrorSnapshot, type MirrorValidationReport } from './mirror-validation.ts';
import type { CanonicalRegistry } from './canonical-registry.ts';
import { readFile } from 'node:fs/promises';

export interface MirrorSerialization {
  serialized: string;
  fingerprint: string;
}

export function serializeMirrorSnapshot(snapshot: MirrorSnapshot): string {
  return `${stableStringify({
    identity: snapshot.identity,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
    freshnessState: snapshot.freshnessState,
    nodeCount: snapshot.nodeCount,
    edgeCount: snapshot.edgeCount,
    fingerprint: snapshot.fingerprint,
  })}\n`;
}

export function buildMirrorSerialization(snapshot: MirrorSnapshot): MirrorSerialization {
  const serialized = serializeMirrorSnapshot(snapshot);
  return {
    serialized,
    fingerprint: snapshot.fingerprint,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function parseMirrorSnapshot(serialized: string | Record<string, unknown>): MirrorSnapshotInput {
  if (typeof serialized === 'string') {
    const parsed = JSON.parse(serialized);
    if (!isPlainObject(parsed)) {
      throw new Error('Serialized mirror snapshot must be a JSON object.');
    }
    return parsed as unknown as MirrorSnapshotInput;
  }

  return serialized as unknown as MirrorSnapshotInput;
}

export function loadMirrorSnapshot(
  serialized: string | Record<string, unknown>,
): MirrorSnapshot {
  const parsed = parseMirrorSnapshot(serialized);
  return createMirrorSnapshot(parsed);
}

export function loadAndValidateMirrorSnapshot(
  serialized: string | Record<string, unknown>,
  registry?: CanonicalRegistry,
): {
  snapshot: MirrorSnapshot;
  validation: MirrorValidationReport;
} {
  const parsed = parseMirrorSnapshot(serialized);
  const snapshot = createMirrorSnapshot(parsed);
  const validation = validateMirrorSnapshot(snapshot, registry);
  return {
    snapshot,
    validation,
  };
}

export async function loadMirrorSnapshotFromFile(
  filePath: string,
): Promise<MirrorSnapshot> {
  const serialized = await readFile(filePath, 'utf8');
  return loadMirrorSnapshot(serialized);
}

export async function loadAndValidateMirrorSnapshotFromFile(
  filePath: string,
  registry?: CanonicalRegistry,
): Promise<{
  snapshot: MirrorSnapshot;
  validation: MirrorValidationReport;
}> {
  const serialized = await readFile(filePath, 'utf8');
  return loadAndValidateMirrorSnapshot(serialized, registry);
}
