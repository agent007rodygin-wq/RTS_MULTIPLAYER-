import React, { useState, memo } from 'react';
import { UserIcon, CloseIcon, CompassIcon } from '../../../components/IconComponents';
import { BAN_OPTIONS, PUNISHMENT_OPTIONS, CURSE_OPTIONS } from '../../game/ui/actionOptions';
import type { Building, PlacedBuilding } from '../../../types';

export interface PlayerStatusMeta {
    isOnline: boolean;
    label: string;
    textClassName: string;
    dotClassName: string;
}

export interface OtherPlayerProfileModalProps {
    isOpen: boolean;
    selectedPlayerId: string | null;
    onClose: () => void;
    allUsers: Record<string, any>;
    user: { uid: string } | null;
    playerLevel: number;
    playerGlory: number;
    playerReputation: number;
    playerGold: number;
    playerRubies: number;
    playerName: string;
    sheriffId: string | null;
    deputies: string[];
    activeThieves: Record<string, any>;
    selectedPlayerBuildings: PlacedBuilding[];
    buildingData: Building[];
    playerStatusMeta: PlayerStatusMeta;
    onPraisePlayer: (uid: string) => void;
    onComplainPlayer: (uid: string) => void;
    onVoteKing: (uid: string) => void;
    onAddFriend: (uid: string) => void;
    onOpenPrivateChat: (uid: string) => void;
    onCatchCriminal: (uid: string) => void;
    onTeleportToBuilding: (x: number, y: number) => void;
    onBanPlayer: (uid: string, cost: number, durationMinutes: number) => void;
    onPunishPlayer: (uid: string, cost: number, gloryPenalty: number, label: string) => void;
    onCursePlayer: (uid: string, cost: number, durationMinutes: number, prefix: string, label: string) => void;
}

