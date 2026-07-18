import { deepFreeze, stableStringify } from './knowledge-artifact.ts';
import type { BrainOutputClass } from './brain-request.ts';
import type { BrainEngineResult } from './brain-response.ts';
import type { ContextPackageResult } from './context-item.ts';
import { fnv1a32 } from './generation-hash.ts';

export type GenerationPromptSectionId =
  | 'SYSTEM'
  | 'ARCHITECTURE'
  | 'RULES'
  | 'CANONICAL_KNOWLEDGE'
  | 'CONTEXT'
  | 'DEPENDENCIES'
  | 'CONSTRAINTS'
  | 'REQUESTED_TASK'
  | 'VALIDATION_REQUIREMENTS'
  | 'EXPECTED_OUTPUT'
  | 'TRACEABILITY'
  | 'DIAGNOSTICS';

export const GENERATION_PROMPT_SECTION_ORDER: readonly GenerationPromptSectionId[] = [
  'SYSTEM',
  'ARCHITECTURE',
  'RULES',
  'CANONICAL_KNOWLEDGE',
  'CONTEXT',
  'DEPENDENCIES',
  'CONSTRAINTS',
  'REQUESTED_TASK',
  'VALIDATION_REQUIREMENTS',
  'EXPECTED_OUTPUT',
  'TRACEABILITY',
  'DIAGNOSTICS',
];

export interface GenerationPromptSection {
  sectionId: GenerationPromptSectionId;
  order: number;
  title: string;
  required: boolean;
  lines: readonly string[];
  sourceArtifactIds: readonly string[];
}

export interface GenerationPromptInput {
  brainResult: BrainEngineResult;
  contextPackage: ContextPackageResult;
  generationVersion: string;
  expectedOutputType: BrainOutputClass;
  taskConstraints: readonly string[];
  providerHints: readonly string[];
}

export interface GenerationPromptValidationIssue {
  code:
    | 'INVALID_PROMPT_SECTION_SHAPE'
    | 'MISSING_PROMPT_SECTION'
    | 'DUPLICATE_PROMPT_SECTION'
    | 'PROMPT_SECTION_ORDER_MISMATCH'
    | 'EMPTY_REQUIRED_PROMPT_SECTION'
    | 'UNEXPECTED_PROMPT_SECTION';
  message: string;
  sectionId?: string;
}

export interface GenerationPromptValidationReport {
  valid: boolean;
  issueCount: number;
  issues: readonly GenerationPromptValidationIssue[];
}

function normalizeStringList(values: Iterable<string>): readonly string[] {
  return Array.from(new Set(values)).sort();
}

function makeSection(
  sectionId: GenerationPromptSectionId,
  order: number,
  title: string,
  lines: readonly string[],
  sourceArtifactIds: readonly string[] = [],
): GenerationPromptSection {
  return deepFreeze({
    sectionId,
    order,
    title,
    required: true,
    lines: [...lines],
    sourceArtifactIds: normalizeStringList(sourceArtifactIds),
  });
}

function buildSystemSection(): GenerationPromptSection {
  return makeSection(
    'SYSTEM',
    1,
    'System',
    [
      'Project Brain Generation Pipeline',
      'Deterministic provider-independent request assembly',
      'Frozen architecture inputs only',
    ],
  );
}

function buildArchitectureSection(): GenerationPromptSection {
  return makeSection(
    'ARCHITECTURE',
    2,
    'Architecture',
    [
      'Feature 003 architecture is frozen.',
      'Packages A through D are stable foundation inputs.',
      'Package E may prepare generation, but it must not execute providers.',
    ],
  );
}

function buildRulesSection(): GenerationPromptSection {
  return makeSection(
    'RULES',
    3,
    'Rules',
    [
      'Generation must fail closed when authority or context is insufficient.',
      'Provider hints are optional and non-authoritative.',
      'Generation must not mutate canonical knowledge.',
    ],
  );
}

function buildCanonicalKnowledgeSection(input: GenerationPromptInput): GenerationPromptSection {
  const lines = input.contextPackage.includedItems.length > 0
    ? input.contextPackage.includedItems.map(
        (item) =>
          `${item.artifactId} :: ${item.revision.revisionId} :: ${item.revision.lifecycleState} :: ${item.revision.freshnessState}`,
      )
    : ['No included canonical artifacts.'];

  return makeSection(
    'CANONICAL_KNOWLEDGE',
    4,
    'Canonical Knowledge',
    lines,
    input.contextPackage.includedItems.map((item) => item.artifactId),
  );
}

