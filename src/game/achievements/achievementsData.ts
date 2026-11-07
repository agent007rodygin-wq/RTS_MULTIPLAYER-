// @ts-check

export interface AchievementTier {
    tier: 1 | 2 | 3;
    id: string;
    name: string;
    prefix: string;
    target: number;
    rubies: number;
    description: string;
}

export interface AchievementCategory {
    id: string;
    name: string;
    icon: string;
    categoryGroup: 'gathering' | 'wealth' | 'combat' | 'time' | 'social' | 'special';
    statKey: string;
    unit: string;
    description: string;
    tiers: AchievementTier[];
}

export const ACHIEVEMENTS_DATA: AchievementCategory[] = [
    {
        id: 'woodcutter',
        name: 'Лесоруб',
        icon: '🪓',
        categoryGroup: 'gathering',
        statKey: 'treesChopped',
        unit: 'деревьев',
        description: 'Рубка деревьев в окрестностях города',
        tiers: [
            {
                tier: 1,
                id: 'woodcutter_1',
                name: 'Первый сруб',
                prefix: 'Младший лесоруб',
                target: 15,
                rubies: 5,
                description: 'Срубить 15 деревьев'
            },
            {
                tier: 2,
                id: 'woodcutter_2',
                name: 'Старший лесоруб',
                prefix: 'Старший лесоруб',
                target: 100,
                rubies: 15,
                description: 'Срубить 100 деревьев'
            },
            {
                tier: 3,
                id: 'woodcutter_3',
                name: 'Лесоруб со стажем',
                prefix: 'Лесоруб со стажем',
                target: 500,
                rubies: 50,
                description: 'Срубить 500 деревьев (Лесоруб-стахановец)'
            }
        ]
    },
    {
        id: 'builder',
        name: 'Строитель',
        icon: '🏠',
        categoryGroup: 'gathering',
        statKey: 'buildingsBuilt',
        unit: 'построек',
        description: 'Возведение зданий на карте мира',
        tiers: [
            {
                tier: 1,
                id: 'builder_1',
                name: 'Первый дом',
                prefix: 'Новосел',
                target: 1,
                rubies: 5,
                description: 'Построить свое первое здание'
            },
            {
                tier: 2,
                id: 'builder_2',
                name: 'Опытный строитель',
                prefix: 'Прораб',
                target: 10,
                rubies: 15,
                description: 'Построить 10 зданий'
            },
            {
                tier: 3,
                id: 'builder_3',
                name: 'Великий архитектор',
                prefix: 'Главный архитектор',
                target: 50,
                rubies: 50,
                description: 'Построить 50 зданий'
            }
        ]
    },
    {
        id: 'millionaire',
        name: 'Богатство',
        icon: '💰',
        categoryGroup: 'wealth',
        statKey: 'gold',
        unit: 'монет',
        description: 'Накопление золотых запасов',
        tiers: [
            {
                tier: 1,
                id: 'millionaire_1',
                name: 'Первый капитал',
                prefix: 'Зажиточный',
                target: 10000,
                rubies: 5,
                description: 'Накопить 10 000 золота'
            },
            {
                tier: 2,
                id: 'millionaire_2',
                name: 'Золотой мешок',
                prefix: 'Богач',
                target: 100000,
                rubies: 20,
                description: 'Накопить 100 000 золота'
            },
            {
                tier: 3,
                id: 'millionaire_3',
                name: 'Миллионер',
                prefix: 'Магнат',
                target: 1000000,
                rubies: 100,
                description: 'Накопить 1 000 000 золота'
            }
        ]
    },
    {
        id: 'monster_hunter',
        name: 'Убийца чудовищ',
        icon: '⚔️',
        categoryGroup: 'combat',
        statKey: 'monstersDestroyed',
        unit: 'монстров',
        description: 'Истребление чудовищ и монстров на карте',
        tiers: [
            {
                tier: 1,
                id: 'monster_hunter_1',
                name: 'Первая охота',
                prefix: 'Охотник',
                target: 5,
                rubies: 10,
                description: 'Уничтожить 5 монстров'
            },
            {
                tier: 2,
                id: 'monster_hunter_2',
                name: 'Убийца чудовищ',
                prefix: 'Истребитель чудовищ',
                target: 20,
                rubies: 30,
                description: 'Уничтожить 20 монстров'
            },
            {
                tier: 3,
                id: 'monster_hunter_3',
                name: 'Гроза монстров',
                prefix: 'Гроза чудовищ',
                target: 100,
                rubies: 80,
                description: 'Уничтожить 100 монстров'
            }
        ]
    },
    {
        id: 'pioneer',
        name: 'Первый среди первых',
        icon: '👑',
        categoryGroup: 'special',
        statKey: 'pioneerRank',
        unit: 'место',
        description: 'Награда первым первопроходцам, начавшим играть в проект',
        tiers: [
            {
                tier: 1,
                id: 'pioneer_1',
                name: 'В числе 1000 первых',
                prefix: 'Первопроходец',
                target: 1000,
                rubies: 20,
                description: 'Войти в игру в числе первых 1000 игроков'
            },
            {
                tier: 2,
                id: 'pioneer_2',
                name: 'В числе 500 первых',
                prefix: 'Ветеран',
                target: 500,
                rubies: 50,
                description: 'Войти в игру в числе первых 500 игроков'
            },
            {
                tier: 3,
                id: 'pioneer_3',
                name: 'Первый среди первых',
                prefix: 'Первый среди первых',
                target: 100,
                rubies: 100,
                description: 'Войти в игру в числе первых 100 игроков'
            }
        ]
    },
    {
        id: 'time_master',
        name: 'Настоящий игрок времени',
        icon: '⏳',
        categoryGroup: 'time',
        statKey: 'playTimeTodayHours',
        unit: 'ч/день',
        description: 'Проведенное время в игре за один день',
        tiers: [
            {
                tier: 1,
                id: 'time_master_1',
                name: 'Игрок времени',
                prefix: 'Игрок времени',
                target: 5,
                rubies: 15,
                description: 'Провести 5 часов в игре за день'
            },
            {
                tier: 2,
                id: 'time_master_2',
                name: 'Настоящий игрок времени',
                prefix: 'Настоящий игрок времени',
                target: 15,
                rubies: 40,
                description: 'Провести 15 часов в игре за день'
            },
            {
                tier: 3,
                id: 'time_master_3',
                name: 'Монстр игры',
                prefix: 'Монстр игры',
                target: 20,
                rubies: 100,
                description: 'Провести 20 часов в игре за день'
            }
        ]
    },
    {
        id: 'login_days',
        name: 'Дни в игре',
        icon: '📅',
        categoryGroup: 'time',
        statKey: 'totalLoginDays',
        unit: 'дней',
        description: 'Общее количество дней захода в игру',
        tiers: [
            {
                tier: 1,
                id: 'login_days_1',
                name: 'Первый визит',
                prefix: 'Новичок',
                target: 1,
                rubies: 5,
                description: 'Зайти в игру в течение 1 дня'
            },
            {
                tier: 2,
                id: 'login_days_2',
                name: 'Неделя приключений',
                prefix: 'Завсегдатай',
                target: 7,
                rubies: 25,
                description: 'Зайти в игру в 7 разных дней'
            },
            {
                tier: 3,
                id: 'login_days_3',
                name: 'Месяц преданности',
                prefix: 'Старожил',
                target: 30,
                rubies: 100,
                description: 'Зайти в игру в 30 разных дней'
            }
        ]
    },
    {
        id: 'demolisher',
        name: 'Разрушитель',
        icon: '💥',
        categoryGroup: 'combat',
        statKey: 'buildingsDestroyed',
        unit: 'зданий',
        description: 'Уничтожение вражеских построек петардами и орудиями',
        tiers: [
            {
                tier: 1,
                id: 'demolisher_1',
                name: 'Первый снос',
                prefix: 'Бунтарь',
                target: 1,
                rubies: 5,
                description: 'Уничтожить 1 здание'
            },
            {
                tier: 2,
                id: 'demolisher_2',
                name: 'Мастер взрывов',
                prefix: 'Подрывник',
                target: 10,
                rubies: 20,
                description: 'Уничтожить 10 зданий'
            },
            {
                tier: 3,
                id: 'demolisher_3',
                name: 'Осаждатель столицы',
                prefix: 'Осаждатель',
                target: 50,
                rubies: 50,
                description: 'Уничтожить 50 зданий'
            }
        ]
    },
    {
        id: 'thief',
        name: 'Мастер скрытности',
        icon: '🧤',
        categoryGroup: 'combat',
        statKey: 'theftsCommitted',
        unit: 'краж',
        description: 'Совершение дерзких краж в чужих владениях',
        tiers: [
            {
                tier: 1,
                id: 'thief_1',
                name: 'Первая вылазка',
                prefix: 'Карманник',
                target: 1,
                rubies: 5,
                description: 'Совершить 1 успешную кражу'
            },
            {
                tier: 2,
                id: 'thief_2',
                name: 'Теневой вор',
                prefix: 'Ловкач',
                target: 10,
                rubies: 20,
                description: 'Совершить 10 успешных краж'
            },
            {
                tier: 3,
                id: 'thief_3',
                name: 'Мастер воровства',
                prefix: 'Мастер воров',
                target: 50,
                rubies: 50,
                description: 'Совершить 50 успешных краж'
            }
        ]
    },
    {
        id: 'hero_level',
        name: 'Уровень героя',
        icon: '⭐',
        categoryGroup: 'wealth',
        statKey: 'level',
        unit: 'ур.',
        description: 'Развитие и повышение уровня вашего персонажа',
        tiers: [
            {
                tier: 1,
                id: 'hero_level_1',
                name: 'Основы мастерства',
                prefix: 'Ученик',
                target: 5,
                rubies: 5,
                description: 'Достичь 5 уровня персонажа'
            },
            {
                tier: 2,
                id: 'hero_level_2',
                name: 'Закаленный герой',
                prefix: 'Опытный боец',
                target: 15,
                rubies: 25,
                description: 'Достичь 15 уровня персонажа'
            },
            {
                tier: 3,
                id: 'hero_level_3',
                name: 'Легенда сервера',
                prefix: 'Легендарный',
                target: 30,
                rubies: 75,
                description: 'Достичь 30 уровня персонажа'
            }
        ]
    },
    {
        id: 'glory_master',
        name: 'Искатель славы',
        icon: '🏆',
        categoryGroup: 'wealth',
        statKey: 'glory',
        unit: 'славы',
        description: 'Зарабатывание очков славы в сражениях и турнирах',
        tiers: [
            {
                tier: 1,
                id: 'glory_master_1',
                name: 'Первая слава',
                prefix: 'Известный',
                target: 50,
                rubies: 10,
                description: 'Набрать 50 славы'
            },
            {
                tier: 2,
                id: 'glory_master_2',
                name: 'Знаменитость',
                prefix: 'Знаменитость',
                target: 500,
                rubies: 35,
                description: 'Набрать 500 славы'
            },
            {
                tier: 3,
                id: 'glory_master_3',
                name: 'Герой Басингсе',
                prefix: 'Герой сервера',
                target: 2000,
                rubies: 100,
                description: 'Набрать 2000 славы'
            }
        ]
    },
    {
        id: 'reputation_keeper',
        name: 'Честь и порядок',
        icon: '🛡️',
        categoryGroup: 'social',
        statKey: 'reputation',
        unit: 'репутации',
        description: 'Одобрение и похвала других игроков города',
        tiers: [
            {
                tier: 1,
                id: 'reputation_keeper_1',
                name: 'Уважаемый житель',
                prefix: 'Уважаемый',
                target: 5,
                rubies: 10,
                description: 'Заработать 5 очков репутации'
            },
            {
                tier: 2,
                id: 'reputation_keeper_2',
                name: 'Блюститель чести',
                prefix: 'Блюститель чести',
                target: 25,
                rubies: 30,
                description: 'Заработать 25 очков репутации'
            },
            {
                tier: 3,
                id: 'reputation_keeper_3',
                name: 'Идеал справедливости',
                prefix: 'Идеал справедливости',
                target: 100,
                rubies: 80,
                description: 'Заработать 100 очков репутации'
            }
        ]
    },
    {
        id: 'friendly',
        name: 'Душа компании',
        icon: '🤝',
        categoryGroup: 'social',
        statKey: 'friendsCount',
        unit: 'друзей',
        description: 'Приглашение и дружба с другими игроками',
        tiers: [
            {
                tier: 1,
                id: 'friendly_1',
                name: 'Верный товарищ',
                prefix: 'Товарищ',
                target: 1,
                rubies: 5,
                description: 'Добавить 1 друга в список друзей'
            },
            {
                tier: 2,
                id: 'friendly_2',
                name: 'Душа компании',
                prefix: 'Душа компании',
                target: 5,
                rubies: 20,
                description: 'Добавить 5 друзей'
            },
            {
                tier: 3,
                id: 'friendly_3',
                name: 'Лидер мнений',
                prefix: 'Лидер мнений',
                target: 20,
                rubies: 50,
                description: 'Добавить 20 друзей'
            }
        ]
    },
    {
        id: 'trader',
        name: 'Купец',
        icon: '⚖️',
        categoryGroup: 'wealth',
        statKey: 'marketTrades',
        unit: 'сделок',
        description: 'Торговые операции и продажи товаров на рынке',
        tiers: [
            {
                tier: 1,
                id: 'trader_1',
                name: 'Первая торговля',
                prefix: 'Торговец',
                target: 1,
                rubies: 5,
                description: 'Совершить 1 торговую операцию на рынке'
            },
            {
                tier: 2,
                id: 'trader_2',
                name: 'Купеческая гильдия',
                prefix: 'Купец',
                target: 10,
                rubies: 20,
                description: 'Совершить 10 торговых операций'
            },
            {
                tier: 3,
                id: 'trader_3',
                name: 'Гильдейский купец',
                prefix: 'Гильдейский купец',
                target: 50,
                rubies: 60,
                description: 'Совершить 50 торговых операций'
            }
        ]
    },
    {
        id: 'clan_warrior',
        name: 'Клановый боец',
        icon: '🚩',
        categoryGroup: 'social',
        statKey: 'clanRankLevel',
        unit: 'ранг',
        description: 'Участие и продвижение по иерархии в клане',
        tiers: [
            {
                tier: 1,
                id: 'clan_warrior_1',
                name: 'Рекрут клана',
                prefix: 'Рекрут клана',
                target: 1,
                rubies: 10,
                description: 'Вступить в любой игровой клан'
            },
            {
                tier: 2,
                id: 'clan_warrior_2',
                name: 'Офицер клана',
                prefix: 'Офицер клана',
                target: 2,
                rubies: 30,
                description: 'Стать офицером или заместителем главы клана'
            },
            {
                tier: 3,
                id: 'clan_warrior_3',
                name: 'Глава клана',
                prefix: 'Глава клана',
                target: 3,
                rubies: 75,
                description: 'Возглавить собственный клан в качестве лидера'
            }
        ]
    }
];

