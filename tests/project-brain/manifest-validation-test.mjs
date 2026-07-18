import assert from 'node:assert/strict';
import {
  validateManifestEntry,
  validateManifestSnapshot,
  aggregateManifestValidations,
  manifestError,
  buildManifestValidationRules,
  buildManifestValidationRuleObjects,
} from '../../src/project-brain/manifest-validation.ts';
import { createManifestIdentity, createManifestEntry } from '../../src/project-brain/manifest-core.ts';
import { createInvestigation, createHypothesis } from '../../src/project-brain/manifest-investigation.ts';

const BASE_IDENTITY = createManifestIdentity({
  manifestArtifactId: 'PB-DM-001',
  manifestRevision: 'rev-001',
  investigationId: 'PB-INV-001',
  repositoryRevision: 'abc123def',
  freshness: 1000,
});

// Investigation with RESOLVED lifecycle to avoid INCOMPLETE warning
const RESOLVED_INVESTIGATION = createInvestigation({
  identity: BASE_IDENTITY,
  lifecycleState: 'RESOLVED',
  problemStatement: 'Test problem',
  createdAt: 100,
  updatedAt: 200,
});

const VALID_ENTRY = createManifestEntry({
  entryType: 'ACTIVE',
  investigation: RESOLVED_INVESTIGATION,
  diagnostics: [],
});

// Investigation with OPEN lifecycle (triggers INCOMPLETE warning)
const OPEN_INVESTIGATION = createInvestigation({
  identity: BASE_IDENTITY,
  lifecycleState: 'OPEN',
  problemStatement: 'Test problem',
  createdAt: 100,
  updatedAt: 100,
});

const OPEN_ENTRY = createManifestEntry({
  entryType: 'ACTIVE',
  investigation: OPEN_INVESTIGATION,
  diagnostics: [],
});

// ============================================================
// 1. validateManifestEntry
// ============================================================

// Valid resolved entry passes with READY
{
  const report = validateManifestEntry(VALID_ENTRY);
  assert.equal(report.overallDecision, 'READY');
  assert.equal(report.fingerprint.length, 8);
  assert.equal(report.errorCount, 0);
  assert.equal(report.warningCount, 0);
}

// OPEN entry produces READY_WITH_WARNINGS (incomplete warning)
{
  const report = validateManifestEntry(OPEN_ENTRY);
  assert.equal(report.overallDecision, 'READY_WITH_WARNINGS');
  assert.equal(report.errorCount, 0);
  assert.equal(report.warningCount, 1);
}

// Null entry produces BLOCKED
{
  const report = validateManifestEntry(null);
  assert.equal(report.overallDecision, 'BLOCKED');
  assert.ok(report.errorCount > 0);
}

// ============================================================
// 2. buildManifestValidationRules
// ============================================================

{
  const rules = buildManifestValidationRules();
  assert.ok(rules.length > 0);
  assert.ok(rules.includes('MANIFEST_MISSING_IDENTITY'));
}

// ============================================================
// 3. aggregateManifestValidations
// ============================================================

// Single valid report
{
  const single = validateManifestEntry(VALID_ENTRY);
  const result = aggregateManifestValidations([single]);
  assert.equal(result.overallDecision, 'READY');
  assert.equal(result.fingerprint.length, 8);
  assert.equal(result.entryCount, 1);
  assert.equal(result.errorCount, 0);
}

// Mixed valid and invalid
{
  const valid = validateManifestEntry(VALID_ENTRY);
  const invalid = validateManifestEntry(null);
  const result = aggregateManifestValidations([valid, invalid]);
  assert.equal(result.overallDecision, 'BLOCKED');
  assert.equal(result.entryCount, 1); // null report contributes 0 entries
  assert.ok(result.errorCount > 0);
}

// Empty array
{
  const result = aggregateManifestValidations([]);
  assert.equal(result.overallDecision, 'BLOCKED');
  assert.equal(result.entryCount, 0);
}

// ============================================================
// 4. validateManifestSnapshot
// ============================================================

{
  const report = validateManifestSnapshot([VALID_ENTRY]);
  assert.equal(report.overallDecision, 'READY');
  assert.equal(report.entryCount, 1);
}

// Empty array
{
  const report = validateManifestSnapshot([]);
  assert.equal(report.overallDecision, 'BLOCKED');
}

// Null/undefined
{
  const report = validateManifestSnapshot(null);
  assert.equal(report.overallDecision, 'BLOCKED');
}

// ============================================================
// 5. manifestError
// ============================================================

{
  const err = manifestError('Identity is required', 'MANIFEST_MISSING_IDENTITY', 'ERROR');
  assert.equal(err.code, 'MANIFEST_MISSING_IDENTITY');
  assert.equal(err.message, 'Identity is required');
  assert.equal(err.severity, 'ERROR');
  assert.ok(err instanceof Error);
}

// ============================================================
// 6. buildManifestValidationRuleObjects
// ============================================================

// Returns correct rule count and structure
{
  const rules = buildManifestValidationRuleObjects();
  assert.ok(rules.length > 0);
  assert.ok(rules[0].ruleId);
  assert.ok(rules[0].code);
  assert.ok(rules[0].severity);
  assert.equal(typeof rules[0].validate, 'function');
  assert.equal(Object.isFrozen(rules), true);
}

// Every rule's validate function is callable
{
  const rules = buildManifestValidationRuleObjects();
  for (const rule of rules) {
    const result = rule.validate(VALID_ENTRY);
    // Should either return null (pass) or a ManifestValidationRuleResult
    if (result !== null) {
      assert.equal(typeof result.ruleId, 'string');
      assert.equal(typeof result.code, 'string');
      assert.equal(typeof result.severity, 'string');
      assert.equal(typeof result.message, 'string');
    }
  }
}

