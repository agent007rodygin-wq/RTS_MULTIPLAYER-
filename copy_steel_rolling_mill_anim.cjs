const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Сталепрокатный завод');
const baseDest = path.join(__dirname, 'public', 'animation', 'steel_rolling_mill');

const groups = [
  {
    srcFolder: 'Сталепрокатный завод  с 1 по 5 уровень 853',
    destFolder: '853',
    workingFrames: 80,
    idleFrames: 39,
    idleSrcOffset: 80, // idle frames start at 81
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Сталепрокатный завод  с 6 по 10 уровень  858',
    destFolder: '858',
    workingFrames: 55,
    idleFrames: 64,
    idleSrcOffset: 55, // idle frames start at 56
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Сталепрокатный завод  с 11 по 15 уровень  863',
    destFolder: '863',
    workingFrames: 80,
    idleFrames: 39,
    idleSrcOffset: 80,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Сталепрокатный завод  с 16 по 20 уровень 868',
    destFolder: '868',
    workingFrames: 80,
    idleFrames: 39,
    idleSrcOffset: 80,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Сталепрокатный завод  21 уровень 873',
    destFolder: '873',
    workingFrames: 80,
    idleFrames: 39,
    idleSrcOffset: 80,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
];

function copyFrames(srcDir, destDir, count, srcOffset = 0) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (let i = 1; i <= count; i++) {
    const srcNum = i + srcOffset;
    const srcFile = path.join(srcDir, `${srcNum}.png`);
    const destFile = path.join(destDir, `${i}.png`);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
    } else {
      console.warn(`Missing: ${srcFile}`);
    }
  }
}

for (const group of groups) {
  const srcWorking = path.join(baseSrc, group.srcFolder, group.workingSrc);
  const srcIdle = path.join(baseSrc, group.srcFolder, group.idleSrc);
  const destWorking = path.join(baseDest, group.destFolder, 'working');
  const destIdle = path.join(baseDest, group.destFolder, 'idle');

  console.log(`Copying ${group.destFolder} working frames...`);
  copyFrames(srcWorking, destWorking, group.workingFrames, 0);

  console.log(`Copying ${group.destFolder} idle frames...`);
  copyFrames(srcIdle, destIdle, group.idleFrames, group.idleSrcOffset);
}

console.log('Steel Rolling Mill animation frames copied successfully!');
