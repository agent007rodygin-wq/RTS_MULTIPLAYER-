import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { BrainPlanStepCode } from './brain-planner.ts';
import type { BrainResolvedArtifact } from './brain-dependency.ts';
import type { BrainTraceRecord } from './brain-trace.ts';
import type { ContextPackageBuildRequest } from './context-request.ts';
import {
  buildContextPackageRegistryIdentity,
  compareContextPackageIssues,
  compareContextPackageItems,
  dedupeContextPackageRoles,
  selectPrimaryContextRole,
  type ContextDiagnosticEvent,
  type ContextPackageIssue,
  type ContextPackageItem,
  type ContextPackageRole,
  type ContextPackageTraceabilityLink,
  type ContextPackageValidationFailure,
  type ContextPackageWarning,
} from './context-item.ts';
import type { ContextPackageFoundationValidationReport } from './context-validation.ts';
import { buildContextDiagnosticEvent } from './context-diagnostics.ts';

export interface ContextPackageSelectionReport {
  includedItems: readonly ContextPackageItem[];
  excludedItems: readonly ContextPackageIssue[];
  missingItems: readonly ContextPackageIssue[];
  staleItems: readonly ContextPackageIssue[];
  derivedItems: readonly ContextPackageItem[];
  ambiguousItems: readonly ContextPackageIssue[];
  authorityBlockedItems: readonly ContextPackageIssue[];
  invalidReferenceItems: readonly ContextPackageIssue[];
  supersededItems: readonly ContextPackageIssue[];
  blockedItems: readonly ContextPackageIssue[];
  warnings: readonly ContextPackageWarning[];
  validationFailures: readonly ContextPackageValidationFailure[];
  diagnostics: readonly ContextDiagnosticEvent[];
  traceabilityLinks: readonly ContextPackageTraceabilityLink[];
}

interface CandidateBucket {
  artifactId: string;
  nodes: readonly BrainResolvedArtifact[];
}

function isTraceabilityArtifact(node: BrainResolvedArtifact): boolean {
  const registryEntry = node.registryEntry;
  return /traceability/i.test(node.artifactId)
    || /traceability/i.test(registryEntry?.artifactType ?? '')
    || /traceability/i.test(registryEntry?.canonicalRole ?? '');
}

function mapBrainRoles(node: BrainResolvedArtifact): readonly ContextPackageRole[] {
  const roles: ContextPackageRole[] = [];

  if (node.roles.includes('authority')) {
    roles.push('Primary');
  }

  if (node.roles.includes('required')) {
    roles.push('Required');
  }

  if (node.roles.includes('dependency')) {
    roles.push('Dependency');
  }

  if (node.roles.includes('optional')) {
    roles.push('Optional');
  }

  if (isTraceabilityArtifact(node)) {
    roles.push('Traceability');
  }

  if (roles.length === 0) {
    roles.push('Supporting');
  } else if (node.classification === 'canonical' && !roles.includes('Supporting')) {
    roles.push('Supporting');
  }

  return dedupeContextPackageRoles(roles);
}

function mapPlanSteps(node: BrainResolvedArtifact): readonly BrainPlanStepCode[] {
  const steps = new Set<BrainPlanStepCode>();

  if (node.roles.includes('authority')) {
    steps.add('RESOLVE_AUTHORITY');
  }

  if (node.roles.includes('required') || node.roles.includes('optional') || node.roles.includes('dependency')) {
    steps.add('TRAVERSE_DEPENDENCIES');
  }

  if (isTraceabilityArtifact(node)) {
    steps.add('ASSEMBLE_TRACEABILITY');
  }

  if (steps.size === 0) {
    steps.add('RETURN_RESPONSE');
  }

  return Array.from(steps).sort();
}

function getTraceabilityReferences(traceability: BrainTraceRecord, artifactId: string): readonly string[] {
  return traceability.entries
    .filter((entry) => entry.artifactId === artifactId)
    .map((entry) => entry.rationale)
    .sort();
}

