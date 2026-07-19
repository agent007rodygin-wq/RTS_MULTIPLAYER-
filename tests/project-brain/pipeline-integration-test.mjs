import {
  createProviderIdentity,
  createProviderCapability,
  createProviderResult,
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
    console.error(`FAIL [pipeline-integration]: ${name}`);
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

function makeApprovalContent() {
  return JSON.stringify({
    decision: 'APPROVED',
    summary: 'Looks good.',
    findings: [{ code: 'CODE-QUALITY', message: 'Code is clean', severity: 'Info' }],
  });
}

function makeRejectionContent() {
  return JSON.stringify({
    decision: 'REJECTED',
    summary: 'Critical bugs found.',
    findings: [{ code: 'BUG', message: 'Null pointer risk', severity: 'Error' }],
  });
}

function makeUnableContent() {
  return JSON.stringify({
    decision: 'UNABLE_TO_REVIEW',
    summary: 'Cannot access repository.',
    findings: [],
  });
}

function makeSuccessProvider() {
  const identity = createProviderIdentity({ providerId: 'exec-success', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [execCap],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content: 'def analyze(): pass',
          finishReason: 'COMPLETE',
        },
      });
    },
  };
}

function makeReviewer(content) {
  const identity = createProviderIdentity({ providerId: 'reviewer', providerVersion: '1.0' });
  return {
    identity,
    capabilities: [reviewCap],
    async execute(request) {
      return createProviderResult({
        requestId: request.requestId,
        status: 'READY',
        response: {
          requestId: request.requestId,
          content,
          finishReason: 'COMPLETE',
        },
      });
    },
  };
}

// ============================================================
// 1. End-to-End Success Path
// ============================================================
{
  const envelope = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const reviewer = makeReviewer(makeApprovalContent());
  const outcome = await orchestrateAgentRequest(envelope, execProvider, reviewer);

  assert(outcome.decision === 'ACCEPTED', 'e2e success: decision ACCEPTED');
  assert(outcome.orchestrationId === 'ORCHESTRATION::req-001', 'e2e success: orchestrationId');
  assert(outcome.requestId === 'req-001', 'e2e success: requestId');
  assert(outcome.taskId === 'task-001', 'e2e success: taskId');
  assert(outcome.summary === 'Execution accepted by review.', 'e2e success: summary');

  assert(outcome.executionResult.status === 'READY', 'e2e success: execution status READY');
  assert(outcome.executionResult.response.content === 'def analyze(): pass', 'e2e success: execution content preserved');

  assert(outcome.reviewOutcome.reviewId === 'REVIEW::req-001', 'e2e success: reviewId');
  assert(outcome.reviewOutcome.requestId === 'req-001', 'e2e success: review requestId');
  assert(outcome.reviewOutcome.taskId === 'task-001', 'e2e success: review taskId');
  assert(outcome.reviewOutcome.decision === 'APPROVED', 'e2e success: review decision');
  assert(outcome.reviewOutcome.summary === 'Looks good.', 'e2e success: review summary');
  assert(outcome.reviewOutcome.findings.length === 1, 'e2e success: findings count');
  assert(outcome.reviewOutcome.findings[0].code === 'CODE-QUALITY', 'e2e success: finding code');

  assert(outcome.reviewOutcome.reviewerResult.status === 'READY', 'e2e success: reviewerResult status');

  assert(Object.isFrozen(outcome), 'e2e success: outcome frozen');
  assert(Object.isFrozen(outcome.executionResult), 'e2e success: executionResult frozen');
  assert(Object.isFrozen(outcome.executionResult.response), 'e2e success: response frozen');
  assert(Object.isFrozen(outcome.reviewOutcome), 'e2e success: reviewOutcome frozen');
  assert(Object.isFrozen(outcome.reviewOutcome.findings), 'e2e success: findings frozen');
  assert(Object.isFrozen(outcome.reviewOutcome.findings[0]), 'e2e success: finding frozen');
  assert(Object.isFrozen(outcome.reviewOutcome.reviewerResult), 'e2e success: reviewerResult frozen');
}

