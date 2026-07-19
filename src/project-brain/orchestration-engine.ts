import { deepFreeze } from './knowledge-artifact.ts';
import type { Provider, ProviderResult } from './provider-interface.ts';
import { createProviderResult } from './provider-interface.ts';
import { executeAgentRequest } from './execution-session.ts';
import { reviewAgentExecution, type ReviewOutcome } from './review-coordinator.ts';
import type { AgentRequestEnvelope } from './agent-request-envelope.ts';

export type OrchestrationDecision = 'ACCEPTED' | 'REJECTED' | 'FAILED';

export interface OrchestrationOutcome {
  readonly orchestrationId: string;
  readonly requestId: string;
  readonly taskId: string;
  readonly decision: OrchestrationDecision;
  readonly executionResult: ProviderResult;
  readonly reviewOutcome?: ReviewOutcome;
  readonly summary: string;
}

function safeMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return String(error);
  } catch {
    return 'An unknown error occurred.';
  }
}

/**
 * Construct a fail-closed outcome with a synthetic execution ProviderResult.
 * Used only when no real execution result exists, such as when
 * executeAgentRequest throws before returning.
 */
function buildSyntheticFailClosedOutcome(
  orchestrationId: string,
  requestId: string,
  taskId: string,
  message: string,
): OrchestrationOutcome {
  return deepFreeze({
    orchestrationId,
    requestId,
    taskId,
    decision: 'FAILED',
    executionResult: createProviderResult({
      requestId,
      status: 'ERROR',
      error: {
        requestId,
        code: 'PROVIDER_INTERNAL_ERROR',
        message,
        recoverable: false,
      },
    }),
    reviewOutcome: undefined,
    summary: message,
  });
}

export async function orchestrateAgentRequest(
  envelope: AgentRequestEnvelope,
  executionProvider: Provider,
  reviewerProvider: Provider,
): Promise<OrchestrationOutcome> {
  const orchestrationId = `ORCHESTRATION::${envelope.requestId}`;
  const { requestId, taskId } = envelope;

  let executionResult: ProviderResult;
  try {
    executionResult = await executeAgentRequest(envelope, executionProvider);
  } catch (error) {
    return buildSyntheticFailClosedOutcome(orchestrationId, requestId, taskId, safeMessage(error));
  }

  if (executionResult.requestId !== requestId) {
    return deepFreeze({
      orchestrationId,
      requestId,
      taskId,
      decision: 'FAILED',
      executionResult,
      reviewOutcome: undefined,
      summary: 'Execution result requestId does not match envelope requestId. Review was not invoked.',
    });
  }

  if (executionResult.status !== 'READY') {
    return deepFreeze({
      orchestrationId,
      requestId,
      taskId,
      decision: 'FAILED',
      executionResult,
      reviewOutcome: undefined,
      summary: executionResult.error?.message ?? 'Execution failed.',
    });
  }

  let reviewOutcome: ReviewOutcome;
  try {
    reviewOutcome = await reviewAgentExecution(envelope, executionResult, reviewerProvider);
  } catch (error) {
    return deepFreeze({
      orchestrationId,
      requestId,
      taskId,
      decision: 'FAILED',
      executionResult,
      reviewOutcome: undefined,
      summary: safeMessage(error),
    });
  }

  if (reviewOutcome.requestId !== requestId) {
    return deepFreeze({
      orchestrationId,
      requestId,
      taskId,
      decision: 'FAILED',
      executionResult,
      reviewOutcome,
      summary: 'Review outcome requestId does not match envelope requestId. Review evidence is not trusted.',
    });
  }

  if (reviewOutcome.taskId !== taskId) {
    return deepFreeze({
      orchestrationId,
      requestId,
      taskId,
      decision: 'FAILED',
      executionResult,
      reviewOutcome,
      summary: 'Review outcome taskId does not match envelope taskId. Review evidence is not trusted.',
    });
  }

  switch (reviewOutcome.decision) {
    case 'APPROVED':
      return deepFreeze({
        orchestrationId,
        requestId,
        taskId,
        decision: 'ACCEPTED',
        executionResult,
        reviewOutcome,
        summary: 'Execution accepted by review.',
      });
    case 'REJECTED':
      return deepFreeze({
        orchestrationId,
        requestId,
        taskId,
        decision: 'REJECTED',
        executionResult,
        reviewOutcome,
        summary: reviewOutcome.summary,
      });
    case 'UNABLE_TO_REVIEW':
      return deepFreeze({
        orchestrationId,
        requestId,
        taskId,
        decision: 'FAILED',
        executionResult,
        reviewOutcome,
        summary: reviewOutcome.summary,
      });
    default: {
      const _exhaustive: never = reviewOutcome.decision;
      return _exhaustive;
    }
  }
}
