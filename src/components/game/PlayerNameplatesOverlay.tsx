import React, { useState, useEffect, useRef } from 'react';
import { LEVEL_ICON_URLS, PLAYER_AVATAR_URLS } from '../../game/ui/playerAssets';

const POLICE_SKIN_URL = '/last_appx/polise/16.webp';
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export interface PlayerDataEntry {
    uid: string;
    name?: string;
    x?: number;
    y?: number;
    level?: number;
    title?: string;
}

export interface PlayerNameplatesOverlayProps {
    onlinePlayersData?: PlayerDataEntry[];
    subscribeToPresence?: (callback: (players: PlayerDataEntry[]) => void) => () => void;
    worldToScreen: (x: number, y: number, zoom: number) => { screenX: number; screenY: number };
    cameraOffsetRef: React.RefObject<{ x: number; y: number }>;
    zoomIndex: number;
    user: any;
    playerLevel: number;
    allUsers?: Record<string, any>;
    allUsersRef?: React.RefObject<Record<string, any>>;
    playerName: string;
    selectedTitle: string | null;
    sheriffId: string | null;
    deputies: string[];
    onSelectPlayer: (uid: string) => void;
}

export const PlayerNameplatesOverlay: React.FC<PlayerNameplatesOverlayProps> = React.memo(({
    onlinePlayersData,
    subscribeToPresence,
    worldToScreen,
    cameraOffsetRef,
    zoomIndex,
    user,
    playerLevel,
    allUsers,
    allUsersRef,
    playerName,
    selectedTitle,
    sheriffId,
    deputies,
    onSelectPlayer
}) => {
    // Only stores player identities / metadata; does NOT re-render on position changes
    const [playersList, setPlayersList] = useState<PlayerDataEntry[]>(onlinePlayersData || []);

    const targetPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    const currentPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
    const domNodesRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const isLoopRunningRef = useRef(false);
    const lastCamPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    const worldToScreenRef = useRef(worldToScreen);
    worldToScreenRef.current = worldToScreen;
    const zoomIndexRef = useRef(zoomIndex);
    zoomIndexRef.current = zoomIndex;

    // Direct DOM position updater - runs at 60 FPS without triggering React reconciliations
    const updateDomPositions = useRef<(dtSec: number) => boolean>(() => false);
    updateDomPositions.current = (dtSec: number) => {
        const zoom = ZOOM_LEVELS[zoomIndexRef.current] || 1;
        const camOffset = cameraOffsetRef.current || { x: 0, y: 0 };
        const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const winHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

        let hasPendingMovement = false;
        const targets = targetPositionsRef.current;
        const current = currentPositionsRef.current;

        for (const [uid, el] of domNodesRef.current.entries()) {
            if (!el) continue;
            const target = targets[uid];
            if (!target) continue;

            let cur = current[uid];
            if (!cur) {
                cur = current[uid] = { x: target.x, y: target.y };
            }

            const dist = Math.hypot(target.x - cur.x, target.y - cur.y);
            if (dist > 40 || dist < 0.05) {
                cur.x = target.x;
                cur.y = target.y;
            } else {
                hasPendingMovement = true;
                const speed = Math.max(5, Math.min(24, dist * 5));
                const step = speed * dtSec;
                if (step >= dist) {
                    cur.x = target.x;
                    cur.y = target.y;
                } else {
                    const ratio = step / dist;
                    cur.x += (target.x - cur.x) * ratio;
                    cur.y += (target.y - cur.y) * ratio;
                }
            }

            const { screenX, screenY } = worldToScreenRef.current(cur.x, cur.y, zoom);
            const finalX = screenX + camOffset.x;
            const finalY = screenY + camOffset.y;

            if (isNaN(finalX) || isNaN(finalY) || finalX < -150 || finalX > winWidth + 150 || finalY < -150 || finalY > winHeight + 150) {
                if (el.style.display !== 'none') el.style.display = 'none';
            } else {
                if (el.style.display !== '') el.style.display = '';
                el.style.transform = `translate3d(${Math.round(finalX)}px, ${Math.round(finalY - 120)}px, 0) translate(-50%, -100%)`;
            }
        }

        return hasPendingMovement;
    };

    // Wake up animation loop whenever positions or camera changes
    const ensureLoopRunning = () => {
        if (isLoopRunningRef.current) return;
        isLoopRunningRef.current = true;

        let lastTs = performance.now();
        const tick = (ts: number) => {
            const dtSec = Math.max(0, Math.min(0.1, (ts - lastTs) / 1000));
            lastTs = ts;

            const camOffset = cameraOffsetRef.current || { x: 0, y: 0 };
            const camMoved = Math.abs(camOffset.x - lastCamPosRef.current.x) > 0.1 || Math.abs(camOffset.y - lastCamPosRef.current.y) > 0.1;
            if (camMoved) {
                lastCamPosRef.current = { x: camOffset.x, y: camOffset.y };
            }

            const hasMovingPlayers = updateDomPositions.current(dtSec);

            if (hasMovingPlayers || camMoved) {
                requestAnimationFrame(tick);
            } else {
                isLoopRunningRef.current = false;
            }
        };

        requestAnimationFrame(tick);
    };

    // Presence listener handler
    const handleIncomingPresence = (incoming: PlayerDataEntry[]) => {
        // 1. Update movement target coords
        incoming.forEach(p => {
            if (typeof p.x === 'number' && typeof p.y === 'number') {
                targetPositionsRef.current[p.uid] = { x: p.x, y: p.y };
                if (!currentPositionsRef.current[p.uid]) {
                    currentPositionsRef.current[p.uid] = { x: p.x, y: p.y };
                }
            }
        });

        // 2. Check if player structure/metadata changed (requires React DOM add/remove/text update)
        setPlayersList(prev => {
            if (prev.length !== incoming.length) return incoming;
            for (let i = 0; i < prev.length; i++) {
                const a = prev[i], b = incoming[i];
                if (a.uid !== b.uid || a.name !== b.name || a.level !== b.level || a.title !== b.title) {
                    return incoming;
                }
            }
            return prev; // Structure unchanged: zero React re-render!
        });

        ensureLoopRunning();
    };

    useEffect(() => {
        if (subscribeToPresence) {
            return subscribeToPresence(handleIncomingPresence);
        }
    }, [subscribeToPresence]);

    useEffect(() => {
        if (!subscribeToPresence && onlinePlayersData) {
            handleIncomingPresence(onlinePlayersData);
        }
    }, [subscribeToPresence, onlinePlayersData]);

    // Wake up loop on camera pan or zoom change
    useEffect(() => {
        ensureLoopRunning();
    }, [zoomIndex]);

    // Continuous heartbeat while camera is moving
    useEffect(() => {
        const interval = setInterval(() => {
            const camOffset = cameraOffsetRef.current || { x: 0, y: 0 };
            if (Math.abs(camOffset.x - lastCamPosRef.current.x) > 0.1 || Math.abs(camOffset.y - lastCamPosRef.current.y) > 0.1) {
                ensureLoopRunning();
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const usersMap = allUsersRef?.current || allUsers || {};

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {playersList.map(player => {
                if (typeof player.x !== 'number' || typeof player.y !== 'number') return null;

                const displayLevel = (user && player.uid === user.uid)
                    ? playerLevel
                    : Math.max(Number(player.level || 1) || 1, Number(usersMap[player.uid]?.level || 1) || 1);

                const playerNameDisplay = (player.name && player.name !== 'Неизвестный')
                    ? player.name
                    : (usersMap[player.uid]?.name && usersMap[player.uid]?.name !== 'Неизвестный')
                        ? usersMap[player.uid]?.name
                        : (user && player.uid === user.uid)
                            ? playerName
                            : player.name || 'Неизвестный';

                const playerTitle = (user && player.uid === user.uid)
                    ? selectedTitle
                    : (player.title || usersMap[player.uid]?.selectedTitle || usersMap[player.uid]?.data?.selectedTitle || null);

                return (
                    <div
                        key={player.uid}
                        ref={(node) => {
                            if (node) {
                                domNodesRef.current.set(player.uid, node);
                                ensureLoopRunning();
                            } else {
                                domNodesRef.current.delete(player.uid);
                            }
                        }}
                        className="absolute pointer-events-auto cursor-pointer group z-10"
                        style={{
                            transform: 'translate3d(-9999px, -9999px, 0)',
                            willChange: 'transform'
                        }}
                        onClick={() => onSelectPlayer(player.uid)}
                    >
                        {/* Title prefix badge over player avatar */}
                        {playerTitle && (
                            <div className="flex justify-center mb-1">
                                <span className="bg-slate-950/95 text-yellow-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-yellow-400/50 shadow-md whitespace-nowrap tracking-wide">
                                    [{playerTitle}]
                                </span>
                            </div>
                        )}

                        {/* Player nickname tag with level icon */}
                        <div className="bg-slate-950/90 text-white px-3 py-1 rounded-full border border-blue-400/60 shadow-md group-hover:bg-blue-600/90 group-hover:scale-105 transition-transform duration-150 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)]"></div>
                            <span className="font-bold text-sm whitespace-nowrap drop-shadow-sm">{playerNameDisplay}</span>
                            <img
                                src={LEVEL_ICON_URLS[displayLevel] || LEVEL_ICON_URLS[1]}
                                alt={`Level ${displayLevel}`}
                                className="w-5 h-5 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                            />
                        </div>
                        {/* Triangle pointer */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-blue-400/60 mx-auto mt-[-1px]"></div>
                        {/* Player avatar below nickname */}
                        <div className="flex justify-center mt-1">
                            <img
                                src={(sheriffId === player.uid || (deputies && deputies.includes(player.uid))) ? POLICE_SKIN_URL : (PLAYER_AVATAR_URLS[displayLevel] || PLAYER_AVATAR_URLS[1])}
                                alt="Player"
                                className="object-contain"
                                style={{ width: '80px', height: '80px', imageRendering: 'pixelated', minWidth: '80px', minHeight: '80px' }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
});
