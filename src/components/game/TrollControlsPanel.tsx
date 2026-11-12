import React from 'react';
import type { TrollSettings } from '../../../types';
import { normalizeTrollSettings } from '../../game/monsters/trollLogic';

export interface TrollControlsPanelProps {
    monsterMode?: 'stand' | 'patrol';
    trollSettings?: TrollSettings;
    onSetMode?: (mode: 'stand' | 'patrol') => void;
    onChange: (patch: Partial<TrollSettings>) => void;
    compact?: boolean;
    showModeButtons?: boolean;
}

const TOGGLE_ITEMS: Array<{ key: keyof TrollSettings; label: string; icon: string }> = [
    { key: 'attackEnabled', label: 'Атаковать цели в патруле', icon: '⚔️' },
    { key: 'attackNeutralMonsters', label: 'Атаковать нейтральных монстров', icon: '👹' },
    { key: 'attackPlayerMonsters', label: 'Атаковать монстров игроков', icon: '🧌' },
    { key: 'attackClan', label: 'Атаковать соклановцев', icon: '🛡️' },
    { key: 'attackFriends', label: 'Атаковать друзей', icon: '🤝' },
    { key: 'walkRoads', label: 'Ходить только по своим/клановым дорогам', icon: '🛤️' },
    { key: 'walkFriendRoads', label: 'Ходить и по дорогам друзей', icon: '🚶' },
    { key: 'boostOwnProduction', label: 'Подгонять свои заводы и грядки (раз в 40с)', icon: '🔨' },
];

export const TrollControlsPanel: React.FC<TrollControlsPanelProps> = ({
    monsterMode = 'stand',
    trollSettings,
    onSetMode,
    onChange,
    compact = false,
    showModeButtons = false,
}) => {
    const settings = normalizeTrollSettings({ trollSettings });
    const isPatrol = monsterMode === 'patrol';

    return (
        <div
            className={`rounded-xl border border-amber-500/30 bg-slate-900/75 ${compact ? 'p-2 space-y-2' : 'p-3 space-y-2.5'}`}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                    🧌 Настройки Тролля
                </span>
                <span className="text-[10px] text-amber-200/80">
                    {isPatrol ? 'Патруль (10 кл.)' : 'Охрана (стоит)'}
                </span>
            </div>

            {showModeButtons && onSetMode && (
                <div className="grid grid-cols-2 gap-1.5">
                    <button
                        type="button"
                        onClick={() => onSetMode('patrol')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            isPatrol
                                ? 'bg-emerald-600/85 border-emerald-400 text-white shadow'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                        }`}
                    >
                        <span>🚶</span> Патрулировать
                    </button>
                    <button
                        type="button"
                        onClick={() => onSetMode('stand')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            !isPatrol
                                ? 'bg-amber-600/85 border-amber-400 text-white shadow'
                                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
                        }`}
                    >
                        <span>🛑</span> Стоять на месте
                    </button>
                </div>
            )}

            <div className={`grid ${compact ? 'grid-cols-1 gap-1' : 'grid-cols-1 sm:grid-cols-2 gap-1.5'} pt-0.5`}>
                {TOGGLE_ITEMS.map((item) => {
                    const checked = Boolean(settings[item.key]);
                    const disabled = item.key === 'walkFriendRoads' && !settings.walkRoads;
                    return (
                        <label
                            key={item.key}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[11px] cursor-pointer select-none transition-colors ${
                                disabled
                                    ? 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
                                    : checked
                                        ? 'bg-amber-950/50 border-amber-500/40 text-amber-100'
                                        : 'bg-slate-800/50 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={(e) => onChange({ [item.key]: e.target.checked })}
                                className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-0"
                            />
                            <span className="truncate" title={item.label}>
                                {item.icon} {item.label}
                            </span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};
