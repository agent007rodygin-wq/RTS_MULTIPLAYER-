import { readFile } from 'node:fs/promises';
import { stableStringify } from './knowledge-artifact.ts';
import type { ValidationReport } from './validation-report.ts';
import { freezeValidationReport, validateValidationReport } from './validation-report.ts';

export interface ValidationSerialization {
  serialized: string;
  validationFingerprint: string;
}

type ValidationSerializableReport = Omit<ValidationReport, 'serialized'>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSerializableReport(report: ValidationReport): ValidationSerializableReport {
  const { serialized: _serialized, ...rest } = report;
  return rest;
}

export function buildValidationReportSerialization(report: ValidationReport): ValidationSerialization {
  const serializable = toSerializableReport(report);
  const serialized = `${stableStringify(serializable)}\n`;
  return {
    serialized,
    validationFingerprint: report.result.fingerprint,
  };
}

export function serializeValidationReport(report: ValidationReport): string {
  return buildValidationReportSerialization(report).serialized;
}

function parseValidationReport(serialized: string | ValidationSerializableReport): ValidationSerializableReport {
  if (typeof serialized === 'string') {
    const parsed = JSON.parse(serialized) as unknown;
    if (!isPlainObject(parsed)) {
      throw new Error('Serialized validation report must be a JSON object.');
    }
    return parsed as ValidationSerializableReport;
  }

  return serialized;
}

export function loadValidationReport(
  serialized: string | ValidationSerializableReport,
): ValidationReport {
  const parsed = parseValidationReport(serialized);
  const canonicalSerialized = buildValidationReportSerialization(parsed as ValidationReport).serialized;
  if (typeof serialized === 'string' && serialized !== canonicalSerialized) {
    const parsedValidation = validateValidationReport(parsed);
    const message = parsedValidation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(
      `Invalid validation report: SERIALIZATION_MISMATCH: Validation report serialized content does not match the canonical serialization${message ? `; ${message}` : ''}.`,
    );
  }
  const validation = validateValidationReport(parsed);
  if (!validation.valid) {
    const message = validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('; ');
    throw new Error(`Invalid validation report: ${message}`);
  }

  const envelope = freezeValidationReport({
    ...parsed,
    serialized: canonicalSerialized,
  } as ValidationReport);

  return envelope;
}

export async function loadValidationReportFromFile(filePath: string): Promise<ValidationReport> {
  const serialized = await readFile(filePath, 'utf8');
  return loadValidationReport(serialized);
}
