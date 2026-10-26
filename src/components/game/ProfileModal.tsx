import React from 'react';
import type { Clan, PlacedBuilding, HistoryEntry, PrivateMessage, Friend } from '../../../types';
import {
    CloseIcon,
    UserIcon,
    LettersIcon
} from '../../../components/IconComponents';
import {
    Pause,
    Play,
    SkipBack,
    SkipForward,
    LogOut,
    RefreshCw
} from 'lucide-react';
import { ClanTab, type ClanSettingsState } from './profile/ClanTab';

export type ProfileTab = 'info' | 'clan' | 'history' | 'friends' | 'mail' | 'private' | 'settings' | 'police_elections';

export interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeProfileTab: ProfileTab;
    setActiveProfileTab: (tab: ProfileTab) => void;
    // Info tab props
    playerAvatar: string | null;
    tempPlayerName: string;
    setTempPlayerName: (name: string) => void;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNameChange: () => void;
    playerGender: 'male' | 'female';
    onGenderSelect: (gender: 'male' | 'female') => void;
    playerBuildingsCount: number;
    maxBuildings: number;
    baseBuildingPermits: number;
    extraBuildingPermits: number;
    isAdmin: boolean;
    onResetMap: () => void;
    // Clan tab props
    isInClan: boolean;
    currentClan: Clan | null;
    playerClanId: number | null;
    clanMembers: any[];
    placedBuildings: PlacedBuilding[];
    user: any;
    allUsers: Record<string, any>;
    hasClanCastle: boolean;
    recommendedClans: Clan[];
    openClanCatalog: Clan[];
    browseOpenClans: Clan[];
    isClanDirectoryLoading: boolean;
    onJoinClan: (clanId: number) => void;
    onConfirmLeaveClan: () => void;
    onCreateClan: (name: string, desc: string, avatar: string | null) => Promise<boolean | void>;
    onSaveClanSettings: (settings: ClanSettingsState, newAvatar: string | null) => Promise<void>;
    onUpdateClanDescription: (desc: string) => void;
    onUpdateMemberPermissions: (memberUid: string, canInvite: boolean, canGrantStars: boolean, newRank?: number) => void;
    onLoadClanSettingsDoc?: (clanId: string | number) => Promise<Partial<ClanSettingsState> | null>;
    // History tab props
    historyLoadState: 'loading' | 'ready' | 'empty' | 'error';
    playerHistory: HistoryEntry[];
    historyClearing: boolean;
    onClearHistory: () => void;
    // Friends tab props
    friends: Friend[];
    isUserOnline: (name: string) => boolean;
    getUserLevel: (name: string) => number;
    getUserGlory: (name: string) => number;
    onRemoveFriend: (name: string) => void;
    onSelectChatUser: (name: string, uid: string, e: React.MouseEvent) => void;
    // Mail and Private tabs props
    privateChats: { otherUserId: string; lastMessage: PrivateMessage; unreadCount: number }[];
    onOpenChat: (otherUserId: string, chatId: string, isAnon: boolean) => void;
    // Settings tab props
    musicEnabled: boolean;
    setMusicEnabled: (enabled: boolean) => void;
    musicVolume: number;
    setMusicVolume: (vol: number) => void;
    currentTrackIndex: number;
    setCurrentTrackIndex: (idx: number | ((prev: number) => number)) => void;
    musicTracksCount: number;
    gameSoundsVolume: number;
    setGameSoundsVolume: (vol: number) => void;
    showZoneDebugButton: boolean;
    setShowZoneDebugButton: (show: boolean) => void;
    onLogout: () => void;
    // Police Elections tab props
    policeBadgeImageUrl: string;
    sheriffId: string | null;
    sheriffName: string | null;
    deputies: string[];
    policeElectionEndTime: number;
    firstElectionCompleted: boolean;
    policeCandidates: Record<string, { votes: number; bank: number }>;
    kingId: string | null;
    queenId: string | null;
    policeSearchTerm: string;
    setPoliceSearchTerm: (term: string) => void;
    onOpenPoliceVotingModal: (candidateUid: string) => void;
    onBecomePoliceCandidate: () => void;
    onAddDeputy: (uid: string) => void;
    onRemoveDeputy: (uid: string) => void;
}

