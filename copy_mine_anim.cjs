const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Шахта');
const baseDest = path.join(__dirname, 'public', 'animation', 'mine');

const groups = [
  {
    srcFolder: 'Шахта с 1 по 10 уровень 668',
    destFolder: '668',
    workingFrames: 82,
    idleFrames: 37,
    idleSrcOffset: 82, // idle frames start at 83
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Шахта с 11 по 15 уровень 678',
    destFolder: '678',
    workingFrames: 86,
    idleFrames: 39,
    idleSrcOffset: 86, // idle frames start at 87
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Шахта с 16 по 20 уровень 683',
    destFolder: '683',
    workingFrames: 86,
    idleFrames: 39,
    idleSrcOffset: 86, // idle frames start at 87
    workingSrc: 'работает',
    idleSrc: 'не работает',
  },
  {
    srcFolder: 'Шахта 21 уровень 688',
    destFolder: '688',
    workingFrames: 86,
    idleFrames: 39,
    idleSrcOffset: 86, // idle frames start at 87
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

console.log('Mine animation frames copied successfully!');
