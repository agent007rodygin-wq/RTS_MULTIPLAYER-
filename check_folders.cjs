const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'animation', 'заводы', 'камнедробилка', 'sprites');
const dirs = fs.readdirSync(base).filter(x => x.startsWith('DefineSprite_161_anim.'));

for (const n of dirs) {
  const workDir = path.join(base, n, 'работает');
  const idleDir = path.join(base, n, 'не работает');
  const workFiles = fs.readdirSync(workDir).filter(x => x.endsWith('.png')).map(x => parseInt(x)).sort((a, b) => a - b);
  const idleFiles = fs.readdirSync(idleDir).filter(x => x.endsWith('.png')).map(x => parseInt(x)).sort((a, b) => a - b);
  const workStart = workFiles[0];
  const idleStart = idleFiles[0];
  console.log(`${n}: работает ${workStart}-${workFiles[workFiles.length-1]} (${workFiles.length}), не работает ${idleStart}-${idleFiles[idleFiles.length-1]} (${idleFiles.length})`);
}
