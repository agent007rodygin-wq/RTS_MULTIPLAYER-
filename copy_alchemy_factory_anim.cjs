const fs = require('fs');
const path = require('path');

const srcBase = path.join(__dirname, 'animation', 'заводы', 'алхим завод');
const destBase = path.join(__dirname, 'public', 'animation', 'alchemy_factory');

// Mapping: building ID → source folder name, working frame count, idle frame count, idle start number
const buildings = [
  { id: 615,  folder: 'DefineSprite_219_anim.a16',  workingFrames: 69, idleStart: 70,  idleFrames: 40 },
  { id: 419,  folder: 'DefineSprite_219_anim.a419', workingFrames: 69, idleStart: 70,  idleFrames: 40 },
  { id: 420,  folder: 'DefineSprite_233_anim.a420', workingFrames: 76, idleStart: 77,  idleFrames: 40 },
  { id: 421,  folder: 'DefineSprite_233_anim.a421', workingFrames: 76, idleStart: 77,  idleFrames: 40 },
  { id: 422,  folder: 'DefineSprite_233_anim.a422', workingFrames: 76, idleStart: 77,  idleFrames: 40 },
  { id: 423,  folder: 'DefineSprite_213_anim.a423', workingFrames: 66, idleStart: 67,  idleFrames: 40 },
  { id: 424,  folder: 'DefineSprite_213_anim.a424', workingFrames: 66, idleStart: 67,  idleFrames: 40 },
  { id: 425,  folder: 'DefineSprite_213_anim.a425', workingFrames: 66, idleStart: 67,  idleFrames: 40 },
  { id: 426,  folder: 'DefineSprite_213_anim.a426', workingFrames: 66, idleStart: 67,  idleFrames: 40 },
  { id: 427,  folder: 'DefineSprite_213_anim.a427', workingFrames: 66, idleStart: 67,  idleFrames: 40 },
  { id: 428,  folder: 'DefineSprite_213_anim.a428', workingFrames: 65, idleStart: 66,  idleFrames: 41 },
  { id: 429,  folder: 'DefineSprite_213_anim.a429', workingFrames: 66, idleStart: 67,  idleFrames: 40 },
];

for (const b of buildings) {
  const workingDest = path.join(destBase, String(b.id), 'working');
  const idleDest = path.join(destBase, String(b.id), 'idle');
  fs.mkdirSync(workingDest, { recursive: true });
  fs.mkdirSync(idleDest, { recursive: true });

  const workingSrc = path.join(srcBase, b.folder, 'работает');
  const idleSrc = path.join(srcBase, b.folder, 'не работает');

  // Copy working frames: source 1..N → dest 1..N
  for (let i = 1; i <= b.workingFrames; i++) {
    const src = path.join(workingSrc, `${i}.png`);
    const dest = path.join(workingDest, `${i}.png`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      console.warn(`MISSING working frame: ${src}`);
    }
  }

  // Copy idle frames: source idleStart..idleStart+idleFrames-1 → dest 1..idleFrames
  for (let i = 0; i < b.idleFrames; i++) {
    const srcNum = b.idleStart + i;
    const src = path.join(idleSrc, `${srcNum}.png`);
    const dest = path.join(idleDest, `${i + 1}.png`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    } else {
      console.warn(`MISSING idle frame: ${src}`);
    }
  }

  console.log(`✓ ID ${b.id}: ${b.workingFrames} working + ${b.idleFrames} idle frames copied`);
}

console.log('\nDone! All alchemy factory animation frames copied.');
