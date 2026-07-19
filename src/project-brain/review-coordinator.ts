import { deepFreeze } from './knowledge-artifact.ts';
import type { Provider, ProviderResult } from './provider-interface.ts';
import { createProviderRequest, createProviderResult } from './provider-interface.ts';
import type { AgentRequestEnvelope } from './agent-request-envelope.ts';
import { safeErrorMessage } from './safe-error-message.ts';

export type ReviewDecision = 'APPROVED' | 'REJECTED' | 'UNABLE_TO_REVIEW';

export type ReviewFindingSeverity = 'Info' | 'Warning' | 'Error';

export interface ReviewFinding {
  readonly code: string;
  readonly message: string;
  readonly severity: ReviewFindingSeverity;
}

export interface ReviewOutcome {
  readonly reviewId: string;
  readonly requestId: string;
  readonly taskId: string;
  readonly decision: ReviewDecision;
  readonly findings: readonly ReviewFinding[];
  readonly summary: string;
  readonly reviewerResult: ProviderResult;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

const VALID_DECISIONS: readonly ReviewDecision[] = ['APPROVED', 'REJECTED', 'UNABLE_TO_REVIEW'];
const VALID_FINDING_SEVERITIES: readonly ReviewFindingSeverity[] = ['Info', 'Warning', 'Error'];

function normalizeText(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Review ${fieldName} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`Review ${fieldName} must be a non-empty string.`);
  }
  return trimmed;
}

function normalizeDecision(value: unknown): ReviewDecision {
  if (VALID_DECISIONS.includes(value as ReviewDecision)) {
    return value as ReviewDecision;
  }
  throw new Error(`Review decision must be one of ${VALID_DECISIONS.join(', ')}.`);
}

function normalizeFindingSeverity(value: unknown): ReviewFindingSeverity {
  if (VALID_FINDING_SEVERITIES.includes(value as ReviewFindingSeverity)) {
    return value as ReviewFindingSeverity;
  }
  throw new Error(`Review finding severity must be one of ${VALID_FINDING_SEVERITIES.join(', ')}.`);
}

export function createReviewFinding(input: {
  code: unknown;
  message: unknown;
  severity: unknown;
}): ReviewFinding {
  if (!isPlainObject(input)) {
    throw new Error('Review finding input must be a plain object.');
  }
  return deepFreeze({
    code: normalizeText(input.code, 'finding code'),
    message: normalizeText(input.message, 'finding message'),
    severity: normalizeFindingSeverity(input.severity),
  });
}

function normalizeFindings(value: unknown): readonly ReviewFinding[] {
  if (!Array.isArray(value)) {
    throw new Error('Review findings must be an array.');
  }
  const result: ReviewFinding[] = [];
  for (let i = 0; i < value.length; i++) {
    const entry = value[i];
    if (!isPlainObject(entry)) {
      throw new Error(`Review findings[${i}] must be a plain object.`);
    }
    result.push(createReviewFinding(entry as Parameters<typeof createReviewFinding>[0]));
  }
  const sorted = [...result].sort((a, b) => {
    const codeCmp = a.code.localeCompare(b.code);
    if (codeCmp !== 0) return codeCmp;
    const severityCmp = a.severity.localeCompare(b.severity);
    if (severityCmp !== 0) return severityCmp;
    return a.message.localeCompare(b.message);
  });
  return deepFreeze(sorted);
}

function buildReviewRequestPrompt(
  envelope: AgentRequestEnvelope,
  executionResult: ProviderResult,
): string {
  let prompt = `REVIEW TASK
Objective: ${envelope.objective}
Output class: ${envelope.outputClass}
Constraints: ${envelope.constraints.length > 0 ? envelope.constraints.join(', ') : '(none)'}

EXECUTION OUTPUT
${executionResult.response!.content}

INSTRUCTIONS
Evaluate the execution output against the objective, output class, and constraints.
Respond with a JSON object containing:
- decision: "APPROVED", "REJECTED", or "UNABLE_TO_REVIEW"
- summary: a concise explanation of the review
- findings: an array of { code, message, severity } objects`;

  return prompt;
}

function parseReviewerContent(
  content: string,
  requestId: string,
): { decision: ReviewDecision; summary: string; findings: readonly ReviewFinding[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Reviewer response content is not valid JSON.');
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Reviewer JSON response must be a plain object.');
  }

  const candidate = parsed as Record<string, unknown>;

  const decision = normalizeDecision(candidate.decision);
  const summary = normalizeText(candidate.summary, 'summary');
  const findings = candidate.findings !== undefined
    ? normalizeFindings(candidate.findings)
    : ([] as readonly ReviewFinding[]);

  if (decision === 'APPROVED' && findings.some((f) => f.severity === 'Error')) {
    throw new Error('Review decision APPROVED cannot have Error-severity findings.');
  }

  if (decision === 'REJECTED' && findings.length === 0) {
    throw new Error('Review decision REJECTED must have at least one finding.');
  }

  return { decision, summary, findings };
}

function buildReviewOutcome(input: {
  reviewId: string;
  requestId: string;
  taskId: string;
  decision: ReviewDecision;
  summary: string;
  findings: readonly ReviewFinding[];
  reviewerResult: ProviderResult;
}): ReviewOutcome {
  return deepFreeze({
    reviewId: normalizeText(input.reviewId, 'reviewId'),
    requestId: normalizeText(input.requestId, 'requestId'),
    taskId: normalizeText(input.taskId, 'taskId'),
    decision: normalizeDecision(input.decision),
    summary: normalizeText(input.summary, 'summary'),
    findings: input.findings,
    reviewerResult: input.reviewerResult,
  });
}

