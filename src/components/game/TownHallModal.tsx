import React, { useState, useEffect, useMemo } from 'react';
import type { Building, PlacedBuilding } from '../../../types';
import { items } from '../../../data/items';

export const TOWN_HALL_IDS = [301, 306, 312, 331, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 360, 361, 371, 381, 413, 414, 452, 726, 752];

export interface TownHallModalProps {
    building: PlacedBuilding;
    info: Building;
    onClose: () => void;
    playerGold: number;
    playerEnergy?: number;
    playerLevel?: number;
    currentPopulation?: number;
    maxPopulation?: number;
    inventory?: Record<number, number>;
    coinImageUrl?: string;
    rubyImageUrl?: string;
    playerRubies?: number;
    populationImageUrl?: string;
    canRepair: boolean;
    repairCost: number;
    handleRepair?: () => void;
    handleMoveClick?: () => void;
    handleSell?: () => void;
    handleUpgrade?: () => void;
    handleSpeedUp?: () => void;
    onOpenExplosionMenu?: () => void;
    handleDefuse?: () => void;
    onOpenProtectionMenu?: () => void;
    onOpenTownHallOrders?: () => void;
    townHallAvailableOrdersCount?: number;
    buildingData?: Building[];
    isMortarActive?: boolean;
}

export const TownHallModal: React.FC<TownHallModalProps> = ({
    building,
    info,
    onClose,
    playerGold,
    playerRubies = 0,
    inventory = {},
    coinImageUrl = '/Gui/GUI_TOWNHALL/money_bag.png',
    canRepair,
    repairCost,
    handleRepair,
    handleMoveClick,
    handleSell,
    handleUpgrade,
    handleSpeedUp,
    rubyImageUrl = '/Gui/GUI_TOWNHALL/ruby_icon.png',
    onOpenExplosionMenu,
    handleDefuse,
    onOpenProtectionMenu,
    onOpenTownHallOrders,
    townHallAvailableOrdersCount = 0,
    buildingData = [],
    isMortarActive = false
}) => {
    const [scale, setScale] = useState<number>(1);
    const [, setTick] = useState<number>(0);
    const [showResourcesModal, setShowResourcesModal] = useState<boolean>(false);

    // Responsive scaling to fit viewport while preserving exact 1024x1535 RGBA coordinate canvas
    useEffect(() => {
        const updateScale = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const padX = vw < 640 ? 8 : 24;
            const padY = vh < 640 ? 12 : 32;
            const maxW = Math.max(300, vw - padX);
            const maxH = Math.max(300, vh - padY);
            const targetW = 1024;
            const targetH = 1535;
            const scaleX = maxW / targetW;
            const scaleY = maxH / targetH;
            const calculated = Math.min(1, Math.min(scaleX, scaleY));
            setScale(Math.max(0.3, calculated));
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // 1-second interval for countdown timer if constructing
    useEffect(() => {
        if (!building.isConstructing) return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [building.isConstructing]);

    // Durability & Health calculations
    const durability = info.stats?.durability || 40;
    const maxHp = building.maxHp ?? durability;
    const currentHp = Math.max(0, Math.min(building.hp ?? maxHp, maxHp));
    // Show real current HP; pending mine damage is a separate line (DEC-012a):
    // it applies only when the destruction timer explodes.
    const displayHp = currentHp;

    // Construction status
    const isUnderConstruction = Boolean(
        building.isConstructing && (!building.constructionEndTime || building.constructionEndTime > Date.now())
    );
    const timeLeftMs = building.constructionEndTime ? Math.max(0, building.constructionEndTime - Date.now()) : 0;
    const timeLeftMinutes = Math.floor(timeLeftMs / 60000);
    const timeLeftSeconds = Math.floor((timeLeftMs % 60000) / 1000);
    const timeLeftFormatted = `${timeLeftMinutes}:${timeLeftSeconds.toString().padStart(2, '0')}`;

    // Upgrade details
    const nextInfo = useMemo(() => {
        if (!info.upgradesTo) return null;
        return buildingData.find(b => b.id === info.upgradesTo) || null;
    }, [info.upgradesTo, buildingData]);

    const upgradeCost = info.upgradeCost || 0;
    const speedUpCost = Math.max(1, info.stats?.accelerationCost || 1);
    const canAffordUpgrade = playerGold >= upgradeCost && !isUnderConstruction;

    // Target building info for construction/upgrade requirements
    const targetInfo = nextInfo || info;
    const requiredResources = targetInfo?.constructionRequirements?.resources || [];
    const targetGoldCost = nextInfo ? (info.upgradeCost || 0) : (info.price || 0);
    const requiredPopulation = targetInfo?.constructionRequirements?.population ?? 0;

    // Resolved list of required resources with inventory quantities and item icons
    const resolvedResources = useMemo(() => {
        return requiredResources.map(req => {
            const item = items.find(i => i.id === req.id || i.name.toLowerCase() === req.name.toLowerCase());
            const have = Number(inventory?.[req.id]) || 0;
            const need = req.amount || 0;
            const missing = Math.max(0, need - have);
            const hasEnough = have >= need;
            return {
                id: req.id,
                name: req.name || item?.name || `Ресурс #${req.id}`,
                imageUrl: item?.imageUrl || '',
                description: item?.description || '',
                have,
                need,
                missing,
                hasEnough
            };
        });
    }, [requiredResources, inventory]);

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center select-none overflow-hidden"
            onClick={onClose}
        >
            <div
                id="townhall-gui-container"
                style={{
                    width: 1024,
                    height: 1535,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                }}
                className="relative select-none flex-shrink-0 animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* 1. MASTER 3D GUI BACKGROUND ARTWORK (1024x1535 RGBA with transparent backdrop) */}
                <img
                    src="/Gui/GUI_TOWNHALL/townhall_modal_bg.png"
                    alt="Городской центр"
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 drop-shadow-[0_0_50px_rgba(234,179,8,0.35)]"
                />

                {/* 2. CLOSE BUTTON: (815, 130, 95, 95) */}
                <button
                    id="townhall_close_button"
                    onClick={onClose}
                    style={{ left: 815, top: 130, width: 95, height: 95 }}
                    className="absolute z-30 rounded-full cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-90 hover:brightness-125 focus:outline-none"
                    title="Закрыть"
                    aria-label="Закрыть окно"
                />

                {/* 3. DYNAMIC STAT VALUES: */}
                {/* 3.1. ПРОЧНОСТЬ VALUE: next to 'Прочность:' label */}
                <div
                    id="stat_val_durability"
                    style={{ left: 410, top: 368, height: 45 }}
                    className="absolute z-20 flex items-center pointer-events-none select-none"
                >
                    <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {durability}
                    </span>
                </div>

                {/* 3.2. ЗДОРОВЬЕ VALUE: next to 'Здоровье:' label */}
                <div
                    id="stat_val_health"
                    style={{ left: 400, top: 420, height: 45 }}
                    className="absolute z-20 flex items-center pointer-events-none select-none"
                >
                    <span className={`text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${displayHp < maxHp ? 'text-red-400' : 'text-green-400'}`}>
                        {displayHp} / {maxHp}
                    </span>
                    {building.isDestroying && (building.pendingDamage || 0) > 0 && (
                        <span className="block text-sm font-bold text-orange-300">
                            💣 Мина: −{building.pendingDamage} при взрыве
                            {building.destructionEndTime ? ` (через ${Math.max(0, Math.ceil((building.destructionEndTime - Date.now()) / 60000))} мин)` : ''}
                        </span>
                    )}
                </div>

                {/* 3.3. ДАЕТ НАСЕЛЕНИЕ VALUE: next to 'Дает население:' label */}
                <div
                    id="stat_val_population"
                    style={{ left: 495, top: 472, height: 45 }}
                    className="absolute z-20 flex items-center pointer-events-none select-none"
                >
                    <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {info.stats?.populationBonus || 0}
                    </span>
                </div>

                {/* 3.4. РЕСУРСЫ, НЕОБХОДИМЫЕ ДЛЯ ПОСТРОЙКИ (КЛИКАБЕЛЬНАЯ НАДПИСЬ-КНОПКА) */}
                <button
                    id="open_resources_req_button"
                    type="button"
                    onClick={() => setShowResourcesModal(true)}
                    style={{ left: 206, top: 515, width: 575, height: 44 }}
                    className="absolute z-20 flex items-center cursor-pointer group focus:outline-none rounded-lg transition-all duration-150 hover:bg-yellow-400/10 hover:ring-1 hover:ring-yellow-400/40 active:scale-[0.99]"
                    title="Нажмите, чтобы посмотреть необходимые ресурсы для постройки"
                >
                    <span className="sr-only">Ресурсы, необходимые для постройки</span>
                    {/* Visual hover hint */}
                    <div className="w-full h-full flex items-center justify-end pr-2 pointer-events-none">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-bold text-yellow-300 bg-purple-950/90 px-2.5 py-0.5 rounded-full border border-yellow-400/40 shadow-md flex items-center gap-1">
                            <span>посмотреть</span>
                            <span>📋</span>
                        </span>
                    </div>
                </button>

                {/* 4. MIDDLE SECTION: ORDERS PANEL (ЗАКАЗЫ РАТУШИ) */}
                {/* 4.1. Vertical Divider between Temple and Title */}
                <div
                    style={{
                        left: 308,
                        top: 610,
                        width: 2,
                        height: 60,
                        background: 'linear-gradient(to bottom, rgba(255, 240, 180, 0.1), rgba(255, 240, 180, 0.75) 30%, rgba(255, 240, 180, 0.75) 70%, rgba(255, 240, 180, 0.1))'
                    }}
                    className="absolute z-20 pointer-events-none"
                />

                {/* 4.2. Title & Subtitle */}
                <div
                    id="orders_panel_title"
                    style={{ left: 326, top: 608, width: 325, height: 64 }}
                    className="absolute z-20 flex flex-col justify-center pointer-events-none select-none text-left"
                >
                    <span
                        style={{
                            fontFamily: "'DejaVu Serif', Georgia, serif",
                            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)'
                        }}
                        className="text-[30px] font-bold text-[#FFF5D0] leading-none mb-1.5 tracking-tight"
                    >
                        Заказы Ратуши
                    </span>
                    <span
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            textShadow: '0 1px 2px rgba(0,0,0,0.9)'
                        }}
                        className="text-[17px] font-semibold text-[#EDE0CF]/90 leading-none tracking-normal"
                    >
                        Городские контракты на поставку ресурсов
                    </span>
                </div>

                {/* 4.3. Top-Right Golden Pill: available count */}
                <button
                    id="orders_badge_button"
                    onClick={onOpenTownHallOrders}
                    style={{ left: 660, top: 613, width: 215, height: 60 }}
                    className="absolute z-20 flex items-center justify-center px-2 cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95 hover:brightness-110 focus:outline-none"
                    title="Открыть заказы Ратуши"
                >
                    <span
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        className={`text-[21px] font-extrabold text-[#321200] text-center tracking-normal leading-none ${townHallAvailableOrdersCount > 0 ? 'animate-pulse' : ''}`}
                    >
                        {townHallAvailableOrdersCount > 0
                            ? `${townHallAvailableOrdersCount} доступно`
                            : 'Заказы'}
                    </span>
                </button>

                {/* 4.4. Large Golden Button with Scroll */}
                <button
                    id="orders_main_button"
                    onClick={onOpenTownHallOrders}
                    style={{ left: 75, top: 726, width: 850, height: 80 }}
                    className="absolute z-20 flex items-center cursor-pointer group transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                    title="Открыть городские заказы и контракты"
                >
                    <div style={{ marginLeft: 285, width: 560 }} className="flex items-center justify-center text-center">
                        <span
                            style={{
                                fontFamily: "'DejaVu Serif', Georgia, serif",
                                color: '#1d0b02',
                                textShadow: '0 1px 2px rgba(50, 15, 0, 0.35)',
                                letterSpacing: '-0.015em'
                            }}
                            className="text-[35px] font-bold select-none leading-none group-hover:text-amber-950 transition-colors"
                        >
                            Открыть заказы Ратуши
                        </span>
                    </div>
                </button>

                {/* 5. GREEN UPGRADE / CONSTRUCTION BUTTON: (90, 851, 826, 86) */}
                <button
                    id="upgrade_main_button"
                    onClick={isUnderConstruction ? handleSpeedUp : handleUpgrade}
                    disabled={!isUnderConstruction && (!canAffordUpgrade || !info.upgradesTo)}
                    style={{ left: 90, top: 851, width: 826, height: 86 }}
                    className={`absolute z-20 flex items-center justify-center cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] focus:outline-none ${
                        !isUnderConstruction && (!canAffordUpgrade || !info.upgradesTo)
                            ? 'opacity-70 cursor-not-allowed hover:scale-100'
                            : 'hover:brightness-110'
                    }`}
                    title={
                        isUnderConstruction
                            ? `Построить мгновенно за ${speedUpCost} рубинов`
                            : !info.upgradesTo
                            ? 'Максимальный уровень'
                            : !canAffordUpgrade
                            ? `Недостаточно золота (${playerGold}/${upgradeCost})`
                            : `Улучшить ратушу за ${upgradeCost} монет`
                    }
                >
                    <div style={{ marginLeft: 215, width: 590 }} className="flex items-center justify-center select-none">
                        {info.upgradesTo ? (
                            isUnderConstruction ? (
                                <div className="flex flex-col items-center justify-center">
                                    {/* Line 1: Hammer + Status + Time */}
                                    <div
                                        style={{
                                            fontFamily: "'DejaVu Serif', Georgia, 'Times New Roman', serif",
                                            color: '#FFF6D5',
                                            textShadow: '0 0 3px rgba(80, 50, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.95)'
                                        }}
                                        className="flex items-center justify-center gap-2 text-[28px] font-bold tracking-wide leading-none"
                                    >
                                        <span className="text-[30px] leading-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] flex items-center">🔨</span>
                                        <span>Идет строительство</span>
                                        <span className="text-amber-200 tracking-wider">({timeLeftFormatted})</span>
                                    </div>

                                    {/* Line 2: Instant Build Action with Rubies */}
                                    <div
                                        style={{
                                            fontFamily: "'DejaVu Serif', Georgia, 'Times New Roman', serif"
                                        }}
                                        className="mt-1 flex items-center justify-center gap-2 px-4 py-0.5 rounded-full bg-gradient-to-r from-amber-950/50 via-rose-950/60 to-amber-950/50 border border-amber-300/50 hover:border-amber-200 hover:brightness-125 active:scale-95 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] cursor-pointer"
                                        title={`Построить мгновенно за ${speedUpCost} рубинов`}
                                    >
                                        <span className="text-[22px] font-bold text-amber-200 tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-none">
                                            Построить мгновенно
                                        </span>
                                        <div className="flex items-center text-[22px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] leading-none">
                                            <span>(</span>
                                            <span className="text-pink-300 font-extrabold">{speedUpCost}</span>
                                            <img
                                                src={rubyImageUrl || '/Gui/GUI_TOWNHALL/ruby_icon.png'}
                                                alt="Рубины"
                                                className="w-auto h-[23px] mx-1 object-contain inline-block drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                                            />
                                            <span>)</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-12">
                                    <span
                                        style={{
                                            fontFamily: "'DejaVu Serif', Georgia, 'Times New Roman', serif",
                                            color: '#FFF6D5',
                                            textShadow: '0 0 3px rgba(80, 50, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.95)'
                                        }}
                                        className="text-[45px] font-bold tracking-wide leading-none"
                                    >
                                        Улучшить
                                    </span>
                                    <div
                                        style={{
                                            fontFamily: "'DejaVu Serif', Georgia, 'Times New Roman', serif",
                                            color: '#FFF6D5',
                                            textShadow: '0 0 3px rgba(80, 50, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.95)'
                                        }}
                                        className="flex items-center text-[45px] font-bold tracking-wide leading-none"
                                    >
                                        <span>(</span>
                                        <span>{upgradeCost}</span>
                                        <img
                                            src="/Gui/GUI_TOWNHALL/money_bag.png"
                                            alt="Золото"
                                            className="w-auto h-[54px] mx-1.5 object-contain inline-block drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
                                        />
                                        <span>)</span>
                                    </div>
                                </div>
                            )
                        ) : (
                            <span
                                style={{ fontFamily: "'DejaVu Serif', Georgia, 'Times New Roman', serif" }}
                                className="text-[38px] font-bold text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none"
                            >
                                Максимальный уровень
                            </span>
                        )}
                    </div>
                </button>

                {/* 6. ROW OF 3 BUTTONS (WRENCH, SHIELD, MOVE) - NO TEXT UNDERNEATH! */}
                {/* 6.1. WRENCH / REPAIR: (45, 955, 330, 110) */}
                <button
                    id="repair_button"
                    onClick={handleRepair}
                    disabled={!canRepair || playerGold < repairCost}
                    style={{ left: 45, top: 955, width: 330, height: 110 }}
                    className={`absolute z-20 rounded-2xl cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none ${
                        !canRepair || playerGold < repairCost ? 'opacity-70 cursor-not-allowed hover:scale-100' : 'hover:brightness-110'
                    }`}
                    title={
                        canRepair && repairCost > 0
                            ? isMortarActive
                                ? `Починить за ${repairCost} 💰 (-30% раствор)`
                                : `Починить за ${repairCost} 💰`
                            : 'Здание полностью исправно'
                    }
                />

                {/* 6.2. SHIELD / PROTECT: (380, 955, 255, 110) */}
                <button
                    id="protect_button"
                    onClick={onOpenProtectionMenu}
                    style={{ left: 380, top: 955, width: 255, height: 110 }}
                    className="absolute z-20 rounded-2xl cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 focus:outline-none"
                    title="Защитить ратушу щитом"
                />

                {/* 6.3. MOVE: (650, 955, 325, 110) */}
                <button
                    id="move_button"
                    onClick={handleMoveClick}
                    style={{ left: 650, top: 955, width: 325, height: 110 }}
                    className="absolute z-20 rounded-2xl cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 focus:outline-none"
                    title="Переместить ратушу на другое место (5 энергии)"
                />

                {/* 7. DANGER ROW: SELL & EXPLODE (Centered text matching reference) */}
                {/* 7.1. SELL: (76, 1073, 440, 95) */}
                <button
                    id="sell_button"
                    onClick={handleSell}
                    style={{ left: 76, top: 1073, width: 440, height: 95 }}
                    className="absolute z-20 flex items-center cursor-pointer transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 focus:outline-none"
                    title="Продать здание за 50% стоимости"
                >
                    <div style={{ marginLeft: 115, width: 285 }} className="flex items-center justify-center text-center">
                        <span
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                            className="text-[36px] font-extrabold text-white tracking-wide leading-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)]"
                        >
                            Продать
                        </span>
                    </div>
                </button>

                {/* 7.2. EXPLODE: (505, 1073, 445, 95) */}
                <button
                    id="explode_button"
                    onClick={building.isDestroying ? handleDefuse : onOpenExplosionMenu}
                    disabled={building.isDestroying && !handleDefuse}
                    style={{ left: 505, top: 1073, width: 445, height: 95 }}
                    className={`absolute z-20 flex items-center transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110 focus:outline-none ${(building.isDestroying && !handleDefuse) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={building.isDestroying ? "Здание заминировано — нажать для разминирования" : "Взорвать здание динамитом или бомбами"}
                >
                    <div style={{ marginLeft: 105, width: 285 }} className="flex items-center justify-center text-center">
                        <span
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                            className="text-[32px] font-extrabold text-white tracking-wide leading-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)]"
                        >
                            {building.isDestroying ? "Разминировать" : "Взорвать"}
                        </span>
                    </div>
                </button>

                {/* 8. RESOURCES REQUIREMENTS MODAL DIALOG */}
                {showResourcesModal && (
                    <div
                        id="resources_requirements_overlay"
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-8"
                        onClick={() => setShowResourcesModal(false)}
                    >
                        <div
                            id="resources_requirements_dialog"
                            className="relative w-[760px] max-w-full rounded-[32px] p-8 text-white select-none shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(234,179,8,0.35)] border-2 border-yellow-400/70"
                            style={{
                                background: 'radial-gradient(ellipse at top, #380d52 0%, #1e052d 50%, #0d0115 100%)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between pb-5 border-b border-yellow-500/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-900/60 border border-yellow-400/40 flex items-center justify-center text-3xl shadow-inner">
                                        📦
                                    </div>
                                    <div>
                                        <h2
                                            style={{ fontFamily: "'DejaVu Serif', Georgia, serif" }}
                                            className="text-[32px] font-bold text-amber-200 tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                        >
                                            Ресурсы для постройки
                                        </h2>
                                        <p className="text-[17px] text-amber-100/75 mt-0.5">
                                            {nextInfo ? `Улучшение: «${nextInfo.name}»` : `Здание: «${info.name}»`}
                                        </p>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <button
                                    id="close_resources_req_dialog"
                                    type="button"
                                    onClick={() => setShowResourcesModal(false)}
                                    className="w-12 h-12 rounded-full bg-gradient-to-b from-red-600 to-red-800 border-2 border-yellow-300/80 text-white font-black text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg hover:brightness-110 cursor-pointer"
                                    title="Закрыть"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="mt-6 space-y-5 max-h-[700px] overflow-y-auto pr-2">
                                {/* 1. Resources Grid */}
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-amber-300/80 font-bold mb-3 flex items-center gap-2">
                                        <span>Необходимые материалы</span>
                                        <span className="text-xs bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30">
                                            {resolvedResources.length}
                                        </span>
                                    </div>

                                    {resolvedResources.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {resolvedResources.map(res => (
                                                <div
                                                    key={res.id}
                                                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                                        res.hasEnough
                                                            ? 'bg-purple-950/40 border-emerald-500/40'
                                                            : 'bg-red-950/30 border-red-500/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl bg-black/50 border border-yellow-500/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
                                                            {res.imageUrl ? (
                                                                <img
                                                                    src={res.imageUrl}
                                                                    alt={res.name}
                                                                    className="w-full h-full object-contain drop-shadow"
                                                                    onError={e => {
                                                                        (e.target as HTMLElement).style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-2xl">🪵</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-[22px] font-bold text-white tracking-wide">
                                                                {res.name}
                                                            </div>
                                                            {res.description && (
                                                                <div className="text-xs text-amber-100/60 max-w-sm line-clamp-1">
                                                                    {res.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Quantities & Status badge */}
                                                    <div className="flex items-center gap-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className={`text-[26px] font-black ${res.hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                                                                    {res.have}
                                                                </span>
                                                                <span className="text-lg text-amber-200/60 font-bold">
                                                                    / {res.need}
                                                                </span>
                                                            </div>
                                                            {res.missing > 0 ? (
                                                                <span className="text-xs font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40 mt-1">
                                                                    Не хватает: -{res.missing}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 mt-1">
                                                                    ✓ Достаточно
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center text-amber-200/80 text-lg">
                                            Для данного уровня не требуются строительные ресурсы.
                                        </div>
                                    )}
                                </div>

                                {/* 2. Gold Cost Card */}
                                {targetGoldCost > 0 && (
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-amber-950/40 border border-yellow-500/40">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={coinImageUrl || '/Gui/GUI_TOWNHALL/money_bag.png'}
                                                alt="Монеты"
                                                className="w-12 h-12 object-contain drop-shadow"
                                            />
                                            <div>
                                                <div className="text-lg font-bold text-amber-200">
                                                    Стоимость {nextInfo ? 'улучшения' : 'постройки'}
                                                </div>
                                                <div className="text-xs text-amber-100/60">
                                                    Золотые монеты из казны города
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className={`text-[24px] font-black ${playerGold >= targetGoldCost ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {playerGold.toLocaleString()}
                                                </span>
                                                <span className="text-base text-amber-200/60 font-bold">
                                                    / {targetGoldCost.toLocaleString()} 💰
                                                </span>
                                            </div>
                                            {playerGold < targetGoldCost ? (
                                                <span className="text-xs font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-500/40 mt-1">
                                                    Не хватает: -{(targetGoldCost - playerGold).toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 mt-1">
                                                    ✓ Достаточно золота
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 3. Population Requirement (if any) */}
                                {requiredPopulation > 0 && (
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">👥</span>
                                            <div>
                                                <div className="text-lg font-bold text-amber-200">
                                                    Требуется свободных жителей
                                                </div>
                                                <div className="text-xs text-amber-100/60">
                                                    Рабочие руки для строительства
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[24px] font-black text-amber-300">
                                            {requiredPopulation}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Button */}
                            <div className="mt-6 pt-4 border-t border-yellow-500/30 flex justify-center">
                                <button
                                    id="confirm_resources_req_dialog"
                                    type="button"
                                    onClick={() => setShowResourcesModal(false)}
                                    style={{ fontFamily: "'DejaVu Serif', Georgia, serif" }}
                                    className="px-12 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 text-xl font-black shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-yellow-200"
                                >
                                    Понятно
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