function getDependencyPaths(traceability: BrainTraceRecord, artifactId: string): readonly string[] {
  return traceability.dependencyPaths.filter((path) => path.includes(artifactId)).sort();
}

function buildRevision(node: BrainResolvedArtifact): ContextPackageItem['revision'] {
  if (!node.latestRevision) {
    return {
      revisionId: 'MISSING-REVISION',
      revisionOrder: 0,
      sourceRevision: 'unknown',
      storageKind: 'canonical',
      lifecycleState: 'PROPOSED',
      freshnessState: 'UNKNOWN',
      supersedesArtifactIds: [],
      canonicalSourceArtifactIds: [],
    };
  }

  return {
    revisionId: node.latestRevision.revisionId,
    revisionOrder: node.latestRevision.revisionOrder,
    sourceRevision: node.latestRevision.sourceRevision,
    storageKind: node.latestRevision.storageKind,
    lifecycleState: node.latestRevision.lifecycleState,
    freshnessState: node.latestRevision.freshnessState,
    supersedesArtifactIds: node.latestRevision.supersedesArtifactIds ?? [],
    canonicalSourceArtifactIds:
      node.latestRevision.canonicalSourceReferences?.map((reference) => reference.targetArtifactId) ?? [],
    notes: node.latestRevision.notes,
  };
}

function buildContextItem(node: BrainResolvedArtifact, traceability: BrainTraceRecord): ContextPackageItem {
  const roles = mapBrainRoles(node);
  const requestedBy = mapPlanSteps(node);
  const dependencyArtifactIds = [...node.dependencyArtifactIds].sort();
  const selectedFromArtifactIds = [...node.selectedFromArtifactIds].sort();
  const traceabilityReferences = getTraceabilityReferences(traceability, node.artifactId);

  return deepFreeze({
    artifactId: node.artifactId,
    normalizedArtifactId: node.artifactId,
    decision: 'INCLUDED' as const,
    roles,
    primaryRole: selectPrimaryContextRole(roles),
    authorityClassification: node.classification,
    registryIdentity: buildContextPackageRegistryIdentity(node.registryEntry!),
    revision: buildRevision(node),
    dependencyArtifactIds,
    selectedFromArtifactIds,
    requestedBy,
    provenanceArtifactIds: [...dependencyArtifactIds, ...traceabilityReferences].sort(),
    traceabilityReferences,
    inclusionReason: `${node.artifactId} :: ${node.rationale}`,
  });
}

function buildIssue(
  node: BrainResolvedArtifact | undefined,
  category: ContextPackageIssue['category'],
  reasonCode: string,
  message: string,
  traceability: BrainTraceRecord,
): ContextPackageIssue {
  const roles = node ? mapBrainRoles(node) : [];
  const requestedBy = node ? mapPlanSteps(node) : [];
  const dependencyArtifactIds = node ? [...node.dependencyArtifactIds].sort() : [];
  const selectedFromArtifactIds = node ? [...node.selectedFromArtifactIds].sort() : [];
  const traceabilityReferences = node ? getTraceabilityReferences(traceability, node.artifactId) : [];

  return {
    artifactId: node?.artifactId ?? reasonCode,
    category,
    reasonCode,
    message,
    roles,
    primaryRole: roles.length > 0 ? selectPrimaryContextRole(roles) : undefined,
    registryIdentity: node?.registryEntry ? buildContextPackageRegistryIdentity(node.registryEntry) : undefined,
    revision: node ? buildRevision(node) : undefined,
    dependencyArtifactIds,
    selectedFromArtifactIds,
    requestedBy,
    provenanceArtifactIds: [...dependencyArtifactIds, ...traceabilityReferences].sort(),
    traceabilityReferences,
  };
}

