const fs = require('fs');

const input = fs.readFileSync('scratch/input.txt', 'utf8');
const blocks = input.split('--------------------------------------------------------------------------------------------').map(b => b.trim()).filter(b => b.length > 0);

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
    '10016': 'Атомная бомба «Снежинка»'
};

const revIdMap = {};
for (const [k, v] of Object.entries(idMap)) {
    revIdMap[v.toLowerCase()] = Number(k);
}
revIdMap['яйцо избушки-убийцы'] = 10007;

const remapId = {
    400: 393,
    401: 394,
    402: 395,
    403: 396,
    404: 397,
    405: 398,
    406: 399
};

function parseTimeSpec(timeStr) {
    if (!timeStr) return 0;
    let seconds = 0;
    const monthsMatch = timeStr.match(/(\d+)\s*месяц/i);
    const months = monthsMatch ? parseInt(monthsMatch[1]) : 0;
    const daysMatch = timeStr.match(/(\d+)\s*дн/i) || timeStr.match(/(\d+)\s*день/i);
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
        let idLine = lines[0].match(/ID:\s*(\d+)/i);
        let idStr = idLine ? idLine[1] : null;
        if (!idStr) return;
        let id = Number(idStr);
        let origId = id;
        if (remapId[id]) {
            id = remapId[id];
        }

        const nameMatch = lines[0].match(/^(.*?)\s*-/);
        let name = nameMatch ? nameMatch[1].trim() : `Лесопилка ${idx + 3}`;
        // replace - with englishName
        const engMatch = lines[0].match(/-\s*(.*?)\s*ID:/);
        let englishName = engMatch ? engMatch[1].trim() : `Sawmill ${idx + 3}`;

        let price = parseInt((block.match(/Цена:\s*([\d\s]+)\s*моне/i) || [])[1].replace(/\s/g, ''));
        
        let reqText = (block.match(/Ресурсы необходимые для постройки:(.*?)$/m) || [])[1];
        let req = [];
        if (reqText) {
            reqText.split(',').forEach(part => {
                const match = part.match(/([а-яА-Я\s]+)\s*-\s*(\d+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2]);
                    const rid = revIdMap[rname];
                    if (rid) req.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                    else console.error("Unknown resource: " + rname);
                }
            });
        }
        
        const popBuild = parseInt((block.match(/Население для постройки\s*-\s*(\d+)/i) || [])[1]);
        const popWork = parseInt((block.match(/Занимает населения для работы\s*-(\d+)/i) || [])[1]);
        
        const buildTimeStr = (block.match(/Время строительства:\s*(.*?)$/m) || [])[1];
        const buildSecs = parseTimeSpec(buildTimeStr);
        
        const accelStr = (block.match(/Ускорение строительства\s*-\s*(\d+)/i) || [])[1];
        const accel = parseInt(accelStr);
        
        const workTimeStr = (block.match(/Время работы без статуи:\s*(.*?)$/m) || [])[1];
        const workSecs = parseTimeSpec(workTimeStr);
        
        const yields = parseInt((block.match(/Даёт монет\s*-\s*(\d+)/i) || [])[1]);
        
        const prodText = (block.match(/Производит:(.*?)$/m) || [])[1];
        let prod = [];
        if (prodText) {
            prodText.split(',').forEach(part => {
                const match = part.match(/([а-яА-Я\s]+)\s*-\s*(\d+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2]);
                    const rid = revIdMap[rname];
                    if (rid) prod.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                }
            });
        }

        const sometimesText = (block.match(/Иногда производит:(.*?)$/m) || [])[1];
        let sometimes = [];
        if (sometimesText) {
            sometimesText.split(';').forEach(part => {
                const match = part.match(/([а-яА-Я\s]+)\(шанс произвести\s*-\s*([\d.]+)%\)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const chance = parseFloat(match[2]);
                    const rid = revIdMap[rname];
                    if (rid) sometimes.push({ id: rid, name: idMap[rid] || rname, chance: chance });
                }
            });
        }

        const consumesText = (block.match(/Потребляет:(.*?)$/m) || [])[1];
        let consumes = [];
        if (consumesText) {
            consumesText.split(',').forEach(part => {
                const match = part.match(/([а-яА-Я\s]+)\s*-\s*(\d+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2]);
                    const rid = revIdMap[rname];
                    if (rid) consumes.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                }
            });
        }

        const hp = parseInt((block.match(/Прочность:\s*([\d\s]+)/i) || [])[1].replace(/\s/g, ''));
        const glory = parseInt((block.match(/Даёт славы при взрыве:\s*([\d\s]+)/i) || [])[1].replace(/\s/g, ''));
        
        const freqText = (block.match(/Выпадает часто:(.*?)$/m) || [])[1];
        let freq = [];
        if (freqText) {
            freqText.split(',').forEach(part => {
                const match = part.match(/([а-яА-Я\s]+)\s*-\s*([\d\s]+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2].replace(/\s/g, ''));
                    const rid = revIdMap[rname];
                    if (rid) freq.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                    else if (rname === 'монеты') freq.push({ id: 999, name: 'Монеты', amount: amt });
                }
            });
        }
        const rareText = (block.match(/Выпадает редко:(.*?)$/m) || [])[1];
        let rare = [];
        if (rareText) {
            rareText.split(',').forEach(part => {
                const match = part.match(/([а-яА-Я\s]+)\s*-\s*([\d\s]+)/i);
                if (match) {
                    const rname = match[1].trim().toLowerCase();
                    const amt = parseInt(match[2].replace(/\s/g, ''));
                    const rid = revIdMap[rname];
                    if (rid) rare.push({ id: rid, name: idMap[rid] || rname, amount: amt });
                }
            });
        }

        let upgradesToStr = (block.match(/Улучшается до постройки\s*-\s*(\d+)/i) || [])[1];
        let upgradesTo = null;
        if (upgradesToStr) {
            let n = parseInt(upgradesToStr);
            upgradesTo = remapId[n] ? remapId[n] : n;
        }

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
            const amtD = parseInt(amtMatch[1].replace(/\s/g, ''));

            const coinMatch = dBlock.match(/(\d+[\s\d]*)\s*монет/i);
            const coinsD = parseInt(coinMatch[1].replace(/\s/g, ''));

            const enMatch = dBlock.match(/(\d+[\s\d]*)\s*энергии/i);
            const energyD = parseInt(enMatch[1].replace(/\s/g, ''));

            const timeMatch = dBlock.match(/([\s\dа-яА-Я]+времени)/im);
            const timeD = timeMatch ? parseTimeSpec(timeMatch[1]) : 0;

            let damage = hp;
            if (weapId === 10013) damage = 6;
            else if (weapId === 10010) damage = 79;
            else if (weapId === 10011) damage = 576;
            else if (weapId === 10012) damage = 384;
            else if (weapId === 10016) damage = Math.floor(hp/amtD); // rough
            else if (weapId === 10043) damage = Math.floor(hp/amtD); // rough

            if (weapId === 10043) damage = Math.ceil(hp/amtD);
            if (weapId === 10016) damage = Math.ceil(hp/amtD);

            if (weapId === 10013) {
            	damage = Math.ceil(hp/amtD);
            }

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
            englishName: englishName,
            category: 'Заводы',
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
                takesPopulation: popWork,
                workTimeSeconds: workSecs,
                workYieldGold: yields,
                givesCoins: idx == 0 ? 2268 : freq.find(x => x.id === 999)?.amount || 1000,
                produces: prod,
                sometimesProduces: sometimes,
                consumes: consumes
            },
            drops: {
                frequent: freq,
                rare: rare
            },
            destructionInfo: destructionInfo,
            description: `Улучшенная ${name}. Производит доски и добывает элитную древесину.`,
            imageUrl: `https://i.ibb.co/temp/${origId}.png`,
        };
        if (upgradesTo) {
            obj.upgradesTo = upgradesTo;
        }

        if (origId === 453) obj.imageUrl = 'https://i.ibb.co/DHP5mRR2/453.png';
        if (origId === 454) obj.imageUrl = 'https://i.ibb.co/S4f64hD7/454.png';
        if (origId === 468) obj.imageUrl = 'https://i.ibb.co/mCMPcJLj/468.png';
        if (origId === 470) obj.imageUrl = 'https://i.ibb.co/LzsjrRB6/470.png';
        if (origId === 471) obj.imageUrl = 'https://i.ibb.co/ZRqTG5FF/471.png';
        // For 391..406, the prompt says the URLs are https://i.ibb.co/.../391.png
        const urls = {
            391: 'https://i.ibb.co/psyPYWH/391.png',
            392: 'https://i.ibb.co/PZ10cktL/392.png',
            400: 'https://i.ibb.co/fdtZDHLJ/400.png',
            401: 'https://i.ibb.co/9HGKjYVj/401.png',
            402: 'https://i.ibb.co/6Vpn5jy/402.png',
            403: 'https://i.ibb.co/fz9B2rN4/403.png',
            404: 'https://i.ibb.co/tpwB241n/404.png',
            405: 'https://i.ibb.co/XZmDqtkK/405.png',
            406: 'https://i.ibb.co/Pv7T8749/406.png',
        };
        if (urls[origId]) obj.imageUrl = urls[origId];

        buildings.push(obj);

    } catch(e) {
        console.error("Error at block " + idx, e);
    }
});

let dump = JSON.stringify(buildings, null, 2).replace(/"(BuildingType\.Default)"/g, '$1');
fs.writeFileSync('scratch/out.ts', dump);
console.log("Buildings loaded: " + buildings.length);
