/**
 * Combo & Game Juice System for Resource Gathering & Tree Chopping
 *
 * Provides musical pitch progression, combo state tracking, and floating juice effects.
 * IMPORTANT: This system is purely audiovisual ("game juice") and DOES NOT alter
 * gameplay rewards, resource quantities, gold payouts, or game balance.
 */

export interface ComboState {
    comboCount: number;
    lastHitTime: number;
    comboTimeoutMs: number;
    maxCombo: number;
}

export interface FloatingTextItem {
    id: string;
    worldX: number;
    worldY: number;
    text: string;
    type: 'gold' | 'resource' | 'combo' | 'levelup' | 'star';
    comboLevel: number;
    color: string;
    glowColor?: string;
    scale: number;
    createdAt: number;
    durationMs: number;
}

export interface ConfettiParticle {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    shape: 'rect' | 'circle' | 'star';
    rotation: number;
    rotationSpeed: number;
    wobble: number;
    wobbleSpeed: number;
    alpha: number;
    createdAt: number;
    durationMs: number;
    gravity: number;
    drag: number;
}

export interface LevelUpCelebration {
    id: string;
    type: 'town_hall' | 'glory_rank';
    newLevel: number;
    title: string;
    subtitle: string;
    highlight: string;
    icon: string;
    color: string;
    glowColor: string;
    createdAt: number;
    durationMs: number;
}

export const CELEBRATION_COLORS: string[] = [
    '#fbbf24', // Gold
    '#f59e0b', // Amber
    '#fde047', // Light Gold
    '#f43f5e', // Ruby Rose
    '#ec4899', // Pink
    '#a855f7', // Royal Purple
    '#38bdf8', // Sky Cyan
    '#34d399', // Emerald Green
    '#ffffff', // Sparkle White
];

export interface ComboVisualTier {
    minCombo: number;
    tag: string;
    badge: string;
    color: string;
    glowColor: string;
    particleCount: number;
    shake: boolean;
}

export const DEFAULT_COMBO_TIMEOUT_MS = 3200; // 3.2 seconds between chops/harvests to maintain combo

// Major Pentatonic Scale semitones (Root, M2, M3, P5, M6, Octave, etc.)
// Produces harmonious, joyful arcade-style rising melodies on consecutive hits.
export const PENTATONIC_SEMITONES: number[] = [
    0,   // combo 1: C (1.000)
    2,   // combo 2: D (1.122)
    4,   // combo 3: E (1.260)
    7,   // combo 4: G (1.498)
    9,   // combo 5: A (1.682)
    12,  // combo 6: C octave (2.000)
    14,  // combo 7: D octave (2.245)
    16,  // combo 8: E octave (2.520)
    19,  // combo 9: G octave (2.997)
    21,  // combo 10: A octave (3.364)
    24,  // combo 11+: C 2-octaves (4.000)
];

/**
 * Calculates playbackRate multiplier for pitch-shifting audio.
 * Formula: 2^(semitone / 12)
 */
export function calculateComboPitch(combo: number): number {
    const safeCombo = Math.max(1, Math.floor(combo));
    const index = Math.min(safeCombo - 1, PENTATONIC_SEMITONES.length - 1);
    const semitones = PENTATONIC_SEMITONES[index];
    const pitch = Math.pow(2, semitones / 12);
    return Math.round(pitch * 1000) / 1000;
}

/**
 * Calculates base audio oscillator frequency in Hz (default A4 = 440Hz / C5 = 523.25Hz).
 */
export function calculateComboOscillatorHz(combo: number, baseHz: number = 523.25): number {
    const pitch = calculateComboPitch(combo);
    return Math.round(baseHz * pitch * 10) / 10;
}

/**
 * Returns tier styling and title for a given combo count.
 */
