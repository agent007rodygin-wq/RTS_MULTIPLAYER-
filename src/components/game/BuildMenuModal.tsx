import React, { useState, useMemo, useEffect, memo } from 'react';
import {
    GreeneryIcon,
    ResidentialIcon,
    BusinessIcon,
    DefenseIcon,
    LettersIcon,
    RoadsIcon,
    FactoriesIcon,
    MonstersIcon,
    ClanIcon,
    GiftsIcon,
    ShieldIcon,
    SparklesIcon,
    AntiquityIcon
} from '../../../components/IconComponents';
import type { Building } from '../../../types';
import { repairMojibakeCp1251Utf8 } from '../../game/utils/mojibake.js';

export type BuildMenuTab = 'Грядки' | 'Жилье' | 'Бизнес' | 'Буквы' | 'Декор' | 'Дороги и стены' | 'Заводы' | 'Монстры' | 'Клан' | 'Подарки' | 'Защита' | 'Статуи' | 'Спецальное' | 'Античность';
export type LetterSubTab = 'english' | 'russian' | 'numbers';
export type GiftSubTab = 'main' | 'castles' | 'babies' | 'march8' | 'halloween' | 'valentine' | 'spring';
export type DecorSubTab = 'flags' | 'other';

export interface BuildMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectBuilding: (building: Building) => void;
    buildingData: Building[];
    rubyImageUrl: string;
    coinImageUrl: string;
    playCloseSound: () => void;
    enqueueImagePreload?: (urls: string[], options?: { batchSize?: number }) => void;
    getIsBuildingFree?: (buildingId: number) => boolean;
    hasTownHall?: boolean;
}

const TOWN_HALL_IDS = [301, 306, 312, 331, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 360, 361, 371, 381, 413, 414, 452, 726, 752];

const buildTabs: { name: BuildMenuTab; icon: React.ReactNode; label?: string }[] = [
    { name: 'Грядки', icon: <GreeneryIcon className="w-6 h-6" /> },
    { name: 'Жилье', icon: <ResidentialIcon className="w-6 h-6" /> },
    { name: 'Бизнес', icon: <BusinessIcon className="w-6 h-6" /> },
    { name: 'Защита', icon: <DefenseIcon className="w-6 h-6" /> },
    { name: 'Буквы', icon: <LettersIcon className="w-6 h-6" /> },
    { name: 'Декор', icon: <GreeneryIcon className="w-6 h-6" /> },
    { name: 'Дороги и стены', icon: <RoadsIcon className="w-6 h-6" />, label: 'Дороги' },
    { name: 'Заводы', icon: <FactoriesIcon className="w-6 h-6" /> },
    { name: 'Монстры', icon: <MonstersIcon className="w-6 h-6" /> },
    { name: 'Клан', icon: <ClanIcon className="w-6 h-6" /> },
    { name: 'Подарки', icon: <GiftsIcon className="w-6 h-6" /> },
    { name: 'Статуи', icon: <ShieldIcon className="w-6 h-6" /> },
    { name: 'Спецальное', icon: <SparklesIcon className="w-6 h-6" /> },
    { name: 'Античность', icon: <AntiquityIcon className="w-6 h-6" /> },
];

const gryadkiSortOrder: number[] = [400, 70, 82, 911, 102, 240, 274, 313, 600];
const zavodySortOrder: number[] = [577, 430, 874, 55, 307, 668, 615, 689, 620, 330, 60332, 262, 266, 601, 853, 273, 640, 602];
const zhilyeSortOrder: number[] = [1, 5, 7, 1002, 39, 64, 146, 205, 7980022];
const biznesSortOrder: number[] = [2, 27, 11, 6000, 31532, 66, 8, 4, 340, 31612, 3, 12, 36, 310, 60, 308, 57, 311, 328, 7980020, 7980021];
const zashchitaSortOrder: number[] = [700, 703];

