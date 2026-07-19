import {
  createProviderIdentity,
  createProviderCapability,
  createProviderRequest,
  createProviderResponse,
  createProviderError,
  createProviderResult,
} from '../../src/project-brain/provider-interface.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [provider-interface]: ${name}`);
    failed++;
  }
}

function assertThrows(fn, name) {
  try {
    fn();
    console.error(`FAIL [provider-interface]: ${name} — expected throw`);
    failed++;
  } catch {
    passed++;
  }
}

async function assertThrowsAsync(fn, name) {
  try {
    await fn();
    console.error(`FAIL [provider-interface]: ${name} — expected throw`);
    failed++;
  } catch {
    passed++;
  }
}

// ============================================================
// Provider Identity
// ============================================================
assertThrows(
  () => createProviderIdentity({ providerId: '', providerVersion: '1.0' }),
  'rejects empty providerId',
);
assertThrows(
  () => createProviderIdentity({ providerId: 'test', providerVersion: '' }),
  'rejects empty providerVersion',
);
assertThrows(
  () => createProviderIdentity(null),
  'rejects null identity input',
);
assertThrows(
  () => createProviderIdentity({}),
  'rejects empty identity input',
);
assertThrows(
  () => createProviderIdentity({ providerId: 123, providerVersion: '1.0' }),
  'rejects non-string providerId',
);

const identity = createProviderIdentity({ providerId: 'mock-provider', providerVersion: '1.0.0' });
assert(identity.providerId === 'mock-provider', 'identity providerId');
assert(identity.providerVersion === '1.0.0', 'identity providerVersion');
assert(Object.isFrozen(identity), 'identity is frozen');

// ============================================================
// Provider Capability
// ============================================================
assertThrows(
  () => createProviderCapability({ type: 'unknown', description: 'test' }),
  'rejects invalid capability type',
);
assertThrows(
  () => createProviderCapability({ type: 'execution', description: '' }),
  'rejects empty capability description',
);
assertThrows(
  () => createProviderCapability(null),
  'rejects null capability input',
);

const execCap = createProviderCapability({ type: 'execution', description: 'Can execute tasks' });
assert(execCap.type === 'execution', 'capability type execution');
assert(execCap.description === 'Can execute tasks', 'capability description');
assert(Object.isFrozen(execCap), 'capability is frozen');

const reviewCap = createProviderCapability({ type: 'review', description: 'Can review work' });
assert(reviewCap.type === 'review', 'capability type review');

const analysisCap = createProviderCapability({ type: 'analysis', description: 'Can analyze' });
assert(analysisCap.type === 'analysis', 'capability type analysis');

// ============================================================
// Provider Request
// ============================================================
assertThrows(
  () => createProviderRequest({ requestId: '', taskId: 't1', prompt: 'hello' }),
  'rejects empty requestId',
);
assertThrows(
  () => createProviderRequest({ requestId: 'r1', taskId: '', prompt: 'hello' }),
  'rejects empty taskId',
);
assertThrows(
  () => createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: '' }),
  'rejects empty prompt',
);
assertThrows(
  () => createProviderRequest(null),
  'rejects null request input',
);
assertThrows(
  () => createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'hello', constraints: 'not-array' }),
  'rejects non-array constraints',
);
assertThrows(
  () => createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'hello', constraints: [123] }),
  'rejects non-string constraint element',
);
assertThrows(
  () => createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'hello', requiredCapabilities: ['fake'] }),
  'rejects invalid requiredCapability type',
);

const req = createProviderRequest({
  requestId: 'req-001',
  taskId: 'task-001',
  prompt: 'Analyze the code',
  constraints: ['use typescript', 'be concise'],
  requiredCapabilities: ['execution'],
});
assert(req.requestId === 'req-001', 'request requestId');
assert(req.taskId === 'task-001', 'request taskId');
assert(req.prompt === 'Analyze the code', 'request prompt');
assert(req.constraints.length === 2, 'request constraints count');
assert(req.requiredCapabilities.length === 1, 'request capabilities count');
assert(req.requiredCapabilities[0] === 'execution', 'request capability type');
assert(Object.isFrozen(req), 'request is frozen');
assert(Object.isFrozen(req.constraints), 'request constraints frozen');

// LOW-02: explicit empty arrays
const reqEmptyConstraints = createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'hello', constraints: [] });
assert(reqEmptyConstraints.constraints.length === 0, 'explicit empty constraints');
assert(Object.isFrozen(reqEmptyConstraints), 'request with empty constraints frozen');
assert(Object.isFrozen(reqEmptyConstraints.constraints), 'empty constraints array frozen');