export function getComboTier(combo: number): ComboVisualTier {
    if (combo >= 10) {
        return {
            minCombo: 10,
            tag: `x${combo} ЛЕГЕНДА! 👑`,
            badge: '👑 ЛЕГЕНДАРНО',
            color: '#f472b6',
            glowColor: 'rgba(244, 114, 182, 0.9)',
            particleCount: 12,
            shake: true,
        };
    }
    if (combo >= 8) {
        return {
            minCombo: 8,
            tag: `x${combo} БЕЗУМИЕ! ⚡`,
            badge: '⚡ БЕЗУМИЕ',
            color: '#38bdf8',
            glowColor: 'rgba(56, 189, 248, 0.9)',
            particleCount: 8,
            shake: true,
        };
    }
    if (combo >= 6) {
        return {
            minCombo: 6,
            tag: `x${combo} УЛЬТРА! 🌪️`,
            badge: '🌪️ УЛЬТРА',
            color: '#c084fc',
            glowColor: 'rgba(192, 132, 252, 0.85)',
            particleCount: 6,
            shake: false,
        };
    }
    if (combo >= 5) {
        return {
            minCombo: 5,
            tag: `x${combo} МЕГА! 💥`,
            badge: '💥 МЕГА',
            color: '#f43f5e',
            glowColor: 'rgba(244, 63, 94, 0.85)',
            particleCount: 5,
            shake: false,
        };
    }
    if (combo >= 4) {
        return {
            minCombo: 4,
            tag: `x${combo} СУПЕР! ⚡`,
            badge: '⚡ СУПЕР',
            color: '#fb923c',
            glowColor: 'rgba(251, 146, 60, 0.8)',
            particleCount: 4,
            shake: false,
        };
    }
    if (combo >= 3) {
        return {
            minCombo: 3,
            tag: `x${combo} СЕРИЯ! 🔥`,
            badge: '🔥 СЕРИЯ',
            color: '#facc15',
            glowColor: 'rgba(250, 204, 21, 0.8)',
            particleCount: 3,
            shake: false,
        };
    }
    if (combo >= 2) {
        return {
            minCombo: 2,
            tag: `x2 СЕРИЯ!`,
            badge: '✨ СЕРИЯ',
            color: '#fde047',
            glowColor: 'rgba(253, 224, 71, 0.7)',
            particleCount: 2,
            shake: false,
        };
    }
    return {
        minCombo: 1,
        tag: '',
        badge: '',
        color: '#ffffff',
        glowColor: 'rgba(255, 255, 255, 0.4)',
        particleCount: 0,
        shake: false,
    };
}

/**
 * Creates initial combo state.
 */
export function createInitialComboState(timeoutMs: number = DEFAULT_COMBO_TIMEOUT_MS): ComboState {
    return {
        comboCount: 0,
        lastHitTime: 0,
        comboTimeoutMs: timeoutMs,
        maxCombo: 0,
    };
}

/**
 * Registers a new gathering/chopping hit and updates combo counter.
 * If elapsed time <= timeoutMs, combo increments; otherwise it resets to 1.
 */
export function registerGatherHit(
    currentState: ComboState,
    now: number = Date.now()
): { nextState: ComboState; combo: number; isComboIncrement: boolean } {
    const isWithinWindow = currentState.lastHitTime > 0 && (now - currentState.lastHitTime <= currentState.comboTimeoutMs);
    const combo = isWithinWindow ? currentState.comboCount + 1 : 1;
    const isComboIncrement = combo > 1;

    const nextState: ComboState = {
        comboCount: combo,
        lastHitTime: now,
        comboTimeoutMs: currentState.comboTimeoutMs,
        maxCombo: Math.max(currentState.maxCombo, combo),
    };

    return { nextState, combo, isComboIncrement };
}

/**
 * Checks if current combo is still active at `now`.
 */
export function isComboActive(state: ComboState, now: number = Date.now()): boolean {
    return state.comboCount > 0 && (now - state.lastHitTime <= state.comboTimeoutMs);
}

/**
 * Helper to generate a unique ID for floating numbers.
 */
