
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
  letterSubCategory?: 'english' | 'russian' | 'numbers';
  giftSubCategory?: 'main' | 'castles' | 'babies' | 'march8' | 'halloween' | 'valentine' | 'spring';
  decorSubCategory?: 'flags' | 'other';
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

export interface DroppedItem {
  id: string;
  x: number;
  y: number;
  zoneId?: string;
  itemId: number;
  amount: number;
  ownerId?: string; // Optional: if only specific player can pick it up
  ownerName?: string;
}

export interface MapResource {
  x: number;
  y: number;
  zoneId?: string;
  hp: number;
  type: 'tree' | 'oil' | 'chest' | 'quarry';
}

export interface PlacedBuilding {
  id: string | number;
  tempId?: string;
  clientBuildTraceId?: string;
  x: number;
  y: number;
  zoneId?: string;
  buildingId: number;
  ownerId: string; // "0" for local player, or UID
  ownerName?: string;
  status?: 'pending' | 'normal' | 'error';
  syncState?: 'creating' | 'synced' | 'error';
  isConstructing: boolean;
  constructionEndTime: number;
  type?: BuildingType;
  isLocal?: boolean;
  workState?: 'idle' | 'working' | 'finished';
  workEndTime?: number;
  isDestroying?: boolean;
  destructionEndTime?: number;
  destructionStartedAt?: number;
  destructionExpiresAt?: number;
  destructionDurationMs?: number;
  destructionMaxLifetimeMs?: number;
  destructionStatus?: 'active' | 'finished';
  hp?: number;
  maxHp?: number;
  pendingDamage?: number;
  shieldHp?: number;
  shieldMaxHp?: number;
  taxRate?: number; // 0-50 percentage
  bank?: number; // Gold stored in building
  initiatorId?: string; // UID of the player who started an action
  lastMoveTime?: number;
  lastAttackTime?: number;
  protectionEndTime?: number; // Timestamp when protection expires
  isActive?: boolean;
  hostId?: string; // UID of the client responsible for AI logic
  timestamp?: number; // Legacy or explicit creation timestamp
}

export interface VisualEffect {
  id: number;
  x: number;
  y: number;
  type: 'upgrade' | 'explosion' | 'shot' | 'flash';
  startTime: number;
  duration: number;
  createdAt: number;
  expiresAt: number;
  durationMs: number;
  maxLifetimeMs: number;
  status: 'active' | 'finished';
  targetX?: number;
  targetY?: number;
}

export interface MarketListing {
  id: number;
  sellerName: string;
  sellerId: string;
  resourceId: number;
  amount: number;
  price: number;
  currency: 'coins' | 'rubies';
}

export interface Clan {
  id: number;
  name: string;
  description: string;
  avatarUrl: string | null;
  leaderName: string;
  leaderUid: string;
  membersCount: number;
  isPublic: boolean;
  allowInvites: boolean;
  invitePermissionLevel: number;
  starGrantPermissionLevel: number;
}

export interface HistoryEntry {
  id: number;
  message: string;
  timestamp: number;
  type: 'build' | 'move' | 'destroy' | 'economy' | 'social' | 'combat' | 'system';
}

export interface PrivateMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
  participants: string[];
  senderName?: string;
  senderAvatar?: string;
  isAnonymous?: boolean;
}