const reqEmptyCaps = createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'hello', requiredCapabilities: [] });
assert(reqEmptyCaps.requiredCapabilities.length === 0, 'explicit empty capabilities');
assert(Object.isFrozen(reqEmptyCaps), 'request with empty capabilities frozen');
assert(Object.isFrozen(reqEmptyCaps.requiredCapabilities), 'empty capabilities array frozen');

const reqMinimal = createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'hello' });
assert(reqMinimal.constraints.length === 0, 'default constraints empty');
assert(reqMinimal.requiredCapabilities.length === 0, 'default capabilities empty');

// Explicit empty arrays are equivalent to defaults
assert(reqEmptyConstraints.constraints.length === reqMinimal.constraints.length, 'empty constraints equals default');
assert(reqEmptyCaps.requiredCapabilities.length === reqMinimal.requiredCapabilities.length, 'empty caps equals default');

// ============================================================
// Provider Response
// ============================================================
assertThrows(
  () => createProviderResponse({ requestId: 'r1', content: '', finishReason: 'COMPLETE' }),
  'rejects empty content',
);
assertThrows(
  () => createProviderResponse({ requestId: 'r1', content: 'ok', finishReason: 'INVALID' }),
  'rejects invalid finishReason',
);
assertThrows(
  () => createProviderResponse(null),
  'rejects null response input',
);
assertThrows(
  () => createProviderResponse({ requestId: 'r1', content: 'ok', finishReason: 'COMPLETE', usage: { promptTokens: -1, completionTokens: 5 } }),
  'rejects negative promptTokens',
);
assertThrows(
  () => createProviderResponse({ requestId: 'r1', content: 'ok', finishReason: 'COMPLETE', usage: { promptTokens: 1.5, completionTokens: 5 } }),
  'rejects non-integer promptTokens',
);

const resp = createProviderResponse({
  requestId: 'req-001',
  content: 'Found root cause: missing null check.',
  finishReason: 'COMPLETE',
});
assert(resp.requestId === 'req-001', 'response requestId');
assert(resp.content === 'Found root cause: missing null check.', 'response content');
assert(resp.finishReason === 'COMPLETE', 'response finishReason');
assert(resp.usage === undefined, 'response usage undefined by default');
assert(Object.isFrozen(resp), 'response is frozen');

const respWithUsage = createProviderResponse({
  requestId: 'req-002',
  content: 'Analysis complete.',
  finishReason: 'LENGTH',
  usage: { promptTokens: 150, completionTokens: 300 },
});
assert(respWithUsage.usage.promptTokens === 150, 'response usage promptTokens');
assert(respWithUsage.usage.completionTokens === 300, 'response usage completionTokens');
assert(Object.isFrozen(respWithUsage.usage), 'response usage frozen');

// ============================================================
// Provider Error
// ============================================================
assertThrows(
  () => createProviderError({ requestId: 'r1', code: 'INVALID_CODE', message: 'err', recoverable: false }),
  'rejects invalid error code',
);
assertThrows(
  () => createProviderError({ requestId: 'r1', code: 'PROVIDER_UNAVAILABLE', message: '', recoverable: false }),
  'rejects empty error message',
);
assertThrows(
  () => createProviderError({ requestId: 'r1', code: 'PROVIDER_TIMEOUT', message: 'timeout', recoverable: 'yes' }),
  'rejects non-boolean recoverable',
);
assertThrows(
  () => createProviderError(null),
  'rejects null error input',
);

const err = createProviderError({
  requestId: 'req-001',
  code: 'PROVIDER_TIMEOUT',
  message: 'Provider did not respond within 30s.',
  recoverable: true,
});
assert(err.requestId === 'req-001', 'error requestId');
assert(err.code === 'PROVIDER_TIMEOUT', 'error code');
assert(err.message === 'Provider did not respond within 30s.', 'error message');
assert(err.recoverable === true, 'error recoverable');
assert(Object.isFrozen(err), 'error is frozen');

const nonRecoverable = createProviderError({
  requestId: 'req-002',
  code: 'PROVIDER_AUTHENTICATION_ERROR',
  message: 'Invalid API key.',
  recoverable: false,
});
assert(nonRecoverable.recoverable === false, 'non-recoverable error');

// ============================================================
// PROVIDER_INVALID_REQUEST Error Code (Phase 4 Extension)
// ============================================================

