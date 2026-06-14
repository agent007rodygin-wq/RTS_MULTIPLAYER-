const fs = require('fs');

const input = fs.readFileSync('scratch/input_cannons.txt', 'utf8');
const blocks = input.split('=======================================================================================================').map(b => b.trim()).filter(b => b.length > 0);

const idMap = {
    '10001': 'Дерево',
    '10002': 'Доски',
    '10035': 'Элитная древесина',
    '10036': 'Изумрудная руда',
    '10034': 'Изумруды',
    '10044': 'Самородок',
    '10026': 'Золото',
    '10023': 'Сталь',
    '10040': 'Стальной лист',
    '10022': 'Железная руда',
    '10013': 'Петарда',
    '10017': 'Детонатор',
    '10042': 'Супер детонатор',
    '10007': 'Яйцо избушки',
    '999': 'монеты',
    '10011': 'Садовая супер бомба',
    '10003': 'Супер гриб',
    '10012': 'MGM-52 «Ланс»',
    '10010': 'Садовая бомба',
    '10043': 'Суператомная бомба',
    '10016': 'Атомная бомба', // Атомная бомба «Снежинка»
    '10025': 'Супер подсолнух',
    '10004': 'Супер лилия',
    '10048': 'Каменные блоки',
    '10005': 'Супер тыква',
    '10006': 'Яйцо Горыныча',
    '10028': 'Камни'
};

const revIdMap = {};
for (const [k, v] of Object.entries(idMap)) {
    revIdMap[v.toLowerCase()] = Number(k);
}
revIdMap['атомная бомба'] = 10016;
revIdMap['самородок'] = 10044;
revIdMap['стальной лист'] = 10040;
revIdMap['изумрудная руда'] = 10036;

