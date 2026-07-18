import type {
  KnowledgeLifecycleState,
  KnowledgeStorageKind,
} from './knowledge-artifact.ts';

const CANONICAL_ALLOWED_STATES: readonly KnowledgeLifecycleState[] = [
  'PROPOSED',
  'DRAFT',
  'VALIDATED',
  'CANONICAL',
  'STALE',
  'SUPERSEDED',
  'REJECTED',
];

const DERIVED_ALLOWED_STATES: readonly KnowledgeLifecycleState[] = [
  'DERIVED',
  'STALE',
  'SUPERSEDED',
];

const CANONICAL_TRANSITIONS: Record<KnowledgeLifecycleState, readonly KnowledgeLifecycleState[]> = {
  PROPOSED: ['DRAFT'],
  DRAFT: ['VALIDATED', 'REJECTED'],
  VALIDATED: ['CANONICAL', 'REJECTED', 'SUPERSEDED'],
  CANONICAL: ['STALE', 'SUPERSEDED'],
  STALE: ['VALIDATED', 'SUPERSEDED', 'REJECTED'],
  SUPERSEDED: [],
  REJECTED: ['PROPOSED', 'DRAFT'],
  DERIVED: [],
};

const DERIVED_TRANSITIONS: Record<KnowledgeLifecycleState, readonly KnowledgeLifecycleState[]> = {
  PROPOSED: [],
  DRAFT: [],
  VALIDATED: [],
  CANONICAL: [],
  STALE: ['DERIVED', 'SUPERSEDED'],
  SUPERSEDED: [],
  REJECTED: [],
  DERIVED: ['DERIVED', 'STALE', 'SUPERSEDED'],
};

export interface KnowledgeLifecycleTransitionReport {
  valid: boolean;
  storageKind: KnowledgeStorageKind;
  from: KnowledgeLifecycleState;
  to: KnowledgeLifecycleState;
  allowedTargets: readonly KnowledgeLifecycleState[];
  reason?: string;
}

export function getAllowedKnowledgeLifecycleStates(
  storageKind: KnowledgeStorageKind,
): readonly KnowledgeLifecycleState[] {
  return storageKind === 'canonical' ? CANONICAL_ALLOWED_STATES : DERIVED_ALLOWED_STATES;
}

export function getAllowedKnowledgeLifecycleTransitions(
  storageKind: KnowledgeStorageKind,
  from: KnowledgeLifecycleState,
): readonly KnowledgeLifecycleState[] {
  const transitions = storageKind === 'canonical' ? CANONICAL_TRANSITIONS : DERIVED_TRANSITIONS;
  return transitions[from] ?? [];
}

export function validateKnowledgeLifecycleTransition(
  storageKind: KnowledgeStorageKind,
  from: KnowledgeLifecycleState,
  to: KnowledgeLifecycleState,
): KnowledgeLifecycleTransitionReport {
  const allowedStates = getAllowedKnowledgeLifecycleStates(storageKind);
  if (!allowedStates.includes(from)) {
    return {
      valid: false,
      storageKind,
      from,
      to,
      allowedTargets: getAllowedKnowledgeLifecycleTransitions(storageKind, from),
      reason: `Lifecycle state ${from} is not allowed for ${storageKind} storage.`,
    };
  }

  if (!allowedStates.includes(to)) {
    return {
      valid: false,
      storageKind,
      from,
      to,
      allowedTargets: getAllowedKnowledgeLifecycleTransitions(storageKind, from),
      reason: `Lifecycle state ${to} is not allowed for ${storageKind} storage.`,
    };
  }

  const allowedTargets = getAllowedKnowledgeLifecycleTransitions(storageKind, from);
  if (!allowedTargets.includes(to)) {
    return {
      valid: false,
      storageKind,
      from,
      to,
      allowedTargets,
      reason: `Illegal lifecycle transition from ${from} to ${to} for ${storageKind} storage.`,
    };
  }

  return {
    valid: true,
    storageKind,
    from,
    to,
    allowedTargets,
  };
}

export function isCanonicalLifecycleState(state: KnowledgeLifecycleState): boolean {
  return CANONICAL_ALLOWED_STATES.includes(state);
}

export function isDerivedLifecycleState(state: KnowledgeLifecycleState): boolean {
  return DERIVED_ALLOWED_STATES.includes(state);
}
