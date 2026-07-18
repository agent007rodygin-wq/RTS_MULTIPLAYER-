import type { BrainArtifactClassification, BrainDependencyGraph } from './brain-dependency.ts';
import type { BrainPlanStepCode } from './brain-planner.ts';
import type { KnowledgeArtifactRevision, KnowledgeFreshnessState, KnowledgeLifecycleState, KnowledgeStorageKind } from './knowledge-artifact.ts';
import type { CanonicalRegistryEntry } from './canonical-registry.ts';

export type ContextPackageRole =
  | 'Primary'
  | 'Required'
  | 'Dependency'
  | 'Supporting'
  | 'Optional'
  | 'Traceability'
  | 'Constraint';

export type ContextPackageDecision = 'INCLUDED' | 'EXCLUDED' | 'MISSING' | 'BLOCKED';

export type ContextPackageIssueCategory =
  | 'EXCLUDED'
  | 'MISSING'
  | 'STALE'
  | 'DERIVED'
  | 'AMBIGUOUS'
  | 'AUTHORITY_BLOCKED'
  | 'INVALID_REFERENCE'
  | 'SUPERSEDED'
  | 'VALIDATION_FAILURE';

export interface ContextPackageRegistryIdentity {
  artifactType: string;
  canonicalRole: string;
  authoritySource: string;
  owner: string;
  sourceRevision: string;
  version?: string;
  status?: string;
}

export interface ContextPackageRevisionIdentity {
  revisionId: string;
  revisionOrder: number;
  sourceRevision: string;
  storageKind: KnowledgeStorageKind;
  lifecycleState: KnowledgeLifecycleState;
  freshnessState: KnowledgeFreshnessState;
  supersedesArtifactIds: readonly string[];
  canonicalSourceArtifactIds: readonly string[];
  notes?: string;
}

export interface ContextPackageItem {
  artifactId: string;
  normalizedArtifactId: string;
  decision: ContextPackageDecision;
  roles: readonly ContextPackageRole[];
  primaryRole: ContextPackageRole;
  authorityClassification: BrainArtifactClassification;
  registryIdentity: ContextPackageRegistryIdentity;
  revision: ContextPackageRevisionIdentity;
  dependencyArtifactIds: readonly string[];
  selectedFromArtifactIds: readonly string[];
  requestedBy: readonly BrainPlanStepCode[];
  provenanceArtifactIds: readonly string[];
  traceabilityReferences: readonly string[];
  inclusionReason: string;
}

export interface ContextPackageIssue {
  artifactId: string;
  category: ContextPackageIssueCategory;
  reasonCode: string;
  message: string;
  roles: readonly ContextPackageRole[];
  primaryRole?: ContextPackageRole;
  registryIdentity?: ContextPackageRegistryIdentity;
  revision?: ContextPackageRevisionIdentity;
  dependencyArtifactIds: readonly string[];
  selectedFromArtifactIds: readonly string[];
  requestedBy: readonly BrainPlanStepCode[];
  provenanceArtifactIds: readonly string[];
  traceabilityReferences: readonly string[];
}

export interface ContextPackageTraceabilityLink {
  artifactId: string;
  sourceRevision: string;
  revisionId: string;
  dependencyPaths: readonly string[];
  planStepCodes: readonly BrainPlanStepCode[];
  requestedBy: readonly BrainPlanStepCode[];
  reason: string;
}

export interface ContextPackageWarning {
  artifactId?: string;
  code: string;
  message: string;
  relatedArtifactId?: string;
}

export interface ContextPackageMetadata {
  schemaVersion: string;
  packageId: string;
  packageFingerprint: string;
  sourceRequestId: string;
  sourceTaskId: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  sourceBrainPlanStatus: string;
  sourceBrainAuthorityStatus: string;
  sourceBrainDependencyNodeCount: number;
  includedCount: number;
  excludedCount: number;
  missingCount: number;
  staleCount: number;
  derivedCount: number;
  ambiguousCount: number;
  authorityBlockedCount: number;
  invalidReferenceCount: number;
  supersededCount: number;
  warningCount: number;
  validationFailureCount: number;
  traceabilityLinkCount: number;
  estimatedSerializedLength: number;
}

export type ContextDiagnosticStage =
  | 'request'
  | 'foundation'
  | 'authority'
  | 'selection'
  | 'revision-resolution'
  | 'dependency-context'
  | 'provenance'
  | 'deduplication'
  | 'ordering'
  | 'exclusion-accounting'
  | 'assembly'
  | 'validation'
  | 'serialization';

export type ContextDiagnosticSeverity = 'INFO' | 'WARN' | 'ERROR';

