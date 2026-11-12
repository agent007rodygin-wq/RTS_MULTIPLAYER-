// @ts-check

const cp1251Decoder = new TextDecoder('windows-1251');
const utf8Encoder = new TextEncoder();
const mojibakeReverseMap = new Map();
let mojibakeMaxTokenLen = 1;

for (let cp = 32; cp <= 0x052F; cp++) {
    const ch = String.fromCharCode(cp);
    const wrong = cp1251Decoder.decode(utf8Encoder.encode(ch));
    if (wrong !== ch) {
        mojibakeReverseMap.set(wrong, ch);
        if (wrong.length > mojibakeMaxTokenLen) mojibakeMaxTokenLen = wrong.length;
    }
}

for (const ch of ['РІР‚В¦', 'РІР‚вЂњ', 'РІР‚вЂќ', 'РІР‚Сљ', 'РІР‚Сњ', 'РІР‚В˜', 'РІР‚в„ў', 'РІвЂћвЂ“']) {
    const wrong = cp1251Decoder.decode(utf8Encoder.encode(ch));
    if (wrong !== ch) {
        mojibakeReverseMap.set(wrong, ch);
        if (wrong.length > mojibakeMaxTokenLen) mojibakeMaxTokenLen = wrong.length;
    }
}

for (const ch of [
    'РІР‚Сћ', '<', '>', '-', 'Р’В¦', '?', '?', '?', '?', '?',
    '?', 'Р’В¦'
]) {
    const wrong = cp1251Decoder.decode(utf8Encoder.encode(ch));
    if (wrong !== ch) {
        mojibakeReverseMap.set(wrong, ch);
        if (wrong.length > mojibakeMaxTokenLen) mojibakeMaxTokenLen = wrong.length;
    }
}

/** @type {Array<[RegExp, string]>} */
const mojibakeFallbackFixes = [
    [/РвЂњосСвЂљь/g, 'Гость'],
    [/Р вЂњР С•РЎРѓРЎвЂљРЎРЉ/g, 'Гость'],
    [/Пожалу[^\s,]+,?\s*введи[^\s,]+ ник/g, 'Пожалуйста, введите ник'],
    [/Пожалу[^\s,]+/g, 'Пожалуйста'],
    [/введи[^\s,]+/g, 'введите'],
    [/Ник должен б[^\s]+ не менее 3 символов/g, 'Ник должен быть не менее 3 символов'],
    [/Э[^\s]+ ник уже заня[^\s]+, в[^\s]+ друго[^\s]+/g, 'Этот ник уже занят, выберите другой'],
    [/НедосСвЂ[льа-я]+оСвЂ[Ўа-я]+но/g, 'Недостаточно'],
    [/Недос[^\s:]+но/g, 'Недостаточно'],
    [/СвЂ[ль]+/g, 'т'],
    [/СвЂЎ/g, 'ч'],
    [/Рв„–/g, 'й'],
    [/Р СњР ВµР Т‘Р С•РЎРѓРЎвЂљР В°РЎвЂљР С•РЎвЂЎР Р…Р С•/g, 'Недостаточно'],
    [/Р Р†Р вЂљРЎС›/g, 'РІР‚Сћ'],
    [/Р Р†Р вЂљРІР‚Сњ/g, 'РІР‚вЂќ'],
    [/Р Р†Р вЂљРІР‚Сљ/g, 'РІР‚вЂњ'],
    [/Р Р†Р вЂљР’В¦/g, 'РІР‚В¦'],
    [/Р Р†РІР‚С›РІР‚вЂњ/g, 'РІвЂћвЂ“'],
    [/Р Р†РІР‚В РЎвЂ™/g, '<'],
    [/>/g, '>'],
    [/\?/g, '?' ],
    [/\?/g, '?' ],
    [/Р’В¦/g, 'Р’В¦'],
];

/** @type {Record<number, number>} */
const win1252Special = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85,
    0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A,
    0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92,
    0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C,
    0x017E: 0x9E, 0x0178: 0x9F
};

/**
 * Repairs UTF-8 strings mistakenly decoded as Windows-1252 or Latin-1 (ISO-8859-1).
 * Example: "ÐœÐ°Ð³Ð½Ð°Ñ‚" -> "Магнат"
 * @param {string} str
 * @returns {string}
 */
export function repairWin1252Latin1Utf8(str) {
    if (!str || typeof str !== 'string') return str;
    if (!/[ÐÑ\x80-\x9F]/.test(str)) return str;
    try {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code <= 0xff) {
                bytes.push(code);
            } else if (win1252Special[code] !== undefined) {
                bytes.push(win1252Special[code]);
            } else {
                return str;
            }
        }
        return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    } catch {
        return str;
    }
}

/**
 * @param {string} input
 * @returns {string}
 */
export function repairMojibakeCp1251Utf8(input) {
    if (!input || typeof input !== 'string') return input;
    let current = repairWin1252Latin1Utf8(input);
    if (!/[Р РЎР’РІРѓРЉР‹Р‚Р‰РЊРЏР„РЃС’СљСџРЋР‡ТђТ‘в„–]/.test(current)) return current;

    for (let pass = 0; pass < 3; pass++) {
        let out = '';
        for (let i = 0; i < current.length;) {
            let replaced = false;
            for (let len = Math.min(mojibakeMaxTokenLen, current.length - i); len >= 1; len--) {
                const token = current.slice(i, i + len);
                const fixed = mojibakeReverseMap.get(token);
                if (fixed) {
                    out += fixed;
                    i += len;
                    replaced = true;
                    break;
                }
            }
            if (!replaced) {
                out += current[i];
                i++;
            }
        }

        for (const [pattern, replacement] of mojibakeFallbackFixes) {
            out = out.replace(pattern, replacement);
        }

        if (out === current || !/[Р РЎР’РІРѓРЉР‹Р‚Р‰РЊРЏР„РЃС’СљСџРЋР‡ТђТ‘в„–]/.test(out)) {
            return out;
        }
        current = out;
    }

    return current;
}
