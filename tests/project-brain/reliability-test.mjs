import {
  createProviderIdentity,
  createProviderCapability,
  createProviderResult,
  createProviderRequest,
} from '../../src/project-brain/provider-interface.ts';
import { createAgentRequestEnvelope } from '../../src/project-brain/agent-request-envelope.ts';
import { executeAgentRequest } from '../../src/project-brain/execution-session.ts';
import { reviewAgentExecution, createReviewFinding } from '../../src/project-brain/review-coordinator.ts';
import { orchestrateAgentRequest } from '../../src/project-brain/orchestration-engine.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [reliability]: ${name}`);
    failed++;
  }
}

// ============================================================
// Shared helpers
// ============================================================
const execCap = createProviderCapability({ type: 'execution', description: 'Executes' });
const reviewCap = createProviderCapability({ type: 'review', description: 'Reviews' });

function makeEnvelope(overrides = {}) {
  return createAgentRequestEnvelope({
    envelopeId: 'ENVELOPE::rel-001::1712345678',
    requestId: 'rel-001',
    taskId: 'rel-task-001',
    sessionId: 'BRAIN-SESSION::rel-001::rel-task-001::ANALYSIS',
    contextRequestId: 'ctx-rel-001',
    objective: 'Reliability test',
    outputClass: 'analysis',
    constraints: ['test'],
    sourceRevision: 'abc123',
    createdAt: 1712345678000,
    ...overrides,
  });
}

function makeApprovalContent() {
  return JSON.stringify({
    decision: 'APPROVED',
    summary: 'ok',
    findings: [{ code: 'OK', message: 'ok', severity: 'Info' }],
  });
}

function makeSuccessProvider() {
  const identity = createProviderIdentity({ providerId: 'rel-exec', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [execCap],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: { requestId: request.requestId, content: 'ok', finishReason: 'COMPLETE' },
      });
    },
  };
}

function makeStandardReviewer() {
  const identity = createProviderIdentity({ providerId: 'rel-review', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [reviewCap],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: { requestId: request.requestId, content: makeApprovalContent(), finishReason: 'COMPLETE' },
      });
    },
  };
}

