import React, { memo, useState, useMemo } from 'react';
import { CloseIcon } from '../../../components/IconComponents';
import type { Building, Item } from '../../../types';
import {
    calculateMissingResources,
    calculateTotalRubiesNeeded,
    calculateResourceRubyCost,
    MissingResource
} from '../../game/economy/blackMarketLogic';

export interface BlackMarketMissingModalProps {
    isOpen: boolean;
    onClose: () => void;
    building: Building | null;
    inventory: Record<string | number, number>;
    itemData: Item[];
    playerRubies: number;
    rubyImageUrl?: string;
    onBuyResource: (itemId: number, count: number, rubiesCost: number) => void;
    onBuyAllMissing: (missingList: MissingResource[], totalRubies: number) => void;
    onReadyToBuild?: () => void;
    playCloseSound?: () => void;
}

export const BlackMarketMissingModal: React.FC<BlackMarketMissingModalProps> = memo(({
    isOpen,
    onClose,
    building,
    inventory,
    itemData,
    playerRubies,
    rubyImageUrl = '/Gui/Front/значек рубинов/Nj7hb.webp',
    onBuyResource,
    onBuyAllMissing,
    onReadyToBuild,
    playCloseSound
}) => {
    // Single item buy dialog state
    const [selectedResource, setSelectedResource] = useState<MissingResource | null>(null);
    const [buyAmount, setBuyAmount] = useState<number>(1);

    const missingResources = useMemo(() => {
        if (!isOpen || !building) return [];
        return calculateMissingResources(building.constructionRequirements.resources, inventory, itemData);
    }, [isOpen, building, inventory, itemData]);

    const totalRubiesNeeded = useMemo(() => {
        return calculateTotalRubiesNeeded(missingResources);
    }, [missingResources]);

    if (!isOpen || !building) return null;

    const handleClose = () => {
        setSelectedResource(null);
        if (playCloseSound) playCloseSound();
        onClose();
    };

    const handleOpenSingleBuy = (resource: MissingResource) => {
        setSelectedResource(resource);
        // Automatically prefill the exact missing amount
        setBuyAmount(resource.missing);
    };

    const currentSingleCost = selectedResource
        ? calculateResourceRubyCost(buyAmount, selectedResource.rubyPackQuantity)
        : { rubies: 0, itemsReceived: 0 };

    const allFulfilled = missingResources.length === 0;

    return (
        <div
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-[70] backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="relative flex flex-col w-full max-w-lg rounded-2xl border-2 border-purple-500/50 bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/30 bg-purple-950/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
                            🏴‍☠️
                        </div>
                        <div>
                            <h3 className="font-black text-lg building-title-shimmer">
                                Черный рынок ресурсов
                            </h3>
                            <p className="text-xs text-purple-300/80">
                                Покупка недостающих ресурсов для «<span className="building-title-shimmer font-bold">{building.name}</span>»
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                        title="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                {/* Rubies Balance Bar */}
                <div className="bg-black/50 px-5 py-2.5 border-b border-purple-500/20 flex items-center justify-between text-xs">
                    <span className="text-purple-300/80 font-semibold">Ваш баланс:</span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-pink-300">
                        <img src={rubyImageUrl} alt="Рубины" className="w-4 h-4 object-contain" />
                        <span>{playerRubies.toLocaleString()} 💎</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {allFulfilled ? (
                        /* All resources ready state */
                        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
                            <span className="text-5xl">🎉</span>
                            <h4 className="text-lg font-extrabold text-emerald-400">Все ресурсы собраны!</h4>
                            <p className="text-xs text-gray-300 max-w-xs">
                                В вашем инвентаре теперь есть все необходимые материалы для постройки здания «{building.name}».
                            </p>
                            {onReadyToBuild && (
                                <button
                                    onClick={() => {
                                        handleClose();
                                        onReadyToBuild();
                                    }}
                                    className="mt-3 px-6 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg active:scale-95 transition-all cursor-pointer"
                                >
                                    🔨 Построить сейчас
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Shortage announcement */}
                            <div className="rounded-xl p-3 bg-red-950/30 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <p className="font-bold">Недостаточно ресурсов для строительства!</p>
                                    <p className="text-red-300/80 mt-0.5">
                                        Вы можете докупить недостающие материалы по отдельности или всё сразу за рубины, либо добыть их самостоятельно.
                                    </p>
                                </div>
                            </div>

                            {/* Missing Resources List */}
                            <div className="flex flex-col gap-2.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Не хватает материалов ({missingResources.length}):
                                </span>

                                {missingResources.map(res => (
                                    <div
                                        key={res.id}
                                        className="rounded-xl p-3 bg-gray-900/70 border border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-yellow-500/30 transition-all"
                                    >
                                        {/* Resource info */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-lg bg-gray-800 p-1 border border-white/5 flex items-center justify-center flex-shrink-0">
                                                <img src={res.imageUrl} alt={res.name} className="max-w-full max-h-full object-contain" />
                                            </div>
                                            <div>
                                                <h5 className="font-extrabold text-sm text-gray-200">{res.name}</h5>
                                                <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                                                    <span>В наличии: {res.available} / {res.required}</span>
                                                    <span className="text-red-400 font-extrabold bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500/40">
                                                        Не хватает: {res.missing} шт.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action: Buy on Black Market */}
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button
                                                onClick={() => handleOpenSingleBuy(res)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                                                title={`Купить ${res.name} на черном рынке`}
                                            >
                                                <span>Купить на черном рынке</span>
                                                <span className="px-1.5 py-0.5 rounded bg-black/30 text-yellow-200 font-extrabold text-[11px] flex items-center gap-1">
                                                    <img src={rubyImageUrl} alt="Рубины" className="w-3 h-3 object-contain" />
                                                    {res.rubiesNeeded}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Controls */}
                {!allFulfilled && (
                    <div className="p-4 border-t border-gray-700/60 bg-gray-900/60 flex flex-col gap-2">
                        {/* Auto Buy All Button */}
                        <button
                            onClick={() => onBuyAllMissing(missingResources, totalRubiesNeeded)}
                            className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:via-pink-500 hover:to-amber-500 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-pink-400/40"
                        >
                            <span>⚡ Купить всё автоматом за рубины</span>
                            <span className="px-2 py-0.5 rounded-lg bg-black/40 text-yellow-200 font-extrabold flex items-center gap-1">
                                <img src={rubyImageUrl} alt="R" className="w-4 h-4 object-contain" />
                                {totalRubiesNeeded.toLocaleString()}
                            </span>
                        </button>

                        {/* Farm manually / Close button */}
                        <button
                            onClick={handleClose}
                            className="w-full py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-200 bg-gray-800/80 hover:bg-gray-800 transition-all cursor-pointer border border-gray-700"
                        >
                            🌾 Закрыть (дофармить ресурсы самостоятельно)
                        </button>
                    </div>
                )}

                {/* Single Item Quick Buy Modal Dialog */}
                {selectedResource && (
                    <div
                        className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-40 p-4 animate-fade-in"
                        onClick={() => setSelectedResource(null)}
                    >
                        <div
                            className="w-full max-w-sm rounded-2xl p-5 border-2 border-purple-500/50 bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white shadow-[0_0_40px_rgba(168,85,247,0.3)] flex flex-col gap-3 animate-scale-up"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 p-1 border border-purple-500/30 flex items-center justify-center">
                                        <img src={selectedResource.imageUrl} alt={selectedResource.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm text-purple-200">{selectedResource.name}</h4>
                                        <p className="text-[11px] text-purple-300/70">Покупка на черном рынке</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                                    title="Закрыть"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Shortage indicator */}
                            <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-2.5 text-xs flex items-center justify-between">
                                <span className="text-purple-300/80">Не хватает для постройки:</span>
                                <span className="font-extrabold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                                    {selectedResource.missing} шт.
                                </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Количество для покупки:</span>
                                    <span>Пакет: 1 💎 = {selectedResource.rubyPackQuantity} шт.</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setBuyAmount(prev => Math.max(1, prev - 1))}
                                        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-lg font-bold border border-gray-600 flex items-center justify-center transition-all cursor-pointer"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={buyAmount}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setBuyAmount(Math.max(1, val));
                                        }}
                                        className="flex-1 h-9 rounded-lg bg-gray-900 border border-yellow-500/40 text-center font-extrabold text-yellow-200 outline-none focus:border-yellow-400 text-sm"
                                    />
                                    <button
                                        onClick={() => setBuyAmount(prev => prev + 1)}
                                        className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 text-lg font-bold border border-gray-600 flex items-center justify-center transition-all cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="grid grid-cols-4 gap-1.5 pt-1">
                                    {[1, 10, 50].map(cnt => (
                                        <button
                                            key={cnt}
                                            onClick={() => setBuyAmount(cnt)}
                                            className="py-1 rounded-md text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all cursor-pointer"
                                        >
                                            {cnt} шт.
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setBuyAmount(selectedResource.missing)}
                                        className="py-1 rounded-md text-xs font-bold bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-600/50 transition-all cursor-pointer"
                                        title="Установить ровно недостающее количество"
                                    >
                                        Все ({selectedResource.missing})
                                    </button>
                                </div>
                            </div>

                            {/* Total price & Receive preview */}
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex flex-col gap-1 mt-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Стоимость покупки:</span>
                                    <span className="text-base font-extrabold text-pink-300 flex items-center gap-1">
                                        <img src={rubyImageUrl} alt="R" className="w-4 h-4 object-contain" />
                                        {currentSingleCost.rubies} 💎
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-gray-400 text-[11px]">
                                    <span>Будет зачислено в инвентарь:</span>
                                    <span className="text-emerald-400 font-bold">+{currentSingleCost.itemsReceived} шт.</span>
                                </div>
                            </div>

                            {/* Dialog Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-all cursor-pointer"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={() => {
                                        onBuyResource(selectedResource.id, currentSingleCost.itemsReceived, currentSingleCost.rubies);
                                        setSelectedResource(null);
                                    }}
                                    className="flex-1 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                >
                                    Купить ({currentSingleCost.rubies} 💎)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

BlackMarketMissingModal.displayName = 'BlackMarketMissingModal';
