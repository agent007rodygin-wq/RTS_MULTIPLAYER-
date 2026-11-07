/**
 * Web Audio Controller for Combo Sounds
 *
 * Implements pitch-shifting coin sound and harmonic musical chimes with rising pitch.
 * Respects player volume settings and browser autoplay policies.
 */

import { calculateComboPitch, calculateComboOscillatorHz } from './comboSystem.ts';

let audioCtx: AudioContext | null = null;
let coinAudioBuffer: AudioBuffer | null = null;
let isBufferLoading = false;

/**
 * Initializes or resumes the AudioContext on user interaction.
 */
function getOrCreateAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
    }

    // Lazy load the collect.mp3 buffer
    if (audioCtx && !coinAudioBuffer && !isBufferLoading) {
        isBufferLoading = true;
        fetch('/game_sounds/coin/collect.mp3')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.arrayBuffer();
            })
            .then(arrayBuffer => audioCtx!.decodeAudioData(arrayBuffer))
            .then(decodedBuffer => {
                coinAudioBuffer = decodedBuffer;
                isBufferLoading = false;
            })
            .catch(() => {
                isBufferLoading = false;
            });
    }

    return audioCtx;
}

/**
 * Pre-warms audio context on user interaction.
 */
export function initComboAudio(): void {
    getOrCreateAudioContext();
}

/**
 * Plays the juicy combo gather sound:
 * Combines pitch-shifted coin audio sample with a melodic crystal chime oscillator.
 *
 * @param combo The current combo counter (1, 2, 3...)
 * @param volume Master sound effects volume (0.0 - 1.0)
 */
export function playComboSound(combo: number, volume: number): void {
    if (volume <= 0) return;

    const ctx = getOrCreateAudioContext();
    const safeVolume = Math.max(0, Math.min(1, volume));
    const pitchMultiplier = calculateComboPitch(combo);

    if (ctx && ctx.state === 'running') {
        const now = ctx.currentTime;

        // 1. Play pitch-shifted coin sample if loaded
        if (coinAudioBuffer) {
            try {
                const sampleSource = ctx.createBufferSource();
                sampleSource.buffer = coinAudioBuffer;
                sampleSource.playbackRate.setValueAtTime(pitchMultiplier, now);

                const sampleGain = ctx.createGain();
                sampleGain.gain.setValueAtTime(safeVolume * 0.85, now);

                sampleSource.connect(sampleGain);
                sampleGain.connect(ctx.destination);
                sampleSource.start(now);
            } catch (err) {
                // Ignore sample playback errors
            }
        }

        // 2. Play layered melodic crystal bell chime (gives crisp arcade game-juice!)
        try {
            const freq = calculateComboOscillatorHz(combo, 523.25); // C5 base
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();

            // High combos get a brighter triangle/sine wave
            osc.type = combo >= 5 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Fast pitch-slide chirp up for extra punch (juice!)
            osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + 0.04);

            // Envelope: instantaneous attack, smooth exponential decay
            const chimeVolume = safeVolume * (combo >= 4 ? 0.28 : 0.20);
            oscGain.gain.setValueAtTime(0.001, now);
            oscGain.gain.linearRampToValueAtTime(chimeVolume, now + 0.008);
            oscGain.gain.exponentialRampToValueAtTime(0.0001, now + (combo >= 5 ? 0.32 : 0.22));

            osc.connect(oscGain);
            oscGain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);

            // 3. Extra sparkle harmonic at high combos (>= 5)
            if (combo >= 5) {
                const sparkOsc = ctx.createOscillator();
                const sparkGain = ctx.createGain();

                sparkOsc.type = 'sine';
                sparkOsc.frequency.setValueAtTime(freq * 2, now); // Octave overtone
                sparkGain.gain.setValueAtTime(0.001, now);
                sparkGain.gain.linearRampToValueAtTime(chimeVolume * 0.4, now + 0.01);
                sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

                sparkOsc.connect(sparkGain);
                sparkGain.connect(ctx.destination);

                sparkOsc.start(now);
                sparkOsc.stop(now + 0.26);
            }
        } catch (err) {
            // Ignore oscillator playback errors
        }
    } else {
        // Fallback for HTML5 Audio if AudioContext not yet resumed
        try {
            const audio = new Audio('/game_sounds/coin/collect.mp3');
            audio.volume = safeVolume;
            audio.playbackRate = Math.min(2.5, pitchMultiplier);
            audio.play().catch(() => {});
        } catch (err) {
            // Ignore fallback errors
        }
    }
}

/**
 * Plays a triumphant victory fanfare and rich celebratory chord for Level-Up & Town Hall upgrades.
 *
 * Designed for maximum dopamine game-juice:
 * 1. An energetic rising fanfare arpeggio flourish (herald trumpet motif)
 * 2. Powerful deep sub-bass punch giving weight and grandeur to the achievement
 * 3. Multi-voice triumphant major chord with brassy harmonic filter opening and warm detuning
 * 4. Cascading crystal sparkle chimes across the sustained chord
 *
 * @param volume Master sound effects volume (0.0 - 1.0)
 * @param type 'town_hall' or 'glory_rank' for subtle thematic variations
 */
