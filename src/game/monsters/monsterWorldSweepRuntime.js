// @ts-check
// Monster world sweep orchestration — composes snapshot, planning,
// background maintenance, spawn reconciliation, and Bronekur management
// into a single sweep cycle.
// Dependencies: existing runtime and planning modules.

import { buildMonsterZoneCounts } from './monsterCrowding.js';
import { buildMonsterWorldSpawnPlan } from './monsterWorldPlanning.js';
import { executeMonsterBackgroundSweep } from './monsterBackgroundSweepRuntime.js';
import { executeBronekurSpawn, reconcileRegularMonstersForZone } from './monsterSpawnRuntime.js';
import { getZoneId } from '../../world.js';

const ZONE_SIZE = 40;

/**
 * Executes one complete world sweep: background maintenance, Bronekur
 * management, world planning, and per-zone reconciliation. All backend
 * operations and React state are injected via adapters.
 *
 * @param {{
 *   now: number,
 *   managedZoneIds: string[],
 *   sweepZoneIds: string[],
 *   allBuildings: any[],
 *   allResources: any[],
 *   buildingData: any[],
 *   isWorldWrapped: boolean,
 *   maxSweepActions: number,
 *   stuckThresholdMs: number,
 *   constants: { basePerZone: number, totalTarget: number },
 *   runtimeState: {
 *     attackTime: Map<string, number>,
 *     lastAction: Map<string, number>,
 *     targetLock: Map<string, string>,
 *   },
 *   shouldContinue: () => boolean,
 *   adapters: {
 *     healBackgroundZone: (monsterId: string, newZoneId: string) => void,
 *     persistBackgroundAttack: (monsterId: string, targetId: string, params: any) => void,
 *     teleportBackground: (monsterId: string, params: { x: number, y: number, zoneId: string }) => boolean|Promise<boolean>,
 *     deleteExcessRegular: (monsterId: string, monster: any) => void,
 *     healDisplacedRegular: (monsterId: string, patch: { zoneId: string }) => void,
 *     createRegularMonster: (spec: { monsterId: string, x: number, y: number, zoneId: string, typeId: number, typeName: string, durability: number, slot: number }) => void,
 *     onBronekurSpawn: (params: { monsterId: string, x: number, y: number, zoneId: string }) => void,
 *     onBronekurHpNormalize: (params: { monsterId: string }) => void,
 *     onInvalidBronekur: (monsterId: string) => void,
 *   },
 *   occupied: Set<string>,
 *   blockedResourcePositions: Set<string>,
 * }} params
 * @returns {Promise<{ spawned: number, deletedDuplicates: number, trimmedExcess: number, sweepActions: number }>}
 */
export async function executeMonsterWorldSweep({
    now, managedZoneIds, sweepZoneIds,
    allBuildings, allResources, buildingData,
    isWorldWrapped, maxSweepActions, stuckThresholdMs, constants,
    runtimeState, shouldContinue, adapters,
    occupied, blockedResourcePositions,
}) {
    let spawned = 0;
    let deletedDuplicates = 0;
    let trimmedExcess = 0;
    let worldSweepActions = 0;

    const findFreeSpot = (zoneX, zoneY) => {
        const sx = zoneX * ZONE_SIZE;
        const sy = zoneY * ZONE_SIZE;
        for (let t = 0; t < 100; t++) {
            const x = sx + Math.floor(Math.random() * ZONE_SIZE);
            const y = sy + Math.floor(Math.random() * ZONE_SIZE);
            if (!occupied.has(`${x},${y}`)) return { x, y };
        }
        return null;
    };

    // Background maintenance
    const sweepResult = executeMonsterBackgroundSweep({
        now, sweepZoneIds,
        buildings: allBuildings,
        buildingData,
        maxActions: maxSweepActions,
        stuckThresholdMs,
        isWorldWrapped,
        runtimeState,
        onHealZone: (monsterId, newZoneId) => {
            adapters.healBackgroundZone(monsterId, newZoneId);
        },
        onAttackApplied: (params) => {
            adapters.persistBackgroundAttack(params.monsterId, params.targetId, params);
        },
        onTeleportStuck: (params) => {
            return adapters.teleportBackground(params.monsterId, params);
        },
    });
    worldSweepActions += sweepResult.actionsTaken;

    // Bronekur
    executeBronekurSpawn({
        buildings: allBuildings,
        findFreeSpot,
        onBronekurSpawn: async (params) => {
            await adapters.onBronekurSpawn(params);
            occupied.add(`${params.x},${params.y}`);
            spawned++;
        },
        onBronekurHpNormalize: adapters.onBronekurHpNormalize,
        onInvalidBronekur: async (monsterId) => {
            await adapters.onInvalidBronekur(monsterId);
            deletedDuplicates++;
        },
    });

    // World planning
    const { zonePlans } = buildMonsterWorldSpawnPlan({
        managedZoneIds,
        constants,
    });

    // Per-zone reconciliation
    for (const zoneId of managedZoneIds) {
        if (!shouldContinue()) return { spawned, deletedDuplicates, trimmedExcess, sweepActions: worldSweepActions };
        const plan = zonePlans.get(zoneId);
        if (!plan) continue;
        const { zoneX, zoneY, desiredTypeCounts, targetCount } = plan;

        const { deletedCount, createdCount } = reconcileRegularMonstersForZone({
            zoneId, zoneX, zoneY,
            desiredTypeCounts,
            zoneTargetCount: targetCount,
            buildings: allBuildings,
            buildingData,
            findFreeSpot,
            onDeleteExcess: async (monsterId, monster) => {
                await adapters.deleteExcessRegular(monsterId, monster);
                occupied.delete(`${monster.x},${monster.y}`);
                trimmedExcess++;
            },
            onHealDisplaced: adapters.healDisplacedRegular,
            onCreateMissing: async (spec) => {
                await adapters.createRegularMonster(spec);
                occupied.add(`${spec.x},${spec.y}`);
                spawned++;
            },
        });
        if (deletedCount > 0 || createdCount > 0) { /* counters tracked above */ }
    }

    return { spawned, deletedDuplicates, trimmedExcess, sweepActions: worldSweepActions };
}
