import {
  createProviderIdentity,
  createProviderCapability,
  createProviderRequest,
  createProviderResult,
} from '../../src/project-brain/provider-interface.ts';
import { createAgentRequestEnvelope } from '../../src/project-brain/agent-request-envelope.ts';
import {
  reviewAgentExecution,
  createReviewFinding,
} from '../../src/project-brain/review-coordinator.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [review-coordinator]: ${name}`);
    failed++;
  }
}

// ============================================================
// Helpers
// ============================================================
const reviewCapability = createProviderCapability({ type: 'review', description: 'Reviews work' });
const executionCapability = createProviderCapability({ type: 'execution', description: 'Executes' });

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
    ...overrides,
  });
}

function makeExecutionResult(overrides = {}) {
  const base = {
    requestId: 'req-001',
    status: 'READY',
    response: {
      requestId: 'req-001',
      content: 'def analyze(): pass',
      finishReason: 'COMPLETE',
    },
  };
  const merged = { ...base, ...overrides };
  if (overrides.requestId && merged.response && merged.response.requestId === 'req-001') {
    merged.response = { ...merged.response, requestId: overrides.requestId };
  }
  return createProviderResult(merged);
}

function makeReviewerProvider(providerId = 'reviewer-a', responseContent = null) {
  const identity = createProviderIdentity({ providerId, providerVersion: '1.0' });
  const defaultContent = JSON.stringify({
    decision: 'APPROVED',
    summary: 'Looks good.',
    findings: [{ code: 'CODE-QUALITY', message: 'Code is clean', severity: 'Info' }],
  });
  return {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: responseContent !== null ? responseContent : defaultContent,
          finishReason: 'COMPLETE',
        },
      });
    },
  };
}

function makeRejectingReviewer(code = 'PROVIDER_UNAVAILABLE', message = 'Service down') {
  const identity = createProviderIdentity({ providerId: 'review-reject', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'ERROR',
        error: { requestId: request.requestId, code, message, recoverable: true },
      });
    },
  };
}

function makeThrowingReviewer(errorMessage = 'Review connection failed') {
  const identity = createProviderIdentity({ providerId: 'review-throw', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [reviewCapability],
    async execute(_request) {
      throw new Error(errorMessage);
    },
  };
}

// ============================================================
// Successful Review — Approved
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const reviewer = makeReviewerProvider();
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'APPROVED', 'approved decision');
  assert(outcome.summary === 'Looks good.', 'approved summary');
  assert(outcome.findings.length === 1, 'approved findings count');
  assert(outcome.findings[0].code === 'CODE-QUALITY', 'approved finding code');
  assert(outcome.findings[0].severity === 'Info', 'approved finding severity');
  assert(outcome.requestId === 'req-001', 'approved requestId');
  assert(outcome.taskId === 'task-001', 'approved taskId');
  assert(outcome.reviewId === 'REVIEW::req-001', 'approved reviewId');
  assert(outcome.reviewerResult.status === 'READY', 'approved reviewerResult status');
  assert(outcome.reviewerResult.response.content.includes('APPROVED'), 'approved reviewerResult content');
  assert(Object.isFrozen(outcome), 'outcome is frozen');
  assert(Object.isFrozen(outcome.findings), 'findings is frozen');
  assert(Object.isFrozen(outcome.findings[0]), 'finding is frozen');
  assert(Object.isFrozen(outcome.reviewerResult), 'reviewerResult is frozen');
}

// ============================================================
// Successful Review — Rejected
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const rejectContent = JSON.stringify({
    decision: 'REJECTED',
    summary: 'Missing error handling.',
    findings: [
      { code: 'ERROR-HANDLING', message: 'No try/catch around main logic', severity: 'Error' },
    ],
  });
  const reviewer = makeReviewerProvider('reviewer-b', rejectContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'REJECTED', 'rejected decision');
  assert(outcome.summary === 'Missing error handling.', 'rejected summary');
  assert(outcome.findings.length === 1, 'rejected findings count');
  assert(outcome.findings[0].code === 'ERROR-HANDLING', 'rejected finding code');
  assert(outcome.findings[0].severity === 'Error', 'rejected finding severity');
}

