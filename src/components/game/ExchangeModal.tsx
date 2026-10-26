import React, { memo } from 'react';

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

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-md" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-96 border border-gray-600" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4 text-center">Обмен рубинов</h3>
                <div className="flex items-center justify-center mb-6 space-x-4">
                    <div className="flex flex-col items-center">
                        <img src={rubyImageUrl} className="w-12 h-12 mb-2 object-contain" alt="Ruby" />
                        <input
                            type="number"
                            min="1"
                            max={playerRubies}
                            value={exchangeAmount}
                            onChange={e => onExchangeAmountChange(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-20 bg-gray-700 text-white text-center rounded border border-gray-600 p-1"
                        />
                    </div>
                    <div className="text-2xl text-gray-400">-</div>
                    <div className="flex flex-col items-center">
                        <img src={coinImageUrl} className="w-12 h-12 mb-2 object-contain" alt="Coin" />
                        <span className="text-yellow-400 font-bold text-xl">{(exchangeAmount * 7777).toLocaleString()}</span>
                    </div>
                </div>
                <p className="text-gray-400 text-sm text-center mb-6">Курс: 1 рубин = 7 777 монет</p>
                <div className="flex space-x-2">
                    <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">
                        Отмена
                    </button>
                    <button
                        onClick={onConfirmExchange}
                        className="flex-1 text-white py-2 rounded font-bold transition-all duration-300"
                        style={{
                            background: 'linear-gradient(180deg, rgba(34,197,94,0.95) 0%, rgba(21,128,61,0.9) 100%)',
                            opacity: isConfirmPressed ? 0.4 : 1,
                            boxShadow: '0 8px 18px rgba(22,163,74,0.22), inset 0 1px 0 rgba(255,255,255,0.18)'
                        }}
                    >
                        Обменять
                    </button>
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
