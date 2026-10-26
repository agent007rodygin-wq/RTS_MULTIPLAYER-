import React, { useState, useMemo, useEffect } from 'react';
import type { Building, PlacedBuilding, Item } from '../../../types';
import {
    CloseIcon,
    DefenseIcon,
    TradeIcon,
    RepairIcon,
    ShieldIcon,
    MoveIcon,
    SellIcon
} from '../../../components/IconComponents';
import { PROTECTION_OPTIONS } from '../../game/ui/actionOptions';
import { isGeneralMarketBuilding, isMilitaryMarketBuilding } from '../../game/market/marketLogic';
import { generateDestructionInfo } from '../../../data/destructionWeapons';

const WATCHTOWER_ID = 50;
const MOUNTAIN_ID = 500;
const RIVER_ID = 501;
const AUCTION_ID = 700;
const CANNON_IDS = [40, 41, 42, 43, 44];
const PROTECTED_TOWER_ID = 55;
const CASINO_IDS = [450, 451, 452, 453];
const BANDIT_CASTLE_IDS = new Set([200, 201, 202, 203]);
const DIRECT_INTERACTION_FACTORIES = [304, 305, 306, 307];
const MOUNTAIN_MOVE_COST = 10;
const MOVE_ENERGY_COST = 5;
const DETONATOR_ID = 10017;
const SUPER_DETONATOR_ID = 10045;

const isBanditCastleBuildingId = (buildingId: number) => BANDIT_CASTLE_IDS.has(Number(buildingId));

export const calculateRepairCost = (building: PlacedBuilding, info: Building): number => {
    const currentHp = building.hp ?? info.stats.durability;
    const maxHp = building.maxHp ?? info.stats.durability;
    const missingHp = maxHp - currentHp;
    if (missingHp <= 0) return 0;

    const basePrice = info.price || (info.rubyPrice ? info.rubyPrice * 10000 : 100);
    const cost = Math.ceil((missingHp / maxHp) * basePrice * 0.5);

    return Math.max(cost, missingHp);
};

interface ConstructionTimerProps {
    endTime: number;
    cost: number;
    onSpeedUp: () => void;
    isMyBuilding: boolean;
    rubyImageUrl: string;
}

const ConstructionTimer: React.FC<ConstructionTimerProps> = ({
    endTime,
    cost,
    onSpeedUp,
    isMyBuilding,
    rubyImageUrl
}) => {
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const timeLeft = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) return null;

    return (
        <div className="mt-2 p-2 bg-gray-900/40 rounded border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-1">
                <span className="text-white font-mono font-bold text-lg">Время: {timeString}</span>
                <div className="flex items-center bg-gray-800 px-2 py-0.5 rounded text-pink-400 font-bold border border-pink-500/30">
                    <img src={rubyImageUrl} className="w-4 h-4 mr-1 object-contain" alt="ruby" />
                    {cost}
                </div>
            </div>
            {isMyBuilding && (
                <button
                    onClick={onSpeedUp}
                    className="text-xs text-purple-300 hover:text-white underline hover:no-underline transition-colors text-left"
                >
                    Построить мгновенно или ускорить за рубины
                </button>
            )}
        </div>
    );
};

export interface SelectedBuildingModalProps {
    selectedBuilding: {
        building: PlacedBuilding;
        info: Building;
    } | null;
    onClose: () => void;
    buildingData: Building[];
    itemData: Item[];
    inventory: Record<number, number>;
    playerGold: number;
    playerRubies: number;
    playerEnergy: number;
    playerLevel: number;
    placedBuildings: PlacedBuilding[];
    allUsers: Record<string, any>;
    maxPopulation: number;
    currentPopulation: number;
    coinImageUrl: string;
    rubyImageUrl: string;
    builderIconUrl: string;
    populationImageUrl: string;
    isMyBuilding: (building: PlacedBuilding) => boolean;
    canRepairBuilding: (building: PlacedBuilding) => boolean;
    getCanonicalItemName: (itemId: string | number, fallbackName?: string, buildingId?: string | number) => string;
    handleSpeedUp: () => void;
    handleStartProduction: () => void;
    handleCollectProduction: () => void;
    handleSetTax: (rate: number) => void;
    handleWithdrawBank: () => void;
    handleBuyRuby: (amount: number) => void;
    handleOpenCasinoModal: (building: PlacedBuilding) => void;
    handleOpenCasinoBankModal: (building: PlacedBuilding) => void;
    handleUpgrade: () => void;
    setShowMonsterAcademyModal: (show: boolean) => void;
    handleToggleActive: () => void;
    handleRepair: () => void;
    handleMoveClick: () => void;
    handleSell: () => void;
    handleStealProduction: () => void;
    handleExplode: (option: any, quantity: number, timeMultiplier: number, useSuper: boolean, useRegular: boolean) => void;
    handleApplyProtection: (cost: number, duration: number) => void;
    onOpenMarket: (type: 'general' | 'military') => void;
    onSelectPlayer: (playerId: string) => void;
}