export function playLevelUpFanfare(
    volume: number,
    type: 'town_hall' | 'glory_rank' = 'glory_rank'
): void {
    if (volume <= 0) return;
    const safeVolume = Math.max(0, Math.min(1, volume));
    const ctx = getOrCreateAudioContext();

    if (ctx && ctx.state === 'running') {
        const now = ctx.currentTime;

        try {
            // Master gain for the entire fanfare
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(safeVolume, now);
            masterGain.connect(ctx.destination);

            const isTownHall = type === 'town_hall';

            // 1. Fanfare Arpeggio Flourish (rising scale lead-in)
            // Town Hall: Imperial C Major (G4 -> C5 -> E5 -> G5 -> C6)
            // Glory Rank: Heroic A Major (A4 -> C#5 -> E5 -> A5 -> C#6)
            const arpeggioNotes = isTownHall
                ? [392.00, 523.25, 659.25, 783.99, 1046.50]
                : [440.00, 554.37, 659.25, 880.00, 1108.73];

            arpeggioNotes.forEach((freq, idx) => {
                const noteTime = now + idx * 0.075;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.0001, noteTime);
                gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start(noteTime);
                osc.stop(noteTime + 0.24);
            });

            // 2. Grand Victory Chord Strike (hits at +0.38s)
            const chordTime = now + 0.38;
            const chordDuration = 2.4;

            // Deep punchy Sub-bass foundation (adds physical weight)
            const bassOsc = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bassOsc.type = 'sine';
            bassOsc.frequency.setValueAtTime(isTownHall ? 130.81 : 110.00, chordTime);
            bassOsc.frequency.exponentialRampToValueAtTime(isTownHall ? 65.41 : 55.00, chordTime + 0.45);

            bassGain.gain.setValueAtTime(0.001, chordTime);
            bassGain.gain.linearRampToValueAtTime(0.38, chordTime + 0.02);
            bassGain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.95);

            bassOsc.connect(bassGain);
            bassGain.connect(masterGain);
            bassOsc.start(chordTime);
            bassOsc.stop(chordTime + 1.0);

            // Rich Multi-Voice Triumphant Major Chord
            const chordFrequencies = isTownHall
                ? [261.63, 329.63, 392.00, 523.25, 659.25, 1046.50] // C4, E4, G4, C5, E5, C6
                : [220.00, 277.18, 329.63, 440.00, 554.37, 880.00];  // A3, C#4, E4, A4, C#5, A5

            // Low-pass filter for opening brassy warmth
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, chordTime);
            filter.frequency.exponentialRampToValueAtTime(4200, chordTime + 0.08); // dynamic brass swell
            filter.frequency.exponentialRampToValueAtTime(1500, chordTime + chordDuration);

            chordFrequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = idx < 3 ? 'sawtooth' : 'triangle';
                osc.frequency.setValueAtTime(freq, chordTime);

                // Subtle detuning for lush unison chorus effect
                const detuneCents = (idx % 2 === 0 ? 1 : -1) * (4 + idx * 2.5);
                osc.detune.setValueAtTime(detuneCents, chordTime);

                const voiceGain = 0.16 / Math.sqrt(idx + 1);
                gain.gain.setValueAtTime(0.0001, chordTime);
                gain.gain.linearRampToValueAtTime(voiceGain, chordTime + 0.035);
                gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + chordDuration);

                osc.connect(gain);
                gain.connect(filter);

                osc.start(chordTime);
                osc.stop(chordTime + chordDuration + 0.05);
            });

            filter.connect(masterGain);

            // 3. Golden Sparkle Chimes (crystalline cascade over the chord)
            const sparkleNotes = [1318.5, 1567.98, 2093.0, 2637.0];
            sparkleNotes.forEach((freq, idx) => {
                const chimeTime = chordTime + 0.2 + idx * 0.14;
                const chimeOsc = ctx.createOscillator();
                const chimeGain = ctx.createGain();

                chimeOsc.type = 'sine';
                chimeOsc.frequency.setValueAtTime(freq, chimeTime);

                chimeGain.gain.setValueAtTime(0.0001, chimeTime);
                chimeGain.gain.linearRampToValueAtTime(0.12, chimeTime + 0.01);
                chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.55);

                chimeOsc.connect(chimeGain);
                chimeGain.connect(masterGain);

                chimeOsc.start(chimeTime);
                chimeOsc.stop(chimeTime + 0.6);
            });

            // 4. Layer coin collect sample if available
            if (coinAudioBuffer) {
                try {
                    const sampleSource = ctx.createBufferSource();
                    sampleSource.buffer = coinAudioBuffer;
                    sampleSource.playbackRate.setValueAtTime(1.4, chordTime);

                    const sampleGain = ctx.createGain();
                    sampleGain.gain.setValueAtTime(safeVolume * 0.5, chordTime);

                    sampleSource.connect(sampleGain);
                    sampleGain.connect(ctx.destination);
                    sampleSource.start(chordTime);
                } catch {
                    // Ignore sample layer playback error
                }
            }
        } catch {
            // Ignore Web Audio playback errors
        }
    } else {
        // Fallback for HTML5 Audio
        try {
            const audio = new Audio('/game_sounds/coin/collect.mp3');
            audio.volume = safeVolume;
            audio.play().catch(() => {});
        } catch {
            // Ignore fallback errors
        }
    }
}