// PROVIDER_INVALID_REQUEST is accepted
{
  const err = createProviderError({
    requestId: 'req-inv',
    code: 'PROVIDER_INVALID_REQUEST',
    message: 'Execution precondition failed.',
    recoverable: false,
  });
  assert(err.code === 'PROVIDER_INVALID_REQUEST', 'PROVIDER_INVALID_REQUEST accepted');
  assert(Object.isFrozen(err), 'PROVIDER_INVALID_REQUEST error is frozen');
}

// Unknown similar code is rejected
assertThrows(
  () => createProviderError({ requestId: 'r1', code: 'PROVIDER_INVALID_INPUT', message: 'Bad', recoverable: false }),
  'rejects PROVIDER_INVALID_INPUT',
);

// ProviderResult carrying PROVIDER_INVALID_REQUEST remains deeply frozen
{
  const result = createProviderResult({
    requestId: 'req-inv',
    status: 'ERROR',
    error: { requestId: 'req-inv', code: 'PROVIDER_INVALID_REQUEST', message: 'Precondition failed.', recoverable: false },
  });
  assert(result.status === 'ERROR', 'PROVIDER_INVALID_REQUEST result status');
  assert(result.error.code === 'PROVIDER_INVALID_REQUEST', 'PROVIDER_INVALID_REQUEST result error code');
  assert(Object.isFrozen(result), 'PROVIDER_INVALID_REQUEST result is frozen');
  assert(Object.isFrozen(result.error), 'PROVIDER_INVALID_REQUEST result error is frozen');
}

// Request-ID consistency applies to PROVIDER_INVALID_REQUEST
assertThrows(
  () => createProviderResult({
    requestId: 'result-001',
    status: 'ERROR',
    error: { requestId: 'different-id', code: 'PROVIDER_INVALID_REQUEST', message: 'Mismatch.', recoverable: false },
  }),
  'rejects PROVIDER_INVALID_REQUEST with mismatched error requestId',
);

// ============================================================
// Provider Result — Request ID Consistency (LOW-01)
// ============================================================
assertThrows(
  () => createProviderResult({ requestId: 'r1', status: 'READY' }),
  'rejects READY without response',
);
assertThrows(
  () => createProviderResult({ requestId: 'r1', status: 'ERROR' }),
  'rejects ERROR without error',
);
assertThrows(
  () => createProviderResult({ requestId: 'r1', status: 'READY', response: {}, error: {} }),
  'rejects READY with error',
);
assertThrows(
  () => createProviderResult({ requestId: 'r1', status: 'ERROR', response: {}, error: {} }),
  'rejects ERROR with response',
);
assertThrows(
  () => createProviderResult({ requestId: 'r1', status: 'INVALID' }),
  'rejects invalid status',
);
assertThrows(
  () => createProviderResult(null),
  'rejects null result input',
);

// LOW-01: mismatched response requestId
assertThrows(
  () => createProviderResult({
    requestId: 'result-001',
    status: 'READY',
    response: { requestId: 'different-id', content: 'Done.', finishReason: 'COMPLETE' },
  }),
  'rejects READY with mismatched response requestId',
);

// LOW-01: mismatched error requestId
assertThrows(
  () => createProviderResult({
    requestId: 'result-002',
    status: 'ERROR',
    error: { requestId: 'different-id', code: 'PROVIDER_UNAVAILABLE', message: 'Down.', recoverable: true },
  }),
  'rejects ERROR with mismatched error requestId',
);

// LOW-01: matching READY
const readyResult = createProviderResult({
  requestId: 'req-001',
  status: 'READY',
  response: { requestId: 'req-001', content: 'Done.', finishReason: 'COMPLETE' },
});
assert(readyResult.requestId === 'req-001', 'result requestId');
assert(readyResult.status === 'READY', 'result status READY');
assert(readyResult.response.content === 'Done.', 'result response content');
assert(readyResult.response.requestId === 'req-001', 'result response requestId matches');
assert(readyResult.error === undefined, 'result no error on READY');
assert(Object.isFrozen(readyResult), 'result is frozen');
assert(Object.isFrozen(readyResult.response), 'result response frozen');

// LOW-01: matching ERROR
const errorResult = createProviderResult({
  requestId: 'req-002',
  status: 'ERROR',
  error: { requestId: 'req-002', code: 'PROVIDER_UNAVAILABLE', message: 'Down.', recoverable: true },
});
assert(errorResult.requestId === 'req-002', 'error result requestId');
assert(errorResult.status === 'ERROR', 'result status ERROR');
assert(errorResult.error.code === 'PROVIDER_UNAVAILABLE', 'result error code');
assert(errorResult.error.requestId === 'req-002', 'result error requestId matches');
assert(errorResult.response === undefined, 'result no response on ERROR');

