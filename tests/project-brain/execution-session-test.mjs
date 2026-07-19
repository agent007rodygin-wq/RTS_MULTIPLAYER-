import {
  createProviderIdentity,
  createProviderCapability,
  createProviderRequest,
  createProviderResult,
} from '../../src/project-brain/provider-interface.ts';
import { createAgentRequestEnvelope } from '../../src/project-brain/agent-request-envelope.ts';
import { executeAgentRequest } from '../../src/project-brain/execution-session.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [execution-session]: ${name}`);
    failed++;
  }
}

// ============================================================
// Helpers
// ============================================================
const executableCapability = createProviderCapability({ type: 'execution', description: 'Executes tasks' });
const reviewCapability = createProviderCapability({ type: 'review', description: 'Reviews work' });
const analysisCapability = createProviderCapability({ type: 'analysis', description: 'Analyzes' });

function makeEnvelope(overrides = {}) {
  return createAgentRequestEnvelope({
    envelopeId: 'ENVELOPE::req-001::1712345678',
    requestId: 'req-001',
    taskId: 'task-001',
    sessionId: 'BRAIN-SESSION::req-001::task-001::ANALYSIS',
    contextRequestId: 'ctx-req-001',
    objective: 'Analyze the production system',
    outputClass: 'analysis',
    constraints: ['use typescript', 'be concise'],
    sourceRevision: 'abc123',
    createdAt: 1712345678000,
    investigationRef: 'PB-INV-001',
    metadata: [{ key: 'source', value: 'brain-engine' }],
    ...overrides,
  });
}

function makeSuccessProvider(providerId = 'mock-a', providerVersion = '1.0') {
  const identity = createProviderIdentity({ providerId, providerVersion });
  return {
    identity,
    capabilities: [executableCapability],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: `Result from ${providerId}: ${request.prompt}`,
          finishReason: 'COMPLETE',
        },
      });
    },
  };
}

function makeRejectingProvider(code = 'PROVIDER_UNAVAILABLE', message = 'Service down') {
  const identity = createProviderIdentity({ providerId: 'mock-reject', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [executableCapability],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'ERROR',
        error: { requestId: request.requestId, code, message, recoverable: true },
      });
    },
  };
}

