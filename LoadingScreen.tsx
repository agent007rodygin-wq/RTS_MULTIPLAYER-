import React from 'react';
import { AlertCircle, LogIn } from 'lucide-react';
import videoSource from './4ad7fd6bdd364b3ea7df7491510ab3fa.mp4';

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
            <div className="relative z-10 w-full max-w-[320px] px-4">
                {!user ? (
                    <form 
                        onSubmit={handleAuth}
                        className="flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-700"
                    >
                        <div className="flex flex-col gap-3 mb-2">
                            <input
                                type="email"
                                placeholder="Email"
                                className="px-5 py-3 bg-gray-900/80 border border-gray-600/50 rounded-xl text-white text-base outline-none focus:border-blue-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-500 shadow-inner"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            
                            {isRegisterMode && (
                                <input
                                    type="text"
                                    placeholder="Логин (Никнейм)"
                                    className="px-5 py-3 bg-gray-900/80 border border-gray-600/50 rounded-xl text-white text-base outline-none focus:border-blue-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-500 shadow-inner animate-in slide-in-from-top-2 duration-300"
                                    value={regPlayerName}
                                    onChange={(e) => setRegPlayerName(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            )}

                            <input
                                type="password"
                                placeholder="Пароль"
                                className="px-5 py-3 bg-gray-900/80 border border-gray-600/50 rounded-xl text-white text-base outline-none focus:border-blue-500/50 focus:bg-gray-900 transition-all placeholder:text-gray-500 shadow-inner"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {authError && (
                            <div className="text-red-400 text-xs font-medium flex items-center gap-2 px-1 mb-1 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{authError}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:grayscale mt-2 group"
                        >
                            {isLoggingIn ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    <span className="text-lg">{isRegisterMode ? "Зарегистрироваться" : "Войти"}</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="text-gray-400 hover:text-white text-sm mt-4 transition-colors font-medium drop-shadow-md underline decoration-gray-600 underline-offset-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsRegisterMode(!isRegisterMode);
                            }}
                            disabled={isLoggingIn}
                        >
                            {isRegisterMode ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
                        </button>
                    </form>
                ) : loadingReady ? (
                    <div className="text-center animate-pulse mb-[20vh] select-none">
                        <p className="text-[10px] tracking-[0.6em] uppercase text-white/40 mb-4 font-bold">Secure connection established</p>
                        <p className="text-3xl text-white font-extralight tracking-[0.3em] uppercase drop-shadow-2xl text-center">Press anywhere to begin</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center mb-[20vh]">
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
                        <div className="w-6 h-6 relative mr-4 mb-1">
                            <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
                            <div className="absolute inset-0 border-2 border-white/40 rounded-full border-t-transparent animate-[spin_1s_linear_infinite]" />
                            <div className="absolute inset-[35%] bg-white/40 rounded-full animate-pulse" />
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
