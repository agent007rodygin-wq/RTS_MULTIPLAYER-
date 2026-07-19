// Consumer-style test: uses ONLY public exports from index.ts
// Pretends Package I is an external dependency.

import {
  createProviderIdentity,
  createProviderCapability,
  createProviderResult,
  createProviderRequest,
} from '../../src/project-brain/index.ts';
import {
  createAgentRequestEnvelope,
} from '../../src/project-brain/index.ts';
import {
  executeAgentRequest,
} from '../../src/project-brain/index.ts';
import {
  reviewAgentExecution,
  createReviewFinding,
} from '../../src/project-brain/index.ts';
import {
  orchestrateAgentRequest,
} from '../../src/project-brain/index.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [public-api-contract]: ${name}`);
    failed++;
  }
}

// ============================================================
// Shared helpers (built entirely from public API)
// ============================================================
const execCap = createProviderCapability({ type: 'execution', description: 'Executes' });
const reviewCap = createProviderCapability({ type: 'review', description: 'Reviews' });

function makeEnvelope(overrides = {}) {
  return createAgentRequestEnvelope({
    envelopeId: 'ENVELOPE::contract-001::1712345678',
    requestId: 'contract-001',
    taskId: 'contract-task-001',
    sessionId: 'BRAIN-SESSION::contract-001::contract-task-001::ANALYSIS',
    contextRequestId: 'ctx-contract-001',
    objective: 'Public API contract test',
    outputClass: 'analysis',
    constraints: ['verify'],
    sourceRevision: 'abc123',
    createdAt: 1712345678000,
    ...overrides,
  });
}

function makeApprovalContent() {
  return JSON.stringify({
    decision: 'APPROVED',
    summary: 'Contract verified.',
    findings: [{ code: 'CONTRACT', message: 'All checks pass', severity: 'Info' }],
  });
}

function makeSuccessProvider() {
  const identity = createProviderIdentity({ providerId: 'contract-exec', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [execCap],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: { requestId: request.requestId, content: 'contract output', finishReason: 'COMPLETE' },
      });
    },
  };
}

function makeStandardReviewer() {
  const identity = createProviderIdentity({ providerId: 'contract-review', providerVersion: '1.0' });
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
// 1. Normal Workflow — Full Pipeline
// ============================================================
{
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const reviewer = makeStandardReviewer();

  // executeAgentRequest
  const execResult = await executeAgentRequest(env, execProvider);
  assert(execResult.status === 'READY', 'normal: executeAgentRequest returns READY');
  assert(execResult.response.content === 'contract output', 'normal: execution content correct');
  assert(execResult.requestId === 'contract-001', 'normal: execution requestId correct');

  // reviewAgentExecution
  const reviewOutcome = await reviewAgentExecution(env, execResult, reviewer);
  assert(reviewOutcome.decision === 'APPROVED', 'normal: review decision APPROVED');
  assert(reviewOutcome.requestId === 'contract-001', 'normal: review requestId matches');
  assert(reviewOutcome.reviewId === 'REVIEW::contract-001', 'normal: reviewId correct');

  // createReviewFinding
  const finding = createReviewFinding({ code: 'CONTRACT', message: 'test', severity: 'Warning' });
  assert(finding.code === 'CONTRACT', 'normal: createReviewFinding code');
  assert(finding.severity === 'Warning', 'normal: createReviewFinding severity');

  // orchestrateAgentRequest
  const outcome = await orchestrateAgentRequest(env, execProvider, reviewer);
  assert(outcome.decision === 'ACCEPTED', 'normal: orchestration ACCEPTED');
  assert(outcome.orchestrationId === 'ORCHESTRATION::contract-001', 'normal: orchestrationId correct');
  assert(outcome.requestId === 'contract-001', 'normal: orchestration requestId correct');
  assert(outcome.taskId === 'contract-task-001', 'normal: orchestration taskId correct');
  assert(Object.isFrozen(outcome), 'normal: outcome frozen');
  assert(Object.isFrozen(outcome.executionResult), 'normal: executionResult frozen');
  assert(Object.isFrozen(outcome.reviewOutcome), 'normal: reviewOutcome frozen');
}

// ============================================================
// 2. Execution Failure
// ============================================================
{
  const env = makeEnvelope();
  const errorProvider = {
    identity: createProviderIdentity({ providerId: 'contract-error', providerVersion: '1.0' }),
    capabilities: [execCap],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'ERROR',
        error: { requestId: request.requestId, code: 'PROVIDER_TIMEOUT', message: 'Timed out', recoverable: true },
      });
    },
  };
  const execResult = await executeAgentRequest(env, errorProvider);
  assert(execResult.status === 'ERROR', 'exec failure: executeAgentRequest returns ERROR');
  assert(execResult.error.code === 'PROVIDER_TIMEOUT', 'exec failure: error code preserved');
  assert(execResult.response === undefined, 'exec failure: no response');

  // Orchestration with failing exec
  const outcome = await orchestrateAgentRequest(env, errorProvider, null);
  assert(outcome.decision === 'FAILED', 'exec failure: orchestration FAILED');
  assert(outcome.reviewOutcome === undefined, 'exec failure: no review');
  assert(outcome.executionResult.status === 'ERROR', 'exec failure: evidence preserved');
}

