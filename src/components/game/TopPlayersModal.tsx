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
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md border border-gray-600 relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <img src={guiMenuTopImageUrl} alt="Top" className="w-8 h-8 mr-3" />
                        Топ игроков
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {TOP_PLAYERS_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id as TopPlayersTab)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                    {leaderboardLoading && hasData ? (
                        <div className="py-2 text-center text-gray-400 font-medium">
                            Повторная загрузка...
                        </div>
                    ) : leaderboardLoading ? (
                        <div className="py-8 text-center text-gray-300 font-medium">
                            Загрузка топа...
                        </div>
                    ) : leaderboardError && !hasData ? (
                        <div className="py-8 text-center text-red-300 font-medium">
                            Не удалось загрузить топ игроков
                        </div>
                    ) : !hasData ? (
                        <div className="py-8 text-center text-gray-400 font-medium">
                            Пока нет игроков в рейтинге
                        </div>
                    ) : (
                        players.map((u, index) => (
                            <div
                                key={u.uid}
                                className={`flex items-center justify-between p-3 rounded-lg ${u.uid === currentUserId ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-700/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold w-8 ${index < 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                        {index === 0 ? '1.' : index === 1 ? '2.' : index === 2 ? '3.' : `${index + 1}.`}
                                    </span>
                                    {u.avatar ? (
                                        <img src={u.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-gray-500 flex-shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center flex-shrink-0">
                                            <UserIcon className="w-5 h-5 text-gray-300" />
                                        </div>
                                    )}
                                    <span className="text-white font-medium">{u.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{TOP_PLAYERS_TABS.find(tab => tab.id === activeTab)?.icon}</span>
                                    <span className="text-yellow-300 font-bold">{getValue(u, activeTab)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-4 text-center text-sm text-gray-400">
                    {TOP_PLAYERS_LABEL_BY_TAB[activeTab]}
                </div>
            </div>
        </div>
    );
});

TopPlayersModal.displayName = 'TopPlayersModal';