function parseTimeSpec(timeStr) {
    if (!timeStr) return 0;
    let seconds = 0;
    const monthsMatch = timeStr.match(/(\d+)\s*месяц/i);
    const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
    const daysMatch = timeStr.match(/(\d+)\s*дн/i) || timeStr.match(/(\d+)\s*день/i) || timeStr.match(/(\d+)\s*дня/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hoursMatch = timeStr.match(/(\d+)\s*час/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutesMatch = timeStr.match(/(\d+)\s*минут/i);
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    const secondsMatch = timeStr.match(/(\d+)\s*секунд/i) || timeStr.match(/(\d+)\s*cекунд/i);
    const sec = secondsMatch ? parseInt(secondsMatch[1]) : 0;
    seconds += months * 30 * 24 * 3600;
    seconds += days * 24 * 3600;
    seconds += hours * 3600;
    seconds += minutes * 60;
    seconds += sec;
    return seconds;
}

const buildings = [];

blocks.forEach((block, idx) => {
    try {
        const lines = block.split('\n').map(l => l.trim());
        let idLine = lines[1].match(/ID:\s*(\d+)/i);
        let idStr = idLine ? idLine[1] : null;
        if (!idStr) return;
        let id = Number(idStr);

        const nameMatch = lines[0].match(/^(.*?)(?:-|$)/);
        let name = nameMatch ? nameMatch[1].trim() : `Пушка ${idx + 3}`;
        
        let reqTextMatch = block.match(/Ресурсы необходимые для постройки:(.*?)$/m);
        let reqText = reqTextMatch ? reqTextMatch[1] : '';
        let req = [];
        if (reqText) {
            reqText.split(',').forEach(part => {
                const match = part.match(/([а-яА-ЯёЁ\s]+)\s*-\s*(\d+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2]);
                    const rid = revIdMap[rname];
                    if (rid) req.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                    else console.error("Unknown resource: " + rname);
                }
            });
        }
        
        let priceMatch = block.match(/Цена:\s*([\d\s]+)\s*моне/i);
        let price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, '')) : 0;

        const popBuildMatch = block.match(/Население для постройки\s*-\s*(\d+)/i);
        const popBuild = popBuildMatch ? parseInt(popBuildMatch[1]) : 0;
        
        const buildTimeStrMatch = block.match(/Время строительства:\s*(.*?)$/m);
        const buildSecs = buildTimeStrMatch ? parseTimeSpec(buildTimeStrMatch[1]) : 0;
        
        const accelStrMatch = block.match(/Ускорение строительства\s*-\s*(\d+)/i);
        const accel = accelStrMatch ? parseInt(accelStrMatch[1]) : 0;
        
        const hpMatch = block.match(/Прочность:\s*([\d\s]+)/i);
        const hp = hpMatch ? parseInt(hpMatch[1].replace(/\s/g, '')) : 0;

        const damageMatch = block.match(/Наносит урон:\s*(\d+)/i);
        const damage = damageMatch ? damageMatch[1] : '0';

        const gloryMatch = block.match(/Даёт славы при взрыве:\s*([\d\s]+)/i);
        const glory = gloryMatch ? parseInt(gloryMatch[1].replace(/\s/g, '')) : 0;
        
        const freqTextMatch = block.match(/Выпадает часто:(.*?)$/m);
        let freq = [];
        if (freqTextMatch) {
            freqTextMatch[1].split(',').forEach(part => {
                const match = part.match(/([а-яА-ЯёЁ\s]+)\s*-\s*([\d\s]+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2].replace(/\s/g, ''));
                    const rid = revIdMap[rname];
                    if (rid) freq.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                    else if (rname === 'монеты') freq.push({ id: 999, name: 'Монеты', amount: amt });
                }
            });
        }
        
        const rareTextMatch = block.match(/Выпадает редко:(.*?)$/m);
        let rare = [];
        if (rareTextMatch) {
            rareTextMatch[1].split(',').forEach(part => {
                const match = part.match(/([а-яА-ЯёЁ\s]+)\s*-\s*([\d\s]+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2].replace(/\s/g, ''));
                    const rid = revIdMap[rname];
                    if (rid) rare.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                }
            });
        }

        let upgradesToStrMatch = block.match(/Улучшается до постройки\s*-\s*(\d+)/i);
        let upgradesTo = upgradesToStrMatch ? parseInt(upgradesToStrMatch[1]) : null;

        const destructionInfo = [];
        
        const destrMatches = block.split('Чтобы взорвать');
        for (let j=1; j<destrMatches.length; j++) {
            const dBlock = destrMatches[j];
            const wNameMatch = dBlock.match(/«[^»]+»\s*([а-яА-Я]+\s*[а-яА-Я]*)\s*потребуется:/i);
            if (!wNameMatch) continue;
            let wt = wNameMatch[1].trim().toLowerCase();
            let weapId = 0, weapNm = '';
            if (wt.includes('петард')) { weapId = 10013; weapNm = 'Петарда'; }
            else if (wt.includes('суперсадов')) { weapId = 10011; weapNm = 'Садовая супер бомба'; }
            else if (wt.includes('садовк')) { weapId = 10010; weapNm = 'Садовая бомба'; }
            else if (wt.includes('ланс')) { weapId = 10012; weapNm = 'MGM-52 «Ланс»'; }
            else if (wt.includes('суператомк')) { weapId = 10043; weapNm = 'Суператомная бомба'; }
            else if (wt.includes('атомк')) { weapId = 10016; weapNm = 'Атомная бомба «Снежинка»'; }

            const amtMatch = dBlock.match(/(\d+[\s\d]*)\s*(?:петард|садовок|лансов|суперсадовок|атомок|суператомок|петарды)/i);
            const amtD = amtMatch ? parseInt(amtMatch[1].replace(/\s/g, '')) : 0;

            const coinMatch = dBlock.match(/(\d+[\s\d]*)\s*монет/i);
            const coinsD = coinMatch ? parseInt(coinMatch[1].replace(/\s/g, '')) : 0;

            const enMatch = dBlock.match(/(\d+[\s\d]*)\s*энергии/i);
            const energyD = enMatch ? parseInt(enMatch[1].replace(/\s/g, '')) : 0;

            const timeMatch = dBlock.match(/([\s\dа-яА-Я]+времени)/im);
            const timeD = timeMatch ? parseTimeSpec(timeMatch[1]) : 0;

            let damage = hp;
            if (weapId === 10013) damage = 6;
            else if (weapId === 10010) damage = 79;
            else if (weapId === 10011) damage = 576;
            else if (weapId === 10012) damage = 384;
            else if (weapId === 10016) damage = Math.ceil(hp/amtD);
            else if (weapId === 10043) damage = Math.ceil(hp/amtD);

            if (weapId === 10013 && amtD > 0) damage = Math.ceil(hp/amtD);

            destructionInfo.push({
                resourceId: weapId,
                weaponName: weapNm,
                amount: amtD,
                goldCost: coinsD,
                energyCost: energyD,
                timeSeconds: timeD,
                damage: damage
            });
        }

        let obj = {
            id: id,
            name: name,
            englishName: `Cannon ${name.replace('Пушка', '').trim() || (idx + 3)}`,
            category: 'Защита',
            type: 'BuildingType.Default',
            price: price,
            buildable: false,
            constructionRequirements: {
                population: popBuild,
                resources: req
            },
            stats: {
                constructionTimeSeconds: buildSecs,
                accelerationCost: accel,
                durability: hp,
                gloryOnExplosion: glory,
                damage: damage,
                workTimeSeconds: 5,
                givesCoins: idx === 0 ? 2268 : (freq.find(x => x.id === 999)?.amount || 100)
            },
            drops: {
                frequent: freq,
                rare: rare
            },
            destructionInfo: destructionInfo,
            description: 'Оборонительное сооружение. Наносит урон врагам.',
            imageUrl: `https://i.ibb.co/temp/${id}.png`,
        };
        if (upgradesTo) {
            obj.upgradesTo = upgradesTo;
        }

        const urls = {
            365: 'https://i.ibb.co/SXygqQ59/365.png',
            366: 'https://i.ibb.co/WT8Kzd3/366.png',
            367: 'https://i.ibb.co/JVvCzGX/367.png',
            368: 'https://i.ibb.co/LX5zDZ6K/368.png',
            369: 'https://i.ibb.co/pB4zg50T/369.png',
            370: 'https://i.ibb.co/LzP3gGBZ/370.png',
            382: 'https://i.ibb.co/q38w5czd/382.png',
            383: 'https://i.ibb.co/ks5SySGt/383.png',
            384: 'https://i.ibb.co/6c17Z1DV/384.png',
            385: 'https://i.ibb.co/Xxrn4VKw/385.png',
        };
        if (urls[id]) obj.imageUrl = urls[id];

        buildings.push(obj);

    } catch(e) {
        console.error("Error at block " + idx, e);
    }
});

let dump = JSON.stringify(buildings, null, 2).replace(/"(BuildingType\.Default)"/g, '$1');
fs.writeFileSync('scratch/out_cannons.ts', dump);
console.log("Buildings loaded: " + buildings.length);
