import React, { memo, useState } from 'react';
import type { Building, Item, PlacedBuilding } from '../../../types';
import {
    KOTOFEY_ITEM_ID,
    KOTOFEY_PRICE_GOLD,
    KOTOFEY_RECIPE_RESOURCES,
    AIBOLIT_ITEM_ID,
    AIBOLIT_PRICE_GOLD,
} from '../../game/monsters/kotofeyLogic';
import { KOTOFEY_ID, TROLL_ID, AIBOLIT_ID } from '../../game/monsters/monsterIds';
import {
    TROLL_ITEM_ID,
    TROLL_PRICE_GOLD,
    TROLL_RECIPE_RESOURCES,
} from '../../game/monsters/trollLogic';
import { getCustomMonsterScaledStats } from '../../game/monsters/statueBonusLogic';

export interface MonsterAcademyModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingData?: Building[];
    kotofeyBuilding?: Building | null;
    placedBuildings?: PlacedBuilding[];
    userUid?: string;
    playerGold?: number;
    inventory?: Record<string | number, number>;
    itemData?: Item[];
    coinImageUrl?: string;
    isProcessing?: boolean;
    onCreateAcademyMonster?: (buildingId: number) => void;
    onCreateKotofey?: () => void;
    onOpenBlackMarketForBuilding?: (building: Building) => void;
    onOpenBlackMarketForKotofey?: () => void;
    onPlaceAcademyMonsterFromInventory?: (itemId: number, buildingId: number) => void;
    onPlaceKotofeyFromInventory?: () => void;
    getCanonicalItemName?: (id: string | number, fallbackName?: string, buildingId?: string | number) => string;
}

interface CapsuleSpec {
    buildingId: number;
    itemId: number;
    icon: string;
    defaultName: string;
    defaultEnglishName: string;
    defaultPrice: number;
    defaultResources: Array<{ id: number; name: string; amount: number }>;
    defaultImageUrl: string;
    defaultDescription: string;
    defaultEnglishDescription: string;
}

const ACADEMY_CAPSULES: CapsuleSpec[] = [
    {
        buildingId: TROLL_ID,
        itemId: TROLL_ITEM_ID,
        icon: '🧌',
        defaultName: 'Тролль',
        defaultEnglishName: 'Troll',
        defaultPrice: TROLL_PRICE_GOLD,
        defaultResources: TROLL_RECIPE_RESOURCES,
        defaultImageUrl: '/buildings/Монстры/Тролль/70008.webp',
        defaultDescription:
            'Злой и неуклюжий. Но обладает уникальной способностью заставлять гномов работать. Для этого достаточно оставить его рядом с заводом или грядкой. Но не забывайте за ним приглядывать, ведь он может разрушить ваше производство.',
        defaultEnglishDescription:
            "Angry and clumsy. But he has a unique ability to make gnomes work. It's enough to leave troll near the factory or plantation. But do not forget to keep an eye on him, because it can destroy your buildings.",
    },
    {
        buildingId: AIBOLIT_ID,
        itemId: AIBOLIT_ITEM_ID,
        icon: '🩺',
        defaultName: 'Айболит',
        defaultEnglishName: 'Aibolit',
        defaultPrice: AIBOLIT_PRICE_GOLD,
        defaultResources: [
            { id: 10024, name: 'Супер лилия', amount: 3 },
            { id: 10004, name: 'Куски супер тыквы', amount: 2 },
        ],
        defaultImageUrl: '/buildings/Монстры/Айболит/70009.webp',
        defaultDescription: 'Любит и лечит зверушек, всех',
        defaultEnglishDescription: 'He loves and treats animals all',
    },
    {
        buildingId: KOTOFEY_ID,
        itemId: KOTOFEY_ITEM_ID,
        icon: '🐾',
        defaultName: 'Котофей',
        defaultEnglishName: 'Kotofey',
        defaultPrice: KOTOFEY_PRICE_GOLD,
        defaultResources: KOTOFEY_RECIPE_RESOURCES,
        defaultImageUrl: '/buildings/Монстры/Котофей/70007.webp',
        defaultDescription: 'Ходит и ремонтирует всё что под руку попадется: дома, монстров. Странный он...',
        defaultEnglishDescription: "Walks and repair everything that comes to hand: the house, the monsters. He's a strange…",
    },
];

