const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Золотоплавильный завод');
const baseDest = path.join(__dirname, 'public', 'animation', 'gold_smelter');

// Level 1: working only (80 frames, flat directory)
const level1Src = path.join(baseSrc, 'Золотоплавильный завод 1 уровня 266');
const level1Dest = path.join(baseDest, '266', 'working');

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

// Copy level 1 working frames (80 frames, 1-80)
console.log('Copying 266 working frames (level 1)...');
copyFrames(level1Src, level1Dest, 80, 0);

// Levels 2+: working + idle states
// работает frames start at 41 (srcOffset=40), не работает frames start at 1 (no offset)
const groups = [
  {
    srcFolder: 'Золотоплавильный завод уровень 2 - 5 557',
    destFolder: '557',
    workingFrames: 35,
    idleFrames: 40,
    workingSrcOffset: 40, // working frames start at 41
  },
  {
    srcFolder: 'Золотоплавильный завод уровень 6-10 id561',
    destFolder: '561',
    workingFrames: 35,
    idleFrames: 40,
    workingSrcOffset: 40,
  },
  {
    srcFolder: 'Золотоплавильный завод уровень 11-15  566',
    destFolder: '566',
    workingFrames: 35,
    idleFrames: 40,
    workingSrcOffset: 40,
  },
  {
    srcFolder: 'Золотоплавильный завод уровень 16 - 20  id 571',
    destFolder: '571',
    workingFrames: 35,
    idleFrames: 40,
    workingSrcOffset: 40,
  },
  {
    srcFolder: 'Золотоплавильный завод уровень - 21_id 576',
    destFolder: '576',
    workingFrames: 35,
    idleFrames: 40,
    workingSrcOffset: 40,
  },
];

for (const group of groups) {
  const srcWorking = path.join(baseSrc, group.srcFolder, 'работает');
  const srcIdle = path.join(baseSrc, group.srcFolder, 'не работает');
  const destWorking = path.join(baseDest, group.destFolder, 'working');
  const destIdle = path.join(baseDest, group.destFolder, 'idle');

  console.log(`Copying ${group.destFolder} working frames...`);
  copyFrames(srcWorking, destWorking, group.workingFrames, group.workingSrcOffset);

  console.log(`Copying ${group.destFolder} idle frames...`);
  copyFrames(srcIdle, destIdle, group.idleFrames, 0); // idle frames start at 1
}

console.log('Gold Smelter animation frames copied successfully!');
