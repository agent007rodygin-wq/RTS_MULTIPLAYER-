import { deepFreeze } from './knowledge-artifact.ts';
import type { ContextPackageBuildRequest } from './context-request.ts';
import { createContextPackageBuildRequest } from './context-request.ts';
import {
  buildContextPackageMetadata,
  freezeContextPackageResult,
} from './context-package.ts';
import {
  appendContextDiagnosticEvent,
  buildContextDiagnosticEvent,
} from './context-diagnostics.ts';
import type {
  ContextDiagnosticEvent,
  ContextPackageIssue,
  ContextPackageResult,
  ContextPackageValidationFailure,
} from './context-item.ts';
import { buildContextPackageSerialization } from './context-serialization.ts';
import {
  validateContextPackageConsistency,
  validateContextPackageFoundation,
} from './context-validation.ts';
import { selectContextPackageItems } from './context-selection.ts';

function createTraceabilityLinksFromIssues(
  issues: readonly ContextPackageIssue[],
  request: ContextPackageBuildRequest,
): ContextPackageResult['traceabilityLinks'] {
  const traceability = request.source.traceability;

  return deepFreeze(
    issues.map((issue) => ({
      artifactId: issue.artifactId,
      sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
      revisionId: issue.revision?.revisionId ?? 'unknown',
      dependencyPaths: traceability.dependencyPaths.filter((path) => path.includes(issue.artifactId)).sort(),
      planStepCodes: issue.requestedBy,
      requestedBy: issue.requestedBy,
      reason: issue.message,
    })),
  );
}

function buildBlockedPackage(
  request: ContextPackageBuildRequest,
  statusCode: string,
  message: string,
  diagnostics: ContextDiagnosticEvent[],
  validationFailures: readonly ContextPackageValidationFailure[],
  blockedIssues: readonly ContextPackageIssue[],
): ContextPackageResult {
  const { session, response, executionPlan, authority, dependencyGraph } = request.source;

  const blockedResult = freezeContextPackageResult({
    schemaVersion: '1.0.0',
    status: 'BLOCKED',
    contextRequestId: request.contextRequestId,
    sourceBrainSessionId: session.sessionId,
    sourceBrainResponseStatus: response.status,
    metadata: buildContextPackageMetadata({
      schemaVersion: '1.0.0',
      packageId: `CONTEXT-PACKAGE::${session.sessionId}`,
      packageFingerprint: '',
      sourceRequestId: session.requestId,
      sourceTaskId: session.taskId,
      sourceBrainSessionId: session.sessionId,
      sourceBrainResponseStatus: response.status,
      sourceBrainPlanStatus: executionPlan.status,
      sourceBrainAuthorityStatus: authority.blocked ? 'BLOCKED' : 'ALLOWED',
      sourceBrainDependencyNodeCount: dependencyGraph.nodes.length,
      includedCount: 0,
      excludedCount: 0,
      missingCount: 0,
      staleCount: 0,
      derivedCount: 0,
      ambiguousCount: 0,
      authorityBlockedCount: blockedIssues.filter((issue) => issue.category === 'AUTHORITY_BLOCKED').length,
      invalidReferenceCount: blockedIssues.filter((issue) => issue.category === 'INVALID_REFERENCE').length,
      supersededCount: blockedIssues.filter((issue) => issue.category === 'SUPERSEDED').length,
      warningCount: 0,
      validationFailureCount: validationFailures.length,
      traceabilityLinkCount: blockedIssues.length,
      estimatedSerializedLength: 0,
    }),
    includedItems: [],
    excludedItems: [],
    missingItems: [],
    staleItems: [],
    derivedItems: [],
    ambiguousItems: [],
    authorityBlockedItems: blockedIssues.filter((issue) => issue.category === 'AUTHORITY_BLOCKED'),
    invalidReferenceItems: blockedIssues.filter((issue) => issue.category === 'INVALID_REFERENCE'),
    supersededItems: blockedIssues.filter((issue) => issue.category === 'SUPERSEDED'),
    blockedItems: blockedIssues,
    warnings: [
      {
        code: statusCode,
        message,
      },
    ],
    validationFailures,
    diagnostics,
    traceabilityLinks: createTraceabilityLinksFromIssues(blockedIssues, request),
    serialized: '',
  });

  const serialization = buildContextPackageSerialization(blockedResult);
  const finalized = freezeContextPackageResult({
    ...blockedResult,
    metadata: buildContextPackageMetadata({
      ...blockedResult.metadata,
      packageFingerprint: serialization.packageFingerprint,
      estimatedSerializedLength: serialization.serialized.length,
    }),
    serialized: serialization.serialized,
  });

  return finalized;
}