function createCandidateBuckets(nodes: readonly BrainResolvedArtifact[]): CandidateBucket[] {
  const buckets = new Map<string, BrainResolvedArtifact[]>();

  for (const node of nodes) {
    const bucket = buckets.get(node.artifactId) ?? [];
    bucket.push(node);
    buckets.set(node.artifactId, bucket);
  }

  return [...buckets.entries()]
    .map(([artifactId, bucket]) => ({
      artifactId,
      nodes: bucket.sort((left, right) => stableStringify(left).localeCompare(stableStringify(right))),
    }))
    .sort((left, right) => left.artifactId.localeCompare(right.artifactId));
}

function compareWarning(left: ContextPackageWarning, right: ContextPackageWarning): number {
  if ((left.artifactId ?? '') !== (right.artifactId ?? '')) {
    return (left.artifactId ?? '').localeCompare(right.artifactId ?? '');
  }

  if (left.code !== right.code) {
    return left.code.localeCompare(right.code);
  }

  return left.message.localeCompare(right.message);
}

function compareLinks(left: ContextPackageTraceabilityLink, right: ContextPackageTraceabilityLink): number {
  if (left.artifactId !== right.artifactId) {
    return left.artifactId.localeCompare(right.artifactId);
  }

  if (left.revisionId !== right.revisionId) {
    return left.revisionId.localeCompare(right.revisionId);
  }

  return left.reason.localeCompare(right.reason);
}

