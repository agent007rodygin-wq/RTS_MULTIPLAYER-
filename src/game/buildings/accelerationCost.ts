import type { Building } from '../../../types';

/**
 * Fallback pricing for construction speed-up (rubies).
 *
 * Most buildings in data/buildings.ts carry an explicit
 * `stats.accelerationCost`, but a handful (Дворец, Вилла, Двухэтажный дом,
 * ...) ship without one and used to be speed-up-able for 0 rubies.
 *
 * The existing data follows `cost ≈ 0.21 * sqrt(constructionTimeSeconds)`
 * (verified against 770 definitions: 440s→4, 2280s→10, 38095s→41,
 * 988360s→209, 4132800s→444). Buildings without an explicit cost are priced
 * with the same curve so nothing can be accelerated for free.
 */
const ACCELERATION_COST_SCALE = 0.21;
// Tiny builds (a few seconds) are not worth a ruby: keep explicit zeros there.
const FREE_ZERO_COST_MAX_SECONDS = 120;

export function computeFallbackAccelerationCost(constructionTimeSeconds: number): number {
    if (!Number.isFinite(constructionTimeSeconds) || constructionTimeSeconds <= 0) return 0;
    return Math.max(1, Math.round(ACCELERATION_COST_SCALE * Math.sqrt(constructionTimeSeconds)));
}

export function needsAccelerationCostFallback(stats: {
    accelerationCost?: number;
    constructionTimeSeconds?: number;
} | undefined): boolean {
    if (!stats) return false;
    const time = stats.constructionTimeSeconds ?? 0;
    if (time <= 0) return false;
    const cost = stats.accelerationCost;
    if (cost === undefined || cost === null) return true;
    return cost === 0 && time > FREE_ZERO_COST_MAX_SECONDS;
}

export function ensureAccelerationCosts(buildings: Building[]): Building[] {
    for (const building of buildings) {
        if (!needsAccelerationCostFallback(building.stats)) continue;
        building.stats.accelerationCost = computeFallbackAccelerationCost(
            Number(building.stats?.constructionTimeSeconds ?? 0)
        );
    }
    return buildings;
}
