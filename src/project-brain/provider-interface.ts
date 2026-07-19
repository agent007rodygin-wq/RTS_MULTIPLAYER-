import { deepFreeze } from './knowledge-artifact.ts';

export type ProviderCapabilityType = 'execution' | 'review' | 'analysis';

export interface ProviderCapability {
  readonly type: ProviderCapabilityType;
  readonly description: string;
}

export interface ProviderIdentity {
  readonly providerId: string;
  readonly providerVersion: string;
}

export interface ProviderRequest {
  readonly requestId: string;
  readonly taskId: string;
  readonly prompt: string;
  readonly constraints: readonly string[];
  readonly requiredCapabilities: readonly ProviderCapabilityType[];
}

export type ProviderFinishReason = 'COMPLETE' | 'ERROR' | 'LENGTH' | 'CONTENT_FILTER';

export interface ProviderResponse {
  readonly requestId: string;
  readonly content: string;
  readonly finishReason: ProviderFinishReason;
  readonly usage?: ProviderResponseUsage;
}

export interface ProviderResponseUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
}

export type ProviderErrorCode =
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RATE_LIMITED'
  | 'PROVIDER_INVALID_RESPONSE'
  | 'PROVIDER_INTERNAL_ERROR'
  | 'PROVIDER_AUTHENTICATION_ERROR';

export interface ProviderError {
  readonly requestId: string;
  readonly code: ProviderErrorCode;
  readonly message: string;
  readonly recoverable: boolean;
}

export type ProviderResultStatus = 'READY' | 'ERROR';

export interface ProviderResult {
  readonly requestId: string;
  readonly status: ProviderResultStatus;
  readonly response?: ProviderResponse;
  readonly error?: ProviderError;
}

export interface Provider {
  readonly identity: ProviderIdentity;
  readonly capabilities: readonly ProviderCapability[];
  execute(request: ProviderRequest): Promise<ProviderResult>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Provider ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Provider ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function normalizeNonNegativeInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new Error(`Provider ${fieldName} must be a non-negative integer.`);
  }
  return value;
}

function normalizeCapabilityType(value: unknown): ProviderCapabilityType {
  if (value !== 'execution' && value !== 'review' && value !== 'analysis') {
    throw new Error(`Provider capability type must be 'execution', 'review', or 'analysis'.`);
  }
  return value;
}

function normalizeFinishReason(value: unknown): ProviderFinishReason {
  if (value !== 'COMPLETE' && value !== 'ERROR' && value !== 'LENGTH' && value !== 'CONTENT_FILTER') {
    throw new Error(`Provider finish reason must be 'COMPLETE', 'ERROR', 'LENGTH', or 'CONTENT_FILTER'.`);
  }
  return value;
}

function normalizeErrorCode(value: unknown): ProviderErrorCode {
  const validCodes: readonly ProviderErrorCode[] = [
    'PROVIDER_UNAVAILABLE',
    'PROVIDER_TIMEOUT',
    'PROVIDER_RATE_LIMITED',
    'PROVIDER_INVALID_RESPONSE',
    'PROVIDER_INTERNAL_ERROR',
    'PROVIDER_AUTHENTICATION_ERROR',
  ];
  if (!validCodes.includes(value as ProviderErrorCode)) {
    throw new Error(`Provider error code must be a valid error code.`);
  }
  return value as ProviderErrorCode;
}

