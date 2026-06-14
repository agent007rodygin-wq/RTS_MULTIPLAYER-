const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'Сталеплавильный завод');
const baseDest = path.join(__dirname, 'public', 'animation', 'steel_smelting');

// Each level has its own DefineSprite folder, all with identical structure:
// работает (working): frames 41-76 (36 frames, srcOffset=40)
// не работает (idle): frames 1-40 (40 frames, no offset)
const groups = [
  { id: 262, srcFolder: 'DefineSprite_153_anim.a262' },
  { id: 475, srcFolder: 'DefineSprite_153_anim.a475' },
  { id: 476, srcFolder: 'DefineSprite_153_anim.a476' },
  { id: 477, srcFolder: 'DefineSprite_153_anim.a477' },
  { id: 478, srcFolder: 'DefineSprite_153_anim.a478' },
  { id: 479, srcFolder: 'DefineSprite_153_anim.a479' },
  { id: 480, srcFolder: 'DefineSprite_153_anim.a480' },
  { id: 481, srcFolder: 'DefineSprite_153_anim.a481' },
  { id: 482, srcFolder: 'DefineSprite_153_anim.a482' },
  { id: 483, srcFolder: 'DefineSprite_153_anim.a483' },
  { id: 484, srcFolder: 'DefineSprite_153_anim.a484' },
  { id: 485, srcFolder: 'DefineSprite_153_anim.a485' },
  { id: 486, srcFolder: 'DefineSprite_153_anim.a486' },
];

const WORKING_FRAMES = 36;
const IDLE_FRAMES = 40;
const WORKING_SRC_OFFSET = 40; // working frames start at 41

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
  const destWorking = path.join(baseDest, String(group.id), 'working');
  const destIdle = path.join(baseDest, String(group.id), 'idle');

  console.log(`Copying ${group.id} working frames...`);
  copyFrames(srcWorking, destWorking, WORKING_FRAMES, WORKING_SRC_OFFSET);

  console.log(`Copying ${group.id} idle frames...`);
  copyFrames(srcIdle, destIdle, IDLE_FRAMES, 0);
}

console.log('Steel Smelting Factory animation frames copied successfully!');
