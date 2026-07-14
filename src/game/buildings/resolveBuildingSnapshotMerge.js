// @ts-check

/**
 * @typedef {import('../../../types').PlacedBuilding} PlacedBuilding
 */

/**
 * @typedef {'keep_local_protected' | 'skip_server_dead' | 'replace_local_with_server' | 'keep_local_sticky' | 'accepted_server_matches_local' | 'accept_server_update'} BuildingMergeDecision
 */

/**
 * @typedef {Object} BuildingSnapshotMergeInput
 * @property {PlacedBuilding} serverBuilding
 * @property {PlacedBuilding | undefined} [localBuilding]
 * @property {string | null | undefined} [currentUserId]
 * @property {number} now
 * @property {number} lastInteractionAt
 * @property {number} lastMoveAt
 * @property {boolean} localIsProtectedByCombat
 * @property {number} stickyInteractionMs
 * @property {number} deletionProtectionMs
 */

/**
 * @typedef {Object} BuildingSnapshotMergeResult
 * @property {PlacedBuilding} mergedBuilding
 * @property {BuildingMergeDecision} decision
 * @property {boolean} clearLastInteraction
 * @property {boolean} shouldStickPosition
 * @property {boolean} shouldStickHealthState
 */

/**
 * @param {unknown} value
 * @param {number} now
 */
export function hasActiveDestructionWindow(value, now) {
    return Number.isFinite(Number(value)) && Number(value) > now;
}

/**
 * @param {PlacedBuilding} localBuilding
 * @param {PlacedBuilding} serverBuilding
 * @param {number} now
 */
export function shouldPreferServerRevivedBuildingState(localBuilding, serverBuilding, now) {
    const localHasTerminalState = Boolean(
        localBuilding.isDestroying ||
        ((localBuilding.pendingDamage || 0) > 0) ||
        hasActiveDestructionWindow(localBuilding.destructionEndTime, now)
    );
    if (!localHasTerminalState) return false;

    const serverIsAlive = serverBuilding.hp === undefined || serverBuilding.hp > 0;
    const serverClearedTerminalState =
        !serverBuilding.isDestroying &&
        (Number(serverBuilding.pendingDamage || 0) <= 0) &&
        !hasActiveDestructionWindow(serverBuilding.destructionEndTime, now);

    if (!serverIsAlive || !serverClearedTerminalState) return false;

    const serverHp = Number(serverBuilding.hp ?? -1);
    const localHp = Number(localBuilding.hp ?? -1);
    const serverShield = Number(serverBuilding.shieldHp || 0);
    const localShield = Number(localBuilding.shieldHp || 0);
    const serverProtection = Number(serverBuilding.protectionEndTime || 0);
    const localProtection = Number(localBuilding.protectionEndTime || 0);

    return (
        serverHp > localHp ||
        serverShield > localShield ||
        serverProtection > localProtection
    );
}

/**
 * @param {BuildingSnapshotMergeInput} input
 * @returns {BuildingSnapshotMergeResult}
 */