// ============================================================
// Successful Review — Unable To Review
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const unableContent = JSON.stringify({
    decision: 'UNABLE_TO_REVIEW',
    summary: 'Missing context to evaluate.',
    findings: [],
  });
  const reviewer = makeReviewerProvider('reviewer-c', unableContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'unable decision');
  assert(outcome.summary === 'Missing context to evaluate.', 'unable summary');
  assert(outcome.findings.length === 0, 'unable findings empty');
}

// ============================================================
// Structured Findings
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const findingsContent = JSON.stringify({
    decision: 'REJECTED',
    summary: 'Multiple issues found.',
    findings: [
      { code: 'SECURITY', message: 'SQL injection risk', severity: 'Error' },
      { code: 'PERFORMANCE', message: 'N+1 query pattern', severity: 'Warning' },
      { code: 'STYLE', message: 'Use const instead of let', severity: 'Info' },
    ],
  });
  const reviewer = makeReviewerProvider('reviewer-d', findingsContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'REJECTED', 'findings decision');
  assert(outcome.findings.length === 3, 'findings count');
  assert(outcome.findings[0].code === 'PERFORMANCE', 'findings sorted by code (PERFORMANCE)');
  assert(outcome.findings[1].code === 'SECURITY', 'findings sorted by code (SECURITY)');
  assert(outcome.findings[2].code === 'STYLE', 'findings sorted by code (STYLE)');
}

// ============================================================
// Reviewer Request Construction
// ============================================================
{
  let capturedRequest = null;
  const envelope = makeEnvelope({
    objective: 'Analyze the production system',
    constraints: ['use typescript', 'be concise'],
  });
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-capture', providerVersion: '1.0' });
  const capturingReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      capturedRequest = request;
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: JSON.stringify({ decision: 'APPROVED', summary: 'OK', findings: [] }),
          finishReason: 'COMPLETE',
        },
      });
    },
  };

  await reviewAgentExecution(envelope, executionResult, capturingReviewer);

  assert(capturedRequest !== null, 'reviewer invoked');
  assert(capturedRequest.requestId === 'REVIEW::req-001', 'review requestId');
  assert(capturedRequest.taskId === 'task-001', 'review taskId');
  assert(capturedRequest.prompt.includes('Analyze the production system'), 'prompt includes objective');
  assert(capturedRequest.prompt.includes('use typescript'), 'prompt includes constraints');
  assert(capturedRequest.prompt.includes('be concise'), 'prompt includes all constraints');
  assert(capturedRequest.prompt.includes('def analyze(): pass'), 'prompt includes execution output');
  assert(capturedRequest.prompt.includes('analysis'), 'prompt includes output class');
  assert(capturedRequest.constraints.length === 2, 'review request has constraints');
  assert(capturedRequest.requiredCapabilities.length === 1, 'review request has one required capability');
  assert(capturedRequest.requiredCapabilities[0] === 'review', 'review request requires review capability');
  assert(Object.isFrozen(capturedRequest), 'review request is frozen');
}

// ============================================================
// Reviewer Invoked Exactly Once
// ============================================================
{
  let invokeCount = 0;
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-counter', providerVersion: '1.0' });
  const countingReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      invokeCount++;
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: JSON.stringify({ decision: 'APPROVED', summary: 'OK', findings: [] }),
          finishReason: 'COMPLETE',
        },
      });
    },
  };

  await reviewAgentExecution(envelope, executionResult, countingReviewer);
  assert(invokeCount === 1, 'reviewer invoked exactly once');
}

// ============================================================
// Precondition: Mismatched requestId
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult({ requestId: 'req-999' });
  const reviewer = makeReviewerProvider();
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'mismatched ID decision');
  assert(outcome.summary.includes('does not match'), 'mismatched ID summary');
  assert(outcome.findings.length === 0, 'mismatched ID no findings');
}

