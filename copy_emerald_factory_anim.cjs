const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Изумрудный завод');
const baseDest = path.join(__dirname, 'public', 'animation', 'emerald_factory');

const groups = [
  {
    srcFolder: 'Изумрудный завод с 1 по 5 уровень 640',
    destFolder: '640',
    workingFrames: 40,
    idleFrames: 40,
    idleSrcOffset: 40, // idle frames start at 41
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Изумрудный завод с 6 по 10 уровень 645',
    destFolder: '645',
    workingFrames: 40,
    idleFrames: 40,
    idleSrcOffset: 40,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Изумрудный завод - 11 по 15 650',
    destFolder: '650',
    workingFrames: 40,
    idleFrames: 40,
    idleSrcOffset: 40,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Изумрудный завод - 16 по 20 655',
    destFolder: '655',
    workingFrames: 40,
    idleFrames: 40,
    idleSrcOffset: 40,
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Изумрудный завод - 21 660',
    destFolder: '660',
    workingFrames: 40,
    idleFrames: 40,
    idleSrcOffset: 40,
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

console.log('Emerald Factory animation frames copied successfully!');
