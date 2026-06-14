const fs = require('fs');

const bPath = 'data/buildings.ts';
let bContent = fs.readFileSync(bPath, 'utf8');

const replacement = `    description: 'Улучшенная лесопилка. Производит больше досок и чаще находит элитную древесину.',
    imageUrl: 'https://i.ibb.co/G4GQ4QST/56.png',
    upgradesTo: 391,
    upgradeCost: 24300,
  }`;

bContent = bContent.replace(/    description: 'Улучшенная лесопилка\. Производит больше досок и чаще находит элитную древесину\.',\r?\n    imageUrl: 'https:\/\/i\.ibb\.co\/G4GQ4QST\/56\.png'\r?\n  }/, replacement);

fs.writeFileSync(bPath, bContent, 'utf8');
console.log('buildings.ts updated.');

const appPath = 'App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');

const targetArray = '[400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 70, 71, 72, 73, 77, 78, 79, 80, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94, 102, 103, 104, 105, 106, 107, 109, 110, 111, 112, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 251, 252, 253, 254, 255, 256, 257, 258, 259, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 313, 314, 315, 316, 317, 318, 320, 321, 322, 323]';

const newArray = '[500, 56, 391, 392, 393, 394, 395, 396, 397, 398, 399, 453, 454, 468, 470, 471, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 70, 71, 72, 73, 77, 78, 79, 80, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94, 102, 103, 104, 105, 106, 107, 109, 110, 111, 112, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 251, 252, 253, 254, 255, 256, 257, 258, 259, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 313, 314, 315, 316, 317, 318, 320, 321, 322, 323]';

appContent = appContent.split(targetArray).join(newArray);
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('App.tsx updated.');