// ============================================================
// Precondition: Execution result is ERROR
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult({
    status: 'ERROR',
    response: undefined,
    error: { requestId: 'req-001', code: 'PROVIDER_INTERNAL_ERROR', message: 'Failed', recoverable: true },
  });
  const reviewer = makeReviewerProvider();
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'error result decision');
  assert(outcome.summary.includes('not READY'), 'error result summary');
  assert(outcome.findings.length === 0, 'error result no findings');
}

// ============================================================
// Precondition: Execution result is reviewable
// Phase 1 guarantees that a READY ProviderResult has a non-empty response content.
// The coordinator defensively checks both fields for safety against
// non-constructor-created results.
// ============================================================
{
  const envelope = makeEnvelope();
  const reviewer = makeReviewerProvider();

  // Verify that a normal result passes the check
  const normalResult = makeExecutionResult();
  const outcome = await reviewAgentExecution(envelope, normalResult, reviewer);
  assert(outcome.decision === 'APPROVED', 'normal result is reviewable');
}

// ============================================================
// Reviewer throws Error
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const reviewer = makeThrowingReviewer('Review service unavailable');
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'throw Error decision');
  assert(outcome.summary.includes('Review service unavailable'), 'throw Error summary preserved');
  assert(outcome.findings.length === 0, 'throw Error no findings');
  assert(outcome.reviewerResult.status === 'ERROR', 'throw Error synthetic result status');
  assert(outcome.reviewerResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'throw Error synthetic code');
  assert(outcome.reviewerResult.error.recoverable === true, 'throw Error synthetic recoverable');
}

// ============================================================
// Reviewer throws non-Error value
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-throw-str', providerVersion: '1.0' });
  const throwStringReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(_request) {
      throw 'string error'; // eslint-disable-line no-throw-literal
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, throwStringReviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'throw string decision');
  assert(outcome.summary === 'string error', 'throw string summary preserved');
}

// ============================================================
// Reviewer returns non-object result
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-nonobj', providerVersion: '1.0' });
  const nonObjReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(_request) {
      return 'string-result'; // eslint-disable-line no-throw-literal
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, nonObjReviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'non-object result decision');
  assert(outcome.summary === 'Reviewer returned a non-object result.', 'non-object summary');
  assert(outcome.reviewerResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'non-object error code');
}

// ============================================================
// Reviewer returns null
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-null', providerVersion: '1.0' });
  const nullReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(_request) {
      return null;
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, nullReviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'null result decision');
}

// ============================================================
// Reviewer returns array
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-array', providerVersion: '1.0' });
  const arrayReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(_request) {
      return [];
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, arrayReviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'array result decision');
}

// ============================================================
// Reviewer returns malformed ProviderResult
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-malformed', providerVersion: '1.0' });
  const malformedReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      // Return a ProviderResult-like object but with invalid status
      return { requestId: request.requestId, status: 'INVALID' };
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, malformedReviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'malformed result decision');
  assert(outcome.reviewerResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'malformed error code');
}

// ============================================================
// Reviewer returns READY without content
// Phase 1 enforces non-empty content via createProviderResponse,
// so the constructor throws inside the mock reviewer.
// The coordinator catches this as a provider exception (PROVIDER_INTERNAL_ERROR).
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-nocontent', providerVersion: '1.0' });
  const noContentReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: { requestId: request.requestId, content: '', finishReason: 'COMPLETE' },
      });
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, noContentReviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'no content decision');
  assert(outcome.reviewerResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'no content error code');
  assert(outcome.reviewerResult.error.recoverable === true, 'no content recoverable');
}

// ============================================================
// Reviewer returns invalid JSON content
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const invalidJson = '{ this is not json }';
  const reviewer = makeReviewerProvider('review-badjson', invalidJson);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'invalid JSON decision');
}

