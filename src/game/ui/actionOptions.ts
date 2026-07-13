export const PROTECTION_OPTIONS = [
    { cost: 2, duration: 10 * 60 * 60 * 1000, label: 'РќР° 10 С‡Р°СЃРѕРІ' },
    { cost: 4, duration: 24 * 60 * 60 * 1000, label: 'РќР° 1 СЃСѓС‚РєРё' },
    { cost: 6, duration: 3 * 24 * 60 * 60 * 1000, label: 'РќР° 3 СЃСѓС‚РѕРє' },
    { cost: 8, duration: 8 * 24 * 60 * 60 * 1000, label: 'РќР° 8 СЃСѓС‚РѕРє' },
    { cost: 10, duration: 32 * 24 * 60 * 60 * 1000, label: 'РќР° 32 СЃСѓС‚РѕРє' },
];

export const BAN_OPTIONS = [
    { label: 'Р—Р°Р±Р°РЅРёС‚СЊ РЅР° 1 РјРёРЅСѓС‚Сѓ', cost: 9000, durationMinutes: 1 },
    { label: 'Р—Р°Р±Р°РЅРёС‚СЊ РЅР° 5 РјРёРЅСѓС‚', cost: 15000, durationMinutes: 5 },
    { label: 'Р—Р°Р±Р°РЅРёС‚СЊ РЅР° 30 РјРёРЅСѓС‚', cost: 25000, durationMinutes: 30 },
    { label: 'Р—Р°Р±Р°РЅРёС‚СЊ РЅР° С‡Р°СЃ', cost: 45000, durationMinutes: 60 },
    { label: 'Р—Р°Р±Р°РЅРёС‚СЊ РЅР° СЃСѓС‚РєРё', cost: 100000, durationMinutes: 1440 },
];

export const PUNISHMENT_OPTIONS = [
    { cost: 1, gloryPenalty: 500, label: 'РћС‚С€Р»РµРїР°С‚СЊ' },
    { cost: 2, gloryPenalty: 1000, label: 'РџРЅСѓС‚СЊ' },
    { cost: 3, gloryPenalty: 2400, label: 'Р’С‹РїРѕСЂРѕС‚СЊ' },
    { cost: 4, gloryPenalty: 5500, label: 'РЎРјРµС€Р°С‚СЊ СЃ РіСЂСЏР·СЊСЋ' },
    { cost: 5, gloryPenalty: 9000, label: 'Р—Р°РєР°С‚Р°С‚СЊ РІ Р°СЃС„Р°Р»СЊС‚' },
];

export const CURSE_OPTIONS = [
    { label: 'Р–Р°Р±Р°', cost: 4000, durationMinutes: 1, prefix: '(РєРІР°-РєРІР°-РєРІР°)' },
    { label: 'РљРѕСЂРѕРІР°', cost: 8000, durationMinutes: 2, prefix: '(РјСѓ-РјСѓ-РјСѓ)' },
    { label: 'РЎРѕР±Р°РєР°', cost: 12000, durationMinutes: 3, prefix: '(РіР°С„-РіР°С„)' },
    { label: 'РЎРІРёРЅСЊСЏ', cost: 16000, durationMinutes: 4, prefix: '(С…СЂСЋ-С…СЂСЋ)' },
    { label: 'Р‘Р°СЂР°С€РµРє', cost: 20000, durationMinutes: 5, prefix: '(Р±Рµ-Р±Рµ-Р±Рµ)' },
];
