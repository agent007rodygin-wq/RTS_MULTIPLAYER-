import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export interface LuckyWheelSector {
    id: number;
    name: string;
    shortLabel: string;
    type: 'gold' | 'ruby' | 'item' | 'jackpot';
    amount: number;
    itemId?: number;
    isJackpot?: boolean;
    colorStart: string;
    colorEnd: string;
    textColor: string;
    icon: string;
}

export const LUCKY_WHEEL_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

export const LUCKY_WHEEL_SECTORS: LuckyWheelSector[] = [
    {
        id: 0,
        name: '100 Золота',
        shortLabel: '100 💰',
        type: 'gold',
        amount: 100,
        colorStart: '#f59e0b',
        colorEnd: '#b45309',
        textColor: '#ffffff',
        icon: '💰'
    },
    {
        id: 1,
        name: '5 Древесины',
        shortLabel: '5 🪵',
        type: 'item',
        amount: 5,
        itemId: 10001,
        colorStart: '#10b981',
        colorEnd: '#047857',
        textColor: '#ffffff',
        icon: '🪵'
    },
    {
        id: 2,
        name: '1 Энергетик',
        shortLabel: '1 ⚡',
        type: 'item',
        amount: 1,
        itemId: 10046,
        colorStart: '#06b6d4',
        colorEnd: '#0369a1',
        textColor: '#ffffff',
        icon: '⚡'
    },
    {
        id: 3,
        name: '500 Золота',
        shortLabel: '500 💰',
        type: 'gold',
        amount: 500,
        colorStart: '#fbbf24',
        colorEnd: '#d97706',
        textColor: '#ffffff',
        icon: '🪙'
    },
    {
        id: 4,
        name: '1 Рубин',
        shortLabel: '1 💎',
        type: 'ruby',
        amount: 1,
        colorStart: '#a855f7',
        colorEnd: '#6b21a8',
        textColor: '#ffffff',
        icon: '💎'
    },
    {
        id: 5,
        name: 'ДЖЕКПОТ (5 Рубинов)',
        shortLabel: '👑 5 💎',
        type: 'jackpot',
        amount: 5,
        isJackpot: true,
        colorStart: '#f43f5e',
        colorEnd: '#9f1239',
        textColor: '#fffbeb',
        icon: '👑'
    }
];

function pickWinningSectorIndex(): number {
    const rand = Math.random() * 100;
    if (rand < 35) return 0; // 100 gold (35%)
    if (rand < 55) return 1; // 5 wood (20%)
    if (rand < 70) return 2; // 1 energy drink (15%)
    if (rand < 90) return 3; // 500 gold (20%)
    if (rand < 98) return 4; // 1 ruby (8%)
    return 5;                // Jackpot 5 rubies (2%)
}

// Procedural Web Audio for ticking pegs
function playTickSound(pitchMultiplier = 1) {
    try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = (680 + Math.random() * 120) * pitchMultiplier;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, ctx.currentTime + 0.024);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.024);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.026);
    } catch {}
}

// Procedural Web Audio for victory fanfare
function playWinFanfare(isJackpot: boolean) {
    try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const freqs = isJackpot
            ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C5, E5, G5, C6, E6, G6
            : [523.25, 659.25, 783.99, 1046.50];                 // C5, E5, G5, C6
        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = isJackpot ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
            gain.gain.setValueAtTime(isJackpot ? 0.22 : 0.16, ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.42);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.46);
        });
    } catch {}
}

interface ConfettiPiece {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vRot: number;
    alpha: number;
    shape: 'rect' | 'circle' | 'star';
}

