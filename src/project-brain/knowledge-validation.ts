import {
  lookupCanonicalArtifact,
  resolveArtifactReference,
  validateCanonicalRegistry,
  type CanonicalRegistry,
} from './canonical-registry.ts';
import type {
  KnowledgeArtifactRevision,
  KnowledgeLifecycleState,
  KnowledgeStorageKind,
} from './knowledge-artifact.ts';
import {
  getAllowedKnowledgeLifecycleStates,
  validateKnowledgeLifecycleTransition,
} from './knowledge-lifecycle.ts';
import { stableStringify } from './knowledge-artifact.ts';

export interface KnowledgeValidationIssue {
  code:
    | 'INVALID_REGISTRY_SHAPE'
    | 'INVALID_LIFECYCLE_STATE'
    | 'INVALID_LIFECYCLE_TRANSITION'
    | 'INVALID_STORAGE_KIND'
    | 'PROVENANCE_MISMATCH'
    | 'MISSING_REGISTRY_ENTRY'
    | 'REGISTRY_METADATA_MISMATCH'
    | 'MISSING_CANONICAL_SOURCE'
    | 'BROKEN_CANONICAL_REFERENCE'
    | 'BROKEN_SUPERSEDES_REFERENCE'
    | 'DUPLICATE_REVISION_ID'
    | 'DUPLICATE_REVISION_ORDER'
    | 'CONFLICTING_REVISION';
  message: string;
  artifactId?: string;
  revisionId?: string;
  relatedArtifactId?: string;
}

export interface KnowledgeValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly KnowledgeValidationIssue[];
}

function isDerivedRegistryEntry(candidate: { canonicalRole: string; artifactType: string }): boolean {
  return /derived/i.test(candidate.canonicalRole) || /derived/i.test(candidate.artifactType);
}

function makeIssue(
  code: KnowledgeValidationIssue['code'],
  message: string,
  artifactId?: string,
  revisionId?: string,
  relatedArtifactId?: string,
): KnowledgeValidationIssue {
  return {
    code,
    message,
    artifactId,
    revisionId,
    relatedArtifactId,
  };
}

function mergeIssues(...groups: readonly KnowledgeValidationIssue[][]): readonly KnowledgeValidationIssue[] {
  return groups.flat();
}

function validateRegistryCompatibility(
  revision: KnowledgeArtifactRevision,
  registry: CanonicalRegistry,
): readonly KnowledgeValidationIssue[] {
  const issues: KnowledgeValidationIssue[] = [];
  const registryEntry = lookupCanonicalArtifact(registry, revision.artifactId);

  if (!registryEntry) {
    issues.push(
      makeIssue(
        'MISSING_REGISTRY_ENTRY',
        `Registry does not contain artifact ${revision.artifactId}.`,
        revision.artifactId,
        revision.revisionId,
      ),
    );
    return issues;
  }

  if (
    registryEntry.artifactType !== revision.artifactType ||
    registryEntry.canonicalRole !== revision.canonicalRole ||
    registryEntry.authoritySource !== revision.authoritySource ||
    registryEntry.owner !== revision.owner
  ) {
    issues.push(
      makeIssue(
        'REGISTRY_METADATA_MISMATCH',
        `Knowledge record ${revision.artifactId} does not match the Package A registry metadata.`,
        revision.artifactId,
        revision.revisionId,
      ),
    );
  }

  return issues;
}

