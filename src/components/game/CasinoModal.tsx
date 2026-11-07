import React, { memo, useState, useEffect } from 'react';
import type { PlacedBuilding } from '../../../types';
import { LuckyWheel, LuckyWheelSector } from './LuckyWheel';

export interface CasinoModalProps {
    isOpen: boolean;
    onClose: () => void;
    playerGold: number;
    coinImageUrl: string;
    casinoBetAmount: number;
    setCasinoBetAmount: (amount: number) => void;
    casinoIsSpinning: boolean;
    casinoResult: { won: boolean; amount: number; isRuby?: boolean } | null;
    onGamble: () => void;
    initialTab?: 'slots' | 'wheel';
    lastLuckyWheelSpin?: number;
    onClaimLuckyWheelPrize?: (prize: LuckyWheelSector) => Promise<void> | void;
    rubyImageUrl?: string;
}

export interface CasinoBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeCasinoBuilding: PlacedBuilding | null;
    onWithdraw: () => void;
}

const CasinoModalComponent: React.FC<CasinoModalProps> = ({
    isOpen,
    onClose,
    playerGold,
    coinImageUrl,
    casinoBetAmount,
    setCasinoBetAmount,
    casinoIsSpinning,
    casinoResult,
    onGamble,
    initialTab = 'wheel',
    lastLuckyWheelSpin = 0,
    onClaimLuckyWheelPrize = () => {},
    rubyImageUrl = '/Gui/inventory/ruby.png'
}) => {
    const [activeTab, setActiveTab] = useState<'slots' | 'wheel'>(initialTab);

    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const isWheelFreeAvailable = !lastLuckyWheelSpin || (Date.now() - lastLuckyWheelSpin >= 14_400_000);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-3.5 sm:p-4 border-b border-purple-500/30 bg-purple-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            {activeTab === 'wheel' ? '🎡' : '🎰'}
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                {activeTab === 'wheel' ? 'Колесо Фортуны' : 'Казино'}
                            </h3>
                            <p className="text-[11px] text-purple-300/70">
                                {activeTab === 'wheel' ? '1 бесплатный спин раз в 4 часа' : 'Испытай удачу и сорви джекпот'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1.5 bg-black/60 border-b border-purple-500/20 gap-2 text-xs font-black">
                    <button
                        type="button"
                        onClick={() => setActiveTab('wheel')}
                        className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                            activeTab === 'wheel'
                                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black shadow-lg shadow-amber-950/40 border border-yellow-300 font-extrabold'
                                : 'bg-gray-900/70 hover:bg-gray-800 text-purple-200 hover:text-white border border-purple-500/20'
                        }`}
                    >
                        <span className="text-sm">🎡</span>
                        <span>Колесо Фортуны</span>
                        {isWheelFreeAvailable && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse shadow-sm">
                                FREE
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('slots')}
                        className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'slots'
                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-950/40 border border-purple-300 font-extrabold'
                                : 'bg-gray-900/70 hover:bg-gray-800 text-purple-200 hover:text-white border border-purple-500/20'
                        }`}
                    >
                        <span className="text-sm">🎰</span>
                        <span>Слоты</span>
                    </button>
                </div>

                {activeTab === 'wheel' ? (
                    <div className="p-4 sm:p-5 flex flex-col items-center">
                        <LuckyWheel
                            lastLuckyWheelSpin={lastLuckyWheelSpin}
                            onClaimPrize={onClaimLuckyWheelPrize}
                            coinImageUrl={coinImageUrl}
                            rubyImageUrl={rubyImageUrl}
                        />
                    </div>
                ) : (
                    <div className="p-5">
                        {/* Player Balance Card */}
                        <div className="bg-black/50 p-3 rounded-xl border border-purple-500/20 mb-4 flex items-center justify-between">
                            <span className="text-purple-300/80 text-xs font-semibold">Ваш баланс:</span>
                            <div className="flex items-center gap-1.5 font-black text-sm text-yellow-400">
                                <img src={coinImageUrl} className="w-4 h-4 object-contain" alt="Coin" />
                                <span>{playerGold.toLocaleString()} 💰</span>
                            </div>
                        </div>

                        {/* Bet Controls */}
                        <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md mb-4">
                            <label className="text-purple-200 text-xs font-bold mb-2 block">Сумма ставки:</label>
                            <div className="flex items-center space-x-2">
                                <img src={coinImageUrl} className="w-6 h-6 object-contain" alt="Coin" />
                                <input
                                    type="number"
                                    min="100"
                                    max={playerGold}
                                    value={casinoBetAmount}
                                    onChange={e => setCasinoBetAmount(Math.max(100, parseInt(e.target.value) || 0))}
                                    className="flex-1 bg-black/60 text-yellow-300 text-center rounded-xl border border-purple-500/40 p-2 text-base font-extrabold focus:border-purple-400 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-5 gap-1.5 mt-3">
                                <button onClick={() => setCasinoBetAmount(1000)} className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 transition-all">1K</button>
                                <button onClick={() => setCasinoBetAmount(5000)} className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 transition-all">5K</button>
                                <button onClick={() => setCasinoBetAmount(10000)} className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 transition-all">10K</button>
                                <button onClick={() => setCasinoBetAmount(50000)} className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 transition-all">50K</button>
                                <button onClick={() => setCasinoBetAmount(Math.floor(playerGold / 2))} className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 transition-all">½</button>
                            </div>
                        </div>

                        {casinoBetAmount > 10000 && (
                            <div className="bg-purple-950/40 p-2.5 rounded-xl mb-4 border border-purple-500/30 text-center animate-pulse">
                                <span className="text-pink-300 text-xs font-bold flex items-center justify-center gap-1.5">
                                    <span>💎</span>
                                    <span>Есть шанс выиграть рубин!</span>
                                </span>
                            </div>
                        )}

                        {/* Spin Result Display */}
                        {casinoIsSpinning && (
                            <div className="bg-purple-950/30 p-4 rounded-xl mb-4 text-center border border-purple-500/30">
                                <div className="text-4xl animate-spin inline-block">🎰</div>
                                <p className="text-yellow-400 font-extrabold text-sm mt-2 animate-pulse">Крутим барабаны...</p>
                            </div>
                        )}

                        {casinoResult && !casinoIsSpinning && (
                            <div className={`p-4 rounded-xl mb-4 text-center border shadow-lg ${casinoResult.won ? (casinoResult.isRuby ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]') : 'bg-rose-950/60 border-rose-500/50'}`}>
                                {casinoResult.won ? (
                                    casinoResult.isRuby ? (
                                        <div>
                                            <span className="text-4xl">💎</span>
                                            <p className="text-pink-300 font-black text-xl mt-1.5">ДЖЕКПОТ!</p>
                                            <p className="text-purple-200 text-xs mt-0.5 font-bold">Вы выиграли рубин!</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <span className="text-4xl">🏆</span>
                                            <p className="text-emerald-300 font-black text-xl mt-1.5">ПОБЕДА!</p>
                                            <p className="text-emerald-200 text-xs mt-0.5 font-bold">Вы выиграли {casinoResult.amount.toLocaleString()} монет!</p>
                                        </div>
                                    )
                                ) : (
                                    <div>
                                        <span className="text-4xl">💥</span>
                                        <p className="text-rose-300 font-black text-xl mt-1.5">ПРОИГРЫШ</p>
                                        <p className="text-rose-200 text-xs mt-0.5 font-medium">Попробуйте еще раз!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex space-x-2.5">
                            <button 
                                onClick={onClose} 
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl font-bold text-xs border border-white/10 transition-all cursor-pointer"
                            >
                                Закрыть
                            </button>
                            <button 
                                onClick={onGamble} 
                                disabled={casinoIsSpinning || playerGold < casinoBetAmount}
                                className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-black py-2.5 rounded-xl font-black text-xs shadow-lg shadow-yellow-950/50 border border-yellow-300/40 disabled:from-gray-800 disabled:to-gray-800 disabled:border-transparent disabled:text-gray-500 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {casinoIsSpinning ? 'Крутим...' : 'Играть!'}
                            </button>
                        </div>

                        <p className="text-purple-300/50 text-[10px] text-center mt-3">
                            Казино всегда выигрывает... но не всегда!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CasinoModal = memo(CasinoModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.playerGold !== next.playerGold) return false;
    if (prev.casinoBetAmount !== next.casinoBetAmount) return false;
    if (prev.casinoIsSpinning !== next.casinoIsSpinning) return false;
    if (prev.casinoResult !== next.casinoResult) return false;
    if (prev.initialTab !== next.initialTab) return false;
    if (prev.lastLuckyWheelSpin !== next.lastLuckyWheelSpin) return false;
    return true;
});

const CasinoBankModalComponent: React.FC<CasinoBankModalProps> = ({
    isOpen,
    onClose,
    activeCasinoBuilding,
    onWithdraw
}) => {
    if (!isOpen || !activeCasinoBuilding) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[61] backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-xs bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-purple-500/30 bg-purple-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏦</span>
                        <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-yellow-200">
                            Банк казино
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 text-center">
                    <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md mb-4">
                        <p className="text-purple-300/80 text-xs font-semibold mb-1">Накопленная прибыль:</p>
                        <div className="text-3xl font-black text-yellow-300">{(activeCasinoBuilding.bank || 0).toLocaleString()}</div>
                        <div className="text-purple-300/60 text-[11px] mt-0.5">монет</div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl font-bold text-xs border border-white/10 transition-all"
                        >
                            Закрыть
                        </button>
                        <button
                            onClick={onWithdraw}
                            disabled={(activeCasinoBuilding.bank || 0) <= 0}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 disabled:from-gray-800 disabled:to-gray-800 disabled:border-transparent disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                        >
                            Забрать прибыль
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CasinoBankModal = memo(CasinoBankModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.activeCasinoBuilding?.bank !== next.activeCasinoBuilding?.bank) return false;
    return true;
});
