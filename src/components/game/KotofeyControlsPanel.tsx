import React from 'react';
import type { KotofeySettings } from '../../../types';
import { normalizeKotofeySettings } from '../../game/monsters/kotofeyLogic';
import { AIBOLIT_ID, BIG_AIBOLIT_ID } from '../../game/monsters/monsterIds';

export interface KotofeyControlsPanelProps {
    buildingId?: number;
    settings?: Partial<KotofeySettings>;
    onChange: (patch: Partial<KotofeySettings>) => void;
    compact?: boolean;
}

interface ToggleRowDef {
    key: keyof KotofeySettings;
    label: string;
    icon: string;
    requiresWalkRoads?: boolean;
}

function getRepairToggles(buildingId?: number): ToggleRowDef[] {
    if (Number(buildingId) === AIBOLIT_ID) {
        return [
            { key: 'repairClan', label: 'Чинить постройки соклановцев', icon: '🛡️' },
            { key: 'repairClanGifts', label: 'Лечить монстров соклановцев (x2)', icon: '🩺' },
            { key: 'repairFriends', label: 'Чинить постройки друзей', icon: '🤝' },
            { key: 'repairFriendGifts', label: 'Лечить монстров друзей (x2)', icon: '❤️' },
        ];
    }
    if (Number(buildingId) === BIG_AIBOLIT_ID) {
        return [
            { key: 'repairClan', label: 'Чинить постройки соклановцев', icon: '🛡️' },
            { key: 'repairClanGifts', label: 'Чинить хранилища соклановцев (x2)', icon: '💰' },
            { key: 'repairFriends', label: 'Чинить постройки друзей', icon: '🤝' },
            { key: 'repairFriendGifts', label: 'Чинить хранилища друзей (x2)', icon: '🏦' },
        ];
    }
    return [
        { key: 'repairClan', label: 'Чинить соклановцев (постройки и монстры)', icon: '🛡️' },
        { key: 'repairClanGifts', label: 'Чинить подарки соклановцев', icon: '🎁' },
        { key: 'repairFriends', label: 'Чинить друзей (постройки и монстры)', icon: '🤝' },
        { key: 'repairFriendGifts', label: 'Чинить подарки друзей', icon: '💝' },
    ];
}

export const KotofeyControlsPanel: React.FC<KotofeyControlsPanelProps> = ({
    buildingId,
    settings,
    onChange,
    compact = false,
}) => {
    const resolved = normalizeKotofeySettings({ kotofeySettings: settings });
    const repairToggles = getRepairToggles(buildingId);

    return (
        <div className={`${compact ? 'pt-2 border-t border-white/10 space-y-2' : 'pt-2.5 border-t border-purple-500/30 space-y-2.5'}`}>
            {/* Road-walking mode selector */}
            <div>
                <div className="text-[11px] font-bold text-emerald-300/90 mb-1.5 flex items-center justify-between">
                    <span>🛣️ Движение по дорогам и мостовым</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                    <button
                        type="button"
                        onClick={() => onChange({ walkRoads: true })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all border ${
                            resolved.walkRoads
                                ? 'bg-emerald-600/90 text-white border-emerald-300 shadow-sm shadow-emerald-500/30'
                                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border-white/10'
                        }`}
                    >
                        <span>🛣️</span>
                        <span className="truncate">Ходить по дорогам</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ walkRoads: false })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all border ${
                            !resolved.walkRoads
                                ? 'bg-amber-600/90 text-white border-amber-300 shadow-sm shadow-amber-500/30'
                                : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border-white/10'
                        }`}
                    >
                        <span>🚫</span>
                        <span className="truncate">Игнорировать дороги</span>
                    </button>
                </div>
            </div>

            {/* Friend road toggle */}
            <label
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors ${
                    resolved.walkRoads
                        ? 'bg-gray-900/70 border-white/10 cursor-pointer hover:border-emerald-400/40 text-gray-200'
                        : 'bg-gray-900/40 border-white/5 opacity-55 cursor-not-allowed text-gray-400'
                }`}
                title={!resolved.walkRoads ? 'Доступно при включённом режиме «Ходить по дорогам»' : undefined}
            >
                <span className="flex items-center gap-1.5 min-w-0">
                    <span>🛣️</span>
                    <span className="truncate">Ходить по дорогам друзей</span>
                </span>
                <input
                    type="checkbox"
                    checked={resolved.walkRoads && resolved.walkFriendRoads}
                    disabled={!resolved.walkRoads}
                    onChange={(e) => onChange({ walkFriendRoads: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer flex-shrink-0"
                />
            </label>

            {/* Clan & Friend repair toggles */}
            <div className="space-y-1">
                <div className="text-[11px] font-bold text-purple-200/90 mb-1">
                    🔧 Кого чинить дополнительно (кроме своих):
                </div>
                <div className="grid grid-cols-1 gap-1">
                    {repairToggles.map((row) => {
                        const checked = resolved[row.key];
                        return (
                            <label
                                key={row.key}
                                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-gray-900/70 border border-white/10 hover:border-purple-400/40 cursor-pointer text-[11px] text-gray-200 transition-colors"
                            >
                                <span className="flex items-center gap-1.5 min-w-0">
                                    <span>{row.icon}</span>
                                    <span className="truncate">{row.label}</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => onChange({ [row.key]: e.target.checked })}
                                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer flex-shrink-0"
                                />
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
