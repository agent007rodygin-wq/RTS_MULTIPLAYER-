import React, { memo } from 'react';
import { CloseIcon, UserIcon } from '../../../components/IconComponents';
import type { PrivateMessage } from '../../../types';

export interface ShoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatInput: string;
    playerEnergy: number;
    playerGold: number;
    coinImageUrl: string;
    onConfirmShout: () => void;
}

export interface PrivateChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    activePrivateChat: string | null;
    activePrivateChatId?: string | null;
    allUsers: Record<string, any>;
    privateMessages: PrivateMessage[];
    user: { uid: string } | null;
    playerAvatar: string | null;
    playerName: string;
    privateMessageText: string;
    setPrivateMessageText: (text: string) => void;
    onSendPrivateMessage: () => void;
    chatMode?: 'mail' | 'private';
    onToggleChatMode?: (mode: 'mail' | 'private') => void;
}

const SHOUT_COST_ENERGY = 10;
const SHOUT_COST_GOLD = 1000;

const ShoutModalComponent: React.FC<ShoutModalProps> = ({
    isOpen,
    onClose,
    chatInput,
    playerEnergy,
    playerGold,
    coinImageUrl,
    onConfirmShout
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            📢
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                Отправь во все чаты
                            </h2>
                            <p className="text-[11px] text-purple-300/70">
                                Глобальное объявление для всех игроков
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
                    <div className="bg-purple-950/30 p-4 rounded-xl mb-4 border border-purple-500/30 shadow-inner">
                        <span className="text-[10px] text-purple-300/70 uppercase tracking-wider font-bold block mb-1">Текст сообщения:</span>
                        <p className="text-purple-200 font-semibold break-words text-sm">{chatInput}</p>
                    </div>

                    <div className="bg-black/50 p-3 rounded-xl border border-purple-500/20 text-xs mb-5 flex flex-col items-center space-y-2">
                        <div className={`flex items-center space-x-1.5 font-bold ${playerEnergy < SHOUT_COST_ENERGY ? 'text-red-400' : 'text-blue-300'}`}>
                            <span>⚡</span>
                            <span>Стоимость энергии: {SHOUT_COST_ENERGY}</span>
                        </div>
                        <div className={`flex items-center space-x-1.5 font-bold ${playerGold < SHOUT_COST_GOLD ? 'text-red-400' : 'text-yellow-300'}`}>
                            <img src={coinImageUrl} className="w-4 h-4 object-contain" alt="coin" />
                            <span>Стоимость монет: {SHOUT_COST_GOLD.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={onConfirmShout}
                        disabled={playerGold < SHOUT_COST_GOLD || playerEnergy < SHOUT_COST_ENERGY}
                        className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/40 transition-all disabled:from-gray-800 disabled:to-gray-800 disabled:border-transparent disabled:text-gray-500 disabled:cursor-not-allowed flex justify-center items-center text-sm"
                    >
                        {SHOUT_COST_ENERGY} энергии • {SHOUT_COST_GOLD} монет • Отправить
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ShoutModal = memo(ShoutModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.chatInput !== next.chatInput) return false;
    if (prev.playerEnergy !== next.playerEnergy) return false;
    if (prev.playerGold !== next.playerGold) return false;
    return true;
});

const PrivateChatModalComponent: React.FC<PrivateChatModalProps> = ({
    isOpen,
    onClose,
    activePrivateChat,
    activePrivateChatId,
    allUsers,
    privateMessages,
    user,
    playerAvatar,
    playerName,
    privateMessageText,
    setPrivateMessageText,
    onSendPrivateMessage,
    chatMode = 'mail',
    onToggleChatMode
}) => {
    if (!isOpen || !activePrivateChat) return null;

    const targetUser = Object.values(allUsers).find(u => u.uid === activePrivateChat);

    const relevantMessages = privateMessages.filter(m => {
        if (activePrivateChatId?.endsWith('_anon')) {
            return m.chatId === activePrivateChatId;
        } else {
            const mTarget = m.receiverId || (m as any).recipientId;
            const isPair = (m.senderId === user?.uid && mTarget === activePrivateChat) || 
                           (m.senderId === activePrivateChat && (mTarget === user?.uid || mTarget === undefined));
            return isPair && (!m.chatId || !m.chatId.endsWith('_anon'));
        }
    });

    const mailMessages = relevantMessages.filter(m => !m.messageType || m.messageType === 'mail');
    const privateTypeMessages = relevantMessages.filter(m => m.messageType === 'private');
    const displayedMessages = chatMode === 'private' ? privateTypeMessages : mailMessages;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md h-[540px] bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-3.5 sm:p-4 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        {activePrivateChat === 'anonymous' ? (
                            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-xl shadow-inner">
                                🕵️
                            </div>
                        ) : targetUser?.avatar ? (
                            <img src={targetUser.avatar} alt="avatar" className="w-9 h-9 rounded-xl object-cover border border-purple-400/50" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center shadow-inner">
                                <UserIcon className="w-5 h-5 text-purple-300" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-white font-extrabold text-sm">
                                {activePrivateChat === 'anonymous' ? 'Аноним' : (targetUser?.name || 'Неизвестный')}
                                {activePrivateChatId?.endsWith('_anon') && activePrivateChat !== 'anonymous' && <span className="text-orange-400 ml-1">(Анонимно)</span>}
                            </span>
                            <span className="text-[10px] text-purple-300/70">
                                {activePrivateChat === 'anonymous' ? 'Анонимный диалог' : (targetUser?.clanId ? 'В клане' : 'Без клана')}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex border-b border-purple-500/20 bg-purple-950/20 px-3 pt-2 gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => onToggleChatMode?.('mail')}
                        className={`pb-2 px-3 flex items-center gap-1.5 font-bold transition-all border-b-2 cursor-pointer ${
                            chatMode === 'mail'
                                ? 'border-amber-400 text-amber-300'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <span>✉️</span>
                        <span>Обычные письма</span>
                        {mailMessages.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
                                {mailMessages.length}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => onToggleChatMode?.('private')}
                        className={`pb-2 px-3 flex items-center gap-1.5 font-bold transition-all border-b-2 cursor-pointer ${
                            chatMode === 'private'
                                ? 'border-purple-400 text-purple-300'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <span>🔒</span>
                        <span>Приватные</span>
                        {privateTypeMessages.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                                {privateTypeMessages.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-black/30 custom-scrollbar">
                    {displayedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 space-y-2">
                            {chatMode === 'mail' ? (
                                <>
                                    <span className="text-3xl">✉️</span>
                                    <p className="font-bold text-sm text-amber-200/90">Королевская почта (Письма)</p>
                                    <p className="text-xs text-gray-400 max-w-xs">
                                        Здесь отображаются обычные письма. Отправленное письмо появится в личном кабинете игрока во вкладке «Письма».
                                    </p>
                                </>
                            ) : (
                                <>
                                    <span className="text-3xl">🔒</span>
                                    <p className="font-bold text-sm text-purple-300">Приватный диалог</p>
                                    <p className="text-xs text-gray-400 max-w-xs">
                                        Здесь отображаются конфиденциальные приватные сообщения. Отправленное сообщение появится в личном кабинете игрока во вкладке «Приватные».
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        displayedMessages.map(msg => {
                            const isMine = msg.senderId === user?.uid;
                            const isAnonymous = msg.senderId === 'anonymous';
                            const displayText = msg.text || (msg as any).message;
                            const senderAvatar = msg.senderAvatar || allUsers[msg.senderId]?.avatar;
                            const senderName = msg.senderName || allUsers[msg.senderId]?.name || 'Неизвестный';
                            return (
                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                    {!isMine && (
                                        senderAvatar ? (
                                            <img src={senderAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-purple-500/30 flex-shrink-0" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                                                <span className="text-xs font-bold text-purple-300">{senderName?.charAt(0) || '?'}</span>
                                            </div>
                                        )
                                    )}
                                    <div className={`max-w-[80%] rounded-xl p-2.5 text-xs shadow-md ${
                                        isMine 
                                            ? (chatMode === 'mail' ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-br-none border border-amber-500/30' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none border border-purple-400/30')
                                            : 'bg-gray-800/90 text-gray-200 border border-purple-500/20 rounded-bl-none'
                                    }`}>
                                        {!isMine && !isAnonymous && <p className="text-[10px] text-purple-300 mb-1 font-bold">{senderName}</p>}
                                        {isAnonymous && !isMine && <p className="text-[10px] text-orange-400 mb-1 font-bold">Анонимное сообщение:</p>}
                                        <p className="break-words font-medium">{displayText || (msg as any).content || `[Ошибка: пустое сообщение]`}</p>
                                        <div className={`text-[9px] mt-1 ${isMine ? 'text-purple-200 text-right' : 'text-gray-400 text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {isMine && (
                                        playerAvatar ? (
                                            <img src={playerAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-purple-500/30 flex-shrink-0" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center border border-purple-500/30 flex-shrink-0">
                                                <span className="text-xs font-bold text-white">{playerName?.charAt(0) || '?'}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer with Clickable Mode Switcher */}
                <div className="p-3 bg-purple-950/20 border-t border-purple-500/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1 text-xs">
                        {chatMode === 'mail' ? (
                            <>
                                <span className="text-amber-200/80 text-[11px] flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-sm"></span>
                                    <span>Обычное письмо (придёт во вкладку «Письма»)</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onToggleChatMode?.('private')}
                                    className="text-purple-300 hover:text-purple-100 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all"
                                >
                                    <span>🔒 Отправить приватное сообщение</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="text-purple-300 text-[11px] flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse inline-block shadow-[0_0_8px_rgba(192,132,252,0.8)]"></span>
                                    <span>Приватное сообщение (придёт во вкладку «Приватные»)</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onToggleChatMode?.('mail')}
                                    className="text-amber-300 hover:text-amber-100 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all"
                                >
                                    <span>✉️ Отправить обычное письмо</span>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={privateMessageText}
                            onChange={e => setPrivateMessageText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onSendPrivateMessage()}
                            placeholder={chatMode === 'mail' ? 'Написать письмо игроку...' : 'Написать приватное сообщение...'}
                            className={`flex-1 bg-black/60 text-white px-3.5 py-2.5 rounded-xl border focus:outline-none text-xs transition-colors ${
                                chatMode === 'mail'
                                    ? 'border-amber-500/40 focus:border-amber-400'
                                    : 'border-purple-500/40 focus:border-purple-400'
                            }`}
                        />
                        <button
                            onClick={onSendPrivateMessage}
                            disabled={!privateMessageText.trim()}
                            className={`text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed ${
                                chatMode === 'mail'
                                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                            }`}
                        >
                            {chatMode === 'mail' ? 'Отправить письмо' : 'Отправить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PrivateChatModal = memo(PrivateChatModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.activePrivateChat !== next.activePrivateChat) return false;
    if (prev.activePrivateChatId !== next.activePrivateChatId) return false;
    if (prev.privateMessages !== next.privateMessages) return false;
    if (prev.privateMessageText !== next.privateMessageText) return false;
    if (prev.chatMode !== next.chatMode) return false;
    return true;
});
