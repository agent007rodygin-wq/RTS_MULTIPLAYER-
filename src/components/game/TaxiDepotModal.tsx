import React, { useState, useEffect, useMemo } from 'react';
import type { Building, PlacedBuilding } from '../../../types';
import {
    Shield,
    Heart,
    Users,
    Coins,
    Wrench,
    ChevronsUp,
    ChevronRight,
    Play,
    Clock,
    Settings,
    Info,
    X,
    Sparkles,
    Move,
    Flame,
    CheckCircle2,
    TrendingUp,
    Award,
    Car,
    UserCheck,
    Plus,
    UserPlus
} from 'lucide-react';

export interface TaxiDepotModalProps {
    building: PlacedBuilding;
    info: Building;
    onClose: () => void;
    playerGold: number;
    playerLevel: number;
    inventory: Record<number, number>;
    coinImageUrl?: string;
    rubyImageUrl?: string;
    populationImageUrl?: string;
    isMine: boolean;
    canRepair: boolean;
    repairCost: number;
    handleStartProduction?: () => void;
    handleCollectProduction?: () => void;
    handleRepair?: () => void;
    handleMoveClick?: () => void;
    handleSell?: () => void;
    handleExplode?: (...args: any[]) => void;
    handleApplyProtection?: (...args: any[]) => void;
    handleUpgrade?: () => void;
    onOpenExplosionMenu?: () => void;
    onOpenProtectionMenu?: () => void;
    getCanonicalItemName?: (itemId: number, defaultName?: string, buildingId?: number | string) => string;
    initialTab?: TabType;
}

type TabType = 'management' | 'upgrades' | 'fleet' | 'staff' | 'stats';