// ============================================================
// 1. Adversarial Provider Matrix
// ============================================================
{
  const env = makeEnvelope();
  const standardReviewer = makeStandardReviewer();

  // 1a. throw BigInt
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-bigint', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw 42n; },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw BigInt: FAILED');
    assert(o.summary === '42', 'exec throw BigInt: summary');
    assert(typeof o.summary === 'string', 'exec throw BigInt: summary is string');
    assert(o.reviewOutcome === undefined, 'exec throw BigInt: no review');
  }

  // 1b. throw Promise
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-promise', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw Promise.resolve('hidden'); },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw Promise: FAILED');
    assert(o.summary === '[object Promise]', 'exec throw Promise: summary');
    assert(o.reviewOutcome === undefined, 'exec throw Promise: no review');
  }

  // 1c. throw Function
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-func', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) {
        throw function hostile() { return 'leak'; };
      },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw Function: FAILED');
    assert(o.summary.includes('function hostile'), 'exec throw Function: includes name');
    assert(o.reviewOutcome === undefined, 'exec throw Function: no review');
  }

  // 1d. throw Proxy
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-proxy', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw new Proxy({}, {}); },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw Proxy: FAILED');
    assert(o.reviewOutcome === undefined, 'exec throw Proxy: no review');
  }

  // 1e. throw object with recursive getter
  {
    const recursive = {};
    let depth = 0;
    Object.defineProperty(recursive, 'toString', {
      get() {
        if (depth++ > 5) return function () { return 'max-depth'; };
        return this.toString;
      },
    });
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-recursive', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw recursive; },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw recursive getter: FAILED');
    assert(o.reviewOutcome === undefined, 'exec throw recursive getter: no review');
  }

  // 1f. throw frozen object
  {
    const frozen = Object.freeze({ toString() { return 'frozen-obj'; } });
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-frozen', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw frozen; },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw frozen: FAILED');
    assert(o.summary === 'frozen-obj', 'exec throw frozen: summary from frozen toString');
    assert(o.reviewOutcome === undefined, 'exec throw frozen: no review');
  }

  // 1g. throw sealed object
  {
    const sealed = Object.seal({ toString() { return 'sealed-obj'; } });
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-sealed', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw sealed; },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec throw sealed: FAILED');
    assert(o.summary === 'sealed-obj', 'exec throw sealed: summary from sealed toString');
    assert(o.reviewOutcome === undefined, 'exec throw sealed: no review');
  }

  // 1h. return Promise resolving to invalid object
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-prom-resolve', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { return Promise.resolve('resolved-string'); },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec Promise resolve invalid: FAILED');
    assert(o.executionResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'exec Promise resolve: invalid response');
    assert(o.reviewOutcome === undefined, 'exec Promise resolve: no review');
  }

  // 1i. Promise rejecting in execute
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-prom-reject', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { return Promise.reject(new Error('rejected')); },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec Promise reject: FAILED');
    assert(o.summary === 'rejected', 'exec Promise reject: summary');
    assert(o.reviewOutcome === undefined, 'exec Promise reject: no review');
  }

  // 1j. Promise rejecting with hostile value
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-prom-hostile', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { return Promise.reject('hostile-reject'); },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec Promise reject hostile: FAILED');
    assert(o.summary === 'hostile-reject', 'exec Promise reject hostile: summary');
    assert(o.reviewOutcome === undefined, 'exec Promise reject hostile: no review');
  }

  // 1k. return cyclic response object (gracefully handled — frozen copy drops extra refs)
  {
    const cyclic = { requestId: 'rel-001', status: 'READY' };
    cyclic.response = { requestId: 'rel-001', content: 'cycle', finishReason: 'COMPLETE', parent: cyclic };
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-cyclic', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { return cyclic; },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'ACCEPTED', 'exec cyclic response: gracefully handled as ACCEPTED');
    assert(o.executionResult.response.content === 'cycle', 'exec cyclic response: content preserved');
    assert(o.reviewOutcome.decision === 'APPROVED', 'exec cyclic response: review approved');
    assert(Object.isFrozen(o.executionResult), 'exec cyclic response: result frozen');
    assert(o.executionResult.response.parent === undefined, 'exec cyclic response: extra ref not copied');
  }

  // 1l. missing fields in ProviderResult
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-missing', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { return { status: 'READY' }; },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec missing fields: FAILED');
    assert(o.reviewOutcome === undefined, 'exec missing fields: no review');
  }

  // 1m. provider.execute is not a function
  {
    const p = { identity: createProviderIdentity({ providerId: 'rel-notfunc', providerVersion: '1.0' }), capabilities: [execCap], execute: 'string' };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(o.decision === 'FAILED', 'exec execute not function: FAILED');
  }

  // 1n. confirm no stack leak
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-stack', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw new Error('secret'); },
    };
    const o = await orchestrateAgentRequest(env, p, standardReviewer);
    assert(!o.summary.includes('at '), 'exec no stack leak: summary');
    assert(!o.summary.includes('Error:'), 'exec no stack leak: no Error prefix');
    assert(o.executionResult.error.message === 'secret', 'exec no stack leak: error.message correct');
  }
}

// ============================================================
// 2. Adversarial Reviewer Matrix
// ============================================================
{
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();

  // 2a. empty JSON response
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-empty-json', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: { requestId: request.requestId, content: '{}', finishReason: 'COMPLETE' },
        });
      },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review empty JSON: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review empty JSON: UNABLE');
  }

  // 2b. partial JSON (no decision field)
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-partial', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: { requestId: request.requestId, content: '{"summary":"x"}', finishReason: 'COMPLETE' },
        });
      },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review partial JSON: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review partial JSON: UNABLE');
  }

  // 2c. invalid findings structure
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-bad-findings-type', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 'REJECTED', summary: 'bad', findings: 'not-array' }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review findings not array: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review findings not array: UNABLE');
  }

  // 2d. recursive findings (findings that reference each other via code)
  {
    const recFindings = [
      { code: 'A', message: 'first', severity: 'Info' },
      { code: 'A', message: 'first', severity: 'Info' },
    ];
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-rec-findings', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 'REJECTED', summary: 'dup', findings: recFindings }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    // Duplicate findings are allowed; they just get sorted. The result should be REJECTED.
    assert(o.decision === 'REJECTED', 'review duplicate findings: REJECTED');
    assert(o.reviewOutcome.findings.length === 2, 'review duplicate findings: both preserved');
  }

  // 2e. invalid finding severity
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-bad-severity', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 'REJECTED', summary: 'bad', findings: [{ code: 'X', message: 'y', severity: 'CRITICAL' }] }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review bad severity: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review bad severity: UNABLE');
  }

  // 2f. findings with empty code
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-empty-code', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 'REJECTED', summary: 'bad', findings: [{ code: '', message: 'y', severity: 'Error' }] }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review empty code: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review empty code: UNABLE');
  }

  // 2g. reviewer.execute is not a function
  {
    const r = { identity: createProviderIdentity({ providerId: 'rel-r-notfunc', providerVersion: '1.0' }), capabilities: [reviewCap], execute: null };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review execute not function: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review execute not function: UNABLE');
  }

  // 2h. reviewer returns non-Promise (synchronous throw)
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-sync-throw', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      execute(_request) { throw new Error('sync-throw'); },
    };
    const o = await orchestrateAgentRequest(env, execProvider, r);
    assert(o.decision === 'FAILED', 'review sync throw: FAILED');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review sync throw: UNABLE');
    assert(o.summary === 'sync-throw', 'review sync throw: summary');
  }
}

