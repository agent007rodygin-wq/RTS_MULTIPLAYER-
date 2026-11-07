import React, { useState } from 'react';
import {
    ClanStockListing,
    PlayerStockHolding,
    calculateSharePurchaseCost,
    calculateShareSellProceeds,
    validateIpoParameters,
    MAX_CLAN_SHARES,
    MIN_CLAN_SHARES,
    MIN_IPO_PRICE,
    MAX_IPO_PRICE,
    MIN_DIVIDEND_PERCENT,
    MAX_DIVIDEND_PERCENT,
    DEFAULT_EXCHANGE_FEE_PERCENT,
} from '../../game/economy/clanStockLogic';
import { Clan } from '../../../types';

interface ClanStockExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    listings: ClanStockListing[];
    playerPortfolio: Record<number, PlayerStockHolding>;
    playerGold: number;
    userUid: string | null;
    currentClan: Clan | null;
    isClanLeader: boolean;
    clanBank: number;
    controlledWatchtowersCount: number;
    onLaunchIpo: (params: { ticker: string; totalShares: number; ipoPrice: number; dividendPercent: number }) => void;
    onBuyShares: (clanId: number, sharesCount: number) => void;
    onSellShares: (clanId: number, sharesCount: number) => void;
    onClaimDividends: (clanId: number) => void;
    onAdjustDividendPercent: (clanId: number, newPercent: number) => void;
    onBuybackShares: (clanId: number, sharesCount: number) => void;
}

type TabType = 'market' | 'portfolio' | 'management';

