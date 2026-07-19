import type { Provider, ProviderRequest, ProviderResult } from './provider-interface.ts';
import { createProviderRequest, createProviderResult } from './provider-interface.ts';
import type { AgentRequestEnvelope } from './agent-request-envelope.ts';
import { safeErrorMessage } from './safe-error-message.ts';

/**
 * Translates an AgentRequestEnvelope into a ProviderRequest.
 */
function buildProviderRequest(envelope: AgentRequestEnvelope): ProviderRequest {
  return createProviderRequest({
    requestId: envelope.requestId,
    taskId: envelope.taskId,
    prompt: envelope.objective,
    constraints: envelope.constraints,
    requiredCapabilities: ['execution'],
  });
}

/**
 * Executes a single agent request against exactly one provider.
 *
 * Accepts the immutable envelope and a Provider instance via dependency
 * injection.  Translates the envelope into a ProviderRequest, invokes
 * the provider, and returns the ProviderResult unchanged.
 *
 * Fail-closed handling:
 *   - Provider exception       → PROVIDER_INTERNAL_ERROR (recoverable)
 *   - Malformed / invalid result → PROVIDER_INVALID_RESPONSE (not recoverable)
 */
export async function executeAgentRequest(
  envelope: AgentRequestEnvelope,
  provider: Provider,
): Promise<ProviderResult> {
  const request = buildProviderRequest(envelope);

  let rawResult: unknown;
  try {
    rawResult = await provider.execute(request);
  } catch (error) {
    return createProviderResult({
      requestId: envelope.requestId,
      status: 'ERROR',
      error: {
        requestId: envelope.requestId,
        code: 'PROVIDER_INTERNAL_ERROR',
        message: safeErrorMessage(error),
        recoverable: true,
      },
    });
  }

  if (rawResult === undefined || rawResult === null || typeof rawResult !== 'object' || Array.isArray(rawResult)) {
    return createProviderResult({
      requestId: envelope.requestId,
      status: 'ERROR',
      error: {
        requestId: envelope.requestId,
        code: 'PROVIDER_INVALID_RESPONSE',
        message: 'Provider returned a non-object result.',
        recoverable: false,
      },
    });
  }

  try {
    return createProviderResult(rawResult as Parameters<typeof createProviderResult>[0]);
  } catch (validationError) {
    return createProviderResult({
      requestId: envelope.requestId,
      status: 'ERROR',
      error: {
        requestId: envelope.requestId,
        code: 'PROVIDER_INVALID_RESPONSE',
        message: safeErrorMessage(validationError),
        recoverable: false,
      },
    });
  }
}