// ============================================================
// Reviewer returns invalid decision value
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const invalidDecision = JSON.stringify({ decision: 'INVALID', summary: 'test', findings: [] });
  const reviewer = makeReviewerProvider('review-baddec', invalidDecision);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'invalid decision decision');
}

// ============================================================
// Reviewer returns APPROVED with Error findings
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const contradictoryContent = JSON.stringify({
    decision: 'APPROVED',
    summary: 'But has errors',
    findings: [{ code: 'BUG', message: 'Critical bug', severity: 'Error' }],
  });
  const reviewer = makeReviewerProvider('review-contra', contradictoryContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'contradictory decision');
  assert(outcome.summary.includes('Error-severity'), 'contradictory summary');
}

// ============================================================
// Reviewer returns REJECTED without findings
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const rejectNoFindings = JSON.stringify({ decision: 'REJECTED', summary: 'Bad', findings: [] });
  const reviewer = makeReviewerProvider('review-nofind', rejectNoFindings);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'rejected without findings decision');
  assert(outcome.summary.includes('at least one finding'), 'rejected without findings summary');
}

// ============================================================
// Reviewer rejects with ProviderResult ERROR
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const reviewer = makeRejectingReviewer();
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'reviewer error decision');
  assert(outcome.reviewerResult.status === 'ERROR', 'reviewer error result status');
  assert(outcome.reviewerResult.error.code === 'PROVIDER_UNAVAILABLE', 'reviewer error code');
}

// ============================================================
// Input Immutability
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const reviewer = makeReviewerProvider();
  const preEnvelopeId = envelope.envelopeId;
  const preRequestId = envelope.requestId;
  const preObj = envelope.objective;

  await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(envelope.envelopeId === preEnvelopeId, 'envelope unchanged');
  assert(envelope.requestId === preRequestId, 'envelope requestId unchanged');
  assert(envelope.objective === preObj, 'envelope objective unchanged');
}

// ============================================================
// No Approval on Any Failure Path
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const failureCases = [];

  // Mismatched ID
  {
    const mismatchedResult = makeExecutionResult({ requestId: 'req-999' });
    const r = await reviewAgentExecution(envelope, mismatchedResult, makeReviewerProvider());
    failureCases.push(r);
  }

  // Error execution
  {
    const errorResult = makeExecutionResult({
      status: 'ERROR',
      response: undefined,
      error: { requestId: 'req-001', code: 'PROVIDER_INTERNAL_ERROR', message: 'Fail', recoverable: true },
    });
    const r = await reviewAgentExecution(envelope, errorResult, makeReviewerProvider());
    failureCases.push(r);
  }

  // Reviewer throws
  {
    const r = await reviewAgentExecution(envelope, executionResult, makeThrowingReviewer());
    failureCases.push(r);
  }

  // Reviewer returns non-object
  {
    const identity = createProviderIdentity({ providerId: 'fail-nonobj', providerVersion: '1.0' });
    const nonObj = {
      identity, capabilities: [reviewCapability],
      async execute() { return 'bad'; },
    };
    const r = await reviewAgentExecution(envelope, executionResult, nonObj);
    failureCases.push(r);
  }

  // Reviewer returns null
  {
    const identity = createProviderIdentity({ providerId: 'fail-null', providerVersion: '1.0' });
    const nullRev = {
      identity, capabilities: [reviewCapability],
      async execute() { return null; },
    };
    const r = await reviewAgentExecution(envelope, executionResult, nullRev);
    failureCases.push(r);
  }

  // Reviewer returns array
  {
    const identity = createProviderIdentity({ providerId: 'fail-array', providerVersion: '1.0' });
    const arrRev = {
      identity, capabilities: [reviewCapability],
      async execute() { return []; },
    };
    const r = await reviewAgentExecution(envelope, executionResult, arrRev);
    failureCases.push(r);
  }

  // Reviewer returns malformed result
  {
    const identity = createProviderIdentity({ providerId: 'fail-malformed', providerVersion: '1.0' });
    const malRev = {
      identity, capabilities: [reviewCapability],
      async execute(request) { return { requestId: request.requestId, status: 'INVALID' }; },
    };
    const r = await reviewAgentExecution(envelope, executionResult, malRev);
    failureCases.push(r);
  }

  // Reviewer returns ERROR result
  {
    const r = await reviewAgentExecution(envelope, executionResult, makeRejectingReviewer());
    failureCases.push(r);
  }

  for (const outcome of failureCases) {
    assert(outcome.decision !== 'APPROVED', 'no approval on failure: ' + outcome.summary.slice(0, 50));
    assert(outcome.decision === 'UNABLE_TO_REVIEW', 'failure becomes UNABLE_TO_REVIEW: ' + outcome.summary.slice(0, 50));
    assert(Object.isFrozen(outcome), 'failure outcome frozen');
    assert(Object.isFrozen(outcome.reviewerResult), 'failure reviewerResult frozen');
  }
}

