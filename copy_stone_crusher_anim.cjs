const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'камнедробилка', 'sprites');
const baseDest = path.join(__dirname, 'public', 'animation', 'stone_crusher');

const groups = [
  { srcFolder: 'DefineSprite_161_anim.a98',  destFolder: 'a98',  workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a409', destFolder: 'a409', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a410', destFolder: 'a410', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a411', destFolder: 'a411', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a412', destFolder: 'a412', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a455', destFolder: 'a455', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a456', destFolder: 'a456', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a457', destFolder: 'a457', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a458', destFolder: 'a458', workingFrames: 40, idleFrames: 40 },
  // a459 has swapped folders: "работает" contains idle frames (1-40), "не работает" contains working frames (41-80)
  { srcFolder: 'DefineSprite_161_anim.a459', destFolder: 'a459', workingFrames: 40, idleFrames: 40, workingSrc: 'не работает', idleSrc: 'работает' },
  { srcFolder: 'DefineSprite_161_anim.a460', destFolder: 'a460', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a461', destFolder: 'a461', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a462', destFolder: 'a462', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a463', destFolder: 'a463', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a464', destFolder: 'a464', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a465', destFolder: 'a465', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a466', destFolder: 'a466', workingFrames: 40, idleFrames: 40 },
  { srcFolder: 'DefineSprite_161_anim.a467', destFolder: 'a467', workingFrames: 40, idleFrames: 40 },
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
  const srcWorking = path.join(baseSrc, group.srcFolder, group.workingSrc || 'работает');
  const srcIdle = path.join(baseSrc, group.srcFolder, group.idleSrc || 'не работает');
  const destWorking = path.join(baseDest, group.destFolder, 'working');
  const destIdle = path.join(baseDest, group.destFolder, 'idle');

  console.log(`Copying ${group.destFolder} working frames...`);
  copyFrames(srcWorking, destWorking, group.workingFrames, 40);

  console.log(`Copying ${group.destFolder} idle frames...`);
  copyFrames(srcIdle, destIdle, group.idleFrames, 0);
}

console.log('Stone crusher animation frames copied successfully!');
