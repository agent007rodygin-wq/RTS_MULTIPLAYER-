const fs = require('fs');
const path = require('path');

const BASE_SRC = path.join(__dirname, 'animation', 'заводы', 'академия монстров');
const BASE_DST = path.join(__dirname, 'public', 'animation', 'monster_academy');

// Source folder -> group key, with subfolder names for working/idle
const groups = [
  {
    key: '689',
    src: path.join(BASE_SRC, 'Академия монстров с 1 по 5 уровень 689'),
    workingDir: 'когда работает',
    idleDir: 'когда не работает',
  },
  {
    key: '694',
    src: path.join(BASE_SRC, 'DefineSprite_61_anim.a694'),
    workingDir: 'когда работает',
    idleDir: 'когда не работает',
  },
  {
    key: '699',
    src: path.join(BASE_SRC, 'DefineSprite_61_anim.a699'),
    workingDir: 'когда работает',
    idleDir: 'когда не работает',
  },
  {
    key: '704',
    src: path.join(BASE_SRC, 'DefineSprite_61_anim.a704'),
    workingDir: 'когда работает',
    idleDir: 'когда не работает',
  },
  {
    key: '709',
    src: path.join(BASE_SRC, 'DefineSprite_61_anim.a709'),
    workingDir: 'когда работает',
    idleDir: 'когда не работет', // typo in original folder name
  },
];

function copyFrames(srcDir, dstDir) {
  if (!fs.existsSync(srcDir)) {
    console.log(`  SKIP (not found): ${srcDir}`);
    return 0;
  }
  fs.mkdirSync(dstDir, { recursive: true });

  // Read all png files, sort numerically
  const files = fs.readdirSync(srcDir)
    .filter(f => f.endsWith('.png'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  // Copy each file, renumbering from 1
  files.forEach((file, idx) => {
    const srcFile = path.join(srcDir, file);
    const dstFile = path.join(dstDir, `${idx + 1}.png`);
    fs.copyFileSync(srcFile, dstFile);
  });

  console.log(`  Copied ${files.length} frames to ${dstDir}`);
  return files.length;
}

const summary = {};

for (const group of groups) {
  console.log(`\nGroup ${group.key}:`);
  const workingCount = copyFrames(
    path.join(group.src, group.workingDir),
    path.join(BASE_DST, group.key, 'working')
  );
  const idleCount = copyFrames(
    path.join(group.src, group.idleDir),
    path.join(BASE_DST, group.key, 'idle')
  );
  summary[group.key] = { working: workingCount, idle: idleCount };
}

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));
