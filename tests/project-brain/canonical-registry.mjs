import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  createArtifactId,
  createArtifactReference,
  normalizeArtifactId,
} from '../../src/project-brain/artifact-identity.ts';
import {
  createCanonicalRegistry,
  getCanonicalRegistryEntries,
  hasCanonicalRegistryArtifact,
  loadCanonicalRegistry,
  loadCanonicalRegistryFromFile,
  lookupCanonicalArtifact,
  registerCanonicalArtifact,
  resolveArtifactReference,
  saveCanonicalRegistryToFile,
  serializeCanonicalRegistry,
  validateCanonicalRegistry,
} from '../../src/project-brain/canonical-registry.ts';

const baseEntries = [
  {
    artifactId: 'PB-TRACEABILITY-002',
    artifactType: 'derived-surface',
    canonicalRole: 'derived-surface',
    authoritySource: 'traceability-report',
    owner: 'verification',
    sourceRevision: 'rev-002',
    freshnessState: 'CURRENT',
    validationMechanism: 'unit-test',
    notes: 'Read-only registry projection',
  },
  {
    artifactId: 'PB-CONSTITUTION-001',
    artifactType: 'constitution',
    canonicalRole: 'governing-rule',
    authoritySource: 'constitution',
    owner: 'governance',
    sourceRevision: 'rev-001',
    freshnessState: 'CURRENT',
    version: '1.0.0',
    status: 'CURRENT',
  },
  {
    artifactId: 'PB-ARCHITECTURE-001',
    artifactType: 'architecture-bundle',
    canonicalRole: 'approved-fact-set',
    authoritySource: 'frozen-architecture',
    owner: 'architecture',
    sourceRevision: 'rev-003',
    freshnessState: 'CURRENT',
    derivedArtifacts: ['PB-TRACEABILITY-002'],
  },
];

const registry = createCanonicalRegistry(baseEntries);

assert.deepEqual(
  getCanonicalRegistryEntries(registry).map((entry) => entry.artifactId),
  ['PB-ARCHITECTURE-001', 'PB-CONSTITUTION-001', 'PB-TRACEABILITY-002'],
);

assert.equal(createArtifactId({ namespaceToken: 'identity registry', numericSuffix: 1 }), 'PB-IDENTITY-REGISTRY-001');
assert.equal(normalizeArtifactId('pb identity registry 1'), 'PB-IDENTITY-REGISTRY-001');
assert.equal(hasCanonicalRegistryArtifact(registry, 'pb architecture 001'), true);
assert.equal(lookupCanonicalArtifact(registry, 'PB-CONSTITUTION-001')?.owner, 'governance');

const artifactReference = createArtifactReference({
  targetArtifactId: 'pb constitution 001',
  sourceArtifactId: 'pb traceability 002',
  targetType: 'constitution',
  expectedVersion: '1.0.0',
  expectedStatus: 'CURRENT',
  relationshipType: 'canonical',
  optionalPathHint: './specs/_baseline/17-traceability-index.md',
});

const resolvedReference = resolveArtifactReference(registry, artifactReference);
assert.equal(resolvedReference.resolutionStatus, 'RESOLVED_WITH_REDIRECT');
assert.equal(resolvedReference.artifact?.artifactId, 'PB-CONSTITUTION-001');

const staleRegistry = createCanonicalRegistry([
  {
    artifactId: 'PB-STALE-001',
    artifactType: 'derived-surface',
    canonicalRole: 'derived-surface',
    authoritySource: 'traceability-report',
    owner: 'verification',
    sourceRevision: 'rev-004',
    freshnessState: 'STALE',
  },
]);

const staleResolution = resolveArtifactReference(
  staleRegistry,
  createArtifactReference({
    targetArtifactId: 'PB-STALE-001',
    sourceArtifactId: 'PB-CONSTITUTION-001',
  }),
);
assert.equal(staleResolution.resolutionStatus, 'STALE');

const missingResolution = resolveArtifactReference(
  registry,
  createArtifactReference({
    targetArtifactId: 'PB-MISSING-001',
    sourceArtifactId: 'PB-CONSTITUTION-001',
  }),
);
assert.equal(missingResolution.resolutionStatus, 'MISSING');