export const ClanStockExchangeModal: React.FC<ClanStockExchangeModalProps> = ({
    isOpen,
    onClose,
    listings,
    playerPortfolio,
    playerGold,
    userUid,
    currentClan,
    isClanLeader,
    clanBank,
    controlledWatchtowersCount,
    onLaunchIpo,
    onBuyShares,
    onSellShares,
    onClaimDividends,
    onAdjustDividendPercent,
    onBuybackShares,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('market');
    const [searchTerm, setSearchTerm] = useState('');

    // Buy modal state
    const [buyingListing, setBuyingListing] = useState<ClanStockListing | null>(null);
    const [buySharesCount, setBuySharesCount] = useState<number>(10);

    // Sell modal state
    const [sellingHolding, setSellingHolding] = useState<PlayerStockHolding | null>(null);
    const [sellSharesCount, setSellSharesCount] = useState<number>(10);

    // IPO form state
    const [ipoTicker, setIpoTicker] = useState(currentClan?.name ? currentClan.name.substring(0, 4).toUpperCase() : 'CLAN');
    const [ipoTotalShares, setIpoTotalShares] = useState(5000);
    const [ipoPrice, setIpoPrice] = useState(250);
    const [ipoDividendPercent, setIpoDividendPercent] = useState(25);
    const [ipoError, setIpoError] = useState<string | null>(null);

    // Buyback state
    const [buybackCount, setBuybackCount] = useState(100);

    if (!isOpen) return null;

    // Filter listings
    const filteredListings = listings.filter(l =>
        l.clanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.leaderName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // My Clan's listing (if any)
    const myClanListing = currentClan ? listings.find(l => l.clanId === currentClan.id) : null;

    // Total Portfolio Metrics
    const holdingsList = Object.values(playerPortfolio).filter(h => h.sharesCount > 0);
    const totalPortfolioValue = holdingsList.reduce((acc, h) => {
        const listing = listings.find(l => l.clanId === h.clanId);
        const price = listing ? listing.currentPrice : 0;
        return acc + h.sharesCount * price;
    }, 0);
    const totalUnclaimedDividends = holdingsList.reduce((acc, h) => acc + (h.unclaimedDividends || 0), 0);

    const handleExecuteIpo = () => {
        setIpoError(null);
        const validation = validateIpoParameters({
            ticker: ipoTicker,
            totalShares: ipoTotalShares,
            ipoPrice,
            dividendPercent: ipoDividendPercent,
        });

        if (!validation.ok) {
            setIpoError(validation.error || 'Ошибка параметров IPO');
            return;
        }

        onLaunchIpo({
            ticker: ipoTicker.trim().toUpperCase(),
            totalShares: ipoTotalShares,
            ipoPrice,
            dividendPercent: ipoDividendPercent,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white">

                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-2xl shadow-inner">
                            📈
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200">
                                Биржа акций кланов
                            </h2>
                            <p className="text-xs text-purple-300/80">
                                Инвестиции в кланы, дивиденды от сторожевых башен и фондовый рынок
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Player Gold Balance */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-yellow-500/30">
                            <span className="text-xs text-gray-400">Баланс:</span>
                            <span className="font-extrabold text-yellow-400 text-sm">{playerGold.toLocaleString()} 💰</span>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-2 overflow-x-auto custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'market'
                                ? 'bg-purple-600/30 text-purple-300 border-t-2 border-purple-400 shadow-[0_-4px_12px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        🏛️ Котировки рынка ({listings.length})
                    </button>

                    <button
                        onClick={() => setActiveTab('portfolio')}
                        className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'portfolio'
                                ? 'bg-purple-600/30 text-purple-300 border-t-2 border-purple-400 shadow-[0_-4px_12px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        💼 Мой портфель ({holdingsList.length})
                        {totalUnclaimedDividends > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] bg-yellow-500 text-black font-black rounded-full animate-pulse">
                                +{totalUnclaimedDividends}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('management')}
                        className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'management'
                                ? 'bg-purple-600/30 text-purple-300 border-t-2 border-purple-400 shadow-[0_-4px_12px_rgba(168,85,247,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        👑 Управление эмиссией {isClanLeader ? '✓' : '🔒'}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">

                    {/* TAB 1: MARKET */}
                    {activeTab === 'market' && (
                        <div className="space-y-4">
                            {/* Search bar & info banner */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <input
                                    type="text"
                                    placeholder="🔍 Поиск по названию клана, тикеру или лидеру..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 rounded-xl bg-gray-900 border border-purple-500/30 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 w-full sm:w-80"
                                />

                                <div className="text-xs text-purple-300/80 bg-purple-950/40 px-3 py-2 rounded-xl border border-purple-500/20">
                                    💡 Держатели акций ежедневно получают дивиденды из налогов сторожевых башен клана!
                                </div>
                            </div>

                            {/* Listings Table / Cards */}
                            {filteredListings.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-4xl mb-3">🏛️</div>
                                    <p className="text-base font-bold">Нет активных акций кланов</p>
                                    <p className="text-xs text-gray-400 mt-1">Лидеры сильных кланов могут выпустить акции во вкладке «Управление эмиссией».</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredListings.map(listing => {
                                        const myHolding = playerPortfolio[listing.clanId];
                                        const soldRatio = listing.totalShares > 0 ? (listing.circulatingShares / listing.totalShares) * 100 : 0;

                                        return (
                                            <div
                                                key={listing.clanId}
                                                className="bg-gray-900/60 rounded-2xl border border-purple-500/30 p-4 hover:border-purple-400/60 transition-all flex flex-col justify-between gap-3 shadow-lg hover:shadow-purple-500/10"
                                            >
                                                {/* Card Header */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded-md bg-purple-900/80 border border-purple-400/60 text-purple-200 font-black text-xs tracking-wider">
                                                                [{listing.ticker}]
                                                            </span>
                                                            <h3 className="font-extrabold text-base text-white">{listing.clanName}</h3>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-0.5">Лидер: <span className="text-gray-300">{listing.leaderName}</span></p>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="font-black text-lg text-yellow-400">{listing.currentPrice.toLocaleString()} 💰</div>
                                                        <div className="text-[10px] text-gray-400">за 1 акцию</div>
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 text-center text-xs">
                                                    <div>
                                                        <span className="text-gray-400 block text-[10px]">Башни</span>
                                                        <span className="font-bold text-blue-300">{listing.controlledSectorsCount} 🏰</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[10px]">Дивиденды</span>
                                                        <span className="font-bold text-green-400">{listing.dividendPercent}% от налога</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[10px]">Пул акций</span>
                                                        <span className="font-bold text-purple-300">{listing.availableIpoShares.toLocaleString()} шт.</span>
                                                    </div>
                                                </div>

                                                {/* Progress bar of sold shares */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] text-gray-400">
                                                        <span>В обращении: {listing.circulatingShares.toLocaleString()}</span>
                                                        <span>Всего: {listing.totalShares.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                            style={{ width: `${Math.min(100, soldRatio)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Card Action */}
                                                <div className="flex items-center justify-between pt-1">
                                                    {myHolding && myHolding.sharesCount > 0 ? (
                                                        <span className="text-xs text-yellow-400 font-bold">
                                                            В портфеле: {myHolding.sharesCount} шт.
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-gray-500">Не куплено</span>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setBuyingListing(listing);
                                                            setBuySharesCount(10);
                                                        }}
                                                        disabled={listing.availableIpoShares <= 0}
                                                        className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:cursor-not-allowed"
                                                    >
                                                        {listing.availableIpoShares > 0 ? 'Купить акции 🛒' : 'Распродано'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: PORTFOLIO */}
                    {activeTab === 'portfolio' && (
                        <div className="space-y-5">
                            {/* Portfolio Summary Card */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-gray-900 to-black border border-purple-500/40 shadow-xl">
                                <div>
                                    <span className="text-xs text-gray-400 block">Стоимость портфеля</span>
                                    <span className="text-xl sm:text-2xl font-black text-white">{totalPortfolioValue.toLocaleString()} 💰</span>
                                </div>

                                <div>
                                    <span className="text-xs text-gray-400 block">Невыплаченные дивиденды</span>
                                    <span className="text-xl sm:text-2xl font-black text-yellow-400">+{totalUnclaimedDividends.toLocaleString()} 💰</span>
                                </div>

                                <div className="flex items-center justify-start sm:justify-end">
                                    <button
                                        onClick={() => {
                                            holdingsList.forEach(h => {
                                                if (h.unclaimedDividends > 0) onClaimDividends(h.clanId);
                                            });
                                        }}
                                        disabled={totalUnclaimedDividends <= 0}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:from-gray-700 disabled:to-gray-800 text-black font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all disabled:cursor-not-allowed disabled:text-gray-400"
                                    >
                                        💰 Забрать все дивиденды
                                    </button>
                                </div>
                            </div>

                            {/* Holdings List */}
                            {holdingsList.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-4xl mb-3">💼</div>
                                    <p className="text-base font-bold">Ваш портфель пуст</p>
                                    <p className="text-xs text-gray-400 mt-1">Купите акции кланов во вкладке «Котировки рынка», чтобы получать пассивный доход.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {holdingsList.map(holding => {
                                        const listing = listings.find(l => l.clanId === holding.clanId);
                                        const currentPrice = listing ? listing.currentPrice : 0;
                                        const totalValue = holding.sharesCount * currentPrice;
                                        const pnl = totalValue - (holding.totalInvestedGold || 0);

                                        return (
                                            <div
                                                key={holding.clanId}
                                                className="p-4 rounded-xl bg-gray-900/60 border border-purple-500/20 hover:border-purple-500/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="px-2.5 py-1 rounded-lg bg-purple-900/80 border border-purple-400/60 text-purple-200 font-black text-sm">
                                                        [{holding.ticker}]
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-white text-base">{holding.clanName}</h4>
                                                        <p className="text-xs text-gray-400">
                                                            {holding.sharesCount.toLocaleString()} акций • Текущая цена: {currentPrice.toLocaleString()} 💰
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-4">
                                                    <div className="text-right">
                                                        <div className="font-extrabold text-sm text-white">{totalValue.toLocaleString()} 💰</div>
                                                        <div className={`text-[11px] font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            P&L: {pnl >= 0 ? `+${pnl.toLocaleString()}` : pnl.toLocaleString()} 💰
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {/* Claim Dividend Button */}
                                                        <button
                                                            onClick={() => onClaimDividends(holding.clanId)}
                                                            disabled={(holding.unclaimedDividends || 0) <= 0}
                                                            className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40 rounded-xl text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            +{holding.unclaimedDividends || 0} 💰
                                                        </button>

                                                        {/* Sell Button */}
                                                        <button
                                                            onClick={() => {
                                                                setSellingHolding(holding);
                                                                setSellSharesCount(Math.min(10, holding.sharesCount));
                                                            }}
                                                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-white/10 rounded-xl text-xs font-bold"
                                                        >
                                                            Продать
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: MANAGEMENT (ISSUER PANEL) */}
                    {activeTab === 'management' && (
                        <div className="space-y-6">
                            {!currentClan ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-4xl mb-3">🛡️</div>
                                    <p className="text-base font-bold text-gray-300">Вы не состоите в клане</p>
                                    <p className="text-xs text-gray-400 mt-1">Создайте клан или вступите в клан, чтобы участвовать в акционерной экономике.</p>
                                </div>
                            ) : !isClanLeader ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-4xl mb-3">👑</div>
                                    <p className="text-base font-bold text-gray-300">Доступ только для Лидера Клана</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Только создатель и лидер клана <span className="text-purple-300 font-bold">{currentClan.name}</span> имеет право выпускать акции и управлять дивидендной квотой.
                                    </p>
                                </div>
                            ) : !myClanListing ? (
                                /* IPO LAUNCH FORM */
                                <div className="max-w-xl mx-auto bg-gray-900/60 p-5 sm:p-6 rounded-2xl border border-purple-500/40 shadow-xl space-y-4">
                                    <div className="border-b border-purple-500/20 pb-3">
                                        <h3 className="text-lg font-black text-purple-300 flex items-center gap-2">
                                            🚀 Первичное публичное размещение (IPO) клана
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Выпустите акции клана <span className="text-white font-bold">{currentClan.name}</span>. Средства от продажи акций инвесторам моментально поступают в ваш клановый банк!
                                        </p>
                                    </div>

                                    {ipoError && (
                                        <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs">
                                            ⚠️ {ipoError}
                                        </div>
                                    )}

                                    {/* Ticker input */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-300 block mb-1">
                                            Биржевой тикер (2-5 символов)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            value={ipoTicker}
                                            onChange={(e) => setIpoTicker(e.target.value.toUpperCase())}
                                            placeholder="Например, LEGI"
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/30 text-white font-black tracking-widest text-sm focus:outline-none focus:border-purple-400"
                                        />
                                    </div>

                                    {/* Shares Count Slider */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-300">Объем эмиссии:</span>
                                            <span className="font-black text-purple-300">{ipoTotalShares.toLocaleString()} акций</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={MIN_CLAN_SHARES}
                                            max={MAX_CLAN_SHARES}
                                            step={500}
                                            value={ipoTotalShares}
                                            onChange={(e) => setIpoTotalShares(Number(e.target.value))}
                                            className="w-full accent-purple-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>Мин: {MIN_CLAN_SHARES}</span>
                                            <span>Макс: {MAX_CLAN_SHARES.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* IPO Price Input */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-300">Стартовая цена акции (IPO):</span>
                                            <span className="font-black text-yellow-400">{ipoPrice} 💰</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={MIN_IPO_PRICE}
                                            max={MAX_IPO_PRICE}
                                            step={50}
                                            value={ipoPrice}
                                            onChange={(e) => setIpoPrice(Number(e.target.value))}
                                            className="w-full accent-yellow-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>{MIN_IPO_PRICE} 💰</span>
                                            <span>{MAX_IPO_PRICE.toLocaleString()} 💰</span>
                                        </div>
                                    </div>

                                    {/* Dividend allocation slider */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-gray-300">Дивидендная квота от налога башен:</span>
                                            <span className="font-black text-green-400">{ipoDividendPercent}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={MIN_DIVIDEND_PERCENT}
                                            max={MAX_DIVIDEND_PERCENT}
                                            step={5}
                                            value={ipoDividendPercent}
                                            onChange={(e) => setIpoDividendPercent(Number(e.target.value))}
                                            className="w-full accent-green-500"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500">
                                            <span>10% (Мин)</span>
                                            <span>60% (Макс)</span>
                                        </div>
                                    </div>

                                    {/* Projected IPO Capital */}
                                    <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/20 text-center">
                                        <span className="text-xs text-purple-300 block">Потенциальный капитал клана при 100% продаже:</span>
                                        <span className="text-xl font-black text-yellow-400">
                                            +{(ipoTotalShares * ipoPrice).toLocaleString()} 💰
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleExecuteIpo}
                                        className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-black text-sm rounded-xl shadow-xl transition-all"
                                    >
                                        🚀 Выпустить акции на биржу
                                    </button>
                                </div>
                            ) : (
                                /* ACTIVE IPO MANAGEMENT */
                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl bg-gray-900/60 border border-purple-500/40 shadow-xl space-y-4">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-md bg-purple-900 border border-purple-400 text-purple-200 font-black text-sm">
                                                        [{myClanListing.ticker}]
                                                    </span>
                                                    <h3 className="text-lg font-black text-white">{myClanListing.clanName}</h3>
                                                </div>
                                                <p className="text-xs text-green-400 mt-1">✓ Акции активны и торгуются на бирже</p>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs text-gray-400">Рыночный курс акции:</div>
                                                <div className="text-xl font-black text-yellow-400">{myClanListing.currentPrice.toLocaleString()} 💰</div>
                                            </div>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="text-gray-400 block text-[10px]">В обращении</span>
                                                <span className="font-extrabold text-white text-sm">
                                                    {myClanListing.circulatingShares.toLocaleString()} / {myClanListing.totalShares.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="text-gray-400 block text-[10px]">Казна клана</span>
                                                <span className="font-extrabold text-yellow-400 text-sm">
                                                    {clanBank.toLocaleString()} 💰
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="text-gray-400 block text-[10px]">Под контролем</span>
                                                <span className="font-extrabold text-blue-400 text-sm">
                                                    {controlledWatchtowersCount} башен 🏰
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                                                <span className="text-gray-400 block text-[10px]">Дивидендный пул</span>
                                                <span className="font-extrabold text-green-400 text-sm">
                                                    {myClanListing.accumulatedDividendPool.toLocaleString()} 💰
                                                </span>
                                            </div>
                                        </div>

                                        {/* Adjust Dividend Rate */}
                                        <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-bold text-gray-300">Дивидендная квота от налога башен:</span>
                                                <span className="font-black text-green-400">{myClanListing.dividendPercent}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min={MIN_DIVIDEND_PERCENT}
                                                max={MAX_DIVIDEND_PERCENT}
                                                step={5}
                                                value={myClanListing.dividendPercent}
                                                onChange={(e) => onAdjustDividendPercent(myClanListing.clanId, Number(e.target.value))}
                                                className="w-full accent-green-500"
                                            />
                                        </div>

                                        {/* Share Buyback Section */}
                                        {myClanListing.circulatingShares > 0 && (
                                            <div className="p-4 rounded-xl bg-black/40 border border-yellow-500/20 space-y-3">
                                                <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                                                    🔄 Обратный выкуп акций (Buyback)
                                                </h4>
                                                <p className="text-[11px] text-gray-400">
                                                    Вы можете выкупить акции у игроков за счет средств кланового банка ({clanBank.toLocaleString()} 💰), чтобы снизить обязательства по дивидендам.
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={myClanListing.circulatingShares}
                                                        value={buybackCount}
                                                        onChange={(e) => setBuybackCount(Math.max(1, Math.min(myClanListing.circulatingShares, Number(e.target.value))))}
                                                        className="px-3 py-2 rounded-xl bg-gray-900 border border-yellow-500/30 text-white font-bold text-sm w-32 focus:outline-none"
                                                    />
                                                    <span className="text-xs text-gray-400">
                                                        Стоимость: {(buybackCount * myClanListing.currentPrice).toLocaleString()} 💰
                                                    </span>
                                                    <button
                                                        onClick={() => onBuybackShares(myClanListing.clanId, buybackCount)}
                                                        disabled={clanBank < buybackCount * myClanListing.currentPrice}
                                                        className="ml-auto px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 text-black font-extrabold text-xs rounded-xl disabled:cursor-not-allowed"
                                                    >
                                                        Выкупить
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL: BUY SHARES CONFIRMATION */}
                {buyingListing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                        <div className="w-full max-w-md bg-gray-900 border-2 border-purple-500 rounded-2xl p-5 shadow-2xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-lg text-white">Покупка акций {buyingListing.clanName}</h3>
                                    <span className="text-xs text-purple-300 font-bold">[{buyingListing.ticker}]</span>
                                </div>
                                <button onClick={() => setBuyingListing(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Количество акций:</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setBuySharesCount(Math.max(1, buySharesCount - 10))}
                                            className="px-3 py-2 bg-gray-800 rounded-xl text-white font-bold"
                                        >
                                            -10
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={buyingListing.availableIpoShares}
                                            value={buySharesCount}
                                            onChange={(e) => setBuySharesCount(Math.max(1, Math.min(buyingListing.availableIpoShares, Number(e.target.value))))}
                                            className="w-full text-center px-4 py-2 bg-black/60 border border-purple-500/40 rounded-xl text-white font-extrabold text-lg focus:outline-none"
                                        />
                                        <button
                                            onClick={() => setBuySharesCount(Math.min(buyingListing.availableIpoShares, buySharesCount + 10))}
                                            className="px-3 py-2 bg-gray-800 rounded-xl text-white font-bold"
                                        >
                                            +10
                                        </button>
                                    </div>
                                    <div className="flex justify-between gap-1 mt-2">
                                        {[10, 50, 100, 500].map(cnt => (
                                            <button
                                                key={cnt}
                                                onClick={() => setBuySharesCount(Math.min(buyingListing.availableIpoShares, cnt))}
                                                className="flex-1 py-1 bg-gray-800 hover:bg-purple-900/40 text-[11px] font-bold rounded-lg text-gray-300"
                                            >
                                                {cnt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(() => {
                                    const costCalc = calculateSharePurchaseCost(buyingListing, buySharesCount);
                                    const canAfford = playerGold >= costCalc.totalGoldCost;

                                    return (
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Цена за 1 акцию:</span>
                                                <span className="font-bold text-white">{buyingListing.currentPrice.toLocaleString()} 💰</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-extrabold">
                                                <span>Итоговая стоимость:</span>
                                                <span className={canAfford ? 'text-yellow-400' : 'text-red-400'}>
                                                    {costCalc.totalGoldCost.toLocaleString()} 💰
                                                </span>
                                            </div>
                                            {!canAfford && (
                                                <p className="text-[11px] text-red-400 pt-1">
                                                    Недостаточно золота (не хватает: {(costCalc.totalGoldCost - playerGold).toLocaleString()} 💰)
                                                </p>
                                            )}

                                            <button
                                                onClick={() => {
                                                    onBuyShares(buyingListing.clanId, buySharesCount);
                                                    setBuyingListing(null);
                                                }}
                                                disabled={!canAfford || !costCalc.canFulfill}
                                                className="w-full mt-3 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-extrabold text-sm rounded-xl transition-all disabled:cursor-not-allowed"
                                            >
                                                Купить за {costCalc.totalGoldCost.toLocaleString()} 💰
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL: SELL SHARES CONFIRMATION */}
                {sellingHolding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                        <div className="w-full max-w-md bg-gray-900 border-2 border-purple-500 rounded-2xl p-5 shadow-2xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-lg text-white">Продажа акций {sellingHolding.clanName}</h3>
                                    <span className="text-xs text-purple-300 font-bold">[{sellingHolding.ticker}]</span>
                                </div>
                                <button onClick={() => setSellingHolding(null)} className="text-gray-400 hover:text-white">✕</button>
                            </div>

                            {(() => {
                                const listing = listings.find(l => l.clanId === sellingHolding.clanId);
                                if (!listing) return null;
                                const sellCalc = calculateShareSellProceeds(sellingHolding, listing, sellSharesCount);

                                return (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Количество акций для продажи:</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={sellingHolding.sharesCount}
                                                value={sellSharesCount}
                                                onChange={(e) => setSellSharesCount(Math.max(1, Math.min(sellingHolding.sharesCount, Number(e.target.value))))}
                                                className="w-full text-center px-4 py-2 bg-black/60 border border-purple-500/40 rounded-xl text-white font-extrabold text-lg focus:outline-none"
                                            />
                                        </div>

                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs">
                                            <div className="flex justify-between text-gray-400">
                                                <span>Курс продажи:</span>
                                                <span className="font-bold text-white">{listing.currentPrice.toLocaleString()} 💰</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>Биржевая комиссия ({DEFAULT_EXCHANGE_FEE_PERCENT}%):</span>
                                                <span className="font-bold text-red-400">-{sellCalc.feeGold.toLocaleString()} 💰</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-white/10">
                                                <span>Вы получите на руки:</span>
                                                <span className="text-green-400">+{sellCalc.netGold.toLocaleString()} 💰</span>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    onSellShares(sellingHolding.clanId, sellSharesCount);
                                                    setSellingHolding(null);
                                                }}
                                                disabled={!sellCalc.canFulfill}
                                                className="w-full mt-3 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl transition-all"
                                            >
                                                Продать и получить {sellCalc.netGold.toLocaleString()} 💰
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
