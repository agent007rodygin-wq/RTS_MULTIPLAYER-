export interface FishingSpot {
  id: string;
  x: number;
  y: number;
  fishCount: number; // e.g. 3 to 5 catches before moving
  createdAt: number;
  expiresAt: number;
}

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface FishDefinition {
  itemId: number;
  name: string;
  englishName: string;
  weightMin: number; // kg
  weightMax: number;
  coinRewardMin: number;
  coinRewardMax: number;
  energyBonus: number;
  difficulty: number; // 1 to 10
  rarity: FishRarity;
  imageUrl: string;
}

export interface CaughtFishResult {
  fish: FishDefinition;
  weight: number;
  coinsEarned: number;
}