// ============================================================
// 7. H-INV-011: Failed hypotheses preserved
// ============================================================

// Investigation with failedHypotheses referencing existing hypotheses passes
{
  const hyp = createHypothesis({
    hypothesisId: 'PB-HYP-FAILED-001',
    description: 'Failed hypothesis',
    author: 'dev',
    confidence: 0.5,
    validationStatus: 'REJECTED',
    timestamp: 100,
  });

  const investigation = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Test with failed hypotheses',
    hypotheses: [hyp],
    failedHypotheses: ['PB-HYP-FAILED-001'],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation,
    diagnostics: [],
  });

  const report = validateManifestEntry(entry);
  const preserved = report.executedRules.filter((r) => r.code === 'MANIFEST_HYPOTHESES_PRESERVED');
  assert.equal(preserved.length, 0, 'Should not flag when failed hypotheses exist in array');
}

// Investigation with failedHypothesis missing from hypotheses array triggers ERROR
{
  const investigation = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Test missing failed hypothesis',
    hypotheses: [],
    failedHypotheses: ['PB-HYP-MISSING-001'],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation,
    diagnostics: [],
  });

  const report = validateManifestEntry(entry);
  const preserved = report.executedRules.filter((r) => r.code === 'MANIFEST_HYPOTHESES_PRESERVED');
  assert.equal(preserved.length, 1, 'Should flag missing failed hypothesis');
  assert.equal(preserved[0].severity, 'ERROR');
  assert.equal(report.overallDecision, 'BLOCKED');
}

// Investigation with no failedHypotheses skips check
{
  const investigation = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'No failed hypotheses',
    hypotheses: [],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation,
    diagnostics: [],
  });

  const report = validateManifestEntry(entry);
  const preserved = report.executedRules.filter((r) => r.code === 'MANIFEST_HYPOTHESES_PRESERVED');
  assert.equal(preserved.length, 0, 'Should skip when no failedHypotheses');
}

// Duplicate failedHypotheses IDs are deduplicated by normalizeStringArray
{
  const hyp1 = createHypothesis({
    hypothesisId: 'PB-HYP-DUP-001',
    description: 'Duplicate check',
    author: 'dev',
    confidence: 0.5,
    validationStatus: 'REJECTED',
    timestamp: 100,
  });

  const investigation = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Duplicate failed IDs',
    hypotheses: [hyp1],
    failedHypotheses: ['PB-HYP-DUP-001', 'PB-HYP-DUP-001'],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation,
    diagnostics: [],
  });

  // Duplicates are deduped by the factory — only one reference remains
  assert.equal(investigation.failedHypotheses.length, 1);

  const report = validateManifestEntry(entry);
  const preserved = report.executedRules.filter((r) => r.code === 'MANIFEST_HYPOTHESES_PRESERVED');
  assert.equal(preserved.length, 0, 'Deduplicated duplicate should pass');
}

// Canonical ordering of failedHypotheses (sorted by normalizeStringArray)
{
  const hyp1 = createHypothesis({
    hypothesisId: 'PB-HYP-ORD-B',
    description: 'Order B',
    author: 'dev',
    confidence: 0.5,
    validationStatus: 'REJECTED',
    timestamp: 100,
  });
  const hyp2 = createHypothesis({
    hypothesisId: 'PB-HYP-ORD-A',
    description: 'Order A',
    author: 'dev',
    confidence: 0.5,
    validationStatus: 'REJECTED',
    timestamp: 100,
  });

  const investigation = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Canonical order test',
    hypotheses: [hyp1, hyp2],
    failedHypotheses: ['PB-HYP-ORD-B', 'PB-HYP-ORD-A'],
    createdAt: 100,
    updatedAt: 200,
  });

  // Verify canonical ordering (sorted)
  assert.deepEqual(investigation.failedHypotheses, ['PB-HYP-ORD-A', 'PB-HYP-ORD-B']);

  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation,
    diagnostics: [],
  });

  const report = validateManifestEntry(entry);
  const preserved = report.executedRules.filter((r) => r.code === 'MANIFEST_HYPOTHESES_PRESERVED');
  assert.equal(preserved.length, 0, 'Canonical order should pass');
}

// Rule result is immutable (part of frozen report)
{
  const investigation = createInvestigation({
    identity: BASE_IDENTITY,
    lifecycleState: 'RESOLVED',
    problemStatement: 'Missing failed hypotheses',
    hypotheses: [],
    failedHypotheses: ['PB-HYP-GONE-001'],
    createdAt: 100,
    updatedAt: 200,
  });

  const entry = createManifestEntry({
    entryType: 'ACTIVE',
    investigation,
    diagnostics: [],
  });

  const report = validateManifestEntry(entry);
  const rule = report.executedRules.find((r) => r.code === 'MANIFEST_HYPOTHESES_PRESERVED');
  assert.ok(rule, 'Should have a failed hypotheses rule result');
  assert.equal(Object.isFrozen(rule), true);
}

// ============================================================
// 8. Deterministic fingerprint
// ============================================================

{
  const report1 = validateManifestEntry(VALID_ENTRY);
  const report2 = validateManifestEntry(VALID_ENTRY);
  assert.equal(report1.fingerprint, report2.fingerprint);
  assert.equal(report1.overallDecision, report2.overallDecision);
}
