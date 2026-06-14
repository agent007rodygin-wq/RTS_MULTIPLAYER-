const fs = require('fs');

function decodeMojibake(text) {
    // Mapping our specific mojibake back to UTF-8 bytes
    // Snippet: Рќ -> Н
    // Р (U+0420 / 1056) -> 0xD0
    // ќ (U+045C / 1116) -> 0x9D
    // D0 9D is indeed 'Н' in UTF-8.
    
    // Pattern: 
    // If we see U+0420 (Р) followed by some char, it's 0xD0 + byte
    // If we see U+0421 (С) followed by some char, it's 0xD1 + byte
    
    const cp1251ToByte = (char) => {
        const code = char.charCodeAt(0);
        // Common matches for CP1251 erroneously read as Unicode
        if (code === 1056) return 0xD0; // Р
        if (code === 1057) return 0xD1; // С
        
        // This is tricky. We need the byte value that resulted in the current Unicode char 
        // when read as CP1251.
        // Let's use a more robust way: a map of common second bytes.
        // D0 (Р) followed by:
        // 90 -> ќ (1116) ? Wait, 0x9D is ќ in CP1251? 
        // Let's check CP1251: 0x9D is empty in some variations, or 'ќ' in others.
        // 0x9D in CP1251 is indeed 'ќ' (U+045C).
        
        // Let's build a map from common Unicode chars back to CP1251 bytes.
        const cp1251Map = {
            1116: 0x9D, // ќ -> 0x9D
            1028: 0x84, // Є -> 0x84
            // and so on...
        };
        if (cp1251Map[code]) return cp1251Map[code];
        
        // For many, it's just the low byte or a simple shift.
        // But for Cyrillic it's scattered.
        
        // Actually, the most common second characters are in the range 0x80-0xBF.
        // In CP1251:
        // 0x80-0x8F: ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏ
        // 0x90-0x9F: ђ‘'“”•–—™љ›њќћџ
        // 0xA0-0xAF:  ЎўЈ¤Ґ¦§Ё©Є«¬­®Ї
        // 0xB0-0xBF: °±Ііґµ¶·ё№є»јЅѕї
        
        const cp1251Bytes = [
            0x402, 0x403, 0x201A, 0x453, 0x201E, 0x2026, 0x2020, 0x2021, 0x20AC, 0x2030, 0x409, 0x2039, 0x40A, 0x40C, 0x40B, 0x40F,
            0x452, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014, 0x0, 0x2122, 0x459, 0x203A, 0x45A, 0x45C, 0x45B, 0x45F,
            0xA0, 0x40E, 0x45E, 0x408, 0xA4, 0x490, 0xA6, 0xA7, 0x401, 0xA9, 0x404, 0xAB, 0xAC, 0xAD, 0xAE, 0x407,
            0xB0, 0xB1, 0x406, 0x456, 0x491, 0xB5, 0xB6, 0xB7, 0x451, 0x2116, 0x454, 0xBB, 0x458, 0x405, 0x455, 0x457
        ];
        
        for (let i = 0; i < 64; i++) {
            if (cp1251Bytes[i] === code) return 0x80 + i;
        }
        
        // Fallback: if it's a standard ASCII char that was interpreted as CP1251 high byte (impossible) 
        // or if it's already a byte-like char.
        if (code < 256) return code;
        
        return null;
    };

    let result = [];
    for (let i = 0; i < text.length; i++) {
        let b1 = cp1251ToByte(text[i]);
        if ((b1 === 0xD0 || b1 === 0xD1) && i + 1 < text.length) {
            let b2 = cp1251ToByte(text[i + 1]);
            if (b2 !== null) {
                result.push(b1, b2);
                i++;
                continue;
            }
        }
        // If not a mojibake sequence, convert character to UTF-8 bytes to preserve it
        let charBytes = Buffer.from(text[i], 'utf8');
        for (let b of charBytes) result.push(b);
    }
    
    return Buffer.from(result).toString('utf8');
}

const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const fixedContent = decodeMojibake(content);

if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent);
    console.log("Smart mojibake restoration applied.");
} else {
    console.log("No mojibake patterns detected with smart restorer.");
}
