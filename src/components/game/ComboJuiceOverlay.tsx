import React, { useEffect, useRef, useState } from 'react';
import {
    FloatingTextItem,
    ComboState,
    getComboTier,
    LevelUpCelebration,
    ConfettiParticle,
    createLevelUpConfettiBurst,
    updateConfettiParticles,
    renderConfettiCanvas,
} from '../../game/juice/comboSystem';

import { ZOOM_LEVELS } from '../../world.js';

interface ComboJuiceOverlayProps {
    floatingItems: FloatingTextItem[];
    comboState: ComboState;
    worldToScreen: (x: number, y: number, zoom: number) => { screenX: number; screenY: number };
    getCameraOffset: () => { x: number; y: number };
    zoomIndex: number;
    levelUpCelebration?: LevelUpCelebration | null;
    onDismissCelebration?: () => void;
}

export const ComboJuiceOverlay: React.FC<ComboJuiceOverlayProps> = ({
    floatingItems,
    comboState,
    worldToScreen,
    getCameraOffset,
    zoomIndex,
    levelUpCelebration,
    onDismissCelebration,
}) => {
    const [now, setNow] = useState(Date.now());
    const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<ConfettiParticle[]>([]);
    const lastFrameTimeRef = useRef<number>(Date.now());
    const lastCelebrationIdRef = useRef<string | null>(null);

    // Trigger confetti cannons whenever a new Level-Up celebration arrives
    useEffect(() => {
        if (levelUpCelebration && levelUpCelebration.id !== lastCelebrationIdRef.current) {
            lastCelebrationIdRef.current = levelUpCelebration.id;
            const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
            const screenH = typeof window !== 'undefined' ? window.innerHeight : 720;

            const burst = createLevelUpConfettiBurst({
                screenWidth: screenW,
                screenHeight: screenH,
                count: 170,
                spreadMode: 'both',
                now: Date.now(),
            });

            particlesRef.current = [...particlesRef.current, ...burst];
        }
    }, [levelUpCelebration]);

    // Smooth animation tick for floating items, combo countdown, and canvas confetti (sleeps when idle)
    useEffect(() => {
        let frameId: number = 0;
        let isRunning = true;

        const tick = () => {
            if (!isRunning) return;

            const currentNow = Date.now();
            const hasParticles = particlesRef.current.length > 0;
            const hasFloating = floatingItems.some(item => (currentNow - item.createdAt) < item.durationMs);
            const isComboActiveNow = comboState.comboCount >= 2 && (currentNow - comboState.lastHitTime <= comboState.comboTimeoutMs);

            // If nothing is animating, sleep until next trigger to save 100% idle CPU
            if (!hasParticles && !hasFloating && !isComboActiveNow && !levelUpCelebration) {
                setNow(currentNow);
                const canvas = confettiCanvasRef.current;
                if (canvas && typeof window !== 'undefined') {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
                return;
            }

            setNow(currentNow);

            // Animate Confetti on Canvas
            const canvas = confettiCanvasRef.current;
            if (canvas && typeof window !== 'undefined') {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const dpr = window.devicePixelRatio || 1;
                    const displayW = window.innerWidth;
                    const displayH = window.innerHeight;
                    const targetCanvasW = Math.floor(displayW * dpr);
                    const targetCanvasH = Math.floor(displayH * dpr);

                    if (canvas.width !== targetCanvasW || canvas.height !== targetCanvasH) {
                        canvas.width = targetCanvasW;
                        canvas.height = targetCanvasH;
                    }

                    ctx.save();
                    ctx.scale(dpr, dpr);

                    if (particlesRef.current.length > 0) {
                        const dt = Math.min(0.1, (currentNow - lastFrameTimeRef.current) / 1000);
                        particlesRef.current = updateConfettiParticles(particlesRef.current, currentNow, dt);
                        renderConfettiCanvas(ctx, particlesRef.current, displayW, displayH);
                    } else {
                        ctx.clearRect(0, 0, displayW, displayH);
                    }

                    ctx.restore();
                }
            }
            lastFrameTimeRef.current = currentNow;

            frameId = requestAnimationFrame(tick);
        };
        frameId = requestAnimationFrame(tick);
        return () => {
            isRunning = false;
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [floatingItems.length, comboState.comboCount, comboState.lastHitTime, levelUpCelebration]);

    const zoom = ZOOM_LEVELS[zoomIndex] || 1;
    const isComboActive = comboState.comboCount >= 2 && (now - comboState.lastHitTime <= comboState.comboTimeoutMs);
    const comboTimeRemaining = Math.max(0, comboState.comboTimeoutMs - (now - comboState.lastHitTime));
    const comboProgress = Math.min(1, Math.max(0, comboTimeRemaining / comboState.comboTimeoutMs));
    const tier = getComboTier(comboState.comboCount);
    const cameraOffset = getCameraOffset();

    const isCelebrationVisible = Boolean(
        levelUpCelebration &&
        now - levelUpCelebration.createdAt < levelUpCelebration.durationMs
    );

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-30">
            <style>{`
                @keyframes floatJuice {
                    0% {
                        transform: translate3d(-50%, 0, 0) scale(0.6);
                        opacity: 0;
                    }
                    15% {
                        transform: translate3d(-50%, -12px, 0) scale(1.18);
                        opacity: 1;
                    }
                    30% {
                        transform: translate3d(-50%, -24px, 0) scale(1.0);
                        opacity: 1;
                    }
                    75% {
                        transform: translate3d(-50%, -46px, 0) scale(0.98);
                        opacity: 0.95;
                    }
                    100% {
                        transform: translate3d(-50%, -64px, 0) scale(0.85);
                        opacity: 0;
                    }
                }

                @keyframes comboBadgePop {
                    0% {
                        transform: translate3d(-50%, 10px, 0) scale(0.4) rotate(-6deg);
                        opacity: 0;
                    }
                    25% {
                        transform: translate3d(-50%, -15px, 0) scale(1.3) rotate(3deg);
                        opacity: 1;
                    }
                    45% {
                        transform: translate3d(-50%, -25px, 0) scale(1.05) rotate(-1deg);
                        opacity: 1;
                    }
                    75% {
                        transform: translate3d(-50%, -42px, 0) scale(1.0) rotate(0deg);
                        opacity: 0.95;
                    }
                    100% {
                        transform: translate3d(-50%, -60px, 0) scale(0.82);
                        opacity: 0;
                    }
                }

                @keyframes levelUpBadgePop {
                    0% {
                        transform: translate3d(-50%, 15px, 0) scale(0.3) rotate(-4deg);
                        opacity: 0;
                    }
                    20% {
                        transform: translate3d(-50%, -20px, 0) scale(1.35) rotate(2deg);
                        opacity: 1;
                    }
                    40% {
                        transform: translate3d(-50%, -35px, 0) scale(1.1) rotate(0deg);
                        opacity: 1;
                    }
                    80% {
                        transform: translate3d(-50%, -65px, 0) scale(1.02);
                        opacity: 0.95;
                    }
                    100% {
                        transform: translate3d(-50%, -90px, 0) scale(0.85);
                        opacity: 0;
                    }
                }

                @keyframes starSpinFloat {
                    0% {
                        transform: translate3d(-50%, 0, 0) scale(0.3) rotate(0deg);
                        opacity: 0;
                    }
                    20% {
                        transform: translate3d(-50%, -18px, 0) scale(1.3) rotate(45deg);
                        opacity: 1;
                    }
                    60% {
                        transform: translate3d(-50%, -45px, 0) scale(1.1) rotate(140deg);
                        opacity: 1;
                    }
                    85% {
                        transform: translate3d(-50%, -70px, 0) scale(0.95) rotate(220deg);
                        opacity: 0.85;
                    }
                    100% {
                        transform: translate3d(-50%, -95px, 0) scale(0.7) rotate(300deg);
                        opacity: 0;
                    }
                }

                @keyframes levelUpBannerPop {
                    0% {
                        transform: translate3d(-50%, -60px, 0) scale(0.65);
                        opacity: 0;
                    }
                    25% {
                        transform: translate3d(-50%, 0, 0) scale(1.08);
                        opacity: 1;
                    }
                    40% {
                        transform: translate3d(-50%, 0, 0) scale(0.97);
                        opacity: 1;
                    }
                    60% {
                        transform: translate3d(-50%, 0, 0) scale(1.02);
                        opacity: 1;
                    }
                    85% {
                        transform: translate3d(-50%, 0, 0) scale(1.0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate3d(-50%, -30px, 0) scale(0.92);
                        opacity: 0;
                    }
                }

                @keyframes sunburstRotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes bannerGlowPulse {
                    0%, 100% {
                        box-shadow: 0 0 25px rgba(251, 191, 36, 0.6), 0 8px 30px rgba(0, 0, 0, 0.85);
                    }
                    50% {
                        box-shadow: 0 0 50px rgba(251, 191, 36, 0.95), 0 12px 40px rgba(0, 0, 0, 0.95);
                    }
                }

                @keyframes hudPulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.06);
                    }
                }

                @keyframes hudWobble {
                    0%, 100% {
                        transform: rotate(0deg) scale(1);
                    }
                    25% {
                        transform: rotate(-2.5deg) scale(1.08);
                    }
                    75% {
                        transform: rotate(2.5deg) scale(1.08);
                    }
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            {/* Confetti & Fireworks 2D Canvas Layer */}
            <canvas
                ref={confettiCanvasRef}
                className="absolute inset-0 pointer-events-none w-full h-full"
                style={{ zIndex: 25 }}
            />

            {/* 1. Floating World Numbers, World Badges & Golden Stars */}
            {floatingItems.map(item => {
                const elapsed = now - item.createdAt;
                if (elapsed >= item.durationMs) return null;

                const { screenX, screenY } = worldToScreen(item.worldX, item.worldY, zoom);
                const finalX = screenX + cameraOffset.x;
                const finalY = screenY + cameraOffset.y;

                // Culling offscreen elements
                if (
                    isNaN(finalX) ||
                    isNaN(finalY) ||
                    finalX < -150 ||
                    finalX > window.innerWidth + 150 ||
                    finalY < -150 ||
                    finalY > window.innerHeight + 150
                ) {
                    return null;
                }

                const isComboItem = item.type === 'combo';
                const isLevelUpItem = item.type === 'levelup';
                const isStarItem = item.type === 'star';

                let animationName = `floatJuice ${item.durationMs}ms ease-out forwards`;
                if (isComboItem) {
                    animationName = `comboBadgePop ${item.durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;
                } else if (isLevelUpItem) {
                    animationName = `levelUpBadgePop ${item.durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;
                } else if (isStarItem) {
                    animationName = `starSpinFloat ${item.durationMs}ms ease-out forwards`;
                }

                return (
                    <div
                        key={item.id}
                        className="absolute will-change-transform"
                        style={{
                            left: `${finalX}px`,
                            top: `${finalY}px`,
                            animation: animationName,
                            zIndex: isLevelUpItem ? 50 : isComboItem ? 40 : 35,
                        }}
                    >
                        {isLevelUpItem ? (
                            <div
                                className="px-4 py-2 rounded-2xl border-2 shadow-2xl flex items-center gap-2 whitespace-nowrap bg-slate-950/95"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(24, 20, 10, 0.94) 0%, rgba(10, 10, 15, 0.96) 100%)',
                                    borderColor: item.color,
                                    boxShadow: `0 0 28px ${item.glowColor || item.color}, 0 6px 16px rgba(0,0,0,0.9)`,
                                    transform: `scale(${item.scale})`,
                                }}
                            >
                                <span
                                    className="font-black text-sm md:text-base tracking-wider drop-shadow-md"
                                    style={{
                                        color: item.color,
                                        fontFamily: "'Nunito', 'Impact', sans-serif",
                                        textShadow: `0 0 12px ${item.glowColor || item.color}, 0 2px 4px rgba(0,0,0,0.9)`,
                                    }}
                                >
                                    {item.text}
                                </span>
                            </div>
                        ) : isStarItem ? (
                            <span
                                className="inline-block select-none"
                                style={{
                                    fontSize: `${22 * item.scale}px`,
                                    filter: `drop-shadow(0 0 12px ${item.glowColor || '#fef08a'}) drop-shadow(0 2px 4px rgba(0,0,0,0.8))`,
                                }}
                            >
                                {item.text}
                            </span>
                        ) : isComboItem ? (
                            <div
                                className="px-3 py-1 rounded-full border-2 shadow-2xl flex items-center gap-1.5 whitespace-nowrap"
                                style={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.88)',
                                    borderColor: item.color,
                                    boxShadow: `0 0 18px ${item.glowColor || item.color}, 0 4px 10px rgba(0,0,0,0.8)`,
                                    transform: `scale(${item.scale})`,
                                }}
                            >
                                <span
                                    className="font-black text-sm md:text-base tracking-wider drop-shadow-md"
                                    style={{
                                        color: item.color,
                                        fontFamily: "'Nunito', 'Impact', sans-serif",
                                        textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                                    }}
                                >
                                    {item.text}
                                </span>
                            </div>
                        ) : (
                            <span
                                className="font-black tracking-wide whitespace-nowrap drop-shadow-lg"
                                style={{
                                    fontSize: item.type === 'gold' ? `${18 * item.scale}px` : `${16 * item.scale}px`,
                                    color: item.color,
                                    fontFamily: "'Nunito', sans-serif",
                                    WebkitTextStroke: '1px #000000',
                                    textShadow: `0 0 10px ${item.glowColor || item.color}, 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000`,
                                }}
                            >
                                {item.text}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* 2. Grand Level-Up Victory Banner (Appears at top-center on Level-Up) */}
            {isCelebrationVisible && levelUpCelebration && (
                <div
                    className="absolute top-12 md:top-16 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center"
                    style={{
                        animation: `levelUpBannerPop ${levelUpCelebration.durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    }}
                >
                    <div
                        className="relative px-6 md:px-10 py-3.5 md:py-4 rounded-3xl border-2 flex flex-col items-center gap-1 overflow-hidden bg-slate-950/95"
                        style={{
                            background: 'linear-gradient(135deg, rgba(28, 22, 10, 0.96) 0%, rgba(14, 12, 22, 0.98) 100%)',
                            borderColor: levelUpCelebration.color,
                            animation: 'bannerGlowPulse 1.8s ease-in-out infinite',
                        }}
                    >
                        {/* Shimmer light beam */}
                        <div
                            className="absolute inset-0 opacity-25 pointer-events-none"
                            style={{
                                background: `linear-gradient(90deg, transparent, ${levelUpCelebration.color}, transparent)`,
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 2s infinite',
                            }}
                        />

                        {/* Top celebratory header */}
                        <div className="flex items-center gap-2.5">
                            <span className="text-2xl md:text-3xl filter drop-shadow-md animate-bounce">
                                {levelUpCelebration.icon}
                            </span>
                            <span
                                className="font-black text-xl md:text-2xl tracking-wider uppercase"
                                style={{
                                    color: levelUpCelebration.color,
                                    fontFamily: "'Impact', 'Nunito', sans-serif",
                                    textShadow: `0 0 16px ${levelUpCelebration.glowColor}, 0 2px 6px rgba(0,0,0,0.9)`,
                                }}
                            >
                                {levelUpCelebration.title}
                            </span>
                            <span className="text-2xl md:text-3xl filter drop-shadow-md animate-bounce">
                                {levelUpCelebration.icon}
                            </span>
                        </div>

                        {/* Subtitle with new level achieved */}
                        <span className="text-sm md:text-base font-bold text-white tracking-wide drop-shadow-md">
                            {levelUpCelebration.subtitle}
                        </span>

                        {/* Highlight / unlocked benefit */}
                        {levelUpCelebration.highlight && (
                            <span className="text-xs md:text-sm font-semibold text-amber-200/90 tracking-wide mt-0.5">
                                {levelUpCelebration.highlight}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* 3. Persistent Combo HUD Badge (Appears when combo >= 2) */}
            {isComboActive && (
                <div
                    className="absolute top-20 right-4 md:right-8 flex flex-col items-end pointer-events-none z-40 transition-all duration-200"
                    style={{
                        animation: tier.shake ? 'hudWobble 0.35s ease-in-out infinite' : 'hudPulse 0.8s ease-in-out infinite',
                    }}
                >
                    <div
                        className="px-4 py-2 rounded-2xl border-2 shadow-2xl bg-slate-950/95 flex items-center gap-3 relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.92) 0%, rgba(10, 10, 20, 0.96) 100%)',
                            borderColor: tier.color,
                            boxShadow: `0 0 20px ${tier.glowColor}, 0 8px 24px rgba(0, 0, 0, 0.8)`,
                        }}
                    >
                        {/* Shimmer line */}
                        <div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{
                                background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 1.8s infinite',
                            }}
                        />

                        {/* Combo Count Counter */}
                        <div className="flex flex-col items-center">
                            <span
                                className="font-black text-2xl md:text-3xl leading-none tracking-tighter"
                                style={{
                                    color: tier.color,
                                    fontFamily: "'Impact', 'Nunito', sans-serif",
                                    textShadow: `0 0 12px ${tier.glowColor}, 2px 2px 0 #000`,
                                }}
                            >
                                x{comboState.comboCount}
                            </span>
                            <span className="text-[9px] font-bold tracking-widest text-gray-300 uppercase -mt-0.5">
                                КОМБО
                            </span>
                        </div>

                        {/* Separator */}
                        <div className="w-[1px] h-8 bg-white/20" />

                        {/* Combo Details & Timer Bar */}
                        <div className="flex flex-col min-w-[100px]">
                            <div className="flex items-center justify-between gap-2">
                                <span
                                    className="font-extrabold text-xs md:text-sm tracking-wide whitespace-nowrap"
                                    style={{ color: tier.color }}
                                >
                                    {tier.badge}
                                </span>
                                <span className="text-[10px] text-gray-300 font-mono">
                                    {(comboTimeRemaining / 1000).toFixed(1)}s
                                </span>
                            </div>

                            {/* Countdown Progress Bar */}
                            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden mt-1 p-[1px] border border-white/10">
                                <div
                                    className="h-full rounded-full transition-all duration-75"
                                    style={{
                                        width: `${comboProgress * 100}%`,
                                        backgroundColor: tier.color,
                                        boxShadow: `0 0 8px ${tier.color}`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
