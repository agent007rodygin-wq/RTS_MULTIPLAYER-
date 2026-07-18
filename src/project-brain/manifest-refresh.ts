import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import { fnv1a32 } from './generation-hash.ts';
import type { ManifestIdentity, ManifestEntry, ManifestSnapshot, ManifestMetadata } from './manifest-core.ts';
import { buildManifestSnapshot, computeManifestFingerprint, createManifestEntry } from './manifest-core.ts';
import { validateManifestEntry, validateManifestSnapshot } from './manifest-validation.ts';
import type { ManifestValidationReport } from './manifest-validation.ts';
import type { ManifestDiagnosticEvent } from './manifest-diagnostics.ts';
import { buildManifestDiagnostics } from './manifest-diagnostics.ts';
import { serializeManifestSnapshot } from './manifest-serialization.ts';
import { buildLearningMemory } from './manifest-learning.ts';
import type { LearningMemory } from './manifest-learning.ts';

export type ManifestRefreshType = 'UNCHANGED' | 'CHANGED' | 'BLOCKED';

export interface ManifestRefreshInput {
  identity: ManifestIdentity;
  entries: readonly ManifestEntry[];
  metadata: ManifestMetadata;
  previousSnapshot?: ManifestSnapshot;
  previousMemory?: LearningMemory;
}

