import React, { useState, memo } from 'react';
import { CloseIcon } from '../../../components/IconComponents';

export interface PoliceMoralsModalProps {
    isOpen: boolean;
    onClose: () => void;
    hasPoliceStation: boolean;
    policeBadgeImageUrl: string;
    sheriffId: string | null;
    sheriffName: string | null;
    policeElectionEndTime: number;
    policeCandidates: Record<string, { votes: number; bank: number }>;
    allUsers: Record<string, any>;
    deputies: string[];
    firstElectionCompleted: boolean;
    onOpenPoliceElectionsTab: () => void;
}

export interface PoliceVotingModalProps {
    isOpen: boolean;
    votingForPlayer: string | null;
    onClose: () => void;
    playerGold: number;
    playerEnergy: number;
    allUsers: Record<string, any>;
    onVote: (candidateUid: string, count: number) => Promise<void> | void;
}

const PoliceMoralsModalComponent: React.FC<PoliceMoralsModalProps> = ({
    isOpen,
    onClose,
    hasPoliceStation,
    policeBadgeImageUrl,
    sheriffId,
    sheriffName,
    policeElectionEndTime,
    policeCandidates,
    allUsers,
    deputies,
    firstElectionCompleted,
    onOpenPoliceElectionsTab
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gradient-to-b from-blue-900 to-blue-950 p-4 rounded-lg shadow-2xl w-full max-w-md border-2 border-blue-500 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-blue-700">
                    <h2 className="text-xl font-bold text-blue-200 flex items-center gap-2">
                        <img src={policeBadgeImageUrl} alt="Badge" className="w-6 h-6" />
                        Полиция нравов
                    </h2>
                    <button onClick={onClose} className="text-blue-400 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>

                {!hasPoliceStation ? (
                    <div className="bg-black/30 p-4 rounded-lg">
                        <div className="text-center">
                            <img 
                                src={policeBadgeImageUrl} 
                                alt="Police Badge" 
                                className="w-20 h-20 mx-auto mb-4 opacity-50"
                            />
                            <p className="text-gray-300 mb-2">Для участия в выборах полиции постройте полицейский участок.</p>
                            <p className="text-xs text-gray-500">ID здания: 308</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Current Sheriff */}
                        <div className="bg-black/30 p-3 rounded-lg">
                            <h3 className="text-blue-300 font-bold mb-2">Текущий шериф</h3>
                            {sheriffId ? (
                                <div className="flex items-center gap-3">
                                    <img src="/last_appx/polise/16.webp" alt="Sheriff" className="w-12 h-12 rounded border-2 border-blue-500" />
                                    <div>
                                        <p className="text-white font-bold">{sheriffName || "Шериф"}</p>
                                        <p className="text-xs text-gray-400">Защитник города</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-yellow-400 text-sm">В городе еще нет шерифа. Постройте полицейский участок, чтобы выдвинуть свою кандидатуру на пост шерифа.</p>
                            )}
                        </div>

                        {/* Election Timer */}
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

                        {/* Deputies */}
                        {deputies.length > 0 && (
                            <div className="bg-black/30 p-3 rounded-lg">
                                <h3 className="text-blue-300 font-bold mb-2">Помощники шерифа ({deputies.length}/6)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {deputies.map(depUid => {
                                        const depInfo = allUsers[depUid];
                                        return (
                                            <div key={depUid} className="bg-blue-800/50 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                                                <img src="/last_appx/polise/16.webp" alt="Deputy" className="w-4 h-4" />
                                                {depInfo?.name || "Игрок"}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Open Profile Button */}
                        <button
                            onClick={onOpenPoliceElectionsTab}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                        >
                            Открыть выборы в полицию
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PoliceMoralsModal = memo(PoliceMoralsModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.hasPoliceStation !== next.hasPoliceStation) return false;
    if (prev.sheriffId !== next.sheriffId || prev.sheriffName !== next.sheriffName) return false;
    if (prev.policeElectionEndTime !== next.policeElectionEndTime) return false;
    if (prev.policeCandidates !== next.policeCandidates) return false;
    if (prev.allUsers !== next.allUsers) return false;
    if (prev.deputies !== next.deputies) return false;
    return true;
});

const PoliceVotingModalComponent: React.FC<PoliceVotingModalProps> = ({
    isOpen,
    votingForPlayer,
    onClose,
    playerGold,
    playerEnergy,
    allUsers,
    onVote
}) => {
    const [policeVoteCount, setPoliceVoteCount] = useState(1);

    if (!isOpen || !votingForPlayer) return null;

    const handleVote = async () => {
        const totalCost = policeVoteCount * 1000;
        const energyCost = policeVoteCount * 100;
        if (playerGold >= totalCost && playerEnergy >= energyCost) {
            await onVote(votingForPlayer, policeVoteCount);
            setPoliceVoteCount(1);
        } else {
            alert('Недостаточно ресурсов!');
        }
    };

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gradient-to-b from-blue-900 to-blue-950 p-6 rounded-lg shadow-2xl w-full max-w-sm border-2 border-blue-500 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-blue-700">
                    <h2 className="text-xl font-bold text-white">Голосование за кандидата</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-7 h-7" />
                    </button>
                </div>
    
                <div className="text-center mb-4">
                    <p className="text-gray-300 mb-1">Вы голосуете за:</p>
                    <p className="text-xl font-bold text-blue-300">{allUsers[votingForPlayer]?.name || 'Игрок'}</p>
                </div>
    
                <div className="bg-black/30 p-3 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Количество голосов:</span>
                        <span className="text-blue-300 font-bold">{policeVoteCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPoliceVoteCount(prev => Math.max(1, prev - 1))}
                            className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-lg text-white font-bold text-xl"
                        >
                            -
                        </button>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={policeVoteCount}
                            onChange={(e) => setPoliceVoteCount(parseInt(e.target.value) || 1)}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <button
                            onClick={() => setPoliceVoteCount(prev => Math.min(100, prev + 1))}
                            className="w-10 h-10 bg-blue-700 hover:bg-blue-600 rounded-lg text-white font-bold text-xl"
                        >
                            +
                        </button>
                    </div>
                </div>
    
                <div className="bg-black/30 p-3 rounded-lg mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-300">Стоимость одного голоса:</span>
                        <span className="text-yellow-400">1,000 монет + 100 энергии</span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span className="text-white">Итого монет:</span>
                        <span className={playerGold >= policeVoteCount * 1000 ? "text-yellow-400" : "text-red-400"}>
                            {(policeVoteCount * 1000).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between font-bold">
                        <span className="text-white">Энергия:</span>
                        <span className={playerEnergy >= policeVoteCount * 100 ? "text-blue-400" : "text-red-400"}>
                            {policeVoteCount * 100}
                        </span>
                    </div>
                </div>
    
                <button
                    onClick={handleVote}
                    disabled={playerGold < policeVoteCount * 1000 || playerEnergy < policeVoteCount * 100}
                    className={`w-full py-2 rounded-lg font-bold ${playerGold >= policeVoteCount * 1000 && playerEnergy >= policeVoteCount * 100 ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                    Голосовать
                </button>
    
                <p className="text-xs text-gray-400 text-center mt-2">
                    Если ваш кандидат победит, вам вернется 80% вложений!
                </p>
            </div>
        </div>
    );
};

export const PoliceVotingModal = memo(PoliceVotingModalComponent, (prev, next) => {
    if (!prev.isOpen && !next.isOpen) return true;
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.votingForPlayer !== next.votingForPlayer) return false;
    if (prev.playerGold !== next.playerGold) return false;
    if (prev.playerEnergy !== next.playerEnergy) return false;
    if (prev.allUsers !== next.allUsers) return false;
    return true;
});