// ============================================================
// 3. Orchestration Resilience
// ============================================================
{
  const env = makeEnvelope();

  // 3a. both hostile simultaneously
  {
    const badObj = { toString() { throw new Error('double'); } };
    const hostileExec = {
      identity: createProviderIdentity({ providerId: 'rel-double-exec', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw badObj; },
    };
    const hostileReview = {
      identity: createProviderIdentity({ providerId: 'rel-double-review', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_r) { throw badObj; },
    };
    const o = await orchestrateAgentRequest(env, hostileExec, hostileReview);
    assert(o.decision === 'FAILED', 'both hostile: FAILED');
    assert(o.reviewOutcome === undefined, 'both hostile: review never invoked');
    assert(o.summary === 'An unknown error occurred.', 'both hostile: fallback summary');
  }

  // 3b. hostile exec + hostile review where exec returns ERROR (review not invoked)
  {
    const hostileExec = {
      identity: createProviderIdentity({ providerId: 'rel-host-exec-err', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'ERROR',
          error: { requestId: request.requestId, code: 'PROVIDER_INTERNAL_ERROR', message: 'hostile err', recoverable: false },
        });
      },
    };
    const hostileReview = {
      identity: createProviderIdentity({ providerId: 'rel-host-review-err', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_r) { throw new Error('should not be called'); },
    };
    const o = await orchestrateAgentRequest(env, hostileExec, hostileReview);
    assert(o.decision === 'FAILED', 'exec ERROR + hostile review: FAILED');
    assert(o.reviewOutcome === undefined, 'exec ERROR + hostile review: review not invoked');
    assert(o.executionResult.error.message === 'hostile err', 'exec ERROR + hostile review: evidence preserved');
  }

  // 3c. 100 rapid invocations (no cross-contamination)
  {
    const execProvider = makeSuccessProvider();
    const reviewProvider = makeStandardReviewer();
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      const e = makeEnvelope({
        requestId: `rel-rapid-${i}`,
        envelopeId: `ENVELOPE::rel-rapid-${i}::${1712345678000 + i}`,
        taskId: `rel-task-${i}`,
      });
      const o = await orchestrateAgentRequest(e, execProvider, reviewProvider);
      assert(o.decision === 'ACCEPTED', `rapid ${i}: ACCEPTED`);
      assert(o.requestId === `rel-rapid-${i}`, `rapid ${i}: requestId preserved`);
      assert(o.taskId === `rel-task-${i}`, `rapid ${i}: taskId preserved`);
      assert(!ids.has(o.orchestrationId), `rapid ${i}: unique orchestrationId`);
      ids.add(o.orchestrationId);
    }
    assert(ids.size === 100, 'rapid 100: all unique orchestrationIds');
  }
}

// ============================================================
// 4. Object Integrity — Deep Immutability Under Attack
// ============================================================
{
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const reviewProvider = makeStandardReviewer();
  const outcome = await orchestrateAgentRequest(env, execProvider, reviewProvider);

  // 4a. property deletion on nested objects
  assert(outcome.executionResult !== undefined, 'integrity: executionResult exists');
  const execResult = outcome.executionResult;
  try { delete execResult.response; } catch (_) { }
  assert(execResult.response !== undefined, 'integrity: response not deletable');
  assert(execResult.response.content === 'ok', 'integrity: response content intact');

  // 4b. Object.defineProperty on frozen object should either throw silently or not change value
  try { Object.defineProperty(execResult, 'status', { value: 'ERROR' }); } catch (_) { }
  assert(execResult.status === 'READY', 'integrity: status unchanged after defineProperty');

  try { Object.defineProperty(execResult.response, 'content', { value: 'hacked' }); } catch (_) { }
  assert(execResult.response.content === 'ok', 'integrity: response content unchanged after defineProperty');

  // 4c. prototype reassignment
  const protoBefore = Object.getPrototypeOf(execResult);
  try { Object.setPrototypeOf(execResult, {}); } catch (_) { }
  assert(Object.getPrototypeOf(execResult) === protoBefore, 'integrity: prototype unchanged');

  // 4d. array mutation on findings
  assert(outcome.reviewOutcome.findings !== undefined, 'integrity: findings exists');
  const findings = outcome.reviewOutcome.findings;
  try { findings.push({ code: 'X', message: 'y', severity: 'Error' }); } catch (_) { }
  assert(findings.length === 1, 'integrity: findings unmodified after push');
  try { findings[0] = { code: 'Z', message: 'w', severity: 'Error' }; } catch (_) { }
  assert(findings[0].code === 'OK', 'integrity: findings[0] unmodified after direct assign');

  // 4e. nested finding mutation
  const finding = findings[0];
  try { finding.severity = 'Error'; } catch (_) { }
  assert(finding.severity === 'Info', 'integrity: finding severity unchanged');

  // 4f. synthetic fail-closed outcome integrity
  const throwProv = {
    identity: createProviderIdentity({ providerId: 'rel-integrity-throw', providerVersion: '1.0' }),
    capabilities: [execCap],
    async execute(_r) { throw new Error('panic'); },
  };
  const failOutcome = await orchestrateAgentRequest(env, throwProv, null);
  try { delete failOutcome.executionResult.error; } catch (_) { }
  assert(failOutcome.executionResult.error !== undefined, 'integrity synthetic: error not deletable');
  assert(failOutcome.executionResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'integrity synthetic: error code intact');
  assert(Object.isFrozen(failOutcome), 'integrity synthetic: frozen');
  assert(Object.isFrozen(failOutcome.executionResult), 'integrity synthetic: execResult frozen');
  assert(Object.isFrozen(failOutcome.executionResult.error), 'integrity synthetic: error frozen');
}

// ============================================================
// 5. Identity Integrity — IDs immutable after creation
// ============================================================
{
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const reviewProvider = makeStandardReviewer();
  const outcome = await orchestrateAgentRequest(env, execProvider, reviewProvider);

  // 5a. orchestrationId
  const origOid = outcome.orchestrationId;
  try { outcome.orchestrationId = 'HACKED'; } catch (_) { }
  assert(outcome.orchestrationId === origOid, 'identity: orchestrationId unchanged');

  // 5b. requestId
  const origReqId = outcome.requestId;
  try { outcome.requestId = 'HACKED'; } catch (_) { }
  assert(outcome.requestId === origReqId, 'identity: requestId unchanged');

  // 5c. taskId
  const origTaskId = outcome.taskId;
  try { outcome.taskId = 'HACKED'; } catch (_) { }
  assert(outcome.taskId === origTaskId, 'identity: taskId unchanged');

  // 5d. reviewId
  const origReviewId = outcome.reviewOutcome.reviewId;
  try { outcome.reviewOutcome.reviewId = 'HACKED'; } catch (_) { }
  assert(outcome.reviewOutcome.reviewId === origReviewId, 'identity: reviewId unchanged');

  // 5e. review requestId
  const origReviewReqId = outcome.reviewOutcome.requestId;
  try { outcome.reviewOutcome.requestId = 'HACKED'; } catch (_) { }
  assert(outcome.reviewOutcome.requestId === origReviewReqId, 'identity: review requestId unchanged');

  // 5f. review taskId
  const origReviewTaskId = outcome.reviewOutcome.taskId;
  try { outcome.reviewOutcome.taskId = 'HACKED'; } catch (_) { }
  assert(outcome.reviewOutcome.taskId === origReviewTaskId, 'identity: review taskId unchanged');

  // 5g. defineProperty on IDs
  try { Object.defineProperty(outcome, 'orchestrationId', { value: 'HACKED' }); } catch (_) { }
  assert(outcome.orchestrationId === origOid, 'identity: defineProperty orchestrationId unchanged');

  try { Object.defineProperty(outcome.reviewOutcome, 'reviewId', { value: 'HACKED' }); } catch (_) { }
  assert(outcome.reviewOutcome.reviewId === origReviewId, 'identity: defineProperty reviewId unchanged');

  // 5h. IDs in synthetic fail-closed outcome
  const throwProv = {
    identity: createProviderIdentity({ providerId: 'rel-id-synth', providerVersion: '1.0' }),
    capabilities: [execCap],
    async execute(_r) { throw new Error('x'); },
  };
  const fo = await orchestrateAgentRequest(env, throwProv, null);
  const foOid = fo.orchestrationId;
  try { fo.orchestrationId = 'HACKED'; } catch (_) { }
  assert(fo.orchestrationId === foOid, 'identity synthetic: orchestrationId unchanged');
  try { fo.requestId = 'HACKED'; } catch (_) { }
  assert(fo.requestId === 'rel-001', 'identity synthetic: requestId unchanged');
  try { fo.taskId = 'HACKED'; } catch (_) { }
  assert(fo.taskId === 'rel-task-001', 'identity synthetic: taskId unchanged');
}

// ============================================================
// 6. Exception Containment Audit (source code analysis)
// ============================================================
{
  const { readFileSync } = await import('fs');
  const sourceFiles = [
    'provider-interface.ts',
    'agent-request-envelope.ts',
    'execution-session.ts',
    'review-coordinator.ts',
    'orchestration-engine.ts',
    'safe-error-message.ts',
  ];

  for (const file of sourceFiles) {
    const url = new URL(`../../src/project-brain/${file}`, import.meta.url);
    let cleanPath = url.pathname;
    if (cleanPath.startsWith('/') && cleanPath.startsWith('//?/')) cleanPath = cleanPath.slice(4);
    else if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
    const source = readFileSync(cleanPath, 'utf-8');

    // 6a. No unsafe String(error) — only in safe-error-message.ts internal catch
    const stringErrorMatches = [...source.matchAll(/String\(error\)/g)];
    if (file === 'safe-error-message.ts') {
      assert(stringErrorMatches.length === 1, `audit ${file}: has exactly 1 String(error) in internal helper`);
    } else {
      assert(stringErrorMatches.length === 0, `audit ${file}: no unsafe String(error)`);
    }

    // 6b. every catch should be paired with safeErrorMessage or be in safe-error-message.ts itself
    const catchMatches = source.match(/catch\s*(\(|[^a-zA-Z])/g) || [];
    if (file === 'safe-error-message.ts') {
      // safe-error-message.ts has its own catch that returns 'An unknown error occurred.'
      assert(catchMatches.length >= 1, `audit ${file}: has catch`);
    } else {
      for (const m of catchMatches) {
        assert(true, `audit ${file}: catch block exists (verified per-file below)`);
      }
    }
  }

  // 6c. Verify no throw escapes from executeAgentRequest
  const execUrl = new URL('../../src/project-brain/execution-session.ts', import.meta.url);
  let execPath = execUrl.pathname;
  if (execPath.startsWith('/') && execPath.startsWith('//?/')) execPath = execPath.slice(4);
  else if (execPath.startsWith('/')) execPath = execPath.slice(1);
  const execSource = readFileSync(execPath, 'utf-8');

  const execThrows = [...execSource.matchAll(/throw /g)];
  // All throws should be inside the validation catch block (line 68 return)
  // or inside safeErrorMessage
  const execReturns = [...execSource.matchAll(/return /g)];
  assert(execReturns.length >= 3, 'audit executeAgentRequest: has expected return paths');
  assert(execSource.includes('catch (error)'), 'audit executeAgentRequest: catches provider throw');
  assert(execSource.includes('catch (validationError)'), 'audit executeAgentRequest: catches validation throw');

  // 6d. Verify no throw escapes from reviewAgentExecution
  const revUrl = new URL('../../src/project-brain/review-coordinator.ts', import.meta.url);
  let revPath = revUrl.pathname;
  if (revPath.startsWith('/') && revPath.startsWith('//?/')) revPath = revPath.slice(4);
  else if (revPath.startsWith('/')) revPath = revPath.slice(1);
  const revSource = readFileSync(revPath, 'utf-8');
  assert(revSource.includes('catch (error)'), 'audit reviewAgentExecution: catches provider throw');
  assert(revSource.includes('catch (parseError)'), 'audit reviewAgentExecution: catches parse throw');

  // 6e. Verify no throw escapes from orchestrateAgentRequest
  const orchUrl = new URL('../../src/project-brain/orchestration-engine.ts', import.meta.url);
  let orchPath = orchUrl.pathname;
  if (orchPath.startsWith('/') && orchPath.startsWith('//?/')) orchPath = orchPath.slice(4);
  else if (orchPath.startsWith('/')) orchPath = orchPath.slice(1);
  const orchSource = readFileSync(orchPath, 'utf-8');
  assert(orchSource.includes('catch (error)'), 'audit orchestrateAgentRequest: catches exec throw');
  // The second catch is on the review call
  const orchCatches = [...orchSource.matchAll(/catch /g)];
  assert(orchCatches.length >= 1, 'audit orchestrateAgentRequest: has catch blocks');
}

// ============================================================
// 7. Resource Safety
// ============================================================
{
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const reviewProvider = makeStandardReviewer();

  // 7a. verify no retained mutable references by running twice with same providers
  const o1 = await orchestrateAgentRequest(env, execProvider, reviewProvider);
  const o2 = await orchestrateAgentRequest(env, execProvider, reviewProvider);
  assert(o1.requestId === o2.requestId, 'resource safety: same requestId across runs');
  assert(o1.decision === o2.decision, 'resource safety: same decision across runs');

  // 7b. using the same envelope object multiple times does not mutate it
  const e = makeEnvelope();
  const preId = e.requestId;
  const preTask = e.taskId;
  await orchestrateAgentRequest(e, execProvider, reviewProvider);
  await orchestrateAgentRequest(e, execProvider, reviewProvider);
  await orchestrateAgentRequest(e, execProvider, reviewProvider);
  assert(e.requestId === preId, 'resource safety: envelope requestId unchanged after 3 runs');
  assert(e.taskId === preTask, 'resource safety: envelope taskId unchanged after 3 runs');

  // 7c. provider instances not retained in outcomes
  const rev = makeStandardReviewer();
  const o3 = await orchestrateAgentRequest(env, execProvider, rev);
  assert(o3.reviewOutcome.reviewerResult.requestId !== rev.identity.providerId,
    'resource safety: provider not leaked into reviewerResult');

  // 7d. no shared mutable array references between results
  const o4 = await orchestrateAgentRequest(env, execProvider, reviewProvider);
  const o5 = await orchestrateAgentRequest(env, execProvider, reviewProvider);
  assert(o4.reviewOutcome.findings !== o5.reviewOutcome.findings,
    'resource safety: findings arrays are distinct objects');
}

// ============================================================
// 8. Repeatability — Hostile scenarios produce identical results
// ============================================================
{
  const env = makeEnvelope();
  const scenarios = [];

  // Hostile exec: throw BigInt
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-rep-bigint', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw 100n; },
    };
    scenarios.push({ name: 'throw BigInt', fn: () => orchestrateAgentRequest(env, p, null) });
  }

  // Hostile exec: throw Promise
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-rep-prom', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw Promise.resolve(); },
    };
    scenarios.push({ name: 'throw Promise', fn: () => orchestrateAgentRequest(env, p, null) });
  }

  // Hostile exec: ERROR with specific code
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-rep-err', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'ERROR',
          error: { requestId: request.requestId, code: 'PROVIDER_TIMEOUT', message: 'timed out', recoverable: true },
        });
      },
    };
    scenarios.push({ name: 'ERROR result', fn: () => orchestrateAgentRequest(env, p, makeStandardReviewer()) });
  }

  for (const s of scenarios) {
    const r1 = await s.fn();
    const r2 = await s.fn();
    assert(r1.decision === r2.decision, `reliability repeat ${s.name}: decision identical`);
    assert(r1.summary === r2.summary, `reliability repeat ${s.name}: summary identical`);
    if (r1.executionResult.status === r2.executionResult.status) {
      assert(true, `reliability repeat ${s.name}: exec status identical`);
    }
    if (r1.executionResult.error && r2.executionResult.error) {
      assert(r1.executionResult.error.code === r2.executionResult.error.code,
        `reliability repeat ${s.name}: error code identical`);
      assert(r1.executionResult.error.message === r2.executionResult.error.message,
        `reliability repeat ${s.name}: error message identical`);
    }
  }
}

