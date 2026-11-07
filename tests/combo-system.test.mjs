import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculateComboPitch,
    calculateComboOscillatorHz,
    getComboTier,
    createInitialComboState,
    registerGatherHit,
    isComboActive,
    createGatherFloatingItems,
    createLevelUpConfettiBurst,
    updateConfettiParticles,
    createLevelUpFloatingItems,
    createLevelUpCelebration,
    DEFAULT_COMBO_TIMEOUT_MS,
} from '../src/game/juice/comboSystem.ts';
import { playLevelUpFanfare } from '../src/game/juice/comboAudio.ts';

test('Combo System - Pitch Calculation & Progression', () => {
    // Combo 1 should be base pitch (1.0)
    assert.equal(calculateComboPitch(1), 1.0);

    // Pitches must monotonically increase as combo rises
    let lastPitch = calculateComboPitch(1);
    for (let c = 2; c <= 12; c++) {
        const pitch = calculateComboPitch(c);
        assert.ok(pitch >= lastPitch, `Pitch at combo ${c} (${pitch}) should be >= previous (${lastPitch})`);
        lastPitch = pitch;
    }

    // Octave (semitone 12) should be 2.0 at combo 6
    assert.equal(calculateComboPitch(6), 2.0);

    // Oscillator frequency calculation should scale from baseHz
    const baseC5 = 523.25;
    assert.equal(calculateComboOscillatorHz(1, baseC5), 523.3);
    assert.equal(calculateComboOscillatorHz(6, baseC5), 1046.5); // 2x frequency
});

test('Combo System - Tiers and Styling', () => {
    assert.equal(getComboTier(1).tag, '');
    assert.equal(getComboTier(2).tag, 'x2 СЕРИЯ!');
    assert.ok(getComboTier(3).tag.includes('x3'));
    assert.ok(getComboTier(5).tag.includes('МЕГА'));
    assert.ok(getComboTier(10).tag.includes('ЛЕГЕНДА'));

    // Colors must be distinct hex values
    assert.ok(getComboTier(2).color.startsWith('#'));
    assert.ok(getComboTier(5).color.startsWith('#'));
    assert.ok(getComboTier(10).color.startsWith('#'));
});

test('Combo System - State and Timing', () => {
    let state = createInitialComboState(DEFAULT_COMBO_TIMEOUT_MS);
    assert.equal(state.comboCount, 0);

    const t0 = 10000;
    // First hit
    const hit1 = registerGatherHit(state, t0);
    assert.equal(hit1.combo, 1);
    assert.equal(hit1.isComboIncrement, false);
    state = hit1.nextState;
    assert.equal(state.comboCount, 1);
    assert.equal(isComboActive(state, t0 + 1000), true);

    // Second hit within timeout window (1.5 seconds later)
    const t1 = t0 + 1500;
    const hit2 = registerGatherHit(state, t1);
    assert.equal(hit2.combo, 2);
    assert.equal(hit2.isComboIncrement, true);
    state = hit2.nextState;
    assert.equal(state.comboCount, 2);

    // Third hit within window
    const t2 = t1 + 2000;
    const hit3 = registerGatherHit(state, t2);
    assert.equal(hit3.combo, 3);
    state = hit3.nextState;
    assert.equal(state.comboCount, 3);

    // Expired hit (after 4 seconds > 3.2s timeout)
    const tExpired = t2 + 4000;
    assert.equal(isComboActive(state, tExpired), false);

    const hitReset = registerGatherHit(state, tExpired);
    assert.equal(hitReset.combo, 1); // Resets to 1
    assert.equal(hitReset.isComboIncrement, false);
    state = hitReset.nextState;
    assert.equal(state.comboCount, 1);
    assert.equal(state.maxCombo, 3); // Max combo preserved
});

test('Combo System - Floating Items Generation', () => {
    // For single hit combo 1 with gold & wood
    const items1 = createGatherFloatingItems({
        worldX: 10,
        worldY: 20,
        gold: 15,
        resources: { wood: 1 },
        combo: 1,
    });

    assert.equal(items1.length, 2); // gold + resource, no combo tag at combo 1
    const goldItem = items1.find(i => i.type === 'gold');
    assert.ok(goldItem);
    assert.equal(goldItem.text, '+15 💰');

    // For combo 3
    const items3 = createGatherFloatingItems({
        worldX: 10,
        worldY: 20,
        gold: 25,
        resources: { 1: 2 },
        combo: 3,
    });

    assert.equal(items3.length, 3); // gold + resource + combo tag
    const comboTag = items3.find(i => i.type === 'combo');
    assert.ok(comboTag);
    assert.ok(comboTag.text.includes('x3'));
});

