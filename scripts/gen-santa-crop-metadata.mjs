// Generate per-frame Santa walk crop metadata
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE = path.join(PROJECT_ROOT, 'public', 'animation', 'monsters', 'злой санта', 'DefineSprite_612_anim.a70002');

const DIRECTIONS = [
  { name: 'left',  subdir: 'идет в лево',  start: 190, count: 33 },
  { name: 'down',  subdir: 'идет в низ',   start: 154, count: 36 },
  { name: 'right', subdir: 'идет в право', start: 223, count: 45 },
  { name: 'up',    subdir: 'идет на верх', start: 268, count: 41 },
];

// Idle sprite native dimensions (used as reference for fixed crop window)
const IDLE_W = 156;
const IDLE_H = 181;
const IDLE_ASPECT = IDLE_H / IDLE_W;

async function measureFrame(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + (channels - 1)] > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bodyW = maxX - minX + 1;
  const bodyH = maxY - minY + 1;
  return {
    cx: minX + bodyW / 2,
    feetY: maxY,
    bodyW,
    bodyH,
  };
}

async function main() {
  let globalMaxBodyW = 0, globalMaxBodyH = 0;

  // Collect all frame data
  const allFrames = [];
  for (const dir of DIRECTIONS) {
    for (let i = 0; i < dir.count; i++) {
      const fn = dir.start + i;
      const filePath = path.join(BASE, dir.subdir, `${fn}.webp`);
      try {
        const r = await measureFrame(filePath);
        allFrames.push({
          url: `/animation/monsters/злой санта/DefineSprite_612_anim.a70002/${dir.subdir}/${fn}.webp`,
          ...r,
        });
        if (r.bodyW > globalMaxBodyW) globalMaxBodyW = r.bodyW;
        if (r.bodyH > globalMaxBodyH) globalMaxBodyH = r.bodyH;
      } catch (e) {
        console.error(`Missing: ${filePath}`);
      }
    }
  }

  // Fixed crop window matching idle aspect ratio, with margin
  const MARGIN = 3;
  const cropW = Math.max(globalMaxBodyW + MARGIN * 2, Math.ceil(globalMaxBodyH / IDLE_ASPECT));
  const cropH = Math.ceil(cropW * IDLE_ASPECT);

  console.error(`Global max body: ${globalMaxBodyW}x${globalMaxBodyH}`);
  console.error(`Crop window: ${cropW}x${cropH} (aspect ${(cropH/cropW).toFixed(3)} = idle ${IDLE_ASPECT.toFixed(3)})`);
  console.error(`Total frames: ${allFrames.length}`);

  // Build TS output
  const lines = [];
  lines.push(`// Auto-generated Santa walk frame crop metadata.`);
  lines.push(`// Crop window: ${cropW}x${cropH} (aspect matches idle ${IDLE_H}/${IDLE_W}).`);
  lines.push(`// Per frame: { cx, feetY } -- body center X and bottom opaque edge Y.`);
  lines.push(`// Render:`);
  lines.push(`//   sx = cx - ${cropW}/2   (center body horizontally)`);
  lines.push(`//   sy = feetY - ${cropH}  (align crop window bottom to feet)`);
  lines.push(`// Source crop (sx, sy, ${cropW}, ${cropH}) -> destination (dx, dy, dw, dh).`);
  lines.push(`// Feet anchor to destination bottom = tile base.`);
  lines.push(``);
  lines.push(`export const SANTA_WALK_CROP_WINDOW = { w: ${cropW}, h: ${cropH} } as const;`);
  lines.push(``);
  lines.push(`export const SANTA_WALK_FRAME_META: Record<string, { cx: number; feetY: number }> = {`);

  for (let i = 0; i < allFrames.length; i++) {
    const f = allFrames[i];
    const comma = i < allFrames.length - 1 ? ',' : '';
    lines.push(`  "${f.url}": { cx: ${f.cx.toFixed(1)}, feetY: ${f.feetY} }${comma}`);
  }

  lines.push(`};`);
  lines.push(``);

  const outPath = path.join(PROJECT_ROOT, 'src', 'game', 'monsters', 'santaWalkCropMetadata.ts');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf-8');
  console.error(`Wrote ${outPath} (${allFrames.length} frames)`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