const buildTabCategoryAliases: Record<string, string[]> = {
    'Жилье': ['Жилые', 'Жилье', 'Центр города'],
    'Дороги и стены': ['Дороги и стены', 'дороги и стены', 'Дороги', 'Реки и Горы', 'Природа'],
    'Декор': ['Декор', 'декор', 'Природа', 'Реки и Горы'],
    'Спецальное': ['Спецальное', 'спецальное', 'Специальное', 'специальное'],
    'Специальное': ['Спецальное', 'спецальное', 'Специальное', 'специальное'],
    'Античность': ['Античность', 'античность'],
};

const BuildMenuModalComponent: React.FC<BuildMenuModalProps> = ({
    isOpen,
    onClose,
    onSelectBuilding,
    buildingData,
    rubyImageUrl,
    coinImageUrl,
    playCloseSound,
    enqueueImagePreload,
    getIsBuildingFree,
    hasTownHall
}) => {
    const [activeBuildTab, setActiveBuildTab] = useState<BuildMenuTab>('Жилье');
    const [buildMenuSearch, setBuildMenuSearch] = useState('');
    const [letterSubTab, setLetterSubTab] = useState<LetterSubTab>('english');
    const [giftSubTab, setGiftSubTab] = useState<GiftSubTab>('main');
    const [decorSubTab, setDecorSubTab] = useState<DecorSubTab>('other');

    const openTimeRef = React.useRef(0);
    useEffect(() => {
        if (isOpen) {
            openTimeRef.current = Date.now();
        }
    }, [isOpen]);

    const handleClose = () => {
        setBuildMenuSearch('');
        playCloseSound();
        onClose();
    };

    const handleBackdropClick = () => {
        // Prevent ghost click / tap-through from canvas touch (< 400ms)
        if (Date.now() - openTimeRef.current < 400) {
            return;
        }
        handleClose();
    };

    const handleBuildingSelect = (building: Building) => {
        // Prevent ghost click / tap-through from canvas touch on mobile (< 400ms)
        if (Date.now() - openTimeRef.current < 400) {
            return;
        }
        onSelectBuilding(building);
    };

    const normalizedActiveBuildTab = repairMojibakeCp1251Utf8(activeBuildTab);
    const normalizedBuildMenuSearch = repairMojibakeCp1251Utf8(buildMenuSearch).trim().toLowerCase();

    const buildingsInCurrentTab = useMemo(() => {
        return buildingData.filter(b => {
            if (TOWN_HALL_IDS.includes(Number(b.id))) {
                if (hasTownHall !== false) return false;
                if (Number(b.id) !== 301) return false;
            }
            if (b.buildable === false) return false;
            if (normalizedBuildMenuSearch) {
                const normalizedBuildingName = repairMojibakeCp1251Utf8(String(b.name || '')).toLowerCase();
                const normalizedId = String(b.id || '');
                return normalizedBuildingName.includes(normalizedBuildMenuSearch) || normalizedId.includes(normalizedBuildMenuSearch);
            }
            const normalizedCategory = repairMojibakeCp1251Utf8(String(b.category || ''));
            const allowedCategories = buildTabCategoryAliases[normalizedActiveBuildTab] || [normalizedActiveBuildTab];
            if (!allowedCategories.includes(normalizedCategory)) return false;

            // Filter by letter sub-tab if in Letters category
            if (normalizedActiveBuildTab === 'Буквы') {
                const letterSubCategory = (b as any).letterSubCategory;
                if (letterSubTab === 'english' && letterSubCategory !== 'english') return false;
                if (letterSubTab === 'russian' && letterSubCategory !== 'russian') return false;
                if (letterSubTab === 'numbers' && letterSubCategory !== 'numbers') return false;
            }

            // Filter by gift sub-tab if in Gifts category
            if (normalizedActiveBuildTab === 'Подарки') {
                const giftSubCategory = (b as any).giftSubCategory;
                if (giftSubTab === 'main' && (giftSubCategory === 'castles' || giftSubCategory === 'babies' || giftSubCategory === 'march8' || giftSubCategory === 'halloween' || giftSubCategory === 'valentine' || giftSubCategory === 'spring')) return false;
                if (giftSubTab === 'castles' && giftSubCategory !== 'castles') return false;
                if (giftSubTab === 'babies' && giftSubCategory !== 'babies') return false;
                if (giftSubTab === 'march8' && giftSubCategory !== 'march8') return false;
                if (giftSubTab === 'halloween' && giftSubCategory !== 'halloween') return false;
                if (giftSubTab === 'valentine' && giftSubCategory !== 'valentine') return false;
                if (giftSubTab === 'spring' && giftSubCategory !== 'spring') return false;
            }

            // Filter by decor sub-tab if in Decor category
            if (normalizedActiveBuildTab === 'Декор') {
                const decorSubCategory = (b as any).decorSubCategory;
                if (decorSubTab === 'flags' && decorSubCategory !== 'flags') return false;
                if (decorSubTab === 'other' && decorSubCategory === 'flags') return false;
            }
            return true;
        }).sort((a, b) => {
            if (normalizedActiveBuildTab === 'Грядки') {
                const ai = gryadkiSortOrder.indexOf(a.id);
                const bi = gryadkiSortOrder.indexOf(b.id);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            }
            if (normalizedActiveBuildTab === 'Заводы') {
                const ai = zavodySortOrder.indexOf(a.id);
                const bi = zavodySortOrder.indexOf(b.id);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            }
            if (normalizedActiveBuildTab === 'Жилье') {
                const ai = zhilyeSortOrder.indexOf(a.id);
                const bi = zhilyeSortOrder.indexOf(b.id);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            }
            if (normalizedActiveBuildTab === 'Бизнес') {
                const ai = biznesSortOrder.indexOf(a.id);
                const bi = biznesSortOrder.indexOf(b.id);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            }
            if (normalizedActiveBuildTab === 'Защита') {
                const ai = zashchitaSortOrder.indexOf(a.id);
                const bi = zashchitaSortOrder.indexOf(b.id);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            }
            return 0;
        });
    }, [
        buildingData,
        normalizedActiveBuildTab,
        normalizedBuildMenuSearch,
        letterSubTab,
        giftSubTab,
        decorSubTab,
        hasTownHall
    ]);

    // Lazy-preload only the building cards for the currently opened build tab.
    useEffect(() => {
        if (!isOpen) return;

        const currentTabImageUrls = buildingsInCurrentTab
            .map(building => building.imageUrl)
            .filter(Boolean) as string[];

        enqueueImagePreload?.(currentTabImageUrls, { batchSize: 12 });
    }, [isOpen, buildingsInCurrentTab, enqueueImagePreload]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleBackdropClick}>
            <div className="relative flex flex-col" onClick={e => e.stopPropagation()} style={{ backgroundImage: 'url(/Gui/build_menu_bg.webp)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', width: 'min(var(--ui-modal-width), calc(100vw - 20px))', height: 'min(var(--ui-modal-height), calc(100vh - 12px))', padding: 'var(--ui-modal-padding-top) var(--ui-modal-padding-right) var(--ui-modal-padding-bottom) var(--ui-modal-padding-left)' }}>
                {/* Title centered + close button */}
                <div className="flex items-center justify-center relative build-menu-header" style={{ padding: '0 8px', marginTop: '10px', marginBottom: '4px' }}>
                    <div className="build-menu-title-wrap" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '7px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                        <h2 className="build-menu-title" style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px', color: '#e0e8f0', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0 }}>Меню строительства</h2>
                    </div>
                    <div className="absolute build-menu-search-wrap" style={{ right: '42px', top: '1px', width: '220px' }}>
                        <input
                            type="text"
                            value={buildMenuSearch}
                            onChange={(e) => setBuildMenuSearch(e.target.value)}
                            placeholder="Поиск..."
                            className="build-menu-search"
                            style={{
                                width: '100%',
                                height: '34px',
                                borderRadius: '8px',
                                border: '1px solid rgba(96,165,250,0.35)',
                                background: 'rgba(8,18,32,0.78)',
                                color: '#e5eef8',
                                padding: '0 12px',
                                fontFamily: 'Nunito, sans-serif',
                                fontSize: '11px',
                                fontWeight: 700,
                                outline: 'none',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 0 12px rgba(0,0,0,0.18)'
                            }}
                        />
                    </div>
                    <button onClick={handleClose} className="absolute build-menu-close-btn" style={{ right: '-19.5px', top: '7.5px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55), 0 0 36px 12px rgba(96,165,250,0.25), inset 0 0 12px rgba(150,200,255,0.35)'; e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.4) 0%, rgba(60,130,220,0.2) 60%, transparent 100%)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)'; e.currentTarget.style.background = 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)'; e.currentTarget.style.color = 'rgba(200,225,255,0.9)'; }}
                    >
                    </button>
                </div>
                <div className="flex flex-grow overflow-hidden" style={{ minHeight: 0 }}>
                    {/* Left sidebar tabs */}
                    <div className="build-menu-scroll build-menu-sidebar" style={{ width: '120px', paddingRight: '4px', overflowY: 'auto', flexShrink: 0, WebkitOverflowScrolling: 'touch' }}>
                        {buildTabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => { setActiveBuildTab(tab.name); setBuildMenuSearch(''); }}
                                className="w-full flex items-center space-x-2 transition-colors build-menu-tab-btn"
                                style={{
                                    padding: '7px 10px',
                                    marginBottom: '3px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontFamily: 'Nunito, sans-serif',
                                    fontWeight: activeBuildTab === tab.name ? 800 : 600,
                                    background: activeBuildTab === tab.name ? 'rgba(59, 130, 246, 0.7)' : 'rgba(255,255,255,0.05)',
                                    color: activeBuildTab === tab.name ? '#fff' : 'rgba(200,210,220,0.8)',
                                    border: activeBuildTab === tab.name ? '1px solid rgba(96,165,250,0.5)' : '1px solid transparent',
                                }}
                            >
                                {tab.icon}
                                <span>{tab.label || tab.name}</span>
                            </button>
                        ))}
                    </div>
                    {/* Right content area */}
                    <div className="build-menu-scroll build-menu-content" style={{ flex: 1, paddingLeft: '12px', overflowY: 'auto', minHeight: 0, WebkitOverflowScrolling: 'touch' }}>
                        {/* Letter sub-tabs */}
                        {activeBuildTab === 'Буквы' && (
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={() => setLetterSubTab('english')}
                                    style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: letterSubTab === 'english' ? 700 : 500, background: letterSubTab === 'english' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: letterSubTab === 'english' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Английские (A-Z)
                                </button>
                                <button
                                    onClick={() => setLetterSubTab('russian')}
                                    style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: letterSubTab === 'russian' ? 700 : 500, background: letterSubTab === 'russian' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: letterSubTab === 'russian' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Русские (А-Я)
                                </button>
                                <button
                                    onClick={() => setLetterSubTab('numbers')}
                                    style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: letterSubTab === 'numbers' ? 700 : 500, background: letterSubTab === 'numbers' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: letterSubTab === 'numbers' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Цифры (0-9)
                                </button>
                            </div>
                        )}
                        {/* Gift sub-tabs */}
                        {activeBuildTab === 'Подарки' && (
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={() => setGiftSubTab('main')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'main' ? 700 : 500, background: giftSubTab === 'main' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'main' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Основные
                                </button>
                                <button
                                    onClick={() => setGiftSubTab('castles')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'castles' ? 700 : 500, background: giftSubTab === 'castles' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'castles' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Замки
                                </button>
                                <button
                                    onClick={() => setGiftSubTab('babies')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'babies' ? 700 : 500, background: giftSubTab === 'babies' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'babies' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Малыши
                                </button>
                                <button
                                    onClick={() => setGiftSubTab('march8')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'march8' ? 700 : 500, background: giftSubTab === 'march8' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'march8' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    8 марта
                                </button>
                                <button
                                    onClick={() => setGiftSubTab('halloween')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'halloween' ? 700 : 500, background: giftSubTab === 'halloween' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'halloween' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Halloween
                                </button>
                                <button
                                    onClick={() => setGiftSubTab('valentine')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'valentine' ? 700 : 500, background: giftSubTab === 'valentine' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'valentine' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    14 февраля
                                </button>
                                <button
                                    onClick={() => setGiftSubTab('spring')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: giftSubTab === 'spring' ? 700 : 500, background: giftSubTab === 'spring' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: giftSubTab === 'spring' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Весеннее обновление
                                </button>
                            </div>
                        )}
                        {/* Decor sub-tabs */}
                        {activeBuildTab === 'Декор' && (
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={() => setDecorSubTab('other')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: decorSubTab === 'other' ? 700 : 500, background: decorSubTab === 'other' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: decorSubTab === 'other' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Декор
                                </button>
                                <button
                                    onClick={() => setDecorSubTab('flags')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium`} style={{ fontFamily: 'Nunito, sans-serif', borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: decorSubTab === 'flags' ? 700 : 500, background: decorSubTab === 'flags' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.08)', color: decorSubTab === 'flags' ? '#fff' : 'rgba(200,210,220,0.8)' }}
                                >
                                    Флаги
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                            {buildingsInCurrentTab.map(building => (
                                <div key={building.id} onClick={() => handleBuildingSelect(building)} className="cursor-pointer transition-all building-card-item" style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '4px 4px 3px 4px', border: '2px solid rgba(255,255,255,0.07)', textAlign: 'center' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                                >
                                    <div className="building-card-img-wrap" style={{ width: '100%', height: '68px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3px' }}>
                                        <img src={building.imageUrl} alt={building.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '2px' }} />
                                    </div>
                                    <p className="building-title-shimmer building-card-title" style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 800, marginBottom: '2px', lineHeight: 1.2 }}>{building.name}</p>
                                    <div className="building-card-cost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', marginBottom: '1px' }}>
                                        {getIsBuildingFree?.(building.id) ? (
                                            <>
                                                <img src={coinImageUrl} alt="Gold" style={{ width: '14px', height: '14px', marginRight: '4px', objectFit: 'contain' }} />
                                                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: '#34d399' }}>0 (Бесплатно)</span>
                                            </>
                                        ) : building.rubyPrice ? (
                                            <>
                                                <img src={rubyImageUrl} alt="Ruby" style={{ width: '14px', height: '14px', marginRight: '4px', objectFit: 'contain' }} />
                                                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: '#f472b6' }}>{building.rubyPrice}</span>
                                            </>
                                        ) : (
                                            <>
                                                <img src={coinImageUrl} alt="Gold" style={{ width: '14px', height: '14px', marginRight: '4px', objectFit: 'contain' }} />
                                                <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: '#fbbf24' }}>{building.price?.toLocaleString() || 0}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {buildingsInCurrentTab.length === 0 && <p style={{ fontFamily: 'Nunito, sans-serif', color: 'rgba(200,210,220,0.5)', gridColumn: 'span 3', textAlign: 'center', marginTop: '32px', fontSize: '14px' }}>{normalizedBuildMenuSearch ? 'Ничего не найдено по этому названию.' : 'Здания для этой категории еще не добавлены.'}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const BuildMenuModal = memo(BuildMenuModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.buildingData !== next.buildingData) return false;
    if (prev.rubyImageUrl !== next.rubyImageUrl) return false;
    if (prev.coinImageUrl !== next.coinImageUrl) return false;
    if (prev.getIsBuildingFree !== next.getIsBuildingFree) return false;
    if (prev.hasTownHall !== next.hasTownHall) return false;
    return true;
});