function buildReadyPackage(
  request: ContextPackageBuildRequest,
  diagnostics: ContextDiagnosticEvent[],
  selection = selectContextPackageItems({ request, foundationValidation: validateContextPackageFoundation(request) }),
): ContextPackageResult {
  const { session, response, executionPlan, authority, dependencyGraph } = request.source;

  const baseResult = freezeContextPackageResult({
    schemaVersion: '1.0.0',
    status: 'READY',
    contextRequestId: request.contextRequestId,
    sourceBrainSessionId: session.sessionId,
    sourceBrainResponseStatus: response.status,
    metadata: buildContextPackageMetadata({
      schemaVersion: '1.0.0',
      packageId: `CONTEXT-PACKAGE::${session.sessionId}`,
      packageFingerprint: '',
      sourceRequestId: session.requestId,
      sourceTaskId: session.taskId,
      sourceBrainSessionId: session.sessionId,
      sourceBrainResponseStatus: response.status,
      sourceBrainPlanStatus: executionPlan.status,
      sourceBrainAuthorityStatus: authority.blocked ? 'BLOCKED' : 'ALLOWED',
      sourceBrainDependencyNodeCount: dependencyGraph.nodes.length,
      includedCount: selection.includedItems.length,
      excludedCount: selection.excludedItems.length,
      missingCount: selection.missingItems.length,
      staleCount: selection.staleItems.length,
      derivedCount: selection.derivedItems.length,
      ambiguousCount: selection.ambiguousItems.length,
      authorityBlockedCount: selection.authorityBlockedItems.length,
      invalidReferenceCount: selection.invalidReferenceItems.length,
      supersededCount: selection.supersededItems.length,
      warningCount: selection.warnings.length,
      validationFailureCount: selection.validationFailures.length,
      traceabilityLinkCount: selection.traceabilityLinks.length,
      estimatedSerializedLength: 0,
    }),
    includedItems: selection.includedItems,
    excludedItems: selection.excludedItems,
    missingItems: selection.missingItems,
    staleItems: selection.staleItems,
    derivedItems: selection.derivedItems,
    ambiguousItems: selection.ambiguousItems,
    authorityBlockedItems: selection.authorityBlockedItems,
    invalidReferenceItems: selection.invalidReferenceItems,
    supersededItems: selection.supersededItems,
    blockedItems: selection.blockedItems,
    warnings: selection.warnings,
    validationFailures: selection.validationFailures,
    diagnostics,
    traceabilityLinks: selection.traceabilityLinks,
    serialized: '',
  });

  const serialization = buildContextPackageSerialization(baseResult);
  const finalized = freezeContextPackageResult({
    ...baseResult,
    metadata: buildContextPackageMetadata({
      ...baseResult.metadata,
      packageFingerprint: serialization.packageFingerprint,
      estimatedSerializedLength: serialization.serialized.length,
    }),
    serialized: serialization.serialized,
  });

  return finalized;
}

