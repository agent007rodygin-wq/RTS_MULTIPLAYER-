const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'animation', 'заводы', 'фабрика рекомендаций', 'DefineSprite_61_anim.a330');
const dest = path.join(__dirname, 'public', 'animation', 'recommendation_factory');

fs.mkdirSync(dest, { recursive: true });

for (let i = 1; i <= 30; i++) {
  fs.copyFileSync(path.join(src, i + '.png'), path.join(dest, i + '.png'));
}

console.log('Copied 30 frames to public/animation/recommendation_factory/');
