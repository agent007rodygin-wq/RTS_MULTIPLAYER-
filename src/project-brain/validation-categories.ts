import { deepFreeze } from './knowledge-artifact.ts';

export type ValidationCategory =
  | 'Integrity'
  | 'Authority'
  | 'Context'
  | 'Dependency'
  | 'Registry'
  | 'Knowledge'
  | 'Lifecycle'
  | 'Generation'
  | 'Serialization'
  | 'Traceability'
  | 'Constraints'
  | 'Diagnostics';

export const VALIDATION_CATEGORY_ORDER: readonly ValidationCategory[] = deepFreeze([
  'Integrity',
  'Authority',
  'Context',
  'Dependency',
  'Registry',
  'Knowledge',
  'Lifecycle',
  'Generation',
  'Serialization',
  'Traceability',
  'Constraints',
  'Diagnostics',
]);

export function compareValidationCategories(left: ValidationCategory, right: ValidationCategory): number {
  const leftIndex = VALIDATION_CATEGORY_ORDER.indexOf(left);
  const rightIndex = VALIDATION_CATEGORY_ORDER.indexOf(right);
  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  return left.localeCompare(right);
}

export function normalizeValidationCategory(value: unknown): ValidationCategory {
  if (typeof value !== 'string') {
    throw new Error(`Validation category must be a string. Received: ${String(value)}`);
  }

  const normalized = value.trim();
  if (VALIDATION_CATEGORY_ORDER.includes(normalized as ValidationCategory)) {
    return normalized as ValidationCategory;
  }

  throw new Error(`Validation category must be one of ${VALIDATION_CATEGORY_ORDER.join(', ')}. Received: ${value}`);
}
