import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { pb } from '../../pocketbase';

export interface DailyRewardItem {
  id?: number;
  name: string;
  amount: number;
  icon: string;
}

export interface DailyRewardDay {
  day: number;
  title: string;
  gold: number;
  rubies: number;
  items: DailyRewardItem[];
  isSpecial?: boolean;
}

export const DAILY_REWARDS_CONFIG: DailyRewardDay[] = [
  {
    day: 1,
    title: 'День 1',
    gold: 500,
    rubies: 0,
    items: [{ name: 'Золото', amount: 500, icon: '/Gui/Front/значек монет/Image-2.webp' }]
  },
  {
    day: 2,
    title: 'День 2',
    gold: 0,
    rubies: 0,
    items: [
      { id: 10002, name: 'Доски', amount: 20, icon: '/buildings/ресурсы/Ресурсы/Доски/10002.webp' },
      { id: 10005, name: 'Камни', amount: 20, icon: '/buildings/ресурсы/Ресурсы/Камни/10005.webp' }
    ]
  },
  {
    day: 3,
    title: 'День 3',
    gold: 1000,
    rubies: 0,
    items: [
      { name: 'Золото', amount: 1000, icon: '/Gui/Front/значек монет/Image-2.webp' },
      { id: 10001, name: 'Дерево', amount: 30, icon: '/buildings/ресурсы/Ресурсы/Дерево/10001.webp' }
    ]
  },
  {
    day: 4,
    title: 'День 4',
    gold: 0,
    rubies: 2,
    items: [
      { name: 'Рубины', amount: 2, icon: '/Gui/Front/значек рубинов/Nj7hb.webp' },
      { id: 10006, name: 'Каменные блоки', amount: 10, icon: '/buildings/ресурсы/Ресурсы/Каменные блоки/10006.webp' }
    ]
  },
  {
    day: 5,
    title: 'День 5',
    gold: 1500,
    rubies: 0,
    items: [
      { name: 'Золото', amount: 1500, icon: '/Gui/Front/значек монет/Image-2.webp' },
      { id: 10013, name: 'Петарды', amount: 5, icon: '/buildings/ресурсы/Бомбы/Петарда/10013.webp' }
    ]
  },
  {
    day: 6,
    title: 'День 6',
    gold: 2500,
    rubies: 3,
    items: [
      { name: 'Золото', amount: 2500, icon: '/Gui/Front/значек монет/Image-2.webp' },
      { name: 'Рубины', amount: 3, icon: '/Gui/Front/значек рубинов/Nj7hb.webp' }
    ]
  },
  {
    day: 7,
    title: 'День 7 (Супер)',
    gold: 0,
    rubies: 5,
    isSpecial: true,
    items: [
      { name: 'Рубины', amount: 5, icon: '/Gui/Front/значек рубинов/Nj7hb.webp' },
      { id: 10018, name: 'Яйцо Горыныча', amount: 1, icon: '/buildings/ресурсы/Монстры/Яйцо Горыныча/10018.webp' }
    ]
  }
];

export interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  playerName?: string;
  telegramLinked: boolean;
  lastDailyRewardClaim?: number;
  streakDays?: number;
  onRewardClaimed: (result: {
    gold: number;
    rubies: number;
    inventory: Record<string, number>;
    streakDays: number;
    reward: any;
  }) => void;
  onCheckTelegramLink: () => Promise<boolean>;
  playOpenSound?: () => void;
  playCloseSound?: () => void;
}

