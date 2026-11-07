import React, { useState } from 'react';
import type { Clan, PlacedBuilding } from '../../../../types';
import { ClanIcon, SearchIcon } from '../../../../components/IconComponents';
import { compressImageFile } from '../../../game/utils/imageCompress';

const BANDIT_CASTLE_IDS = new Set([200, 201, 202, 203]);

export interface ClanSettingsState {
    isPublic: boolean;
    allowInvites: boolean;
    invitePermissionLevel: number;
    starGrantPermissionLevel: number;
}

export interface ClanTabProps {
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
}

export const ClanTab: React.FC<ClanTabProps> = ({
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
    onLoadClanSettingsDoc
}) => {
    const [showCreateClanMode, setShowCreateClanMode] = useState(false);
    const [showLeaveClanConfirmation, setShowLeaveClanConfirmation] = useState(false);
    const [showClanSettings, setShowClanSettings] = useState(false);
    const [hoveredStar, setHoveredStar] = useState<{ uid: string; level: number } | null>(null);

    const [clanSettings, setClanSettings] = useState<ClanSettingsState>({
        isPublic: true,
        allowInvites: false,
        invitePermissionLevel: 5,
        starGrantPermissionLevel: 5
    });

    const [newClanName, setNewClanName] = useState('');
    const [newClanDesc, setNewClanDesc] = useState('');
    const [newClanAvatar, setNewClanAvatar] = useState<string | null>(null);
    const [clanSearchTerm, setClanSearchTerm] = useState('');

    const visibleOpenClans = React.useMemo(() => {
        const term = clanSearchTerm.trim().toLowerCase();
        return openClanCatalog.filter(c => {
            if (!term) return true;
            const haystack = `${c.name || ''} ${c.leaderName || ''}`.toLowerCase();
            return haystack.includes(term);
        });
    }, [clanSearchTerm, openClanCatalog]);

    const filteredOpenClans = clanSearchTerm.trim() ? visibleOpenClans : browseOpenClans;

    const handleClanAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            try {
                const compressedLogo = await compressImageFile(event.target.files[0], {
                    maxWidth: 180,
                    maxHeight: 180,
                    maxLength: 280000
                });
                console.log('[CLAN AVATAR] Generated base64, length:', compressedLogo.length);
                setNewClanAvatar(compressedLogo);
            } catch (error: any) {
                alert(error?.message || 'Не удалось обработать логотип клана.');
            } finally {
                event.target.value = '';
            }
        }
    };

    const handleOpenClanSettings = async () => {
        if (onLoadClanSettingsDoc && (currentClan?.id || playerClanId)) {
            const data = await onLoadClanSettingsDoc(currentClan?.id || playerClanId!);
            if (data) {
                setClanSettings(prev => ({
                    ...prev,
                    ...data
                }));
            }
        }
        setShowClanSettings(true);
    };

    const handleSaveSettings = async () => {
        await onSaveClanSettings(clanSettings, newClanAvatar);
        setShowClanSettings(false);
        setNewClanAvatar(null);
    };

    const handleCreate = async () => {
        if (!newClanName.trim()) {
            alert('Введите название клана!');
            return;
        }
        if (newClanDesc.length > 500) {
            alert('Описание слишком длинное! Максимум 500 символов.');
            return;
        }
        await onCreateClan(newClanName.trim(), newClanDesc, newClanAvatar);
        setShowCreateClanMode(false);
        setNewClanName('');
        setNewClanDesc('');
        setNewClanAvatar(null);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            {isInClan ? (
                <div>
                    {/* Header with buttons */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            {/* Clan image - large */}
                            {currentClan?.avatarUrl ? (
                                <img src={currentClan.avatarUrl} className="w-32 h-32 rounded-lg border-2 border-yellow-500 object-cover" />
                            ) : (
                                <div className="w-32 h-32 rounded-lg border-2 border-yellow-500 bg-gray-700 flex items-center justify-center">
                                    <ClanIcon className="w-20 h-20 text-yellow-500" />
                                </div>
                            )}

                            {/* Clan info */}
                            <div className="flex-1">
                                {(() => {
                                    const clan = currentClan;
                                    const clanCastle = placedBuildings.find(b =>
                                        BANDIT_CASTLE_IDS.has(Number(b.buildingId)) &&
                                        b.ownerId === clan?.leaderUid
                                    );
                                    const clanBank = clanCastle?.bank || 0;

                                    return (
                                        <>
                                            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Клан {clan?.name}</h2>
                                            <p className="text-sm text-gray-300">
                                                В клане {clanMembers.length} человек, {clanMembers.length * 100 || 0} славы
                                            </p>
                                            <p className="text-sm text-gray-300 mt-1">
                                                Лидер: <span className="text-white font-bold">{clan?.leaderName}</span>
                                            </p>
                                            <p className="text-sm text-gray-300 mt-1">
                                                Заработано <span className="text-yellow-400 font-bold">{clanBank.toLocaleString()}</span> монет
                                            </p>
                                            <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">Добавить место в банде</button>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Right buttons */}
                        <div className="flex flex-col gap-2">
                            {currentClan?.leaderUid === user?.uid && (
                                <button onClick={handleOpenClanSettings} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded">
                                    Редактировать
                                </button>
                            )}
                            <button onClick={() => setShowLeaveClanConfirmation(true)} className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
                                Покинуть банду
                            </button>
                        </div>
                    </div>

                    {/* Clan description */}
                    <div className="text-center text-gray-400 italic mb-4 py-2 border-t border-b border-gray-700">
                        "{currentClan?.description || 'Добро пожаловать в команду!'}"
                    </div>

                    {/* Members table header */}
                    <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-800/50 rounded-t-lg text-sm font-bold text-gray-300">
                        <div>Игрок</div>
                        <div className="text-center">Монеты</div>
                        <div className="text-center">Опыт</div>
                        <div className="text-right">Ранг</div>
                    </div>

                    {/* Members list */}
                    <div className="space-y-1">
                        {clanMembers.length > 0 ? clanMembers.map((member: any) => (
                            <div key={member.uid} className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 items-center">
                                {/* Player name */}
                                <div className="flex items-center gap-2">
                                    {member.avatar ? (
                                        <img src={member.avatar} className="w-8 h-8 rounded-full border-2 border-blue-500 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs">
                                            {member.level || 1}
                                        </div>
                                    )}
                                    <span className="text-white font-bold">{member.name}</span>
                                </div>

                                {/* Coins */}
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-yellow-400">💰</span>
                                    <span className="text-yellow-400 font-bold">+{(member.coinsEarned || 0).toLocaleString()}</span>
                                </div>

                                {/* XP */}
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-red-400">XP</span>
                                    <span className="text-red-400 font-bold">+{(member.xpEarned || 0).toLocaleString()}</span>
                                </div>

                                {/* Stars */}
                                <div
                                    className="flex justify-end gap-0.5"
                                    onMouseLeave={() => setHoveredStar(null)}
                                >
                                    {[1, 2, 3, 4, 5].map(star => {
                                        const isLeader = currentClan?.leaderUid === user?.uid;
                                        const canGrantStars = isLeader ||
                                            (allUsers[user?.uid || '']?.level || 0) >= clanSettings.starGrantPermissionLevel;
                                        const isHovered = hoveredStar?.uid === member.uid && hoveredStar.level >= star;
                                        const isActive = member.rank >= star;

                                        return (
                                            <span
                                                key={star}
                                                className={`text-2xl cursor-pointer transition-all ${
                                                    isActive ? 'text-yellow-400' :
                                                    isHovered ? 'text-yellow-300 scale-125' :
                                                    'text-gray-600'
                                                } ${canGrantStars ? 'hover:text-yellow-300' : ''}`}
                                                onMouseEnter={() => canGrantStars && setHoveredStar({ uid: member.uid, level: star })}
                                                onClick={() => {
                                                    if (canGrantStars) {
                                                        const newRank = star === member.rank ? star - 1 : star;
                                                        onUpdateMemberPermissions(
                                                            member.uid,
                                                            allUsers[member.uid]?.clanPermissions?.canInvite || false,
                                                            allUsers[member.uid]?.clanPermissions?.canGrantStars || false,
                                                            newRank
                                                        );
                                                    }
                                                }}
                                            >
                                                ★
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )) : (
                            // Show leader as fallback
                            <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-900/50 hover:bg-gray-800/50 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center text-white font-bold text-xs">
                                        {allUsers[currentClan?.leaderUid || '']?.level || 1}
                                    </div>
                                    <span className="text-white font-bold">{currentClan?.leaderName}</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-yellow-400">💰</span>
                                    <span className="text-yellow-400 font-bold">+0</span>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-red-400">XP</span>
                                    <span className="text-red-400 font-bold">+0</span>
                                </div>
                                <div className="flex justify-end gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span key={star} className="text-lg text-yellow-400">★</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leave clan confirmation */}
                    {showLeaveClanConfirmation && (
                        <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                            <p className="text-red-400 font-bold mb-3">Вы уверены, что хотите покинуть банду?</p>
                            <div className="flex gap-2">
                                <button onClick={onConfirmLeaveClan} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded text-sm">
                                    Да, выйти
                                </button>
                                <button onClick={() => setShowLeaveClanConfirmation(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded text-sm">
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Clan Settings Modal */}
                    {showClanSettings && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => { setShowClanSettings(false); setNewClanAvatar(null); }}>
                            <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black rounded-2xl border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-white animate-scale-up" onClick={e => e.stopPropagation()}>
                                {/* Header */}
                                <div className="p-5 border-b border-purple-500/30 bg-purple-950/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xl">⚙️</span>
                                        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                            Настройки клана
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => { setShowClanSettings(false); setNewClanAvatar(null); }}
                                        className="w-9 h-9 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    {/* Clan Avatar */}
                                    <div className="mb-6 bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">Изображение клана</label>
                                        <div className="flex items-center gap-4">
                                            {newClanAvatar || currentClan?.avatarUrl ? (
                                                <img src={newClanAvatar || currentClan!.avatarUrl!} className="w-20 h-20 rounded-xl border border-purple-400/50 object-cover shadow-inner" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl border border-purple-500/40 bg-black/40 flex items-center justify-center">
                                                    <ClanIcon className="w-10 h-10 text-purple-400" />
                                                </div>
                                            )}
                                            <div>
                                                <input type="file" id="clanAvatarSettings" className="hidden" accept="image/*" onChange={handleClanAvatarChange} />
                                                <label htmlFor="clanAvatarSettings" className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md border border-purple-400/30 transition-all inline-block">
                                                    Загрузить новое
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clan Description */}
                                    <div className="mb-6 bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Описание клана</label>
                                        <textarea
                                            value={currentClan?.description || ''}
                                            onChange={(e) => onUpdateClanDescription(e.target.value.slice(0, 500))}
                                            className="w-full bg-black/60 border border-purple-500/30 rounded-xl p-3 text-white text-sm h-24 resize-none focus:border-purple-400 focus:outline-none"
                                            maxLength={500}
                                        />
                                    </div>

                                    {/* Clan Access */}
                                    <div className="mb-6 space-y-2 bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Доступ к клану</h3>
                                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-purple-500/10">
                                            <div>
                                                <p className="text-white font-bold text-sm">{clanSettings.isPublic ? 'Клан открыт' : 'Клан закрыт'}</p>
                                                <p className="text-xs text-purple-300/70">{clanSettings.isPublic ? 'Любой игрок может вступить' : 'Вступление только по приглашению'}</p>
                                            </div>
                                            <button
                                                onClick={() => setClanSettings(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                                                className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all ${clanSettings.isPublic ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border border-emerald-400/30' : 'bg-gradient-to-r from-rose-800 to-red-900 hover:from-rose-700 hover:to-red-800 border border-rose-500/30'} text-white`}
                                            >
                                                {clanSettings.isPublic ? 'Закрыть' : 'Открыть'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Permissions */}
                                    <div className="mb-6 space-y-3 bg-gray-900/60 p-4 rounded-xl border border-purple-500/20 shadow-md">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">Права участников</h3>
                                        <div className="bg-black/40 p-3 rounded-xl border border-purple-500/10">
                                            <label className="block text-xs font-medium text-purple-300/80 mb-1.5">Уровень для приглашения в клан</label>
                                            <select
                                                value={clanSettings.invitePermissionLevel}
                                                onChange={(e) => setClanSettings(prev => ({ ...prev, invitePermissionLevel: Number(e.target.value) }))}
                                                className="w-full bg-gray-900 border border-purple-500/30 rounded-xl p-2 text-white text-xs focus:border-purple-400 focus:outline-none"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                                    <option key={level} value={level}>{level} уровень</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="bg-black/40 p-3 rounded-xl border border-purple-500/10">
                                            <label className="block text-xs font-medium text-purple-300/80 mb-1.5">Уровень для выдачи звезд</label>
                                            <select
                                                value={clanSettings.starGrantPermissionLevel}
                                                onChange={(e) => setClanSettings(prev => ({ ...prev, starGrantPermissionLevel: Number(e.target.value) }))}
                                                className="w-full bg-gray-900 border border-purple-500/30 rounded-xl p-2 text-white text-xs focus:border-purple-400 focus:outline-none"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                                    <option key={level} value={level}>{level} уровень</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-4">
                                        <button onClick={handleSaveSettings} className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3 rounded-xl text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all">
                                            Сохранить
                                        </button>
                                        <button onClick={() => { setShowClanSettings(false); setNewClanAvatar(null); }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold py-3 rounded-xl text-xs border border-white/10 transition-all">
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : showCreateClanMode ? (
                <div className="max-w-md mx-auto h-full flex flex-col">
                    <button onClick={() => setShowCreateClanMode(false)} className="text-sm text-blue-400 hover:text-blue-300 mb-4 text-left">
                        Назад к поиску
                    </button>
                    <h3 className="text-xl font-bold text-white mb-4 text-center">Создание клана</h3>

                    <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                            <input type="file" id="clanAvatar" className="hidden" accept="image/*" onChange={handleClanAvatarChange} />
                            <label htmlFor="clanAvatar" className="cursor-pointer group">
                                <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-gray-600 overflow-hidden group-hover:border-blue-500 transition-all">
                                    {newClanAvatar ? (
                                        <img src={newClanAvatar} alt="Clan Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-gray-400 text-center px-2">Загрузить лого</span>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Название клана</label>
                            <input
                                type="text"
                                value={newClanName}
                                onChange={(e) => setNewClanName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                placeholder="Например: Неудержимые"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Описание (макс 500 символов)</label>
                            <textarea
                                value={newClanDesc}
                                onChange={(e) => setNewClanDesc(e.target.value.slice(0, 500))}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white h-24 resize-none"
                                placeholder="Расскажите о своем клане..."
                            />
                            <div className="text-right text-xs text-gray-500">{newClanDesc.length}/500</div>
                        </div>
                        <button onClick={handleCreate} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                            Создать клан
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex mb-6 space-x-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Поиск клана</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={clanSearchTerm}
                                    onChange={(e) => setClanSearchTerm(e.target.value)}
                                    placeholder="Название клана..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-10 pr-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {hasClanCastle && (
                        <button
                            onClick={() => setShowCreateClanMode(true)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded mb-6 flex items-center justify-center"
                        >
                            <span className="mr-2">+</span> Создать свой клан
                        </button>
                    )}

                    {!clanSearchTerm.trim() && recommendedClans.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-300 mb-2">Рекомендуемые кланы</h3>
                            <div className="space-y-2">
                                {recommendedClans.map(clan => (
                                    <div key={`recommended-${clan.id}`} className="bg-blue-900/20 p-3 rounded flex items-center justify-between border border-blue-700/40">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {clan.avatarUrl ? <img src={clan.avatarUrl} className="w-full h-full object-cover" /> : <ClanIcon className="w-6 h-6 text-gray-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{clan.name}</p>
                                                <p className="text-xs text-gray-300">Лидер: {clan.leaderName} | Людей: {(clan as any).membersCount || 0}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => onJoinClan(Number(clan.id))} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-3 rounded">
                                            Вступить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-300 mb-2">
                        {clanSearchTerm.trim() ? 'Результаты поиска' : 'Открытые кланы'}
                    </h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                        {isClanDirectoryLoading ? (
                            <p className="text-gray-400 text-center mt-4">Загрузка кланов...</p>
                        ) : filteredOpenClans.length > 0 ? (
                            filteredOpenClans.map(clan => (
                                <div key={clan.id} className="bg-gray-700/50 p-3 rounded flex items-center justify-between border border-gray-600">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {clan.avatarUrl ? <img src={clan.avatarUrl} className="w-full h-full object-cover" /> : <ClanIcon className="w-6 h-6 text-gray-500" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{clan.name}</p>
                                            <p className="text-xs text-gray-400">Лидер: {clan.leaderName} | Людей: {(clan as any).membersCount || 0}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => onJoinClan(Number(clan.id))} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded">
                                        Вступить
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center mt-4">
                                {clanSearchTerm.trim() ? 'Кланы не найдены.' : 'Пока нет открытых кланов.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
