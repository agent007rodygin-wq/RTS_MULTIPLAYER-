import { FishDefinition } from './fishingTypes';

export const BASINGSE_FISH_TABLE: FishDefinition[] = [
  {
    itemId: 10060,
    name: 'Серебряный карась',
    englishName: 'Silver Crucian',
    weightMin: 0.3,
    weightMax: 1.6,
    coinRewardMin: 15,
    coinRewardMax: 45,
    energyBonus: 10,
    difficulty: 2,
    rarity: 'common',
    imageUrl: '/buildings/рыба/карась.svg'
  },
  {
    itemId: 10061,
    name: 'Речной окунь',
    englishName: 'River Perch',
    weightMin: 0.4,
    weightMax: 2.2,
    coinRewardMin: 35,
    coinRewardMax: 85,
    energyBonus: 15,
    difficulty: 3,
    rarity: 'common',
    imageUrl: '/buildings/рыба/окунь.svg'
  },
  {
    itemId: 10062,
    name: 'Зеркальный карп',
    englishName: 'Mirror Carp',
    weightMin: 1.8,
    weightMax: 6.5,
    coinRewardMin: 80,
    coinRewardMax: 200,
    energyBonus: 25,
    difficulty: 5,
    rarity: 'uncommon',
    imageUrl: '/buildings/рыба/карп.svg'
  },
  {
    itemId: 10063,
    name: 'Речная щука',
    englishName: 'River Pike',
    weightMin: 1.5,
    weightMax: 8.0,
    coinRewardMin: 180,
    coinRewardMax: 450,
    energyBonus: 40,
    difficulty: 6,
    rarity: 'rare',
    imageUrl: '/buildings/рыба/щука.svg'
  },
  {
    itemId: 10064,
    name: 'Королевский лосось',
    englishName: 'Royal Salmon',
    weightMin: 3.0,
    weightMax: 14.0,
    coinRewardMin: 400,
    coinRewardMax: 1100,
    energyBonus: 60,
    difficulty: 8,
    rarity: 'epic',
    imageUrl: '/buildings/рыба/лосось.svg'
  },
  {
    itemId: 10065,
    name: 'Золотая рыбка удачи',
    englishName: 'Lucky Goldfish',
    weightMin: 0.8,
    weightMax: 3.5,
    coinRewardMin: 1500,
    coinRewardMax: 3500,
    energyBonus: 100,
    difficulty: 9,
    rarity: 'legendary',
    imageUrl: '/buildings/рыба/золотая_рыбка.svg'
  }
];

export function rollBasingseFish(): FishDefinition {
  const roll = Math.random() * 100;
  if (roll > 96) return BASINGSE_FISH_TABLE[5]; // Legendary (4%)
  if (roll > 85) return BASINGSE_FISH_TABLE[4]; // Epic (11%)
  if (roll > 65) return BASINGSE_FISH_TABLE[3]; // Rare (20%)
  if (roll > 40) return BASINGSE_FISH_TABLE[2]; // Uncommon (25%)
  if (roll > 20) return BASINGSE_FISH_TABLE[1]; // Perch (20%)
  return BASINGSE_FISH_TABLE[0];                // Crucian (20%)
}