export async function reviewAgentExecution(
  envelope: AgentRequestEnvelope,
  executionResult: ProviderResult,
  reviewer: Provider,
): Promise<ReviewOutcome> {
  const reviewId = `REVIEW::${envelope.requestId}`;

  if (executionResult.requestId !== envelope.requestId) {
    return buildReviewOutcome({
      reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: 'Execution result requestId does not match the envelope requestId.',
      findings: [],
      reviewerResult: createProviderResult({
        requestId: reviewId,
        status: 'ERROR',
        error: {
          requestId: reviewId,
          code: 'PROVIDER_INVALID_REQUEST',
          message: 'Execution result requestId does not match the envelope requestId.',
          recoverable: false,
        },
      }),
    });
  }

  if (executionResult.status !== 'READY') {
    return buildReviewOutcome({
      reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: 'Execution result is not READY. Cannot review a failed execution.',
      findings: [],
      reviewerResult: createProviderResult({
        requestId: reviewId,
        status: 'ERROR',
        error: {
          requestId: reviewId,
          code: 'PROVIDER_INVALID_REQUEST',
          message: 'Execution result is not READY. Cannot review a failed execution.',
          recoverable: false,
        },
      }),
    });
  }

  if (!executionResult.response || !executionResult.response.content) {
    return buildReviewOutcome({
      reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: 'Execution result is missing a reviewable response.',
      findings: [],
      reviewerResult: createProviderResult({
        requestId: reviewId,
        status: 'ERROR',
        error: {
          requestId: reviewId,
          code: 'PROVIDER_INVALID_REQUEST',
          message: 'Execution result is missing a reviewable response.',
          recoverable: false,
        },
      }),
    });
  }

  const reviewRequest = createProviderRequest({
    requestId: reviewId,
    taskId: envelope.taskId,
    prompt: buildReviewRequestPrompt(envelope, executionResult),
    constraints: envelope.constraints,
    requiredCapabilities: ['review'],
  });

  let rawReviewResult: unknown;
  try {
    rawReviewResult = await reviewer.execute(reviewRequest);
  } catch (error) {
    return buildReviewOutcome({
      reviewId: reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: safeErrorMessage(error),
      findings: [],
      reviewerResult: createProviderResult({
        requestId: reviewId,
        status: 'ERROR',
        error: {
          requestId: reviewId,
          code: 'PROVIDER_INTERNAL_ERROR',
          message: safeErrorMessage(error),
          recoverable: true,
        },
      }),
    });
  }

  let validatedReviewResult: ProviderResult;
  if (rawReviewResult === undefined || rawReviewResult === null || typeof rawReviewResult !== 'object' || Array.isArray(rawReviewResult)) {
    return buildReviewOutcome({
      reviewId: reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: 'Reviewer returned a non-object result.',
      findings: [],
      reviewerResult: createProviderResult({
        requestId: reviewId,
        status: 'ERROR',
        error: {
          requestId: reviewId,
          code: 'PROVIDER_INVALID_RESPONSE',
          message: 'Reviewer returned a non-object result.',
          recoverable: false,
        },
      }),
    });
  }

  try {
    validatedReviewResult = createProviderResult(rawReviewResult as Parameters<typeof createProviderResult>[0]);
  } catch {
    return buildReviewOutcome({
      reviewId: reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: 'Reviewer returned a malformed ProviderResult.',
      findings: [],
      reviewerResult: createProviderResult({
        requestId: reviewId,
        status: 'ERROR',
        error: {
          requestId: reviewId,
          code: 'PROVIDER_INVALID_RESPONSE',
          message: 'Reviewer returned a malformed ProviderResult.',
          recoverable: false,
        },
      }),
    });
  }

  if (validatedReviewResult.status === 'ERROR') {
    return buildReviewOutcome({
      reviewId: reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: validatedReviewResult.error?.message ?? 'Reviewer returned an error result.',
      findings: [],
      reviewerResult: validatedReviewResult,
    });
  }

  if (!validatedReviewResult.response || !validatedReviewResult.response.content) {
    return buildReviewOutcome({
      reviewId: reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: 'Reviewer returned a READY result without content.',
      findings: [],
      reviewerResult: validatedReviewResult,
    });
  }

  let parsedReview: { decision: ReviewDecision; summary: string; findings: readonly ReviewFinding[] };
  try {
    parsedReview = parseReviewerContent(validatedReviewResult.response.content, envelope.requestId);
  } catch (parseError) {
    return buildReviewOutcome({
      reviewId: reviewId,
      requestId: envelope.requestId,
      taskId: envelope.taskId,
      decision: 'UNABLE_TO_REVIEW',
      summary: safeErrorMessage(parseError),
      findings: [],
      reviewerResult: validatedReviewResult,
    });
  }

  return buildReviewOutcome({
    reviewId: reviewId,
    requestId: envelope.requestId,
    taskId: envelope.taskId,
    decision: parsedReview.decision,
    summary: parsedReview.summary,
    findings: parsedReview.findings,
    reviewerResult: validatedReviewResult,
  });
}