export interface LuckyWheelProps {
    lastLuckyWheelSpin: number;
    onClaimPrize: (prize: LuckyWheelSector) => Promise<void> | void;
    coinImageUrl: string;
    rubyImageUrl: string;
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
    lastLuckyWheelSpin,
    onClaimPrize,
    coinImageUrl,
    rubyImageUrl
}) => {
    const [now, setNow] = useState(Date.now());
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [pointerTilt, setPointerTilt] = useState(0);
    const [wonPrize, setWonPrize] = useState<LuckyWheelSector | null>(null);
    const [showPrizeOverlay, setShowPrizeOverlay] = useState(false);
    const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

    const animFrameRef = useRef<number | null>(null);
    const lastPegIndexRef = useRef<number>(-1);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Keep live clock for countdown
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const remainingMs = Math.max(0, (lastLuckyWheelSpin + LUCKY_WHEEL_COOLDOWN_MS) - now);
    const isFreeAvailable = remainingMs <= 0 || lastLuckyWheelSpin === 0;

    const formattedTimeRemaining = useMemo(() => {
        const totalSec = Math.floor(remainingMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, [remainingMs]);

    const cooldownProgressPercent = useMemo(() => {
        if (isFreeAvailable) return 100;
        const elapsed = LUCKY_WHEEL_COOLDOWN_MS - remainingMs;
        return Math.min(100, Math.max(0, (elapsed / LUCKY_WHEEL_COOLDOWN_MS) * 100));
    }, [isFreeAvailable, remainingMs]);

    // Spawn procedural confetti particles
    const triggerConfetti = useCallback((isJackpot: boolean) => {
        const count = isJackpot ? 120 : 60;
        const colors = isJackpot
            ? ['#fde047', '#fbbf24', '#f43f5e', '#e11d48', '#38bdf8', '#c084fc', '#ffffff']
            : ['#fbbf24', '#34d399', '#38bdf8', '#f472b6', '#a78bfa', '#f59e0b'];

        const pieces: ConfettiPiece[] = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * (isJackpot ? 9 : 6);
            pieces.push({
                x: 140,
                y: 140,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (isJackpot ? 3.5 : 2),
                size: 4 + Math.random() * 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 18,
                alpha: 1,
                shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star')
            });
        }
        setConfetti(pieces);
    }, []);

    // Particle animation loop
    useEffect(() => {
        if (confetti.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        const updateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            setConfetti(prev => {
                const next = prev.map(p => {
                    const nx = p.x + p.vx;
                    const ny = p.y + p.vy;
                    const nvy = p.vy + 0.16; // gravity
                    const nvx = p.vx * 0.98; // drag
                    const nAlpha = p.alpha - 0.016;
                    const nRot = p.rotation + p.vRot;

                    if (nAlpha > 0) {
                        alive = true;
                        ctx.save();
                        ctx.globalAlpha = Math.max(0, nAlpha);
                        ctx.translate(nx, ny);
                        ctx.rotate((nRot * Math.PI) / 180);
                        ctx.fillStyle = p.color;

                        if (p.shape === 'rect') {
                            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                        } else if (p.shape === 'circle') {
                            ctx.beginPath();
                            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                            ctx.fill();
                        } else {
                            // Star
                            ctx.beginPath();
                            for (let s = 0; s < 5; s++) {
                                ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * p.size, -Math.sin((18 + s * 72) * Math.PI / 180) * p.size);
                                ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * (p.size / 2), -Math.sin((54 + s * 72) * Math.PI / 180) * (p.size / 2));
                            }
                            ctx.closePath();
                            ctx.fill();
                        }
                        ctx.restore();
                    }

                    return { ...p, x: nx, y: ny, vx: nvx, vy: nvy, rotation: nRot, alpha: nAlpha };
                }).filter(p => p.alpha > 0);

                return next;
            });

            if (alive) {
                frameId = requestAnimationFrame(updateParticles);
            }
        };

        frameId = requestAnimationFrame(updateParticles);
        return () => cancelAnimationFrame(frameId);
    }, [confetti.length > 0]);

    // Handle Wheel Spin
    const handleSpin = () => {
        if (isSpinning || (!isFreeAvailable && remainingMs > 0)) return;

        setIsSpinning(true);
        setShowPrizeOverlay(false);
        setWonPrize(null);

        const targetSectorIndex = pickWinningSectorIndex();
        const winningSector = LUCKY_WHEEL_SECTORS[targetSectorIndex];

        // Sector target calculation:
        // Sector i center is at: i * 60°
        // Add subtle random jitter within ±10° to look natural without touching boundary lines
        const jitter = (Math.random() - 0.5) * 20;
        const targetAngle = targetSectorIndex * 60 + jitter;

        // Current angle normalized to 360
        const currentNorm = rotation % 360;
        // Need to rotate clockwise by at least 6 full rounds (2160 deg)
        const fullRounds = 360 * 6;
        const neededOffset = (360 - (targetAngle % 360) + 360) % 360;
        const finalTargetRotation = rotation + (360 - currentNorm) + fullRounds + neededOffset;

        const startRotation = rotation;
        const totalDelta = finalTargetRotation - startRotation;
        const startTime = performance.now();
        const duration = 4600; // 4.6 seconds

        // Custom easeOutCubic curve for smooth suspenseful stopping
        const easeOut = (t: number) => {
            const f = t - 1.0;
            return f * f * f * f * f + 1.0; // easeOutQuint
        };

        const tickPegStep = (nowTime: number) => {
            const elapsed = nowTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const easedProgress = easeOut(progress);
            const currentRot = startRotation + totalDelta * easedProgress;

            setRotation(currentRot);

            // Audio & pointer tick when passing pegs (every 60 degrees, offset by 30)
            const pegIndex = Math.floor((currentRot + 30) / 60);
            if (pegIndex !== lastPegIndexRef.current) {
                lastPegIndexRef.current = pegIndex;
                const speedFactor = 1 - progress * 0.4;
                playTickSound(speedFactor);
                setPointerTilt(-16);
                setTimeout(() => setPointerTilt(0), 45);
            }

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(tickPegStep);
            } else {
                // Spin finished
                setIsSpinning(false);
                setWonPrize(winningSector);
                setShowPrizeOverlay(true);
                playWinFanfare(Boolean(winningSector.isJackpot));
                triggerConfetti(Boolean(winningSector.isJackpot));

                // Claim reward & trigger callbacks
                onClaimPrize(winningSector);
            }
        };

        animFrameRef.current = requestAnimationFrame(tickPegStep);
    };

    // Clean up animation frame on unmount
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // SVG geometry for slices
    const cx = 140;
    const cy = 140;
    const rOuter = 125;

    return (
        <div className="flex flex-col items-center select-none">
            {/* Top Status & Cooldown Bar */}
            <div className="w-full bg-black/50 p-2.5 rounded-xl border border-purple-500/20 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🎡</span>
                    <div>
                        <div className="text-xs font-bold text-purple-200">
                            {isFreeAvailable ? 'Бесплатный спин готов!' : 'Перезарядка спина'}
                        </div>
                        <div className="text-[10px] text-purple-300/70">
                            {isFreeAvailable ? 'Испытай свою удачу прямо сейчас' : `Следующий через: ${formattedTimeRemaining}`}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    {isFreeAvailable ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 animate-pulse">
                            ДОСТУПНО
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30 font-mono">
                            {formattedTimeRemaining}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar towards next spin */}
            {!isFreeAvailable && (
                <div className="w-full h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden border border-purple-500/20">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-1000"
                        style={{ width: `${cooldownProgressPercent}%` }}
                    />
                </div>
            )}

            {/* Wheel Container with 3D drop shadow and procedural lights */}
            <div className="relative flex items-center justify-center my-1" style={{ width: '280px', height: '280px' }}>
                {/* Canvas for procedural confetti explosions */}
                <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    className="absolute inset-0 pointer-events-none z-30"
                />

                {/* Outer Glowing Ring */}
                <div
                    className="absolute inset-1 rounded-full pointer-events-none transition-all"
                    style={{
                        background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.08) 60%, transparent 100%)',
                        boxShadow: isFreeAvailable ? '0 0 28px rgba(236,72,153,0.3), inset 0 0 16px rgba(251,191,36,0.2)' : 'none'
                    }}
                />

                {/* Physical Top Pointer Needle */}
                <div
                    className="absolute top-0 z-20 pointer-events-none"
                    style={{
                        transform: `rotate(${pointerTilt}deg)`,
                        transformOrigin: '50% 2px',
                        transition: isSpinning ? 'transform 0.05s ease' : 'transform 0.2s ease',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))'
                    }}
                >
                    <svg width="28" height="34" viewBox="0 0 28 34">
                        <polygon
                            points="14,32 3,2 25,2"
                            fill="url(#pointerGoldGrad)"
                            stroke="#78350f"
                            strokeWidth="1.5"
                        />
                        {/* Needle ruby jewel */}
                        <circle cx="14" cy="9" r="4" fill="url(#rubyJewelGrad)" stroke="#fff" strokeWidth="0.8" />
                        <defs>
                            <linearGradient id="pointerGoldGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fef08a" />
                                <stop offset="50%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#b45309" />
                            </linearGradient>
                            <linearGradient id="rubyJewelGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fda4af" />
                                <stop offset="50%" stopColor="#e11d48" />
                                <stop offset="100%" stopColor="#881337" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Rotating SVG Wheel */}
                <svg
                    width="280"
                    height="280"
                    viewBox="0 0 280 280"
                    className="overflow-visible"
                >
                    <defs>
                        {/* Sector Gradients */}
                        {LUCKY_WHEEL_SECTORS.map(sec => (
                            <linearGradient key={sec.id} id={`wheelGrad-${sec.id}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={sec.colorStart} />
                                <stop offset="100%" stopColor={sec.colorEnd} />
                            </linearGradient>
                        ))}
                        {/* Outer Rim Gold Gradient */}
                        <linearGradient id="rimGoldGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="25%" stopColor="#f59e0b" />
                            <stop offset="50%" stopColor="#78350f" />
                            <stop offset="75%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        {/* Center Hub Gradient */}
                        <radialGradient id="centerHubGrad" cx="40%" cy="40%" r="60%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="40%" stopColor="#f59e0b" />
                            <stop offset="85%" stopColor="#92400e" />
                            <stop offset="100%" stopColor="#451a03" />
                        </radialGradient>
                    </defs>

                    {/* Outer Decorative Golden Ring */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={rOuter + 9}
                        fill="none"
                        stroke="url(#rimGoldGrad)"
                        strokeWidth="9"
                    />

                    {/* Illuminated bulbs along the rim */}
                    {Array.from({ length: 18 }).map((_, bIdx) => {
                        const bAngle = (bIdx * (360 / 18) * Math.PI) / 180;
                        const bx = cx + (rOuter + 8.5) * Math.cos(bAngle);
                        const by = cy + (rOuter + 8.5) * Math.sin(bAngle);
                        const isAlt = bIdx % 2 === 0;
                        return (
                            <circle
                                key={bIdx}
                                cx={bx}
                                cy={by}
                                r="2.4"
                                fill={isAlt ? '#fef08a' : '#f43f5e'}
                                stroke="#000"
                                strokeWidth="0.5"
                                opacity="0.9"
                            />
                        );
                    })}

                    {/* Dynamic Rotating Group containing slices and pegs */}
                    <g
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: `${cx}px ${cy}px`
                        }}
                    >
                        {/* 6 Pie Slices */}
                        {LUCKY_WHEEL_SECTORS.map((sec, idx) => {
                            // Slice i spans from i*60 - 30 to i*60 + 30 (centered at i*60)
                            const startAngle = (idx * 60 - 30 - 90) * (Math.PI / 180);
                            const endAngle = (idx * 60 + 30 - 90) * (Math.PI / 180);

                            const x1 = cx + rOuter * Math.cos(startAngle);
                            const y1 = cy + rOuter * Math.sin(startAngle);
                            const x2 = cx + rOuter * Math.cos(endAngle);
                            const y2 = cy + rOuter * Math.sin(endAngle);

                            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} Z`;

                            // Text / icon positioning along ray
                            const midAngle = idx * 60;
                            const rText = rOuter * 0.65;

                            return (
                                <g key={sec.id}>
                                    {/* Pie Sector Path */}
                                    <path
                                        d={pathData}
                                        fill={`url(#wheelGrad-${sec.id})`}
                                        stroke="#18181b"
                                        strokeWidth="2"
                                    />

                                    {/* Sector text and icon rotated along midAngle */}
                                    <g transform={`rotate(${midAngle} ${cx} ${cy})`}>
                                        <g transform={`translate(${cx}, ${cy - rText})`}>
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize={sec.isJackpot ? "14" : "16"}
                                                y={sec.isJackpot ? -10 : -8}
                                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                                            >
                                                {sec.icon}
                                            </text>
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize={sec.isJackpot ? "9.5" : "10"}
                                                fontWeight="900"
                                                fill={sec.textColor}
                                                y={sec.isJackpot ? 8 : 8}
                                                fontFamily="Nunito, sans-serif"
                                                style={{
                                                    letterSpacing: '0.2px',
                                                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))'
                                                }}
                                            >
                                                {sec.shortLabel}
                                            </text>
                                        </g>
                                    </g>
                                </g>
                            );
                        })}

                        {/* Physical Metallic Pegs along the border of each slice */}
                        {LUCKY_WHEEL_SECTORS.map((_, pIdx) => {
                            const pegAngle = (pIdx * 60 + 30 - 90) * (Math.PI / 180);
                            const px = cx + (rOuter - 3) * Math.cos(pegAngle);
                            const py = cy + (rOuter - 3) * Math.sin(pegAngle);
                            return (
                                <circle
                                    key={`peg-${pIdx}`}
                                    cx={px}
                                    cy={py}
                                    r="3.2"
                                    fill="#fef08a"
                                    stroke="#451a03"
                                    strokeWidth="1.2"
                                />
                            );
                        })}
                    </g>

                    {/* Center Golden Hub (stationary overlay) */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r="22"
                        fill="url(#centerHubGrad)"
                        stroke="#78350f"
                        strokeWidth="2.5"
                        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))' }}
                    />
                    {/* Center Star Diamond */}
                    <text
                        x={cx}
                        y={cy + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="14"
                        fill="#fff"
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }}
                    >
                        ⭐
                    </text>
                </svg>

                {/* Win Celebration Overlay */}
                {showPrizeOverlay && wonPrize && (
                    <div
                        className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-full flex flex-col items-center justify-center p-4 z-40 text-center animate-scale-up"
                        style={{
                            border: wonPrize.isJackpot ? '3px solid #f43f5e' : '3px solid #fbbf24',
                            boxShadow: wonPrize.isJackpot ? '0 0 35px rgba(244,63,94,0.6)' : '0 0 25px rgba(251,191,36,0.5)'
                        }}
                    >
                        <div className="text-4xl mb-1 animate-bounce">
                            {wonPrize.isJackpot ? '👑' : wonPrize.icon}
                        </div>
                        <h4 className={`text-base font-black ${wonPrize.isJackpot ? 'text-pink-300' : 'text-yellow-300'}`}>
                            {wonPrize.isJackpot ? 'ДЖЕКПОТ!' : 'ПОЗДРАВЛЯЕМ!'}
                        </h4>
                        <p className="text-white text-xs font-extrabold mt-1">
                            Вы выиграли: <span className="text-amber-300">{wonPrize.name}</span>
                        </p>
                        <p className="text-[10px] text-purple-200/70 mt-0.5">
                            Приз начислен на ваш баланс!
                        </p>
                        <button
                            onClick={() => setShowPrizeOverlay(false)}
                            className="mt-3 px-4 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:scale-105 active:scale-95 transition-all shadow-md"
                        >
                            Забрать
                        </button>
                    </div>
                )}
            </div>

            {/* Spin CTA Button */}
            <div className="w-full mt-3">
                <button
                    onClick={handleSpin}
                    disabled={isSpinning || (!isFreeAvailable && remainingMs > 0)}
                    className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                        isSpinning
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30 cursor-wait'
                            : isFreeAvailable
                            ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white border-2 border-yellow-300/60 shadow-[0_0_20px_rgba(236,72,153,0.4)] active:scale-98 animate-pulse cursor-pointer'
                            : 'bg-gray-800/80 text-gray-400 border border-white/10 cursor-not-allowed opacity-80'
                    }`}
                >
                    {isSpinning ? (
                        <>
                            <span className="text-lg animate-spin">🌀</span>
                            <span>КРУТИМ КОЛЕСО...</span>
                        </>
                    ) : isFreeAvailable ? (
                        <>
                            <span className="text-lg">🎡</span>
                            <span>КРУТИТЬ БЕСПЛАТНО!</span>
                        </>
                    ) : (
                        <>
                            <span>⏳</span>
                            <span>СЛЕДУЮЩИЙ СПИН ЧЕРЕЗ: {formattedTimeRemaining}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Subtext info */}
            <p className="text-[10px] text-purple-300/50 text-center mt-2.5">
                Бесплатный спин доступен раз в 4 часа. Все призы начисляются мгновенно.
            </p>
        </div>
    );
};

// Procedural SVG Icon for Tablet Menu (Row 3, Game Juice Style)
export const LuckyWheelIcon: React.FC<{ className?: string; size?: number; hasAvailable?: boolean }> = ({
    className = 'w-[70px] h-[70px]',
    size,
    hasAvailable = false
}) => {
    return (
        <svg
            viewBox="0 0 80 80"
            width={size}
            height={size}
            className={`${className} overflow-visible`}
            style={{ filter: hasAvailable ? 'drop-shadow(0 0 10px rgba(244,114,182,0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
        >
            <defs>
                <linearGradient id="iconRimGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="iconPointerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
            </defs>

            {/* Outer Wheel Rim */}
            <circle cx="40" cy="42" r="32" fill="#18181b" stroke="url(#iconRimGrad)" strokeWidth="3" />

            {/* 6 Colorful Sectors */}
            <path d="M 40 42 L 40 12 A 30 30 0 0 1 65.98 27 Z" fill="#f59e0b" stroke="#18181b" strokeWidth="0.8" />
            <path d="M 40 42 L 65.98 27 A 30 30 0 0 1 65.98 57 Z" fill="#10b981" stroke="#18181b" strokeWidth="0.8" />
            <path d="M 40 42 L 65.98 57 A 30 30 0 0 1 40 72 Z" fill="#06b6d4" stroke="#18181b" strokeWidth="0.8" />
            <path d="M 40 42 L 40 72 A 30 30 0 0 1 14.02 57 Z" fill="#fbbf24" stroke="#18181b" strokeWidth="0.8" />
            <path d="M 40 42 L 14.02 57 A 30 30 0 0 1 14.02 27 Z" fill="#a855f7" stroke="#18181b" strokeWidth="0.8" />
            <path d="M 40 42 L 14.02 27 A 30 30 0 0 1 40 12 Z" fill="#f43f5e" stroke="#18181b" strokeWidth="0.8" />

            {/* Rim Studs */}
            {Array.from({ length: 6 }).map((_, i) => {
                const a = (i * 60 * Math.PI) / 180;
                return (
                    <circle
                        key={i}
                        cx={40 + 30.5 * Math.cos(a)}
                        cy={42 + 30.5 * Math.sin(a)}
                        r="1.5"
                        fill="#fef08a"
                    />
                );
            })}

            {/* Center Hub */}
            <circle cx="40" cy="42" r="8" fill="url(#iconRimGrad)" stroke="#451a03" strokeWidth="1" />
            <circle cx="40" cy="42" r="3" fill="#ffffff" />

            {/* Top Pointer */}
            <polygon points="40,20 35,4 45,4" fill="url(#iconPointerGrad)" stroke="#451a03" strokeWidth="0.8" />

            {/* Sparkles on corner */}
            {hasAvailable && (
                <>
                    <text x="64" y="16" fontSize="11" fill="#fde047" className="animate-ping" style={{ transformOrigin: '68px 12px' }}>✦</text>
                    <text x="6" y="24" fontSize="10" fill="#f472b6" className="animate-pulse">✧</text>
                </>
            )}
        </svg>
    );
};
