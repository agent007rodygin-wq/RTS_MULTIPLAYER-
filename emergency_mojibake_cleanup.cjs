const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Mojibake mapping for alerts and logs
const alertMap = {
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ СЂР°Р±РѕС‡РёС…!': 'Недостаточно рабочих!',
    'РўСЂРµР±СѓРµС‚СЃСЏ:': 'Требуется:',
    'РЎРІРѕР±РѕРґРЅРѕ:': 'Свободно:',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ СЂРµСЃСѓСЂСЃР°:': 'Недостаточно ресурса:',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ Р·РѕР»РѕС‚Р°!': 'Недостаточно золота!',
    'РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅРѕ СЂСѓР±РёРЅРѕРІ!': 'Недостаточно рубинов!',
    'РџРѕРєСѓРїРєР° СѓСЃРїРµС€РЅР°!': 'Покупка успешна!',
    'РћС€РёР±РєР°!': 'Ошибка!',
    'РЈРґР°Р»РµРЅРѕ:': 'Удалено:',
    'Р’С‹ РїРѕР»СѓС‡РёР»Рё': 'Вы получили',
};

for (const [mojibake, correct] of Object.entries(alertMap)) {
    content = content.replace(new RegExp(mojibake, 'g'), correct);
}

// Special case for line 4547 if it's still weird
content = content.replace(/alert\(`Недостаточно рабочих! Требуется: \${popCost}, Свободно: \${maxPopulation - currentPopulation}`\)/g, "alert(`Недостаточно рабочих! Требуется: ${popCost}, Свободно: ${maxPopulation - currentPopulation}`)");

fs.writeFileSync(filePath, content);
console.log("Cleaned up alerts and fixed potential syntax mess in App.tsx");
