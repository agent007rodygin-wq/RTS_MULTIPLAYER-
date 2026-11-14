import React, { useState, useMemo, useEffect } from 'react';
import { BuildingType, type Building, type KotofeySettings, type TrollSettings, type PlacedBuilding, type Item } from '../../../types';
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
import {
    FINANCIAL_INTELLIGENCE_IDS,
    EGYPTIAN_OBELISK_IDS,
    getFinancialCollectCooldownStatus,
    isBuildingReadyForCollection,
} from '../../game/economy/productionCollectLogic';
import { TaxiDepotModal } from './TaxiDepotModal';
import { TownHallModal } from './TownHallModal';
import { getNextGardenBedStage, BONE_MEAL_ITEM_ID } from '../../game/farming/gardenBedLogic';
import { isKotofeyMonster, isHealerMonster, isMonsterAcademyBuilding } from '../../game/monsters/kotofeyLogic';
import { isTrollMonster } from '../../game/monsters/trollLogic';
import { getCustomMonsterScaledStats } from '../../game/monsters/statueBonusLogic';
import { KotofeyControlsPanel } from './KotofeyControlsPanel';
import { TrollControlsPanel } from './TrollControlsPanel';

const WATCHTOWER_ID = 801;
export const WATCHTOWER_IDS = [801, 214, 215, 216];
export const isWatchtowerId = (id: number | string | undefined | null) => id != null && WATCHTOWER_IDS.includes(Number(id));
const MOUNTAIN_ID = 50005;
const RIVER_ID = 50004;
const AUCTION_ID = 311;
const TREBUCHET_ID = 703;
const MORTAR_ID = 704;
const STONE_BLOCK_ID = 10006;
const TREBUCHET_ANIM_DURATION = 2350;
const CANNON_IDS = [700, 701, 703, 365, 366, 367, 368, 369, 370, 382, 383, 384, 385];
const PROTECTED_TOWER_ID = 702;
const CASINO_IDS = [328, 329];
const TOWN_HALL_IDS = [301, 306, 312, 331, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 360, 361, 371, 381, 413, 414, 452, 726, 752];
const BANDIT_CASTLE_IDS = new Set([200, 201, 202, 203]);
const DIRECT_INTERACTION_FACTORIES = [304, 305, 306, 307];
const MOUNTAIN_MOVE_COST = 10;
const MOVE_ENERGY_COST = 5;
const DETONATOR_ID = 10017;
const SUPER_DETONATOR_ID = 10045;

const isBanditCastleBuildingId = (buildingId: number) => BANDIT_CASTLE_IDS.has(Number(buildingId));

