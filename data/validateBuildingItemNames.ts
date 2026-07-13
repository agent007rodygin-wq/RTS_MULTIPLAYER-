import type { Building } from '../types';
import { items } from './items';

const CANONICAL_ITEM_NAMES = new Map<number, string>(
  items.map(item => [item.id, item.name])
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function walkValue(value: unknown, path: string, rootBuilding: Building): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkValue(entry, `${path}[${index}]`, rootBuilding));
    return;
  }

  if (!isRecord(value)) return;

  const itemId = value.id;
  const itemName = value.name;
  if (typeof itemId === 'number' && typeof itemName === 'string') {
    const expectedName = CANONICAL_ITEM_NAMES.get(itemId);
    if (expectedName && expectedName !== itemName) {
      console.warn('[data/buildings] item name mismatch', {
        buildingId: rootBuilding.id,
        buildingName: rootBuilding.name,
        path,
        itemId,
        foundName: itemName,
        expectedName,
      });
    }
  }

  for (const [key, entry] of Object.entries(value)) {
    if (key === 'id' || key === 'name') continue;
    walkValue(entry, `${path}.${key}`, rootBuilding);
  }
}

export function validateBuildingItemNames(buildings: Building[]): void {
  for (let index = 0; index < buildings.length; index++) {
    const building = buildings[index];
    if (!building || typeof building !== 'object') continue;
    walkValue(building, `buildings[${index}]`, building);
  }
}
