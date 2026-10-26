import React from 'react';

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
}

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
    onOpenInventory
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()} style={{ width: 'min(660px, calc(100vw - 32px))', height: 'min(490px, calc(100vh - 32px))' }}>
                {/* Tablet background image */}
                <img src="/Gui/tablet_menu_bg.webp" alt="Tablet" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                
                {/* Close button */}
                <button 
                    onClick={onClose} 
                    className="absolute z-10"
                    style={{ right: '35px', top: '42px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                />

                {/* Content overlay on tablet screen */}
                <div className="relative z-[1] flex flex-col items-center" style={{ width: '620px', padding: '28px 40px 22px 40px' }}>
                    {activeTabletTutorial ? (
                        <div className="w-full flex flex-col items-center">
                            <div style={{ border: '4px solid #d4af37', borderRadius: '14px', boxShadow: '0 0 0 2px rgba(255,215,0,0.25), 0 8px 24px rgba(0,0,0,0.45)', overflow: 'hidden', marginTop: '6px', marginBottom: '14px', padding: activeTabletTutorial === 'intro' ? '0' : '8px', background: activeTabletTutorial === 'intro' ? 'transparent' : '#f4ead1' }}>
                                {activeTabletTutorial === 'monsterWarning' ? (
                                    <div className="flex items-center justify-center gap-4" style={{ width: '380px', height: '205px' }}>
                                        <img src={monsterTutorialImageUrl} alt="Monster warning 1" style={{ width: '170px', height: '185px', objectFit: 'contain' }} />
                                        <img src={monsterTutorialImageUrl2} alt="Monster warning 2" style={{ width: '170px', height: '185px', objectFit: 'contain' }} />
                                    </div>
                                ) : activeTabletTutorial === 'firecrackerWarning' ? (
                                    <div className="flex items-center justify-center gap-4" style={{ width: '380px', height: '205px' }}>
                                        <img src={firecrackerTutorialImageUrl} alt="Петарды" style={{ width: '140px', height: '160px', objectFit: 'contain' }} />
                                        <img src={tutorialEndImageUrl} alt="Tutorial end" style={{ width: '190px', height: '185px', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <img
                                        src={
                                            activeTabletTutorial === 'intro'
                                                ? introTutorialImageUrl
                                                : activeTabletTutorial === 'townHallBuilt'
                                                    ? townHallTutorialImageUrl
                                                    : activeTabletTutorial === 'housePrompt'
                                                        ? houseTutorialImageUrl
                                                        : activeTabletTutorial === 'houseBuilt'
                                                            ? houseTutorialCompleteImageUrl
                                                            : activeTabletTutorial === 'pondPrompt'
                                                                ? lilyPondTutorialImageUrl
                                                                : lilyPondTutorialCompleteImageUrl
                                        }
                                        alt={
                                            activeTabletTutorial === 'intro'
                                                ? 'Tutorial'
                                                : activeTabletTutorial === 'townHallBuilt'
                                                    ? 'Town Hall tutorial'
                                                    : activeTabletTutorial === 'housePrompt'
                                                        ? 'House tutorial'
                                                        : activeTabletTutorial === 'houseBuilt'
                                                            ? 'House complete tutorial'
                                                            : 'Lily pond tutorial'
                                        }
                                        style={{
                                            width: activeTabletTutorial === 'intro' ? '400px' : '380px',
                                            height: activeTabletTutorial === 'intro' ? '230px' : '205px',
                                            objectFit: activeTabletTutorial === 'intro' ? 'cover' : 'contain',
                                            background: 'transparent'
                                        }}
                                    />
                                )}
                            </div>
                            {activeTabletTutorial === 'intro' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '28px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Найди свободное место, и кликни по<br />нему чтобы построить дом!
                                    </p>
                                    <p style={{ marginTop: '14px', marginBottom: '20px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: 1.25, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Еще ты можешь искать клады, грабить, взрывать дома<br />конкурентов, торговать на рынке и даже вступать в клан
                                    </p>
                                </>
                            ) : activeTabletTutorial === 'townHallBuilt' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '30px', lineHeight: 1.18, textTransform: 'uppercase', textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        «Главное здание» построено!
                                    </p>
                                    <p style={{ marginTop: '14px', marginBottom: '20px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '20px', lineHeight: 1.35, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        «Главное здание» нужно вам для управления городом
                                        <br />
                                        чем выше его уровень, тем больше домов вы сможете построить
                                    </p>
                                </>
                            ) : activeTabletTutorial === 'housePrompt' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '30px', lineHeight: 1.18, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Построй дом!
                                    </p>
                                    <p style={{ marginTop: '14px', marginBottom: '14px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '20px', lineHeight: 1.35, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Щелкни по пустому месту рядом с «Главным зданием», чтобы построить дом.
                                        <br />
                                        Ведь рабочим нужно где-то жить!
                                    </p>
                                </>
                            ) : activeTabletTutorial === 'houseBuilt' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '30px', lineHeight: 1.18, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Отлично! Дом построен!
                                    </p>
                                    <p style={{ marginTop: '14px', marginBottom: '14px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '19px', lineHeight: 1.35, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Количество рабочих в вашем городе зависит от количества «домов».
                                        <br />
                                        Рабочие нужны вам для строительства домов и работы на фабриках
                                    </p>
                                </>
                            ) : activeTabletTutorial === 'pondPrompt' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '29px', lineHeight: 1.18, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Ура! Мы можем начать
                                        <br />
                                        зарабатывать монеты!
                                    </p>
                                    <p style={{ marginTop: '14px', marginBottom: '14px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: 1.32, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Нажмите на свободное место рядом с «Главным зданием»
                                        <br />
                                        Чтобы построить «Пруд с лилиями»
                                    </p>
                                </>
                            ) : activeTabletTutorial === 'monsterWarning' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.16, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Эй Друг! Хочу тебя предупредить!
                                    </p>
                                    <p style={{ marginTop: '12px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: 1.3, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Вокруг твоего города бродит множество «монстров», они ненавидят гномов и часто нападают на города. Будь осторожен!
                                    </p>
                                </>
                            ) : activeTabletTutorial === 'firecrackerWarning' ? (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.16, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Помни у тебя есть петарды
                                    </p>
                                    <p style={{ marginTop: '12px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '17px', lineHeight: 1.28, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        С их помощью можно взрывать монстров и взрывать постройки как свои так и игроков на карте. Мы дали тебе на первое время несколько штук петард
                                        <br />
                                        Так ты продержишься первое время.
                                        <br />
                                        А как подкопишь монет, сразу строй «Петардный завод»
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p style={{ margin: 0, textAlign: 'center', color: '#2563eb', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '28px', lineHeight: 1.16, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Прекрасно! Построен
                                        <br />
                                        Пруд с лилиями
                                    </p>
                                    <p style={{ marginTop: '12px', marginBottom: '10px', textAlign: 'center', color: '#e9edf5', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '17px', lineHeight: 1.28, textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
                                        Теперь для рабочих есть работа! Кликая по постройке
                                        <br />
                                        можно отправлять их на работу, и получать за это монеты.
                                        <br />
                                        Если повезет, то рабочие смогут вырастить для тебя «Супер
                                        <br />
                                        лилию». Ее можно будет продать на «рынке» или переработать на «заводе»
                                    </p>
                                </>
                            )}
                            <button
                                onClick={activeTabletTutorial === 'intro' ? onCompleteTutorial : onCompleteTownHallTutorial}
                                style={{ background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)', color: '#ffffff', border: '2px solid #14532d', borderRadius: '16px', padding: '10px 26px', marginTop: '0px', transform: 'translateY(-10px)', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: '22px', boxShadow: '0 6px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35)' }}
                                className="hover:scale-105 transition-transform"
                            >
                                {activeTabletTutorial === 'intro'
                                    ? 'Начать играть!'
                                    : activeTabletTutorial === 'pondPrompt'
                                        ? 'Начать игру'
                                    : activeTabletTutorial === 'monsterWarning'
                                        ? 'Дальше'
                                    : activeTabletTutorial === 'firecrackerWarning'
                                        ? 'Играть'
                                    : activeTabletTutorial === 'pondBuilt'
                                        ? 'Дальше'
                                    : 'Продолжить'}
                            </button>
                        </div>
                    ) : (
                    <>
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

                    {/* Row 3: Инвентарь (centered) */}
                    <div className="flex justify-center">
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
                    </div>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const TabletMenuModal = React.memo(TabletMenuModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    return (
        prev.isOpen === next.isOpen &&
        prev.activeTabletTutorial === next.activeTabletTutorial
    );
});
