import React, { useState, useMemo } from 'react';
import {
    ACHIEVEMENTS_DATA,
    ACHIEVEMENT_TIERS_MAP,
    TOTAL_ACHIEVEMENT_TIERS,
    AchievementCategory,
    AchievementTier,
    getStatValue,
    checkTierCompletion
} from '../../game/achievements/achievementsData';

export interface AchievementsViewProps {
    isOwnProfile: boolean;
    playerName: string;
    playerAvatar?: string | null;
    completedAchievements: string[];
    claimedAchievements?: string[];
    selectedTitle?: string | null;
    stats?: any;
    percentages?: Record<string, number>;
    onClaimReward?: (tierId: string, rubies: number) => void;
    onClaimAllRewards?: () => void;
    onSelectTitle?: (title: string | null) => void;
    onBack?: () => void;
}

type CategoryFilter = 'all' | 'gathering' | 'wealth' | 'combat' | 'time' | 'social';

export const AchievementsView: React.FC<AchievementsViewProps> = ({
    isOwnProfile,
    playerName,
    playerAvatar,
    completedAchievements = [],
    claimedAchievements = [],
    selectedTitle = null,
    stats = {},
    percentages = {},
    onClaimReward,
    onClaimAllRewards,
    onSelectTitle,
    onBack
}) => {
    const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const completedSet = useMemo(() => new Set(completedAchievements || []), [completedAchievements]);
    const claimedSet = useMemo(() => new Set(claimedAchievements || []), [claimedAchievements]);

    // Calculate overall stats
    const totalCompleted = completedAchievements.length;
    const progressPercent = Math.min(100, Math.round((totalCompleted / TOTAL_ACHIEVEMENT_TIERS) * 100));

    // Calculate unclaimed rubies for own profile
    const unclaimedTiers = useMemo(() => {
        if (!isOwnProfile) return [];
        return completedAchievements
            .filter(id => !claimedSet.has(id))
            .map(id => ACHIEVEMENT_TIERS_MAP.get(id)?.tier)
            .filter((t): t is AchievementTier => Boolean(t));
    }, [isOwnProfile, completedAchievements, claimedSet]);

    const unclaimedRubiesTotal = unclaimedTiers.reduce((sum, t) => sum + (t?.rubies || 0), 0);

    // Filter categories
    const filteredCategories = useMemo(() => {
        return ACHIEVEMENTS_DATA.filter(category => {
            if (activeFilter !== 'all' && category.categoryGroup !== activeFilter) {
                return false;
            }
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchName = category.name.toLowerCase().includes(query);
                const matchDesc = category.description.toLowerCase().includes(query);
                const matchTiers = category.tiers.some(t => 
                    t.name.toLowerCase().includes(query) || 
                    t.prefix.toLowerCase().includes(query)
                );
                return matchName || matchDesc || matchTiers;
            }
            return true;
        });
    }, [activeFilter, searchQuery]);

    return (
        <div className="flex flex-col h-full text-white font-sans overflow-hidden">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white/5 border border-white/10 rounded-xl mb-3 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                            ← Назад
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        <div>
                            <div className="text-sm font-extrabold text-gray-100 flex items-center gap-2">
                                <span>{isOwnProfile ? 'Мои очивки' : `Очивки: ${playerName}`}</span>
                                {selectedTitle && (
                                    <span className="text-yellow-400 font-bold text-xs bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 rounded-full shadow-sm">
                                        [{selectedTitle}]
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-400">
                                Открыто <span className="text-green-400 font-bold">{totalCompleted}</span> из {TOTAL_ACHIEVEMENT_TIERS} ({progressPercent}%)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isOwnProfile && selectedTitle && onSelectTitle && (
                        <button
                            onClick={() => onSelectTitle(null)}
                            title="Снять текущий титул с ника"
                            className="text-xs text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 px-2 py-1 rounded transition-colors"
                        >
                            Снять титул
                        </button>
                    )}

                    {isOwnProfile && unclaimedTiers.length > 0 && onClaimAllRewards && (
                        <button
                            onClick={onClaimAllRewards}
                            className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-lg shadow-md animate-pulse transition-all flex items-center gap-1.5"
                        >
                            <span>💎</span> Забрать все (+{unclaimedRubiesTotal})
                        </button>
                    )}
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-gray-900/80 rounded-full h-2.5 mb-3 border border-white/10 overflow-hidden relative">
                <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                        { id: 'all', label: 'Все (15)' },
                        { id: 'gathering', label: '🌲 Ресурсы' },
                        { id: 'wealth', label: '💰 Богатство' },
                        { id: 'combat', label: '⚔️ Бой' },
                        { id: 'time', label: '⏳ Время' },
                        { id: 'social', label: '🤝 Социум' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveFilter(tab.id as CategoryFilter)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                activeFilter === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm border border-blue-400/50'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск очивок..."
                        className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 w-full sm:w-44 placeholder-gray-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1.5 text-xs text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 scrollbar-thin">
                {filteredCategories.map(category => {
                    const currentStat = getStatValue(category.statKey, stats);
                    
                    // Highest target in this category
                    const maxTarget = category.tiers[category.tiers.length - 1].target;
                    const catCompletedCount = category.tiers.filter(t => completedSet.has(t.id)).length;

                    return (
                        <div
                            key={category.id}
                            className="bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-white/10 rounded-xl p-3 shadow-md hover:border-white/20 transition-all"
                        >
                            {/* Category Header */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{category.icon}</span>
                                    <div>
                                        <div className="font-bold text-sm text-gray-100 flex items-center gap-2">
                                            <span>{category.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${
                                                catCompletedCount === 3
                                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                    : catCompletedCount > 0
                                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                                        : 'bg-white/5 text-gray-400'
                                            }`}>
                                                {catCompletedCount}/3
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-400">
                                            {category.description}
                                        </div>
                                    </div>
                                </div>

                                {isOwnProfile && (
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400">Прогресс: </span>
                                        <span className="text-xs font-bold text-amber-300">
                                            {category.statKey === 'pioneerRank'
                                                ? (currentStat > 0 ? `#${currentStat}` : '—')
                                                : `${currentStat.toLocaleString()} ${category.unit}`}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Tiers Grid (3 levels) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                {category.tiers.map(tier => {
                                    const isDone = completedSet.has(tier.id);
                                    const isClaimed = claimedSet.has(tier.id);
                                    const isEquipped = selectedTitle === tier.prefix;
                                    const globalPercent = typeof percentages[tier.id] === 'number'
                                        ? percentages[tier.id]
                                        : 0;

                                    return (
                                        <div
                                            key={tier.id}
                                            className={`rounded-lg p-2.5 border transition-all flex flex-col justify-between ${
                                                isDone
                                                    ? 'bg-gradient-to-b from-blue-950/40 to-indigo-950/30 border-blue-500/40 shadow-sm shadow-blue-500/10'
                                                    : 'bg-black/30 border-white/5 opacity-80'
                                            }`}
                                        >
                                            <div>
                                                {/* Tier Header */}
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-extrabold text-gray-300 flex items-center gap-1">
                                                        <span className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                                                            tier.tier === 1 ? 'bg-amber-800 text-amber-200' :
                                                            tier.tier === 2 ? 'bg-slate-400 text-slate-900' :
                                                            'bg-amber-400 text-amber-950'
                                                        }`}>
                                                            {tier.tier}
                                                        </span>
                                                        <span>{tier.name}</span>
                                                    </span>
                                                    {isDone ? (
                                                        <span className="text-green-400 font-bold text-[11px] flex items-center gap-0.5">
                                                            ✓ Выполнено
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 text-[10px]">🔒 Заблокировано</span>
                                                    )}
                                                </div>

                                                {/* Tier Goal */}
                                                <div className="text-[11px] text-gray-300 mb-1">
                                                    {tier.description}
                                                </div>

                                                {/* Rewards (Prefix & Rubies) */}
                                                <div className="flex flex-wrap items-center gap-1.5 my-1.5 text-[11px]">
                                                    <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-1.5 py-0.5 rounded font-bold">
                                                        [{tier.prefix}]
                                                    </span>
                                                    <span className="bg-pink-500/10 border border-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                                        💎 +{tier.rubies}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Footer with Global % and Actions */}
                                            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                                                <span
                                                    className="text-[10px] text-gray-400 flex items-center gap-1"
                                                    title={`Процент игроков на сервере, открывших эту очивку: ${globalPercent}%`}
                                                >
                                                    👥 <span className="text-cyan-400 font-semibold">{globalPercent}%</span>
                                                </span>

                                                {isOwnProfile && isDone && (
                                                    <div className="flex items-center gap-1">
                                                        {!isClaimed && onClaimReward && (
                                                            <button
                                                                onClick={() => onClaimReward(tier.id, tier.rubies)}
                                                                className="px-2 py-0.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-[10px] rounded shadow transition-all"
                                                                title="Забрать рубины в инвентарь"
                                                            >
                                                                Забрать +{tier.rubies}💎
                                                            </button>
                                                        )}

                                                        {onSelectTitle && (
                                                            isEquipped ? (
                                                                <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-300 font-extrabold text-[10px] rounded">
                                                                    Надет ✓
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => onSelectTitle(tier.prefix)}
                                                                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded transition-colors"
                                                                    title="Установить как префикс в чате и над персонажем"
                                                                >
                                                                    Надеть
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        Очивки не найдены. Попробуйте изменить поисковый запрос.
                    </div>
                )}
            </div>
        </div>
    );
};
