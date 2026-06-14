const fs = require('fs');
const path = require('path');

const baseSrc = path.join(__dirname, 'animation', 'заводы', 'нефтяные вышки', 'sprites');
const baseDest = path.join(__dirname, 'public', 'animation', 'oil_rig');

const variants = [
  { src: 'Одна нефтяная вышка.a15', dest: '15', frames: 56 },
  { src: 'две нефтяные вышки.a49', dest: '49', frames: 56 },
];

for (const variant of variants) {
  const srcDir = path.join(baseSrc, variant.src);
  const destDir = path.join(baseDest, variant.dest);
  fs.mkdirSync(destDir, { recursive: true });

  for (let i = 1; i <= variant.frames; i++) {
    fs.copyFileSync(path.join(srcDir, i + '.png'), path.join(destDir, i + '.png'));
  }
  console.log(`Copied ${variant.frames} frames to public/animation/oil_rig/${variant.dest}/`);
}

console.log('Oil rig animation frames copied successfully!');
