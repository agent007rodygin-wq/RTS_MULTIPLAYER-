import React, { useState, memo } from 'react';
import { CloseIcon } from '../../../components/IconComponents';

export interface RoyalElectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    kingId: string | null;
    kingName: string | null;
    queenId: string | null;
    queenName: string | null;
    royalElectionEndTime: number;
    royalVotesTotal: number;
    royalCandidates: Record<string, number>;
    allUsers: Record<string, any>;
    user: { uid: string } | null;
    coinImageUrl: string;
    royalQueenCrownImageUrl: string;
    royalKingCrownImageUrl: string;
    sheriffId: string | null;
    deputies: string[];
}

export interface RoyalVotingModalProps {
    isOpen: boolean;
    votingForPlayer: string | null;
    onClose: () => void;
    playerGold: number;
    playerEnergy: number;
    allUsers: Record<string, any>;
    coinImageUrl: string;
    royalKingCrownImageUrl: string;
    sheriffId: string | null;
    deputies: string[];
    onVote: (candidateUid: string, voteCount: number) => void;
}

const RoyalElectionsModalComponent: React.FC<RoyalElectionsModalProps> = ({
    isOpen,
    onClose,
    kingId,
    kingName,
    queenId,
    queenName,
    royalElectionEndTime,
    royalVotesTotal,
    royalCandidates,
    allUsers,
    user,
    coinImageUrl,
    royalQueenCrownImageUrl,
    royalKingCrownImageUrl,
    sheriffId,
    deputies
}) => {
    const [royalElectionsTab, setRoyalElectionsTab] = useState<'queen' | 'king'>('queen');

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            👑
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                Королевские выборы
                            </h2>
                            <p className="text-[11px] text-purple-300/70">
                                Выборы монарха сервера и королевские привилегии
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

                <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 max-h-[80vh]">
                    {/* Current King/Queen Display */}
                    {(kingId || queenId) && (
                        <div className="mb-4 bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 shadow-md">
                            <h3 className="text-purple-300 font-extrabold text-xs uppercase tracking-wider text-center mb-2.5">Текущие правители</h3>
                            <div className="flex justify-center gap-6">
                                {kingId && (
                                    <div className="text-center">
                                        <div className="text-3xl mb-1 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.4)]">🤴</div>
                                        <div className="text-yellow-300 font-black text-sm">{kingName || 'Король'}</div>
                                        <div className="text-[10px] text-purple-300/70">Король</div>
                                    </div>
                                )}
                                {queenId && (
                                    <div className="text-center">
                                        <div className="text-3xl mb-1 filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)]">👸</div>
                                        <div className="text-pink-300 font-black text-sm">{queenName || 'Королева'}</div>
                                        <div className="text-[10px] text-purple-300/70">Королева</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex mb-4 gap-2">
                        <button
                            onClick={() => setRoyalElectionsTab('queen')}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${royalElectionsTab === 'queen' ? 'bg-purple-600/40 text-pink-200 border border-purple-400/50 shadow-md' : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'}`}
                        >
                            <span>👸</span> <span>Королева</span>
                        </button>
                        <button
                            onClick={() => setRoyalElectionsTab('king')}
                            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${royalElectionsTab === 'king' ? 'bg-purple-600/40 text-yellow-200 border border-purple-400/50 shadow-md' : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'}`}
                        >
                            <span>🤴</span> <span>Король</span>
                        </button>
                    </div>

                    {/* Crown and Title */}
                    <div className="flex items-center gap-3.5 mb-4 bg-purple-950/30 p-3.5 rounded-xl border border-purple-500/20">
                        <img
                            src={royalElectionsTab === 'queen' ? royalQueenCrownImageUrl : royalKingCrownImageUrl}
                            alt="Crown"
                            className="w-14 h-14 object-contain filter drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)]"
                        />
                        <div className="flex-1">
                            <p className="text-yellow-200 font-black text-sm">
                                {royalElectionsTab === 'queen' ? 'Королева' : 'Король'} мира еще не объявлен{royalElectionsTab === 'queen' ? 'а' : ''}
                            </p>
                            <p className="text-purple-300/80 text-xs mt-1">
                                {(() => {
                                    if (royalElectionEndTime > 0) {
                                        const timeLeft = Math.max(0, royalElectionEndTime - Date.now());
                                        if (timeLeft > 0) {
                                            const days = Math.floor(timeLeft / 86400000);
                                            const hours = Math.floor((timeLeft % 86400000) / 3600000);
                                            const minutes = Math.floor((timeLeft % 3600000) / 60000);
                                            if (days > 0) {
                                                return <>До коронации: <span className="text-yellow-400 font-bold">{days}д {hours}ч</span></>;
                                            } else {
                                                return <>До коронации: <span className="text-yellow-400 font-bold">{hours}ч {minutes}м</span></>;
                                            }
                                        } else {
                                            return <>Голосование завершено! <span className="text-yellow-400 font-bold">Идет подсчет...</span></>;
                                        }
                                    }
                                    return <>Следующие выборы: <span className="text-yellow-400 font-bold">скоро</span></>;
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-black/40 p-3 rounded-xl mb-4 space-y-1.5 text-xs border border-purple-500/10">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Собрано в банке:</span>
                            <span className="text-yellow-400 font-bold">{royalVotesTotal.toLocaleString()} монет</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Максимальный банк ставок:</span>
                            <span className="text-purple-300 font-bold">1,000,000,000</span>
                        </div>
                    </div>

                    {/* Candidates List */}
                    <div className="bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 shadow-md mb-4">
                        <h3 className="text-purple-300 font-extrabold text-xs uppercase tracking-wider mb-2">Список претендентов на трон</h3>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {(() => {
                                const filteredCandidates = Object.entries(royalCandidates)
                                    .filter(([uid]) => {
                                        const playerInfo = allUsers[uid];
                                        const playerGender = playerInfo?.gender;
                                        if (royalElectionsTab === 'queen') {
                                            return playerGender === 'female' || playerGender === null || playerGender === undefined;
                                        } else {
                                            return playerGender === 'male' || playerGender === null || playerGender === undefined;
                                        }
                                    })
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 10);

                                if (filteredCandidates.length === 0) {
                                    return <p className="text-purple-300/50 text-xs text-center py-4">Пока никто не голосовал</p>;
                                }

                                return filteredCandidates.map(([uid, votes], index) => {
                                    const playerInfo = allUsers[uid];
                                    return (
                                        <div
                                            key={uid}
                                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${uid === user?.uid ? 'bg-purple-950/60 border border-purple-400 shadow-sm' : 'bg-black/40 border border-purple-500/10'}`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`font-black w-5 text-center ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                    {index + 1}.
                                                </span>
                                                <span className="text-white font-semibold truncate">{playerInfo?.name || 'Неизвестный'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <img src={coinImageUrl} alt="coin" className="w-3.5 h-3.5 object-contain" />
                                                <span className="text-yellow-300 font-bold">{votes.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Buffs Info */}
                    <div className="bg-purple-950/20 p-3.5 rounded-xl border border-purple-500/20 text-xs">
                        <h3 className="text-yellow-300 font-bold mb-2">Привилегии {royalElectionsTab === 'queen' ? 'королевы' : 'короля'}:</h3>
                        <ul className="text-purple-200/80 space-y-1 list-disc list-inside">
                            <li>Пишут красным цветом в чате</li>
                            <li>Бесплатные крики и анонимные сообщения</li>
                            <li>Строительство и производство на 1% быстрее</li>
                            <li>Не платят налоги</li>
                            <li>1 иммунитет от сбития славы в день</li>
                            <li>1 помилование бана в день</li>
                            <li>Защита 1 здания на 2 часа в день</li>
                            <li>+1,000,000 к хранилищу монет</li>
                            <li>+50 жителей</li>
                            <li>+1% шанс супер ресурсов</li>
                        </ul>
                        {/* Warning for police members */}
                        {(sheriffId === user?.uid || deputies.includes(user?.uid || '')) && (
                            <p className="text-rose-400 text-xs mt-2 font-bold">⚠️ Вы не можете стать королем/королевой, так как состоите в полиции!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const RoyalElectionsModal = memo(RoyalElectionsModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.kingId !== next.kingId || prev.kingName !== next.kingName) return false;
    if (prev.queenId !== next.queenId || prev.queenName !== next.queenName) return false;
    if (prev.royalElectionEndTime !== next.royalElectionEndTime) return false;
    if (prev.royalVotesTotal !== next.royalVotesTotal) return false;
    if (prev.royalCandidates !== next.royalCandidates) return false;
    if (prev.allUsers !== next.allUsers) return false;
    if (prev.user?.uid !== next.user?.uid) return false;
    if (prev.coinImageUrl !== next.coinImageUrl) return false;
    if (prev.sheriffId !== next.sheriffId) return false;
    if (prev.deputies !== next.deputies) return false;
    return true;
});

const RoyalVotingModalComponent: React.FC<RoyalVotingModalProps> = ({
    isOpen,
    votingForPlayer,
    onClose,
    playerGold,
    playerEnergy,
    allUsers,
    coinImageUrl,
    royalKingCrownImageUrl,
    sheriffId,
    deputies,
    onVote
}) => {
    const [voteCount, setVoteCount] = useState(1);

    if (!isOpen || !votingForPlayer) return null;

    const handleVote = () => {
        const totalCost = voteCount * 800;
        const energyCost = voteCount * 2;
        if (playerGold >= totalCost && playerEnergy >= energyCost) {
            if (sheriffId === votingForPlayer || deputies.includes(votingForPlayer || '')) {
                alert('Вы не можете голосовать за этого игрока, так как он состоит в полиции!');
                return;
            }
            onVote(votingForPlayer, voteCount);
            setVoteCount(1);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60] backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                        Голосование за короля
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5">
                    {/* Crown */}
                    <div className="flex justify-center mb-3">
                        <img src={royalKingCrownImageUrl} alt="Crown" className="w-16 h-16 object-contain filter drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]" />
                    </div>

                    {/* Player Info */}
                    <div className="bg-purple-950/30 p-3 rounded-xl mb-4 text-center border border-purple-500/20">
                        <p className="text-purple-300/80 text-xs mb-1.5">Вы голосуете за:</p>
                        <div className="flex items-center justify-center gap-2.5">
                            <div className="w-10 h-10 rounded-full ring-2 ring-purple-400/80 ring-offset-2 ring-offset-black bg-purple-950/60 flex items-center justify-center overflow-hidden">
                                {allUsers[votingForPlayer]?.avatar ? (
                                    <img src={allUsers[votingForPlayer].avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-base font-bold text-white">{allUsers[votingForPlayer]?.name?.charAt(0) || '?'}</span>
                                )}
                            </div>
                            <span className="text-white font-extrabold text-base">{allUsers[votingForPlayer]?.name || "Игрок"}</span>
                        </div>
                    </div>

                    {/* Vote Count */}
                    <div className="bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 mb-4 shadow-md">
                        <div className="flex justify-between items-center mb-2 text-xs">
                            <span className="text-purple-300/80 font-medium">Количество голосов:</span>
                            <span className="text-yellow-300 font-black">{voteCount} <span className="text-purple-300/60 text-[10px]">(макс 1255)</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setVoteCount(prev => Math.max(1, prev - 1))}
                                className="w-9 h-9 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all"
                            >-</button>
                            <input
                                type="range"
                                min="1"
                                max="1255"
                                value={voteCount}
                                onChange={(e) => setVoteCount(parseInt(e.target.value) || 1)}
                                className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <button
                                onClick={() => setVoteCount(prev => Math.min(1255, prev + 1))}
                                className="w-9 h-9 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all"
                            >+</button>
                        </div>
                        <div className="flex justify-between text-[11px] text-purple-300/60 mt-2">
                            <span>1</span>
                            <span className="text-yellow-300 font-bold">{voteCount} × 800 = {(voteCount * 800).toLocaleString()} 💰</span>
                            <span>1255</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-black/40 p-2.5 rounded-xl mb-4 text-[11px] text-purple-300/80 border border-purple-500/10 text-center">
                        Если кандидат победит, вам вернется 80% монет + пропорциональный бонус!
                    </div>

                    {/* Vote Button */}
                    <button
                        onClick={handleVote}
                        disabled={playerGold < voteCount * 800 || playerEnergy < voteCount * 2}
                        className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/40 transition-all disabled:from-gray-800 disabled:to-gray-800 disabled:border-transparent disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xs"
                    >
                        <span className="flex items-center gap-1 font-bold"><span className="text-blue-300">⚡</span> {voteCount * 2}</span>
                        <span className="flex items-center gap-1 font-bold"><img src={coinImageUrl} alt="coin" className="w-4 h-4 object-contain" /> {(voteCount * 800).toLocaleString()}</span>
                        <span>Сделать ставку</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RoyalVotingModal = memo(RoyalVotingModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.votingForPlayer !== next.votingForPlayer) return false;
    if (prev.playerGold !== next.playerGold) return false;
    if (prev.playerEnergy !== next.playerEnergy) return false;
    if (prev.allUsers !== next.allUsers) return false;
    if (prev.coinImageUrl !== next.coinImageUrl) return false;
    return true;
});