export const ProfileModalComponent: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
    activeProfileTab,
    setActiveProfileTab,
    // Info tab props
    playerAvatar,
    tempPlayerName,
    setTempPlayerName,
    onAvatarChange,
    onNameChange,
    playerGender,
    onGenderSelect,
    playerBuildingsCount,
    maxBuildings,
    baseBuildingPermits,
    extraBuildingPermits,
    isAdmin,
    onResetMap,
    // Clan tab props
    isInClan,
    currentClan,
    playerClanId,
    clanMembers,
    placedBuildings,
    user,
    allUsers,
    hasClanCastle,
    recommendedClans,
    openClanCatalog,
    browseOpenClans,
    isClanDirectoryLoading,
    onJoinClan,
    onConfirmLeaveClan,
    onCreateClan,
    onSaveClanSettings,
    onUpdateClanDescription,
    onUpdateMemberPermissions,
    onLoadClanSettingsDoc,
    // History tab props
    historyLoadState,
    playerHistory,
    historyClearing,
    onClearHistory,
    // Friends tab props
    friends,
    isUserOnline,
    getUserLevel,
    getUserGlory,
    onRemoveFriend,
    onSelectChatUser,
    // Mail and Private tabs props
    privateChats,
    onOpenChat,
    // Settings tab props
    musicEnabled,
    setMusicEnabled,
    musicVolume,
    setMusicVolume,
    currentTrackIndex,
    setCurrentTrackIndex,
    musicTracksCount,
    gameSoundsVolume,
    setGameSoundsVolume,
    showZoneDebugButton,
    setShowZoneDebugButton,
    onLogout,
    // Police Elections tab props
    policeBadgeImageUrl,
    sheriffId,
    sheriffName,
    deputies,
    policeElectionEndTime,
    firstElectionCompleted,
    policeCandidates,
    kingId,
    queenId,
    policeSearchTerm,
    setPoliceSearchTerm,
    onOpenPoliceVotingModal,
    onBecomePoliceCandidate,
    onAddDeputy,
    onRemoveDeputy
}) => {
    if (!isOpen) return null;

    const isKingOrQueen = kingId === user?.uid || queenId === user?.uid;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundImage: 'url(/Gui/build_menu_bg.webp)',
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                    width: 'min(var(--ui-modal-width), calc(100vw - 32px))',
                    height: 'min(var(--ui-modal-height), calc(100vh - 32px))',
                    padding: 'var(--ui-modal-padding-top) var(--ui-modal-padding-right) var(--ui-modal-padding-bottom) var(--ui-modal-padding-left)',
                    overflow: 'hidden'
                }}
            >
                {/* Title centered + close button */}
                <div className="flex items-center justify-center relative" style={{ padding: '0 8px', marginTop: '10px', marginBottom: '4px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '7px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                        <h2 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '15px', color: '#e0e8f0', letterSpacing: '1px', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0 }}>
                            Личный кабинет
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute"
                        style={{ right: '-23px', top: '3px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)', boxShadow: '0 0 12px 4px rgba(96,165,250,0.35), 0 0 24px 8px rgba(96,165,250,0.15), inset 0 0 8px rgba(150,200,255,0.2)', border: '1px solid rgba(96,165,250,0.4)', color: 'rgba(200,225,255,0.9)', transition: 'all 0.2s ease' }}
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-4 overflow-x-auto pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {[
                        { id: 'info', label: 'Информация' },
                        { id: 'clan', label: 'Клан' },
                        { id: 'history', label: 'История' },
                        { id: 'friends', label: 'Друзья' },
                        { id: 'mail', label: 'Письма' },
                        { id: 'private', label: 'Приватные' },
                        { id: 'settings', label: 'Настройки' },
                        { id: 'police_elections', label: 'Выборы в полиции' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveProfileTab(tab.id as ProfileTab)}
                            className="transition-colors whitespace-nowrap"
                            style={{
                                padding: '7px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: activeProfileTab === tab.id ? 800 : 600,
                                background: activeProfileTab === tab.id ? 'rgba(59, 130, 246, 0.7)' : 'rgba(255,255,255,0.05)',
                                color: activeProfileTab === tab.id ? '#fff' : 'rgba(200,210,220,0.8)',
                                border: activeProfileTab === tab.id ? '1px solid rgba(96,165,250,0.5)' : '1px solid transparent',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="build-menu-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {activeProfileTab === 'info' && (
                        <div className="flex flex-col items-center max-w-md mx-auto">
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <input type="file" id="avatarUpload" className="hidden" accept="image/*" onChange={onAvatarChange} />
                                    <label htmlFor="avatarUpload" className="cursor-pointer group">
                                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden group-hover:border-blue-500 transition-all">
                                            {playerAvatar ? (
                                                <img src={playerAvatar} alt="Player Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-16 h-16 text-gray-500" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold">Сменить</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6 w-full">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Сменить имя (стоимость: 500 золота)</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={tempPlayerName}
                                        onChange={(e) => setTempPlayerName(e.target.value)}
                                        className="flex-grow bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button onClick={onNameChange} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                                        Сменить
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6 w-full">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Пол</label>
                                {isKingOrQueen ? (
                                    <p className="text-yellow-400 text-sm">Вы не можете изменить пол, пока являетесь королем или королевой!</p>
                                ) : (
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => onGenderSelect('male')}
                                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all flex items-center justify-center space-x-2 ${playerGender === 'male' ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            <span>Парень</span>
                                        </button>
                                        <button
                                            onClick={() => onGenderSelect('female')}
                                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all flex items-center justify-center space-x-2 ${playerGender === 'female' ? 'bg-pink-600 text-white ring-2 ring-pink-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                        >
                                            <span>Девушка</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="text-center text-gray-400 bg-gray-900/50 p-3 rounded-lg w-full">
                                <p className="font-bold text-lg">Лимит зданий</p>
                                <p className="text-2xl">{playerBuildingsCount} / {maxBuildings}</p>
                                <p className="text-xs text-gray-400 mt-1">base: {baseBuildingPermits} + bonus: {extraBuildingPermits} = {maxBuildings}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-700 w-full flex flex-col space-y-3">
                                {user && (
                                    <>
                                        {isAdmin && (
                                            <button
                                                onClick={onResetMap}
                                                className="w-full py-3 mt-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-red-900/20"
                                            >
                                                <RefreshCw className="w-5 h-5" />
                                                <span>Сбросить карту</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeProfileTab === 'clan' && (
                        <ClanTab
                            isInClan={isInClan}
                            currentClan={currentClan}
                            playerClanId={playerClanId}
                            clanMembers={clanMembers}
                            placedBuildings={placedBuildings}
                            user={user}
                            allUsers={allUsers}
                            hasClanCastle={hasClanCastle}
                            recommendedClans={recommendedClans}
                            openClanCatalog={openClanCatalog}
                            browseOpenClans={browseOpenClans}
                            isClanDirectoryLoading={isClanDirectoryLoading}
                            onJoinClan={onJoinClan}
                            onConfirmLeaveClan={onConfirmLeaveClan}
                            onCreateClan={onCreateClan}
                            onSaveClanSettings={onSaveClanSettings}
                            onUpdateClanDescription={onUpdateClanDescription}
                            onUpdateMemberPermissions={onUpdateMemberPermissions}
                            onLoadClanSettingsDoc={onLoadClanSettingsDoc}
                        />
                    )}

                    {activeProfileTab === 'history' && (
                        <div className="flex flex-col h-full">
                            {historyLoadState === 'loading' ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <p>Загрузка истории...</p>
                                </div>
                            ) : historyLoadState === 'error' ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <p>Не удалось загрузить историю.</p>
                                </div>
                            ) : playerHistory.length > 0 ? (
                                <>
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={onClearHistory}
                                            disabled={historyClearing}
                                            className="bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {historyClearing ? 'Удаление...' : 'Очистить историю'}
                                        </button>
                                    </div>
                                    <div className="space-y-3 pr-2">
                                        {playerHistory.map(entry => (
                                            <div key={entry.id} className="bg-gray-700/30 p-3 rounded border-l-4 border-blue-500 text-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${
                                                        entry.type === 'build' ? 'bg-green-900/50 text-green-300' :
                                                        entry.type === 'move' ? 'bg-purple-900/50 text-purple-300' :
                                                        entry.type === 'destroy' ? 'bg-red-900/50 text-red-300' :
                                                        entry.type === 'economy' ? 'bg-yellow-900/50 text-yellow-300' :
                                                        'bg-gray-600/50 text-gray-300'
                                                    }`}>
                                                        {entry.type === 'build' ? 'Строительство' :
                                                         entry.type === 'move' ? 'Перемещение' :
                                                         entry.type === 'destroy' ? 'Разрушение' :
                                                         entry.type === 'economy' ? 'Экономика' : 'Действие'}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">{new Date(entry.timestamp).toLocaleString("ru-RU")}</span>
                                                </div>
                                                <p className="text-gray-200">{entry.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <p>История действий пуста.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'friends' && (
                        <div className="flex flex-col h-full">
                            {friends.length > 0 ? (
                                <div className="space-y-2 overflow-y-auto pr-1">
                                    {friends.map((friend, idx) => {
                                        const isOnline = isUserOnline(friend.name);
                                        return (
                                            <div key={idx} className="bg-gray-700/50 p-3 rounded flex items-center justify-between border border-gray-600">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-600 relative cursor-pointer"
                                                        onClick={(e) => { onSelectChatUser(friend.name, friend.uid || '', e); onClose(); }}
                                                    >
                                                        {friend.uid && allUsers[friend.uid]?.avatar ? (
                                                            <img src={allUsers[friend.uid].avatar} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-6 h-6 text-gray-400" />
                                                        )}
                                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                    </div>
                                                    <div
                                                        className="cursor-pointer group"
                                                        onClick={(e) => { onSelectChatUser(friend.name, friend.uid || '', e); onClose(); }}
                                                    >
                                                        <p className="font-bold text-white group-hover:underline">{friend.name}</p>
                                                        <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                                                            {isOnline ? 'В сети' : 'Был(а) недавно'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span
                                                        className="text-sm text-yellow-500 mr-4 font-medium cursor-pointer hover:underline"
                                                        onClick={(e) => { onSelectChatUser(friend.name, friend.uid || '', e); onClose(); }}
                                                    >
                                                        Уровень {getUserLevel(friend.name)} ({getUserGlory(friend.name)} славы)
                                                    </span>
                                                    <button
                                                        onClick={() => onRemoveFriend(friend.name)}
                                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700/50 rounded transition-colors"
                                                        title="Удалить из друзей"
                                                    >
                                                        <CloseIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <UserIcon className="w-16 h-16 mb-4 opacity-30" />
                                    <p>У вас пока нет друзей.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'mail' && (
                        <div
                            className="h-full flex flex-col overflow-y-auto bg-[#efe1bd] text-black border-4 border-[#8b5a2b] shadow-inner relative p-4 rounded-sm"
                            style={{
                                backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')",
                                boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), 0 10px 15px rgba(0,0,0,0.5)"
                            }}
                        >
                            <h2 className="text-2xl font-bold mb-4 font-serif text-[#5c3a21] border-b border-[#a88a6d] pb-2 uppercase tracking-wider pl-2 w-3/4">
                                Королевская почта
                            </h2>

                            {privateChats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[#8b6a4b]">
                                    <LettersIcon className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="font-serif italic font-bold">Ваш почтовый ящик пуст.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2 px-2 pb-10">
                                    {privateChats.map(chat => {
                                        const otherUser = Object.values(allUsers).find(u => u.uid === chat.otherUserId);
                                        const computedChatId = chat.lastMessage.chatId || [user?.uid || '', otherUser?.uid || ''].sort().join('_');
                                        return (
                                            <div
                                                key={computedChatId || Math.random().toString()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenChat(chat.otherUserId, computedChatId, chat.lastMessage.chatId?.endsWith('_anon') || false);
                                                }}
                                                className="relative bg-[#fdf6e3] p-4 rounded-sm cursor-pointer hover:bg-[#fff9ed] transition-colors flex items-center gap-4 group shadow-md border border-[#c2b280]"
                                                style={{
                                                    backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
                                                    boxShadow: "2px 2px 8px rgba(0,0,0,0.2)"
                                                }}
                                            >
                                                {/* Scroll End Effects */}
                                                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-[110%] bg-gradient-to-r from-[#d4bc8b] to-[#fdf6e3] rounded-l-full shadow-md border-y border-l border-[#8b5a2b]"></div>
                                                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-4 h-[110%] bg-gradient-to-l from-[#d4bc8b] to-[#fdf6e3] rounded-r-full shadow-md border-y border-r border-[#8b5a2b]"></div>

                                                {/* Left Side: Avatar & Stats */}
                                                <div className="flex flex-col items-center min-w-[80px] z-10">
                                                    {chat.otherUserId === 'anonymous' ? (
                                                        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-[#8b5a2b] bg-[#d4c399]">
                                                            <span className="text-3xl">???</span>
                                                        </div>
                                                    ) : otherUser?.avatar ? (
                                                        <img src={otherUser.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#8b5a2b]" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-[#d4c399] flex items-center justify-center border-2 border-[#8b5a2b]">
                                                            <UserIcon className="w-7 h-7 text-[#5c3a21]" />
                                                        </div>
                                                    )}

                                                    {chat.otherUserId !== 'anonymous' && (
                                                        <div className="mt-1 flex items-center bg-[#5c3a21] px-1 rounded text-white text-[10px] font-bold shadow-inner" aria-label={`Уровень ${otherUser?.level || 1}`}>
                                                            <span>Ур. {otherUser?.level || 1}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right Side: Msg Text Block */}
                                                <div className="flex-1 min-w-0 pl-2 z-10">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span
                                                            className="font-bold text-[#5c3a21] truncate font-serif text-lg group-hover:underline decoration-dashed decoration-2 underline-offset-4 cursor-pointer"
                                                            onClick={(e) => {
                                                                if (chat.otherUserId !== 'anonymous' && otherUser) {
                                                                    e.stopPropagation();
                                                                    onClose();
                                                                    onSelectChatUser(otherUser.name, otherUser.uid, e as any);
                                                                }
                                                            }}
                                                        >
                                                            {chat.otherUserId === 'anonymous' ? 'Аноним' : (otherUser?.name || 'Неизвестный')}
                                                        </span>

                                                        {/* Optional Stats */}
                                                        {chat.otherUserId !== 'anonymous' && otherUser && (
                                                            <div className="flex text-[11px] space-x-3 text-[#7a5938] font-bold bg-[#e8d5a5] px-2 rounded-full border border-[#d4bc8b]">
                                                                <span title="Слава">🏆 {otherUser.glory || 0}</span>
                                                                <span title="Репутация">⭐ {otherUser.reputation || 0}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="bg-[#e8d5a5] p-2 rounded border border-[#d4bc8b] text-[#3a200e] text-sm overflow-hidden text-ellipsis shadow-inner whitespace-nowrap italic font-serif">
                                                        <span className="font-bold text-[#8b5a2b]">{chat.lastMessage.senderId === user?.uid ? 'Вы: ' : ''}</span>
                                                        {chat.lastMessage.text || (chat.lastMessage as any).message}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-[10px] text-[#8b6a4b] font-bold italic pl-1">Свиток получен...</span>
                                                        <span className="text-[10px] text-[#8b6a4b] font-bold px-1">{new Date(chat.lastMessage.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                {chat.unreadCount > 0 && (
                                                    <div className="absolute top-[-8px] right-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border border-white z-20">
                                                        {chat.unreadCount} новых
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'private' && (
                        <div
                            className="h-full flex flex-col overflow-y-auto bg-[#efe1bd] text-black border-4 border-[#8b5a2b] shadow-inner relative p-4 rounded-sm"
                            style={{
                                backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')",
                                boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), 0 10px 15px rgba(0,0,0,0.5)"
                            }}
                        >
                            <h2 className="text-2xl font-bold mb-4 font-serif text-[#5c3a21] border-b border-[#a88a6d] pb-2 uppercase tracking-wider pl-2 w-3/4">
                                Приватные сообщения
                            </h2>

                            {privateChats.filter(chat => !chat.lastMessage.isAnonymous).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-[#8b6a4b]">
                                    <LettersIcon className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="font-serif italic font-bold">Нет приватных сообщений.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2 px-2 pb-10">
                                    {privateChats.filter(chat => !chat.lastMessage.isAnonymous).map(chat => {
                                        const otherUser = Object.values(allUsers).find(u => u.uid === chat.otherUserId);
                                        const computedChatId = chat.lastMessage.chatId || [user?.uid || '', otherUser?.uid || ''].sort().join('_');
                                        return (
                                            <div
                                                key={computedChatId || Math.random().toString()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenChat(chat.otherUserId, computedChatId, false);
                                                }}
                                                className="relative bg-[#fdf6e3] p-4 rounded-sm cursor-pointer hover:bg-[#fff9ed] transition-colors flex items-center gap-4 group shadow-md border border-[#c2b280]"
                                                style={{
                                                    backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
                                                    boxShadow: "2px 2px 8px rgba(0,0,0,0.2)"
                                                }}
                                            >
                                                {/* Scroll End Effects */}
                                                <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-4 h-[110%] bg-gradient-to-r from-[#d4bc8b] to-[#fdf6e3] rounded-l-full shadow-md border-y border-l border-[#8b5a2b]"></div>
                                                <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-4 h-[110%] bg-gradient-to-l from-[#d4bc8b] to-[#fdf6e3] rounded-r-full shadow-md border-y border-r border-[#8b5a2b]"></div>

                                                {/* Left Side: Default icon only (no avatar) */}
                                                <div className="flex flex-col items-center min-w-[60px] z-10">
                                                    <div className="w-12 h-12 rounded-full bg-[#d4c399] flex items-center justify-center border-2 border-[#8b5a2b]">
                                                        <UserIcon className="w-7 h-7 text-[#5c3a21]" />
                                                    </div>
                                                </div>

                                                {/* Right Side: Only message preview (no username) */}
                                                <div className="flex-1 z-10 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm text-[#8b6a4b] font-serif italic">
                                                            {chat.lastMessage.timestamp ? new Date(chat.lastMessage.timestamp).toLocaleString() : ''}
                                                        </p>
                                                    </div>
                                                    <p className="text-[#5c3a21] font-serif truncate">
                                                        {chat.lastMessage.text}
                                                    </p>
                                                </div>

                                                {/* Unread Badge */}
                                                {chat.unreadCount > 0 && (
                                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-20 border-2 border-[#8b5a2b]">
                                                        {chat.unreadCount}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'settings' && (
                        <div className="flex flex-col h-full space-y-4">
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 16px' }}>
                                <h3 style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '15px', color: '#e0e8f0', margin: 0 }}>Настройки</h3>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h4 className="text-md font-medium text-gray-200 mb-3">Музыка</h4>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-300">Включить фоновую музыку</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={musicEnabled} onChange={(e) => setMusicEnabled(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Громкость</span>
                                        <span>{Math.round(musicVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={musicVolume}
                                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col items-center mt-6">
                                    <div className="flex items-center justify-center space-x-4">
                                        <button
                                            onClick={() => setCurrentTrackIndex(i => (i - 1 + musicTracksCount) % musicTracksCount)}
                                            className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"
                                        >
                                            <SkipBack className="w-5 h-5 text-white" />
                                        </button>
                                        <button
                                            onClick={() => setMusicEnabled(!musicEnabled)}
                                            className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
                                        >
                                            {musicEnabled ? (
                                                <Pause className="w-6 h-6 text-white" />
                                            ) : (
                                                <Play className="w-6 h-6 text-white ml-1" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setCurrentTrackIndex(i => (i + 1) % musicTracksCount)}
                                            className="p-2 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"
                                        >
                                            <SkipForward className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-3">
                                        Трек {currentTrackIndex + 1} из {musicTracksCount}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h4 className="text-md font-medium text-gray-200 mb-3">Звуки игры</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Громкость</span>
                                        <span>{Math.round(gameSoundsVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={gameSoundsVolume}
                                        onChange={(e) => setGameSoundsVolume(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h4 className="text-md font-medium text-gray-200 mb-3">Отладка</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">Show Zone Debug</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={showZoneDebugButton} onChange={(e) => setShowZoneDebugButton(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Logout button */}
                            {user && (
                                <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                                                {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-white" />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>{user.displayName}</p>
                                                <p className="text-xs" style={{ color: 'rgba(200,210,220,0.6)', fontFamily: 'Nunito, sans-serif' }}>{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onLogout}
                                            className="transition-colors"
                                            style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            title="Выйти"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Выйти</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Police Elections Tab */}
                    {activeProfileTab === 'police_elections' && (
                        <div className="flex flex-col h-full space-y-4 overflow-y-auto">
                            <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 flex items-center gap-2">
                                <img src={policeBadgeImageUrl} alt="Badge" className="w-6 h-6" />
                                Выборы в полиции
                            </h3>

                            {/* Current Sheriff Info */}
                            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/50">
                                <h4 className="text-blue-300 font-medium mb-2">Текущий шериф</h4>
                                {sheriffId ? (
                                    <div className="flex items-center gap-2">
                                        <img src="/last_appx/polise/16.webp" alt="Sheriff" className="w-10 h-10 rounded" />
                                        <div>
                                            <p className="text-white font-bold">{sheriffName || "Шериф"}</p>
                                            <p className="text-xs text-gray-400">Помощники: {deputies.length}/6</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">В городе еще нет шерифа. Постройте полицейский участок, чтобы выдвинуть свою кандидатуру.</p>
                                )}
                            </div>

                            {/* Time until next elections */}
                            {(() => {
                                if (policeElectionEndTime > 0) {
                                    const timeLeft = Math.max(0, policeElectionEndTime - Date.now());
                                    if (timeLeft > 0) {
                                        const days = Math.floor(timeLeft / 86400000);
                                        const hours = Math.floor((timeLeft % 86400000) / 3600000);
                                        const minutes = Math.floor((timeLeft % 3600000) / 60000);
                                        const seconds = Math.floor((timeLeft % 60000) / 1000);

                                        let timeStr = '';
                                        if (days > 0) {
                                            timeStr = `${days}д ${hours}ч`;
                                        } else {
                                            timeStr = `${hours}ч ${minutes}м ${seconds}с`;
                                        }

                                        const isOngoingElection = Object.keys(policeCandidates).length > 0;

                                        if (isOngoingElection) {
                                            return (
                                                <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/50">
                                                    <p className="text-yellow-300 text-sm font-bold">
                                                        До окончания выборов: {timeStr}
                                                    </p>
                                                </div>
                                            );
                                        }
                                    }
                                }

                                if (sheriffId && firstElectionCompleted && policeElectionEndTime > Date.now()) {
                                    const timeLeft = policeElectionEndTime - Date.now();
                                    const days = Math.floor(timeLeft / 86400000);
                                    const hours = Math.floor((timeLeft % 86400000) / 3600000);
                                    return (
                                        <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/50">
                                            <p className="text-blue-300 text-sm font-bold">
                                                До следующих выборов на пост шерифа: {days}д {hours}ч
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Candidates List */}
                            <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                                <h4 className="text-gray-200 font-medium mb-3">Претенденты на пост шерифа</h4>
                                {Object.keys(policeCandidates).length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4">Пока нет кандидатов</p>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {Object.entries(policeCandidates)
                                            .sort(([, a], [, b]) => b.votes - a.votes)
                                            .slice(0, 10)
                                            .map(([uid, data]) => {
                                                const playerInfo = allUsers[uid];
                                                return (
                                                    <div
                                                        key={uid}
                                                        className={`flex items-center justify-between p-2 rounded ${uid === user?.uid ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-800/50'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-300 text-sm">{playerInfo?.name || 'Игрок'}</span>
                                                            <span className="text-xs text-gray-500">Голоса: {data.votes}</span>
                                                            <span className="text-xs text-yellow-500">Банк: {data.bank.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => onOpenPoliceVotingModal(uid)}
                                                                className="p-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm"
                                                                title="Голосовать (1000 монет, 100 энергии)"
                                                            >
                                                                V
                                                            </button>
                                                            <button
                                                                className="p-1 bg-red-600 hover:bg-red-500 rounded text-white text-sm opacity-50 cursor-not-allowed"
                                                                title="Против (не реализовано)"
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

                            {/* Become Candidate Button */}
                            {(() => {
                                const hasPoliceStation = placedBuildings.some(b => b.buildingId === 308 && b.ownerId === user?.uid && !b.isConstructing);
                                const isAlreadyCandidate = policeCandidates[user?.uid || ''] !== undefined;
                                if (!hasPoliceStation) return null;
                                if (isKingOrQueen) return <p className="text-red-400 text-center">Вы не можете быть кандидатом в шерифы, так как вы король или королева!</p>;
                                if (isAlreadyCandidate) return <p className="text-green-400 text-center">Вы уже кандидат!</p>;
                                return (
                                    <button
                                        onClick={onBecomePoliceCandidate}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                                    >
                                        Выдвинуть кандидатуру (10,000 монет)
                                    </button>
                                );
                            })()}

                            {/* Sheriff: Manage Deputies */}
                            {sheriffId === user?.uid && (
                                <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/50">
                                    <h4 className="text-green-300 font-medium mb-3">Управление помощниками ({deputies.length}/6)</h4>

                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            placeholder="Поиск игрока..."
                                            value={policeSearchTerm}
                                            onChange={(e) => setPoliceSearchTerm(e.target.value)}
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                                        />
                                    </div>

                                    {policeSearchTerm && (
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {Object.entries(allUsers)
                                                .filter(([uid, p]) =>
                                                    p.name?.toLowerCase().includes(policeSearchTerm.toLowerCase()) &&
                                                    uid !== user?.uid &&
                                                    !deputies.includes(uid)
                                                )
                                                .slice(0, 5)
                                                .map(([uid, player]) => (
                                                    <div key={uid} className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                                                        <span className="text-sm text-gray-300">{player.name}</span>
                                                        <button
                                                            onClick={() => onAddDeputy(uid)}
                                                            disabled={deputies.length >= 6}
                                                            className="p-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {deputies.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                            <p className="text-xs text-gray-400">Текущие помощники:</p>
                                            {deputies.map(depUid => {
                                                const depInfo = allUsers[depUid];
                                                return (
                                                    <div key={depUid} className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
                                                        <span className="text-sm text-gray-300">{depInfo?.name || 'Игрок'}</span>
                                                        <button
                                                            onClick={() => onRemoveDeputy(depUid)}
                                                            className="p-1 bg-red-600 hover:bg-red-500 rounded text-white text-xs"
                                                        >
                                                            Снять
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const arePropsEqual = (prevProps: ProfileModalProps, nextProps: ProfileModalProps): boolean => {
    if (!prevProps.isOpen && !nextProps.isOpen) return true;
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    if (prevProps.activeProfileTab !== nextProps.activeProfileTab) return false;

    if (
        prevProps.playerAvatar !== nextProps.playerAvatar ||
        prevProps.tempPlayerName !== nextProps.tempPlayerName ||
        prevProps.playerGender !== nextProps.playerGender ||
        prevProps.playerBuildingsCount !== nextProps.playerBuildingsCount ||
        prevProps.maxBuildings !== nextProps.maxBuildings ||
        prevProps.isAdmin !== nextProps.isAdmin ||
        prevProps.isInClan !== nextProps.isInClan ||
        prevProps.currentClan !== nextProps.currentClan ||
        prevProps.playerClanId !== nextProps.playerClanId ||
        prevProps.clanMembers !== nextProps.clanMembers ||
        prevProps.historyLoadState !== nextProps.historyLoadState ||
        prevProps.playerHistory !== nextProps.playerHistory ||
        prevProps.historyClearing !== nextProps.historyClearing ||
        prevProps.friends !== nextProps.friends ||
        prevProps.privateChats !== nextProps.privateChats ||
        prevProps.musicEnabled !== nextProps.musicEnabled ||
        prevProps.musicVolume !== nextProps.musicVolume ||
        prevProps.currentTrackIndex !== nextProps.currentTrackIndex ||
        prevProps.gameSoundsVolume !== nextProps.gameSoundsVolume ||
        prevProps.showZoneDebugButton !== nextProps.showZoneDebugButton ||
        prevProps.sheriffId !== nextProps.sheriffId ||
        prevProps.sheriffName !== nextProps.sheriffName ||
        prevProps.deputies !== nextProps.deputies ||
        prevProps.policeCandidates !== nextProps.policeCandidates ||
        prevProps.policeSearchTerm !== nextProps.policeSearchTerm ||
        prevProps.allUsers !== nextProps.allUsers
    ) {
        return false;
    }

    return true;
};

export const ProfileModal = React.memo(ProfileModalComponent, arePropsEqual);
