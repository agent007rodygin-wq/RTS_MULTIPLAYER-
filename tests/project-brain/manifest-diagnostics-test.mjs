import assert from 'node:assert/strict';
import {
  appendManifestDiagnosticEvent,
  buildManifestDiagnostics,
} from '../../src/project-brain/manifest-diagnostics.ts';

// ============================================================
// 1. appendManifestDiagnosticEvent — valid stage/severity
// ============================================================

{
  const events = [];
  appendManifestDiagnosticEvent(events, {
    stage: 'identity',
    severity: 'INFO',
    code: 'MANIFEST_IDENTITY_ASSIGNED',
    message: 'Identity assigned',
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].stage, 'identity');
  assert.equal(events[0].severity, 'INFO');
}

// Fail-closed: invalid stage rejected by appendManifestDiagnosticEvent
{
  const events = [];
  assert.throws(() => {
    appendManifestDiagnosticEvent(events, {
      stage: 'INVALID_STAGE',
      severity: 'INFO',
      code: 'TEST',
      message: 'test',
      manifestArtifactId: 'PB-DM-001',
      manifestRevision: 'rev-001',
    });
  });
}

// Fail-closed: invalid severity rejected by appendManifestDiagnosticEvent
{
  const events = [];
  assert.throws(() => {
    appendManifestDiagnosticEvent(events, {
      stage: 'identity',
      severity: 'FATAL',
      code: 'TEST',
      message: 'test',
      manifestArtifactId: 'PB-DM-001',
      manifestRevision: 'rev-001',
    });
  });
}

// ============================================================
// 2. appendManifestDiagnosticEvent (mutates in-place)
// ============================================================

{
  const events = [];
  appendManifestDiagnosticEvent(events, {
    stage: 'identity',
    severity: 'INFO',
    code: 'MANIFEST_IDENTITY_ASSIGNED',
    message: 'Identity assigned',
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].index, 1);
  assert.equal(events[0].stage, 'identity');
  assert.equal(events[0].code, 'MANIFEST_IDENTITY_ASSIGNED');
}

// Sequential events get incrementing indices
{
  const events = [];
  appendManifestDiagnosticEvent(events, {
    stage: 'identity',
    severity: 'INFO',
    code: 'MANIFEST_IDENTITY_ASSIGNED',
    message: 'First',
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
  });
  appendManifestDiagnosticEvent(events, {
    stage: 'validation',
    severity: 'WARN',
    code: 'MANIFEST_VALIDATION_WARNINGS',
    message: 'Second',
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
  });
  assert.equal(events.length, 2);
  assert.equal(events[0].index, 1);
  assert.equal(events[1].index, 2);
}

// Fail-closed: invalid stage
{
  const events = [];
  assert.throws(() => {
    appendManifestDiagnosticEvent(events, {
      stage: 'INVALID_STAGE',
      severity: 'INFO',
      code: 'TEST',
      message: 'test',
      manifestArtifactId: 'PB-DM-001',
      manifestRevision: 'rev-001',
    });
  });
}

// Fail-closed: empty message
{
  const events = [];
  assert.throws(() => {
    appendManifestDiagnosticEvent(events, {
      stage: 'identity',
      severity: 'INFO',
      code: 'TEST',
      message: '',
      manifestArtifactId: 'PB-DM-001',
      manifestRevision: 'rev-001',
    });
  });
}

// ============================================================
// 4. buildManifestDiagnostics
// ============================================================

// All clear (validation passed, no warnings)
{
  const diagnostics = buildManifestDiagnostics({
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
    entryCount: 3,
    validationBlocked: false,
    validationWarnings: 0,
    unresolvedEntries: 0,
    brokenReferences: 0,
    duplicateIdentities: 0,
    stage: 'publication',
  });
  assert.equal(diagnostics.length, 4); // identity, evidence, validation, publication
  assert.equal(diagnostics[0].stage, 'identity');
  assert.equal(diagnostics[0].code, 'MANIFEST_IDENTITY_ASSIGNED');
  assert.equal(diagnostics[1].stage, 'evidence');
  assert.equal(diagnostics[1].code, 'MANIFEST_EVIDENCE_RESOLVED');
  assert.equal(diagnostics[2].code, 'MANIFEST_VALIDATION_PASSED');
  assert.equal(diagnostics[3].code, 'MANIFEST_PUBLISHED');
  assert.equal(Object.isFrozen(diagnostics), true);
}

// Validation blocked
{
  const diagnostics = buildManifestDiagnostics({
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
    entryCount: 1,
    validationBlocked: true,
    validationWarnings: 0,
    unresolvedEntries: 0,
    brokenReferences: 1,
    duplicateIdentities: 1,
    stage: 'validation',
  });
  assert.ok(diagnostics.length > 4); // extra events for broken refs and duplicates
  const blocked = diagnostics.filter((d) => d.code === 'MANIFEST_VALIDATION_BLOCKED');
  assert.ok(blocked.length > 0);
  const broken = diagnostics.filter((d) => d.code === 'MANIFEST_EVIDENCE_BROKEN');
  assert.equal(broken.length, 1);
  const published = diagnostics.filter((d) => d.code === 'MANIFEST_BLOCKED');
  assert.equal(published.length, 1);
}

// With warnings and unresolved
{
  const diagnostics = buildManifestDiagnostics({
    manifestArtifactId: 'PB-DM-001',
    manifestRevision: 'rev-001',
    entryCount: 2,
    validationBlocked: false,
    validationWarnings: 2,
    unresolvedEntries: 1,
    brokenReferences: 0,
    duplicateIdentities: 0,
    stage: 'publication',
  });
  const warnings = diagnostics.filter((d) => d.code === 'MANIFEST_VALIDATION_WARNINGS');
  assert.equal(warnings.length, 1);
  const unresolved = diagnostics.filter((d) => d.code === 'MANIFEST_UNRESOLVED_ENTRIES');
  assert.equal(unresolved.length, 1);
}

// Empty diagnostics
{
  assert.throws(() => {
    buildManifestDiagnostics({
      manifestArtifactId: '',
      manifestRevision: 'rev-001',
      entryCount: 0,
      validationBlocked: false,
      validationWarnings: 0,
      unresolvedEntries: 0,
      brokenReferences: 0,
      duplicateIdentities: 0,
      stage: 'publication',
    });
  });
}