export const SelectedBuildingModalComponent: React.FC<SelectedBuildingModalProps> = ({
    selectedBuilding,
    onClose,
    buildingData,
    itemData,
    inventory,
    playerGold,
    playerRubies,
    playerEnergy,
    playerLevel,
    placedBuildings,
    allUsers,
    maxPopulation,
    currentPopulation,
    coinImageUrl,
    rubyImageUrl,
    builderIconUrl,
    populationImageUrl,
    isMyBuilding,
    canRepairBuilding,
    getCanonicalItemName,
    handleSpeedUp,
    handleStartProduction,
    handleCollectProduction,
    handleSetTax,
    handleWithdrawBank,
    handleBuyRuby,
    handleOpenCasinoModal,
    handleOpenCasinoBankModal,
    handleUpgrade,
    setShowMonsterAcademyModal,
    handleToggleActive,
    handleRepair,
    handleMoveClick,
    handleSell,
    handleStealProduction,
    handleExplode,
    handleApplyProtection,
    onOpenMarket,
    onSelectPlayer
}) => {
    const [taxRateDraft, setTaxRateDraft] = useState<number | null>(null);
    const [showExplosionMenu, setShowExplosionMenu] = useState(false);
    const [selectedExplosionOption, setSelectedExplosionOption] = useState<number | null>(null);
    const [explosionQuantity, setExplosionQuantity] = useState<number>(1);
    const [useRegularDetonator, setUseRegularDetonator] = useState(false);
    const [useSuperDetonator, setUseSuperDetonator] = useState(false);
    const [showProtectionMenu, setShowProtectionMenu] = useState(false);
    const [buyRubyAmount, setBuyRubyAmount] = useState(1);

    // Reset sub-menus when selected building changes
    useEffect(() => {
        setShowExplosionMenu(false);
        setShowProtectionMenu(false);
        setSelectedExplosionOption(null);
        setExplosionQuantity(1);
        setTaxRateDraft(null);
        setUseRegularDetonator(false);
        setUseSuperDetonator(false);
        setBuyRubyAmount(1);
    }, [selectedBuilding?.building.id]);

    if (!selectedBuilding) return null;

    const { building, info } = selectedBuilding;
    const isMine = isMyBuilding(building);
    const repairCost = calculateRepairCost(building, info);

    const destructionInfo = generateDestructionInfo({
        ...info,
        ...building,
        stats: { ...info.stats }
    });

    const handleClose = () => {
        setShowExplosionMenu(false);
        setShowProtectionMenu(false);
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-40" onClick={handleClose}>
            <div className="bg-gray-800/90 w-96 rounded-xl border border-gray-600 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{info.name}</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>
                {!showExplosionMenu && !showProtectionMenu ? (
                    <div className="p-4">
                        {/* Casino Under Construction Banner */}
                        {CASINO_IDS.includes(info.id) && building.isConstructing && (
                            <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-500/50 mb-4">
                                <h3 className="text-lg font-bold text-yellow-400 mb-2 text-center">Идет строительство</h3>
                                <p className="text-yellow-200 text-sm text-center mb-3">Казино будет доступно после завершения строительства</p>
                                <ConstructionTimer
                                    endTime={building.constructionEndTime}
                                    cost={info.stats.accelerationCost || 0}
                                    onSpeedUp={handleSpeedUp}
                                    isMyBuilding={isMine}
                                    rubyImageUrl={rubyImageUrl}
                                />
                            </div>
                        )}

                        {info.stats.workTimeSeconds && info.category !== 'Защита' && !isBanditCastleBuildingId(info.id) && isMine && !building.isConstructing && (
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-500/30 mb-4">
                                <h3 className="text-lg font-bold text-blue-300 mb-2">Производство</h3>

                                {/* For direct interaction factories (like lilies/mushrooms), only show menu during production */}
                                {DIRECT_INTERACTION_FACTORIES.includes(info.id) ? (
                                    building.workState === 'working' && (
                                        <div className="text-center py-2">
                                            <p className="text-yellow-400 font-bold animate-pulse">Идет производство...</p>
                                            <p className="text-xs text-gray-400 mt-1">Нажмите на здание на карте для сбора</p>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        {(!building.workState || building.workState === 'idle') && (
                                            <div>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {info.stats.takesPopulation && (
                                                        <div className={`px-2 py-1 rounded text-sm flex items-center ${maxPopulation - currentPopulation >= info.stats.takesPopulation ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
                                                            <img src={populationImageUrl} className="w-4 h-4 mr-1" alt="pop" />
                                                            {info.stats.takesPopulation} чел.
                                                        </div>
                                                    )}
                                                    {info.stats.consumes?.map(req => {
                                                        const has = (inventory[req.id] || 0) >= (req.amount || 0);
                                                        return (
                                                            <div key={req.id} className={`px-2 py-1 rounded text-sm flex items-center ${has ? 'text-green-400 bg-green-900/30' : 'text-red-400 bg-red-900/30'}`}>
                                                                <span>{getCanonicalItemName(req.id, req.name, building.id)}: {req.amount}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <button onClick={handleStartProduction} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded">
                                                    Начать работу ({Math.floor((info.stats.workTimeSeconds || 0) / 60)}м {String((info.stats.workTimeSeconds || 0) % 60).padStart(2, '0')}с)
                                                </button>
                                            </div>
                                        )}

                                        {building.workState === 'working' && (
                                            <div className="text-center py-2">
                                                <p className="text-yellow-400 font-bold animate-pulse">Идет производство...</p>
                                                <p className="text-xs text-gray-400 mt-1">Взаимодействие ограничено</p>
                                            </div>
                                        )}

                                        {building.workState === 'finished' && (
                                            <div className="text-center py-2">
                                                {[400, 401, 402, 403, 404, 406, 407, 408].includes(info.id) ? (
                                                    <button onClick={handleStartProduction} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded flex items-center justify-center">
                                                        <img src={builderIconUrl} className="w-6 h-6 mr-2" alt="worker" />
                                                        Отправить рабочего
                                                    </button>
                                                ) : (
                                                    <button onClick={handleCollectProduction} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded animate-bounce">
                                                        Забрать продукцию
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Watchtower Tax Settings */}
                        {info.id === WATCHTOWER_ID && isMine && (
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-purple-500/30 mb-4">
                                <h3 className="text-lg font-bold text-purple-300 mb-2">Налог сектора</h3>
                                <p className="text-sm text-gray-400 mb-2">Установите налог (0-50%) для этого сектора.</p>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={taxRateDraft ?? (building.taxRate || 0)}
                                        onChange={(e) => setTaxRateDraft(parseInt(e.target.value, 10))}
                                        onMouseUp={(e) => {
                                            const nextRate = parseInt((e.target as HTMLInputElement).value, 10);
                                            if (!Number.isNaN(nextRate)) handleSetTax(nextRate);
                                        }}
                                        onTouchEnd={(e) => {
                                            const nextRate = parseInt((e.target as HTMLInputElement).value, 10);
                                            if (!Number.isNaN(nextRate)) handleSetTax(nextRate);
                                        }}
                                        onKeyUp={(e) => {
                                            const nextRate = parseInt((e.target as HTMLInputElement).value, 10);
                                            if (!Number.isNaN(nextRate)) handleSetTax(nextRate);
                                        }}
                                        className="w-full"
                                    />
                                    <span className="font-bold text-white w-12 text-right">{taxRateDraft ?? (building.taxRate || 0)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Clan Castle Bank */}
                        {BANDIT_CASTLE_IDS.has(Number(info.id)) && isMine && (
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-500/30 mb-4 text-center">
                                <h3 className="text-lg font-bold text-yellow-400 mb-2">Банк клана</h3>
                                <p className="text-sm text-gray-400 mb-3">Накопленная прибыль с налога.</p>
                                <div className="text-2xl font-bold text-white mb-3 flex items-center justify-center">
                                    <img src={coinImageUrl} className="w-6 h-6 mr-2 object-contain" alt="coin" />
                                    {building.bank || 0}
                                </div>
                                <button
                                    onClick={handleWithdrawBank}
                                    disabled={(building.bank || 0) <= 0}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                                >
                                    Забрать прибыль
                                </button>
                            </div>
                        )}

                        <p className="text-gray-300 mb-4">{info.description}</p>

                        <div className="text-sm space-y-1 text-gray-400">
                            {info.id !== MOUNTAIN_ID && info.id !== RIVER_ID && (
                                <p>Прочность: <span className="font-bold text-white">{info.stats.durability}</span></p>
                            )}
                            {building.hp !== undefined && info.id !== MOUNTAIN_ID && info.id !== RIVER_ID && (
                                (() => {
                                    const maxHp = building.maxHp ?? info.stats.durability;
                                    const currentHp = Math.max(0, Math.min(building.hp ?? maxHp, maxHp));
                                    const shieldMaxHp = Math.max(0, building.shieldMaxHp || 0);
                                    const shieldHp = Math.max(0, Math.min(building.shieldHp || 0, shieldMaxHp || Number.MAX_SAFE_INTEGER));
                                    const displayHp = building.isDestroying
                                        ? Math.max(0, currentHp - (building.pendingDamage || 0))
                                        : currentHp;
                                    return (
                                        <>
                                            {shieldMaxHp > 0 && (
                                                <p>Броня щита: <span className={`${shieldHp < shieldMaxHp ? 'text-yellow-400' : 'text-cyan-300'} font-bold`}>{shieldHp} / {shieldMaxHp}</span></p>
                                            )}
                                            <p>Здоровье: <span className={`${displayHp < maxHp ? 'text-red-400' : 'text-green-400'} font-bold`}>{displayHp} / {maxHp}</span></p>
                                        </>
                                    );
                                })()
                            )}
                            {info.stats.populationBonus && <p>Дает населения: <span className="font-bold text-white">{info.stats.populationBonus}</span></p>}
                            {info.stats.givesCoins && !isBanditCastleBuildingId(info.id) && <p>Дает монет: <span className="font-bold text-white">{info.stats.givesCoins}</span></p>}
                            {info.stats.increasesGoldCapacity && (
                                <p className="flex items-center">
                                    Хранит:
                                    <img src={coinImageUrl} className="w-4 h-4 mx-1 object-contain" alt="coin" />
                                    <span className="font-bold text-white">{info.stats.increasesGoldCapacity.toLocaleString()} монет</span>
                                </p>
                            )}

                            {info.upgradesTo && (
                                (() => {
                                    const nextInfo = buildingData.find(b => b.id === info.upgradesTo);
                                    return (
                                        <>
                                            {nextInfo?.stats?.increasesGoldCapacity ? (
                                                <p className="text-yellow-400 mt-1 flex items-center">
                                                    Если улучшить:
                                                    <img src={coinImageUrl} className="w-4 h-4 mx-1 object-contain" alt="coin" />
                                                    <span>{nextInfo.stats.increasesGoldCapacity.toLocaleString()} монет</span>
                                                </p>
                                            ) : null}
                                            {nextInfo?.constructionRequirements?.resources ? (
                                                <p className="text-yellow-400 mt-1">
                                                    Ресурсы, необходимые для постройки: {nextInfo.constructionRequirements.resources
                                                        .map(r => `${r.name.toLowerCase()} - ${r.amount}`)
                                                        .join(', ')}
                                                </p>
                                            ) : null}
                                        </>
                                    );
                                })()
                            )}

                            {building.isConstructing && (
                                <ConstructionTimer
                                    endTime={building.constructionEndTime}
                                    cost={info.stats.accelerationCost || 0}
                                    onSpeedUp={handleSpeedUp}
                                    isMyBuilding={isMine}
                                    rubyImageUrl={rubyImageUrl}
                                />
                            )}
                        </div>

                        {info.id === AUCTION_ID && isMine && (
                            <div className="mt-4 p-3 bg-gray-900/50 rounded border border-yellow-500/30">
                                <h4 className="text-yellow-400 font-bold mb-2 text-center">Обмен валюты</h4>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center text-sm text-gray-300">
                                        <input
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={buyRubyAmount}
                                            onChange={e => setBuyRubyAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                            className="w-16 bg-gray-800 text-white text-center rounded border border-gray-700 p-1 mr-2"
                                        />
                                        <img src={coinImageUrl} className="w-4 h-4 mx-1 object-contain" alt="coin" />
                                        <span>{'>'}</span>
                                        <img src={rubyImageUrl} className="w-4 h-4 ml-1 object-contain" alt="ruby" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-400 mb-1">Стоимость: {(buyRubyAmount * 10000).toLocaleString()}</div>
                                        <button
                                            onClick={() => handleBuyRuby(buyRubyAmount)}
                                            disabled={playerGold < (buyRubyAmount * 10000)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                            Купить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {CASINO_IDS.includes(info.id) && (
                            <div className="mt-4 space-y-2">
                                <button
                                    onClick={() => handleOpenCasinoModal(building)}
                                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-3 rounded text-sm"
                                >
                                    Войти в казино
                                </button>
                                {isMine && (
                                    <button
                                        onClick={() => handleOpenCasinoBankModal(building)}
                                        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded text-sm"
                                    >
                                        Банк казино
                                    </button>
                                )}
                            </div>
                        )}

                        {info.upgradesTo && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && isMine && (
                            <button
                                onClick={handleUpgrade}
                                disabled={playerGold < (info.upgradeCost || 0) || building.isConstructing}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <span>Улучшить ({info.upgradeCost})</span>
                            </button>
                        )}

                        {/* Monster Academy - Enter Button */}
                        {info.id >= 689 && info.id <= 696 && isMine && (
                            <button
                                onClick={() => setShowMonsterAcademyModal(true)}
                                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded text-xs"
                            >
                                <span>Войти в академию</span>
                            </button>
                        )}

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            {(CANNON_IDS.includes(info.id) || info.id === PROTECTED_TOWER_ID) && isMine && (
                                <button
                                    onClick={handleToggleActive}
                                    className={`col-span-3 ${building.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 mb-2 transition-colors`}
                                >
                                    <DefenseIcon className="w-5 h-5 mb-1" />
                                    <span>{building.isActive ? 'Активировано' : 'Активировать'}</span>
                                </button>
                            )}
                            {isGeneralMarketBuilding(info) && isMine && (
                                <button
                                    onClick={() => onOpenMarket('general')}
                                    className="col-span-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 mb-2"
                                >
                                    <TradeIcon className="w-5 h-5 mb-1" />
                                    <span>Торговля</span>
                                </button>
                            )}

                            {isMilitaryMarketBuilding(info) && isMine && (
                                <button
                                    onClick={() => onOpenMarket('military')}
                                    className="col-span-3 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 mb-2 border border-red-500"
                                >
                                    <TradeIcon className="w-5 h-5 mb-1" />
                                    <span>Купить/Продать</span>
                                </button>
                            )}

                            {(canRepairBuilding(building) || isMine || Number(building.buildingId) === MOUNTAIN_ID || Number(building.buildingId) === RIVER_ID) && (
                                <>
                                    {canRepairBuilding(building) && repairCost > 0 && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID ? (
                                        <button
                                            onClick={handleRepair}
                                            disabled={playerGold < repairCost}
                                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                            title={`Починить за ${repairCost} золота`}
                                        >
                                            <RepairIcon className="w-4 h-4 mb-1" />
                                            <span>{repairCost}</span>
                                        </button>
                                    ) : canRepairBuilding(building) && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                        <button disabled className="bg-gray-700 text-gray-500 font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 cursor-not-allowed">
                                            <RepairIcon className="w-4 h-4 mb-1" />
                                            <span>Починить</span>
                                        </button>
                                    )}

                                    {isMine && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                        <button
                                            onClick={() => setShowProtectionMenu(true)}
                                            className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                        >
                                            <ShieldIcon className="w-4 h-4 mb-1" />
                                            <span>Защитить</span>
                                        </button>
                                    )}

                                    {isMine && (
                                        <button
                                            onClick={handleMoveClick}
                                            className={`${(Number(building.buildingId) === MOUNTAIN_ID || Number(building.buildingId) === RIVER_ID) ? 'col-span-2' : ''} bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:grayscale disabled:cursor-not-allowed`}
                                            title={`Переместить за ${(Number(building.buildingId) === MOUNTAIN_ID || Number(building.buildingId) === RIVER_ID) ? MOUNTAIN_MOVE_COST : MOVE_ENERGY_COST} энергии`}
                                        >
                                            <MoveIcon className="w-4 h-4 mb-1" />
                                            <span>Переместить</span>
                                        </button>
                                    )}

                                    {isMine && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                        <button
                                            onClick={handleSell}
                                            className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed"
                                            title="Продать за 50% стоимости"
                                        >
                                            <SellIcon className="w-4 h-4 mb-1" />
                                            <span>Продать</span>
                                        </button>
                                    )}
                                </>
                            )}

                            {Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                <button
                                    onClick={() => { setShowExplosionMenu(true); setSelectedExplosionOption(null); setExplosionQuantity(1); }}
                                    className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 disabled:bg-gray-600 disabled:cursor-not-allowed ${!isMine ? 'col-span-3' : ''}`}
                                >
                                    <span>Взорвать</span>
                                </button>
                            )}

                            {!isMine && building.workState === 'finished' && placedBuildings.some(b => b.buildingId === 6000 && isMyBuilding(b) && !b.isConstructing) && playerLevel >= 2 && (
                                <button
                                    onClick={handleStealProduction}
                                    className="col-span-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-2 rounded text-xs flex flex-col items-center justify-center h-12 mt-2"
                                >
                                    <span>Украсть</span>
                                </button>
                            )}
                        </div>

                        {/* Owner Info */}
                        <div className="mt-4 pt-3 border-t border-gray-700 text-center">
                            <span className="text-gray-400 text-xs uppercase tracking-wider">Владелец</span>
                            <div
                                className={`mt-1 font-bold ${(building.ownerId !== "-1" && building.ownerId !== "monster") ? 'text-blue-400 hover:text-blue-300 cursor-pointer underline decoration-dotted underline-offset-4' : 'text-gray-200'} transition-colors`}
                                onClick={() => {
                                    if (building.ownerId !== "-1" && building.ownerId !== "monster") {
                                        onSelectPlayer(building.ownerId as string);
                                    }
                                }}
                            >
                                {isMine ? "Вы" :
                                    (building.ownerId === "-1" || building.ownerId === "monster") ?
                                        (info.category === 'Монстры' ? "Игра (Персонаж: нет)" : "Природа") :
                                        (allUsers[building.ownerId as string]?.name ||
                                            building.ownerName ||
                                            "Неизвестный игрок")}
                            </div>
                        </div>
                    </div>
                ) : showExplosionMenu ? (
                    <div className="p-4">
                        <button onClick={() => setShowExplosionMenu(false)} className="mb-4 text-blue-400 hover:text-blue-300 text-sm flex items-center">
                            {'< Назад'}
                        </button>
                        <h3 className="text-lg font-bold text-white mb-3">Чем взрываем?</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {destructionInfo.length > 0 ? (
                                destructionInfo.map((option, idx) => {
                                    const item = itemData.find(i => i.id === option.resourceId);
                                    const invCount = inventory[option.resourceId] || 0;
                                    const isSelected = selectedExplosionOption === idx;
                                    const qty = isSelected ? explosionQuantity : 1;
                                    const maxQty = Math.min(option.amount, invCount);
                                    const hasGold = playerGold >= option.goldCost * qty;
                                    const hasEnergy = playerEnergy >= option.energyCost * qty;

                                    return (
                                        <div key={idx} onClick={() => { if (invCount >= 1) { setSelectedExplosionOption(idx); setExplosionQuantity(1); } }} className={`bg-gray-700/50 p-3 rounded border ${isSelected ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-600'} ${invCount >= 1 ? 'cursor-pointer hover:border-yellow-400/50' : 'opacity-60'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 mr-2">
                                                        {item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />}
                                                    </div>
                                                    <span className="font-bold">{option.weaponName}</span>
                                                </div>
                                                <span className={`${invCount >= qty ? 'text-green-400' : 'text-red-400'} text-sm`}>
                                                    {invCount} / {option.amount}
                                                </span>
                                            </div>
                                            {isSelected && maxQty > 1 && (
                                                <div className="flex items-center justify-center mb-3 gap-2">
                                                    <span className="text-xs text-gray-300">Количество:</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setExplosionQuantity(prev => Math.max(1, prev - 1)); }} className="w-7 h-7 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold text-lg flex items-center justify-center">-</button>
                                                    <span className="text-white font-bold min-w-[40px] text-center">{explosionQuantity}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setExplosionQuantity(prev => Math.min(maxQty, prev + 1)); }} className="w-7 h-7 bg-gray-600 hover:bg-gray-500 text-white rounded font-bold text-lg flex items-center justify-center">+</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setExplosionQuantity(maxQty); }} className="text-xs bg-gray-600 hover:bg-gray-500 text-yellow-400 rounded px-2 py-1">Макс</button>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-300 space-y-1 mb-3">
                                                <div className="flex justify-between">
                                                    <span>Стоимость:</span>
                                                    <div className="flex items-center">
                                                        <span className={hasGold ? 'text-yellow-400' : 'text-red-400'}>{option.goldCost * qty}</span>
                                                        <img src={coinImageUrl} className="w-3 h-3 ml-1 object-contain" alt="gold" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between"><span>Энергия:</span> <span className={hasEnergy ? 'text-blue-400' : 'text-red-400'}>{option.energyCost * qty}</span></div>
                                                <div className="flex justify-between"><span>Время:</span> <span>{option.timeSeconds * qty} сек</span></div>
                                                <div className="flex justify-between"><span>Урон:</span> <span className="text-red-400">{(option.damage || 0) * qty}</span></div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (invCount >= 1) { setSelectedExplosionOption(idx); setExplosionQuantity(1); } }}
                                                disabled={invCount < 1}
                                                className={`w-full font-bold py-2 rounded ${isSelected ? 'bg-yellow-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'} disabled:bg-gray-600 disabled:cursor-not-allowed`}
                                            >
                                                {isSelected ? 'Выбрано' : `Выбрать`}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-400 text-center">Это здание нельзя взорвать известными способами.</p>
                            )}
                        </div>

                        {/* Detonator checkboxes + Explode button */}
                        {destructionInfo.length > 0 && (() => {
                            const selOption = selectedExplosionOption !== null ? destructionInfo[selectedExplosionOption] : null;
                            const hasItems = selOption !== null && (inventory[selOption.resourceId] || 0) >= explosionQuantity;
                            const hasGold = selOption !== null && playerGold >= selOption.goldCost * explosionQuantity;
                            const hasEnergy = selOption !== null && playerEnergy >= selOption.energyCost * explosionQuantity;
                            const canExplode = hasItems && hasGold && hasEnergy;
                            const detonatorCount = inventory[DETONATOR_ID] || 0;
                            const superDetonatorCount = inventory[SUPER_DETONATOR_ID] || 0;

                            const getTimeMultiplier = () => {
                                if (useSuperDetonator && superDetonatorCount > 0) return 0.5;
                                if (useRegularDetonator && detonatorCount > 0) return 0.75;
                                return 1;
                            };

                            const getTimeLabel = () => {
                                const m = getTimeMultiplier();
                                if (m === 0.5) return 'x0.5 (супер детонатор)';
                                if (m === 0.75) return 'x0.75 (детонатор)';
                                return 'x1 (без детонатора)';
                            };

                            return (
                                <div className="mt-4 space-y-3">
                                    <div className="bg-gray-700/50 rounded-lg p-3 space-y-2">
                                        <div className="text-xs text-gray-400 mb-1">Бонусы детонатора (опционально):</div>
                                        <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setUseRegularDetonator(prev => !prev)}>
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${useRegularDetonator ? 'bg-orange-500 border-orange-500' : 'border-gray-500 bg-gray-800 group-hover:border-orange-400'}`}>
                                                {useRegularDetonator && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-white flex items-center gap-1">
                                                💣 Детонатор
                                                <span className={`text-xs ${detonatorCount > 0 ? 'text-green-400' : 'text-red-400'}`}>({detonatorCount})</span>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setUseSuperDetonator(prev => !prev)}>
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${useSuperDetonator ? 'bg-purple-500 border-purple-500' : 'border-gray-500 bg-gray-800 group-hover:border-purple-400'}`}>
                                                {useSuperDetonator && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-white flex items-center gap-1">
                                                ⚡ Супер детонатор
                                                <span className={`text-xs ${superDetonatorCount > 0 ? 'text-green-400' : 'text-red-400'}`}>({superDetonatorCount})</span>
                                            </span>
                                        </label>
                                        {selOption && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Время: {getTimeLabel()}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (selOption && canExplode) {
                                                handleExplode(selOption, explosionQuantity, getTimeMultiplier(), useSuperDetonator, useRegularDetonator);
                                            }
                                        }}
                                        disabled={!canExplode}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                                    >
                                        💥 Взорвать
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="p-4">
                        <button onClick={() => setShowProtectionMenu(false)} className="mb-4 text-blue-400 hover:text-blue-300 text-sm flex items-center">
                            {'< Назад'}
                        </button>
                        <h3 className="text-lg font-bold text-white mb-4 text-center">Защитить здание</h3>

                        <div className="flex flex-col space-y-3">
                            {PROTECTION_OPTIONS.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleApplyProtection(option.cost, option.duration)}
                                    disabled={playerRubies < option.cost}
                                    className="bg-gray-700 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white p-3 rounded-lg border border-gray-600 flex items-center justify-between transition-colors"
                                >
                                    <div className="flex items-center font-bold">
                                        <img src={rubyImageUrl} alt="Ruby" className="w-6 h-6 mr-2 object-contain" />
                                        <span className="text-xl text-pink-400">{option.cost}</span>
                                    </div>
                                    <span className="text-lg font-semibold">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-center text-gray-500">Щит получает урон первым. Когда броня щита падает до 0, урон начинает проходить в здание.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const arePropsEqual = (prevProps: SelectedBuildingModalProps, nextProps: SelectedBuildingModalProps): boolean => {
    if (!prevProps.selectedBuilding && !nextProps.selectedBuilding) return true;
    if (!prevProps.selectedBuilding || !nextProps.selectedBuilding) return false;

    const prevB = prevProps.selectedBuilding.building;
    const nextB = nextProps.selectedBuilding.building;

    if (
        prevB.id !== nextB.id ||
        prevB.hp !== nextB.hp ||
        prevB.shieldHp !== nextB.shieldHp ||
        prevB.shieldMaxHp !== nextB.shieldMaxHp ||
        prevB.workState !== nextB.workState ||
        prevB.isConstructing !== nextB.isConstructing ||
        prevB.isDestroying !== nextB.isDestroying ||
        prevB.isActive !== nextB.isActive ||
        prevB.bank !== nextB.bank ||
        prevB.taxRate !== nextB.taxRate
    ) {
        return false;
    }

    if (
        prevProps.playerGold !== nextProps.playerGold ||
        prevProps.playerRubies !== nextProps.playerRubies ||
        prevProps.playerEnergy !== nextProps.playerEnergy ||
        prevProps.playerLevel !== nextProps.playerLevel ||
        prevProps.maxPopulation !== nextProps.maxPopulation ||
        prevProps.currentPopulation !== nextProps.currentPopulation ||
        prevProps.inventory !== nextProps.inventory ||
        prevProps.allUsers !== nextProps.allUsers ||
        prevProps.placedBuildings !== nextProps.placedBuildings
    ) {
        return false;
    }

    return true;
};

export const SelectedBuildingModal = React.memo(SelectedBuildingModalComponent, arePropsEqual);
