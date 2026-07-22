// @ts-check
import { useRef, useEffect, useCallback } from 'react';

// Canonical runtime imports
import { executeMonsterWorldSweep } from './monsterWorldSweepRuntime.js';
import { buildMonsterRuntimeSnapshot } from './monsterRuntimeSnapshot.js';

const WORLD_MONSTER_SWEEP_ZONES_PER_CYCLE = 2;
const ZONES_X = 5;
const ZONES_Y = 5;

/**
 * React adapter for the monster domain. Owns lifecycle, timers,
 * refs, guards, and backend adapters. Delegates all business
 * logic to canonical runtime modules.
 *
 * @param {{
 *   identity: {
 *     authReady: boolean,
 *     currentUser: { uid: string } | null,
 *     onlineUsers: Record<string, any>,
 *   },
 *   world: {
 *     activeZoneIds: string[],
 *     isWorldWrapped: boolean,
 *   },
 *   data: {
 *     buildings: any[],
 *     buildingData: any[],
 *     resources: any[],
 *   },
 *   constants: {
 *     basePerZone?: number,
 *     totalTarget?: number,
 *     maxSweepActions?: number,
 *     stuckThresholdMs?: number,
 *   },
 *   adapters: {
 *     fetchWorldSnapshot: (managedZoneIds: string[]) => Promise<{
 *       buildings: any[],
 *       resources: any[],
 *     }>,
 *     persistMonsterRecord: (monsterId: string, patch: any) => void,
 *     deleteMonsterRecord: (monsterId: string) => void,
 *     createMonsterRecord: (monsterId: string, spec: any) => void,
 *     isBuildingDeleting: (id: string) => boolean,
 *     isBuildingTombstoned: (id: string) => boolean,
 *     removeFromSnapshotCache: (id: string) => void,
 *     findFreeTeleportSpot: (monster: any, occupied: Set<string>, blocked: Set<string>) => any | null,
 *     getBronekurBossHp: () => number,
 *   },
 * }} params
 * @returns {{ sweepRunningRef: React.RefObject<boolean> }}
 */
