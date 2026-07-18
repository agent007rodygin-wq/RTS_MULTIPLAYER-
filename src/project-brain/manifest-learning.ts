import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import { fnv1a32 } from './generation-hash.ts';
import type { ManifestEntry } from './manifest-core.ts';
import type { Investigation } from './manifest-investigation.ts';
import { validateManifestEntry } from './manifest-validation.ts';
import type { ManifestValidationReport, ManifestValidationRuleResult } from './manifest-validation.ts';
import type { ManifestDiagnosticEvent } from './manifest-diagnostics.ts';

export interface LearningPattern {
  patternId: string;
  investigationId: string;
  rootCauseId: string;
  resolutionId: string;
  problemStatement: string;
  failedHypothesisIds: readonly string[];
  affectedArtifacts: readonly string[];
  affectedInvariants: readonly string[];
  outcome: string;
  frequency: number;
  lastObserved: number;
}

export interface LearningMemory {
  patterns: readonly LearningPattern[];
  patternCount: number;
  fingerprint: string;
  observedEntryFingerprints: readonly string[];
}

export interface SimilarInvestigation {
  investigationId: string;
  patternId: string;
  similarity: number;
  sharedRootCause: boolean;
  sharedResolution: boolean;
}

type LearningEligibility =
  | { eligible: true; pattern: LearningPattern }
  | { eligible: false; reason: string };