export function buildContextPackage(input: ContextPackageBuildRequest | unknown): ContextPackageResult {
  const request = createContextPackageBuildRequest(input as never);
  const foundationValidation = validateContextPackageFoundation(request);
  const diagnostics: ContextDiagnosticEvent[] = [];

  appendContextDiagnosticEvent(diagnostics, {
    stage: 'request',
    severity: 'INFO',
    code: 'CONTEXT_REQUEST_NORMALIZED',
    message: `Context request ${request.contextRequestId} normalized.`,
    contextRequestId: request.contextRequestId,
    sourceBrainSessionId: request.source.session.sessionId,
  });

  appendContextDiagnosticEvent(diagnostics, {
    stage: 'foundation',
    severity: foundationValidation.valid ? 'INFO' : 'ERROR',
    code: foundationValidation.valid ? 'FOUNDATION_VALIDATED' : 'FOUNDATION_INVALID',
    message: foundationValidation.valid
      ? 'Foundation outputs validated for context assembly.'
      : 'Foundation outputs blocked context assembly.',
    contextRequestId: request.contextRequestId,
    sourceBrainSessionId: request.source.session.sessionId,
  });

  if (!foundationValidation.valid) {
    return buildBlockedPackage(
      request,
      foundationValidation.issues[0]?.code ?? 'FOUNDATION_INVALID',
      foundationValidation.issues[0]?.message ?? 'Foundation validation failed.',
      diagnostics,
      foundationValidation.issues,
      foundationValidation.issues.map((issue) => ({
        artifactId: issue.artifactId ?? issue.code,
        category: 'AUTHORITY_BLOCKED' as const,
        reasonCode: issue.code,
        message: issue.message,
        roles: [],
        dependencyArtifactIds: [],
        selectedFromArtifactIds: [],
        requestedBy: [],
        provenanceArtifactIds: [],
        traceabilityReferences: [],
      })),
    );
  }

  if (
    request.source.response.status === 'BLOCKED' ||
    request.source.authority.blocked ||
    request.source.executionPlan.status === 'BLOCKED'
  ) {
    const issues = request.source.authority.authorityFailures.map((failure) => ({
      artifactId: failure.artifactId ?? failure.code,
      category: 'AUTHORITY_BLOCKED' as const,
      reasonCode: failure.code,
      message: failure.message,
      roles: [],
      dependencyArtifactIds: [],
      selectedFromArtifactIds: [],
      requestedBy: [],
      provenanceArtifactIds: [],
      traceabilityReferences: [],
    }));

    diagnostics.push(
      buildContextDiagnosticEvent(
        'authority',
        'ERROR',
        'SOURCE_RESPONSE_BLOCKED',
        'Source brain response blocked context assembly.',
        request.contextRequestId,
        request.source.session.sessionId,
      ),
    );

    return buildBlockedPackage(
      request,
      request.source.authority.authorityFailures[0]?.code ?? 'SOURCE_RESPONSE_BLOCKED',
      request.source.authority.authorityFailures[0]?.message ??
        'Source brain response blocked context assembly.',
      diagnostics,
      request.source.authority.authorityFailures.map((failure) => ({
        source: 'foundation' as const,
        code: failure.code,
        message: failure.message,
        artifactId: failure.artifactId,
        relatedArtifactId: failure.relatedArtifactId,
      })),
      issues,
    );
  }

  const selection = selectContextPackageItems({
    request,
    foundationValidation,
  });
  diagnostics.push(...selection.diagnostics);

  if (
    selection.validationFailures.length > 0 ||
    selection.missingItems.length > 0 ||
    selection.staleItems.length > 0 ||
    selection.ambiguousItems.length > 0 ||
    selection.authorityBlockedItems.length > 0 ||
    selection.invalidReferenceItems.length > 0
  ) {
    const blockedIssues = [
      ...selection.missingItems,
      ...selection.staleItems,
      ...selection.ambiguousItems,
      ...selection.authorityBlockedItems,
      ...selection.invalidReferenceItems,
    ];

    return buildBlockedPackage(
      request,
      selection.validationFailures[0]?.code ??
        blockedIssues[0]?.reasonCode ??
        'CONTEXT_ASSEMBLY_BLOCKED',
      selection.validationFailures[0]?.message ??
        blockedIssues[0]?.message ??
        'Context assembly failed.',
      diagnostics,
      selection.validationFailures,
      blockedIssues,
    );
  }

  diagnostics.push(
    buildContextDiagnosticEvent(
      'assembly',
      'INFO',
      'CONTEXT_PACKAGE_ASSEMBLED',
      `Context package assembled with ${selection.includedItems.length} included item(s).`,
      request.contextRequestId,
      request.source.session.sessionId,
    ),
  );

  diagnostics.push(
    buildContextDiagnosticEvent(
      'serialization',
      'INFO',
      'CONTEXT_PACKAGE_SERIALIZED',
      'Context package serialized deterministically.',
      request.contextRequestId,
      request.source.session.sessionId,
    ),
  );

  const readyPackage = buildReadyPackage(request, diagnostics, selection);
  const consistency = validateContextPackageConsistency(readyPackage, request);
  if (!consistency.valid) {
    return buildBlockedPackage(
      request,
      consistency.issues[0]?.code ?? 'CONTEXT_PACKAGE_INCONSISTENT',
      consistency.issues[0]?.message ?? 'Context package consistency validation failed.',
      diagnostics,
      consistency.issues,
      consistency.issues.map((issue) => ({
        artifactId: issue.artifactId ?? issue.code,
        category: 'VALIDATION_FAILURE' as const,
        reasonCode: issue.code,
        message: issue.message,
        roles: [],
        dependencyArtifactIds: [],
        selectedFromArtifactIds: [],
        requestedBy: [],
        provenanceArtifactIds: [],
        traceabilityReferences: [],
      })),
    );
  }

  return readyPackage;
}

