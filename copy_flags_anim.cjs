const fs = require('fs');
const path = require('path');

const srcBase = path.join(__dirname, 'animation', 'флаги');
const destBase = path.join(__dirname, 'public', 'animation', 'flags');

if (!fs.existsSync(destBase)) {
  fs.mkdirSync(destBase, { recursive: true });
}

const entries = fs.readdirSync(srcBase, { withFileTypes: true });
const folders = entries.filter(e => e.isDirectory());

let copiedTotal = 0;
let skippedTotal = 0;

for (const folder of folders) {
  const match = folder.name.match(/a(\d+)$/);
  if (!match) {
    console.warn(`Skipping unrecognized folder: ${folder.name}`);
    continue;
  }
  const id = match[1];
  const srcDir = path.join(srcBase, folder.name);
  const destDir = path.join(destBase, id);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
  let copied = 0;
  let skipped = 0;

  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    if (fs.existsSync(destFile)) {
      skipped++;
    } else {
      fs.copyFileSync(srcFile, destFile);
      copied++;
    }
  }

  copiedTotal += copied;
  skippedTotal += skipped;
  console.log(`Flag ${id}: copied ${copied}, skipped ${skipped} frames`);
}

console.log(`\nDone! Total copied: ${copiedTotal}, skipped (already exist): ${skippedTotal}`);