export type LearningResult =
  | {
      readonly success: true;
      readonly memory: LearningMemory;
    }
  | {
      readonly success: false;
      readonly error: string;
      readonly diagnostics: readonly ManifestDiagnosticEvent[];
    };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Learning ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Learning ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function normalizeNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Learning ${fieldName} must be a finite number.`);
  }
  return value;
}

const ELIGIBLE_LIFECYCLES: readonly string[] = ['RESOLVED', 'ARCHIVED', 'SUPERSEDED'];

function computePatternId(investigation: Investigation): string {
  const patternInput = {
    rootCauseId: investigation.confirmedRootCause?.rootCauseId ?? '',
    resolutionId: investigation.finalResolution?.resolutionId ?? '',
    problemStatement: investigation.problemStatement,
    failedHypothesisIds: [...investigation.failedHypotheses].sort(),
    affectedArtifacts: [...investigation.affectedArtifacts].sort(),
  };
  return fnv1a32(stableStringify(patternInput));
}

function computePatternSemanticProjection(investigation: Investigation): string {
  return stableStringify({
    rootCauseId: investigation.confirmedRootCause?.rootCauseId ?? '',
    resolutionId: investigation.finalResolution?.resolutionId ?? '',
    problemStatement: investigation.problemStatement,
    failedHypothesisIds: [...investigation.failedHypotheses].sort(),
    affectedArtifacts: [...investigation.affectedArtifacts].sort(),
    affectedInvariants: [...investigation.affectedInvariants].sort(),
    outcome: investigation.finalResolution
      ? `Resolved via ${investigation.finalResolution.chosenApproach}: ${investigation.finalResolution.expectedOutcome}`
      : 'No resolution recorded',
  });
}

function buildPatternFromInvestigation(investigation: Investigation): LearningPattern {
  const rc = investigation.confirmedRootCause;
  const res = investigation.finalResolution;

  const patternId = computePatternId(investigation);
  const outcome = res
    ? `Resolved via ${res.chosenApproach}: ${res.expectedOutcome}`
    : 'No resolution recorded';

  return deepFreeze({
    patternId,
    investigationId: investigation.identity.investigationId,
    rootCauseId: rc?.rootCauseId ?? '',
    resolutionId: res?.resolutionId ?? '',
    problemStatement: investigation.problemStatement,
    failedHypothesisIds: deepFreeze([...investigation.failedHypotheses].sort()),
    affectedArtifacts: deepFreeze([...investigation.affectedArtifacts].sort()),
    affectedInvariants: deepFreeze([...investigation.affectedInvariants].sort()),
    outcome,
    frequency: 1,
    lastObserved: investigation.updatedAt,
  });
}

function isEligibleLifecycle(state: string): boolean {
  return ELIGIBLE_LIFECYCLES.includes(state);
}

function checkInvestigationEligibility(investigation: Investigation): LearningEligibility {
  if (!isPlainObject(investigation)) {
    return { eligible: false, reason: 'Investigation must be a plain object.' };
  }

  const state = investigation.lifecycleState;
  if (!isEligibleLifecycle(state)) {
    return { eligible: false, reason: `Investigation lifecycle ${state} is not eligible for learning. Must be ${ELIGIBLE_LIFECYCLES.join(', ')}.` };
  }

  if (!investigation.confirmedRootCause) {
    return { eligible: false, reason: 'Investigation has no confirmed root cause.' };
  }

  if (!investigation.finalResolution) {
    return { eligible: false, reason: 'Investigation has no final resolution.' };
  }

  return { eligible: true, pattern: buildPatternFromInvestigation(investigation) };
}

function computeMemoryFingerprint(
  patterns: readonly LearningPattern[],
  observedEntryFingerprints: readonly string[],
): string {
  const sortedPatterns = [...patterns].sort((a, b) => a.patternId.localeCompare(b.patternId));
  const input = {
    patterns: sortedPatterns.map((p) => ({
      patternId: p.patternId,
      investigationId: p.investigationId,
      rootCauseId: p.rootCauseId,
      resolutionId: p.resolutionId,
      problemStatement: p.problemStatement,
      failedHypothesisIds: [...p.failedHypothesisIds].sort(),
      affectedArtifacts: [...p.affectedArtifacts].sort(),
      affectedInvariants: [...p.affectedInvariants].sort(),
      outcome: p.outcome,
      frequency: p.frequency,
      lastObserved: p.lastObserved,
    })),
    observedEntryFingerprints: [...observedEntryFingerprints].sort(),
  };
  return fnv1a32(stableStringify(input));
}

function collectValidationDiagnostics(report: ManifestValidationReport): ManifestDiagnosticEvent[] {
  return report.executedRules.map((r: ManifestValidationRuleResult, i: number) =>
    deepFreeze({
      index: i + 1,
      stage: 'validation' as const,
      severity: r.severity === 'ERROR' ? 'ERROR' as const : 'WARN' as const,
      code: r.code,
      message: r.message,
      manifestArtifactId: report.manifestArtifactId,
      manifestRevision: report.manifestRevision,
      entryId: r.entryId,
    }),
  );
}

function buildErrorDiagnostics(message: string): ManifestDiagnosticEvent[] {
  return deepFreeze([
    deepFreeze({
      index: 1,
      stage: 'validation' as const,
      severity: 'ERROR' as const,
      code: 'MANIFEST_VALIDATION_BLOCKED',
      message,
      manifestArtifactId: 'manifest-learning',
      manifestRevision: '0',
    }),
  ]);
}

export function buildLearningMemory(input: {
  entries: readonly ManifestEntry[];
  previousMemory?: LearningMemory;
}): LearningResult {
  if (!isPlainObject(input)) {
    return { success: false, error: 'Learning memory input must be a plain object.', diagnostics: deepFreeze([]) };
  }

  if (!Array.isArray(input.entries)) {
    return { success: false, error: 'Learning memory entries must be an array.', diagnostics: deepFreeze([]) };
  }

  const existingPatterns: readonly LearningPattern[] = input.previousMemory?.patterns ?? deepFreeze([]);
  const previouslyObserved: readonly string[] = input.previousMemory?.observedEntryFingerprints ?? deepFreeze([]);
  const observedSet = new Set(previouslyObserved);
  const batchFingerprints = new Set<string>();

  // Phase 1 validation gate
  const entries: ManifestEntry[] = [];
  for (let i = 0; i < input.entries.length; i++) {
    const entry = input.entries[i];
    if (!isPlainObject(entry)) {
      return { success: false, error: `Entry ${i} must be a plain object.`, diagnostics: deepFreeze([]) };
    }
    const me = entry as unknown as ManifestEntry;
    const report = validateManifestEntry(me);
    if (report.overallDecision === 'BLOCKED') {
      return {
        success: false,
        error: `Entry ${i} blocked by validation: ${report.errorCount} error(s).`,
        diagnostics: collectValidationDiagnostics(report),
      };
    }
    entries.push(me);
  }

  // Extract candidates from eligible entries with entry fingerprints for dedup
  const candidates: Array<{ pattern: LearningPattern; fingerprint: string }> = [];
  for (const entry of entries) {
    const eligibility = checkInvestigationEligibility(entry.investigation);
    if (eligibility.eligible) {
      candidates.push({ pattern: eligibility.pattern, fingerprint: entry.fingerprint ?? '' });
    }
  }

  // Check for collisions among candidates (same patternId, different semantics)
  const candidateGroupMap = new Map<string, Investigation[]>();
  for (const entry of entries) {
    const eligResult = checkInvestigationEligibility(entry.investigation);
    if (!eligResult.eligible) continue;
    const group = candidateGroupMap.get(eligResult.pattern.patternId);
    if (group) {
      group.push(entry.investigation);
    } else {
      candidateGroupMap.set(eligResult.pattern.patternId, [entry.investigation]);
    }
  }

  for (const [patternId, group] of candidateGroupMap) {
    if (group.length <= 1) continue;
    const baseline = computePatternSemanticProjection(group[0]);
    for (let i = 1; i < group.length; i++) {
      if (computePatternSemanticProjection(group[i]) !== baseline) {
        return {
          success: false,
          error: `Semantic collision detected for patternId ${patternId}. Entry investigations have different semantic content.`,
          diagnostics: buildErrorDiagnostics(
            `Semantic collision for patternId ${patternId}: entries share patternId but have different root cause, resolution, or other semantic fields.`,
          ),
        };
      }
    }
  }

  // Check collisions between candidates and existingPatterns
  for (const { pattern: candidate } of candidates) {
    const existingMatch = existingPatterns.find((p) => p.patternId === candidate.patternId);
    if (!existingMatch) continue;

    const candidateInv = entries
      .map((e) => e.investigation)
      .find((inv) => computePatternId(inv) === candidate.patternId);
    if (!candidateInv) continue;

    const existingProjection = stableStringify({
      rootCauseId: existingMatch.rootCauseId,
      resolutionId: existingMatch.resolutionId,
      problemStatement: existingMatch.problemStatement,
      failedHypothesisIds: [...existingMatch.failedHypothesisIds].sort(),
      affectedArtifacts: [...existingMatch.affectedArtifacts].sort(),
      affectedInvariants: [...existingMatch.affectedInvariants].sort(),
      outcome: existingMatch.outcome,
    });

    const candidateProjection = computePatternSemanticProjection(candidateInv);
    if (existingProjection !== candidateProjection) {
      return {
        success: false,
        error: `Semantic collision detected for patternId ${candidate.patternId}: existing pattern conflicts with new candidate.`,
        diagnostics: buildErrorDiagnostics(
          `Semantic collision for patternId ${candidate.patternId} between existing memory and new entry.`,
        ),
      };
    }
  }

  // Merge: build combined map patternId → { frequency, lastObserved, semantic }
  const merged = new Map<string, {
    semantic: LearningPattern;
    frequency: number;
    lastObserved: number;
    seenCandidate: boolean;
  }>();

  // Start with existing patterns
  for (const p of existingPatterns) {
    merged.set(p.patternId, {
      semantic: p,
      frequency: p.frequency,
      lastObserved: p.lastObserved,
      seenCandidate: false,
    });
  }

  // Add/merge candidates, deduplicating by entry fingerprint
  for (const { pattern: candidate, fingerprint: fp } of candidates) {
    if (observedSet.has(fp) || batchFingerprints.has(fp)) continue;
    batchFingerprints.add(fp);

    const entry = merged.get(candidate.patternId);
    if (entry) {
      entry.frequency += 1;
      entry.lastObserved = Math.max(entry.lastObserved, candidate.lastObserved);
      entry.seenCandidate = true;
    } else {
      merged.set(candidate.patternId, {
        semantic: candidate,
        frequency: 1,
        lastObserved: candidate.lastObserved,
        seenCandidate: true,
      });
    }
  }

  // Build combined observed fingerprints (previous + new)
  const allObserved = new Set(previouslyObserved);
  for (const fp of batchFingerprints) {
    allObserved.add(fp);
  }
  const sortedObserved = deepFreeze(Array.from(allObserved).sort());

  const patterns = deepFreeze(
    [...merged.values()]
      .map((entry) => deepFreeze({
        ...entry.semantic,
        frequency: entry.frequency,
        lastObserved: entry.lastObserved,
      }))
      .sort((a, b) => a.patternId.localeCompare(b.patternId)),
  );

  const fingerprint = computeMemoryFingerprint(patterns, sortedObserved);

  return {
    success: true,
    memory: deepFreeze({
      patterns,
      patternCount: patterns.length,
      fingerprint,
      observedEntryFingerprints: sortedObserved,
    }),
  };
}

function tokenize(text: string): readonly string[] {
  return deepFreeze(
    text
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .filter((t) => t.length > 2),
  );
}

function computeTextSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const tokensA = tokenize(a);
  const tokensB = tokenize(b);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setB = new Set(tokensB);
  const intersection = tokensA.filter((t) => setB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;

  return intersection / union;
}

function normalizeSimilarityScore(value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Similarity score must be a finite number.');
  }
  if (value < 0 || value > 1) {
    throw new Error('Similarity score must be between 0 and 1 inclusive.');
  }
  return value;
}

// Root cause identity match contributes a similarity score of 0.9
const ROOT_CAUSE_SIMILARITY_BOOST = 0.9;
// Resolution identity match contributes a similarity score of 0.85
const RESOLUTION_SIMILARITY_BOOST = 0.85;

export function findSimilarInvestigations(
  memory: LearningMemory,
  query: {
    problemStatement: string;
    rootCauseId?: string;
    resolutionId?: string;
    minSimilarity?: number;
  },
): readonly SimilarInvestigation[] {
  if (!isPlainObject(memory)) {
    throw new Error('Learning memory must be a plain object.');
  }
  if (!isPlainObject(query)) {
    throw new Error('Similarity query must be a plain object.');
  }

  const minSimilarity = query.minSimilarity ?? 0;
  normalizeSimilarityScore(minSimilarity);

  const results: SimilarInvestigation[] = [];

  for (const pattern of memory.patterns) {
    let maxSimilarity = computeTextSimilarity(query.problemStatement, pattern.problemStatement);

    if (query.rootCauseId && pattern.rootCauseId === query.rootCauseId) {
      maxSimilarity = Math.max(maxSimilarity, ROOT_CAUSE_SIMILARITY_BOOST);
    }

    if (query.resolutionId && pattern.resolutionId === query.resolutionId) {
      maxSimilarity = Math.max(maxSimilarity, RESOLUTION_SIMILARITY_BOOST);
    }

    const sharedRootCause = query.rootCauseId === pattern.rootCauseId && query.rootCauseId !== undefined;
    const sharedResolution = query.resolutionId === pattern.resolutionId && query.resolutionId !== undefined;

    if (maxSimilarity >= minSimilarity) {
      results.push(
        deepFreeze({
          investigationId: pattern.investigationId,
          patternId: pattern.patternId,
          similarity: maxSimilarity,
          sharedRootCause,
          sharedResolution,
        }),
      );
    }
  }

  return deepFreeze(
    results.sort((a, b) => {
      if (b.similarity !== a.similarity) return b.similarity - a.similarity;
      return a.investigationId.localeCompare(b.investigationId);
    }),
  );
}