// ============================================================
// Multiple Mock Providers
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const providers = [
    makeReviewerProvider('alpha'),
    makeReviewerProvider('beta'),
    makeReviewerProvider('gamma'),
  ];

  for (const provider of providers) {
    const outcome = await reviewAgentExecution(envelope, executionResult, provider);
    assert(outcome.decision === 'APPROVED', `${provider.identity.providerId} approved`);
    assert(outcome.reviewId === 'REVIEW::req-001', `${provider.identity.providerId} reviewId`);
    assert(outcome.requestId === 'req-001', `${provider.identity.providerId} requestId`);
  }
}

// ============================================================
// Deterministic Repeated Execution
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const reviewer = makeReviewerProvider('deterministic');

  const outcome1 = await reviewAgentExecution(envelope, executionResult, reviewer);
  const outcome2 = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome1.decision === outcome2.decision, 'deterministic decision');
  assert(outcome1.summary === outcome2.summary, 'deterministic summary');
  assert(outcome1.findings.length === outcome2.findings.length, 'deterministic findings count');
  assert(outcome1.reviewId === outcome2.reviewId, 'deterministic reviewId');
}

// ============================================================
// No Vendor-Specific Names or Branches
// ============================================================
{
  const sourceLines = await (async () => {
    const fs = await import('fs');
    const filePath = new URL('../../src/project-brain/review-coordinator.ts', import.meta.url).pathname;
    const cleanPath = filePath.startsWith('/') ? (filePath.startsWith('//?/') ? filePath.slice(4) : filePath.slice(1)) : filePath;
    return fs.readFileSync(cleanPath, 'utf-8');
  })();

  for (const name of ['openai', 'anthropic', 'gemini', 'claude']) {
    assert(!sourceLines.includes(name), `source does not contain '${name}'`);
  }
}

// ============================================================
// createReviewFinding Export
// ============================================================
{
  const finding = createReviewFinding({ code: 'TEST', message: 'Test finding', severity: 'Warning' });
  assert(finding.code === 'TEST', 'finding code');
  assert(finding.message === 'Test finding', 'finding message');
  assert(finding.severity === 'Warning', 'finding severity');
  assert(Object.isFrozen(finding), 'finding frozen');

  let threw = false;
  try {
    createReviewFinding({ code: '', message: '', severity: 'INVALID' });
  } catch {
    threw = true;
  }
  assert(threw, 'createReviewFinding rejects bad input');
}

// ============================================================
// Asynchronous Reviewer
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'review-async', providerVersion: '1.0' });
  const asyncReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      await new Promise((resolve) => setImmediate(resolve));
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: JSON.stringify({ decision: 'APPROVED', summary: 'Async OK', findings: [] }),
          finishReason: 'COMPLETE',
        },
      });
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, asyncReviewer);
  assert(outcome.decision === 'APPROVED', 'async reviewer approved');
  assert(outcome.summary === 'Async OK', 'async reviewer summary');
}