export interface ContextDiagnosticEvent {
  index: number;
  stage: ContextDiagnosticStage;
  severity: ContextDiagnosticSeverity;
  code: string;
  message: string;
  contextRequestId: string;
  sourceBrainSessionId: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface ContextPackageValidationFailure {
  source: 'request' | 'foundation' | 'package';
  code: string;
  message: string;
  artifactId?: string;
  relatedArtifactId?: string;
}

export interface ContextPackageResult {
  schemaVersion: string;
  status: 'READY' | 'BLOCKED';
  contextRequestId: string;
  sourceBrainSessionId: string;
  sourceBrainResponseStatus: string;
  metadata: ContextPackageMetadata;
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
  serialized: string;
}

const ROLE_PRECEDENCE: readonly ContextPackageRole[] = [
  'Primary',
  'Required',
  'Traceability',
  'Supporting',
  'Dependency',
  'Optional',
  'Constraint',
];

const DIAGNOSTIC_STAGE_ORDER: readonly ContextDiagnosticStage[] = [
  'request',
  'foundation',
  'authority',
  'selection',
  'revision-resolution',
  'dependency-context',
  'provenance',
  'deduplication',
  'ordering',
  'exclusion-accounting',
  'assembly',
  'validation',
  'serialization',
];

export function getContextRolePrecedence(role: ContextPackageRole): number {
  const index = ROLE_PRECEDENCE.indexOf(role);
  return index >= 0 ? index : ROLE_PRECEDENCE.length;
}

export function compareContextPackageRoles(left: ContextPackageRole, right: ContextPackageRole): number {
  const leftIndex = getContextRolePrecedence(left);
  const rightIndex = getContextRolePrecedence(right);
  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }
  return left.localeCompare(right);
}

export function dedupeContextPackageRoles(roles: readonly ContextPackageRole[]): readonly ContextPackageRole[] {
  return Array.from(new Set(roles)).sort(compareContextPackageRoles);
}

export function selectPrimaryContextRole(roles: readonly ContextPackageRole[]): ContextPackageRole {
  const normalized = dedupeContextPackageRoles(roles);
  return normalized[0] ?? 'Supporting';
}

export function compareContextPackageItems(left: ContextPackageItem, right: ContextPackageItem): number {
  const roleComparison = compareContextPackageRoles(left.primaryRole, right.primaryRole);
  if (roleComparison !== 0) return roleComparison;

  if (left.artifactId !== right.artifactId) {
    return left.artifactId.localeCompare(right.artifactId);
  }

  if (left.revision.revisionOrder !== right.revision.revisionOrder) {
    return left.revision.revisionOrder - right.revision.revisionOrder;
  }

  if (left.revision.revisionId !== right.revision.revisionId) {
    return left.revision.revisionId.localeCompare(right.revision.revisionId);
  }

  return left.inclusionReason.localeCompare(right.inclusionReason);
}

export function compareContextPackageIssues(left: ContextPackageIssue, right: ContextPackageIssue): number {
  if (left.category !== right.category) {
    return left.category.localeCompare(right.category);
  }

  if (left.artifactId !== right.artifactId) {
    return left.artifactId.localeCompare(right.artifactId);
  }

  if (left.reasonCode !== right.reasonCode) {
    return left.reasonCode.localeCompare(right.reasonCode);
  }

  return left.message.localeCompare(right.message);
}

export function compareContextDiagnosticEvents(
  left: ContextDiagnosticEvent,
  right: ContextDiagnosticEvent,
): number {
  const leftStage = DIAGNOSTIC_STAGE_ORDER.indexOf(left.stage);
  const rightStage = DIAGNOSTIC_STAGE_ORDER.indexOf(right.stage);
  if (leftStage !== rightStage) {
    return leftStage - rightStage;
  }

  if (left.severity !== right.severity) {
    return left.severity.localeCompare(right.severity);
  }

  if (left.artifactId !== right.artifactId) {
    return (left.artifactId ?? '').localeCompare(right.artifactId ?? '');
  }

  if (left.code !== right.code) {
    return left.code.localeCompare(right.code);
  }

  return left.message.localeCompare(right.message);
}

export function collectContextPackageRelatedIds(
  node: Pick<BrainDependencyGraph['nodes'][number], 'dependencyArtifactIds' | 'selectedFromArtifactIds'>,
): string[] {
  return Array.from(new Set([...node.dependencyArtifactIds, ...node.selectedFromArtifactIds])).sort();
}

export function buildContextPackageRegistryIdentity(entry: CanonicalRegistryEntry): ContextPackageRegistryIdentity {
  return {
    artifactType: entry.artifactType,
    canonicalRole: entry.canonicalRole,
    authoritySource: entry.authoritySource,
    owner: entry.owner,
    sourceRevision: entry.sourceRevision,
    version: entry.version,
    status: entry.status,
  };
}