// Helper to get total number of tiers across all achievements
export const TOTAL_ACHIEVEMENT_TIERS = ACHIEVEMENTS_DATA.reduce((acc, cat) => acc + cat.tiers.length, 0);

// Map of tier ID to tier metadata
export const ACHIEVEMENT_TIERS_MAP = new Map<string, { category: AchievementCategory; tier: AchievementTier }>();
ACHIEVEMENTS_DATA.forEach(category => {
    category.tiers.forEach(tier => {
        ACHIEVEMENT_TIERS_MAP.set(tier.id, { category, tier });
    });
});

/**
 * Extracts raw numeric value for a given achievement statKey
 */
export function getStatValue(statKey: string, stats: any): number {
    if (!stats) return 0;
    switch (statKey) {
        case 'treesChopped':
            return Number(stats.treesChopped || 0) || 0;
        case 'buildingsBuilt':
            return Math.max(Number(stats.buildingsBuilt || 0) || 0, Number(stats.myBuildingsCount || 0) || 0);
        case 'gold':
            return Math.max(Number(stats.gold || 0) || 0, Number(stats.peakGold || 0) || 0);
        case 'monstersDestroyed':
            return Number(stats.monstersDestroyed || 0) || 0;
        case 'pioneerRank':
            // For pioneer, target is maximum position (e.g. <= 1000, <= 500, <= 100)
            return Number(stats.joinNumber || 0) || 0;
        case 'playTimeTodayHours':
            return Math.floor((Number(stats.playTimeTodaySeconds || 0) || 0) / 3600);
        case 'totalLoginDays':
            return Number(stats.totalLoginDays || 0) || 0;
        case 'buildingsDestroyed':
            return Number(stats.buildingsDestroyed || 0) || 0;
        case 'theftsCommitted':
            return Number(stats.theftsCommitted || 0) || 0;
        case 'level':
            return Number(stats.level || 0) || 0;
        case 'glory':
            return Number(stats.glory || 0) || 0;
        case 'reputation':
            return Number(stats.reputation || 0) || 0;
        case 'friendsCount':
            return Array.isArray(stats.friends) ? stats.friends.length : (Number(stats.friendsCount || 0) || 0);
        case 'marketTrades':
            return Number(stats.marketTrades || 0) || 0;
        case 'clanRankLevel':
            // 0 = none, 1 = member, 2 = officer/deputy, 3 = leader
            if (!stats.clanId) return 0;
            if (stats.isClanLeader) return 3;
            if (stats.isClanOfficer || (stats.clanPermissions && (stats.clanPermissions.canInvite || stats.clanPermissions.canGrantStars))) return 2;
            return 1;
        default:
            return Number(stats[statKey] || 0) || 0;
    }
}