test('Combo System - Level-Up Confetti Burst Generation', () => {
    const burst = createLevelUpConfettiBurst({
        screenWidth: 1920,
        screenHeight: 1080,
        count: 100,
        spreadMode: 'both',
        now: 1000,
    });

    assert.equal(burst.length, 100);

    // Verify particle properties
    burst.forEach(p => {
        assert.ok(p.id);
        assert.ok(Number.isFinite(p.x));
        assert.ok(Number.isFinite(p.y));
        assert.ok(Number.isFinite(p.vx));
        assert.ok(Number.isFinite(p.vy));
        assert.ok(p.size > 0);
        assert.ok(['rect', 'circle', 'star'].includes(p.shape));
        assert.ok(p.color.startsWith('#'));
        assert.equal(p.alpha, 1);
        assert.ok(p.durationMs >= 2000);
        assert.ok(p.gravity > 0);
        assert.ok(p.drag < 1.0);
    });

    // Check cannon origins from bottom screen corners
    const cannonParticles = burst.filter(p => p.y >= 1000);
    assert.ok(cannonParticles.length > 30, 'Should include bottom cannon particles');

    // Cannon velocities must be upward (negative vy)
    cannonParticles.forEach(p => {
        assert.ok(p.vy < 0, `Cannon particle vy (${p.vy}) should be directed upwards`);
    });
});

test('Combo System - Confetti Particles Physics Update & Fade', () => {
    const t0 = 5000;
    const burst = createLevelUpConfettiBurst({
        screenWidth: 1000,
        screenHeight: 800,
        count: 20,
        spreadMode: 'radial',
        screenX: 500,
        screenY: 400,
        now: t0,
    });

    // Advance 0.5 seconds
    const dt = 0.5;
    const updated = updateConfettiParticles(burst, t0 + 500, dt);
    assert.equal(updated.length, 20);

    // Verify movement
    for (let i = 0; i < burst.length; i++) {
        const initial = burst[i];
        const next = updated[i];
        assert.notEqual(next.x, initial.x);
        assert.notEqual(next.y, initial.y);
        // Alpha starts within valid range [0, 1]
        assert.ok(next.alpha <= 1 && next.alpha > 0);
    }

    // Advance past max duration (e.g. +10 seconds) -> particles should expire
    const expired = updateConfettiParticles(burst, t0 + 10000, 0.1);
    assert.equal(expired.length, 0, 'All particles should expire past their duration');
});

test('Combo System - Level-Up Floating Items & Golden Stars', () => {
    // 1. Town Hall Level-Up
    const thItems = createLevelUpFloatingItems({
        type: 'town_hall',
        newLevel: 3,
        worldX: 45,
        worldY: 60,
        now: 10000,
    });

    assert.ok(thItems.length >= 6, 'Should generate main badge and golden stars');

    const mainBadge = thItems.find(i => i.type === 'levelup');
    assert.ok(mainBadge);
    assert.ok(mainBadge.text.includes('РАТУША'));
    assert.ok(mainBadge.text.includes('3'));
    assert.equal(mainBadge.worldX, 45);
    assert.ok(mainBadge.scale >= 1.5);

    const stars = thItems.filter(i => i.type === 'star');
    assert.ok(stars.length >= 4, 'Should contain cluster of radiant stars');
    stars.forEach(s => {
        assert.ok(['⭐', '🌟', '✨', '💫'].includes(s.text));
        assert.ok(s.durationMs >= 2000);
    });

    // 2. Glory Rank Level-Up
    const gloryItems = createLevelUpFloatingItems({
        type: 'glory_rank',
        newLevel: 7,
        worldX: 10,
        worldY: 20,
        now: 10000,
    });

    const gloryBadge = gloryItems.find(i => i.type === 'levelup');
    assert.ok(gloryBadge);
    assert.ok(gloryBadge.text.includes('РАНГ СЛАВЫ'));
    assert.ok(gloryBadge.text.includes('7'));
});

test('Combo System - Level-Up Celebration Banner & Audio Fanfare', () => {
    const celebrationTH = createLevelUpCelebration({
        type: 'town_hall',
        newLevel: 4,
    });

    assert.equal(celebrationTH.type, 'town_hall');
    assert.equal(celebrationTH.newLevel, 4);
    assert.ok(celebrationTH.title.includes('РАТУША'));
    assert.equal(celebrationTH.icon, '🏰');
    assert.ok(celebrationTH.durationMs >= 3000);

    const celebrationGlory = createLevelUpCelebration({
        type: 'glory_rank',
        newLevel: 10,
    });

    assert.equal(celebrationGlory.type, 'glory_rank');
    assert.equal(celebrationGlory.newLevel, 10);
    assert.ok(celebrationGlory.title.includes('РАНГ СЛАВЫ'));
    assert.equal(celebrationGlory.icon, '👑');

    // Test that audio fanfare can be safely invoked in non-browser Node environments
    assert.doesNotThrow(() => {
        playLevelUpFanfare(0, 'town_hall'); // zero volume
        playLevelUpFanfare(1.0, 'town_hall');
        playLevelUpFanfare(1.0, 'glory_rank');
    });
});