function getUtcDayNumber(ts: number) {
  return Math.floor(Number(ts || 0) / 86400000);
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  userId,
  playerName = '',
  telegramLinked,
  lastDailyRewardClaim = 0,
  streakDays = 1,
  onRewardClaimed,
  onCheckTelegramLink,
  playOpenSound,
  playCloseSound
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [localLinked, setLocalLinked] = useState<boolean>(Boolean(telegramLinked));

  // Sync internal state when prop changes
  useEffect(() => {
    setLocalLinked(Boolean(telegramLinked));
  }, [telegramLinked]);

  // Real-time polling & window focus auto-detection: unlocks automatically as soon as linked in bot!
  useEffect(() => {
    if (!isOpen || localLinked) return;

    let cancelled = false;
    const checkStatus = async () => {
      try {
        const isLinked = await onCheckTelegramLink();
        if (isLinked && !cancelled) {
          setLocalLinked(true);
          setCheckMessage('🎉 Telegram успешно привязан! Бонус разблокирован!');
          if (playOpenSound) playOpenSound();
        }
      } catch (_e) {
        // Silent background check failure
      }
    };

    // 1. Immediately check when user switches back to this browser tab/window
    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        void checkStatus();
      }
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    // 2. Poll every 2.5 seconds while modal is open and not linked
    const pollInterval = setInterval(() => {
      void checkStatus();
    }, 2500);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      clearInterval(pollInterval);
    };
  }, [isOpen, localLinked, onCheckTelegramLink, playOpenSound]);

  // Update clock every second for countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const botLink = useMemo(() => {
    return `https://t.me/BasingseCritpoCytiAI_bot?start=link_${userId}`;
  }, [userId]);

  const todayDay = getUtcDayNumber(now);
  const lastClaimDay = getUtcDayNumber(lastDailyRewardClaim);
  const isClaimedToday = lastDailyRewardClaim > 0 && todayDay === lastClaimDay;

  // Active day in streak to claim
  const currentStreakDay = useMemo(() => {
    if (lastDailyRewardClaim === 0) return 1;
    if (isClaimedToday) return streakDays;
    if (todayDay === lastClaimDay + 1) {
      return (streakDays % 7) + 1;
    }
    // Broken streak
    return 1;
  }, [lastDailyRewardClaim, isClaimedToday, todayDay, lastClaimDay, streakDays]);

  // Countdown until tomorrow UTC
  const timeLeftFormatted = useMemo(() => {
    const nextDayTs = (todayDay + 1) * 86400000;
    const diff = Math.max(0, nextDayTs - now);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [todayDay, now]);

  const handleClaim = async () => {
    if (isClaiming || isClaimedToday) return;
    setIsClaiming(true);
    setClaimError(null);

    try {
      const apiEndpoint = `${pb.baseUrl || 'http://127.0.0.1:8090'}/api/basingse/claim-daily-reward`;
      const token = pb.authStore.token || (
        localStorage.getItem('pocketbase_auth')
          ? JSON.parse(localStorage.getItem('pocketbase_auth') || '{}').token
          : ''
      );

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_jsonErr) {
        setClaimError(`Ошибка ответа сервера (${res.status}): ${text.slice(0, 100)}`);
        setIsClaiming(false);
        return;
      }

      if (!res.ok || !data.success) {
        setClaimError(data.message || 'Ошибка получения награды');
        setIsClaiming(false);
        return;
      }

      onRewardClaimed({
        gold: data.gold,
        rubies: data.rubies,
        inventory: data.inventory,
        streakDays: data.streakDays,
        reward: data.reward
      });

      if (playOpenSound) playOpenSound();
    } catch (err: any) {
      setClaimError(err?.message || 'Не удалось связаться с сервером');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleManualCheckLink = async () => {
    if (isCheckingLink) return;
    setIsCheckingLink(true);
    setCheckMessage(null);
    try {
      const isLinked = await onCheckTelegramLink();
      if (isLinked) {
        setLocalLinked(true);
        setCheckMessage('🎉 Telegram успешно привязан! Бонус разблокирован!');
        if (playOpenSound) playOpenSound();
      } else {
        setCheckMessage('⏳ Подписка пока не найдена. Запустите бота и нажмите «Я вступил»!');
      }
    } catch {
      setCheckMessage('Не удалось обновить статус, попробуйте еще раз.');
    } finally {
      setIsCheckingLink(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (playCloseSound) playCloseSound();
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm select-none"
      onClick={handleClose}
    >
      <div
        className="relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(680px, calc(100vw - 20px))',
          aspectRatio: '1256 / 897',
          maxHeight: 'calc(100vh - 16px)'
        }}
      >
        {/* Tablet background image */}
        <img
          src="/Gui/tablet_menu_bg.webp"
          alt="Tablet"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Close button aligned with background texture X */}
        <button
          onClick={handleClose}
          className="absolute z-10 cursor-pointer"
          title="Закрыть"
          style={{
            right: '7.06%',
            top: '8.91%',
            transform: 'translate(50%, -50%)',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(60,130,220,0.10) 60%, transparent 100%)',
            boxShadow: '0 0 12px 4px rgba(96,165,250,0.35)',
            border: '1px solid rgba(96,165,250,0.4)',
            color: 'rgba(200,225,255,0.9)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 18px 6px rgba(96,165,250,0.55)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 12px 4px rgba(96,165,250,0.35)';
            e.currentTarget.style.color = 'rgba(200,225,255,0.9)';
          }}
        />

        {/* Content Area */}
        <div
          className="relative z-[1] flex flex-col items-center justify-between daily-reward-content"
          style={{ width: '88%', height: '84%', padding: '6px 16px 12px', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {!localLinked ? (
            /* VIEW 1: TELEGRAM NOT LINKED - ONBOARDING PROMPT */
            <div className="w-full h-full flex flex-col items-center justify-between py-1 min-h-0 daily-reward-view">
              {/* Header Title */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(10px)',
                  padding: '5px 24px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
                }}
              >
                <h2
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    fontSize: '18px',
                    color: '#fbbf24',
                    letterSpacing: '1px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    margin: 0
                  }}
                >
                  🎁 Ежедневные бонусы
                </h2>
              </div>

              {/* Graphic + Message */}
              <div className="flex flex-col items-center text-center max-w-[460px] my-auto">
                <div className="relative mb-1">
                  <img
                    src="/Gui/daily_gift_icon.svg"
                    alt="Gift Box"
                    className="w-20 h-20 animate-bounce daily-reward-gift-img"
                    style={{ animationDuration: '2.5s' }}
                  />
                </div>

                <h3
                  className="daily-reward-title"
                  style={{
                    margin: 0,
                    color: '#38bdf8',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 900,
                    fontSize: '19px',
                    lineHeight: 1.2,
                    textShadow: '0 2px 6px rgba(0,0,0,0.6)'
                  }}
                >
                  Привет, друг! Хочешь получить больше ресурсов?
                </h3>

                <p
                  className="daily-reward-desc"
                  style={{
                    marginTop: '8px',
                    marginBottom: '10px',
                    color: '#e2e8f0',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    lineHeight: 1.35,
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)'
                  }}
                >
                  Подпишись на нашу группу в Telegram, чтобы разблокировать календарь наград!
                  Каждый день заходи в игру и забирай: <span className="text-yellow-400 font-bold">золото</span>, <span className="text-amber-300 font-bold">доски и камни</span>, <span className="text-red-400 font-bold">петарды</span>, <span className="text-pink-400 font-bold">рубины</span> и легендарное <span className="text-emerald-400 font-bold">Яйцо Горыныча</span>!
                </p>

                <div
                  className="daily-reward-code-box"
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%',
                    maxWidth: '430px'
                  }}
                >
                  <span className="text-gray-300 text-[11px]">
                    Если бот открылся без кода, просто отправьте боту ваш ник или код:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="bg-black/50 px-2.5 py-1 rounded border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs">
                      {playerName || `link_${userId}`}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(playerName || `link_${userId}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-2 py-1 rounded bg-blue-600/60 hover:bg-blue-600 text-[11px] text-white font-bold cursor-pointer transition-all"
                    >
                      {copied ? '✔ Скопировано' : '📋 Скопировать'}
                    </button>
                  </div>
                </div>

                {checkMessage && (
                  <p
                    className="mt-2 text-xs font-bold"
                    style={{ color: checkMessage.startsWith('✅') ? '#4ade80' : '#f59e0b' }}
                  >
                    {checkMessage}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full justify-center">
                <a
                  href={botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 daily-reward-btn"
                  style={{
                    background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: '2px solid #0369a1',
                    borderRadius: '12px',
                    padding: '8px 24px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 900,
                    fontSize: '15px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    textDecoration: 'none'
                  }}
                >
                  <span>📢 Подписаться в Telegram</span>
                </a>

                <button
                  onClick={handleManualCheckLink}
                  disabled={isCheckingLink}
                  className="hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 daily-reward-btn"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    padding: '8px 18px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  <span>{isCheckingLink ? '⏳' : '🔄'}</span>
                  <span>Проверить</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW 2: TELEGRAM LINKED - 7-DAY STREAK CALENDAR */
            <div className="w-full h-full flex flex-col justify-between py-1 min-h-0 daily-reward-view">
              {/* Header Title & Streak Counter */}
              <div className="flex items-center justify-between w-full px-2 mb-1">
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(10px)',
                    padding: '4px 18px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 800,
                      fontSize: '16px',
                      color: '#fbbf24',
                      letterSpacing: '0.5px',
                      textShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      margin: 0
                    }}
                  >
                    🎁 Ежедневный бонус за вход
                  </h2>
                </div>

                <div
                  className="daily-reward-streak-badge"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '12px',
                    padding: '4px 14px',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#fef08a'
                  }}
                >
                  🔥 Серия: <span className="text-yellow-400 font-extrabold">{currentStreakDay}</span>/7 дн.
                </div>
              </div>

              {/* 7-Days Cards Grid */}
              <div className="grid grid-cols-4 gap-2 w-full my-auto px-1">
                {DAILY_REWARDS_CONFIG.map((dayCfg) => {
                  const isPast = isClaimedToday
                    ? dayCfg.day <= currentStreakDay
                    : dayCfg.day < currentStreakDay;
                  const isCurrent = dayCfg.day === currentStreakDay && !isClaimedToday;
                  const isFuture = dayCfg.day > currentStreakDay || (isClaimedToday && dayCfg.day > currentStreakDay);

                  return (
                    <div
                      key={dayCfg.day}
                      className={`daily-reward-card ${dayCfg.day === 7 ? 'col-span-2' : 'col-span-1'}`}
                      style={{
                        position: 'relative',
                        background: isCurrent
                          ? 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.25) 0%, rgba(30, 41, 59, 0.85) 100%)'
                          : isPast
                          ? 'rgba(15, 23, 42, 0.45)'
                          : 'rgba(15, 23, 42, 0.6)',
                        borderRadius: '12px',
                        border: isCurrent
                          ? '2px solid #fbbf24'
                          : isPast
                          ? '1px solid rgba(74, 222, 128, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: isCurrent
                          ? '0 0 16px 2px rgba(251, 191, 36, 0.4), inset 0 0 12px rgba(251, 191, 36, 0.2)'
                          : 'none',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: '88px',
                        transition: 'all 0.2s ease',
                        opacity: isFuture ? 0.75 : 1
                      }}
                    >
                      {/* Day Label */}
                      <div className="flex items-center justify-between w-full text-[11px] font-bold">
                        <span
                          style={{
                            color: isCurrent ? '#fef08a' : isPast ? '#86efac' : '#94a3b8',
                            fontFamily: 'Nunito, sans-serif'
                          }}
                        >
                          {dayCfg.title}
                        </span>

                        {isPast && <span className="text-emerald-400 text-xs">✔</span>}
                        {isCurrent && <span className="text-yellow-300 animate-pulse text-xs">★</span>}
                        {isFuture && <span className="text-gray-500 text-xs">🔒</span>}
                      </div>

                      {/* Reward Icons */}
                      <div className="flex items-center justify-center gap-2 my-1">
                        {dayCfg.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <img
                              src={item.icon}
                              alt={item.name}
                              className="daily-reward-card-img"
                              style={{
                                width: dayCfg.day === 7 ? '38px' : '30px',
                                height: dayCfg.day === 7 ? '38px' : '30px',
                                objectFit: 'contain'
                              }}
                            />
                            <span
                              className="daily-reward-card-amt"
                              style={{
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight: 800,
                                fontSize: '11px',
                                color: isCurrent ? '#ffffff' : '#cbd5e1',
                                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                              }}
                            >
                              +{item.amount}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Status Bottom Ribbon */}
                      <div className="w-full text-center">
                        {isPast ? (
                          <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                            Собрано
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[10px] text-yellow-300 font-extrabold uppercase tracking-wider animate-pulse">
                            Доступно!
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">
                            {dayCfg.items.map((i) => i.name).join(' + ')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Referral Invite Block */}
              <div
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs my-1 daily-reward-ref-box"
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid rgba(245, 158, 11, 0.35)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-amber-300 font-bold">🤝 Ваш промокод:</span>
                  <code className="bg-black/60 px-2 py-0.5 rounded text-yellow-400 font-bold font-mono text-xs">
                    {playerName || userId}
                  </code>
                  <span className="text-gray-400 text-[11px] hidden sm:inline">
                    (+2 💎 и +2000 🪙 за каждого друга после обучения)
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(playerName || userId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-500 text-white font-bold cursor-pointer transition-all text-[11px]"
                >
                  {copied ? '✔ Скопировано' : '📋 Скопировать'}
                </button>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-col items-center justify-center w-full mt-1">
                {claimError && (
                  <p className="text-xs text-red-400 font-bold mb-1">
                    ⚠️ {claimError}
                  </p>
                )}

                {!isClaimedToday ? (
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="hover:scale-105 active:scale-95 transition-all cursor-pointer daily-reward-claim-btn"
                    style={{
                      background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)',
                      color: '#ffffff',
                      border: '2px solid #14532d',
                      borderRadius: '12px',
                      padding: '8px 36px',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 900,
                      fontSize: '16px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                      WebkitTextStroke: '0.5px black'
                    }}
                  >
                    {isClaiming ? 'Получение...' : `🎁 Забрать награду (День ${currentStreakDay})`}
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-3"
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '6px 20px'
                    }}
                  >
                    <span className="text-emerald-400 font-bold text-sm">✅ Награда за сегодня получена!</span>
                    <span className="text-gray-400 text-xs">
                      Следующий бонус через: <strong className="text-yellow-400 font-mono text-sm">{timeLeftFormatted}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
