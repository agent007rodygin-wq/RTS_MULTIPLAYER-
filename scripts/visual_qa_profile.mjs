import { chromium } from '/home/uro/Рабочий стол/aiagent/pithagoras/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const QA_DIR = '/home/uro/.gemini/antigravity/brain/af1c98f8-95dc-4de9-a1a9-da2ab6d14f0b';

async function run() {
    console.log('Launching Playwright Chromium for Profile Modal QA (Penpot 596x760)...');
    const browser = await chromium.launch({
        executablePath: '/home/uro/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage({
        viewport: { width: 596, height: 760 },
        deviceScaleFactor: 1
    });

    const url = 'http://127.0.0.1:3000/preview_profile.html';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for fonts & images to settle
    await page.waitForTimeout(2000);

    const container = await page.$('#player-profile-modal-container');
    if (!container) {
        throw new Error('Container #player-profile-modal-container not found!');
    }

    const containerBox = await container.boundingBox();
    console.log('Container Box:', containerBox);

    // Save actual screenshot of container
    const actualPath = path.join(QA_DIR, 'actual_implementation_596x760.png');
    await container.screenshot({ path: actualPath });
    console.log(`Saved screenshot to ${actualPath}`);

    // Elements to measure based on Penpot design
    const elementsToMeasure = [
        { id: 'player-profile-modal-container', label: 'Frame Container', expected: { x: 0, y: 0, w: 596, h: 760 } },
        { id: 'profile-header-icon', label: 'Header User Icon', expected: { x: 20, y: 15, w: 118, h: 102 } },
        { id: 'profile-header-close', label: 'Header Close Button', expected: { x: 508, y: 25, w: 61, h: 63 } },
        { id: 'profile-card', label: 'Player Card', expected: { x: 4, y: 100, w: 577, h: 193 } },
        { id: 'profile-royal-avatar', label: 'Royal Avatar', expected: { x: 21, y: 101, w: 194, h: 176 } },
        { id: 'profile-card-info', label: 'Player Info Text', expected: { x: 224, y: 122, w: 345, h: 150 } },
        { id: 'btn-praise', label: '01 Praise', expected: { x: 19, y: 281, w: 279, h: 65 } },
        { id: 'btn-report', label: '02 Report', expected: { x: 290, y: 281, w: 279, h: 65 } },
        { id: 'btn-my_king', label: '03 My King', expected: { x: 18, y: 343, w: 279, h: 65 } },
        { id: 'btn-achievements', label: '04 Achievements', expected: { x: 290, y: 343, w: 279, h: 65 } },
        { id: 'btn-rubies', label: '05 Rubies', expected: { x: 18, y: 406, w: 279, h: 65 } },
        { id: 'btn-buildings', label: '06 Buildings', expected: { x: 290, y: 406, w: 279, h: 65 } },
        { id: 'btn-gift', label: '07 Gift', expected: { x: 20, y: 465, w: 279, h: 65 } },
        { id: 'btn-friends', label: '08 Friends', expected: { x: 290, y: 465, w: 279, h: 65 } },
        { id: 'btn-messages', label: '09 Messages', expected: { x: 18, y: 525, w: 279, h: 65 } },
        { id: 'btn-punish', label: '10 Punish', expected: { x: 292, y: 525, w: 279, h: 65 } },
        { id: 'btn-curse', label: '11 Curse', expected: { x: 18, y: 585, w: 279, h: 65 } },
        { id: 'btn-character', label: '12 Character', expected: { x: 292, y: 585, w: 279, h: 65 } },
        { id: 'btn-ban', label: '13 Ban Button', expected: { x: 15, y: 650, w: 554, h: 83 } }
    ];

    const measurements = [];
    for (const item of elementsToMeasure) {
        const el = await page.$(`#${item.id}`);
        if (!el) {
            measurements.push({ ...item, status: 'NOT FOUND' });
            continue;
        }
        const b = await el.boundingBox();
        const actual_x = Math.round(b.x - containerBox.x);
        const actual_y = Math.round(b.y - containerBox.y);
        const actual_w = Math.round(b.width);
        const actual_h = Math.round(b.height);

        const dx = actual_x - item.expected.x;
        const dy = actual_y - item.expected.y;
        const dw = actual_w - item.expected.w;
        const dh = actual_h - item.expected.h;

        const maxDev = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dw), Math.abs(dh));
        measurements.push({
            id: item.id,
            label: item.label,
            expected: item.expected,
            actual: { x: actual_x, y: actual_y, w: actual_w, h: actual_h },
            delta: { dx, dy, dw, dh },
            maxDev,
            pass: maxDev <= 2
        });
    }

    fs.writeFileSync(path.join(QA_DIR, 'dom_measurements_penpot.json'), JSON.stringify(measurements, null, 2));
    console.log('Saved DOM measurements to dom_measurements_penpot.json');

    await browser.close();
}

run().catch(err => {
    console.error('QA Error:', err);
    process.exit(1);
});