export const TaxiDepotModal: React.FC<TaxiDepotModalProps> = ({
    building,
    info,
    onClose,
    playerGold,
    playerLevel,
    inventory,
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    rubyImageUrl = '/Gui/Front/значек рубинов/Image 1800.webp',
    populationImageUrl = '/Gui/popul.webp',
    isMine,
    canRepair,
    repairCost,
    handleStartProduction,
    handleCollectProduction,
    handleRepair,
    handleMoveClick,
    handleSell,
    handleExplode,
    handleApplyProtection,
    handleUpgrade,
    onOpenExplosionMenu,
    onOpenProtectionMenu,
    initialTab = 'management',
}) => {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [currentTime, setCurrentTime] = useState<number>(Date.now());
    const [selectedCarCategory, setSelectedCarCategory] = useState<string | null>('standard');
    const [scale, setScale] = useState<number>(1);

    // Responsive scaling to fit any viewport while preserving the exact 1200x1312 coordinate canvas
    useEffect(() => {
        const updateScale = () => {
            if (window.location.search.includes('unscaled=true')) {
                setScale(1);
                return;
            }
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const targetW = 1200;
            const targetH = 1312;
            const scaleX = vw / targetW;
            const scaleY = vh / targetH;
            const calculated = Math.min(1, Math.min(scaleX, scaleY));
            setScale(Math.max(0.35, calculated));
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Fleet state persisted in localStorage for simulation depth
    const storageKey = `basingse_taxodepot_fleet_${building.id}`;
    const [fleetData, setFleetData] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);
        } catch {
            // fallback
        }
        return {
            standard: 18,
            comfort: 4,
            minivan: 2,
            hiredDispatchers: 3,
            hiredDrivers: 24,
            hiredMechanics: 2,
            completedTrips: 1428,
            totalEarnedCoins: 142500
        };
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(fleetData));
        } catch {
            // ignore
        }
    }, [fleetData, storageKey]);

    // Live countdown tick
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Building Stats calculations
    const durability = info.stats?.durability || 5000;
    const currentHp = building.hp ?? durability;
    const maxHp = building.maxHp ?? durability;
    const populationBonus = info.stats?.populationBonus || 5;
    const workTimeTotal = info.stats?.workTimeSeconds || 1800; // 30 minutes
    const baseIncome = info.stats?.workYieldGold || 1500;
    
    // Dynamic Level from building (defaults to level 1 for new buildings, supports up to 10)
    const currentLevel = Math.max(1, Math.min(10, Math.floor((building as any).level || 1)));
    const nextLevel = Math.min(10, currentLevel + 1);
    const levelBadgeUrl = `/Gui/TaxiGui/levels/level_badge_${String(currentLevel).padStart(2, '0')}.png`;

    // Production State
    const isWorking = building.workState === 'working';
    const isFinished = building.workState === 'finished';
    const workEndTime = building.workEndTime || (isWorking ? currentTime + workTimeTotal * 1000 : 0);

    const remainingMs = Math.max(0, workEndTime - currentTime);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const progressFraction = isWorking && workTimeTotal > 0
        ? Math.min(1, Math.max(0, 1 - remainingSeconds / workTimeTotal))
        : isFinished ? 1 : 0;

    // 8 segmented progress steps (concept reference: 2 of 8 lit when 26m 13s remains of 30m)
    const totalSegments = 8;
    const activeSegments = isWorking
        ? Math.max(1, Math.min(totalSegments, Math.floor(progressFraction * totalSegments) + 1))
        : isFinished ? totalSegments : 0;

    const formattedTime = useMemo(() => {
        if (!isWorking) {
            const mins = Math.floor(workTimeTotal / 60);
            const secs = workTimeTotal % 60;
            return `${mins}м ${secs > 0 ? `${secs}с` : '00с'}`;
        }
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        return `${mins}м ${String(secs).padStart(2, '0')}с`;
    }, [isWorking, remainingSeconds, workTimeTotal]);

    const totalCarsCount = fleetData.standard + fleetData.comfort + fleetData.minivan;

    // Handle Buy Car
    const buyCar = (category: 'standard' | 'comfort' | 'minivan', price: number) => {
        if (playerGold < price) {
            alert('Недостаточно монет для покупки автомобиля!');
            return;
        }
        setFleetData(prev => ({
            ...prev,
            [category]: prev[category] + 1,
            completedTrips: prev.completedTrips + 14
        }));
    };

    // Handle Hire Staff
    const hireStaff = (type: 'hiredDispatchers' | 'hiredDrivers' | 'hiredMechanics', price: number) => {
        if (playerGold < price) {
            alert('Недостаточно монет для найма сотрудника!');
            return;
        }
        setFleetData(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }));
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-0 overflow-hidden"
            onClick={onClose}
        >
            {/* Exactly 1200x1312 Design Canvas, scaled as single unit, guaranteeing 100% pixel-perfection */}
            <div
                id="taxi-gui-modal-container"
                style={{
                    width: 1200,
                    height: 1312,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                }}
                className="relative select-none flex-shrink-0 animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* 1. 3D WINDOW FRAME IMAGE (1200x1312) */}
                <img
                    src="/Gui/TaxiGui/alignment_preview_1200x1312.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 drop-shadow-[0_0_50px_rgba(245,158,11,0.3)]"
                />

                {/* 1.1 WINDOW FRAME INNER GOLDEN PERIMETER: (11, 73, 1170, 1187) */}
                <div
                    id="window_frame"
                    style={{ left: 11, top: 73, width: 1170, height: 1187 }}
                    className="absolute pointer-events-none z-0"
                />

                {/* 1.2 TOP BADGE (TAXI EMBLEM): (408, 9, 356, 82) */}
                <div
                    id="top_badge"
                    style={{ left: 408, top: 9, width: 356, height: 82 }}
                    className="absolute pointer-events-none z-10"
                />

                {/* 2. CLOSE BUTTON: (1085, 75, 72, 72) */}
                <button
                    id="close_button"
                    onClick={onClose}
                    style={{ left: 1085, top: 75, width: 72, height: 72 }}
                    className="absolute z-30 rounded-full transition-transform hover:scale-105 active:scale-95 group focus:outline-none"
                    title="Закрыть"
                >
                    <img
                        src="/Gui/TaxiGui/02_ICONS/close.png"
                        alt="Закрыть"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_12px_rgba(168,85,247,0.5)] group-hover:brightness-125"
                    />
                </button>

                {/* 3. TAXI DEPOT BUILDING ART: (26, 14, 466, 497) */}
                <div
                    id="taxi_depot_building"
                    style={{ left: 26, top: 14, width: 466, height: 497 }}
                    className="absolute z-10 flex items-center justify-center pointer-events-none"
                >
                    <img
                        src="/Gui/TaxiGui/building_master_466x497.png"
                        alt="Таксопарк"
                        className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                    />
                </div>

                {/* 4. TITLE & SUBTITLE: (485, 113, 539, 82) */}
                <div
                    id="title_and_subtitle"
                    style={{ left: 485, top: 113, width: 539, height: 82 }}
                    className="absolute z-20 flex flex-col justify-center"
                >
                    <h2 className="text-[44px] font-black tracking-tight text-[#fff9e6] drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] leading-none">
                        Таксопарк
                    </h2>
                    <p className="text-[17px] text-[#baa4e0] font-semibold mt-2 drop-shadow">
                        Городская служба такси и стоянка автомобилей
                    </p>
                </div>

                {/* 5. LEVEL BADGE: (497, 232, 137, 129) */}
                <div
                    id="level_badge"
                    style={{ left: 497, top: 232, width: 137, height: 129 }}
                    className="absolute z-20 flex items-center justify-center"
                >
                    <img
                        src={levelBadgeUrl}
                        alt={`Уровень ${currentLevel}`}
                        className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.55)] transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Gui/TaxiGui/levels/level_badge_01.png';
                        }}
                    />
                </div>

                {/* 6. TOP PRODUCTION SUMMARY: (648, 222, 506, 166) */}
                <div
                    id="production_summary"
                    style={{ left: 648, top: 222, width: 506, height: 166 }}
                    className="absolute z-20"
                >
                    <img
                        src="/Gui/TaxiGui/production_summary_clean_506x166.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-md"
                    />

                    {/* Dynamic Countdown Text: right aligned next to "До следующей партии:" */}
                    <div className="absolute left-[274px] top-[94px] text-[15px] font-black text-white leading-none z-30">
                        {isWorking ? formattedTime : '26м 13с'}
                    </div>

                    {/* Golden progress bar inside groove */}
                    <div
                        className="absolute left-[24px] top-[126px] h-[18px] rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] transition-all duration-300 z-30"
                        style={{ width: `${isWorking ? Math.max(20, Math.round(progressFraction * 455)) : 412}px` }}
                    />
                </div>

                {/* 7. STAT CARDS ROW: (y=411, h=82) */}
                {/* 7.1 Прочность: (463, 411, 159, 82) */}
                <div
                    id="stat_durability"
                    style={{ left: 463, top: 411, width: 159, height: 82 }}
                    className="absolute z-20 rounded-2xl bg-gradient-to-b from-[#221042]/95 to-[#130729]/95 border border-purple-400/35 px-3.5 flex items-center gap-3 shadow-lg"
                >
                    <div className="w-[46px] h-[46px] flex items-center justify-center flex-shrink-0">
                        <img src="/Gui/TaxiGui/icon_stat_durability.png" alt="" className="w-full h-full object-contain drop-shadow" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[14px] font-bold text-[#b49cd9] leading-tight">Прочность</span>
                        <span className="text-[20px] font-black text-white leading-tight mt-0.5">{durability.toLocaleString()}</span>
                    </div>
                </div>

                {/* 7.2 Здоровье: (632, 411, 185, 82) */}
                <div
                    id="stat_health"
                    style={{ left: 632, top: 411, width: 185, height: 82 }}
                    className="absolute z-20 rounded-2xl bg-gradient-to-b from-[#221042]/95 to-[#130729]/95 border border-purple-400/35 px-3.5 flex items-center gap-3 shadow-lg"
                >
                    <div className="w-[46px] h-[46px] flex items-center justify-center flex-shrink-0">
                        <img src="/Gui/TaxiGui/icon_stat_health.png" alt="" className="w-full h-full object-contain drop-shadow" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[14px] font-bold text-[#b49cd9] leading-tight">Здоровье</span>
                        <span className="text-[17px] font-black text-[#4ade80] leading-tight mt-0.5">
                            {currentHp.toLocaleString()} <span className="text-[13px] text-gray-300 font-bold">/ {maxHp.toLocaleString()}</span>
                        </span>
                    </div>
                </div>

                {/* 7.3 Население: (827, 411, 161, 82) */}
                <div
                    id="stat_population"
                    style={{ left: 827, top: 411, width: 161, height: 82 }}
                    className="absolute z-20 rounded-2xl bg-gradient-to-b from-[#221042]/95 to-[#130729]/95 border border-purple-400/35 px-3.5 flex items-center gap-3 shadow-lg"
                >
                    <div className="w-[46px] h-[46px] flex items-center justify-center flex-shrink-0">
                        <img src="/Gui/TaxiGui/icon_stat_population.png" alt="" className="w-full h-full object-contain drop-shadow" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[14px] font-bold text-[#b49cd9] leading-tight">Население</span>
                        <span className="text-[20px] font-black text-white leading-tight mt-0.5">+{populationBonus}</span>
                    </div>
                </div>

                {/* 7.4 Доход: (996, 411, 163, 82) */}
                <div
                    id="stat_income"
                    style={{ left: 996, top: 411, width: 163, height: 82 }}
                    className="absolute z-20 rounded-2xl bg-gradient-to-b from-[#221042]/95 to-[#130729]/95 border border-purple-400/35 px-3.5 flex items-center gap-3 shadow-lg"
                >
                    <div className="w-[46px] h-[46px] flex items-center justify-center flex-shrink-0">
                        <img src="/Gui/TaxiGui/icon_stat_income.png" alt="" className="w-full h-full object-contain drop-shadow" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <span className="text-[14px] font-bold text-[#b49cd9] leading-tight">Доход</span>
                        <span className="text-[18px] font-black text-[#fbbf24] leading-tight mt-0.5">{baseIncome.toLocaleString()} / ч</span>
                    </div>
                </div>

                {/* 8. NAVIGATION TABS (521, 69) */}
                {/* 8.1 Управление: (40, 521, 234, 69) */}
                <button
                    id="tab_control"
                    onClick={() => setActiveTab('management')}
                    style={{ left: 40, top: 521, width: 234, height: 69 }}
                    className="absolute z-20 transition-transform hover:scale-[1.02] active:scale-95 group focus:outline-none"
                >
                    <img
                        src="/Gui/TaxiGui/tab_control_clean_234x69.png"
                        alt="Управление"
                        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                    />
                </button>

                {/* 8.2 Улучшения: (281, 521, 232, 69) */}
                <button
                    id="tab_upgrade"
                    onClick={() => setActiveTab('upgrades')}
                    style={{ left: 281, top: 521, width: 232, height: 69 }}
                    className="absolute z-20 transition-transform hover:scale-[1.02] active:scale-95 group focus:outline-none"
                >
                    <img
                        src="/Gui/TaxiGui/tab_upgrade_clean_232x69.png"
                        alt="Улучшения"
                        className="w-full h-full object-contain pointer-events-none hover:brightness-125"
                    />
                </button>

                {/* 8.3 Автопарк: (520, 521, 210, 69) */}
                <button
                    id="tab_fleet"
                    onClick={() => setActiveTab('fleet')}
                    style={{ left: 520, top: 521, width: 210, height: 69 }}
                    className="absolute z-20 transition-transform hover:scale-[1.02] active:scale-95 group focus:outline-none"
                >
                    <img
                        src="/Gui/TaxiGui/tab_fleet_clean_210x69.png"
                        alt="Автопарк"
                        className="w-full h-full object-contain pointer-events-none hover:brightness-125"
                    />
                </button>

                {/* 8.4 Персонал: (736, 521, 204, 69) */}
                <button
                    id="tab_staff"
                    onClick={() => setActiveTab('staff')}
                    style={{ left: 736, top: 521, width: 204, height: 69 }}
                    className="absolute z-20 transition-transform hover:scale-[1.02] active:scale-95 group focus:outline-none"
                >
                    <img
                        src="/Gui/TaxiGui/tab_staff_clean_204x69.png"
                        alt="Персонал"
                        className="w-full h-full object-contain pointer-events-none hover:brightness-125"
                    />
                </button>

                {/* 8.5 Статистика: (945, 521, 214, 69) */}
                <button
                    id="tab_stats"
                    onClick={() => setActiveTab('stats')}
                    style={{ left: 945, top: 521, width: 214, height: 69 }}
                    className="absolute z-20 transition-transform hover:scale-[1.02] active:scale-95 group focus:outline-none"
                >
                    <img
                        src="/Gui/TaxiGui/tab_stats_clean_214x69.png"
                        alt="Статистика"
                        className="w-full h-full object-contain pointer-events-none hover:brightness-125"
                    />
                </button>

                {/* ========================================================================= */}
                {/* TAB 1: УПРАВЛЕНИЕ (Exact layout matching Image 2 & specification Image 3) */}
                {/* ========================================================================= */}
                {activeTab === 'management' && (
                    <>
                        {/* 9. PRODUCTION BOX: (39, 611, 614, 436) */}
                        <div
                            id="production_box"
                            style={{ left: 39, top: 611, width: 614, height: 436 }}
                            className="absolute z-20 bg-gradient-to-b from-[#241245]/95 via-[#180a32]/95 to-[#0f0422]/98 border border-purple-400/40 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* 9.1 Header: (69, 629, 369, 51) -> local: left=29, top=17 */}
                            <div
                                id="production_header"
                                style={{ left: 29, top: 17, width: 369, height: 51 }}
                                className="absolute flex items-center gap-3.5"
                            >
                                <img src="/Gui/TaxiGui/gear_clean.png" alt="" className="w-[42px] h-[42px] object-contain drop-shadow" />
                                <h3 className="text-[26px] font-black text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    Производство такси
                                </h3>
                            </div>

                            {/* Thin purple divider under header */}
                            <div className="absolute left-[20px] right-[20px] top-[68px] border-b border-purple-500/25" />

                            {/* 9.2 Conveyor: (55, 688, 369, 184) -> local: left=15, top=76 */}
                            <div
                                id="conveyor"
                                style={{ left: 15, top: 76, width: 369, height: 184 }}
                                className="absolute rounded-xl overflow-hidden border border-purple-500/30 shadow-md"
                            >
                                <img
                                    src="/Gui/TaxiGui/conveyor_scene_369x184.png"
                                    alt="Конвейер"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* 9.3 Batch details: (442, 709, 187, 148) -> local: left=402, top=97 */}
                            <div
                                id="batch_details"
                                style={{ left: 402, top: 97, width: 187, height: 148 }}
                                className="absolute flex flex-col justify-center"
                            >
                                <span className="text-[17px] font-bold text-[#b49cd9]">Текущая партия</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <img src="/Gui/TaxiGui/icon_taxi_glowing_clean.png" alt="" className="w-[36px] h-[22px] object-contain drop-shadow" />
                                    <span className="text-[25px] font-black text-white ml-1">
                                        {isWorking ? `${activeSegments} / 8` : isFinished ? '8 / 8' : '1 / 8'}
                                    </span>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b0d36]/90 border border-purple-400/40 text-[18px] font-black text-white shadow-md self-start">
                                    <img src="/Gui/TaxiGui/02_ICONS/clock.png" alt="" className="w-5 h-5 object-contain" />
                                    <span>{isWorking ? formattedTime : '26м 13с'}</span>
                                </div>
                            </div>

                            {/* 9.4 8-Segment Progress Bar: (79, 873, 537, 52) -> local: left=39, top=261 */}
                            <div
                                id="progress_bar"
                                style={{ left: 39, top: 261, width: 537, height: 52 }}
                                className="absolute flex items-center"
                            >
                                <div className="w-full h-[40px] bg-[#0c041a] rounded-xl border border-purple-500/30 p-1 flex items-center gap-2 shadow-inner">
                                    {Array.from({ length: totalSegments }).map((_, idx) => {
                                        const isFilled = idx < (isWorking ? activeSegments : 2);
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex-1 h-full rounded-md transition-all duration-300 ${
                                                    isFilled
                                                        ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.9)] border border-amber-300/80'
                                                        : 'bg-[#160a28] border border-purple-500/25'
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 9.5 Start Button: (69, 946, 560, 71) -> local: left=29, top=334 */}
                            <div
                                id="start_button"
                                style={{ left: 29, top: 334, width: 560, height: 71 }}
                                className="absolute"
                            >
                                {isMine && (
                                    <>
                                        {!isWorking && !isFinished && (
                                            <button
                                                onClick={handleStartProduction}
                                                className="w-full h-full relative transition-transform hover:scale-[1.01] active:scale-98 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.5)] focus:outline-none group"
                                            >
                                                <img
                                                    src="/Gui/TaxiGui/btn_primary_authentic_560x71.png"
                                                    alt="Начать работу"
                                                    className="w-full h-full object-fill pointer-events-none group-hover:brightness-110"
                                                />
                                            </button>
                                        )}

                                        {isWorking && (
                                            <div className="w-full h-full rounded-xl font-black text-[18px] text-amber-300 bg-[#241344] border border-amber-400/40 flex items-center justify-between px-6 shadow-inner">
                                                <div className="flex items-center gap-2.5">
                                                    <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
                                                    <span>Идет работа парка...</span>
                                                </div>
                                                <span className="font-extrabold text-white bg-amber-500/20 px-3 py-1 rounded-lg border border-amber-400/30">
                                                    {formattedTime}
                                                </span>
                                            </div>
                                        )}

                                        {isFinished && (
                                            <button
                                                onClick={handleCollectProduction}
                                                className="w-full h-full rounded-xl font-black text-[18px] text-[#180828] bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 hover:from-yellow-200 hover:to-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.7)] flex items-center justify-center gap-2.5 transition-all animate-bounce focus:outline-none"
                                            >
                                                <Coins className="w-6 h-6 text-[#180828]" />
                                                <span>Собрать доход (+{baseIncome} монет)</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 10. ACTION BUTTONS BELOW LEFT CARD (inside golden border at y=1260) */}
                        {isMine && (
                            <>
                                {/* Row 1: y=1063, h=68 */}
                                {/* 10.1 Починить: (55, 1063, 192, 68) */}
                                <button
                                    id="repair_button"
                                    onClick={handleRepair}
                                    disabled={!canRepair || playerGold < repairCost}
                                    style={{ left: 55, top: 1063, width: 192, height: 68 }}
                                    className="absolute z-20 transition-transform active:scale-95 hover:brightness-110 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none"
                                    title={canRepair && repairCost > 0 ? `Починить (${repairCost} монет)` : 'Починить'}
                                >
                                    <img
                                        src="/Gui/TaxiGui/button_repair.png"
                                        alt="Починить"
                                        className="w-full h-full object-fill pointer-events-none drop-shadow-md"
                                    />
                                </button>

                                {/* 10.2 Защитить: (258, 1063, 191, 68) */}
                                <button
                                    id="protect_button"
                                    onClick={onOpenProtectionMenu || handleApplyProtection}
                                    style={{ left: 258, top: 1063, width: 191, height: 68 }}
                                    className="absolute z-20 transition-transform active:scale-95 hover:brightness-110 focus:outline-none"
                                    title="Защитить здание"
                                >
                                    <img
                                        src="/Gui/TaxiGui/button_protect.png"
                                        alt="Защитить"
                                        className="w-full h-full object-fill pointer-events-none drop-shadow-md"
                                    />
                                </button>

                                {/* 10.3 Переместить: (456, 1063, 193, 68) */}
                                <button
                                    id="move_button"
                                    onClick={handleMoveClick}
                                    style={{ left: 456, top: 1063, width: 193, height: 68 }}
                                    className="absolute z-20 transition-transform active:scale-95 hover:brightness-110 focus:outline-none"
                                    title="Переместить здание"
                                >
                                    <img
                                        src="/Gui/TaxiGui/button_move.png"
                                        alt="Переместить"
                                        className="w-full h-full object-fill pointer-events-none drop-shadow-md"
                                    />
                                </button>

                                {/* Row 2: y=1149, h=71 */}
                                {/* 10.4 Продать: (55, 1149, 290, 71) */}
                                <button
                                    id="sell_button"
                                    onClick={handleSell}
                                    style={{ left: 55, top: 1149, width: 290, height: 71 }}
                                    className="absolute z-20 transition-transform active:scale-95 hover:brightness-110 focus:outline-none"
                                    title="Продать здание"
                                >
                                    <img
                                        src="/Gui/TaxiGui/button_sell.png"
                                        alt="Продать"
                                        className="w-full h-full object-fill pointer-events-none drop-shadow-md"
                                    />
                                </button>

                                {/* 10.5 Взорвать: (355, 1149, 290, 71) */}
                                <button
                                    id="destroy_button"
                                    onClick={building.isDestroying ? undefined : (onOpenExplosionMenu || handleExplode)}
                                    disabled={building.isDestroying}
                                    style={{ left: 355, top: 1149, width: 290, height: 71 }}
                                    className={`absolute z-20 transition-transform active:scale-95 hover:brightness-110 focus:outline-none ${building.isDestroying ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={building.isDestroying ? "Здание уже взрывается" : "Взорвать здание"}
                                >
                                    <img
                                        src="/Gui/TaxiGui/button_destroy.png"
                                        alt="Взорвать"
                                        className="w-full h-full object-fill pointer-events-none drop-shadow-md"
                                    />
                                </button>
                            </>
                        )}

                        {/* 11. FLEET BOX: (670, 611, 489, 612) */}
                        <div
                            id="fleet_box"
                            style={{ left: 670, top: 611, width: 489, height: 612 }}
                            className="absolute z-20 bg-gradient-to-b from-[#241245]/95 via-[#180a32]/95 to-[#0f0422]/98 border border-purple-400/40 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* 11.1 Fleet Header: (688, 622, 455, 59) -> local: left=17, top=10 */}
                            <div
                                id="fleet_header"
                                style={{ left: 17, top: 10, width: 455, height: 59 }}
                                className="absolute flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <img src="/Gui/TaxiGui/icon_taxi_fleet_header_authentic.png" alt="" className="w-[47px] h-[33px] object-contain drop-shadow" />
                                    <h3 className="text-[26px] font-black text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Автопарк</h3>
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-[#180a2f] border border-purple-400/40 text-[15px] font-black text-purple-200 shadow-inner">
                                    Всего: {totalCarsCount || 24}
                                </span>
                            </div>

                            {/* 11.2 Standard Taxi: (689, 696, 451, 72) -> local: left=18, top=84 */}
                            <div
                                id="fleet_standard"
                                onClick={() => setSelectedCarCategory('standard')}
                                style={{ left: 18, top: 84, width: 451, height: 72 }}
                                className="absolute flex items-center justify-between px-3 rounded-2xl bg-gradient-to-r from-[#2a134e] to-[#1c0c36] border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-[125px] h-[66px] flex items-center justify-center flex-shrink-0 -ml-1">
                                        <img
                                            src="/Gui/TaxiGui/car_standard_clean.png"
                                            alt="Стандартное такси"
                                            className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[18px] font-black text-white group-hover:text-amber-300 transition-colors">
                                            Стандартное такси
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[15px] font-black text-[#4ade80] mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                                            <span>{fleetData.standard} шт.</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-amber-400 group-hover:translate-x-1 transition-all mr-2" />
                            </div>

                            {/* 11.3 Comfort Taxi: (689, 779, 451, 73) -> local: left=18, top=167 */}
                            <div
                                id="fleet_comfort"
                                onClick={() => setSelectedCarCategory('comfort')}
                                style={{ left: 18, top: 167, width: 451, height: 73 }}
                                className="absolute flex items-center justify-between px-3 rounded-2xl bg-gradient-to-r from-[#1a0a32]/90 to-[#120526]/90 hover:bg-[#231045] border border-purple-500/30 hover:border-amber-400/50 cursor-pointer group shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-[125px] h-[66px] flex items-center justify-center flex-shrink-0 -ml-1">
                                        <img
                                            src="/Gui/TaxiGui/car_comfort_clean.png"
                                            alt="Комфорт"
                                            className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[18px] font-black text-white group-hover:text-amber-300 transition-colors">
                                            Комфорт
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[15px] font-black text-[#4ade80] mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                                            <span>{fleetData.comfort} шт.</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-purple-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mr-2" />
                            </div>

                            {/* 11.4 Minivan: (689, 862, 451, 72) -> local: left=18, top=250 */}
                            <div
                                id="fleet_minivan"
                                onClick={() => setSelectedCarCategory('minivan')}
                                style={{ left: 18, top: 250, width: 451, height: 72 }}
                                className="absolute flex items-center justify-between px-3 rounded-2xl bg-gradient-to-r from-[#1a0a32]/90 to-[#120526]/90 hover:bg-[#231045] border border-purple-500/30 hover:border-amber-400/50 cursor-pointer group shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-[125px] h-[66px] flex items-center justify-center flex-shrink-0 -ml-1">
                                        <img
                                            src="/Gui/TaxiGui/car_minivan_clean.png"
                                            alt="Минивэн"
                                            className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[18px] font-black text-white group-hover:text-amber-300 transition-colors">
                                            Минивэн
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[15px] font-black text-[#4ade80] mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                                            <span>{fleetData.minivan} шт.</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-purple-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mr-2" />
                            </div>

                            {/* 11.5 Fleet Income: (688, 959, 455, 68) -> local: left=17, top=347 */}
                            <div
                                id="fleet_income"
                                style={{ left: 17, top: 347, width: 455, height: 68 }}
                                className="absolute rounded-xl bg-[#0e1f1c]/90 border border-emerald-500/35 px-4 flex items-center justify-between shadow-md"
                            >
                                <div className="flex items-center gap-3 text-white font-black text-[20px]">
                                    <img src="/Gui/TaxiGui/02_ICONS/coins.png" alt="Монеты" className="w-8 h-8 object-contain drop-shadow" />
                                    <span>Доход: <span className="text-[#4ade80] ml-1">{baseIncome.toLocaleString()} / ч</span></span>
                                </div>
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className="w-8 h-8 rounded-full hover:brightness-125 flex items-center justify-center transition-all focus:outline-none"
                                    title="Подробная статистика"
                                >
                                    <img src="/Gui/TaxiGui/02_ICONS/info.png" alt="Инфо" className="w-full h-full object-contain" />
                                </button>
                            </div>

                            {/* 11.6 Upgrade Big: (690, 1071, 456, 129) -> local: left=19, top=459 */}
                            <div
                                id="upgrade_big"
                                onClick={() => setActiveTab('upgrades')}
                                style={{ left: 19, top: 459, width: 456, height: 129 }}
                                className="absolute rounded-2xl cursor-pointer transition-transform hover:scale-[1.01] active:scale-98 group overflow-hidden focus:outline-none shadow-xl"
                            >
                                <img
                                    src="/Gui/TaxiGui/btn_upgrade_big_clean_template_456x129.png"
                                    alt="Улучшить"
                                    className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                                />

                                {/* Dynamic Single-Line Upgrade Title */}
                                <span className="absolute left-[85px] top-[18px] text-[25px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none">
                                    Улучшить до ур. {nextLevel <= 10 ? nextLevel : 'MAX'}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                {/* ============================================================== */}
                {/* TAB 2: УЛУЧШЕНИЯ (Building Upgrade Progression & perks)        */}
                {/* ============================================================== */}
                {activeTab === 'upgrades' && (
                    <div className="absolute left-[40px] top-[605px] w-[1120px] h-[610px] z-20 bg-gradient-to-b from-[#1b0c33]/95 to-[#120625]/95 border border-purple-500/35 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                        <div className="bg-gradient-to-r from-amber-500/20 via-purple-900/30 to-amber-500/20 border border-amber-400/40 rounded-2xl p-4 text-center shadow-lg">
                            <h3 className="text-[22px] font-black text-amber-300">Система развития Таксопарка (1 - 10 уровни)</h3>
                            <p className="text-[14px] text-purple-200/80 mt-1 max-w-2xl mx-auto">
                                Каждый уровень расширяет автопарк, привлекает водителей и существенно увеличивает доход вашей службы такси.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-auto">
                            {/* Current Level */}
                            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1f0e3a] to-[#140727] border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-[12px] font-black uppercase">
                                        Текущий уровень
                                    </span>
                                    <div className="flex items-center gap-2 text-[20px] font-black text-amber-300">
                                        <Award className="w-6 h-6 text-amber-400" />
                                        <span>Уровень {currentLevel}</span>
                                    </div>
                                </div>
                                <h4 className="text-[18px] font-black text-white">Золотой таксопарк</h4>
                                <ul className="text-[14px] space-y-2 text-purple-200/90 font-medium">
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <span>Вместимость: <b className="text-white">{14 + currentLevel * 2} автомобилей</b></span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <span>Базовый доход: <b className="text-amber-300">{baseIncome.toLocaleString()} монет / час</b></span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <span>Прочность: <b className="text-sky-300">{durability.toLocaleString()} HP</b></span>
                                    </li>
                                </ul>
                            </div>

                            {/* Next Level */}
                            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#1b0a30] to-[#110521] border border-purple-500/40 hover:border-amber-400/60 shadow-md space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-purple-900/60 text-purple-300 text-[12px] font-black uppercase border border-purple-400/30">
                                        Следующий
                                    </span>
                                    <span className="text-[20px] font-black text-white">Уровень {nextLevel}</span>
                                </div>
                                <h4 className="text-[18px] font-black text-white">Флагманский хаб такси</h4>
                                <ul className="text-[14px] space-y-2 text-purple-200/90 font-medium">
                                    <li className="flex items-center gap-2.5">
                                        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span className="text-amber-200">Вместимость: <b className="text-white">{14 + nextLevel * 2} автомобилей (+2)</b></span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span className="text-amber-200">Доход: <b className="text-amber-300">{(baseIncome + 500).toLocaleString()} монет / час (+500)</b></span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                        <span className="text-amber-200">Прочность: <b className="text-sky-300">{(durability + 500).toLocaleString()} HP (+500)</b></span>
                                    </li>
                                </ul>

                                <div className="pt-2">
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={currentLevel >= 10}
                                        className="w-full py-3.5 px-4 rounded-xl font-black text-[16px] text-[#180828] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <ChevronsUp className="w-5 h-5" />
                                        <span>Улучшить здание до уровня {nextLevel}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* TAB 3: АВТОПАРК (Fleet vehicle management & purchase)          */}
                {/* ============================================================== */}
                {activeTab === 'fleet' && (
                    <div className="absolute left-[40px] top-[605px] w-[1120px] h-[610px] z-20 bg-gradient-to-b from-[#1b0c33]/95 to-[#120625]/95 border border-purple-500/35 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                            <div>
                                <h3 className="text-[22px] font-black text-white">Управление автопарком</h3>
                                <p className="text-[14px] text-purple-200/70">Покупайте автомобили для увеличения пассажиропотока</p>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-[15px]">
                                Парк: {totalCarsCount} шт.
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-auto">
                            {/* Standard */}
                            <div className="bg-[#170a2c] border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                <div className="h-[100px] flex items-center justify-center">
                                    <img src="/Gui/TaxiGui/01_ART/car_standard_512.png" alt="" className="max-h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-[17px] font-black text-white">Стандартное такси</h4>
                                    <p className="text-[12px] text-purple-200/70">Экономичный седан для городских рейсов</p>
                                    <div className="mt-2 text-[#4ade80] font-black text-[15px]">В наличии: {fleetData.standard} шт.</div>
                                </div>
                                <button
                                    onClick={() => buyCar('standard', 5000)}
                                    className="w-full py-2.5 rounded-xl font-black text-[14px] text-[#180828] bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Купить (5 000 🪙)</span>
                                </button>
                            </div>

                            {/* Comfort */}
                            <div className="bg-[#170a2c] border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                <div className="h-[100px] flex items-center justify-center">
                                    <img src="/Gui/TaxiGui/01_ART/car_comfort_512.png" alt="" className="max-h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-[17px] font-black text-white">Комфорт</h4>
                                    <p className="text-[12px] text-purple-200/70">Повышенный тариф и чаевые</p>
                                    <div className="mt-2 text-[#4ade80] font-black text-[15px]">В наличии: {fleetData.comfort} шт.</div>
                                </div>
                                <button
                                    onClick={() => buyCar('comfort', 15000)}
                                    className="w-full py-2.5 rounded-xl font-black text-[14px] text-[#180828] bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Купить (15 000 🪙)</span>
                                </button>
                            </div>

                            {/* Minivan */}
                            <div className="bg-[#170a2c] border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                                <div className="h-[100px] flex items-center justify-center">
                                    <img src="/Gui/TaxiGui/01_ART/car_minivan_512.png" alt="" className="max-h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-[17px] font-black text-white">Минивэн</h4>
                                    <p className="text-[12px] text-purple-200/70">Вместимость до 8 человек, высокий доход</p>
                                    <div className="mt-2 text-[#4ade80] font-black text-[15px]">В наличии: {fleetData.minivan} шт.</div>
                                </div>
                                <button
                                    onClick={() => buyCar('minivan', 35000)}
                                    className="w-full py-2.5 rounded-xl font-black text-[14px] text-[#180828] bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Купить (35 000 🪙)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* TAB 4: ПЕРСОНАЛ (Drivers, dispatchers, mechanics)             */}
                {/* ============================================================== */}
                {activeTab === 'staff' && (
                    <div className="absolute left-[40px] top-[605px] w-[1120px] h-[610px] z-20 bg-gradient-to-b from-[#1b0c33]/95 to-[#120625]/95 border border-purple-500/35 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                        <div className="border-b border-purple-500/20 pb-4">
                            <h3 className="text-[22px] font-black text-white">Штат сотрудников таксопарка</h3>
                            <p className="text-[14px] text-purple-200/70">Квалифицированный персонал ускоряет рейсы и снижает износ авто</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-auto">
                            {/* Drivers */}
                            <div className="p-5 rounded-2xl bg-[#170a2c] border border-purple-500/30 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                        <Car className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-[17px] font-black text-white">Водители</div>
                                        <div className="text-[13px] text-emerald-400 font-bold">{fleetData.hiredDrivers} сотрудников</div>
                                    </div>
                                </div>
                                <p className="text-[12px] text-purple-200/70">Каждый водитель позволяет выпустить на линию 1 автомобиль.</p>
                                <button
                                    onClick={() => hireStaff('hiredDrivers', 2500)}
                                    className="w-full py-2.5 rounded-xl font-black text-[13px] text-[#180828] bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Нанять (2 500 🪙)</span>
                                </button>
                            </div>

                            {/* Dispatchers */}
                            <div className="p-5 rounded-2xl bg-[#170a2c] border border-purple-500/30 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-[17px] font-black text-white">Диспетчеры</div>
                                        <div className="text-[13px] text-emerald-400 font-bold">{fleetData.hiredDispatchers} сотрудников</div>
                                    </div>
                                </div>
                                <p className="text-[12px] text-purple-200/70">Ускоряют распределение заказов на 5% за каждого диспетчера.</p>
                                <button
                                    onClick={() => hireStaff('hiredDispatchers', 4000)}
                                    className="w-full py-2.5 rounded-xl font-black text-[13px] text-[#180828] bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Нанять (4 000 🪙)</span>
                                </button>
                            </div>

                            {/* Mechanics */}
                            <div className="p-5 rounded-2xl bg-[#170a2c] border border-purple-500/30 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center">
                                        <Wrench className="w-6 h-6 text-sky-400" />
                                    </div>
                                    <div>
                                        <div className="text-[17px] font-black text-white">Автомеханики</div>
                                        <div className="text-[13px] text-emerald-400 font-bold">{fleetData.hiredMechanics} сотрудников</div>
                                    </div>
                                </div>
                                <p className="text-[12px] text-purple-200/70">Снижают стоимость починки здания и поддерживают состояние парка.</p>
                                <button
                                    onClick={() => hireStaff('hiredMechanics', 6000)}
                                    className="w-full py-2.5 rounded-xl font-black text-[13px] text-[#180828] bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 flex items-center justify-center gap-1.5"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Нанять (6 000 🪙)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================== */}
                {/* TAB 5: СТАТИСТИКА (Financial and Operational KPIs)             */}
                {/* ============================================================== */}
                {activeTab === 'stats' && (
                    <div className="absolute left-[40px] top-[605px] w-[1120px] h-[610px] z-20 bg-gradient-to-b from-[#1b0c33]/95 to-[#120625]/95 border border-purple-500/35 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
                        <div className="border-b border-purple-500/20 pb-4">
                            <h3 className="text-[22px] font-black text-white">Аналитика и статистика Таксопарка</h3>
                            <p className="text-[14px] text-purple-200/70">Показатели эффективности службы такси за все время</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 my-auto">
                            <div className="bg-[#170a2c] border border-purple-500/25 rounded-2xl p-5 text-center shadow-md">
                                <div className="text-[14px] text-purple-200/70">Всего поездок</div>
                                <div className="text-[26px] font-black text-white mt-1">{fleetData.completedTrips.toLocaleString()}</div>
                            </div>
                            <div className="bg-[#170a2c] border border-purple-500/25 rounded-2xl p-5 text-center shadow-md">
                                <div className="text-[14px] text-purple-200/70">Рейтинг службы</div>
                                <div className="text-[26px] font-black text-amber-300 mt-1 flex items-center justify-center gap-2">
                                    <span>4.98</span>
                                    <Award className="w-7 h-7 text-amber-400" />
                                </div>
                            </div>
                            <div className="bg-[#170a2c] border border-purple-500/25 rounded-2xl p-5 text-center shadow-md">
                                <div className="text-[14px] text-purple-200/70">Время подачи</div>
                                <div className="text-[26px] font-black text-emerald-400 mt-1">~ 3.2 мин</div>
                            </div>
                            <div className="bg-[#170a2c] border border-purple-500/25 rounded-2xl p-5 text-center shadow-md">
                                <div className="text-[14px] text-purple-200/70">Заработано за всё время</div>
                                <div className="text-[26px] font-black text-amber-400 mt-1">{fleetData.totalEarnedCoins.toLocaleString()} 🪙</div>
                            </div>
                            <div className="bg-[#170a2c] border border-purple-500/25 rounded-2xl p-5 text-center shadow-md">
                                <div className="text-[14px] text-purple-200/70">Коэффициент надёжности</div>
                                <div className="text-[26px] font-black text-sky-400 mt-1">99.8%</div>
                            </div>
                            <div className="bg-[#170a2c] border border-purple-500/25 rounded-2xl p-5 text-center shadow-md">
                                <div className="text-[14px] text-purple-200/70">Автомобилей на линии</div>
                                <div className="text-[26px] font-black text-emerald-300 mt-1">{totalCarsCount} / {14 + currentLevel * 2}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
