import {
  validateCanonicalRegistry,
  type CanonicalRegistry,
} from './canonical-registry.ts';
import {
  createKnowledgeArtifactRevision,
  deepFreeze,
  stableStringify,
  type KnowledgeArtifactRevision,
  type KnowledgeArtifactRevisionInput,
  type KnowledgeLifecycleState,
  type KnowledgeStorageKind,
} from './knowledge-artifact.ts';
import {
  validateKnowledgeLifecycleTransition,
} from './knowledge-lifecycle.ts';
import {
  validateKnowledgeArtifactRevision,
  validateKnowledgeRevisionHistory,
  type KnowledgeValidationIssue,
  type KnowledgeValidationReport,
} from './knowledge-validation.ts';

export interface KnowledgeStore {
  readonly registry: CanonicalRegistry;
  readonly revisions: readonly KnowledgeArtifactRevision[];
}

export interface KnowledgeStoreMutationResult {
  ok: boolean;
  store?: KnowledgeStore;
  revision?: KnowledgeArtifactRevision;
  issues: readonly KnowledgeValidationIssue[];
}

function compareKnowledgeRevisionSeeds(
  left: KnowledgeArtifactRevisionInput,
  right: KnowledgeArtifactRevisionInput,
): number {
  if (left.artifactId !== right.artifactId) {
    return left.artifactId.localeCompare(right.artifactId);
  }

  if (left.revisionId !== right.revisionId) {
    return left.revisionId.localeCompare(right.revisionId);
  }

  if (left.sourceRevision !== right.sourceRevision) {
    return left.sourceRevision.localeCompare(right.sourceRevision);
  }

  if (left.storageKind !== right.storageKind) {
    return left.storageKind.localeCompare(right.storageKind);
  }

  if (left.lifecycleState !== right.lifecycleState) {
    return left.lifecycleState.localeCompare(right.lifecycleState);
  }

  return stableStringify(left.payload ?? {}).localeCompare(stableStringify(right.payload ?? {}));
}

function sortRevisionHistory(
  revisions: readonly KnowledgeArtifactRevision[],
): KnowledgeArtifactRevision[] {
  return [...revisions].sort((left, right) => {
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
  });
}

function buildKnowledgeStore(
  registry: CanonicalRegistry,
  revisions: readonly KnowledgeArtifactRevision[],
): KnowledgeStore {
  return deepFreeze({
    registry,
    revisions: sortRevisionHistory(revisions),
  });
}

function assignRevisionOrders(
  registry: CanonicalRegistry,
  revisions: readonly KnowledgeArtifactRevisionInput[],
): KnowledgeArtifactRevision[] {
  const sortedSeeds = [...revisions].sort(compareKnowledgeRevisionSeeds);
  const grouped = new Map<string, KnowledgeArtifactRevisionInput[]>();

  for (const seed of sortedSeeds) {
    const bucket = grouped.get(seed.artifactId) ?? [];
    bucket.push(seed);
    grouped.set(seed.artifactId, bucket);
  }

  const assigned: KnowledgeArtifactRevision[] = [];

  for (const [artifactId, group] of [...grouped.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    let revisionOrder = 1;
    for (const seed of group) {
      const normalized = createKnowledgeArtifactRevision(
        {
          ...seed,
          artifactId,
          revisionOrder,
        },
        registry,
      );
      assigned.push(normalized);
      revisionOrder += 1;
    }
  }

  return assigned;
}

function nextRevisionOrderForArtifact(
  revisions: readonly KnowledgeArtifactRevision[],
  artifactId: string,
): number {
  return (
    revisions.reduce((max, revision) => {
      if (revision.artifactId !== artifactId) return max;
      return Math.max(max, revision.revisionOrder);
    }, 0) + 1
  );
}

function createStoreFromValidatedRevisions(
  registry: CanonicalRegistry,
  revisions: readonly KnowledgeArtifactRevision[],
): KnowledgeStore {
  const validation = validateKnowledgeRevisionHistory(revisions, registry);
  if (!validation.valid) {
    const message = validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid knowledge store: ${message}`);
  }

  return buildKnowledgeStore(registry, revisions);
}

export function createKnowledgeStore(
  registry: CanonicalRegistry,
  revisions: readonly KnowledgeArtifactRevisionInput[] = [],
): KnowledgeStore {
  const registryValidation = validateCanonicalRegistry(registry);
  if (!registryValidation.valid) {
    const message = registryValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid canonical registry supplied to knowledge store: ${message}`);
  }

  const hasExplicitRevisionOrders = revisions.every(
    (revision) => Number.isInteger(revision.revisionOrder) && (revision.revisionOrder ?? -1) >= 0,
  );

  const normalized = hasExplicitRevisionOrders
    ? revisions.map((revision) =>
        createKnowledgeArtifactRevision(
          {
            ...revision,
            revisionOrder: revision.revisionOrder,
          },
          registry,
        ),
      )
    : assignRevisionOrders(registry, revisions);
  return createStoreFromValidatedRevisions(registry, normalized);
}

