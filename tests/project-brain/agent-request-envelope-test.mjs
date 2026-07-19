import {
  createAgentRequestEnvelope,
} from '../../src/project-brain/agent-request-envelope.ts';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
  } else {
    console.error(`FAIL [agent-request-envelope]: ${name}`);
    failed++;
  }
}

function assertThrows(fn, name) {
  try {
    fn();
    console.error(`FAIL [agent-request-envelope]: ${name} — expected throw`);
    failed++;
  } catch {
    passed++;
  }
}

const VALID_INPUT = {
  envelopeId: 'ENVELOPE::req-001::1712345678',
  requestId: 'req-001',
  taskId: 'task-001',
  sessionId: 'BRAIN-SESSION::req-001::task-001::ANALYSIS',
  contextRequestId: 'ctx-req-001',
  objective: 'Analyze the building production system for bottlenecks',
  outputClass: 'analysis',
  constraints: ['use typescript', 'focus on production buildings'],
  sourceRevision: 'abc123def456',
  createdAt: 1712345678000,
};

// ============================================================
// Successful Construction
// ============================================================
const envelope = createAgentRequestEnvelope(VALID_INPUT);
assert(envelope.envelopeId === 'ENVELOPE::req-001::1712345678', 'envelopeId');
assert(envelope.requestId === 'req-001', 'requestId');
assert(envelope.taskId === 'task-001', 'taskId');
assert(envelope.sessionId === 'BRAIN-SESSION::req-001::task-001::ANALYSIS', 'sessionId');
assert(envelope.contextRequestId === 'ctx-req-001', 'contextRequestId');
assert(envelope.objective === 'Analyze the building production system for bottlenecks', 'objective');
assert(envelope.outputClass === 'analysis', 'outputClass');
assert(envelope.constraints.length === 2, 'constraints count');
assert(envelope.constraints[0] === 'focus on production buildings', 'constraints sorted');
assert(envelope.constraints[1] === 'use typescript', 'constraints sorted second');
assert(envelope.sourceRevision === 'abc123def456', 'sourceRevision');
assert(envelope.createdAt === 1712345678000, 'createdAt');
assert(envelope.investigationRef === undefined, 'no investigationRef by default');
assert(envelope.metadata.length === 0, 'empty metadata by default');
assert(Object.isFrozen(envelope), 'envelope is frozen');
assert(Object.isFrozen(envelope.constraints), 'envelope constraints frozen');
assert(Object.isFrozen(envelope.metadata), 'envelope metadata frozen');

// With investigationRef
const envelopeWithInvestigation = createAgentRequestEnvelope({
  ...VALID_INPUT,
  investigationRef: 'PB-INV-001',
});
assert(envelopeWithInvestigation.investigationRef === 'PB-INV-001', 'investigationRef set');

// With metadata
const envelopeWithMeta = createAgentRequestEnvelope({
  ...VALID_INPUT,
  metadata: [
    { key: 'source-component', value: 'brain-engine' },
    { key: 'priority', value: 'high' },
  ],
});
assert(envelopeWithMeta.metadata.length === 2, 'metadata count');
assert(envelopeWithMeta.metadata[0].key === 'priority', 'metadata sorted by key');
assert(envelopeWithMeta.metadata[1].key === 'source-component', 'metadata sorted by key second');
assert(Object.isFrozen(envelopeWithMeta.metadata[0]), 'metadata entry frozen');

// Empty constraints
const envelopeEmptyConstraints = createAgentRequestEnvelope({
  ...VALID_INPUT,
  constraints: [],
});
assert(envelopeEmptyConstraints.constraints.length === 0, 'empty constraints');

// Empty metadata
const envelopeEmptyMeta = createAgentRequestEnvelope({
  ...VALID_INPUT,
  metadata: [],
});
assert(envelopeEmptyMeta.metadata.length === 0, 'explicit empty metadata');

// Constraints deduped and sorted
const envelopeDeduped = createAgentRequestEnvelope({
  ...VALID_INPUT,
  constraints: ['b', 'a', 'b', 'c'],
});
assert(envelopeDeduped.constraints.length === 3, 'deduped constraints count');
assert(envelopeDeduped.constraints[0] === 'a', 'deduped constraints sorted a');
assert(envelopeDeduped.constraints[1] === 'b', 'deduped constraints sorted b');
assert(envelopeDeduped.constraints[2] === 'c', 'deduped constraints sorted c');

// ============================================================
// Malformed Input
// ============================================================
assertThrows(
  () => createAgentRequestEnvelope(null),
  'rejects null input',
);
assertThrows(
  () => createAgentRequestEnvelope('not-an-object'),
  'rejects string input',
);
assertThrows(
  () => createAgentRequestEnvelope([]),
  'rejects array input',
);

// ============================================================
// Envelope ID Validation
// ============================================================
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, envelopeId: '' }),
  'rejects empty envelopeId',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, envelopeId: 'INVALID' }),
  'rejects envelopeId missing ENVELOPE:: prefix',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, envelopeId: 123 }),
  'rejects non-string envelopeId',
);

// ============================================================
// Required Field Validation
// ============================================================
const requiredFields = ['requestId', 'taskId', 'sessionId', 'contextRequestId', 'objective', 'sourceRevision'];
for (const field of requiredFields) {
  assertThrows(
    () => createAgentRequestEnvelope({ ...VALID_INPUT, [field]: '' }),
    `rejects empty ${field}`,
  );
  assertThrows(
    () => createAgentRequestEnvelope({ ...VALID_INPUT, [field]: 123 }),
    `rejects non-string ${field}`,
  );
}

