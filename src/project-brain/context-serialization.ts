import { readFile } from 'node:fs/promises';
import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { ContextPackageBuildRequest } from './context-request.ts';
import { createContextPackageBuildRequest } from './context-request.ts';
import type {
  ContextDiagnosticEvent,
  ContextPackageIssue,
  ContextPackageMetadata,
  ContextPackageItem,
  ContextPackageResult,
  ContextPackageTraceabilityLink,
  ContextPackageWarning,
  ContextPackageValidationFailure,
} from './context-item.ts';
import {
  buildContextPackageMetadata,
  freezeContextPackageResult,
  sortContextDiagnosticEvents,
  sortContextPackageIssues,
  sortContextPackageTraceabilityLinks,
  sortContextPackageValidationFailures,
  sortContextPackageWarnings,
} from './context-package.ts';
import { validateContextPackageConsistency, validateContextPackageSerializedShape } from './context-validation.ts';

export interface ContextPackageLoadContext {
  request: ContextPackageBuildRequest;
}

export interface ContextPackageSerialization {
  serialized: string;
  packageFingerprint: string;
}

export interface ContextPackageSerializable {
  schemaVersion: string;
  status: 'READY' | 'BLOCKED';
  contextRequestId: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  metadata: ContextPackageMetadata;
  includedItems: readonly ContextPackageItem[];
  excludedItems: readonly ContextPackageIssue[];
  missingItems: readonly ContextPackageIssue[];
  staleItems: readonly ContextPackageIssue[];
  derivedItems: readonly ContextPackageItem[];
  ambiguousItems: readonly ContextPackageIssue[];
  authorityBlockedItems: readonly ContextPackageIssue[];
  invalidReferenceItems: readonly ContextPackageIssue[];
  supersededItems: readonly ContextPackageIssue[];
  blockedItems: readonly ContextPackageIssue[];
  warnings: readonly ContextPackageWarning[];
  validationFailures: readonly ContextPackageValidationFailure[];
  diagnostics: readonly ContextDiagnosticEvent[];
  traceabilityLinks: readonly ContextPackageTraceabilityLink[];
  packageFingerprint: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0;
  }

  return hash.toString(16).padStart(8, '0');
}

export function computeContextPackageFingerprint(serialized: string): string {
  return `CTX-${fnv1a32(serialized)}`;
}

function toSerializableContextPackageBody(
  result: ContextPackageResult,
  packageFingerprint = result.metadata.packageFingerprint,
): ContextPackageSerializable {
  return {
    schemaVersion: result.schemaVersion,
    status: result.status,
    contextRequestId: result.contextRequestId,
    sourceBrainSessionId: result.sourceBrainSessionId,
    sourceBrainResponseStatus: result.sourceBrainResponseStatus,
    metadata: {
      ...result.metadata,
      packageFingerprint,
    },
    includedItems: result.includedItems,
    excludedItems: sortContextPackageIssues(result.excludedItems),
    missingItems: sortContextPackageIssues(result.missingItems),
    staleItems: sortContextPackageIssues(result.staleItems),
    derivedItems: result.derivedItems,
    ambiguousItems: sortContextPackageIssues(result.ambiguousItems),
    authorityBlockedItems: sortContextPackageIssues(result.authorityBlockedItems),
    invalidReferenceItems: sortContextPackageIssues(result.invalidReferenceItems),
    supersededItems: sortContextPackageIssues(result.supersededItems),
    blockedItems: sortContextPackageIssues(result.blockedItems),
    warnings: sortContextPackageWarnings(result.warnings),
    validationFailures: sortContextPackageValidationFailures(result.validationFailures),
    diagnostics: sortContextDiagnosticEvents(result.diagnostics),
    traceabilityLinks: sortContextPackageTraceabilityLinks(result.traceabilityLinks),
    packageFingerprint,
  };
}

function toFingerprintComparableBody(result: ContextPackageResult): ContextPackageSerializable {
  return toSerializableContextPackageBody(
    {
      ...result,
      metadata: buildContextPackageMetadata({
        ...result.metadata,
        packageFingerprint: '',
        estimatedSerializedLength: 0,
      }),
    },
    '',
  );
}

export function buildContextPackageSerialization(
  result: ContextPackageResult,
): ContextPackageSerialization {
  const bodyWithoutFingerprint = toFingerprintComparableBody(result);
  const bodySerialized = `${stableStringify(bodyWithoutFingerprint)}\n`;
  const packageFingerprint = computeContextPackageFingerprint(bodySerialized);
  const finalBody = toSerializableContextPackageBody({
    ...result,
    metadata: buildContextPackageMetadata({
      ...result.metadata,
      packageFingerprint,
      estimatedSerializedLength: 0,
    }),
  });
  const serialized = `${stableStringify(finalBody)}\n`;

  return {
    serialized,
    packageFingerprint,
  };
}