function makeThrowingProvider(errorMessage = 'Connection refused') {
  const identity = createProviderIdentity({ providerId: 'mock-throw', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [executableCapability],
    async execute(_request) {
      throw new Error(errorMessage);
    },
  };
}

// ============================================================
// Successful Execution
// ============================================================
const envelope = makeEnvelope();
const successProvider = makeSuccessProvider();
const result = await executeAgentRequest(envelope, successProvider);

assert(result.status === 'READY', 'successful execution status is READY');
assert(result.response.content.includes('mock-a: Analyze the production system'), 'successful execution content');
assert(result.response.finishReason === 'COMPLETE', 'successful execution finishReason');
assert(result.response.requestId === 'req-001', 'successful execution response requestId');
assert(result.requestId === 'req-001', 'successful execution result requestId');
assert(result.error === undefined, 'successful execution no error');

// ============================================================
// Provider Rejection
// ============================================================
const rejectProvider = makeRejectingProvider();
const rejectResult = await executeAgentRequest(envelope, rejectProvider);

assert(rejectResult.status === 'ERROR', 'rejected execution status is ERROR');
assert(rejectResult.error.code === 'PROVIDER_UNAVAILABLE', 'rejected error code');
assert(rejectResult.error.message === 'Service down', 'rejected error message');
assert(rejectResult.error.recoverable === true, 'rejected error recoverable');
assert(rejectResult.error.requestId === 'req-001', 'rejected error requestId');
assert(rejectResult.response === undefined, 'rejected no response');

// Different error codes
for (const code of ['PROVIDER_TIMEOUT', 'PROVIDER_RATE_LIMITED', 'PROVIDER_INTERNAL_ERROR', 'PROVIDER_AUTHENTICATION_ERROR']) {
  const rp = makeRejectingProvider(code, `Error: ${code}`);
  const r = await executeAgentRequest(envelope, rp);
  assert(r.status === 'ERROR', `rejection code ${code} status is ERROR`);
  assert(r.error.code === code, `rejection code ${code} preserved`);
}

// ============================================================
// Provider Exception — Thrown Error
// ============================================================
const throwProvider = makeThrowingProvider('Something went wrong');
const throwResult = await executeAgentRequest(envelope, throwProvider);

assert(throwResult.status === 'ERROR', 'thrown exception status is ERROR');
assert(throwResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'thrown exception error code');
assert(throwResult.error.message === 'Something went wrong', 'thrown exception message preserved');
assert(throwResult.error.recoverable === true, 'thrown exception recoverable');
assert(throwResult.error.requestId === 'req-001', 'thrown exception requestId');
assert(throwResult.response === undefined, 'thrown exception no response');

// Non-Error thrown values
const throwStringProvider = {
  identity: createProviderIdentity({ providerId: 'mock-throw-str', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(_request) {
    throw 'string error'; // eslint-disable-line no-throw-literal
  },
};
const throwStringResult = await executeAgentRequest(envelope, throwStringProvider);
assert(throwStringResult.status === 'ERROR', 'thrown string status ERROR');
assert(throwStringResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'thrown string error code');
assert(throwStringResult.error.message === 'string error', 'thrown string message preserved');

// ============================================================
// Malformed Provider Result
// ============================================================

// Non-object result
const nonObjProvider = {
  identity: createProviderIdentity({ providerId: 'mock-nonobj', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(_request) {
    return 'not-an-object'; // eslint-disable-line no-throw-literal
  },
};
const nonObjResult = await executeAgentRequest(envelope, nonObjProvider);
assert(nonObjResult.status === 'ERROR', 'non-object result status ERROR');
assert(nonObjResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'non-object error code');
assert(nonObjResult.error.recoverable === false, 'non-object not recoverable');
assert(nonObjResult.response === undefined, 'non-object no response');

// null result
const nullProvider = {
  identity: createProviderIdentity({ providerId: 'mock-null', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(_request) {
    return null;
  },
};
const nullResult = await executeAgentRequest(envelope, nullProvider);
assert(nullResult.status === 'ERROR', 'null result status ERROR');
assert(nullResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'null error code');

// Array result
const arrayProvider = {
  identity: createProviderIdentity({ providerId: 'mock-array', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(_request) {
    return [];
  },
};
const arrayResult = await executeAgentRequest(envelope, arrayProvider);
assert(arrayResult.status === 'ERROR', 'array result status ERROR');
assert(arrayResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'array error code');

// Malformed: READY without response
const missingResponseProvider = {
  identity: createProviderIdentity({ providerId: 'mock-miss', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(request) {
    return { requestId: request.requestId, status: 'READY' };
  },
};
const missingRespResult = await executeAgentRequest(envelope, missingResponseProvider);
assert(missingRespResult.status === 'ERROR', 'missing response status ERROR');
assert(missingRespResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'missing response error code');

// Malformed: mismatched requestId in response
const mismatchProvider = {
  identity: createProviderIdentity({ providerId: 'mock-mismatch', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(request) {
    return {
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: 'wrong-id', content: 'Done.', finishReason: 'COMPLETE' },
    };
  },
};
const mismatchResult = await executeAgentRequest(envelope, mismatchProvider);
assert(mismatchResult.status === 'ERROR', 'mismatched ID status ERROR');
assert(mismatchResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'mismatched ID error code');

// Malformed: invalid status
const invalidStatusProvider = {
  identity: createProviderIdentity({ providerId: 'mock-badstatus', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(request) {
    return { requestId: request.requestId, status: 'INVALID' };
  },
};
const badStatusResult = await executeAgentRequest(envelope, invalidStatusProvider);
assert(badStatusResult.status === 'ERROR', 'invalid status ERROR');
assert(badStatusResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'invalid status error code');

// ============================================================
// Asynchronous Execution
// ============================================================
const asyncProvider = {
  identity: createProviderIdentity({ providerId: 'mock-async', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(request) {
    await new Promise((resolve) => setImmediate(resolve));
    return createProviderResult({
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: request.requestId, content: 'Async result', finishReason: 'COMPLETE' },
    });
  },
};
const asyncResult = await executeAgentRequest(envelope, asyncProvider);
assert(asyncResult.status === 'READY', 'async execution status READY');
assert(asyncResult.response.content === 'Async result', 'async execution content');
assert(asyncResult.response.finishReason === 'COMPLETE', 'async execution finishReason');

// ============================================================
// Immutable Envelope Preservation
// ============================================================
const origEnvelope = makeEnvelope();
const preEnvelopeId = origEnvelope.envelopeId;
const preRequestId = origEnvelope.requestId;
const preTaskId = origEnvelope.taskId;
const preObjective = origEnvelope.objective;
const preConstraints = origEnvelope.constraints;
const preMetadata = origEnvelope.metadata;

const evalProvider = makeSuccessProvider('eval');
await executeAgentRequest(origEnvelope, evalProvider);

assert(origEnvelope.envelopeId === preEnvelopeId, 'envelopeId unchanged after execution');
assert(origEnvelope.requestId === preRequestId, 'requestId unchanged');
assert(origEnvelope.taskId === preTaskId, 'taskId unchanged');
assert(origEnvelope.objective === preObjective, 'objective unchanged');
assert(origEnvelope.constraints === preConstraints, 'constraints array reference unchanged');
assert(origEnvelope.constraints.length === preConstraints.length, 'constraints length unchanged');
assert(origEnvelope.metadata === preMetadata, 'metadata array reference unchanged');
assert(origEnvelope.metadata.length === preMetadata.length, 'metadata length unchanged');

// ============================================================
// Identifier Preservation
// ============================================================
const idEnvelope = makeEnvelope({ requestId: 'req-042', taskId: 'task-099' });
const idProvider = makeSuccessProvider('id-check');
const idResult = await executeAgentRequest(idEnvelope, idProvider);
assert(idResult.requestId === 'req-042', 'requestId preserved through execution');
assert(idResult.response.requestId === 'req-042', 'response requestId preserved');
assert(idResult.response.content.includes('req-042') === false, 'content does not leak requestId');
// Actually, the content includes the prompt which does not include requestId

// ============================================================
// Provider Independence — Multiple Providers, Same Shape
// ============================================================
const providers = [
  makeSuccessProvider('provider-alpha', '1.0'),
  makeSuccessProvider('provider-beta', '2.0'),
  makeSuccessProvider('provider-gamma', '3.0'),
];

for (const provider of providers) {
  const r = await executeAgentRequest(envelope, provider);
  assert(r.status === 'READY', `${provider.identity.providerId} execution READY`);
  assert(r.response.content.includes(provider.identity.providerId), `${provider.identity.providerId} content includes identity`);
  assert(r.response.finishReason === 'COMPLETE', `${provider.identity.providerId} finishReason`);
  assert(r.requestId === 'req-001', `${provider.identity.providerId} requestId preserved`);
  assert(Object.isFrozen(r), `${provider.identity.providerId} result is frozen`);
  assert(Object.isFrozen(r.response), `${provider.identity.providerId} response is frozen`);
}

// Provider with only execution capability works
const execProvider = {
  identity: createProviderIdentity({ providerId: 'exec-only', providerVersion: '1.0' }),
  capabilities: [executableCapability],
  async execute(request) {
    return createProviderResult({
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: request.requestId, content: 'Exec result', finishReason: 'COMPLETE' },
    });
  },
};
const execResult = await executeAgentRequest(envelope, execProvider);
assert(execResult.status === 'READY', 'execution-capable provider works');

// Provider with other capabilities also works (capabilities are not filtered)
const multiCapProvider = {
  identity: createProviderIdentity({ providerId: 'multi-cap', providerVersion: '1.0' }),
  capabilities: [executableCapability, reviewCapability, analysisCapability],
  async execute(request) {
    return createProviderResult({
      requestId: request.requestId,
      status: 'READY',
      response: { requestId: request.requestId, content: 'Multi-cap result', finishReason: 'COMPLETE' },
    });
  },
};
const multiCapResult = await executeAgentRequest(envelope, multiCapProvider);
assert(multiCapResult.status === 'READY', 'multi-capability provider works');

// ============================================================
// Deterministic Behavior
// ============================================================
const detProvider = makeSuccessProvider('deterministic');
const detResult1 = await executeAgentRequest(makeEnvelope(), detProvider);
const detResult2 = await executeAgentRequest(makeEnvelope(), detProvider);
assert(detResult1.status === detResult2.status, 'deterministic status');
assert(detResult1.response.content === detResult2.response.content, 'deterministic content');
assert(detResult1.response.finishReason === detResult2.response.finishReason, 'deterministic finishReason');
assert(detResult1.requestId === detResult2.requestId, 'deterministic requestId');

// ============================================================
// Fail-Closed: No Successful Execution Fabrication
// ============================================================
const failProviders = [
  makeRejectingProvider(),
  makeThrowingProvider(),
  nonObjProvider,
  nullProvider,
  arrayProvider,
  missingResponseProvider,
  mismatchProvider,
  invalidStatusProvider,
];

for (const fp of failProviders) {
  const r = await executeAgentRequest(envelope, fp);
  assert(r.status === 'ERROR', 'fail-closed: status is ERROR');
  assert(r.response === undefined, 'fail-closed: no response on error');
  assert(r.error !== undefined, 'fail-closed: has error object');
  assert(r.error.requestId === 'req-001', 'fail-closed: error requestId preserved');
  assert(Object.isFrozen(r), 'fail-closed: result is frozen');
}

// ============================================================
// Provider Independence: No vendor-specific logic in session
// ============================================================
const sourceLines = await (async () => {
  const fs = await import('fs');
  const filePath = new URL('../../src/project-brain/execution-session.ts', import.meta.url).pathname;

  // Handle Windows paths
  const cleanPath = filePath.startsWith('/') ? (filePath.startsWith('//?/') ? filePath.slice(4) : filePath.slice(1)) : filePath;
  return fs.readFileSync(cleanPath, 'utf-8');
})();

for (const name of ['openai', 'anthropic', 'gemini', 'claude']) {
  assert(!sourceLines.includes(name), `source does not contain '${name}'`);
}

// ============================================================
// Summary
// ============================================================
console.log(`execution-session-test: ${passed} passed, ${failed} failed`);