// ============================================================
// Phase 3 Audit Gap: Provider.execute() Called Exactly Once
// ============================================================
{
  let execInvokeCount = 0;
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'phase3-gap', providerVersion: '1.0' });
  const countingReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      execInvokeCount++;
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: JSON.stringify({ decision: 'APPROVED', summary: 'Phase 3 gap', findings: [] }),
          finishReason: 'COMPLETE',
        },
      });
    },
  };
  await reviewAgentExecution(envelope, executionResult, countingReviewer);
  assert(execInvokeCount === 1, 'Phase 3 gap: reviewer.execute called exactly once');
}

// ============================================================
// Invocation Count — Precondition Failures
// ============================================================

function makeCountingReviewer() {
  let count = 0;
  const identity = createProviderIdentity({ providerId: 'count', providerVersion: '1.0' });
  const reviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(request) {
      count++;
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: JSON.stringify({ decision: 'APPROVED', summary: 'OK', findings: [] }),
          finishReason: 'COMPLETE',
        },
      });
    },
  };
  return { reviewer, getCount: () => count };
}

// Mismatched ID
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult({ requestId: 'req-999' });
  const { reviewer, getCount } = makeCountingReviewer();
  await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(getCount() === 0, 'precondition: mismatched ID — reviewer not invoked');
}

// Execution ERROR
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult({
    status: 'ERROR',
    response: undefined,
    error: { requestId: 'req-001', code: 'PROVIDER_INTERNAL_ERROR', message: 'Fail', recoverable: true },
  });
  const { reviewer, getCount } = makeCountingReviewer();
  await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(getCount() === 0, 'precondition: execution ERROR — reviewer not invoked');
}

// ============================================================
// Finding Determinism — Total Ordering
// ============================================================

// Duplicate codes with different severities
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const dupeSeverityContent = JSON.stringify({
    decision: 'REJECTED',
    summary: 'Duplicate codes.',
    findings: [
      { code: 'DUPE', message: 'Info message', severity: 'Info' },
      { code: 'DUPE', message: 'Error message', severity: 'Error' },
      { code: 'DUPE', message: 'Warning message', severity: 'Warning' },
    ],
  });
  const reviewer = makeReviewerProvider('dupe-sev', dupeSeverityContent);
  const outcome1 = await reviewAgentExecution(envelope, executionResult, reviewer);
  const outcome2 = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome1.findings.length === 3, 'duplicate severity findings count');
  assert(outcome1.findings[0].severity === 'Error', 'dupe severity first: Error');
  assert(outcome1.findings[1].severity === 'Info', 'dupe severity second: Info');
  assert(outcome1.findings[2].severity === 'Warning', 'dupe severity third: Warning');
  assert(outcome1.findings[0].code === outcome2.findings[0].code, 'dupe severity deterministic ordering');
  assert(outcome1.findings[1].code === outcome2.findings[1].code, 'dupe severity deterministic ordering');
  assert(outcome1.findings[2].code === outcome2.findings[2].code, 'dupe severity deterministic ordering');
}

// Duplicate codes and severities with different messages
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const dupeMsgContent = JSON.stringify({
    decision: 'REJECTED',
    summary: 'Same code, same severity, different messages.',
    findings: [
      { code: 'SAME', message: 'Z message', severity: 'Error' },
      { code: 'SAME', message: 'A message', severity: 'Error' },
    ],
  });
  const reviewer = makeReviewerProvider('dupe-msg', dupeMsgContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);

  assert(outcome.findings.length === 2, 'duplicate message findings count');
  assert(outcome.findings[0].message === 'A message', 'dupe message first alphabetically');
  assert(outcome.findings[1].message === 'Z message', 'dupe message second alphabetically');
}

