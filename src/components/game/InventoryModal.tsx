import React, { memo, useState } from 'react';
import { InventoryIcon } from '../../../components/IconComponents';
import type { Item } from '../../../types';
import {
    CRAFTING_RECIPES,
    CraftingRecipe,
    getMaxCraftableCount,
    isUsableInventoryItem,
    isWeaponInventoryItem,
    getItemEnergyRestore,
    getItemActionLabel,
    getItemBadgeInfo,
    ENERGY_DRINK_ID,
    PUMPKIN_PIE_ID,
    LUMBERJACK_ELIXIR_ID,
    REINFORCING_MORTAR_ID,
    FIRECRACKER_BUNDLE_ID
} from '../../game/crafting/craftingLogic';
import { getItemQuickSellPrice } from '../../game/economy/quickSellLogic';

export interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: Record<number, number>;
    itemData: Item[];
    playerEnergy?: number;
    maxEnergy?: number;
    coinImageUrl?: string;
    onUseItem?: (itemId: number) => void;
    onCraftItem?: (recipeId: string, count: number) => void;
    onQuickSellItem?: (itemId: number, amount: number) => void;
    playCloseSound?: () => void;
}

interface SellingItemInfo {
    id: number;
    name: string;
    imageUrl: string;
    availableAmount: number;
    unitPrice: number;
}

