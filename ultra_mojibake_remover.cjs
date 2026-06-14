const fs = require('fs');

function fixMojibake(text) {
    // This function converts strings that were incorrectly read as Windows-1251 instead of UTF-8
    // Cyrillic UTF-8 range: D0 80 to D1 BF
    // D0 is 'Р' in CP1251
    // D1 is 'С' in CP1251
    
    try {
        // Step 1: Convert the string back to a buffer using CP1251-like mapping
        // We can't use Buffer.from(text, 'binary') accurately because JS strings are UTF-16
        // But for common mojibake, many characters map directly to their byte values in the 0-255 range.
        
        let bytes = [];
        for (let i = 0; i < text.length; i++) {
            let code = text.charCodeAt(i);
            // JS char codes for these characters usually match the byte values in CP1251
            // e.g. 'Р' is 0xD0 (208), 'С' is 0xD1 (209)
            if (code < 256) {
                bytes.push(code);
            } else {
                // If we encounter a non-byte character, we might have already-fixed text.
                // We'll push a placeholder or the character itself.
                bytes.push(code); 
            }
        }
        
        // Step 2: Try to decode as UTF-8
        let buf = Buffer.from(bytes);
        // We look for sequences that look like UTF-8 Cyrillic (0xD0/0xD1 followed by 0x80-0xBF)
        // and replace them if the overall string is valid UTF-8.
        
        return buf.toString('utf8');
    } catch (e) {
        return text;
    }
}

const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// We don't want to run this on the WHOLE file if it has non-mojibake code.
// We should only target string literals.
// But a safer way is to specifically target the D0/D1 patterns.

function programmaticFix(str) {
    // Pattern: Р (D0) followed by a character in 80-BF range
    // or С (D1) followed by a character in 80-8F range
    let result = '';
    for (let i = 0; i < str.length; i++) {
        let c1 = str.charCodeAt(i);
        if ((c1 === 0xD0 || c1 === 0xD1) && i + 1 < str.length) {
            let c2 = str.charCodeAt(i + 1);
            if (c2 >= 0x80 && c2 <= 0xBF) {
                let bytes = Buffer.from([c1, c2]);
                result += bytes.toString('utf8');
                i++; // Skip next char
                continue;
            }
        }
        result += str[i];
    }
    return result;
}

const fixedContent = programmaticFix(content);

if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent);
    console.log("Programmatic mojibake fix applied successfully.");
} else {
    console.log("No mojibake patterns found.");
}
