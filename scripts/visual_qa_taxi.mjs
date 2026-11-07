import { chromium } from '/home/uro/Рабочий стол/aiagent/pithagoras/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const OUT_DIR = '/home/uro/Рабочий стол/my projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/dist/Gui/TaxiGui/new';
const COORDS_FILE = path.join(OUT_DIR, 'taxi_gui_layout_coordinates.json');

async function run() {
    const coordsData = JSON.parse(fs.readFileSync(COORDS_FILE, 'utf8'));
    const elementsRef = coordsData.elements;

    console.log('Launching Playwright Chromium...');
    const browser = await chromium.launch({
        executablePath: '/home/uro/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage({
        viewport: { width: 1200, height: 1312 },
        deviceScaleFactor: 1
    });

    const url = 'http://localhost:3000/preview_taxo.html?level=5&state=idle&unscaled=true';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait a moment for all images and webfonts to settle
    await page.waitForTimeout(2000);

    const container = await page.$('#taxi-gui-modal-container');
    if (!container) {
        throw new Error('Container #taxi-gui-modal-container not found!');
    }

    const containerBox = await container.boundingBox();
    console.log('Modal Container Box:', containerBox);

    // Screenshot modal container
    const actualScreenshotPath = path.join(OUT_DIR, 'actual_1200x1312.png');
    await container.screenshot({ path: actualScreenshotPath });
    console.log(`Saved screenshot to ${actualScreenshotPath}`);

    // Measure all 33 elements
    const results = [];
    for (const [key, ref] of Object.entries(elementsRef)) {
        const el = await page.$(`#${key}`);
        if (!el) {
            results.push({
                id: key,
                label: ref.label,
                ref_x: ref.x, ref_y: ref.y, ref_w: ref.w, ref_h: ref.h,
                actual_x: null, actual_y: null, actual_w: null, actual_h: null,
                dx: null, dy: null, dw: null, dh: null,
                deviation: 'NOT FOUND'
            });
            continue;
        }

        const box = await el.boundingBox();
        const actual_x = Math.round(box.x - containerBox.x);
        const actual_y = Math.round(box.y - containerBox.y);
        const actual_w = Math.round(box.width);
        const actual_h = Math.round(box.height);

        const dx = actual_x - ref.x;
        const dy = actual_y - ref.y;
        const dw = actual_w - ref.w;
        const dh = actual_h - ref.h;
        const dev = Math.round(Math.sqrt(dx*dx + dy*dy + dw*dw + dh*dh) * 10) / 10;

        results.push({
            id: key,
            label: ref.label,
            ref_x: ref.x, ref_y: ref.y, ref_w: ref.w, ref_h: ref.h,
            actual_x, actual_y, actual_w, actual_h,
            dx, dy, dw, dh,
            deviation: dev
        });
    }

    fs.writeFileSync(path.join(OUT_DIR, 'measurement_results.json'), JSON.stringify(results, null, 2));
    console.log('Saved measurement results to measurement_results.json');

    await browser.close();
    console.log('Playwright run complete.');
}

run().catch(err => {
    console.error('QA Error:', err);
    process.exit(1);
});