function buildContextSection(input: GenerationPromptInput): GenerationPromptSection {
  const { metadata } = input.contextPackage;

  return makeSection(
    'CONTEXT',
    5,
    'Context',
    [
      `Context package ${metadata.packageId}`,
      `Status ${input.contextPackage.status}`,
      `Included ${metadata.includedCount}`,
      `Excluded ${metadata.excludedCount}`,
      `Warnings ${metadata.warningCount}`,
      `Validation failures ${metadata.validationFailureCount}`,
    ],
    [metadata.packageId, metadata.sourceBrainSessionId],
  );
}

function buildDependenciesSection(input: GenerationPromptInput): GenerationPromptSection {
  return makeSection(
    'DEPENDENCIES',
    6,
    'Dependencies',
    input.brainResult.traceability.dependencyPaths.length > 0
      ? input.brainResult.traceability.dependencyPaths
      : ['No dependency paths resolved.'],
    input.brainResult.dependencyGraph.nodes.map((node) => node.artifactId),
  );
}

function buildConstraintsSection(input: GenerationPromptInput): GenerationPromptSection {
  return makeSection(
    'CONSTRAINTS',
    7,
    'Constraints',
    input.taskConstraints.length > 0 ? [...input.taskConstraints] : ['No additional constraints supplied.'],
    input.brainResult.request.authorityArtifactIds,
  );
}

function buildRequestedTaskSection(input: GenerationPromptInput): GenerationPromptSection {
  const request = input.brainResult.request;

  return makeSection(
    'REQUESTED_TASK',
    8,
    'Requested Task',
    [
      `Request ${request.requestId}`,
      `Task ${request.taskId}`,
      `Summary ${request.summary}`,
      request.purpose ? `Purpose ${request.purpose}` : 'Purpose not supplied.',
      `Expected output ${input.expectedOutputType}`,
    ],
    [request.requestId],
  );
}

function buildValidationRequirementsSection(input: GenerationPromptInput): GenerationPromptSection {
  return makeSection(
    'VALIDATION_REQUIREMENTS',
    9,
    'Validation Requirements',
    [
      'Context package must remain READY.',
      'Prompt sections must be present, unique, and ordered.',
      'Prompt fingerprint must be reproducible.',
      'Serialization must round-trip exactly.',
      'Generation must remain provider-independent.',
    ],
    [input.contextPackage.metadata.packageId],
  );
}

function buildExpectedOutputSection(input: GenerationPromptInput): GenerationPromptSection {
  return makeSection(
    'EXPECTED_OUTPUT',
    10,
    'Expected Output',
    [
      `Expected output type ${input.expectedOutputType}`,
      `Brain response status ${input.brainResult.response.status}`,
      `Brain plan status ${input.brainResult.executionPlan.status}`,
    ],
    [input.brainResult.request.requestId],
  );
}

function buildTraceabilitySection(input: GenerationPromptInput): GenerationPromptSection {
  return makeSection(
    'TRACEABILITY',
    11,
    'Traceability',
    [
      `Brain session ${input.brainResult.session.sessionId}`,
      `Context package ${input.contextPackage.metadata.packageId}`,
      `Source request ${input.brainResult.request.requestId}`,
      `Selected artifacts ${input.brainResult.traceability.selectedArtifactIds.join(', ') || 'none'}`,
    ],
    [
      input.brainResult.session.sessionId,
      input.contextPackage.metadata.packageId,
      ...input.brainResult.traceability.selectedArtifactIds,
    ],
  );
}

function buildDiagnosticsSection(input: GenerationPromptInput): GenerationPromptSection {
  const lines = [
    `Generation version ${input.generationVersion}`,
    `Prompt sections ${GENERATION_PROMPT_SECTION_ORDER.length}`,
    `Context status ${input.contextPackage.status}`,
  ];

  return makeSection('DIAGNOSTICS', 12, 'Diagnostics', lines, [input.contextPackage.metadata.packageId]);
}

