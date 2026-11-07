import React, { useEffect, useState } from 'react';
import { LuckyWheelIcon } from './LuckyWheel';

const townHallTutorialImageUrl = '/Gui/GUI_Tutorial/TH.webp';
const introTutorialImageUrl = '/Gui/GUI_Tutorial/firsttutorial.webp';
const houseTutorialImageUrl = '/Gui/GUI_Tutorial/House.webp';
const houseTutorialCompleteImageUrl = '/Gui/GUI_Tutorial/Houseend.webp';
const lilyPondTutorialImageUrl = '/Gui/GUI_Tutorial/laik.webp';
const lilyPondTutorialCompleteImageUrl = '/Gui/GUI_Tutorial/laikend.webp';
const monsterTutorialImageUrl = '/Gui/GUI_Tutorial/monster1.webp';
const monsterTutorialImageUrl2 = '/Gui/GUI_Tutorial/monster2.webp';
const firecrackerTutorialImageUrl = '/Gui/GUI_Tutorial/tutorialend1.webp';
const tutorialEndImageUrl = '/Gui/GUI_Tutorial/tutorialend.webp';

const guiMenuPoliceMoralsImageUrl = '/Gui/GUI_Menu/основеное меню/Полиция нравов/6Rw-Ov.webp';
const guiMenuTopImageUrl = '/Gui/GUI_Menu/основеное меню/топ/topbottom1.webp';
const guiMenuRoyalElectionsImageUrl = '/Gui/GUI_Menu/основеное меню/Королевские выборы/vibori1.webp';
const guiMenuShopImageUrl = '/Gui/GUI_Menu/основеное меню/магазин/Image-4.webp';
const guiMenuMapImageUrl = '/Gui/GUI_Menu/основеное меню/карта/mapbottom1.webp';
const guiMenuTownImageUrl = '/Gui/GUI_Menu/основеное меню/город/town-Bottom1.webp';
const guiMenuInventoryImageUrl = '/Gui/GUI_Menu/основеное меню/инвентарь/Uerc-WWWW.webp';

export interface TabletMenuModalProps {
    isOpen: boolean;
    activeTabletTutorial: string | null;
    onClose: () => void;
    onCompleteTutorial: () => void;
    onCompleteTownHallTutorial: () => void;
    onOpenPoliceMorals: () => void;
    onOpenTopPlayers: () => void;
    onOpenRoyalElections: () => void;
    onOpenShop: () => void;
    onOpenMap: () => void;
    onTeleportToTownHall: () => void;
    onOpenInventory: () => void;
    onOpenDailyReward?: () => void;
    hasDailyRewardAvailable?: boolean;
    onOpenLuckyWheel?: () => void;
    hasLuckyWheelAvailable?: boolean;
}

interface ProceduralTutorialTabletProps {
    activeTabletTutorial: string;
    onClose: () => void;
    onCompleteTutorial: () => void;
    onCompleteTownHallTutorial: () => void;
}

/**
 * Procedural CSS Tablet designed after GUIBUILDINGmenu/5327.html.
 * Renders instantly (0ms network delay), scales identically and responsively
 * for both desktop and mobile devices without text wrapping differences.
 */