export function loadKnowledgeStore(serialized: string | KnowledgeStore): KnowledgeStore {
  if (typeof serialized === 'string') {
    const parsed = JSON.parse(serialized) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Serialized knowledge store must be a JSON object.');
    }

    const registry = (parsed as { registry?: CanonicalRegistry }).registry;
    const revisions = (parsed as { revisions?: readonly KnowledgeArtifactRevision[] }).revisions ?? [];
    if (!registry) {
      throw new Error('Serialized knowledge store must include a registry.');
    }

    return createStoreFromValidatedRevisions(registry, revisions);
  }

  return createStoreFromValidatedRevisions(serialized.registry, serialized.revisions);
}

export function serializeKnowledgeStore(store: KnowledgeStore): string {
  return `${JSON.stringify(
    {
      registry: store.registry,
      revisions: sortRevisionHistory(store.revisions),
    },
    null,
    2,
  )}\n`;
}

export function validateKnowledgeStore(store: KnowledgeStore): KnowledgeValidationReport {
  const registryValidation = validateCanonicalRegistry(store.registry);
  if (!registryValidation.valid) {
    return {
      valid: false,
      issueCount: registryValidation.issueCount,
      issues: registryValidation.issues.map((issue) => ({
        code: 'INVALID_REGISTRY_SHAPE',
        message: issue.message,
      })),
    };
  }

  const validation = validateKnowledgeRevisionHistory(store.revisions, store.registry);
  return validation;
}

export function getKnowledgeRevisionHistory(
  store: KnowledgeStore,
  artifactId: string,
): readonly KnowledgeArtifactRevision[] {
  return sortRevisionHistory(
    store.revisions.filter((revision) => revision.artifactId === artifactId),
  );
}

export function getLatestKnowledgeRevision(
  store: KnowledgeStore,
  artifactId: string,
): KnowledgeArtifactRevision | undefined {
  const history = getKnowledgeRevisionHistory(store, artifactId);
  return history[history.length - 1];
}

export function getCanonicalKnowledgeRevisions(
  store: KnowledgeStore,
): readonly KnowledgeArtifactRevision[] {
  return store.revisions.filter((revision) => revision.storageKind === 'canonical');
}

export function getDerivedKnowledgeRevisions(
  store: KnowledgeStore,
): readonly KnowledgeArtifactRevision[] {
  return store.revisions.filter((revision) => revision.storageKind === 'derived');
}

function buildMutationFailure(
  store: KnowledgeStore,
  issues: readonly KnowledgeValidationIssue[],
): KnowledgeStoreMutationResult {
  return {
    ok: false,
    store,
    issues,
  };
}

function normalizeStoreAfterAppend(
  store: KnowledgeStore,
  nextRevision: KnowledgeArtifactRevision,
): KnowledgeStore {
  return buildKnowledgeStore(store.registry, [...store.revisions, nextRevision]);
}

export function appendKnowledgeRevision(
  store: KnowledgeStore,
  input: KnowledgeArtifactRevisionInput,
): KnowledgeStoreMutationResult {
  const nextRevisionOrder = nextRevisionOrderForArtifact(store.revisions, input.artifactId);
  const candidate = createKnowledgeArtifactRevision(
    {
      ...input,
      revisionOrder: nextRevisionOrder,
    },
    store.registry,
  );

  const validation = validateKnowledgeArtifactRevision(candidate, store.registry);
  if (!validation.valid) {
    return buildMutationFailure(store, validation.issues);
  }

  const nextStore = normalizeStoreAfterAppend(store, candidate);
  const storeValidation = validateKnowledgeRevisionHistory(nextStore.revisions, nextStore.registry);
  if (!storeValidation.valid) {
    return buildMutationFailure(store, storeValidation.issues);
  }

  return {
    ok: true,
    store: nextStore,
    revision: candidate,
    issues: [],
  };
}

