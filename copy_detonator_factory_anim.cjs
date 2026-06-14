const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Петардный завод');
const baseDest = path.join(__dirname, 'public', 'animation', 'detonator_factory');

// Groups: folder name, working frames, idle frames, working offset, idle offset
// For levels 1-6 (a307): no subfolders, 20 PNGs directly in folder (working only)
// For levels 7-22: subfolders "работает" (1-40) and "не работает" (41-80)
const groups = [
  { srcFolder: 'петардный завод с 1 по 6 уровень a307', destFolder: 'a307', workingFrames: 20, idleFrames: 0, workingSub: '', idleSub: '' },
  { srcFolder: 'петардный завод с 7 по 11 уровень 624', destFolder: '624', workingFrames: 40, idleFrames: 40, workingSub: 'работает', idleSub: 'не работает' },
  { srcFolder: 'петардный завод с 12 по 16 уровень 629', destFolder: '629', workingFrames: 40, idleFrames: 40, workingSub: 'работает', idleSub: 'не работает' },
  { srcFolder: 'петардный завод с 17 по 21 уровень 634', destFolder: '634', workingFrames: 40, idleFrames: 40, workingSub: 'работает', idleSub: 'не работает' },
  { srcFolder: 'петардный завод 22  уровень 639 (1)', destFolder: '639', workingFrames: 40, idleFrames: 40, workingSub: 'работает', idleSub: 'не работает' },
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
  // Working frames
  const srcWorking = group.workingSub
    ? path.join(baseSrc, group.srcFolder, group.workingSub)
    : path.join(baseSrc, group.srcFolder);
  const destWorking = path.join(baseDest, group.destFolder, 'working');
  console.log(`Copying ${group.destFolder} working frames...`);
  copyFrames(srcWorking, destWorking, group.workingFrames, 0);

  // Idle frames
  if (group.idleFrames > 0) {
    const srcIdle = path.join(baseSrc, group.srcFolder, group.idleSub);
    const destIdle = path.join(baseDest, group.destFolder, 'idle');
    console.log(`Copying ${group.destFolder} idle frames...`);
    copyFrames(srcIdle, destIdle, group.idleFrames, 40);
  }
}

console.log('Detonator factory animation frames copied successfully!');