function validateCanonicalSourceLinks(
  revision: KnowledgeArtifactRevision,
  registry: CanonicalRegistry,
): readonly KnowledgeValidationIssue[] {
  const issues: KnowledgeValidationIssue[] = [];
  const references = revision.canonicalSourceReferences ?? [];

  if (revision.storageKind === 'derived' && references.length === 0) {
    issues.push(
      makeIssue(
        'MISSING_CANONICAL_SOURCE',
        `Derived artifact ${revision.artifactId} must point to at least one canonical source.`,
        revision.artifactId,
        revision.revisionId,
      ),
    );
    return issues;
  }

  for (const reference of references) {
    const resolution =
      revision.provenance.canonicalSourceResolutions?.find(
        (candidate) =>
          candidate.reference.targetArtifactId === reference.targetArtifactId &&
          candidate.reference.sourceArtifactId === reference.sourceArtifactId,
      ) ?? resolveArtifactReference(registry, reference);

    if (!resolution || resolution.resolutionStatus === 'INVALID_REFERENCE' || resolution.resolutionStatus === 'MISSING') {
      issues.push(
        makeIssue(
          'BROKEN_CANONICAL_REFERENCE',
          `Canonical source reference ${reference.targetArtifactId} could not be resolved for ${revision.artifactId}.`,
          revision.artifactId,
          revision.revisionId,
          reference.targetArtifactId,
        ),
      );
      continue;
    }

    if (resolution.resolutionStatus !== 'RESOLVED' && resolution.resolutionStatus !== 'RESOLVED_WITH_REDIRECT') {
      issues.push(
        makeIssue(
          'BROKEN_CANONICAL_REFERENCE',
          `Canonical source reference ${reference.targetArtifactId} resolved with ${resolution.resolutionStatus} and cannot remain authoritative for ${revision.artifactId}.`,
          revision.artifactId,
          revision.revisionId,
          reference.targetArtifactId,
        ),
      );
      continue;
    }

    const target = resolution.artifact;
    if (!target || isDerivedRegistryEntry(target)) {
      issues.push(
        makeIssue(
          'BROKEN_CANONICAL_REFERENCE',
          `Canonical source reference ${reference.targetArtifactId} must resolve to canonical knowledge, not a derived surface.`,
          revision.artifactId,
          revision.revisionId,
          reference.targetArtifactId,
        ),
      );
    }
  }

  return issues;
}

function validateSupersessionLinks(
  revision: KnowledgeArtifactRevision,
  registry: CanonicalRegistry,
): readonly KnowledgeValidationIssue[] {
  const issues: KnowledgeValidationIssue[] = [];
  const supersedes = revision.supersedesArtifactIds ?? [];

  for (const relatedArtifactId of supersedes) {
    const related = lookupCanonicalArtifact(registry, relatedArtifactId);
    if (!related) {
      issues.push(
        makeIssue(
          'BROKEN_SUPERSEDES_REFERENCE',
          `Supersession target ${relatedArtifactId} is missing from the Package A registry.`,
          revision.artifactId,
          revision.revisionId,
          relatedArtifactId,
        ),
      );
    }
  }

  return issues;
}

export function validateKnowledgeArtifactRevision(
  revision: KnowledgeArtifactRevision,
  registry: CanonicalRegistry,
): KnowledgeValidationReport {
  const registryIssues = validateCanonicalRegistry(registry);
  if (!registryIssues.valid) {
    return {
      valid: false,
      issueCount: registryIssues.issueCount,
      issues: registryIssues.issues.map((issue) =>
        makeIssue(
          'INVALID_REGISTRY_SHAPE',
          issue.message,
          revision.artifactId,
          revision.revisionId,
        ),
      ),
    };
  }

  const issues: KnowledgeValidationIssue[] = [];

  if (revision.storageKind !== 'canonical' && revision.storageKind !== 'derived') {
    issues.push(
      makeIssue(
        'INVALID_STORAGE_KIND',
        `Knowledge record ${revision.artifactId} has invalid storage kind ${String(revision.storageKind)}.`,
        revision.artifactId,
        revision.revisionId,
      ),
    );
  }

  if (revision.sourceRevision !== revision.provenance.sourceRevision) {
    issues.push(
      makeIssue(
        'PROVENANCE_MISMATCH',
        `Revision ${revision.revisionId} does not preserve source revision provenance.`,
        revision.artifactId,
        revision.revisionId,
      ),
    );
  }

  const allowedStates = getAllowedKnowledgeLifecycleStates(revision.storageKind);
  if (!allowedStates.includes(revision.lifecycleState)) {
    issues.push(
      makeIssue(
        'INVALID_LIFECYCLE_STATE',
        `Lifecycle state ${revision.lifecycleState} is not allowed for ${revision.storageKind} storage.`,
        revision.artifactId,
        revision.revisionId,
      ),
    );
  }

  issues.push(...validateRegistryCompatibility(revision, registry));
  issues.push(...validateCanonicalSourceLinks(revision, registry));
  issues.push(...validateSupersessionLinks(revision, registry));

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}

