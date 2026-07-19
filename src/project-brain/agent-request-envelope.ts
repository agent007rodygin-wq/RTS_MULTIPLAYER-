import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainOutputClass } from './brain-request.ts';

const OUTPUT_CLASSES: readonly BrainOutputClass[] = [
  'analysis',
  'proposal',
  'plan',
  'trace',
];

const VALID_ENVELOPE_ID_PATTERN = /^ENVELOPE::.+$/;

export interface AgentRequestMetadataEntry {
  readonly key: string;
  readonly value: string;
}

export interface AgentRequestEnvelope {
  readonly envelopeId: string;
  readonly requestId: string;
  readonly taskId: string;
  readonly sessionId: string;
  readonly contextRequestId: string;
  readonly objective: string;
  readonly outputClass: BrainOutputClass;
  readonly constraints: readonly string[];
  readonly sourceRevision: string;
  readonly createdAt: number;
  readonly investigationRef?: string;
  readonly metadata: readonly AgentRequestMetadataEntry[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Agent envelope ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Agent envelope ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeTimestamp(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error('Agent envelope createdAt must be a positive finite number.');
  }
  return value;
}

function normalizeOutputClass(value: unknown): BrainOutputClass {
  if (typeof value === 'string' && OUTPUT_CLASSES.includes(value as BrainOutputClass)) {
    return value as BrainOutputClass;
  }
  throw new Error(
    `Agent envelope outputClass must be one of ${OUTPUT_CLASSES.join(', ')}.`,
  );
}

function normalizeConstraints(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error('Agent envelope constraints must be an array.');
  }
  const result: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw new Error(`Agent envelope constraints[${i}] must be a string.`);
    }
    const trimmed = value[i].trim();
    if (!trimmed) {
      throw new Error(`Agent envelope constraints[${i}] must be a non-empty string.`);
    }
    result.push(trimmed);
  }
  const deduped = Array.from(new Set(result));
  deduped.sort();
  return deduped;
}

function normalizeEnvelopeId(value: unknown): string {
  const id = normalizeText(value, 'envelopeId');
  if (!VALID_ENVELOPE_ID_PATTERN.test(id)) {
    throw new Error(
      `Agent envelope envelopeId must match pattern ENVELOPE::<requestId>::<timestamp>. Received: ${id}`,
    );
  }
  return id;
}

function normalizeMetadataEntries(value: unknown): readonly AgentRequestMetadataEntry[] {
  if (!Array.isArray(value)) {
    throw new Error('Agent envelope metadata must be an array.');
  }
  const entries: AgentRequestMetadataEntry[] = [];
  const seenKeys = new Set<string>();
  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (!isPlainObject(entry)) {
      throw new Error(`Agent envelope metadata[${i}] must be a plain object.`);
    }
    const key = normalizeText(entry.key, `metadata[${i}].key`);
    const val = normalizeText(entry.value, `metadata[${i}].value`);

    for (const providerName of ['openai', 'anthropic', 'gemini', 'claude']) {
      if (key.toLowerCase().includes(providerName)) {
        throw new Error(
          `Agent envelope metadata key '${key}' contains provider-specific reference '${providerName}'.`,
        );
      }
    }

    if (seenKeys.has(key)) {
      throw new Error(`Agent envelope metadata contains duplicate key '${key}'.`);
    }
    seenKeys.add(key);
    entries.push({ key, value: val });
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));
  return deepFreeze(entries);
}

export function createAgentRequestEnvelope(input: {
  envelopeId: unknown;
  requestId: unknown;
  taskId: unknown;
  sessionId: unknown;
  contextRequestId: unknown;
  objective: unknown;
  outputClass: unknown;
  constraints?: unknown;
  sourceRevision: unknown;
  createdAt: unknown;
  investigationRef?: unknown;
  metadata?: unknown;
}): AgentRequestEnvelope {
  if (!isPlainObject(input)) {
    throw new Error('Agent envelope input must be a plain object.');
  }
  return deepFreeze({
    envelopeId: normalizeEnvelopeId(input.envelopeId),
    requestId: normalizeText(input.requestId, 'requestId'),
    taskId: normalizeText(input.taskId, 'taskId'),
    sessionId: normalizeText(input.sessionId, 'sessionId'),
    contextRequestId: normalizeText(input.contextRequestId, 'contextRequestId'),
    objective: normalizeText(input.objective, 'objective'),
    outputClass: normalizeOutputClass(input.outputClass),
    constraints: normalizeConstraints(input.constraints ?? []),
    sourceRevision: normalizeText(input.sourceRevision, 'sourceRevision'),
    createdAt: normalizeTimestamp(input.createdAt),
    investigationRef: normalizeOptionalText(input.investigationRef),
    metadata: normalizeMetadataEntries(input.metadata ?? []),
  });
}
