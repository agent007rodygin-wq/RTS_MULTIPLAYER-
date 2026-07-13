import { DestructionInfo } from '../types';

export interface DestructionWeaponDefinition {
  resourceId: number;
  weaponName: string;
  baseDamageRatio: number;
  goldPerItem: number;
  energyPerItem: number;
  timePerItem: number;
  minDamage: number;
}

export interface DestructionTarget {
  destructionInfo?: DestructionInfo[];
  hp?: number;
  maxHp?: number;
  shieldHp?: number;
  defenseHp?: number;
  armor?: number;
  stats?: {
    durability?: number;
    hp?: number;
    shieldHp?: number;
    shield?: number;
    defenseHp?: number;
    armor?: number;
  };
}

export const DESTRUCTION_WEAPONS: DestructionWeaponDefinition[] = [
  {
    resourceId: 10013,
    weaponName: 'Петарда',
    baseDamageRatio: 0.003,
    goldPerItem: 5,
    energyPerItem: 1,
    timePerItem: 25,
    minDamage: 6,
  },
  {
    resourceId: 10010,
    weaponName: 'Садовая бомба',
    baseDamageRatio: 0.04,
    goldPerItem: 500,
    energyPerItem: 4,
    timePerItem: 1800,
    minDamage: 80,
  },
  {
    resourceId: 10012,
    weaponName: 'MGM-52 «Ланс»',
    baseDamageRatio: 0.2,
    goldPerItem: 5000,
    energyPerItem: 16,
    timePerItem: 2600,
    minDamage: 390,
  },
  {
    resourceId: 10011,
    weaponName: 'Садовая супер бомба',
    baseDamageRatio: 0.3,
    goldPerItem: 15000,
    energyPerItem: 20,
    timePerItem: 1800,
    minDamage: 590,
  },
  {
    resourceId: 10016,
    weaponName: 'Атомная бомба «Снежинка»',
    baseDamageRatio: 0.1,
    goldPerItem: 10000,
    energyPerItem: 48,
    timePerItem: 3600,
    minDamage: 1500,
  },
  {
    resourceId: 10043,
    weaponName: 'Суператомная бомба',
    baseDamageRatio: 0.1,
    goldPerItem: 40000,
    energyPerItem: 60,
    timePerItem: 3,
    minDamage: 2200,
  },
];

const readNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const pickNumber = (...values: unknown[]): number | null => {
  for (const value of values) {
    const parsed = readNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
};

export function getEffectiveExplosionHp(target: DestructionTarget): number {
  const durability = pickNumber(
    target?.hp,
    target?.maxHp,
    target?.stats?.durability,
    target?.stats?.hp,
    0
  ) || 0;

  const shield = pickNumber(
    target?.shieldHp,
    target?.stats?.shieldHp,
    target?.stats?.shield,
    0
  ) || 0;

  const defense = pickNumber(
    target?.defenseHp,
    target?.armor,
    target?.stats?.defenseHp,
    target?.stats?.armor,
    0
  ) || 0;

  const total = durability + shield + defense;
  return total > 0 ? total : 1;
}

export function generateDestructionInfo(target: DestructionTarget): DestructionInfo[] {
  const effectiveHp = getEffectiveExplosionHp(target);

  return DESTRUCTION_WEAPONS.map((weapon) => {
    const damage = Math.max(
      weapon.minDamage,
      Math.round(effectiveHp * weapon.baseDamageRatio)
    );
    const amount = Math.max(1, Math.ceil(effectiveHp / damage));

    return {
      resourceId: weapon.resourceId,
      weaponName: weapon.weaponName,
      amount,
      goldCost: amount * weapon.goldPerItem,
      energyCost: amount * weapon.energyPerItem,
      timeSeconds: amount * weapon.timePerItem,
      damage,
    };
  });
}

export function getDestructionInfo(target: DestructionTarget): DestructionInfo[] {
  if (Array.isArray(target?.destructionInfo) && target.destructionInfo.length > 0) {
    return target.destructionInfo;
  }
  return generateDestructionInfo(target);
}
