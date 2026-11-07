import React, { memo } from 'react';
import { CloseIcon, InventoryIcon, TradeIcon } from '../../../components/IconComponents';
import type { MarketListing, Item } from '../../../types';
import {
    MarketBuySection,
    MarketResourceSection,
    MarketBedSection,
    MarketMonsterSection,
    MARKET_BUY_SECTION_LABELS,
    MARKET_RESOURCE_SECTION_LABELS,
    MARKET_BED_SECTION_LABELS,
    MARKET_MONSTER_SECTION_LABELS
} from '../../game/market/marketStaticData.js';
import { matchesMarketType } from '../../game/market/marketLogic.js';

export interface SellItemSelection {
    itemId: number | null;
    amount: number;
    price: number;
    currency: 'coins' | 'rubies';
}

export interface MarketModalProps {
    isOpen: boolean;
    onClose: () => void;
    marketType: 'general' | 'military';
    activeMarketTab: 'buy' | 'sell';
    onTabChange: (tab: 'buy' | 'sell') => void;
    activeMarketBuySection: MarketBuySection;
    onBuySectionChange: (section: MarketBuySection) => void;
    activeMarketResourceSection: MarketResourceSection;
    onResourceSectionChange: (section: MarketResourceSection) => void;
    activeMarketBedSection: MarketBedSection;
    onBedSectionChange: (section: MarketBedSection) => void;
    activeMarketMonsterSection: MarketMonsterSection;
    onMonsterSectionChange: (section: MarketMonsterSection) => void;
    filteredBuyMarketListings: MarketListing[];
    marketListings: MarketListing[];
    inventory: Record<number, number>;
    itemData: Item[];
    currentUserId?: string;
    playerGold: number;
    playerRubies: number;
    sellItemSelection: SellItemSelection;
    onSellItemSelectionChange: React.Dispatch<React.SetStateAction<SellItemSelection>>;
    isMarketProcessing: boolean;
    coinImageUrl?: string;
    rubyImageUrl?: string;
    onBuyMarketItem: (listing: MarketListing) => void;
    onCancelListing: (listing: MarketListing) => void;
    onCreateListing: () => void;
}