export const calculateRepairCost = (building: PlacedBuilding, info: Building, discountMultiplier: number = 1): number => {
    const currentHp = building.hp ?? info.stats.durability;
    const maxHp = building.maxHp ?? info.stats.durability;
    const missingHp = maxHp - currentHp;
    if (missingHp <= 0) return 0;

    const basePrice = info.price || (info.rubyPrice ? info.rubyPrice * 10000 : 100);
    let cost = Math.ceil((missingHp / maxHp) * basePrice * 0.5);
    cost = Math.max(cost, missingHp);

    if (discountMultiplier < 1) {
        cost = Math.max(1, Math.ceil(cost * discountMultiplier));
    }

    return cost;
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
    handleSellRuby?: (amount: number) => void;
    onOpenMarketForRubies?: () => void;
    onOpenTownHallOrders?: () => void;
    townHallAvailableOrdersCount?: number;
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
    handleDefuse?: () => void;
    currentUserId?: string;
    handleApplyProtection: (cost: number, duration: number) => void;
    handleRemoveProtection?: () => void;
    onOpenMarket: (type: 'general' | 'military') => void;
    onSelectPlayer: (playerId: string) => void;
    handleUseBoneMeal?: (building?: PlacedBuilding) => void;
    handleChargeTrebuchet?: (building?: PlacedBuilding) => void;
    onStartTrebuchetAttack?: (building: PlacedBuilding) => void;
    onStartTrebuchetMove?: (building: PlacedBuilding) => void;
    onShowMortarRange?: (building: PlacedBuilding) => void;
    onOpenClanStockExchange?: () => void;
    isMortarActive?: boolean;
    onUseItem?: (itemId: number) => void;
    onCollectAllReadyIncome?: () => void;
    onOpenFinancialProductionModal?: () => void;
    onOpenFinancialMonsterControl?: () => void;
    onSetMonsterMode?: (monsterId: string, mode: 'stand' | 'patrol') => void;
    onUpdateKotofeySettings?: (monsterId: string, patch: Partial<KotofeySettings>) => void;
    onUpdateTrollSettings?: (monsterId: string, patch: Partial<TrollSettings>) => void;
    lastFinancialCollectTime?: number;
    hasEgyptianObelisk?: boolean;
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
    handleSellRuby,
    onOpenMarketForRubies,
    onOpenTownHallOrders,
    townHallAvailableOrdersCount,
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
    handleDefuse,
    currentUserId,
    handleApplyProtection,
    handleRemoveProtection,
    onOpenMarket,
    onSelectPlayer,
    handleUseBoneMeal,
    handleChargeTrebuchet,
    onStartTrebuchetAttack,
    onStartTrebuchetMove,
    onShowMortarRange,
    onOpenClanStockExchange,
    isMortarActive = false,
    onUseItem,
    onCollectAllReadyIncome,
    onOpenFinancialProductionModal,
    onOpenFinancialMonsterControl,
    onSetMonsterMode,
    onUpdateKotofeySettings,
    onUpdateTrollSettings,
    lastFinancialCollectTime = 0,
    hasEgyptianObelisk = false
}) => {
    const [taxRateDraft, setTaxRateDraft] = useState<number | null>(null);
    const [showExplosionMenu, setShowExplosionMenu] = useState(false);
    const [selectedExplosionOption, setSelectedExplosionOption] = useState<number | null>(null);
    const [explosionQuantity, setExplosionQuantity] = useState<number>(1);
    const [useRegularDetonator, setUseRegularDetonator] = useState(false);
    const [useSuperDetonator, setUseSuperDetonator] = useState(false);
    const [showProtectionMenu, setShowProtectionMenu] = useState(false);
    const [buyRubyAmount, setBuyRubyAmount] = useState(1);
    const [sellRubyAmount, setSellRubyAmount] = useState(1);
    const [auctionMode, setAuctionMode] = useState<'buy' | 'sell'>('buy');
    const [, setTrebuchetTimerTick] = useState(0);

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

    // Live update interval for trebuchet charging countdown & animation
    useEffect(() => {
        if (!selectedBuilding) return;
        const b = placedBuildings.find(pb => String(pb.id) === String(selectedBuilding.building.id)) || selectedBuilding.building;
        if (Number(selectedBuilding.info.id) !== TREBUCHET_ID) return;
        const now = Date.now();
        const isCharging = Boolean(b.trebuchetChargingUntil && now < b.trebuchetChargingUntil);
        const isAnim = Boolean(b.trebuchetAnimStart && now >= b.trebuchetAnimStart && now < b.trebuchetAnimStart + TREBUCHET_ANIM_DURATION);
        const isFiring = Boolean(b.trebuchetFireAt && now < b.trebuchetFireAt);
        const isLaunchAnim = Boolean(b.trebuchetLaunchAnimStart && now >= b.trebuchetLaunchAnimStart && now < b.trebuchetLaunchAnimStart + 2500);
        const isMoving = Boolean(b.trebuchetMoveUntil && now < b.trebuchetMoveUntil);
        if (!isCharging && !isAnim && !isFiring && !isLaunchAnim && !isMoving) return;

        const interval = setInterval(() => setTrebuchetTimerTick(t => t + 1), 200);
        return () => clearInterval(interval);
    }, [selectedBuilding, placedBuildings]);

    if (!selectedBuilding) return null;

    const liveBuilding = placedBuildings.find(b => String(b.id) === String(selectedBuilding.building.id)) || selectedBuilding.building;
    const building = liveBuilding;
    const { info } = selectedBuilding;
    const isMine = isMyBuilding(building);
    const isSystemOrNeutral = !building.ownerId || building.ownerId === "-1" || building.ownerId === "0" || building.ownerId === "monster" || building.ownerName === "Система";
    const isMoveableTerrain = (Number(building.buildingId) === MOUNTAIN_ID || Number(building.buildingId) === RIVER_ID) && (isMine || isSystemOrNeutral);
    const showSellButton = isMine && Number(building.buildingId) !== MOUNTAIN_ID;
    const repairCost = calculateRepairCost(building, info, isMortarActive ? 0.7 : 1);

    const destructionInfo = generateDestructionInfo({
        ...info,
        ...building,
        stats: { ...info.stats }
    });

    const isUnderConstruction = Boolean(building.isConstructing && (!building.constructionEndTime || building.constructionEndTime > Date.now()));
    const isTownHall = TOWN_HALL_IDS.includes(Number(info.id)) || info.type === BuildingType.TownHall;
    const isAuction = Number(info.id) === AUCTION_ID;
    const isOwnAuction = isAuction && isMine;
    const isFinancialIntelligence = FINANCIAL_INTELLIGENCE_IDS.includes(Number(info.id));
    const isEgyptianObelisk = EGYPTIAN_OBELISK_IDS.includes(Number(info.id));
    const isMonster = Boolean(info.stats?.isMonster || info.category === 'Монстры');

    const playerMonstersCount = (isFinancialIntelligence && isMine)
        ? placedBuildings.filter(b => isMyBuilding(b) && !b.isDestroying && (b.hp === undefined || b.hp > 0) && Boolean(buildingData.find(d => d.id === b.buildingId)?.stats.isMonster || buildingData.find(d => d.id === b.buildingId)?.category === 'Монстры')).length
        : 0;

    const readyBuildingsCount = (isFinancialIntelligence && isMine)
        ? placedBuildings.filter(b => isMyBuilding(b) && isBuildingReadyForCollection(b, Date.now())).length
        : 0;

    const financialCooldown = (isFinancialIntelligence && isMine)
        ? getFinancialCollectCooldownStatus(lastFinancialCollectTime, hasEgyptianObelisk, Date.now())
        : { isReady: false, remainingMs: 0, hasObeliskPerk: false, cooldownMs: 0 };

    const cooldownMinutes = Math.floor(financialCooldown.remainingMs / 60000);
    const cooldownSeconds = Math.floor((financialCooldown.remainingMs % 60000) / 1000);
    const financialCooldownFormatted = `${cooldownMinutes}:${cooldownSeconds.toString().padStart(2, '0')}`;

    const isTrebuchet = Number(info.id) === TREBUCHET_ID;
    const isMortar = Number(info.id) === MORTAR_ID;
    const now = Date.now();
    const isProtected = (building.shieldHp || 0) > 0 || (Boolean(building.protectionEndTime) && Number(building.protectionEndTime) > now);
    const isInitiator = Boolean(currentUserId && building.initiatorId && String(building.initiatorId) === String(currentUserId));
    const isTrebuchetMoving = Boolean(building.trebuchetMoveUntil && now < building.trebuchetMoveUntil);
    const trebuchetMovingSecondsLeft = isTrebuchetMoving
        ? Math.max(0.1, ((building.trebuchetMoveUntil! - now) / 1000)).toFixed(1)
        : '0';
    const isTrebuchetCharging = !isTrebuchetMoving && Boolean(building.trebuchetChargingUntil && now < building.trebuchetChargingUntil);
    const trebuchetSecondsLeft = isTrebuchetCharging
        ? Math.max(1, Math.ceil((building.trebuchetChargingUntil! - now) / 1000))
        : 0;
    const isTrebuchetAnimPlaying = !isTrebuchetMoving && Boolean(
        building.trebuchetAnimStart &&
        now >= building.trebuchetAnimStart &&
        now < building.trebuchetAnimStart + TREBUCHET_ANIM_DURATION
    );
    const isTrebuchetFiring = !isTrebuchetMoving && Boolean(building.trebuchetFireAt && now < building.trebuchetFireAt);
    const trebuchetFiringSecondsLeft = isTrebuchetFiring
        ? Math.max(0.1, ((building.trebuchetFireAt! - now) / 1000)).toFixed(1)
        : '0';
    const isTrebuchetLaunchAnim = !isTrebuchetMoving && Boolean(
        building.trebuchetLaunchAnimStart &&
        now >= building.trebuchetLaunchAnimStart &&
        now < building.trebuchetLaunchAnimStart + 2500
    );
    const isTrebuchetLoaded = Boolean(
        !isTrebuchetMoving && !isTrebuchetFiring && !isTrebuchetLaunchAnim && (
            building.trebuchetLoaded ||
            (building.trebuchetAnimStart && now >= building.trebuchetAnimStart + TREBUCHET_ANIM_DURATION)
        )
    );

    const handleClose = () => {
        setShowExplosionMenu(false);
        setShowProtectionMenu(false);
        onClose();
    };

    const isTaxiDepot = Number(info.id) === 7980020;

    if (isTaxiDepot && !showExplosionMenu && !showProtectionMenu) {
        return (
            <TaxiDepotModal
                building={building}
                info={info}
                onClose={handleClose}
                playerGold={playerGold}
                playerLevel={playerLevel}
                inventory={inventory}
                coinImageUrl={coinImageUrl}
                rubyImageUrl={rubyImageUrl}
                populationImageUrl={populationImageUrl}
                isMine={isMine}
                canRepair={canRepairBuilding(building) && repairCost > 0}
                repairCost={repairCost}
                handleStartProduction={handleStartProduction}
                handleCollectProduction={handleCollectProduction}
                handleRepair={handleRepair}
                handleMoveClick={handleMoveClick}
                handleSell={handleSell}
                handleExplode={handleExplode}
                handleDefuse={handleDefuse}
                handleApplyProtection={handleApplyProtection}
                handleUpgrade={handleUpgrade}
                onOpenExplosionMenu={() => { setShowExplosionMenu(true); setSelectedExplosionOption(null); setExplosionQuantity(1); }}
                onOpenProtectionMenu={() => setShowProtectionMenu(true)}
                getCanonicalItemName={getCanonicalItemName}
            />
        );
    }

    const isOwnTownHall = isTownHall && isMine;

    if (isOwnTownHall && !showExplosionMenu && !showProtectionMenu) {
        return (
            <TownHallModal
                building={building}
                info={info}
                onClose={handleClose}
                playerGold={playerGold}
                playerEnergy={playerEnergy}
                playerLevel={playerLevel}
                currentPopulation={currentPopulation}
                maxPopulation={maxPopulation}
                inventory={inventory}
                coinImageUrl={coinImageUrl}
                rubyImageUrl={rubyImageUrl}
                playerRubies={playerRubies}
                populationImageUrl={populationImageUrl}
                canRepair={canRepairBuilding(building) && repairCost > 0}
                repairCost={repairCost}
                handleRepair={handleRepair}
                handleMoveClick={handleMoveClick}
                handleSell={handleSell}
                handleUpgrade={handleUpgrade}
                handleSpeedUp={handleSpeedUp}
                handleDefuse={handleDefuse}
                onOpenExplosionMenu={() => { setShowExplosionMenu(true); setSelectedExplosionOption(null); setExplosionQuantity(1); }}
                onOpenProtectionMenu={() => setShowProtectionMenu(true)}
                onOpenTownHallOrders={onOpenTownHallOrders}
                townHallAvailableOrdersCount={townHallAvailableOrdersCount}
                buildingData={buildingData}
                isMortarActive={isMortarActive}
            />
        );
    }

    return (
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm flex ${isOwnAuction ? 'items-start sm:items-center pt-16 sm:pt-14' : 'items-center'} justify-center z-40 p-3 sm:p-4 animate-fade-in`} onClick={handleClose}>
            <div
                className={`w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white ${isOwnAuction ? 'max-h-[86vh]' : 'max-h-[92vh]'} animate-scale-up`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black building-title-shimmer">
                        {info.name}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>
                {!showExplosionMenu && !showProtectionMenu ? (
                    <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1">
                        {/* Exploding / Destruction Status Banner */}
                        {building.isDestroying && (
                            <div className="bg-gradient-to-br from-red-950/80 via-rose-950/60 to-black p-3.5 rounded-xl border border-red-500/50 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="text-red-300 font-extrabold text-sm flex items-center gap-1.5 animate-pulse">
                                        <span>💣</span> Здание заминировано / атаковано!
                                    </h4>
                                    {building.destructionEndTime && (
                                        <span className="text-yellow-300 font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/50 border border-yellow-500/30">
                                            ⏱️ {Math.max(0, Math.ceil((building.destructionEndTime - Date.now()) / 1000))} сек
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-300 mb-2.5">
                                    Кто атакует: <span className="font-bold text-yellow-300">
                                        {building.initiatorId ? (
                                            allUsers[building.initiatorId]?.name || (isInitiator ? "Вы" : "Игрок")
                                        ) : (building.ownerId === "monster" || building.ownerId === "-1" ? "Игроки" : "Монстры")}
                                    </span>
                                </p>
                                {handleDefuse && (
                                    <button
                                        onClick={handleDefuse}
                                        disabled={!isInitiator && playerRubies < 1}
                                        className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md border border-emerald-400/50 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                                    >
                                        <span>✂️ Разминировать постройку</span>
                                        {isInitiator ? (
                                            <span className="text-[10px] bg-emerald-950/90 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                                                Бесплатно (вы сапёр)
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-emerald-950/90 text-pink-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                                                1 <img src={rubyImageUrl} className="w-3.5 h-3.5 object-contain inline" alt="ruby" />
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                        {/* Casino Under Construction Banner */}
                        {CASINO_IDS.includes(info.id) && isUnderConstruction && (
                            <div className="bg-gradient-to-br from-yellow-950/40 via-gray-900 to-black p-4 rounded-xl border border-yellow-500/40 mb-4 shadow-lg">
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

                        {info.stats.workTimeSeconds && info.category !== 'Защита' && !isBanditCastleBuildingId(info.id) && isMine && !isUnderConstruction && (
                            <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/30 mb-4 shadow-md">
                                <h3 className="text-lg font-black text-purple-300 mb-2">Производство</h3>

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
                                                        <div className={`px-2.5 py-1 rounded-lg text-sm font-bold flex items-center ${maxPopulation - currentPopulation >= info.stats.takesPopulation ? 'text-green-400 bg-green-950/50 border border-green-500/30' : 'text-red-400 bg-red-950/50 border border-red-500/30'}`}>
                                                            <img src={populationImageUrl} className="w-4 h-4 mr-1" alt="pop" />
                                                            {info.stats.takesPopulation} чел.
                                                        </div>
                                                    )}
                                                    {info.stats.consumes?.map(req => {
                                                        const has = (inventory[req.id] || 0) >= (req.amount || 0);
                                                        return (
                                                            <div key={req.id} className={`px-2.5 py-1 rounded-lg text-sm font-bold flex items-center ${has ? 'text-green-400 bg-green-950/50 border border-green-500/30' : 'text-red-400 bg-red-950/50 border border-red-500/30'}`}>
                                                                 <span>{getCanonicalItemName(req.id, req.name, building.id)}: {req.amount}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <button onClick={handleStartProduction} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-2.5 rounded-xl shadow-md transition-all">
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
                                                <button onClick={handleCollectProduction} className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black py-2.5 rounded-xl animate-bounce shadow-lg transition-all flex items-center justify-center">
                                                    <img src={coinImageUrl} className="w-5 h-5 mr-2" alt="coin" />
                                                    Собрать урожай
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Bone Meal Fertilizer for Garden Beds */}
                        {isMine && !isUnderConstruction && getNextGardenBedStage(Number(info.id)) !== null && (
                            <div className="bg-gray-900/60 p-4 rounded-xl border border-emerald-500/40 mb-4 shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
                                        <img src="/items/bone_meal.webp" className="w-5 h-5 object-contain" alt="Мука" />
                                        <span>Удобрение грядки</span>
                                    </h3>
                                    <span className="text-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                        В наличии: {inventory[BONE_MEAL_ITEM_ID] || 0} шт.
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleUseBoneMeal?.(building)}
                                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                                >
                                    <img src="/items/bone_meal.webp" className="w-5 h-5 object-contain" alt="" />
                                    <span>Удобрить костяной мукой (1 шт.)</span>
                                </button>
                                <p className="text-[11px] text-gray-400 text-center mt-1.5">
                                    Пропускает таймер и мгновенно выращивает грядку на следующий уровень!
                                </p>
                            </div>
                        )}

                        {/* Trebuchet Charging Menu */}
                        {isTrebuchet && isMine && !isUnderConstruction && (
                            <div className="bg-gray-900/60 p-4 rounded-xl border border-amber-500/40 mb-4 shadow-md">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                                        <img src="/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp" className="w-5 h-5 object-contain" alt="" />
                                        <span>Зарядка требушета</span>
                                    </h3>
                                    <span className="text-xs bg-amber-950/80 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                        В наличии: {inventory[STONE_BLOCK_ID] || 0} шт.
                                    </span>
                                </div>

                                {isTrebuchetMoving ? (
                                    <div className="text-center py-2.5 px-3 bg-amber-950/60 border border-amber-500/50 rounded-xl">
                                        <div className="flex items-center justify-center gap-2 text-amber-300 font-extrabold text-sm">
                                            <span className="animate-bounce">🚜</span>
                                            <span>Требушет в пути...</span>
                                        </div>
                                        <p className="text-xs text-gray-300 mt-1">
                                            Назначение: клетка <span className="font-mono font-bold text-white">({building.trebuchetMoveTargetX}, {building.trebuchetMoveTargetY})</span>
                                        </p>
                                        <p className="text-xs text-amber-200 mt-0.5">Осталось: <span className="font-extrabold text-white">{trebuchetMovingSecondsLeft} сек.</span></p>
                                        <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden px-0.5">
                                            <div
                                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full transition-all duration-200"
                                                style={{ width: `${Math.min(100, Math.max(0, (((building.trebuchetMoveDuration || 1) - (building.trebuchetMoveUntil! - now)) / (building.trebuchetMoveDuration || 1)) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : isTrebuchetCharging ? (
                                    <div className="text-center py-2.5 px-3 bg-black/40 rounded-xl border border-amber-500/30">
                                        <p className="text-amber-400 font-bold animate-pulse text-sm">Идет зарядка требушета...</p>
                                        <p className="text-xs text-gray-300 mt-1">Осталось: <span className="font-extrabold text-white">{trebuchetSecondsLeft} сек.</span></p>
                                        <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden px-0.5">
                                            <div
                                                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full transition-all duration-200"
                                                style={{ width: `${Math.min(100, Math.max(0, ((5000 - (building.trebuchetChargingUntil! - now)) / 5000) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : isTrebuchetAnimPlaying ? (
                                    <div className="text-center py-2.5 px-3 bg-black/40 rounded-xl border border-amber-500/30">
                                        <p className="text-yellow-400 font-bold animate-pulse text-sm">Взведение механизма...</p>
                                        <p className="text-xs text-gray-400 mt-1">Активация снаряда</p>
                                    </div>
                                ) : isTrebuchetFiring ? (
                                    <div className="text-center py-2.5 px-3 bg-red-950/60 border border-red-500/50 rounded-xl">
                                        <div className="flex items-center justify-center gap-2 text-red-300 font-black text-sm animate-pulse">
                                            <span>🎯 Прицеливание орудия...</span>
                                        </div>
                                        <p className="text-xs text-gray-200 mt-1">
                                            Выстрел через: <span className="font-extrabold text-amber-400">{trebuchetFiringSecondsLeft} сек.</span>
                                        </p>
                                        <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden px-0.5">
                                            <div
                                                className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 h-1.5 rounded-full transition-all duration-200"
                                                style={{ width: `${Math.min(100, Math.max(0, ((10000 - (building.trebuchetFireAt! - now)) / 10000) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : isTrebuchetLaunchAnim ? (
                                    <div className="text-center py-2.5 px-3 bg-red-950/60 border border-red-500/50 rounded-xl">
                                        <p className="text-red-400 font-extrabold animate-bounce text-sm">🔥 Выстрел!</p>
                                        <p className="text-xs text-gray-300 mt-1">Запуск снаряда по цели</p>
                                    </div>
                                ) : isTrebuchetLoaded ? (
                                    <div className="text-center py-2.5 px-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl">
                                        <div className="flex items-center justify-center gap-2 text-emerald-300 font-black text-sm">
                                            <img
                                                src={building.trebuchetFacing === 'left' || building.trebuchetFacing === 'up_left'
                                                    ? "/buildings/защита/требушет _двигаеться/в перед или в верх только в лево/trebuchet_loaded_left.webp"
                                                    : building.trebuchetFacing === 'down_left'
                                                    ? "/buildings/защита/требушет _двигаеться/в низ в лево/trebuchet_rear_loaded_left.webp"
                                                    : building.trebuchetFacing === 'down_right'
                                                    ? "/buildings/защита/требушет _двигаеться/в низ в право/trebuchet_rear_loaded_right.webp"
                                                    : "/buildings/защита/требушет _двигаеться/в перед или в верх в право/trebuchet_loaded_transparent.webp"}
                                                className="w-6 h-6 object-contain"
                                                alt=""
                                            />
                                            <span>Требушет заряжен</span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-1">Каменный блок заряжен. Орудие готово к бою!</p>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                onStartTrebuchetAttack?.(building);
                                            }}
                                            className="w-full mt-3 py-2.5 px-3 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] border border-red-400/50 cursor-pointer active:scale-95"
                                        >
                                            <span className="text-base">🎯</span>
                                            <span>Атаковать!</span>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleChargeTrebuchet?.(building);
                                                onClose();
                                            }}
                                            disabled={(inventory[STONE_BLOCK_ID] || 0) < 1}
                                            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:border-transparent disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                                        >
                                            <img src="/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp" className="w-5 h-5 object-contain" alt="" />
                                            <span>Зарядить требушет (1 каменный блок)</span>
                                        </button>
                                        <p className="text-[11px] text-gray-400 text-center mt-1.5">
                                            Заряжает орудие 1 каменным блоком. Зарядка длится 5 секунд.
                                        </p>
                                    </>
                                )}

                                {!isTrebuchetMoving && !isTrebuchetCharging && !isTrebuchetFiring && !isTrebuchetLaunchAnim && (
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onStartTrebuchetMove?.(building);
                                        }}
                                        className="w-full mt-3 py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] border border-emerald-400/40 cursor-pointer active:scale-95"
                                    >
                                        <span className="text-base">🚜</span>
                                        <span>Передвижение</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Mortar Combat Controls */}
                        {isMortar && isMine && (
                            <div className="bg-gray-900/60 p-4 rounded-xl border border-blue-500/30 mb-4 space-y-3 shadow-md">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">💣</span>
                                        <div>
                                            <h3 className="text-sm font-black text-blue-300">Мортира на платформе</h3>
                                            <span className="text-[11px] text-gray-400">Авто-огонь по монстрам (радиус 8 клеток)</span>
                                        </div>
                                    </div>
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${building.isActive !== false ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-red-950/80 text-red-300 border-red-500/40'}`}>
                                        {building.isActive !== false ? '🟢 Огонь активен' : '🔴 Стрельба отключена'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <button
                                        onClick={handleToggleActive}
                                        className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${building.isActive !== false ? 'bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white border border-red-500/30' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border border-emerald-400/30'}`}
                                    >
                                        <span>{building.isActive !== false ? '🛑 Выключить стрельбу' : '⚡ Включить стрельбу'}</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            onClose();
                                            onShowMortarRange?.(building);
                                        }}
                                        className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border border-blue-400/30 flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                                    >
                                        <span>🎯 Посмотреть радиус</span>
                                    </button>
                                </div>

                                <p className="text-[11px] text-gray-400 text-center">
                                    Мортира реагирует только на монстров. При обнаружении врага в радиусе 8 клеток производит выстрел навесным снарядом.
                                </p>
                            </div>
                        )}

                        {/* Watchtower Tax Settings & Stock Market */}
                        {isWatchtowerId(info.id) && (
                            <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/30 mb-4 space-y-3 shadow-md">
                                {isMine && (
                                    <>
                                        <h3 className="text-lg font-black text-purple-300 mb-1">Налог сектора</h3>
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
                                                className="w-full accent-purple-500"
                                            />
                                            <span className="font-extrabold text-white w-12 text-right">{taxRateDraft ?? (building.taxRate || 0)}%</span>
                                        </div>
                                    </>
                                )}

                                {onOpenClanStockExchange && (
                                    <button
                                        onClick={onOpenClanStockExchange}
                                        className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                                    >
                                        <span className="text-lg">📈</span>
                                        <span>Биржа акций</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Clan Castle Bank */}
                        {BANDIT_CASTLE_IDS.has(Number(info.id)) && isMine && (
                            <div className="bg-gradient-to-br from-yellow-950/40 via-gray-900 to-black p-4 rounded-xl border border-yellow-500/40 mb-4 text-center shadow-lg">
                                <h3 className="text-lg font-black text-yellow-400 mb-1">Банк клана</h3>
                                <p className="text-sm text-gray-400 mb-3">Накопленная прибыль с налога.</p>
                                <div className="text-2xl font-black text-white mb-3 flex items-center justify-center">
                                    <img src={coinImageUrl} className="w-6 h-6 mr-2 object-contain" alt="coin" />
                                    {(building.bank || 0).toLocaleString()}
                                </div>
                                <button
                                    onClick={handleWithdrawBank}
                                    disabled={(building.bank || 0) <= 0}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-2.5 rounded-xl shadow-md transition-all disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    Забрать прибыль
                                </button>
                            </div>
                        )}

                        <div className="mb-4 space-y-1">
                            <p className="text-gray-300">{info.description}</p>
                            {info.englishDescription && (
                                <p className="text-xs text-gray-400 italic">{info.englishDescription}</p>
                            )}
                        </div>

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
                                    // Show real current HP; pending mine damage is displayed as a
                                    // separate line (owner decision DEC-012a): it applies only when
                                    // the destruction timer explodes.
                                    const displayHp = currentHp;
                                    return (
                                        <>
                                            {shieldMaxHp > 0 && (
                                                <p>Броня щита: <span className={`${shieldHp < shieldMaxHp ? 'text-yellow-400' : 'text-cyan-300'} font-bold`}>{shieldHp} / {shieldMaxHp}</span></p>
                                            )}
                                            <p>Здоровье: <span className={`${displayHp < maxHp ? 'text-red-400' : 'text-green-400'} font-bold`}>{displayHp} / {maxHp}</span></p>
                                            {building.isDestroying && (building.pendingDamage || 0) > 0 && (
                                                <p className="text-orange-300">
                                                    💣 Мина: −{building.pendingDamage} к здоровью при взрыве
                                                    {building.destructionEndTime ? ` (через ${Math.max(0, Math.ceil((building.destructionEndTime - Date.now()) / 60000))} мин)` : ''}
                                                </p>
                                            )}
                                        </>
                                    );
                                })()
                            )}
                            {info.stats.populationBonus && <p>Дает населения: <span className="font-bold text-white">{info.stats.populationBonus}</span></p>}
                            {(() => {
                                const scaled = getCustomMonsterScaledStats({
                                    buildingId: info.id,
                                    ownerId: building.ownerId,
                                    buildings: placedBuildings,
                                });
                                if (isTrollMonster(info.id)) {
                                    return (
                                        <>
                                            <p>
                                                Урон постройкам: <span className="font-bold text-red-400">{scaled.damageToBuilding}</span>
                                                <span className="text-xs text-red-300/80 ml-1">({scaled.lovedDamageToBuilding} по «{info.stats.hates || 'Грядки'}»)</span>
                                                <span className="text-xs text-gray-400 ml-1">
                                                    {scaled.warriorLevel > 0 ? `(Статуя Воителя ур.${scaled.warriorLevel})` : '(без статуи)'}
                                                </span>
                                            </p>
                                            <p>
                                                Урон монстрам: <span className="font-bold text-orange-400">{scaled.damageToMonster}</span>
                                            </p>
                                        </>
                                    );
                                }
                                return info.stats.damage ? <p>Урон: <span className="font-bold text-red-400">{info.stats.damage}</span></p> : null;
                            })()}
                            {info.stats.hates && (
                                <p>Ненавидит: <span className="font-bold text-rose-300">😡 {info.stats.hates}</span> <span className="text-xs text-gray-500">(наносит двойной урон и не отвлекается)</span></p>
                            )}
                            {info.stats.repair && (() => {
                                const scaled = getCustomMonsterScaledStats({
                                    buildingId: info.id,
                                    ownerId: building.ownerId,
                                    buildings: placedBuildings,
                                });
                                const baseVal = (info.id === 70009 || info.id === 70010) ? scaled.baseRepair : Number(info.stats.repair);
                                const lovedVal = baseVal * 2;
                                return (
                                    <p>
                                        Чинит постройки: <span className="font-bold text-emerald-400">+{baseVal}</span>
                                        {info.stats.loves && (
                                            <span className="text-xs text-emerald-300/80 ml-1">(+{lovedVal} для «{info.stats.loves}»)</span>
                                        )}
                                        {(info.id === 70009 || info.id === 70010) && (
                                            <span className="text-xs text-gray-400 ml-1">
                                                {scaled.defenderLevel > 0 ? `(Статуя Защитника ур.${scaled.defenderLevel})` : '(без статуи)'}
                                            </span>
                                        )}
                                    </p>
                                );
                            })()}
                            {info.stats.loves && (
                                <p>Любит: <span className="font-bold text-pink-300">🎁 {info.stats.loves}</span> <span className="text-xs text-gray-500">(чинит с удвоенной силой и не отвлекается)</span></p>
                            )}
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
                                            {nextInfo?.stats?.damage ? (
                                                <p className="text-yellow-400 mt-1 flex items-center">
                                                    Урон следующего уровня: <span className="font-bold text-red-400 ml-1">{nextInfo.stats.damage}</span>
                                                    {info.stats?.damage && (
                                                        <span className="text-emerald-400 text-xs ml-1 font-semibold">
                                                            (+{Number(nextInfo.stats.damage) - Number(info.stats.damage)})
                                                        </span>
                                                    )}
                                                </p>
                                            ) : null}
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

                            {isUnderConstruction && (
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
                            <div className="mt-4 p-3.5 bg-gray-900/80 rounded-xl border border-yellow-500/40 shadow-inner">
                                <div className="flex items-center justify-between mb-2.5 border-b border-gray-700/60 pb-2">
                                    <h4 className="text-yellow-400 font-extrabold text-sm flex items-center gap-1.5">
                                        <span>🏛️</span> Торговля рубинами
                                    </h4>
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        {auctionMode === 'buy' ? '1 💎 = 10 000 🪙' : '1 💎 = 7 777 🪙'}
                                    </span>
                                </div>

                                {/* Live user balance */}
                                <div className="flex items-center justify-between bg-black/50 px-3 py-1.5 rounded-lg border border-purple-500/20 mb-3 text-xs">
                                    <span className="text-gray-400 font-medium">Ваш баланс:</span>
                                    <div className="flex items-center gap-3 font-extrabold">
                                        <span className="text-yellow-300 flex items-center gap-1">
                                            <span>{playerGold.toLocaleString()}</span>
                                            <img src={coinImageUrl} className="w-3.5 h-3.5 object-contain" alt="coin" />
                                        </span>
                                        <span className="text-purple-300 flex items-center gap-1">
                                            <span>{playerRubies.toLocaleString()}</span>
                                            <img src={rubyImageUrl} className="w-3.5 h-3.5 object-contain" alt="ruby" />
                                        </span>
                                    </div>
                                </div>

                                {/* Tab switcher: Купить / Продать */}
                                <div className="grid grid-cols-2 gap-1.5 mb-3 bg-gray-800/90 p-1 rounded-md">
                                    <button
                                        type="button"
                                        onClick={() => setAuctionMode('buy')}
                                        className={`py-1 text-xs font-bold rounded transition-all active:scale-95 ${auctionMode === 'buy' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Купить рубины
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAuctionMode('sell')}
                                        className={`py-1 text-xs font-bold rounded transition-all active:scale-95 ${auctionMode === 'sell' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Продать рубины
                                    </button>
                                </div>

                                {auctionMode === 'buy' ? (
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-700/50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">Кол-во:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={Math.max(1000, Math.floor(playerGold / 10000))}
                                                    value={buyRubyAmount}
                                                    onChange={e => setBuyRubyAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                                    className="w-20 bg-gray-800 text-white text-center rounded border border-gray-600 p-1 text-xs font-bold"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <img src={rubyImageUrl} className="w-4 h-4 object-contain" alt="ruby" />
                                                    <span className="text-xs text-purple-300 font-bold">+{buyRubyAmount}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-400">К оплате:</div>
                                                <div className="flex items-center justify-end gap-1 text-xs text-yellow-300 font-extrabold">
                                                    <span>{(buyRubyAmount * 10000).toLocaleString()}</span>
                                                    <img src={coinImageUrl} className="w-3.5 h-3.5 object-contain" alt="coin" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick amount buttons */}
                                        <div className="flex gap-1 justify-between">
                                            {[1, 5, 10, 50].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setBuyRubyAmount(val)}
                                                    className="flex-1 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 py-1 rounded text-[11px] font-medium border border-gray-700 transition-all"
                                                >
                                                    +{val}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setBuyRubyAmount(Math.max(1, Math.floor(playerGold / 10000)))}
                                                className="flex-1 bg-gray-800 hover:bg-gray-700 active:scale-95 text-yellow-400 py-1 rounded text-[11px] font-bold border border-gray-700 transition-all"
                                            >
                                                Макс
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleBuyRuby(buyRubyAmount)}
                                            disabled={playerGold < (buyRubyAmount * 10000)}
                                            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-extrabold py-2.5 rounded-xl text-xs transition-all duration-150 transform active:scale-95 shadow-lg active:shadow-inner flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <img src={rubyImageUrl} className="w-4 h-4 object-contain" alt="ruby" />
                                            <span>Купить за {(buyRubyAmount * 10000).toLocaleString()} монет</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-gray-700/50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">Кол-во:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={Math.max(1, playerRubies)}
                                                    value={sellRubyAmount}
                                                    onChange={e => setSellRubyAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                                    className="w-20 bg-gray-800 text-white text-center rounded border border-gray-600 p-1 text-xs font-bold"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <img src={rubyImageUrl} className="w-4 h-4 object-contain" alt="ruby" />
                                                    <span className="text-xs text-gray-300 font-medium">из {playerRubies}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-400">Получите:</div>
                                                <div className="flex items-center justify-end gap-1 text-xs text-yellow-300 font-extrabold">
                                                    <span>+{(sellRubyAmount * 7777).toLocaleString()}</span>
                                                    <img src={coinImageUrl} className="w-3.5 h-3.5 object-contain" alt="coin" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick amount buttons */}
                                        <div className="flex gap-1 justify-between">
                                            {[1, 5, 10, 50].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setSellRubyAmount(Math.min(playerRubies, val))}
                                                    className="flex-1 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 py-1 rounded text-[11px] font-medium border border-gray-700 transition-all"
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setSellRubyAmount(Math.max(1, playerRubies))}
                                                className="flex-1 bg-gray-800 hover:bg-gray-700 active:scale-95 text-amber-400 py-1 rounded text-[11px] font-bold border border-gray-700 transition-all"
                                            >
                                                Все
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleSellRuby && handleSellRuby(sellRubyAmount)}
                                            disabled={playerRubies < sellRubyAmount || sellRubyAmount <= 0}
                                            className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:to-yellow-500 active:from-amber-700 active:to-yellow-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-extrabold py-2.5 rounded-xl text-xs transition-all duration-150 transform active:scale-95 shadow-lg active:shadow-inner flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <img src={coinImageUrl} className="w-4 h-4 object-contain" alt="coin" />
                                            <span>Продать за {(sellRubyAmount * 7777).toLocaleString()} монет</span>
                                        </button>
                                    </div>
                                )}

                                {/* Shortcut to list rubies on player-to-player market */}
                                {onOpenMarketForRubies && (
                                    <div className="mt-3 pt-2.5 border-t border-gray-700/60">
                                        <button
                                            type="button"
                                            onClick={onOpenMarketForRubies}
                                            className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                                        >
                                            <span>🏷️ Выставить рубины на рынок игрокам</span>
                                        </button>
                                        <p className="text-[10px] text-gray-400 text-center mt-1">
                                            Продажа другим игрокам по свободной цене (на бирже рынка)
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {info.id === AUCTION_ID && !isMine && (
                            <div className="mt-4 p-3.5 bg-gray-900/80 rounded-xl border border-gray-700/60 text-center shadow-inner">
                                <div className="flex items-center justify-center gap-1.5 text-yellow-500 font-bold text-xs mb-1">
                                    <span>🔒</span>
                                    <span>Торговля рубинами недоступна</span>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    Покупка и продажа рубинов доступна только в вашем личном аукционе.
                                </p>
                            </div>
                        )}

                        {CASINO_IDS.includes(info.id) && (
                            <div className="mt-4 p-3.5 bg-gradient-to-r from-purple-950/70 via-gray-900/90 to-yellow-950/60 rounded-lg border border-yellow-500/50 shadow-lg space-y-2.5">
                                <div className="text-center">
                                    <h4 className="text-yellow-400 font-extrabold text-sm flex items-center justify-center gap-1.5">
                                        <span>🎰</span> Казино удачи
                                    </h4>
                                    <p className="text-[11px] text-gray-300 mt-0.5">
                                        Делайте ставки в монетах, выигрывайте призы и джекпоты в рубинах!
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleOpenCasinoModal(building)}
                                    className="w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-black font-extrabold py-2.5 px-4 rounded-lg text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                >
                                    <span className="text-base">🎰</span>
                                    <span>Войти и играть</span>
                                </button>
                                {isMine && (
                                    <button
                                        onClick={() => handleOpenCasinoBankModal(building)}
                                        className="w-full bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 border border-emerald-500/40 transition-colors"
                                    >
                                        <span>🏦</span>
                                        <span>Банк казино</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Town Hall Orders / Bounties */}
                        {isTownHall && isMine && !isUnderConstruction && (
                            <div className="mt-4 p-3.5 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-amber-950/70 rounded-lg border border-yellow-500/50 shadow-lg space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🏛️</span>
                                        <div>
                                            <h4 className="text-yellow-400 font-extrabold text-sm">
                                                Заказы Ратуши
                                            </h4>
                                            <p className="text-[11px] text-gray-300">
                                                Городские контракты на поставку ресурсов
                                            </p>
                                        </div>
                                    </div>
                                    {townHallAvailableOrdersCount !== undefined && townHallAvailableOrdersCount > 0 && (
                                        <span className="bg-yellow-500 text-black font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow animate-pulse">
                                            {townHallAvailableOrdersCount} доступно
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={onOpenTownHallOrders}
                                    className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold py-2.5 px-4 rounded-lg text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                                >
                                    <span>📜</span>
                                    <span>Открыть заказы Ратуши</span>
                                </button>
                            </div>
                        )}

                        {/* Financial Intelligence Controls */}
                        {isFinancialIntelligence && isMine && !isUnderConstruction && (
                            <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-950/70 via-gray-900/90 to-yellow-950/60 rounded-xl border border-amber-500/50 shadow-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📡</span>
                                        <div>
                                            <h4 className="text-amber-300 font-extrabold text-sm">
                                                Финансовая разведка
                                            </h4>
                                            <p className="text-[11px] text-gray-300">
                                                Управление доходами и производствами базы
                                            </p>
                                        </div>
                                    </div>
                                    {hasEgyptianObelisk ? (
                                        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                            ✨ Без перезарядки
                                        </span>
                                    ) : financialCooldown.isReady ? (
                                        <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                            ✅ Сбор готов
                                        </span>
                                    ) : (
                                        <span className="bg-black/60 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                                            ⏳ {financialCooldownFormatted}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={onCollectAllReadyIncome}
                                        disabled={readyBuildingsCount === 0 || !financialCooldown.isReady}
                                        className={`w-full py-2.5 px-4 rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                                            readyBuildingsCount > 0 && financialCooldown.isReady
                                                ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-black shadow-amber-500/20 border border-yellow-300'
                                                : 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed opacity-75'
                                        }`}
                                        title={
                                            readyBuildingsCount === 0
                                                ? 'Нет созревших доходов для сбора'
                                                : !financialCooldown.isReady
                                                ? `Перезарядка сбора: еще ${financialCooldownFormatted}`
                                                : 'Собрать весь готовый доход базы в 1 клик'
                                        }
                                    >
                                        <span className="text-sm">⚡</span>
                                        <span>
                                            {readyBuildingsCount === 0
                                                ? 'Нет созревших доходов'
                                                : !financialCooldown.isReady
                                                ? `Сбор через ${financialCooldownFormatted}`
                                                : `Собрать весь готовый доход (${readyBuildingsCount} готово)`}
                                        </span>
                                    </button>

                                    <button
                                        onClick={onOpenFinancialProductionModal}
                                        className="w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-blue-400/30 transition-all shadow-md active:scale-95"
                                    >
                                        <span>🏭</span>
                                        <span>Управление производствами</span>
                                    </button>

                                    <button
                                        onClick={onOpenFinancialMonsterControl || onOpenFinancialProductionModal}
                                        className="w-full bg-gradient-to-r from-rose-700 via-purple-700 to-indigo-700 hover:from-rose-600 hover:to-indigo-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-purple-400/30 transition-all shadow-md active:scale-95"
                                    >
                                        <span>👾</span>
                                        <span>Управление монстрами {playerMonstersCount > 0 ? `(${playerMonstersCount})` : ''}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Monster Behavior Controls for player-owned monster */}
                        {isMonster && isMine && !isUnderConstruction && (() => {
                            const isHealer = isHealerMonster(info.id);
                            const isTroll = isTrollMonster(info.id);
                            const isKotofey = isKotofeyMonster(info.id);
                            const isPatrol = building.monsterMode === 'patrol';
                            return (
                                <div className={`mt-4 p-3.5 rounded-xl border shadow-lg space-y-3 ${
                                    isHealer
                                        ? 'bg-gradient-to-r from-emerald-950/70 via-gray-900/90 to-teal-950/60 border-emerald-500/50'
                                        : isTroll
                                            ? 'bg-gradient-to-r from-amber-950/70 via-gray-900/90 to-orange-950/60 border-amber-500/50'
                                            : 'bg-gradient-to-r from-purple-950/70 via-gray-900/90 to-rose-950/60 border-purple-500/50'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{isHealer ? '🐾' : isTroll ? '🧌' : '👾'}</span>
                                            <div>
                                                <h4 className={`${isHealer ? 'text-emerald-300' : isTroll ? 'text-amber-300' : 'text-purple-300'} font-extrabold text-sm`}>
                                                    {isKotofey ? 'Приказ Котофею' : isHealer ? `Приказ (${info.name})` : isTroll ? 'Приказ Троллю' : 'Приказ монстру'}
                                                </h4>
                                                <p className="text-[11px] text-gray-300">
                                                    {isPatrol
                                                        ? (isHealer
                                                            ? '💚 Патрулирует город и ремонтирует постройки и монстров'
                                                            : isTroll
                                                                ? '⚔️ Патрулирует район, сносит грядки (x2), постройки и монстров'
                                                                : '⚔️ Патрулирует район и атакует чужие постройки')
                                                        : (isTroll
                                                            ? '🛑 Стоит на месте и подгоняет соседний завод/грядку каждые 40с'
                                                            : '🛑 Стоит на месте и удерживает позицию')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            isPatrol
                                                ? isHealer
                                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 animate-pulse'
                                                    : 'bg-red-950/80 text-rose-300 border-rose-500/40 animate-pulse'
                                                : 'bg-blue-950/80 text-sky-300 border-sky-500/40'
                                        }`}>
                                            {isPatrol ? (isHealer ? '💚 В патруле' : '⚔️ В патруле') : '🛑 На месте'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onSetMonsterMode && onSetMonsterMode(String(building.id), 'stand')}
                                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                                                (building.monsterMode || 'stand') === 'stand'
                                                    ? 'bg-sky-600 text-white border-2 border-sky-300 shadow-lg shadow-sky-500/30 font-black'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-white/10'
                                            }`}
                                        >
                                            <span>🛑</span>
                                            <span>Стоять на месте</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onSetMonsterMode && onSetMonsterMode(String(building.id), 'patrol')}
                                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                                                isPatrol
                                                    ? isHealer
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-2 border-emerald-300 shadow-lg shadow-emerald-500/30 font-black'
                                                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-2 border-rose-300 shadow-lg shadow-red-500/30 font-black'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-white/10'
                                            }`}
                                        >
                                            <span>{isHealer ? '💚' : '⚔️'}</span>
                                            <span>Патрулировать</span>
                                        </button>
                                    </div>

                                    {isHealer && onUpdateKotofeySettings && (
                                        <KotofeyControlsPanel
                                            buildingId={info.id}
                                            settings={building.kotofeySettings}
                                            onChange={(patch) => onUpdateKotofeySettings(String(building.id), patch)}
                                        />
                                    )}
                                    {isTroll && onUpdateTrollSettings && (
                                        <TrollControlsPanel
                                            monsterMode={building.monsterMode || 'stand'}
                                            trollSettings={building.trollSettings}
                                            onSetMode={(mode) => onSetMonsterMode && onSetMonsterMode(String(building.id), mode)}
                                            onChange={(patch) => onUpdateTrollSettings(String(building.id), patch)}
                                        />
                                    )}
                                </div>
                            );
                        })()}

                        {/* Egyptian Obelisk Perk Banner */}
                        {isEgyptianObelisk && isMine && !isUnderConstruction && (
                            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-950/70 via-gray-900 to-teal-950/60 rounded-xl border border-emerald-500/40 shadow-inner">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base">✨</span>
                                    <h4 className="text-emerald-300 font-extrabold text-xs">
                                        Благословение Египетского обелиска
                                    </h4>
                                </div>
                                <p className="text-[11px] text-gray-300 leading-relaxed">
                                    Полностью снимает 30-минутную перезарядку сбора доходов в «Финансовой разведке». Экспресс-сбор со всех предприятий и грядок базы в 1 клик доступен без задержек!
                                </p>
                            </div>
                        )}

                        {info.upgradesTo && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && isMine && (
                            <button
                                onClick={handleUpgrade}
                                disabled={playerGold < (info.upgradeCost || 0) || isUnderConstruction}
                                className="w-full mt-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 disabled:from-gray-800 disabled:to-gray-800 disabled:border-transparent disabled:text-gray-500 disabled:cursor-not-allowed text-xs transition-all flex items-center justify-center gap-2"
                            >
                                <span>⚡ Улучшить ({info.upgradeCost} 💰)</span>
                            </button>
                        )}
                        {!info.upgradesTo && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && isMine && buildingData.some(b => Number(b.upgradesTo) === Number(info.id)) && (
                            <div className="w-full mt-4 bg-amber-950/40 text-amber-300 font-extrabold py-2 px-4 rounded-xl border border-amber-500/30 text-xs flex items-center justify-center gap-1.5">
                                <span>🏆 Максимальный уровень</span>
                            </div>
                        )}

                        {/* Monster Academy - Enter Button */}
                        {isMonsterAcademyBuilding(info.id) && isMine && (
                            <button
                                onClick={() => setShowMonsterAcademyModal(true)}
                                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-md border border-purple-400/30 transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>🎓 Войти в академию</span>
                            </button>
                        )}

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            {(CANNON_IDS.includes(info.id) || info.id === PROTECTED_TOWER_ID) && isMine && (
                                <button
                                    onClick={handleToggleActive}
                                    className={`col-span-3 ${building.isActive ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border border-emerald-400/30' : 'bg-gray-800 hover:bg-gray-700 border border-white/10'} text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 mb-1 shadow-md transition-all`}
                                >
                                    <DefenseIcon className="w-5 h-5 mb-1" />
                                    <span>{building.isActive ? 'Активировано' : 'Активировать'}</span>
                                </button>
                            )}
                            {isGeneralMarketBuilding(info) && isMine && (
                                <button
                                    onClick={() => onOpenMarket('general')}
                                    className="col-span-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 mb-1 shadow-md border border-emerald-400/30 transition-all"
                                >
                                    <TradeIcon className="w-5 h-5 mb-1" />
                                    <span>Торговля</span>
                                </button>
                            )}

                            {isMilitaryMarketBuilding(info) && isMine && (
                                <button
                                    onClick={() => onOpenMarket('military')}
                                    className="col-span-3 bg-gradient-to-r from-red-800 to-rose-900 hover:from-red-700 hover:to-rose-800 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 mb-1 shadow-md border border-red-500/40 transition-all"
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
                                            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 shadow-md border border-amber-400/30 transition-all disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:border-transparent disabled:cursor-not-allowed relative"
                                            title={isMortarActive ? `Починить за ${repairCost} золота (со скидкой 30% от укрепляющего раствора)` : `Починить за ${repairCost} золота`}
                                        >
                                            <RepairIcon className="w-4 h-4 mb-1" />
                                            <div className="flex items-center gap-1">
                                                <span>{repairCost}</span>
                                                {isMortarActive && (
                                                    <span className="text-[9px] bg-sky-950 text-sky-300 border border-sky-400/50 px-1 rounded font-black">
                                                        -30%
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ) : canRepairBuilding(building) && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                        <button disabled className="bg-gray-800/80 text-gray-500 font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 border border-white/5 cursor-not-allowed">
                                            <RepairIcon className="w-4 h-4 mb-1" />
                                            <span>Починить</span>
                                        </button>
                                    )}

                                    {isMine && Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                        <button
                                            onClick={() => setShowProtectionMenu(true)}
                                            className={`${isProtected ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 border-cyan-400/50 shadow-cyan-950/40 ring-1 ring-cyan-400/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-400/30'} text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 shadow-md border transition-all`}
                                            title={isProtected ? 'Защита активна — нажмите для управления или снятия' : 'Защитить здание щитом'}
                                        >
                                            <ShieldIcon className={`w-4 h-4 mb-1 ${isProtected ? 'text-cyan-200' : ''}`} />
                                            <span>{isProtected ? 'Защита 🛡️' : 'Защитить'}</span>
                                        </button>
                                    )}

                                    {(isMine || isMoveableTerrain) && (
                                        <button
                                            onClick={handleMoveClick}
                                            className={`${(Number(building.buildingId) === MOUNTAIN_ID || Number(building.buildingId) === RIVER_ID) ? (showSellButton ? 'col-span-2' : 'col-span-3') : ''} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 shadow-md border border-purple-400/30 transition-all disabled:from-gray-800 disabled:to-gray-800 disabled:grayscale disabled:cursor-not-allowed`}
                                            title={`Переместить за ${(Number(building.buildingId) === MOUNTAIN_ID || Number(building.buildingId) === RIVER_ID) ? MOUNTAIN_MOVE_COST : MOVE_ENERGY_COST} энергии`}
                                        >
                                            <MoveIcon className="w-4 h-4 mb-1" />
                                            <span>Переместить</span>
                                        </button>
                                    )}

                                    {isMine && Number(building.buildingId) !== MOUNTAIN_ID && (
                                        <button
                                            onClick={handleSell}
                                            className="bg-gradient-to-r from-rose-900 to-red-950 hover:from-rose-800 hover:to-red-900 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 shadow-md border border-rose-500/30 transition-all disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed"
                                            title="Продать за 50% стоимости"
                                        >
                                            <SellIcon className="w-4 h-4 mb-1" />
                                            <span>Продать</span>
                                        </button>
                                    )}
                                </>
                            )}

                            {Number(building.buildingId) !== MOUNTAIN_ID && Number(building.buildingId) !== RIVER_ID && (
                                building.isDestroying ? (
                                    handleDefuse ? (
                                        <button
                                            onClick={handleDefuse}
                                            disabled={!isInitiator && playerRubies < 1}
                                            className={`bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-1.5 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all active:scale-95 ${!isMine ? 'col-span-3' : ''}`}
                                            title={isInitiator ? 'Вы заминировали это здание. Нажмите, чтобы разминировать бесплатно.' : 'Разминировать здание за 1 рубин.'}
                                        >
                                            <span className="font-extrabold flex items-center gap-1 text-[11px]">✂️ Разминировать</span>
                                            <span className="text-[10px] text-emerald-200 flex items-center gap-0.5">
                                                {isInitiator ? 'Бесплатно' : <>1 <img src={rubyImageUrl} className="w-2.5 h-2.5 object-contain inline" alt="ruby" /></>}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className={`bg-gray-800/80 text-gray-400 font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 border border-red-500/30 cursor-not-allowed opacity-75 ${!isMine ? 'col-span-3' : ''}`}
                                            title="Здание уже взрывается, повторный взрыв невозможен"
                                        >
                                            <span className="text-red-400 font-bold">💣 Взрывается...</span>
                                        </button>
                                    )
                                ) : (
                                    <button
                                        onClick={() => { setShowExplosionMenu(true); setSelectedExplosionOption(null); setExplosionQuantity(1); }}
                                        className={`bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 shadow-md shadow-red-950/40 border border-red-500/30 transition-all ${!isMine ? 'col-span-3' : ''}`}
                                    >
                                        <span>Взорвать</span>
                                    </button>
                                )
                            )}

                            {!isMine && building.workState === 'finished' && placedBuildings.some(b => b.buildingId === 6000 && isMyBuilding(b) && !b.isConstructing) && playerLevel >= 2 && (
                                <button
                                    onClick={handleStealProduction}
                                    className="col-span-3 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center h-12 mt-2 shadow-md border border-purple-400/40 transition-all"
                                >
                                    <span>Украсть</span>
                                </button>
                            )}
                        </div>

                        {/* Owner Info */}
                        <div className="mt-4 pt-3 border-t border-purple-500/20 text-center bg-purple-950/20 rounded-xl py-2 px-3">
                            <span className="text-purple-300/70 text-xs uppercase tracking-wider font-semibold">Владелец: </span>
                            <span
                                className={`font-bold ${(building.ownerId !== "-1" && building.ownerId !== "monster") ? 'text-purple-300 hover:text-purple-100 cursor-pointer underline decoration-dotted underline-offset-4' : 'text-gray-300'} transition-colors ml-1`}
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
                            </span>
                        </div>
                    </div>
                ) : showExplosionMenu ? (
                    <div className="p-4 sm:p-5">
                        <button onClick={() => setShowExplosionMenu(false)} className="mb-4 text-purple-300 hover:text-purple-100 text-sm font-semibold flex items-center gap-1.5 transition-colors">
                            <span>← Назад</span>
                        </button>
                        <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-rose-200 to-orange-200 mb-3">
                            💥 Чем взрываем?
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
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
                                        <div key={idx} onClick={() => { if (invCount >= 1) { setSelectedExplosionOption(idx); setExplosionQuantity(1); } }} className={`bg-gray-900/70 p-3 rounded-xl border transition-all ${isSelected ? 'border-purple-400 bg-purple-950/40 ring-1 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-purple-500/20 hover:border-purple-500/40'} ${invCount >= 1 ? 'cursor-pointer' : 'opacity-60'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 mr-2 flex items-center justify-center bg-black/40 rounded-lg p-1 border border-white/5">
                                                        {item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />}
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-100">{option.weaponName}</span>
                                                </div>
                                                <span className={`${invCount >= qty ? 'text-emerald-400' : 'text-rose-400'} text-xs font-bold px-2 py-0.5 rounded-full bg-black/40`}>
                                                    {invCount} / {option.amount}
                                                </span>
                                            </div>
                                            {isSelected && maxQty > 1 && (
                                                <div className="flex items-center justify-center mb-3 gap-2 bg-black/40 p-1.5 rounded-lg border border-purple-500/20">
                                                    <span className="text-xs text-purple-200">Количество:</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setExplosionQuantity(prev => Math.max(1, prev - 1)); }} className="w-7 h-7 bg-purple-900/60 hover:bg-purple-800 text-white rounded font-bold text-lg flex items-center justify-center">-</button>
                                                    <span className="text-white font-extrabold min-w-[40px] text-center">{explosionQuantity}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setExplosionQuantity(prev => Math.min(maxQty, prev + 1)); }} className="w-7 h-7 bg-purple-900/60 hover:bg-purple-800 text-white rounded font-bold text-lg flex items-center justify-center">+</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setExplosionQuantity(maxQty); }} className="text-xs bg-purple-800 hover:bg-purple-700 text-yellow-300 font-bold rounded px-2 py-1">Макс</button>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-300 space-y-1 mb-3 bg-black/30 p-2 rounded-lg">
                                                <div className="flex justify-between">
                                                    <span>Стоимость:</span>
                                                    <div className="flex items-center">
                                                        <span className={hasGold ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>{option.goldCost * qty}</span>
                                                        <img src={coinImageUrl} className="w-3.5 h-3.5 ml-1 object-contain" alt="gold" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between"><span>Энергия:</span> <span className={hasEnergy ? 'text-blue-400 font-bold' : 'text-red-400 font-bold'}>{option.energyCost * qty}</span></div>
                                                <div className="flex justify-between"><span>Время:</span> <span>{option.timeSeconds * qty} сек</span></div>
                                                <div className="flex justify-between"><span>Урон:</span> <span className="text-red-400 font-bold">{(option.damage || 0) * qty}</span></div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (invCount >= 1) { setSelectedExplosionOption(idx); setExplosionQuantity(1); } }}
                                                disabled={invCount < 1}
                                                className={`w-full font-bold py-2 rounded-xl text-xs transition-all ${isSelected ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/10'} disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
                                            >
                                                {isSelected ? '✓ Выбрано' : `Выбрать`}
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-400 text-center py-4">Это здание нельзя взорвать известными способами.</p>
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
                                    <div className="bg-purple-950/30 rounded-xl p-3 border border-purple-500/20 space-y-2">
                                        <div className="text-xs text-purple-300 font-bold mb-1">Бонусы детонатора (опционально):</div>
                                        <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setUseRegularDetonator(prev => !prev)}>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${useRegularDetonator ? 'bg-orange-500 border-orange-500' : 'border-purple-500/40 bg-gray-900 group-hover:border-orange-400'}`}>
                                                {useRegularDetonator && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-white flex items-center gap-1">
                                                💣 Детонатор
                                                <span className={`text-xs ${detonatorCount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>({detonatorCount})</span>
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setUseSuperDetonator(prev => !prev)}>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${useSuperDetonator ? 'bg-purple-500 border-purple-500' : 'border-purple-500/40 bg-gray-900 group-hover:border-purple-400'}`}>
                                                {useSuperDetonator && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-white flex items-center gap-1">
                                                ⚡ Супер детонатор
                                                <span className={`text-xs ${superDetonatorCount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>({superDetonatorCount})</span>
                                            </span>
                                        </label>
                                        {selOption && (
                                            <div className="text-xs text-purple-200/80 mt-1">
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
                                        className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black py-3 rounded-xl shadow-lg shadow-red-950/50 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-sm transition-all"
                                    >
                                        💥 Взорвать
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="p-4 sm:p-5">
                        <button onClick={() => setShowProtectionMenu(false)} className="mb-4 text-purple-300 hover:text-purple-100 text-sm font-semibold flex items-center gap-1.5 transition-colors">
                            <span>← Назад</span>
                        </button>
                        <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 mb-4 text-center">
                            {isProtected ? '🛡️ Управление защитой' : '🛡️ Защитить здание'}
                        </h3>

                        {isProtected && (
                            <div className="mb-4 p-3.5 bg-gradient-to-b from-sky-950/80 to-blue-950/80 border border-cyan-400/50 rounded-xl flex flex-col gap-2.5 shadow-lg shadow-cyan-950/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-cyan-300 font-black text-sm flex items-center gap-1.5">
                                        🛡️ Защита активна
                                    </span>
                                    {building.protectionEndTime && building.protectionEndTime > Date.now() && (
                                        <span className="text-xs font-bold text-cyan-200 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-500/40">
                                            {(() => {
                                                const diff = Math.max(0, building.protectionEndTime - Date.now());
                                                const totalSec = Math.floor(diff / 1000);
                                                const hours = Math.floor(totalSec / 3600);
                                                const mins = Math.floor((totalSec % 3600) / 60);
                                                const secs = totalSec % 60;
                                                if (hours > 24) {
                                                    const days = Math.floor(hours / 24);
                                                    return `Осталось: ${days} дн. ${hours % 24} ч.`;
                                                }
                                                if (hours > 0) {
                                                    return `Осталось: ${hours} ч. ${mins} мин.`;
                                                }
                                                return `Осталось: ${mins} мин. ${secs} с.`;
                                            })()}
                                        </span>
                                    )}
                                </div>
                                {building.shieldMaxHp !== undefined && building.shieldMaxHp > 0 && (
                                    <div className="text-xs text-gray-300 flex items-center justify-between">
                                        <span>Броня щита:</span>
                                        <span className="font-extrabold text-cyan-300">
                                            {building.shieldHp || 0} / {building.shieldMaxHp}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        if (window.confirm('Снять защиту со здания? Щит перестанет защищать постройку от врагов и урона.')) {
                                            handleRemoveProtection?.();
                                            setShowProtectionMenu(false);
                                        }
                                    }}
                                    className="w-full mt-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow-md border border-red-400/50 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    <span>❌ Снять защиту</span>
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col space-y-3">
                            <div className="text-xs font-semibold text-purple-200/90 mb-0.5">
                                {isProtected ? 'Продлить или сменить защиту:' : 'Выберите длительность защиты:'}
                            </div>
                            {PROTECTION_OPTIONS.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleApplyProtection(option.cost, option.duration)}
                                    disabled={playerRubies < option.cost}
                                    className="bg-gray-900/80 hover:bg-purple-950/60 disabled:bg-gray-900/40 disabled:cursor-not-allowed text-white p-3.5 rounded-xl border border-purple-500/30 hover:border-purple-400 flex items-center justify-between transition-all shadow-md"
                                >
                                    <div className="flex items-center font-bold">
                                        <img src={rubyImageUrl} alt="Ruby" className="w-6 h-6 mr-2 object-contain" />
                                        <span className="text-xl text-pink-400 font-extrabold">{option.cost}</span>
                                    </div>
                                    <span className="text-base font-semibold text-purple-100">{option.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-center text-purple-300/70">Щит получает урон первым. Когда броня щита падает до 0, урон начинает проходить в здание.</p>
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
        prevB.protectionEndTime !== nextB.protectionEndTime ||
        prevB.workState !== nextB.workState ||
        prevB.isConstructing !== nextB.isConstructing ||
        prevB.isDestroying !== nextB.isDestroying ||
        prevB.initiatorId !== nextB.initiatorId ||
        prevB.isActive !== nextB.isActive ||
        prevB.bank !== nextB.bank ||
        prevB.taxRate !== nextB.taxRate ||
        prevB.monsterMode !== nextB.monsterMode ||
        prevB.kotofeySettings !== nextB.kotofeySettings ||
        prevB.trollSettings !== nextB.trollSettings
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
        prevProps.placedBuildings !== nextProps.placedBuildings ||
        prevProps.currentUserId !== nextProps.currentUserId ||
        prevProps.townHallAvailableOrdersCount !== nextProps.townHallAvailableOrdersCount
    ) {
        return false;
    }

    return true;
};

export const SelectedBuildingModal = React.memo(SelectedBuildingModalComponent, arePropsEqual);
