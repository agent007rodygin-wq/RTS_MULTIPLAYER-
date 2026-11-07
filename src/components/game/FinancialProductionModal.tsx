import React, { memo, useState, useEffect, useMemo } from 'react';
import type { Building, PlacedBuilding } from '../../../types';
import { items as allItemsData } from '../../../data/items';
import {
    getFinancialCollectCooldownStatus,
    isBuildingReadyForCollection,
    isBuildingProductionIdle,
    isProductiveBuilding,
    calculateBuildingBaseGoldYield
} from '../../game/economy/productionCollectLogic';

export interface FinancialProductionModalProps {
    isOpen: boolean;
    onClose: () => void;
    placedBuildings: PlacedBuilding[];
    buildingData: Building[];
    inventory: Record<number, number>;
    maxPopulation: number;
    currentPopulation: number;
    playerGold: number;
    hasEgyptianObelisk: boolean;
    lastFinancialCollectTime: number;
    onCollectAll: () => void;
    onCollectSingle: (building: PlacedBuilding) => void;
    onStartSingle: (building: PlacedBuilding, info: Building) => void;
    onFocusBuilding?: (building: PlacedBuilding) => void;
    coinImageUrl?: string;
    playCloseSound?: () => void;
}

type TabType = 'ready' | 'idle' | 'interactive' | 'all';
type StatusFilter = 'all' | 'ready' | 'working' | 'idle';

