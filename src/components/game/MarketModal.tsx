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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-4xl border border-gray-600 h-[600px] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <TradeIcon className={`w-8 h-8 mr-3 ${marketType === 'military' ? 'text-red-500' : 'text-green-400'}`} />
                        {marketType === 'military' ? 'Военный рынок' : 'Рынок'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </div>

                <div className="flex space-x-1 mb-4 border-b border-gray-700">
                    <button
                        onClick={() => onTabChange('buy')}
                        className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeMarketTab === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                        Покупка
                    </button>
                    <button
                        onClick={() => onTabChange('sell')}
                        className={`px-4 py-2 font-bold rounded-t-lg transition-colors ${activeMarketTab === 'sell' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    >
                        Продажа
                    </button>
                </div>

                <div className="flex-grow overflow-hidden flex flex-col">
                    {activeMarketTab === 'buy' ? (
                        <div className="overflow-y-auto h-full p-2">
                            {marketType === 'general' && (
                                <div className="mb-4 space-y-3">
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
                                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                                    activeMarketBuySection === section
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        activeMarketResourceSection === section
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        activeMarketBedSection === section
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        activeMarketMonsterSection === section
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {displayedBuyListings.length === 0 ? (
                                    <p className="col-span-3 text-center text-gray-500 mt-10">На этом рынке пока нет предложений.</p>
                                ) : (
                                    displayedBuyListings.map(listing => {
                                        const item = itemData.find(i => i.id === listing.resourceId);
                                        if (!item) return null;
                                        const isOwn = Boolean(currentUserId && listing.sellerId === currentUserId);

                                        return (
                                            <div key={listing.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex flex-col relative">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-12 h-12 bg-gray-800 rounded p-1 mr-3 shrink-0">
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-white truncate">{item.name}</p>
                                                        <p className="text-sm text-gray-400">Продавец: <span className="text-blue-300">{listing.sellerName}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center bg-gray-800/50 p-2 rounded mb-3">
                                                    <span className="text-sm text-gray-300">Кол-во: <span className="text-white font-bold">{listing.amount}</span></span>
                                                    <div className="flex items-center font-bold">
                                                        <span className={listing.currency === 'coins' ? 'text-yellow-400' : 'text-pink-400'}>{listing.price.toLocaleString()}</span>
                                                        {listing.currency === 'coins' ? (
                                                            <img src={coinImageUrl} className="w-4 h-4 ml-1" alt="C" />
                                                        ) : (
                                                            <img src={rubyImageUrl} className="w-4 h-4 ml-1" alt="R" />
                                                        )}
                                                    </div>
                                                </div>
                                                {isOwn ? (
                                                    <button
                                                        onClick={() => onCancelListing(listing)}
                                                        className={`w-full font-bold py-2 rounded text-sm ${isMarketProcessing ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                                                        disabled={isMarketProcessing}
                                                    >
                                                        Снять с продажи
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onBuyMarketItem(listing)}
                                                        className={`w-full font-bold py-2 rounded text-sm ${isMarketProcessing || (listing.currency === 'coins' && playerGold < listing.price) || (listing.currency === 'rubies' && playerRubies < listing.price)
                                                                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
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
                            <div className="w-full md:w-1/2 overflow-y-auto bg-gray-900/30 p-2 rounded border border-gray-700">
                                <h3 className="text-sm text-gray-400 mb-2 uppercase font-bold">Ваш инвентарь</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {playerRubies > 0 && (marketType !== 'military') && (
                                        <div
                                            key={10014}
                                            onClick={() => onSellItemSelectionChange(prev => ({ ...prev, itemId: 10014, amount: 1 }))}
                                            className={`bg-gray-800 p-2 rounded cursor-pointer border ${sellItemSelection.itemId === 10014 ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-600 hover:border-gray-400'} flex flex-col items-center relative`}
                                        >
                                            <div className="w-10 h-10 mb-1">
                                                <img src={rubyImageUrl} alt="Ruby" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xs text-white absolute top-0 right-0 bg-gray-900 px-1 rounded-bl">{playerRubies}</span>
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
                                                className={`bg-gray-800 p-2 rounded cursor-pointer border ${isSelected ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-600 hover:border-gray-400'} flex flex-col items-center relative`}
                                            >
                                                <div className="w-10 h-10 mb-1">
                                                    {item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />}
                                                </div>
                                                <span className="text-xs text-white absolute top-0 right-0 bg-gray-900 px-1 rounded-bl">{amount}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {Object.keys(inventory).filter(id => {
                                    const numericId = parseInt(id);
                                    return matchesMarketType({ id: numericId, sellerName: '', sellerId: '', resourceId: numericId, amount: inventory[numericId] || 0, price: 0, currency: 'coins' }, marketType) && (inventory[numericId] || 0) > 0;
                                }).length === 0 && (
                                    <p className="text-center text-gray-500 mt-10 text-sm">
                                        {marketType === 'military' ? 'Нет военных товаров для продажи.' : 'Нет товаров для обычного рынка.'}
                                    </p>
                                )}
                            </div>
                            <div className="w-full md:w-1/2 bg-gray-700/30 p-4 rounded border border-gray-600 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-600 pb-2">Параметры продажи</h3>

                                {sellItemSelection.itemId ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                                                <img src={itemData.find(i => i.id === sellItemSelection.itemId)?.imageUrl} className="w-12 h-12 object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-lg">{itemData.find(i => i.id === sellItemSelection.itemId)?.name}</p>
                                                <p className="text-sm text-gray-400">В наличии: <span className="text-white">{sellItemSelection.itemId === 10014 ? playerRubies : (inventory[sellItemSelection.itemId!] || 0)}</span></p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-300 mb-1">Количество</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={sellItemSelection.itemId === 10014 ? playerRubies : (inventory[sellItemSelection.itemId!] || 1)}
                                                value={sellItemSelection.amount}
                                                onChange={(e) => {
                                                    const max = sellItemSelection.itemId === 10014 ? playerRubies : (inventory[sellItemSelection.itemId!] || 1);
                                                    onSellItemSelectionChange(prev => ({ ...prev, amount: Math.max(1, Math.min(max, parseInt(e.target.value) || 1)) }));
                                                }}
                                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">Цена</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={sellItemSelection.price}
                                                    onChange={(e) => onSellItemSelectionChange(prev => ({ ...prev, price: Math.max(1, parseInt(e.target.value) || 1) }))}
                                                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-300 mb-1">Валюта</label>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => onSellItemSelectionChange(prev => ({ ...prev, currency: 'coins' }))}
                                                        className={`flex-1 p-2 rounded flex justify-center items-center border ${sellItemSelection.currency === 'coins' ? 'bg-yellow-900/50 border-yellow-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                                                    >
                                                        <img src={coinImageUrl} className="w-5 h-5" alt="C" />
                                                    </button>
                                                    <button
                                                        onClick={() => onSellItemSelectionChange(prev => ({ ...prev, currency: 'rubies' }))}
                                                        className={`flex-1 p-2 rounded flex justify-center items-center border ${sellItemSelection.currency === 'rubies' ? 'bg-pink-900/50 border-pink-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                                                    >
                                                        <img src={rubyImageUrl} className="w-5 h-5" alt="R" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                onClick={onCreateListing}
                                                className={`w-full font-bold py-3 rounded text-lg shadow-lg ${isMarketProcessing ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                                disabled={isMarketProcessing}
                                            >
                                                Выставить за {sellItemSelection.price} {sellItemSelection.currency === 'coins' ? 'монет' : 'рубинов'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <InventoryIcon className="w-16 h-16 mb-4 opacity-30" />
                                        <p className="text-center">Выберите предмет из инвентаря, чтобы выставить его на рынок.</p>
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