function normalizeStringArray(value: unknown, fieldName: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Provider ${fieldName} must be an array.`);
  }
  const result: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw new Error(`Provider ${fieldName}[${i}] must be a string.`);
    }
    if (value[i].trim().length === 0) {
      throw new Error(`Provider ${fieldName}[${i}] must be a non-empty string.`);
    }
    result.push(value[i].trim());
  }
  return result;
}

function normalizeCapabilityTypeArray(value: unknown): readonly ProviderCapabilityType[] {
  if (!Array.isArray(value)) {
    throw new Error(`Provider requiredCapabilities must be an array.`);
  }
  const result: ProviderCapabilityType[] = [];
  for (let i = 0; i < value.length; i++) {
    result.push(normalizeCapabilityType(value[i]));
  }
  return result;
}

export function createProviderIdentity(input: {
  providerId: unknown;
  providerVersion: unknown;
}): ProviderIdentity {
  if (!isPlainObject(input)) {
    throw new Error('Provider identity input must be a plain object.');
  }
  return deepFreeze({
    providerId: normalizeText(input.providerId, 'providerId'),
    providerVersion: normalizeText(input.providerVersion, 'providerVersion'),
  });
}

export function createProviderCapability(input: {
  type: unknown;
  description: unknown;
}): ProviderCapability {
  if (!isPlainObject(input)) {
    throw new Error('Provider capability input must be a plain object.');
  }
  return deepFreeze({
    type: normalizeCapabilityType(input.type),
    description: normalizeText(input.description, 'description'),
  });
}

export function createProviderRequest(input: {
  requestId: unknown;
  taskId: unknown;
  prompt: unknown;
  constraints?: unknown;
  requiredCapabilities?: unknown;
}): ProviderRequest {
  if (!isPlainObject(input)) {
    throw new Error('Provider request input must be a plain object.');
  }
  return deepFreeze({
    requestId: normalizeText(input.requestId, 'requestId'),
    taskId: normalizeText(input.taskId, 'taskId'),
    prompt: normalizeText(input.prompt, 'prompt'),
    constraints: input.constraints !== undefined
      ? normalizeStringArray(input.constraints, 'constraints')
      : ([] as readonly string[]),
    requiredCapabilities: input.requiredCapabilities !== undefined
      ? normalizeCapabilityTypeArray(input.requiredCapabilities)
      : ([] as readonly ProviderCapabilityType[]),
  });
}

export function createProviderResponse(input: {
  requestId: unknown;
  content: unknown;
  finishReason: unknown;
  usage?: unknown;
}): ProviderResponse {
  if (!isPlainObject(input)) {
    throw new Error('Provider response input must be a plain object.');
  }
  let usage: ProviderResponseUsage | undefined;
  if (input.usage !== undefined) {
    if (!isPlainObject(input.usage)) {
      throw new Error('Provider response usage must be a plain object.');
    }
    usage = deepFreeze({
      promptTokens: normalizeNonNegativeInteger(input.usage.promptTokens, 'usage.promptTokens'),
      completionTokens: normalizeNonNegativeInteger(input.usage.completionTokens, 'usage.completionTokens'),
    });
  }
  return deepFreeze({
    requestId: normalizeText(input.requestId, 'requestId'),
    content: normalizeText(input.content, 'content'),
    finishReason: normalizeFinishReason(input.finishReason),
    usage,
  });
}

export function createProviderError(input: {
  requestId: unknown;
  code: unknown;
  message: unknown;
  recoverable: unknown;
}): ProviderError {
  if (!isPlainObject(input)) {
    throw new Error('Provider error input must be a plain object.');
  }
  if (typeof input.recoverable !== 'boolean') {
    throw new Error('Provider error recoverable must be a boolean.');
  }
  return deepFreeze({
    requestId: normalizeText(input.requestId, 'requestId'),
    code: normalizeErrorCode(input.code),
    message: normalizeText(input.message, 'message'),
    recoverable: input.recoverable,
  });
}

export function createProviderResult(input: {
  requestId: unknown;
  status: unknown;
  response?: unknown;
  error?: unknown;
}): ProviderResult {
  if (!isPlainObject(input)) {
    throw new Error('Provider result input must be a plain object.');
  }
  if (input.status !== 'READY' && input.status !== 'ERROR') {
    throw new Error(`Provider result status must be 'READY' or 'ERROR'.`);
  }
  const status = input.status as ProviderResultStatus;
  if (status === 'READY' && input.response === undefined) {
    throw new Error('Provider result with READY status must include a response.');
  }
  if (status === 'ERROR' && input.error === undefined) {
    throw new Error('Provider result with ERROR status must include an error.');
  }
  if (status === 'READY' && input.error !== undefined) {
    throw new Error('Provider result with READY status must not include an error.');
  }
  if (status === 'ERROR' && input.response !== undefined) {
    throw new Error('Provider result with ERROR status must not include a response.');
  }
  const resultRequestId = normalizeText(input.requestId, 'requestId');
  let response: ProviderResponse | undefined;
  if (input.response !== undefined) {
    response = createProviderResponse(input.response as Parameters<typeof createProviderResponse>[0]);
    if (response.requestId !== resultRequestId) {
      throw new Error(`Provider result response requestId '${response.requestId}' does not match result requestId '${resultRequestId}'.`);
    }
  }
  let error: ProviderError | undefined;
  if (input.error !== undefined) {
    error = createProviderError(input.error as Parameters<typeof createProviderError>[0]);
    if (error.requestId !== resultRequestId) {
      throw new Error(`Provider result error requestId '${error.requestId}' does not match result requestId '${resultRequestId}'.`);
    }
  }
  return deepFreeze({
    requestId: resultRequestId,
    status,
    response,
    error,
  });
}