// ============================================================
// 3. Review Failure
// ============================================================
{
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const execResult = await executeAgentRequest(env, execProvider);

  // Reviewer throws
  const throwingReviewer = {
    identity: createProviderIdentity({ providerId: 'contract-throw-review', providerVersion: '1.0' }),
    capabilities: [reviewCap],
    async execute(_request) { throw new Error('Review infrastructure failure'); },
  };
  const reviewOutcome = await reviewAgentExecution(env, execResult, throwingReviewer);
  assert(reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review failure: UNABLE');
  assert(reviewOutcome.reviewerResult.status === 'ERROR', 'review failure: reviewerResult ERROR');

  // Orchestration with throwing reviewer
  const outcome = await orchestrateAgentRequest(env, execProvider, throwingReviewer);
  assert(outcome.decision === 'FAILED', 'review failure: orchestration FAILED');
  assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review failure: review UNABLE');
  assert(outcome.executionResult.status === 'READY', 'review failure: execution evidence preserved');
}

// ============================================================
// 4. Orchestration Failure
// ============================================================
{
  const env = makeEnvelope();
  const mismatchedProvider = {
    identity: createProviderIdentity({ providerId: 'contract-mismatch', providerVersion: '1.0' }),
    capabilities: [execCap],
    async execute(_request) {
      return createProviderResult({
        requestId: 'wrong-id',
        status: 'READY',
        response: { requestId: 'wrong-id', content: 'mismatched evidence', finishReason: 'COMPLETE' },
      });
    },
  };
  const reviewer = makeStandardReviewer();
  const outcome = await orchestrateAgentRequest(env, mismatchedProvider, reviewer);

  assert(outcome.decision === 'FAILED', 'orchestration failure: correlation mismatch FAILED');
  assert(outcome.reviewOutcome === undefined, 'orchestration failure: review not invoked');
  assert(outcome.summary.includes('requestId'), 'orchestration failure: summary mentions mismatch');
  assert(outcome.executionResult.response.content === 'mismatched evidence', 'orchestration failure: evidence preserved');
}

// ============================================================
// 5. Immutability (via public API only)
// ============================================================
{
  const env = makeEnvelope();
  const outcome = await orchestrateAgentRequest(env, makeSuccessProvider(), makeStandardReviewer());

  // Attempt mutation
  try { outcome.decision = 'FAILED'; } catch (_) { }
  assert(outcome.decision === 'ACCEPTED', 'immut: decision unchanged');

  try { outcome.orchestrationId = 'hacked'; } catch (_) { }
  assert(outcome.orchestrationId === 'ORCHESTRATION::contract-001', 'immut: orchestrationId unchanged');

  try { outcome.executionResult.status = 'ERROR'; } catch (_) { }
  assert(outcome.executionResult.status === 'READY', 'immut: executionResult unchanged');

  try { outcome.reviewOutcome.decision = 'REJECTED'; } catch (_) { }
  assert(outcome.reviewOutcome.decision === 'APPROVED', 'immut: reviewOutcome unchanged');

  // Nested finding
  try { outcome.reviewOutcome.findings[0].severity = 'Error'; } catch (_) { }
  assert(outcome.reviewOutcome.findings[0].severity === 'Info', 'immut: finding severity unchanged');

  // Frozen checks
  assert(Object.isFrozen(outcome), 'immut: outcome frozen');
  assert(Object.isFrozen(outcome.executionResult), 'immut: executionResult frozen');
  assert(Object.isFrozen(outcome.executionResult.response), 'immut: response frozen');
  assert(Object.isFrozen(outcome.reviewOutcome), 'immut: reviewOutcome frozen');
  assert(Object.isFrozen(outcome.reviewOutcome.findings), 'immut: findings frozen');
  assert(Object.isFrozen(outcome.reviewOutcome.reviewerResult), 'immut: reviewerResult frozen');
}

// ============================================================
// 6. Public API Completeness
// ============================================================
{
  // Verify every expected export is present and callable
  assert(typeof createProviderIdentity === 'function', 'completeness: createProviderIdentity');
  assert(typeof createProviderCapability === 'function', 'completeness: createProviderCapability');
  assert(typeof createProviderResult === 'function', 'completeness: createProviderResult');
  assert(typeof createProviderRequest === 'function', 'completeness: createProviderRequest');
  assert(typeof createAgentRequestEnvelope === 'function', 'completeness: createAgentRequestEnvelope');
  assert(typeof executeAgentRequest === 'function', 'completeness: executeAgentRequest');
  assert(typeof reviewAgentExecution === 'function', 'completeness: reviewAgentExecution');
  assert(typeof createReviewFinding === 'function', 'completeness: createReviewFinding');
  assert(typeof orchestrateAgentRequest === 'function', 'completeness: orchestrateAgentRequest');

  // Verify constructors produce typed objects
  const identity = createProviderIdentity({ providerId: 'test', providerVersion: '1.0' });
  assert(identity.providerId === 'test', 'completeness: createProviderIdentity.providerId');
  assert(identity.providerVersion === '1.0', 'completeness: createProviderIdentity.providerVersion');
  assert(Object.isFrozen(identity), 'completeness: provider identity frozen');

  const capability = createProviderCapability({ type: 'execution', description: 'test' });
  assert(capability.type === 'execution', 'completeness: createProviderCapability.type');
  assert(Object.isFrozen(capability), 'completeness: capability frozen');

  const request = createProviderRequest({ requestId: 'r1', taskId: 't1', prompt: 'do it' });
  assert(request.requestId === 'r1', 'completeness: createProviderRequest.requestId');
  assert(Object.isFrozen(request), 'completeness: request frozen');

  const result = createProviderResult({
    requestId: 'r1',
    status: 'READY',
    response: { requestId: 'r1', content: 'done', finishReason: 'COMPLETE' },
  });
  assert(result.status === 'READY', 'completeness: createProviderResult');
  assert(Object.isFrozen(result), 'completeness: result frozen');
  assert(Object.isFrozen(result.response), 'completeness: result.response frozen');

  // Verify functions return expected shapes
  const env = makeEnvelope();
  const execProvider = makeSuccessProvider();

  const execPromise = executeAgentRequest(env, execProvider);
  assert(execPromise instanceof Promise, 'completeness: executeAgentRequest returns Promise');

  const execResult = await execPromise;
  assert(execResult.status === 'READY' || execResult.status === 'ERROR', 'completeness: valid result status');

  const reviewResult = await reviewAgentExecution(env, execResult, makeStandardReviewer());
  assert(typeof reviewResult.reviewId === 'string', 'completeness: reviewOutcome has reviewId');
  assert(typeof reviewResult.requestId === 'string', 'completeness: reviewOutcome has requestId');
  assert(typeof reviewResult.summary === 'string', 'completeness: reviewOutcome has summary');
  assert(Array.isArray(reviewResult.findings), 'completeness: reviewOutcome has findings');

  const orchResult = await orchestrateAgentRequest(env, execProvider, makeStandardReviewer());
  assert(typeof orchResult.orchestrationId === 'string', 'completeness: OrchestrationOutcome has orchestrationId');
  assert(orchResult.decision === 'ACCEPTED' || orchResult.decision === 'REJECTED' || orchResult.decision === 'FAILED',
    'completeness: valid decision');
}

// ============================================================
// Summary
// ============================================================
console.log(`public-api-contract-test: ${passed} passed, ${failed} failed`);