// ============================================================
// Provider Interchangeability (MEDIUM-01: async)
// ============================================================

// Two mock providers with identical interfaces but different identities
const mockA = {
  identity: createProviderIdentity({ providerId: 'mock-a', providerVersion: '1.0' }),
  capabilities: [
    createProviderCapability({ type: 'execution', description: 'Mock A execution' }),
  ],
  async execute(request) {
    if (request.prompt.includes('error')) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'ERROR',
        error: { requestId: request.requestId, code: 'PROVIDER_INTERNAL_ERROR', message: 'Mock A failed', recoverable: false },
      });
    }
    return createProviderResult({
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: request.requestId, content: `Mock A processed: ${request.prompt}`, finishReason: 'COMPLETE' },
    });
  },
};

const mockB = {
  identity: createProviderIdentity({ providerId: 'mock-b', providerVersion: '2.0' }),
  capabilities: [
    createProviderCapability({ type: 'review', description: 'Mock B review' }),
  ],
  async execute(request) {
    return createProviderResult({
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: request.requestId, content: `Mock B reviewed: ${request.prompt}`, finishReason: 'COMPLETE' },
    });
  },
};

// Both conform to the Provider interface with async execute
assert(typeof mockA.execute === 'function', 'mockA has execute');
assert(typeof mockB.execute === 'function', 'mockB has execute');
assert(mockA.execute(createProviderRequest({ requestId: 'r0', taskId: 't0', prompt: 'dummy' })) instanceof Promise, 'mockA execute returns Promise');
assert(mockB.execute(createProviderRequest({ requestId: 'r0', taskId: 't0', prompt: 'dummy' })) instanceof Promise, 'mockB execute returns Promise');
assert(mockA.identity.providerId === 'mock-a', 'mockA identity differs');
assert(mockB.identity.providerId === 'mock-b', 'mockB identity differs');

const resultA = await mockA.execute(createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'find bug' }));
const resultB = await mockB.execute(createProviderRequest({ requestId: 'r2', taskId: 't2', prompt: 'review fix' }));

// Both produce structurally identical result types
assert(resultA.status === 'READY', 'mockA success');
assert(resultB.status === 'READY', 'mockB success');
assert(resultA.response.content.includes('Mock A'), 'mockA response content');
assert(resultB.response.content.includes('Mock B'), 'mockB response content');

// Both support error results via same async interface
const errorA = await mockA.execute(createProviderRequest({ requestId: 'r3', taskId: 't3', prompt: 'trigger error' }));
assert(errorA.status === 'ERROR', 'mockA error status');
assert(errorA.error.code === 'PROVIDER_INTERNAL_ERROR', 'mockA error code');
assert(errorA.response === undefined, 'mockA no response on error');

// Interchangeability: mockA handles both success and error via same async contract
const mockC = {
  identity: createProviderIdentity({ providerId: 'mock-c', providerVersion: '3.0' }),
  capabilities: [
    createProviderCapability({ type: 'analysis', description: 'Mock C analysis' }),
  ],
  async execute(request) {
    await Promise.resolve();
    return createProviderResult({
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: request.requestId, content: `Mock C: ${request.prompt}`, finishReason: 'COMPLETE' },
    });
  },
};
assert(mockC.execute(createProviderRequest({ requestId: 'r0', taskId: 't0', prompt: 'dummy' })) instanceof Promise, 'mockC execute returns Promise');
const resultC = await mockC.execute(createProviderRequest({ requestId: 'r4', taskId: 't4', prompt: 'analyze' }));
assert(resultC.status === 'READY', 'mockC success');

// ============================================================
// Invariant: No provider-specific types leak into Package I
// ============================================================

// Verify no provider-specific field names appear in the types
const requestKeys = Object.keys(createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'x' }));
for (const key of requestKeys) {
  assert(!key.includes('openai') && !key.includes('anthropic') && !key.includes('gemini') && !key.includes('claude'),
    `no provider-specific key: ${key}`);
}

// Verify identity type only contains generic fields
const identityKeys = Object.keys(identity);
assert(identityKeys.length === 2, 'identity has exactly 2 fields');
assert(identityKeys.includes('providerId'), 'identity has providerId');
assert(identityKeys.includes('providerVersion'), 'identity has providerVersion');

// Verify error type has requestId for traceability
const errorKeys = Object.keys(err);
assert(errorKeys.includes('requestId'), 'error has requestId for traceability');

// ============================================================
// Summary
// ============================================================
console.log(`provider-interface-test: ${passed} passed, ${failed} failed`);
