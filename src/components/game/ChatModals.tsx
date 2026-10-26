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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-600 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Отправь во все чаты</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                <div className="bg-gray-900/80 p-4 rounded-lg mb-4 border border-blue-500/30">
                    <p className="text-blue-400 font-medium break-words">{chatInput}</p>
                </div>

                <div className="text-sm text-gray-400 mb-4 flex flex-col items-center space-y-1">
                    <div className={`flex items-center space-x-1 ${playerEnergy < SHOUT_COST_ENERGY ? 'text-red-400' : 'text-blue-300'}`}>
                        <span className="text-yellow-500 font-bold">⚡</span>
                        <span>Стоимость энергии: {SHOUT_COST_ENERGY}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${playerGold < SHOUT_COST_GOLD ? 'text-red-400' : 'text-yellow-300'}`}>
                        <img src={coinImageUrl} className="w-4 h-4 object-contain" alt="coin" />
                        <span>Стоимость монет: {SHOUT_COST_GOLD}</span>
                    </div>
                </div>

                <button
                    onClick={onConfirmShout}
                    disabled={playerGold < SHOUT_COST_GOLD || playerEnergy < SHOUT_COST_ENERGY}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {SHOUT_COST_ENERGY} энергии • {SHOUT_COST_GOLD} монет • Отправить
                </button>
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
    onSendPrivateMessage
}) => {
    if (!isOpen || !activePrivateChat) return null;

    const targetUser = Object.values(allUsers).find(u => u.uid === activePrivateChat);

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl w-[400px] h-[500px] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-900 p-3 border-b border-gray-700 flex justify-between items-center rounded-t-lg">
                    <div className="flex items-center gap-2">
                        {activePrivateChat === 'anonymous' ? (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                <span className="text-xl">???</span>
                            </div>
                        ) : targetUser?.avatar ? (
                            <img src={targetUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-gray-600" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                                <UserIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">
                                {activePrivateChat === 'anonymous' ? 'Аноним' : (targetUser?.name || 'Неизвестный')}
                                {activePrivateChatId?.endsWith('_anon') && activePrivateChat !== 'anonymous' && <span className="text-orange-400 ml-1">(Анонимно)</span>}
                            </span>
                            <span className="text-xs text-gray-400">
                                {activePrivateChat === 'anonymous' ? 'Анонимный диалог' : (targetUser?.clanId ? 'В клане' : 'Без клана')}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-800/50">
                    {privateMessages
                        .filter(m => {
                            if (activePrivateChatId?.endsWith('_anon')) {
                                return m.chatId === activePrivateChatId;
                            } else {
                                const isPair = (m.senderId === user?.uid && m.receiverId === activePrivateChat) || 
                                               (m.senderId === activePrivateChat && m.receiverId === user?.uid);
                                return isPair && (!m.chatId || !m.chatId.endsWith('_anon'));
                            }
                        })
                        .map(msg => {
                            const isMine = msg.senderId === user?.uid;
                            const isAnonymous = msg.senderId === 'anonymous';
                            const displayText = msg.text || (msg as any).message;
                            const senderAvatar = msg.senderAvatar || allUsers[msg.senderId]?.avatar;
                            const senderName = msg.senderName || allUsers[msg.senderId]?.name || 'Неизвестный';
                            return (
                                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                    {!isMine && (
                                        senderAvatar ? (
                                            <img src={senderAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-gray-600 flex-shrink-0" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-400">{senderName?.charAt(0) || '?'}</span>
                                            </div>
                                        )
                                    )}
                                    <div className={`max-w-[80%] rounded-lg p-2 text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                        {!isMine && !isAnonymous && <p className="text-[10px] text-blue-300 mb-1 font-bold">{senderName}</p>}
                                        {isAnonymous && !isMine && <p className="text-[10px] text-orange-400 mb-1 font-bold">Анонимное сообщение:</p>}
                                        <p className="break-words font-medium">{displayText || (msg as any).content || `[Ошибка: пустое сообщение]`}</p>
                                        <div className={`text-[10px] mt-1 ${isMine ? 'text-blue-200 text-right' : 'text-gray-400 text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {isMine && (
                                        playerAvatar ? (
                                            <img src={playerAvatar} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-gray-600 flex-shrink-0" />
                                        ) : (
                                            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center border border-gray-600 flex-shrink-0">
                                                <span className="text-xs font-bold text-white">{playerName?.charAt(0) || '?'}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                </div>

                <div className="p-3 bg-gray-900 border-t border-gray-700 rounded-b-lg flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={privateMessageText}
                            onChange={e => setPrivateMessageText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && onSendPrivateMessage()}
                            placeholder="Написать сообщение..."
                            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={onSendPrivateMessage}
                            disabled={!privateMessageText.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-bold transition-colors"
                        >
                            Отправить
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
    return true;
});