export interface ManifestRefreshResult {
  type: ManifestRefreshType;
  diagnostics: readonly ManifestDiagnosticEvent[];
  previousSnapshot?: ManifestSnapshot;
  nextSnapshot?: ManifestSnapshot;
  memory?: LearningMemory;
  serialized?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildBlockedResult(event: ManifestDiagnosticEvent): ManifestRefreshResult {
  return deepFreeze({
    type: 'BLOCKED' as const,
    diagnostics: deepFreeze([event]),
  });
}

function buildSingleDiagnostic(
  stage: string,
  severity: 'INFO' | 'WARN' | 'ERROR',
  code: string,
  message: string,
  artifactId: string,
  revision: string,
): ManifestDiagnosticEvent {
  return deepFreeze({
    index: 1,
    stage: stage as ManifestDiagnosticEvent['stage'],
    severity,
    code,
    message,
    manifestArtifactId: artifactId,
    manifestRevision: revision,
  });
}

function appendDiagnostic(
  events: ManifestDiagnosticEvent[],
  stage: string,
  severity: 'INFO' | 'WARN' | 'ERROR',
  code: string,
  message: string,
  artifactId: string,
  revision: string,
): void {
  events.push(deepFreeze({
    index: events.length + 1,
    stage: stage as ManifestDiagnosticEvent['stage'],
    severity,
    code,
    message,
    manifestArtifactId: artifactId,
    manifestRevision: revision,
  }));
}

function entryIdentityKey(entry: ManifestEntry): string {
  const id = entry.investigation?.identity;
  return id ? `${id.manifestArtifactId}::${id.manifestRevision}` : '';
}

function buildPreservedHypotheses(
  prevEntry: ManifestEntry,
  candidateEntry: ManifestEntry,
): readonly string[] {
  const prevFailed = prevEntry.investigation.failedHypotheses;
  const newFailed = candidateEntry.investigation.failedHypotheses;
  const merged = new Set([...prevFailed, ...newFailed]);
  const sorted = Array.from(merged).sort();
  return deepFreeze(sorted);
}

function detectHypothesisConflict(
  prevEntry: ManifestEntry,
  candidateEntry: ManifestEntry,
): string | null {
  const prevHypotheses = prevEntry.investigation.hypotheses;
  const candidateHypotheses = candidateEntry.investigation.hypotheses;
  if (!prevHypotheses || prevHypotheses.length === 0) return null;
  if (!candidateHypotheses || candidateHypotheses.length === 0) return null;

  const prevMap = new Map(prevHypotheses.map((h) => [h.hypothesisId, h]));
  for (const ch of candidateHypotheses) {
    const ph = prevMap.get(ch.hypothesisId);
    if (!ph) continue;
    if (ph.description !== ch.description) {
      return `Hypothesis ${ch.hypothesisId} has conflicting content between previous and next state.`;
    }
  }
  return null;
}

function validateCandidateLifecycle(
  prevEntry: ManifestEntry,
  candidateEntry: ManifestEntry,
): string | null {
  const prevState = prevEntry.investigation.lifecycleState;
  const candidateState = candidateEntry.investigation.lifecycleState;
  if (prevState === candidateState) return null;

  if (prevState === 'SUPERSEDED') {
    return `Cannot transition from SUPERSEDED to ${candidateState}.`;
  }
  if (prevState === 'ARCHIVED') {
    return `Cannot transition from ARCHIVED to ${candidateState}.`;
  }
  return null;
}

function buildCandidateEntries(
  entries: readonly ManifestEntry[],
  previousSnapshot?: ManifestSnapshot,
): { entries: ManifestEntry[]; diagnostics: ManifestDiagnosticEvent[]; blocked: string | null } {
  const diagnostics: ManifestDiagnosticEvent[] = [];
  const artifactId = entries.length > 0
    ? (entries[0].investigation?.identity?.manifestArtifactId ?? 'unknown')
    : 'unknown';
  const revision = entries.length > 0
    ? (entries[0].investigation?.identity?.manifestRevision ?? 'unknown')
    : 'unknown';

  if (!previousSnapshot) {
    return { entries: [...entries], diagnostics: deepFreeze([]), blocked: null };
  }

  const prevMap = new Map<string, ManifestEntry>();
  for (const pe of previousSnapshot.entries) {
    const key = entryIdentityKey(pe);
    if (key) prevMap.set(key, pe);
  }

  const result: ManifestEntry[] = [];

  for (const candidateEntry of entries) {
    const key = entryIdentityKey(candidateEntry);
    const prevEntry = key ? prevMap.get(key) : undefined;

    if (!prevEntry) {
      result.push(candidateEntry);
      continue;
    }

    const lifecycleError = validateCandidateLifecycle(prevEntry, candidateEntry);
    if (lifecycleError) {
      return {
        entries: [],
        diagnostics: deepFreeze([buildSingleDiagnostic(
          'HISTORY_PRESERVATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
          lifecycleError,
          artifactId, revision,
        )]),
        blocked: lifecycleError,
      };
    }

    const conflict = detectHypothesisConflict(prevEntry, candidateEntry);
    if (conflict) {
      return {
        entries: [],
        diagnostics: deepFreeze([buildSingleDiagnostic(
          'HISTORY_PRESERVATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
          conflict,
          artifactId, revision,
        )]),
        blocked: conflict,
      };
    }

    const preservedFailed = buildPreservedHypotheses(prevEntry, candidateEntry);
    const mergedInvestigation = deepFreeze({
      ...candidateEntry.investigation,
      failedHypotheses: preservedFailed,
    });

    const newEntry = createManifestEntry({
      entryType: candidateEntry.entryType,
      investigation: mergedInvestigation,
      diagnostics: candidateEntry.diagnostics,
    });

    result.push(newEntry);
  }

  return { entries: result, diagnostics: deepFreeze(diagnostics), blocked: null };
}

export function detectManifestChanges(
  previous: ManifestSnapshot,
  next: ManifestSnapshot,
): ManifestRefreshType {
  if (!isPlainObject(previous) || !isPlainObject(next)) {
    throw new Error('Both previous and next must be plain objects.');
  }
  if (previous.fingerprint === next.fingerprint) return 'UNCHANGED';
  return 'CHANGED';
}

export function refreshManifestFromMirror(input: ManifestRefreshInput): ManifestRefreshResult {
  if (!isPlainObject(input)) {
    return buildBlockedResult(buildSingleDiagnostic(
      'PREVIOUS_STATE_VALIDATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
      'Refresh input must be a plain object.',
      'unknown', 'unknown',
    ));
  }

  const identity = input.identity;
  const entries = input.entries;
  const metadata = input.metadata;
  const previousSnapshot = input.previousSnapshot;
  const previousMemory = input.previousMemory;
  const artifactId = identity.manifestArtifactId;
  const revision = identity.manifestRevision;

  // Stage 1: Validate previous state
  if (previousSnapshot) {
    if (!isPlainObject(previousSnapshot)) {
      return buildBlockedResult(buildSingleDiagnostic(
        'PREVIOUS_STATE_VALIDATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
        'Previous snapshot must be a plain object.',
        artifactId, revision,
      ));
    }
  }

  if (!Array.isArray(entries) || entries.length === 0) {
    return buildBlockedResult(buildSingleDiagnostic(
      'SOURCE_VALIDATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
      'Source entries must be a non-empty array.',
      artifactId, revision,
    ));
  }

  if (!isPlainObject(metadata)) {
    return buildBlockedResult(buildSingleDiagnostic(
      'SOURCE_VALIDATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
      'Metadata must be a plain object.',
      artifactId, revision,
    ));
  }

  // Stage 2: Validate source entries
  const allDiagnostics: ManifestDiagnosticEvent[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!isPlainObject(entry)) {
      return buildBlockedResult(buildSingleDiagnostic(
        'SOURCE_VALIDATION', 'ERROR', 'MANIFEST_VALIDATION_BLOCKED',
        `Entry ${i} must be a plain object.`,
        artifactId, revision,
      ));
    }
    const report = validateManifestEntry(entry as unknown as ManifestEntry);
    if (report.overallDecision === 'BLOCKED') {
      for (const rule of report.executedRules) {
        allDiagnostics.push(deepFreeze({
          index: allDiagnostics.length + 1,
          stage: 'validation',
          severity: 'ERROR',
          code: rule.code,
          message: rule.message,
          manifestArtifactId: artifactId,
          manifestRevision: revision,
          entryId: rule.entryId,
        }));
      }
      return deepFreeze({
        type: 'BLOCKED',
        diagnostics: deepFreeze([...allDiagnostics]),
      });
    }
  }