/**
 * Checks whether a specific tier is satisfied according to stats
 */
export function checkTierCompletion(category: AchievementCategory, tier: AchievementTier, stats: any): boolean {
    const val = getStatValue(category.statKey, stats);
    if (category.statKey === 'pioneerRank') {
        // Must have a positive joinNumber and it must be <= target
        return val > 0 && val <= tier.target;
    }
    return val >= tier.target;
}

/**
 * Evaluates all achievements and returns array of all completed tier IDs
 */
export function evaluateAllCompletedTiers(stats: any, existingCompleted: string[] = []): string[] {
    const completedSet = new Set<string>(existingCompleted || []);
    ACHIEVEMENTS_DATA.forEach(category => {
        category.tiers.forEach(tier => {
            if (completedSet.has(tier.id)) return;
            if (checkTierCompletion(category, tier, stats)) {
                completedSet.add(tier.id);
            }
        });
    });
    return Array.from(completedSet);
}

/**
 * Returns newly unlocked tiers between existing list and current stats
 */
export function findNewlyUnlockedTiers(stats: any, currentAchievements: string[] = []): AchievementTier[] {
    const existing = new Set<string>(currentAchievements || []);
    const newlyUnlocked: AchievementTier[] = [];
    ACHIEVEMENTS_DATA.forEach(category => {
        category.tiers.forEach(tier => {
            if (!existing.has(tier.id) && checkTierCompletion(category, tier, stats)) {
                newlyUnlocked.push(tier);
            }
        });
    });
    return newlyUnlocked;
}

/**
 * Returns list of all unlocked prefixes/titles for a given list of completed tier IDs
 */
export function getUnlockedTitles(completedTierIds: string[]): string[] {
    const set = new Set<string>();
    (completedTierIds || []).forEach(id => {
        const item = ACHIEVEMENT_TIERS_MAP.get(id);
        if (item && item.tier.prefix) {
            set.add(item.tier.prefix);
        }
    });
    return Array.from(set);
}