export function resolvePlacedBuildingSnapshotMerge(input) {
    const {
        serverBuilding,
        localBuilding,
        currentUserId,
        now,
        lastInteractionAt,
        lastMoveAt,
        localIsProtectedByCombat,
        stickyInteractionMs,
        deletionProtectionMs,
    } = input;

    const localInteractionAllowed = !!localBuilding && (
        !!localBuilding.isLocal ||
        (!!currentUserId && localBuilding.ownerId === currentUserId)
    );

    if (localIsProtectedByCombat && localBuilding) {
        return {
            mergedBuilding: {
                ...localBuilding,
                isLocal: false,
            },
            decision: 'keep_local_protected',
            clearLastInteraction: false,
            shouldStickPosition: false,
            shouldStickHealthState: false,
        };
    }

    const constructionStickyMs =
        localBuilding && localBuilding.isConstructing === false && serverBuilding.isConstructing === true
            ? Math.max(stickyInteractionMs, deletionProtectionMs)
            : stickyInteractionMs;
    const timeSinceInt = now - lastInteractionAt;

    if (timeSinceInt < constructionStickyMs && localInteractionAllowed && localBuilding) {
        if (serverBuilding.hp !== undefined && serverBuilding.hp <= 0) {
            return {
                mergedBuilding: serverBuilding,
                decision: 'skip_server_dead',
                clearLastInteraction: false,
                shouldStickPosition: false,
                shouldStickHealthState: false,
            };
        }

        if (shouldPreferServerRevivedBuildingState(localBuilding, serverBuilding, now)) {
            return {
                mergedBuilding: {
                    ...serverBuilding,
                    isLocal: false,
                },
                decision: 'replace_local_with_server',
                clearLastInteraction: true,
                shouldStickPosition: false,
                shouldStickHealthState: false,
            };
        }

        const serverMatchesLocal = serverBuilding.workState === localBuilding.workState &&
            serverBuilding.workEndTime === localBuilding.workEndTime &&
            serverBuilding.buildingId === localBuilding.buildingId &&
            serverBuilding.x === localBuilding.x &&
            serverBuilding.y === localBuilding.y &&
            serverBuilding.zoneId === localBuilding.zoneId &&
            serverBuilding.hp === localBuilding.hp &&
            serverBuilding.lastAttackTime === localBuilding.lastAttackTime &&
            serverBuilding.lastMoveTime === localBuilding.lastMoveTime &&
            serverBuilding.shieldHp === localBuilding.shieldHp &&
            serverBuilding.shieldMaxHp === localBuilding.shieldMaxHp &&
            serverBuilding.protectionEndTime === localBuilding.protectionEndTime &&
            serverBuilding.isConstructing === localBuilding.isConstructing &&
            serverBuilding.constructionEndTime === localBuilding.constructionEndTime &&
            serverBuilding.isDestroying === localBuilding.isDestroying &&
            serverBuilding.pendingDamage === localBuilding.pendingDamage &&
            serverBuilding.destructionEndTime === localBuilding.destructionEndTime;

        if (!serverMatchesLocal) {
            const shouldStickPosition = (now - lastMoveAt) < stickyInteractionMs;
            const shouldStickHealthState =
                localBuilding.hp !== serverBuilding.hp ||
                localBuilding.shieldHp !== serverBuilding.shieldHp ||
                localBuilding.shieldMaxHp !== serverBuilding.shieldMaxHp ||
                localBuilding.protectionEndTime !== serverBuilding.protectionEndTime ||
                localBuilding.isDestroying !== serverBuilding.isDestroying ||
                localBuilding.pendingDamage !== serverBuilding.pendingDamage ||
                localBuilding.destructionEndTime !== serverBuilding.destructionEndTime;

            return {
                mergedBuilding: {
                    ...serverBuilding,
                    x: shouldStickPosition ? localBuilding.x : serverBuilding.x,
                    y: shouldStickPosition ? localBuilding.y : serverBuilding.y,
                    zoneId: shouldStickPosition ? localBuilding.zoneId : serverBuilding.zoneId,
                    workState: localBuilding.workState,
                    workEndTime: localBuilding.workEndTime,
                    buildingId: localBuilding.buildingId,
                    isConstructing: localBuilding.isConstructing,
                    constructionEndTime: localBuilding.constructionEndTime,
                    lastAttackTime: Math.max(serverBuilding.lastAttackTime || 0, localBuilding.lastAttackTime || 0),
                    lastMoveTime: Math.max(serverBuilding.lastMoveTime || 0, localBuilding.lastMoveTime || 0),
                    hp: shouldStickHealthState ? localBuilding.hp : serverBuilding.hp,
                    maxHp: shouldStickHealthState ? (localBuilding.maxHp ?? serverBuilding.maxHp) : serverBuilding.maxHp,
                    shieldHp: shouldStickHealthState ? localBuilding.shieldHp : serverBuilding.shieldHp,
                    shieldMaxHp: shouldStickHealthState ? localBuilding.shieldMaxHp : serverBuilding.shieldMaxHp,
                    protectionEndTime: shouldStickHealthState ? localBuilding.protectionEndTime : serverBuilding.protectionEndTime,
                    isDestroying: shouldStickHealthState ? localBuilding.isDestroying : serverBuilding.isDestroying,
                    pendingDamage: shouldStickHealthState ? localBuilding.pendingDamage : serverBuilding.pendingDamage,
                    destructionEndTime: shouldStickHealthState ? localBuilding.destructionEndTime : serverBuilding.destructionEndTime,
                    initiatorId: shouldStickHealthState ? localBuilding.initiatorId : serverBuilding.initiatorId,
                    timestamp: localBuilding.timestamp ?? serverBuilding.timestamp,
                    isLocal: false,
                },
                decision: shouldStickHealthState ? 'keep_local_sticky' : 'accept_server_update',
                clearLastInteraction: false,
                shouldStickPosition,
                shouldStickHealthState,
            };
        }

        return {
            mergedBuilding: serverBuilding,
            decision: 'accepted_server_matches_local',
            clearLastInteraction: true,
            shouldStickPosition: false,
            shouldStickHealthState: false,
        };
    }

    return {
        mergedBuilding: serverBuilding,
        decision: 'accept_server_update',
        clearLastInteraction: false,
        shouldStickPosition: false,
        shouldStickHealthState: false,
    };
}
