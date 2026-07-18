import { deepFreeze } from './knowledge-artifact.ts';
import type { BrainDependencyGraph, BrainResolvedArtifact, BrainRequirementRole } from './brain-dependency.ts';
import type { BrainSession } from './brain-session.ts';

export interface BrainValidationFailure {
  source: 'request' | 'store';
  code: string;
  message: string;
  field?: string;
}

export interface BrainWarning {
  code:
    | 'OPTIONAL_ARTIFACT_MISSING'
    | 'OPTIONAL_ARTIFACT_STALE'
    | 'OPTIONAL_ARTIFACT_DERIVED'
    | 'DERIVED_REQUIRED_ARTIFACT';
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface BrainAuthorityFailure {
  code:
    | 'MISSING_AUTHORITY_ARTIFACT'
    | 'STALE_AUTHORITY_ARTIFACT'
    | 'DERIVED_AUTHORITY_ARTIFACT'
    | 'SUPERSEDED_AUTHORITY_ARTIFACT'
    | 'MISSING_REQUIRED_ARTIFACT'
    | 'STALE_REQUIRED_ARTIFACT'
    | 'DERIVED_REQUIRED_ARTIFACT';
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface BrainAuthorityReport {
  allowed: boolean;
  blocked: boolean;
  authorityFailures: readonly BrainAuthorityFailure[];
  validationFailures: readonly BrainValidationFailure[];
  warnings: readonly BrainWarning[];
  resolvedArtifacts: readonly BrainResolvedArtifact[];
  missingArtifacts: readonly BrainResolvedArtifact[];
  selectedArtifactIds: readonly string[];
  blockedArtifactIds: readonly string[];
  dependencyGraph: BrainDependencyGraph;
}

function hasRole(roles: readonly BrainRequirementRole[], role: BrainRequirementRole): boolean {
  return roles.includes(role);
}

function getPrimaryRole(roles: readonly BrainRequirementRole[]): BrainRequirementRole {
  if (hasRole(roles, 'authority')) return 'authority';
  if (hasRole(roles, 'required')) return 'required';
  if (hasRole(roles, 'optional')) return 'optional';
  return 'dependency';
}

function buildFailure(
  code: BrainAuthorityFailure['code'],
  message: string,
  artifactId?: string,
  relatedArtifactId?: string,
): BrainAuthorityFailure {
  return {
    code,
    message,
    artifactId,
    relatedArtifactId,
  };
}

function buildWarning(
  code: BrainWarning['code'],
  message: string,
  artifactId?: string,
  relatedArtifactId?: string,
): BrainWarning {
  return {
    code,
    message,
    artifactId,
    relatedArtifactId,
  };
}

function collectSortedIds(items: readonly BrainResolvedArtifact[]): string[] {
  return Array.from(new Set(items.map((item) => item.artifactId))).sort();
}

function collectBlockedIds(
  authorityFailures: readonly BrainAuthorityFailure[],
  missingArtifacts: readonly BrainResolvedArtifact[],
): string[] {
  return Array.from(
    new Set([
      ...authorityFailures.flatMap((failure) => (failure.artifactId ? [failure.artifactId] : [])),
      ...missingArtifacts.map((artifact) => artifact.artifactId),
    ]),
  ).sort();
}

export function evaluateBrainAuthority(
  session: BrainSession,
  dependencyGraph: BrainDependencyGraph,
  validationFailures: readonly BrainValidationFailure[] = [],
): BrainAuthorityReport {
  const authorityFailures: BrainAuthorityFailure[] = [];
  const warnings: BrainWarning[] = [];
  const missingArtifacts: BrainResolvedArtifact[] = [];
  const resolvedArtifacts: BrainResolvedArtifact[] = [];

  for (const node of dependencyGraph.nodes) {
    if (node.classification === 'missing') {
      missingArtifacts.push(node);
    } else {
      resolvedArtifacts.push(node);
    }

    const role = getPrimaryRole(node.roles);

    if (role === 'authority') {
      if (node.classification === 'missing') {
        authorityFailures.push(
          buildFailure(
            'MISSING_AUTHORITY_ARTIFACT',
            `Authority artifact ${node.artifactId} is missing.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'stale') {
        authorityFailures.push(
          buildFailure(
            'STALE_AUTHORITY_ARTIFACT',
            `Authority artifact ${node.artifactId} is stale.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'superseded') {
        authorityFailures.push(
          buildFailure(
            'SUPERSEDED_AUTHORITY_ARTIFACT',
            `Authority artifact ${node.artifactId} has been superseded.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'derived') {
        authorityFailures.push(
          buildFailure(
            'DERIVED_AUTHORITY_ARTIFACT',
            `Authority artifact ${node.artifactId} resolves to derived knowledge.`,
            node.artifactId,
          ),
        );
      }
    }

    if (role === 'required') {
      if (node.classification === 'missing') {
        authorityFailures.push(
          buildFailure(
            'MISSING_REQUIRED_ARTIFACT',
            `Required artifact ${node.artifactId} is missing.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'stale') {
        authorityFailures.push(
          buildFailure(
            'STALE_REQUIRED_ARTIFACT',
            `Required artifact ${node.artifactId} is stale.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'derived') {
        warnings.push(
          buildWarning(
            'DERIVED_REQUIRED_ARTIFACT',
            `Required artifact ${node.artifactId} is derived and should be treated as non-authoritative context.`,
            node.artifactId,
          ),
        );
      }
    }

    if (role === 'optional') {
      if (node.classification === 'missing') {
        warnings.push(
          buildWarning(
            'OPTIONAL_ARTIFACT_MISSING',
            `Optional artifact ${node.artifactId} is missing.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'stale') {
        warnings.push(
          buildWarning(
            'OPTIONAL_ARTIFACT_STALE',
            `Optional artifact ${node.artifactId} is stale.`,
            node.artifactId,
          ),
        );
      } else if (node.classification === 'derived') {
        warnings.push(
          buildWarning(
            'OPTIONAL_ARTIFACT_DERIVED',
            `Optional artifact ${node.artifactId} is derived.`,
            node.artifactId,
          ),
        );
      }
    }
  }

  const blocked = authorityFailures.length > 0 || validationFailures.length > 0;

  return deepFreeze({
    allowed: !blocked,
    blocked,
    authorityFailures,
    validationFailures,
    warnings,
    resolvedArtifacts,
    missingArtifacts,
    selectedArtifactIds: collectSortedIds(resolvedArtifacts),
    blockedArtifactIds: collectBlockedIds(authorityFailures, missingArtifacts),
    dependencyGraph,
  });
}