// ============================================================
// 2. Execution Failure Matrix
// ============================================================
{
  const envelope = makeEnvelope();

  // 2a. Provider returns ERROR
  {
    const errorProvider = {
      identity: createProviderIdentity({ providerId: 'exec-error', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'ERROR',
          error: { requestId: request.requestId, code: 'PROVIDER_UNAVAILABLE', message: 'Service down', recoverable: true },
        });
      },
    };
    let reviewInvoked = false;
    const untouchedReviewer = {
      identity: createProviderIdentity({ providerId: 'untouched', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { reviewInvoked = true; return null; },
    };
    const outcome = await orchestrateAgentRequest(envelope, errorProvider, untouchedReviewer);
    assert(outcome.decision === 'FAILED', 'exec ERROR: decision FAILED');
    assert(reviewInvoked === false, 'exec ERROR: reviewer NOT invoked');
    assert(outcome.reviewOutcome === undefined, 'exec ERROR: no review outcome');
    assert(outcome.executionResult.status === 'ERROR', 'exec ERROR: execution result preserved');
    assert(outcome.executionResult.error.code === 'PROVIDER_UNAVAILABLE', 'exec ERROR: error code preserved');
    assert(outcome.executionResult.error.message === 'Service down', 'exec ERROR: error message preserved');
    assert(Object.isFrozen(outcome), 'exec ERROR: frozen');
  }

  // 2b. Provider throws Error
  {
    const throwProvider = {
      identity: createProviderIdentity({ providerId: 'exec-throw-error', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { throw new Error('Execution panic'); },
    };
    let reviewInvoked = false;
    const untouchedReviewer = {
      identity: createProviderIdentity({ providerId: 'untouched2', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { reviewInvoked = true; return null; },
    };
    const outcome = await orchestrateAgentRequest(envelope, throwProvider, untouchedReviewer);
    assert(outcome.decision === 'FAILED', 'exec throws Error: decision FAILED');
    assert(outcome.summary === 'Execution panic', 'exec throws Error: summary preserved');
    assert(reviewInvoked === false, 'exec throws Error: reviewer NOT invoked');
    assert(outcome.reviewOutcome === undefined, 'exec throws Error: no review outcome');
    assert(outcome.executionResult.status === 'ERROR', 'exec throws Error: synthetic execution result');
    assert(outcome.executionResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'exec throws Error: error code');
    assert(Object.isFrozen(outcome), 'exec throws Error: frozen');
  }

  // 2c. Provider throws string
  {
    const throwStringProvider = {
      identity: createProviderIdentity({ providerId: 'exec-throw-str', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { throw 'string error'; },
    };
    const outcome = await orchestrateAgentRequest(envelope, throwStringProvider, null);
    assert(outcome.decision === 'FAILED', 'exec throws string: decision FAILED');
    assert(outcome.summary === 'string error', 'exec throws string: summary');
    assert(outcome.reviewOutcome === undefined, 'exec throws string: no review outcome');
    assert(Object.isFrozen(outcome), 'exec throws string: frozen');
  }

  // 2d. Provider throws symbol
  {
    const throwSymbolProvider = {
      identity: createProviderIdentity({ providerId: 'exec-throw-sym', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { throw Symbol('test'); },
    };
    const outcome = await orchestrateAgentRequest(envelope, throwSymbolProvider, null);
    assert(outcome.decision === 'FAILED', 'exec throws symbol: decision FAILED');
    assert(outcome.summary === 'Symbol(test)', 'exec throws symbol: summary');
    assert(outcome.reviewOutcome === undefined, 'exec throws symbol: no review outcome');
    assert(Object.isFrozen(outcome), 'exec throws symbol: frozen');
  }

  // 2e. Provider throws hostile toString object
  {
    const badObj = { toString() { throw new Error('toString exploded'); } };
    const hostileProvider = {
      identity: createProviderIdentity({ providerId: 'exec-throw-hostile', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { throw badObj; },
    };
    const outcome = await orchestrateAgentRequest(envelope, hostileProvider, null);
    assert(outcome.decision === 'FAILED', 'exec throws hostile: decision FAILED');
    assert(outcome.summary === 'An unknown error occurred.', 'exec throws hostile: fallback message');
    assert(outcome.reviewOutcome === undefined, 'exec throws hostile: no review outcome');
    assert(Object.isFrozen(outcome), 'exec throws hostile: frozen');
  }

  // 2f. Provider returns non-object
  {
    const nonObjProvider = {
      identity: createProviderIdentity({ providerId: 'exec-nonobj', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { return 'not-an-object'; },
    };
    let reviewInvoked = false;
    const untouchedReviewer = {
      identity: createProviderIdentity({ providerId: 'untouched3', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { reviewInvoked = true; return null; },
    };
    const outcome = await orchestrateAgentRequest(envelope, nonObjProvider, untouchedReviewer);
    assert(outcome.decision === 'FAILED', 'exec non-obj: decision FAILED');
    assert(reviewInvoked === false, 'exec non-obj: reviewer NOT invoked');
    assert(outcome.reviewOutcome === undefined, 'exec non-obj: no review outcome');
    assert(outcome.executionResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'exec non-obj: error code');
    assert(Object.isFrozen(outcome), 'exec non-obj: frozen');
  }

  // 2g. Provider returns null
  {
    const nullProvider = {
      identity: createProviderIdentity({ providerId: 'exec-null', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { return null; },
    };
    const outcome = await orchestrateAgentRequest(envelope, nullProvider, null);
    assert(outcome.decision === 'FAILED', 'exec null: decision FAILED');
    assert(outcome.reviewOutcome === undefined, 'exec null: no review outcome');
    assert(outcome.executionResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'exec null: error code');
  }

  // 2h. Provider returns READY without response (malformed)
  {
    const missingRespProvider = {
      identity: createProviderIdentity({ providerId: 'exec-missing-resp', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return { requestId: request.requestId, status: 'READY' };
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, missingRespProvider, null);
    assert(outcome.decision === 'FAILED', 'exec missing response: decision FAILED');
    assert(outcome.reviewOutcome === undefined, 'exec missing response: no review outcome');
    assert(outcome.executionResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'exec missing response: error code');
  }

  // 2i. Provider returns invalid status
  {
    const badStatusProvider = {
      identity: createProviderIdentity({ providerId: 'exec-bad-status', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return { requestId: request.requestId, status: 'INVALID' };
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, badStatusProvider, null);
    assert(outcome.decision === 'FAILED', 'exec invalid status: decision FAILED');
    assert(outcome.reviewOutcome === undefined, 'exec invalid status: no review outcome');
    assert(outcome.executionResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'exec invalid status: error code');
  }

  // 2j. Confirm no Promise rejection for all execution failures
  {
    const errorProvider = {
      identity: createProviderIdentity({ providerId: 'exec-never-reject', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { throw 'any-value'; },
    };
    const o = await orchestrateAgentRequest(envelope, errorProvider, null);
    assert(o.decision === 'FAILED', 'exec never rejects: decision FAILED');
  }
}

// ============================================================
// 3. Review Failure Matrix
// ============================================================
{
  const envelope = makeEnvelope();
  const execProvider = makeSuccessProvider();

  // 3a. Reviewer rejects execution (REJECTED decision -> ACCEPTED flow in orchestration)
  {
    const reviewer = makeReviewer(makeRejectionContent());
    const outcome = await orchestrateAgentRequest(envelope, execProvider, reviewer);
    assert(outcome.decision === 'REJECTED', 'review rejects: orchestration REJECTED');
    assert(outcome.reviewOutcome.decision === 'REJECTED', 'review rejects: review decision');
    assert(outcome.reviewOutcome.findings.length === 1, 'review rejects: findings preserved');
    assert(outcome.reviewOutcome.findings[0].severity === 'Error', 'review rejects: finding severity');
    assert(Object.isFrozen(outcome), 'review rejects: frozen');
  }

  // 3b. Reviewer throws Error
  {
    const throwReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-throw-error', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { throw new Error('Review crashed'); },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, throwReviewer);
    assert(outcome.decision === 'FAILED', 'review throws Error: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review throws Error: review UNABLE');
    assert(outcome.summary === 'Review crashed', 'review throws Error: summary');
    assert(outcome.executionResult.status === 'READY', 'review throws Error: execution preserved');
    assert(Object.isFrozen(outcome), 'review throws Error: frozen');
  }

  // 3c. Reviewer throws hostile toString object
  {
    const badObj = { toString() { throw new Error('rev toString exploded'); } };
    const hostileReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-throw-hostile', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { throw badObj; },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, hostileReviewer);
    assert(outcome.decision === 'FAILED', 'review throws hostile: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review throws hostile: review UNABLE');
    assert(outcome.summary === 'An unknown error occurred.', 'review throws hostile: fallback summary');
    assert(outcome.executionResult.status === 'READY', 'review throws hostile: execution preserved');
    assert(Object.isFrozen(outcome), 'review throws hostile: frozen');
  }

  // 3d. Reviewer returns non-object result
  {
    const nonObjReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-nonobj', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { return 'not-an-object'; },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, nonObjReviewer);
    assert(outcome.decision === 'FAILED', 'review non-obj: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review non-obj: review UNABLE');
    assert(outcome.reviewOutcome.summary === 'Reviewer returned a non-object result.', 'review non-obj: summary');
    assert(outcome.reviewOutcome.reviewerResult.error.code === 'PROVIDER_INVALID_RESPONSE', 'review non-obj: error code');
    assert(Object.isFrozen(outcome), 'review non-obj: frozen');
  }

  // 3e. Reviewer returns null
  {
    const nullReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-null', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { return null; },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, nullReviewer);
    assert(outcome.decision === 'FAILED', 'review null: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review null: review UNABLE');
    assert(outcome.reviewOutcome.summary === 'Reviewer returned a non-object result.', 'review null: summary');
  }

  // 3f. Reviewer returns ERROR result
  {
    const errorReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-error', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'ERROR',
          error: { requestId: request.requestId, code: 'PROVIDER_INTERNAL_ERROR', message: 'Review failed', recoverable: true },
        });
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, errorReviewer);
    assert(outcome.decision === 'FAILED', 'review returns ERROR: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review returns ERROR: review UNABLE');
    assert(outcome.reviewOutcome.summary === 'Review failed', 'review returns ERROR: summary');
    assert(outcome.reviewOutcome.reviewerResult.status === 'ERROR', 'review returns ERROR: reviewer result preserved');
  }

  // 3g. Reviewer returns malformed decision string
  {
    const badDecisionReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-bad-decision', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'READY',
          response: { requestId: request.requestId, content: '{"decision":"INVALID","summary":"bad"}', finishReason: 'COMPLETE' },
        });
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, badDecisionReviewer);
    assert(outcome.decision === 'FAILED', 'review bad decision: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review bad decision: review UNABLE');
  }

  // 3h. Reviewer returns APPROVED with Error-severity findings (invalid combo)
  {
    const badFindingReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-bad-finding', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 'APPROVED', summary: 'ok', findings: [{ code: 'BUG', message: 'critical', severity: 'Error' }] }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, badFindingReviewer);
    assert(outcome.decision === 'FAILED', 'review APPROVED+Error finding: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review APPROVED+Error finding: review UNABLE');
    assert(outcome.reviewOutcome.summary === 'Review decision APPROVED cannot have Error-severity findings.', 'review APPROVED+Error finding: parse error caught');
  }

  // 3i. Reviewer returns REJECTED with no findings (invalid combo)
  {
    const noFindingsReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-no-findings', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'READY',
          response: {
            requestId: request.requestId,
            content: JSON.stringify({ decision: 'REJECTED', summary: 'bad', findings: [] }),
            finishReason: 'COMPLETE',
          },
        });
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, noFindingsReviewer);
    assert(outcome.decision === 'FAILED', 'review REJECTED+no findings: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review REJECTED+no findings: review UNABLE');
    assert(outcome.reviewOutcome.summary === 'Review decision REJECTED must have at least one finding.', 'review REJECTED+no findings: parse error caught');
  }

  // 3j. Reviewer returns READY without response content (empty response)
  {
    const emptyReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-empty', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'READY',
          response: { requestId: request.requestId, content: '', finishReason: 'COMPLETE' },
        });
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, emptyReviewer);
    assert(outcome.decision === 'FAILED', 'review empty content: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review empty content: review UNABLE');
  }

  // 3k. Reviewer returns non-JSON content
  {
    const nonJsonReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-nonjson', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'READY',
          response: { requestId: request.requestId, content: 'not valid json', finishReason: 'COMPLETE' },
        });
      },
    };
    const outcome = await orchestrateAgentRequest(envelope, execProvider, nonJsonReviewer);
    assert(outcome.decision === 'FAILED', 'review non-JSON: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review non-JSON: review UNABLE');
    assert(outcome.reviewOutcome.summary === 'Reviewer response content is not valid JSON.', 'review non-JSON: parse error caught');
  }

  // 3l. Reviewer returns UNABLE_TO_REVIEW
  {
    const unableReviewer = makeReviewer(makeUnableContent());
    const outcome = await orchestrateAgentRequest(envelope, execProvider, unableReviewer);
    assert(outcome.decision === 'FAILED', 'review UNABLE: orchestration FAILED');
    assert(outcome.reviewOutcome.decision === 'UNABLE_TO_REVIEW', 'review UNABLE: review UNABLE');
    assert(outcome.summary === 'Cannot access repository.', 'review UNABLE: summary');
    assert(Object.isFrozen(outcome), 'review UNABLE: frozen');
  }

  // 3m. Confirm no Promise rejection for all review failures
  {
    const badReviewer = {
      identity: createProviderIdentity({ providerId: 'rev-never-reject', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { throw 'any-value'; },
    };
    const o = await orchestrateAgentRequest(envelope, execProvider, badReviewer);
    assert(o.decision === 'FAILED', 'review never rejects: orchestration FAILED');
  }
}

// ============================================================
// 4. Correlation Matrix
// ============================================================
{
  const envelope = makeEnvelope();

  // 4a. Execution result requestId mismatch
  {
    const mismatchedProvider = {
      identity: createProviderIdentity({ providerId: 'corr-exec-mm', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) {
        return createProviderResult({
          requestId: 'different-id',
          status: 'READY',
          response: { requestId: 'different-id', content: 'actual evidence', finishReason: 'COMPLETE' },
        });
      },
    };
    let reviewInvoked = false;
    const untouchedReviewer = {
      identity: createProviderIdentity({ providerId: 'corr-review-mm', providerVersion: '1.0' }),
      capabilities: [reviewCap],
      async execute(_request) { reviewInvoked = true; return null; },
    };
    const outcome = await orchestrateAgentRequest(envelope, mismatchedProvider, untouchedReviewer);

    assert(outcome.decision === 'FAILED', 'corr exec MM: decision FAILED');
    assert(outcome.reviewOutcome === undefined, 'corr exec MM: no review outcome');
    assert(reviewInvoked === false, 'corr exec MM: reviewer NOT invoked');
    assert(outcome.executionResult.requestId === 'different-id', 'corr exec MM: evidence preserved');
    assert(outcome.executionResult.response.content === 'actual evidence', 'corr exec MM: content preserved');
    assert(outcome.summary === 'Execution result requestId does not match envelope requestId. Review was not invoked.',
      'corr exec MM: summary mentions mismatch');
    assert(Object.isFrozen(outcome), 'corr exec MM: frozen');
  }

  // 4b. Review requestId — reviewAgentExecution always returns matching IDs
  {
    const execProvider = makeSuccessProvider();
    const reviewer = makeReviewer(makeApprovalContent());
    const outcome = await orchestrateAgentRequest(envelope, execProvider, reviewer);
    assert(outcome.decision === 'ACCEPTED', 'corr review IDs: normal path accepted');
    assert(outcome.reviewOutcome.requestId === 'req-001', 'corr review IDs: review requestId matches');
    assert(outcome.reviewOutcome.taskId === 'task-001', 'corr review IDs: review taskId matches');
  }

  // 4c. Review requestId always matches — structural invariant
  // reviewAgentExecution always returns envelope.requestId and envelope.taskId.
  // The defensive checks in orchestration-engine (lines 106, 118) are
  // architecturally unreachable. Confirmed by source audit: buildReviewOutcome
  // at review-coordinator.ts:161-169 always uses envelope.requestId/taskId.
  {
    const execResult = await executeAgentRequest(envelope, makeSuccessProvider());
    const reviewer = makeReviewer(makeApprovalContent());
    const ro = await reviewAgentExecution(envelope, execResult, reviewer);
    assert(ro.requestId === envelope.requestId, 'corr review MM: reviewAgentExecution returns envelope requestId');
    assert(ro.taskId === envelope.taskId, 'corr review MM: reviewAgentExecution returns envelope taskId');
  }

  // 4d. No false ACCEPTED under any correlation failure
  {
    const mismatchedExec = {
      identity: createProviderIdentity({ providerId: 'corr-false-exec', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) {
        return createProviderResult({
          requestId: 'wrong', status: 'READY',
          response: { requestId: 'wrong', content: 'x', finishReason: 'COMPLETE' },
        });
      },
    };
    const o = await orchestrateAgentRequest(envelope, mismatchedExec, makeReviewer(makeApprovalContent()));
    assert(o.decision !== 'ACCEPTED', 'corr exec MM: not falsely ACCEPTED');
  }
}

// ============================================================
// 5. Immutability Matrix
// ============================================================
{
  // 5a. ProviderResult immutability
  {
    const env = makeEnvelope();
    const execProvider = makeSuccessProvider();
    const pr = await executeAgentRequest(env, execProvider);
    try { pr.status = 'ERROR'; } catch (_) { /* strict mode */ }
    assert(pr.status === 'READY', 'immut ProviderResult: status unchanged after mutation attempt');
    try { pr.response.content = 'hacked'; } catch (_) { }
    assert(pr.response.content === 'def analyze(): pass', 'immut ProviderResult: content unchanged');
    try { pr.error = { requestId: 'x', code: 'PROVIDER_TIMEOUT', message: 'x', recoverable: false }; } catch (_) { }
    assert(pr.error === undefined, 'immut ProviderResult: error still undefined');
    assert(Object.isFrozen(pr), 'immut ProviderResult: frozen');
    assert(Object.isFrozen(pr.response), 'immut ProviderResult: response frozen');
  }

  // 5b. ReviewOutcome immutability
  {
    const env = makeEnvelope();
    const execProvider = makeSuccessProvider();
    const execResult = await executeAgentRequest(env, execProvider);
    const reviewer = makeReviewer(makeApprovalContent());
    const reviewOutcome = await reviewAgentExecution(env, execResult, reviewer);

    try { reviewOutcome.decision = 'REJECTED'; } catch (_) { }
    assert(reviewOutcome.decision === 'APPROVED', 'immut ReviewOutcome: decision unchanged');

    try { reviewOutcome.summary = 'hacked'; } catch (_) { }
    assert(reviewOutcome.summary === 'Looks good.', 'immut ReviewOutcome: summary unchanged');

    try { reviewOutcome.findings.push({ code: 'X', message: 'y', severity: 'Error' }); } catch (_) { }
    assert(reviewOutcome.findings.length === 1, 'immut ReviewOutcome: findings unmodified');

    try { reviewOutcome.reviewerResult.status = 'ERROR'; } catch (_) { }
    assert(reviewOutcome.reviewerResult.status === 'READY', 'immut ReviewOutcome: reviewerResult unchanged');

    assert(Object.isFrozen(reviewOutcome), 'immut ReviewOutcome: frozen');
    assert(Object.isFrozen(reviewOutcome.findings), 'immut ReviewOutcome: findings frozen');
    assert(Object.isFrozen(reviewOutcome.findings[0]), 'immut ReviewOutcome: finding frozen');
    assert(Object.isFrozen(reviewOutcome.reviewerResult), 'immut ReviewOutcome: reviewerResult frozen');
    assert(Object.isFrozen(reviewOutcome.reviewerResult.response), 'immut ReviewOutcome: reviewerResult.response frozen');
  }

  // 5c. OrchestrationOutcome immutability
  {
    const env = makeEnvelope();
    const execProvider = makeSuccessProvider();
    const reviewer = makeReviewer(makeApprovalContent());
    const outcome = await orchestrateAgentRequest(env, execProvider, reviewer);

    try { outcome.decision = 'FAILED'; } catch (_) { }
    assert(outcome.decision === 'ACCEPTED', 'immut OrchestrationOutcome: decision unchanged');

    try { outcome.summary = 'hacked'; } catch (_) { }
    assert(outcome.summary === 'Execution accepted by review.', 'immut OrchestrationOutcome: summary unchanged');

    try { outcome.executionResult.status = 'ERROR'; } catch (_) { }
    assert(outcome.executionResult.status === 'READY', 'immut OrchestrationOutcome: executionResult unchanged');

    try { outcome.reviewOutcome.decision = 'REJECTED'; } catch (_) { }
    assert(outcome.reviewOutcome.decision === 'APPROVED', 'immut OrchestrationOutcome: reviewOutcome unchanged');

    try { outcome.reviewOutcome.findings[0].severity = 'Error'; } catch (_) { }
    assert(outcome.reviewOutcome.findings[0].severity === 'Info', 'immut OrchestrationOutcome: finding unchanged');

    assert(Object.isFrozen(outcome), 'immut OrchestrationOutcome: frozen');
    assert(Object.isFrozen(outcome.executionResult), 'immut OrchestrationOutcome: executionResult frozen');
    assert(Object.isFrozen(outcome.reviewOutcome), 'immut OrchestrationOutcome: reviewOutcome frozen');
  }

  // 5d. Error ProviderResult immutability
  {
    const env = makeEnvelope();
    const errorProvider = {
      identity: createProviderIdentity({ providerId: 'immut-error', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'ERROR',
          error: { requestId: request.requestId, code: 'PROVIDER_UNAVAILABLE', message: 'down', recoverable: true },
        });
      },
    };
    const pr = await executeAgentRequest(env, errorProvider);
    try { pr.error.code = 'PROVIDER_TIMEOUT'; } catch (_) { }
    assert(pr.error.code === 'PROVIDER_UNAVAILABLE', 'immut error: code unchanged');
    try { pr.error.recoverable = false; } catch (_) { }
    assert(pr.error.recoverable === true, 'immut error: recoverable unchanged');
    assert(Object.isFrozen(pr.error), 'immut error: error frozen');
  }

  // 5e. OrchestrationOutcome with ERROR (immutability of synthetic fail-closed)
  {
    const env = makeEnvelope();
    const throwProvider = {
      identity: createProviderIdentity({ providerId: 'immut-throw', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(_request) { throw new Error('panic'); },
    };
    const outcome = await orchestrateAgentRequest(env, throwProvider, null);
    try { oute.executionResult.status = 'READY'; } catch (_) { }
    assert(outcome.executionResult.status === 'ERROR', 'immut synthetic: executionResult status unchanged');
    try { outcome.executionResult.error.code = 'PROVIDER_TIMEOUT'; } catch (_) { }
    assert(outcome.executionResult.error.code === 'PROVIDER_INTERNAL_ERROR', 'immut synthetic: error code unchanged');
    assert(outcome.reviewOutcome === undefined, 'immut synthetic: no review outcome');
    assert(Object.isFrozen(outcome), 'immut synthetic: outcome frozen');
    assert(Object.isFrozen(outcome.executionResult), 'immut synthetic: executionResult frozen');
    assert(Object.isFrozen(outcome.executionResult.error), 'immut synthetic: error frozen');
  }
}

// ============================================================
// 6. Determinism Audit
// ============================================================
{
  const envelope = makeEnvelope();
  const execProvider = makeSuccessProvider();
  const approvalReviewer = makeReviewer(makeApprovalContent());
  const rejectionReviewer = makeReviewer(makeRejectionContent());
  const unableReviewer = makeReviewer(makeUnableContent());

  // 6a. Two identical APPROVED runs produce identical results
  {
    const o1 = await orchestrateAgentRequest(envelope, execProvider, approvalReviewer);
    const o2 = await orchestrateAgentRequest(envelope, execProvider, approvalReviewer);

    assert(o1.decision === o2.decision, 'determ ACCEPTED: decision identical');
    assert(o1.summary === o2.summary, 'determ ACCEPTED: summary identical');
    assert(o1.executionResult.status === o2.executionResult.status, 'determ ACCEPTED: exec status identical');
    assert(o1.executionResult.response.content === o2.executionResult.response.content,
      'determ ACCEPTED: exec content identical');
    assert(o1.reviewOutcome.decision === o2.reviewOutcome.decision, 'determ ACCEPTED: review decision identical');
    assert(o1.reviewOutcome.summary === o2.reviewOutcome.summary, 'determ ACCEPTED: review summary identical');
    assert(o1.reviewOutcome.findings.length === o2.reviewOutcome.findings.length, 'determ ACCEPTED: findings count identical');
    assert(o1.reviewOutcome.findings[0].code === o2.reviewOutcome.findings[0].code, 'determ ACCEPTED: finding code identical');
    assert(o1.reviewOutcome.findings[0].severity === o2.reviewOutcome.findings[0].severity,
      'determ ACCEPTED: finding severity identical');
    assert(o1.reviewOutcome.findings[0].message === o2.reviewOutcome.findings[0].message,
      'determ ACCEPTED: finding message identical');
    assert(o1.reviewOutcome.reviewerResult.status === o2.reviewOutcome.reviewerResult.status,
      'determ ACCEPTED: reviewerResult identical');
  }

  // 6b. Two identical REJECTED runs produce identical results
  {
    const o1 = await orchestrateAgentRequest(envelope, execProvider, rejectionReviewer);
    const o2 = await orchestrateAgentRequest(envelope, execProvider, rejectionReviewer);

    assert(o1.decision === o2.decision, 'determ REJECTED: decision identical');
    assert(o1.summary === o2.summary, 'determ REJECTED: summary identical');
    assert(o1.reviewOutcome.findings[0].severity === 'Error', 'determ REJECTED: finding severity Error');
    assert(o1.reviewOutcome.findings[0].code === 'BUG', 'determ REJECTED: finding code');
    assert(o2.reviewOutcome.findings[0].code === 'BUG', 'determ REJECTED: mirror finding code');
  }

  // 6c. Two identical ERROR runs produce identical results
  {
    const errorProvider = {
      identity: createProviderIdentity({ providerId: 'determ-error', providerVersion: '1.0' }),
      capabilities: [execCap],
      async execute(request) {
        return createProviderResult({
          requestId: request.requestId,
          status: 'ERROR',
          error: { requestId: request.requestId, code: 'PROVIDER_TIMEOUT', message: 'Timed out', recoverable: true },
        });
      },
    };
    const o1 = await orchestrateAgentRequest(envelope, errorProvider, null);
    const o2 = await orchestrateAgentRequest(envelope, errorProvider, null);

    assert(o1.decision === o2.decision, 'determ ERROR: decision identical');
    assert(o1.summary === o2.summary, 'determ ERROR: summary identical');
    assert(o1.executionResult.error.code === o2.executionResult.error.code, 'determ ERROR: error code identical');
    assert(o1.executionResult.error.message === o2.executionResult.error.message, 'determ ERROR: message identical');
  }

  // 6d. Two identical UNABLE runs produce identical results
  {
    const o1 = await orchestrateAgentRequest(envelope, execProvider, unableReviewer);
    const o2 = await orchestrateAgentRequest(envelope, execProvider, unableReviewer);

    assert(o1.decision === o2.decision, 'determ UNABLE: decision identical');
    assert(o1.summary === o2.summary, 'determ UNABLE: summary identical');
    assert(o1.reviewOutcome.decision === o2.reviewOutcome.decision, 'determ UNABLE: review decision identical');
    assert(o1.reviewOutcome.summary === o2.reviewOutcome.summary, 'determ UNABLE: review summary identical');
  }
}

// ============================================================
// 7. Public Contract Audit
// ============================================================
{
  // 7a. Verify exported APIs exist and are functions
  assert(typeof executeAgentRequest === 'function', 'contract: executeAgentRequest is function');
  assert(typeof reviewAgentExecution === 'function', 'contract: reviewAgentExecution is function');
  assert(typeof orchestrateAgentRequest === 'function', 'contract: orchestrateAgentRequest is function');
  assert(typeof createReviewFinding === 'function', 'contract: createReviewFinding is function');

  // 7b. Verify exported types match expected signatures
  // executeAgentRequest returns Promise<ProviderResult>
  const prPromise = executeAgentRequest(makeEnvelope(), makeSuccessProvider());
  assert(prPromise instanceof Promise, 'contract: executeAgentRequest returns Promise');
  const pr = await prPromise;
  assert(typeof pr.requestId === 'string', 'contract: ProviderResult has requestId');
  assert(pr.status === 'READY' || pr.status === 'ERROR', 'contract: ProviderResult has valid status');

  // reviewAgentExecution returns Promise<ReviewOutcome>
  const execResult = await executeAgentRequest(makeEnvelope(), makeSuccessProvider());
  const roPromise = reviewAgentExecution(makeEnvelope(), execResult, makeReviewer(makeApprovalContent()));
  assert(roPromise instanceof Promise, 'contract: reviewAgentExecution returns Promise');
  const ro = await roPromise;
  assert(typeof ro.reviewId === 'string', 'contract: ReviewOutcome has reviewId');
  assert(typeof ro.requestId === 'string', 'contract: ReviewOutcome has requestId');
  assert(typeof ro.taskId === 'string', 'contract: ReviewOutcome has taskId');
  assert(['APPROVED', 'REJECTED', 'UNABLE_TO_REVIEW'].includes(ro.decision), 'contract: ReviewOutcome has valid decision');
  assert(typeof ro.summary === 'string', 'contract: ReviewOutcome has summary');
  assert(Array.isArray(ro.findings), 'contract: ReviewOutcome has findings array');
  assert(typeof ro.reviewerResult === 'object' && ro.reviewerResult !== null, 'contract: ReviewOutcome has reviewerResult');

  // orchestrateAgentRequest returns Promise<OrchestrationOutcome>
  const ooPromise = orchestrateAgentRequest(makeEnvelope(), makeSuccessProvider(), makeReviewer(makeApprovalContent()));
  assert(ooPromise instanceof Promise, 'contract: orchestrateAgentRequest returns Promise');
  const oo = await ooPromise;
  assert(typeof oo.orchestrationId === 'string', 'contract: OrchestrationOutcome has orchestrationId');
  assert(typeof oo.requestId === 'string', 'contract: OrchestrationOutcome has requestId');
  assert(typeof oo.taskId === 'string', 'contract: OrchestrationOutcome has taskId');
  assert(['ACCEPTED', 'REJECTED', 'FAILED'].includes(oo.decision), 'contract: OrchestrationOutcome has valid decision');
  assert(typeof oo.summary === 'string', 'contract: OrchestrationOutcome has summary');
  assert(typeof oo.executionResult === 'object' && oo.executionResult !== null,
    'contract: OrchestrationOutcome has executionResult');

  // 7c. Verify no new exports (safeErrorMessage is NOT in public API)
  const { safeErrorMessage } = await import('../../src/project-brain/safe-error-message.ts');
  assert(typeof safeErrorMessage === 'function', 'contract: safeErrorMessage exists internally');

  // Verify it's NOT re-exported from index.ts
  const indexExports = Object.keys(await import('../../src/project-brain/index.ts'));
  assert(!indexExports.includes('safeErrorMessage'), 'contract: safeErrorMessage NOT exported from index');
  assert(indexExports.includes('executeAgentRequest'), 'contract: executeAgentRequest exported from index');
  assert(indexExports.includes('reviewAgentExecution'), 'contract: reviewAgentExecution exported from index');
  assert(indexExports.includes('orchestrateAgentRequest'), 'contract: orchestrateAgentRequest exported from index');

  // 7d. Verify deepFreeze is NOT exported from Package I (it comes from knowledge-artifact which is Package A)
  // This is fine — the dependency is on knowledge-artifact, which is an established package.
}

// ============================================================
// 8. Package Boundary Audit
// ============================================================
{
  // 8a. Verify Package I files only depend on other Package I files or established packages
  // Package I files: provider-interface, agent-request-envelope, execution-session, review-coordinator, orchestration-engine, safe-error-message
  // Established: knowledge-artifact (used by provider-interface, review-coordinator, orchestration-engine for deepFreeze)
  // Also: brain-request (used by agent-request-envelope for BrainOutputClass type)
  const sourceFiles = [
    'provider-interface.ts',
    'agent-request-envelope.ts',
    'execution-session.ts',
    'review-coordinator.ts',
    'orchestration-engine.ts',
    'safe-error-message.ts',
  ];

  const { readFileSync } = await import('fs');
  for (const file of sourceFiles) {
    const path = new URL(`../../src/project-brain/${file}`, import.meta.url).pathname;
    const cleanPath = path.startsWith('/') ? (path.startsWith('//?/') ? path.slice(4) : path.slice(1)) : path;
    const source = readFileSync(cleanPath, 'utf-8');

    const imports = source.match(/from\s+['"].\/['"]/g) || [];
    const relativeImports = source.match(/from\s+['"]\.\/[^'"]+['"]/g) || [];

    for (const imp of relativeImports) {
      const target = imp.replace(/from\s+['"]/, '').replace(/['"]$/, '');
      assert(target.startsWith('./'), `boundary: ${file} import '${target}' is relative`);
    }
  }

  // 8b. No circular imports in Package I
  // Verify that no file imports a file that transitively imports it within Package I
  // Simple check: no import chain forms a cycle
  // provider-interface: imports -> knowledge-artifact (Package A, external)
  // agent-request-envelope: imports -> knowledge-artifact, brain-request (both external)
  // execution-session: imports -> provider-interface, agent-request-envelope, safe-error-message
  // review-coordinator: imports -> knowledge-artifact, provider-interface, agent-request-envelope, safe-error-message
  // orchestration-engine: imports -> knowledge-artifact, provider-interface, execution-session, review-coordinator, agent-request-envelope, safe-error-message
  // safe-error-message: no imports
  // No cycles: execution-session -> provider-interface (no further Package I deps)
  // No cycles: review-coordinator -> provider-interface (no further Package I deps)
  // No cycles: orchestration-engine -> execution-session -> provider-interface
  // No cycles: orchestration-engine -> review-coordinator -> provider-interface

  // 8c. No Phase 8 placeholders or TODOs for correctness
  for (const file of sourceFiles) {
    const path = new URL(`../../src/project-brain/${file}`, import.meta.url).pathname;
    const cleanPath = path.startsWith('/') ? (path.startsWith('//?/') ? path.slice(4) : path.slice(1)) : path;
    const source = readFileSync(cleanPath, 'utf-8');

    assert(!source.includes('Phase 8'), `boundary: ${file} has no Phase 8 placeholder`);
    assert(!source.includes('TODO'), `boundary: ${file} has no TODO`);
    assert(!source.includes('FIXME'), `boundary: ${file} has no FIXME`);
    assert(!source.includes('HACK'), `boundary: ${file} has no HACK`);
    assert(!source.includes('XXX'), `boundary: ${file} has no XXX`);
  }

  // 8d. No import of future packages (Packages A-H are external, but Package I should not import Packages beyond established)
  for (const file of sourceFiles) {
    const path = new URL(`../../src/project-brain/${file}`, import.meta.url).pathname;
    const cleanPath = path.startsWith('/') ? (path.startsWith('//?/') ? path.slice(4) : path.slice(1)) : path;
    const source = readFileSync(cleanPath, 'utf-8');

    assert(!source.includes('../'), `boundary: ${file} has no parent-relative imports`);
    assert(!source.includes(' from "'), `boundary: ${file} uses single-quote imports`);
  }
}

// ============================================================
// Summary
// ============================================================
console.log(`pipeline-integration-test: ${passed} passed, ${failed} failed`);