export const FinancialProductionModal: React.FC<FinancialProductionModalProps> = memo(({
    isOpen,
    onClose,
    placedBuildings,
    buildingData,
    inventory,
    maxPopulation,
    currentPopulation,
    playerGold,
    hasEgyptianObelisk,
    lastFinancialCollectTime,
    onCollectAll,
    onCollectSingle,
    onStartSingle,
    onFocusBuilding,
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    playCloseSound
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('ready');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [, setTick] = useState(0);

    // Live 1-second interval to update remaining times and cooldowns
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Handle ESC key to close
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (playCloseSound) playCloseSound();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, playCloseSound]);

    // Map building IDs to definitions
    const buildingMap = useMemo(() => {
        const map = new Map<number, Building>();
        buildingData.forEach(b => map.set(b.id, b));
        return map;
    }, [buildingData]);

    // Map item IDs to definitions for image and name resolution
    const itemMap = useMemo(() => {
        const map = new Map<number, (typeof allItemsData)[0]>();
        allItemsData.forEach(item => map.set(item.id, item));
        return map;
    }, []);

    const now = Date.now();
    const freePopulation = Math.max(0, maxPopulation - currentPopulation);

    // Cooldown status for Financial Intelligence 1-click collection
    const cooldownStatus = getFinancialCollectCooldownStatus(lastFinancialCollectTime, hasEgyptianObelisk, now);

    const cooldownMinutes = Math.floor(cooldownStatus.remainingMs / 60000);
    const cooldownSeconds = Math.floor((cooldownStatus.remainingMs % 60000) / 1000);
    const cooldownFormatted = `${cooldownMinutes}:${cooldownSeconds.toString().padStart(2, '0')}`;

    // Filter productive buildings belonging to the user
    const productiveBuildings = useMemo(() => {
        return placedBuildings.filter(b => {
            const info = buildingMap.get(Number(b.buildingId));
            return isProductiveBuilding(info) && !b.isConstructing;
        });
    }, [placedBuildings, buildingMap]);

    // Categorized lists
    const readyBuildings = useMemo(() => {
        return productiveBuildings.filter(b => isBuildingReadyForCollection(b, now));
    }, [productiveBuildings, now]);

    const idleBuildings = useMemo(() => {
        return productiveBuildings.filter(b => {
            const info = buildingMap.get(Number(b.buildingId));
            return isBuildingProductionIdle(b, info);
        });
    }, [productiveBuildings, buildingMap]);

    const interactiveBuildings = useMemo(() => {
        return productiveBuildings.filter(b => {
            const info = buildingMap.get(Number(b.buildingId));
            return Boolean(info?.stats?.consumes && info.stats.consumes.length > 0);
        });
    }, [productiveBuildings, buildingMap]);

    // Total estimated ready gold
    const totalReadyGold = useMemo(() => {
        return readyBuildings.reduce((sum, b) => {
            const info = buildingMap.get(Number(b.buildingId));
            return sum + calculateBuildingBaseGoldYield(Number(b.buildingId), info);
        }, 0);
    }, [readyBuildings, buildingMap]);

    // Count of ready resource drops
    const totalReadyItemsCount = useMemo(() => {
        return readyBuildings.reduce((sum, b) => {
            const info = buildingMap.get(Number(b.buildingId));
            const producesCount = info?.stats?.produces?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0;
            return sum + producesCount;
        }, 0);
    }, [readyBuildings, buildingMap]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (playCloseSound) playCloseSound();
        onClose();
    };

    const handleFocus = (building: PlacedBuilding) => {
        if (onFocusBuilding) {
            onFocusBuilding(building);
        }
        handleClose();
    };

    // Filtered list for "All" tab
    const filteredAllBuildings = productiveBuildings.filter(b => {
        const info = buildingMap.get(Number(b.buildingId));
        const name = (info?.name || '').toLowerCase();
        if (searchQuery && !name.includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (statusFilter === 'ready') return isBuildingReadyForCollection(b, now);
        if (statusFilter === 'idle') return isBuildingProductionIdle(b, info);
        if (statusFilter === 'working') {
            return b.workState === 'working' && Boolean(b.workEndTime && now < b.workEndTime);
        }
        return true;
    });

    const canCollectAll = readyBuildings.length > 0 && cooldownStatus.isReady;

    return (
        <div
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-md p-2 sm:p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-gradient-to-b from-gray-900 via-slate-950 to-black border-2 border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-white animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-gray-900 to-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
                            🏭
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400">
                                    Управление производствами
                                </h2>
                                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                                    Финансовая разведка
                                </span>
                            </div>
                            <p className="text-xs text-amber-300/80">
                                Единый диспетчерский пункт: сбор доходов, распределение рабочих и поставка сырья
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-rose-600/80 border border-white/10 hover:border-rose-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                        title="Закрыть (Esc)"
                    >
                        ✕
                    </button>
                </div>

                {/* Obelisk & Cooldown Status Banner */}
                <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 px-4 sm:px-6 py-2.5 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        {hasEgyptianObelisk ? (
                            <div className="flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-bold shadow-sm">
                                <span className="text-base">✨</span>
                                <span>Египетский обелиск: Экспресс-сбор без кулдауна (0 сек)</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300">Перезарядка сбора (30 мин):</span>
                                {cooldownStatus.isReady ? (
                                    <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/40">
                                        ✅ Готово к сбору
                                    </span>
                                ) : (
                                    <span className="font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30">
                                        ⏳ {cooldownFormatted}
                                    </span>
                                )}
                                <span className="text-[11px] text-gray-400 hidden sm:inline">
                                    (Египетский обелиск снимает ожидание)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">Свободно рабочих:</span>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded border ${freePopulation > 0 ? 'bg-sky-950/60 text-sky-300 border-sky-500/40' : 'bg-rose-950/60 text-rose-300 border-rose-500/40'}`}>
                            👥 {freePopulation} / {maxPopulation}
                        </span>
                    </div>
                </div>

                {/* Master 1-Click Collect Action Banner */}
                <div className="bg-gradient-to-r from-amber-950/30 via-yellow-950/20 to-amber-950/30 px-4 sm:px-6 py-3 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">💰</div>
                        <div>
                            <div className="text-xs text-gray-300">
                                Готово к сбору на базе:{' '}
                                <span className="font-bold text-white">{readyBuildings.length} производств</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-extrabold text-yellow-300">
                                <span>+{totalReadyGold.toLocaleString()}</span>
                                <img src={coinImageUrl} className="w-4 h-4 object-contain inline" alt="coin" />
                                {totalReadyItemsCount > 0 && (
                                    <span className="text-xs text-amber-200 font-medium">
                                        + {totalReadyItemsCount} ресурсов
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onCollectAll}
                        disabled={!canCollectAll}
                        className={`py-2 px-5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                            canCollectAll
                                ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black shadow-amber-500/20 border border-yellow-300'
                                : 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed opacity-70'
                        }`}
                        title={
                            readyBuildings.length === 0
                                ? 'Нет готовых доходов'
                                : !cooldownStatus.isReady
                                ? `Перезарядка сбора: еще ${cooldownFormatted}`
                                : 'Собрать весь готовый доход и урожай базы в 1 клик'
                        }
                    >
                        <span>⚡</span>
                        <span>
                            {readyBuildings.length === 0
                                ? 'Нет готовых доходов'
                                : !cooldownStatus.isReady
                                ? `Сбор через ${cooldownFormatted}`
                                : `Собрать весь готовый доход (${readyBuildings.length})`}
                        </span>
                    </button>
                </div>

                {/* Tabs Switcher */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 sm:p-3 bg-gray-950/70 border-b border-gray-800 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ready')}
                        className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'ready'
                                ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow'
                                : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>🌾 Готовы к сбору</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'ready' ? 'bg-black/30 text-black' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                            {readyBuildings.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('idle')}
                        className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'idle'
                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow'
                                : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>👥 Требуют рабочих</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'idle' ? 'bg-black/30 text-white' : 'bg-sky-500/20 text-sky-400'
                        }`}>
                            {idleBuildings.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('interactive')}
                        className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'interactive'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow'
                                : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>📦 Сырьё и интерактив</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'interactive' ? 'bg-black/30 text-white' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                            {interactiveBuildings.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'all'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow'
                                : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                    >
                        <span>📋 Все производства</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                            activeTab === 'all' ? 'bg-black/30 text-white' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                            {productiveBuildings.length}
                        </span>
                    </button>
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 custom-scrollbar">
                    {/* TAB 1: READY TO COLLECT */}
                    {activeTab === 'ready' && (
                        <div>
                            {readyBuildings.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <div className="text-base font-bold text-gray-200">Все готовые доходы уже собраны!</div>
                                    <div className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                                        Ваши предприятия и грядки работают или ожидают рабочих. Проверьте вкладки «Требуют рабочих» и «Сырьё».
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {readyBuildings.map(b => {
                                        const info = buildingMap.get(Number(b.buildingId));
                                        if (!info) return null;
                                        const goldYield = calculateBuildingBaseGoldYield(Number(b.buildingId), info);

                                        return (
                                            <div
                                                key={b.id}
                                                className="bg-gray-900/90 border border-yellow-500/30 hover:border-yellow-500/60 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {info.imageUrl ? (
                                                            <img
                                                                src={info.imageUrl}
                                                                alt={info.name}
                                                                className="w-full h-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <span className="text-xl">🌾</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-yellow-200 truncate">
                                                            {info.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                                            <span>Сектор: {Math.floor(b.x / 64)}, {Math.floor(b.y / 64)}</span>
                                                            <span>•</span>
                                                            <span>(x: {b.x}, y: {b.y})</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {goldYield > 0 && (
                                                                <span className="text-xs font-extrabold text-yellow-300 flex items-center gap-0.5">
                                                                    <span>+{goldYield}</span>
                                                                    <img src={coinImageUrl} className="w-3.5 h-3.5 object-contain" alt="coin" />
                                                                </span>
                                                            )}
                                                            {info.stats.produces?.map(p => (
                                                                <span
                                                                    key={p.id}
                                                                    className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30"
                                                                >
                                                                    +{p.amount} {p.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                                    <button
                                                        onClick={() => onCollectSingle(b)}
                                                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs py-1.5 px-3 rounded-lg shadow transition-all transform active:scale-95"
                                                    >
                                                        Собрать
                                                    </button>
                                                    {onFocusBuilding && (
                                                        <button
                                                            onClick={() => handleFocus(b)}
                                                            className="text-[11px] text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 py-1 px-2 rounded text-center transition-colors"
                                                            title="Перейти к зданию на карте"
                                                        >
                                                            📍 Показать
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: IDLE REQUIRING WORKERS */}
                    {activeTab === 'idle' && (
                        <div>
                            {idleBuildings.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <div className="text-4xl mb-2">🏭</div>
                                    <div className="text-base font-bold text-gray-200">Все предприятия укомплектованы!</div>
                                    <div className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                                        Нет простаивающих производств. Все здания работают на полную мощность.
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {idleBuildings.map(b => {
                                        const info = buildingMap.get(Number(b.buildingId));
                                        if (!info) return null;

                                        const popCost = info.stats.takesPopulation || 0;
                                        const hasEnoughPop = freePopulation >= popCost;
                                        const workSeconds = info.stats.workTimeSeconds || 0;
                                        const minutes = Math.floor(workSeconds / 60);
                                        const seconds = workSeconds % 60;
                                        const durationStr = minutes > 0 ? `${minutes}м ${seconds}с` : `${seconds}с`;

                                        return (
                                            <div
                                                key={b.id}
                                                className="bg-gray-900/90 border border-sky-500/30 hover:border-sky-500/60 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {info.imageUrl ? (
                                                            <img
                                                                src={info.imageUrl}
                                                                alt={info.name}
                                                                className="w-full h-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <span className="text-xl">⚙️</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-sky-200 truncate">
                                                            {info.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                                            <span>👥 {popCost} рабочих</span>
                                                            <span>•</span>
                                                            <span>⏱️ {durationStr}</span>
                                                        </div>
                                                        {info.stats.consumes && info.stats.consumes.length > 0 && (
                                                            <div className="text-[10px] text-amber-300 mt-0.5 truncate">
                                                                Требует: {info.stats.consumes.map(c => `${c.name} x${c.amount}`).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                                    <button
                                                        onClick={() => onStartSingle(b, info)}
                                                        disabled={!hasEnoughPop}
                                                        className={`text-xs font-bold py-1.5 px-3 rounded-lg shadow transition-all transform active:scale-95 ${
                                                            hasEnoughPop
                                                                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white'
                                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                                        }`}
                                                        title={hasEnoughPop ? 'Направить рабочих и запустить' : `Не хватает ${popCost - freePopulation} рабочих`}
                                                    >
                                                        {hasEnoughPop ? 'Направить' : 'Мало людей'}
                                                    </button>
                                                    {onFocusBuilding && (
                                                        <button
                                                            onClick={() => handleFocus(b)}
                                                            className="text-[11px] text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 py-1 px-2 rounded text-center transition-colors"
                                                        >
                                                            📍 Показать
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: CONSUMES RAW INGREDIENTS */}
                    {activeTab === 'interactive' && (
                        <div>
                            {interactiveBuildings.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <div className="text-4xl mb-2">📦</div>
                                    <div className="text-base font-bold text-gray-200">Нет зданий, требующих сырья</div>
                                    <div className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                                        Здесь отображаются предприятия с особым рецептом (например, требующие канистру с бензином, пшеницу или древесину).
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {interactiveBuildings.map(b => {
                                        const info = buildingMap.get(Number(b.buildingId));
                                        if (!info) return null;

                                        const isReady = isBuildingReadyForCollection(b, now);
                                        const isWorking = b.workState === 'working' && Boolean(b.workEndTime && now < b.workEndTime);
                                        const isIdle = isBuildingProductionIdle(b, info);

                                        // Remaining time if working
                                        const remainingMs = Math.max(0, (b.workEndTime || 0) - now);
                                        const remMinutes = Math.floor(remainingMs / 60000);
                                        const remSeconds = Math.floor((remainingMs % 60000) / 1000);
                                        const remFormatted = `${remMinutes}:${remSeconds.toString().padStart(2, '0')}`;

                                        // Ingredients check
                                        const consumes = info.stats.consumes || [];
                                        let hasAllIngredients = true;
                                        const missingIngredients: string[] = [];

                                        consumes.forEach(c => {
                                            const available = inventory[c.id] || 0;
                                            const required = c.amount || 1;
                                            if (available < required) {
                                                hasAllIngredients = false;
                                                missingIngredients.push(`${c.name} (${available}/${required})`);
                                            }
                                        });

                                        const popCost = info.stats.takesPopulation || 0;
                                        const hasEnoughPop = freePopulation >= popCost;
                                        const canStart = isIdle && hasAllIngredients && hasEnoughPop;

                                        return (
                                            <div
                                                key={b.id}
                                                className="bg-gray-900/90 border border-purple-500/30 hover:border-purple-500/60 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {info.imageUrl ? (
                                                                <img
                                                                    src={info.imageUrl}
                                                                    alt={info.name}
                                                                    className="w-full h-full object-contain p-1"
                                                                />
                                                            ) : (
                                                                <span className="text-xl">⚗️</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-sm text-purple-200 truncate">
                                                                {info.name}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400">
                                                                (X: {b.x}, Y: {b.y}) • Рабочих: {popCost}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right flex-shrink-0">
                                                        {isReady ? (
                                                            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                                                Готово к сбору
                                                            </span>
                                                        ) : isWorking ? (
                                                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                                                В работе ({remFormatted})
                                                            </span>
                                                        ) : (
                                                            <span className="bg-gray-800 text-gray-400 border border-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                Простой
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Consumed items ingredients list */}
                                                <div className="bg-black/40 p-2 rounded-lg border border-white/5 space-y-1">
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        Требуемое сырьё:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {consumes.map(c => {
                                                            const available = inventory[c.id] || 0;
                                                            const required = c.amount || 1;
                                                            const isEnough = available >= required;
                                                            const itemDef = itemMap.get(c.id);

                                                            return (
                                                                <div
                                                                    key={c.id}
                                                                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border ${
                                                                        isEnough
                                                                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                                                            : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                                                                    }`}
                                                                >
                                                                    {itemDef?.imageUrl && (
                                                                        <img
                                                                            src={itemDef.imageUrl}
                                                                            className="w-3.5 h-3.5 object-contain"
                                                                            alt={c.name}
                                                                        />
                                                                    )}
                                                                    <span>{c.name}:</span>
                                                                    <span className="font-mono font-bold">
                                                                        {available}/{required}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                                                    {onFocusBuilding && (
                                                        <button
                                                            onClick={() => handleFocus(b)}
                                                            className="text-[11px] text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 py-1 px-2.5 rounded transition-colors"
                                                        >
                                                            📍 Показать на карте
                                                        </button>
                                                    )}

                                                    {isReady ? (
                                                        <button
                                                            onClick={() => onCollectSingle(b)}
                                                            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs py-1.5 px-3 rounded-lg shadow transition-all ml-auto"
                                                        >
                                                            Собрать
                                                        </button>
                                                    ) : isWorking ? (
                                                        <span className="text-xs text-amber-300 font-mono ml-auto">
                                                            ⏱️ Завершится через {remFormatted}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => onStartSingle(b, info)}
                                                            disabled={!canStart}
                                                            className={`text-xs font-bold py-1.5 px-3 rounded-lg shadow transition-all ml-auto ${
                                                                canStart
                                                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                                            }`}
                                                            title={
                                                                !hasAllIngredients
                                                                    ? `Не хватает: ${missingIngredients.join(', ')}`
                                                                    : !hasEnoughPop
                                                                    ? 'Недостаточно свободных рабочих'
                                                                    : 'Загрузить сырьё и запустить производство'
                                                            }
                                                        >
                                                            {!hasAllIngredients
                                                                ? 'Нет сырья'
                                                                : !hasEnoughPop
                                                                ? 'Мало людей'
                                                                : 'Загрузить и запустить'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 4: ALL PRODUCTIONS MASTER LIST */}
                    {activeTab === 'all' && (
                        <div className="space-y-3">
                            {/* Search & filter toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-900/60 p-2 rounded-xl border border-white/5 text-xs">
                                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                                    <span className="text-gray-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Поиск по названию здания..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500"
                                    />
                                </div>

                                <div className="flex items-center gap-1">
                                    {(['all', 'ready', 'working', 'idle'] as StatusFilter[]).map(st => (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => setStatusFilter(st)}
                                            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                                                statusFilter === st
                                                    ? 'bg-amber-500 text-black'
                                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {st === 'all' && 'Все'}
                                            {st === 'ready' && 'Готовы'}
                                            {st === 'working' && 'В работе'}
                                            {st === 'idle' && 'Простой'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {filteredAllBuildings.length === 0 ? (
                                <div className="text-center py-10 px-4 text-gray-400 text-xs">
                                    Ничего не найдено по заданным параметрам.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {filteredAllBuildings.map(b => {
                                        const info = buildingMap.get(Number(b.buildingId));
                                        if (!info) return null;

                                        const isReady = isBuildingReadyForCollection(b, now);
                                        const isWorking = b.workState === 'working' && Boolean(b.workEndTime && now < b.workEndTime);
                                        const isIdle = isBuildingProductionIdle(b, info);

                                        const remainingMs = Math.max(0, (b.workEndTime || 0) - now);
                                        const remMinutes = Math.floor(remainingMs / 60000);
                                        const remSeconds = Math.floor((remainingMs % 60000) / 1000);
                                        const remFormatted = `${remMinutes}:${remSeconds.toString().padStart(2, '0')}`;

                                        const popCost = info.stats.takesPopulation || 0;
                                        const hasEnoughPop = freePopulation >= popCost;

                                        return (
                                            <div
                                                key={b.id}
                                                className="bg-gray-900/90 border border-gray-800 hover:border-gray-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {info.imageUrl ? (
                                                            <img
                                                                src={info.imageUrl}
                                                                alt={info.name}
                                                                className="w-full h-full object-contain p-1"
                                                            />
                                                        ) : (
                                                            <span className="text-xl">🏭</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-gray-200 truncate">
                                                            {info.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400">
                                                            (X: {b.x}, Y: {b.y}) • Сектор: {Math.floor(b.x / 64)}, {Math.floor(b.y / 64)}
                                                        </div>
                                                        <div className="mt-1">
                                                            {isReady ? (
                                                                <span className="text-[10px] font-extrabold text-yellow-300 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/40">
                                                                    Готово к сбору
                                                                </span>
                                                            ) : isWorking ? (
                                                                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                                                    В работе ({remFormatted})
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                                                                    Простаивает
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                                    {isReady ? (
                                                        <button
                                                            onClick={() => onCollectSingle(b)}
                                                            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs py-1.5 px-3 rounded-lg shadow transition-all"
                                                        >
                                                            Собрать
                                                        </button>
                                                    ) : isIdle ? (
                                                        <button
                                                            onClick={() => onStartSingle(b, info)}
                                                            disabled={!hasEnoughPop}
                                                            className={`text-xs font-bold py-1.5 px-3 rounded-lg shadow transition-all ${
                                                                hasEnoughPop
                                                                    ? 'bg-sky-600 hover:bg-sky-500 text-white'
                                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            Запустить
                                                        </button>
                                                    ) : null}

                                                    {onFocusBuilding && (
                                                        <button
                                                            onClick={() => handleFocus(b)}
                                                            className="text-[11px] text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700 py-1 px-2 rounded text-center transition-colors"
                                                        >
                                                            📍 Показать
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer notes */}
                <div className="px-4 sm:px-6 py-2.5 bg-gray-950 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                        <span>💡</span>
                        <span>
                            Сбор в 1 клик охватывает все созревшие культуры и готовую продукцию по всей вашей территории.
                        </span>
                    </div>
                    {hasEgyptianObelisk ? (
                        <span className="text-emerald-400 font-bold">
                            ✨ Эффект обелиска активен: кулдаун отсутствует
                        </span>
                    ) : (
                        <span className="text-amber-400 font-bold">
                            Кулдаун экспресс-сбора: 30 минут
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});
