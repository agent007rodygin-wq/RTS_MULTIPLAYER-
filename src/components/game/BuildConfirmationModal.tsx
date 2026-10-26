import React, { memo } from 'react';
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
    isBuildingActionProcessing: boolean;
    inventory: Record<string, number>;
    rubyImageUrl: string;
    coinImageUrl: string;
    populationImageUrl: string;
    recordRuntimeTraceStage?: (category: string, traceId: string, event: string, data?: any) => void;
    getCanonicalItemName: (id: string | number, fallbackName?: string, buildingId?: string | number) => string;
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
    isBuildingActionProcessing,
    inventory,
    rubyImageUrl,
    coinImageUrl,
    populationImageUrl,
    recordRuntimeTraceStage,
    getCanonicalItemName
}) => {
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
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => {
                if (isBuildingActionProcessing) return;
                onClose();
            }}
        >
            <div className="bg-gray-800/90 w-96 rounded-xl border border-gray-600 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{building.name}</h2>
                    <button
                        onClick={() => {
                            if (isBuildingActionProcessing) return;
                            onClose();
                        }}
                        disabled={isBuildingActionProcessing}
                        className={`text-gray-400 ${isBuildingActionProcessing ? 'cursor-not-allowed opacity-50' : 'hover:text-white'}`}
                    >
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="w-full h-40 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                        <img src={building.imageUrl} alt={building.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    {building.type === BuildingType.Storage && (
                        <p className="text-sm text-gray-300 leading-6 mb-4">
                            Хранилище нужно, чтобы хранить накопленные монеты. Чем больше у вас монет тем больше нужно построить хранилищ. Помните что при взрыве монеты которые находились в хранилище перейдут к нападающему
                        </p>
                    )}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-400">Прочность:</span> <span className="text-white font-semibold">{building.stats.durability}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Время строительства:</span> <span className="text-white font-semibold">{formatBuildDuration(building.stats.constructionTimeSeconds)}</span></div>
                        {building.stats.increasesGoldCapacity && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Хранится:</span>
                                <span className="text-white font-semibold flex items-center">
                                    <img src={coinImageUrl} alt="Gold" className="w-4 h-4 mr-1 object-contain" />
                                    {building.stats.increasesGoldCapacity.toLocaleString()} монет
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between"><span className="text-gray-400">Дает населения:</span> <span className="text-green-400 font-semibold">+{building.stats.populationBonus}</span></div>
                        {building.constructionRequirements.resources && building.constructionRequirements.resources.length > 0 && (
                            <div className="mt-2">
                                <div className="text-gray-400 mb-1">Требуемые ресурсы:</div>
                                <div className="flex flex-wrap gap-2">
                                    {building.constructionRequirements.resources.map(req => (
                                        <span key={req.id} className={`px-2 py-1 rounded text-xs ${(inventory[req.id] || 0) >= (req.amount || 0) ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                             {getCanonicalItemName(req.id, req.name, building.id)}: {inventory[req.id] || 0} / {req.amount}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={isBuildingActionProcessing}
                        className={`mt-6 w-full text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all ${isBuildingActionProcessing ? 'bg-green-800/70 cursor-not-allowed opacity-70' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {isBuildingActionProcessing ? (
                            'Строим...'
                        ) : building.rubyPrice ? (
                            <>
                                <img src={rubyImageUrl} alt="Ruby" className="w-5 h-5 mr-2 object-contain" />
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
                                <img src={coinImageUrl} alt="Gold" className="w-5 h-5 mr-2 object-contain" />
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
                        className={`mt-3 w-full text-white font-bold py-2 px-4 rounded-lg transition-all ${isBuildingActionProcessing ? 'bg-gray-700/70 cursor-not-allowed opacity-70' : 'bg-gray-600 hover:bg-gray-700'}`}
                    >
                        {'< Назад к выбору'}
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
    return true;
});