const ProceduralTutorialTablet: React.FC<ProceduralTutorialTabletProps> = ({
    activeTabletTutorial,
    onClose,
    onCompleteTutorial,
    onCompleteTownHallTutorial,
}) => {
    const [scale, setScale] = useState(1);

    // Responsive scaling: locks proportions and elements identical on desktop and mobile
    useEffect(() => {
        const updateScale = () => {
            if (typeof window === 'undefined') return;
            const vpW = window.visualViewport?.width ?? window.innerWidth;
            const vpH = window.visualViewport?.height ?? window.innerHeight;
            const availableW = vpW - 28;
            const availableH = vpH - 24;
            const baseW = 660;
            const baseH = 430;
            const s = Math.min(1, availableW / baseW, availableH / baseH);
            setScale(Math.max(0.38, s));
        };
        updateScale();
        window.addEventListener('resize', updateScale);
        window.visualViewport?.addEventListener('resize', updateScale);
        return () => {
            window.removeEventListener('resize', updateScale);
            window.visualViewport?.removeEventListener('resize', updateScale);
        };
    }, []);

    const isIntro = activeTabletTutorial === 'intro';
    const isTownHallBuilt = activeTabletTutorial === 'townHallBuilt';
    const isHousePrompt = activeTabletTutorial === 'housePrompt';
    const isHouseBuilt = activeTabletTutorial === 'houseBuilt';
    const isPondPrompt = activeTabletTutorial === 'pondPrompt';
    const isPondBuilt = activeTabletTutorial === 'pondBuilt';
    const isMonsterWarning = activeTabletTutorial === 'monsterWarning';
    const isFirecrackerWarning = activeTabletTutorial === 'firecrackerWarning';

    const handleActionClick = isIntro ? onCompleteTutorial : onCompleteTownHallTutorial;

    const actionButtonLabel = isIntro
        ? 'Начать играть!'
        : isPondPrompt
            ? 'Начать игру'
        : isMonsterWarning
            ? 'Дальше'
        : isFirecrackerWarning
            ? 'Играть'
        : isPondBuilt
            ? 'Дальше'
        : 'Продолжить';

    return (
        <div
            className="relative flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
            style={{
                width: `${Math.round(660 * scale)}px`,
                height: `${Math.round(430 * scale)}px`,
                flexShrink: 0,
            }}
        >
            {/* Tablet Outer Metallic Bezel (Gradients and shadows from 5327.html) */}
            <div
                id="tutorial-tablet"
                style={{
                    position: 'absolute',
                    width: '660px',
                    height: '430px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    padding: '13px',
                    borderRadius: '28px',
                    background: 'linear-gradient(145deg, #a8a9b0, #42434d 7%, #20212a 13%, #777983 17%, #292a33 23%, #14151c 75%, #777983 94%, #252630)',
                    boxShadow: 'inset 0 2px 2px rgba(255, 255, 255, 0.6), inset 0 -3px 4px #000, 0 16px 40px rgba(0, 0, 0, 0.85)',
                    boxSizing: 'border-box',
                }}
            >
                {/* Metallic Highlight Ring */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '3px',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '25px',
                        pointerEvents: 'none',
                    }}
                />

                {/* Left Hardware Camera / Sensor Notch */}
                <div
                    style={{
                        position: 'absolute',
                        left: '0px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '36px',
                        background: '#191a22',
                        borderRadius: '0 3px 3px 0',
                        border: '1px solid #3c3d47',
                        borderLeft: 'none',
                        pointerEvents: 'none',
                    }}
                />

                {/* Inner Screen with Blueprint Grid & Sci-Fi Glow */}
                <div
                    id="tutorial-screen"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        borderRadius: '18px',
                        border: '1px solid #29384a',
                        backgroundColor: '#07182a',
                        backgroundImage: `
                            radial-gradient(ellipse at 90% 8%, rgba(52, 123, 180, 0.36), transparent 32%),
                            radial-gradient(ellipse at 5% 55%, rgba(27, 86, 129, 0.23), transparent 40%),
                            repeating-linear-gradient(0deg, transparent 0 31px, rgba(112, 185, 255, 0.043) 32px),
                            repeating-linear-gradient(90deg, transparent 0 31px, rgba(112, 185, 255, 0.043) 32px),
                            linear-gradient(135deg, #102b49, #061629 58%, #0c2741)
                        `,
                        boxShadow: 'inset 0 0 0 2px rgba(0, 0, 0, 0.5), inset 0 0 28px rgba(0, 0, 0, 0.6)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 28px',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Close (X) button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3.5 right-3.5 z-20 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                        style={{
                            width: '34px',
                            height: '34px',
                            background: 'radial-gradient(circle, rgba(52, 123, 180, 0.4) 0%, rgba(16, 43, 73, 0.7) 100%)',
                            border: '1.5px solid rgba(112, 185, 255, 0.5)',
                            boxShadow: '0 0 12px rgba(56, 189, 248, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                            color: '#e0f2fe',
                        }}
                        title="Закрыть"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    {/* Tutorial Illustration Container (Gold border) */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #d4af37',
                            borderRadius: '12px',
                            boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.25), 0 6px 18px rgba(0, 0, 0, 0.5)',
                            overflow: 'hidden',
                            marginBottom: '6px',
                            background: (isMonsterWarning || isFirecrackerWarning)
                                ? 'rgba(7, 24, 52, 0.55)'
                                : 'transparent',
                        }}
                    >
                        {isMonsterWarning ? (
                            <div className="flex items-center justify-center gap-4" style={{ width: '290px', height: '135px', padding: '4px 12px' }}>
                                <img src={monsterTutorialImageUrl} alt="Monster warning 1" style={{ width: '125px', height: '125px', objectFit: 'contain' }} />
                                <img src={monsterTutorialImageUrl2} alt="Monster warning 2" style={{ width: '125px', height: '125px', objectFit: 'contain' }} />
                            </div>
                        ) : isFirecrackerWarning ? (
                            <div className="flex items-center justify-center gap-4" style={{ width: '290px', height: '135px', padding: '4px 12px' }}>
                                <img src={firecrackerTutorialImageUrl} alt="Петарды" style={{ width: '115px', height: '125px', objectFit: 'contain' }} />
                                <img src={tutorialEndImageUrl} alt="Tutorial end" style={{ width: '135px', height: '125px', objectFit: 'contain' }} />
                            </div>
                        ) : (
                            <img
                                src={
                                    isIntro
                                        ? introTutorialImageUrl
                                        : isTownHallBuilt
                                            ? townHallTutorialImageUrl
                                            : isHousePrompt
                                                ? houseTutorialImageUrl
                                                : isHouseBuilt
                                                    ? houseTutorialCompleteImageUrl
                                                    : isPondPrompt
                                                        ? lilyPondTutorialImageUrl
                                                        : lilyPondTutorialCompleteImageUrl
                                }
                                alt="Tutorial step"
                                style={
                                    isIntro
                                        ? {
                                            width: '290px',
                                            height: '135px',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }
                                        : {
                                            height: '135px',
                                            width: 'auto',
                                            maxWidth: '240px',
                                            objectFit: 'contain',
                                            display: 'block',
                                        }
                                }
                            />
                        )}
                    </div>

                    {/* Tutorial Titles & Descriptions */}
                    {isIntro ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '19px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Найди свободное место, и кликни по нему чтобы построить дом!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                Еще ты можешь искать клады, грабить, взрывать дома конкурентов, торговать на рынке и даже вступать в клан
                            </p>
                        </>
                    ) : isTownHallBuilt ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textTransform: 'uppercase', textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                «Главное здание» построено!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13.5px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                «Главное здание» нужно вам для управления городом.<br />Чем выше его уровень, тем больше домов вы сможете построить
                            </p>
                        </>
                    ) : isHousePrompt ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Построй дом!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13.5px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                Щелкни по пустому месту рядом с «Главным зданием», чтобы построить дом.<br />Ведь рабочим нужно где-то жить!
                            </p>
                        </>
                    ) : isHouseBuilt ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Отлично! Дом построен!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                Количество рабочих в вашем городе зависит от количества «домов».<br />Рабочие нужны вам для строительства домов и работы на фабриках
                            </p>
                        </>
                    ) : isPondPrompt ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Ура! Мы можем начать зарабатывать монеты!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                Нажмите на свободное место рядом с «Главным зданием»,<br />чтобы построить «Пруд с лилиями»
                            </p>
                        </>
                    ) : isMonsterWarning ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Эй Друг! Хочу тебя предупредить!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '8px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                Вокруг твоего города бродят монстры, они часто нападают на города. Будь осторожен!
                            </p>
                        </>
                    ) : isFirecrackerWarning ? (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Помни, у тебя есть петарды!
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '8px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12.5px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                С их помощью можно взрывать монстров и постройки. Мы дали тебе несколько петард на первое время!
                            </p>
                        </>
                    ) : (
                        <>
                            <p style={{ margin: 0, textAlign: 'center', color: '#38bdf8', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '560px' }}>
                                Прекрасно! Построен Пруд с лилиями
                            </p>
                            <p style={{ margin: 0, marginTop: '5px', marginBottom: '8px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12.5px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.7)', maxWidth: '540px' }}>
                                Теперь для рабочих есть работа! Кликая по постройке, можно отправлять их на работу и получать за это монеты.
                            </p>
                        </>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleActionClick}
                        style={{
                            background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
                            color: '#ffffff',
                            border: '2px solid #14532d',
                            borderRadius: '14px',
                            padding: '8px 34px',
                            marginTop: '2px',
                            fontFamily: 'Nunito, sans-serif',
                            fontWeight: 900,
                            fontSize: '17px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                            textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 1px 0 #000',
                            WebkitTextStroke: '1px black',
                            paintOrder: 'stroke fill',
                        }}
                        className="hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                        {actionButtonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabletMenuModalComponent: React.FC<TabletMenuModalProps> = ({
    isOpen,
    activeTabletTutorial,
    onClose,
    onCompleteTutorial,
    onCompleteTownHallTutorial,
    onOpenPoliceMorals,
    onOpenTopPlayers,
    onOpenRoyalElections,
    onOpenShop,
    onOpenMap,
    onTeleportToTownHall,
    onOpenInventory,
    onOpenDailyReward,
    hasDailyRewardAvailable,
    onOpenLuckyWheel,
    hasLuckyWheelAvailable
}) => {
    if (!isOpen) return null;

    // Fast-loading procedural CSS tablet exclusively for the tutorial
    if (activeTabletTutorial) {
        return (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm p-3" onClick={onClose}>
                <ProceduralTutorialTablet
                    activeTabletTutorial={activeTabletTutorial}
                    onClose={onClose}
                    onCompleteTutorial={onCompleteTutorial}
                    onCompleteTownHallTutorial={onCompleteTownHallTutorial}
                />
            </div>
        );
    }

    // Main tablet menu view (retains standard full layout)
    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', aspectRatio: '1256 / 897', maxHeight: 'calc(100vh - 32px)' }}>
                {/* Tablet background image */}
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                
                {/* Close button aligned with background texture X */}
                <button 
                    onClick={onClose} 
                    className="absolute z-10"
                    style={{ right: '7.06%', top: '8.91%', transform: 'translate(50%, -50%)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />

                {/* Content overlay on tablet screen */}
                <div className="relative z-[1] flex flex-col items-center justify-center" style={{ width: '88%', height: '84%', padding: '8px 24px' }}>
                    {/* Title */}
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '7px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)', marginBottom: '4px' }}>
                        <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '20px', color: '#e0e8f0', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0 }}>Меню (Основное)</h2>
                    </div>

                    {/* Row 1: Полиция нравов, Топ, Королевские выборы */}
                    <div className="flex justify-center gap-5 mb-3">
                        <button
                            onClick={onOpenPoliceMorals}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <img src={guiMenuPoliceMoralsImageUrl} alt="Police Morals" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>Полиция нравов</span>
                        </button>

                        <button
                            onClick={onOpenTopPlayers}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <img src={guiMenuTopImageUrl} alt="Top Players" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>Топ</span>
                        </button>

                        <button
                            onClick={onOpenRoyalElections}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <img src={guiMenuRoyalElectionsImageUrl} alt="Royal Elections" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>Королевские выборы</span>
                        </button>
                    </div>

                    {/* Row 2: Магазин, Карта, Город */}
                    <div className="flex justify-center gap-5 mb-3">
                        <button
                            onClick={onOpenShop}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <img src={guiMenuShopImageUrl} alt="Shop" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>Магазин</span>
                        </button>

                        <button
                            onClick={onOpenMap}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <img src={guiMenuMapImageUrl} alt="Map" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>Карта</span>
                        </button>

                        <button
                            onClick={onTeleportToTownHall}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
                                <img src={guiMenuTownImageUrl} alt="My City" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>Город</span>
                        </button>
                    </div>

                    {/* Row 3: Колесо Фортуны, Инвентарь и Ежедневный бонус */}
                    <div className="flex justify-center gap-5">
                        <button
                            onClick={onOpenLuckyWheel}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform relative"
                            style={{ width: '120px', gap: '2px' }}
                        >
                            <div style={{
                                width: '88px',
                                height: '88px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '16px',
                                border: hasLuckyWheelAvailable ? '2px solid rgba(251, 191, 36, 0.7)' : '2px solid rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                boxShadow: hasLuckyWheelAvailable ? '0 0 18px rgba(251, 191, 36, 0.45)' : 'none'
                            }}>
                                <LuckyWheelIcon size={70} hasAvailable={hasLuckyWheelAvailable} />
                                {hasLuckyWheelAvailable && (
                                    <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 border border-white flex items-center justify-center text-[9px] text-white font-black animate-pulse shadow-md">
                                        FREE
                                    </div>
                                )}
                            </div>
                            <span style={{
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: hasLuckyWheelAvailable ? '#fbbf24' : '#d0d8e0',
                                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                textAlign: 'center',
                                lineHeight: 1
                            }}>Колесо Фортуны</span>
                        </button>

                        <button
                            onClick={onOpenInventory}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            style={{ width: '120px', gap: '2px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={guiMenuInventoryImageUrl} alt="Inventory" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 1 }}>Инвентарь</span>
                        </button>

                        <button
                            onClick={onOpenDailyReward}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform relative"
                            style={{ width: '120px', gap: '2px' }}
                        >
                            <div style={{ width: '88px', height: '88px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: hasDailyRewardAvailable ? '2px solid rgba(251, 191, 36, 0.6)' : '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: hasDailyRewardAvailable ? '0 0 16px rgba(251, 191, 36, 0.35)' : 'none' }}>
                                <img src="/Gui/daily_gift_icon.svg" alt="Daily Reward" style={{ width: '66px', height: '66px', objectFit: 'contain' }} />
                                {hasDailyRewardAvailable && (
                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-extrabold animate-pulse">
                                        !
                                    </div>
                                )}
                            </div>
                            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '12px', color: hasDailyRewardAvailable ? '#fbbf24' : '#d0d8e0', textShadow: '0 1px 4px rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 1 }}>Бонус</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TabletMenuModal = React.memo(TabletMenuModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    return (
        prev.isOpen === next.isOpen &&
        prev.activeTabletTutorial === next.activeTabletTutorial &&
        prev.hasDailyRewardAvailable === next.hasDailyRewardAvailable &&
        prev.hasLuckyWheelAvailable === next.hasLuckyWheelAvailable
    );
});