export const InventoryModal: React.FC<InventoryModalProps> = memo(({
    isOpen,
    onClose,
    inventory,
    itemData,
    playerEnergy,
    maxEnergy,
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    onUseItem,
    onCraftItem,
    onQuickSellItem,
    playCloseSound
}) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'craft'>('inventory');
    const [sellingItem, setSellingItem] = useState<SellingItemInfo | null>(null);
    const [sellAmount, setSellAmount] = useState<number | ''>(1);
    const effectiveSellAmount = Math.max(1, Number(sellAmount) || 1);

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
        if (playCloseSound) playCloseSound();
    };

    const currentEnergy = typeof playerEnergy === 'number' ? playerEnergy : 100;
    const currentMaxEnergy = typeof maxEnergy === 'number' ? maxEnergy : 100;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div
                className="relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundImage: 'url(/Gui/build_menu_bg.webp)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    width: 'min(var(--ui-modal-width), calc(100vw - 32px))',
                    height: 'min(var(--ui-modal-height), calc(100vh - 32px))',
                    padding: 'var(--ui-modal-padding-top) var(--ui-modal-padding-right) var(--ui-modal-padding-bottom) var(--ui-modal-padding-left)',
                    overflow: 'hidden'
                }}
            >
                {/* Close button aligned with background tablet texture X */}
                <button
                    onClick={handleClose}
                    className="absolute z-10 cursor-pointer"
                    style={{
                        right: '7.06%',
                        top: '8.91%',
                        transform: 'translate(50%, -50%)',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)',
                        boxShadow: '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)',
                        border: '1px solid rgba(96,165,250,0.4)',
                        color: 'rgba(200,225,255,0.9)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55), 0 0 36px 12px rgba(96,165,250,0.25), inset 0 0 12px rgba(150,200,255,0.35)';
                        e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.4) 0%, rgba(60,130,220,0.2) 60%, transparent 100%)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)';
                        e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)';
                    }}
                    title="Закрыть"
                />

                {/* Header: Tabs + Energy display */}
                <div className="flex items-center justify-between relative px-3 mt-2.5 mb-2">
                    {/* Tabs navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('inventory')}
                            style={{
                                padding: '6px 18px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: activeTab === 'inventory' ? 800 : 600,
                                background: activeTab === 'inventory' ? 'rgba(59, 130, 246, 0.75)' : 'rgba(255, 255, 255, 0.08)',
                                color: activeTab === 'inventory' ? '#ffffff' : 'rgba(200, 220, 240, 0.8)',
                                border: activeTab === 'inventory' ? '1px solid rgba(96, 165, 250, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: activeTab === 'inventory' ? '0 0 14px rgba(59, 130, 246, 0.45)' : 'none',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                        >
                            🎒 Инвентарь
                        </button>
                        <button
                            onClick={() => setActiveTab('craft')}
                            style={{
                                padding: '6px 18px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                fontWeight: activeTab === 'craft' ? 800 : 600,
                                background: activeTab === 'craft' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255, 255, 255, 0.08)',
                                color: activeTab === 'craft' ? '#ffffff' : 'rgba(200, 220, 240, 0.8)',
                                border: activeTab === 'craft' ? '1px solid rgba(192, 132, 252, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: activeTab === 'craft' ? '0 0 14px rgba(168, 85, 247, 0.45)' : 'none',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                        >
                            ⚗️ Крафт
                        </button>
                    </div>

                    {/* Energy status pill */}
                    <div
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                            marginRight: '48px',
                            background: 'rgba(234, 179, 8, 0.15)',
                            border: '1px solid rgba(234, 179, 8, 0.35)',
                            color: '#fde047',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <span>⚡ Энергия:</span>
                        <span className="text-white">{currentEnergy}</span>
                        <span className="text-yellow-400/70">/ {currentMaxEnergy}</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="build-menu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {activeTab === 'inventory' ? (
                        /* INVENTORY TAB */
                        Object.keys(inventory).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 py-16">
                                <InventoryIcon className="w-16 h-16 mb-4 opacity-50" />
                                <p className="font-medium text-gray-300">Ваш инвентарь пуст.</p>
                                <p className="text-sm mt-1 text-gray-400">Попробуйте собрать дерево или вырастить грибы!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {Object.entries(inventory).map(([idStr, val]) => {
                                    const amount = val as number;
                                    const id = parseInt(idStr);
                                    if (amount <= 0) return null;
                                    const item = itemData.find(i => i.id === id);
                                    const isUsable = isUsableInventoryItem(id);
                                    const isWeapon = isWeaponInventoryItem(id);
                                    const badge = getItemBadgeInfo(id);
                                    const actionLabel = getItemActionLabel(id);

                                    const getUseButtonStyle = () => {
                                        if (id === PUMPKIN_PIE_ID) {
                                            return {
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                border: '1px solid rgba(252, 211, 77, 0.5)'
                                            };
                                        }
                                        if (id === REINFORCING_MORTAR_ID) {
                                            return {
                                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                                border: '1px solid rgba(125, 211, 252, 0.5)'
                                            };
                                        }
                                        return {
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            border: '1px solid rgba(110, 231, 183, 0.5)'
                                        };
                                    };

                                    return (
                                        <div
                                            key={id}
                                            style={{
                                                background: isUsable ? 'rgba(16, 185, 129, 0.12)' : isWeapon ? 'rgba(239, 68, 68, 0.10)' : 'rgba(0,0,0,0.28)',
                                                borderRadius: '10px',
                                                padding: '10px 8px',
                                                border: isUsable
                                                    ? '1.5px solid rgba(52, 211, 153, 0.45)'
                                                    : isWeapon
                                                    ? '1.5px solid rgba(248, 113, 113, 0.45)'
                                                    : '1.5px solid rgba(255,255,255,0.08)',
                                                textAlign: 'center',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow: isUsable ? '0 0 12px rgba(16, 185, 129, 0.2)' : isWeapon ? '0 0 12px rgba(239, 68, 68, 0.18)' : 'none'
                                            }}
                                        >
                                            {/* Quantity Badge */}
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    background: 'rgba(0,0,0,0.75)',
                                                    color: '#fbbf24',
                                                    fontFamily: 'Nunito, sans-serif',
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    padding: '1px 6px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(255,255,255,0.15)'
                                                }}
                                            >
                                                {amount}
                                            </span>

                                            {/* Usable / Weapon Indicator Badge */}
                                            {badge && (
                                                <span
                                                    style={{
                                                        position: 'absolute',
                                                        top: '5px',
                                                        left: '5px',
                                                        background: badge.bg,
                                                        color: badge.color || '#ffffff',
                                                        fontSize: '9px',
                                                        fontWeight: 800,
                                                        padding: '1px 5px',
                                                        borderRadius: '5px'
                                                    }}
                                                >
                                                    {badge.text}
                                                </span>
                                            )}

                                            {/* Image */}
                                            <div style={{ width: '100%', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0 4px' }}>
                                                {item ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center text-xs text-gray-300">?</div>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <p
                                                style={{
                                                    fontFamily: 'Nunito, sans-serif',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    color: isUsable ? '#a7f3d0' : isWeapon ? '#fca5a5' : '#d0d8e0',
                                                    lineHeight: '1.2',
                                                    marginBottom: (isUsable || isWeapon) ? '6px' : '2px'
                                                }}
                                            >
                                                {item ? item.name : `Item #${id}`}
                                            </p>

                                            {/* Action buttons area */}
                                            <div className="flex flex-col gap-1.5 mt-2">
                                                {/* Usable Action Button */}
                                                {isUsable && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onUseItem) onUseItem(id);
                                                        }}
                                                        className="w-full py-1 px-1 rounded-lg text-xs font-bold text-white transition-all transform active:scale-95 cursor-pointer shadow-md"
                                                        style={getUseButtonStyle()}
                                                        title={`Использовать ${item?.name || 'предмет'}`}
                                                    >
                                                        {actionLabel}
                                                    </button>
                                                )}

                                                {/* Quick Sell Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const unitPrice = getItemQuickSellPrice(item || id);
                                                        setSellingItem({
                                                            id,
                                                            name: item?.name || `Предмет #${id}`,
                                                            imageUrl: item?.imageUrl || '',
                                                            availableAmount: amount,
                                                            unitPrice
                                                        });
                                                        setSellAmount(1);
                                                    }}
                                                    className="w-full py-1 px-1 rounded-lg text-[11px] font-bold text-amber-200 hover:text-white transition-all transform active:scale-95 cursor-pointer shadow flex items-center justify-center gap-1"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.35) 0%, rgba(180, 83, 9, 0.55) 100%)',
                                                        border: '1px solid rgba(245, 158, 11, 0.4)'
                                                    }}
                                                    title={`Быстрая скупка: ${getItemQuickSellPrice(item || id)} монет за 1 шт.`}
                                                >
                                                    <span>💰</span>
                                                    <span>Продать</span>
                                                    <span className="text-[10px] text-yellow-300 font-extrabold">({getItemQuickSellPrice(item || id)})</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        /* CRAFTING TAB */
                        <div className="flex flex-col gap-4 max-w-2xl mx-auto py-2">
                            {/* Banner / description */}
                            <div
                                className="rounded-xl p-3 text-xs flex items-center gap-3"
                                style={{
                                    background: 'rgba(147, 51, 234, 0.12)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    color: '#e9d5ff'
                                }}
                            >
                                <span className="text-2xl">⚗️</span>
                                <div>
                                    <p className="font-bold text-sm text-purple-200">Быстрый крафт зелий и расходников</p>
                                    <p className="text-purple-300/80 mt-0.5">
                                        Готовьте энергетики из собранных грибов и восстанавливайте силы прямо во время игры!
                                    </p>
                                </div>
                            </div>

                            {/* Recipes list */}
                            {CRAFTING_RECIPES.map((recipe: CraftingRecipe) => {
                                const maxCraftable = getMaxCraftableCount(recipe, inventory);
                                const currentStock = Math.max(0, Number(inventory[recipe.resultItemId]) || 0);

                                return (
                                    <div
                                        key={recipe.id}
                                        className="rounded-2xl p-4 flex flex-col gap-3"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.75)',
                                            border: '1.5px solid rgba(147, 51, 234, 0.35)',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                                        }}
                                    >
                                        {/* Recipe Header */}
                                        <div className="flex items-start justify-between gap-3 border-b border-gray-700/60 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-14 h-14 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0"
                                                    style={{
                                                        background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(30,41,59,0.8) 100%)',
                                                        border: '1px solid rgba(192,132,252,0.4)',
                                                        boxShadow: '0 0 14px rgba(168,85,247,0.25)'
                                                    }}
                                                >
                                                    <img
                                                        src={recipe.imageUrl}
                                                        alt={recipe.name}
                                                        className="w-full h-full object-contain filter drop-shadow"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-base font-extrabold text-white">{recipe.name}</h3>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                                                            {recipe.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 mt-1">{recipe.description}</p>
                                                </div>
                                            </div>

                                            {/* Effect badge */}
                                            {recipe.energyRestore ? (
                                                <div
                                                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1"
                                                    style={{
                                                        background: 'rgba(234, 179, 8, 0.18)',
                                                        border: '1px solid rgba(234, 179, 8, 0.45)',
                                                        color: '#facc15'
                                                    }}
                                                >
                                                    <span>⚡</span>
                                                    <span>+{recipe.energyRestore} Энергии</span>
                                                </div>
                                            ) : recipe.effectType === 'woodcutter_buff' ? (
                                                <div
                                                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1"
                                                    style={{
                                                        background: 'rgba(16, 185, 129, 0.18)',
                                                        border: '1px solid rgba(16, 185, 129, 0.45)',
                                                        color: '#34d399'
                                                    }}
                                                >
                                                    <span>🪓</span>
                                                    <span>+1 Дерево ({recipe.buffDurationMinutes} мин)</span>
                                                </div>
                                            ) : recipe.effectType === 'mortar_discount' ? (
                                                <div
                                                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1"
                                                    style={{
                                                        background: 'rgba(56, 189, 248, 0.18)',
                                                        border: '1px solid rgba(56, 189, 248, 0.45)',
                                                        color: '#38bdf8'
                                                    }}
                                                >
                                                    <span>🧱</span>
                                                    <span>-{recipe.repairDiscountPercent}% Ремонт</span>
                                                </div>
                                            ) : recipe.effectType === 'weapon' ? (
                                                <div
                                                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1"
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.18)',
                                                        border: '1px solid rgba(239, 68, 68, 0.45)',
                                                        color: '#f87171'
                                                    }}
                                                >
                                                    <span>💥</span>
                                                    <span>Урон: {recipe.weaponDamage || 25} (Осада)</span>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Ingredients Section */}
                                        <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                                            <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center justify-between">
                                                <span>Требуемые ингредиенты (на 1 шт.):</span>
                                                <span className="text-gray-400">
                                                    Можно создать: <strong className="text-purple-300">{maxCraftable} шт.</strong>
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {recipe.ingredients.map(ing => {
                                                    const available = Math.max(0, Number(inventory[ing.itemId]) || 0);
                                                    const hasEnough = available >= ing.amount;

                                                    return (
                                                        <div
                                                            key={ing.itemId}
                                                            className="flex items-center justify-between p-2 rounded-lg bg-gray-900/60 border border-gray-800"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <img
                                                                    src={ing.imageUrl || '/Gui/Front/значек монет/Image-2.webp'}
                                                                    alt={ing.name || 'Ингредиент'}
                                                                    className="w-8 h-8 object-contain rounded"
                                                                />
                                                                <div>
                                                                    <div className="text-xs font-bold text-gray-200">{ing.name || `Предмет #${ing.itemId}`}</div>
                                                                    <div className="text-[11px] text-gray-400">Необходимо: {ing.amount} шт.</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span
                                                                    className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                                                                        hasEnough
                                                                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                                                            : 'bg-red-950/80 text-red-400 border border-red-500/40'
                                                                    }`}
                                                                >
                                                                    {available} / {ing.amount}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {maxCraftable === 0 && (
                                                <p className="text-[11px] text-amber-300/80 mt-2 flex items-center gap-1.5">
                                                    <span>💡</span>
                                                    <span>{recipe.hint || 'Куски супер ресурсов можно вырастить на грядках или произвести в мастерских.'}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Craft Controls & Quick Use */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                            {/* In Stock & Quick Use */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    В сумке: <strong className="text-white">{currentStock} шт.</strong>
                                                </span>
                                                {currentStock > 0 && isUsableInventoryItem(recipe.resultItemId) && (
                                                    <button
                                                        onClick={() => {
                                                            if (onUseItem) onUseItem(recipe.resultItemId);
                                                        }}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white transition-all transform active:scale-95 cursor-pointer shadow flex items-center gap-1"
                                                        style={{
                                                            background: recipe.resultItemId === PUMPKIN_PIE_ID
                                                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                                                : recipe.resultItemId === REINFORCING_MORTAR_ID
                                                                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                                                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            border: '1px solid rgba(255, 255, 255, 0.3)'
                                                        }}
                                                        title={`Использовать ${recipe.name}`}
                                                    >
                                                        {getItemActionLabel(recipe.resultItemId)}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Craft buttons */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (onCraftItem) onCraftItem(recipe.id, 1);
                                                    }}
                                                    disabled={maxCraftable < 1}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                                        maxCraftable >= 1
                                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg active:scale-95 border border-purple-400/50'
                                                            : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60'
                                                    }`}
                                                >
                                                    Скрафтить (1 шт.)
                                                </button>

                                                {maxCraftable >= 5 && (
                                                    <button
                                                        onClick={() => {
                                                            if (onCraftItem) onCraftItem(recipe.id, 5);
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg active:scale-95 border border-purple-400/50 cursor-pointer"
                                                    >
                                                        Скрафтить (5 шт.)
                                                    </button>
                                                )}

                                                {maxCraftable > 1 && (
                                                    <button
                                                        onClick={() => {
                                                            if (onCraftItem) onCraftItem(recipe.id, maxCraftable);
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg active:scale-95 border border-yellow-400/50 cursor-pointer"
                                                        title={`Скрафтить сразу все возможные (${maxCraftable} шт.)`}
                                                    >
                                                        Все ({maxCraftable} шт.)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quick Sell Confirmation Modal */}
                {sellingItem && (
                    <div
                        className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-30 p-4"
                        onClick={() => setSellingItem(null)}
                    >
                        <div
                            className="rounded-2xl p-5 flex flex-col gap-3 max-w-sm w-full border border-yellow-500/30 text-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(165deg, rgba(24, 30, 48, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)'
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-700/60 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-gray-800/80 p-1 border border-yellow-500/20 flex items-center justify-center">
                                        {sellingItem.imageUrl ? (
                                            <img src={sellingItem.imageUrl} alt={sellingItem.name} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <span>📦</span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm text-yellow-300">{sellingItem.name}</h4>
                                        <p className="text-[11px] text-gray-400">Быстрая продажа ресурсов</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSellingItem(null)}
                                    className="text-gray-400 hover:text-white text-lg p-1 transition-colors cursor-pointer"
                                    title="Закрыть"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Rates info banner */}
                            <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-2.5 text-xs flex items-center justify-between">
                                <span className="text-gray-300">Курс мгновенной скупки:</span>
                                <span className="font-extrabold text-yellow-300 flex items-center gap-1">
                                    <img src={coinImageUrl} className="w-3.5 h-3.5" alt="C" />
                                    {sellingItem.unitPrice.toLocaleString()} / шт.
                                </span>
                            </div>

                            {/* Amount input & controls */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Количество для продажи:</span>
                                    <span>В наличии: <strong className="text-white">{sellingItem.availableAmount.toLocaleString()}</strong></span>
                                </div>

                                {/* Amount stepper */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSellAmount(prev => Math.max(1, (Number(prev) || 1) - 1))}
                                        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-lg font-bold border border-gray-600 flex items-center justify-center transition-all cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={sellingItem.availableAmount}
                                        value={sellAmount}
                                        placeholder="1"
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === '') {
                                                setSellAmount('');
                                                return;
                                            }
                                            const val = parseInt(raw, 10);
                                            if (!isNaN(val)) {
                                                setSellAmount(Math.max(0, Math.min(sellingItem.availableAmount, val)));
                                            }
                                        }}
                                        onBlur={() => {
                                            if (sellAmount === '' || sellAmount === 0 || typeof sellAmount !== 'number') {
                                                setSellAmount(1);
                                            }
                                        }}
                                        className="flex-1 h-9 rounded-lg bg-gray-900 border border-yellow-500/40 text-center font-extrabold text-yellow-200 outline-none focus:border-yellow-400"
                                    />
                                    <button
                                        onClick={() => setSellAmount(prev => Math.min(sellingItem.availableAmount, (Number(prev) || 1) + 1))}
                                        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-lg font-bold border border-gray-600 flex items-center justify-center transition-all cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="grid grid-cols-4 gap-1.5 pt-1">
                                    {[1, 10, 100].map(cnt => (
                                        <button
                                            key={cnt}
                                            disabled={cnt > sellingItem.availableAmount}
                                            onClick={() => setSellAmount(Math.min(sellingItem.availableAmount, cnt))}
                                            className={`py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                                                cnt <= sellingItem.availableAmount
                                                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                                                    : 'bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed opacity-50'
                                            }`}
                                        >
                                            +{cnt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setSellAmount(sellingItem.availableAmount)}
                                        className="py-1 rounded-md text-xs font-bold bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-600/50 transition-all cursor-pointer"
                                    >
                                        Все ({sellingItem.availableAmount})
                                    </button>
                                </div>
                            </div>

                            {/* Total payout */}
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-300">Итого к получению:</span>
                                <span className="text-base font-extrabold text-yellow-300 flex items-center gap-1.5">
                                    <img src={coinImageUrl} className="w-4 h-4" alt="C" />
                                    +{(effectiveSellAmount * sellingItem.unitPrice).toLocaleString()}
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setSellingItem(null)}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-all cursor-pointer"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={() => {
                                        if (onQuickSellItem) {
                                            onQuickSellItem(sellingItem.id, effectiveSellAmount);
                                        }
                                        setSellingItem(null);
                                    }}
                                    className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-lg transition-all transform active:scale-95 cursor-pointer"
                                >
                                    Продать
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    if (!prevProps.isOpen && !nextProps.isOpen) return true;
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    return (
        prevProps.inventory === nextProps.inventory &&
        prevProps.itemData === nextProps.itemData &&
        prevProps.playerEnergy === nextProps.playerEnergy &&
        prevProps.maxEnergy === nextProps.maxEnergy
    );
});

InventoryModal.displayName = 'InventoryModal';
