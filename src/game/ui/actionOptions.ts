export const PROTECTION_OPTIONS = [
    { cost: 2, duration: 10 * 60 * 60 * 1000, label: 'На 10 часов' },
    { cost: 4, duration: 24 * 60 * 60 * 1000, label: 'На 1 сутки' },
    { cost: 6, duration: 3 * 24 * 60 * 60 * 1000, label: 'На 3 суток' },
    { cost: 8, duration: 8 * 24 * 60 * 60 * 1000, label: 'На 8 суток' },
    { cost: 10, duration: 32 * 24 * 60 * 60 * 1000, label: 'На 32 суток' },
];

export const BAN_OPTIONS = [
    { label: 'Забанить на 1 минуту', cost: 9000, durationMinutes: 1 },
    { label: 'Забанить на 5 минут', cost: 15000, durationMinutes: 5 },
    { label: 'Забанить на 30 минут', cost: 25000, durationMinutes: 30 },
    { label: 'Забанить на час', cost: 45000, durationMinutes: 60 },
    { label: 'Забанить на сутки', cost: 100000, durationMinutes: 1440 },
];

export const PUNISHMENT_OPTIONS = [
    { cost: 1, gloryPenalty: 500, label: 'Отшлепать' },
    { cost: 2, gloryPenalty: 1000, label: 'Пнуть' },
    { cost: 3, gloryPenalty: 2400, label: 'Выпороть' },
    { cost: 4, gloryPenalty: 5500, label: 'Смешать с грязью' },
    { cost: 5, gloryPenalty: 9000, label: 'Закатать в асфальт' },
];

export const CURSE_OPTIONS = [
    { label: 'Жаба', cost: 4000, durationMinutes: 1, prefix: '(ква-ква-ква)' },
    { label: 'Корова', cost: 8000, durationMinutes: 2, prefix: '(му-му-му)' },
    { label: 'Собака', cost: 12000, durationMinutes: 3, prefix: '(гаф-гаф)' },
    { label: 'Свинья', cost: 16000, durationMinutes: 4, prefix: '(хрю-хрю)' },
    { label: 'Барашек', cost: 20000, durationMinutes: 5, prefix: '(бе-бе-бе)' },
];