export function transitionKnowledgeRevision(
  store: KnowledgeStore,
  artifactId: string,
  nextState: KnowledgeLifecycleState,
  overrides: Partial<KnowledgeArtifactRevisionInput> = {},
): KnowledgeStoreMutationResult {
  const current = getLatestKnowledgeRevision(store, artifactId);
  if (!current) {
    return buildMutationFailure(store, [
      {
        code: 'INVALID_LIFECYCLE_TRANSITION',
        message: `Artifact ${artifactId} does not exist in the knowledge store.`,
        artifactId,
      },
    ]);
  }

  const transition = validateKnowledgeLifecycleTransition(
    current.storageKind,
    current.lifecycleState,
    nextState,
  );
  if (!transition.valid) {
    return buildMutationFailure(store, [
      {
        code: 'INVALID_LIFECYCLE_TRANSITION',
        message: transition.reason ?? `Illegal lifecycle transition from ${current.lifecycleState} to ${nextState}.`,
        artifactId,
        revisionId: current.revisionId,
      },
    ]);
  }

  const nextRevisionOrder = nextRevisionOrderForArtifact(store.revisions, artifactId);
  const candidate = createKnowledgeArtifactRevision(
    {
      artifactId: current.artifactId,
      artifactType: overrides.artifactType ?? current.artifactType,
      canonicalRole: overrides.canonicalRole ?? current.canonicalRole,
      authoritySource: overrides.authoritySource ?? current.authoritySource,
      owner: overrides.owner ?? current.owner,
      sourceRevision: overrides.sourceRevision ?? current.sourceRevision,
      freshnessState: overrides.freshnessState ?? current.freshnessState,
      storageKind: overrides.storageKind ?? current.storageKind,
      lifecycleState: nextState,
      revisionOrder: nextRevisionOrder,
      revisionId:
        overrides.revisionId ??
        `${artifactId}-${nextState}-${String(nextRevisionOrder).padStart(3, '0')}`,
      payload: overrides.payload ?? { ...current.payload },
      canonicalSourceReferences:
        overrides.canonicalSourceReferences ?? current.canonicalSourceReferences,
      supersedesArtifactIds:
        overrides.supersedesArtifactIds ?? current.supersedesArtifactIds,
      validationMechanism: overrides.validationMechanism ?? current.provenance.validationMechanism,
      evidenceLinks: overrides.evidenceLinks ?? current.provenance.evidenceLinks,
      notes: overrides.notes ?? current.notes,
    },
    store.registry,
  );

  const validation = validateKnowledgeArtifactRevision(candidate, store.registry);
  if (!validation.valid) {
    return buildMutationFailure(store, validation.issues);
  }

  const nextStore = normalizeStoreAfterAppend(store, candidate);
  const storeValidation = validateKnowledgeRevisionHistory(nextStore.revisions, nextStore.registry);
  if (!storeValidation.valid) {
    return buildMutationFailure(store, storeValidation.issues);
  }

  return {
    ok: true,
    store: nextStore,
    revision: candidate,
    issues: [],
  };
}

export function supersedeKnowledgeRevision(
  store: KnowledgeStore,
  input: KnowledgeArtifactRevisionInput & { supersedesArtifactIds: readonly string[] },
): KnowledgeStoreMutationResult {
  if (!input.supersedesArtifactIds || input.supersedesArtifactIds.length === 0) {
    return buildMutationFailure(store, [
      {
        code: 'BROKEN_SUPERSEDES_REFERENCE',
        message: 'Supersession requires at least one superseded Artifact ID.',
        revisionId: input.revisionId,
      } as KnowledgeValidationIssue,
    ]);
  }

  const candidateResult = appendKnowledgeRevision(store, input);
  if (!candidateResult.ok || !candidateResult.store || !candidateResult.revision) {
    return candidateResult;
  }

  let nextStore = candidateResult.store;

  for (const supersededArtifactId of input.supersedesArtifactIds) {
    const latest = getLatestKnowledgeRevision(nextStore, supersededArtifactId);
    if (!latest) {
      return buildMutationFailure(nextStore, [
        {
          code: 'BROKEN_SUPERSEDES_REFERENCE',
          message: `Supersession target ${supersededArtifactId} does not exist in the store.`,
          artifactId: input.artifactId,
          revisionId: input.revisionId,
          relatedArtifactId: supersededArtifactId,
        },
      ] as KnowledgeValidationIssue[]);
    }

    const supersededResult = transitionKnowledgeRevision(nextStore, supersededArtifactId, 'SUPERSEDED', {
      sourceRevision: latest.sourceRevision,
      revisionId: `${supersededArtifactId}-SUPERSEDED-${String(nextRevisionOrderForArtifact(nextStore.revisions, supersededArtifactId)).padStart(3, '0')}`,
      freshnessState: 'STALE',
      notes: `Superseded by ${input.artifactId}`,
    });

    if (!supersededResult.ok || !supersededResult.store) {
      return supersededResult;
    }

    nextStore = supersededResult.store;
  }

  return {
    ok: true,
    store: nextStore,
    revision: candidateResult.revision,
    issues: [],
  };
}