export function selectContextPackageItems(input: {
  request: ContextPackageBuildRequest;
  foundationValidation: ContextPackageFoundationValidationReport;
}): ContextPackageSelectionReport {
  const { request } = input;
  const { authority, executionPlan, dependencyGraph, traceability } = request.source;
  const candidateBuckets = createCandidateBuckets(dependencyGraph.nodes);

  const includedItems: ContextPackageItem[] = [];
  const excludedItems: ContextPackageIssue[] = [];
  const missingItems: ContextPackageIssue[] = [];
  const staleItems: ContextPackageIssue[] = [];
  const derivedItems: ContextPackageItem[] = [];
  const ambiguousItems: ContextPackageIssue[] = [];
  const authorityBlockedItems: ContextPackageIssue[] = [];
  const invalidReferenceItems: ContextPackageIssue[] = [];
  const supersededItems: ContextPackageIssue[] = [];
  const blockedItems: ContextPackageIssue[] = [];
  const warnings: ContextPackageWarning[] = [];
  const validationFailures: ContextPackageValidationFailure[] = [];
  const diagnostics: ContextDiagnosticEvent[] = [];
  const traceabilityLinks: ContextPackageTraceabilityLink[] = [];

  diagnostics.push(
    buildContextDiagnosticEvent(
      'selection',
      'INFO',
      'CONTEXT_SELECTION_START',
      `Evaluating ${candidateBuckets.length} candidate context artifact(s).`,
      request.contextRequestId,
      request.source.session.sessionId,
    ),
  );

  if (authority.blocked || executionPlan.status === 'BLOCKED' || request.source.response.status === 'BLOCKED') {
    const failures: readonly { code: string; message: string; artifactId?: string }[] = authority.authorityFailures.length > 0
      ? authority.authorityFailures
      : authority.validationFailures.length > 0
        ? authority.validationFailures.map((failure) => ({
            code: failure.code,
            message: failure.message,
          }))
        : [
            {
              code: 'SOURCE_RESPONSE_BLOCKED',
              message: 'Source brain response blocked context assembly.',
            },
          ];

    for (const failure of failures) {
      const node = failure.artifactId
        ? dependencyGraph.nodes.find((candidate) => candidate.artifactId === failure.artifactId)
        : undefined;
      const issue = buildIssue(
        node,
        'AUTHORITY_BLOCKED',
        failure.code,
        failure.message,
        traceability,
      );
      authorityBlockedItems.push(issue);
      blockedItems.push(issue);
      validationFailures.push({
        source: 'foundation',
        code: failure.code,
        message: failure.message,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths: getDependencyPaths(traceability, issue.artifactId),
          planStepCodes: issue.requestedBy,
          requestedBy: issue.requestedBy,
          reason: issue.message,
        }),
      );
    }

    diagnostics.push(
      buildContextDiagnosticEvent(
        'selection',
        'ERROR',
        'CONTEXT_SELECTION_BLOCKED',
        'Source response blocked context assembly.',
        request.contextRequestId,
        request.source.session.sessionId,
      ),
    );

    return deepFreeze({
      includedItems,
      excludedItems,
      missingItems,
      staleItems,
      derivedItems,
      ambiguousItems,
      authorityBlockedItems,
      invalidReferenceItems,
      supersededItems,
      blockedItems,
      warnings,
      validationFailures,
      diagnostics,
      traceabilityLinks,
    });
  }

  for (const bucket of candidateBuckets) {
    const node = bucket.nodes[0];
    const signatures = new Set(
      bucket.nodes.map((candidate) =>
        stableStringify({
          artifactId: candidate.artifactId,
          roles: candidate.roles,
          classification: candidate.classification,
          selectedFromArtifactIds: candidate.selectedFromArtifactIds,
          dependencyArtifactIds: candidate.dependencyArtifactIds,
          revisionId: candidate.latestRevision?.revisionId,
          revisionOrder: candidate.latestRevision?.revisionOrder,
          sourceRevision: candidate.latestRevision?.sourceRevision,
        }),
      ),
    );

    if (signatures.size > 1) {
      const issue = buildIssue(
        node,
        'AMBIGUOUS',
        'AMBIGUOUS_CONTEXT_REFERENCE',
        `Conflicting context records detected for ${bucket.artifactId}.`,
        traceability,
      );
      ambiguousItems.push(issue);
      blockedItems.push(issue);
      validationFailures.push({
        source: 'package',
        code: 'AMBIGUOUS_REFERENCE',
        message: issue.message,
        artifactId: bucket.artifactId,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths: getDependencyPaths(traceability, issue.artifactId),
          planStepCodes: issue.requestedBy,
          requestedBy: issue.requestedBy,
          reason: issue.message,
        }),
      );
      continue;
    }

    if (!node.registryEntry) {
      const issue = buildIssue(
        node,
        'INVALID_REFERENCE',
        'MISSING_REGISTRY_ENTRY',
        `Registry entry is missing for ${node.artifactId}.`,
        traceability,
      );
      invalidReferenceItems.push(issue);
      blockedItems.push(issue);
      validationFailures.push({
        source: 'package',
        code: 'MISSING_REGISTRY_ENTRY',
        message: issue.message,
        artifactId: node.artifactId,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths: getDependencyPaths(traceability, issue.artifactId),
          planStepCodes: issue.requestedBy,
          requestedBy: issue.requestedBy,
          reason: issue.message,
        }),
      );
      continue;
    }

    if (!node.latestRevision) {
      const issue = buildIssue(
        node,
        'INVALID_REFERENCE',
        'MISSING_REVISION',
        `Knowledge revision is missing for ${node.artifactId}.`,
        traceability,
      );
      invalidReferenceItems.push(issue);
      blockedItems.push(issue);
      validationFailures.push({
        source: 'package',
        code: 'MISSING_REVISION',
        message: issue.message,
        artifactId: node.artifactId,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths: getDependencyPaths(traceability, issue.artifactId),
          planStepCodes: issue.requestedBy,
          requestedBy: issue.requestedBy,
          reason: issue.message,
        }),
      );
      continue;
    }

    if (node.classification === 'stale') {
      const issue = buildIssue(
        node,
        'STALE',
        'STALE_CONTEXT_ARTIFACT',
        `Stale context artifact excluded: ${node.artifactId}.`,
        traceability,
      );
      staleItems.push(issue);
      blockedItems.push(issue);
      validationFailures.push({
        source: 'package',
        code: 'STALE_CONTEXT_ARTIFACT',
        message: issue.message,
        artifactId: node.artifactId,
      });
      warnings.push({
        artifactId: issue.artifactId,
        code: 'STALE_CONTEXT_EXCLUDED',
        message: issue.message,
        relatedArtifactId: issue.revision?.revisionId,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths: getDependencyPaths(traceability, issue.artifactId),
          planStepCodes: issue.requestedBy,
          requestedBy: issue.requestedBy,
          reason: issue.message,
        }),
      );
      continue;
    }

    const requestedBy = mapPlanSteps(node);
    const traceabilityReferences = getTraceabilityReferences(traceability, node.artifactId);
    const dependencyPaths = getDependencyPaths(traceability, node.artifactId);
    const roles = mapBrainRoles(node);

    if (request.excludedArtifactIds.includes(node.artifactId)) {
      const issue = buildIssue(
        node,
        'EXCLUDED',
        'REQUEST_EXCLUDED',
        `Explicitly excluded context artifact: ${node.artifactId}.`,
        traceability,
      );
      excludedItems.push(issue);
      warnings.push({
        artifactId: issue.artifactId,
        code: 'EXPLICIT_CONTEXT_EXCLUSION',
        message: issue.message,
        relatedArtifactId: issue.revision?.revisionId,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths,
          planStepCodes: requestedBy,
          requestedBy,
          reason: issue.message,
        }),
      );
      continue;
    }

    if (node.classification === 'superseded') {
      const issue = buildIssue(
        node,
        'SUPERSEDED',
        'SUPERSEDED_CONTEXT_REVISION',
        `Superseded context revision excluded: ${node.artifactId}.`,
        traceability,
      );
      supersededItems.push(issue);
      excludedItems.push(issue);
      warnings.push({
        artifactId: issue.artifactId,
        code: 'SUPERSEDED_CONTEXT_EXCLUDED',
        message: issue.message,
        relatedArtifactId: issue.revision?.revisionId,
      });
      traceabilityLinks.push(
        deepFreeze({
          artifactId: issue.artifactId,
          sourceRevision: issue.revision?.sourceRevision ?? 'unknown',
          revisionId: issue.revision?.revisionId ?? 'unknown',
          dependencyPaths,
          planStepCodes: requestedBy,
          requestedBy,
          reason: issue.message,
        }),
      );
      continue;
    }

    const item = buildContextItem(node, traceability);
    includedItems.push(item);
    if (item.authorityClassification === 'derived') {
      derivedItems.push(item);
      warnings.push({
        artifactId: item.artifactId,
        code: 'DERIVED_CONTEXT_INCLUDED',
        message: `Derived context artifact included: ${item.artifactId}.`,
      });
    }

    traceabilityLinks.push(
      deepFreeze({
        artifactId: item.artifactId,
        sourceRevision: item.revision.sourceRevision,
        revisionId: item.revision.revisionId,
        dependencyPaths,
        planStepCodes: requestedBy,
        requestedBy,
        reason: item.inclusionReason,
      }),
    );
  }

  includedItems.sort(compareContextPackageItems);
  excludedItems.sort(compareContextPackageIssues);
  missingItems.sort(compareContextPackageIssues);
  staleItems.sort(compareContextPackageIssues);
  derivedItems.sort(compareContextPackageItems);
  ambiguousItems.sort(compareContextPackageIssues);
  authorityBlockedItems.sort(compareContextPackageIssues);
  invalidReferenceItems.sort(compareContextPackageIssues);
  supersededItems.sort(compareContextPackageIssues);
  blockedItems.sort(compareContextPackageIssues);
  warnings.sort(compareWarning);
  traceabilityLinks.sort(compareLinks);

  diagnostics.push(
    buildContextDiagnosticEvent(
      'selection',
      'INFO',
      'CONTEXT_SELECTION_COMPLETE',
      `Selected ${includedItems.length} context item(s).`,
      request.contextRequestId,
      request.source.session.sessionId,
    ),
  );

  return deepFreeze({
    includedItems,
    excludedItems,
    missingItems,
    staleItems,
    derivedItems,
    ambiguousItems,
    authorityBlockedItems,
    invalidReferenceItems,
    supersededItems,
    blockedItems,
    warnings,
    validationFailures,
    diagnostics,
    traceabilityLinks,
  });
}
