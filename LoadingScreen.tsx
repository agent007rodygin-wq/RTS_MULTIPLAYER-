import React from 'react';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { Swirling } from './src/components/ui/Swirling';
import videoSource from './4ad7fd6bdd364b3ea7df7491510ab3fa.mp4';
import { repairMojibakeCp1251Utf8 } from './src/game/utils/mojibake';

interface LoadingScreenProps {
    user: any;
    loadingReady: boolean;
    loadingProgress: number;
    authEmail: string;
    setAuthEmail: (email: string) => void;
    authPassword: string;
    setAuthPassword: (password: string) => void;
    regPlayerName: string;
    setRegPlayerName: (name: string) => void;
    regPromoCode?: string;
    setRegPromoCode?: (code: string) => void;
    authError: string | null;
    isLoggingIn: boolean;
    isRegisterMode: boolean;
    setIsRegisterMode: (mode: boolean) => void;
    handleAuth: (e: React.FormEvent) => void;
    setIsLoadingScreen: (loading: boolean) => void;
    setCurrentTrackIndex: (index: number) => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    user,
    loadingReady,
    loadingProgress,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    regPlayerName,
    setRegPlayerName,
    regPromoCode = '',
    setRegPromoCode,
    authError,
    isLoggingIn,
    isRegisterMode,
    setIsRegisterMode,
    handleAuth,
    setIsLoadingScreen,
    setCurrentTrackIndex
}) => {
    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black cursor-pointer overflow-hidden font-sans"
            onClick={() => {
                if (loadingReady && user) {
                    setIsLoadingScreen(false);
                    // Pick a random track from 1 onwards (skip track 0 which is loading screen music)
                    setCurrentTrackIndex(Math.floor(Math.random() * 83) + 1);
                }
            }}
        >
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src={videoSource} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

            {/* Top Section - Title */}
            <div className="relative z-10 flex flex-col items-center mt-[-15vh] mb-12 animate-in fade-in slide-in-from-top-10 duration-1000 select-none">
                <h1 className="text-4xl md:text-6xl font-light text-white tracking-[0.4em] uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] text-center">
                    Game loading
                </h1>
            </div>

            {/* Center Section - Classic Auth UI (Reverted & Enhanced) */}
            <div className="relative z-10 w-full max-w-[360px] px-4">
                {!user ? (
                    <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-700">
                        <form 
                            onSubmit={handleAuth}
                            translate="no"
                            className="flex flex-col gap-3.5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-1 select-none">
                                <h2 className="text-xl font-bold text-white tracking-wide">
                                    {isRegisterMode ? "Регистрация" : "Вход в аккаунт"}
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Логин (Никнейм) или Email"
                                    className="px-4 py-3 bg-gray-900/90 border border-gray-600/70 rounded-xl text-white text-base outline-none focus:border-blue-500 focus:bg-gray-900 transition-all placeholder:text-gray-400 shadow-inner"
                                    value={authEmail}
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    inputMode="text"
                                    translate="no"
                                    onChange={(e) => setAuthEmail(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                
                                {isRegisterMode && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Логин (Никнейм)"
                                            className="px-4 py-3 bg-gray-900/90 border border-gray-600/70 rounded-xl text-white text-base outline-none focus:border-blue-500 focus:bg-gray-900 transition-all placeholder:text-gray-400 shadow-inner animate-in slide-in-from-top-2 duration-300"
                                            value={regPlayerName}
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            spellCheck={false}
                                            translate="no"
                                            onChange={(e) => setRegPlayerName(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="text"
                                                placeholder="Промокод (ник друга, если есть)"
                                                className="px-4 py-3 bg-gray-900/90 border border-amber-500/40 rounded-xl text-white text-base outline-none focus:border-amber-400 focus:bg-gray-900 transition-all placeholder:text-gray-400 shadow-inner animate-in slide-in-from-top-2 duration-300"
                                                value={regPromoCode}
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck={false}
                                                translate="no"
                                                onChange={(e) => setRegPromoCode?.(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-[11px] text-amber-400/80 px-2 font-medium">
                                                🎁 Введите никнейм друга для стартового бонуса
                                            </span>
                                        </div>
                                    </>
                                )}

                                <input
                                    type="password"
                                    placeholder="Пароль"
                                    className="px-4 py-3 bg-gray-900/90 border border-gray-600/70 rounded-xl text-white text-base outline-none focus:border-blue-500 focus:bg-gray-900 transition-all placeholder:text-gray-400 shadow-inner"
                                    value={authPassword}
                                    autoComplete={isRegisterMode ? "new-password" : "current-password"}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    translate="no"
                                    onChange={(e) => setAuthPassword(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {authError && (
                                <div className="text-red-400 text-xs font-medium flex items-center gap-2 px-1 animate-pulse">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{repairMojibakeCp1251Utf8(authError)}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:grayscale mt-1 group cursor-pointer"
                            >
                                {isLoggingIn ? (
                                    <Swirling className="w-5 h-5 text-white" />
                                ) : (
                                    <>
                                        {isRegisterMode ? (
                                            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        )}
                                        <span className="text-base font-bold">{isRegisterMode ? "Зарегистрироваться" : "Войти"}</span>
                                    </>
                                )}
                            </button>

                            <div className="relative flex items-center justify-center my-0.5">
                                <div className="border-t border-white/10 w-full" />
                                <span className="bg-transparent px-2 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">или</span>
                                <div className="border-t border-white/10 w-full" />
                            </div>

                            <button
                                type="button"
                                disabled={isLoggingIn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsRegisterMode(!isRegisterMode);
                                }}
                                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 hover:border-white/35 text-gray-200 hover:text-white rounded-xl font-medium text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isRegisterMode ? (
                                    <>
                                        <LogIn className="w-4 h-4 text-blue-400" />
                                        <span>Уже есть аккаунт? <strong className="text-white font-bold underline decoration-blue-400 underline-offset-2">Войти</strong></span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 text-emerald-400" />
                                        <span>Нет аккаунта? <strong className="text-white font-bold underline decoration-emerald-400 underline-offset-2">Зарегистрироваться</strong></span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : loadingReady ? (
                    <div className="text-center animate-pulse mb-[20vh] select-none">
                        <p className="text-[10px] tracking-[0.6em] uppercase text-white/40 mb-4 font-bold">Secure connection established</p>
                        <p className="text-3xl text-white font-extralight tracking-[0.3em] uppercase drop-shadow-2xl text-center">Press anywhere to begin</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center mb-[20vh]">
                        <Swirling className="w-8 h-8 text-white/80 mb-3" />
                        <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 font-bold mb-2 animate-pulse">
                            {loadingProgress < 20 ? 'Connecting to server' : 
                             loadingProgress < 40 ? 'Syncing world state' :
                             loadingProgress < 55 ? 'Loading buildings & terrain' :
                             loadingProgress < 70 ? 'Initializing gameplay systems' :
                             loadingProgress >= 70 && loadingProgress < 100 ? 'Waiting for server response...' :
                             'Finalizing world sync'}
                        </p>
                        <p className="text-xl text-white font-thin tracking-[0.2em] uppercase">Loading... {loadingProgress}%</p>
                        {loadingProgress >= 70 && loadingProgress < 100 && (
                            <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 font-medium mt-2">
                                Slow connection detected — please wait
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Loading Area (PUBG Style) */}
            <div className="fixed bottom-0 left-0 right-0 p-12 z-20 pointer-events-none select-none">
                <div className="flex flex-col items-start max-w-screen-2xl mx-auto">
                    <div className="flex items-end mb-4">
                        <div className="w-6 h-6 relative mr-4 mb-1 flex items-center justify-center">
                            <Swirling className="w-6 h-6 text-white/80" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] tracking-[0.5em] font-bold text-white/80 uppercase leading-none mb-1">
                                Game loading
                            </span>
                            <p className="text-[8px] tracking-[0.4em] font-medium text-white/20 uppercase leading-none">
                                online mmo rpg rts real time
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-white/10 relative overflow-visible">
                        <div
                            className="h-full bg-white/90 transition-all duration-300 ease-linear shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                            style={{ width: `${loadingProgress}%` }}
                        />
                        {/* Shimmer dot */}
                        <div 
                            className="absolute top-[-2px] bottom-[-2px] w-[2px] bg-white shadow-[0_0_15px_white]"
                            style={{ left: `${loadingProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Version metadata */}
            <div className="fixed bottom-5 right-10 z-30 text-white/10 text-[9px] tracking-[0.3em] font-mono pointer-events-none uppercase font-bold">
                BUILD 1.1
            </div>
        </div>
    );
};

export default LoadingScreen;