const OtherPlayerProfileModalComponent: React.FC<OtherPlayerProfileModalProps> = ({
    isOpen,
    selectedPlayerId,
    onClose,
    allUsers,
    user,
    playerLevel,
    playerGlory,
    playerReputation,
    playerGold,
    playerRubies,
    sheriffId,
    deputies,
    activeThieves,
    selectedPlayerBuildings,
    buildingData,
    playerStatusMeta,
    onPraisePlayer,
    onComplainPlayer,
    onVoteKing,
    onAddFriend,
    onOpenPrivateChat,
    onCatchCriminal,
    onTeleportToBuilding,
    onBanPlayer,
    onPunishPlayer,
    onCursePlayer
}) => {
    const [showBanMenu, setShowBanMenu] = useState(false);
    const [showPunishMenu, setShowPunishMenu] = useState(false);
    const [showCurseMenu, setShowCurseMenu] = useState(false);
    const [showBuildingsMenu, setShowBuildingsMenu] = useState(false);

    if (!isOpen || !selectedPlayerId) return null;

    const handleCloseModal = () => {
        setShowBanMenu(false);
        setShowPunishMenu(false);
        setShowCurseMenu(false);
        setShowBuildingsMenu(false);
        onClose();
    };

    const targetUser = allUsers[selectedPlayerId];
    const isCurrentPlayer = selectedPlayerId === user?.uid;
    const isSheriffOrDeputy = sheriffId === user?.uid || deputies.includes(user?.uid || '');
    const isTargetThief = !!activeThieves[selectedPlayerId];

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleCloseModal}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-600 relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <UserIcon className="w-6 h-6 mr-2 text-blue-400" />
                        Профиль игрока
                    </h2>
                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                <div className="mb-6 flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-blue-400">
                        {targetUser?.avatar ? (
                            <img src={targetUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-bold text-white">{targetUser?.name?.charAt(0) || '?'}</span>
                        )}
                    </div>
                    <div>
                        <div className="text-xl font-bold text-white">{targetUser?.name || "Неизвестный игрок"}</div>
                        <div className="text-sm text-gray-400">Уровень: {isCurrentPlayer ? playerLevel : (targetUser?.level || 1)}</div>
                        <div className="flex flex-col mt-1">
                            <div className="text-sm text-yellow-400 flex items-center">
                                <span className="mr-1">🏆</span>
                                Слава: {isCurrentPlayer ? playerGlory : (targetUser?.glory || 0)}
                            </div>
                            <div className="text-sm text-blue-400 flex items-center">
                                <span className="mr-1">🛡️</span>
                                Репутация: {isCurrentPlayer ? playerReputation : (targetUser?.reputation || 0)}
                            </div>
                            <div className={`text-sm flex items-center gap-2 mt-1 ${playerStatusMeta.textClassName}`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${playerStatusMeta.dotClassName}`}></span>
                                {playerStatusMeta.isOnline ? 'Онлайн' : `Был в сети: ${playerStatusMeta.label}`}
                            </div>
                        </div>
                    </div>
                </div>

                {!showBanMenu && !showPunishMenu && !showCurseMenu && !showBuildingsMenu ? (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <button onClick={() => onPraisePlayer(selectedPlayerId)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-xs transition-colors">👍 Похвалить</button>
                        <button onClick={() => onComplainPlayer(selectedPlayerId)} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-2 rounded text-xs transition-colors">Пожаловаться</button>
                        <button onClick={() => onVoteKing(selectedPlayerId)} className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 rounded text-xs transition-colors">👑 Это мой король!</button>
                        <button className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded text-xs transition-colors">👤 Персонаж</button>
                        <button className="bg-pink-700 hover:bg-pink-600 text-white font-bold py-2 rounded text-xs transition-colors flex justify-center items-center">💎 Купить рубины</button>
                        <button onClick={() => setShowBuildingsMenu(true)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded text-xs transition-colors">🏗️ Постройки</button>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-xs transition-colors">🎁 Подарить</button>
                        <button onClick={() => onAddFriend(selectedPlayerId)} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 rounded text-xs transition-colors">➕ Друзья</button>
                        <button onClick={() => onOpenPrivateChat(selectedPlayerId)} className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-2 rounded text-xs transition-colors">✉️ Сообщения</button>
                        <button onClick={() => setShowPunishMenu(true)} className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 rounded text-xs transition-colors border border-red-500">Наказать</button>
                        <button onClick={() => setShowCurseMenu(true)} className="bg-violet-800 hover:bg-violet-700 text-white font-bold py-2 rounded text-xs transition-colors border border-violet-500">Заколдовать</button>
                        <button onClick={() => setShowBanMenu(true)} className="col-span-2 bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded text-xs transition-colors">🚫 Забанить</button>
                        {isSheriffOrDeputy && isTargetThief && (
                            <button 
                                onClick={() => onCatchCriminal(selectedPlayerId)}
                                className="col-span-2 bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 rounded text-xs transition-colors border-2 border-yellow-400 animate-pulse"
                            >
                                🚨 Поймать преступника!
                            </button>
                        )}
                    </div>
                ) : showBuildingsMenu ? (
                    <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-blue-900/30 flex flex-col flex-1 min-h-0">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-white font-bold text-sm">Постройки игрока</span>
                            <button onClick={() => setShowBuildingsMenu(false)} className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center">
                                {'< Назад'}
                            </button>
                        </div>
                        <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {selectedPlayerBuildings.length > 0 ? (
                                selectedPlayerBuildings.map(b => {
                                    const info = buildingData.find(i => i.id === b.buildingId);
                                    return (
                                        <div key={b.id} className="bg-gray-800/80 p-2 rounded flex items-center justify-between border border-gray-700 hover:border-blue-500/50 transition-colors group">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center p-1">
                                                    {info && <img src={info.imageUrl} alt={info.name} className="max-w-full max-h-full object-contain" />}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-xs font-bold text-white truncate w-32 group-hover:text-blue-300">{info?.name || "Здание"}</div>
                                                    <div className="text-[10px] text-gray-500">[{b.x}, {b.y}]</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    onTeleportToBuilding(b.x, b.y);
                                                    handleCloseModal();
                                                }}
                                                className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white transition-colors"
                                                title="Телепортироваться к зданию"
                                            >
                                                <CompassIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-xs italic">Построек пока не найдено</div>
                            )}
                        </div>
                    </div>
                ) : showBanMenu ? (
                    <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-red-900/30">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold text-sm">Бан</span>
                            <button onClick={() => setShowBanMenu(false)} className="text-xs text-blue-400">{'< Назад'}</button>
                        </div>
                        <div className="space-y-1">
                            {BAN_OPTIONS.map((option, idx) => {
                                const targetRep = targetUser?.reputation || 0;
                                const multiplier = 1 + Math.floor(Math.max(0, targetRep) / 5);
                                const dynamicCost = option.cost * multiplier;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => onBanPlayer(selectedPlayerId, dynamicCost, option.durationMinutes)}
                                        disabled={playerGold < dynamicCost}
                                        className="w-full bg-red-900/40 hover:bg-red-900/60 disabled:bg-gray-800 text-white py-1.5 px-3 rounded text-xs flex justify-between items-center transition-colors border border-red-900/20"
                                    >
                                        <span>{option.label}</span>
                                        <span className="text-yellow-400 font-bold">{dynamicCost.toLocaleString()} монет</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : showPunishMenu ? (
                    <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-red-900/30">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold text-sm">Наказание</span>
                            <button onClick={() => setShowPunishMenu(false)} className="text-xs text-blue-400">{'< Назад'}</button>
                        </div>
                        <div className="space-y-1">
                            {PUNISHMENT_OPTIONS.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onPunishPlayer(selectedPlayerId, option.cost, option.gloryPenalty, option.label)}
                                    disabled={playerRubies < option.cost}
                                    className="w-full bg-red-900/40 hover:bg-red-900/60 disabled:bg-gray-800 text-white py-1.5 px-3 rounded text-xs flex justify-between items-center transition-colors border border-red-900/20"
                                >
                                    <span>{option.label}</span>
                                    <span className="text-pink-400 font-bold">{option.cost} ₽</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-violet-900/30">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold text-sm">Заколдовать</span>
                            <button onClick={() => setShowCurseMenu(false)} className="text-xs text-blue-400">{'< Назад'}</button>
                        </div>
                        <div className="space-y-1">
                            {CURSE_OPTIONS.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onCursePlayer(selectedPlayerId, option.cost, option.durationMinutes, option.prefix, option.label)}
                                    disabled={playerGold < option.cost}
                                    className="w-full bg-violet-900/40 hover:bg-violet-900/60 disabled:bg-gray-800 text-white py-1.5 px-3 rounded text-xs flex justify-between items-center transition-colors border border-violet-900/20"
                                >
                                    <span>{option.label}</span>
                                    <span className="text-yellow-400 font-bold">{option.cost.toLocaleString()} монет</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const OtherPlayerProfileModal = memo(OtherPlayerProfileModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.selectedPlayerId !== next.selectedPlayerId) return false;
    if (prev.playerGold !== next.playerGold) return false;
    if (prev.playerRubies !== next.playerRubies) return false;
    if (prev.allUsers !== next.allUsers) return false;
    if (prev.activeThieves !== next.activeThieves) return false;
    if (prev.selectedPlayerBuildings !== next.selectedPlayerBuildings) return false;
    if (prev.playerStatusMeta !== next.playerStatusMeta) return false;
    return true;
});
