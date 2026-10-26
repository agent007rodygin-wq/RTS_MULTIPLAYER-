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

/**
 * @param {string} input
 * @returns {string}
 */
export function repairMojibakeCp1251Utf8(input) {
    if (!input) return input;
    if (!/[Р РЎР’РІРѓРЉР‹Р‚Р‰РЊРЏР„РЃС’СљСџРЋР‡ТђТ‘в„–]/.test(input)) return input;
    let current = input;

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
