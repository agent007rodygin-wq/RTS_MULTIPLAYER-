import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FishingSpot, FishDefinition, CaughtFishResult } from '../../game/fishing/fishingTypes';
import { rollBasingseFish } from '../../game/fishing/fishingData';
import { fishingAudio } from '../../game/fishing/fishingAudio';

interface FishingModalProps {
  isOpen: boolean;
  spot: FishingSpot | null;
  playerEnergy: number;
  onClose: () => void;
  onCatchFish: (result: CaughtFishResult) => void;
}

type FishingState = 'ready' | 'waiting' | 'bite' | 'minigame' | 'caught' | 'lost';

export const FishingModal: React.FC<FishingModalProps> = ({
  isOpen,
  spot,
  playerEnergy,
  onClose,
  onCatchFish
}) => {
  const [gameState, setGameState] = useState<FishingState>('ready');
  const [currentFish, setCurrentFish] = useState<FishDefinition | null>(null);
  const [caughtResult, setCaughtResult] = useState<CaughtFishResult | null>(null);
  const [failReason, setFailReason] = useState<string>('');

  // Minigame physics state
  const [sliderPos, setSliderPos] = useState<number>(10);
  const [sweetSpotStart, setSweetSpotStart] = useState<number>(40);
  const [sweetSpotWidth, setSweetSpotWidth] = useState<number>(24);
  const [keyPrompt, setKeyPrompt] = useState<string>('ПРОБЕЛ');
  const [targetCode, setTargetCode] = useState<string>('Space');
  const [catchProgress, setCatchProgress] = useState<number>(25);
  const [lineTension, setLineTension] = useState<number>(15);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Timers and animation refs
  const biteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const sliderDirectionRef = useRef<number>(1);
  const currentFishRef = useRef<FishDefinition | null>(null);
  const targetCodeRef = useRef<string>('Space');

  useEffect(() => {
    currentFishRef.current = currentFish;
  }, [currentFish]);

  useEffect(() => {
    targetCodeRef.current = targetCode;
  }, [targetCode]);

  // Clean reset on modal open/close
  useEffect(() => {
    if (isOpen) {
      setGameState('ready');
      setCaughtResult(null);
      setFailReason('');
    } else {
      if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
      cancelAnimationFrame(animFrameRef.current);
    }
  }, [isOpen]);

  const repositionSweetSpot = useCallback(() => {
    const min = 12;
    const max = 88 - sweetSpotWidth;
    setSweetSpotStart(min + Math.random() * (max - min));
  }, [sweetSpotWidth]);

  const pickKeyPrompt = useCallback(() => {
    const keys = [
      { code: 'Space', label: 'ПРОБЕЛ' },
      { code: 'KeyE', label: 'E' },
      { code: 'KeyA', label: 'A' },
      { code: 'KeyD', label: 'D' },
      { code: 'KeyW', label: 'W' },
      { code: 'KeyS', label: 'S' }
    ];
    const chosen = keys[Math.floor(Math.random() * keys.length)];
    setTargetCode(chosen.code);
    setKeyPrompt(chosen.label);
  }, []);

  // 1. Cast line
  const handleCast = () => {
    if (playerEnergy < 1) {
      setFailReason('Недостаточно энергии для рыбалки (нужна минимум 1 ед.)');
      return;
    }

    fishingAudio.playCast();
    setGameState('waiting');
    setFailReason('');

    const fish = rollBasingseFish();
    setCurrentFish(fish);

    // Random wait between 2.2 and 4.2 seconds
    const waitTime = 2200 + Math.random() * 2000;
    biteTimeoutRef.current = setTimeout(() => {
      triggerBite(fish);
    }, waitTime);
  };

  // 2. Bite triggered
  const triggerBite = (fish: FishDefinition) => {
    fishingAudio.playBiteChime();
    setGameState('bite');

    // Reaction window (1.8 - 2.2s depending on fish difficulty)
    const reactionWindow = Math.max(1600, 2400 - fish.difficulty * 80);
    reactionTimeoutRef.current = setTimeout(() => {
      fishingAudio.playLineSnap();
      setFailReason('Рыба сорвалась и утащила наживку!');
      setGameState('lost');
    }, reactionWindow);
  };

  // 3. Strike and start Minigame
  const handleStrike = useCallback(() => {
    if (reactionTimeoutRef.current) {
      clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = null;
    }

    fishingAudio.playSuccessHit();
    setGameState('minigame');
    setCatchProgress(25);
    setLineTension(15);
    setSliderPos(10);
    sliderDirectionRef.current = 1;

    const fish = currentFishRef.current || rollBasingseFish();
    const width = Math.max(14, 28 - fish.difficulty * 1.5);
    setSweetSpotWidth(width);
    repositionSweetSpot();
    pickKeyPrompt();

    lastTimeRef.current = performance.now();
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(minigameLoop);
  }, [repositionSweetSpot, pickKeyPrompt]);

  // Minigame 60fps Loop
  const minigameLoop = useCallback((timestamp: number) => {
    const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
    lastTimeRef.current = timestamp;

    const fish = currentFishRef.current;
    const speed = 75 + (fish ? fish.difficulty * 12 : 30); // % of bar per second

    setSliderPos(prev => {
      let next = prev + sliderDirectionRef.current * speed * dt;
      if (next >= 100) {
        next = 100;
        sliderDirectionRef.current = -1;
      } else if (next <= 0) {
        next = 0;
        sliderDirectionRef.current = 1;
      }
      return next;
    });

    // Gradual tension accumulation
    const tensionRate = 8 + (fish ? fish.difficulty * 1.6 : 4);
    setLineTension(prev => {
      const next = prev + tensionRate * dt;
      if (next >= 100) {
        // Line snapped!
        fishingAudio.playLineSnap();
        setFailReason('Леска не выдержала натяжения и порвалась!');
        setGameState('lost');
        return 100;
      }
      return next;
    });

    // Slow catch decay if inactive
    setCatchProgress(prev => Math.max(0, prev - 2 * dt));

    animFrameRef.current = requestAnimationFrame(minigameLoop);
  }, []);

  // Process player QTE input
  const handleMinigameInput = useCallback((code: string) => {
    const target = targetCodeRef.current;
    if (code !== target && !(code === 'Space' && target === 'Space')) {
      // Wrong key penalty
      fishingAudio.playLineSnap();
      setLineTension(prev => Math.min(100, prev + 20));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 250);
      return;
    }

    // Check slider in sweet spot
    const isInside = sliderPos >= sweetSpotStart && sliderPos <= (sweetSpotStart + sweetSpotWidth);
    if (isInside) {
      fishingAudio.playSuccessHit();
      const fish = currentFishRef.current;
      const progressGain = Math.max(18, 35 - (fish ? fish.difficulty * 1.8 : 4));

      setCatchProgress(prev => {
        const next = Math.min(100, prev + progressGain);
        if (next >= 100) {
          // Fish Caught!
          cancelAnimationFrame(animFrameRef.current);
          fishingAudio.playCatchSuccess();

          if (fish) {
            const weight = +(fish.weightMin + Math.random() * (fish.weightMax - fish.weightMin)).toFixed(2);
            const coins = Math.round(fish.coinRewardMin + Math.random() * (fish.coinRewardMax - fish.coinRewardMin));
            const result: CaughtFishResult = { fish, weight, coinsEarned: coins };
            setCaughtResult(result);
            setGameState('caught');
            onCatchFish(result);
          }
          return 100;
        }
        return next;
      });

      setLineTension(prev => Math.max(5, prev - 16));
      repositionSweetSpot();
      pickKeyPrompt();
    } else {
      // Missed sweet spot
      fishingAudio.playLineSnap();
      setLineTension(prev => Math.min(100, prev + 18));
      setCatchProgress(prev => Math.max(0, prev - 6));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 250);
    }
  }, [sliderPos, sweetSpotStart, sweetSpotWidth, repositionSweetSpot, pickKeyPrompt, onCatchFish]);

  // Global Keyboard listener for minigame
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'Escape') {
        onClose();
        return;
      }

      if (gameState === 'ready') {
        if (e.code === 'KeyE' || e.code === 'Space') {
          handleCast();
        }
      } else if (gameState === 'bite') {
        if (e.code === 'Space' || e.code === 'KeyE') {
          handleStrike();
        }
      } else if (gameState === 'minigame') {
        if (['Space', 'KeyE', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
          e.preventDefault();
          handleMinigameInput(e.code);
        }
      } else if (gameState === 'caught' || gameState === 'lost') {
        if (e.code === 'Enter' || e.code === 'Space') {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState, handleStrike, handleMinigameInput, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm select-none">
      <div
        className={`relative w-[500px] max-w-[95vw] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-2xl border-2 border-amber-500/70 ${
          isShaking ? 'animate-bounce' : ''
        }`}
        style={{
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.25), 0 20px 40px rgba(0, 0, 0, 0.9)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎣</span>
            <div>
              <h3 className="font-extrabold text-lg tracking-wider text-amber-400">РЫБАЛКА В БА СИНГ СЕ</h3>
              <p className="text-xs text-slate-400">
                Речной участок {spot ? `(${spot.x}, ${spot.y})` : ''} &bull; Осталось клевов: <strong className="text-sky-300">{spot?.fishCount || 3}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition"
          >
            &times;
          </button>
        </div>

        {/* READY STATE */}
        {gameState === 'ready' && (
          <div className="text-center py-6">
            <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-sky-950/80 border-2 border-sky-400/50 shadow-inner">
              <span className="text-5xl animate-pulse">🌊</span>
            </div>
            <h4 className="text-base font-bold text-slate-200 mb-1">Круги на воде обнаружены!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              В этом месте реки плещется крупная рыба. Забросьте удочку и будьте готовы к резкой поклёвке!
            </p>
            <button
              onClick={handleCast}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-extrabold text-slate-950 shadow-lg text-sm tracking-wider uppercase transition active:scale-95"
            >
              Забросить удочку [E / ПРОБЕЛ]
            </button>
          </div>
        )}

        {/* WAITING STATE */}
        {gameState === 'waiting' && (
          <div className="text-center py-8">
            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-sky-900/60 border border-sky-400/60 animate-spin">
              <span className="text-4xl">🪱</span>
            </div>
            <h4 className="text-base font-bold text-amber-300 animate-pulse mb-1">Поплавок покачивается на волнах...</h4>
            <p className="text-xs text-slate-400">Внимательно следите за поплавком! При поклёвке жмите [ПРОБЕЛ].</p>
          </div>
        )}

        {/* BITE ALERT STATE */}
        {gameState === 'bite' && (
          <div className="text-center py-6">
            <button
              onClick={handleStrike}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 border-2 border-red-300 shadow-2xl animate-pulse text-white font-black text-2xl tracking-widest uppercase transition transform active:scale-95"
            >
              ❗ ПОКЛЁВКА! ЖМИ [ПРОБЕЛ]!
            </button>
            <p className="text-xs text-slate-300 mt-3 font-semibold">Быстрее подсекайте, пока рыба не утащила наживку!</p>
          </div>
        )}

        {/* MINIGAME STATE (GTA 5 RP STYLE) */}
        {gameState === 'minigame' && (
          <div className="py-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold mb-2">
              <span>Вываживание: <strong className="text-amber-300">{currentFish?.name || 'Рыба'}</strong></span>
              <span className="text-sky-300 font-mono">Шкала GTA 5 RP</span>
            </div>

            {/* Main Timing Bar Track */}
            <div
              onClick={() => handleMinigameInput(targetCode)}
              className="relative w-full h-14 bg-slate-950 rounded-xl border-2 border-slate-700 overflow-hidden mb-4 cursor-pointer shadow-inner"
            >
              {/* Sweet spot (Green zone) */}
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500/80 to-emerald-400/90 border-x-2 border-emerald-300 shadow-[0_0_15px_#22c55e]"
                style={{
                  left: `${sweetSpotStart}%`,
                  width: `${sweetSpotWidth}%`
                }}
              />
              {/* Running Slider (White bar) */}
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-white rounded-sm shadow-[0_0_12px_#ffffff,0_0_24px_#38bdf8] transform -translate-x-1/2"
                style={{ left: `${sliderPos}%` }}
              />
            </div>

            {/* QTE Key Prompt */}
            <div className="text-center mb-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1">
                Жмите в зелёной зоне:
              </span>
              <button
                onClick={() => handleMinigameInput(targetCode)}
                className="inline-block px-6 py-2 rounded-lg bg-slate-800 border-2 border-amber-400/80 font-black text-2xl tracking-widest text-amber-300 shadow-md active:scale-95"
              >
                [ {keyPrompt} ]
              </button>
            </div>

            {/* Catch Progress Gauge */}
            <div className="mb-2">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Прогресс вытягивания</span>
                <span className="text-emerald-400">{Math.round(catchProgress)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-75"
                  style={{ width: `${catchProgress}%` }}
                />
              </div>
            </div>

            {/* Line Tension Gauge */}
            <div className="mb-2">
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Натяжение лески (не доводите до 100%!)</span>
                <span className={lineTension > 75 ? 'text-rose-400' : 'text-sky-400'}>{Math.round(lineTension)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-75 ${
                    lineTension > 75 ? 'bg-rose-500 shadow-[0_0_10px_#ef4444]' : lineTension > 45 ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${lineTension}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CAUGHT STATE */}
        {gameState === 'caught' && caughtResult && (
          <div className="text-center py-4">
            <div className="text-amber-400 font-black text-2xl tracking-wider mb-2">УСПЕШНЫЙ УЛОВ!</div>
            <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-2xl bg-sky-950/60 border border-amber-400/40 p-2 shadow-inner">
              <img
                src={caughtResult.fish.imageUrl}
                alt={caughtResult.fish.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              />
            </div>
            <h4 className="text-lg font-black text-white mb-1">{caughtResult.fish.name}</h4>
            <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase mb-3 bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {caughtResult.fish.rarity}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Вес</span>
                <strong className="text-sky-300 font-mono text-sm">{caughtResult.weight} кг</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Награда</span>
                <strong className="text-emerald-400 font-mono text-sm">+{caughtResult.coinsEarned} монет</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Энергия</span>
                <strong className="text-amber-300 font-mono text-sm">+{caughtResult.fish.energyBonus}</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs uppercase tracking-wider text-slate-200 transition"
              >
                В рюкзак [ENTER]
              </button>
              {spot && spot.fishCount > 1 && (
                <button
                  onClick={handleCast}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-bold text-xs uppercase tracking-wider text-slate-950 transition"
                >
                  Ловить еще [E]
                </button>
              )}
            </div>
          </div>
        )}

        {/* LOST STATE */}
        {gameState === 'lost' && (
          <div className="text-center py-6">
            <span className="text-5xl block mb-2">💥</span>
            <h4 className="text-lg font-black text-rose-400 mb-1">Рыба сорвалась!</h4>
            <p className="text-xs text-slate-400 mb-6">{failReason || 'Леска не выдержала рывка рыбы.'}</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs uppercase tracking-wider text-slate-200 transition"
              >
                Закрыть [ESC]
              </button>
              <button
                onClick={handleCast}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs uppercase tracking-wider text-slate-950 transition"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