// ============================================================
// Decision Semantics — Approved with Info finding
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const infoContent = JSON.stringify({
    decision: 'APPROVED',
    summary: 'Minor style note.',
    findings: [{ code: 'STYLE', message: 'Use const', severity: 'Info' }],
  });
  const reviewer = makeReviewerProvider('approve-info', infoContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(outcome.decision === 'APPROVED', 'approved with Info finding');
  assert(outcome.findings.length === 1, 'approved with Info findings count');
  assert(outcome.findings[0].severity === 'Info', 'approved with Info severity');
}

// ============================================================
// Decision Semantics — Approved with Warning finding
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const warnContent = JSON.stringify({
    decision: 'APPROVED',
    summary: 'Minor concern but acceptable.',
    findings: [{ code: 'PERF', message: 'Could be faster', severity: 'Warning' }],
  });
  const reviewer = makeReviewerProvider('approve-warn', warnContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(outcome.decision === 'APPROVED', 'approved with Warning finding');
  assert(outcome.findings.length === 1, 'approved with Warning findings count');
  assert(outcome.findings[0].severity === 'Warning', 'approved with Warning severity');
}

// ============================================================
// Decision Semantics — Rejected with Info finding
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const rejectInfoContent = JSON.stringify({
    decision: 'REJECTED',
    summary: 'Style issues.',
    findings: [{ code: 'STYLE', message: 'Inconsistent formatting', severity: 'Info' }],
  });
  const reviewer = makeReviewerProvider('reject-info', rejectInfoContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(outcome.decision === 'REJECTED', 'rejected with Info finding');
  assert(outcome.findings.length === 1, 'rejected with Info findings count');
}

// ============================================================
// Decision Semantics — Rejected with Warning finding
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const rejectWarnContent = JSON.stringify({
    decision: 'REJECTED',
    summary: 'Performance concerns.',
    findings: [{ code: 'PERF', message: 'N+1 query pattern', severity: 'Warning' }],
  });
  const reviewer = makeReviewerProvider('reject-warn', rejectWarnContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(outcome.decision === 'REJECTED', 'rejected with Warning finding');
  assert(outcome.findings.length === 1, 'rejected with Warning findings count');
}

// ============================================================
// Fenced JSON Is Rejected
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const fencedContent = '```json\n{"decision": "APPROVED", "summary": "ok", "findings": []}\n```';
  const reviewer = makeReviewerProvider('fenced', fencedContent);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'fenced JSON rejected');
}

// ============================================================
// UNABLE_TO_REVIEW with findings (Option A)
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const unableWithFindings = JSON.stringify({
    decision: 'UNABLE_TO_REVIEW',
    summary: 'Could not access the codebase.',
    findings: [
      { code: 'ACCESS', message: 'Repository not reachable', severity: 'Error' },
    ],
  });
  const reviewer = makeReviewerProvider('unable-findings', unableWithFindings);
  const outcome = await reviewAgentExecution(envelope, executionResult, reviewer);
  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'unable with findings decision');
  assert(outcome.findings.length === 1, 'unable with findings count');
  assert(outcome.findings[0].code === 'ACCESS', 'unable with findings code');
}

// ============================================================
// Exception Handling — Throwing toString() on non-Error object
// ============================================================
{
  const envelope = makeEnvelope();
  const executionResult = makeExecutionResult();
  const identity = createProviderIdentity({ providerId: 'throw-tostr', providerVersion: '1.0' });
  const throwingToStringReviewer = {
    identity,
    capabilities: [reviewCapability],
    async execute(_request) {
      const badObj = { toString() { throw new Error('toString exploded'); } };
      throw badObj; // eslint-disable-line no-throw-literal
    },
  };
  const outcome = await reviewAgentExecution(envelope, executionResult, throwingToStringReviewer);
  assert(outcome.decision === 'UNABLE_TO_REVIEW', 'throwing toString decision');
  assert(outcome.summary === 'An unknown error occurred.', 'throwing toString fallback summary');
  assert(outcome.reviewerResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'throwing toString error code');
}

// ============================================================
// Summary
// ============================================================
console.log(`review-coordinator-test: ${passed} passed, ${failed} failed`);