export function serializeContextPackage(result: ContextPackageResult): string {
  return buildContextPackageSerialization(result).serialized;
}

function parseContextPackage(serialized: string | ContextPackageResult | ContextPackageSerializable): ContextPackageSerializable {
  if (typeof serialized === 'string') {
    const parsed = JSON.parse(serialized) as unknown;
    if (!isPlainObject(parsed)) {
      throw new Error('Serialized context package must be a JSON object.');
    }

    return parsed as unknown as ContextPackageSerializable;
  }

  return serialized as unknown as ContextPackageSerializable;
}

export function loadContextPackage(
  serialized: string | ContextPackageResult | ContextPackageSerializable,
  context: ContextPackageLoadContext,
): ContextPackageResult {
  const parsed = parseContextPackage(serialized);
  const shapeValidation = validateContextPackageSerializedShape(parsed);
  if (!shapeValidation.valid) {
    const message = shapeValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid serialized context package: ${message}`);
  }

  const buildRequest = createContextPackageBuildRequest(context.request);
  const bodyWithoutFingerprint = toFingerprintComparableBody(
    freezeContextPackageResult({
      schemaVersion: parsed.schemaVersion,
      status: parsed.status,
      contextRequestId: parsed.contextRequestId,
      sourceBrainSessionId: parsed.sourceBrainSessionId,
      sourceBrainResponseStatus: parsed.sourceBrainResponseStatus,
      metadata: buildContextPackageMetadata({
        ...parsed.metadata,
        packageFingerprint: '',
        estimatedSerializedLength: 0,
      }),
      includedItems: parsed.includedItems,
      excludedItems: parsed.excludedItems,
      missingItems: parsed.missingItems,
      staleItems: parsed.staleItems,
      derivedItems: parsed.derivedItems,
      ambiguousItems: parsed.ambiguousItems,
      authorityBlockedItems: parsed.authorityBlockedItems,
      invalidReferenceItems: parsed.invalidReferenceItems,
      supersededItems: parsed.supersededItems,
      blockedItems: parsed.blockedItems,
      warnings: parsed.warnings,
      validationFailures: parsed.validationFailures,
      diagnostics: parsed.diagnostics,
      traceabilityLinks: parsed.traceabilityLinks,
      serialized: '',
    }),
  );
  const expectedFingerprint = computeContextPackageFingerprint(`${stableStringify(bodyWithoutFingerprint)}\n`);
  if (parsed.packageFingerprint !== expectedFingerprint) {
    throw new Error(
      `Context package fingerprint mismatch: expected ${parsed.packageFingerprint}, found ${expectedFingerprint}.`,
    );
  }

  const packageResult = freezeContextPackageResult({
    schemaVersion: parsed.schemaVersion,
    status: parsed.status,
    contextRequestId: parsed.contextRequestId,
    sourceBrainSessionId: parsed.sourceBrainSessionId,
    sourceBrainResponseStatus: parsed.sourceBrainResponseStatus,
    metadata: buildContextPackageMetadata({
      ...parsed.metadata,
      packageFingerprint: parsed.packageFingerprint,
    }),
    includedItems: parsed.includedItems,
    excludedItems: parsed.excludedItems,
    missingItems: parsed.missingItems,
    staleItems: parsed.staleItems,
    derivedItems: parsed.derivedItems,
    ambiguousItems: parsed.ambiguousItems,
    authorityBlockedItems: parsed.authorityBlockedItems,
    invalidReferenceItems: parsed.invalidReferenceItems,
    supersededItems: parsed.supersededItems,
    blockedItems: parsed.blockedItems,
    warnings: parsed.warnings,
    validationFailures: parsed.validationFailures,
    diagnostics: parsed.diagnostics,
    traceabilityLinks: parsed.traceabilityLinks,
    serialized: typeof serialized === 'string' ? serialized : '',
  });

  const validation = validateContextPackageConsistency(packageResult, buildRequest);
  if (!validation.valid) {
    const message = validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid context package: ${message}`);
  }

  return deepFreeze({
    ...packageResult,
    serialized: typeof serialized === 'string' ? serialized : serializeContextPackage(packageResult),
  });
}

export async function loadContextPackageFromFile(
  filePath: string,
  context: ContextPackageLoadContext,
): Promise<ContextPackageResult> {
  const serialized = await readFile(filePath, 'utf8');
  return loadContextPackage(serialized, context);
}
