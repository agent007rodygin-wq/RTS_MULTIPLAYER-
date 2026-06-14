const fs = require('fs');
const filePath = 'c:/Users/User/.antigravity/extensions/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fixing the syntax error at line 3852
// It has 'монет. : instead of 'монет.' :
content = content.replace(/'монет\. : 'РЎСЂСѓР±РёРЅРѕРІ'/, "'монет.' : 'рубинов'");

// 2. Extra mojibake cleanup
const extraMap = {
    'РљСѓРїР»РµРЅРѕ': 'Куплено',
    'РїСЂРµРґРјРµС‚РѕРІ': 'предметов',
    'Р·Р°': 'за',
    'РџРѕРєСѓРїРєР° СѓСЃРїРµС€РЅР°!': 'Покупка успешна!',
    'СЂСѓР±РёРЅРѕРІ': 'рубинов',
    'РћС€РёР±РєР°!': 'Ошибка!',
    'РЈРґР°Р»РµРЅРѕ': 'Удалено',
    'Р’С‹ РїРѕР»СѓС‡РёР»Рё': 'Вы получили',
    'РЅРѕРІС‹Р№ СѓСЂРѕРІРµРЅСЊ!': 'новый уровень!',
    'Р”РѕСЃС‚РёРіРЅСѓС‚ СѓСЂРѕРІРµРЅСЊ': 'Достигнут уровень',
};

for (const [mojibake, correct] of Object.entries(extraMap)) {
    content = content.replace(new RegExp(mojibake, 'g'), correct);
}

// Ensure the syntax error fix is applied even if mojibake varied
content = content.replace(/'монет\. : 'рубинов'/, "'монет.' : 'рубинов'");

fs.writeFileSync(filePath, content);
console.log("Fixed syntax error and extra mojibake in App.tsx");