function compareRevisionOrder(left: KnowledgeArtifactRevision, right: KnowledgeArtifactRevision): number {
  if (left.artifactId !== right.artifactId) {
    return left.artifactId.localeCompare(right.artifactId);
  }

  if (left.revisionOrder !== right.revisionOrder) {
    return left.revisionOrder - right.revisionOrder;
  }

  if (left.revisionId !== right.revisionId) {
    return left.revisionId.localeCompare(right.revisionId);
  }

  return stableStringify(left).localeCompare(stableStringify(right));
}

export function validateKnowledgeRevisionHistory(
  revisions: readonly KnowledgeArtifactRevision[],
  registry: CanonicalRegistry,
): KnowledgeValidationReport {
  const issues: KnowledgeValidationIssue[] = [];

  const byArtifactId = new Map<string, KnowledgeArtifactRevision[]>();
  const byRevisionKey = new Map<string, string>();
  const byRevisionOrder = new Map<string, string>();

  for (const revision of revisions) {
    const individual = validateKnowledgeArtifactRevision(revision, registry);
    issues.push(...individual.issues);

    const key = `${revision.artifactId}::${revision.revisionId}`;
    const revisionSignature = stableStringify(revision);
    const priorSignature = byRevisionKey.get(key);
    if (priorSignature !== undefined) {
      issues.push(
        makeIssue(
          'DUPLICATE_REVISION_ID',
          `Duplicate revision ID detected for ${revision.artifactId}: ${revision.revisionId}.`,
          revision.artifactId,
          revision.revisionId,
        ),
      );
      if (priorSignature !== revisionSignature) {
        issues.push(
          makeIssue(
            'CONFLICTING_REVISION',
            `Conflicting revision content detected for ${revision.artifactId} at revision ID ${revision.revisionId}.`,
            revision.artifactId,
            revision.revisionId,
          ),
        );
      }
    } else {
      byRevisionKey.set(key, revisionSignature);
    }

    const orderKey = `${revision.artifactId}::${revision.revisionOrder}`;
    const priorOrderSignature = byRevisionOrder.get(orderKey);
    if (priorOrderSignature !== undefined) {
      issues.push(
        makeIssue(
          'DUPLICATE_REVISION_ORDER',
          `Duplicate revision order detected for ${revision.artifactId}: ${revision.revisionOrder}.`,
          revision.artifactId,
          revision.revisionId,
        ),
      );
      if (priorOrderSignature !== revisionSignature) {
        issues.push(
          makeIssue(
            'CONFLICTING_REVISION',
            `Conflicting revision content detected for ${revision.artifactId} at revision order ${revision.revisionOrder}.`,
            revision.artifactId,
            revision.revisionId,
          ),
        );
      }
    } else {
      byRevisionOrder.set(orderKey, revisionSignature);
    }

    const bucket = byArtifactId.get(revision.artifactId) ?? [];
    bucket.push(revision);
    byArtifactId.set(revision.artifactId, bucket);
  }

  for (const group of byArtifactId.values()) {
    const sorted = [...group].sort(compareRevisionOrder);

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];

      if (previous.storageKind !== current.storageKind) {
        issues.push(
          makeIssue(
            'CONFLICTING_REVISION',
            `Storage kind changed within artifact ${current.artifactId} from ${previous.storageKind} to ${current.storageKind}.`,
            current.artifactId,
            current.revisionId,
          ),
        );
      }

      const transition = validateKnowledgeLifecycleTransition(
        current.storageKind,
        previous.lifecycleState,
        current.lifecycleState,
      );

      if (!transition.valid) {
        issues.push(
          makeIssue(
            'INVALID_LIFECYCLE_TRANSITION',
            transition.reason ?? `Illegal lifecycle transition from ${previous.lifecycleState} to ${current.lifecycleState}.`,
            current.artifactId,
            current.revisionId,
          ),
        );
      }
    }
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
