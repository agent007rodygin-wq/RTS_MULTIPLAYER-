import { deepFreeze } from './knowledge-artifact.ts';

export type ValidationSeverity = 'Info' | 'Warning' | 'Error' | 'Blocked' | 'Fatal';

export const VALIDATION_SEVERITY_ORDER: readonly ValidationSeverity[] = deepFreeze([
  'Info',
  'Warning',
  'Error',
  'Blocked',
  'Fatal',
]);

export function compareValidationSeverity(left: ValidationSeverity, right: ValidationSeverity): number {
  const leftIndex = VALIDATION_SEVERITY_ORDER.indexOf(left);
  const rightIndex = VALIDATION_SEVERITY_ORDER.indexOf(right);
  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  return left.localeCompare(right);
}

export function normalizeValidationSeverity(value: unknown): ValidationSeverity {
  if (typeof value !== 'string') {
    throw new Error(`Validation severity must be a string. Received: ${String(value)}`);
  }

  const normalized = value.trim();
  if (VALIDATION_SEVERITY_ORDER.includes(normalized as ValidationSeverity)) {
    return normalized as ValidationSeverity;
  }

  throw new Error(`Validation severity must be one of ${VALIDATION_SEVERITY_ORDER.join(', ')}. Received: ${value}`);
}
