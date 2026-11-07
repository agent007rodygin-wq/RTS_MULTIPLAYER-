import React, { memo, useMemo } from 'react';
import { CloseIcon } from '../../../components/IconComponents';
import type { Building } from '../../../types';
import { BuildingType } from '../../../types';

export interface BuildConfirmationModalProps {
    isOpen: boolean;
    building: Building | null;
    coords: { x: number; y: number };
    onClose: () => void;
    onBackToMenu: () => void;
    onConfirmBuild: (traceId: string) => void;
    onOpenBlackMarket?: () => void;
    isBuildingActionProcessing: boolean;
    inventory: Record<string | number, number>;
    rubyImageUrl: string;
    coinImageUrl: string;
    populationImageUrl: string;
    recordRuntimeTraceStage?: (category: string, traceId: string, event: string, data?: any) => void;
    getCanonicalItemName: (id: string | number, fallbackName?: string, buildingId?: string | number) => string;
    isTutorialFree?: boolean;
}

const formatBuildDuration = (seconds?: number) => {
    const totalSeconds = Math.max(0, Math.floor(seconds || 0));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    if (minutes <= 0) return `${remainingSeconds}с`;
    if (remainingSeconds === 0) return `${minutes}м`;
    return `${minutes}м ${remainingSeconds}с`;
};