const typeMismatch = resolveArtifactReference(
  registry,
  createArtifactReference({
    targetArtifactId: 'PB-CONSTITUTION-001',
    sourceArtifactId: 'PB-ARCHITECTURE-001',
    targetType: 'architecture-bundle',
  }),
);
assert.equal(typeMismatch.resolutionStatus, 'TYPE_MISMATCH');

const versionMismatch = resolveArtifactReference(
  registry,
  createArtifactReference({
    targetArtifactId: 'PB-CONSTITUTION-001',
    sourceArtifactId: 'PB-ARCHITECTURE-001',
    expectedVersion: '2.0.0',
  }),
);
assert.equal(versionMismatch.resolutionStatus, 'VERSION_MISMATCH');

const nonCanonicalTarget = resolveArtifactReference(
  registry,
  createArtifactReference({
    targetArtifactId: 'PB-CONSTITUTION-001',
    sourceArtifactId: 'PB-ARCHITECTURE-001',
    expectedStatus: 'STALE',
  }),
);
assert.equal(nonCanonicalTarget.resolutionStatus, 'NON_CANONICAL_TARGET');

const serialized = serializeCanonicalRegistry(registry);
const reloaded = loadCanonicalRegistry(serialized);
assert.equal(serializeCanonicalRegistry(reloaded), serialized);

const duplicateValidation = validateCanonicalRegistry({
  entries: [
    baseEntries[0],
    {
      ...baseEntries[0],
      sourceRevision: 'rev-dup',
    },
  ],
});
assert.equal(duplicateValidation.valid, false);
assert.equal(
  duplicateValidation.issues.some((issue) => issue.code === 'DUPLICATE_ARTIFACT_ID'),
  true,
);

const brokenReferenceValidation = validateCanonicalRegistry({
  entries: [
    {
      artifactId: 'PB-BROKEN-001',
      artifactType: 'derived-surface',
      canonicalRole: 'derived-surface',
      authoritySource: 'traceability-report',
      owner: 'verification',
      sourceRevision: 'rev-005',
      freshnessState: 'CURRENT',
      supersedes: ['PB-MISSING-999'],
    },
  ],
});
assert.equal(brokenReferenceValidation.valid, false);
assert.equal(
  brokenReferenceValidation.issues.some((issue) => issue.code === 'BROKEN_SUPERSEDES_REFERENCE'),
  true,
);

const invalidRegistry = {
  entries: [
    {
      artifactId: 'PB-CYCLE-001',
      artifactType: 'derived-surface',
      canonicalRole: 'derived-surface',
      authoritySource: 'traceability-report',
      owner: 'verification',
      sourceRevision: 'rev-006',
      freshnessState: 'CURRENT',
      supersedes: ['PB-CYCLE-002'],
    },
    {
      artifactId: 'PB-CYCLE-002',
      artifactType: 'derived-surface',
      canonicalRole: 'derived-surface',
      authoritySource: 'traceability-report',
      owner: 'verification',
      sourceRevision: 'rev-007',
      freshnessState: 'CURRENT',
      supersedes: ['PB-CYCLE-001'],
    },
  ],
};

const cycleValidation = validateCanonicalRegistry(invalidRegistry);
assert.equal(cycleValidation.valid, false);
assert.equal(
  cycleValidation.issues.some((issue) => issue.code === 'SUPERSESSION_CYCLE'),
  true,
);

const tempDir = await mkdtemp(join(tmpdir(), 'project-brain-registry-'));
const tempFile = join(tempDir, 'registry.json');
await saveCanonicalRegistryToFile(tempFile, registry);
const fileContents = await readFile(tempFile, 'utf8');
const loadedFromFile = await loadCanonicalRegistryFromFile(tempFile);
assert.equal(fileContents, serialized);
assert.equal(serializeCanonicalRegistry(loadedFromFile), serialized);

const registered = registerCanonicalArtifact(
  registry,
  {
    artifactId: 'pb-registry-003',
    artifactType: 'registry-seed',
    canonicalRole: 'registry-seed',
    authoritySource: 'traceability-index',
    owner: 'governance',
    sourceRevision: 'rev-008',
    freshnessState: 'CURRENT',
  },
);

assert.equal(lookupCanonicalArtifact(registered, 'PB-REGISTRY-003')?.artifactType, 'registry-seed');

await rm(tempDir, { recursive: true, force: true });

console.log('Package A canonical registry tests passed.');
