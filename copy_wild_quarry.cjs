const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'animation', 'заводы', 'Дикая каменоломня', 'работа Дикая каменоломня .a99', 'работает');
const dest = path.join(__dirname, 'public', 'animation', 'wild_quarry');

fs.mkdirSync(dest, { recursive: true });

for (let i = 1; i <= 91; i++) {
  fs.copyFileSync(path.join(src, i + '.png'), path.join(dest, i + '.png'));
}

console.log('Copied 91 frames to public/animation/wild_quarry/');
