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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gradient-to-b from-amber-900 to-amber-950 p-4 rounded-lg shadow-2xl w-full max-w-md border-2 border-yellow-600 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-yellow-700">
                    <h2 className="text-xl font-bold text-yellow-200 flex items-center font-serif">
                        👑 Королевские выборы
                    </h2>
                    <button onClick={onClose} className="text-yellow-400 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Current King/Queen Display */}
                {(kingId || queenId) && (
                    <div className="mb-4 bg-gradient-to-r from-yellow-900/50 to-amber-900/50 p-3 rounded-lg border border-yellow-600">
                        <h3 className="text-yellow-200 font-bold text-center mb-2">Текущие правители</h3>
                        <div className="flex justify-center gap-4">
                            {kingId && (
                                <div className="text-center">
                                    <div className="text-2xl mb-1">🤴</div>
                                    <div className="text-blue-300 font-bold">{kingName || 'Король'}</div>
                                    <div className="text-xs text-gray-400">Король</div>
                                </div>
                            )}
                            {queenId && (
                                <div className="text-center">
                                    <div className="text-2xl mb-1">👸</div>
                                    <div className="text-pink-300 font-bold">{queenName || 'Королева'}</div>
                                    <div className="text-xs text-gray-400">Королева</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex mb-4 gap-2">
                    <button
                        onClick={() => setRoyalElectionsTab('queen')}
                        className={`flex-1 py-2 px-4 rounded-t-lg font-bold transition-all ${royalElectionsTab === 'queen' ? 'bg-pink-600 text-white border-b-2 border-pink-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        👸 Королева
                    </button>
                    <button
                        onClick={() => setRoyalElectionsTab('king')}
                        className={`flex-1 py-2 px-4 rounded-t-lg font-bold transition-all ${royalElectionsTab === 'king' ? 'bg-blue-600 text-white border-b-2 border-blue-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        🤴 Король
                    </button>
                </div>

                {/* Crown and Title */}
                <div className="flex items-center gap-4 mb-4 bg-black/30 p-3 rounded-lg">
                    <img
                        src={royalElectionsTab === 'queen' ? royalQueenCrownImageUrl : royalKingCrownImageUrl}
                        alt="Crown"
                        className="w-16 h-16 object-contain"
                    />
                    <div className="flex-1">
                        <p className="text-yellow-100 font-serif text-lg">
                            {royalElectionsTab === 'queen' ? 'Королева' : 'Король'} мира еще не объявлен{royalElectionsTab === 'queen' ? 'а' : ''}
                        </p>
                        <p className="text-gray-300 text-sm mt-1">
                            {(() => {
                                if (royalElectionEndTime > 0) {
                                    const timeLeft = Math.max(0, royalElectionEndTime - Date.now());
                                    if (timeLeft > 0) {
                                        const days = Math.floor(timeLeft / 86400000);
                                        const hours = Math.floor((timeLeft % 86400000) / 3600000);
                                        const minutes = Math.floor((timeLeft % 3600000) / 60000);
                                        if (days > 0) {
                                            return <>До коронации осталось: <span className="text-yellow-400 font-bold">{days}д {hours}ч</span></>;
                                        } else {
                                            return <>До коронации осталось: <span className="text-yellow-400 font-bold">{hours}ч {minutes}м</span></>;
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
                <div className="bg-black/30 p-3 rounded-lg mb-4 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Собрано:</span>
                        <span className="text-yellow-400 font-bold">{royalVotesTotal.toLocaleString()} монет</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-300">Максимальный банк ставок:</span>
                        <span className="text-yellow-400 font-bold">1,000,000,000</span>
                    </div>
                </div>

                {/* Candidates List */}
                <div className="bg-black/30 p-3 rounded-lg">
                    <h3 className="text-yellow-200 font-bold mb-2 font-serif">Список претендентов на трон</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
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
                                return <p className="text-gray-400 text-sm text-center py-4">Пока никто не голосовал</p>;
                            }

                            return filteredCandidates.map(([uid, votes], index) => {
                                const playerInfo = allUsers[uid];
                                return (
                                    <div
                                        key={uid}
                                        className={`flex items-center justify-between p-2 rounded ${uid === user?.uid ? 'bg-yellow-900/50 border border-yellow-500' : 'bg-gray-800/50'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold w-6 ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                {index + 1}.
                                            </span>
                                            <span className="text-white">{playerInfo?.name || 'Неизвестный'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <img src={coinImageUrl} alt="coin" className="w-4 h-4" />
                                            <span className="text-yellow-300 font-bold">{votes.toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Buffs Info */}
                <div className="mt-4 bg-black/30 p-3 rounded-lg">
                    <h3 className="text-yellow-200 font-bold mb-2 font-serif">Привилегии {royalElectionsTab === 'queen' ? 'королевы' : 'короля'}:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
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
                        <p className="text-red-400 text-xs mt-2 font-bold">⚠️ Вы не можете стать королем/королевой, так как состоите в полиции!</p>
                    )}
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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[60] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gradient-to-b from-amber-900 to-amber-950 p-4 rounded-lg shadow-2xl w-full max-w-sm border-2 border-yellow-600 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-yellow-700">
                    <h2 className="text-lg font-bold text-yellow-200 font-serif">Голосование за короля</h2>
                    <button onClick={onClose} className="text-yellow-400 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Crown */}
                <div className="flex justify-center mb-4">
                    <img src={royalKingCrownImageUrl} alt="Crown" className="w-20 h-20 object-contain" />
                </div>

                {/* Player Info */}
                <div className="bg-black/30 p-3 rounded-lg mb-4 text-center">
                    <p className="text-gray-300 text-sm mb-2">Вы голосуете за</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden border-2 border-blue-400">
                            {allUsers[votingForPlayer]?.avatar ? (
                                <img src={allUsers[votingForPlayer].avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-white">{allUsers[votingForPlayer]?.name?.charAt(0) || '?'}</span>
                            )}
                        </div>
                        <span className="text-white font-bold text-lg">{allUsers[votingForPlayer]?.name || "Игрок"}</span>
                    </div>
                </div>

                {/* Vote Count */}
                <div className="bg-black/30 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Количество голосов:</span>
                        <span className="text-yellow-400 font-bold">{voteCount} <span className="text-gray-400 text-sm">(макс 1255)</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setVoteCount(prev => Math.max(1, prev - 1))}
                            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-xl"
                        >-</button>
                        <input
                            type="range"
                            min="1"
                            max="1255"
                            value={voteCount}
                            onChange={(e) => setVoteCount(parseInt(e.target.value) || 1)}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <button
                            onClick={() => setVoteCount(prev => Math.min(1255, prev + 1))}
                            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-xl"
                        >+</button>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1</span>
                        <span className="text-yellow-400">{voteCount} × 800 = {(voteCount * 800).toLocaleString()} монет</span>
                        <span>1255</span>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-black/30 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-300">
                        Если он победит, вы получите монеты назад (80%) и бонус в зависимости от вашего вклада в победу!
                    </p>
                </div>

                {/* Vote Button */}
                <button
                    onClick={handleVote}
                    disabled={playerGold < voteCount * 800 || playerEnergy < voteCount * 2}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    <span className="flex items-center gap-1"><span className="text-yellow-400">⚡</span> {voteCount * 2}</span>
                    <span className="flex items-center gap-1"><img src={coinImageUrl} alt="coin" className="w-5 h-5" /> {(voteCount * 800).toLocaleString()}</span>
                    <span>Сделать ставку</span>
                </button>
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