  // Stage 3: Preserve historical state (failed hypotheses)
  const { entries: preservedEntries, diagnostics: preservationDiagnostics, blocked: preservationError } = buildCandidateEntries(
    entries as ManifestEntry[],
    previousSnapshot,
  );
  if (preservationError) {
    for (const d of preservationDiagnostics) {
      allDiagnostics.push(deepFreeze({
        index: allDiagnostics.length + 1,
        stage: 'validation',
        severity: 'ERROR',
        code: d.code,
        message: d.message,
        manifestArtifactId: artifactId,
        manifestRevision: revision,
      }));
    }
    return deepFreeze({
      type: 'BLOCKED',
      diagnostics: deepFreeze([...allDiagnostics]),
    });
  }

  for (const d of preservationDiagnostics) {
    allDiagnostics.push(deepFreeze({
      index: allDiagnostics.length + 1,
      stage: 'validation',
      severity: 'INFO',
      code: d.code,
      message: d.message,
      manifestArtifactId: artifactId,
      manifestRevision: revision,
    }));
  }
  appendDiagnostic(allDiagnostics, 'HISTORY_PRESERVATION', 'INFO',
    'MANIFEST_HYPOTHESES_PRESERVED',
    'Failed hypotheses preserved from previous state.',
    artifactId, revision,
  );

  // Stage 4: Build candidate snapshot
  let nextSnapshot: ManifestSnapshot;
  try {
    nextSnapshot = buildManifestSnapshot({
      identity,
      entries: preservedEntries,
      metadata,
    });
  } catch (e) {
    return deepFreeze({
      type: 'BLOCKED',
      diagnostics: deepFreeze([...allDiagnostics]),
    });
  }

