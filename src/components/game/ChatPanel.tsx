import React from 'react';
import {
    ChatBubbleIcon,
    ChevronDownIcon,
    CompassIcon,
    SmileyIcon
} from '../../../components/IconComponents';

export type ChatTab = 'general' | 'banya' | 'loot' | 'clan' | 'police';

export interface ChatMessage {
    id: number;
    sender: string;
    senderId?: string;
    text: string;
    type: 'normal' | 'shout' | 'system';
    timestamp: number;
    tab: ChatTab | 'all';
    teleportCoordinates?: { x: number; y: number };
    clanId?: number | null;
    localOnly?: boolean;
}

export interface ChatPanelProps {
    chatCollapseState: 'button' | 'tabs' | 'open';
    setChatCollapseState: (state: 'button' | 'tabs' | 'open') => void;
    activeChatTab: ChatTab;
    onSwitchChatTab: (tab: ChatTab) => void;
    isBanned: () => boolean;
    banEndTime: number;
    sheriffId: string | null;
    deputies: string[];
    user: any;
    chatOpen: boolean;
    isInClan: boolean;
    chatMessagesRef: React.RefObject<HTMLDivElement>;
    handleChatScroll: () => void;
    orderedChatMessages: ChatMessage[];
    uiText: (text: string) => string;
    getUserLevel: (name: string, uid?: string) => number;
    getLevelIcon: (level: number) => string;
    handleChatUserClick: (name: string, uid: string, e: React.MouseEvent) => void;
    renderMessageText: (text: string) => React.ReactNode;
    handleSectorTeleport: (x: number, y: number) => void;
    onlineUsers: Record<string, { name: string; uid: string }[]>;
    playerName: string;
    allUsers: Record<string, any>;
    showEmojiPicker: boolean;
    setShowEmojiPicker: (show: boolean) => void;
    KOLOBOK_EMOJIS: { code: string; url: string }[];
    handleEmojiClick: (code: string) => void;
    chatInput: string;
    setChatInput: (input: string) => void;
    handleSendMessage: (type: 'normal' | 'shout') => void;
    handleSendLocation: () => void;
    isLocationCooldown: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
    chatCollapseState,
    setChatCollapseState,
    activeChatTab,
    onSwitchChatTab,
    isBanned,
    banEndTime,
    sheriffId,
    deputies,
    user,
    chatOpen,
    isInClan,
    chatMessagesRef,
    handleChatScroll,
    orderedChatMessages,
    uiText,
    getUserLevel,
    getLevelIcon,
    handleChatUserClick,
    renderMessageText,
    handleSectorTeleport,
    onlineUsers,
    playerName,
    allUsers,
    showEmojiPicker,
    setShowEmojiPicker,
    KOLOBOK_EMOJIS,
    handleEmojiClick,
    chatInput,
    setChatInput,
    handleSendMessage,
    handleSendLocation,
    isLocationCooldown
}) => {
    if (chatCollapseState === 'button') {
        return (
            <button
                onClick={() => setChatCollapseState('tabs')}
                className="fixed bottom-2 left-2 w-10 h-10 bg-black/70 backdrop-blur-sm border border-white/10 shadow-2xl rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 z-50"
                title={uiText("Открыть чат")}
            >
                <ChatBubbleIcon className="w-5 h-5 text-gray-300" />
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-2 left-2 bg-black/70 backdrop-blur-sm border border-white/10 shadow-2xl transition-all duration-300 flex flex-col rounded-xl overflow-hidden chat-window ${chatCollapseState === 'open' ? '' : 'w-auto h-10 chat-collapsed'}`}
            style={chatCollapseState === 'open' ? { width: 'min(560px, calc(100vw - 16px))', height: 'clamp(200px, 28vh, 310px)' } : undefined}
        >
            <div className="flex items-center bg-black/50 border-b border-white/10 h-10 shrink-0 chat-tabs">
                <button
                    onClick={() => setChatCollapseState(chatCollapseState === 'open' ? 'tabs' : chatCollapseState === 'tabs' ? 'button' : 'open')}
                    className="h-full px-3 flex items-center justify-center hover:bg-white/10 transition-colors border-r border-white/10"
                    title={chatCollapseState === 'open' ? uiText('Свернуть до вкладок') : uiText('Развернуть чат')}
                >
                    <ChevronDownIcon className="w-4 h-4 text-gray-300" />
                </button>

                <button
                    onClick={() => { if (chatCollapseState === 'tabs') { setChatCollapseState('open'); } onSwitchChatTab('banya'); }}
                    className={`h-full px-4 text-sm font-medium transition-colors border-r border-white/10 ${activeChatTab === 'banya' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                    {uiText('Баня')} {isBanned() && <span className="ml-1 text-red-400">({Math.ceil((banEndTime - Date.now()) / 60000)} {uiText('мин')})</span>}
                </button>

                {!isBanned() && (
                    <>
                        <button
                            onClick={() => { if (chatCollapseState === 'tabs') { setChatCollapseState('open'); } onSwitchChatTab('general'); }}
                            className={`h-full px-4 text-sm font-medium transition-colors border-r border-white/10 ${activeChatTab === 'general' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {uiText('Общий')}
                        </button>
                        <button
                            onClick={() => { if (chatCollapseState === 'tabs') { setChatCollapseState('open'); } onSwitchChatTab('loot'); }}
                            className={`h-full px-4 text-sm font-medium transition-colors border-r border-white/10 ${activeChatTab === 'loot' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {uiText('Находки')}
                        </button>
                        <button
                            onClick={() => { if (chatCollapseState === 'tabs') { setChatCollapseState('open'); } onSwitchChatTab('clan'); }}
                            className={`h-full px-4 text-sm font-medium transition-colors border-r border-white/10 ${activeChatTab === 'clan' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                        >
                            {uiText('Клан')}
                        </button>
                        {(sheriffId === user?.uid || deputies.includes(user?.uid || '')) && (
                            <button
                                onClick={() => { if (chatCollapseState === 'tabs') { setChatCollapseState('open'); } onSwitchChatTab('police'); }}
                                className={`h-full px-4 text-sm font-medium transition-colors border-r border-white/10 ${activeChatTab === 'police' ? 'bg-blue-600/80 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                {uiText('Полиция')}
                            </button>
                        )}
                    </>
                )}
            </div>

            {chatOpen && (
                <>
                    {activeChatTab === 'clan' && !isInClan ? (
                        <div className="flex-grow flex items-center justify-center bg-transparent text-gray-400 p-4 text-center select-none">
                            <p>{uiText('Вы еще не создали или не вступили в клан.')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow flex overflow-hidden">
                                <div className="w-3/4 flex flex-col chat-messages-container">
                                    <div ref={chatMessagesRef} className="flex-grow overflow-y-auto p-2 space-y-1.5 bg-transparent chat-messages" onScroll={handleChatScroll}>
                                        {orderedChatMessages.map((msg) => {
                                            const senderText = msg.type === 'system' ? 'Система' : uiText(msg.sender);
                                            const senderLower = senderText.toLowerCase();
                                            const isSystemMessage = msg.type === 'system' || senderLower.includes('система');
                                            return (
                                                <div key={msg.id} className="text-sm break-words">
                                                    <span className="text-gray-500 text-xs mr-2">[{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                                                    {!isSystemMessage && (
                                                        <img src={getLevelIcon(getUserLevel(msg.sender, msg.senderId))} className="w-5 h-5 inline-block mr-1 align-middle object-contain translate-y-[1%]" alt="Level" />
                                                    )}
                                                    <span
                                                        onClick={(e) => { if (!isSystemMessage) handleChatUserClick(msg.sender, msg.senderId || '', e); }}
                                                        className={`font-bold mr-1 ${isSystemMessage ? 'text-red-500 cursor-default' : 'text-blue-400 cursor-pointer hover:underline'}`}
                                                    >
                                                        {senderText}:
                                                    </span>
                                                    <span className={msg.type === 'shout' ? 'text-blue-400 font-bold uppercase' : (isSystemMessage ? 'text-red-400 font-semibold' : 'text-gray-200')}>
                                                        {renderMessageText(msg.text)}
                                                    </span>
                                                    {msg.teleportCoordinates && (
                                                        <span
                                                            onClick={() => handleSectorTeleport(msg.teleportCoordinates!.x, msg.teleportCoordinates!.y)}
                                                            className="ml-2 text-green-400 font-bold cursor-pointer hover:text-green-300 hover:underline inline-flex items-center"
                                                            title={uiText("Телепортироваться в сектор")}
                                                        >
                                                            <CompassIcon className="w-3 h-3 mr-1" />
                                                            {uiText('ТУТ')}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {orderedChatMessages.length === 0 && (
                                            <div className="text-gray-500 text-center italic pt-4 text-sm">{uiText('Сообщений пока нет...')}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-1/4 border-l border-white/10 bg-black/30 flex flex-col chat-players-sidebar">
                                    <div className="p-1 text-xs font-bold text-gray-300 text-center border-b border-white/10">{uiText('Игроки')}</div>
                                    <div className="overflow-y-auto flex-grow p-2 space-y-1">
                                        {(onlineUsers[activeChatTab] || []).map((u, idx) => (
                                            <div key={idx} className={`text-sm truncate flex items-center ${u.name === playerName ? 'text-green-400 font-bold' : 'text-gray-300'}`}>
                                                <span onClick={(e) => handleChatUserClick(u.name, u.uid, e)} className="cursor-pointer hover:text-white hover:underline">{uiText(u.name)}</span>
                                                <img src={getLevelIcon(allUsers[u.uid]?.level || 1)} className="w-5 h-5 ml-1 object-contain translate-y-[1%]" alt="Level" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 bg-black/40 border-t border-white/10 flex gap-2 shrink-0 relative chat-input-area">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full left-0 mb-2 ml-2 bg-black/80 border border-white/20 rounded-lg p-2 shadow-xl grid grid-cols-6 gap-2 w-64 z-50">
                                        {KOLOBOK_EMOJIS.map((emoji, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleEmojiClick(emoji.code)}
                                                className="hover:bg-white/20 p-1 rounded flex items-center justify-center"
                                                title={emoji.code}
                                            >
                                                <img src={emoji.url} alt={emoji.code} className="w-6 h-6" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage('normal')}
                                    className="flex-grow bg-black/40 text-white text-sm rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-white/20 placeholder-gray-400"
                                    placeholder={uiText("Напишите сообщение...")}
                                />
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="bg-black/40 hover:bg-white/20 text-yellow-400 px-2 py-1 rounded transition-colors border border-white/20 flex items-center justify-center"
                                    title={uiText("Смайлики")}
                                >
                                    <SmileyIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleSendLocation}
                                    className={`bg-black/40 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors border border-white/20 flex items-center justify-center ${isLocationCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={isLocationCooldown ? uiText("Подождите...") : uiText("Отправить текущее местоположение")}
                                >
                                    <CompassIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleSendMessage('normal')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
                                >
                                    {uiText('Отправить')}
                                </button>
                                <button
                                    onClick={() => handleSendMessage('shout')}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
                                >
                                    Крик
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
