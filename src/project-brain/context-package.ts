import { deepFreeze } from './knowledge-artifact.ts';
import type { ContextDiagnosticEvent, ContextPackageIssue, ContextPackageMetadata, ContextPackageResult, ContextPackageTraceabilityLink, ContextPackageWarning, ContextPackageValidationFailure } from './context-item.ts';
import { compareContextDiagnosticEvents, compareContextPackageIssues, compareContextPackageItems } from './context-item.ts';
import type { ContextPackageItem } from './context-item.ts';

function sortAndFreezeItems<T>(items: readonly T[], comparator: (left: T, right: T) => number): readonly T[] {
  return deepFreeze([...items].sort(comparator));
}

export function sortContextPackageItems(items: readonly ContextPackageItem[]): readonly ContextPackageItem[] {
  return sortAndFreezeItems(items, compareContextPackageItems);
}

export function sortContextPackageIssues(items: readonly ContextPackageIssue[]): readonly ContextPackageIssue[] {
  return sortAndFreezeItems(items, compareContextPackageIssues);
}

export function sortContextPackageWarnings(items: readonly ContextPackageWarning[]): readonly ContextPackageWarning[] {
  return deepFreeze(
    [...items].sort((left, right) => {
      if ((left.artifactId ?? '') !== (right.artifactId ?? '')) {
        return (left.artifactId ?? '').localeCompare(right.artifactId ?? '');
      }

      if (left.code !== right.code) {
        return left.code.localeCompare(right.code);
      }

      return left.message.localeCompare(right.message);
    }),
  );
}

export function sortContextPackageValidationFailures(
  failures: readonly ContextPackageValidationFailure[],
): readonly ContextPackageValidationFailure[] {
  return deepFreeze(
    [...failures].sort((left, right) => {
      if (left.source !== right.source) {
        return left.source.localeCompare(right.source);
      }

      if ((left.artifactId ?? '') !== (right.artifactId ?? '')) {
        return (left.artifactId ?? '').localeCompare(right.artifactId ?? '');
      }

      if ((left.relatedArtifactId ?? '') !== (right.relatedArtifactId ?? '')) {
        return (left.relatedArtifactId ?? '').localeCompare(right.relatedArtifactId ?? '');
      }

      if (left.code !== right.code) {
        return left.code.localeCompare(right.code);
      }

      return left.message.localeCompare(right.message);
    }),
  );
}

export function sortContextPackageTraceabilityLinks(
  links: readonly ContextPackageTraceabilityLink[],
): readonly ContextPackageTraceabilityLink[] {
  return deepFreeze(
    [...links].sort((left, right) => {
      if (left.artifactId !== right.artifactId) {
        return left.artifactId.localeCompare(right.artifactId);
      }

      if (left.revisionId !== right.revisionId) {
        return left.revisionId.localeCompare(right.revisionId);
      }

      return left.reason.localeCompare(right.reason);
    }),
  );
}

export function sortContextDiagnosticEvents(
  events: readonly ContextDiagnosticEvent[],
): readonly ContextDiagnosticEvent[] {
  return sortAndFreezeItems(events, compareContextDiagnosticEvents);
}

export function freezeContextPackageResult(result: ContextPackageResult): ContextPackageResult {
  return deepFreeze({
    ...result,
    includedItems: sortContextPackageItems(result.includedItems),
    excludedItems: sortContextPackageIssues(result.excludedItems),
    missingItems: sortContextPackageIssues(result.missingItems),
    staleItems: sortContextPackageIssues(result.staleItems),
    derivedItems: sortContextPackageItems(result.derivedItems),
    ambiguousItems: sortContextPackageIssues(result.ambiguousItems),
    authorityBlockedItems: sortContextPackageIssues(result.authorityBlockedItems),
    invalidReferenceItems: sortContextPackageIssues(result.invalidReferenceItems),
    supersededItems: sortContextPackageIssues(result.supersededItems),
    blockedItems: sortContextPackageIssues(result.blockedItems),
    warnings: sortContextPackageWarnings(result.warnings),
    validationFailures: sortContextPackageValidationFailures(result.validationFailures),
    diagnostics: sortContextDiagnosticEvents(result.diagnostics),
    traceabilityLinks: sortContextPackageTraceabilityLinks(result.traceabilityLinks),
  });
}

export function buildContextPackageMetadata(metadata: ContextPackageMetadata): ContextPackageMetadata {
  return deepFreeze({
    ...metadata,
  });
}