  appendDiagnostic(allDiagnostics, 'SNAPSHOT_BUILD', 'INFO',
    'MANIFEST_IDENTITY_ASSIGNED',
    'Candidate snapshot built.',
    artifactId, revision,
  );

  // Stage 5: Validate candidate snapshot
  const snapValidation = validateManifestSnapshot(nextSnapshot.entries);
  if (snapValidation.overallDecision === 'BLOCKED') {
    for (const rule of snapValidation.executedRules) {
      allDiagnostics.push(deepFreeze({
        index: allDiagnostics.length + 1,
        stage: 'validation',
        severity: 'ERROR',
        code: rule.code,
        message: rule.message,
        manifestArtifactId: artifactId,
        manifestRevision: revision,
        entryId: rule.entryId,
      }));
    }
    return deepFreeze({
      type: 'BLOCKED',
      diagnostics: deepFreeze([...allDiagnostics]),
    });
  }

  appendDiagnostic(allDiagnostics, 'SNAPSHOT_VALIDATION', 'INFO',
    'MANIFEST_VALIDATION_PASSED',
    'Candidate snapshot validated.',
    artifactId, revision,
  );

  // Stage 6: Detect changes
  let refreshType: ManifestRefreshType = 'CHANGED';
  if (previousSnapshot) {
    refreshType = detectManifestChanges(previousSnapshot, nextSnapshot);
  }

  appendDiagnostic(allDiagnostics, 'CHANGE_DETECTION', refreshType === 'UNCHANGED' ? 'INFO' : 'WARN',
    refreshType === 'UNCHANGED' ? 'MANIFEST_IDENTITY_ASSIGNED' : 'MANIFEST_VALIDATION_BLOCKED',
    refreshType === 'UNCHANGED' ? 'No changes detected.' : 'Manifest changed.',
    artifactId, revision,
  );

  // Stage 7: Update learning memory
  let memory: LearningMemory | undefined;
  if (refreshType === 'UNCHANGED' && previousMemory) {
    memory = previousMemory;
  } else if (refreshType === 'CHANGED') {
    const learningResult = buildLearningMemory({
      entries: nextSnapshot.entries as ManifestEntry[],
      previousMemory,
    });

    if (!learningResult.success && 'diagnostics' in learningResult) {
      for (const d of learningResult.diagnostics) {
        allDiagnostics.push(deepFreeze({
          index: allDiagnostics.length + 1,
          stage: 'validation',
          severity: 'ERROR',
          code: d.code,
          message: d.message,
          manifestArtifactId: artifactId,
          manifestRevision: revision,
          entryId: d.entryId,
        }));
      }
      return deepFreeze({
        type: 'BLOCKED',
        diagnostics: deepFreeze([...allDiagnostics]),
      });
    }

    memory = learningResult.memory;

    appendDiagnostic(allDiagnostics, 'LEARNING_UPDATE', 'INFO',
      'MANIFEST_IDENTITY_ASSIGNED',
      'Learning memory updated.',
      artifactId, revision,
    );
  }

  // Stage 8: Serialize
  let serialized: string | undefined;
  try {
    serialized = serializeManifestSnapshot(nextSnapshot);
  } catch (e) {
    return deepFreeze({
      type: 'BLOCKED',
      diagnostics: deepFreeze([...allDiagnostics]),
    });
  }

  appendDiagnostic(allDiagnostics, 'SERIALIZATION', 'INFO',
    'MANIFEST_SERIALIZED',
    'Manifest serialized.',
    artifactId, revision,
  );

  return deepFreeze({
    type: refreshType,
    diagnostics: deepFreeze([...allDiagnostics]),
    previousSnapshot: previousSnapshot ? deepFreeze(structuredClone(previousSnapshot)) : undefined,
    nextSnapshot,
    memory,
    serialized,
  });
}