export function buildGenerationPromptSections(
  input: GenerationPromptInput,
): readonly GenerationPromptSection[] {
  return deepFreeze([
    buildSystemSection(),
    buildArchitectureSection(),
    buildRulesSection(),
    buildCanonicalKnowledgeSection(input),
    buildContextSection(input),
    buildDependenciesSection(input),
    buildConstraintsSection(input),
    buildRequestedTaskSection(input),
    buildValidationRequirementsSection(input),
    buildExpectedOutputSection(input),
    buildTraceabilitySection(input),
    buildDiagnosticsSection(input),
  ]);
}

export function renderGenerationPrompt(
  sections: readonly GenerationPromptSection[],
): string {
  return `${sections
    .map(
      (section) =>
        `## ${section.title}\n${section.lines.join('\n')}`,
    )
    .join('\n\n')}\n`;
}

export function computeGenerationPromptFingerprint(input: {
  generationVersion: string;
  requestedTask: string;
  expectedOutputType: BrainOutputClass;
  contextPackageFingerprint: string;
  taskConstraints: readonly string[];
  promptSections: readonly GenerationPromptSection[];
}): string {
  return `GEN-${fnv1a32(stableStringify({
    generationVersion: input.generationVersion,
    requestedTask: input.requestedTask,
    expectedOutputType: input.expectedOutputType,
    contextPackageFingerprint: input.contextPackageFingerprint,
    taskConstraints: normalizeStringList(input.taskConstraints),
    promptSections: input.promptSections.map((section) => ({
      sectionId: section.sectionId,
      order: section.order,
      title: section.title,
      required: section.required,
      lines: section.lines,
      sourceArtifactIds: normalizeStringList(section.sourceArtifactIds),
    })),
  }))}`;
}

export function validateGenerationPromptSections(
  sections: readonly GenerationPromptSection[],
): GenerationPromptValidationReport {
  const issues: GenerationPromptValidationIssue[] = [];
  const seen = new Set<string>();

  if (!Array.isArray(sections) || sections.length !== GENERATION_PROMPT_SECTION_ORDER.length) {
    issues.push({
      code: 'INVALID_PROMPT_SECTION_SHAPE',
      message: `Generation prompt must contain exactly ${GENERATION_PROMPT_SECTION_ORDER.length} sections.`,
    });
    return {
      valid: false,
      issueCount: issues.length,
      issues,
    };
  }

  for (let index = 0; index < GENERATION_PROMPT_SECTION_ORDER.length; index += 1) {
    const expectedSectionId = GENERATION_PROMPT_SECTION_ORDER[index];
    const section = sections[index];

    if (!section || typeof section !== 'object') {
      issues.push({
        code: 'INVALID_PROMPT_SECTION_SHAPE',
        message: `Prompt section ${expectedSectionId} is missing or malformed.`,
        sectionId: expectedSectionId,
      });
      continue;
    }

    if (section.sectionId !== expectedSectionId) {
      issues.push({
        code: 'PROMPT_SECTION_ORDER_MISMATCH',
        message: `Expected prompt section ${expectedSectionId} at position ${index + 1} but found ${section.sectionId}.`,
        sectionId: section.sectionId,
      });
    }

    if (seen.has(section.sectionId)) {
      issues.push({
        code: 'DUPLICATE_PROMPT_SECTION',
        message: `Duplicate prompt section detected: ${section.sectionId}.`,
        sectionId: section.sectionId,
      });
    } else {
      seen.add(section.sectionId);
    }

    if (section.required && section.lines.length === 0) {
      issues.push({
        code: 'EMPTY_REQUIRED_PROMPT_SECTION',
        message: `Prompt section ${section.sectionId} must not be empty.`,
        sectionId: section.sectionId,
      });
    }
  }

  for (const section of sections) {
    if (!section || typeof section !== 'object') {
      issues.push({
        code: 'INVALID_PROMPT_SECTION_SHAPE',
        message: 'Prompt section is missing or malformed.',
      });
      continue;
    }

    if (!Array.isArray(section.lines) || !Array.isArray(section.sourceArtifactIds)) {
      issues.push({
        code: 'INVALID_PROMPT_SECTION_SHAPE',
        message: `Prompt section ${section.sectionId} is missing required list fields.`,
        sectionId: section.sectionId,
      });
      continue;
    }

    if (!GENERATION_PROMPT_SECTION_ORDER.includes(section.sectionId)) {
      issues.push({
        code: 'UNEXPECTED_PROMPT_SECTION',
        message: `Unexpected prompt section ${section.sectionId}.`,
        sectionId: section.sectionId,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issueCount: issues.length,
    issues,
  };
}
