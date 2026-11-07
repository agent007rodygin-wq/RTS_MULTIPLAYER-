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
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            <img src={policeBadgeImageUrl} alt="Badge" className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                Полиция нравов
                            </h2>
                            <p className="text-[11px] text-purple-300/70">
                                Охрана порядка и выборы шерифа
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
                    {!hasPoliceStation ? (
                        <div className="bg-purple-950/20 p-5 rounded-xl border border-purple-500/20 text-center">
                            <img 
                                src={policeBadgeImageUrl} 
                                alt="Police Badge" 
                                className="w-16 h-16 mx-auto mb-3 opacity-60 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                            />
                            <p className="text-purple-200 text-sm mb-1.5 font-semibold">Для участия в выборах полиции постройте полицейский участок.</p>
                            <p className="text-xs text-purple-300/60">ID здания: 308</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {/* Current Sheriff */}
                            <div className="bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 shadow-md">
                                <h3 className="text-purple-300 font-extrabold text-xs uppercase tracking-wider mb-2">Текущий шериф</h3>
                                {sheriffId ? (
                                    <div className="flex items-center gap-3">
                                        <img src="/last_appx/polise/16.webp" alt="Sheriff" className="w-12 h-12 rounded-xl border border-purple-400/50 shadow-inner" />
                                        <div>
                                            <p className="text-white font-black text-base">{sheriffName || "Шериф"}</p>
                                            <p className="text-xs text-purple-300/70">Защитник города</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-yellow-300/90 text-xs font-medium">В городе еще нет шерифа. Постройте полицейский участок, чтобы выдвинуть свою кандидатуру на пост шерифа.</p>
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
                                                <div className="bg-purple-950/40 p-3 rounded-xl border border-yellow-500/40">
                                                    <p className="text-yellow-300 text-xs font-bold flex items-center gap-1.5">
                                                        <span>⏳</span>
                                                        <span>До окончания выборов: {timeStr}</span>
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
                                        <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30">
                                            <p className="text-purple-300 text-xs font-bold flex items-center gap-1.5">
                                                <span>⏳</span>
                                                <span>До следующих выборов шерифа: {days}д {hours}ч</span>
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {/* Deputies */}
                            {deputies.length > 0 && (
                                <div className="bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 shadow-md">
                                    <h3 className="text-purple-300 font-extrabold text-xs uppercase tracking-wider mb-2">Помощники шерифа ({deputies.length}/6)</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {deputies.map(depUid => {
                                            const depInfo = allUsers[depUid];
                                            return (
                                                <div key={depUid} className="bg-purple-950/50 px-2.5 py-1 rounded-lg text-xs text-purple-200 border border-purple-500/30 flex items-center gap-1.5">
                                                    <img src="/last_appx/polise/16.webp" alt="Deputy" className="w-4 h-4 object-contain" />
                                                    <span className="font-semibold">{depInfo?.name || "Игрок"}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Open Profile Button */}
                            <button
                                onClick={onOpenPoliceElectionsTab}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-purple-900/40 border border-purple-400/40 text-xs transition-all"
                            >
                                🗳️ Открыть выборы в полицию
                            </button>
                        </div>
                    )}
                </div>
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
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <h2 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                        Голосование за кандидата
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-800 hover:bg-red-600/80 border border-white/10 hover:border-red-500 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200"
                    >
                        ✕
                    </button>
                </div>
    
                <div className="p-5">
                    <div className="text-center mb-4 bg-purple-950/30 p-3 rounded-xl border border-purple-500/20">
                        <p className="text-purple-300/80 text-xs mb-1">Вы голосуете за:</p>
                        <p className="text-lg font-black text-white">{allUsers[votingForPlayer]?.name || 'Игрок'}</p>
                    </div>
        
                    <div className="bg-gray-900/60 p-3.5 rounded-xl border border-purple-500/20 mb-4 shadow-md">
                        <div className="flex justify-between items-center mb-2 text-xs">
                            <span className="text-purple-300/80 font-medium">Количество голосов:</span>
                            <span className="text-purple-200 font-black text-sm">{policeVoteCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPoliceVoteCount(prev => Math.max(1, prev - 1))}
                                className="w-9 h-9 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all"
                            >
                                -
                            </button>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={policeVoteCount}
                                onChange={(e) => setPoliceVoteCount(parseInt(e.target.value) || 1)}
                                className="flex-1 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <button
                                onClick={() => setPoliceVoteCount(prev => Math.min(100, prev + 1))}
                                className="w-9 h-9 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 rounded-xl text-white font-bold text-lg flex items-center justify-center transition-all"
                            >
                                +
                            </button>
                        </div>
                    </div>
        
                    <div className="bg-black/40 p-3 rounded-xl mb-4 space-y-1.5 text-xs border border-purple-500/10">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Стоимость 1 голоса:</span>
                            <span className="text-yellow-400 font-semibold">1 000 💰 + 100 ⚡</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span className="text-gray-300">Итого монет:</span>
                            <span className={playerGold >= policeVoteCount * 1000 ? "text-yellow-400" : "text-rose-400"}>
                                {(policeVoteCount * 1000).toLocaleString()} 💰
                            </span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span className="text-gray-300">Итого энергии:</span>
                            <span className={playerEnergy >= policeVoteCount * 100 ? "text-blue-300" : "text-rose-400"}>
                                {policeVoteCount * 100} ⚡
                            </span>
                        </div>
                    </div>
        
                    <button
                        onClick={handleVote}
                        disabled={playerGold < policeVoteCount * 1000 || playerEnergy < policeVoteCount * 100}
                        className={`w-full py-3 rounded-xl font-black text-xs transition-all shadow-md ${
                            playerGold >= policeVoteCount * 1000 && playerEnergy >= policeVoteCount * 100
                                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40 shadow-purple-900/40'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Подтвердить голос
                    </button>
        
                    <p className="text-[10px] text-purple-300/60 text-center mt-2.5">
                        Если ваш кандидат победит, вам вернется 80% вложений!
                    </p>
                </div>
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