// ============================================================
// Output Class Validation
// ============================================================
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, outputClass: 'INVALID' }),
  'rejects invalid outputClass',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, outputClass: '' }),
  'rejects empty outputClass',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, outputClass: 123 }),
  'rejects non-string outputClass',
);

// Valid output classes
const validClasses = ['analysis', 'proposal', 'plan', 'trace'];
for (const cls of validClasses) {
  const e = createAgentRequestEnvelope({ ...VALID_INPUT, outputClass: cls });
  assert(e.outputClass === cls, `valid outputClass: ${cls}`);
}

// ============================================================
// Constraints Validation
// ============================================================
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, constraints: 'not-array' }),
  'rejects non-array constraints',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, constraints: [123] }),
  'rejects non-string constraint element',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, constraints: ['valid', ''] }),
  'rejects empty string constraint element',
);

// ============================================================
// createdAt Validation
// ============================================================
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, createdAt: -1 }),
  'rejects negative createdAt',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, createdAt: 0 }),
  'rejects zero createdAt',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, createdAt: 'string' }),
  'rejects non-number createdAt',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, createdAt: NaN }),
  'rejects NaN createdAt',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, createdAt: Infinity }),
  'rejects Infinity createdAt',
);

// ============================================================
// investigationRef Validation
// ============================================================
const envelopeEmptyInvestigationRef = createAgentRequestEnvelope({
  ...VALID_INPUT,
  investigationRef: '',
});
assert(envelopeEmptyInvestigationRef.investigationRef === undefined, 'empty investigationRef treated as undefined');

const envelopeNullInvestigationRef = createAgentRequestEnvelope({
  ...VALID_INPUT,
  investigationRef: null,
});
assert(envelopeNullInvestigationRef.investigationRef === undefined, 'null investigationRef treated as undefined');

// ============================================================
// Metadata Validation
// ============================================================
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: 'not-array' }),
  'rejects non-array metadata',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: ['string-entry'] }),
  'rejects non-object metadata entry',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key: '', value: 'val' }] }),
  'rejects empty metadata key',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key: 'k', value: '' }] }),
  'rejects empty metadata value',
);
assertThrows(
  () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key: 'dup', value: 'a' }, { key: 'dup', value: 'b' }] }),
  'rejects duplicate metadata keys',
);

// Provider-specific metadata keys — blocked
for (const provider of ['openai', 'anthropic', 'gemini', 'claude']) {
  assertThrows(
    () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key: `provider-${provider}`, value: 'gpt-4' }] }),
    `rejects metadata key containing '${provider}'`,
  );
  assertThrows(
    () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key: provider, value: 'gpt-4' }] }),
    `rejects metadata key equal to '${provider}'`,
  );
  assertThrows(
    () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key: `test-${provider.toUpperCase()}`, value: 'x' }] }),
    `rejects metadata key containing case-variant of '${provider}'`,
  );
}

// Audit: specific provider compound keys blocked (audit-2026-07-19)
for (const [key, provider] of [
  ['openai_model', 'openai'],
  ['anthropic_version', 'anthropic'],
  ['gemini_safety', 'gemini'],
  ['claude_system_prompt', 'claude'],
]) {
  assertThrows(
    () => createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key, value: 'x' }] }),
    `rejects metadata key '${key}' containing provider '${provider}'`,
  );
}

// Audit: neutral metadata keys accepted (audit-2026-07-19)
for (const key of ['priority', 'branch', 'ticket', 'feature', 'workspace', 'project']) {
  const e = createAgentRequestEnvelope({ ...VALID_INPUT, metadata: [{ key, value: 'test' }] });
  const entry = e.metadata.find((m) => m.key === key);
  assert(entry !== undefined, `accepts neutral metadata key '${key}'`);
  assert(entry.value === 'test', `neutral metadata key '${key}' has correct value`);
}

// ============================================================
// Immutability
// ============================================================
assert(Object.isFrozen(envelope), 'envelope is frozen');
assertThrows(
  () => { envelope.envelopeId = 'changed'; },
  'cannot reassign envelopeId',
);
assertThrows(
  () => { envelope.constraints.push('new'); },
  'cannot mutate constraints array',
);
assertThrows(
  () => { envelope.metadata.push({ key: 'x', value: 'y' }); },
  'cannot mutate metadata array',
);

// ============================================================
// Provider Independence
// ============================================================
const envelopeKeys = Object.keys(envelope);
for (const key of envelopeKeys) {
  assert(
    !key.includes('provider') || key === 'providerHints' || !['openai', 'anthropic', 'gemini', 'claude'].some(p => key.toLowerCase().includes(p)),
    `no provider-specific field: ${key}`,
  );
}

assert(typeof envelope.envelopeId === 'string', 'envelopeId is string');
assert(typeof envelope.objective === 'string', 'objective is string');
assert(typeof envelope.sourceRevision === 'string', 'sourceRevision is string');

// ============================================================
// Deterministic Construction
// ============================================================
const envelope1 = createAgentRequestEnvelope(VALID_INPUT);
const envelope2 = createAgentRequestEnvelope(VALID_INPUT);
assert(envelope1.envelopeId === envelope2.envelopeId, 'deterministic envelopeId');
assert(envelope1.objective === envelope2.objective, 'deterministic objective');
assert(envelope1.constraints.join(',') === envelope2.constraints.join(','), 'deterministic constraints');
assert(envelope1.metadata.length === envelope2.metadata.length, 'deterministic metadata');

// ============================================================
// Summary
// ============================================================
console.log(`agent-request-envelope-test: ${passed} passed, ${failed} failed`);