const BuildConfirmationModalComponent: React.FC<BuildConfirmationModalProps> = ({
    isOpen,
    building,
    coords,
    onClose,
    onBackToMenu,
    onConfirmBuild,
    onOpenBlackMarket,
    isBuildingActionProcessing,
    inventory,
    rubyImageUrl,
    coinImageUrl,
    populationImageUrl,
    recordRuntimeTraceStage,
    getCanonicalItemName,
    isTutorialFree = false
}) => {
    const missingResources = useMemo(() => {
        if (!building?.constructionRequirements?.resources) return [];
        return building.constructionRequirements.resources.filter(req => (Number(inventory[req.id]) || 0) < (req.amount || 0));
    }, [building, inventory]);
    const hasMissingResources = missingResources.length > 0;

    if (!isOpen || !building) return null;

    const handleConfirm = () => {
        if (!building) return;
        const traceId = `build-${Date.now()}-${building.id}-${coords.x}-${coords.y}`;
        recordRuntimeTraceStage?.('build', traceId, 'click', {
            buildingId: building.id,
            x: coords.x,
            y: coords.y,
        });
        onConfirmBuild(traceId);
    };

    return (
        <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in"
            onClick={() => {
                if (isBuildingActionProcessing) return;
                onClose();
            }}
        >
            <div
                className="w-full max-w-sm max-h-[calc(100vh-20px)] bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏗️</span>
                        <h2 className="text-lg font-black building-title-shimmer">
                            {building.name}
                        </h2>
                    </div>
                    <button
                        onClick={() => {
                            if (isBuildingActionProcessing) return;
                            onClose();
                        }}
                        disabled={isBuildingActionProcessing}
                        className={`w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 ${isBuildingActionProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        ✕
                    </button>
                </div>
                <div className="p-3 sm:p-5 overflow-y-auto flex-1 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="w-full h-40 bg-black/50 border border-purple-500/30 rounded-xl mb-4 flex items-center justify-center p-3 shadow-inner">
                        <img src={building.imageUrl} alt={building.name} className="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
                    </div>
                    {building.type === BuildingType.Storage && (
                        <p className="text-xs text-purple-200/80 leading-5 mb-4 bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/20">
                            Хранилище нужно, чтобы хранить накопленные монеты. Чем больше у вас монет, тем больше нужно хранилищ. При взрыве часть монет перейдет к нападающему.
                        </p>
                    )}
                    <div className="bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 shadow-md space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-purple-300/80 font-medium">Прочность:</span>
                            <span className="text-white font-bold">{building.stats.durability}</span>
                        </div>
                        {building.stats.damage && (
                            <div className="flex justify-between items-center">
                                <span className="text-purple-300/80 font-medium">Урон:</span>
                                <span className="text-red-400 font-bold">{building.stats.damage}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-purple-300/80 font-medium">Время строительства:</span>
                            <span className="text-white font-bold">{isTutorialFree ? '0с (Мгновенно)' : formatBuildDuration(building.stats.constructionTimeSeconds)}</span>
                        </div>
                        {building.stats.increasesGoldCapacity && (
                            <div className="flex justify-between items-center">
                                <span className="text-purple-300/80 font-medium">Вместимость золота:</span>
                                <span className="text-yellow-300 font-bold flex items-center gap-1">
                                    <img src={coinImageUrl} alt="Gold" className="w-3.5 h-3.5 object-contain" />
                                    +{building.stats.increasesGoldCapacity.toLocaleString()}
                                </span>
                            </div>
                        )}
                        {building.stats.populationBonus ? (
                            <div className="flex justify-between items-center">
                                <span className="text-purple-300/80 font-medium">Дает населения:</span>
                                <span className="text-emerald-400 font-bold">+{building.stats.populationBonus}</span>
                            </div>
                        ) : null}
                        {building.constructionRequirements.resources && building.constructionRequirements.resources.length > 0 && (
                            <div className="mt-2.5 pt-2.5 border-t border-purple-500/20">
                                <div className="text-purple-300/90 mb-1.5 flex items-center justify-between text-[11px] font-semibold">
                                    <span>Требуемые ресурсы:</span>
                                    {hasMissingResources && onOpenBlackMarket && (
                                        <button
                                            type="button"
                                            onClick={onOpenBlackMarket}
                                            className="text-[11px] text-yellow-400 hover:text-yellow-300 font-bold underline cursor-pointer"
                                        >
                                            🏴‍☠️ Черный рынок
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {building.constructionRequirements.resources.map(req => {
                                        const have = Number(inventory[req.id]) || 0;
                                        const need = req.amount || 0;
                                        const missing = Math.max(0, need - have);
                                        const hasEnough = have >= need;

                                        return (
                                            <span
                                                key={req.id}
                                                onClick={() => {
                                                    if (!hasEnough && onOpenBlackMarket) {
                                                        onOpenBlackMarket();
                                                    }
                                                }}
                                                className={`px-2 py-1 rounded-lg text-[11px] flex flex-wrap items-center gap-1 transition-all ${
                                                    hasEnough
                                                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-red-950/60 text-red-200 border border-red-500/50 hover:bg-red-900/70 cursor-pointer shadow-sm'
                                                }`}
                                                title={!hasEnough ? 'Нажмите, чтобы докупить на черном рынке' : undefined}
                                            >
                                                <span>{getCanonicalItemName(req.id, req.name, building.id)}:</span>
                                                <strong className={hasEnough ? 'text-emerald-300' : 'text-red-300'}>{have}/{need}</strong>
                                                {!hasEnough && (
                                                    <span className="text-[10px] text-amber-300 font-extrabold bg-red-950/90 px-1 py-0.2 rounded border border-red-500/40">
                                                        (-{missing})
                                                    </span>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Button to Black Market if missing resources */}
                    {hasMissingResources && onOpenBlackMarket && (
                        <button
                            type="button"
                            onClick={onOpenBlackMarket}
                            className="mt-3 w-full py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-black shadow-lg shadow-amber-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-400/50"
                        >
                            <span>🏴‍☠️</span>
                            <span>Купить ресурсы на черном рынке</span>
                        </button>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={isBuildingActionProcessing}
                        className={`mt-4 w-full text-white font-black py-3 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg text-sm border ${
                            isBuildingActionProcessing
                                ? 'bg-gray-800 border-transparent text-gray-500 cursor-not-allowed opacity-70'
                                : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50 border-emerald-400/30'
                        }`}
                    >
                        {isBuildingActionProcessing ? (
                            'Строим...'
                        ) : isTutorialFree ? (
                            <>
                                <img src={coinImageUrl} alt="Gold" className="w-5 h-5 mr-1.5 object-contain" />
                                <span className="text-emerald-400 font-bold">0 (Бесплатно)</span>
                                <span className="ml-2">Построить</span>
                            </>
                        ) : building.rubyPrice ? (
                            <>
                                <img src={rubyImageUrl} alt="Ruby" className="w-5 h-5 mr-1.5 object-contain" />
                                <span>{building.rubyPrice}</span>
                                {building.constructionRequirements.population ? (
                                    <>
                                        <span className="mx-2">•</span>
                                        <img src={populationImageUrl} alt="Population" className="w-5 h-5 mr-1 object-contain" />
                                        <span>{building.constructionRequirements.population}</span>
                                    </>
                                ) : null}
                                <span className="ml-2">Построить</span>
                            </>
                        ) : (
                            <>
                                <img src={coinImageUrl} alt="Gold" className="w-5 h-5 mr-1.5 object-contain" />
                                <span>{building.price?.toLocaleString() || 0}</span>
                                {building.constructionRequirements.population ? (
                                    <>
                                        <span className="mx-2">•</span>
                                        <img src={populationImageUrl} alt="Population" className="w-5 h-5 mr-1 object-contain" />
                                        <span>{building.constructionRequirements.population}</span>
                                    </>
                                ) : null}
                                <span className="ml-2">Построить</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => {
                            if (isBuildingActionProcessing) return;
                            onBackToMenu();
                        }}
                        disabled={isBuildingActionProcessing}
                        className={`mt-2.5 w-full text-gray-300 hover:text-white font-bold py-2 px-4 rounded-xl transition-all text-xs border border-white/10 ${isBuildingActionProcessing ? 'bg-gray-800/70 cursor-not-allowed opacity-50' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                        {'← Назад к выбору'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BuildConfirmationModal = memo(BuildConfirmationModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.building?.id !== next.building?.id) return false;
    if (prev.coords.x !== next.coords.x || prev.coords.y !== next.coords.y) return false;
    if (prev.isBuildingActionProcessing !== next.isBuildingActionProcessing) return false;
    if (prev.rubyImageUrl !== next.rubyImageUrl) return false;
    if (prev.coinImageUrl !== next.coinImageUrl) return false;
    if (prev.populationImageUrl !== next.populationImageUrl) return false;
    if (prev.inventory !== next.inventory) return false;
    if (prev.isTutorialFree !== next.isTutorialFree) return false;
    return true;
});