const MonsterAcademyModalComponent: React.FC<MonsterAcademyModalProps> = ({
    isOpen,
    onClose,
    buildingData = [],
    kotofeyBuilding,
    placedBuildings = [],
    userUid,
    playerGold = 0,
    inventory = {},
    itemData = [],
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    isProcessing = false,
    onCreateAcademyMonster,
    onCreateKotofey,
    onOpenBlackMarketForBuilding,
    onOpenBlackMarketForKotofey,
    onPlaceAcademyMonsterFromInventory,
    onPlaceKotofeyFromInventory,
    getCanonicalItemName,
}) => {
    const [selectedMonsterId, setSelectedMonsterId] = useState<number>(KOTOFEY_ID);

    if (!isOpen) return null;

    const activeSpec =
        ACADEMY_CAPSULES.find((c) => c.buildingId === selectedMonsterId) || ACADEMY_CAPSULES[2];

    const resolveBuildingForSpec = (spec: CapsuleSpec): Building | null => {
        const found = buildingData.find((b) => Number(b.id) === spec.buildingId);
        if (found) return found;
        if (spec.buildingId === KOTOFEY_ID && kotofeyBuilding) return kotofeyBuilding;
        return null;
    };

    const activeBuilding = resolveBuildingForSpec(activeSpec);
    const priceGold = activeBuilding?.price ?? activeSpec.defaultPrice;
    const requirements = activeBuilding?.constructionRequirements?.resources ?? activeSpec.defaultResources;
    const hasEnoughGold = playerGold >= priceGold;
    const missingResources = requirements.filter(
        (req) => (Number(inventory[req.id]) || 0) < (req.amount || 0)
    );
    const hasMissingResources = missingResources.length > 0;
    const inventoryCount = Math.max(0, Number(inventory[activeSpec.itemId]) || 0);

    const scaled = getCustomMonsterScaledStats({
        buildingId: activeSpec.buildingId,
        ownerId: userUid,
        buildings: placedBuildings,
    });

    const resolveItemName = (id: number, fallback: string) => {
        if (getCanonicalItemName) {
            return getCanonicalItemName(id, fallback, activeSpec.buildingId);
        }
        return itemData.find((item) => Number(item.id) === id)?.name || fallback;
    };

    const triggerCreate = (spec: CapsuleSpec) => {
        if (isProcessing) return;
        const b = resolveBuildingForSpec(spec);
        const reqs = b?.constructionRequirements?.resources ?? spec.defaultResources;
        const missing = reqs.some((req) => (Number(inventory[req.id]) || 0) < (req.amount || 0));
        if (missing) {
            if (b && onOpenBlackMarketForBuilding) {
                onOpenBlackMarketForBuilding(b);
                return;
            }
            if (spec.buildingId === KOTOFEY_ID && onOpenBlackMarketForKotofey) {
                onOpenBlackMarketForKotofey();
                return;
            }
        }
        if (onCreateAcademyMonster) {
            onCreateAcademyMonster(spec.buildingId);
        } else if (spec.buildingId === KOTOFEY_ID) {
            onCreateKotofey?.();
        }
    };

    const triggerBlackMarket = () => {
        if (activeBuilding && onOpenBlackMarketForBuilding) {
            onOpenBlackMarketForBuilding(activeBuilding);
        } else if (activeSpec.buildingId === KOTOFEY_ID && onOpenBlackMarketForKotofey) {
            onOpenBlackMarketForKotofey();
        }
    };

    const triggerPlaceFromInventory = () => {
        if (onPlaceAcademyMonsterFromInventory) {
            onPlaceAcademyMonsterFromInventory(activeSpec.itemId, activeSpec.buildingId);
        } else if (activeSpec.buildingId === KOTOFEY_ID) {
            onPlaceKotofeyFromInventory?.();
        }
    };

    return (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-[60] backdrop-blur-sm p-2 sm:p-4 animate-fade-in" onClick={onClose}>
            <div
                className="relative w-full max-w-3xl max-h-[94vh] overflow-y-auto flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-gray-900/95 via-gray-950/95 to-black/95 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Academy Menu Image Container */}
                <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 shadow-lg w-full">
                    <img
                        src="/academymonsters/seEsr.webp"
                        alt="Академия монстров"
                        className="w-full h-auto max-h-[48vh] object-contain mx-auto bg-black/40 rounded-2xl"
                    />

                    {/* Create / Select Buttons Overlay - positioned under Left (Troll), Center (Aibolit), Right (Kotofey) capsules */}
                    <div className="absolute bottom-[8%] left-0 right-0 grid grid-cols-3 gap-2 sm:gap-5 px-[7%] sm:px-[9%] items-center">
                        {ACADEMY_CAPSULES.map((capsule) => {
                            const b = resolveBuildingForSpec(capsule);
                            const isSelected = capsule.buildingId === activeSpec.buildingId;
                            const ownedCount = Math.max(0, Number(inventory[capsule.itemId]) || 0);
                            const capsuleMissing = (b?.constructionRequirements?.resources ?? capsule.defaultResources).some(
                                (req) => (Number(inventory[req.id]) || 0) < (req.amount || 0)
                            );
                            const label = b?.name || capsule.defaultName;

                            return (
                                <button
                                    key={capsule.buildingId}
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => {
                                        if (!isSelected) {
                                            setSelectedMonsterId(capsule.buildingId);
                                            return;
                                        }
                                        triggerCreate(capsule);
                                    }}
                                    className={`relative font-black py-1.5 px-2 sm:py-2 sm:px-3 rounded-xl text-[11px] sm:text-sm border backdrop-blur-sm transition-all shadow-lg cursor-pointer truncate ${
                                        isProcessing
                                            ? 'bg-gray-700 text-gray-300 border-gray-500 cursor-wait'
                                            : isSelected
                                                ? capsuleMissing
                                                    ? 'bg-amber-600/95 hover:bg-amber-500 text-black border-yellow-300 shadow-amber-500/40 ring-2 ring-yellow-300/70'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-300 shadow-emerald-500/40 ring-2 ring-emerald-300/70'
                                                : 'bg-gray-900/85 hover:bg-purple-900/85 text-gray-100 border-purple-400/50 hover:border-purple-300'
                                    }`}
                                    title={isSelected ? `Создать: ${label}` : `Выбрать капсулу: ${label}`}
                                >
                                    {isSelected
                                        ? (isProcessing ? 'Создаём...' : `Создать ${label}`)
                                        : `${capsule.icon} ${label}`}
                                    {ownedCount > 0 && (
                                        <span className="ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] bg-purple-600 text-white border border-purple-300/60">
                                            ×{ownedCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-900/80 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 z-10 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Selected Capsule Details & Controls */}
                <div className="w-full mt-3 bg-gray-900/80 border border-purple-500/30 rounded-xl p-3.5 text-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-black/50 border border-amber-500/40 p-1.5 flex items-center justify-center flex-shrink-0">
                                <img
                                    src={activeBuilding?.imageUrl || activeSpec.defaultImageUrl}
                                    alt={activeBuilding?.name || activeSpec.defaultName}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-base font-black text-amber-300">
                                        {activeBuilding?.name || activeSpec.defaultName}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        ({activeBuilding?.englishName || activeSpec.defaultEnglishName})
                                    </span>
                                    {activeSpec.buildingId === TROLL_ID ? (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                                            ❤️ {(activeBuilding?.stats.durability ?? 2800).toLocaleString()} • ⚔️ Постройкам {scaled.damageToBuilding} / Монстрам {scaled.damageToMonster} • 😡 Ненавидит Грядки (x2)
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                            ❤️ {(activeBuilding?.stats.durability ?? 2248).toLocaleString()} • 🔧 Ремонт {activeSpec.buildingId === KOTOFEY_ID ? (activeBuilding?.stats.repair || '300') : scaled.baseRepair} • {activeSpec.buildingId === AIBOLIT_ID ? '🩺 Любит Монстров (x2)' : '🎁 Любит Подарки (x2)'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-300 mt-1">
                                    {activeBuilding?.description || activeSpec.defaultDescription}
                                </p>
                                <p className="text-[11px] text-gray-400 italic">
                                    {activeBuilding?.englishDescription || activeSpec.defaultEnglishDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Price & Resources */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                            className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
                                hasEnoughGold
                                    ? 'bg-emerald-950/50 text-emerald-200 border-emerald-500/30'
                                    : 'bg-red-950/60 text-red-200 border-red-500/50'
                            }`}
                        >
                            <img src={coinImageUrl} alt="coins" className="w-4 h-4 object-contain" />
                            <span>{priceGold.toLocaleString()}</span>
                        </span>

                        {requirements.map((req) => {
                            const have = Number(inventory[req.id]) || 0;
                            const need = req.amount || 0;
                            const enough = have >= need;
                            return (
                                <span
                                    key={req.id}
                                    onClick={() => {
                                        if (!enough) triggerBlackMarket();
                                    }}
                                    className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                                        enough
                                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                                            : 'bg-red-950/60 text-red-200 border-red-500/50 hover:bg-red-900/70 cursor-pointer'
                                    }`}
                                >
                                    <span>{resolveItemName(req.id, req.name)}:</span>
                                    <strong>{have}/{need}</strong>
                                </span>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => triggerCreate(activeSpec)}
                            disabled={isProcessing || !hasEnoughGold || hasMissingResources}
                            className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
                                isProcessing || !hasEnoughGold || hasMissingResources
                                    ? 'bg-gray-800 text-gray-500 border-white/10 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/40 shadow-lg cursor-pointer'
                            }`}
                        >
                            <span>{activeSpec.icon}</span>
                            <span>
                                {isProcessing
                                    ? `Создание (${activeBuilding?.name || activeSpec.defaultName})...`
                                    : `Создать (${priceGold.toLocaleString()} монет)`}
                            </span>
                        </button>

                        {hasMissingResources && (
                            <button
                                type="button"
                                onClick={triggerBlackMarket}
                                className="py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-black border border-yellow-300/60 shadow-lg flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>🏴‍☠️</span>
                                <span>Черный рынок</span>
                            </button>
                        )}

                        {inventoryCount > 0 && (
                            <button
                                type="button"
                                onClick={triggerPlaceFromInventory}
                                className="py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/50 shadow-lg flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>📍</span>
                                <span>Поставить из инвентаря ({inventoryCount})</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MonsterAcademyModal = memo(MonsterAcademyModalComponent);
