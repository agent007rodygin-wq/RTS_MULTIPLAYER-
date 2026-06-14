const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Mojibake
const mojibakeMapping = {
    'РџРѕСЃС‚СЂРѕРёС‚СЊ': 'Построить',
    'РЎСЋРґР°!': 'Сюда!',
    'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ': 'Пользователь',
    'СѓРґР°Р»РµРЅ РёР· РґСЂСѓР·РµР№.': 'удален из друзей.',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ СЂСѓР±РёРЅРѕРІ!': 'Недостаточно рубинов!',
    'РќРµР»СЊР·СЏ РґРѕР±Р°РІРёС‚СЊ СЃР°РјРѕРіРѕ СЃРµР±СЏ РІ РґСЂСѓР·СЊСЏ!': 'Нельзя добавить самого себя в друзья!',
    'Р—Р°РїСЂРѕСЃ РґСЂСѓР¶Р±С‹ РѕС‚РїСЂР°РІР»РµРЅ РёРіСЂРѕРєСѓ': 'Запрос дружбы отправлен игроку',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ Р·РѕР»РѕС‚Р°!': 'Недостаточно золота!',
    'РўСЂРµР±СѓРµС‚СЃСЏ': 'Требуется',
    'РјРѕРЅРµС‚.': 'монет.',
    'Р’С‹ Р·Р°РєРѕР»РґРѕРІР°Р»Рё РёРіСЂРѕРєР°': 'Вы заколдовали игрока',
    'РІ "': 'в "',
    'РџРѕС‚СЂР°С‡РµРЅРѕ': 'Потрачено',
    'Р˜РіСЂРѕРє': 'Игрок',
    'СѓСЃРїРµС€РЅРѕ Р·Р°РєРѕР»РґРѕРІР°РЅ!': 'успешно заколдован!',
    'Р’С‹ РЅР°РєР°Р·Р°Р»Рё РёРіСЂРѕРєР°': 'Вы наказали игрока',
    'РїРѕС‚РµСЂСЏР»': 'потерял',
    'СЃР»Р°РІС‹!': 'славы!',
    'рџ’Ґ': '💥',
    'рџ’°': '💰'
};

for (const [mojibake, correct] of Object.entries(mojibakeMapping)) {
    content = content.replace(new RegExp(mojibake, 'g'), correct);
}

// 2. Optimization: getIsMonsterHost should not SORT users on every call!
// Let's find the start of the gameLoop and insert the calculation.

const originalGetIsMonsterHost = `            const getIsMonsterHost = (b: PlacedBuilding) => {
                if (!isAuthReadyRef.current || !userRef.current) return false;
                // Neutral buildings (ownerId '0' or 'monster') are only handled by one host
                if (b.ownerId !== "monster" && b.ownerId !== "0") return false;
                if (b.hostId === userRef.current.uid) return true;

                // Check if it's claimed by another currently ONLINE user
                if (b.hostId && allUsersRef.current[b.hostId]) return false;

                const users = Object.keys(allUsersRef.current).sort();
                return users.length > 0 && userRef.current.uid === users[0];
            };`;

const optimizedHostCode = `            const onlineUserIds = Object.keys(allUsersRef.current).sort();
            const firstUserUid = onlineUserIds.length > 0 ? onlineUserIds[0] : null;

            const getIsMonsterHost = (b: PlacedBuilding) => {
                if (!isAuthReadyRef.current || !userRef.current) return false;
                if (b.ownerId !== "monster" && b.ownerId !== "0") return false;
                if (b.hostId === userRef.current.uid) return true;
                if (b.hostId && allUsersRef.current[b.hostId]) return false;
                return userRef.current.uid === firstUserUid;
            };`;

if (content.includes(originalGetIsMonsterHost.trim())) {
    content = content.replace(originalGetIsMonsterHost.trim(), optimizedHostCode.trim());
} else {
    // If exact whitespace match fails, try a more flexible approach
    content = content.replace(/const getIsMonsterHost = \(b: PlacedBuilding\) => \{[\s\S]+?return users\.length > 0 && userRef\.current\.uid === users\[0\];[\s\S]+?\};/, optimizedHostCode.trim());
}

fs.writeFileSync(filePath, content);
console.log("Optimizations and Language fixes applied to App.tsx");
