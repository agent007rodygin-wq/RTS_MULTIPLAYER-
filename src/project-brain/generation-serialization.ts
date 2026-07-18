import { readFile } from 'node:fs/promises';
import { stableStringify } from './knowledge-artifact.ts';
import type { BrainEngineResult } from './brain-response.ts';
import type { ContextPackageResult } from './context-item.ts';
import { computeGenerationRequestFingerprint, validateGenerationRequestEnvelope } from './generation-validation.ts';
import { freezeGenerationResultEnvelope, type GenerationResultEnvelope } from './generation-result.ts';

export interface GenerationLoadContext {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
}

export interface GenerationSerialization {
  serialized: string;
  generationFingerprint: string;
}

type GenerationSerializableEnvelope = Omit<GenerationResultEnvelope, 'serialized'>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSerializableEnvelope(
  envelope: GenerationResultEnvelope,
  generationFingerprint = envelope.request.metadata.generationFingerprint,
): GenerationSerializableEnvelope {
  return {
    schemaVersion: envelope.schemaVersion,
    status: envelope.status,
    blockedReason: envelope.blockedReason,
    request: {
      ...envelope.request,
      metadata: {
        ...envelope.request.metadata,
        generationFingerprint,
      },
    },
    validationFailures: envelope.validationFailures,
    warnings: envelope.warnings,
    diagnostics: envelope.diagnostics,
  };
}

export function buildGenerationRequestSerialization(
  envelope: GenerationResultEnvelope,
): GenerationSerialization {
  const generationFingerprint = computeGenerationRequestFingerprint(envelope.request);
  const serializable = toSerializableEnvelope({
    ...envelope,
    request: {
      ...envelope.request,
      metadata: {
        ...envelope.request.metadata,
        generationFingerprint,
      },
    },
  }, generationFingerprint);
  const serialized = `${stableStringify(serializable)}\n`;

  return {
    serialized,
    generationFingerprint,
  };
}

export function serializeGenerationRequest(
  envelope: GenerationResultEnvelope,
): string {
  return buildGenerationRequestSerialization(envelope).serialized;
}

function parseGenerationRequest(serialized: string | GenerationSerializableEnvelope): GenerationSerializableEnvelope {
  if (typeof serialized === 'string') {
    const parsed = JSON.parse(serialized) as unknown;
    if (!isPlainObject(parsed)) {
      throw new Error('Serialized generation request must be a JSON object.');
    }
    return parsed as GenerationSerializableEnvelope;
  }

  return serialized;
}

export function loadGenerationRequest(
  serialized: string | GenerationSerializableEnvelope,
  context: GenerationLoadContext,
): GenerationResultEnvelope {
  const parsed = parseGenerationRequest(serialized);
  const validation = validateGenerationRequestEnvelope(parsed, context);
  if (!validation.valid) {
    const message = validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid generation request: ${message}`);
  }

  const envelope = freezeGenerationResultEnvelope({
    ...parsed,
    blockedReason: parsed.blockedReason,
    serialized: typeof serialized === 'string' ? serialized : serializeGenerationRequest(parsed as GenerationResultEnvelope),
  } as GenerationResultEnvelope);

  return envelope;
}

export async function loadGenerationRequestFromFile(
  filePath: string,
  context: GenerationLoadContext,
): Promise<GenerationResultEnvelope> {
  const serialized = await readFile(filePath, 'utf8');
  return loadGenerationRequest(serialized, context);
}
