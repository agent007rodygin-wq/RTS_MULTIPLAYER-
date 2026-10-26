import React, { memo } from 'react';
import type { PlacedBuilding } from '../../../types';

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
    onGamble
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-md" onClick={onClose}>
            <div className="bg-gradient-to-b from-purple-900 to-gray-900 p-6 rounded-lg shadow-2xl w-96 border-2 border-yellow-500" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center flex items-center justify-center">
                    Казино
                </h3>
                
                <div className="flex items-center justify-center mb-4 space-x-2">
                    <img src={coinImageUrl} className="w-6 h-6" alt="Coin" />
                    <span className="text-white">Ваши монеты: <span className="text-yellow-400 font-bold">{playerGold.toLocaleString()}</span></span>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg mb-4 border border-gray-600">
                    <label className="text-gray-300 text-sm mb-2 block">Сумма ставки:</label>
                    <div className="flex items-center space-x-2">
                        <img src={coinImageUrl} className="w-8 h-8" alt="Coin" />
                        <input
                            type="number"
                            min="100"
                            max={playerGold}
                            value={casinoBetAmount}
                            onChange={e => setCasinoBetAmount(Math.max(100, parseInt(e.target.value) || 0))}
                            className="flex-1 bg-gray-700 text-white text-center rounded border border-gray-600 p-2 text-lg font-bold"
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => setCasinoBetAmount(1000)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-xs">1K</button>
                        <button onClick={() => setCasinoBetAmount(5000)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-xs">5K</button>
                        <button onClick={() => setCasinoBetAmount(10000)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-xs">10K</button>
                        <button onClick={() => setCasinoBetAmount(50000)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-xs">50K</button>
                        <button onClick={() => setCasinoBetAmount(Math.floor(playerGold / 2))} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 rounded text-xs">½</button>
                    </div>
                </div>

                {casinoBetAmount > 10000 && (
                    <div className="bg-purple-800/50 p-3 rounded-lg mb-4 border border-purple-500 text-center">
                        <span className="text-purple-300 text-sm">Есть шанс выиграть рубин!</span>
                    </div>
                )}

                {/* Spin Result Display */}
                {casinoIsSpinning && (
                    <div className="bg-gray-800/50 p-4 rounded-lg mb-4 text-center">
                        <div className="text-4xl animate-spin inline-block">🎰</div>
                        <p className="text-yellow-400 mt-2 animate-pulse">Крутим...</p>
                    </div>
                )}

                {casinoResult && !casinoIsSpinning && (
                    <div className={`p-4 rounded-lg mb-4 text-center ${casinoResult.won ? (casinoResult.isRuby ? 'bg-purple-800/50 border-2 border-purple-400' : 'bg-green-800/50 border-2 border-green-400') : 'bg-red-800/50 border-2 border-red-400'}`}>
                        {casinoResult.won ? (
                            casinoResult.isRuby ? (
                                <div>
                                    <span className="text-4xl">💎</span>
                                    <p className="text-purple-300 font-bold text-xl mt-2">ДЖЕКПОТ!</p>
                                    <p className="text-purple-200">Вы выиграли рубин!</p>
                                </div>
                            ) : (
                                <div>
                                    <span className="text-4xl">🏆</span>
                                    <p className="text-green-300 font-bold text-xl mt-2">ПОБЕДА!</p>
                                    <p className="text-green-200">Вы выиграли {casinoResult.amount.toLocaleString()} монет!</p>
                                </div>
                            )
                        ) : (
                            <div>
                                <span className="text-4xl">💥</span>
                                <p className="text-red-300 font-bold text-xl mt-2">ПРОИГРЫШ</p>
                                <p className="text-red-200">Попробуйте еще раз!</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex space-x-2">
                    <button 
                        onClick={onClose} 
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded"
                    >
                        Закрыть
                    </button>
                    <button 
                        onClick={onGamble} 
                        disabled={casinoIsSpinning || playerGold < casinoBetAmount}
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black py-2 rounded font-bold disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
                    >
                        {casinoIsSpinning ? 'Крутим...' : 'Играть!'}
                    </button>
                </div>

                <p className="text-gray-500 text-xs text-center mt-4">
                    Казино всегда выигрывает... но не всегда!
                </p>
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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[61] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gradient-to-b from-emerald-900 to-gray-900 p-6 rounded-lg shadow-2xl w-80 border-2 border-emerald-400" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-emerald-300 text-center mb-4">Банк казино</h3>
                <div className="text-center mb-5">
                    <p className="text-gray-300 text-sm mb-2">Накопленная прибыль:</p>
                    <div className="text-3xl font-bold text-yellow-300">{(activeCasinoBuilding.bank || 0).toLocaleString()}</div>
                    <div className="text-gray-400 text-sm mt-1">монет</div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded font-bold"
                    >
                        Закрыть
                    </button>
                    <button
                        onClick={onWithdraw}
                        disabled={(activeCasinoBuilding.bank || 0) <= 0}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Забрать прибыль
                    </button>
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