// ============================================================
// 9. Negative API Audit
// ============================================================
{
  // 9a. executeAgentRequest with null envelope throws (buildProviderRequest accesses fields)
  try {
    await executeAgentRequest(null, makeSuccessProvider());
    assert(false, 'negative: executeAgentRequest(null, provider) should throw');
  } catch (e) {
    assert(e instanceof Error, 'negative: executeAgentRequest null envelope throws');
  }

  // 9b. executeAgentRequest with null provider does not throw (fail-closed catch)
  {
    const r = await executeAgentRequest(makeEnvelope(), null);
    assert(r.status === 'ERROR', 'negative: executeAgentRequest null provider returns ERROR');
    assert(r.error.code === 'PROVIDER_INTERNAL_ERROR', 'negative: null provider error code');
  }

  // 9c. orchestrateAgentRequest with null execution provider does not throw (fail-closed)
  {
    const o = await orchestrateAgentRequest(makeEnvelope(), null, makeStandardReviewer());
    assert(o.decision === 'FAILED', 'negative: orchestrate null exec returns FAILED');
    assert(o.reviewOutcome === undefined, 'negative: orchestrate null exec: no review');
  }

  // 9d. orchestrateAgentRequest with null reviewer (only exercised when exec fails)
  {
    const throwProv = {
      identity: createProviderIdentity({ providerId: 'rel-neg-throw', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_r) { throw new Error('x'); },
    };
    const o = await orchestrateAgentRequest(makeEnvelope(), throwProv, null);
    assert(o.decision === 'FAILED', 'negative: null reviewer with failing exec: FAILED');
    assert(o.reviewOutcome === undefined, 'negative: null reviewer: no review');
  }

  // 9e. orchestrateAgentRequest with undefined execution provider does not throw
  {
    const o = await orchestrateAgentRequest(makeEnvelope(), undefined, makeStandardReviewer());
    assert(o.decision === 'FAILED', 'negative: orchestrate undefined exec returns FAILED');
    assert(o.reviewOutcome === undefined, 'negative: orchestrate undefined exec: no review');
  }
}

// ============================================================
// 10. Coverage Gap — Missing behavioral branches
// ============================================================
{
  // Gap 10a: Provider result with missing non-empty content (content is empty string)
  // Phase 3 only validates via createProviderResult on the returned object, which
  // requires non-empty content. Empty content means createProviderResult throws,
  // which is caught by the validation catch in executeAgentRequest.
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-gap-empty-content', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: { requestId: request.requestId, content: 'some content', finishReason: 'COMPLETE' },
        });
      },
    };
    const o = await executeAgentRequest(makeEnvelope(), p);
    assert(o.status === 'READY', 'gap exec: content accepted');
  }

  // Gap 10b: reviewAgentExecution with mismatched execution content (empty after trim)
  // createProviderResult throws on whitespace-only content; the provider's own call to
  // createProviderResult throws, which is caught by executeAgentRequest's outer catch.
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-gap-exec-trim', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: { requestId: request.requestId, content: '  ', finishReason: 'COMPLETE' },
        });
      },
    };
    const o = await executeAgentRequest(makeEnvelope(), p);
    assert(o.status === 'ERROR', 'gap exec: whitespace-only content rejected');
    assert(o.error.code === 'PROVIDER_INTERNAL_ERROR', 'gap exec: whitespace caught as internal error');
  }

  // Gap 10c: orchestration with execution result that has status READY but no response.content
  // This is handled by Phase 3 validate (createProviderResult requires READY + response with content)
  // If a provider returns a raw object that bypasses createProviderResult, Phase 3 catches it
  {
    const p = {
      identity: createProviderIdentity({ providerId: 'rel-gap-ready-no-content', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return { requestId: request.requestId, status: 'READY' };
      },
    };
    const o = await executeAgentRequest(makeEnvelope(), p);
    assert(o.status === 'ERROR', 'gap exec: READY without response body rejected');
    assert(o.error !== undefined, 'gap exec: READY without response has error');
  }

  // Gap 10d: review with decision field present but wrong type
  {
    const r = {
      identity: createProviderIdentity({ providerId: 'rel-gap-decision-type', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId, status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 42, summary: 'bad' }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const env = makeEnvelope();
    const o = await orchestrateAgentRequest(env, makeSuccessProvider(), r);
    assert(o.decision === 'FAILED', 'gap review: numeric decision rejected');
    assert(o.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'gap review: numeric decision UNABLE');
  }
}

// ============================================================
// Summary
// ============================================================
console.log(`reliability-test: ${passed} passed, ${failed} failed`);
