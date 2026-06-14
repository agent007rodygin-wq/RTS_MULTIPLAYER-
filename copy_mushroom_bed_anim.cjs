const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Грибная грядка', 'sprites');
const baseDest = path.join(__dirname, 'public', 'animation', 'mushroom_bed');

const groups = [
  {
    srcFolder: 'с 1 по 5  уровень вот такая .774',
    destFolder: '774',
    workingFrames: 40,
    idleFrames: 40,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'с 6 по 10 уровень вот такая анимация.779',
    destFolder: '779',
    workingFrames: 40,
    idleFrames: 40,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'с 11 по 15 уровень.784',
    destFolder: '784',
    workingFrames: 39,
    idleFrames: 41,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'с 16 по 20 уровень.a789',
    destFolder: '789',
    workingFrames: 40,
    idleFrames: 40,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'анимация для 21 уровня.a794',
    destFolder: '794',
    workingFrames: 40,
    idleFrames: 40,
    workingSrc: 'работет', // typo in source folder name
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
  copyFrames(srcIdle, destIdle, group.idleFrames, 40);
}

console.log('Mushroom bed animation frames copied successfully!');
