
export interface ResourceInfo {
  id: number;
  name: string;
  amount?: number;
  chance?: number;
  frequency?: 'часто' | 'редко';
}

export interface Item {
  id: number;
  name: string;
  englishName?: string;
  description: string;
  category: 'Ресурсы';
  requiredFor?: ResourceInfo[];
  usedInWork?: ResourceInfo[];
  producedBy?: ResourceInfo[];
  sometimesProducedBy?: ResourceInfo[];
  dropsFrom?: ResourceInfo[];
  imageUrl: string;
  rubyPackQuantity?: number; // Amount of items received for 1 ruby
}

export interface DestructionInfo {
  resourceId: number; // ID of the weapon item (e.g. Firecracker)
  weaponName: string;
  amount: number;
  goldCost: number;
  energyCost: number;
  timeSeconds: number;
  damage?: number; // Damage dealt to the building
}

export enum BuildingType {
  Default = 'default',
  Storage = 'storage',
  TownHall = 'town_hall',
  Residential = 'residential'
}

export interface Building {
  id: number;
  name: string;
  englishName?: string;
  category: string;
  type?: BuildingType;
  price?: number;
  rubyPrice?: number;
  buildable?: boolean;
  constructionRequirements: {
    resources?: ResourceInfo[];
    population?: number;
  };
  stats: {
    populationBonus?: number;
    constructionTimeSeconds?: number;
    takesPopulation?: number;
    accelerationCost?: number;
    durability: number;
    gloryOnExplosion: number;
    capacity?: string;
    workTime?: string;
    workTimeWithStatue?: string;
    produces?: ResourceInfo[];
    sometimesProduces?: ResourceInfo[];
    consumes?: ResourceInfo[];
    damage?: string;
    damageWithStatue?: string;
    repair?: string;
    repairWithStatue?: string;
    hates?: string;
    loves?: string;
    permits?: number;
    bandCapacity?: number;
    chanceToCatchThief?: number;
    chanceForSuperResource?: number;
    givesCoins?: number;
    increasesGoldCapacity?: number;
    increasesEnergyCapacity?: number;
    workTimeSeconds?: number;
    workYieldGold?: number;
    isMonster?: boolean;
    moveIntervalSeconds?: number;
  };
  drops: {
    frequent?: ResourceInfo[];
    rare?: ResourceInfo[];
  };
  upgradesTo?: number;
  upgradeCost?: number;
  destructionInfo?: DestructionInfo[];
  description: string;
  imageUrl: string;
  imagePrompt?: string;
}

export type GameEntity = Item | Building;

export interface MapResource {
  x: number;
  y: number;
  hp: number;
  type: 'tree' | 'oil' | 'chest' | 'quarry';
}

export interface PlacedBuilding {
  x: number;
  y: number;
  buildingId: number;
  ownerId: number; // 0 for player
  isConstructing: boolean;
  constructionEndTime: number;
  type?: BuildingType;
  workState?: 'idle' | 'working' | 'finished';
  workEndTime?: number;
  isDestroying?: boolean;
  destructionEndTime?: number;
  hp?: number;
  maxHp?: number;
  pendingDamage?: number;
  taxRate?: number; // 0-50 percentage
  lastMoveTime?: number;
  protectionEndTime?: number; // Timestamp when protection expires
}

export interface VisualEffect {
  id: number;
  x: number;
  y: number;
  type: 'upgrade' | 'explosion';
  startTime: number;
  duration: number;
}

export interface MarketListing {
  id: number;
  sellerName: string;
  resourceId: number;
  amount: number;
  price: number;
  currency: 'coins' | 'rubies';
  isPlayer?: boolean;
}

export interface Clan {
  id: number;
  name: string;
  description: string;
  avatarUrl: string | null;
  leaderName: string;
  membersCount: number;
}

export interface HistoryEntry {
  id: number;
  message: string;
  timestamp: number;
  type: 'build' | 'move' | 'destroy' | 'economy' | 'social' | 'combat';
}

export interface UserProfile {
  username: string;
  password?: string;
  buildings: PlacedBuilding[];
  mapResources?: MapResource[];
  gold: number;
  rubies: number;
  energy: number;
  level: number;
  glory: number;
  reputation: number;
  inventory: Record<number, number>;
  gender: 'male' | 'female' | null;
  avatar: string | null;
  clanId: number | null;
  history: HistoryEntry[];
  friends: { name: string; addedAt: number }[];
}
