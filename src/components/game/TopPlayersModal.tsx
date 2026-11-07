import React, { memo } from 'react';
import { CloseIcon, UserIcon } from '../../../components/IconComponents';
import {
    TOP_PLAYERS_TABS,
    TOP_PLAYERS_LABEL_BY_TAB
} from '../../game/leaderboard/leaderboardLogic.js';

export type TopPlayersTab = 'glory' | 'trees' | 'monsters' | 'buildings' | 'theft';

export interface TopPlayerItem {
    uid: string;
    name: string;
    avatar?: string | null;
    [key: string]: any;
}

export interface TopPlayersModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: TopPlayersTab;
    onTabChange: (tab: TopPlayersTab) => void;
    leaderboardLoading: boolean;
    leaderboardError: string | null;
    hasData: boolean;
    players: TopPlayerItem[];
    currentUserId?: string;
    getValue: (player: TopPlayerItem, tab: TopPlayersTab) => number | string;
    guiMenuTopImageUrl?: string;
}

export const TopPlayersModal: React.FC<TopPlayersModalProps> = memo(({
    isOpen,
    onClose,
    activeTab,
    onTabChange,
    leaderboardLoading,
    leaderboardError,
    hasData,
    players,
    currentUserId,
    getValue,
    guiMenuTopImageUrl = '/Gui/GUI_Menu/основеное меню/топ/topbottom1.webp'
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md bg-gradient-to-b from-gray-900 via-gray-950 to-black border-2 border-purple-500/50 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-white animate-scale-up" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-purple-500/30 bg-purple-950/30 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                            <img src={guiMenuTopImageUrl} alt="Top" className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200">
                                Топ игроков
                            </h2>
                            <p className="text-[11px] text-purple-300/70">
                                Зал славы и рейтинг игроков сервера
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

                <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden">
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {TOP_PLAYERS_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id as TopPlayersTab)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    activeTab === tab.id
                                        ? 'bg-purple-600/40 text-purple-200 border border-purple-400/50 shadow-md'
                                        : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[50vh]">
                        {leaderboardLoading && hasData ? (
                            <div className="py-4 text-center text-purple-300/70 font-medium text-xs">
                                Повторная загрузка...
                            </div>
                        ) : leaderboardLoading ? (
                            <div className="py-8 text-center text-purple-200 font-medium text-xs animate-pulse">
                                Загрузка рейтинга игроков...
                            </div>
                        ) : leaderboardError && !hasData ? (
                            <div className="py-8 text-center text-rose-300 font-medium text-xs">
                                Не удалось загрузить топ игроков
                            </div>
                        ) : !hasData ? (
                            <div className="py-8 text-center text-purple-300/60 font-medium text-xs">
                                Пока нет игроков в рейтинге
                            </div>
                        ) : (
                            players.map((u, index) => (
                                <div
                                    key={u.uid}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                        u.uid === currentUserId
                                            ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                                            : 'bg-gray-900/60 border-purple-500/20 hover:border-purple-500/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`text-sm font-black w-6 text-center ${
                                            index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-500' : 'text-purple-300/60'
                                        }`}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                                        </span>
                                        {u.avatar ? (
                                            <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-purple-500/40 flex-shrink-0" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                                                <UserIcon className="w-4 h-4 text-purple-300" />
                                            </div>
                                        )}
                                        <span className="text-white font-bold text-xs truncate">{u.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                        <span className="text-base">{TOP_PLAYERS_TABS.find(tab => tab.id === activeTab)?.icon}</span>
                                        <span className="text-yellow-300 font-extrabold text-xs">{getValue(u, activeTab)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-purple-500/20 text-center text-[11px] text-purple-300/70">
                        {TOP_PLAYERS_LABEL_BY_TAB[activeTab]}
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    if (!prevProps.isOpen && !nextProps.isOpen) return true;
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    return (
        prevProps.activeTab === nextProps.activeTab &&
        prevProps.leaderboardLoading === nextProps.leaderboardLoading &&
        prevProps.leaderboardError === nextProps.leaderboardError &&
        prevProps.hasData === nextProps.hasData &&
        prevProps.players === nextProps.players &&
        prevProps.currentUserId === nextProps.currentUserId
    );
});

TopPlayersModal.displayName = 'TopPlayersModal';
