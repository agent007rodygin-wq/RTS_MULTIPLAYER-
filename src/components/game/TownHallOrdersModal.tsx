import React, { memo, useState, useEffect } from 'react';
import { CloseIcon } from '../../../components/IconComponents';
import {
    TownHallOrder,
    getTimeUntilNextOrdersCycle,
    getTimeUntilSkipAvailable,
    canFulfillTownHallOrder,
    normalizeTownHallOrder
} from '../../game/townHallOrders/townHallOrdersLogic';

export interface TownHallOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: TownHallOrder[];
    inventory: Record<number, number>;
    townHallLevel: number;
    playerLevel: number;
    lastSkipTime: number;
    onFulfillOrder: (order: TownHallOrder) => void;
    onSkipOrder: (slotIndex: number) => void;
    coinImageUrl?: string;
    playCloseSound?: () => void;
}

export const TownHallOrdersModal: React.FC<TownHallOrdersModalProps> = memo(({
    isOpen,
    onClose,
    orders,
    inventory,
    townHallLevel,
    playerLevel,
    lastSkipTime,
    onFulfillOrder,
    onSkipOrder,
    coinImageUrl = '/Gui/Front/значек монет/Image-2.webp',
    playCloseSound
}) => {
    const [, setTick] = useState(0);

    // Live 1-second timer to update countdowns
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    const cycleTime = getTimeUntilNextOrdersCycle();
    const skipTime = getTimeUntilSkipAvailable(lastSkipTime);

    const handleClose = () => {
        if (playCloseSound) playCloseSound();
        onClose();
    };

    return (
        <div
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] max-w-4xl w-full flex flex-col max-h-[92vh] overflow-hidden text-white animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-purple-500/30 bg-purple-950/30">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner">
                            🏛️
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                Заказы Ратуши
                            </h2>
                            <p className="text-xs text-purple-300/80">
                                Городские контракты • Ратуша Ур. {townHallLevel}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                        title="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                {/* Status Bar: Timers */}
                <div className="bg-gradient-to-r from-amber-950/40 via-gray-900 to-yellow-950/40 px-6 py-2.5 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold flex items-center gap-1">
                            <span>⏳</span> Новые контракты через:
                        </span>
                        <span className="font-mono font-extrabold text-white bg-black/50 px-2 py-0.5 rounded border border-yellow-500/30">
                            {cycleTime.formatted}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-300 flex items-center gap-1">
                            <span>🔄</span> Скип заказа (раз в сутки):
                        </span>
                        {skipTime.available ? (
                            <span className="font-bold text-green-400 bg-green-950/60 px-2 py-0.5 rounded border border-green-500/40">
                                Доступен
                            </span>
                        ) : (
                            <span className="font-mono text-amber-300 bg-black/50 px-2 py-0.5 rounded border border-amber-500/30" title="Один скип в 24 часа">
                                Через {skipTime.formatted}
                            </span>
                        )}
                    </div>
                </div>

                {/* Subtitle notice */}
                <div className="px-6 py-2 bg-yellow-950/20 text-center border-b border-yellow-500/10">
                    <p className="text-[11px] text-yellow-200/80">
                        Сдавайте излишки базовых ресурсов на нужды города. В награду получайте золото, славу и полезные материалы!
                    </p>
                </div>

                {/* Orders Grid */}
                <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    {orders.map((rawOrder) => {
                        const order = normalizeTownHallOrder(rawOrder);
                        const canFulfill = canFulfillTownHallOrder(order, inventory);

                        return (
                            <div
                                key={order.id}
                                className={`rounded-xl border flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                                    order.completed
                                        ? 'bg-gradient-to-b from-gray-900/90 to-emerald-950/30 border-green-500/50 shadow-inner'
                                        : 'bg-gradient-to-b from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-yellow-500/50 shadow-xl'
                                }`}
                            >
                                {order.completed && (
                                    <div className="absolute top-3 right-3 bg-green-600/90 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-green-400/60 shadow uppercase tracking-wider">
                                        Выполнен
                                    </div>
                                )}

                                <div className="p-4 space-y-3">
                                    {/* Card Header */}
                                    <div className="flex items-start gap-2.5 pr-14">
                                        <div className="text-2xl p-1.5 bg-black/40 rounded-lg border border-gray-700/60">
                                            {order.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-white leading-snug">
                                                {order.title}
                                            </h3>
                                            <span className="text-[10px] text-yellow-400 font-semibold">
                                                Сложность: Ур. {order.tier}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-300 leading-relaxed italic border-l-2 border-yellow-500/40 pl-2">
                                        "{order.description}"
                                    </p>

                                    {/* Requirements */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="text-[11px] font-extrabold text-gray-300 uppercase tracking-wider">
                                            Требуемые ресурсы:
                                        </div>
                                        <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-gray-800">
                                            {order.requirements.map(req => {
                                                const currentAmount = Number(inventory[req.id]) || 0;
                                                const hasEnough = currentAmount >= req.amount;
                                                const percent = Math.min(100, Math.floor((currentAmount / req.amount) * 100));

                                                return (
                                                    <div key={req.id} className="space-y-0.5">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                {req.imageUrl && (
                                                                    <img src={req.imageUrl} alt={req.name} className="w-4 h-4 object-contain" />
                                                                )}
                                                                <span className="text-gray-300">{req.name}</span>
                                                            </div>
                                                            <div className={`font-mono font-bold ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                                {currentAmount.toLocaleString()} / {req.amount.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${hasEnough ? 'bg-green-500' : 'bg-amber-500'}`}
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Rewards */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="text-[11px] font-extrabold text-yellow-400 uppercase tracking-wider">
                                            Награда города:
                                        </div>
                                        <div className="bg-black/40 p-2.5 rounded-lg border border-yellow-500/20 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5 text-yellow-300 font-extrabold">
                                                    <img src={coinImageUrl} alt="Золото" className="w-4 h-4 object-contain" />
                                                    <span>+{order.rewardGold.toLocaleString()} монет</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-300 font-extrabold">
                                                    <span>⭐</span>
                                                    <span>+{order.rewardGlory} славы</span>
                                                </div>
                                            </div>

                                            {order.rewardItems.length > 0 && (
                                                <div className="pt-1 border-t border-gray-800 flex flex-wrap gap-2 items-center">
                                                    {order.rewardItems.map(item => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-1 bg-gray-800/90 px-2 py-0.5 rounded text-[11px] font-bold text-white border border-gray-700"
                                                        >
                                                            {item.imageUrl && (
                                                                <img src={item.imageUrl} alt={item.name} className="w-3.5 h-3.5 object-contain" />
                                                            )}
                                                            <span>+{item.amount} {item.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-4 pt-0 space-y-2">
                                    {order.completed ? (
                                        <button
                                            disabled
                                            className="w-full bg-green-950/60 text-green-300 font-bold py-2 rounded-lg text-xs border border-green-500/40 cursor-default flex items-center justify-center gap-1.5"
                                        >
                                            <span>✓</span> Награда получена
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onFulfillOrder(order)}
                                                disabled={!canFulfill}
                                                className={`w-full font-extrabold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                                                    canFulfill
                                                        ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-500 hover:from-emerald-500 hover:to-green-400 text-white active:scale-95 shadow-green-900/50'
                                                        : 'bg-gray-700/60 text-gray-400 border border-gray-600/50 cursor-not-allowed'
                                                }`}
                                            >
                                                <span>📦</span>
                                                <span>{canFulfill ? 'Сдать заказ' : 'Не хватает ресурсов'}</span>
                                            </button>

                                            <button
                                                onClick={() => onSkipOrder(order.slotIndex)}
                                                disabled={!skipTime.available}
                                                className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
                                                    skipTime.available
                                                        ? 'bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                                                        : 'bg-gray-800/40 text-gray-500 border border-gray-800 cursor-not-allowed'
                                                }`}
                                                title={skipTime.available ? 'Заменить этот контракт (1 раз в сутки)' : `Скип доступен через ${skipTime.formatted}`}
                                            >
                                                <span>🔄</span>
                                                <span>
                                                    {skipTime.available
                                                        ? 'Заменить контракт (скип)'
                                                        : `Скип через ${skipTime.formatted}`}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer close */}
                <div className="p-4 border-t border-gray-800 bg-black/40 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
});

TownHallOrdersModal.displayName = 'TownHallOrdersModal';
