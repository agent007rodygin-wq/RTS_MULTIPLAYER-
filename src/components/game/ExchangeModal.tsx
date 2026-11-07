import React, { memo, useState } from 'react';

export interface ExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    exchangeAmount: number;
    onExchangeAmountChange: (amount: number) => void;
    playerRubies: number;
    coinImageUrl?: string;
    rubyImageUrl?: string;
    isConfirmPressed?: boolean;
    onConfirmExchange: () => void;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = memo(({
    isOpen,
    onClose,
    exchangeAmount,
    onExchangeAmountChange,
    playerRubies,
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    rubyImageUrl = '/Gui/Front/значек рубинов/Nj7hb.webp',
    isConfirmPressed = false,
    onConfirmExchange
}) => {
    if (!isOpen) return null;

    const [internalPressed, setInternalPressed] = useState(false);
    const pressed = isConfirmPressed || internalPressed;

    const handleConfirm = () => {
        setInternalPressed(true);
        setTimeout(() => setInternalPressed(false), 250);
        onConfirmExchange();
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div
                className="w-full max-w-sm bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            💎
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                Обмен рубинов
                            </h3>
                            <p className="text-[11px] text-purple-300/70">
                                Конвертация рубинов в золото
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

                <div className="p-5">
                    <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md mb-4">
                        <div className="flex items-center justify-around">
                            <div className="flex flex-col items-center">
                                <img src={rubyImageUrl} className="w-12 h-12 mb-2 object-contain filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)]" alt="Ruby" />
                                <input
                                    type="number"
                                    min="1"
                                    max={playerRubies}
                                    value={exchangeAmount}
                                    onChange={e => onExchangeAmountChange(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="w-20 bg-black/60 text-pink-300 text-center font-extrabold rounded-lg border border-purple-500/40 p-1.5 text-sm focus:border-purple-400 focus:outline-none"
                                />
                                <span className="text-[10px] text-purple-300/70 mt-1">рубинов</span>
                            </div>

                            <div className="text-2xl text-purple-400 font-black">➜</div>

                            <div className="flex flex-col items-center">
                                <img src={coinImageUrl} className="w-12 h-12 mb-2 object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.4)]" alt="Coin" />
                                <span className="text-yellow-400 font-black text-lg">{(exchangeAmount * 7777).toLocaleString()}</span>
                                <span className="text-[10px] text-purple-300/70 mt-1">монет</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl py-2 px-3 text-center mb-5">
                        <span className="text-purple-300/80 text-xs font-medium">Курс: </span>
                        <span className="text-yellow-300 font-bold text-xs">1 💎 = 7 777 💰 монет</span>
                    </div>

                    <div className="flex gap-2.5">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2.5 rounded-xl font-bold text-xs border border-white/10 transition-all"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-2.5 rounded-xl font-black text-xs shadow-lg shadow-emerald-950/50 border border-emerald-400/30 transition-all duration-200 active:scale-95"
                            style={{
                                opacity: pressed ? 0.4 : 1,
                            }}
                        >
                            Обменять
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    if (!prevProps.isOpen && !nextProps.isOpen) return true;
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    return (
        prevProps.exchangeAmount === nextProps.exchangeAmount &&
        prevProps.playerRubies === nextProps.playerRubies &&
        prevProps.isConfirmPressed === nextProps.isConfirmPressed
    );
});

ExchangeModal.displayName = 'ExchangeModal';