let floatingCounter = 0;
export function generateFloatingId(): string {
    floatingCounter = (floatingCounter + 1) % 1000000;
    return `fl_${Date.now()}_${floatingCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Creates floating text items for gold, resources, and combo tags.
 */
export function createGatherFloatingItems(params: {
    worldX: number;
    worldY: number;
    gold?: number;
    resources?: Record<string | number, number>;
    combo: number;
    now?: number;
}): FloatingTextItem[] {
    const { worldX, worldY, gold = 0, resources = {}, combo, now = Date.now() } = params;
    const items: FloatingTextItem[] = [];
    const tier = getComboTier(combo);

    // Floating gold number
    if (gold > 0) {
        const scale = combo >= 5 ? 1.35 : combo >= 3 ? 1.2 : 1.05;
        items.push({
            id: generateFloatingId(),
            worldX,
            worldY,
            text: `+${gold} 💰`,
            type: 'gold',
            comboLevel: combo,
            color: '#fbbf24',
            glowColor: 'rgba(251, 191, 36, 0.8)',
            scale,
            createdAt: now,
            durationMs: 1300,
        });
    }

    // Floating resource items
    Object.entries(resources).forEach(([key, amount]) => {
        if (!amount || amount <= 0) return;
        let icon = '📦';
        const numKey = Number(key);
        if (numKey === 1 || key === 'wood') icon = '🪵';
        else if (numKey === 2 || key === 'stone') icon = '🪨';
        else if (numKey === 3 || key === 'planks') icon = '🪵';
        else if (numKey === 50 || key.includes('mushroom') || numKey >= 70 && numKey <= 80) icon = '🍄';
        else if (key.includes('pumpkin') || numKey >= 82 && numKey <= 94) icon = '🎃';
        else if (key.includes('wheat') || numKey >= 102 && numKey <= 112) icon = '🌾';

        items.push({
            id: generateFloatingId(),
            worldX: worldX + 0.2, // slight offset so items don't overlap directly
            worldY: worldY - 0.15,
            text: `+${amount} ${icon}`,
            type: 'resource',
            comboLevel: combo,
            color: '#34d399',
            glowColor: 'rgba(52, 211, 153, 0.7)',
            scale: 1.05,
            createdAt: now,
            durationMs: 1300,
        });
    });

    // Floating combo badge at world location (shown when combo >= 2)
    if (combo >= 2 && tier.tag) {
        items.push({
            id: generateFloatingId(),
            worldX,
            worldY: worldY - 0.5, // floats slightly above the gold number
            text: tier.tag,
            type: 'combo',
            comboLevel: combo,
            color: tier.color,
            glowColor: tier.glowColor,
            scale: combo >= 5 ? 1.45 : combo >= 3 ? 1.3 : 1.15,
            createdAt: now,
            durationMs: 1400,
        });
    }

    return items;
}

/**
 * Creates an explosion of colorful confetti particles and golden sparkles on Canvas.
 * Supports dual bottom cannons (stadium celebration) and/or radial starbursts.
 */
export function createLevelUpConfettiBurst(params: {
    screenX?: number;
    screenY?: number;
    screenWidth?: number;
    screenHeight?: number;
    count?: number;
    spreadMode?: 'radial' | 'cannons' | 'both';
    now?: number;
} = {}): ConfettiParticle[] {
    const {
        screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280,
        screenHeight = typeof window !== 'undefined' ? window.innerHeight : 720,
        screenX = screenWidth / 2,
        screenY = screenHeight * 0.45,
        count = 150,
        spreadMode = 'both',
        now = Date.now(),
    } = params;

    const particles: ConfettiParticle[] = [];
    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'rect', 'circle', 'star'];

    // 1. Dual Bottom Festival Cannons (shoots upwards from screen bottom corners)
    if (spreadMode === 'cannons' || spreadMode === 'both') {
        const cannonCount = spreadMode === 'cannons' ? count : Math.floor(count * 0.65);
        for (let i = 0; i < cannonCount; i++) {
            const isLeft = i % 2 === 0;
            const originX = isLeft ? screenWidth * 0.05 : screenWidth * 0.95;
            const originY = screenHeight * 0.95;

            // Arc towards top-center of the screen
            const baseAngle = isLeft ? -Math.PI * 0.35 : -Math.PI * 0.65;
            const angleSpread = (Math.random() - 0.5) * (Math.PI * 0.32);
            const angle = baseAngle + angleSpread;
            const speed = 14 + Math.random() * 18;

            const color = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = shape === 'rect' ? 8 + Math.random() * 8 : shape === 'star' ? 10 + Math.random() * 6 : 6 + Math.random() * 6;

            particles.push({
                id: generateFloatingId(),
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size,
                color,
                shape,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.28,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.08 + Math.random() * 0.14,
                alpha: 1,
                createdAt: now,
                durationMs: 3200 + Math.random() * 1200,
                gravity: 0.28 + Math.random() * 0.12,
                drag: 0.965,
            });
        }
    }

    // 2. Central Firework Radial Starburst
    if (spreadMode === 'radial' || spreadMode === 'both') {
        const radialCount = spreadMode === 'radial' ? count : Math.floor(count * 0.35);
        for (let i = 0; i < radialCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 15;
            const color = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = shape === 'star' ? 11 + Math.random() * 7 : 7 + Math.random() * 6;

            particles.push({
                id: generateFloatingId(),
                x: screenX + (Math.random() - 0.5) * 40,
                y: screenY + (Math.random() - 0.5) * 40,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3, // upward bias
                size,
                color,
                shape,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.32,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.1 + Math.random() * 0.12,
                alpha: 1,
                createdAt: now,
                durationMs: 2600 + Math.random() * 1000,
                gravity: 0.22 + Math.random() * 0.1,
                drag: 0.955,
            });
        }
    }

    return particles;
}

/**
 * Updates physical positions, velocities, tumbling, and alpha of active confetti particles.
 */
export function updateConfettiParticles(
    particles: ConfettiParticle[],
    now: number = Date.now(),
    dtSeconds: number = 1 / 60
): ConfettiParticle[] {
    const alive: ConfettiParticle[] = [];
    const timeStep = Math.min(0.1, Math.max(0.001, dtSeconds)) * 60; // normalized ~1.0 for 60fps

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const elapsed = now - p.createdAt;
        if (elapsed >= p.durationMs) continue;

        // Smooth fade-out during last 30% of lifetime
        const fadeStart = p.durationMs * 0.7;
        let alpha = 1;
        if (elapsed > fadeStart) {
            alpha = Math.max(0, 1 - (elapsed - fadeStart) / (p.durationMs - fadeStart));
        }

        const dragFactor = Math.pow(p.drag, timeStep);
        const nextVx = p.vx * dragFactor;
        const nextVy = (p.vy + p.gravity * timeStep) * dragFactor;
        const nextX = p.x + nextVx * timeStep;
        const nextY = p.y + nextVy * timeStep;
        const nextRotation = p.rotation + p.rotationSpeed * timeStep;
        const nextWobble = p.wobble + p.wobbleSpeed * timeStep;

        alive.push({
            ...p,
            x: nextX,
            y: nextY,
            vx: nextVx,
            vy: nextVy,
            rotation: nextRotation,
            wobble: nextWobble,
            alpha,
        });
    }

    return alive;
}

/**
 * Renders confetti particles onto a 2D Canvas with 3D paper tumbling ribbons,
 * circular sparkles, and glowing golden stars.
 */
export function renderConfettiCanvas(
    ctx: CanvasRenderingContext2D,
    particles: ConfettiParticle[],
    width: number,
    height: number
): void {
    ctx.clearRect(0, 0, width, height);
    if (particles.length === 0) return;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.01) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
            // 3D paper ribbon flutter via cosine scale
            const scaleW = Math.cos(p.wobble);
            ctx.scale(scaleW, 1);
            ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
        } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.shape === 'star') {
            // 5-point star
            const outerRadius = p.size / 2;
            const innerRadius = outerRadius * 0.45;
            ctx.beginPath();
            for (let s = 0; s < 10; s++) {
                const r = s % 2 === 0 ? outerRadius : innerRadius;
                const a = (s * Math.PI) / 5 - Math.PI / 2;
                const sx = Math.cos(a) * r;
                const sy = Math.sin(a) * r;
                if (s === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
            }
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

/**
 * Creates floating text items and radiant golden stars for Level-Up feedback in world coordinates.
 */
export function createLevelUpFloatingItems(params: {
    type: 'town_hall' | 'glory_rank';
    newLevel: number;
    worldX: number;
    worldY: number;
    now?: number;
}): FloatingTextItem[] {
    const { type, newLevel, worldX, worldY, now = Date.now() } = params;
    const items: FloatingTextItem[] = [];

    const isTownHall = type === 'town_hall';
    const mainText = isTownHall
        ? `🏰 РАТУША УРОВЕНЬ ${newLevel}! 🏰`
        : `👑 РАНГ СЛАВЫ УРОВЕНЬ ${newLevel}! 👑`;
    const mainColor = isTownHall ? '#fbbf24' : '#facc15';
    const glowColor = isTownHall ? 'rgba(251, 191, 36, 0.95)' : 'rgba(250, 204, 21, 0.95)';

    // Main triumph badge floating above the building / player
    items.push({
        id: generateFloatingId(),
        worldX,
        worldY: worldY - 0.8,
        text: mainText,
        type: 'levelup',
        comboLevel: 10,
        color: mainColor,
        glowColor,
        scale: 1.55,
        createdAt: now,
        durationMs: 3400,
    });

    // Radiant cluster of rising golden stars
    const starIcons = ['⭐', '🌟', '✨', '💫', '⭐', '🌟'];
    const starOffsets = [
        { dx: -0.6, dy: -0.3 },
        { dx: 0.6, dy: -0.3 },
        { dx: -0.4, dy: -1.2 },
        { dx: 0.4, dy: -1.2 },
        { dx: -0.8, dy: -0.8 },
        { dx: 0.8, dy: -0.8 },
    ];

    starOffsets.forEach((offset, idx) => {
        items.push({
            id: generateFloatingId(),
            worldX: worldX + offset.dx,
            worldY: worldY + offset.dy,
            text: starIcons[idx % starIcons.length],
            type: 'star',
            comboLevel: 10,
            color: '#fef08a',
            glowColor: 'rgba(254, 240, 138, 0.9)',
            scale: 1.35 + (idx % 3) * 0.2,
            createdAt: now + idx * 70, // staggered entrance for extra game juice!
            durationMs: 2500 + idx * 100,
        });
    });

    return items;
}

/**
 * Creates celebration banner descriptor for HUD overlay display.
 */
export function createLevelUpCelebration(params: {
    type: 'town_hall' | 'glory_rank';
    newLevel: number;
    now?: number;
    durationMs?: number;
}): LevelUpCelebration {
    const { type, newLevel, now = Date.now(), durationMs = 3800 } = params;
    const isTownHall = type === 'town_hall';

    return {
        id: generateFloatingId(),
        type,
        newLevel,
        title: isTownHall ? 'РАТУША УЛУЧШЕНА!' : 'НОВЫЙ РАНГ СЛАВЫ!',
        subtitle: isTownHall
            ? `Уровень ${newLevel} Ратуши достигнут!`
            : `Уровень ${newLevel} персонажа разблокирован!`,
        highlight: isTownHall
            ? '🏛️ Новые чертежи зданий и заказы Ратуши'
            : '⚡ +50 к максимальной энергии и новые возможности',
        icon: isTownHall ? '🏰' : '👑',
        color: isTownHall ? '#fbbf24' : '#facc15',
        glowColor: isTownHall ? 'rgba(251, 191, 36, 0.9)' : 'rgba(250, 204, 21, 0.9)',
        createdAt: now,
        durationMs,
    };
}