export const MarketModal: React.FC<MarketModalProps> = memo(({
    isOpen,
    onClose,
    marketType,
    activeMarketTab,
    onTabChange,
    activeMarketBuySection,
    onBuySectionChange,
    activeMarketResourceSection,
    onResourceSectionChange,
    activeMarketBedSection,
    onBedSectionChange,
    activeMarketMonsterSection,
    onMonsterSectionChange,
    filteredBuyMarketListings,
    marketListings,
    inventory,
    itemData,
    currentUserId,
    playerGold,
    playerRubies,
    sellItemSelection,
    onSellItemSelectionChange,
    isMarketProcessing,
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    rubyImageUrl = '/Gui/Front/значек рубинов/Nj7hb.webp',
    onBuyMarketItem,
    onCancelListing,
    onCreateListing
}) => {
    if (!isOpen) return null;

    const displayedBuyListings = marketType === 'general'
        ? filteredBuyMarketListings
        : marketListings.filter(l => matchesMarketType(l, marketType));

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-4xl h-[650px] bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            <TradeIcon className={`w-6 h-6 ${marketType === 'military' ? 'text-red-400' : 'text-purple-300'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                {marketType === 'military' ? 'Военный рынок' : 'Рынок'}
                            </h2>
                            <p className="text-xs text-purple-300/80">
                                {marketType === 'military' ? 'Торговля вооружением и боеприпасами' : 'Торговая площадка между жителями города'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-2">
                    <button
                        onClick={() => onTabChange('buy')}
                        className={`px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeMarketTab === 'buy'
                                ? 'bg-purple-600/30 text-purple-300 border-t-2 border-purple-400 shadow-[0_-4px_12px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        🛒 Покупка
                    </button>
                    <button
                        onClick={() => onTabChange('sell')}
                        className={`px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 ${
                            activeMarketTab === 'sell'
                                ? 'bg-purple-600/30 text-purple-300 border-t-2 border-purple-400 shadow-[0_-4px_12px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        💰 Продажа
                    </button>
                </div>

                <div className="flex-grow overflow-hidden flex flex-col p-4 sm:p-5">
                    {activeMarketTab === 'buy' ? (
                        <div className="overflow-y-auto h-full pr-1 custom-scrollbar">
                            {marketType === 'general' && (
                                <div className="mb-4 space-y-2.5">
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.entries(MARKET_BUY_SECTION_LABELS) as [MarketBuySection, string][]).map(([section, label]) => (
                                            <button
                                                key={section}
                                                onClick={() => {
                                                    onBuySectionChange(section);
                                                    if (section === 'resources') onResourceSectionChange('wood');
                                                    if (section === 'beds') onBedSectionChange('mushroom');
                                                    if (section === 'monsters') onMonsterSectionChange('hut');
                                                }}
                                                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                                                    activeMarketBuySection === section
                                                        ? 'bg-purple-600/40 text-purple-200 border border-purple-400/50 shadow-md'
                                                        : 'bg-gray-800/80 text-gray-400 hover:text-white border border-white/5'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {activeMarketBuySection === 'resources' &&
                                            (Object.entries(MARKET_RESOURCE_SECTION_LABELS) as [MarketResourceSection, string][]).map(([section, label]) => (
                                                <button
                                                    key={section}
                                                    onClick={() => onResourceSectionChange(section)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                        activeMarketResourceSection === section
                                                            ? 'bg-purple-900/60 text-purple-200 border border-purple-400/40 shadow-sm'
                                                            : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-white/5'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}

                                        {activeMarketBuySection === 'beds' &&
                                            (Object.entries(MARKET_BED_SECTION_LABELS) as [MarketBedSection, string][]).map(([section, label]) => (
                                                <button
                                                    key={section}
                                                    onClick={() => onBedSectionChange(section)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                        activeMarketBedSection === section
                                                            ? 'bg-purple-900/60 text-purple-200 border border-purple-400/40 shadow-sm'
                                                            : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-white/5'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}

                                        {activeMarketBuySection === 'monsters' &&
                                            (Object.entries(MARKET_MONSTER_SECTION_LABELS) as [MarketMonsterSection, string][]).map(([section, label]) => (
                                                <button
                                                    key={section}
                                                    onClick={() => onMonsterSectionChange(section)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                        activeMarketMonsterSection === section
                                                            ? 'bg-purple-900/60 text-purple-200 border border-purple-400/40 shadow-sm'
                                                            : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-white/5'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {displayedBuyListings.length === 0 ? (
                                    <p className="col-span-3 text-center text-purple-300/60 mt-10 text-sm">На этом рынке пока нет предложений.</p>
                                ) : (
                                    displayedBuyListings.map(listing => {
                                        const item = itemData.find(i => i.id === listing.resourceId);
                                        if (!item) return null;
                                        const isOwn = Boolean(currentUserId && listing.sellerId === currentUserId);

                                        return (
                                            <div key={listing.id} className="bg-gray-900/70 p-3.5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 shadow-md transition-all flex flex-col relative">
                                                <div className="flex items-center mb-2.5">
                                                    <div className="w-11 h-11 bg-black/40 rounded-xl p-1.5 mr-3 shrink-0 border border-purple-500/20 flex items-center justify-center">
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-white text-sm truncate">{item.name}</p>
                                                        <p className="text-xs text-purple-300/70">Продавец: <span className="text-purple-200 font-semibold">{listing.sellerName}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center bg-black/40 p-2 rounded-xl mb-3 border border-purple-500/10">
                                                    <span className="text-xs text-gray-300">Кол-во: <span className="text-white font-bold">{listing.amount}</span></span>
                                                    <div className="flex items-center font-extrabold text-sm">
                                                        <span className={listing.currency === 'coins' ? 'text-yellow-400' : 'text-pink-400'}>{listing.price.toLocaleString()}</span>
                                                        {listing.currency === 'coins' ? (
                                                            <img src={coinImageUrl} className="w-4 h-4 ml-1 object-contain" alt="C" />
                                                        ) : (
                                                            <img src={rubyImageUrl} className="w-4 h-4 ml-1 object-contain" alt="R" />
                                                        )}
                                                    </div>
                                                </div>
                                                {isOwn ? (
                                                    <button
                                                        onClick={() => onCancelListing(listing)}
                                                        className={`w-full font-bold py-2 rounded-xl text-xs shadow-md transition-all ${isMarketProcessing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-rose-800 to-red-900 hover:from-rose-700 hover:to-red-800 text-white border border-rose-500/30'}`}
                                                        disabled={isMarketProcessing}
                                                    >
                                                        Снять с продажи
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onBuyMarketItem(listing)}
                                                        className={`w-full font-bold py-2 rounded-xl text-xs shadow-md transition-all ${isMarketProcessing || (listing.currency === 'coins' && playerGold < listing.price) || (listing.currency === 'rubies' && playerRubies < listing.price)
                                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border border-emerald-400/30 shadow-emerald-950/40'
                                                            }`}
                                                        disabled={isMarketProcessing || (listing.currency === 'coins' && playerGold < listing.price) || (listing.currency === 'rubies' && playerRubies < listing.price)}
                                                    >
                                                        Купить
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col md:flex-row gap-4 overflow-hidden">
                            <div className="w-full md:w-1/2 overflow-y-auto bg-gray-900/60 p-3 rounded-xl border border-purple-500/20 custom-scrollbar">
                                <h3 className="text-xs text-purple-300 mb-2 uppercase font-bold tracking-wider">Ваш инвентарь</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {playerRubies > 0 && (marketType !== 'military') && (
                                        <div
                                            key={10014}
                                            onClick={() => onSellItemSelectionChange(prev => ({ ...prev, itemId: 10014, amount: 1 }))}
                                            className={`bg-black/50 p-2 rounded-xl cursor-pointer border transition-all ${sellItemSelection.itemId === 10014 ? 'border-purple-400 ring-2 ring-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'border-purple-500/20 hover:border-purple-400/50'} flex flex-col items-center relative`}
                                        >
                                            <div className="w-10 h-10 mb-1 flex items-center justify-center">
                                                <img src={rubyImageUrl} alt="Ruby" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-[10px] text-pink-300 font-extrabold absolute top-0.5 right-1 bg-black/80 px-1 rounded">{playerRubies}</span>
                                        </div>
                                    )}
                                    {Object.entries(inventory).map(([idStr, val]) => {
                                        const amount = val as number;
                                        const id = parseInt(idStr);
                                        if (amount <= 0) return null;

                                        if (!matchesMarketType({ id, sellerName: '', sellerId: '', resourceId: id, amount, price: 0, currency: 'coins' }, marketType)) return null;

                                        const item = itemData.find(i => i.id === id);
                                        const isSelected = sellItemSelection.itemId === id;

                                        return (
                                            <div
                                                key={id}
                                                onClick={() => onSellItemSelectionChange(prev => ({ ...prev, itemId: id, amount: 1 }))}
                                                className={`bg-black/50 p-2 rounded-xl cursor-pointer border transition-all ${isSelected ? 'border-purple-400 ring-2 ring-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]' : 'border-purple-500/20 hover:border-purple-400/50'} flex flex-col items-center relative`}
                                            >
                                                <div className="w-10 h-10 mb-1 flex items-center justify-center">
                                                    {item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />}
                                                </div>
                                                <span className="text-[10px] text-purple-200 font-extrabold absolute top-0.5 right-1 bg-black/80 px-1 rounded">{amount}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {Object.keys(inventory).filter(id => {
                                    const numericId = parseInt(id);
                                    return matchesMarketType({ id: numericId, sellerName: '', sellerId: '', resourceId: numericId, amount: inventory[numericId] || 0, price: 0, currency: 'coins' }, marketType) && (inventory[numericId] || 0) > 0;
                                }).length === 0 && (
                                    <p className="text-center text-purple-300/50 mt-10 text-xs">
                                        {marketType === 'military' ? 'Нет военных товаров для продажи.' : 'Нет товаров для обычного рынка.'}
                                    </p>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 flex flex-col justify-between shadow-md">
                                <h3 className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-2 border-b border-purple-500/20 pb-2">Параметры продажи</h3>

                                {sellItemSelection.itemId ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 bg-black/40 p-3 rounded-xl border border-purple-500/20">
                                            <div className="w-14 h-14 bg-gray-950 rounded-xl border border-purple-500/30 flex items-center justify-center p-2">
                                                <img src={itemData.find(i => i.id === sellItemSelection.itemId)?.imageUrl} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-white text-base">{itemData.find(i => i.id === sellItemSelection.itemId)?.name}</p>
                                                <p className="text-xs text-purple-300/70">В наличии: <span className="text-white font-bold">{sellItemSelection.itemId === 10014 ? playerRubies : (inventory[sellItemSelection.itemId!] || 0)}</span></p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-purple-200 mb-1">Количество</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={sellItemSelection.itemId === 10014 ? playerRubies : (inventory[sellItemSelection.itemId!] || 1)}
                                                value={sellItemSelection.amount === 0 ? '' : sellItemSelection.amount}
                                                placeholder="1"
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === '') {
                                                        onSellItemSelectionChange(prev => ({ ...prev, amount: 0 }));
                                                        return;
                                                    }
                                                    const max = sellItemSelection.itemId === 10014 ? playerRubies : (inventory[sellItemSelection.itemId!] || 1);
                                                    const val = parseInt(raw, 10);
                                                    if (!isNaN(val)) {
                                                        onSellItemSelectionChange(prev => ({ ...prev, amount: Math.max(0, Math.min(max, val)) }));
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (!sellItemSelection.amount || sellItemSelection.amount < 1) {
                                                        onSellItemSelectionChange(prev => ({ ...prev, amount: 1 }));
                                                    }
                                                }}
                                                className="w-full bg-black/60 border border-purple-500/30 rounded-xl p-2.5 text-white text-sm focus:border-purple-400 focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-purple-200 mb-1">Цена</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={sellItemSelection.price === 0 ? '' : sellItemSelection.price}
                                                    placeholder="1"
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        if (raw === '') {
                                                            onSellItemSelectionChange(prev => ({ ...prev, price: 0 }));
                                                            return;
                                                        }
                                                        const val = parseInt(raw, 10);
                                                        if (!isNaN(val)) {
                                                            onSellItemSelectionChange(prev => ({ ...prev, price: Math.max(0, val) }));
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (!sellItemSelection.price || sellItemSelection.price < 1) {
                                                            onSellItemSelectionChange(prev => ({ ...prev, price: 1 }));
                                                        }
                                                    }}
                                                    className="w-full bg-black/60 border border-purple-500/30 rounded-xl p-2.5 text-white text-sm focus:border-purple-400 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-purple-200 mb-1">Валюта</label>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => onSellItemSelectionChange(prev => ({ ...prev, currency: 'coins' }))}
                                                        className={`flex-1 p-2 rounded-xl flex justify-center items-center border transition-all ${sellItemSelection.currency === 'coins' ? 'bg-yellow-950/60 border-yellow-500 shadow-sm' : 'bg-black/40 border-purple-500/20 hover:bg-gray-800'}`}
                                                    >
                                                        <img src={coinImageUrl} className="w-5 h-5 object-contain" alt="C" />
                                                    </button>
                                                    <button
                                                        onClick={() => onSellItemSelectionChange(prev => ({ ...prev, currency: 'rubies' }))}
                                                        className={`flex-1 p-2 rounded-xl flex justify-center items-center border transition-all ${sellItemSelection.currency === 'rubies' ? 'bg-pink-950/60 border-pink-500 shadow-sm' : 'bg-black/40 border-purple-500/20 hover:bg-gray-800'}`}
                                                    >
                                                        <img src={rubyImageUrl} className="w-5 h-5 object-contain" alt="R" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={onCreateListing}
                                                className={`w-full font-black py-3 rounded-xl text-sm shadow-lg transition-all ${isMarketProcessing ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 shadow-purple-900/40'}`}
                                                disabled={isMarketProcessing}
                                            >
                                                Выставить за {sellItemSelection.price.toLocaleString()} {sellItemSelection.currency === 'coins' ? 'монет' : 'рубинов'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-purple-300/40 py-12">
                                        <InventoryIcon className="w-16 h-16 mb-4 opacity-30" />
                                        <p className="text-center text-xs">Выберите предмет из инвентаря слева, чтобы выставить его на продажу.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    if (!prevProps.isOpen && !nextProps.isOpen) return true;
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    return (
        prevProps.marketType === nextProps.marketType &&
        prevProps.activeMarketTab === nextProps.activeMarketTab &&
        prevProps.activeMarketBuySection === nextProps.activeMarketBuySection &&
        prevProps.activeMarketResourceSection === nextProps.activeMarketResourceSection &&
        prevProps.activeMarketBedSection === nextProps.activeMarketBedSection &&
        prevProps.activeMarketMonsterSection === nextProps.activeMarketMonsterSection &&
        prevProps.filteredBuyMarketListings === nextProps.filteredBuyMarketListings &&
        prevProps.marketListings === nextProps.marketListings &&
        prevProps.inventory === nextProps.inventory &&
        prevProps.playerGold === nextProps.playerGold &&
        prevProps.playerRubies === nextProps.playerRubies &&
        prevProps.sellItemSelection === nextProps.sellItemSelection &&
        prevProps.isMarketProcessing === nextProps.isMarketProcessing &&
        prevProps.currentUserId === nextProps.currentUserId
    );
});

MarketModal.displayName = 'MarketModal';