export function useMonsterRuntime({
    identity: { authReady, currentUser, onlineUsers },
    world: { activeZoneIds, isWorldWrapped },
    data: { buildings, buildingData, resources },
    constants: {
        basePerZone = 5,
        totalTarget = 129,
        maxSweepActions = 40,
        stuckThresholdMs = 180000,
    },
    adapters,
}) {
    // ── Refs ──
    const sweepEffectIdRef = useRef(0);
    const sweepRunningRef = useRef(false);
    const sweepCursorRef = useRef(0);
    const sweepIntervalRef = useRef(null);
    const sweepTimeoutRef = useRef(null);

    // ── Guards ──
    const isFirstAlphabeticalUser = useCallback(() => {
        if (!currentUser) return false;
        const users = Object.keys(onlineUsers).sort();
        return users.length === 0 || currentUser.uid === users[0];
    }, [currentUser, onlineUsers]);

    // ── World Sweep Cycle ──
    const runWorldSweep = useCallback(async () => {
        const effectId = sweepEffectIdRef.current;
        if (!authReady || !currentUser) return;
        if (!isFirstAlphabeticalUser()) return;
        if (sweepRunningRef.current) return;

        sweepRunningRef.current = true;

        try {
            // Cursor advance
            const sweepZoneIds = [];
            const totalWorldZones = ZONES_X * ZONES_Y;
            for (let i = 0; i < WORLD_MONSTER_SWEEP_ZONES_PER_CYCLE; i++) {
                const zoneIndex = (sweepCursorRef.current + i) % totalWorldZones;
                sweepZoneIds.push(`${zoneIndex % ZONES_X}_${Math.floor(zoneIndex / ZONES_X)}`);
            }
            sweepCursorRef.current =
                (sweepCursorRef.current + WORLD_MONSTER_SWEEP_ZONES_PER_CYCLE) % totalWorldZones;

            const managedZoneIds = Array.from(new Set([...activeZoneIds, ...sweepZoneIds]));

            // Fetch
            const snapshot = await adapters.fetchWorldSnapshot(managedZoneIds);
            if (sweepEffectIdRef.current !== effectId) return;

            const occupied = new Set([
                ...snapshot.buildings.filter(b => b.hp === undefined || b.hp > 0).map(b => `${b.x},${b.y}`),
                ...snapshot.resources.map(r => `${r.x},${r.y}`)
            ]);
            const blockedResourcePositions = new Set(snapshot.resources.map(r => `${r.x},${r.y}`));

            // Execute
            const result = await executeMonsterWorldSweep({
                now: Date.now(),
                managedZoneIds,
                sweepZoneIds: managedZoneIds.filter(id => !activeZoneIds.includes(id)),
                allBuildings: snapshot.buildings,
                allResources: snapshot.resources,
                buildingData,
                isWorldWrapped,
                maxSweepActions,
                stuckThresholdMs,
                constants: { basePerZone, totalTarget },
                runtimeState: {
                    attackTime: new Map(),
                    lastAction: new Map(),
                    targetLock: new Map(),
                },
                shouldContinue: () => sweepEffectIdRef.current === effectId,
                adapters: {
                    healBackgroundZone: (monsterId, newZoneId) =>
                        adapters.persistMonsterRecord(monsterId, { zoneId: newZoneId }),
                    persistBackgroundAttack: (monsterId, targetId, params) =>
                        adapters.persistMonsterRecord(targetId, params),
                    teleportBackground: (monsterId, params) => {
                        const teleportSpot = adapters.findFreeTeleportSpot(
                            snapshot.buildings.find(b => String(b.id) === monsterId) || snapshot.buildings[0],
                            occupied, blockedResourcePositions
                        );
                        if (teleportSpot) {
                            occupied.delete(`${params.x},${params.y}`);
                            occupied.add(`${teleportSpot.x},${teleportSpot.y}`);
                            const monster = snapshot.buildings.find(b => String(b.id) === monsterId);
                            if (monster) {
                                monster.x = teleportSpot.x;
                                monster.y = teleportSpot.y;
                                monster.zoneId = teleportSpot.zoneId;
                            }
                            adapters.persistMonsterRecord(monsterId, {
                                x: teleportSpot.x, y: teleportSpot.y,
                                zoneId: teleportSpot.zoneId, lastMoveTime: Date.now(),
                            });
                            return true;
                        }
                        return false;
                    },
                    deleteExcessRegular: (monsterId, monster) => {
                        if (adapters.isBuildingDeleting(monsterId) || adapters.isBuildingTombstoned(monsterId)) return;
                        adapters.removeFromSnapshotCache(monsterId);
                        adapters.deleteMonsterRecord(monsterId);
                    },
                    healDisplacedRegular: (monsterId, patch) =>
                        adapters.persistMonsterRecord(monsterId, patch),
                    createRegularMonster: (spec) =>
                        adapters.createMonsterRecord(spec.monsterId, spec),
                    onBronekurSpawn: (params) => {
                        occupied.add(`${params.x},${params.y}`);
                        adapters.createMonsterRecord(params.monsterId, {
                            ...params,
                            buildingId: 70006,
                            durability: adapters.getBronekurBossHp(),
                        });
                    },
                    onBronekurHpNormalize: (params) =>
                        adapters.persistMonsterRecord(params.monsterId, {
                            hp: adapters.getBronekurBossHp(),
                            maxHp: adapters.getBronekurBossHp(),
                        }),
                    onInvalidBronekur: (monsterId) => {
                        if (adapters.isBuildingDeleting(monsterId) || adapters.isBuildingTombstoned(monsterId)) return;
                        adapters.removeFromSnapshotCache(monsterId);
                        adapters.deleteMonsterRecord(monsterId);
                    },
                },
                occupied,
                blockedResourcePositions,
            });

            if (result.spawned > 0 || result.deletedDuplicates > 0 || result.trimmedExcess > 0) {
                console.log(`[MonsterSpawn] Spawned ${result.spawned}, trimmed ${result.trimmedExcess}, removed ${result.deletedDuplicates} duplicates`);
            }
        } catch {
            // fail-closed — skip this cycle
        } finally {
            sweepRunningRef.current = false;
        }
    }, [authReady, currentUser, activeZoneIds, isWorldWrapped, buildingData, adapters, isFirstAlphabeticalUser]);

    // ── Timer Lifecycle ──
    useEffect(() => {
        const effectId = sweepEffectIdRef.current;

        sweepIntervalRef.current = setInterval(() => runWorldSweep(), 60000);
        sweepTimeoutRef.current = setTimeout(() => runWorldSweep(), 5000);

        return () => {
            if (sweepEffectIdRef.current === effectId) {
                sweepEffectIdRef.current += 1;
            }
            if (sweepIntervalRef.current) {
                clearInterval(sweepIntervalRef.current);
                sweepIntervalRef.current = null;
            }
            if (sweepTimeoutRef.current) {
                clearTimeout(sweepTimeoutRef.current);
                sweepTimeoutRef.current = null;
            }
        };
    }, [runWorldSweep]);

    return { sweepRunningRef };
}
