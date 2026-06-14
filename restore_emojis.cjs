const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// List of corrupted emojis I saw in previous views
const emojiFixes = {
    '': (str) => {
        // We need to look at context
        if (str.includes('minutes') && str.includes('seconds')) return '⏳';
        if (str.includes('20 * zoom')) return '💰';
        return '❓';
    }
};

// Actually, I can just replace them globally if I know what they are.
// From previous views:
// timeRemaining uses ⏳
// monsters draw 💰

content = content.replace(/fillText\(` /g, 'fillText(`⏳ ');
content = content.replace(/fillText\(''/g, "fillText('💰'");

fs.writeFileSync(filePath, content);
console.log("Restored emojis ⏳ and 💰 in App.tsx");
