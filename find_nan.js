const fs = require('fs');
const files = ['App.tsx', 'components/IconComponents.tsx', 'data/buildings.ts'];
files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('11.4')) {
           console.log(`Found 11.4 in ${file}`);
        }
        if (content.includes('NaN')) {
           console.log(`Found NaN in ${file}`);
        }
    } catch (e) {}
});
