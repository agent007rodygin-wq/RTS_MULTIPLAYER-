// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {'accept_reconnect_snapshot' | 'suppress_tombstoned_buildings'} ReconnectTombstoneDecision
 */

/**
 * @typedef {Object} FilterReconnectSnapshotBuildingsByTombstonesInput
 * @property {Iterable<PlacedBuilding>} reconnectBuildings
 * @property {Iterable<string>} activeDeletingBuildingIds
 * @property {Iterable<string>} activeConfirmedDeletedBuildingIds
 */

/**
 * @typedef {Object} FilterReconnectSnapshotBuildingsByTombstonesResult
 * @property {PlacedBuilding[]} visibleBuildings
 * @property {string[]} suppressedBuildingIds
 * @property {ReconnectTombstoneDecision} decision
 */

/**
 * Pure App-level reconnect suppression for buildings currently protected by a
 * local deletion tombstone.
 *
 * The caller owns tombstone lifetime and active-id selection; this helper only
 * applies the already-active decision to the reconnect snapshot payload.
 *
 * @param {FilterReconnectSnapshotBuildingsByTombstonesInput} input
 * @returns {FilterReconnectSnapshotBuildingsByTombstonesResult}
 */
export function filterReconnectSnapshotBuildingsByTombstones(input) {
    const reconnectBuildings = Array.from(input?.reconnectBuildings ?? []);
    const activeDeletingBuildingIds = new Set(Array.from(input?.activeDeletingBuildingIds ?? [], String));
    const activeConfirmedDeletedBuildingIds = new Set(Array.from(input?.activeConfirmedDeletedBuildingIds ?? [], String));
    const activeSuppressedIds = new Set([...activeDeletingBuildingIds, ...activeConfirmedDeletedBuildingIds]);

    const visibleBuildings = [];
    const suppressedBuildingIds = [];

    for (const building of reconnectBuildings) {
        const id = String(building?.id ?? '');
        if (!id || !activeSuppressedIds.has(id)) {
            visibleBuildings.push(building);
            continue;
        }
        suppressedBuildingIds.push(id);
    }

    return {
        visibleBuildings,
        suppressedBuildingIds,
        decision: suppressedBuildingIds.length > 0
            ? 'suppress_tombstoned_buildings'
            : 'accept_reconnect_snapshot',
    };
}
