const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Пруд с лилиями');
const baseDest = path.join(__dirname, 'public', 'animation', 'lily_pond');

const groups = [
  {
    srcFolder: 'Пруд с лилиями с 1 по 5 уровень 577',
    destFolder: '577',
    ids: [577, 578, 579, 580, 581],
    workingFrames: 40,
    idleFrames: 40,
  },
  {
    srcFolder: 'Пруд с лилиями уровень - 6 по 10 582',
    destFolder: '582',
    ids: [582, 583, 584, 585, 586],
    workingFrames: 40,
    idleFrames: 40,
  },
  {
    srcFolder: 'Пруд с лилиями уровень - 11 по 15 587',
    destFolder: '587',
    ids: [587, 588, 589, 590, 591],
    workingFrames: 40,
    idleFrames: 40,
  },
  {
    srcFolder: 'Пруд с лилиями уровень - 16 по 20  592',
    destFolder: '592',
    ids: [592, 593, 594, 595, 596],
    workingFrames: 40,
    idleFrames: 40,
  },
  {
    srcFolder: 'Пруд с лилиями уровень - 21 597',
    destFolder: '597',
    ids: [597],
    workingFrames: 40,
    idleFrames: 40,
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
  const srcWorking = path.join(baseSrc, group.srcFolder, 'работает');
  const srcIdle = path.join(baseSrc, group.srcFolder, 'не работает');
  const destWorking = path.join(baseDest, group.destFolder, 'working');
  const destIdle = path.join(baseDest, group.destFolder, 'idle');

  console.log(`Copying ${group.destFolder} working frames...`);
  copyFrames(srcWorking, destWorking, group.workingFrames, 40);

  console.log(`Copying ${group.destFolder} idle frames...`);
  copyFrames(srcIdle, destIdle, group.idleFrames, 0);
}

console.log('Lily pond animation frames copied successfully!');
