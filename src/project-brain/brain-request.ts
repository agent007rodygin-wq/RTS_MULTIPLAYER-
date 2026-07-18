import { deepFreeze } from './knowledge-artifact.ts';
import { normalizeArtifactId } from './artifact-identity.ts';

export type BrainOutputClass = 'analysis' | 'proposal' | 'plan' | 'trace';

export interface BrainRequestInput {
  requestId?: unknown;
  taskId?: unknown;
  summary?: unknown;
  purpose?: unknown;
  authorityArtifactIds?: unknown;
  requiredArtifactIds?: unknown;
  optionalArtifactIds?: unknown;
  constraints?: unknown;
  outputClass?: unknown;
}

export interface BrainRequest {
  requestId: string;
  taskId: string;
  summary: string;
  purpose?: string;
  authorityArtifactIds: readonly string[];
  requiredArtifactIds: readonly string[];
  optionalArtifactIds: readonly string[];
  constraints: readonly string[];
  outputClass: BrainOutputClass;
}

export interface BrainRequestValidationIssue {
  code:
    | 'INVALID_REQUEST_SHAPE'
    | 'MISSING_REQUEST_FIELD'
    | 'INVALID_REQUEST_VALUE'
    | 'INVALID_ARTIFACT_ID';
  message: string;
  field?: string;
  artifactId?: string;
}

export interface BrainRequestValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly BrainRequestValidationIssue[];
}

const OUTPUT_CLASSES: readonly BrainOutputClass[] = [
  'analysis',
  'proposal',
  'plan',
  'trace',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Brain request field ${fieldName} must be a non-empty string.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`Brain request field ${fieldName} must be a non-empty string.`);
  }

  return normalized;
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeArtifactIdList(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Brain request field ${fieldName} must be an array.`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error(`Brain request field ${fieldName} must contain only strings.`);
    }
    return normalizeArtifactId(item);
  });

  const deduped = Array.from(new Set(normalized));
  deduped.sort();
  return deduped;
}

function normalizeTextList(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    throw new Error(`Brain request field ${fieldName} must be an array when provided.`);
  }

  const normalized = value.map((item) => {
    if (typeof item !== 'string') {
      throw new Error(`Brain request field ${fieldName} must contain only strings.`);
    }

    const trimmed = item.trim();
    if (!trimmed) {
      throw new Error(`Brain request field ${fieldName} cannot contain empty strings.`);
    }

    return trimmed;
  });

  const deduped = Array.from(new Set(normalized));
  deduped.sort();
  return deduped;
}

function normalizeOutputClass(value: unknown): BrainOutputClass {
  if (typeof value === 'string' && OUTPUT_CLASSES.includes(value as BrainOutputClass)) {
    return value as BrainOutputClass;
  }

  throw new Error(
    `Brain request field outputClass must be one of ${OUTPUT_CLASSES.join(', ')}.`,
  );
}

export function validateBrainRequest(input: unknown): BrainRequestValidationReport {
  if (!isPlainObject(input)) {
    return {
      valid: false,
      issueCount: 1,
      issues: [
        {
          code: 'INVALID_REQUEST_SHAPE',
          message: 'Brain request must be a plain object.',
        },
      ],
    };
  }

  const issues: BrainRequestValidationIssue[] = [];

  for (const field of [
    'requestId',
    'taskId',
    'summary',
    'authorityArtifactIds',
    'requiredArtifactIds',
    'optionalArtifactIds',
    'outputClass',
  ] as const) {
    if (!(field in input)) {
      issues.push({
        code: 'MISSING_REQUEST_FIELD',
        message: `Brain request is missing required field ${field}.`,
        field,
      });
    }
  }

  if (issues.length > 0) {
    return {
      valid: false,
      issueCount: issues.length,
      issues,
    };
  }

  try {
    normalizeText(input.requestId, 'requestId');
    normalizeText(input.taskId, 'taskId');
    normalizeText(input.summary, 'summary');
    normalizeOptionalText(input.purpose);
    normalizeArtifactIdList(input.authorityArtifactIds, 'authorityArtifactIds');
    normalizeArtifactIdList(input.requiredArtifactIds, 'requiredArtifactIds');
    normalizeArtifactIdList(input.optionalArtifactIds, 'optionalArtifactIds');
    normalizeTextList(input.constraints, 'constraints');
    normalizeOutputClass(input.outputClass);
  } catch (error) {
    issues.push({
      code: 'INVALID_REQUEST_VALUE',
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}

export function createBrainRequest(input: unknown): BrainRequest {
  const validation = validateBrainRequest(input);
  if (!validation.valid) {
    const message = validation.issues
      .map((issue) => `${issue.code}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid Brain request: ${message}`);
  }

  const candidate = input as BrainRequestInput;
  const request: BrainRequest = {
    requestId: normalizeText(candidate.requestId, 'requestId'),
    taskId: normalizeText(candidate.taskId, 'taskId'),
    summary: normalizeText(candidate.summary, 'summary'),
    purpose: normalizeOptionalText(candidate.purpose),
    authorityArtifactIds: normalizeArtifactIdList(candidate.authorityArtifactIds, 'authorityArtifactIds'),
    requiredArtifactIds: normalizeArtifactIdList(candidate.requiredArtifactIds, 'requiredArtifactIds'),
    optionalArtifactIds: normalizeArtifactIdList(candidate.optionalArtifactIds, 'optionalArtifactIds'),
    constraints: normalizeTextList(candidate.constraints, 'constraints'),
    outputClass: normalizeOutputClass(candidate.outputClass),
  };

  return deepFreeze({
    ...request,
  });
}
